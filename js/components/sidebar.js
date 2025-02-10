document.addEventListener("DOMContentLoaded", function() {
    const currentLocation = window.location.pathname;
    const menuItems = document.querySelectorAll('.sidebar-nav ul li a');

    menuItems.forEach(item => {
        if (item.href === window.location.href) {
            item.parentElement.classList.add('active'); // Thêm lớp active cho mục tương ứng
        }
    });
}); 