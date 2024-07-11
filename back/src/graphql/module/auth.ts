import * as bcrypt from "bcrypt";
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import {FireBaseAdmin} from "./firebaseAdmin";

dotenv.config();
export type JWTUser = {
    email: string;
};

export const getUser = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string) as JWTUser;
    } catch (e) {
        return null;
    }
};

/**
 * Verify if the token is valid and return the email
 * @param token
 */
export const verifyOAuthToken = async (token: string) => {
    const decoded = await FireBaseAdmin.auth().verifyIdToken(token);
    return decoded.email;
}
