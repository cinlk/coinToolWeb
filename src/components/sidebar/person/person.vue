<template>
    <div class="container" @click="cp"  v-if="showContent" >
        
      <h2>个人信息</h2>
       <el-form>
          <el-form-item label="手机号">
              <span>{{userInfo.phone}}</span>
          </el-form-item>

           <el-form-item label="用户类型">
                <span>{{userInfo.type}}</span>
           </el-form-item>
          <el-form-item    label="当前服务">
              
              <div class="services">
                <div v-for=" (item, index) in userInfo.services" :key="index">
                   <span style="font-size:15px; margin-right:20px">服务名称 {{item.name}}</span>
                   <span>到期时间 {{item.endTime}}</span>
                   <span v-if="!item.active" style="margin-left:10px; color:crimson">(服务过期,如需继续试用请联系服务商)</span>
                   <span v-if="item.active" style="margin-left:10px; color:green">(可用)</span>

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
                showContent:false,
                hasData:false,
                userInfo:{
                    phone:"",
                    type:"",
                    member: false,
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

        activated(){
            if (this.hasData == false){
                this.getUserInfo()
            }
        },

        methods:{
            getUserInfo(){
              
              var _this = this;
              this.$axios.get("user/info").then(function (res) {
                    
                    
                    if (res.data && res.data.code == 200){
                          _this.userInfo = res.data.data
                          _this.hasData = true
                          _this.showContent = true
                          if(localStorage.userInfo && localStorage.userInfo.extra){
                              localStorage.userInfo.extra.type = _this.userInfo.type
                              localStorage.userInfo.extra.member = _this.userInfo.member
                          }
                          _this.$message.success("获取信息成功")
                     }else if (res.response){
                            if(res.response.data.code == 404){
                                _this.$message.error("用户不存在")
                            }else{
                                _this.$message.error("获取用户数据失败")
                            }
                     }
                    _this.hasData = false
                   
                }).catch(function (res) {
                    _this.$message.error("系统异常")
                    _this.hasData = false
           
                })
            },
            cp(){
                this.$emit("closeDropmenu")
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
