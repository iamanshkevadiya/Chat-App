import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function signup(req, res) {
    const {email,password,fullName} = req.body;
    try {
        if(!email || !password || !fullName) {
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

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            profilePic: rendomAvter
        });

        await newUser.save();
        const token = jwt.sign({
            userid: newUser._id,
        },process.env.JWT_SECRET_KEY,{
            expiresIn: '7d'
        })
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        })
        res.status(201).json({
                success: true,
                user:newUser
        })
    } catch (error) {
        console.log("Error in signup:", error);
        res.status(500).json({message: "Internal server error"});
    }
}
export async function login(req, res) {
     try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function logout(req, res) {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        res.status(200).json({ message: "Logged out successfully" });   
    } catch (error) {
        console.log("Error in logout controller", error.message);   
    }
}