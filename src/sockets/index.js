
import Vue from 'vue'
import store from '../store/store'
import {
    SOCKET_ONOPEN,
    SOCKET_ONCLOSE,
    SOCKET_ONERROR,
    SOCKET_ONMESSAGE,
    SOCKET_RECONNECT,
    SOCKET_RECONNECT_ERROR
} from '../store/mutation-types'

const mutations = {
    SOCKET_ONOPEN,
    SOCKET_ONCLOSE,
    SOCKET_ONERROR,
    SOCKET_ONMESSAGE,
    SOCKET_RECONNECT,
    SOCKET_RECONNECT_ERROR
}
import VueNativeSock from 'vue-native-websocket' 

let wsUrl = store.state.track.dataSource[store.state.track.dataSourceIndex]
Vue.use(VueNativeSock, wsUrl, {
    // format: 'json', //对json对象数据的兼容，服务器传值也可以是json的
    store: store,
    mutations: mutations,
    reconnection: true, // (Boolean) whether to reconnect automatically (false)
    reconnectionAttempts: 100, // (Number) number of reconnection attempts before giving up (Infinity),
    reconnectionDelay: 2000, // (Number) how long to initially wait before attempting a new (1000)
    passToStoreHandler: function (eventName, event) { //对收到的socket的所有消息事件的前期封装操作
        // console.log("passToStoreHandler", eventName, event)
        if (!eventName.startsWith('SOCKET_')) { return }
        let method = 'commit'
        let target = eventName.toUpperCase()
        this.store[method](target, event)
    }
})
