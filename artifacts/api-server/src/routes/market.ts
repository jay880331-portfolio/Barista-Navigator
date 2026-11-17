import { Router, type IRouter } from "express";
import { MarketItem } from "../models/MarketItem.js";

const router: IRouter = Router();

router.get("/items", async (req, res) => {
  const { category, page = "1" } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = 12;

  const filter: Record<string, unknown> = {};
  if (category && typeof category === "string") {
    filter.category = category;
  }

  const total = await MarketItem.countDocuments(filter);
  const items = await MarketItem.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate("seller", "name profileImage role");

  res.json({
    items: items.map((item) => {
      const seller = item.seller as unknown as Record<string, unknown>;
      return {
        id: item._id.toString(),
        title: item.title,
        description: item.description,
        price: item.price,
        category: item.category,
        images: item.images,
        seller: seller && "_id" in seller
          ? {
              id: (seller._id as { toString(): string }).toString(),
              name: seller.name as string,
              profileImage: seller.profileImage as string | undefined,
              role: seller.role as string,
            }
          : seller,
        isSold: item.isSold,
        createdAt: item.createdAt?.toISOString(),
      };
    }),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

export default router;
