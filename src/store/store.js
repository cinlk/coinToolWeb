import Vue from 'vue'
import Vuex from 'vuex'


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
            sub_okex:{//基于ok的数据订阅
                otcRmb:["usdt","btc","eth","okb","ltc"],
                TradeUsdt:["btcusdt","ethusdt","okbusdt","ltcusdt"]
            },
            sub_binance: {
                otcRmb:["usdt","btc","eth","bnb"],
                TradeUsdt:["btcusdt","ethusdt","bnbusdt"]
            }
        },
        socket: {
            isConnected: false,
            message: '',
            reconnectError: false,
            heartbeatInterval: 5000,
            heartBeatTimer: 0,
        },

         // 交易费用
         tradeFee: {
            "huobi":{
                userType: 1,  // 1 代表散户看盘, 2 代表广告商看盘
                otcFee:0,
                coinFee:0
            },
            "okex":{

            },
            "binance":{

            }
            
        },


        otcDepth: {//OTC广告深度
            "huobi":{
                "usdt":{
                    bids:[],
                    asks:[],
                },
                "btc":{
                    bids:[],
                    asks:[],
                },
                "eth":{
                    bids:[],
                    asks:[],
                },
                "ht":{
                    bids:[],
                    asks:[],
                },
                "eos":{
                    bids:[],
                    asks:[],
                },
            },
            "okex":{
                "usdt":{
                    bids:[],
                    asks:[],
                },
                "btc":{
                    bids:[],
                    asks:[],
                },
                "eth":{
                    bids:[],
                    asks:[],
                },
                "okb":{
                    bids:[],
                    asks:[],
                },
                "ltc":{
                    bids:[],
                    asks:[],
                },
            },
            "binance":{
                "usdt":{
                    bids:[],
                    asks:[],
                },
                "btc":{
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
                },
                "ethusdt":{
                    bids:[], //对应的是行情里面的买一买二...
                    asks:[], //对应的是行情里面的卖一卖二...      
                },
                "htusdt":{
                    bids:[], //对应的是行情里面的买一买二...
                    asks:[], //对应的是行情里面的卖一卖二...      
                },
                "eosusdt":{
                    bids:[], //对应的是行情里面的买一买二...
                    asks:[], //对应的是行情里面的卖一卖二...      
                }
            }
            
        },
        marketTrade: { // 行情实时成交价 取第一个价格
            "huobi":{
                "btcusdt":{},
                "ethusdt":{},
                "htusdt":{},
                "eosusdt":{}
            },
            "okex":{
                "btcusdt":{},
                "ethusdt":{},
                "ltcusdt":{},
                "okbusdt":{}
            },
            "binance":{
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
            },
            "binance":{
                buy:10,
                sell:1,
            }
           
        },

        //permission
        otcPermission:{
            "huobi":true,
            "okex":true,
            "binance":true,
        },

        // system notification
        globalNotifyMsg:"",



        // token
        isLogin:'0',
        token: localStorage.getItem('token') ? localStorage.getItem('token') : '',
        userInfo: {} || JSON.parse(localStorage.getItem("userInfo")),
        checkToken: null,
    },
    mutations: {
        // changeUsdtPrice(state,paylaod){
        //     paylaod.buy ? state.usdtPrice.buy = paylaod.buy : ""
        //     paylaod.sell ? state.usdtPrice.sell = paylaod.sell : ""
        // },
        // 什么时候触发 socket 建立连接？
        // 网页打开时 建立了socket 连接
        [SOCKET_ONOPEN](state, event) {

            if (state.socket.isConnected == true){
                return
            }

            //console.log(Vue.prototype, event)
            console.log(new Date().toTimeString().substring(0,8), "socket on open", state, event)
            Vue.prototype.$socket = event.currentTarget
            state.socket.isConnected = true
            // 发送心跳

            state.socket.heartBeatTimer = setInterval(() => {
                
                state.socket.isConnected &&  Vue.prototype.$socket.send("ping")
            }, state.socket.heartbeatInterval);



            let subs = []
         
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



        
                state.track.sub_okex.otcRmb.forEach(element => {
                    subs.push({
                        sub: "market.otc."+element,
                        exchange: "okex",
                    })
                })
                state.track.sub_okex.TradeUsdt.forEach(element => {
                    subs.push({
                        sub: "market.spot.ticker."+element,
                        exchange: "okex",
                    })
                })

                
                state.track.sub_binance.otcRmb.forEach(element => {
                    subs.push({
                        sub: "market.otc."+element,
                        exchange: "binance",
                    })
                })

                state.track.sub_binance.TradeUsdt.forEach(element => {
                    subs.push({
                        sub: "market.spot.ticker."+element,
                        exchange: "binance",
                    })
                })

                
       
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
            clearInterval(state.socket.heartBeatTimer)
            state.socket.heartBeatTimer = null
           

        },
        [SOCKET_ONERROR](state, event) {
            console.log("socket on error", state, event)
            // console.error(state, event)
        },
        // default handler called for all methods
        [SOCKET_ONMESSAGE](state, event) {
            

            // 处理不同类型错误 分sub和unsub，在到具体的订阅信息 TODO
            // state.socket.message = event
            //console.log("on message", event.data)
            if (event.data == "unathorization"){
                // 关闭连接 TODO
                console.log("authorization failed then close connection")
                //console.log(Vue.prototype.$socket, Vue.prototype)
                //Vue.prototype.$disconnect()
                return
                //Vue.prototype.$socket.disconnect()
            }

            let message = {}
            try{
                message = JSON.parse(event.data)
                //console.log("socket on message", state, event, message)
            } catch(err) {
                return
            }


            // 判断 otc 币访问权限
            if (message.status == "no permission"){
                console.log("not permit to access", message.exchange, message.channel)
                state.otcPermission[message.exchange] = false
                return
            }
            
            if (message.status != "success"){
                console.log("receiv from socket not success", message.message)
                return
            }

            // 
            //if(message.exchange == )


           
            // 只处理了  otc数据  TODO
            const ch = message.ch.split(".")
            const exchange = message.exchange 
            
            let computeProfix = function(exchange, coinName){


                let otcCoinName = coinName.match(/usdt$/g) ? coinName.substr(0, coinName.length - 4) : coinName
                let spotCoinName = coinName.match(/usdt$/g) ? coinName : coinName + "usdt"

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
                         
                        // 购买广告利润
                        if (state.otcDepth[exchange][otcCoinName] && state.otcDepth[exchange][otcCoinName].bids && 
                            state.marketTrade[exchange][spotCoinName] && state.marketTrade[exchange][spotCoinName].last){
                                 
                                state.otcDepth[exchange][otcCoinName].bids.forEach(element => {
                                    if(element.price){

                                        var tradePrice = state.marketTrade[exchange][spotCoinName].last
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
                            state.marketTrade[exchange][spotCoinName] && state.marketTrade[exchange][spotCoinName].last){
                                state.otcDepth[exchange][otcCoinName].asks.forEach(element => {
                                    if (element.price){
                                        var tradePrice = state.marketTrade[exchange][spotCoinName].last
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

                    case "binance":
                             // 购买广告利润
                        if (state.otcDepth[exchange][otcCoinName] && state.otcDepth[exchange][otcCoinName].bids && 
                            state.marketTrade[exchange][spotCoinName] && state.marketTrade[exchange][spotCoinName].price){
                                 
                                state.otcDepth[exchange][otcCoinName].bids.forEach(element => {
                                    if(element.price){

                                        var tradePrice = state.marketTrade[exchange][spotCoinName].price
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
                            state.marketTrade[exchange][spotCoinName] && state.marketTrade[exchange][spotCoinName].price){
                                state.otcDepth[exchange][otcCoinName].asks.forEach(element => {
                                    if (element.price){
                                        var tradePrice = state.marketTrade[exchange][spotCoinName].price
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
                    default:
                        break;
                }                             
             
            }

            if(ch.length > 2 && ch[1].match(/otc$/g)){

                if (exchange == "huobi" || exchange == "okex" || exchange == "binance"){
                    
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
                if (exchange == "huobi" || exchange == "okex" || exchange == "binance"){
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


        $_setToken(state, value) { // 设置存储token
	        state.token = value;
            state.isLogin = '1';
	        localStorage.setItem('token', value);
	    },
	    $_removeStorage(state, value){  // 删除token
              state.isLogin = '0';
              // 清楚localstorage 里的数据
              state.token = ""
              state.userInfo = {}
		      localStorage.removeItem('token');
              localStorage.removeItem("userInfo")

	    },

        SaveLoginDatafunction(state, data) {
            //state.userInfo = data
            localStorage.setItem("userInfo", JSON.stringify(data))
        },

        connectWebSocket: function(state){
            
            // 之前连接的数据，可能会存在，更新tokne后，之前一直unauthorized尝试重连接
            //console.log(state)
            if(state.socket.isConnected == false){
                Vue.prototype.$connect(state.track.dataSource[0]+"?token="+state.token)

            }

        },

        // not used
        disConnectWebSocket: function(state){
            if (state.socket.isConnected == true){
                Vue.prototype.$disconnect()
            }

            

        },

        checkTokenInterval: function(state){
            if (state.checkToken == null){
                state.checkToken =  setInterval(() => {
                    // 检查token
                    Vue.prototype.$axios.get("token/check").then(function(res){
                           
                        if(res.data && res.data.code == 200){
                            state.otcPermission = res.data.data.service
                            state.globalNotifyMsg = res.data.data.content
                            return
                        }

                    }).catch(function(res){
                        //pass
                    })
                    console.log("check token ticker")
                }, 60000);
            
            }
        },

        stopCheckTokenInterval: function(state){
            clearInterval(state.checkToken)
            state.checkToken = null
        },




    },
    actions: {
        // sendMessage: function (context, message) {
        //     // console.log("send",message)
        //     if(typeof message == "object"){
        //         // Vue.prototype.$socket.sendObj(message)
        //         Vue.prototype.$socket.send(JSON.stringify(message))
        //     } else {
        //         Vue.prototype.$socket.send(message)
        //     }
        // }

      

        huobiSub: function(context, exchange){

            
            let subs  = []
            context.state.track.sub_huobi.otcRmb.forEach(element => {
                subs.push({
                    sub: "market.otc."+element,
                    exchange: exchange,
                })
            })
            context.state.track.sub_huobi.depthUsdt.forEach(element => {
                subs.push({
                    sub: "market.spot.depth."+element,
                    exchange: exchange,
                })
            })
            context.state.track.sub_huobi.TradeUsdt.forEach(element => {
                subs.push({
                    sub: "market.spot.ticker."+element,
                    exchange: exchange,
                })
            })
            // 如果 Vue.prototype.$socket == undefine 说明未建立连接

         
           
            subs.forEach(s => {
                

                Vue.prototype.$socket.send(JSON.stringify(s))
            })
        },

        okexSub: function(context, exchange){
            let subs = [] 
            context.state.track.sub_okex.otcRmb.forEach(element => {
                subs.push({
                    sub: "market.otc."+element,
                    exchange: exchange,
                })
            })
            context.state.track.sub_okex.TradeUsdt.forEach(element => {
                subs.push({
                    sub: "market.spot.ticker."+element,
                    exchange: exchange,
                })
            })

            subs.forEach(s => {
                Vue.prototype.$socket.send(JSON.stringify(s))
            })
        },

        binanceSub: function(context, exchange){
            let subs = []
            context.state.track.sub_binance.otcRmb.forEach(element => {
                subs.push({
                    sub: "market.otc."+element,
                    exchange: exchange,
                })
            })

            context.state.track.sub_binance.TradeUsdt.forEach(element => {
                subs.push({
                    sub: "market.spot.ticker."+element,
                    exchange: exchange,
                })
            })

            subs.forEach(s => {
                Vue.prototype.$socket.send(JSON.stringify(s))
            })


        }
       
    },

    getters: {
        getStorage(state){
            if(!state.token){
                state.token =JSON.parse(localStorage.getItem("token"))
            }
            return state.token
        },
        userInfo: (state) => state.userInfo
        
    }
})