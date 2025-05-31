const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Mock OTP Generator
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * POST /register
 */
router.post('/register', async (req, res) => {
    const { name, email, phone } = req.body;
    const otp = generateOTP();

    try {
        const user = await User.create({ name, email, phone, otp });
        // Send OTP (you could use Twilio here)
        console.log(`OTP for ${phone}: ${otp}`);
        res.status(201).json({ message: 'User created. Verify with OTP.', userId: user._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * POST /verify-otp
 */
router.post('/verify-otp', async (req, res) => {
    const { phone, otp } = req.body;

    try {
        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

        user.isVerified = true;
        user.otp = '';
        await user.save();
        res.json({ message: 'Phone number verified successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /users
 */
router.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

/**
 * PUT /user/:id
 */
router.put('/user/:id', async (req, res) => {
    const { id } = req.params;
    const update = req.body;
    try {
        const user = await User.findByIdAndUpdate(id, update, { new: true });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * DELETE /user/:id
 */
router.delete('/user/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
