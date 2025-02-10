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
        return [
            {
                teacherId: 1,
                teacherName: 'Nguyễn Văn A',
                lastUpdate: '2024-03-15',
                availableSlots: 12,
                status: 'updated'
            },
            // More schedules...
        ];
    }

    populateTeacherFilter(teachers) {
        const options = teachers.map(teacher => 
            `<option value="${teacher.id}">${teacher.name}</option>`
        );
        this.teacherFilter.innerHTML += options.join('');
    }

    renderScheduleList(schedules) {
        this.scheduleList.innerHTML = schedules.map(schedule => `
            <div class="schedule-item">
                <div class="teacher-info">
                    <img src="../../assets/images/avatars/${schedule.teacherId}.jpg" 
                         alt="${schedule.teacherName}"
                         class="teacher-avatar">
                    <span class="teacher-name">${schedule.teacherName}</span>
                </div>
                <div>${this.formatDate(schedule.lastUpdate)}</div>
                <div>${schedule.availableSlots} slots</div>
                <div>
                    <span class="status-badge status-${schedule.status}">
                        ${this.getStatusText(schedule.status)}
                    </span>
                </div>
                <div class="action-buttons">
                    <button class="btn-view" onclick="adminSchedule.viewScheduleDetail(${schedule.teacherId})">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    ${schedule.status === 'outdated' ? `
                        <button class="btn-remind" onclick="adminSchedule.sendReminder(${schedule.teacherId})">
                            <i class="fas fa-bell"></i> Nhắc nhở
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
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

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    getStatusText(status) {
        const statusTexts = {
            updated: 'Đã cập nhật',
            outdated: 'Chưa cập nhật'
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
}

// Initialize when DOM is loaded
let adminSchedule;
document.addEventListener('DOMContentLoaded', () => {
    adminSchedule = new AdminScheduleManager();
}); 