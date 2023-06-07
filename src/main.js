import Vue from 'vue';
import App from './App.vue';
import Ccxd from 'ccxd-ux';
import 'ccxd-ux/lib/theme-ce/index.css';
Vue.config.productionTip = false;
Vue.use(Ccxd);
new Vue({
  render: (h) => h(App),
}).$mount('#app');
