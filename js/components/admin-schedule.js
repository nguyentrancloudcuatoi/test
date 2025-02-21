class AdminScheduleManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialData();
    }

    initializeElements() {
        this.teacherFilter = document.getElementById('teacherFilter');
        this.dateFilter = document.getElementById('dateFilter');
        this.timeSlotFilter = document.getElementById('timeSlotFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.scheduleList = document.getElementById('teacherScheduleList');
        this.modal = document.getElementById('scheduleDetailModal');
    }

    attachEventListeners() {
        // Filter event listeners
        this.teacherFilter.addEventListener('change', () => this.applyFilters());
        this.dateFilter.addEventListener('change', () => this.applyFilters());
        this.timeSlotFilter.addEventListener('change', () => this.applyFilters());
        this.statusFilter.addEventListener('change', () => this.applyFilters());

        // Export button
        document.getElementById('exportData').addEventListener('click', () => this.exportScheduleData());

        // Modal close button
        document.querySelector('.modal .close').addEventListener('click', () => this.closeModal());
    }

    async loadInitialData() {
        try {
            const [teachers, schedules] = await Promise.all([
                this.fetchTeachers(),
                this.fetchSchedules()
            ]);

            this.populateTeacherFilter(teachers);
            this.renderScheduleList(schedules);
            this.updateStatistics(schedules);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async fetchTeachers() {
        // Simulate API call
        return [
            { id: 1, name: 'Nguyễn Văn A' },
            { id: 2, name: 'Trần Thị B' },
            // More teachers...
        ];
    }

    async fetchSchedules() {
        // Simulate API call
        const sampleSchedules = [
            {
                teacherId: 1,
                teacherName: "Nguyễn Văn A",
                lastUpdate: "2024-03-15",
                availableSlots: 12,
                approvalStatus: "pending"
            },
            // Thêm các mẫu khác...
        ];
        return sampleSchedules;
    }

    populateTeacherFilter(teachers) {
        const options = teachers.map(teacher => 
            `<option value="${teacher.id}">${teacher.name}</option>`
        );
        this.teacherFilter.innerHTML += options.join('');
    }
    renderScheduleList(schedules) {
        this.scheduleList.innerHTML = `
            <style>
                .action-buttons {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    white-space: nowrap;
                }
                .action-buttons button {
                    padding: 6px 12px;
                    font-size: 14px;
                    min-width: 80px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                }
                .action-buttons i {
                    font-size: 12px;
                }
                .teacher-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .teacher-info .teacher-name {
                    font-weight: 500;
                    color: #2c3e50;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 200px;
                }
            </style>
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th>Giáo viên</th>
                        <th>Cập nhật cuối</th>
                        <th>Số slot trống</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
${schedules.map(schedule => `
                        <tr class="schedule-row" data-teacher-id="${schedule.teacherId}">
                            <td class="teacher-info">
                                <span class="teacher-name">${schedule.teacherName}</span>
                            </td>
                            <td>${this.formatDate(schedule.lastUpdate)}</td>
                            <td>${schedule.availableSlots} slots</td>
                            <td>
                                <span class="status-badge status-${schedule.approvalStatus}">
                                    ${this.getApprovalStatusText(schedule.approvalStatus)}
                                </span>
                            </td>
                            <td class="action-buttons">
                                <button class="btn-view" onclick="adminSchedule.viewScheduleDetail(${schedule.teacherId})">
                                    <i class="fas fa-eye"></i> Xem
                                </button>
                                ${schedule.approvalStatus === 'pending' ? `
                                    <button class="btn-approve" onclick="adminSchedule.approveSchedule(${schedule.teacherId})">
                                        <i class="fas fa-check"></i> Duyệt
                                    </button>
                                    <button class="btn-reject" onclick="adminSchedule.rejectSchedule(${schedule.teacherId})">
                                        <i class="fas fa-times"></i> Từ chối
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    updateStatistics(schedules) {
        const outdated = schedules.filter(s => s.status === 'outdated').length;
        const updated = schedules.filter(s => s.status === 'updated').length;
        const totalSlots = schedules.reduce((sum, s) => sum + s.availableSlots, 0);

        document.getElementById('outdatedCount').textContent = outdated;
        document.getElementById('updatedCount').textContent = updated;
        document.getElementById('availableSlots').textContent = totalSlots;
    }

    async applyFilters() {
        const filters = {
            teacherId: this.teacherFilter.value,
            date: this.dateFilter.value,
            timeSlot: this.timeSlotFilter.value,
            status: this.statusFilter.value
        };

        try {
            const filteredSchedules = await this.fetchFilteredSchedules(filters);
            this.renderScheduleList(filteredSchedules);
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }

    async viewScheduleDetail(teacherId) {
        try {
            const scheduleDetail = await this.fetchTeacherScheduleDetail(teacherId);
            this.showScheduleDetailModal(scheduleDetail);
        } catch (error) {
            console.error('Error loading schedule detail:', error);
        }
    }

    async sendReminder(teacherId) {
        try {
            await this.sendReminderNotification(teacherId);
            alert('Đã gửi nhắc nhở thành công!');
        } catch (error) {
            console.error('Error sending reminder:', error);
        }
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('vi-VN');
    }

    getApprovalStatusText(status) {
        const statusTexts = {
            'pending': 'Chờ duyệt',
            'approved': 'Đã duyệt',
            'rejected': 'Đã từ chối'
        };
        return statusTexts[status] || status;
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    async exportScheduleData() {
        try {
            const data = await this.prepareExportData();
            this.downloadExcelFile(data);
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    }

    async loadPendingSchedules() {
        try {
            const response = await fetch('/api/schedule/pending');
            const schedules = await response.json();
            this.renderScheduleList(schedules);
        } catch (error) {
            console.error('Error loading pending schedules:', error);
        }
    }

    async approveSchedule(teacherId) {
        try {
            // Cập nhật UI trước
            const scheduleItem = this.scheduleList.querySelector(`[data-teacher-id="${teacherId}"]`);
            if (scheduleItem) {
                const statusBadge = scheduleItem.querySelector('.status-badge');
                const actionButtons = scheduleItem.querySelector('.action-buttons');
                
                statusBadge.className = 'status-badge status-approved';
                statusBadge.textContent = 'Đã duyệt';
                
                // Ẩn nút duyệt và từ chối
                actionButtons.innerHTML = `
                    <button class="btn-view" onclick="adminSchedule.viewScheduleDetail(${teacherId})">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                `;
            }

            // Gọi API để cập nhật trạng thái
            await fetch(`/api/schedule/approve/${teacherId}`, {
                method: 'POST'
            });
            
            alert('Đã duyệt lịch trống thành công!');
        } catch (error) {
            console.error('Error approving schedule:', error);
            alert('Có lỗi xảy ra khi duyệt lịch!');
            // Reload lại dữ liệu nếu có lỗi
            await this.loadScheduleData();
        }
    }

    async rejectSchedule(teacherId) {
        const reason = prompt('Lý do từ chối:');
        if (reason) {
            try {
                // Cập nhật UI trước
                const scheduleItem = this.scheduleList.querySelector(`[data-teacher-id="${teacherId}"]`);
                if (scheduleItem) {
                    const statusBadge = scheduleItem.querySelector('.status-badge');
                    const actionButtons = scheduleItem.querySelector('.action-buttons');
                    
                    statusBadge.className = 'status-badge status-rejected';
                    statusBadge.textContent = 'Đã từ chối';
                    
                    // Ẩn nút duyệt và từ chối
                    actionButtons.innerHTML = `
                        <button class="btn-view" onclick="adminSchedule.viewScheduleDetail(${teacherId})">
                            <i class="fas fa-eye"></i> Xem
                        </button>
                    `;
                }

                // Gọi API để cập nhật trạng thái
                await fetch(`/api/schedule/reject/${teacherId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reason })
                });

                alert('Đã từ chối lịch trống!');
            } catch (error) {
                console.error('Error rejecting schedule:', error);
                alert('Có lỗi xảy ra khi từ chối lịch!');
                // Reload lại dữ liệu nếu có lỗi
                await this.loadScheduleData();
            }
        }
    }
}

// Initialize when DOM is loaded
let adminSchedule;
document.addEventListener('DOMContentLoaded', () => {
    adminSchedule = new AdminScheduleManager();
}); 