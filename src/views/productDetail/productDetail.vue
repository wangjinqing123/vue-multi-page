<template>
    <div class="container">
        <header class="center_header">
            <ul class="flex">
                <li>
                    <div class="fl">
                        <a class="fl back_icon" href="#"></a>
                        <span class="fl" v-text="back"></span>
                    </div>
                    <span class="fl close" v-text="close"></span>
                </li>
                <li> 
                    <h1 v-text="title"></h1>
                </li> 
                <li>
                </li>
            </ul>
        </header>
        <div id="body">
           <ul style="height:1000px;">
                <li>1asdf</li>
                <li>2</li>
                <li>3</li>
                <li>4safd</li>
           </ul>
        </div>
    </div>
</template>
<script>
import IScroll from 'iscroll';
export default {
    data () {
        return {
            title: '产品详情',
            back: '返回',
            close: '关闭'
        }
    },
    mounted: function () {
        var s = new IScroll('#body', {
            preventDefault: false,
            click: true,
            probeType: 3
        });
    },
    computed: {
    },
    methods: {
    }
}
</script>
