<template>
  <div id="app">
    <router-view /> 
  </div>
</template>

import { createRouter, createWebHistory } from 'vue-router'
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

export default router
