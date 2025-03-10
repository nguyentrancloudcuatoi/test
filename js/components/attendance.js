class AttendanceManager {
    constructor() {
        this.studentList = document.getElementById("studentList");
        this.saveDraftButton = document.getElementById("saveDraft");
        this.submitAttendanceButton = document.getElementById("submitAttendance");
        this.confirmModal = document.getElementById("confirmModal");
        this.init();
    }

    init() {
        this.saveDraftButton.addEventListener("click", () => this.saveDraft());
        this.submitAttendanceButton.addEventListener("click", () => this.showConfirmModal());
        this.confirmModal.querySelector("#confirmSubmit").addEventListener("click", () => this.submitAttendance());
        this.confirmModal.querySelector("#cancelSubmit").addEventListener("click", () => this.hideConfirmModal());
    }

    async saveDraft() {
        try {
            const formData = this.collectFormData();
            await this.saveAttendanceDraft(formData);
            alert('Đã lưu nháp thành công!');
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Có lỗi xảy ra khi lưu nháp!');
        }
    }

    showConfirmModal() {
        this.confirmModal.style.display = 'block';
    }

    hideConfirmModal() {
        this.confirmModal.style.display = 'none';
    }

    async submitAttendance() {
        try {
            const formData = new FormData(document.getElementById('attendanceForm'));
            
            // Lấy thông tin giáo viên từ session storage
            const currentTeacher = JSON.parse(sessionStorage.getItem('currentTeacher'));
            if (!currentTeacher) {
                throw new Error('Không tìm thấy thông tin giáo viên');
            }

            const attendanceRecord = {
                id: Date.now().toString(),
                teacherId: currentTeacher.email,
                teacherName: currentTeacher.name,
                classCode: formData.get('classCode'),
                vietnameseTime: new Date().toLocaleString('vi-VN'),
                teachingMethod: formData.get('teachingMethod'),
                session: formData.get('session'),
                duration: formData.get('duration'),
                students: this.getStudentAttendance(),
                note: formData.get('note'),
                status: 'pending',
                timestamp: new Date().toISOString()
            };

            // Lưu vào localStorage
            const existingRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
            existingRecords.push(attendanceRecord);
            localStorage.setItem('attendanceRecords', JSON.stringify(existingRecords));

            this.hideConfirmModal();
            alert('Đã gửi điểm danh thành công!');
            window.location.href = '/pages/attendance/check-attendance.html';
        } catch (error) {
            console.error('Error submitting attendance:', error);
            alert('Có lỗi xảy ra khi gửi điểm danh!');
        }
    }

    getStudentAttendance() {
        const studentItems = document.querySelectorAll('.student-item');
        return Array.from(studentItems).map(item => {
            const studentName = item.querySelector('.student-info span').textContent;
            const status = item.querySelector('input[type="radio"]:checked').value;
            const note = item.querySelector('input[type="text"]').value;
            return { name: studentName, status, note };
        });
    }

    collectFormData() {
        // Collect data from the form
        const formData = new FormData(document.getElementById("attendanceForm"));
        return formData;
    }

    async loadInitialData() {
        try {
            const classes = await this.fetchTeacherClasses();
            this.populateClassSelect(classes);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async handleClassChange() {
        const classId = this.classSelect.value;
        if (!classId) return;

        try {
            const [lessons, students] = await Promise.all([
                this.fetchClassLessons(classId),
                this.fetchClassStudents(classId)
            ]);

            this.populateLessonSelect(lessons);
            this.renderStudentList(students);
        } catch (error) {
            console.error('Error loading class data:', error);
        }
    }

    renderStudentList(students) {
        this.studentList.innerHTML = students.map(student => `
            <div class="student-item">
                <div class="student-info">
                    <img src="../../assets/images/avatars/${student.id}.jpg" 
                         alt="${student.name}"
                         class="student-avatar">
                    <span>${student.name}</span>
                </div>
                <div class="attendance-status">
                    <label class="status-radio">
                        <input type="radio" name="status_${student.id}" value="present" required>
                        Có mặt
                    </label>
                    <label class="status-radio">
                        <input type="radio" name="status_${student.id}" value="absent">
                        Vắng mặt
                    </label>
                    <label class="status-radio">
                        <input type="radio" name="status_${student.id}" value="late">
                        Đi muộn
                    </label>
                </div>
                <div class="student-note">
                    <input type="text" placeholder="Ghi chú" name="note_${student.id}">
                </div>
            </div>
        `).join('');
    }

    // API simulation methods
    async fetchTeacherClasses() {
        return [
            { id: 1, name: 'Toán 10A' },
            { id: 2, name: 'Toán 11B' }
        ];
    }

    async fetchClassLessons(classId) {
        return [
            { id: 1, name: 'Buổi 1' },
            { id: 2, name: 'Buổi 2' }
        ];
    }

    async fetchClassStudents(classId) {
        return [
            { id: 1, name: 'Nguyễn Văn A' },
            { id: 2, name: 'Trần Thị B' }
        ];
    }

    async saveAttendanceDraft(data) {
        // Simulate API call
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    async submitAttendanceData(data) {
        // Simulate API call
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Initialize the AttendanceManager when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    new AttendanceManager();
}); 