import type { Request, Response } from "express";
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

import {
    getGoogleAuthUrl,
    getGoogleTokens,
    getGoogleUser
} from "../services/google.service.js";

export const googleLogin = (req: Request, res: Response) => {

    const url = getGoogleAuthUrl();

    res.redirect(url);
};


export const googleCallback = async (
    req: Request,
    res: Response
) => {

    try {

        const { code } = req.query;

        if (typeof code !== "string" || !code) {
            return res.status(400).json({
                success: false,
                message: "Google code is required"
            });
        }

        const tokens = await getGoogleTokens(code as string);
        const secret = process.env.JWT_SECRET
        if(!secret) { throw new Error("JWT SECRET is not present")}

        // console.log("GOOGLE TOKENS:", tokens);


    if (!tokens.access_token) {
  throw new Error("Google access token missing");
}

        const googleUser = await getGoogleUser(tokens.access_token)


        const user = await User.findOneAndUpdate(
            {googleId : googleUser.id},
            {
                googleId: googleUser.id,
                name: googleUser.name,
                email: googleUser.email,
                picture: googleUser.picture
            },
            {new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        )

        const sessionToken = jwt.sign(
            {   userId: user?._id.toString(),
                accessToken : tokens.access_token,
                refreshToken : tokens.refresh_token
            },
            secret, 
            {
                expiresIn: "7d"
            }
        )

        res.cookie("google_session", sessionToken,{
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.redirect("http://localhost:3000/upload")

    } catch (error) {

        console.error("Google authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Google authentication failed"
        });
    }
};


export const getUser = async (req: Request, res: Response) => {

    const user = await User.findOne({_id : res.locals.userId})
    return res.status(200).json({user})
}