document.addEventListener("DOMContentLoaded", () => {
    const teacherList = document.getElementById("teacherList");
    const addTeacherButton = document.getElementById("addTeacher");

    // Dữ liệu giả lập cho danh sách giáo viên
    const teachers = [
        { id: 1341, name: "Nguyễn Văn A", subject: "BFB", passwords: "vana123@656", status: "Đang dạy" },
        { id: 2241, name: "Trần Thị B", subject: "FB", passwords: "vana123@656", status: "Đang dạy" },
        { id: 3721, name: "Lê Văn C", subject: "Toeic", passwords: "vana123@656", status: "Đang dạy" },
    ];

    // Thêm HTML cho modal nhập thông tin giáo viên
    const modal = document.createElement("div");
    modal.id = "modal";
    modal.style.display = "none"; // Ẩn modal ban đầu
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h3>Thêm giáo viên mới</h3>
            <input type="text" id="teacherID" placeholder="Nhập ID giáo viên" />
            <input type="text" id="teacherName" placeholder="Nhập tên giáo viên" />
            <input type="text" id="teacherSubject" placeholder="Nhập môn học" />
            <input type="text" id="teacherPasswords" placeholder="Nhập Passwords" />
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
                        <th style="width: 15%">ID</th>
                        <th style="width: 25%">Tên</th>
                        <th style="width: 20%">Môn học</th>
                        <th style="width: 25%">Passwords</th>
                        <th style="width: 15%">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    ${teachers.map(teacher => `
                        <tr>
                            <td>${teacher.id}</td>
                            <td>${teacher.name}</td>
                            <td>${teacher.subject}</td>
                            <td>${teacher.passwords}</td>
                            <td>
                                <button class="btn-delete" data-teacher-id="${teacher.id}">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
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
        const newTeacherID = parseInt(document.getElementById("teacherID").value);
        const newTeacherName = document.getElementById("teacherName").value;
        const newTeacherSubject = document.getElementById("teacherSubject").value;
        const newTeacherPasswords = document.getElementById("teacherPasswords").value;

        if (newTeacherName && newTeacherSubject) {
            // Tạo ID mới nếu không có ID được nhập vào
            const maxId = Math.max(...teachers.map(t => t.id), 0);
            const newTeacher = {
                id: newTeacherID || (maxId + 1), // Sử dụng ID lớn nhất hiện tại + 1
                name: newTeacherName,
                subject: newTeacherSubject,
                status: "Đang dạy",
                passwords: newTeacherPasswords || "default123"
            };
            teachers.push(newTeacher);
            displayTeachers();
            modal.style.display = "none";
            
            // Clear input fields
            document.getElementById("teacherID").value = '';
            document.getElementById("teacherName").value = '';
            document.getElementById("teacherSubject").value = '';
            document.getElementById("teacherPasswords").value = '';
        } else {
            alert("Vui lòng nhập đầy đủ thông tin giáo viên!");
        }
    });

    // Add event delegation for delete buttons
    teacherList.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-delete")) {
            const id = parseInt(e.target.dataset.teacherId);
            const index = teachers.findIndex(teacher => teacher.id === id);
            if (index > -1) {
                teachers.splice(index, 1);
                displayTeachers();
            }
        }
    });

    // Hiển thị danh sách giáo viên ban đầu
    displayTeachers();
}); 
