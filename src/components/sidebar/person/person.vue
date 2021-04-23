<template>
    <div class="container">
        
      <h2>个人信息</h2>
       <el-form>
          <el-form-item label="手机号">
              <span>{{userInfo.phone}}</span>
          </el-form-item>

           <el-form-item label="用户类型">

           </el-form-item>
          <el-form-item    label="使用的服务">
              
              <div class="services">
                <div v-for=" (item, index) in userInfo.services" :key="index">
                   <span style="font-size:15px; margin-right:20px">服务名称 {{item.name}}</span>
                   <span>到期时间 {{item.endTime}}</span>
                </div>
              </div>
              
           
          </el-form-item>
          
       </el-form>
    </div>
</template>



<script>
 
 export default {
        data(){
            return{
                userInfo:{
                    phone:"",
                    services: [
                        {
                            name:"",
                            endTime:"",
                            actime:false
                        }
                    ]
                }
            }
        },

        created(){

            this.getUserInfo()
        },

        methods:{
            getUserInfo(){
              
              var _this = this;
              this.$axios.get("user/info").then(function (res) {
                    
                    
                    if (res && res.data.code == 200){
                          _this.userInfo = res.data.data
                       }
                   

                   
                }).catch(function (res) {
                    alert(res)
           
                })
            }
        }

 }


</script>


<style  scoped>

.container {
    margin: 50px;
}
.services{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
}

.el-form-item__label{
    white-space:pre-line;
}

</style>
