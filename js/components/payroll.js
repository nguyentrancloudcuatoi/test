class PayrollManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadPayrollData();
        this.setupWebSocket();
    }

    initializeElements() {
        // Period navigation
        this.currentPeriodElement = document.getElementById('currentPeriod');
        
        // Summary elements
        this.approvedWorkload = document.getElementById('approvedWorkload');
        this.rejectedWorkload = document.getElementById('rejectedWorkload');
        this.totalSalary = document.getElementById('totalSalary');
        
        // Details elements
        this.hourlyRate = document.getElementById('hourlyRate');
        this.totalHours = document.getElementById('totalHours');
        this.allowance = document.getElementById('allowance');
        this.finalSalary = document.getElementById('finalSalary');
        
        // Updates list
        this.updatesList = document.getElementById('updatesList');
        
        // Toast notification
        this.toast = document.getElementById('notificationToast');
        this.toastMessage = document.getElementById('toastMessage');
        
        // Current period tracking
        this.currentDate = new Date();
    }

    attachEventListeners() {
        // Period navigation
        document.querySelector('.btn-prev').addEventListener('click', () => this.navigatePeriod(-1));
        document.querySelector('.btn-next').addEventListener('click', () => this.navigatePeriod(1));
        
        // Export button
        document.getElementById('exportPayslip').addEventListener('click', () => this.exportPayslip());
        
        // Toast close button
        document.querySelector('.toast-close').addEventListener('click', () => this.hideToast());
    }

    async loadPayrollData() {
        try {
            const data = await this.fetchPayrollData(this.currentDate);
            this.updatePayrollDisplay(data);
            this.loadRecentUpdates();
        } catch (error) {
            console.error('Error loading payroll data:', error);
            this.showToast('Không thể tải dữ liệu lương. Vui lòng thử lại sau.');
        }
    }

    updatePayrollDisplay(data) {
        // Update summary cards
        this.approvedWorkload.textContent = data.approvedHours;
        this.rejectedWorkload.textContent = data.rejectedHours;
        this.totalSalary.textContent = this.formatCurrency(data.totalSalary);
        
        // Update salary details
        this.hourlyRate.textContent = this.formatCurrency(data.hourlyRate);
        this.totalHours.textContent = `${data.totalHours} giờ`;
        this.allowance.textContent = this.formatCurrency(data.allowance);
        this.finalSalary.textContent = this.formatCurrency(data.finalSalary);
    }

    async loadRecentUpdates() {
        try {
            const updates = await this.fetchRecentUpdates();
            this.renderUpdates(updates);
        } catch (error) {
            console.error('Error loading updates:', error);
        }
    }

    renderUpdates(updates) {
        this.updatesList.innerHTML = updates.map(update => `
            <div class="update-item">
                <div class="update-icon ${update.type}">
                    <i class="fas ${this.getUpdateIcon(update.type)}"></i>
                </div>
                <div class="update-content">
                    <div class="update-title">${update.title}</div>
                    <div class="update-time">${this.formatDateTime(update.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    setupWebSocket() {
        // Setup WebSocket connection for real-time updates
        const ws = new WebSocket('ws://your-websocket-server');
        
        ws.onmessage = (event) => {
            const update = JSON.parse(event.data);
            this.handleRealtimeUpdate(update);
        };
    }

    handleRealtimeUpdate(update) {
        // Handle different types of updates
        switch (update.type) {
            case 'workload_approved':
                this.showToast('Công của bạn đã được duyệt!');
                this.loadPayrollData();
                break;
            case 'workload_rejected':
                this.showToast('Công của bạn đã bị từ chối. Kiểm tra lý do.');
                this.loadPayrollData();
                break;
            case 'salary_updated':
                this.showToast('Lương của bạn đã được cập nhật.');
                this.loadPayrollData();
                break;
        }
    }

    // Helper methods
    navigatePeriod(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.currentPeriodElement.textContent = this.formatPeriod(this.currentDate);
        this.loadPayrollData();
    }

    formatPeriod(date) {
        return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    formatDateTime(timestamp) {
        return new Date(timestamp).toLocaleString('vi-VN');
    }

    getUpdateIcon(type) {
        const icons = {
            workload_approved: 'fa-check-circle',
            workload_rejected: 'fa-times-circle',
            salary_updated: 'fa-money-bill-wave'
        };
        return icons[type] || 'fa-info-circle';
    }

    showToast(message) {
        this.toastMessage.textContent = message;
        this.toast.style.display = 'flex';
        setTimeout(() => this.hideToast(), 5000);
    }

    hideToast() {
        this.toast.style.display = 'none';
    }

    async exportPayslip() {
        try {
            const data = await this.fetchPayslipData();
            // Handle payslip export
            console.log('Exporting payslip:', data);
        } catch (error) {
            console.error('Error exporting payslip:', error);
            this.showToast('Không thể xuất phiếu lương. Vui lòng thử lại sau.');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PayrollManager();
}); 