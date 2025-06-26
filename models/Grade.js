import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'الرجاء تحديد الطالب']
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
    examType: {
        type: String,
        required: [true, 'الرجاء تحديد نوع التقييم'],
        enum: {
            values: ['quiz', 'homework', 'midterm', 'final', 'project', 'participation'],
            message: 'نوع التقييم غير صالح'
        }
    },
    grade: {
        type: Number,
        required: [true, 'الرجاء إدخال الدرجة'],
        min: [0, 'لا يمكن أن تكون الدرجة أقل من 0'],
        max: [100, 'لا يمكن أن تزيد الدرجة عن 100']
    },
    maxGrade: {
        type: Number,
        default: 100
    },
    weight: {
        type: Number,
        min: [0, 'لا يمكن أن يكون الوزن أقل من 0'],
        max: [100, 'لا يمكن أن يزيد الوزن عن 100'],
        default: 100
    },
    notes: {
        type: String,
        maxlength: [500, 'لا يمكن أن تزيد الملاحظات عن 500 حرف']
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: Date,
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            comment: {
                type: String,
                required: [true, 'الرجاء إدخال تعليق'],
                maxlength: [500, 'لا يمكن أن يزيد التعليق عن 500 حرف']
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Calculate grade percentage
// gradeSchema.virtual('percentage').get(function() {
//     return (this.grade / this.maxGrade) * 100;
// });

// Calculate grade letter
// gradeSchema.virtual('letterGrade').get(function() {
//     const percentage = (this.grade / this.maxGrade) * 100;
//     if (percentage >= 90) return 'A+';
//     if (percentage >= 85) return 'A';
//     if (percentage >= 80) return 'B+';
//     if (percentage >= 75) return 'B';
//     if (percentage >= 70) return 'C+';
//     if (percentage >= 65) return 'C';
//     if (percentage >= 60) return 'D+';
//     if (percentage >= 50) return 'D';
//     return 'F';
// });

// Static method to get average grade for a student in a subject
gradeSchema.statics.getAverageGrade = async function(studentId, subject) {
    const obj = await this.aggregate([
        {
            $match: { 
                student: studentId,
                subject: subject,
                isPublished: true
            }
        },
        {
            $group: {
                _id: '$student',
                averageGrade: { $avg: '$grade' },
                count: { $sum: 1 }
            }
        }
    ]);

    try {
        await this.model('User').findByIdAndUpdate(studentId, {
            averageGrade: obj[0] ? Math.round(obj[0].averageGrade) : 0
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageGrade after save
gradeSchema.post('save', async function() {
    if (this.isPublished) {
        await this.constructor.getAverageGrade(this.student, this.subject);
    }
});

// Call getAverageGrade after remove
gradeSchema.post('remove', async function() {
    if (this.isPublished) {
        await this.constructor.getAverageGrade(this.student, this.subject);
    }
});

// Prevent duplicate grades for same student, subject and exam type
gradeSchema.index(
    { student: 1, subject: 1, examType: 1 },
    { unique: true, partialFilterExpression: { isPublished: true } }
);

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;
