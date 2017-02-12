// 页面滑动流畅
var init = function () {
    document.addEventListener('touchmove', function (e) {
        e.preventDefault();
    }, false);
}
export default init;