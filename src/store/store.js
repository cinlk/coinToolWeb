import Vue from 'vue'
import Vuex from 'vuex'


import axios from 'axios';

import {
    SOCKET_ONOPEN,
    SOCKET_ONCLOSE,
    SOCKET_ONERROR,
    SOCKET_ONMESSAGE,
    SOCKET_RECONNECT,
    SOCKET_RECONNECT_ERROR
} from './mutation-types'

Vue.use(Vuex);



export default new Vuex.Store({
    state: {
        track:{
            //show_guadan:true,//是否显示买卖一价挂单的利润
            dataSourceIndex: 0, // 由下面的dataSource的索引来区分
            dataSource:[
                'ws://103.118.42.205:7001/ws', //火币后端，lk的
            ],
           
            sub_huobi:{//基于火币网的数据订阅
                otcRmb:["usdt","btc","eth","ht","eos"],//订阅的otc数据   "eosrmb"
                depthUsdt:["btcusdt","ethusdt","htusdt","eosusdt"],//行情盘口数据  "eosusdt"
                TradeUsdt:["btcusdt","ethusdt","htusdt","eosusdt"] // 实时币币交易数据
            },
            sub_ok:{//基于ok的数据订阅
                otcRmb:["usdt","btc","eth","okb"],
                TradeUsdt:["btcusdt","ethusdt","okbusdt"]
            }
        },
        socket: {
            isConnected: false,
            message: '',
            reconnectError: false,
        },

         // 交易费用
         tradeFee: {
            "huobi":{
                userType: 1,  // 1 代表散户看盘, 2 代表广告商看盘
                otcFee:0,
                coinFee:0
            },
            "okex":{

            }
            
        },


        otcDepth: {//OTC广告深度
            "huobi":{
                "usdt":{
                    bids:[],
                    asks:[],
                },
            },
            "okex":{
                "usdt":{
                    bids:[],
                    asks:[],
                },
            }
            
        },
        marketDepth: {//行情深度
            "huobi":{
                "btcusdt":{
                    bids:[], //对应的是行情里面的买一买二...
                    asks:[], //对应的是行情里面的卖一卖二...
                    
                }
            }
            
        },
        marketTrade: { // 行情实时成交价 取第一个价格
            "huobi":{
                "btcusdt":{}
            },
            "okex":{
                "btcusdt":{}
            }
               
        },
        usdtPrice: {//买卖usdt价
            "huobi":{
                buy:10,
                sell:1,
            },
            "okex":{
                buy:10,
                sell:1,
            }
           
        }
    },
    mutations: {
        // changeUsdtPrice(state,paylaod){
        //     paylaod.buy ? state.usdtPrice.buy = paylaod.buy : ""
        //     paylaod.sell ? state.usdtPrice.sell = paylaod.sell : ""
        // },
        // 什么时候触发 socket 建立连接？
        [SOCKET_ONOPEN](state, event) {
            console.log(new Date().toTimeString().substring(0,8), "socket on open", state, event)
            Vue.prototype.$socket = event.currentTarget
            state.socket.isConnected = true
            let subs = []
            if(state.track.dataSourceIndex == 0){//火币
                state.track.sub_huobi.otcRmb.forEach(element => {
                    subs.push({
                        sub: "market.otc."+element,
                        exchange: "huobi",
                    })
                })
                state.track.sub_huobi.depthUsdt.forEach(element => {
                    subs.push({
                        sub: "market.spot.depth."+element,
                        exchange: "huobi",
                    })
                })
                state.track.sub_huobi.TradeUsdt.forEach(element => {
                    subs.push({
                        sub: "market.spot.ticker."+element,
                        exchange: "huobi",
                    })
                })



            } else if(state.track.dataSourceIndex == 1 ){//ok
                state.track.sub_ok.otcRmb.forEach(element => {
                    subs.push({
                        sub: "market.otc."+element,
                        exchange: "okex",
                    })
                })
                state.track.sub_ok.TradeUsdt.forEach(element => {
                    subs.push({
                        sub: "market.spot.ticker."+element,
                        exchange: "okex",
                    })
                })
            }
            let i = 0
            let interval = setInterval(()=>{
                if(i < subs.length){
                    // Vue.prototype.$socket.sendObj(subs[i]);
                    Vue.prototype.$socket.send(JSON.stringify(subs[i]))
                    i++;
                } else if (i>= subs.length && interval != null){
                    clearInterval(interval)
                    interval = null;
                }
            },300)
        },
        [SOCKET_ONCLOSE](state, event) {
            console.log("socket on close", state, event)
            state.socket.isConnected = false
        },
        [SOCKET_ONERROR](state, event) {
            console.log("socket on error", state, event)
            // console.error(state, event)
        },
        // default handler called for all methods
        [SOCKET_ONMESSAGE](state, event) {
            // console.log("socket on message", state, event)
            // state.socket.message = event
            
            let message = {}
            try{
                message = JSON.parse(event.data)
            } catch(err) {
                return
            }
           

            const ch = message.ch.split(".")
            const exchange = message.exchange 

            // send alert msg
            // let sendMsg = function name(params) {
            //     console.log("sendMsg",params)

            // }

            // let sendAlert = function (message) {
                
            //     axios.post('http://103.118.42.205/api/v1/notify', {
            //         data: message
    
            //  }).then(function (response) {
            //      console.log(response);
            //  })
            //    .catch(function (error) {
            //      console.log(error);
            //   });
            // }
            let computeProfix = function(exchange, coinName){


                let otcCoinName = coinName.match(/usdt$/g) ? coinName.substr(0, coinName.length - 4) : coinName
                let spotCoinName = coinName.match(/usdt$/g) ? coinName : coinName + "usdt"

                // let otcCoinb = ch[1].match(/usdt$/g) ? ch[1].substr(0,ch[1].length-4)+"rmb" : ch[1]
                // let marketCoinb = ch[1].match(/rmb$/g) ? ch[1].substr(0,ch[1].length-3)+"usdt" : ch[1]

                switch (exchange) {
                    case "huobi":
                        
                        // 购买广告利润
                        if (state.otcDepth[exchange][otcCoinName] && state.otcDepth[exchange][otcCoinName].bids && 
                            state.marketDepth[exchange][spotCoinName] && state.marketDepth[exchange][spotCoinName].bids[0]){
                                 // 币的otc 商家购买出(用户卖出) 数据遍历
                                 state.otcDepth[exchange][otcCoinName].bids.forEach(element => {
                                        if(element.price){

                                            var tradePrice = state.marketTrade[exchange][spotCoinName] ? state.marketTrade[exchange][spotCoinName].price : state.marketDepth[exchange][spotCoinName].bids[0].price  
                                            var costPrice = 0 
                                            var sellPrice = 0
                                            // otc 市场的usdt 广告商的费率为0，散户也为0
                                            if (state.tradeFee[exchange].userType == 1 ){
                                                costPrice =  state.usdtPrice[exchange].buy * tradePrice  * (1+state.tradeFee[exchange].coinFee)
                                                sellPrice =  element.price*(1-state.tradeFee[exchange].otcFee)
                                            }else{
                                                costPrice = element.price*(1+state.tradeFee[exchange].otcFee)
                                                sellPrice = state.usdtPrice[exchange].sell * tradePrice * (1 - state.tradeFee[exchange].coinFee)
                                            }
                                  
                                            let profix = sellPrice - costPrice

                                            if (spotCoinName == "btcusdt" || spotCoinName == "ethusdt"){
                                                element.profix = profix.toFixed(1)
                                            }else{
                                                element.profix = profix.toFixed(2)
                                            }

                                        }
                                 })
                            }

                            // 出售广告利润计算
                            if (state.otcDepth[exchange][otcCoinName] && state.otcDepth[exchange][otcCoinName].asks && 
                                state.marketDepth[exchange][spotCoinName] && state.marketDepth[exchange][spotCoinName].asks[0]){
                                    state.otcDepth[exchange][otcCoinName].asks.forEach(element => {
                                        if (element.price){
                                            var tradePrice = state.marketTrade[exchange][spotCoinName] ? state.marketTrade[exchange][spotCoinName].price : state.marketDepth[exchange][spotCoinName].asks[0].price  
                                            // otc 市场的usdt 广告商的费率为0，散户也为0
                                            var costPrice = 0 
                                            var sellPrice = 0 
                                            if (state.tradeFee[exchange].userType == 1){
                                                costPrice = element.price * (1 + state.tradeFee[exchange].otcFee)
                                                sellPrice =  tradePrice * state.usdtPrice[exchange].sell*(1 - state.tradeFee[exchange].coinFee)
                                            }else{
                                                sellPrice = element.price *(1-state.tradeFee[exchange].otcFee)
                                                costPrice = tradePrice * state.usdtPrice[exchange].buy*(1 + state.tradeFee[exchange].coinFee) 
                                            }
                                            
                                            let profix = sellPrice - costPrice  

                                            if (spotCoinName == "btcusdt" || spotCoinName == "ethusdt"){
                                                element.profix = profix.toFixed(1)
                                            }else{
                                                element.profix = profix.toFixed(2)
                                            }
                                        }
                                    })
                                }




                        break;
                    
                    case "okex":
                        
                        break;
                    default:
                        break;
                }

                //购买广告利润计算
                // if(state.otcDepth["usdt"] && state.otcDepth["usdt"].asks && state.otcDepth["usdt"].asks[0] &&
                //     state.marketDepth[marketCoinb] && state.marketDepth[marketCoinb].asks && state.marketDepth[marketCoinb].asks[0] &&
                //     state.otcDepth[otcCoinb] && state.otcDepth[otcCoinb].bids){

                //         // 币的otc 商家购买出(用户卖出) 数据遍历
                //     state.otcDepth[otcCoinb].bids.forEach(element => {
                //         if(element.price){
                     
                //             var tradePrice = state.marketTrade[marketCoinb] ? state.marketTrade[marketCoinb].price : state.marketDepth[marketCoinb].bids[0].price  
                //             var costPrice = 0 
                //             var sellPrice = 0
                //             // otc 市场的usdt 广告商的费率为0，散户也为0
                //             if (state.track.tradeFee.userType == 1 ){
                //                 costPrice =  state.usdtPrice.buy * tradePrice  * (1+state.track.tradeFee.coinFee)
                //                 sellPrice =  element.price*(1-state.track.tradeFee.otcFee)
                //             }else{
                //                 costPrice = element.price*(1+state.track.tradeFee.otcFee)
                //                 sellPrice = state.usdtPrice.sell * tradePrice * (1 - state.track.tradeFee.coinFee)
                //             }
                  
                //             let profix = sellPrice - costPrice
                    
                       
                //             if(state.track.log.is_profix_base_10000==false){//套利以币自身计算
                //                 if (marketCoinb == "btcusdt" || marketCoinb == "ethusdt"){
                //                     element.profix = profix.toFixed(1)
                //                 }else{
                //                     element.profix = profix.toFixed(2)
                //                 }
                               
                                
                //             } else if (state.track.log.is_profix_base_10000){//套利以10000rmb计算
                //                 profix = profix.toFixed(2)
                //                 element.profix = profix
                //                 if(state.track.log.open_log && element.profix >= state.track.log.log_profix_base_10000){
                //                     state.sell_count==null?state.sell_count=0:state.sell_count++
                //                     console.log(new Date().toTimeString().substring(0,8),state.sell_count,"利润>="+state.track.log.log_profix_base_10000,"卖出"+otcCoinb, element.profix,element.size,element.price, element.size * element.price)
                //                 }
                //             }
                //         }
                //     });
                //     // if(state.track.show_guadan && state.otcDepth[otcCoinb].bids[0]){ //假设以买1价挂单的利润
                //     //     state.otcDepth[otcCoinb].profix_base_bid_1 = 10000 / state.otcDepth[otcCoinb].bids[0].price * state.marketDepth[marketCoinb].bids[0].price * state.usdtPrice.sell - 10000
                //     // }
                // }
                // 出售广告利润计算 先用rmb买入币, 换成u在卖出u, 换成rmb. 以1个币计算, 手续费 TODO

                // if(state.otcDepth[otcCoinb] && state.otcDepth[otcCoinb].asks &&
                //     state.marketDepth[marketCoinb] && state.marketDepth[marketCoinb].bids && state.marketDepth[marketCoinb].bids[0] && 
                //     state.otcDepth["usdtrmb"] && state.otcDepth["usdtrmb"].bids && state.otcDepth["usdtrmb"].bids[0] ){
                //         // 币的otc 商家卖出(用户购买) 数据遍历
                //         state.otcDepth[otcCoinb].asks.forEach(element => {
                //         if(element.price){
                          

                //             var tradePrice = state.marketTrade[marketCoinb] ? state.marketTrade[marketCoinb].price : state.marketDepth[marketCoinb].asks[0].price  
                //             // otc 市场的usdt 广告商的费率为0，散户也为0
                //             var costPrice = 0 
                //             var sellPrice = 0 
                //             if (state.track.tradeFee.userType == 1){
                //                 costPrice = element.price * (1 + state.track.tradeFee.otcFee)
                //                 sellPrice =  tradePrice * state.usdtPrice.sell*(1 - state.track.tradeFee.coinFee)
                //             }else{
                //                 sellPrice = element.price *(1-state.track.tradeFee.otcFee)
                //                 costPrice = tradePrice * state.usdtPrice.buy*(1 + state.track.tradeFee.coinFee) 
                //             }
                            
                //             let profix = sellPrice - costPrice     
                //             if(state.track.log.is_profix_base_10000 == false){//套利以币自身计算

                //                 if (marketCoinb == "btcusdt" || marketCoinb == "ethusdt"){
                //                     element.profix = profix.toFixed(1)
                //                 }else{
                //                     element.profix = profix.toFixed(2)
                //                 }

                    
                             
                //             } else if (state.track.log.is_profix_base_10000 == true){
                //                 //profix = profix.toFixed(2)
                //                 element.profix = profix.toFixed(2)
                //                 if(state.track.log.open_log && element.profix >= state.track.log.log_profix_base_10000){
                //                     state.buy_count==null?state.buy_count=0:state.buy_count++
                //                     console.log(new Date().toTimeString().substring(0,8),state.buy_count,"利润>="+state.track.log.log_profix_base_10000,"买入"+otcCoinb, element.profix,element.size,element.price,element.size * element.price)
                //                 }
                //             }
                //         }
                //     });
                //     // if(state.track.show_guadan && state.otcDepth[otcCoinb].asks[0]){ //假设以卖1价挂单的利润
                //     //     state.otcDepth[otcCoinb].profix_base_ask_1 = 10000 / state.usdtPrice.buy / state.marketDepth[marketCoinb].asks[0].price * state.otcDepth[otcCoinb].asks[0].price - 10000
                //     // }
                // }
            }

            if(ch.length > 2 && ch[1].match(/otc$/g)){

                if (exchange == "huobi" || exchange == "okex"){
                    
                    state.otcDepth[exchange][ch[2]] = message.data 
                    if (ch[2] == "usdt"){
                        return
                    }
                    computeProfix(exchange, ch[2]);
                }
                
                // state.otcDepth[ch[1]] = message.data;
                // if(ch[1] == "usdtrmb"){
                //     return
                // }
                // computeProfix();
            }
            else if(ch.length > 3 && ch[2].match(/^depth$/g)){
                if (exchange == "huobi"){
                    state.marketDepth[exchange][ch[3]] = message.data
                    computeProfix(exchange, ch[3]);
                }
                //state.marketDepth[ch[1]] = message.data;
                // computeProfix();
            }
            else if(ch.length > 2 && ch[2].match(/^ticker$/g)){
                if (exchange == "huobi" || exchange == "okex"){
                    state.marketTrade[exchange][ch[3]] = message.data
                    computeProfix(exchange, ch[3]);
                }

                //state.marketTrade[ch[1]] = message.data
            }
        },
        // mutations for reconnect methods
        [SOCKET_RECONNECT](state, count) {
            console.log("socket reconnect", state, count)
            // console.info(state, count)
        },
        [SOCKET_RECONNECT_ERROR](state) {
            console.log("socket reconnect error", state)
            state.socket.reconnectError = true;
        },
    },
    actions: {
        sendMessage: function (context, message) {
            // console.log("send",message)
            if(typeof message == "object"){
                // Vue.prototype.$socket.sendObj(message)
                Vue.prototype.$socket.send(JSON.stringify(message))
            } else {
                Vue.prototype.$socket.send(message)
            }
        }
       
    }
})