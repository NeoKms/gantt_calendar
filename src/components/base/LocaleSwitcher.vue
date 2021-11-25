<template>
  <div class="text-center">
    <v-menu offset-y open-on-hover>
      <template #activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on" class="black--text">
          <locale-block :locale="{ code: $i18n.locale }" />
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(lang, index) in locales"
          :key="index"
          class="locale-item"
        >
          <div
            @click="switchLocale(lang.code)"
            class="lang-btn"
          >
            <locale-block :locale="lang" />
          </div>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import LocaleBlock from "./LocaleBlock";
export default {
  name: 'LocaleSwitcher',
  components: {LocaleBlock},
  computed: {
    locales() {
      return Object.keys(this.$i18n.messages).map(el => ({code: el})).filter(i => i.code !== this.$i18n.locale)
    }
  },
  methods: {
    switchLocale(locale) {
      localStorage.setItem('i18n-locale',locale)
      this.$i18n.locale = locale
    }
  },
  mounted() {
    let locale = localStorage.getItem('i18n-locale')
    if (locale) {
      this.$i18n.locale = locale
    }
  }
}
</script>

<style scoped>
.lang-btn {
  text-decoration: none;
}
.locale-item:hover {
  opacity: 0.7;
}
</style>
