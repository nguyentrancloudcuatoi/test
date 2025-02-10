class ReportManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.initializeCharts();
        this.loadInitialData();
    }

    initializeElements() {
        // Report type buttons
        this.reportTypes = document.querySelectorAll('.report-type');
        
        // Filter elements
        this.timeRange = document.getElementById('timeRange');
        this.customDateRange = document.getElementById('customDateRange');
        this.teacherFilter = document.getElementById('teacherFilter');
        this.classFilter = document.getElementById('classFilter');
        this.statusFilter = document.getElementById('statusFilter');
        
        // Content elements
        this.summaryCards = document.querySelector('.summary-cards');
        this.mainChart = document.getElementById('mainChart');
        this.reportTable = document.getElementById('reportTable');
        
        // Export modal
        this.exportModal = document.getElementById('exportModal');
        
        // Current state
        this.currentReportType = 'attendance';
        this.chartInstance = null;
    }

    attachEventListeners() {
        // Report type switching
        this.reportTypes.forEach(button => {
            button.addEventListener('click', () => this.switchReportType(button.dataset.type));
        });

        // Filter changes
        this.timeRange.addEventListener('change', () => this.handleTimeRangeChange());
        document.querySelectorAll('.filter-group select').forEach(select => {
            select.addEventListener('change', () => this.applyFilters());
        });

        // Export buttons
        document.getElementById('exportToExcel').addEventListener('click', () => this.showExportModal('xlsx'));
        document.getElementById('exportToSheets').addEventListener('click', () => this.showExportModal('sheets'));
        document.getElementById('confirmExport').addEventListener('click', () => this.handleExport());
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadFilterOptions(),
                this.loadReportData()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async loadReportData() {
        const filters = this.collectFilters();
        try {
            const data = await this.fetchReportData(this.currentReportType, filters);
            this.updateReport(data);
        } catch (error) {
            console.error('Error loading report data:', error);
        }
    }

    updateReport(data) {
        this.updateSummaryCards(data.summary);
        this.updateChart(data.chartData);
        this.updateTable(data.tableData);
    }

    initializeCharts() {
        const ctx = this.mainChart.getContext('2d');
        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    updateChart(data) {
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const ctx = this.mainChart.getContext('2d');
        this.chartInstance = new Chart(ctx, {
            type: data.type || 'bar',
            data: data.data,
            options: data.options
        });
    }

    updateTable(data) {
        const headers = Object.keys(data[0] || {});
        this.reportTable.innerHTML = `
            <thead>
                <tr>
                    ${headers.map(header => `<th>${this.formatHeader(header)}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        ${headers.map(header => `<td>${row[header]}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        `;
    }

    async handleExport() {
        const format = document.querySelector('select[name="format"]').value;
        const includeCharts = document.querySelector('input[name="includeCharts"]').checked;
        const includeSummary = document.querySelector('input[name="includeSummary"]').checked;

        try {
            const data = await this.prepareExportData(includeCharts, includeSummary);
            await this.exportData(data, format);
            this.hideExportModal();
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    }

    // Helper methods
    formatHeader(header) {
        return header
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    collectFilters() {
        return {
            timeRange: this.timeRange.value,
            startDate: document.getElementById('startDate')?.value,
            endDate: document.getElementById('endDate')?.value,
            teachers: Array.from(this.teacherFilter.selectedOptions).map(opt => opt.value),
            classes: Array.from(this.classFilter.selectedOptions).map(opt => opt.value),
            statuses: Array.from(this.statusFilter.selectedOptions).map(opt => opt.value)
        };
    }

    showExportModal(defaultFormat) {
        document.querySelector('select[name="format"]').value = defaultFormat;
        this.exportModal.style.display = 'block';
    }

    hideExportModal() {
        this.exportModal.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReportManager();
});