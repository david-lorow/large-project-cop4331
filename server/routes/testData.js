const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/seed-user', async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: 'testuser@example.com' });

    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'testuser@example.com',
      passwordHash: 'testhash123',
      isEmailVerified: false,
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;