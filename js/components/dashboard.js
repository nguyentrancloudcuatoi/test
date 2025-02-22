class DashboardManager {
    constructor() {
        this.initializeElements();
        this.loadDashboardData();
        this.attachEventListeners();
    }

    initializeElements() {
        this.activityList = document.querySelector('.activity-list');
        this.notificationList = document.querySelector('.notification-list');
        this.searchInput = document.querySelector('.search-bar input');
    }

    attachEventListeners() {
        // Notifications click handler
        document.querySelector('.notifications').addEventListener('click', () => {
            this.toggleNotifications();
        });

        // Search input handler
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    }

    async loadDashboardData() {
        try {
            // Simulate API calls
            const activities = await this.fetchRecentActivities();
            const notifications = await this.fetchNotifications();

            this.renderActivities(activities);
            this.renderNotifications(notifications);

            // Lấy thông tin giáo viên từ sessionStorage
            const currentTeacher = JSON.parse(sessionStorage.getItem('currentTeacher'));
            if (currentTeacher && currentTeacher.name) {
                // Cập nhật tên giáo viên lên giao diện
                document.getElementById('username').textContent = currentTeacher.name;
                document.getElementById('username').style.display = 'block'; // Hiển thị tên giáo viên
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async fetchRecentActivities() {
        // Simulate API call
        return [
            {
                type: 'teaching',
                title: 'Lớp Toán 10A',
                time: '2 giờ trước',
                status: 'Hoàn thành'
            },
            {
                type: 'attendance',
                title: 'Điểm danh lớp Văn 11B',
                time: '3 giờ trước',
                status: 'Chờ duyệt'
            }
            // More activities...
        ];
    }

    async fetchNotifications() {
        // Simulate API call
        return [
            {
                type: 'important',
                message: 'Cập nhật lịch trống tuần tới',
                time: '1 giờ trước'
            },
            {
                type: 'warning',
                message: 'Điểm danh chưa được duyệt',
                time: '2 giờ trước'
            }
            // More notifications...
        ];
    }

    renderActivities(activities) {
        this.activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-details">
                    <h4>${activity.title}</h4>
                    <p>${activity.time}</p>
                    <span class="status ${activity.status.toLowerCase()}">${activity.status}</span>
                </div>
            </div>
        `).join('');
    }

    renderNotifications(notifications) {
        this.notificationList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.type}">
                <div class="notification-content">
                    <p>${notification.message}</p>
                    <span>${notification.time}</span>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            teaching: 'fa-chalkboard-teacher',
            attendance: 'fa-clipboard-check'
        };
        return icons[type] || 'fa-circle';
    }

    toggleNotifications() {
        // Toggle notifications panel
    }

    handleSearch(query) {
        // Implement search functionality
    }

    updateStats(stats) {
        // Update dashboard statistics
    }
}

// Giả sử bạn có một hàm để lấy thông tin người dùng
function displayTeacherName(teacherName) {
    const usernameElement = document.getElementById('username');
    usernameElement.textContent = teacherName; // Cập nhật tên giáo viên
    usernameElement.style.display = 'block'; // Hiển thị phần tử
}

// Gọi hàm này với tên giáo viên khi dữ liệu đã được tải
const teacherName = "Tên Giáo Viên"; // Thay thế bằng dữ liệu thực tế
displayTeacherName(teacherName); 