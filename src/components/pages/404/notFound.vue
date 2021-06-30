<template>
	<div>
		<h1>404 - Not Found </h1>
		<p>Такой страницы нет.</p>
		<p>Выбери снова.</p>
		<router-link :to="{name: 'home'}">На главную</router-link>
	</div>
</template>

<script>
    export default {
        name: "notFound"
    }
</script>

<style scoped>

</style>
