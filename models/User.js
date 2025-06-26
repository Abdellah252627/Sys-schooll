import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'الرجاء إدخال الاسم'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'الرجاء إدخال البريد الإلكتروني'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'الرجاء إدخال بريد إلكتروني صحيح'
        ]
    },
    password: {
        type: String,
        required: [true, 'الرجاء إدخال كلمة المرور'],
        minlength: [6, 'يجب أن لا تقل كلمة المرور عن 6 أحرف'],
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'student', 'parent'],
        default: 'student'
    },
    phone: {
        type: String,
        maxlength: [20, 'رقم الهاتف لا يمكن أن يتجاوز 20 رقما']
    },
    avatar: {
        type: String,
        default: 'default.jpg'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Reverse populate with virtuals
userSchema.virtual('grades', {
    ref: 'Grade',
    localField: '_id',
    foreignField: 'student',
    justOne: false
});

// Cascade delete grades when a user is deleted
userSchema.pre('remove', async function(next) {
    await this.model('Grade').deleteMany({ student: this._id });
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
