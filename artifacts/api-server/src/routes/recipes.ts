import { Router, type IRouter } from "express";
import { Recipe } from "../models/Recipe.js";
import { User } from "../models/User.js";
import { authMiddleware, optionalAuth, type AuthRequest } from "../middleware/auth.js";

const router: IRouter = Router();

function formatRecipe(recipe: InstanceType<typeof Recipe>, userId?: string) {
  const author = recipe.author as unknown as Record<string, unknown>;
  return {
    id: recipe._id.toString(),
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    images: recipe.images,
    author: author && typeof author === "object" && "_id" in author
      ? {
          id: (author._id as { toString(): string }).toString(),
          name: author.name as string,
          profileImage: author.profileImage as string | undefined,
          role: author.role as string,
        }
      : author,
    category: recipe.category,
    difficulty: recipe.difficulty,
    scrapCount: recipe.scrappedBy.length,
    isScrapped: userId ? recipe.scrappedBy.map((id) => id.toString()).includes(userId) : false,
    createdAt: recipe.createdAt?.toISOString(),
  };
}

router.get("/", optionalAuth, async (req: AuthRequest, res) => {
  const { page = "1" } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = 10;

  const total = await Recipe.countDocuments();
  const recipes = await Recipe.find()
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate("author", "name profileImage role");

  res.json({
    recipes: recipes.map((r) => formatRecipe(r, req.userId)),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.get("/:id", optionalAuth, async (req: AuthRequest, res) => {
  const recipe = await Recipe.findById(req.params.id).populate(
    "author",
    "name profileImage role"
  );
  if (!recipe) {
    res.status(404).json({ message: "레시피를 찾을 수 없습니다." });
    return;
  }
  res.json(formatRecipe(recipe, req.userId));
});

router.post("/:id/scrap", authMiddleware, async (req: AuthRequest, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    res.status(404).json({ message: "레시피를 찾을 수 없습니다." });
    return;
  }

  const userId = req.userId!;
  const scrappedIndex = recipe.scrappedBy.map((id) => id.toString()).indexOf(userId);

  if (scrappedIndex >= 0) {
    recipe.scrappedBy.splice(scrappedIndex, 1);
    await recipe.save();
    await User.findByIdAndUpdate(userId, { $pull: { scrappedRecipes: recipe._id } });
    res.json({ success: true, message: "스크랩을 취소했습니다." });
  } else {
    recipe.scrappedBy.push(req.userId as unknown as import("mongoose").Types.ObjectId);
    await recipe.save();
    await User.findByIdAndUpdate(userId, { $addToSet: { scrappedRecipes: recipe._id } });
    res.json({ success: true, message: "스크랩했습니다." });
  }
});

export default router;
