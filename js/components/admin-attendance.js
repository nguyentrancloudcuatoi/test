class AdminAttendanceManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialData();
    }

    initializeElements() {
        // Filter elements
        this.teacherFilter = document.getElementById('teacherFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.timeFilter = document.getElementById('timeFilter');
        this.dateRangeContainer = document.getElementById('dateRangeContainer');
        this.startDate = document.getElementById('startDate');
        this.endDate = document.getElementById('endDate');

        // List and table elements
        this.attendanceItems = document.getElementById('attendanceItems');
        this.workloadTableBody = document.getElementById('workloadTableBody');
        this.pendingCount = document.getElementById('pendingCount');
        this.approvedCount = document.getElementById('approvedCount');
        this.totalWorkload = document.getElementById('totalWorkload');

        // Modal elements
        this.reviewModal = document.getElementById('reviewModal');
        this.selectedAttendanceId = null;
        this.modalBody = this.reviewModal.querySelector('.modal-body');
        this.approveBtn = document.getElementById('approveAttendance');
        this.rejectBtn = document.getElementById('rejectAttendance');
    }

    attachEventListeners() {
        // Filter change events
        this.teacherFilter.addEventListener('change', () => this.applyFilters());
        this.statusFilter.addEventListener('change', () => this.applyFilters());
        this.timeFilter.addEventListener('change', () => this.handleTimeFilterChange());
        this.startDate.addEventListener('change', () => this.applyFilters());
        this.endDate.addEventListener('change', () => this.applyFilters());

        // Export button
        document.getElementById('exportReport').addEventListener('click', () => this.exportWorkloadReport());

        // Modal actions
        this.reviewModal.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        this.approveBtn.addEventListener('click', () => this.handleApproval(true, this.selectedAttendanceId));
        this.rejectBtn.addEventListener('click', () => this.handleApproval(false, this.selectedAttendanceId));
    }

    async loadInitialData() {
        // Dữ liệu mẫu
        const sampleAttendances = [
            {
                id: '1',
                teacherId: 'GV001',
                teacherName: 'Nguyễn Văn A',
                classCode: 'TOEIC-A1',
                vietnameseTime: '20/03/2024 09:00',
                status: 'pending',
                duration: '120',
                students: [
                    { name: 'Học sinh 1', status: 'present', note: '' },
                    { name: 'Học sinh 2', status: 'absent', note: 'Ốm' },
                    { name: 'Học sinh 3', status: 'late', note: 'Đến muộn 15 phút' }
                ]
            },
            {
                id: '2',
                teacherId: 'GV002',
                teacherName: 'Trần Thị B',
                classCode: 'IELTS-B2',
                vietnameseTime: '20/03/2024 14:30',
                status: 'approved',
                duration: '180',
                students: [
                    { name: 'Học sinh 4', status: 'present', note: '' },
                    { name: 'Học sinh 5', status: 'present', note: '' },
                    { name: 'Học sinh 6', status: 'present', note: '' }
                ]
            },
            {
                id: '3',
                teacherId: 'GV003',
                teacherName: 'Lê Văn C',
                classCode: 'SPEAKING-C1',
                vietnameseTime: '20/03/2024 18:00',
                status: 'rejected',
                duration: '90',
                students: [
                    { name: 'Học sinh 7', status: 'absent', note: 'Không báo lý do' },
                    { name: 'Học sinh 8', status: 'present', note: '' }
                ]
            },
            {
                id: '4',
                teacherId: 'GV004',
                teacherName: 'Phạm Thị D',
                classCode: 'GRAMMAR-A2',
                vietnameseTime: '21/03/2024 08:00',
                status: 'pending',
                duration: '120',
                students: [
                    { name: 'Học sinh 9', status: 'present', note: '' },
                    { name: 'Học sinh 10', status: 'late', note: 'Đến muộn 10 phút' }
                ]
            },
            {
                id: '5',
                teacherId: 'GV005',
                teacherName: 'Hoàng Văn E',
                classCode: 'WRITING-B1',
                vietnameseTime: '21/03/2024 15:30',
                status: 'approved',
                duration: '150',
                students: [
                    { name: 'Học sinh 11', status: 'present', note: '' },
                    { name: 'Học sinh 12', status: 'present', note: '' },
                    { name: 'Học sinh 13', status: 'absent', note: 'Bận việc gia đình' }
                ]
            }
        ];

        // Lưu dữ liệu mẫu vào localStorage nếu chưa có dữ liệu
        if (!localStorage.getItem('attendanceRecords')) {
            localStorage.setItem('attendanceRecords', JSON.stringify(sampleAttendances));
        }

        // Lấy dữ liệu từ localStorage
        const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        this.renderAttendanceList(attendanceRecords);
        this.updateStatistics(attendanceRecords);
    }

    renderAttendanceList(attendances) {
        const tbody = document.getElementById('attendanceItems');
        tbody.innerHTML = attendances.map(attendance => `
            <tr data-attendance-id="${attendance.id}">
                <td>${attendance.teacherId}</td>
                <td>${attendance.teacherName}</td>
                <td>${attendance.classCode}</td>
                <td>${attendance.vietnameseTime}</td>
                <td>
                    <span class="status-badge status-${attendance.status}">
                        ${this.getStatusText(attendance.status)}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn-view" onclick="adminAttendance.viewDetails('${attendance.id}')">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    ${attendance.status === 'pending' ? `
                        <button class="btn-approve" onclick="adminAttendance.handleApproval(true, '${attendance.id}')">
                            <i class="fas fa-check"></i> Duyệt
                        </button>
                        <button class="btn-reject" onclick="adminAttendance.handleApproval(false, '${attendance.id}')">
                            <i class="fas fa-times"></i> Từ chối
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    renderWorkloadSummary(workloads) {
        this.workloadTableBody.innerHTML = workloads.map(workload => `
            <tr class="workload-row">
                <td class="workload-teacher-id">${workload.teacherId}</td>
                <td class="workload-teacher-name">${workload.teacherName}</td>
                <td class="workload-lesson-count">${workload.lessonCount}</td>
                <td class="workload-total-hours">${workload.totalHours}</td>
                <td class="workload-total-workload">${workload.totalWorkload}</td>
            </tr>
            <tr>
                <td class="workload-teacher-id">${workload.teacherId}</td>
                <td class="workload-teacher-name">${workload.teacherName}</td>
                <td class="workload-lesson-count">${workload.lessonCount}</td>
                <td class="workload-total-hours">${workload.totalHours}</td>
                <td class="workload-total-workload">${workload.totalWorkload}</td>
            </tr>
        `).join('') || `
            <tr>
                <td colspan="10">Không có dữ liệu</td>
            </tr>
        `;
    }

    async viewAttendanceDetail(attendanceId) {
        try {
            const detail = await this.fetchAttendanceDetail(attendanceId);
            this.selectedAttendanceId = attendanceId;
            this.showAttendanceDetail(detail);
        } catch (error) {
            console.error('Error loading attendance detail:', error);
        }
    }

    showAttendanceDetail(detail) {
        this.modalBody.innerHTML = `
            <div class="detail-section">
                <h3>Thông tin buổi học</h3>
                <p><strong>Lớp:</strong> ${detail.className}</p>
                <p><strong>Thời gian:</strong> ${this.formatDateTime(detail.datetime)}</p>
                <p><strong>Nội dung:</strong> ${detail.content}</p>
                <p><strong>Bài tập:</strong> ${detail.homework}</p>
                ${detail.recordingLink ? `
                    <p><strong>Recording:</strong> <a href="${detail.recordingLink}" target="_blank">Xem recording</a></p>
                ` : ''}
            </div>
            <div class="detail-section">
                <h3>Điểm danh học sinh</h3>
                <div class="student-attendance-list">
                    ${detail.students.map(student => `
                        <div class="student-attendance-item">
                            <span>${student.name}</span>
                            <span class="status-${student.status}">${this.getStudentStatusText(student.status)}</span>
                            ${student.note ? `<span class="note">${student.note}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ${detail.notes ? `
                <div class="detail-section">
                    <h3>Ghi chú</h3>
                    <p>${detail.notes}</p>
                </div>
            ` : ''}
        `;
        this.reviewModal.style.display = 'block';
    }

    async handleApproval(isApproved, attendanceId) {
        if (!attendanceId) {
            console.error('Missing attendanceId');
            alert('Có lỗi xảy ra: Không tìm thấy ID điểm danh');
            return;
        }

        try {
            const attendanceData = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
            const index = attendanceData.findIndex(a => a.id === attendanceId);
            
            if (index === -1) {
                throw new Error('Không tìm thấy bản ghi điểm danh');
            }

            // Cập nhật trạng thái
            attendanceData[index].status = isApproved ? 'approved' : 'rejected';
            localStorage.setItem('attendanceRecords', JSON.stringify(attendanceData));
            
            // Cập nhật UI
            const row = document.querySelector(`tr[data-attendance-id="${attendanceId}"]`);
            if (row) {
                const statusCell = row.querySelector('.status-badge');
                const actionsCell = row.querySelector('.action-buttons');
                
                statusCell.className = `status-badge status-${attendanceData[index].status}`;
                statusCell.textContent = this.getStatusText(attendanceData[index].status);
                
                // Cập nhật nút tác vụ
                actionsCell.innerHTML = `
                    <button class="btn-view" onclick="adminAttendance.viewDetails('${attendanceId}')">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                `;
            }

            // Cập nhật thống kê
            this.updateStatistics(attendanceData);
            
            // Đóng modal
            this.closeModal();
            
            // Hiển thị thông báo
            alert(isApproved ? 'Đã phê duyệt điểm danh!' : 'Đã từ chối điểm danh!');
        } catch (error) {
            console.error('Error handling approval:', error);
            alert('Có lỗi xảy ra khi xử lý phê duyệt!');
        }
    }

    async updateUIAfterApproval(attendanceData, approvedId) {
        // 1. Cập nhật hàng trong bảng
        const row = document.querySelector(`tr[data-attendance-id="${approvedId}"]`);
        if (row) {
            const attendance = attendanceData.find(a => a.id === approvedId);
            const statusCell = row.querySelector('.status-badge');
            const actionsCell = row.querySelector('.action-buttons');
            
            // Cập nhật trạng thái
            statusCell.className = `status-badge status-${attendance.status}`;
            statusCell.textContent = this.getStatusText(attendance.status);
            
            // Cập nhật nút tác vụ - chỉ giữ lại nút xem chi tiết
            actionsCell.innerHTML = `
                <button class="btn-view" onclick="adminAttendance.viewDetails('${attendance.id}')">
                    <i class="fas fa-eye"></i> Xem
                </button>
            `;
        }

        // 2. Cập nhật thống kê
        this.updateStatistics(attendanceData);

        // 3. Cập nhật bảng tổng hợp công nếu có
        const workloads = await this.calculateWorkloads(attendanceData);
        this.renderWorkloadSummary(workloads);

        // 4. Áp dụng lại bộ lọc hiện tại nếu có
        const currentFilters = this.getCurrentFilters();
        const filteredData = this.applyFiltersToData(attendanceData, currentFilters);
        this.renderAttendanceList(filteredData);
    }

    getCurrentFilters() {
        return {
            teacherId: this.teacherFilter.value,
            status: this.statusFilter.value,
            timeRange: this.timeFilter.value,
            startDate: this.startDate.value,
            endDate: this.endDate.value
        };
    }

    applyFiltersToData(data, filters) {
        return data.filter(item => {
            // Lọc theo giáo viên
            if (filters.teacherId && item.teacherId !== filters.teacherId) return false;
            
            // Lọc theo trạng thái
            if (filters.status && item.status !== filters.status) return false;
            
            // Lọc theo thời gian
            if (filters.timeRange !== 'custom') {
                // Xử lý lọc theo các khoảng thời gian định sẵn
                const itemDate = new Date(item.vietnameseTime);
                switch (filters.timeRange) {
                    case 'today':
                        if (!this.isToday(itemDate)) return false;
                        break;
                    case 'thisWeek':
                        if (!this.isThisWeek(itemDate)) return false;
                        break;
                    case 'thisMonth':
                        if (!this.isThisMonth(itemDate)) return false;
                        break;
                }
            } else {
                // Lọc theo khoảng ngày tùy chọn
                if (filters.startDate && filters.endDate) {
                    const itemDate = new Date(item.vietnameseTime);
                    const start = new Date(filters.startDate);
                    const end = new Date(filters.endDate);
                    if (itemDate < start || itemDate > end) return false;
                }
            }
            
            return true;
        });
    }

    handleTimeFilterChange() {
        const showCustomRange = this.timeFilter.value === 'custom';
        this.dateRangeContainer.style.display = showCustomRange ? 'grid' : 'none';
        this.applyFilters();
    }

    async applyFilters() {
        const filters = {
            teacherId: this.teacherFilter.value,
            status: this.statusFilter.value,
            timeRange: this.timeFilter.value,
            startDate: this.startDate.value,
            endDate: this.endDate.value
        };

        try {
            const [attendances, workloads] = await Promise.all([
                this.fetchFilteredAttendances(filters),
                this.fetchFilteredWorkloads(filters)
            ]);

            this.renderAttendanceList(attendances);
            this.renderWorkloadSummary(workloads);
            this.updateStatistics(attendances);
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }

    closeModal() {
        this.reviewModal.style.display = 'none';
        this.selectedAttendanceId = null;
    }

    // Helper methods
    formatDateTime(datetime) {
        return new Date(datetime).toLocaleString('vi-VN');
    }

    getStatusText(status) {
        const statusTexts = {
            pending: 'Chờ duyệt',
            approved: 'Đã duyệt',
            rejected: 'Từ chối'
        };
        return statusTexts[status] || status;
    }

    getStudentStatusText(status) {
        const statusTexts = {
            present: 'Có mặt',
            absent: 'Vắng mặt',
            late: 'Đi muộn'
        };
        return statusTexts[status] || status;
    }

    // API simulation methods
    async fetchTeachers() {
        return [
            { id: 1, name: 'Nguyễn Văn A' },
            { id: 2, name: 'Trần Thị B' }
        ];
    }

    async fetchAttendances() {
        return [
            {
                id: 1,
                teacherId: 1,
                teacherName: 'Nguyễn Văn A',
                className: 'Toán 10A',
                datetime: '2024-03-20T08:00:00',
                status: 'pending'
            }
            // More attendances...
        ];
    }

    async fetchWorkloadSummary() {
        const sampleWorkloads = [
            {
                teacherId: 1,
                teacherName: 'Nguyễn Văn A',
                lessonCount: 10,
                totalHours: 100,
                totalWorkload: 110
            },
            {
                teacherId: 2,
                teacherName: 'Trần Thị B',
                lessonCount: 12,
                totalHours: 120,
                totalWorkload: 132
            },
            {
                teacherId: 3,
                teacherName: 'Lê Văn C',
                lessonCount: 8,
                totalHours: 80,
                totalWorkload: 88
            },
            {
                teacherId: 4,
                teacherName: 'Nguyễn Văn D',
                lessonCount: 15,
                totalHours: 150,
                totalWorkload: 165
            },
            {
                teacherId: 5,
                teacherName: 'Trần Thị E',
                lessonCount: 9,
                totalHours: 90,
                totalWorkload: 99
            }
        ];

        return sampleWorkloads;
    }

    updateStatistics(attendances) {
        const pendingCount = attendances.filter(a => a.status === 'pending').length;
        const approvedCount = attendances.filter(a => a.status === 'approved').length;
        const totalWorkload = attendances.reduce((sum, a) => sum + parseInt(a.duration || 0), 0);

        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('approvedCount').textContent = approvedCount;
        document.getElementById('totalWorkload').textContent = totalWorkload;
    }

    async submitAttendance() {
        try {
            // Validate form data
            const formData = this.collectFormData();
            if (!this.validateAttendanceData(formData)) {
                alert('Vui lòng điền đầy đủ thông tin điểm danh!');
                return;
            }

            // Create attendance record
            const attendanceRecord = {
                id: Date.now().toString(),
                teacherId: this.getCurrentTeacherId(),
                teacherName: this.getCurrentTeacherName(),
                classCode: formData.get('classCode'),
                vietnameseTime: formData.get('vietnameseTime'),
                teachingMethod: formData.get('teachingMethod'),
                session: formData.get('session'),
                materials: formData.get('materials'),
                duration: formData.get('duration'),
                attendance: formData.get('attendance'),
                note: formData.get('note'),
                status: 'pending',
                timestamp: new Date().toISOString()
            };

            // Save to localStorage
            const existingRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
            existingRecords.push(attendanceRecord);
            localStorage.setItem('attendanceRecords', JSON.stringify(existingRecords));

            // Show success message and redirect
            alert('Đã gửi điểm danh thành công!');
            window.location.href = '';
        } catch (error) {
            console.error('Error submitting attendance:', error);
            alert('Có lỗi xảy ra khi gửi điểm danh!');
        }
    }

    validateAttendanceData(formData) {
        const requiredFields = [
            'email',
            'classCode', 
            'teachingMethod',
            'session',
            'materials',
            'lessonNumber',
            'lessonName',
            'state',
            'duration',
            'vietnameseTime',
            'attendance'
        ];

        for (const field of requiredFields) {
            const value = formData.get(field);
            if (!value || value === 'Select' || value === 'Section') {
                return false;
            }
        }
        return true;
    }

    async exportWorkloadReport() {
        try {
            // Lấy dữ liệu từ localStorage
            const attendanceData = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
            
            // Tính toán workload cho từng giáo viên
            const teacherWorkloads = {};
            
            attendanceData.forEach(record => {
                if (record.status === 'approved') {
                    if (!teacherWorkloads[record.teacherId]) {
                        teacherWorkloads[record.teacherId] = {
                            teacherId: record.teacherId,
                            teacherName: record.teacherName,
                            lessonCount: 0,
                            totalHours: 0,
                            totalWorkload: 0
                        };
                    }
                    
                    teacherWorkloads[record.teacherId].lessonCount += 1;
                    teacherWorkloads[record.teacherId].totalHours += parseInt(record.duration) || 0;
                    teacherWorkloads[record.teacherId].totalWorkload += parseInt(record.duration) || 0;
                }
            });

            // Chuyển đổi dữ liệu thành mảng để xuất Excel
            const workloadArray = [
                ['ID Giáo viên', 'Tên giáo viên', 'Số buổi dạy', 'Tổng giờ', 'Tổng công'], // Header
                ...Object.values(teacherWorkloads).map(teacher => [
                    teacher.teacherId,
                    teacher.teacherName,
                    teacher.lessonCount,
                    teacher.totalHours,
                    teacher.totalWorkload
                ])
            ];

            // Tạo workbook mới
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(workloadArray);

            // Định dạng cột
            const colWidths = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
            ws['!cols'] = colWidths;

            // Thêm worksheet vào workbook
            XLSX.utils.book_append_sheet(wb, ws, "Báo cáo công giảng dạy");

            // Tạo tên file với timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `bao_cao_cong_giang_day_${timestamp}.xlsx`;

            // Xuất file
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error('Error exporting workload report:', error);
            alert('Có lỗi xảy ra khi xuất báo cáo!');
        }
    }
}

// Initialize when DOM is loaded
let adminAttendance;
document.addEventListener('DOMContentLoaded', () => {
    adminAttendance = new AdminAttendanceManager();
}); 