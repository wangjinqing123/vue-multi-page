var imgBase = require('../images/arrow.png');
var imgBase2 = require('../images/load.gif');
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
function loadImage (url, id, callback) {
    var img = new window.Image(); // 创建一个Image对象，实现图片的预下载
    img.id = id;
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
    span.id = 'load_text';
    span.style.marginLeft = '4px';
    span.style.color = '#666';
    span.innerText = '';
    return span;
}
function getStyle (dom, styleName) {
    if (dom.currentStyle) {
        return dom.currentStyle[styleName];
    } else {
        return window.getComputedStyle(dom, false)[styleName];
    }
}
var transition = prefix().dom + 'Transition';// transition兼容
var transform = prefix().dom + 'Transform';// transform兼容
var vendors = prefix().css;// 浏览器前缀
if (!prefix().dom) {
    transition = 'transition';
    transform = 'transform';
    vendors = ''
}
var Load = {
    loadImg: '',
    loadText: '',
    loadEle: '',
    mydistanceY: '',
    setElementStyle: function (loadElement) {
        Load.loadEle = loadElement;
        loadElement.style.height = '32px';
        loadElement.style.lineHeight = '32px'
        Load.loadText = createSpan();
        var transform = prefix().dom + 'Transform';
        Load.loadImg = loadImage('../images/arraw.png', '__loadImg', function (img) {
            img.style.width = '18px';
            loadElement.appendChild(img);
            loadElement.appendChild(Load.loadText);
            Load.loadText.innerText = '上拉加载';
        });
    }
}
var Scroll = {
    params: {
        scrollBox: '',
        scrollElement: '',
        loadElement: '',
        maxY: ''
    },
    isLoadReset: false,
    contentHeight: function (scrollBox) {
        var arr = ['paddingTop', 'paddingBottom', 'marginTop', 'marginBottom'];
        var height = 0;
        for (var i = 0; i < 4; i++) {
            height += parseInt(getStyle(scrollBox, arr[i]));
        }
        return scrollBox.clientHeight - height;
    },
    Init: function (boxDiv, scrollDiv, loadDiv, loadFun) {
        var scrollBox = document.querySelector(boxDiv);
        var scrollElement = document.querySelector(scrollDiv);
        var loadElement = document.querySelector(loadDiv);
        var isTouch = !!('ontouchstart' in window);
        if (!isTouch) {
            return;
        }
        var startPos = {};// 开始
        var movePos = {};// 滑动
        var endPos = {};// 结束
        var inertia = {// 惯性
            distance: 0,
            time: 0, // 最后两帧时间差
            time1: 0, // 记住一帧的时间
            time2: 0, // 记住一帧的时间
            moveY1: 0, // 记住一帧的y
            moveY2: 0, // 记住一帧的y
            flag: false// 切换前一帧和当前帧
        };
        var isUpDownScrolling = false;// 是否是上下滚动
        var translateY = 0;// 平移的距离
        // 盒子的高度大于内容的高度
        if (Scroll.contentHeight(scrollBox) > scrollElement.clientHeight) {
            loadElement.style.display = 'none';
        } else {
            loadElement.style.display = 'block';
        }
        var minY = 0;// 最顶部
        var maxY = -(scrollBox.scrollHeight - scrollBox.clientHeight);// 最底部
        Load.setElementStyle(loadElement);// 加载
        var maxs2 = 0;
        var isLoad = false;// 是否加载
        var isMax = false;// 是否在最底部
        var isFresh = false;// 是否刷新
        Scroll.params.scrollBox = scrollBox;
        Scroll.params.scrollElement = scrollElement;
        Scroll.params.loadElement = loadElement;
        Scroll.params.maxY = maxY;
        scrollElement.addEventListener('touchstart', function (e) {
            e = e || window.event;
            var touchs = e.touches[0];
            startPos = {
                startX: touchs.pageX,
                startY: touchs.pageY,
                y: touchs.pageY - translateY
            };
            isLoad = false;
            isFresh = false;
            isMax = false;
            clearInterval(inertia.timer);
            scrollElement.addEventListener('touchmove', moveScroll, false);
            scrollElement.addEventListener('touchend', endScroll, false);
        })
        function moveScroll (e) {
            e = e || window.event;
            if (e.touches.length > 1 || e.scale && e.scale !== 1) {
                return;
            }
            var touchs = e.changedTouches[0];
            movePos = {// 移动点
                moveX: touchs.pageX,
                moveY: touchs.pageY
            };
            // 上下滚动标记
            if (isUpDownScrolling === false) {
                isUpDownScrolling = !!(isUpDownScrolling || Math.abs(movePos.moveX - startPos.startX) < Math.abs(movePos.moveY - startPos.y))
            }
            if (isUpDownScrolling) {
                // 是上下滚动
                scroll();
            }
        }
        // 手滑动时的滚动
        function scroll () {
            var distance = movePos.moveY - startPos.y;
            var isUp = true;// 上拉
            if ((movePos.moveY - startPos.startY) < 0) {
                isUp = true;// 上拉
            } else {
                isUp = false;// 下拉
            }
            // 交替切换上一帧和当前帧，保证上一帧被记住
            if (inertia.flag) {
                inertia.moveY1 = movePos.moveY;
                inertia.time1 = +new Date();
            } else {
                inertia.moveY2 = movePos.moveY;
                inertia.time2 = +new Date();
            }
            inertia.flag = !inertia.flag;
            inertia.distance = Math.abs(inertia.moveY1 - inertia.moveY2);
            inertia.time = Math.abs(inertia.time1 - inertia.time2);
            if (Scroll.isLoadReset && !isUp) { // 正在加载中,并且下拉
                Scroll.isLoadReset = false;
                Scroll.params.scrollElement.style.webkitBackfaceVisibility = '';
                Scroll.params.loadElement.style[transform] = 'translateY(' + Scroll.params.maxY + 'px)';
                Load.loadImg.src = imgBase;
                loadFun();
                return;
            }
            if (distance > minY && !isUp) {
                distance = minY;
                eleTranslateY(distance);
                // 刷新
                refresh();
                isFresh = true;
                return;
            }
            if (distance < Scroll.params.maxY && isUp) {
                distance = Scroll.params.maxY;
                eleTranslateY(distance);
                // 加载
                load();
                isMax = true;
                return;
            }
            eleTranslateY(distance);
        }
        function endScroll (e) {
            e = e || window.event;
            if (e.touches.length > 1 || e.scale && e.scale !== 1) {
                return;
            }
            var touchs = e.changedTouches[0];
            // 上下滚动
            if (isUpDownScrolling) {
                translateY = getTranslateY(scrollElement);// 更新平移距离
                isUpDownScrolling = false;
                endPos = {
                    endX: touchs.pageX,
                    endY: touchs.pageY
                };
                // var interval = 30;
                // var a = getAcceleration().a;// 加速度
                // var t = getAcceleration().t;// 时间
                if (startPos.startY > endPos.endY) {
                    // 上滑
                    // inertiaScroll('up', interval, a, t);
                } else {
                    // 下滑
                    // inertiaScroll('down', interval, a, t);
                }
                if (isLoad && isMax) { // 启动加载
                    var temp = Scroll.params.maxY - 32;
                    scrollElement.style.webkitBackfaceVisibility = '';
                    scrollElement.style[transform] = 'translateY(' + temp + 'px)';
                    loadElement.style[transform] = 'translateY(' + temp + 'px)';
                    Load.loadImg.src = imgBase2;
                    if (typeof loadFun === 'function' && !Scroll.isLoadReset) {
                        Scroll.isLoadReset = true;
                        loadFun();
                    }
                } else if (isMax && !isLoad) { // 滚动到最低部了，但拉的距离不够则不加载
                    scrollElement.style.webkitBackfaceVisibility = '';
                    scrollElement.style[transform] = 'translateY(' + Scroll.params.maxY + 'px)';
                    loadElement.style[transform] = 'translateY(' + Scroll.params.maxY + 'px)';
                    Load.loadImg.src = imgBase;
                }
                if (isFresh) {
                    // console.log(isFresh);
                }
            }
            scrollElement.removeEventListener('touchmove', moveScroll);
            scrollElement.removeEventListener('touchend', endScroll);
        }
        // 惯性滚动
        function inertiaScroll (type, interval, a, t) {
            clearInterval(inertia.timer);
            var transform = prefix().dom + 'Transform';
            inertia.timer = setInterval(function () {
                var speed = parseInt(Math.abs(a * t));
                translateY = getTranslateY(scrollElement);// 更新平移距离
                if (type === 'up') {
                    translateY -= speed;
                } else if (type === 'down') {
                    translateY += speed;
                } else if (type === 'left') {
                } else if (type === 'right') {
                }
                t -= interval;
                if (t < 0.001) {
                    clearInterval(inertia.timer);
                }
                if (translateY > 0) {
                    translateY = 0;
                    clearInterval(inertia.timer);
                }
                if (Scroll.params.maxY > translateY) {
                    translateY = Scroll.params.maxY;
                    clearInterval(inertia.timer);
                }
                scrollElement.style[transform] = 'translateY(' + translateY + 'px)';
            }, interval);
        }
        // 获得加速度和时间
        function getAcceleration () {
            var s = 0;// 位移
            if (inertia.distance <= 5) {
                s = (inertia.distance / 2) + 10;
            } else if (inertia.distance <= 20) {
                s = (inertia.distance / 2) + 20;
            } else {
                s = (inertia.distance / 2) + 30;
            }
            var t = 0;
            if (s / inertia.time < 2) {
                t = s / inertia.time;
            } else if (s / inertia.time < 3) {
                t = s / inertia.time;
            } else if (s / inertia.time < 4) {
                t = s / inertia.time;
            } else {
                t = s / inertia.time;
            }
            var obj = {
                a: (2 * s / Math.sqrt(t)) / 600, // 加速度
                t: 100 * t
            }
            return obj;
        }
        // 平移
        function eleTranslateY (distance) {
            scrollElement.style.webkitBackfaceVisibility = 'hidden';
            scrollElement.style[transform] = 'translateY(' + distance + 'px)';
        }
        // 加载
        function load () {
            maxs2 = (movePos.moveY - startPos.startY) * 0.2;
            var dist = parseInt(Scroll.params.maxY) + parseInt(maxs2);
            scrollElement.style.webkitBackfaceVisibility = 'hidden';
            scrollElement.style[transform] = 'translateY(' + dist + 'px)';
            loadElement.style[transform] = 'translateY(' + dist + 'px)';
            if (Math.abs(maxs2) > 40) {
                Load.loadImg.style[transform] = 'rotate(180deg)';
                isLoad = true;
            } else {
                Load.loadImg.style[transform] = 'rotate(0deg)';
                isLoad = false;
            }
        }
        // 刷新
        function refresh () {
        }
    },
    resetScrollHeight: function () {
        Scroll.params.maxY = -(Scroll.params.scrollBox.scrollHeight - Scroll.params.scrollBox.clientHeight);// 最底部
        // 盒子的高度大于内容的高度
        if (Scroll.contentHeight(Scroll.params.scrollBox) > Scroll.params.scrollElement.clientHeight) {
            Scroll.params.loadElement.style.display = 'none';
        } else {
            Scroll.params.loadElement.style.display = 'block';
        }
    },
    // 重置
    resetLoad: function () {
        // 加载
        Scroll.isLoadReset = false;
        Scroll.params.scrollElement.style.webkitBackfaceVisibility = '';
        Scroll.params.scrollElement.style[transform] = 'translateY(' + Scroll.params.maxY + 'px)';
        Scroll.params.loadElement.style[transform] = 'translateY(' + Scroll.params.maxY + 'px)';
        Load.loadImg.src = imgBase;
    },
    refreshImg: '',
    refreshText: '',
    RefreshEle: '',
    isFreshReset: false,
    setElementStyle: function (refreshElement) {
        Scroll.RefreshEle = refreshElement;
        refreshElement.style.height = '32px';
        refreshElement.style.lineHeight = '32px'
        refreshElement.style.marginTop = '-32px';
        Scroll.refreshText = createSpan();
        var transform = prefix().dom + 'Transform';
        Scroll.refreshImg = loadImage('../images/arraw.png', '__freshImg', function (img) {
            img.style.width = '18px';
            img.style[transform] = 'rotate(180deg)';
            refreshElement.appendChild(img);
            refreshElement.appendChild(Scroll.refreshText);
            Scroll.refreshText.innerText = '下拉刷新';
        });
    },
    refreshPage: function (boxDiv, scrollDiv, refreshDiv, fn, distance) {
        var scrollBox = document.querySelector(boxDiv);
        var scrollElement = document.querySelector(scrollDiv);
        var refreshElement = document.querySelector(refreshDiv);
        Scroll.setElementStyle(refreshElement);
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
        distance = parseInt(distance) || 40;
        var startPos = {};
        var mydistanceY = 0;
        var isScrolling;
        var isDown = false;
        var maxs = 0;
        var isMove = false;
        scrollBox.addEventListener('touchstart', function (e) {
            e = e || window.event;
            var touchs = e.touches[0];
            startPos = {
                x: touchs.pageX,
                y: touchs.pageY,
                startTime: +new Date()
            };
            scrollBox.style[transition + 'Duration'] = '0s';
            isMove = false;
            isDown = false;
            maxs = 0;
            isScrolling = undefined;
            document.addEventListener('touchmove', moveRefresh, false);
            document.addEventListener('touchend', endRefresh, false);
            if (scrollBox.timer) {
                clearTimeout(scrollBox.timer)
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
            if (getTranslateY(scrollElement) < 0) {
                if (Scroll.isFreshReset) {
                    Scroll.resetFresh();
                }
                return;
            }
            if (isScrolling && movedistance > 2) {
                e.preventDefault();
                isMove = true;
                isDown = true;
                maxs = (movedistance * 0.2).toFixed(1);
                scrollBox.style.webkitBackfaceVisibility = 'hidden';
                scrollBox.style[transform] = 'translateZ(0) translateY(' + maxs + 'px)';
                refreshElement.style[transform] = 'translateZ(0)';
                if (maxs > distance) {
                    Scroll.refreshImg.style[transform] = 'rotate(0deg)';
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
                scrollBox.style[transition] = vendors + 'transform .55s cubic-bezier(0.65, 0.5, 0.12, 1)';
                scrollBox.style.webkitBackfaceVisibility = '';
                scrollBox.style[transform] = 'none';
                var duration = +(+new Date() - startPos.startTime);
                if (duration < 150) {
                    maxs = (distance - 10);
                    // console.log('下拉刷新');
                    return
                }
                var fire = false;
                var handler = function handler () {
                    fire = true;
                    // 回调
                    if (!Scroll.isFreshReset) {
                        // 避免重复加载数据
                        fn && fn.apply(this, arguments);
                    }
                    Scroll.isFreshReset = true;
                    scrollBox.removeEventListener(TransitionEnd, handler);
                    refreshElement.style[transform] = 'none';
                    if (scrollBox.timer) {
                        clearTimeout(scrollBox.timer)
                    }
                }
                if (maxs > distance) {
                    scrollBox.addEventListener(TransitionEnd, handler);
                    Scroll.refreshImg.src = imgBase2;
                    Scroll.RefreshEle.style.marginTop = '0px';
                }
                scrollBox.timer = setTimeout(function () {
                    if (!fire && maxs > distance) {
                        scrollBox.style[transition + 'Duration'] = '.55S';
                        scrollBox.style[transform] = 'none';
                        scrollBox.style.webkitBackfaceVisibility = '';
                        scrollBox.addEventListener(TransitionEnd, handler)
                    }
                }, 900)
            }
            document.removeEventListener('touchmove', moveRefresh);
            document.removeEventListener('touchmove', endRefresh)
        }
    },
    resetFresh: function () {
        Scroll.isFreshReset = false;
        Scroll.refreshImg.src = imgBase;
        Scroll.refreshImg.style[transform] = 'rotate(180deg)';
        Scroll.RefreshEle.style.marginTop = '-32px';
    }
}
export default Scroll;