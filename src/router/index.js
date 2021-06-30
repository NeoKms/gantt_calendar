import Vue from 'vue';
import Router from "vue-router";

Vue.use(Router)

const router = new Router({
    mode: "history",
    routes: [
        {
            path: '/gantt-calendar',
            name: 'home',
            component: () => import("../components/pages/gantt/gantCalendar")
        },
        {
            path: '/404',
            alias: '*',
            name: '404',
            component: () => import("../components/pages/404/notFound"),
        },

    ]
})

export default router;
