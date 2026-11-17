import { Router, type IRouter } from "express";
import { Post } from "../models/Post.js";
import { authMiddleware, optionalAuth, type AuthRequest } from "../middleware/auth.js";

const router: IRouter = Router();

function formatPost(post: InstanceType<typeof Post>, userId?: string) {
  const author = post.author as unknown as Record<string, unknown>;
  return {
    id: post._id.toString(),
    type: post.type,
    title: post.title,
    content: post.content,
    images: post.images,
    author: author && typeof author === "object" && "_id" in author
      ? {
          id: (author._id as { toString(): string }).toString(),
          name: author.name as string,
          profileImage: author.profileImage as string | undefined,
          role: author.role as string,
        }
      : author,
    likeCount: post.likedBy.length,
    commentCount: post.commentCount,
    isLiked: userId ? post.likedBy.map((id) => id.toString()).includes(userId) : false,
    createdAt: post.createdAt?.toISOString(),
  };
}

router.get("/", optionalAuth, async (req: AuthRequest, res) => {
  const { type, page = "1", limit = "10" } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;

  const total = await Post.countDocuments(filter);
  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate("author", "name profileImage role");

  res.json({
    posts: posts.map((p) => formatPost(p, req.userId)),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const { type, title, content, images } = req.body;
  if (!type || !content) {
    res.status(400).json({ message: "type과 content는 필수입니다." });
    return;
  }

  const post = await Post.create({
    type,
    title,
    content,
    images: images || [],
    author: req.userId,
  });

  await post.populate("author", "name profileImage role");
  res.status(201).json(formatPost(post, req.userId));
});

router.get("/:id", optionalAuth, async (req: AuthRequest, res) => {
  const post = await Post.findById(req.params.id).populate("author", "name profileImage role");
  if (!post) {
    res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    return;
  }
  res.json(formatPost(post, req.userId));
});

router.post("/:id/like", authMiddleware, async (req: AuthRequest, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    return;
  }

  const userId = req.userId!;
  const likedIndex = post.likedBy.map((id) => id.toString()).indexOf(userId);

  if (likedIndex >= 0) {
    post.likedBy.splice(likedIndex, 1);
    await post.save();
    res.json({ success: true, message: "좋아요를 취소했습니다." });
  } else {
    post.likedBy.push(req.userId as unknown as import("mongoose").Types.ObjectId);
    await post.save();
    res.json({ success: true, message: "좋아요를 눌렀습니다." });
  }
});

export default router;
