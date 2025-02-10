class AttendanceManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialData();
    }

    initializeElements() {
        // Form elements
        this.classSelect = document.getElementById('classSelect');
        this.lessonSelect = document.getElementById('lessonSelect');
        this.lessonDate = document.getElementById('lessonDate');
        this.lessonTime = document.getElementById('lessonTime');
        this.studentList = document.getElementById('studentList');
        this.attendanceForm = document.getElementById('attendanceForm');

        // Modals
        this.confirmModal = document.getElementById('confirmModal');
    }

    attachEventListeners() {
        // Class selection change
        this.classSelect.addEventListener('change', () => this.handleClassChange());

        // Form submission
        document.getElementById('saveDraft').addEventListener('click', () => this.saveDraft());
        document.getElementById('submitAttendance').addEventListener('click', () => this.showConfirmModal());

        // Modal actions
        document.getElementById('confirmSubmit').addEventListener('click', () => this.submitAttendance());
        document.getElementById('cancelSubmit').addEventListener('click', () => this.hideConfirmModal());
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
            const formData = this.collectFormData();
            await this.submitAttendanceData(formData);
            this.hideConfirmModal();
            alert('Đã gửi điểm danh thành công!');
            window.location.href = '/pages/attendance/list.html';
        } catch (error) {
            console.error('Error submitting attendance:', error);
            alert('Có lỗi xảy ra khi gửi điểm danh!');
        }
    }

    collectFormData() {
        // Collect all form data
        const formData = new FormData(this.attendanceForm);
        return {
            classId: this.classSelect.value,
            lessonId: this.lessonSelect.value,
            date: this.lessonDate.value,
            time: this.lessonTime.value,
            content: formData.get('lessonContent'),
            homework: formData.get('homework'),
            recordingLink: formData.get('recordingLink'),
            notes: formData.get('notes'),
            students: this.collectStudentAttendance()
        };
    }

    collectStudentAttendance() {
        const students = [];
        document.querySelectorAll('.student-item').forEach(item => {
            const studentId = item.querySelector('.student-info img').alt;
            const status = item.querySelector('input[type="radio"]:checked')?.value;
            const note = item.querySelector('input[type="text"]').value;
            
            students.push({
                studentId,
                status,
                note
            });
        });
        return students;
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AttendanceManager();
}); 