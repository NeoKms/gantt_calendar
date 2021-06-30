<template>
    <v-card>
        <v-card-title class="sticky-row pa-6">
            <span class="headline">Инструкция по работе с графиком</span>
        </v-card-title>
        <v-card-text>
            <v-row justify="center">
                <v-col class="text-center"> Для изменения интервалов потяните за левый или правый край.</v-col>
            </v-row>
            <v-row justify="center" align-content="center" content="center">
                <v-col class="text-center">
                    <img src="@/assets/img/gantt-change.gif" class="image-info-1" style="margin: auto"/>
                </v-col>
            </v-row>
            <v-row justify="center" align-content="center" content="center">
                <v-col class="text-center"> Для изменения типа существующего интервала кликните правой кнопкой мыши по интервалу и выберите "редактировать".</v-col>
            </v-row>
            <v-row justify="center" align-content="center" content="center">
                <v-col class="text-center"> <img src="@/assets/img/gantt-change-type.gif" class="image-info-2" style="margin: auto"/></v-col>
            </v-row>
            <v-row justify="center" align-content="center" content="center">
                <v-col class="text-center">
                    <p> Для добавления нового интервала кликните на троеточие возле ФИО пользователя и выберите "добавить интервал".</p>
                    <p> Далее наведите мышью на место начала интервала (левый край) и с <b>нажатой</b> левой кнопкой мыши тяните вправо до места, где интервал должен закончиться.</p>
                </v-col>
            </v-row>
            <v-row justify="center" align-content="center" content="center">
                <v-col class="text-center"> <img src="@/assets/img/gantt-add.gif" class="image-info-2" style="margin: auto"/></v-col>
            </v-row>
        </v-card-text>
        <v-card-actions class="sticky-row-bottom">
            <v-row align="center" justify="center" no-gutters>
                <v-btn-toggle rounded>
                    <v-btn color="blue darken-1" style="width: 100px" @click="$emit('close')">Закрыть</v-btn>
                </v-btn-toggle>
            </v-row>
        </v-card-actions>
    </v-card>
</template>

<script>
    export default {
        name: "instruction",
        props: ['modal'],
    }
</script>

<style scoped>
    .sticky-row {
        position: sticky;
        top: 0;
        background-color: white;
        z-index: 1;
    }
    .sticky-row-bottom {
        position: sticky;
        bottom: 0;
        background-color: white;
        z-index: 1;
    }
    .image-info-1 {
        width: 400px;
    }
    .image-info-2 {
        width: 800px;
    }
    @media (max-width: 800px) {
        .image-info-1 {
            width: 240px;
        }
        .image-info-2 {
            width: 240px;
        }
    }
</style>
