import { Router, type IRouter } from "express";
import { User } from "../models/User.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const { lat, lng, radius = 1.0, skill } = req.query;

  const filter: Record<string, unknown> = { role: "barista" };

  if (skill && typeof skill === "string") {
    filter.skills = { $in: [skill] };
  }

  const baristas = await User.find(filter).select(
    "name profileImage bio skills location lat lng isActive"
  );

  let results = baristas.map((b) => ({
    id: b._id.toString(),
    name: b.name,
    profileImage: b.profileImage,
    bio: b.bio,
    skills: b.skills,
    location: b.location,
    lat: b.lat ?? (37.5 + Math.random() * 0.1 - 0.05),
    lng: b.lng ?? (127.0 + Math.random() * 0.1 - 0.05),
    isActive: b.isActive,
    rating: Number((4 + Math.random()).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 50),
  }));

  if (lat && lng) {
    const centerLat = parseFloat(lat as string);
    const centerLng = parseFloat(lng as string);
    const radiusKm = parseFloat(radius as string);

    results = results.filter((b) => {
      const dlat = (b.lat - centerLat) * 111;
      const dlng = (b.lng - centerLng) * 111 * Math.cos((centerLat * Math.PI) / 180);
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);
      return dist <= radiusKm;
    });
  }

  res.json(results);
});

router.get("/:id", async (req, res) => {
  const barista = await User.findById(req.params.id).select(
    "name profileImage bio skills location lat lng isActive createdAt"
  );

  if (!barista) {
    res.status(404).json({ message: "바리스타를 찾을 수 없습니다." });
    return;
  }

  res.json({
    id: barista._id.toString(),
    name: barista.name,
    profileImage: barista.profileImage,
    bio: barista.bio,
    skills: barista.skills,
    location: barista.location,
    lat: barista.lat,
    lng: barista.lng,
    isActive: barista.isActive,
    rating: Number((4 + Math.random()).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 50),
  });
});

export default router;
