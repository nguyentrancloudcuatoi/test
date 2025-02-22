class ScheduleManager {
    constructor() {
        this.selectedSlots = new Map();
        this.scheduleStatus = null;
        this.currentDate = new Date();
        this.durations = [30, 40, 45, 50, 60, 70, 75, 90, 120]; // Các option thời lượng
        this.timeSlots = [];
        this.selectedDuration = 45; // Mặc định 45 phút
        this.generateTimeSlotsForDuration(this.selectedDuration);
        this.initializeComponents();
        this.loadScheduleData();
    }

    initializeComponents() {
        // Initialize DOM elements
        this.scheduleGrid = document.querySelector('.slots-grid');
        this.currentWeekElement = document.getElementById('currentWeek');
        this.slotModal = document.getElementById('slotModal');
        this.submitModal = document.getElementById('scheduleSubmitModal');
        this.statusBanner = document.getElementById('scheduleStatusBanner');

        // Attach event listeners
        this.attachEventListeners();
        this.generateScheduleGrid();
        this.updateCurrentWeek();

        // Thêm dropdown chọn duration
        const durationSelect = document.createElement('select');
        durationSelect.id = 'durationSelect';
        durationSelect.innerHTML = this.durations.map(d => 
            `<option value="${d}">${d} phút</option>`
        ).join('');
        durationSelect.value = this.selectedDuration;
        
        durationSelect.addEventListener('change', (e) => {
            this.selectedDuration = parseInt(e.target.value);
            this.generateTimeSlotsForDuration(this.selectedDuration);
            this.generateScheduleGrid();
        });

        // Thêm vào DOM (điều chỉnh vị trí theo layout của bạn)
        const controlsContainer = document.querySelector('.schedule-controls');
        if (controlsContainer) {
            controlsContainer.appendChild(durationSelect);
        }
    }

    attachEventListeners() {
        // Navigation
        document.getElementById('prevWeek').addEventListener('click', () => this.navigateWeek(-1));
        document.getElementById('nextWeek').addEventListener('click', () => this.navigateWeek(1));

        // Modal events
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeModals());
        });

        // Save buttons
        document.getElementById('saveSlot').addEventListener('click', () => this.saveSlotDetails());
        document.getElementById('saveSchedule').addEventListener('click', () => this.showSubmitModal());
        document.getElementById('confirmSubmit').addEventListener('click', () => this.submitSchedule());
        
        // Ensure the cancel button is properly linked
        document.getElementById('cancelSubmit').addEventListener('click', () => this.closeModals());
    }

    generateScheduleGrid() {
        // Generate dates for next two weeks
        const dates = this.generateNextTwoWeeksDates();
        
        // Create grid HTML
        let html = `
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th>Thời gian</th>
                        ${dates.map(date => `<th>${this.formatDate(date)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        // Group time slots by period
        const periods = ["Sáng", "Chiều", "Tối"];
        
        periods.forEach(period => {
            // Add period header
            html += `
                <tr class="period-row">
                    <td colspan="${dates.length + 1}" class="period-header">${period}</td>
                </tr>
            `;

            // Add time slots for this period
            this.timeSlots
                .filter(slot => slot.period === period)
                .forEach(timeSlot => {
                    html += `
                        <tr>
                            <td>${timeSlot.time}</td>
                            ${dates.map(date => `
                                <td>
                                    <div class="schedule-slot" 
                                        data-date="${this.formatDateForData(date)}"
                                        data-time="${timeSlot.time}"
                                        onclick="scheduleManager.openSlotModal('${timeSlot.time}', '${this.formatDateForData(date)}')">
                                    </div>
                                </td>
                            `).join('')}
                        </tr>
                    `;
                });
        });

        html += '</tbody></table>';
        this.scheduleGrid.innerHTML = html;

        // Update any existing selections
        this.updateSlotDisplay();
    }

    async loadScheduleData() {
        try {
            const currentTeacher = JSON.parse(sessionStorage.getItem('currentTeacher'));
            console.log('Giáo viên hiện tại:', currentTeacher); // Kiểm tra thông tin giáo viên

            if (!currentTeacher) {
                alert('Vui lòng đăng nhập lại');
                window.location.href = '/pages/index.html'; // Chuyển hướng đến trang đăng nhập
            }

            // Load existing schedules
            const schedules = JSON.parse(localStorage.getItem('teacherSchedules') || '[]');
            console.log('Lịch hiện có:', schedules); // Kiểm tra lịch hiện có

            const teacherSchedule = schedules.find(s => 
                s.teacherId === currentTeacher.email && 
                s.status === 'pending'
            );

            if (teacherSchedule) {
                this.showStatusBanner('pending', 'Lịch của bạn đang chờ admin phê duyệt');
                // Load existing slots
                teacherSchedule.slots.forEach(slot => {
                    const key = `${slot.date}-${slot.time}`;
                    this.selectedSlots.set(key, {
                        status: slot.status,
                        note: slot.note
                    });
                });
                this.updateSlotDisplay();

                // Hiển thị thông tin lịch
                document.getElementById('scheduleInfo').textContent = `Lịch của bạn đang chờ duyệt: ${teacherSchedule.slots.length} khung giờ.`;
            } else {
                document.getElementById('scheduleInfo').textContent = 'Bạn không có lịch nào đang chờ duyệt.';
            }
        } catch (error) {
            console.error('Error loading schedule data:', error);
        }
    }

    updateSlotDisplay() {
        this.selectedSlots.forEach((value, key) => {
            const [date, time] = key.split('-');
            const slotElement = this.findSlotElement(date, time);
            if (slotElement) {
                slotElement.className = `schedule-slot ${value.status}`;
            }
        });
    }

    openSlotModal(time, date) {
        if (this.scheduleStatus === 'pending') {
            alert('Bạn đang có lịch chờ duyệt');
            return;
        }

        const slotKey = `${date}-${time}`;
        const currentSlot = this.selectedSlots.get(slotKey) || { status: '', note: '' };

        document.getElementById('slotTime').textContent = time;
        document.getElementById('slotDate').textContent = this.formatDisplayDate(date);
        
        // Reset and set current values
        document.querySelectorAll('input[name="status"]').forEach(radio => {
            radio.checked = radio.value === currentSlot.status;
        });
        document.getElementById('slotNote').value = currentSlot.note || '';

        this.slotModal.style.display = 'block';
        this.currentEditingSlot = slotKey;
    }

    formatDisplayDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    saveSlotDetails() {
        const status = document.querySelector('input[name="status"]:checked')?.value;
        const note = document.getElementById('slotNote').value;

        if (!status) {
            alert('Vui lòng chọn trạng thái khung giờ');
            return;
        }

        // Save slot data
        this.selectedSlots.set(this.currentEditingSlot, { status, note });

        // Update UI
        const [date, time] = this.currentEditingSlot.split('-');
        const slotElement = this.findSlotElement(date, time);
        if (slotElement) {
            slotElement.className = `schedule-slot ${status}`;
        }

        this.closeModals();
    }

    async submitSchedule() {
        try {
            const currentTeacher = JSON.parse(sessionStorage.getItem('currentTeacher'));
            if (!currentTeacher) {
                alert('Vui lòng đăng nhập lại');
                return;
            }

            if (this.selectedSlots.size === 0) {
                alert('Vui lòng chọn ít nhất một khung giờ');
                return;
            }

            // Thêm thông tin chi tiết của giáo viên
            const scheduleData = {
                id: Date.now().toString(),
                teacherId: currentTeacher.email,
                teacherName: currentTeacher.name,
                teacherPhone: currentTeacher.phone || '',
                teacherSubjects: currentTeacher.subjects || [],
                submitDate: new Date().toISOString(),
                note: document.getElementById('scheduleNote').value,
                status: 'pending',
                duration: this.selectedDuration, // Thêm thông tin về thời lượng
                slots: Array.from(this.selectedSlots.entries()).map(([key, value]) => {
                    const [date, time] = key.split('-');
                    return {
                        date,
                        time,
                        ...value,
                        teacherId: currentTeacher.email,
                        teacherName: currentTeacher.name
                    };
                })
            };

            // Kiểm tra xem giáo viên đã có lịch pending chưa
            const schedules = JSON.parse(localStorage.getItem('teacherSchedules') || '[]');
            const existingPendingSchedule = schedules.find(s => 
                s.teacherId === currentTeacher.email && 
                s.status === 'pending'
            );

            if (existingPendingSchedule) {
                alert('Bạn đang có lịch chờ duyệt. Vui lòng đợi admin phê duyệt trước khi đăng ký lịch mới.');
                return;
            }

            // Lưu vào localStorage
            schedules.push(scheduleData);
            localStorage.setItem('teacherSchedules', JSON.stringify(schedules));

            this.scheduleStatus = 'pending';
            this.closeModals();
            this.showStatusBanner('pending', 'Lịch của bạn đang chờ admin phê duyệt');
            
            // Thông báo thành công
            alert('Đăng ký lịch trống thành công! Vui lòng đợi admin phê duyệt.');

        } catch (error) {
            console.error('Error submitting schedule:', error);
            alert('Có lỗi xảy ra khi gửi lịch!');
        }
    }

    // Helper methods
    closeModals() {
        // Clear slot data if canceling from slot modal
        if (this.slotModal.style.display === 'block' && this.currentEditingSlot) {
            const [date, time] = this.currentEditingSlot.split('-');
            const slotElement = this.findSlotElement(date, time);
            if (slotElement) {
                // Remove the slot from selectedSlots
                this.selectedSlots.delete(this.currentEditingSlot);
                // Reset the slot's appearance
                slotElement.className = 'schedule-slot';
            }
            this.currentEditingSlot = null;
        }

        this.slotModal.style.display = 'none';
        this.submitModal.style.display = 'none';
    }

    showSubmitModal() {
        const totalSlots = this.selectedSlots.size;
        const dateRange = this.getDateRange();
        
        document.getElementById('totalSlots').textContent = totalSlots;
        document.getElementById('dateRange').textContent = dateRange;
        this.submitModal.style.display = 'block';
    }

    showStatusBanner(status, message) {
        this.statusBanner.className = `schedule-status-banner ${status}`;
        document.getElementById('statusMessage').textContent = message;
    }

    formatDate(date) {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
        });
    }

    formatDateForData(date) {
        return date.toISOString().split('T')[0];
    }

    generateNextTwoWeeksDates() {
        const dates = [];
        const today = new Date(this.currentDate);
        
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        
        return dates;
    }

    navigateWeek(direction) {
        this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        this.generateScheduleGrid();
        this.updateCurrentWeek();
    }

    updateCurrentWeek() {
        const startDate = new Date(this.currentDate);
        const endDate = new Date(this.currentDate);
        endDate.setDate(endDate.getDate() + 13);

        this.currentWeekElement.textContent = `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
    }

    getDateRange() {
        const dates = Array.from(this.selectedSlots.keys())
            .map(key => key.split('-')[0])
            .sort();
        
        if (dates.length === 0) return 'Chưa chọn ngày';
        
        return `${dates[0]} đến ${dates[dates.length - 1]}`;
    }

    findSlotElement(date, time) {
        return document.querySelector(`[data-date="${date}"][data-time="${time}"]`);
    }

    generateTimeSlotsForDuration(duration) {
        this.timeSlots = [];
        
        // Buổi sáng (7:00 - 12:00)
        let currentTime = new Date();
        currentTime.setHours(7, 0, 0);
        
        while (currentTime.getHours() < 12) {
            const startTime = currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            currentTime.setMinutes(currentTime.getMinutes() + duration);
            const endTime = currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            
            this.timeSlots.push({
                time: `${startTime} - ${endTime}`,
                period: "Sáng",
                duration: duration
            });

            // Thêm 15 phút nghỉ giữa các slot
            currentTime.setMinutes(currentTime.getMinutes() + 15);
        }

        // Buổi chiều (13:30 - 17:45)
        currentTime.setHours(13, 30, 0);
        while (currentTime.getHours() < 18) {
            const startTime = currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            currentTime.setMinutes(currentTime.getMinutes() + duration);
            const endTime = currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            
            this.timeSlots.push({
                time: `${startTime} - ${endTime}`,
                period: "Chiều",
                duration: duration
            });

            currentTime.setMinutes(currentTime.getMinutes() + 15);
        }

        // Buổi tối (18:45 - 22:00)
        currentTime.setHours(18, 45, 0);
        while (currentTime.getHours() < 22) {
            const startTime = currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            currentTime.setMinutes(currentTime.getMinutes() + duration);
            const endTime = currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            
            this.timeSlots.push({
                time: `${startTime} - ${endTime}`,
                period: "Tối",
                duration: duration
            });

            currentTime.setMinutes(currentTime.getMinutes() + 15);
        }
    }
}

// Initialize when DOM is loaded
let scheduleManager;
document.addEventListener('DOMContentLoaded', () => {
    scheduleManager = new ScheduleManager();
});

// Gọi hàm để tải dữ liệu lịch
scheduleManager.loadScheduleData();

// Hàm để phê duyệt hoặc từ chối lịch
async function handleApproval(teacherId, isApproved) {
    const reason = isApproved ? null : prompt('Lý do từ chối:');
    if (!isApproved && !reason) return;

    try {
        const schedules = JSON.parse(localStorage.getItem('teacherSchedules')) || [];
        const updatedSchedules = schedules.map(schedule => {
            if (schedule.teacherId === teacherId) {
                return { ...schedule, status: isApproved ? 'approved' : 'rejected', reason };
            }
            return schedule;
        });
        localStorage.setItem('teacherSchedules', JSON.stringify(updatedSchedules));
        alert(`Đã ${isApproved ? 'duyệt' : 'từ chối'} lịch thành công!`);
        scheduleManager.loadScheduleData(); // Tải lại dữ liệu lịch
    } catch (error) {
        console.error('Error updating schedule:', error);
    }
}

// Thêm sự kiện cho nút "Lưu" trong modal khung giờ
document.getElementById('saveSlot').addEventListener('click', function() {
    console.log('Nút "Lưu" đã được nhấn'); // Kiểm tra sự kiện
    const status = document.querySelector('input[name="status"]:checked');
    if (status) {
        const note = document.getElementById('slotNote').value;
        console.log('Trạng thái:', status.value); // Kiểm tra giá trị trạng thái
        console.log('Ghi chú:', note); // Kiểm tra ghi chú
        // Cập nhật dữ liệu khung giờ ở đây
        // ... mã cập nhật dữ liệu ...

        // Đóng modal sau khi lưu
        document.getElementById('slotModal').style.display = 'none';
    } else {
        console.error('Không có trạng thái nào được chọn'); // Thông báo lỗi
    }
});

// Thêm sự kiện cho nút "Xác nhận gửi" trong modal gửi lịch
document.getElementById('confirmSubmit').addEventListener('click', function() {
    console.log('Nút "Xác nhận gửi" đã được nhấn'); // Kiểm tra sự kiện
    const scheduleNote = document.getElementById('scheduleNote').value;
    console.log('Ghi chú lịch:', scheduleNote); // Kiểm tra ghi chú lịch
    // Xử lý gửi lịch ở đây
    // ... mã gửi lịch ...

    // Đóng modal sau khi gửi
    document.getElementById('scheduleSubmitModal').style.display = 'none';
}); 