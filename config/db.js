import mongoose from 'mongoose';
import User from '../models/User.js';
import colors from 'colors';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
        
        // Create default admin user if it doesn't exist
        await createDefaultAdmin();
        
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

const createDefaultAdmin = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });
        
        if (!adminExists) {
            const admin = await User.create({
                name: 'Admin User',
                email: process.env.DEFAULT_ADMIN_EMAIL,
                password: process.env.DEFAULT_ADMIN_PASSWORD,
                role: 'admin',
                isActive: true
            });
            
            console.log('Default admin user created:'.green);
            console.log(`Email: ${admin.email}`.green);
            console.log('Password: [HIDDEN]'.green);
            console.log('Please change this password immediately after first login!'.yellow.bold);
        }
    } catch (error) {
        console.error('Error creating default admin:'.red, error.message);
    }
};

export default connectDB;
