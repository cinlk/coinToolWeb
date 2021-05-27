<template>
       <div class="container" @click="cp">

           <div v-if="!hasPermission">没有权限，请联系服务商</div>
            <div v-if="showContent"  v-loading="loading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading">
            <h2 class="tag">空投列表</h2>
    
            <div class="list" >

                <div  v-for="(article,index) in articleList" :key="index">
                <div class="article">
       
                    <div   @click="showairDropCoin(article.id)">
                        <h4 class="title">
                            <span class="click">{{brief(article.title,"title")}}</span>
                        </h4>
                        <p class="des">
                            {{brief(article.des,"des")}}
                        </p>

                    </div>
                  
                    <div class="time">发布时间 {{dateFormat(article.time)}}</div>
                </div>
            </div>

            </div>
            

            <div class="pagingation">
              <el-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="currentPage"
                  :page-sizes="[10, 30, 50, 100]"
                  :page-size="pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="totalCount"
                  :disabled="loading">
                </el-pagination>
            </div>


            </div>
          
       </div>
  

    
</template>


<script>

export default {
    name: 'airdrops',

    data: function () {
        return {
          articleList: [],
          totalCount:0,
          pageSize:10,
          currentPage:1,
          loading: true,   
          hasPermission: true,
          showContent: true,

        }
    },
    methods: {
        brief: function (des, type) {
            if (des.length > 50 && type == "title"){
                return des.substr(0,50) + '...'
            }else if(des.length >80 && type == "des"){
                return des.substr(0,80) + '...'
            }else{
                return des
            }
            
        },

        dateFormat: function(t) {
            return t.substr(0,10)
        },

        getLists(){
              var _this = this;
              _this.loading = true;
              this.$axios.post(
                "airdrop/list",
                {
                  page: _this.currentPage,
                  limit: _this.pageSize,
                }).then(function (res) {
                    
                    
                       _this.loading = false
                       if (res.data && res.data.code == 200){
                        //   _this.tableDataEnd = res.data.data.items
                          _this.articleList = res.data.data.items
                          _this.totalCount = res.data.data.totalCount
                          _this.showContent = true
                         
                         
                          _this.hasPermission = true
                          //错误码不在httpstatus 中，在返回的数据中
                       }else if(res.data && res.data.code == 403){
                           _this.showContent = false
                           _this.$message.error("没有权限访问，请联系服务商")
                           _this.hasPermission = false
                       }else{
                           _this.showContent = false
                           _this.$message.error("系统错误")
                       }
                   

                   
                }).catch(function (res) {
                     _this.$message.error("系统异常")
                     _this.loading = false
                     _this.showContent = false
                })
        },
        handleSizeChange(val) {
          
          this.pageSize = val;
          this.handleCurrentChange(1);
        },

        handleCurrentChange(val) {
          this.currentPage = val;
          this.getLists()
        },

        showairDropCoin(val){
            
            let url = this.$router.resolve({path: `/airdrop/detail/${val}`})
            window.open(url.href, '_blank')
             
        },

        cp(){
               this.$emit("closeDropmenu")
        }
    },

        activated(){
            this.getLists()
            
      },
   

}

</script>

<style  scoped>


.tag {
    display: block;
    text-align: center;
}

.container{
    padding: 30px;
    background-color: rgb(243, 235, 248);
}
.list{
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
 
}
.article{
    display: flex;
    flex-direction: column;
    justify-items: flex-start;
    align-items: flex-start;
    padding: 10px;
    background-color: white;
    margin: 10px;
    width: 770px;
    align-self: center;
}
.article .title{
    font-size: 18px;
    color: #333;
    white-space: nowrap;
    line-height: 26px;
}

.article .des{
    font-size: 14px;
    color: #666,!important;
    line-height: 24px;
    max-height: 48px;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.article .time{
    font-size: 12px;
    color: #bbb;
    margin-top: 4px;
}

.pagingation{
    position: relative;
    float: left;
	left: 25%;
    bottom: 20px;
}

.click{
    cursor: pointer;
}
.click:hover{
       color: orangered;  /*DiV背景颜色*/

}
</style>