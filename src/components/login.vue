<template>
    <div class="login">
        
         <el-form 
            class="login-form"
            label-position="top"
            label-width="100px"
            v-model="loginData"
         >

          <h2>用户登录</h2>

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
          <router-link style="font-size:15px" to="registry">注册账号</router-link>

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
                    // http status OK 被axios 进行了处理，这只http为ok才有数据处理 ？
                    console.log(res)
                    if (res && res.data.code == 200){
                        _this.$message.success("发送验证码成功");
                    }else{
                         _this.$message.error("发送验证码错误", res.data.message);
                    }
                   
                }).catch(function (error) {
                    _this.$message.error("发送验证码出错");
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
            var _this = this;
            this.loginEnable = false;
            this.$axios.post("user/login",{
                     code: _this.loginData.code,
                     phone: _this.loginData.phoneNum
                }).then(function (res) {
                   if (res && res.data.code == 200){
                        let info = res.data.data
                        _this.$store.commit('$_setToken', info.token)
                        _this.$router.push({path: '/home'})
                   }else{
                        _this.$message.error("登录失败", res.data.message);
                   }
                   _this.loginEnable = true 
                   //_this.$message.success("发送验证码成功");
                }).catch(function (error) {
                    _this.loginEnable = true 
                    _this.$message.error("登录失败", error);
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
