
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

let wsUrl = store.state.track.websocketUrl
Vue.use(VueNativeSock, wsUrl+"?token="+store.state.token, {
    // format: 'json', //对json对象数据的兼容，服务器传值也可以是json的
    store: store,
    connectManually: true,
    mutations: mutations,
    reconnection: true, // (Boolean) whether to reconnect automatically (false)
    reconnectionAttempts: 20, // (Number) number of reconnection attempts before giving up (Infinity),
    reconnectionDelay: 10000, // (Number) how long to initially wait before attempting a new (1000)
    passToStoreHandler: function (eventName, event) { //对收到的socket的所有消息事件的前期封装操作
        if (!eventName.startsWith('SOCKET_')) { return }
        let method = 'commit'
        let target = eventName.toUpperCase()
        this.store[method](target, event)
    }
})
