import { connectMongoDB } from "./mongodb.js";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { Recipe } from "../models/Recipe.js";
import { MarketItem } from "../models/MarketItem.js";
import { Sponsor } from "../models/Sponsor.js";
import { logger } from "./logger.js";

export async function seedDatabase(): Promise<void> {
  await connectMongoDB();

  const existingUserCount = await User.countDocuments();
  if (existingUserCount > 0) {
    logger.info("Database already seeded, skipping");
    return;
  }

  logger.info("Seeding database...");

  const baristas = await User.create([
    {
      name: "정하은",
      email: "jhe@barista.com",
      password: "password123",
      role: "barista",
      provider: "email",
      isActive: true,
      skills: ["라떼아트", "핸드드립", "로스팅"],
      bio: "10년 경력 바리스타. 커피의 맛을 탐구합니다.",
      location: "서울 마포구",
      lat: 37.5665,
      lng: 126.9780,
      profileImage: "https://api.dicebear.com/7.x/personas/svg?seed=jhe",
    },
    {
      name: "이지현",
      email: "ljh@barista.com",
      password: "password123",
      role: "barista",
      provider: "email",
      isActive: true,
      skills: ["에스프레소", "콜드브루"],
      bio: "스페셜티 커피 전문가입니다.",
      location: "서울 강남구",
      lat: 37.4979,
      lng: 127.0276,
      profileImage: "https://api.dicebear.com/7.x/personas/svg?seed=ljh",
    },
    {
      name: "김민준",
      email: "kmj@barista.com",
      password: "password123",
      role: "barista",
      provider: "email",
      isActive: false,
      skills: ["라떼아트", "시럽제조"],
      bio: "달콤한 커피를 만드는 바리스타.",
      location: "서울 종로구",
      lat: 37.5744,
      lng: 126.9769,
      profileImage: "https://api.dicebear.com/7.x/personas/svg?seed=kmj",
    },
    {
      name: "박수진",
      email: "psj@barista.com",
      password: "password123",
      role: "barista",
      provider: "email",
      isActive: true,
      skills: ["핸드드립", "로스팅", "커핑"],
      bio: "원두의 맛을 가장 잘 표현하는 바리스타.",
      location: "서울 용산구",
      lat: 37.5326,
      lng: 126.9905,
      profileImage: "https://api.dicebear.com/7.x/personas/svg?seed=psj",
    },
  ]);

  const coffeeLovers = await User.create([
    {
      name: "커피러버",
      email: "user@test.com",
      password: "password123",
      role: "coffee_lover",
      provider: "email",
      isActive: false,
      profileImage: "https://api.dicebear.com/7.x/personas/svg?seed=user1",
    },
  ]);

  await Post.create([
    {
      type: "daily",
      content: "오늘도 라떼아트 연습! 하트 모양이 조금씩 예뻐지고 있어요 ☕",
      author: baristas[0]._id,
      images: [],
      likedBy: [baristas[1]._id, coffeeLovers[0]._id],
      commentCount: 3,
    },
    {
      type: "knowhow",
      title: "핸드드립 물 온도 조절 팁",
      content: "핸드드립에서 물 온도는 매우 중요합니다. 90-95도 사이가 가장 좋아요. 너무 뜨거우면 쓴맛이 강해지고, 너무 낮으면 신맛이 도드라집니다.",
      author: baristas[1]._id,
      likedBy: [baristas[0]._id],
      commentCount: 5,
    },
    {
      type: "instagram",
      content: "오늘의 커피 한 잔 🌅 이른 아침 원두 향이 가득한 카페에서의 여유",
      author: baristas[2]._id,
      images: [],
      likedBy: [baristas[0]._id, baristas[1]._id, coffeeLovers[0]._id],
      commentCount: 8,
    },
    {
      type: "daily",
      content: "새로운 에티오피아 원두를 받았어요! 블루베리향이 정말 강렬해요 🫐",
      author: baristas[3]._id,
      likedBy: [],
      commentCount: 2,
    },
  ]);

  await Recipe.create([
    {
      title: "완벽한 라떼아트 레시피",
      description: "하트 라떼아트를 만드는 기본 기술을 배워보세요.",
      ingredients: ["에스프레소 30ml", "스팀밀크 180ml", "신선한 우유"],
      steps: [
        "에스프레소를 추출합니다 (25-30초)",
        "우유를 60도까지 스팀합니다",
        "스팀밀크를 잔에 붓기 시작합니다",
        "잔이 3/4 찼을 때 라떼아트를 그립니다",
      ],
      author: baristas[0]._id,
      category: "라떼아트",
      difficulty: "medium",
      scrappedBy: [coffeeLovers[0]._id],
    },
    {
      title: "콜드브루 기본 레시피",
      description: "12시간 냉침 방식의 콜드브루 만들기",
      ingredients: ["원두 100g (굵게 분쇄)", "물 1L", "필터"],
      steps: [
        "원두를 굵게 분쇄합니다",
        "필터에 원두를 담습니다",
        "물을 천천히 부어줍니다",
        "냉장고에서 12-18시간 냉침합니다",
        "필터를 제거하고 즐겨보세요",
      ],
      author: baristas[1]._id,
      category: "콜드브루",
      difficulty: "easy",
      scrappedBy: [],
    },
    {
      title: "달고나 커피 레시피",
      description: "SNS에서 유명한 달고나 커피 만들기",
      ingredients: ["인스턴트 커피 2큰술", "설탕 2큰술", "뜨거운 물 2큰술", "우유 200ml"],
      steps: [
        "커피, 설탕, 뜨거운 물을 같은 비율로 준비합니다",
        "거품기로 크림처럼 될 때까지 젓습니다 (약 5분)",
        "차가운 우유를 잔에 담습니다",
        "만든 크림을 우유 위에 얹습니다",
      ],
      author: baristas[2]._id,
      category: "기타",
      difficulty: "easy",
      scrappedBy: [],
    },
  ]);

  await MarketItem.create([
    {
      title: "핸드드립 드리퍼 세트",
      description: "Hario V60 유리 드리퍼 + 서버 세트. 상태 좋음.",
      price: 35000,
      category: "도구",
      seller: baristas[0]._id,
      isSold: false,
    },
    {
      title: "에티오피아 예가체프 원두 200g",
      description: "직접 로스팅한 에티오피아 원두. 블루베리향.",
      price: 18000,
      category: "원두",
      seller: baristas[3]._id,
      isSold: false,
    },
    {
      title: "바리스타 앞치마",
      description: "카페 작업용 캔버스 앞치마. 거의 새것.",
      price: 15000,
      category: "의류",
      seller: baristas[2]._id,
      isSold: false,
    },
  ]);

  await Sponsor.create([
    {
      name: "커피빈 코리아",
      logo: "https://via.placeholder.com/100x50?text=CoffeeBean",
      bannerImage: "https://via.placeholder.com/800x200?text=CoffeeBean+Banner",
      description: "이달의 스폰서 - 커피빈 코리아",
      website: "https://coffeebean.co.kr",
      isMonthly: true,
    },
    {
      name: "일리 커피",
      logo: "https://via.placeholder.com/100x50?text=illy",
      bannerImage: "https://via.placeholder.com/800x200?text=illy+Banner",
      description: "프리미엄 이탈리안 커피",
      website: "https://illy.com",
      isMonthly: false,
    },
  ]);

  logger.info("Database seeded successfully");
}
