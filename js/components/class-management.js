class ClassManagementSystem {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialData();
    }

    initializeElements() {
        // Tabs
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Lists
        this.activeClassList = document.getElementById('activeClassList');
        this.transferList = document.getElementById('transferList');
        this.completedList = document.getElementById('completedList');
        
        // Modals
        this.assignClassModal = document.getElementById('assignClassModal');
        this.transferModal = document.getElementById('transferModal');
        
        // Forms
        this.assignClassForm = document.getElementById('assignClassForm');
    }

    attachEventListeners() {
        // Tab switching
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });

        // Modal actions
        document.getElementById('assignNewClass').addEventListener('click', function() {
            // Gọi hàm để mở modal hoặc thực hiện hành động nào đó
        });
        document.querySelector('.close-modal').addEventListener('click', () => this.hideModals());
        document.getElementById('confirmAssign').addEventListener('click', () => this.handleClassAssignment());

        // Filters
        document.getElementById('classSearch').addEventListener('input', () => this.applyFilters());
        document.getElementById('teacherFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
    }

    async loadInitialData() {
        try {
            const [activeClasses, transfers, completedClasses] = await Promise.all([
                this.fetchActiveClasses(),
                this.fetchTransfers(),
                this.fetchCompletedClasses()
            ]);

            this.updateStatistics();
            this.renderActiveClasses(activeClasses);
            this.renderTransfers(transfers);
            this.renderCompletedClasses(completedClasses);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    renderActiveClasses(classes) {
        this.activeClassList.innerHTML = classes.map(classData => `
            <div class="class-card">
                <div class="class-header">
                    <h3>${classData.name}</h3>
                    <div class="class-actions">
                        <button onclick="classManagement.showTransferModal(${classData.id})">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                        <button onclick="classManagement.viewClassDetails(${classData.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <p>Giáo viên: ${classData.teacherName}</p>
                <div class="progress-section">
                    <div class="progress-item">
                        <div class="progress-label">Đã học</div>
                        <div class="progress-value">${classData.completedLessons}/${classData.totalLessons}</div>
                    </div>
                    <div class="progress-item">
                        <div class="progress-label">Học bù</div>
                        <div class="progress-value">${classData.makeupLessons}</div>
                    </div>
                    <div class="progress-item">
                        <div class="progress-label">Điểm danh</div>
                        <div class="progress-value">${classData.attendanceRate}%</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async handleClassAssignment() {
        try {
            const formData = new FormData(this.assignClassForm);
            const assignmentData = {
                teacherId: formData.get('teacherSelect'),
                classId: formData.get('classSelect'),
                timeSlot: formData.get('timeSlot'),
                notes: formData.get('assignmentNotes')
            };

            await this.submitClassAssignment(assignmentData);
            this.hideModals();
            this.loadInitialData();
        } catch (error) {
            console.error('Error assigning class:', error);
        }
    }

    async showAssignModal() {
        try {
            const [teachers, availableClasses] = await Promise.all([
                this.fetchAvailableTeachers(),
                this.fetchAvailableClasses()
            ]);

            this.populateTeacherSelect(teachers);
            this.populateClassSelect(availableClasses);
            this.assignClassModal.style.display = 'block';
        } catch (error) {
            console.error('Error preparing assignment modal:', error);
        }
    }

    async handleTeacherSelection(teacherId) {
        try {
            const availability = await this.fetchTeacherAvailability(teacherId);
            this.renderTimeSlots(availability);
        } catch (error) {
            console.error('Error loading teacher availability:', error);
        }
    }

    // Helper methods
    switchTab(tabId) {
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}Tab`);
        });
    }

    hideModals() {
        this.assignClassModal.style.display = 'none';
        this.transferModal.style.display = 'none';
    }

    // API simulation methods
    async fetchActiveClasses() {
        return [
            {
                id: 1,
                name: 'Toán 10A',
                teacherName: 'Nguyễn Văn A',
                completedLessons: 12,
                totalLessons: 24,
                makeupLessons: 1,
                attendanceRate: 95
            },
            {
                id: 2,
                name: 'Văn 11B',
                teacherName: 'Trần Thị B',
                completedLessons: 10,
                totalLessons: 20,
                makeupLessons: 2,
                attendanceRate: 90
            }
        ];
    }

    async fetchTransfers() {
        const transfers = [
            {
                id: 1,
                className: 'Hóa 10D',
                fromTeacher: 'Nguyễn Thị D',
                toTeacher: 'Lê Văn C',
                transferDate: '2024-03-15',
                status: 'Đang chờ'
            },
            {
                id: 2,
                className: 'Lý 12C',
                fromTeacher: 'Lê Văn C',
                toTeacher: 'Trần Thị B',
                transferDate: '2024-03-16',
                status: 'Đã hoàn thành'
            }
        ];
        console.log('Transfers:', transfers);
        return transfers;
    }

    async fetchCompletedClasses() {
        const completedClasses = [
            {
                id: 1,
                name: 'Văn 10A',
                teacherName: 'Nguyễn Văn A',
                completedLessons: 24,
                totalLessons: 24,
                attendanceRate: 100
            },
            {
                id: 2,
                name: 'Toán 11B',
                teacherName: 'Trần Thị B',
                completedLessons: 20,
                totalLessons: 20,
                attendanceRate: 95
            }
        ];
        console.log('Completed Classes:', completedClasses);
        return completedClasses;
    }
}

// Initialize when DOM is loaded
let classManagement;
document.addEventListener('DOMContentLoaded', async () => {
    classManagement = new ClassManagementSystem();
    const activeClasses = await classManagement.fetchActiveClasses();
    const transfers = await classManagement.fetchTransfers();
    const completedClasses = await classManagement.fetchCompletedClasses();

    classManagement.renderActiveClasses(activeClasses);
    classManagement.renderTransfers(transfers);
    classManagement.renderCompletedClasses(completedClasses);
});

function displayActiveClasses(classes) {
    const activeClassList = document.getElementById('activeClassList');
    activeClassList.innerHTML = classes.map(classData => `
        <div class="class-card">
            <div class="class-header">
                <h3>${classData.name}</h3>
                <p>Giáo viên: ${classData.teacherName}</p>
                <p>Đã học: ${classData.completedLessons}/${classData.totalLessons}</p>
                <p>Tỷ lệ điểm danh: ${classData.attendanceRate}%</p>
            </div>
        </div>
    `).join('');
}

function displayTransfers(transfers) {
    const transferList = document.getElementById('transferList');
    transferList.innerHTML = transfers.map(transfer => `
        <div class="transfer-item">
            <p><strong>Lớp:</strong> ${transfer.className}</p>
            <p><strong>Từ giáo viên:</strong> ${transfer.fromTeacher}</p>
            <p><strong>Đến giáo viên:</strong> ${transfer.toTeacher}</p>
            <p><strong>Ngày bàn giao:</strong> ${transfer.transferDate}</p>
            <p><strong>Trạng thái:</strong> ${transfer.status}</p>
        </div>
    `).join('');
}

function displayCompletedClasses(classes) {
    const completedClassList = document.getElementById('completedClassList');
    completedClassList.innerHTML = classes.map(classData => `
        <div class="completed-class-card">
            <h3>${classData.name}</h3>
            <p><strong>Giáo viên:</strong> ${classData.teacherName}</p>
            <p><strong>Đã hoàn thành:</strong> ${classData.completedLessons}/${classData.totalLessons}</p>
            <p><strong>Tỷ lệ điểm danh:</strong> ${classData.attendanceRate}%</p>
        </div>
    `).join('');
} 