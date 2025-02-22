class DashboardManager {
    constructor() {
        this.initializeElements();
        this.loadDashboardData();
        this.attachEventListeners();
        this.initTestNotifications();
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

            // Lấy thông báo từ localStorage
            const localStorageNotifications = JSON.parse(localStorage.getItem('teacherNotifications')) || [];
            
            // Kết hợp thông báo từ API và localStorage
            const allNotifications = [
                ...notifications,
                ...localStorageNotifications
            ];

            // Render tất cả thông báo
            this.renderNotifications(allNotifications);

            // Hiển thị thông báo
            this.displayNotifications();
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
        // Simulate API call với nhiều thông báo hơn
        return [
            {
                type: 'important',
                message: 'Cập nhật lịch trống tuần tới',
                date: new Date().toISOString(),
                time: '1 giờ trước'
            },
            {
                type: 'warning',
                message: 'Điểm danh chưa được duyệt',
                date: new Date().toISOString(),
                time: '2 giờ trước'
            },
            {
                type: 'info',
                message: 'Lịch họp hội đồng giáo viên',
                date: new Date().toISOString(),
                time: '3 giờ trước'
            }
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
        if (!this.notificationList) return;
        
        this.notificationList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.type} custom-notification">
                <div class="notification-content">
                    <p>${notification.message}</p>
                    <span>${notification.time || new Date(notification.date).toLocaleString()}</span>
                </div>
            </div>
        `).join('');

        // Cập nhật số lượng thông báo chưa đọc
        const unreadCount = notifications.length;
        const badge = document.querySelector('.notifications .badge');
        if (badge) {
            badge.textContent = unreadCount;
        }
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

    displayNotifications() {
        const notificationList = document.querySelector('.notification-list');
        const notifications = JSON.parse(localStorage.getItem('teacherNotifications')) || [];

        notificationList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.type} custom-notification">
                <p>${notification.message}</p>
                <span>${new Date(notification.date).toLocaleString()}</span>
            </div>
        `).join('');
    }

    initTestNotifications() {
        const testNotifications = [
            {
                type: 'important',
                message: 'Thông báo test từ localStorage',
                date: new Date().toISOString()
            }
        ];
        localStorage.setItem('teacherNotifications', JSON.stringify(testNotifications));
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