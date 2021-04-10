<template>
  <div id="root">
    <div id="head">
      <div style="font-weight:bolder;">OTC套利工具{{(track.dataSourceIndex== 0 || track.dataSourceIndex == 1)?"--火币":"--OK欧易"}}</div>
      <div style="font-size: 12px;">
        买入USDT价：<el-input-number style="margin-right:15px;" v-model="usdtPrice.buy" controls-position="right" :min="1.00" :max="1000.00" :precision="2" :step="0.01" size="mini"></el-input-number>
        卖出USDT价：<el-input-number v-model="usdtPrice.sell" controls-position="right" :min="1.00" :max="1000.00" :precision="2" :step="0.01" size="mini"></el-input-number>
        <el-button style="margin-left:50px;" type="primary" @click="showSettingDialog" icon="el-icon-s-tools" size="mini">设置</el-button>
      </div>
      
    </div>
    <div id="body">
      <!-- <div style="margin-top: 4px; margin-left: 5%; font-size: 12px; color:#606266;" v-if="track.log.is_profix_base_10000">利润(RMB)：依据设定的买卖USDT价，算出的每交易10000RMB的套利</div> -->
      <!-- <div style="margin-top: 0; margin-left: 5%;"> -->
        <div :style="'position: absolute; left:' + (80+index*70)+'px;'+'top:' + (40+index*50)+'px;'" v-drag v-for="(item, index) in setting.otc" v-bind:key="index">
          <!-- <div v-if="track.show_guadan && item !=='usdtrmb'" style="font-size: 12px; color: black;">以卖一价挂单利润为：{{otcDepth[item] && otcDepth[item].profix_base_ask_1}}</div> -->
          <!-- <div v-if="track.show_guadan && item !=='usdtrmb'" style="font-size: 12px; color: black;">以买一价挂单利润为：{{otcDepth[item] && otcDepth[item].profix_base_bid_1}}</div> -->
          <div class="otc-ad">
            <el-table
            
              max-height="650"
              size="mini"
              
              border
              :data="otcDepth[item] ? otcDepth[item].bids : []"
              :row-class-name="otcRowClassName"
              :cell-style="otcCellStyle"
              :header-cell-style="otcHeaderCellStyleBuy"
              
             
            > 
              <el-table-column label="序号"  type="index" width="35" align="left" >
                <template slot="header">
                  <div style="display:flex;flex-direction: column;justify-content: space-between;">
                    <button  class="setting-btn" @click="showOtcTableSetting(item)"><i class="el-icon-s-tools" style="margin-left: -8px;"></i></button>
                    <!-- <span>设置</span> -->
                  </div>
                </template>
              </el-table-column>

              <el-table-column :label="item.toUpperCase().substr(0,item.length-3) + ' 购买广告'" align="center"  >
                <el-table-column prop="price" label="价格" show-overflow-tooltip  :width="columnWidth(item)"   > </el-table-column>
                <el-table-column prop="profix" label="利润" v-if="item !=='usdtrmb'" show-overflow-tooltip width="70"> </el-table-column>
                <el-table-column prop="size" label="数量" show-overflow-tooltip width="80"> </el-table-column>
                <el-table-column prop="name" label="昵称" show-overflow-tooltip  align="left"  width="100"> </el-table-column>
              </el-table-column>
            </el-table>
            <el-table
              max-height="650"
              size="mini"
              :style="maxWidhStyle(item)"
              border
              :data="otcDepth[item] ? otcDepth[item].asks : []"
              :row-class-name="otcRowClassName"
              :cell-style="otcCellStyle"
              :header-cell-style="otcHeaderCellStyleSell"
            >
              <el-table-column :label="item.toUpperCase().substr(0,item.length-3) + ' 出售广告'" align="center">
                <el-table-column prop="price" label="价格" show-overflow-tooltip :width="columnWidth(item)"> </el-table-column>
                <el-table-column prop="profix" label="利润" v-if="item !=='usdtrmb'" show-overflow-tooltip width="70"></el-table-column>
                <el-table-column prop="size" label="数量" show-overflow-tooltip width="80"> </el-table-column>
                <el-table-column prop="name" label="昵称" show-overflow-tooltip align="left"  width="100"> </el-table-column>
              </el-table-column>
            </el-table>
          </div>
        </div>
      <!-- </div> -->
      
    </div>
    
    <el-dialog
      title="设置"
      :visible.sync="settingDialogVisible"
      width="50%">
      <!-- <span>这是一段信息</span> -->
      <el-form ref="settingForm" label-width="100px" label-position="left">
        <el-form-item label="显示OTC前20">
          <el-checkbox-group v-model="settingForm.otc" v-if="track.dataSourceIndex== 2">
            <el-checkbox v-for="(item, index) in track.sub_ok.otcRmb" v-bind:key="index" :label="item" name="type">{{item.toUpperCase().slice(0,-3)}}</el-checkbox>
            <!-- <el-checkbox label="usdtrmb" name="type">USDT</el-checkbox>-->
          </el-checkbox-group>
          <el-checkbox-group v-model="settingForm.otc" v-if="(track.dataSourceIndex== 0 || track.dataSourceIndex== 1)">
            <el-checkbox v-for="(item, index) in track.sub_huobi.otcRmb" v-bind:key="index" :label="item" name="type">{{item.toUpperCase().slice(0,-3)}}</el-checkbox>
            <!-- <el-checkbox label="usdtrmb" name="type">USDT</el-checkbox>-->
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="显示实时价格">
          <el-checkbox-group v-model="settingForm.realtimePrice" v-if="track.dataSourceIndex== 2">
            <el-checkbox v-for="(item, index) in track.sub_ok.depthUsdt" v-bind:key="index" :label="item" name="type">{{item.toUpperCase().slice(0,-4)}}</el-checkbox>
            <!-- <el-checkbox label="btcusdt" name="type">BTC</el-checkbox> -->
          </el-checkbox-group>
          <el-checkbox-group v-model="settingForm.realtimePrice" v-if="(track.dataSourceIndex== 0 || track.dataSourceIndex== 1)">
            <el-checkbox v-for="(item, index) in track.sub_ok.depthUsdt" v-bind:key="index" :label="item" name="type">{{item.toUpperCase().slice(0,-4)}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="颜色习惯" :inline-message="true">
          <div style="display: flex;flex-direction: row; justify-content: start; align-items:center; height: 100%; width:100%;">
            <el-switch
              style="display: block; height:100%; line-height: 100%;"
              v-model="colorSelect">
            </el-switch>
            <div style="font-weight: bold; margin-left: 14px;">{{colorSelect? "红涨绿跌" : "绿涨红跌"}}</div>
          </div>
        </el-form-item>
        <!-- <el-form-item label="手续费" >
          <el-select v-model="settingForm.feeVisiable" placeholder="是否手续费抵扣">
            <el-option label="不抵扣" value="1"></el-option>
            <el-option label="抵扣" value="2"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="费率" v-show="settingForm.feeVisiable == 2" style="width: 30%;" inline="true">
          <el-input v-model="settingForm.fee"></el-input><span>%</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="settingDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="settingConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="行显示设置"
      :visible.sync="otcSettingVisible"
      width="50%">
      <!-- <span>这是一段信息</span> -->
      <el-form ref="otcSettingForm" label-width="100px" label-position="left">
        <el-form-item label="红色高亮">
          <el-input v-model="otcSettingForm.redName" placeholder="请输入要高亮显示的昵称"></el-input>
        </el-form-item>
        <el-form-item label="蓝色高亮">
          <el-input v-model="otcSettingForm.blueName" placeholder="请输入要高亮显示的昵称"></el-input>
        </el-form-item>
        <el-form-item label="绿色高亮">
          <el-input v-model="otcSettingForm.greenName" placeholder="请输入要高亮显示的昵称"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="otcSettingVisible = false">取 消</el-button>
        <el-button type="primary" @click="otcSettingConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- <div id="bottom" >
      <div style="display: flex;flex-direction: row;justify-content: center; height:25px; align-items: center; font-weight:bold;"
        v-for="(item, index) in setting.realtimePrice" v-bind:key="index">
        <div :style=" ('color:' + (colorSelect ? style.greenColor : style.redColor) + ';' ) + 'margin-right: 20px;'">
          卖二 {{ marketDepth[item]&&marketDepth[item].asks[1] ? marketDepth[item].asks[1].price : ""}} 卖一 {{ marketDepth[item]&&marketDepth[item].asks[0] ? marketDepth[item].asks[0].price : ""}}
        </div>
        <div :style="style.blackColor">{{item.toUpperCase()}}</div>
        <div :style="  ('color:' + (colorSelect ? style.redColor : style.greenColor) + ';' ) + 'margin-left: 20px;'">
          买一 {{ marketDepth[item]&&marketDepth[item].bids[0] ? marketDepth[item].bids[0].price : "" }} 买二 {{ marketDepth[item]&&marketDepth[item].bids[1] ? marketDepth[item].bids[1].price : ""}}
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data: function () {
    return {
      style:{
        redColor: "#ff4949",
        greenColor: "#13ce66",
        blackColor: "#303133",
      },
      colorSelect: true,
      settingDialogVisible: false,
      otcSettingVisible: false,
      setting:{
        realtimePrice:["btcusdt"],//btcusdt,ltcusdt
        otc:["usdtrmb","btcrmb",],//btcrmb,ltcrmb,usdtrmb
        fee:0,
      },
      settingForm:{
        realtimePrice:[],
        otc:[],
        feeVisiable:"",
        fee:0
      },
      otcSettingForm:{
        redName:"",
        blueName:"",
        greenName:"",
      }
    };
  },
  computed: mapState(["track","otcDepth","marketDepth","usdtPrice"]),
  directives: {
    drag(el){
      let oDiv = el; //当前元素
      // 禁止选择网页上的文字
      // document.onselectstart = function() {
      //     return false;
      // };
      oDiv.onmousedown = function(e){
          let disX = oDiv.offsetLeft;
          let disY = oDiv.offsetTop;
          let downX = e.clientX;
          let downY = e.clientY;
          document.onmousemove = function(e){
              //通过事件委托，计算移动的距离
              let l = e.clientX - downX + disX;
              let t = e.clientY - downY + disY;
              // console.log("all", disX, disY, downX, downY, e.clientX, e.clientY, l, t)
              //移动当前元素
              oDiv.style.left = l + "px";
              oDiv.style.top = t + "px";

          }
          document.onmouseup = function(){
              document.onmousemove = null;
              document.onmouseup = null;
          };
          //return false不加的话可能导致黏连，就是拖到一个地方时div粘在鼠标上不下来，相当于onmouseup失效
          return false;
      };
    },
  },
  methods: {
    handleBuyUsdtChange: function(value){
      typeof value
      // console.log(value)
      // this.$store.commit({
      //   type:"changeUsdtPrice",
      //   buy:value
      // })
    },
    handleSellUsdtChange: function(value){
      typeof value
      // console.log(value)
      // this.$store.commit({
      //   type:"changeUsdtPrice",
      //   sell:value
      // })
    },
    showSettingDialog: function(){
      this.settingDialogVisible = true
      this.settingForm.realtimePrice = this.setting.realtimePrice
      this.settingForm.otc = this.setting.otc
      this.settingForm.fee = this.setting.fee
    },
    settingConfirm: function(){
      this.settingDialogVisible = false
      this.setting.realtimePrice = this.settingForm.realtimePrice
      this.setting.otc = this.settingForm.otc
      this.setting.fee = this.settingForm.fee
      // let that = this
      // setTimeout(function(){
      //   that.setting.otc.forEach(element => { //延迟刷新是为了让dom刷新完后再设定可拖拽，和dom刷新机制有关系
      //     that.setDragable("#"+element)
      //   });
      // },2000)
    },
    showOtcTableSetting: function(){
      this.otcSettingVisible = true
    },
    otcSettingConfirm: function(){
      this.otcSettingVisible = false
    },
    otcHeaderCellStyleBuy: function({row, column, rowIndex, columnIndex}){
      // 设定表头红涨绿跌or相反
      typeof (row,rowIndex,columnIndex)
      if(column.type == "index"){
        return {textAlign: 'center'}
      }
      return {textAlign: 'center',  color: (this.colorSelect ? this.style.redColor : this.style.greenColor)}
    },
    otcHeaderCellStyleSell: function({row, column, rowIndex, columnIndex}){
      // 设定表头红涨绿跌or相反
      typeof (row,rowIndex,columnIndex)
      if(column.type == "index"){
        return {textAlign: 'center'}
      }
      return {textAlign: 'center', color: (this.colorSelect ? this.style.greenColor : this.style.redColor)}
    },
    otcRowClassName: function({row,}) {
      // 模糊匹配颜色行选择
      if(this.otcSettingForm.redName && row.name.match(new RegExp(this.otcSettingForm.redName, "gi")))
        return "red-row";
      if(this.otcSettingForm.blueName && row.name.match(new RegExp(this.otcSettingForm.blueName, "gi")))
        return "blue-row";
      if(this.otcSettingForm.greenName && row.name.match(new RegExp(this.otcSettingForm.greenName, "gi")))
        return "green-row"; 
      return 'black-row';
    },
    maxWidhStyle: function (item) {
        let style = {
            maxWidth: "230px",
            
            
        }
        if (item == 'usdtrmb'){
            return style
        }
        style.maxWidth = "330px"
        return style
    },
    otcCellStyle: function({row, column,}){
      // console.log({row, column, rowIndex, columnIndex})
      let style = {
        // lineHeight:"12px",
        // fontSize:"10px",
        
      }
      // 依据利润的正负设定颜色
      if(row.profix > 0 && column.label == "利润"){
        if(this.colorSelect) {
          style.color = this.style.redColor
        }
        else{
          style.color = this.style.greenColor
        }
      } else if(row.profix < 0 && column.label == "利润"){
        if(this.colorSelect) {
          style.color = this.style.greenColor
        }
        else{
          style.color = this.style.redColor
        }
      }
      return style
    },
    setDragable: function (drg, mov) {
      // setDragable(要拖动的对象);
      // setDragable(允许拖动的对象, 拖动要移动的对象);
      // setDragable(标题栏, 窗体);
      let drgObj = drg;
      let moveObj = mov || drg;
      function G(o) {
        return document.querySelector(o);
      }
      //获取元素的纵坐标,距离文档顶部的高度
      function getTop(e) {
        var offset = e.offsetTop;
        if (e.offsetParent != null) offset += getTop(e.offsetParent);
        return offset;
      }
      //获取元素的横坐标,距离文档左边的宽度
      function getLeft(e) {
        var offset = e.offsetLeft;
        if (e.offsetParent != null) offset += getLeft(e.offsetParent);
        return offset;
      }
      //拖放开始
      function dragstart(e) {
        let off = { x: e.x - getLeft(moveObj), y: e.y - getTop(moveObj) };
        moveObj.dragOff = off;
      }
      //拖放结束
      function dragend(e) {
        let off = moveObj.dragOff;
        moveObj.style.top = e.y - off.y + "px";
        moveObj.style.left = e.x - off.x + "px";
      }
      if (typeof drg != "object") drgObj = G(drg);
      if (typeof mov != "object") moveObj = G(mov || drg);
      drgObj.draggable = true;
      drgObj.style.cursor = "pointer"; //move
      moveObj.style.position = "absolute";
      //监听拖动事件
      drgObj.addEventListener("dragstart", dragstart, true);
      drgObj.addEventListener("dragend", dragend, true);
    },

    columnWidth: function (item) {
        if (item == 'usdtrmb'){
            return 50
        }
        return 80

    },

  },
  mounted: function () {
    // this.setDragable(".otc-ad")
    // console.log("this,store", this.$store);
    // 发送ping保证活跃
    setTimeout(()=>{
        setInterval(()=>{
          this.$store.dispatch("sendMessage","ping")
        },5000)
    }, 3000)
    
  },
};
</script>

