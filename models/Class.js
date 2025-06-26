import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'الرجاء إدخال اسم الصف'],
        unique: true,
        trim: true
    },
    grade: {
        type: String,
        required: [true, 'الرجاء تحديد المرحلة الدراسية'],
        enum: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth']
    },
    section: {
        type: String,
        required: [true, 'الرجاء تحديد الشعبة'],
        enum: ['A', 'B', 'C', 'D']
    },
    academicYear: {
        type: String,
        required: [true, 'الرجاء تحديد السنة الدراسية'],
        match: [/^\d{4}-\d{4}$/, 'يجب أن تكون السنة الدراسية بالصيغة YYYY-YYYY']
    },
    homeroomTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'الرجاء تحديد المعلم الرئيسي للصف']
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    subjects: [{
        subject: {
            type: String,
            enum: [
                'math',
                'science',
                'arabic',
                'english',
                'islamic',
                'social',
                'art',
                'sports',
                'computer',
                'physics',
                'chemistry',
                'biology'
            ]
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    schedule: [{
        day: {
            type: String,
            enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
            required: true
        },
        periods: [{
            period: {
                type: Number,
                required: true,
                min: 1,
                max: 8
            },
            subject: {
                type: String,
                enum: [
                    'math',
                    'science',
                    'arabic',
                    'english',
                    'islamic',
                    'social',
                    'art',
                    'sports',
                    'computer',
                    'physics',
                    'chemistry',
                    'biology',
                    'break',
                    'assembly',
                    'activity'
                ],
                required: true
            },
            teacher: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            room: String
        }]
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for class display name
classSchema.virtual('displayName').get(function() {
    return `الصف ${this.grade} ${this.section} - ${this.academicYear}`;
});

// Get class by homeroom teacher
classSchema.statics.getByHomeroomTeacher = function(teacherId) {
    return this.find({ homeroomTeacher: teacherId });
};

// Get class by subject teacher
classSchema.statics.getBySubjectTeacher = function(teacherId) {
    return this.find({ 'subjects.teacher': teacherId });
};

// Get class by student
classSchema.statics.getByStudent = function(studentId) {
    return this.findOne({ students: studentId });
};

const Class = mongoose.model('Class', classSchema);

export default Class;
