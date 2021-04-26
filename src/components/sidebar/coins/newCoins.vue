<template>
    <div class="container">

      <div v-if="!hasPermission">没有权限，请联系服务商</div>
      <div class="header" v-if="showContent">新币榜单</div>  
      <div class="table" v-if="showContent">
          <!-- <div> -->
          <!-- <el-input v-model="tableDataName" placeholder="请输入姓名" style="width:240px"></el-input> -->
          <!-- <el-button type="primary" @click="doFilter">搜索</el-button>
          <el-button type="primary" @click="openData">展示数据</el-button> -->
          <!-- </div> -->
        <div class="wrap_table">    
              <el-table
                v-loading="loading"
                :data="tableDataEnd"
                border
                stripe
                :cell-style="{textAlign:'center', height:'60px',fontSize:'15px',lineHeight:'15px'}"
                :header-cell-style="{textAlign:'center', color:'black'}"
                colu>
                <el-table-column
                  prop="coinName"
                  label="名称"
                  width="180"
                  >
                </el-table-column>
                <el-table-column
                  prop="addTime"
                  label="添加时间"
                  width="180">
                </el-table-column>
                <el-table-column
                  prop="status"
                  label="状态">
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="showCoin(scope.row.coinId)">查看</el-button>

                   </template>
                </el-table-column>
              </el-table>
        </div>

        <div class="pagingation">
              <el-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="currentPage"
                  :page-sizes="[10, 30, 50, 100]"
                  :page-size="pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="totalItems">
                </el-pagination>
        </div>
      </div>  
    
    </div>
</template>
    
    
<script>
   
  export default {
      
      data() {
        return {
          showContent:true,
          loading: true,   
          tableDataBegin: [],
          tableDataName: "",
          tableDataEnd: [],
          currentPage: 1,
          pageSize: 10,
          totalItems: 0,
          filterTableDataEnd:[],
         
          hasPermission: true,
        };
      },
      created() {
        // this.totalItems = this.tableDataBegin.length;
        // if (this.totalItems > this.pageSize) {
        //   for (let index = 0; index < this.pageSize; index++) {
        //     this.tableDataEnd.push(this.tableDataBegin[index]);
        //   }
        // } else {
        //   this.tableDataEnd = this.tableDataBegin;
        // }
        console.log("newCoins page created")
        //this.getLists()

      },
      methods: {

        getLists(){
              var _this = this;
              _this.loading = true;
              this.$axios.post(
                "newcoins/list",
                {
                  page: _this.currentPage,
                  limit: _this.pageSize,
                  order: "desc"
                }).then(function (res) {
                    
                    
                       _this.loading = false
                       if (res.data && res.data.code == 200){
                          _this.tableDataEnd = res.data.data.items
                          _this.totalItems = res.data.data.totalCounts
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

                // data => {
                //   console.info(data);
                //   _this.loading = false;
                //   _this.tableData = data.list;
                //   _this.total = data.total;
                // }
              
    
        },
        showCoin(val){
            
            let url = this.$router.resolve({path: `/coinDetail/${val}`})
            // 跳转到新界面
            window.open(url.href, '_blank')
             
        },
       
      
        handleSizeChange(val) {
          
         
          this.pageSize = val;
          this.handleCurrentChange(1);
        },


        handleCurrentChange(val) {
          console.log("newCoins page change")
          this.currentPage = val;
          this.getLists()
        //   //需要判断是否检索
        //   if (!this.flag) {
        //     this.currentChangePage(this.tableDataBegin);
        //     console.log(this.tableDataEnd);
        //   } else {
        //     this.currentChangePage(this.filterTableDataEnd);
        //     console.log(this.tableDataEnd);
        //   }
        },//组件自带监控当前页码

       currentChangePage(list) {
          let from = (this.currentPage - 1) * this.pageSize;
          let to = this.currentPage * this.pageSize;
           this.tableDataEnd = [];
           for (; from < to; from++) {
             if (list[from]) {
                this.tableDataEnd.push(list[from]);
              }
            }
        }
      },

      activated(){
            console.log("newCoins page actived")
            
            this.getLists()
            
      },
  };


</script>



<style scoped>

   .container {
       margin: 50px;
   }
   .header {
       margin-top: 50px;
       text-align: center;
       font-size: 30px;
       font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
   }
   .table {
       display: flex;
       flex-direction: column;
       margin-top: 50px;
       width: 100%;
       justify-items: center;
       align-items: center;
       height: 100%;
       
   }
   .wrap_table{
       width: 70%;
      
   }

   .pagingation{
       width: 70%;
       margin-top: 30px;
   }
 


</style>