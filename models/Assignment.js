import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'الرجاء إدخال عنوان الواجب'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'الرجاء إدخال وصف الواجب']
    },
    dueDate: {
        type: Date,
        required: [true, 'الرجاء تحديد تاريخ التسليم']
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: [true, 'الرجاء تحديد الصف']
    },
    subject: {
        type: String,
        required: [true, 'الرجاء تحديد المادة'],
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
        ref: 'User',
        required: true
    },
    fileUrl: {
        type: String,
        required: false
    },
    submissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        submissionDate: {
            type: Date,
            default: Date.now
        },
        fileUrl: String,
        grade: {
            type: Number,
            min: 0,
            max: 100
        },
        feedback: String
    }],
    isPublished: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for assignment URL
assignmentSchema.virtual('url').get(function() {
    return `/assignments/${this._id}`;
});

// Static method to get assignments by teacher
assignmentSchema.statics.getByTeacher = function(teacherId) {
    return this.find({ teacher: teacherId });
};

// Static method to get assignments by class
assignmentSchema.statics.getByClass = function(classId) {
    return this.find({ class: classId });
};

// Static method to get assignments by student
assignmentSchema.statics.getByStudent = function(studentId) {
    return this.find({ 'submissions.student': studentId });
};

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
