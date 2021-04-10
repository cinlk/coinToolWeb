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
            log:{
                open_log: true,//是否打开日志监控
                is_profix_base_10000: false, //计算利润的依据是依据1枚币（false）还是10000rmb(true)
                log_profix_base_coin: 0.01,//基于币价的话，利润百分之一以上
                log_profix_base_10000: 60,//基于10000的话，利润60以上就显示日志
            },
            show_guadan:true,//是否显示买卖一价挂单的利润
            dataSourceIndex: 0, // 由下面的dataSource的索引来区分
            dataSource:[
                'ws://103.118.42.205:7001/ws', //火币后端，lk的
            ],
            sub_huobi:{//基于火币网的数据订阅
                otcRmb:["usdtrmb","btcrmb","ethrmb","htrmb"],//订阅的otc数据   "eosrmb"
                depthUsdt:["btcusdt","ethusdt","htusdt"]//行情数据  "eosusdt"
            },
            sub_ok:{//基于ok的数据订阅
                otcRmb:["usdtrmb","btcrmb","ethrmb","okbrmb"],
                depthUsdt:["btcusdt","ethusdt","okbusdt"]
            }
        },
        socket: {
            isConnected: false,
            message: '',
            reconnectError: false,
        },
        otcDepth: {//OTC广告深度
            "usdtrmb":{
                bids:[],
                asks:[],
            }
        },
        marketDepth: {//行情深度
            "btcusdt":{
                bids:[], //对应的是行情里面的买一买二...
                asks:[], //对应的是行情里面的卖一卖二...
            }
        },
        usdtPrice: {//买卖usdt价
            buy:10,
            sell:1,
        }
    },
    mutations: {
        // changeUsdtPrice(state,paylaod){
        //     paylaod.buy ? state.usdtPrice.buy = paylaod.buy : ""
        //     paylaod.sell ? state.usdtPrice.sell = paylaod.sell : ""
        // },
        [SOCKET_ONOPEN](state, event) {
            console.log(new Date().toTimeString().substring(0,8), "socket on open", state, event)
            Vue.prototype.$socket = event.currentTarget
            state.socket.isConnected = true
            let subs = []
            if(state.track.dataSourceIndex == 0 || state.track.dataSourceIndex == 1){//火币
                state.track.sub_huobi.otcRmb.forEach(element => {
                    subs.push({
                        sub: "market."+element+".depth.20",
                        exchange: "huobi",
                    })
                })
                state.track.sub_huobi.depthUsdt.forEach(element => {
                    subs.push({
                        sub: "market."+element+".depth.step0",
                        exchange: "huobi",
                    })
                })
            } else if(state.track.dataSourceIndex == 2 ){//ok
                state.track.sub_ok.otcRmb.forEach(element => {
                    subs.push({
                        sub: "market."+element+".depth.20",
                        exchange: "okex",
                    })
                })
                state.track.sub_ok.depthUsdt.forEach(element => {
                    subs.push({
                        sub: "market."+element+".depth.step0",
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
            
            // 手续费
            const otcRate = 0 
            const coinRate = 0.002

            const ch = message.ch.split(".")
            
            // send alert msg
            // let sendMsg = function name(params) {
            //     console.log("sendMsg",params)

            // }

            let sendAlert = function (message) {
                
                axios.post('http://103.118.42.205/api/v1/notify', {
                    data: message
    
             }).then(function (response) {
                 console.log(response);
             })
               .catch(function (error) {
                 console.log(error);
              });
            }
            let computeProfix = function(){
                let otcCoinb = ch[1].match(/usdt$/g) ? ch[1].substr(0,ch[1].length-4)+"rmb" : ch[1]
                let marketCoinb = ch[1].match(/rmb$/g) ? ch[1].substr(0,ch[1].length-3)+"usdt" : ch[1]
                //购买广告利润计算
                if(state.otcDepth["usdtrmb"] && state.otcDepth["usdtrmb"].asks && state.otcDepth["usdtrmb"].asks[0] &&
                    state.marketDepth[marketCoinb] && state.marketDepth[marketCoinb].asks && state.marketDepth[marketCoinb].asks[0] &&
                    state.otcDepth[otcCoinb] && state.otcDepth[otcCoinb].bids){

                        // 币的otc 商家购买出(用户卖出) 数据遍历
                    state.otcDepth[otcCoinb].bids.forEach(element => {
                        if(element.price){
                            //利润，假设投入10000rmb将的到多少利润
                            //otc 买usdtrmb（以卖一价）> 币币交易 买btcusdt(以卖一价) > otc 卖btcrmb（以买n价）
                            // element.profix = (10000 / state.otcDepth["usdtrmb"].asks[0].price / state.marketDepth[marketCoinb].asks[0].price * element.price - 10000).toFixed(2)
                            //otc 买usdtrmb(以设定的肯买价)> 币币交易 买btcusdt(以卖一价) > otc 卖btcrmb（以买n价）
                            
                            let costPrice =  state.usdtPrice.buy * state.marketDepth[marketCoinb].bids[0].price * (1+otcRate) * (1+coinRate)

                            let sellPrice =  element.price*(1-otcRate)

                            let profix = sellPrice - costPrice
                            
                        

                            //let profix = 10000 / state.usdtPrice.buy / state.marketDepth[marketCoinb].asks[0].price * element.price - 10000 //10000rmb循环一遍的利润
                            if(state.track.log.is_profix_base_10000==false){//套利以币自身计算
                                //profix = (profix * element.price / 10000).toFixed(2)
                                element.profix = profix.toFixed(0)
                                if(state.track.log.open_log && element.profix / costPrice >= state.track.log.log_profix_base_coin){
                                    state.sell_count==null?state.sell_count=0:state.sell_count++
                                    let msg = "币 " +  marketCoinb + "利润大于1%, 操作 rmb买入u换成币卖出rmb " + "利润值 " + String(profix) 
                                    sendAlert(msg)
                                    
                                    console.log(new Date().toTimeString().substring(0,8),state.sell_count,"利润>="+state.track.log.log_profix_base_coin,"卖出"+otcCoinb, element.profix,element.size,element.price, element.size * element.price)
                                }
                            } else if (state.track.log.is_profix_base_10000){//套利以10000rmb计算
                                profix = profix.toFixed(0)
                                element.profix = profix
                                if(state.track.log.open_log && element.profix >= state.track.log.log_profix_base_10000){
                                    state.sell_count==null?state.sell_count=0:state.sell_count++
                                    console.log(new Date().toTimeString().substring(0,8),state.sell_count,"利润>="+state.track.log.log_profix_base_10000,"卖出"+otcCoinb, element.profix,element.size,element.price, element.size * element.price)
                                }
                            }
                        }
                    });
                    if(state.track.show_guadan && state.otcDepth[otcCoinb].bids[0]){ //假设以买1价挂单的利润
                        state.otcDepth[otcCoinb].profix_base_bid_1 = 10000 / state.otcDepth[otcCoinb].bids[0].price * state.marketDepth[marketCoinb].bids[0].price * state.usdtPrice.sell - 10000
                    }
                }
                // 出售广告利润计算 先用rmb买入币, 换成u在卖出u, 换成rmb. 以1个币计算, 手续费 TODO
                if(state.otcDepth[otcCoinb] && state.otcDepth[otcCoinb].asks &&
                    state.marketDepth[marketCoinb] && state.marketDepth[marketCoinb].bids && state.marketDepth[marketCoinb].bids[0] && 
                    state.otcDepth["usdtrmb"] && state.otcDepth["usdtrmb"].bids && state.otcDepth["usdtrmb"].bids[0] ){
                        // 币的otc 商家卖出(用户购买) 数据遍历
                        state.otcDepth[otcCoinb].asks.forEach(element => {
                        if(element.price){
                            //利润，假设投入10000rmb将的到多少利润
                            //otc 买btcrmb（以卖n价）> 币币交易 卖btcusdt(以买一价) > otc 卖usdtrmb（以买一价） 
                            // element.profix = (10000 / element.price * state.marketDepth[marketCoinb].bids[0].price * state.otcDepth["usdtrmb"].bids[0].price - 10000).toFixed(2)
                            //otc 买btcrmb（以卖n价）> 币币交易 卖btcusdt(以买一价) > otc 卖usdtrmb（以设定的肯卖价） 
                            
                            let costPrice = element.price * (1 + otcRate)
                            let sellPrice =  state.marketDepth[marketCoinb].asks[0].price * state.usdtPrice.sell*(1 - coinRate)
                            let profix = sellPrice - costPrice
                            //element.profix = sellPrice - costPrice
                            
                            //let profix = 10000 / element.price * state.marketDepth[marketCoinb].bids[0].price * state.usdtPrice.sell - 10000
                            if(state.track.log.is_profix_base_10000 == false){//套利以币自身计算
                                //profix = (profix * element.price / 10000).toFixed(2)
                                element.profix = profix.toFixed(0)
                                if(state.track.log.open_log && element.profix  / costPrice >= state.track.log.log_profix_base_coin){
                                    state.buy_count==null?state.buy_count=0:state.buy_count++
                                    // 短信微信通知 TODO
                                    let msg = "币 " +  marketCoinb + "利润大于1%, 操作 rmb买入币换成u在卖出rmb " + "利润值 " + String(profix) 
                                    sendAlert(msg)

                                    console.log(new Date().toTimeString().substring(0,8),state.buy_count,"利润>="+state.track.log.log_profix_base_coin,"买入"+otcCoinb, element.profix,element.size,element.price,element.size * element.price)
                                }
                            } else if (state.track.log.is_profix_base_10000 == true){
                                //profix = profix.toFixed(2)
                                element.profix = profix.toFixed(0)
                                if(state.track.log.open_log && element.profix >= state.track.log.log_profix_base_10000){
                                    state.buy_count==null?state.buy_count=0:state.buy_count++
                                    console.log(new Date().toTimeString().substring(0,8),state.buy_count,"利润>="+state.track.log.log_profix_base_10000,"买入"+otcCoinb, element.profix,element.size,element.price,element.size * element.price)
                                }
                            }
                        }
                    });
                    if(state.track.show_guadan && state.otcDepth[otcCoinb].asks[0]){ //假设以卖1价挂单的利润
                        state.otcDepth[otcCoinb].profix_base_ask_1 = 10000 / state.usdtPrice.buy / state.marketDepth[marketCoinb].asks[0].price * state.otcDepth[otcCoinb].asks[0].price - 10000
                    }
                }
            }

            if(ch[1].match(/rmb$/g)){
                // market.btcrmb.depth.20 otc行情
                state.otcDepth[ch[1]] = message.data;
                if(ch[1] == "usdtrmb"){
                    return
                }
                computeProfix();
            }
            if(ch[3].match(/^step0$/g)){
                // market.eosusdt.depth.step0 币币交易行情
                state.marketDepth[ch[1]] = message.data;
                computeProfix();
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