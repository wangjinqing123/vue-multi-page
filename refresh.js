/*
* h5 拖拽刷新*
* @param element {obj}    原生dom对象 下拉元素盒子dom元素
* @param txtobj  {str}    下拉元素文本提示dom元素
* @param fn {function}     回调函数   *window.location.load(window.location.href);   或者回调调用ajax
* @param distance {number} 滑动距离 默认不写38px
*/
var refreshPage = function (element, txtobj, fn, distance) {
    var isTouch = !!('ontouchstart' in window);
    if (!isTouch) {
        return
    }
    var TransitionEnd = (function () {
        var el = document.createElement('div');
        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd',
            msTransition: 'MSTransitionEnd',
            transition: 'transitionend'
        };
        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return transEndEventNames[name]
            }
        }
        el = null;
        return false
    }());
    var prefix = (function () {
        var div = document.createElement('div');
        var cssText = '-webkit-transition:all .1s;-moz-transition:all .1s; -Khtml-transition:all .1s; -o-transition:all .1s; -ms-transition:all .1s; transition:all .1s;';
        div.style.cssText = cssText;
        var style = div.style;
        var dom = '';
        if (style.webkitTransition) {
            dom = 'webkit'
        } else {
            if (style.MozTransition) {
                dom = 'moz'
            } else {
                if (style.khtmlTransition) {
                    dom = 'Khtml'
                } else {
                    if (style.oTransition) {
                        dom = 'o'
                    } else {
                        if (style.msTransition) {
                            dom = 'ms'
                        }
                    }
                }
            }
        }
        div = null;
        if (dom) {
            return {
                dom: dom,
                css: '-' + dom + '-'
            }
        } else {
            return false
        }
    }());
    var nowTransition = prefix.dom + 'Transition';
    var nowTransform = prefix.dom + 'Transform';
    var vendors = prefix.css;
    if (!prefix.dom) {
        nowTransition = 'transition';
        nowTransform = 'transform';
        vendors = ''
    }
    distance = parseInt(distance) || 40;
    var startPos = {};
    var doc = document;
    var mydistanceY = 0;
    var isScrolling;
    var isDown = false;
    var maxs2 = 0;
    var isMove = false;
    element.addEventListener('touchstart', function (e) {
        e = e || window.event;
        var touchs = e.touches[0];
        startPos = {
            x: touchs.pageX,
            y: touchs.pageY,
            startTime: +new Date()
        };
        element.style[nowTransition + 'Duration'] = '0s';
        isMove = false;
        isDown = false;
        maxs2 = 0;
        isScrolling = undefined;
        doc.addEventListener('touchmove', mov2, false);
        doc.addEventListener('touchend', end2, false);
        if (element.timer) {
            clearTimeout(element.timer)
        }
    }, false);

    function mov2 (e) {
        e = e || window.event;
        if (e.touches.length > 1 || e.scale && e.scale !== 1) {
            return
        }
        var touchs = e.changedTouches[0];
        var movPos = {
            x: touchs.pageX,
            y: touchs.pageY
        };
        if (typeof isScrolling === 'undefined') {
            isScrolling = !!(isScrolling || Math.abs(movPos.x - startPos.x) < Math.abs(movPos.y - startPos.y))
        }
        if (!isScrolling) {
            isMove = false;
            return
        }
        var movedistance = parseInt(touchs.clientY - startPos.y);
        if (isScrolling && movedistance > 2) {
            e.preventDefault();
            isMove = true;
            isDown = true;
            maxs2 = (movedistance * 0.2).toFixed(1);
            element.style.webkitBackfaceVisibility = 'hidden';
            element.style[nowTransform] = 'translateZ(0) translateY(' + maxs2 + 'px)';
            txtobj.style[nowTransform] = 'translateZ(0)';
            if (maxs2 > distance) {
                txtobj.innerHTML = '释放刷新2'
            } else {
                txtobj.innerHTML = '下拉刷新1'
            }
        } else {
            if (isScrolling && movedistance <= 3) {
                isDown = false;
                if (!isDown) {
                    end2(e);
                    document.removeEventListener('touchmove', mov2, false);
                    txtobj.innerHTML = '下拉刷新2';
                    isDown = true
                }
            }
        }
    }

    function end2 (e) {
        e = e || window.event;
        var touchs = e.changedTouches[0];
        if (isScrolling && isMove) {
            element.style[nowTransition] = vendors + 'transform .55s cubic-bezier(0.65, 0.5, 0.12, 1)';
            element.style.webkitBackfaceVisibility = '';
            element.style[nowTransform] = 'none';
            var duration = +(+new Date() - startPos.startTime);
            if (duration < 150) {
                maxs2 = (distance - 10);
                txtobj.innerHTML = '下拉刷新3';
                return
            }
            var fire = false;

            var handler = function handler () {
                fire = true;
                fn && fn.apply(this, arguments);
                element.removeEventListener(TransitionEnd, handler);
                txtobj.innerHTML = '下拉刷新4';
                txtobj.style[nowTransform] = 'none';
                if (element.timer) {
                    clearTimeout(element.timer)
                }
            }
            if (maxs2 > distance || txtobj.innerHTML === '释放刷新1') {
                element.addEventListener(TransitionEnd, handler)
            }
            element.timer = setTimeout(function () {
                if (!fire && maxs2 > distance) {
                    element.style[nowTransition + 'Duration'] = '.55S';
                    element.style[nowTransform] = 'none';
                    element.style.webkitBackfaceVisibility = '';
                    element.addEventListener(TransitionEnd, handler)
                }
            }, 900)
        }
        doc.removeEventListener('touchmove', mov2);
        doc.removeEventListener('touchmove', end2)
    }
};

export default refreshPage;