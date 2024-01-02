document.addEventListener('DOMContentLoaded', function() {
    var textarea = document.querySelector('.text-input textarea');
    textarea.addEventListener('input', function() {
        if (this.value === '') {
            this.style.height = '10px'; // 如果没有内容，设置为最小高度
        } else {
            this.style.height = 'auto';
            var newHeight = this.scrollHeight > 22 ? this.scrollHeight : 22; // 确保高度不小于最小高度
            this.style.height = newHeight + 'px';
        }
    });
});
