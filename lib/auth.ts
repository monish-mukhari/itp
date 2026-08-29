import CredentialsProvider from 'next-auth/providers/credentials';
import db from "@/db";
import { createHmac } from 'crypto';


export const NEXT_AUTH = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'email', type: 'text', placeholder: '' },
                password: { label: 'password', type: 'password', placeholder: '' },
            },
            async authorize(credentials: any) {
                console.log("authorize got hit");
                console.log(credentials);
            // database logic and input validation using zod here
                if(!credentials.username || !credentials.password) {
                    return null;
                }
                console.log(credentials.username);

                const user = await db.user.findUnique({
                    where: {
                        email: credentials.username,
                    }
                });


                if(!user) {
                    return null;
                }

                console.log(user);

                const userSalt = user.salt;
                const userHasedPassword = createHmac('sha256', user.salt).update(credentials.password).digest('hex');
                if(userHasedPassword !== user.password) {
                    return null;
                }

                console.log(credentials);
                return {
                    id: user.id
                };
            },
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/signin",
    },
    callbacks: {
        async signIn({ user, account, profile, email, credentials }: any) {
            console.log("callback signIn got hit")
            return true;
        },

        async redirect({ url, baseUrl }: any) {
            // Redirect to the dashboard after sign up and log in
            return baseUrl + '/input';
          },
    }
}