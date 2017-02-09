import { Vue, $ } from 'js/base'

require('./scss/home.scss')
import homeIndex from './index.vue'
var homeVue = new Vue({
    el: '#home',
    template: '<div class="pageview">index page</div>',
    components: {
    }
})
