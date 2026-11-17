import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import baristasRouter from "./baristas.js";
import postsRouter from "./posts.js";
import recipesRouter from "./recipes.js";
import marketRouter from "./market.js";
import sponsorsRouter from "./sponsors.js";
import usersRouter from "./users.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/baristas", baristasRouter);
router.use("/posts", postsRouter);
router.use("/recipes", recipesRouter);
router.use("/market", marketRouter);
router.use("/sponsors", sponsorsRouter);
router.use("/users", usersRouter);

export default router;
