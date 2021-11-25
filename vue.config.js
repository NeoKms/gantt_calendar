module.exports = {
  publicPath:  process.env.NODE_ENV === 'production'
    ? '/vue/pdfreader/'//'/vue/gantt-calendar/'
    : '/vue/',
  devServer: {
    disableHostCheck: true,
    port: 80,
  },
  transpileDependencies: ['vuetify'],
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
  },
}
