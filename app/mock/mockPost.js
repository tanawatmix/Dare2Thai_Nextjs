const pic = "/bp.jpg"; // Path for public assets (relative to public/)
const pic1 = "/min.jpg"; 
const pic2 = "/whiteWater.jpg";

const mockPosts = [
  {
    id: 1,
    images: [pic, pic1, pic2, pic1, pic2, pic1, pic2],
    title: "ร้านอาหารน่านั่ง",
    type: "ร้านอาหาร",
    province: "กรุงเทพมหานคร",
    description:
      "บรรยากาศดี อาหารอร่อย ... (ย่อความยาวได้ตามต้องการ)",
    isFav: false,
  },
  {
    id: 2,
    images: [pic1, pic2],
    title: "ภูเขาสวย",
    type: "สถานที่ท่องเที่ยว",
    province: "เชียงใหม่",
    description: "เหมาะกับการถ่ายรูป",
    isFav: false,
  },
  {
    id: 3,
    images: [pic2, pic],
    title: "โรงแรมริมทะเล",
    type: "โรงแรม",
    province: "ภูเก็ต",
    description: "วิวสวยติดทะเล",
    isFav: false,
  },
  {
    id: 4,
    images: [pic2, pic1],
    title: "คาเฟ่สุดชิค",
    type: "ร้านอาหาร",
    province: "กรุงเทพมหานคร",
    description: "กาแฟหอม อาหารว่างอร่อย",
    isFav: false,
  },
  {
    id: 5,
    images: [pic, pic2],
    title: "สวนสาธารณะกลางเมือง",
    type: "สถานที่ท่องเที่ยว",
    province: "กรุงเทพมหานคร",
    description: "เหมาะสำหรับพักผ่อนและออกกำลังกาย",
    isFav: false,
  },
  {
    id: 6,
    images: [pic1, pic],
    title: "ตลาดนัดกลางคืน",
    type: "ร้านอาหาร",
    province: "กรุงเทพมหานคร",
    description: "ของกินเพียบ บรรยากาศสนุกสนาน",
    isFav: false,
  },
  {
    id: 7,
    images: [pic2, pic1],
    title: "พิพิธภัณฑ์ศิลปะ",
    type: "สถานที่ท่องเที่ยว",
    province: "เชียงใหม่",
    description: "งานศิลปะสวยงาม น่าสนใจ",
    isFav: false,
  },
  {
    id: 8,
    images: [pic, pic2],
    title: "หาดทรายขาว",
    type: "สถานที่ท่องเที่ยว",
    province: "กระบี่",
    description: "น้ำใส ทรายขาว สวยงาม",
    isFav: false,
  },
  {
    id: 9,
    images: [pic1, pic],
    title: "ร้านกาแฟริมแม่น้ำ",
    type: "ร้านอาหาร",
    province: "กรุงเทพมหานคร",
    description: "บรรยากาศดี เหมาะสำหรับนั่งชิล",
    isFav: false,
  },
  {
    id: 10,
    images: [pic2, pic1],
    title: "สวนดอกไม้สวยงาม",
    type: "สถานที่ท่องเที่ยว",
    province: "เชียงใหม่",
    description: "ดอกไม้หลากสีสัน สวยงามมาก",
    isFav: false,
  },
  // ... ทำแบบเดียวกันกับโพสต์ที่เหลือ
];

export default mockPosts;
