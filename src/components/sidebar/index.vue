<template>
    <div class="main">

        <div class="introduce">
                <h2 style="margin-top:10px;font-size:26px;font-weight:100;color:#676a6c;font-family:open sans,Helvetica Neue,Helvetica,Arial,sans-serif">{{indexInfo.subtitle}}</h2>
                <p style="color:#676a6c;font-size:13px;font-family:open sans,Helvetica Neue,Helvetica,Arial,sans-serif">{{indexInfo.description}}</p>
        </div>


        <div class="line"></div> 
        <div class="contact">
            <el-card>
                <div class="el-card-head">
                    <span>联系信息</span>
                </div>
                <div class="el-card-body">
                        <div class="body">
                            <p>
                                <i class="el-icon-user-solid"> QQ号</i>
                                <a target="_blank" href="https://qm.qq.com/cgi-bin/qm/qr?k=HcobkHn0P_IdFwvTUEE7TiNd_JMGk4AC&noverify=0" class="el-link el-link--default">
                                    <span class="el-link--inner">{{indexInfo.contactQQ}}</span></a>

                            </p>
                            <p>
                                <i class="el-icon-s-promotion"> Telegram号</i>
                                <a target="_blank">{{indexInfo.contactTelegram}}</a>
                            </p>
                        </div>
                </div>
            </el-card>
        </div>


    </div>
</template>




<script>
export default {
    name: 'main',

    data() {
        return {
            showContent: false,
             indexInfo:{
                 subtitle:"",
                 description:"",
                 imgUrl:"",
                 contactQQ:"",
                 contactTelegram:"", 
             }
        }
    },

    created(){
        this.getIndexInfo()
    },

    methods: {
        getIndexInfo(){

              var _this = this;
              this.$axios.get("http://103.118.42.205:7001/api/v1/index").then(function (res) {
                    
              if (res.data.code == 200){
                       
                   _this.indexInfo = res.data.data
                   _this.showContent = true
               }

                   
                }).catch(function (res) {
                    alert(res)
                    
                })
        }
    }
}
</script>



<style scoped>

.main{
   display: block;
   margin: 50 0;
   height: 100%;
   width: 100%;
}


.introduce{
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-left: 20px;
    padding-right: 10px;
    margin-top:50px;
    margin-left: 40px;
    margin-right: 50px;


}
.contact{
    padding-left: 20px;
    padding-right: 10px;
    color: #303133;

}
.el-card-head {
    line-height: 20px;
    padding: 14px 15px 7px;
    border-bottom: 1px solid #e6ebf5;
}
.line {
    position: relative;
    margin-top: 10px;
    width: 100%;
    height: 1px;
    background-color: #d4d4d4;
    font-size: 16px;
    color: rgba(101, 101, 101, 1);
  }
  
  .el-card{
      margin-top: 40px;
      margin-left: 40px;
      border-radius: 4px;
      border: 1px solid #e6ebf5;
      color: #303133;
      font-size: 13px;
      width: 350px;
      max-height: 160px;
  }
  .el-card-body{
      padding: 15px 20px 20px 20px;
  }
  .p {
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;

  }
  .a:focus, a:hover{
      cursor: pointer;
      color: inherit;
      text-decoration:none;
  }
</style>