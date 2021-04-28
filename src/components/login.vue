<template>
    <div class="login">
        <div class="brick">
            起来搬砖了~
        </div>
         <el-form 
            class="login-form"
            label-position="top"
            label-width="100px"
            v-model="loginData"
         >


          <h2 style="text-align:center">用户登录</h2>

           <el-form-item>
            <el-input  type="tel" placeholder="手机号" v-model="loginData.phoneNum">  </el-input>
            </el-form-item>

            <el-form-item>
                        <div class="verify">
                                <el-input   type="tel"  style="margin-right:50px" placeholder="短信验证码" v-model="loginData.code"></el-input>
                                <el-button
                                    type="primary"
                                    @click="getVerify"
                                    class="codeButton"
                                    :disabled="disabled=!show"
                                >
                                <span v-show="show">获取验证码</span>
                                <span v-show="!show">{{count}} s</span>
                                </el-button>
                        </div>
                        
            </el-form-item>


            <el-button class="login-btn"  :disabled="!loginEnable"  type="primary" @click="gotologin()">登录</el-button>
            <p></p>
          <router-link style="font-size:15px" :to="loginEnable ? 'registry':'' " >注册账号</router-link>

         </el-form>
    </div>
   
</template>


<script>
    
    
   export default{
    
     name: "login",
     data(){
        return {
            loginEnable: true,
            identifyCodes: "1234567890",
            identifyCode: "",
            show: true,
            count:"",
            timer:null,
            loginData:{
                 phoneNum:"",
                 code:"",
            }
        }
     },

     created: function () {
      
       
       if (localStorage.token && localStorage.token != ""){
           this.$store.commit('$_setToken', localStorage.token)
           this.$router.push({path: '/home'})
           return
       }
       this.$store.commit('disConnectWebSocket')
       this.$store.commit('stopCheckTokenInterval')

     },
     methods: {

          getVerify() {
            // 验证手机号
            if (this.checkPhone() == false) {
                return false;
            } else {

                // 发送验证码请求
                var _this = this;
                this.$axios.post("sms",{
                     type:"login",
                     phone: _this.loginData.phoneNum
                }).then(function (res) {                    
                    if(res.data && res.data.code == 200){
                        _this.$message.success("发送验证码成功");
                        return
                    }
                    if (res.response){
                        if (res.response.data.code == 404){
                            _this.$message.error("用户不存在");
                        }else if(res.response.data.code == 400){
                            _this.$message.error("请求参数错误"); 
                        }else if(res.response.data.code == 429){
                           _this.$message.error(res.response.data.message)
                        }else{
                            _this.$message.error("发送验证码失败");
                        }
                    }
                   
                }).catch(function (error) {
                    _this.$message.error("异常错误");
                });

                const TIME_COUNT = 60; //更改倒计时时间
                if (!this.timer) {
                    this.count = TIME_COUNT;
                    this.show = false;
                    this.timer = setInterval(() => {
                        if (this.count > 0 && this.count <= TIME_COUNT) {
                            this.count--;
                        } else {
                            this.show = true;
                            clearInterval(this.timer); // 清除定时器
                            this.timer = null;
                        }
                    }, 1000);
                }
            }
        },
        checkPhone() {
            let phone = this.loginData.phoneNum;
            if (!/^1[3456789]\d{9}$/.test(phone)) {
                this.$message.error("请填写正确的手机号");
                return false;
            }


        },
        gotologin(){

            if (this.checkPhone() == false) {
                return false;
            }
            if( this.loginData.code.length !=6  || !/^[0-9]+\.?[0-9]*$/.test(this.loginData.code)){
               this.$message.error("请填写正确的验证码");
                return
            }
            var _this = this;
            this.loginEnable = false;
            this.$axios.post("user/login",{
                     code: _this.loginData.code,
                     phone: _this.loginData.phoneNum
                }).then(function (res) {
                   if (res.data && res.data.code == 200){
                        let info = res.data.data
                       
                        _this.$store.commit('SaveLoginDatafunction', res.data.data)
                        _this.$store.commit('$_setToken', info.token)
                        _this.$router.push({path: '/home'})
                      
                        return 
                        
                   }else if(res.response){
                        
                        if(res.response.data.code == 410){
                            _this.$message.error("手机或验证码错误");

                        }else if(res.response.data.code == 429){
                            _this.$message.error("登录太频繁请稍后再试");
                        }else{
                            _this.$message.error("登录失败");
                        }
                        
                   }
                   _this.loginEnable = true 
                }).catch(function (error) {
                    _this.loginEnable = true 
                    _this.$message.error("系统异常", error);
                });
        }
     }
     
 }



</script>


<style  scoped>


.login{
        height: 100%;
        background: #324152;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }


.brick{
    font-size: 30px;
    margin-bottom: 30px;
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    color: #B22222;
    
}
.login-form{
        width: 380px;
        background: white;
        border-radius: 10px;
        padding: 40px;
}

.login-form>>>.el-input__inner{
       
        border-bottom-color: grey;
        border-top: 0;
        border-left: 0;
        border-right: 0;
        border-radius: 0;
        border-bottom-width: 1px;
        
    } 


.login-btn{
          width: 100%;
    }
.verify {
    
      width: 100%;
      /* height: 40px; */
      border-radius: 10px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      justify-items: center;
    }

.codeButton{
    width: 160px;
}

</style>
