// mutation-types.js
const SOCKET_ONOPEN = "SOCKET_ONOPEN" //'✅ Socket connected!'
const SOCKET_ONCLOSE = "SOCKET_ONCLOSE" //'❌ Socket disconnected!'
const SOCKET_ONERROR = "SOCKET_ONERROR"// '❌ Socket Error!!!'
const SOCKET_ONMESSAGE = "SOCKET_ONMESSAGE" //'Websocket message received'
const SOCKET_RECONNECT = "SOCKET_RECONNECT" //'Websocket reconnected'
const SOCKET_RECONNECT_ERROR = "SOCKET_RECONNECT_ERROR" //'Websocket is having issues reconnecting..'
 
export {
  SOCKET_ONOPEN,
  SOCKET_ONCLOSE,
  SOCKET_ONERROR,
  SOCKET_ONMESSAGE,
  SOCKET_RECONNECT,
  SOCKET_RECONNECT_ERROR
}