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

app.use(router);
app.use(ElementPlus);
app.use(createPinia());
app.mount("#app");
