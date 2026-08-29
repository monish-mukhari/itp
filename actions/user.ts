"use server"
import db from "@/db";
import { createHmac, randomBytes } from "crypto";
import { z } from "zod";

const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
});

export async function signup(name: string, email: string, password: string) {
    // should add zod validation here
    const parsedUser = userSchema.safeParse({ name, email, password });

    if(!parsedUser.success) {
        throw new Error(parsedUser.error.issues.map(issue => issue.message).join(', '));
    }

    const salt = randomBytes(32).toString('hex');
    const hashedPassword = generateHash(salt, password);

    return await db.user.create({
        data: {
            name: parsedUser.data.name,
            email: parsedUser.data.email,
            password: hashedPassword,
            salt: salt
        }
    });
}

function generateHash(salt: string, password: string) {
    const hasedPassword = createHmac('sha256', salt).update(password).digest('hex');
    return hasedPassword;
}