<style >
body{
  box-sizing: border-box;
}
#root {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  color: #303133;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  /* font-size: 14px; */
  box-sizing: border-box;
  background-color: white;
}
#head {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 50px;
  padding-left: 5%;
  padding-right: 5%;
  font-size: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}
.setting-btn{
  height: 22px;
  width: 22px;
  /* margin-left: 20px; */
  /* border: 1px #EBEEF5; */
  border: 1px #303133;
  border-radius: 50%;
  background-color: aliceblue;  
  /* box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); */
  align-items: center;
}
#body {
  height: 100%;
  width: 100%;
  position: relative;
}
.otc-ad {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  /* min-width: 500px;
  max-width: 750px;
  font-size: 12px;
  position: absolute; */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
  opacity:1;
  background: white;
}
/* #bottom {
  z-index:10000;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  font-size: 13px;
  color: #303133;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  background: #FFFFFF;
  
} */
.el-table .black-row{
  color: #303133;
}
.el-table .red-row{
  color:#ff4949;
}
.el-table .blue-row{
  color:blue;
}
.el-table .green-row{
  color:#13ce66;
}

.el-table .cell {
  line-height: 16px;
  /* background: blue; */
  height: 16px;
  font-size: 10px;
}

/* el-table th{
  background-color: #E6A23C;
}
.el-table tr, .el-table td {
    background-color: #F2F6FC;
} */
</style>