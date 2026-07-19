const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

// Handles new user registration
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, department, jobTitle, employeeId, gender, dateOfBirth, bio } = req.body;

    // Basic validation - make sure required fields exist
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required' });
    }

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Hash the password - this scrambles it so it's never stored as plain text
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user in the database
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber: phoneNumber || null,
        password: hashedPassword,
        department: department || null,
        jobTitle: jobTitle || null,
        employeeId: employeeId || null,
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        bio: bio || null,
      },
    });

    // Never send the password back, even hashed - remove it from the response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Something went wrong during registration' });
  }
};

// Handles user login
const loginUser = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    // Must provide either email or phone, plus password
    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({ message: 'Email or phone number, and password are required' });
    }

    // Find the user by email OR phone number
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phoneNumber: phoneNumber || undefined },
        ],
      },
    });

    // If no user found with that email/phone
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.isDisabled) {
      return res.status(403).json({ message: 'This account has been disabled. Contact your administrator.' });
    }

    // Compare the submitted password with the hashed password in the database
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token containing the user's id and role
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // token stays valid for 7 days
    );

    // Update user's online status
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true, lastSeen: new Date() },
    });

    // Remove password before sending user data back
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong during login' });
  }
};

// Returns the currently logged-in user's info
// This route is protected - only accessible with a valid token
const getMe = async (req, res) => {
  try {
    // req.user was set by our authMiddleware after verifying the token
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { registerUser, loginUser, getMe };