<template>
    <v-app>
        <v-card color="grey lighten-4 ma-0" flat tile>
            <v-toolbar height="100">
                <router-link to="/"><img src="@/assets/img/logo.png" width="80" alt="logo"></router-link>
                <v-toolbar-title class="black--text">Title</v-toolbar-title>
                <v-toolbar-items>
                    <a class="nav_btn" href="https://jrgreez.ru/">Основной сайт</a>
                </v-toolbar-items>
            </v-toolbar>
        </v-card>
        <v-main>
            <v-container class="mycont">
                <router-view class="main-body" :key="this.$route.path" />
            </v-container>
        </v-main>
        <v-footer absolute class="font-weight-medium" elevation="12" app>
            <v-col class="text-center" cols="12">
                © {{ new Date().getFullYear() }} Copyright: <strong>Жигульский Владислав</strong>
            </v-col>
        </v-footer>
    </v-app>
</template>
<script>
    export default {
        name: 'App',
    }
</script>

<style lang="scss">
    .v-toolbar__items {
        align-items: center;
    }
    .mycont {
        max-width: none !important;
        width: 95% !important;
    }
    a {
        color: #007bff;
        text-decoration: none;
    }

    .main-body {
        width: 100%;
        background-color: #f5f5f5;
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
        margin: 5% auto 5%;
        overflow: hidden;
    }

    .nav_btn {
        margin-left: 10px;
        color: rgba(0, 0, 0, .5) !important;

        a {
            color: rgba(0, 0, 0, .5) !important;
        }

        &:hover {
            color: rgba(0, 0, 0, 1) !important;

            a {
                color: rgba(0, 0, 0, 1) !important;
            }
        }
    }
</style>
