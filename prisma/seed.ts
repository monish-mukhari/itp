import db from "../db";

async function seedUsers() {
    try {
        await db.user.create({
            data: {
                email: "testuser1@example.com",
                name: "Test User 1",
                password: "test1_password123",
                salt: "11a2b3cde45"
            },
        });

        await db.user.create({
            data: {
                email: "testuser2@example.com",
                name: "Test User 2",
                password: "test2_password123",
                salt: "21a2b3cde45"
            },
        });

    } catch (error) {
        console.error('Error seeding users:', error);
        throw error;
    }
}

async function seedDatabase() {
    try {
        await seedUsers();
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        await db.$disconnect();
    }
}

seedDatabase().catch((error) => {
    console.log('An unexpected error occurred during seeding:', error);
    process.exit(1);
});