import * as bcrypt from "bcrypt";
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();
export type JWTUser = {
    id: string;
    username: string;
};

export const createJWT = (user: JWTUser) => {
    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET as string
    );
};

export const getUser = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string) as JWTUser;
    } catch (e) {
        return null;
    }
};

export const comparePasswords = (
    password: string,
    hash: string
): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const hashPassword = (password: string): Promise<string> => {
    return bcrypt.hash(password, 5);
};