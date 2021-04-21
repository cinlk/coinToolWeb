<template>
    <div class="container" v-if="showContent">
        <div class="header">
            <!-- <div>
                <img :src="projectIconImgUrl"/>
                <div>{{this.coinName}}</div>
            </div>  -->
            <div class="title">
                    <img :src="formData.projectIconImgUrl" style="margin-left:10px;object-fit:contain;width:80px; height:60px;"/>
                    <div style="width:50%;text-align:center; position:absolute;font-size:20px;font-weigh:bold;font-family: ARIAL,'Microsoft Yahei','微软雅黑'">{{formData.coinName}}</div>
            </div>
            <div class="jys">
                    <div style="margin-right:20px;margin-left:10px">上线交易所</div>
                    <div style="color:gray">{{formData.exchangeName}}</div>
            </div>
            <div class="jys">
                
                <div style="margin-right:20px;margin-left:10px">项目官网</div>
                <div style="color:gray;cursor:pointer" @click="toNewSite">{{formData.officeSite}}</div>
            </div>

            <div class="description"> 
                <div style="margin-left:10px">项目简介</div>
                <div style="color:gray;font-size:14px;margin-left:10px">{{formData.description}}</div>
            </div>
              

            <div class="line"></div>  

           

        </div>

        <div class="body">


             <div class="col">
                 <div style="margin-left:10px;width:80px">释放规则</div>
                 <div style="font-size:13px;margin-right:10px;margin-left:10px"> {{formData.releaseRule}}</div>
             </div>

             <div class="line"></div> 
             <div class="col">
                 <div style="margin-left:10px">是否锁仓</div>
                 <div style="font-size:13px;margin-right:10px">{{formData.lock == true ? "是":"否"}}</div>
             </div>
              <div class="line"></div> 
             <div class="col">
                 <div style="margin-left:10px">模式类型</div>
                 <div style="font-size:13px;margin-right:10px">{{formData.businessType}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div style="margin-left:10px;width:80px">投资机构</div>
                 <div style="font-size:13px;margin-right:10px;margin-left:10px">{{formData.investors}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div style="margin-left:10px">预计上市时间</div>
                 <div style="font-size:13px;margin-right:10px">{{formData.ieoTime == "" ? "暂无": formData.ieoTime}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div style="margin-left:10px">代币发行</div>
                 <div style="font-size:13px;margin-right:10px">{{formData.initialCoins}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div style="margin-left:10px">流通募集</div>
                 <div style="font-size:13px;margin-right:10px">{{formData.fundRaise}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div style="margin-left:10px">募资价格</div>
                 <div style="font-size:13px;margin-right:10px">{{formData.prePrice}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div style="margin-left:10px">社团参与代表</div>
                 <div style="font-size:13px;margin-right:10px">{{formData.communityPartitions}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div style="margin-left:10px">项目亮点</div>
                 <div style="font-size:13px;margin-right:10px">{{formData.highlights}}</div>
             </div>
        </div>


    </div>
</template>


<script>
export default {

    data(){
        return {
           showContent:false, 
           formData: {
               lock:false,
               ieoTime:"",
               communityPartitions:"",
               officeSite:"",
               description:"",
               coinContractAddress:"",
               prePrice:"",
               highlights:"",
               initialCoins:"",
               coinName:"",
               releaseRule:"",
               exchangeName:"",
               projectIconImgUrl:"",
               fundRaise:"",
               businessType:"",
               investors:"",
           } 
          

        }
    },

    created(){
        let id = this.$route.params.coinId
        
        this.getCoinById(id)
    },
    methods:{
        getCoinById(id){
              
              var _this = this;
              this.$axios.post(
                "http://103.118.42.205:7001/api/v1/newcoins/info",
                {        
                  coinId: parseInt(id)
                }).then(function (res) {
                    
                    if (res.data.code == 200){
                       
                         _this.formData = res.data.data
                         _this.showContent = true
                       }
                   
                }).catch(function (res) {
                    alert(res)
                    
                })
        },
        toNewSite(){
            
            window.open(this.formData.officeSite, '_blank')
        }
    }


}

</script>


<style scoped>

.container{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin: 25px 0;
    
}
.header{
     
    display: flex;
    flex-direction: column;
    width: 50%;
    align-self: center;
    justify-content: center;
    border-style: solid;
    border-width: 1px;
    border-bottom: none;
}

.body{
    display: flex;
    flex-direction: column;
    width: 50%;
    border-top: none;
    border-style: solid;
    border-width: 1px;
    
}
.title{
    margin: 5px 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

}
.jys{
    margin: 5px 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 15px;
    
    
}
.description{
    font-size: 15px;
    margin: 5px 0;
    text-align: left;
}
.col{
    margin: 5px 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
}
.line {
    position: relative;
    margin: 0 auto;
    width: 100%;
    height: 1px;
    background-color: #d4d4d4;
    text-align: center;
    font-size: 16px;
    color: rgba(101, 101, 101, 1);
  }

</style>