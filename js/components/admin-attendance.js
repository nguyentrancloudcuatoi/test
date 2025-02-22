class AdminAttendanceManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialData();
    }

    initializeElements() {
        // Filter elements
        this.teacherFilter = document.getElementById('teacherFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.timeFilter = document.getElementById('timeFilter');
        this.dateRangeContainer = document.getElementById('dateRangeContainer');
        this.startDate = document.getElementById('startDate');
        this.endDate = document.getElementById('endDate');

        // List and table elements
        this.attendanceItems = document.getElementById('attendanceItems');
        this.workloadTableBody = document.getElementById('workloadTableBody');
        this.pendingCount = document.getElementById('pendingCount');
        this.approvedCount = document.getElementById('approvedCount');
        this.totalWorkload = document.getElementById('totalWorkload');

        // Modal elements
        this.reviewModal = document.getElementById('reviewModal');
        this.selectedAttendanceId = null;
        this.modalBody = this.reviewModal.querySelector('.modal-body');
        this.approveBtn = document.getElementById('approveAttendance');
        this.rejectBtn = document.getElementById('rejectAttendance');
    }

    attachEventListeners() {
        // Filter change events
        this.teacherFilter.addEventListener('change', () => this.applyFilters());
        this.statusFilter.addEventListener('change', () => this.applyFilters());
        this.timeFilter.addEventListener('change', () => this.handleTimeFilterChange());
        this.startDate.addEventListener('change', () => this.applyFilters());
        this.endDate.addEventListener('change', () => this.applyFilters());

        // Export button
        document.getElementById('exportReport').addEventListener('click', () => this.exportWorkloadReport());

        // Modal actions
        this.reviewModal.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        this.approveBtn.addEventListener('click', () => this.handleApproval(true, this.selectedAttendanceId));
        this.rejectBtn.addEventListener('click', () => this.handleApproval(false, this.selectedAttendanceId));
    }

    async loadInitialData() {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        // Populate teacher filter with default option
        this.teacherFilter.innerHTML = `
            <option value="">Tất cả giáo viên</option>
            ${teachers.map(teacher => `
                <option value="${teacher.email}">${teacher.name} (${teacher.email})</option>
            `).join('')}
        `;

        let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        attendanceRecords = attendanceRecords.map(record => {
            const teacher = teachers.find(t => t.email === record.teacherId);
            if (teacher) {
                record.teacherName = teacher.name;
            }
            return record;
        });

        this.renderAttendanceList(attendanceRecords);
        this.updateStatistics(attendanceRecords);
    }

    renderAttendanceList(attendances) {
        const tbody = document.getElementById('attendanceItems');
        tbody.innerHTML = attendances.map(attendance => `
            <tr data-attendance-id="${attendance.id}">
                <td>${attendance.teacherId}</td>
                <td>${attendance.teacherName || 'N/A'}</td>
                <td>${attendance.classCode || 'Chưa có lớp'}</td>
                <td>${attendance.vietnameseTime}</td>
                <td>
                    <span class="status-badge status-${attendance.status}">
                        ${this.getStatusText(attendance.status)}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn-view" onclick="adminAttendance.viewAttendanceDetail('${attendance.id}')">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    ${attendance.status === 'pending' ? `
                        <button class="btn-approve" onclick="adminAttendance.handleApproval(true, '${attendance.id}')">
                            <i class="fas fa-check"></i> Duyệt
                        </button>
                        <button class="btn-reject" onclick="adminAttendance.handleApproval(false, '${attendance.id}')">
                            <i class="fas fa-times"></i> Từ chối
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('') || `
            <tr>
                <td colspan="6" class="text-center">Không có dữ liệu điểm danh</td>
            </tr>
        `;
    }

    renderWorkloadSummary(workloads) {
        this.workloadTableBody.innerHTML = workloads.map(workload => `
            <tr class="workload-row">
                <td class="workload-teacher-id">${workload.teacherId}</td>
                <td class="workload-teacher-name">${workload.teacherName}</td>
                <td class="workload-lesson-count">${workload.lessonCount}</td>
                <td class="workload-total-hours">${workload.totalHours}</td>
                <td class="workload-total-workload">${workload.totalWorkload}</td>
            </tr>
            <tr>
                <td class="workload-teacher-id">${workload.teacherId}</td>
                <td class="workload-teacher-name">${workload.teacherName}</td>
                <td class="workload-lesson-count">${workload.lessonCount}</td>
                <td class="workload-total-hours">${workload.totalHours}</td>
                <td class="workload-total-workload">${workload.totalWorkload}</td>
            </tr>
        `).join('') || `
            <tr>
                <td colspan="10">Không có dữ liệu</td>
            </tr>
        `;
    }

    async viewAttendanceDetail(attendanceId) {
        try {
            const detail = await this.fetchAttendanceDetail(attendanceId);
            this.selectedAttendanceId = attendanceId;
            this.showAttendanceDetail(detail);
        } catch (error) {
            console.error('Error loading attendance detail:', error);
        }
    }

    showAttendanceDetail(detail) {
        this.modalBody.innerHTML = `
            <div class="detail-section">
                <h3>Thông tin buổi học</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Giáo viên:</strong>
                        <span>${detail.teacherName}</span>
                    </div>
                    <div class="info-item">
                        <strong>Lớp:</strong>
                        <span>${detail.classCode || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Thời gian:</strong>
                        <span>${detail.vietnameseTime}</span>
                    </div>
                    <div class="info-item">
                        <strong>Thời lượng:</strong>
                        <span>${detail.duration} phút</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Điểm danh học sinh</h3>
                <div class="student-attendance-list">
                    ${detail.students.map(student => `
                        <div class="student-attendance-item ${student.status}">
                            <div class="student-info">
                                <span class="student-name">${student.name}</span>
                                <span class="status-badge status-${student.status}">
                                    ${this.getStudentStatusText(student.status)}
                                </span>
                            </div>
                            ${student.note ? `
                                <div class="student-note">
                                    <i class="fas fa-comment"></i>
                                    <span>${student.note}</span>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            ${detail.note ? `
                <div class="detail-section">
                    <h3>Ghi chú của giáo viên</h3>
                    <p class="teacher-note">${detail.note}</p>
                </div>
            ` : ''}
        `;
        
        this.reviewModal.style.display = 'block';
    }

    async handleApproval(isApproved, attendanceId) {
        if (!attendanceId) {
            console.error('Missing attendanceId');
            alert('Có lỗi xảy ra: Không tìm thấy ID điểm danh');
            return;
        }

        try {
            const attendanceData = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
            const index = attendanceData.findIndex(a => a.id === attendanceId);
            
            if (index === -1) {
                throw new Error('Không tìm thấy bản ghi điểm danh');
            }

            // Cập nhật trạng thái
            attendanceData[index].status = isApproved ? 'approved' : 'rejected';
            attendanceData[index].approvalDate = new Date().toISOString();
            localStorage.setItem('attendanceRecords', JSON.stringify(attendanceData));
            
            // Gửi thông báo cho giáo viên
            const notification = {
                id: Date.now().toString(),
                teacherEmail: attendanceData[index].teacherEmail,
                message: isApproved 
                    ? `Điểm danh ngày ${new Date(attendanceData[index].date).toLocaleDateString()} đã được phê duyệt`
                    : `Điểm danh ngày ${new Date(attendanceData[index].date).toLocaleDateString()} đã bị từ chối`,
                type: isApproved ? 'success' : 'warning',
                date: new Date().toISOString(),
                isRead: false
            };

            // Lưu thông báo vào localStorage
            const notifications = JSON.parse(localStorage.getItem('teacherNotifications')) || [];
            notifications.push(notification);
            localStorage.setItem('teacherNotifications', JSON.stringify(notifications));
            
            // Cập nhật UI
            await this.updateUIAfterApproval(attendanceData, attendanceId);
            
            // Hiển thị thông báo
            alert(isApproved ? 'Đã phê duyệt điểm danh!' : 'Đã từ chối điểm danh!');
            
            // Đóng modal nếu đang mở
            this.closeModal();
        } catch (error) {
            console.error('Error handling approval:', error);
            alert('Có lỗi xảy ra khi xử lý phê duyệt! ' + error.message);
        }
    }

    async updateUIAfterApproval(attendanceData, approvedId) {
        try {
            // 1. Cập nhật hàng trong bảng
            const row = document.querySelector(`tr[data-attendance-id="${approvedId}"]`);
            if (row) {
                const attendance = attendanceData.find(a => a.id === approvedId);
                if (attendance) {
                    const statusCell = row.querySelector('td:nth-child(5)');
                    const actionsCell = row.querySelector('td:nth-child(6)');
                    
                    // Cập nhật trạng thái
                    statusCell.innerHTML = `
                        <span class="status-badge status-${attendance.status}">
                            ${this.getStatusText(attendance.status)}
                        </span>
                    `;
                    
                    // Cập nhật nút tác vụ - chỉ giữ lại nút xem chi tiết
                    actionsCell.innerHTML = `
                        <button class="btn-view" onclick="adminAttendance.viewAttendanceDetail('${attendance.id}')">
                            <i class="fas fa-eye"></i> Xem
                        </button>
                    `;
                }
            }

            // 2. Cập nhật thống kê
            this.updateStatistics(attendanceData);

            // 3. Áp dụng lại bộ lọc hiện tại
            this.applyFilters();

        } catch (error) {
            console.error('Error updating UI after approval:', error);
            throw new Error('Không thể cập nhật giao diện sau khi phê duyệt: ' + error.message);
        }
    }

    getCurrentFilters() {
        return {
            teacherId: this.teacherFilter.value,
            status: this.statusFilter.value,
            timeRange: this.timeFilter.value,
            startDate: this.startDate.value,
            endDate: this.endDate.value
        };
    }

    applyFiltersToData(data, filters) {
        return data.filter(item => {
            // Lọc theo giáo viên
            if (filters.teacherId && item.teacherId !== filters.teacherId) return false;
            
            // Lọc theo trạng thái
            if (filters.status && item.status !== filters.status) return false;
            
            // Lọc theo thời gian
            if (filters.timeRange !== 'custom') {
                // Xử lý lọc theo các khoảng thời gian định sẵn
                const itemDate = new Date(item.vietnameseTime);
                switch (filters.timeRange) {
                    case 'today':
                        if (!this.isToday(itemDate)) return false;
                        break;
                    case 'thisWeek':
                        if (!this.isThisWeek(itemDate)) return false;
                        break;
                    case 'thisMonth':
                        if (!this.isThisMonth(itemDate)) return false;
                        break;
                }
            } else {
                // Lọc theo khoảng ngày tùy chọn
                if (filters.startDate && filters.endDate) {
                    const itemDate = new Date(item.vietnameseTime);
                    const start = new Date(filters.startDate);
                    const end = new Date(filters.endDate);
                    if (itemDate < start || itemDate > end) return false;
                }
            }
            
            return true;
        });
    }

    handleTimeFilterChange() {
        const selectedValue = this.timeFilter.value;
        
        if (selectedValue === 'custom') {
            this.dateRangeContainer.style.display = 'flex';
        } else {
            this.dateRangeContainer.style.display = 'none';
            
            const today = new Date();
            let startDate = new Date();
            
            if (selectedValue === 'week') {
                startDate.setDate(today.getDate() - 7);
            } else if (selectedValue === 'month') {
                startDate.setDate(today.getDate() - 30);
            }
            
            this.startDate.value = startDate.toISOString().split('T')[0];
            this.endDate.value = today.toISOString().split('T')[0];
        }
        
        this.applyFilters();
    }

    async applyFilters() {
        try {
            // Lấy dữ liệu từ localStorage
            const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
            
            // Lấy giá trị các filter
            const filters = {
                teacherId: this.teacherFilter.value,
                status: this.statusFilter.value,
                timeRange: this.timeFilter.value,
                startDate: this.startDate.value,
                endDate: this.endDate.value
            };

            // Lọc dữ liệu
            const filteredRecords = attendanceRecords.filter(record => {
                // Lọc theo giáo viên
                if (filters.teacherId && record.teacherId !== filters.teacherId) {
                    return false;
                }

                // Lọc theo trạng thái
                if (filters.status && record.status !== filters.status) {
                    return false;
                }

                // Lọc theo thời gian
                const recordDate = new Date(record.vietnameseTime);
                const today = new Date();

                if (filters.timeRange === 'week') {
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (recordDate < weekAgo || recordDate > today) {
                        return false;
                    }
                } else if (filters.timeRange === 'month') {
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    if (recordDate < monthAgo || recordDate > today) {
                        return false;
                    }
                } else if (filters.timeRange === 'custom' && filters.startDate && filters.endDate) {
                    const start = new Date(filters.startDate);
                    const end = new Date(filters.endDate);
                    if (recordDate < start || recordDate > end) {
                        return false;
                    }
                }

                return true;
            });

            // Cập nhật UI
            this.renderAttendanceList(filteredRecords);
            this.updateStatistics(filteredRecords);

        } catch (error) {
            console.error('Error applying filters:', error);
            alert('Có lỗi xảy ra khi lọc dữ liệu!');
        }
    }

    closeModal() {
        this.reviewModal.style.display = 'none';
        this.selectedAttendanceId = null;
    }

    // Helper methods
    formatDateTime(datetime) {
        return new Date(datetime).toLocaleString('vi-VN');
    }

    getStatusText(status) {
        const statusTexts = {
            pending: 'Chờ duyệt',
            approved: 'Đã duyệt',
            rejected: 'Từ chối'
        };
        return statusTexts[status] || status;
    }

    getStudentStatusText(status) {
        const statusTexts = {
            present: 'Có mặt',
            absent: 'Vắng mặt',
            late: 'Đi muộn'
        };
        return statusTexts[status] || status;
    }

    // API simulation methods
    async fetchTeachers() {
        return [
            { id: 1, name: 'Nguyễn Văn A' },
            { id: 2, name: 'Trần Thị B' }
        ];
    }

    async fetchAttendances() {
        return [
            {
                id: 1,
                teacherId: 1,
                teacherName: 'Nguyễn Văn A',
                className: 'Toán 10A',
                datetime: '2024-03-20T08:00:00',
                status: 'pending'
            }
            // More attendances...
        ];
    }

    async fetchWorkloadSummary() {
        const sampleWorkloads = [
            {
                teacherId: 1,
                teacherName: 'Nguyễn Văn A',
                lessonCount: 10,
                totalHours: 100,
                totalWorkload: 110
            },
            {
                teacherId: 2,
                teacherName: 'Trần Thị B',
                lessonCount: 12,
                totalHours: 120,
                totalWorkload: 132
            },
            {
                teacherId: 3,
                teacherName: 'Lê Văn C',
                lessonCount: 8,
                totalHours: 80,
                totalWorkload: 88
            },
            {
                teacherId: 4,
                teacherName: 'Nguyễn Văn D',
                lessonCount: 15,
                totalHours: 150,
                totalWorkload: 165
            },
            {
                teacherId: 5,
                teacherName: 'Trần Thị E',
                lessonCount: 9,
                totalHours: 90,
                totalWorkload: 99
            }
        ];

        return sampleWorkloads;
    }

    updateStatistics(attendances) {
        const pendingCount = attendances.filter(a => a.status === 'pending').length;
        const approvedCount = attendances.filter(a => a.status === 'approved').length;
        const totalWorkload = attendances.reduce((sum, a) => sum + parseInt(a.duration || 0), 0);

        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('approvedCount').textContent = approvedCount;
        document.getElementById('totalWorkload').textContent = totalWorkload;
    }

    async submitAttendance() {
        try {
            // Validate form data
            const formData = this.collectFormData();
            if (!this.validateAttendanceData(formData)) {
                alert('Vui lòng điền đầy đủ thông tin điểm danh!');
                return;
            }

            // Create attendance record
            const attendanceRecord = {
                id: Date.now().toString(),
                teacherId: this.getCurrentTeacherId(),
                teacherName: this.getCurrentTeacherName(),
                classCode: formData.get('classCode'),
                vietnameseTime: formData.get('vietnameseTime'),
                teachingMethod: formData.get('teachingMethod'),
                session: formData.get('session'),
                materials: formData.get('materials'),
                duration: formData.get('duration'),
                attendance: formData.get('attendance'),
                note: formData.get('note'),
                status: 'pending',
                timestamp: new Date().toISOString()
            };

            // Save to localStorage
            const existingRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
            existingRecords.push(attendanceRecord);
            localStorage.setItem('attendanceRecords', JSON.stringify(existingRecords));

            // Show success message and redirect
            alert('Đã gửi điểm danh thành công!');
            window.location.href = '';
        } catch (error) {
            console.error('Error submitting attendance:', error);
            alert('Có lỗi xảy ra khi gửi điểm danh!');
        }
    }

    validateAttendanceData(formData) {
        const requiredFields = [
            'email',
            'classCode', 
            'teachingMethod',
            'session',
            'materials',
            'lessonNumber',
            'lessonName',
            'state',
            'duration',
            'vietnameseTime',
            'attendance'
        ];

        for (const field of requiredFields) {
            const value = formData.get(field);
            if (!value || value === 'Select' || value === 'Section') {
                return false;
            }
        }
        return true;
    }

    async exportWorkloadReport() {
        try {
            // Lấy dữ liệu từ localStorage
            const attendanceData = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
            
            // Tính toán workload cho từng giáo viên
            const teacherWorkloads = {};
            
            attendanceData.forEach(record => {
                if (record.status === 'approved') {
                    if (!teacherWorkloads[record.teacherId]) {
                        teacherWorkloads[record.teacherId] = {
                            teacherId: record.teacherId,
                            teacherName: record.teacherName,
                            lessonCount: 0,
                            totalHours: 0,
                            totalWorkload: 0
                        };
                    }
                    
                    teacherWorkloads[record.teacherId].lessonCount += 1;
                    teacherWorkloads[record.teacherId].totalHours += parseInt(record.duration) || 0;
                    teacherWorkloads[record.teacherId].totalWorkload += parseInt(record.duration) || 0;
                }
            });

            // Chuyển đổi dữ liệu thành mảng để xuất Excel
            const workloadArray = [
                ['ID Giáo viên', 'Tên giáo viên', 'Số buổi dạy', 'Tổng giờ', 'Tổng công'], // Header
                ...Object.values(teacherWorkloads).map(teacher => [
                    teacher.teacherId,
                    teacher.teacherName,
                    teacher.lessonCount,
                    teacher.totalHours,
                    teacher.totalWorkload
                ])
            ];

            // Tạo workbook mới
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(workloadArray);

            // Định dạng cột
            const colWidths = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
            ws['!cols'] = colWidths;

            // Thêm worksheet vào workbook
            XLSX.utils.book_append_sheet(wb, ws, "Báo cáo công giảng dạy");

            // Tạo tên file với timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `bao_cao_cong_giang_day_${timestamp}.xlsx`;

            // Xuất file
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error('Error exporting workload report:', error);
            alert('Có lỗi xảy ra khi xuất báo cáo!');
        }
    }

    async fetchAttendanceDetail(attendanceId) {
        try {
            // Lấy dữ liệu từ localStorage
            const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
            const detail = attendanceRecords.find(record => record.id === attendanceId);
            
            if (!detail) {
                throw new Error('Không tìm thấy thông tin điểm danh');
            }
            
            return detail;
        } catch (error) {
            console.error('Error fetching attendance detail:', error);
            throw error;
        }
    }
}

// Initialize when DOM is loaded
let adminAttendance;
document.addEventListener('DOMContentLoaded', () => {
    adminAttendance = new AdminAttendanceManager();
});

// Function to handle pagination
let currentPage = 1;
const itemsPerPage = 10;
let attendanceData = []; // Mảng chứa dữ liệu điểm danh

function loadAttendanceData() {
    // Giả sử bạn đã có một hàm để lấy dữ liệu điểm danh từ server
    fetchAttendanceData().then(data => {
        attendanceData = data; // Lưu dữ liệu vào mảng
        renderAttendanceTable();
    });
}

function renderAttendanceTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = attendanceData.slice(startIndex, endIndex);
    
    const attendanceItems = document.getElementById('attendanceItems');
    attendanceItems.innerHTML = ''; // Xóa nội dung cũ

    paginatedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.teacherId}</td>
            <td>${item.teacherName}</td>
            <td>${item.class}</td>
            <td>${item.time}</td>
            <td>${item.status}</td>
            <td><button onclick="handleAction(${item.id})">Thao tác</button></td>
        `;
        attendanceItems.appendChild(row);
    });

    updatePaginationButtons();
}

function updatePaginationButtons() {
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage * itemsPerPage >= attendanceData.length;
}

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderAttendanceTable();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage * itemsPerPage < attendanceData.length) {
        currentPage++;
        renderAttendanceTable();
    }
});

// Gọi hàm để tải dữ liệu khi trang được tải
loadAttendanceData(); 