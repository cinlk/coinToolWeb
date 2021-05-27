<template>
    <div>
        <div v-if="!hasPermission">没有权限，请联系服务商</div>

        <div class="content" v-if="showContent">
            
            <!-- <div class="time">
                <span>{{this.detail.time}}</span>
            </div> -->
            <div class="title">
                <span>{{this.detail.title}}</span>
            </div>
            <div class="des">
                <p>{{this.detail.des}}</p>
            </div>
        
                <ul class="pics">
                    <li style="list-style:none"  v-for="(url, index) in this.detail.imageUrls" :key="index">
                        <a :href="url" target="_blank" >
                        <img  class="img" :src="url" />
                        </a>
                    </li>
                </ul>
           
        </div>

    </div>
</template>


<script>
 
 export default {
     data(){
         return {
           hasPermission: true, 
           showContent:false, 
           detail:{
               title:"",
               des:"",
               time:"",
               imageUrls:[]
           }
         }
     },

     created(){
        let id = this.$route.params.uid
        
        this.getairDropbyId(id)
    },
    methods:{
        getairDropbyId(id){
              
              var _this = this;
              this.$axios.get(`airdrop/detail/${id}`).then(function (res) {
                    
                    if (res && res.data.code == 200){
                       
                         _this.detail = res.data.data
                         _this.showContent = true
                        _this.hasPermission = true
                        // 错误码不在httpstatus 中，在返回的数据中
                       }else if(res.data && res.data.code == 403){
                           _this.showContent = false
                           _this.hasPermission = false
                           _this.$message.error("没有权限访问，请联系服务商")
                       }else{
                           _this.showContent = false
                           _this.$message.error("系统错误")
                       }
                   
                }).catch(function (res) {
                   _this.$message.error("系统异常")
                   _this.showContent = false

                    
                })
        },
    }
 }
</script>

<style scoped>


.content{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
}

.title{
    font-size: 32px;
    color: #333;
    word-break: break-word;
    margin-bottom: 15px;
    font-weight: bold;

}
.des{
    font-size: 16px;
    color:#333;
    line-height: 30px;
    margin-bottom: 16px;
    word-break: break-all;
}

.pics{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    padding: 0;
    margin: 0;
    
}

.img {
    height: 500px;
    widows: 500px;
    vertical-align: top;
    padding: 10px;
}

</style>
