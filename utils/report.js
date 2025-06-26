import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate student report card
const generateStudentReportCard = async (student, grades, outputPath = null) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a document
            const doc = new PDFDocument({ margin: 50 });
            
            // If no output path provided, use a buffer
            let buffers = [];
            let stream;
            
            if (!outputPath) {
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });
            } else {
                stream = fs.createWriteStream(outputPath);
                doc.pipe(stream);
            }
            
            // Add header
            generateHeader(doc);
            
            // Add student info
            generateStudentInfo(doc, student);
            
            // Add grades table
            generateGradesTable(doc, grades);
            
            // Add footer
            generateFooter(doc);
            
            // Finalize the PDF
            doc.end();
            
            if (outputPath) {
                stream.on('finish', () => {
                    resolve(outputPath);
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

// Generate header
const generateHeader = (doc) => {
    doc
        .image(path.join(__dirname, '../public/img/logo.png'), 50, 45, { width: 50 })
        .fillColor('#444444')
        .fontSize(20)
        .text('نظام إدارة المدرسة', 110, 57, { align: 'right' })
        .fontSize(10)
        .text('123 شارع المدرسة', 200, 65, { align: 'right' })
        .text('الرياض، المملكة العربية السعودية', 200, 80, { align: 'right' })
        .moveDown();
};

// Generate student info
const generateStudentInfo = (doc, student) => {
    doc
        .fillColor('#444444')
        .fontSize(20)
        .text('كشف درجات الطالب', 50, 160, { align: 'right' })
        .fontSize(10)
        .text('رقم الطالب:', 50, 200, { align: 'right' })
        .font('Helvetica')
        .text(student.studentId, 150, 200, { align: 'right' })
        .font('Helvetica-Bold')
        .text('الاسم:', 50, 215, { align: 'right' })
        .font('Helvetica')
        .text(student.name, 150, 215, { align: 'right' })
        .font('Helvetica-Bold')
        .text('الصف:', 50, 230, { align: 'right' })
        .font('Helvetica')
        .text(student.grade, 150, 230, { align: 'right' })
        .font('Helvetica-Bold')
        .text('القسم:', 50, 245, { align: 'right' })
        .font('Helvetica')
        .text(student.section, 150, 245, { align: 'right' })
        .moveDown();
};

// Generate grades table
const generateGradesTable = (doc, grades) => {
    const tableTop = 300;
    const leftMargin = 50;
    const rowHeight = 30;
    const colWidth = (doc.page.width - 100) / 5;
    
    // Table header
    doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('المادة', leftMargin + (colWidth * 4), tableTop, { width: colWidth, align: 'right' })
        .text('الدرجة', leftMargin + (colWidth * 3), tableTop, { width: colWidth, align: 'center' })
        .text('الدرجة الكاملة', leftMargin + (colWidth * 2), tableTop, { width: colWidth, align: 'center' })
        .text('النسبة المئوية', leftMargin + (colWidth * 1), tableTop, { width: colWidth, align: 'center' })
        .text('التقدير', leftMargin, tableTop, { width: colWidth, align: 'center' });
    
    // Horizontal line
    doc
        .moveTo(leftMargin, tableTop + 20)
        .lineTo(doc.page.width - leftMargin, tableTop + 20)
        .stroke();
    
    // Table rows
    let y = tableTop + 40;
    let totalScore = 0;
    let maxTotalScore = 0;
    
    grades.forEach((grade, i) => {
        const percentage = (grade.score / grade.maxScore) * 100;
        const gradeLetter = calculateGrade(percentage);
        
        doc
            .font('Helvetica')
            .fontSize(10)
            .text(grade.subject, leftMargin + (colWidth * 4), y, { width: colWidth, align: 'right' })
            .text(grade.score.toString(), leftMargin + (colWidth * 3), y, { width: colWidth, align: 'center' })
            .text(grade.maxScore.toString(), leftMargin + (colWidth * 2), y, { width: colWidth, align: 'center' })
            .text(`${percentage.toFixed(2)}%`, leftMargin + (colWidth * 1), y, { width: colWidth, align: 'center' })
            .text(gradeLetter, leftMargin, y, { width: colWidth, align: 'center' });
        
        // Add alternating row background
        if (i % 2 === 0) {
            doc.rect(leftMargin, y - 10, doc.page.width - 100, rowHeight)
               .fill('#f5f5f5');
        }
        
        totalScore += grade.score;
        maxTotalScore += grade.maxScore;
        y += rowHeight;
    });
    
    // Calculate total percentage
    const totalPercentage = (totalScore / maxTotalScore) * 100;
    const totalGrade = calculateGrade(totalPercentage);
    
    // Add total row
    doc
        .font('Helvetica-Bold')
        .text('المجموع', leftMargin + (colWidth * 4), y, { width: colWidth, align: 'right' })
        .text(totalScore.toString(), leftMargin + (colWidth * 3), y, { width: colWidth, align: 'center' })
        .text(maxTotalScore.toString(), leftMargin + (colWidth * 2), y, { width: colWidth, align: 'center' })
        .text(`${totalPercentage.toFixed(2)}%`, leftMargin + (colWidth * 1), y, { width: colWidth, align: 'center' })
        .text(totalGrade, leftMargin, y, { width: colWidth, align: 'center' });
};

// Calculate grade letter
const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'ممتاز';
    if (percentage >= 80) return 'جيد جداً';
    if (percentage >= 70) return 'جيد';
    if (percentage >= 60) return 'مقبول';
    return 'ضعيف';
};

// Generate footer
const generateFooter = (doc) => {
    doc
        .fontSize(10)
        .text('تم إنشاء هذا التقرير آلياً', 50, 700, { align: 'center' })
        .text('نظام إدارة المدرسة - جميع الحقوق محفوظة', 50, 715, { align: 'center' });
};

// Generate class report
const generateClassReport = async (classInfo, students, outputPath = null) => {
    // Similar implementation to generateStudentReportCard but for entire class
    // This is a placeholder for the actual implementation
    return new Promise((resolve) => {
        // Implementation would be similar to generateStudentReportCard
        // but would include data for multiple students
        resolve('Class report generated');
    });
};

export default {
    generateStudentReportCard,
    generateClassReport
};
