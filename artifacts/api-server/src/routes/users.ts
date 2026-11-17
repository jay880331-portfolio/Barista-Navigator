import { Router, type IRouter } from "express";
import { User } from "../models/User.js";
import { Recipe } from "../models/Recipe.js";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";

const router: IRouter = Router();

router.put("/profile", authMiddleware, async (req: AuthRequest, res) => {
  const { name, bio, profileImage, skills, location, isActive } = req.body;

  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (bio !== undefined) update.bio = bio;
  if (profileImage !== undefined) update.profileImage = profileImage;
  if (skills !== undefined) update.skills = skills;
  if (location !== undefined) update.location = location;
  if (isActive !== undefined) update.isActive = isActive;

  const user = await User.findByIdAndUpdate(req.userId, update, { new: true });
  if (!user) {
    res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    return;
  }

  res.json({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    phone: user.phone,
    profileImage: user.profileImage,
    role: user.role,
    provider: user.provider,
    isActive: user.isActive,
    skills: user.skills,
    bio: user.bio,
    location: user.location,
    createdAt: user.createdAt?.toISOString(),
  });
});

router.get("/scraps", authMiddleware, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId).populate({
    path: "scrappedRecipes",
    populate: { path: "author", select: "name profileImage role" },
  });

  if (!user) {
    res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    return;
  }

  const recipes = (user.scrappedRecipes as unknown as InstanceType<typeof Recipe>[]).map(
    (recipe) => {
      const author = recipe.author as unknown as Record<string, unknown>;
      return {
        id: recipe._id.toString(),
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        images: recipe.images,
        author: author && "_id" in author
          ? {
              id: (author._id as { toString(): string }).toString(),
              name: author.name as string,
              profileImage: author.profileImage as string | undefined,
              role: author.role as string,
            }
          : author,
        category: recipe.category,
        difficulty: recipe.difficulty,
        scrapCount: recipe.scrappedBy?.length ?? 0,
        isScrapped: true,
        createdAt: recipe.createdAt?.toISOString(),
      };
    }
  );

  res.json(recipes);
});

export default router;
