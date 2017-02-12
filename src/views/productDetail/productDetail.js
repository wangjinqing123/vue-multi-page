import { Vue, $, Common, Init } from 'js/base'
require('./scss/productDetail.scss')
import productDetail from './productDetail.vue'
import '../../assets/scss/usage/layout/header.scss';
Init();
var homeVue = new Vue({
    el: '#productDetail',
    template: '<div class="pageview"><product-detail><product-detail/></div>',
    components: {
        'product-detail': productDetail
    }
})
var u = navigator.userAgent;
var app = navigator.appVersion;
var isAndroid = false;
var index = u.indexOf('Android');
console.log(index)