
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

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
const validateEmail = (email) => {
  const emailRegex =
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

  return emailRegex.test(email.trim());
};

// Strong password validation
const validatePassword = (password) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide your full name, email and password.",
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid input format.",
      });
    }

    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!validateName(cleanName)) {
      return res.status(400).json({
        message:
          "Please enter a valid full name. Avoid random letters, numbers and symbols.",
      });
    }

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      name: cleanName,
      email: normalizedEmail,
      password,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password.",
      });
    }

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid input format.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
