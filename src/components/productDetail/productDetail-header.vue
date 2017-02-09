<template>
    <header class="center_header">
        <ul class="flex">
            <li style="flex_item">
                <div class="fl flex">
                    <a class="back_icon" href="#"></a>
                    <span class="left_text" v-text="back"></span>
                </div>
                <span class="fl left_text" v-text="close"></span>
            </li>
            <li class="flex_item"> 
                <h1 v-text="title"></h1>
            </li>
            <li class="flex_item">
            </li>
        </ul>
  </header>
</template>

<script>
  export default {
      data () {
          return {
              title: '产品详情',
              back: '返回',
              close: '关闭'
          }
      },
      mounted: function () {
      },
      computed: {
      },
      methods: {
      }
  }
</script>

<style lang='scss' scoped>
  @import "../../assets/scss/base/necessary.scss";
  header{
    position: fixed;
    width: 100%;
    left:0;
    top:0;
    z-index: 3;
    height: 128px; 
    padding: 40px px2rem(24) 0px;
    background:$gray;
    ul{
        li{
            h1{
                text-align: center;
                color:$white;
                @include px2px(font-size,34);
                line-height:88px;
            }
            .left_text{ 
                color:$white;
                @include px2px(font-size,32);
                line-height:88px;
                margin:0 px2rem(14);
            }
            .back_icon{
                width:40px;
                height:88px;
                display:inline-block;
                background:url(images/icon_back.png) scroll no-repeat center center;
            }
        }
    }
  }
</style>
