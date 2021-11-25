import Vue from 'vue'
import VueI18n from 'vue-i18n'

import en from 'vuetify/lib/locale/en'

Vue.use(VueI18n)

const messages = {
  en: {
    ...require('@/locales/en.json'),
    $vuetify: en,
  },
  ru: require('@/locales/ru.json')
}

export default new VueI18n({
  messages,
  fallbackLocale: 'ru',
  locale: 'ru'
})
