import {createApp} from 'vue'
import Antd from 'ant-design-vue'
import App from './App.vue'
import 'ant-design-vue/dist/reset.css'
import router from "./router.js";
import dayjs from "dayjs";

createApp(App)
    .use(dayjs)
    .use(Antd)
    .use(router)
    .mount('#app')