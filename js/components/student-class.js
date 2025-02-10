class StudentClassManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadClassData();
    }

    initializeElements() {
        // Selectors
        this.classSelect = document.getElementById('classSelect');
        this.alertsSection = document.getElementById('alertsSection');
        this.lessonHistory = document.getElementById('lessonHistory');
        this.statusFilter = document.getElementById('statusFilter');
        
        // Info elements
        this.teacherName = document.getElementById('teacherName');
        this.startDate = document.getElementById('startDate');
        this.totalLessons = document.getElementById('totalLessons');
        this.scheduleTime = document.getElementById('scheduleTime');
        
        // Progress elements
        this.completedLessons = document.getElementById('completedLessons');
        this.remainingLessons = document.getElementById('remainingLessons');
        this.absentCount = document.getElementById('absentCount');
        
        // Next lesson
        this.nextLessonTime = document.getElementById('nextLessonTime');
    }

    attachEventListeners() {
        this.classSelect.addEventListener('change', () => this.handleClassChange());
        this.statusFilter.addEventListener('change', () => this.filterLessonHistory());
    }

    async loadClassData() {
        try {
            const classId = this.classSelect.value;
            const [classInfo, lessonHistory] = await Promise.all([
                this.fetchClassInfo(classId),
                this.fetchLessonHistory(classId)
            ]);

            this.updateClassInfo(classInfo);
            this.updateProgress(classInfo.progress);
            this.updateNextLesson(classInfo.nextLesson);
            this.renderLessonHistory(lessonHistory);
            this.checkAttendanceRate(classInfo.progress);
        } catch (error) {
            console.error('Error loading class data:', error);
        }
    }

    updateClassInfo(info) {
        this.teacherName.textContent = info.teacherName;
        this.startDate.textContent = this.formatDate(info.startDate);
        this.totalLessons.textContent = `${info.totalLessons} buổi`;
        this.scheduleTime.textContent = info.scheduleTime;
    }

    updateProgress(progress) {
        this.completedLessons.textContent = progress.completed;
        this.remainingLessons.textContent = progress.remaining;
        this.absentCount.textContent = progress.absent;
    }

    updateNextLesson(nextLesson) {
        if (nextLesson) {
            this.nextLessonTime.textContent = this.formatDateTime(nextLesson);
            document.getElementById('nextLessonAlert').style.display = 'flex';
        } else {
            document.getElementById('nextLessonAlert').style.display = 'none';
        }
    }

    renderLessonHistory(lessons) {
        this.lessonHistory.innerHTML = lessons.map(lesson => `
            <div class="lesson-item">
                <div class="lesson-date">
                    <i class="fas fa-calendar"></i>
                    ${this.formatDateTime(lesson.datetime)}
                </div>
                <div class="lesson-details">
                    <h4>${lesson.title}</h4>
                    ${lesson.notes ? `<p class="lesson-notes">${lesson.notes}</p>` : ''}
                </div>
                <div class="lesson-status status-${lesson.status}">
                    ${this.getStatusText(lesson.status)}
                </div>
            </div>
        `).join('');
    }

    checkAttendanceRate(progress) {
        const attendanceRate = (progress.completed - progress.absent) / progress.completed * 100;
        if (attendanceRate < 80) {
            this.showAttendanceWarning(attendanceRate);
        }
    }

    showAttendanceWarning(rate) {
        const alert = `
            <div class="alert warning">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="alert-content">
                    <h4>Cảnh báo tỷ lệ tham gia</h4>
                    <p>Tỷ lệ tham gia của bạn hiện tại là ${rate.toFixed(1)}%. 
                    Vui lòng cải thiện để đạt kết quả học tập tốt nhất.</p>
                </div>
            </div>
        `;
        this.alertsSection.innerHTML = alert;
    }

    // Helper methods
    formatDate(date) {
        return new Date(date).toLocaleDateString('vi-VN');
    }

    formatDateTime(datetime) {
        return new Date(datetime).toLocaleString('vi-VN');
    }

    getStatusText(status) {
        const statusMap = {
            attended: 'Đã tham gia',
            absent: 'Vắng mặt',
            makeup: 'Học bù'
        };
        return statusMap[status] || status;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudentClassManager();
});