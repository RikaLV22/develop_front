<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>

html, body, #app {
  height:100%;
  margin:0;
}

#app {
  position: relative;
  min-height: 100vh;
  background: transparent;
}

#app::before {
  content: "";
  position: fixed;
  inset: 0;
  background: url('@/assets/backgroundbeta.jpg')  center / cover no-repeat;
  z-index: -1;
}

body {
  background: transparent;
}

</style>
<!-- import { createRouter, createWebHistory } from 'vue-router'
import TransactionList from '@/components/TransactionList.vue'

const routes = [
  {
    path: '/',          
    name: 'Home',
    component: TransactionList
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router -->
