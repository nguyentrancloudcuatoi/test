document.addEventListener("DOMContentLoaded", () => {
    const teacherList = document.getElementById("teacherList");
    const addTeacherButton = document.getElementById("addTeacher");

    // Lấy thông tin giáo viên từ sessionStorage
    const currentTeacher = JSON.parse(sessionStorage.getItem('currentTeacher'));
    if (currentTeacher) {
        console.log(`Giáo viên đang đăng nhập: ${currentTeacher.name}`);
        // Có thể hiển thị tên giáo viên ở đây nếu cần
    }

    // Thay đổi cách khởi tạo danh sách giáo viên
    let teachers = JSON.parse(localStorage.getItem('teachers')) || [
        { email: "nguyenvana@gmail.com", name: "Nguyễn Văn A", classCode: "BFB", passwords: "vana123@656", status: "Đang dạy" },
        { email: "tranthib@gmail.com", name: "Trần Thị B", classCode: "FB", passwords: "vana123@656", status: "Đang dạy" },
        { email: "levanc@gmail.com", name: "Lê Văn C", classCode: "Toeic", passwords: "vana123@656", status: "Đang dạy" },
    ];

    teachers = teachers.map(teacher => ({
        email: teacher.email,
        name: teacher.name,
        classCode: teacher.classCode, // Rename subject to classCode
        passwords: teacher.passwords,
        status: teacher.status
    }));

    // Thêm HTML cho modal nhập thông tin giáo viên
    const modal = document.createElement("div");
    modal.id = "modal";
    modal.style.display = "none"; // Ẩn modal ban đầu
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h3>Thêm giáo viên mới</h3>
            <input type="email" id="teacherEmail" placeholder="Nhập email giáo viên" required />
            <input type="text" id="teacherName" placeholder="Nhập tên giáo viên" required />
            <input type="text" id="teacherclassCode" placeholder="Nhập mã lớp học" required />
            <input type="password" id="teacherPasswords" placeholder="Nhập mật khẩu" required />
            <button id="addTeacherConfirm">Thêm giáo viên</button>
            <p id="modal-message"></p>
        </div>
    `;
    document.body.appendChild(modal);

    // Thêm CSS cho modal
    const style = document.createElement("style");
    style.innerHTML = `
        #modal {
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            width: 300px; /* Đặt chiều rộng cho modal */
        }
        .close-button {
            cursor: pointer;
            float: right;
            font-size: 20px;
            color: #888;
        }
        .close-button:hover {
            color: #f00; /* Đổi màu khi hover */
        }
        input[type="text"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        input[type="email"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        input[type="password"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        button {
            background-color: #4CAF50; /* Màu nền cho nút */
            color: white; /* Màu chữ */
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #45a049; /* Màu nền khi hover */
        }
    `;
    document.head.appendChild(style);

    // Hàm hiển thị danh sách giáo viên
    function displayTeachers() {
        teacherList.innerHTML = `
            <table class="teacher-table">
                <thead>
                    <tr>
                        <th style="width: 30%">Email</th>
                        <th style="width: 25%">Tên</th>
                        <th style="width: 10%">Mã lớp học</th>
                        <th style="width: 15%">Passwords</th>
                        <th style="width: 10%">Trạng thái</th>
                        <th style="width: 15%">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    ${teachers.map(teacher => `
                        <tr>
                            <td>${teacher.email}</td>
                            <td>${teacher.name}</td>
                            <td>${teacher.classCode}</td>
                            <td>${teacher.passwords}</td>
                            <td>${teacher.status}</td>
                            <td>
                                <button class="btn-delete" data-teacher-email="${teacher.email}">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        // Lưu danh sách giáo viên vào localStorage
        localStorage.setItem('teachers', JSON.stringify(teachers));

        // Thêm event để thông báo thay đổi
        window.dispatchEvent(new Event('storage'));
    }

    // Hàm hiển thị modal
    function showModal() {
        modal.style.display = "flex";
    }

    // Đóng modal khi nhấn nút đóng
    modal.querySelector(".close-button").addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Hàm thêm giáo viên mới
    addTeacherButton.addEventListener("click", () => {
        showModal();
    });

    // Xử lý thêm giáo viên khi nhấn nút xác nhận
    modal.querySelector("#addTeacherConfirm").addEventListener("click", () => {
        const newTeacherEmail = document.getElementById("teacherEmail").value;
        const newTeacherName = document.getElementById("teacherName").value;
        const newTeacherclassCode = document.getElementById("teacherclassCode").value;
        const newTeacherPasswords = document.getElementById("teacherPasswords").value;

        if (newTeacherEmail && newTeacherName && newTeacherclassCode && newTeacherPasswords) {
            // Kiểm tra email đã tồn tại chưa
            if (teachers.some(t => t.email === newTeacherEmail)) {
                alert("Email này đã được sử dụng!");
                return;
            }

            const newTeacher = {
                email: newTeacherEmail,
                name: newTeacherName,
                classCode: newTeacherclassCode,
                status: "Đang dạy",
                passwords: newTeacherPasswords
            };

            // Thêm giáo viên mới vào mảng
            teachers.push(newTeacher);

            // Lưu vào localStorage để có thể đăng nhập
            const teacherAccounts = JSON.parse(localStorage.getItem('teacherAccounts') || '[]');
            teacherAccounts.push({
                email: newTeacherEmail,
                password: newTeacherPasswords,
                role: 'teacher'
            });
            localStorage.setItem('teacherAccounts', JSON.stringify(teacherAccounts));

            // Cập nhật giao diện
            displayTeachers();
            modal.style.display = "none";
            
            // Clear input fields
            document.getElementById("teacherEmail").value = '';
            document.getElementById("teacherName").value = '';
            document.getElementById("teacherclassCode").value = '';
            document.getElementById("teacherPasswords").value = '';

            alert("Thêm giáo viên thành công! Giáo viên có thể đăng nhập bằng email và mật khẩu đã tạo.");
        } else {
            alert("Vui lòng nhập đầy đủ thông tin giáo viên!");
        }
    });

    // Add event delegation for delete buttons
    teacherList.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-delete")) {
            const email = e.target.dataset.teacherEmail;
            const index = teachers.findIndex(teacher => teacher.email === email);
            if (index > -1) {
                // Xóa tài khoản giáo viên khỏi teacherAccounts
                const teacherAccounts = JSON.parse(localStorage.getItem('teacherAccounts') || '[]');
                const accountIndex = teacherAccounts.findIndex(account => account.email === email);
                if (accountIndex > -1) {
                    teacherAccounts.splice(accountIndex, 1);
                    localStorage.setItem('teacherAccounts', JSON.stringify(teacherAccounts));
                }
                
                teachers.splice(index, 1);
                displayTeachers(); // Sẽ tự động lưu vào localStorage
            }
        }
    });

    // Hiển thị danh sách giáo viên ban đầu
    displayTeachers();

    // Thêm event để thông báo thay đổi
    window.dispatchEvent(new Event('storage'));
}); 
