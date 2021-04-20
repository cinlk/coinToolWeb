import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'

import Login from '@/components/login'
import Home from '@/components/home'
import Index from '@/components/sidebar/index'
import Huobi from '@/components/sidebar/otc/huobi'
import Okex from '@/components/sidebar/otc/okex'
import Binance from '@/components/sidebar/otc/binance'

import Coins from '@/components/sidebar/coins/newCoins'


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
      redirect: '/login',
      children: [
        {
          path: '/login',
          name: 'login',
        }
      ]

    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      redirect: '/index',
      children: [
        {
          path: '/index',
          name: '首页',
          component: Index

        },

        {
          path: '/huobi',
          name: 'huobi',
          component: Huobi,
          meta: { keepAlive: true}

        },

        {
          path: '/okex',
          name: 'okex',
          component: Okex,
          meta: { keepAlive: true}

        },
        {
          path: '/binance',
          name: 'binance',
          component: Binance,
          meta: { keepAlive: true}
        }

      ]
    },
    {
      path: '/coin',
      name: 'coin',
      component: Home,
      children: [
        {
          path: '/newcoin',
          name: 'newcoin',
          component: Coins,
          meta: { keepAlive: true}
        }
      ]
    }
  ]
})
