
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Full name validation
const validateName = (name) => {
  const trimmedName = name.trim();

  const nameRegex =
    /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s+[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

  if (!nameRegex.test(trimmedName)) {
    return false;
  }

  const nameParts = trimmedName.split(/\s+/);

  for (const part of nameParts) {
    const normalizedPart = part.toLowerCase();

    if (!/[aeiou]/.test(normalizedPart)) {
      return false;
    }

    if (/[bcdfghjklmnpqrstvwxyz]{3,}/i.test(normalizedPart)) {
      return false;
    }

    if (/(.)\1{2,}/i.test(normalizedPart)) {
      return false;
    }
  }

  return true;
};

// Email validation
const emailRegex =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

// Password validation
const validatePassword = (password) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      validate: {
        validator: validateName,
        message: "Please enter a valid full name.",
      },
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => emailRegex.test(value),
        message: "Please enter a valid email address.",
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: validatePassword,
        message:
          "Password must contain 8+ characters, uppercase, lowercase, a number and a special character.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with stored hash
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
