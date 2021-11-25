import Vue from 'vue'
import App from './App.vue'
import router from "./router"
import vuetify from './plugins/vuetify.js'
import './plugins/base'
import VTooltip from 'v-tooltip'
import VueKonva from 'vue-konva'
import i18n from './plugins/i18n'

Vue.config.productionTip = false
Vue.use(VTooltip)
Vue.use(VueKonva)

new Vue({
  router,
  vuetify,
  i18n,
  components: {App},
  template: '<App/>',
  render: h => h(App)
}).$mount('#app');
Vue.config.ignoredElements = ['item','item-status','item-data','item-data-line','item-buttons','btn']
