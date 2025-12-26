const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        let admin = await User.findOne({ username: 'admin' });

        if (admin) {
            console.log('Admin user already exists');
            // Update password just in case
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash('admin', salt);
            admin.isAdmin = true;
            await admin.save();
            console.log('Admin password updated to: admin');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin', salt);

            admin = new User({
                username: 'admin',
                name: 'Admin User',
                email: 'admin@lumiere.com',
                password: hashedPassword,
                isAdmin: true
            });

            await admin.save();
            console.log('Admin user created');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
