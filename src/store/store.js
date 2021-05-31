import Vue from 'vue'
import Vuex from 'vuex'

const pako = require('pako')

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
            // websocketUrl: 'wss://swapworker.site/ws', 
            // localtest
              websocketUrl: 'ws://localhost:7001/ws',
           
            sub_huobi:{
                otcRmb:["usdt","btc","eth","ltc","eos"],  //订阅的otc数据  
                depthUsdt:["btcusdt","ethusdt","ltcusdt","eosusdt"],//行情盘口数据  "eosusdt"
                TradeUsdt:["btcusdt","ethusdt","ltcusdt","eosusdt"] // 实时币币交易数据
            },
            sub_okex:{
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
            heartbeatInterval: 10000,
            heartBeatTimer: 0,
            connectCount:0,
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
                "ltc":{
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
                "eth":{
                    bids:[],
                    asks:[],
                },
                "bnb":{
                    bids:[],
                    asks:[],
                },
            }
            
        },
        marketDepth: {//行情深度
            "huobi":{
                "btcusdt":{
                    bids:[], 
                    asks:[],       
                },
                "ethusdt":{
                    bids:[],  
                    asks:[],   
                },
                "htusdt":{
                    bids:[],  
                    asks:[],  
                },
                "eosusdt":{
                    bids:[],  
                    asks:[],    
                },
                "ltcusdt":{
                    bids:[],  
                    asks:[], 
                }
            }
            
        },
        marketTrade: { // 行情实时成交价 取第一个价格
            "huobi":{
                "btcusdt":{},
                "ethusdt":{},
                "htusdt":{},
                "eosusdt":{},
                "ltcusdt":{},
            },
            "okex":{
                "btcusdt":{},
                "ethusdt":{},
                "ltcusdt":{},
                "okbusdt":{}
            },
            "binance":{
                "btcusdt":{},
                "ethusdt":{},
                "bnbusdt":{}
            }
               
        },
        usdtPrice: { //设置买卖usdt价
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
       
        [SOCKET_ONOPEN](state, event) {

            //console.log(state, event )  
             
            // pako 
           
            if (state.socket.isConnected == true){
                return
            }


            //console.log("socket open", new Date(), state, event, state.socket.connectCount)
            
            Vue.prototype.$socket = event.currentTarget
            state.socket.isConnected = true
            state.socket.connectCount = 0
            Vue.prototype.$socket.binaryType = 'arraybuffer'
               
          
            
           
            //let that = this 
            // 发送心跳 5分钟为反向 断开连接 TODO？
            state.socket.heartBeatTimer = setInterval(() => {
                

                //console.log(new Date(), Vue.prototype, Vue.prototype.$socket)
                if (Vue.prototype.$socket && Vue.prototype.$socket.readyState == 1){
                    Vue.prototype.$socket.send("ping")
                }else{
                   state.socket.connectCount += 1
                   if (state.socket.connectCount < 6){
                       // 重连 6次 不生效？ 似乎只能sdk自带重连生效
                       //Vue.prototype.$connect(state.track.websocketUrl+"?token="+state.token)
                      
                   }else{
                        //console.log("websocket lose connection")
                        Vue.prototype.$disconnect()
                   }
                }

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
                    Vue.prototype.$socket.send(JSON.stringify(subs[i]))
                    i++;
                } else if (i>= subs.length && interval != null){
                    clearInterval(interval)
                    interval = null;
                }
            },300)
        },
        [SOCKET_ONCLOSE](state, event) {
            //console.log("socket close",  new Date(),state, event)

            // 后端 主动关闭 连接 前端未处理？TODO 还会一直ping
            state.socket.isConnected = false
            clearInterval(state.socket.heartBeatTimer)
            state.socket.heartBeatTimer = null
           

        },
        [SOCKET_ONERROR](state, event) {
            //console.log("socket error", new Date(), state, event)

        },
        // default handler called for all methods
        [SOCKET_ONMESSAGE](state, event) {
            
             
            // 处理不同类型错误 分sub和unsub，在到具体的订阅信息 TODO
            // 现在 都变成二进制数据？


            let message = {}
            try{
              
                if (typeof(event.data) != "string"){
                   
                    let cstr = pako.inflate(event.data, {to:"string",})
                    
                    // 字符串
                    message = JSON.parse(cstr)
                }else{ 
                    
                    message = JSON.parse(event.data)
                }
                
               
            } catch(err) {
                console.log(err)
                return
            }


                        
            if (message == "unathorization"){
                // 不能关闭连接 TODO ？
                //Vue.prototype.$disconnect()
                 console.log("connection unathorization")
                //console.log("message unathorization ", new Date(), Vue.prototype, Vue.prototype.$socket, state, event)
                return
            }
            if (message == "forbidden"){
                // 连接频率过高
                console.log("connection forbidden")
                //console.log("message forbidden ", new Date(), Vue.prototype, Vue.prototype.$socket, state, event)
                return
            }


            // 判断 otc 币访问权限
            if (message.status == "no permission"){
                state.otcPermission[message.exchange] = false
                return
            }
            
            if (message.status != "success"){
                return
            }

 
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
                
              
            }
            else if(ch.length > 3 && ch[2].match(/^depth$/g)){
                if (exchange == "huobi"){
                    state.marketDepth[exchange][ch[3]] = message.data
                    computeProfix(exchange, ch[3]);
                }
                
            }
            else if(ch.length > 2 && ch[2].match(/^ticker$/g)){
                if (exchange == "huobi" || exchange == "okex" || exchange == "binance"){
                    state.marketTrade[exchange][ch[3]] = message.data
                    computeProfix(exchange, ch[3]);
                }

             }
        },
        // mutations for reconnect methods
        [SOCKET_RECONNECT](state, count) {
            //console.log("socket reconnect",  new Date(), state)

         },
        [SOCKET_RECONNECT_ERROR](state) {
            //console.log("socket reconnect_error", new Date(), state)

            //state.socket.reconnectError = true;
        },


        $_setToken(state, value) { // 设置存储token
	        state.token = value;
            state.isLogin = '1';
	        localStorage.setItem('token', value);
	    },
	    $_removeStorage(state, value){  // 删除token
              state.isLogin = '0';
              // 清除localstorage 里的数据
              state.token = ""
              state.userInfo = {}
		      localStorage.removeItem('token');
              localStorage.removeItem("userInfo")

	    },

        SaveLoginDatafunction(state, data) {
            localStorage.setItem("userInfo", JSON.stringify(data))
        },

        connectWebSocket: function(state){
            
            // 之前连接的数据，可能会存在，更新tokne后，之前一直unauthorized尝试重连接？
       
            if(state.socket.isConnected == false){
                Vue.prototype.$connect(state.track.websocketUrl+"?token="+state.token)

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
                }, 60000);
            
            }
        },

        stopCheckTokenInterval: function(state){
            clearInterval(state.checkToken)
            state.checkToken = null
        },




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