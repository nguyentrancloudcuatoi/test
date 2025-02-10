document.addEventListener("DOMContentLoaded", () => {
    const teacherList = document.getElementById("teacherList");
    const addTeacherButton = document.getElementById("addTeacher");

    // Dữ liệu giả lập cho danh sách giáo viên
    const teachers = [
        { id: 1, name: "Nguyễn Văn A", subject: "Toán", status: "Đang dạy" },
        { id: 2, name: "Trần Thị B", subject: "Vật Lý", status: "Đang dạy" },
        { id: 3, name: "Lê Văn C", subject: "Hóa", status: "Đang dạy" },
    ];

    // Thêm HTML cho modal nhập thông tin giáo viên
    const modal = document.createElement("div");
    modal.id = "modal";
    modal.style.display = "none"; // Ẩn modal ban đầu
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h3>Thêm giáo viên mới</h3>
            <input type="text" id="teacherName" placeholder="Nhập tên giáo viên" />
            <input type="text" id="teacherSubject" placeholder="Nhập môn học" />
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
        teacherList.innerHTML = "";
        teachers.forEach(teacher => {
            const teacherCard = document.createElement("div");
            teacherCard.className = "teacher-card";
            teacherCard.innerHTML = `
                <h3>${teacher.name} - ${teacher.subject}</h3>
                <button onclick="removeTeacher(${teacher.id})">Xóa</button>
            `;
            teacherList.appendChild(teacherCard);
        });
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
        const newTeacherName = document.getElementById("teacherName").value;
        const newTeacherSubject = document.getElementById("teacherSubject").value;
        if (newTeacherName && newTeacherSubject) {
            const newTeacher = {
                id: teachers.length + 1,
                name: newTeacherName,
                subject: newTeacherSubject,
                status: "Đang dạy"
            };
            teachers.push(newTeacher);
            displayTeachers();
            // Hiển thị modal thông báo
            showModal(`Đã thêm giáo viên: ${newTeacherName}`);
            // Đóng modal
            modal.style.display = "none";
            // Xóa giá trị trong các trường nhập liệu
            document.getElementById("teacherName").value = '';
            document.getElementById("teacherSubject").value = '';
        }
    });

    // Hàm xóa giáo viên
    window.removeTeacher = (id) => {
        const index = teachers.findIndex(teacher => teacher.id === id);
        if (index > -1) {
            teachers.splice(index, 1);
            displayTeachers();
        }
    };

    // Hiển thị danh sách giáo viên ban đầu
    displayTeachers();
}); 
