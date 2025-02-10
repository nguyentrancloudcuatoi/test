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

        // Modal elements
        this.reviewModal = document.getElementById('reviewModal');
        this.selectedAttendanceId = null;
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
        document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('approveAttendance').addEventListener('click', () => this.approveAttendance());
        document.getElementById('rejectAttendance').addEventListener('click', () => this.rejectAttendance());
    }

    async loadInitialData() {
        try {
            const [teachers, attendances, workloads] = await Promise.all([
                this.fetchTeachers(),
                this.fetchAttendances(),
                this.fetchWorkloadSummary()
            ]);

            this.populateTeacherFilter(teachers);
            this.renderAttendanceList(attendances);
            this.renderWorkloadSummary(workloads);
            this.updateStatistics();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    renderAttendanceList(attendances) {
        this.attendanceItems.innerHTML = attendances.map(attendance => `
            <div class="attendance-item">
                <div class="teacher-info">
                    <img src="../../assets/images/avatars/${attendance.teacherId}.jpg" 
                         alt="${attendance.teacherName}"
                         class="teacher-avatar">
                    <span>${attendance.teacherName}</span>
                </div>
                <div>${attendance.className}</div>
                <div>${this.formatDateTime(attendance.datetime)}</div>
                <div>
                    <span class="status-badge status-${attendance.status}">
                        ${this.getStatusText(attendance.status)}
                    </span>
                </div>
                <div class="action-buttons">
                    <button class="btn-view" onclick="adminAttendance.viewAttendanceDetail(${attendance.id})">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderWorkloadSummary(workloads) {
        this.workloadTableBody.innerHTML = workloads.map(workload => `
            <tr>
                <td>${workload.teacherName}</td>
                <td>${workload.lessonCount}</td>
                <td>${workload.totalHours}</td>
                <td>${workload.totalWorkload}</td>
            </tr>
        `).join('');
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
        const modalBody = this.reviewModal.querySelector('.modal-body');
        modalBody.innerHTML = `
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

    async approveAttendance() {
        try {
            await this.updateAttendanceStatus(this.selectedAttendanceId, 'approved');
            this.closeModal();
            this.loadInitialData();
        } catch (error) {
            console.error('Error approving attendance:', error);
        }
    }

    async rejectAttendance() {
        const reason = prompt('Lý do từ chối:');
        if (reason) {
            try {
                await this.updateAttendanceStatus(this.selectedAttendanceId, 'rejected', reason);
                this.closeModal();
                this.loadInitialData();
            } catch (error) {
                console.error('Error rejecting attendance:', error);
            }
        }
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
            this.updateStatistics();
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
        return [
            {
                teacherName: 'Nguyễn Văn A',
                lessonCount: 24,
                totalHours: 48,
                totalWorkload: 96
            }
            // More workload summaries...
        ];
    }
}

// Initialize when DOM is loaded
let adminAttendance;
document.addEventListener('DOMContentLoaded', () => {
    adminAttendance = new AdminAttendanceManager();
}); 