const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password cannot have word password in it");
        }
        if (value.length < 6) {
          throw new Error("Password must be more than six characters");
        }
      },
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    email: {
      type: String,
      index: { unique: true, dropDups: true },
      trim: true,
      lowercase: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    phone: {
      type: String,
      index: { unique: true, dropDups: true },
      validate(value) {
        if (!validator.isMobilePhone(value)) {
          throw new Error("Enter a valid mobile number");
        }
      },
    },
    profile_photo: {
      type: Buffer,
    },
    superuser: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const user = this;
  const userData = user.toObject();

  delete userData.password;
  delete userData.tokens;
  delete userData.profile_photo;

  return userData;
};

userSchema.methods.generateUserAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    {
      _id: user._id.toString(),
      superuser: user.superuser,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

//login user with phone or email
userSchema.statics.loginUser = async (userData) => {
  let username = {};
  username["email"] = userData.email;
  username["phone"] = userData.phone;

  Object.keys(username).forEach((key) =>
    username[key] === undefined ? delete username[key] : {}
  );

  const user = await User.findOne(username);

  // const user = await User.findOne({
  //   $or: [
  //     { $and: [{ email: { $ne: null } }, { email: userData.email }] },
  //     { $and: [{ phone: { $ne: null } }, { phone: userData.phone }] },
  //   ],
  // });

  if (!user) {
    throw new Error("Wrong username or password one");
  }
  const isMatch = await bcrypt.compare(userData.password, user.password);
  if (!isMatch) {
    throw new Error("Wrong username or password");
  }
  return user;
};

//middleware to hash the plain password
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
