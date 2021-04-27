<template>
    <el-container class="container">
       
       
        <el-header  class="header" style="height:40px">
              <el-row style="height:40px">
                  <el-col :span="globalNotifyMsg != '' ? 8:16"  >
                      <div  class="grid-content bg-purple">
                          <img src="../assets/top.png" alt="无法显示图片" style="width:250px;height: 40px" />
                      </div>
                  </el-col>

                  <el-col :span="globalNotifyMsg != '' ? 8:0" >
                        
                         <div  v-if="globalNotifyMsg != ''" style="font-size:10px;line-height:13px;color:cyan;text-align:center;padding-top:10px">
                           <i class="el-icon-warning"></i>
                           <span >{{globalNotifyMsg}}</span>
                         </div>

                  </el-col >

                  <el-col :span="8" class="userInfo" id="aaa">
                       <div class="grid-content bg-purple-light">
                           
                           <span v-if="!userInfo.extra.member" class="el-dropdown-link userinfo-inner" style="color:ghostwhite"> {{userInfo.extra.type}}  {{userInfo.extra.huobi.split(" ")[0]}}到期</span> 
                           <span v-if="userInfo.extra.member" class="el-dropdown-link userinfo-inner">欢迎你   {{ userInfo.extra.type }} </span>
                            
                       </div>
                        
                       <div class="avatar-wrapper el-dropdown-selfdefine" role="button">
                              <img    src="../assets/avatar_icon.png" @click="personal" class="avatar"/>
                              <i    class="el-icon-caret-bottom"></i>
                               
                         </div> 
                      

                  </el-col>
              </el-row>


      


        </el-header>
        <el-container >
            <el-aside class="sidebar" :width="isCollapse? '64px':'180px'">

                <div class="toggle-button" @click="toggleCollapse"><i v-bind:class=" isCollapse ? 'el-icon-s-unfold':'el-icon-s-fold' "></i></div>

                <el-scrollbar  style="height: 100%; color:#fff" :native="false" wrapStyle=""  wrapClass="" viewClass="" viewStyle="" :noresize="false" tag="section"
                >

                 <el-menu :unique-opened="true"  :router="true"
                      theme="dark"
                      :default-active="menuIndex.path"
                      class="menu"
                      :collapse="isCollapse"
                      :collapse-transition="false"
                      background-color=" #3A3A3A"
                      text-color="#fff"
                      active-text-color="#ffd04b"
                      mode="vertical"

                > 
                
            <el-menu-item :key="menuIndex.path" :index="menuIndex.path">
                <span>{{menuIndex.name}}</span>
                
            </el-menu-item>


                 <el-submenu  :index="' '+item1.order" v-for="(item1,index) in menuData" :key="item1.path">
                           <template  slot="title" @click="clickTitle">
                               <i class="el-icon-menu"></i>
                               <span>{{item1.name}}</span>
                           </template>
                           
                          
                           <el-menu-item  
                              class="menuItem"
                              @click="clickMenuItem"
                              v-for="(item2,index) in item1.children"
                              :key="item2.path"
                              :index="item2.path"
                           
                           >

                               <i class="el-icon-star-on"></i>
                               <span>{{item2.name}}</span>
                           </el-menu-item>

                    </el-submenu>
                </el-menu>
                </el-scrollbar>
            </el-aside>
            <el-main class="main" >

            <!-- <router-view></router-view>     -->
             
                	<keep-alive>
      <router-view @closeDropmenu="closeDropmenu" v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view  @closeDropmenu="closeDropmenu" v-if="!$route.meta.keepAlive"></router-view>
               
            </el-main>     
        </el-container>

      <ul v-if="UserDropMenuVisible"   class="el-dropdown-menu el-popper el-dropdown-menu--medium" 
      :style="{zIndex: 2050, position: 'absolute', top: '40px', width:'90px', left: `${searchWidth}px`}"
      
      >
          <div   @click="toPerson" aria-current="page"><li tabindex="-1" class="el-dropdown-menu__item">个人中心</li></div>
          <li tabindex="-1" class="el-dropdown-menu__item" @click="signout"> <span>退出登录</span></li>
      </ul>


    </el-container>




		


</template>

<script>
import { mapState } from 'vuex'

