// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router.js'
import axios from 'axios'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Vuex from 'vuex'
// import {sync} from 'vuex-router-sync'
import './style.css'
import App from './App.vue'


Vue.use(BootstrapVue)
Vue.use(Vuex)

Vue.config.productionTip = false
Vue.prototype.$axios = axios

const store = new Vuex.Store({
  state:{
    count:0
  },
  mutations:{
    increment(state, amount){
      state.count += amount
    }
  },
  actions:{
    plus (context) {
      context.commit('increment', 1)
    }
  }
})
// export default store
// sync(store ,router)


new Vue({
  el: '#app', // または app.$mount('#app')
  router,
  store,
  render: h => h(App), // App.vueをレンダリングする
});