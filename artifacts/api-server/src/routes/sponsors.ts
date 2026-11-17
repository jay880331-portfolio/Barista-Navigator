import { Router, type IRouter } from "express";
import { Sponsor } from "../models/Sponsor.js";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const sponsors = await Sponsor.find().sort({ isMonthly: -1 });
  res.json(
    sponsors.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      logo: s.logo,
      bannerImage: s.bannerImage,
      description: s.description,
      website: s.website,
      isMonthly: s.isMonthly,
    }))
  );
});

export default router;
