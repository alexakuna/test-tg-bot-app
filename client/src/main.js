import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import InputFacade from 'vue-input-facade'

Vue.config.productionTip = false

Vue.use(InputFacade)

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
