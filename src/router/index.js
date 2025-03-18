import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import GameView from '../views/GameView.vue'; // 引入对战页面

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/game/:roomId', // 动态路由参数，表示房间ID
    name: 'Game',
    component: GameView,
    props: true, // 将路由参数作为组件的 props 传递
  },
  // ...其他路由
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
