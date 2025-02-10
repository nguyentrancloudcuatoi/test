class ScheduleManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadScheduleData();
        this.checkLastUpdate();
    }

    initializeElements() {
        this.scheduleGrid = document.querySelector('.slots-grid');
        this.currentWeekElement = document.getElementById('currentWeek');
        this.modal = document.getElementById('slotModal');
        this.notificationPanel = document.getElementById('notificationPanel');
        
        // Current date tracking
        this.currentDate = new Date();
        this.selectedSlot = null;
    }

    attachEventListeners() {
        // Navigation
        document.getElementById('prevWeek').addEventListener('click', () => this.navigateWeek(-1));
        document.getElementById('nextWeek').addEventListener('click', () => this.navigateWeek(1));

        // View options
        document.querySelectorAll('.view-options button').forEach(button => {
            button.addEventListener('click', (e) => this.changeView(e.target.dataset.view));
        });

        // Save schedule
        document.getElementById('saveSchedule').addEventListener('click', () => this.saveSchedule());

        // Modal events
        document.querySelector('.modal .close').addEventListener('click', () => this.closeModal());
        document.getElementById('saveSlot').addEventListener('click', () => this.saveSlotDetails());
        document.getElementById('cancelSlot').addEventListener('click', () => this.closeModal());

        // Close notification
        document.querySelector('.close-notification').addEventListener('click', () => {
            this.notificationPanel.style.display = 'none';
        });
    }

    async loadScheduleData() {
        try {
            // Simulate API call to get schedule data
            const scheduleData = await this.fetchScheduleData();
            this.renderSchedule(scheduleData);
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    }

    async fetchScheduleData() {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    timeSlots: this.generateTimeSlots(),
                    schedule: this.generateMockSchedule()
                });
            }, 500);
        });
    }

    generateTimeSlots() {
        const slots = [];
        for (let hour = 7; hour <= 21; hour++) {
            slots.push(`${hour}:00`);
        }
        return slots;
    }

    generateMockSchedule() {
        // Generate mock schedule data
        return [];
    }

    renderSchedule(data) {
        this.renderTimeSlots(data.timeSlots);
        this.renderDaysHeader();
        this.renderScheduleSlots(data);
        this.updateCurrentWeek();
    }

    renderTimeSlots(timeSlots) {
        const timeSlotsContainer = document.querySelector('.time-slots');
        timeSlots.forEach(time => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = time;
            timeSlotsContainer.appendChild(slot);
        });
    }

    renderDaysHeader() {
        const daysHeader = document.querySelector('.days-header');
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        
        days.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'day-header';
            dayElement.textContent = day;
            daysHeader.appendChild(dayElement);
        });
    }

    renderScheduleSlots(data) {
        this.scheduleGrid.innerHTML = '';
        const totalSlots = data.timeSlots.length * 7;

        for (let i = 0; i < totalSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'schedule-slot';
            slot.addEventListener('click', () => this.openSlotModal(i));
            this.scheduleGrid.appendChild(slot);
        }
    }

    openSlotModal(slotIndex) {
        this.selectedSlot = slotIndex;
        this.modal.style.display = 'block';
        
        // Populate modal with slot details
        const timeSlot = this.getTimeSlotFromIndex(slotIndex);
        document.getElementById('slotTime').textContent = timeSlot.time;
        
        // Định dạng ngày tháng
        const formattedDate = this.formatDate(timeSlot.date);
        document.getElementById('slotDate').textContent = formattedDate;
    }

    getTimeSlotFromIndex(index) {
        // Calculate time and date from slot index
        return {
            time: '8:00',
            date: '20/03/2024'
        };
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.selectedSlot = null;
    }

    async saveSlotDetails() {
        if (!this.selectedSlot) return;

        const status = document.querySelector('input[name="status"]:checked').value;
        const note = document.getElementById('slotNote').value;

        try {
            await this.updateSlotStatus(this.selectedSlot, status, note);
            this.closeModal();
            this.loadScheduleData(); // Refresh schedule
        } catch (error) {
            console.error('Error saving slot details:', error);
        }
    }

    async updateSlotStatus(slotIndex, status, note) {
        // Simulate API call to update slot status
        return new Promise(resolve => {
            setTimeout(resolve, 500);
        });
    }

    navigateWeek(direction) {
        this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        this.updateCurrentWeek();
        this.loadScheduleData();
    }

    updateCurrentWeek() {
        // Update week display
        const startOfWeek = new Date(this.currentDate);
        startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        this.currentWeekElement.textContent = `Tuần ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
    }

    changeView(view) {
        // Update active button
        document.querySelectorAll('.view-options button').forEach(button => {
            button.classList.toggle('active', button.dataset.view === view);
        });

        // Implement view change logic
        if (view === 'month') {
            // Switch to month view
        } else {
            // Switch to week view
        }
    }

    checkLastUpdate() {
        // Check last update date and show notification if needed
        const lastUpdate = localStorage.getItem('lastScheduleUpdate');
        if (!lastUpdate || this.isDaysAgo(new Date(lastUpdate), 30)) {
            this.showUpdateReminder();
        }
    }

    isDaysAgo(date, days) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= days;
    }

    showUpdateReminder() {
        this.notificationPanel.style.display = 'block';
    }

    async saveSchedule() {
        try {
            // Save all schedule changes
            await this.saveScheduleToServer();
            localStorage.setItem('lastScheduleUpdate', new Date().toISOString());
            this.notificationPanel.style.display = 'none';
        } catch (error) {
            console.error('Error saving schedule:', error);
        }
    }

    async saveScheduleToServer() {
        // Simulate API call to save schedule
        return new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
    }

    // Hàm định dạng ngày
    formatDate(dateString) {
        const dateParts = dateString.split('/');
        const day = dateParts[0];
        const month = dateParts[1];
        const year = dateParts[2];
        return `${day}/${month}/${year}`; // Hoặc định dạng khác nếu cần
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScheduleManager();
});

document.addEventListener("DOMContentLoaded", () => {
    const slotModal = document.getElementById("slotModal");
    const saveSlotButton = document.getElementById("saveSlot");
    const cancelSlotButton = document.getElementById("cancelSlot");

    // Hàm mở modal
    function openSlotModal(slotTime, slotDate) {
        document.getElementById("slotTime").textContent = slotTime;
        document.getElementById("slotDate").textContent = slotDate;
        slotModal.style.display = "block";
    }

    // Hàm lưu thông tin khung giờ
    saveSlotButton.addEventListener("click", () => {
        const status = document.querySelector('input[name="status"]:checked').value;
        const note = document.getElementById("slotNote").value;

        // Xử lý lưu thông tin khung giờ ở đây (gửi đến server hoặc lưu vào biến)
        console.log("Thời gian:", document.getElementById("slotTime").textContent);
        console.log("Ngày:", document.getElementById("slotDate").textContent);
        console.log("Trạng thái:", status);
        console.log("Ghi chú:", note);

        // Đóng modal sau khi lưu
        slotModal.style.display = "none";
    });

    // Hàm hủy
    cancelSlotButton.addEventListener("click", () => {
        slotModal.style.display = "none";
    });

    // Đóng modal khi nhấn vào dấu 'x'
    slotModal.querySelector(".close").addEventListener("click", () => {
        slotModal.style.display = "none";
    });
}); 