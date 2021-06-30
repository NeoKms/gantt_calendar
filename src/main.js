import Vue from 'vue'
import App from './App.vue'
import router from "./router"
import vuetify from './plugins/vuetify.js'
import VTooltip from 'v-tooltip'
import '@/assets/sass/overrides.sass'

Vue.config.productionTip = false
Vue.use(VTooltip)

new Vue({
    router,
    vuetify,
    components: {App},
    template: '<App/>',
    render: h => h(App)
}).$mount('#app');
