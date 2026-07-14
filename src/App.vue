<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>

html,
body,
#app {
  height:100%;
  margin:0;
}


body {
  background:white;
}


#app {
  position:relative;
  min-height:100vh;
  background:white;
  overflow: hidden;
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
