document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Sample data for demonstration
    const students = [
        { id: 1, name: 'أحمد محمد', studentId: 'S1001', class: 'الصف الأول أ' },
        { id: 2, name: 'سارة خالد', studentId: 'S1002', class: 'الصف الأول أ' },
        { id: 3, name: 'علي حسن', studentId: 'S1003', class: 'الصف الأول أ' },
        { id: 4, name: 'نورا عبدالله', studentId: 'S1004', class: 'الصف الأول أ' },
        { id: 5, name: 'يوسف أحمد', studentId: 'S1005', class: 'الصف الأول أ' },
        { id: 6, name: 'ريم سعيد', studentId: 'S1006', class: 'الصف الثاني ب' },
        { id: 7, name: 'خالد علي', studentId: 'S1007', class: 'الصف الثاني ب' },
        { id: 8, name: 'لمى وليد', studentId: 'S1008', class: 'الصف الثاني ب' },
        { id: 9, name: 'محمد خالد', studentId: 'S1009', class: 'الصف الثالث ج' },
        { id: 10, name: 'سلمى عبدالرحمن', studentId: 'S1010', class: 'الصف الثالث ج' }
    ];

    const subjects = ['اللغة العربية', 'اللغة الإنجليزية', 'الرياضيات', 'العلوم', 'الدراسات الاجتماعية', 'التربية الإسلامية'];
    const months = ['سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو'];

    // Initialize charts
    let performanceChart, monthlyTrendChart;

    // DOM Elements
    const gradeClassSelect = document.getElementById('gradeClass');
    const gradeSubjectSelect = document.getElementById('gradeSubject');
    const gradeTypeSelect = document.getElementById('gradeType');
    const gradeDateInput = document.getElementById('gradeDate');
    const gradesTable = document.getElementById('gradesTable');
    const saveGradesBtn = document.getElementById('saveGradesBtn');
    const printGradesBtn = document.getElementById('printGradesBtn');
    const filterStudentInput = document.getElementById('filterStudent');
    const filterClassSelect = document.getElementById('filterClass');
    const filterSubjectSelect = document.getElementById('filterSubject');
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const generateReportBtn = document.getElementById('generateReport');
    const reportTypeSelect = document.getElementById('reportType');
    const reportMonthSelect = document.getElementById('reportMonth');

    // Initialize the page
    function initializePage() {
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        gradeDateInput.value = today;
        filterDateTo.value = today;
        
        // Initialize event listeners
        setupEventListeners();
        
        // Initialize charts
        initializeCharts();
        
        // Load initial data
        loadStudents();
    }


    // Setup event listeners
    function setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', switchTab);
        });

        // Grade form
        gradeClassSelect.addEventListener('change', loadStudents);
        saveGradesBtn.addEventListener('click', saveGrades);
        printGradesBtn.addEventListener('click', printGrades);
        
        // Filters
        applyFiltersBtn.addEventListener('click', applyFilters);
        resetFiltersBtn.addEventListener('click', resetFilters);
        
        // Reports
        generateReportBtn.addEventListener('click', generateReport);
    }


    // Load students based on selected class
    function loadStudents() {
        const selectedClass = gradeClassSelect.value;
        const selectedSubject = gradeSubjectSelect.value;
        
        if (!selectedClass || !selectedSubject) {
            updateGradesTable([]);
            saveGradesBtn.disabled = true;
            return;
        }
        
        // Filter students by class
        const filteredStudents = students.filter(student => 
            student.class === selectedClass
        );
        
        updateGradesTable(filteredStudents);
        saveGradesBtn.disabled = false;
    }


    // Update grades table with student data
    function updateGradesTable(studentsList) {
        const tbody = gradesTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (studentsList.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="5" style="text-align: center; padding: 20px;">
                    ${!gradeClassSelect.value || !gradeSubjectSelect.value ? 
                      'الرجاء اختيار الصف والمادة لعرض قائمة الطلاب' : 
                      'لا توجد بيانات متاحة'}
                </td>`;
            tbody.appendChild(row);
            return;
        }
        
        studentsList.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.studentId}</td>
                <td>
                    <input type="number" class="form-control grade-input" min="0" max="100" 
                           data-student-id="${student.id}" placeholder="أدخل الدرجة">
                </td>
                <td class="grade-rating">-</td>
                <td>
                    <input type="text" class="form-control grade-notes" 
                           data-student-id="${student.id}" placeholder="ملاحظات">
                </td>`;
            tbody.appendChild(row);
        });
        
        // Add input event listeners for grade calculation
        document.querySelectorAll('.grade-input').forEach(input => {
            input.addEventListener('input', updateGradeRating);
        });
    }


    // Update grade rating based on input
    function updateGradeRating(e) {
        const grade = parseInt(e.target.value);
        const row = e.target.closest('tr');
        const ratingCell = row.querySelector('.grade-rating');
        
        if (isNaN(grade) || grade < 0 || grade > 100) {
            ratingCell.textContent = '-';
            ratingCell.className = 'grade-rating';
            return;
        }
        
        let rating, ratingClass;
        
        if (grade >= 90) {
            rating = 'ممتاز';
            ratingClass = 'grade-A';
        } else if (grade >= 80) {
            rating = 'جيد جدًا';
            ratingClass = 'grade-B';
        } else if (grade >= 70) {
            rating = 'جيد';
            ratingClass = 'grade-C';
        } else if (grade >= 60) {
            rating = 'مقبول';
            ratingClass = 'grade-D';
        } else {
            rating = 'ضعيف';
            ratingClass = 'grade-F';
        }
        
        ratingCell.textContent = rating;
        ratingCell.className = `grade-rating ${ratingClass}`;
    }


    // Save grades to storage (simulated)
    function saveGrades() {
        const grades = [];
        const rows = gradesTable.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const studentId = row.querySelector('.grade-input')?.dataset.studentId;
            const gradeInput = row.querySelector('.grade-input');
            const notesInput = row.querySelector('.grade-notes');
            
            if (!studentId || !gradeInput?.value) return;
            
            grades.push({
                studentId,
                grade: parseFloat(gradeInput.value),
                notes: notesInput?.value || '',
                subject: gradeSubjectSelect.value,
                type: gradeTypeSelect.value,
                date: gradeDateInput.value,
                class: gradeClassSelect.value
            });
        });
        
        if (grades.length === 0) {
            showAlert('warning', 'الرجاء إدخال درجات لحفظها');
            return;
        }
        
        // In a real app, you would send this to a server
        console.log('Saving grades:', grades);
        
        // Simulate API call
        setTimeout(() => {
            showAlert('success', 'تم حفظ الدرجات بنجاح');
            // Reset form
            document.querySelectorAll('.grade-input, .grade-notes').forEach(input => {
                input.value = '';
            });
            document.querySelectorAll('.grade-rating').forEach(cell => {
                cell.textContent = '-';
                cell.className = 'grade-rating';
            });
        }, 1000);
    }


    // Print grades
    function printGrades() {
        window.print();
    }


    // Apply filters to grade history
    function applyFilters() {
        // In a real app, you would filter the data from your data source
        console.log('Applying filters:', {
            student: filterStudentInput.value,
            class: filterClassSelect.value,
            subject: filterSubjectSelect.value,
            dateFrom: filterDateFrom.value,
            dateTo: filterDateTo.value
        });
        
        showAlert('info', 'تم تطبيق الفلاتر بنجاح');
    }


    // Reset all filters
    function resetFilters() {
        filterStudentInput.value = '';
        filterClassSelect.value = '';
        filterSubjectSelect.value = '';
        filterDateFrom.value = '';
        filterDateTo.value = new Date().toISOString().split('T')[0];
        
        // In a real app, you would reset the data display
        showAlert('info', 'تم إعادة تعيين الفلاتر');
    }


    // Generate report
    function generateReport() {
        const reportType = reportTypeSelect.value;
        const reportMonth = reportMonthSelect.value;
        
        if (!reportType || !reportMonth) {
            showAlert('warning', 'الرجاء اختيار نوع التقرير والشهر');
            return;
        }
        
        // In a real app, you would generate a PDF or open a new window with the report
        console.log('Generating report:', { reportType, reportMonth });
        
        // Simulate report generation
        showAlert('info', `جاري إنشاء تقرير ${reportType} لشهر ${reportMonth}...`);
        
        setTimeout(() => {
            showAlert('success', `تم إنشاء التقرير بنجاح`);
            // In a real app, you would open the generated report
            // window.open(`/reports/${reportType}/${reportMonth}.pdf`, '_blank');
        }, 2000);
    }


    // Initialize charts
    function initializeCharts() {
        // Performance by subject chart
        const performanceOptions = {
            series: [{
                name: 'الدرجة',
                data: [85, 72, 90, 65, 88, 78]
            }],
            chart: {
                type: 'bar',
                height: 350,
                fontFamily: 'Tajawal, sans-serif',
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                        reset: false
                    }
                }
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: true,
                }
            },
            colors: ['#4e73df'],
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val + '%';
                },
                style: {
                    fontSize: '14px',
                    colors: ['#fff']
                }
            },
            xaxis: {
                categories: subjects,
                labels: {
                    style: {
                        fontSize: '14px',
                        fontWeight: 600
                    }
                },
                max: 100
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '14px',
                        fontWeight: 600
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val + ' %';
                    }
                },
                style: {
                    fontSize: '14px',
                    fontFamily: 'Tajawal, sans-serif'
                }
            }
        };

        performanceChart = new ApexCharts(document.querySelector("#performanceChart"), performanceOptions);
        performanceChart.render();

        // Monthly trend chart
        const trendOptions = {
            series: [{
                name: 'المعدل',
                data: [75, 82, 80, 85, 88, 85, 90, 92, 95]
            }],
            chart: {
                height: 350,
                type: 'line',
                fontFamily: 'Tajawal, sans-serif',
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                        reset: false
                    }
                },
                zoom: {
                    enabled: false
                }
            },
            colors: ['#36b9cc'],
            stroke: {
                width: 3,
                curve: 'smooth'
            },
            markers: {
                size: 5,
                hover: {
                    size: 7
                }
            },
            xaxis: {
                categories: months,
                labels: {
                    style: {
                        fontSize: '12px',
                        fontWeight: 600
                    }
                }
            },
            yaxis: {
                min: 0,
                max: 100,
                labels: {
                    formatter: function(val) {
                        return val + '%';
                    },
                    style: {
                        fontSize: '12px',
                        fontWeight: 600
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val + ' %';
                    }
                },
                style: {
                    fontSize: '14px',
                    fontFamily: 'Tajawal, sans-serif'
                }
            }
        };

        monthlyTrendChart = new ApexCharts(document.querySelector("#monthlyTrendChart"), trendOptions);
        monthlyTrendChart.render();
    }


    // Switch between tabs
    function switchTab(e) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        const tabId = e.target.getAttribute('data-tab');
        e.target.classList.add('active');
        
        // Show corresponding content
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        // Update charts on tab switch
        if (tabId === 'performance' && performanceChart) {
            setTimeout(() => {
                performanceChart.updateOptions({
                    chart: {
                        width: document.querySelector('#performanceChart').offsetWidth
                    }
                });
                monthlyTrendChart.updateOptions({
                    chart: {
                        width: document.querySelector('#monthlyTrendChart').offsetWidth
                    }
                });
            }, 100);
        }
    }


    // Show alert message
    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const alertsContainer = document.getElementById('alertsContainer');
        if (alertsContainer) {
            alertsContainer.appendChild(alertDiv);
            
            // Auto-remove alert after 5 seconds
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }
    }


    // Initialize the page when DOM is loaded
    initializePage();
});
