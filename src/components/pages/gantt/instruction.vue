<template>
    <v-card>
        <v-card-title class="sticky-row pa-6">
            <span class="headline" v-text="$t('instruction.title')" />
        </v-card-title>
        <v-card-text>
            <v-row justify="center">
                <v-col class="text-center" v-text="$t('instruction.p1')" />
            </v-row>
            <v-row justify="center" align-content="center" content="center">
                <v-col class="text-center">
                    <img src="@/assets/img/gantt-change.gif" class="image-info-1" style="margin: auto"/>
                </v-col>
            </v-row>
            <v-row justify="center" align-content="center" content="center">
                <v-col class="text-center" v-text="$t('instruction.p2')" />
            </v-row>
            <v-row justify="center" align-content="center" content="center">
                <v-col class="text-center"> <img src="@/assets/img/gantt-change-type.gif" class="image-info-2" style="margin: auto"/></v-col>
            </v-row>
            <v-row justify="center" align-content="center" content="center">
                <v-col class="text-center">
                    <p v-text="$t('instruction.p3')" />
                    <p v-html="$t('instruction.p4')" />
                </v-col>
            </v-row>
            <v-row justify="center" align-content="center" content="center">
                <v-col class="text-center"> <img src="@/assets/img/gantt-add.gif" class="image-info-2" style="margin: auto"/></v-col>
            </v-row>
        </v-card-text>
        <v-card-actions class="sticky-row-bottom">
            <v-row align="center" justify="center" no-gutters>
                <v-btn-toggle rounded>
                    <v-btn color="blue darken-1" style="width: 100px" @click="$emit('close')" v-text="$t('close')" />
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
