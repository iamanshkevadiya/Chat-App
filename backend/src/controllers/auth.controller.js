import User from '../models/User.js';
import jwt from 'jsonwebtoken';
export async function signup(req, res) {
    const {email,password,fullname} = req.body;
    try {
        if(!email || !password || !fullname) {
            return res.status(400).json({message: "All fields are required"});
        }

        if(password.length < 6) {
            return res.status(400).json({message:"Password must be at least 6 characters"});
        }

        const emailRegex = /^[^/s@]+@[^/s@]+\.[^/s@]+$/;
        if(!emailRegex.test(email)) {
            return res.status(400).json({message: "Invalid email format"});
        }
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({message: "email already exists,please use a different email"});
        }

        const idx = Math.floor(Math.random() * 100 )+ 1;
        const rendomAvter = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = new User({
            email,
            fullname,
            password,
            profilePic: rendomAvter
        });
        const token = jwt.sign({
            userid: newUser._id,
        },process.env.JWT_SECRET_KEY,{
            expiresIn: '30d'
        })
    } catch (error) {
        
    }
}
export async function login(req, res) {
    res.send('Login Route');
}

export async function logout(req, res) {
    res.send('Logout Route');
}