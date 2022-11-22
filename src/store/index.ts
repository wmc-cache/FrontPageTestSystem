import { defineStore } from 'pinia';

// defineStore 调用后返回一个函数，调用该函数获得 Store 实体
export const useStore = defineStore({
  id: 'globalState',
  state: () => ({
    count: 1,
    data: {
      name: 'Jerry',
      sex: '男'
    }
  }),
  getters: {
    doubleCount: state => state.count * 2
  },
  actions: {}
});
