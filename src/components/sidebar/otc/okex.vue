<template>
   
  <div class="container">
    <div style="font-size:20px" v-if="!otcPermission[exchange]">没有权限，请联系服务商</div>
    <div class="toolbar" v-if="otcPermission[exchange]">
      <div style="margin-right:10px;">
       Okex USDT买入 <el-input-number style="margin-right:5px;" v-model="usdtPrice[exchange].buy" controls-position="right" :min="5.00" :max="9.00" :precision="2" :step="0.01" size="mini"></el-input-number>
        卖出 <el-input-number v-model="usdtPrice[exchange].sell" controls-position="right" :min="5.00" :max="9.00" :precision="2" :step="0.01" size="mini"></el-input-number>
        <el-button style="margin-left:5px;" type="primary" @click="showSettingDialog" icon="el-icon-s-tools" size="mini">设置</el-button>
      </div>
  
      <div style="color:black; font-size:13px"> 
        <span> 模式:</span>
        <span style="color:mediumblue">{{ setting.userType == 1 ? '散户看盘' : '广告商看盘' }}</span>
          </div>
      <div style="color:black; font-size:13px;margin-left:10px">
          <span>otc手续费: </span>
          <span style="color:mediumblue">{{setting.otcfee }}</span>
          <span>币币手续费:</span>
          <span style="color:mediumblue">{{setting.coinfee}} </span>
        </div>
      
      <div class="tradePrice">
          <div style="margin: 0 5px; " v-for="(item, index) in setting.realtimePrice" :key="index">
              <div>
               
                <span>{{item +"价格: "}}</span>
                <span style="color:mediumblue">{{ marketTrade[exchange][item]&&marketTrade[exchange][item].last ?  marketTrade[exchange][item].last : ""}}</span>
              </div>
          </div>
         
      </div>
      
      
    </div>
    <div class="body" v-if="otcPermission[exchange]">
        <div :style="'position: absolute; left:' + (80+index*70)+'px;'+'top:' + (40+index*50)+'px;'" v-drag v-for="(item, index) in setting.otc" v-bind:key="index">
          <div class="otcData">
            <el-table
            
              max-height="640"
              size="mini"
              
              border
              :data="otcDepth[exchange][item].bids ? otcDepth[exchange][item].bids.slice(0, setting.count) : []"
              :row-class-name="otcRowClassName"
              :cell-style="otcCellStyle"
              :header-cell-style="otcHeaderCellStyleBuy"
              
             
            > 
              <el-table-column label="序号"  type="index" width="40" align="left" >
                <template slot="header">
                  <div style="display:flex;flex-direction: column;justify-content: space-between;">
                    <button  class="setting-btn" @click="showOtcTableSetting()"><i class="el-icon-s-tools" style="margin-left: -8px;"></i></button>
                  </div>
                </template>
              </el-table-column>

              <el-table-column :label="item.toUpperCase()  +' 购买广告' + (setting.userType === 1 ? '(散户卖出)':'')  " align="center"  >
                <el-table-column prop="price" label="价格" show-overflow-tooltip  :width="columnWidth(item)"   > </el-table-column>
                <el-table-column prop="profix" label="利润" v-if="item !=='usdt'" show-overflow-tooltip width="70"> </el-table-column>
                <el-table-column prop="size" label="数量" show-overflow-tooltip width="80"> </el-table-column>
                <el-table-column prop="name" label="昵称" show-overflow-tooltip  align="left"  width="100"> </el-table-column>
              </el-table-column>
            </el-table>
            <el-table
              max-height="640"
              size="mini"
              :style="maxWidhStyle(item)"
              border
              :data="otcDepth[exchange][item].asks ? otcDepth[exchange][item].asks.slice(0, setting.count) : []"
              :row-class-name="otcRowClassName"
              :cell-style="otcCellStyle"
              :header-cell-style="otcHeaderCellStyleSell"
            >
              <el-table-column :label="item.toUpperCase() + ' 出售广告' +  (setting.userType == 1 ? '(散户买入)':'') " align="center">
                <el-table-column prop="price" label="价格" show-overflow-tooltip :width="columnWidth(item)"> </el-table-column>
                <el-table-column prop="profix" label="利润" v-if="item !=='usdt'" show-overflow-tooltip width="70"></el-table-column>
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
        

        <el-form-item label="看盘模式">
            <el-radio v-model="settingForm.userType" :label="1">散户看盘</el-radio>
            <el-radio v-model="settingForm.userType" :label="2">广告商看盘</el-radio>
        </el-form-item>

        <el-form-item label="表格数据个数" >
            <el-radio v-model="settingForm.count" :label="10">前10</el-radio>
            <el-radio v-model="settingForm.count" :label="20">前20</el-radio>

        </el-form-item>

        <el-form-item label="展示的币">
       
          <el-checkbox-group v-model="settingForm.otc">
            <el-checkbox v-for="(item, index) in track.sub_okex.otcRmb" v-bind:key="index" :label="item" name="type">{{item.toUpperCase()}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>


        <el-row>
            <el-col :span="10" style="margin-right:40px">
                    <el-form-item label="otc交易费率">
                         <el-select v-model="settingForm.otcfee"  placeholder="设置otc交易费率, 默认为0"  style="width:100%" >
                            <el-option v-for=" item in otcFees" :key="item.value" :label="item.label" :value="item.value"></el-option>

                         </el-select>
                    </el-form-item>
            </el-col>
            <el-col :span="10">
                <el-form-item label="币币交易费率">

                    <el-select v-model="settingForm.coinfee"  placeholder="设置币币交易费率, 默认为0"  style="width:100%" >
                       <el-option v-for="item in coinFees" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>


        <el-form-item label="利润颜色" :inline-message="true">
          <div style="display: flex;flex-direction: row; justify-content: start; align-items:center; height: 100%; width:100%;">
            <el-switch
              style="display: block; height:100%; line-height: 100%;"
              v-model="settingForm.colorSelect">
            </el-switch>
            <div style="font-weight: bold; margin-left: 14px;">{{settingForm.colorSelect? "红涨绿跌" : "绿涨红跌"}}</div>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="settingDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="settingConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="挂单昵称匹配"
      :visible.sync="otcSettingVisible"
      width="50%">
      <el-form ref="otcSettingForm" label-width="50px" label-position="left">
        <el-form-item label="昵称">
          <el-input v-model.trim="otcSettingForm.name" placeholder="输入昵称,多个昵称以;隔开"></el-input>
        </el-form-item>
       
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="otcSettingVisible = false">取 消</el-button>
        <el-button type="primary" @click="otcSettingConfirm">确 定</el-button>
      </span>
    </el-dialog>

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
      
      exchange:"okex",

      settingDialogVisible: false,
      otcSettingVisible: false,

      setting:{
        realtimePrice:[],//btcusdt,ltcusdt
        otc:["usdt"],//btc,ltc,usdt
        otcfee:0,
        coinfee:0,
        count:20,
        userType:1, // 1 是散户  2 是广告商
        colorSelect: true,
      },
      settingForm:{
        //realtimePrice:[],
        otc:[],
        feeVisiable:"",
        otcfee:0,
        coinfee:0,
        count:20,
        userType:1, // 1 是散户  2 是广告商
        colorSelect: true,
        
      },
      otcSettingForm:{
        name:"",
        // blueName:"",
        // greenName:"",
      },
      otcFees:[
          {value: 0, label: 0},
          {value: 0.0004, label: 0.0004},
          
      ],
      coinFees:[
          {value: 0, label: 0},
          {value: 0.001, label: 0.001},
          {value: 0.00095, label: 0.00095},
          {value: 0.0009, label: 0.0009},
          {value: 0.0008, label: 0.0008},
          {value: 0.0007, label: 0.0007},
          {value: 0.0006, label: 0.0006},
          {value: 0.0005, label: 0.0005},
          {value: 0.0004, label: 0.0004},
      ]
    };
  },
  computed: mapState(["track","tradeFee", "otcDepth","usdtPrice", "marketTrade","otcPermission"]),
  directives: {
    drag(el){
      let oDiv = el; //当前元素
     
      oDiv.onmousedown = function(e){
          let disX = oDiv.offsetLeft;
          let disY = oDiv.offsetTop;
          let downX = e.clientX;
          let downY = e.clientY;
          document.onmousemove = function(e){
              //通过事件委托，计算移动的距离
              let l = e.clientX - downX + disX;
              let t = e.clientY - downY + disY;
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
      
    },
    handleSellUsdtChange: function(value){
      typeof value
      
    },
    showSettingDialog: function(){
      this.settingDialogVisible = true
      
      this.settingForm.otc = this.setting.otc
      this.settingForm.fee = this.setting.fee
    },
    settingConfirm: function(){
      this.settingDialogVisible = false
      this.setting.otc = this.settingForm.otc
      this.setting.userType = this.settingForm.userType
      this.setting.count = this.settingForm.count
      this.setting.realtimePrice  = []
      this.setting.colorSelect = this.settingForm.colorSelect
      for (var idx in this.settingForm.otc){
          if (this.settingForm.otc[idx] == "usdt"){
            continue
          }
          this.setting.realtimePrice.push(this.settingForm.otc[idx] + "usdt")
      }
      this.setting.otcfee = this.settingForm.otcfee
      this.setting.coinfee = this.settingForm.coinfee
      this.tradeFee[this.exchange].otcFee = this.settingForm.otcfee
      this.tradeFee[this.exchange].coinFee = this.settingForm.coinfee
      this.tradeFee[this.exchange].userType = this.settingForm.userType

      this.setting.count = this.settingForm.count
      this.$message({
                       showClose: true,
                       message: '修改成功',
                       type: 'success'
                   });

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
      return {textAlign: 'center',  color: this.style.greenColor}
    },
    otcHeaderCellStyleSell: function({row, column, rowIndex, columnIndex}){
      // 设定表头红涨绿跌or相反
      typeof (row,rowIndex,columnIndex)
      if(column.type == "index"){
        return {textAlign: 'center'}
      }
      return {textAlign: 'center', color:  this.style.redColor}
    },
    otcRowClassName: function({row,}) {
      
      if (this.otcSettingForm.name == ""){
          return '';
      }
      let names = this.otcSettingForm.name.split(";")
     
      for (var n in names){
            if(names[n] == row.name)
                return "success-row";
      }
      
      return '';
    },
    maxWidhStyle: function (item) {
        let style = {
            maxWidth: "230px",
            
            
        }
        if (item == 'usdt'){
            return style
        }else if (item == "ht" || item == "eos"){
          style.maxWidth = "310px"
        }else{
          style.maxWidth = "330px"
        }
        
        return style
    },
    otcCellStyle: function({row, column,}){
      let style = {
        // lineHeight:"12px",
        // fontSize:"10px",
        
      }
      // 依据利润的正负设定颜色
      if(row.profix > 0 && column.label == "利润"){
        if(this.setting.colorSelect) {
          style.color = this.style.redColor
        }
        else{
          style.color = this.style.greenColor
        }
      } else if(row.profix < 0 && column.label == "利润"){
        if(this.setting.colorSelect) {
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
        if (item == 'usdt'){
            return 50
        }else if ( item == "ht" || item == "eos"){
          return 60
        }
        return 85

    },

  },

  
 
};
</script>

<style scoped>


.container {
  
  display: flex;
  flex-direction: column;
  justify-content: space-between;
 
}
.toolbar {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  height: 45px;
  padding-left: 10px;
  font-size: 13px;
  border-bottom: 1px solid gainsboro;
}

.el-input-number--mini{
  width: 100px;
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
.body {
  height: 100%;
  width: 100%;
  position: relative;
}
.otcData {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
 
.tradePrice {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    flex-direction: row;
    margin-left: 15px;
    width: 30%;
    font-size: 10px;
    line-height: 15px;

}
 

>>> .el-table .cell {
   height: 16px;
   line-height: 15px;
}

>>> .el-table .success-row {
      background: #f0f9eb;
    }

</style>