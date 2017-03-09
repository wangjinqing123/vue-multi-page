/*
* h5 拖拽刷新*
* @param element {obj}    原生dom对象 下拉元素盒子dom元素
* @param txtobj  {str}    下拉元素文本提示dom元素
* @param fn {function}     回调函数   *window.location.load(window.location.href);   或者回调调用ajax
* @param distance {number} 滑动距离 默认不写40px
*/
var imgBase = require('../images/arrow.png')
var imgBase2 = require('../images/load.gif')
var Refresh = {
    refreshImg: '',
    refreshText: '',
    RefreshEle: '',
    prefix: (function () {
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
    }()),
    setElementStyle: function (txtobj) {
        Refresh.RefreshEle = txtobj;
        txtobj.style.height = '32px';
        txtobj.style.lineHeight = '32px'
        txtobj.style.marginTop = '-32px';
        Refresh.refreshText = createSpan();
        var nowTransform = Refresh.prefix.dom + 'Transform';
        Refresh.refreshImg = loadImage('../images/arraw.png', function (img) {
            img.style.width = '18px';
            img.style[nowTransform] = 'rotate(180deg)';
            txtobj.appendChild(img);
            txtobj.appendChild(Refresh.refreshText);
            Refresh.refreshText.innerText = '下拉刷新';
        });
    },
    refreshPage: function (element, scroll, txtobj, fn, distance) {
        Refresh.setElementStyle(txtobj);
        var isAppend = false;
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
        var nowTransition = Refresh.prefix.dom + 'Transition';
        var nowTransform = Refresh.prefix.dom + 'Transform';
        var vendors = Refresh.prefix.css;
        if (!Refresh.prefix.dom) {
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
            doc.addEventListener('touchmove', moveRefresh, false);
            doc.addEventListener('touchend', endRefresh, false);
            if (element.timer) {
                clearTimeout(element.timer)
            }
        }, false);
        function moveRefresh (e) {
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
            if (getTranslateY(scroll) < 0) {
                return;
            }
            if (isScrolling && movedistance > 2) {
                e.preventDefault();
                isMove = true;
                isDown = true;
                maxs2 = (movedistance * 0.2).toFixed(1);
                element.style.webkitBackfaceVisibility = 'hidden';
                element.style[nowTransform] = 'translateZ(0) translateY(' + maxs2 + 'px)';
                txtobj.style[nowTransform] = 'translateZ(0)';
                if (maxs2 > distance) {
                    Refresh.refreshImg.style[nowTransform] = 'rotate(0deg)';
                    // console.log('asdsdf')
                } else {
                    // console.log('a')
                }
            } else {
                if (isScrolling && movedistance <= 3) {
                    isDown = false;
                    if (!isDown) {
                        endRefresh(e);
                        document.removeEventListener('touchmove', moveRefresh, false);
                        // txtobj.innerHTML = '下拉刷新';
                        // console.log('下拉刷新');
                        isDown = true
                    }
                }
            }
        }

        function endRefresh (e) {
            e = e || window.event;
            var touchs = e.changedTouches[0];
            if (isScrolling && isMove) {
                element.style[nowTransition] = vendors + 'transform .55s cubic-bezier(0.65, 0.5, 0.12, 1)';
                element.style.webkitBackfaceVisibility = '';
                element.style[nowTransform] = 'none';
                var duration = +(+new Date() - startPos.startTime);
                if (duration < 150) {
                    maxs2 = (distance - 10);
                    // console.log('下拉刷新');
                    return
                }
                var fire = false;
                var handler = function handler () {
                    fire = true;
                    fn && fn.apply(this, arguments);
                    element.removeEventListener(TransitionEnd, handler);
                    txtobj.style[nowTransform] = 'none';
                    if (element.timer) {
                        clearTimeout(element.timer)
                    }
                }
                if (maxs2 > distance) {
                    element.addEventListener(TransitionEnd, handler);
                    Refresh.refreshImg.src = imgBase2;
                    Refresh.RefreshEle.style.marginTop = '0px';
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
            doc.removeEventListener('touchmove', moveRefresh);
            doc.removeEventListener('touchmove', endRefresh)
        }
    },
    reset: function () {
        var nowTransition = Refresh.prefix.dom + 'Transition';
        var nowTransform = Refresh.prefix.dom + 'Transform';
        var vendors = Refresh.prefix.css;
        if (!Refresh.prefix.dom) {
            nowTransition = 'transition';
            nowTransform = 'transform';
            vendors = ''
        }
        Refresh.refreshImg.src = imgBase;
        Refresh.refreshImg.style[nowTransform] = 'rotate(180deg)';
        Refresh.RefreshEle.style.marginTop = '-32px';
    }
}

function getStyle (dom, styleName) {
    if (dom.currentStyle) {
        return dom.currentStyle[styleName];
    } else {
        return window.getComputedStyle(dom, false)[styleName];
    }
}
function loadImage (url, callback) {
    var img = new window.Image(); // 创建一个Image对象，实现图片的预下载
    img.id = 'refresh_img';
    img.src = imgBase;
    if (img.complete) { // 如果图片已经存在于浏览器缓存，直接调用回调函数
        callback(img);
        return img; // 直接返回，不用再处理onload事件
    }
    img.onload = function () { // 图片下载完毕时异步调用callback函数。
        callback(img);// 将回调函数的this替换为Image对象
    };
    return img;
};
function createSpan () {
    var span = document.createElement('span');
    span.id = 'refresh_text';
    span.style.marginLeft = '4px';
    span.style.color = '#666';
    span.innerText = '';
    return span;
}
function getTranslateY (dom) {
    var transform = prefix().dom + 'Transform';
    var translateY = 0;
    if (dom.style[transform]) {
        var regex = new RegExp('translateY((.*px))', 'g');
        translateY = parseInt(dom.style[transform].match(regex)[0].substring(11));
    }
    return translateY;
}
function prefix () {
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
}
export default Refresh;
