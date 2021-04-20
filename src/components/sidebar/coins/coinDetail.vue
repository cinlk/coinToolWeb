<template>
    <div class="container">
        <div class="header">
            <!-- <div>
                <img :src="projectIconImgUrl"/>
                <div>{{this.coinName}}</div>
            </div>  -->
            <div class="title">
                    <img :src="formData.projectIconImgUrl" style="width:80px; height:60px"/>
                    <label>{{formData.coinName}}</label>
            </div>
            <div class="jys">
                    <div>上线交易所</div>
                    <div>{{formData.exchangeName}}</div>
            </div>
            <div class="jys">
                <div>项目官网</div>
                <div>{{formData.officeSite}}</div>
            </div>

            <div class="description"> 
                <div>项目简介</div>
                <div>{{formData.description}}</div>
            </div>
              

            <div class="line"></div>  

           

        </div>

        <div class="body">


             <div class="col">
                 <div>释放规则</div>
                 <div>{{formData.releaseRule}}</div>
             </div>

             <div class="line"></div> 
             <div class="col">
                 <div>是否锁仓</div>
                 <div>{{formData.lock}}</div>
             </div>
              <div class="line"></div> 
             <div class="col">
                 <div>模式类型</div>
                 <div>{{formData.businessType}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div>投资机构</div>
                 <div>{{formData.investors}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div>预计上市时间</div>
                 <div>{{formData.ieoTime}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div>代币发行</div>
                 <div>{{formData.initialCoins}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div>流通募集</div>
                 <div>{{formData.fundRaise}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div>募资价格</div>
                 <div>{{formData.prePrice}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div>社团参与代表</div>
                 <div>{{formData.communityPartitions}}</div>
             </div>
             <div class="line"></div> 
             <div class="col">
                 <div>项目亮点</div>
                 <div>{{formData.highlights}}</div>
             </div>
        </div>


    </div>
</template>


<script>
export default {

    data(){
        return {
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
              //_this.loading = true;
              this.$axios.post(
                "http://103.118.42.205:7001/api/v1/newcoins/info",
                {        
                  coinId: parseInt(id)
                }).then(function (res) {
                    
                    //_this.loading = false
                    if (res.data.code == 200){
                        //   _this.tableDataEnd = res.data.data.items
                        //   _this.totalItems = res.data.data.totalCounts
                         console.log(res.data.data)
                         _this.formData = res.data.data
                       }
                   

                   
                }).catch(function (res) {
                    //alert(res)
                    console.log(res)
                    //_this.loading = false
                })
        }
    }


}

</script>


<style scoped>

.header{
    display: flex;
    flex-direction: column;
    width: 100%;
}

.body{
    display: flex;
    flex-direction: column;
    width: 100%;
}
.title{
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    

}
.jys{

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    
}
.col{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
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