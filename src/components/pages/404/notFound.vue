<template>
	<div class="text-center">
		<h1>404 - Not Found </h1>
		<p v-text="$t('errors.notFound')" />
		<p v-text="$t('errors.chooseAgain')" />
		<router-link :to="{name: 'home'}" v-text="$t('onMainPage')" />
	</div>
</template>

<script>
    export default {
        name: "notFound"
    }
</script>

<style scoped>

</style>
