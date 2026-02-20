import Vue from 'vue';
import VueRouter from 'vue-router';

import home from '@/pages/HomePage.vue';
import sub from '@/pages/SubItem.vue';
import CreateUserOrganization from './components/CreateUserOrganization.vue';
import LoginPage from './pages/LoginPage.vue';
import TransactionPage from '@/pages/TransactionList.vue'
Vue.use(VueRouter);

var router = new VueRouter({
  // mode: 'history',
  routes: [
    {
      path: '/',
      component: home
    },
    {
      path: '/sub',
      component: sub
    },
    {
      path: '/usercreate',
      component: CreateUserOrganization
    },
    {
      path: '/login',
      component: LoginPage
    },
    {
      path: '/mypage',
      component: () => import('@/pages/MyPage.vue')
    },
    {
      path: '/transactions',
      component: TransactionPage
    },
    {
      path: '/profile',
      component: () => import('@/pages/MyProfile.vue')
    }
  ]
});

export default router;
