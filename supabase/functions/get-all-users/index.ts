import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts' // ไฟล์นี้จะถูกสร้างอัตโนมัติโดย Supabase CLI

Deno.serve(async (req: Request) => {
  // 1. ตอบสนองต่อ OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. สร้าง Admin Client
    const supabaseAdmin: SupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. ตรวจสอบสิทธิ์ Admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt)
    if (userError) throw userError
    if (!user) throw new Error('User not found')

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Not authorized: User is not an admin.')
    }

    // 4. ดึงอีเมลจริง
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    if (usersError) throw usersError

    // 5. ดึง Profiles
    const { data: profilesData, error: profilesError2 } = await supabaseAdmin
      .from('profiles')
      .select('id, username, name, role')
    if (profilesError2) throw profilesError2

    // 6. รวมข้อมูล
    const combinedData = profilesData.map((profile: any) => {
      const authUser = usersData.users.find((u: any) => u.id === profile.id)
      return {
        ...profile,
        email: authUser?.email || 'N/A',
      }
    })

    // 7. ส่งข้อมูลกลับ
    return new Response(JSON.stringify(combinedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})