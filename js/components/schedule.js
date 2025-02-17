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
        this.scheduleList = document.getElementById("teacherScheduleList"); // Giả sử bạn có bảng này trong HTML
        
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
            const scheduleData = await this.fetchScheduleData();
            this.renderSchedule(scheduleData);
        } catch (error) {
            console.error('Error loading schedule:', error);
            alert('Không thể tải lịch. Vui lòng thử lại sau.');
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
        for (let hour = 6; hour <= 23; hour++) {
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
        
        // Thêm hàng trống giữa cột thời gian và cột ngày
        const emptyRow = document.createElement('div');
        emptyRow.className = 'empty-row'; // Thêm class để có thể định dạng nếu cần
        this.scheduleGrid.insertAdjacentElement('afterbegin', emptyRow);
        
        this.renderScheduleSlots(data);
        this.updateCurrentWeek();
    }

    renderTimeSlots(timeSlots) {
        const timeSlotsContainer = document.querySelector('.time-slots');
        timeSlotsContainer.innerHTML = ''; // Clear previous slots

        // Thêm chữ "Time" ở đầu cột thời gian
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-slot';
        timeLabel.textContent = 'Time'; // Thêm chữ "Time"
        timeSlotsContainer.appendChild(timeLabel);

        timeSlots.forEach(time => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = time;
            timeSlotsContainer.appendChild(slot);
        });
    }

    renderDaysHeader() {
        const daysHeader = document.querySelector('.days-header');
        daysHeader.innerHTML = ''; // Clear previous headers
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
        const totalSlots = data.timeSlots.length * 7; // 7 ngày trong tuần

        for (let day = 0; day < 7; day++) {
            for (let time = 1; time < data.timeSlots.length; time++) {
                const slotIndex = day * data.timeSlots.length + time; // Tính chỉ số ô
                const slot = document.createElement('div');
                slot.className = 'schedule-slot';
                slot.style.gridRowStart = time + 1; // Đặt hàng cho ô
                slot.style.gridColumnStart = day + 1; // Đặt cột cho ô
                slot.addEventListener('click', () => this.openSlotModal(slotIndex));
                this.scheduleGrid.appendChild(slot);
            }
        }
    }

    openSlotModal(slotTime, slotDate) {
        document.getElementById("slotTime").textContent = slotTime;
        document.getElementById("slotDate").textContent = slotDate;
        this.modal.style.display = "block";
    }

    getTimeSlotFromIndex(index) {
        // Calculate time and date from slot index
        return {
            time: '8:00',
            date: '20/03/2024'
        };
    }

    closeModal() {
        this.modal.style.display = "none";
        document.getElementById('slotNote').value = ''; // Xóa ghi chú khi đóng modal
        const checkedStatus = document.querySelector('input[name="status"]:checked');
        if (checkedStatus) {
            checkedStatus.checked = false; // Bỏ chọn trạng thái
        }
    }

    async saveSlotDetails() {
        const status = document.querySelector('input[name="status"]:checked');
        const note = document.getElementById('slotNote').value;

        if (!status) {
            alert('Vui lòng chọn trạng thái.');
            return;
        }

        const slotData = {
            time: document.getElementById("slotTime").textContent,
            date: document.getElementById("slotDate").textContent,
            status: status.value,
            note: note
        };

        try {
            await this.saveSlotData(slotData); // Gọi hàm để lưu thông tin khung giờ
            alert('Đã lưu thông tin khung giờ thành công!');
            this.addSlotToTable(slotData); // Thêm thông tin vào bảng
            this.closeModal();
        } catch (error) {
            console.error('Error saving slot details:', error);
            alert('Không thể lưu thông tin khung giờ. Vui lòng thử lại.');
        }
    }

    async saveSlotData(slotData) {
        // Giả lập lưu dữ liệu (có thể thay thế bằng API thực tế)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('Slot data saved:', slotData); // In ra dữ liệu đã lưu
                resolve();
            }, 1000);
        });
    }

    addSlotToTable(slotData) {
        const slotRow = document.createElement('div');
        slotRow.className = 'schedule-item'; // Thêm class cho dòng mới

        // Tạo nội dung cho dòng mới
        slotRow.innerHTML = `
            <div class="slot-info">
                <span>Thời gian: ${slotData.time}</span>
                <span>Ngày: ${slotData.date}</span>
                <span>Trạng thái: ${slotData.status}</span>
                <span>Ghi chú: ${slotData.note}</span>
            </div>
        `;

        // Thêm dòng mới vào bảng
        this.scheduleList.appendChild(slotRow);
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
            alert('Không thể lưu lịch. Vui lòng thử lại.');
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
    saveSlotButton.addEventListener("click", async () => {
        const status = document.querySelector('input[name="status"]:checked');
        if (!status) {
            alert('Vui lòng chọn trạng thái.');
            return;
        }
        const note = document.getElementById('slotNote').value;

        try {
            await saveSlotDetails(); // Giả sử bạn có hàm này để lưu thông tin
            alert('Đã lưu thông tin khung giờ thành công!');
            slotModal.style.display = "none";
            loadScheduleData(); // Cập nhật lại lịch
        } catch (error) {
            console.error('Error saving slot details:', error);
            alert('Không thể lưu thông tin khung giờ. Vui lòng thử lại.');
        }
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