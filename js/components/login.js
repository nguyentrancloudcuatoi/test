class LoginManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Form elements
        this.loginForm = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.errorMessage = document.getElementById('errorMessage');
        this.loginButton = document.querySelector('.login-button');
        this.spinner = document.querySelector('.spinner');

        // Modal elements
        this.modal = document.getElementById('forgotPasswordModal');
        this.forgotPasswordLink = document.getElementById('forgotPassword');
        this.closeModal = document.querySelector('.close');
        this.resetPasswordForm = document.getElementById('resetPasswordForm');

        // Password visibility toggle
        this.togglePassword = document.querySelector('.toggle-password');
    }

    attachEventListeners() {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        this.forgotPasswordLink.addEventListener('click', () => this.showForgotPasswordModal());
        this.closeModal.addEventListener('click', () => this.hideModal());
        this.resetPasswordForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
    }

    async handleLogin(e) {
        e.preventDefault();
        this.showLoading(true);
        this.clearError();

        const username = this.usernameInput.value;
        const password = this.passwordInput.value;

        try {
            const response = await this.authenticateUser(username, password);
            console.log('Đăng nhập thành công:', response);
            this.redirectUser(response.role);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async authenticateUser(username, password) {
        // Kiểm tra tài khoản admin
        if (username === 'admin@example.com' && password === 'password') {
            return { role: 'admin' };
        }

        // Kiểm tra tài khoản giáo viên từ localStorage
        const teacherAccounts = JSON.parse(localStorage.getItem('teacherAccounts') || '[]');
        const teacherAccount = teacherAccounts.find(
            account => account.email === username && account.password === password
        );

        if (teacherAccount) {
            const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
            const teacherDetails = teachers.find(t => t.email === username);
            if (teacherDetails) {
                // Lưu thông tin giáo viên vào sessionStorage
                sessionStorage.setItem('currentTeacher', JSON.stringify({
                    email: teacherDetails.email,
                    name: teacherDetails.name,
                    subject: teacherDetails.classCode
                }));
            }
            return { 
                role: 'teacher',
                teacherInfo: teacherDetails
            };
        }

        // Kiểm tra tài khoản học sinh
        if (username === 'student@example.com' && password === 'password') {
            return { role: 'student' };
        }

        throw new Error('Tài khoản hoặc mật khẩu không chính xác');
    }

    redirectUser(role) {
        const routes = {
            admin: '/pages/dashboard/admin.html',
            teacher: '/pages/dashboard/teacher.html',
            student: '/pages/student/class-info.html'
        };
        window.location.href = routes[role];
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        this.togglePassword.classList.toggle('fa-eye');
        this.togglePassword.classList.toggle('fa-eye-slash');
    }

    showForgotPasswordModal() {
        this.modal.style.display = 'block';
    }

    hideModal() {
        this.modal.style.display = 'none';
    }

    async handlePasswordReset(e) {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        
        try {
            // Simulate sending reset email
            await this.sendResetEmail(email);
            alert('Mã xác nhận đã được gửi đến email của bạn');
            this.hideModal();
        } catch (error) {
            alert(error.message);
        }
    }

    async sendResetEmail(email) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }

    showLoading(show) {
        const buttonText = this.loginButton.querySelector('span');
        this.spinner.style.display = show ? 'block' : 'none';
        buttonText.style.display = show ? 'none' : 'block';
        this.loginButton.disabled = show;
    }

    showError(message) {
        this.errorMessage.textContent = message;
    }

    clearError() {
        this.errorMessage.textContent = '';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
}); 