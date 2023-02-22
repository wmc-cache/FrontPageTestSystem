import { createRouter, createWebHashHistory, Router } from 'vue-router';

const router: Router = createNewRouter()

function createNewRouter() {
  return createRouter({
    history: createWebHashHistory(),
    routes: [
      {
        path: '/',
        name: 'home',
        component: () => import('@/views/home/index.vue')
      },
      {
        path: '/oneToOne',
        name: 'oneToOne',
        component: () => import('@/views/oneToOne/index.vue')
      },
      {
        path: '/live',
        name: 'live',
        component: () => import('@/views/live/index.vue')
      }, {
        path: '/Janus',
        name: 'Janus',
        component: () => import('@/views/Janus/index.vue')
      }
    ]
  });
}

export default router;
