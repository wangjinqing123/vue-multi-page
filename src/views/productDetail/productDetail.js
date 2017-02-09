import { Vue, $, Common } from 'js/base'
import productDetailHeader from '../../components/productDetail/productDetail-header.vue'
require('./scss/productDetail.scss')
import productDetail from './productDetail.vue'
var homeVue = new Vue({
    el: '#productDetail',
    template: '<div class="pageview"><productDetail-Header></productDetail-Header><product-detail></product-detail></div>',
    components: {
        'productDetail-Header': productDetailHeader,
        'product-detail': productDetail
    }
})
