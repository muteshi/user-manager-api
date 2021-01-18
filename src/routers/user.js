const express = require("express");
const sharp = require("sharp");
const yargsInteractive = require("yargs-interactive");

const auth = require("../middleware/auth");
const User = require("../models/user");
const { addSuperUser } = require("../utility/utility");
const {
  sendWelcomeEmail,
  sendAccountDeleteEmail,
} = require("../email/user-notifications");

const router = new express.Router();

const multer = require("multer");

//configure multer
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
      return cb(new Error("Please upload a valid image"));
    }
    cb(undefined, true);
  },
});

router.post("/users", async (req, res) => {
  const newUser = new User(req.body);
  try {
    await newUser.save();
    sendWelcomeEmail(newUser.email, newUser.name);
    const token = await newUser.generateUserAuthToken();
    res.status(201).send({ newUser, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/superuser-create", async (req, res) => {
  const ip = req.ip.split(":").slice(-1)[0];

  if (ip !== process.env.SUPERUSER_IP) {
    return res.status(401).send({ error: "Not authorized", ip });
  }
  try {
    const newSuperUser = new User({
      ...req.body,
      superuser: true,
      role: "admin",
    });
    await newSuperUser.save();
    const token = await newSuperUser.generateUserAuthToken();
    res.status(201).send({ newSuperUser, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.loginUser(req.body);

    const token = await user.generateUserAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((t) => t.token !== req.token);

    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post("/users/logout-all", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/users/profile", auth, async (req, res) => {
  res.send(req.user);
});

router.get("/users/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/users", auth, async (req, res) => {
  const userFromReq = req.user;
  switch (true) {
    case userFromReq.superuser:
      const allUsers = await User.find({});
      return res.send(allUsers);
    case userFromReq.role == "admin":
      adminUsers = await User.find({ owner: userFromReq._id });
      return res.send(adminUsers);
    default:
      return res.send(userFromReq);
  }
});

router.patch("/users/:id/edit-account", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  let allowedUpdates;
  const userFromDb = await User.findById(req.params.id);
  const userFromReq = req.user;

  switch (true) {
    case userFromReq.superuser:
      allowedUpdates = ["name", "email", "password", "phone", "role", "owner"];
      break;
    case userFromReq._id.equals(userFromDb.owner) &&
      userFromReq.role === "admin":
      allowedUpdates = ["name", "email", "password", "phone", "role"];
      break;
    case userFromReq._id.equals(userFromDb._id):
      allowedUpdates = ["name", "email", "password", "phone"];
      break;
    default:
      return res.status(404).send();
  }
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => {
      return (userFromDb[update] = req.body[update]);
    });

    await userFromDb.save();

    res.send(userFromDb);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/users/:id/delete-account", auth, async (req, res) => {
  const userFromDb = await User.findById(req.params.id);
  const userFromReq = req.user;
  switch (true) {
    case userFromReq.superuser:
      await userFromDb.remove();
      return res.send(userFromDb);
    case userFromReq._id.equals(userFromDb.owner) &&
      userFromReq.role === "admin":
      await userFromDb.remove();
      return res.send(userFromDb);
    case userFromReq._id.equals(userFromDb._id):
      await userFromDb.remove();
      return res.send(userFromDb);
    default:
      return res.status(404).send();
  }
});

router.post(
  "/users/profile/photo",
  auth,
  upload.single("profile-photo"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/profile/delete-profile-photo", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/users/:id/profile-photo", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;
