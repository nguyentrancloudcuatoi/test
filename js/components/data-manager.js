class DataManager {
    constructor() {
        this.approvals = [];
        this.schedules = [];
        this.activities = [];
    }

    async fetchPendingApprovals() {
        // Giả lập việc lấy dữ liệu từ API
        return this.approvals;
    }

    async fetchScheduleUpdates() {
        // Giả lập việc lấy dữ liệu từ API
        return this.schedules;
    }

    async fetchRecentActivities(filter) {
        // Giả lập việc lấy dữ liệu từ API
        return this.activities;
    }

    setApprovals(data) {
        this.approvals = data;
    }

    setSchedules(data) {
        this.schedules = data;
    }

    setActivities(data) {
        this.activities = data;
    }
}

const dataManager = new DataManager();
export default dataManager; 