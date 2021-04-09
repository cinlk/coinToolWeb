<template>
    <div class="login">
        <el-form 
            class="login-form"
            label-position="top"
            label-width="100px"
            v-model="loginData"
        >

            <h2>用户登录</h2>
            <el-form-item label="用户名" >
                <el-input v-model="loginData.username"></el-input>
            </el-form-item>
            
            <el-form-item label="密码">
                <el-input v-model="loginData.password"></el-input>
            </el-form-item>

            <el-button class="login-btn"  type="primary" @click="gotoLogin()">登录</el-button>
            
        </el-form> 

    </div>
</template>


<script>
export default {


    name: "login",
    data() {
        return  { 
            loginData: {
               username: "",
               password: "",
            },
        };
    },
    methods: {
           gotoLogin() {
               if (this.loginData.username == "1" && this.loginData.password == "1"){

                    this.$router.push({path: '/home'})
                    this.$message({
                       showClose: true,
                       message: '登录成功',
                       type: 'success'
                   });

               }else{
                   this.$message({
                       showClose: true,
                       message: '登录失败',
                       type: 'error'
                   });
               }
           }
    }

};

</script>


<style scoped>
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

    .login-btn{
          width: 100%;
    }
    
</style>