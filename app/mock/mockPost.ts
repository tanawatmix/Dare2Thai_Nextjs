import pic from "../../public/bp.jpg"; // Path for public assets (relative to mock/mockPost.ts)
import pic1 from "../../public/dare2New.png"; // Path for public assets
import pic2 from "../../public/whiteWater.jpg"; // Path for public assets

export type Post = {
    // We will use 'id' as the unique identifier for the post
    id: number; // Changed to number as your mock data uses numbers
    images: string[];
    title: string;
    type: string;
    province: string;
    description: string;
};

const mockPosts: Post[] = [
    {
        id: 1, // Use 'id' instead of 'postId'
        images: [pic.src, pic1.src, pic2.src, pic1.src, pic2.src, pic1.src, pic2.src],
        title: "ร้านอาหารน่านั่ง",
        type: "ร้านอาหาร",
        province: "กรุงเทพมหานคร",
        description: "บรรยากาศดี อาหารอร่อย",
    },
    {
        id: 2,
        images: [pic1.src, pic2.src],
        title: "ภูเขาสวย",
        type: "สถานที่ท่องเที่ยว",
        province: "เชียงใหม่",
        description: "เหมาะกับการถ่ายรูป",
    },
    {
        id: 3,
        images: [pic2.src, pic.src],
        title: "โรงแรมริมทะเล",
        type: "โรงแรม",
        province: "ภูเก็ต",
        description: "วิวสวยติดทะเล",
    },
    {
        id: 4,
        images: [pic2.src, pic1.src],
        title: "คาเฟ่สุดชิค",
        type: "ร้านอาหาร",
        province: "กรุงเทพมหานคร",
        description: "กาแฟหอม อาหารว่างอร่อย",
    },
    {
        id: 5,
        images: [pic.src, pic2.src],
        title: "สวนสาธารณะกลางเมือง",
        type: "สถานที่ท่องเที่ยว",
        province: "กรุงเทพมหานคร",
        description: "เหมาะสำหรับพักผ่อนและออกกำลังกาย",
    },
    {
        id: 6,
        images: [pic1.src, pic.src],
        title: "ตลาดนัดกลางคืน",
        type: "ร้านอาหาร",
        province: "กรุงเทพมหานคร",
        description: "ของกินเพียบ บรรยากาศสนุกสนาน",
    },
    {
        id: 7,
        images: [pic2.src, pic1.src],
        title: "พิพิธภัณฑ์ศิลปะ",
        type: "สถานที่ท่องเที่ยว",
        province: "เชียงใหม่",
        description: "งานศิลปะสวยงาม น่าสนใจ",
    },
    {
        id: 8,
        images: [pic.src, pic2.src],
        title: "หาดทรายขาว",
        type: "สถานที่ท่องเที่ยว",
        province: "กระบี่",
        description: "น้ำใส ทรายขาว สวยงาม",
    },
    {
        id: 9,
        images: [pic1.src, pic.src],
        title: "ร้านกาแฟริมแม่น้ำ",
        type: "ร้านอาหาร",
        province: "กรุงเทพมหานคร",
        description: "บรรยากาศดี เหมาะสำหรับนั่งชิล",
    },
    {
        id: 10,
        images: [pic2.src, pic1.src],
        title: "สวนดอกไม้สวยงาม",
        type: "สถานที่ท่องเที่ยว",
        province: "เชียงใหม่",
        description: "ดอกไม้หลากสีสัน สวยงามมาก",
    },
    {
        id: 11,
        images: [pic.src, pic1.src],
        title: "ร้านเบเกอรี่สุดน่ารัก",
        type: "ร้านอาหาร",
        province: "กรุงเทพมหานคร",
        description: "ขนมหวานอร่อย บรรยากาศน่ารัก",
    },
    {
        id: 12,
        images: [pic2.src, pic.src],
        title: "สถานที่ท่องเที่ยวทางประวัติศาสตร์",
        type: "สถานที่ท่องเที่ยว",
        province: "อยุธยา",
        description: "เรียนรู้ประวัติศาสตร์ไทย",
    },
    {
        id: 13,
        images: [pic1.src, pic2.src],
        title: "ร้านอาหารทะเลสด",
        type: "ร้านอาหาร",
        province: "ชลบุรี",
        description: "อาหารทะเลสดใหม่ อร่อยมาก",
    },
    {
        id: 14,
        images: [], // Ensure your PostCard handles empty image array gracefully
        title: "คาเฟ่สไตล์วินเทจ",
        type: "ร้านอาหาร",
        province: "กรุงเทพมหานคร",
        description: "บรรยากาศวินเทจ นั่งสบาย",
    },
    {
        id: 15,
        images: [pic2.src, pic.src],
        title: "ห้องสมุดกลางเมือง",
        type: "สถานที่ท่องเที่ยว",
        province: "กรุงเทพมหานคร",
        description: "สถานที่เงียบสงบสำหรับอ่านหนังสือ",
    },
];

export default mockPosts;