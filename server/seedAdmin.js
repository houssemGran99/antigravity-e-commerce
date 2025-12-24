require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const username = 'admin';
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = await User.findOneAndUpdate(
            { username },
            {
                name: 'System Admin',
                email: 'admin@camerashop.com',
                username: username,
                password: hashedPassword,
                isAdmin: true,
                picture: 'https://ui-avatars.com/api/?name=System+Admin&background=random'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('Admin user seeded successfully:', adminUser.username);
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
