import express from "express";
import Module from "../models/Module.js";
import { protect, educatorOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const { search, tag } = req.query;

    let query = {};

    if (req.user.role === "student") {
      query.visibility = "public";
    }
    if (search) {
      query.$text = { $search: search };
    }
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const modules = await Module.find(query)
      .populate("creator", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate(
      "creator",
      "name email"
    );

    if (!module) {
      return res.status(404).json({ message: "Module not found." });
    }

    if (
      module.visibility === "private" &&
      module.creator._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

router.post("/", protect, educatorOnly, async (req, res) => {
  try {
    const { title, description, content, visibility, tags } = req.body;

    if (!title || !description || !content) {
      return res
        .status(400)
        .json({ message: "Title, description and content are required." });
    }

    const module = await Module.create({
      title,
      description,
      content,
      visibility,
      tags,
      creator: req.user._id,
    });

    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

router.put("/:id", protect, educatorOnly, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ message: "Module not found." });
    }

    if (module.creator.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only edit your own modules." });
    }

    const { title, description, content, visibility, tags } = req.body;

    module.title = title || module.title;
    module.description = description || module.description;
    module.content = content || module.content;
    module.visibility = visibility || module.visibility;
    module.tags = tags || module.tags;

    const updated = await module.save();

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

router.delete("/:id", protect, educatorOnly, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ message: "Module not found." });
    }

    if (module.creator.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own modules." });
    }

    await module.deleteOne();

    res.status(200).json({ message: "Module deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

export default router;