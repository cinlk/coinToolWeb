<template>
    <div class="registry">

        <el-form 
            class="registry-form"
            label-position="top"
            label-width="100px"
            v-model="registryData"
        >

            <h2 style="text-align:center">用户注册</h2>
            <el-form-item>
            <el-input  type="tel" placeholder="手机号" v-model="registryData.phoneNum">  </el-input>
            </el-form-item>

            <el-form-item>
                        <div class="verify">
                                <el-input   type="tel"  style="margin-right:50px" placeholder="短信验证码" v-model="registryData.code"></el-input>
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


     
            <el-form-item >
                <div class="verify">
                    <el-input v-model="registryData.verifyCode" style="margin-right:50px" placeholder="图形验证码" ></el-input>
                    <div  @click="refreshCode()">
                       <s-identify :identifyCode="identifyCode"></s-identify >
                    </div>
                </div>
                
            </el-form-item>

            <el-button class="registry-btn"  :disabled="!enableRegistry" type="primary" @click="gotoregistry()">注册</el-button>
            <p></p>
            <router-link style="font-size:15px" :to="enableRegistry ? 'login':'' ">已有账号? 登录</router-link>

        </el-form> 

    </div>
</template>


<script>



export default {
    name: "registry",
    data() {
        return  { 
            enableRegistry: true,
            identifyCodes: "1234567890",
            identifyCode: "",
            show: true,
            count:"",
            timer:null,
            registryData: {
               phoneNum: "",
               code: "",
               verifyCode: "",
            },
        };
    },
    mounted() {
    this.identifyCode = "";
    this.makeCode(this.identifyCodes, 4);
    },

    created(){
        this.$store.commit('disConnectWebSocket')
        this.$store.commit('stopCheckTokenInterval')
    },
    methods: {
           gotoregistry() {
               if (this.checkPhone() == false) {
                return false;
               }

               if(this.registryData.code.length !=6  || !/^[0-9]+\.?[0-9]*$/.test(this.registryData.code)){
                   this.$message.error("请填写正确的验证码");
                    return
                }
               if (this.registryData.verifyCode != this.identifyCode){
                   this.$message.error("图像验证码错误")
                    
                   return
               }

                this.enableRegistry = false;        
               var _this = this;
               this.$axios.post("user/registry",{
                    phone: _this.registryData.phoneNum,
                    code: _this.registryData.code
               }).then(function (res) {
                   if (res.data && res.data.code == 201){
                        _this.$message.success("注册成功")
                        let info = res.data.data
                        _this.$store.commit('$_setToken', info.token)
                        _this.$store.commit('SaveLoginDatafunction', info)
                        _this.$router.push({path: '/home'})

                        return
                   }else if(res.response){
                        if(res.response.data.code == 410){
                            _this.$message.error("手机号或验证码错误")
                        }else if(res.response.data.code == 409){
                                _this.$message.error("账号已存在")
                            
                        }else if (res.response.data.code == 429){
                           _this.$message.error("注册太频繁请稍后再试");

                        } else{
                             _this.$message.error("注册失败")
                        }
                       
                   }

                   _this.enableRegistry = true;
               }).catch(function  (res) {
                   _this.$message.error("注册异常")

                   _this.enableRegistry = true;
               })
           },

          randomNum(min, max) {
                return Math.floor(Math.random() * (max - min) + min);
            },
        refreshCode() {
          this.identifyCode = "";
          this.makeCode(this.identifyCodes, 4);
        },

        makeCode(o, l) {
          for (let i = 0; i < l; i++) {
            this.identifyCode += this.identifyCodes[
              this.randomNum(0, this.identifyCodes.length)
            ];
          }
    },


    getVerify() {
            // 验证手机号
            if (this.checkPhone() == false) {
                return false;
            } else {


                 // 发送验证码请求
                var _this = this;
                this.$axios.post("sms",{
                     type:"registry",
                     phone: _this.registryData.phoneNum
                }).then(function (res) {                    
                    if (res.data && res.data.code == 200){
                        _this.$message.success("发送验证码成功");
                    }else if(res.response){
                        if (res.response.data.code == 409){
                         _this.$message.error("账号已存在");

                        }else if(res.response.data.code == 429){
                         _this.$message.error(res.response.data.message);
                        }else{
                         _this.$message.error("发送验证码失败");
                        }
                    }
                   
                }).catch(function (error) {
                    _this.$message.error("发送验证码异常");
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
            let phone = this.registryData.phoneNum;
            if (!/^1[3456789]\d{9}$/.test(phone)) {
                this.$message.error("请填写正确的手机号");
                return false;
            }


        }
    }

};

</script>


<style scoped>
    .registry{
        height: 100%;
        background: #324152;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .registry-form{
        width: 380px;
        background: white;
        border-radius: 10px;
        padding: 40px;
       
    }
    .registry-form>>>.el-input__inner{
       
        border-bottom-color: grey;
        border-top: 0;
        border-left: 0;
        border-right: 0;
        border-radius: 0;
        border-bottom-width: 1px;
        
    } 

    .registry-btn{
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