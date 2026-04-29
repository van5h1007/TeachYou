import express from "express";
import Module from "../models/Module.js";
import { protect, educatorOnly } from "../middleware/auth.js";
import { upload } from '../config/cloudinary.js';
import { getIO, onlineUsers } from '../config/socket.js';

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const { search, tag } = req.query;
    let query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const modules = await Module.find(query)
      .populate("creator", "name email role")
      .sort({ createdAt: -1 });

    const modulesWithAccess= modules.map((mod) => {
      const modObj= mod.toObject();
      if(mod.visibility=== 'private'){
        const hasAccess=
              mod.creator._id.toString() === req.user._id.toString() ||
              mod.allowedUsers.some((u) => u.toString() === req.user._id.toString());
        const hasRequested= mod.accessRequests.some(
          (r) => r.user.toString() === req.user._id.toString()
        );
        modObj.hasAccess= hasAccess;
        modObj.hasRequested= hasRequested;
      }
      else{
        modObj.hasAccess= true;
        modObj.hasRequested= false;
      }
      return modObj;
    });
    res.status(200).json(modulesWithAccess);
    console.log(`User ${req.user._id} fetched modules. Search: ${search}, Tag: ${tag}`);
  } 
  catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
    .populate("creator", "name email")
    .populate("allowedUsers", "name email")
    .populate("accessRequests.user", "name email");

    if (!module) {
      return res.status(404).json({ message: "Module not found." });
    }
    const isCreator = module.creator._id.toString() === req.user._id.toString();
    const isAllowed = module.allowedUsers.some(
      (u) => u._id.toString() === req.user._id.toString()
    );


    if (module.visibility === "private" && !isCreator && !isAllowed ) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json(module);
  } 
  catch (error) {
    console.log('Module detail error:', error.message);
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
    console.log(`Module created: ${module._id} by user ${req.user._id}`);
  } 
  catch (error) {
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
  } 
  catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

router.post('/:id/request', protect, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate('creator', 'name');
    if (!module) return res.status(404).json({ message: 'Module not found.' });

    const alreadyRequested = module.accessRequests.some(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyRequested) {
      return res.status(400).json({ message: 'Access already requested.' });
    }

    const alreadyAllowed = module.allowedUsers.some(
      (u) => u.toString() === req.user._id.toString()
    );
    if (alreadyAllowed) {
      return res.status(400).json({ message: 'You already have access.' });
    }

    module.accessRequests.push({ user: req.user._id });
    await module.save();

    const educatorSocketId = onlineUsers.get(module.creator._id.toString());
    if (educatorSocketId) {
      getIO().to(educatorSocketId).emit('accessRequest', {
        moduleId: module._id,
        moduleTitle: module.title,
        student: { _id: req.user._id, name: req.user.name },
      });
    }

    res.status(200).json({ message: 'Access requested successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

router.post('/:id/grant/:userId', protect, educatorOnly, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found.' });
    if (module.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your module.' });
    }

    module.accessRequests = module.accessRequests.filter(
      (r) => r.user.toString() !== req.params.userId
    );
    if (!module.allowedUsers.includes(req.params.userId)) {
      module.allowedUsers.push(req.params.userId);
    }
    await module.save();

    const studentSocketId = onlineUsers.get(req.params.userId);
    if (studentSocketId) {
      getIO().to(studentSocketId).emit('accessGranted', {
        moduleId: module._id,
        moduleTitle: module.title,
      });
    }

    res.status(200).json({ message: 'Access granted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

router.post('/:id/deny/:userId', protect, educatorOnly, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found.' });
    if (module.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your module.' });
    }

    module.accessRequests = module.accessRequests.filter(
      (r) => r.user.toString() !== req.params.userId
    );
    await module.save();

    const studentSocketId = onlineUsers.get(req.params.userId);
    if (studentSocketId) {
      getIO().to(studentSocketId).emit('accessDenied', {
        moduleId: module._id,
        moduleTitle: module.title,
      });
    }

    res.status(200).json({ message: 'Access denied.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

router.delete('/:id/revoke/:userId', protect, educatorOnly, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found.' });
    if (module.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your module.' });
    }
    module.allowedUsers = module.allowedUsers.filter(
      (u) => u.toString() !== req.params.userId
    );
    await module.save();
    res.status(200).json({ message: 'Access revoked.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

router.post('/:id/upload', protect, educatorOnly, upload.single('file'), async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found.' });
    if (module.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your module.' });
    }

    module.attachments.push({
      filename: req.file.originalname,
      url: req.file.path,
      fileType: req.file.mimetype,
    });
    await module.save();

    res.status(200).json({ message: 'File uploaded.', attachments: module.attachments });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});


export default router;