export default{
    name: "Home",

    data() {
        return {

            timer:null,
            userInfo:{},
            searchWidth:800,
            UserDropMenuVisible:false,
            isCollapse: false,
            style: {
                display: "block",
            },

            menuIndex: {
                      name: "首页",
                      order: "1",
                      path:'index',
            },
            menuData: [
        
                {
                      path: "otc",
                      name: "OTC市场",
                      order: "2",
                      children: [
                        {
                          path: "huobi",
                          name: "huobi",
                        },

                         {
                          path: "okex",
                          name: "okex",
                        },
                        {
                          path: "binance",
                          name: "binance",
                        }
                      ],
                },
                {
                  path: "coin",
                  name: "新币数据",
                  order: "3",
                  children: [
                    {
                      path: "newcoin",
                      name: "新币榜单",
                    }
                  ],
                },

                {
                  path: "datamangeinfo",
                  name: "其它",
                  order: "4",
                },



            ]
        }
    },
    // computed:{
    //   screenWidth: function () {
    //     //console.log(document.body.clientWidth)
    //     return (document.body.clientWidth - 600) +'px';
    //   }
    // },


    computed: mapState(["globalNotifyMsg"]),

    mounted(){
       console.log("home page mounted")
   
     

      this.searchFormWidth(); // 组件初始化的时候不会触发onresize事件，这里强制执行一次
	    window.onresize = () => {
	      if(!this.timer){ // 使用节流机制，降低函数被触发的频率
	        this.timer = true;
	        let that = this; // 匿名函数的执行环境具有全局性，为防止this丢失这里用that变量保存一下
	        setTimeout(function(){
	          that.searchFormWidth();
	          that.timer = false;
	        },400)
	      }
	    }

      
      // const h = this.$createElement
      // this.$notify({
      //   title:"",
      //   message:h('i',{ style: 'color: teal'}, '这是提示文案这是提示文案这是提示'),
      //   duration:0,
      //   position:"bottom-left",
      //   type:"warning",
      //   showClose:false,
       
      // });
          // 有时 不触发 destroy 有时不触发 deactived ? 不能销毁定时器
        // 线上时间改成10分钟 比较长， 跳转到login界面间隔时间长, 可以到注册
        // if(this.timer == null){
        //     this.timer =  setInterval(() => {
        //             // 检查token
        //             _this.$axios.get("token/check")
        //             console.log("home ticker")
        //         }, 50000);
        // }


   },

   destroyed(){
     console.log("home page destroyed")
     window.onresize = null;

      // clearInterval(this.timer)
      // this.timer = null
   },
   beforeDestroy(){
      console.log("home page before Destroy")
   },

  //  beforeRouteLeave(to, from, next){
  //    clearInterval(this.timer);
  
  //    this.timer = null;
  //    next()
  //  },

   created(){
     console.log("home page created")
     this.loadUserInfo();
     // start websocket connnection
     this.$store.commit('connectWebSocket')
     this.$store.commit('checkTokenInterval')

   },
   activated(){
        console.log("home page active")
       
   },

   deactivated(){

      console.log("home page deactivated")

     
   },

 



    // computed: mapState(["userInfo"]),

    methods: {

      loadUserInfo(){
        var info = JSON.parse(localStorage.getItem("userInfo") || '{}')
        this.userInfo = info;

      },

   

      searchFormWidth() {
	      let w = window.innerWidth;
        
        var dom1 = document.querySelector('#aaa')
        //console.log(w)
	      if (w > 1314){
          this.searchWidth = w + 250 -  parseInt(getComputedStyle(document.getElementById('aaa'),null).getPropertyValue('width').split(".")[0])

        }
        else if (w > 1000){
          this.searchWidth = w + 200 -  parseInt(getComputedStyle(document.getElementById('aaa'),null).getPropertyValue('width').split(".")[0])

        }else {
          this.searchWidth = w + 100 -  parseInt(getComputedStyle(document.getElementById('aaa'),null).getPropertyValue('width').split(".")[0])

        }
	      
	    },
 
        signout() {

            this.UserDropMenuVisible = !this.UserDropMenuVisible
            var _this = this;
            this.$confirm("退出登录, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }).then(() => {
            _this.$store.commit('$_removeStorage');
            _this.$router.push({ name: "login" });
            _this.$axios.put("user/logout");
          });
        },

        //回到首页
        clickTitle() {
          this.style.display = "block";
        },

        clickMenuItem() {
          
          this.style.display = "none";
        },

        toggleCollapse() {
            this.isCollapse = !this.isCollapse
        },
        personal(){
          //console.log(screenWidth)
          //console.log("personal")
          this.UserDropMenuVisible = !this.UserDropMenuVisible
        },

        toPerson(){
          this.UserDropMenuVisible = !this.UserDropMenuVisible
          if (this.$route.name != "person"){
            this.$router.push({path: 'person'})
          }
        },

        // 子组件 传递数据给父组件
        closeDropmenu(){
         
          this.UserDropMenuVisible = false
        }
      
       



    }
};
  

</script>


<style scoped>

.container {
  height: 100%;
  font-size: 15px;
}

.header{
    background: rgb(60,152,188);
    color: #fff;
    padding: 0;
    

}
.sidebar{
    background: #3a3a3a;
    /* color: #fff; */
    height: 100%;
}
.main{
    height: 100%;
    background-color:white;
    padding: 0;
    
}



.avatar-wrapper{
  align-items: center;
  width: auto;
  height: auto;
  cursor: pointer;
}


.userInfo {
  margin-top: 2px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  
  line-height: 40px;
  text-align: center;
  
}


.menu {
  background: none;
  color: #fff;
  
}

.el-scrollbar__wrap{
  overflow-x: hidden;
}


.toggle-button {
    background-color: #4a5064;
    font-size: 20px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
    
}

.avatar{

    margin-left: 20px;
    width: 35px;
    height:35px;
    border-radius:50%;
    /* background: url("../assets/avatar.png") no-repeat; */
    border-style: none;
    /* border: 1px  solid rgb(80,149,182);  */
   
}

a {
  text-decoration: none;
}
 
.router-link-active {
  text-decoration: none;
}



</style>