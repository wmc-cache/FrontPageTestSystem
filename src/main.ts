import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import dayjs from "dayjs";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "dayjs/locale/zh-cn";
import "./styles/index.scss";

const app = createApp(App);
dayjs.locale("zh-ch");
app.config.globalProperties.$dayjs = dayjs;

const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
const host = window.location.host
const server = protocol + host
// @ts-ignore
window.serverSocketUrl = process.env.NODE_ENV === 'development' ? 'ws://127.0.0.1:18080' : server


app.use(router);
app.use(ElementPlus);
app.use(createPinia());
app.mount("#app");
