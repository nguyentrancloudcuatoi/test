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
        const schedules = await this.fetchSchedules();
        this.renderScheduleList(schedules);
        this.updateStatistics(schedules);
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
        try {
            // Lấy dữ liệu từ localStorage
            const schedules = JSON.parse(localStorage.getItem('teacherSchedules')) || [];
            if (!schedules.length) {
                console.warn('No schedules found in localStorage.');
            }
            
            // Nhóm các lịch theo giáo viên
            const teacherSchedules = schedules.reduce((acc, schedule) => {
                if (!acc[schedule.teacherId]) {
                    acc[schedule.teacherId] = {
                        teacherId: schedule.teacherId,
                        teacherName: schedule.teacherName,
                        lastUpdate: schedule.lastUpdate,
                        availableSlots: 0,
                        approvalStatus: schedule.approvalStatus
                    };
                }
                acc[schedule.teacherId].availableSlots++;
                return acc;
            }, {});

            return Object.values(teacherSchedules);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            return [];
        }
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

        console.log('Applying filters:', filters); // Debugging line

        try {
            const filteredSchedules = await this.fetchFilteredSchedules(filters);
            if (!filteredSchedules.length) {
                console.warn('No filtered schedules found.');
            }
            this.renderScheduleList(filteredSchedules);
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }

    async viewScheduleDetail(teacherId) {
        console.log(`Viewing schedule for teacher ID: ${teacherId}`);
        try {
            const schedules = JSON.parse(localStorage.getItem('teacherSchedules')) || [];
            console.log('Schedules:', schedules); // Kiểm tra dữ liệu
            const scheduleDetail = schedules.find(schedule => schedule.teacherId === teacherId);
            
            if (!scheduleDetail) {
                throw new Error('Không tìm thấy thông tin lịch');
            }

            this.showScheduleDetailModal(scheduleDetail);
        } catch (error) {
            console.error('Error loading schedule detail:', error);
            alert('Có lỗi xảy ra khi tải thông tin chi tiết!');
        }
    }

    showScheduleDetailModal(scheduleDetail) {
        this.modal.style.display = 'block';
        
        // Tạo nội dung chi tiết cho modal
        this.modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="adminSchedule.closeModal()">&times;</span>
                <h2>Chi tiết lịch trống</h2>
                <div class="schedule-detail-info">
                    <p><strong>Giáo viên:</strong> ${scheduleDetail.teacherName}</p>
                    <p><strong>Cập nhật cuối:</strong> ${this.formatDate(scheduleDetail.lastUpdate)}</p>
                    <p><strong>Số slot trống:</strong> ${scheduleDetail.availableSlots} slots</p>
                    <p><strong>Trạng thái:</strong> 
                        <span class="status-badge status-${scheduleDetail.approvalStatus}">
                            ${this.getApprovalStatusText(scheduleDetail.approvalStatus)}
                        </span>
                    </p>
                </div>
                <div class="action-buttons">
                    <button class="btn-close" onclick="adminSchedule.closeModal()">
                        <i class="fas fa-times"></i> Đóng
                    </button>
                </div>
            </div>
        `;
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
            alert('Xuất báo cáo thành công!');
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Có lỗi xảy ra khi xuất báo cáo!');
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

    async loadScheduleData() {
        try {
            const schedules = await this.fetchSchedules();
            this.renderScheduleList(schedules);
            this.updateStatistics(schedules);
        } catch (error) {
            console.error('Error loading schedule data:', error);
        }
    }

    async approveSchedule(teacherId) {
        try {
            // Gọi API để cập nhật trạng thái
            const response = await fetch(`/api/schedule/approve/${teacherId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to approve schedule');
            }

            // Cập nhật trong localStorage
            const schedules = JSON.parse(localStorage.getItem('teacherSchedules')) || [];
            const updatedSchedules = schedules.map(schedule => {
                if (schedule.teacherId === teacherId) {
                    return { ...schedule, approvalStatus: 'approved' };
                }
                return schedule;
            });
            localStorage.setItem('teacherSchedules', JSON.stringify(updatedSchedules));

            // Cập nhật UI ngay lập tức
            const scheduleItem = this.scheduleList.querySelector(`[data-teacher-id="${teacherId}"]`);
            if (scheduleItem) {
                const statusBadge = scheduleItem.querySelector('.status-badge');
                statusBadge.className = 'status-badge status-approved';
                statusBadge.textContent = 'Đã duyệt';
            }

            alert('Đã duyệt lịch trống thành công!');
        } catch (error) {
            console.error('Error approving schedule:', error);
            alert('Có lỗi xảy ra khi duyệt lịch!');
        }
    }

    async rejectSchedule(teacherId) {
        const reason = prompt('Lý do từ chối:');
        if (reason) {
            try {
                // Gọi API để cập nhật trạng thái
                const response = await fetch(`/api/schedule/reject/${teacherId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reason })
                });

                if (!response.ok) {
                    throw new Error('Failed to reject schedule');
                }

                // Cập nhật trong localStorage
                const schedules = JSON.parse(localStorage.getItem('teacherSchedules')) || [];
                const updatedSchedules = schedules.map(schedule => {
                    if (schedule.teacherId === teacherId) {
                        return { ...schedule, approvalStatus: 'rejected' };
                    }
                    return schedule;
                });
                localStorage.setItem('teacherSchedules', JSON.stringify(updatedSchedules));

                // Cập nhật UI ngay lập tức
                const scheduleItem = this.scheduleList.querySelector(`[data-teacher-id="${teacherId}"]`);
                if (scheduleItem) {
                    const statusBadge = scheduleItem.querySelector('.status-badge');
                    statusBadge.className = 'status-badge status-rejected';
                    statusBadge.textContent = 'Đã từ chối';
                }

                alert('Đã từ chối lịch trống!');
            } catch (error) {
                console.error('Error rejecting schedule:', error);
                alert('Có lỗi xảy ra khi từ chối lịch!');
            }
        }
    }

    async prepareExportData() {
        try {
            const schedules = await this.fetchSchedules();
            
            // Chuẩn bị dữ liệu cho Excel
            const exportData = [
                ['Giáo viên', 'Cập nhật cuối', 'Số slot trống', 'Trạng thái'], // Header
                ...schedules.map(schedule => [
                    schedule.teacherName,
                    this.formatDate(schedule.lastUpdate),
                    schedule.availableSlots,
                    this.getApprovalStatusText(schedule.approvalStatus)
                ])
            ];
            
            return exportData;
        } catch (error) {
            console.error('Error preparing export data:', error);
            throw error;
        }
    }

    downloadExcelFile(data) {
        try {
            // Tạo workbook mới
            const wb = XLSX.utils.book_new();
            
            // Tạo worksheet từ dữ liệu
            const ws = XLSX.utils.aoa_to_sheet(data);
            
            // Định dạng độ rộng cột
            const colWidths = [
                {wch: 30}, // Tên giáo viên
                {wch: 15}, // Ngày cập nhật
                {wch: 15}, // Số slot
                {wch: 15}, // Trạng thái
            ];
            ws['!cols'] = colWidths;

            // Thêm worksheet vào workbook
            XLSX.utils.book_append_sheet(wb, ws, "Lịch trống giáo viên");

            // Tạo tên file với timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `lich_trong_giao_vien_${timestamp}.xlsx`;

            // Xuất file
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error('Error downloading Excel file:', error);
            alert('Có lỗi xảy ra khi tải xuống file Excel!');
        }
    }
}

// Initialize when DOM is loaded
let adminSchedule;
document.addEventListener('DOMContentLoaded', () => {
    adminSchedule = new AdminScheduleManager();
}); 