<template>
    <el-container class="container">
        <el-header class="header" style="height:40px">
              <el-row>
                  <el-col :span="16" class="headerLogo">
                      <div class="grid-content bg-purple">
                          <img src="../assets/top.png" alt="无法显示图片" style="width:400px;height: 30px" />
                      </div>
                  </el-col>
                  <el-col :span="8" class="userInfo">
                       <div class="grid-content bg-purple-light">
                           <span class="el-dropdown-link userinfo-inner">欢迎你</span>
                           <span class="userinfo-inner" @click="signout">退出</span>
                       </div>
                  </el-col>
              </el-row>

        </el-header>
        <el-container>
            <el-aside class="sidebar" :width="isCollapse? '64px':'180px'">

                <div class="toggle-button" @click="toggleCollapse">|||</div>

                <el-scrollbar  style="height: 100%; color:#fff" :native="false" wrapStyle=""  wrapClass="" viewClass="" viewStyle="" :noresize="false" tag="section"
                >

                 <el-menu :unique-opened="true"  router="true"
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
                               <i class="el-icon-location"></i>
                               <span>{{item1.name}}</span>
                           </template>
                           
                          
                           <el-menu-item  
                              class="menuItem"
                              @click="clickMenuItem"
                              v-for="(item2,index) in item1.children"
                              :key="item2.path"
                              :index="item2.path"
                           
                           >

                               <i class="el-icon-location"></i>
                               <span>{{item2.name}}</span>
                           </el-menu-item>

                    </el-submenu>
                </el-menu>
                </el-scrollbar>
            </el-aside>
            <el-main class="main">

            <!-- <router-view></router-view>     -->
             
                	<keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
               
            </el-main>     
        </el-container>
    </el-container>
</template>

<script>

export default{
    name: "Home",

    data() {
        return {
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
                      name: "otc",
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
                      ],
                },
                {
                  path: "orderinfomange",
                  name: "订单信息管理",
                  order: "3",
                  children: [
                    {
                      path: "orderinfomange",
                      name: "订单信息",
                    }
                  ],
                },

                {
                  path: "datamangeinfo",
                  name: "数据字典",
                  order: "4",
                  children: [
                    {
                      path: "datamangeinfo",
                      name: "岗位类型",
                    },
                  ],
                },



            ]
        }
    },

    computed: {
       
    },

    methods: {
        signout() {
            this.$confirm("退出登录, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }).then(() => {
            this.$router.push({ path: "/" });
          });
        },

        //回到首页
        clickTitle() {
          this.style.display = "block";
        },

        clickMenuItem() {
          console.log("....");
          this.style.display = "none";
        },

        toggleCollapse() {
            this.isCollapse = !this.isCollapse
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
    background: darkcyan;
    color: #fff;
    

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



.headerLogo {
  line-height: 40px;
  margin-top: 5px;
}

.userInfo {
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
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}


</style>