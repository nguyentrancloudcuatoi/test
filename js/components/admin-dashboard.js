import dataManager from './data-manager.js';

class AdminDashboardManager {
    constructor() {
        this.initializeElements();
        this.loadDashboardData();
        this.attachEventListeners();
    }

    initializeElements() {
        this.approvalList = document.querySelector('.approval-list');
        this.scheduleList = document.querySelector('.schedule-list');
        this.activityTimeline = document.querySelector('.activity-timeline');
        this.activityFilter = document.getElementById('activityFilter');
    }

    attachEventListeners() {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e));
        });

        this.activityFilter.addEventListener('change', (e) => {
            this.loadActivities(e.target.value);
        });

        document.querySelector('.notifications').addEventListener('click', () => {
            this.toggleNotifications();
        });
    }

    async loadDashboardData() {
        try {
            const [approvals, schedules, activities] = await Promise.all([
                dataManager.fetchPendingApprovals(),
                dataManager.fetchScheduleUpdates(),
                dataManager.fetchRecentActivities('today')
            ]);

            this.renderApprovals(approvals);
            this.renderScheduleUpdates(schedules);
            this.renderActivities(activities);
            this.updateStats();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Không thể tải dữ liệu dashboard');
        }
    }

    renderApprovals(approvals) {
        this.approvalList.innerHTML = approvals.map(approval => `
            <div class="approval-item">
                <div class="approval-info">
                    <h4>${approval.teacher}</h4>
                    <p>${approval.class} - ${approval.date}</p>
                </div>
                <div class="approval-actions">
                    <button class="btn-approve" data-id="${approval.id}">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-reject" data-id="${approval.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderScheduleUpdates(schedules) {
        this.scheduleList.innerHTML = schedules.map(schedule => `
            <div class="schedule-item">
                <div class="schedule-info">
                    <h4>${schedule.teacher}</h4>
                    <p>Cập nhật cuối: ${schedule.lastUpdate}</p>
                </div>
                <span class="status-badge status-${schedule.status}">
                    ${this.getStatusText(schedule.status)}
                </span>
            </div>
        `).join('');
    }

    renderActivities(activities) {
        this.activityTimeline.innerHTML = activities.map(activity => `
            <div class="timeline-item">
                <div class="timeline-icon">
                    <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="timeline-content">
                    <p>${activity.description}</p>
                    <small>${activity.time} - ${activity.user}</small>
                </div>
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statusTexts = {
            pending: 'Chờ duyệt',
            outdated: 'Cần cập nhật',
            updated: 'Đã cập nhật'
        };
        return statusTexts[status] || status;
    }

    getActivityIcon(type) {
        const icons = {
            approval: 'fa-check-circle',
            schedule: 'fa-calendar-alt',
            class: 'fa-chalkboard',
            teacher: 'fa-user-tie'
        };
        return icons[type] || 'fa-circle';
    }

    async handleQuickAction(event) {
        const action = event.currentTarget.textContent.trim();
        switch(action) {
            case 'Thêm Lớp Mới':
                this.showAddClassModal();
                break;
            case 'Thêm Giáo Viên':
                this.showAddTeacherModal();
                break;
            case 'Duyệt Điểm Danh':
                this.navigateToApprovals();
                break;
            case 'Xuất Báo Cáo':
                this.exportReport();
                break;
        }
    }

    showError(message) {
        // Implement error notification
        console.error(message);
    }

    // Additional methods for handling specific actions
    showAddClassModal() {
        // Implement add class modal
    }

    showAddTeacherModal() {
        // Implement add teacher modal
    }

    navigateToApprovals() {
        // Navigate to approvals page
    }

    async exportReport() {
        // Implement report export
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboardManager();
}); 