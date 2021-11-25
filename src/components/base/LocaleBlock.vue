<template>
  <v-row dense class="locale-container" style="cursor: pointer">
    <v-col>
      {{ locale.code.toUpperCase() }}
    </v-col>
    <v-col>
      <img :src="require(`@/assets/img/${locale.code}.png`)" width="20" />
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'LocaleBlock',
  props: {
    locale: {
      type: Object,
      default: () => {
        return {
          code: 'ru'
        }
      }
    }
  }
}
</script>

<style scoped>
.locale-container {
  align-items: center;
}
</style>
