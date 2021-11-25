module.exports = {
  devServer: {
    disableHostCheck: true,
    port: 80,
    public: '0.0.0.0:80'
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
