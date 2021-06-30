<template>
    <v-card>
        <v-card-title class="sticky-row pa-6">
            <span class="headline">Изменение типа интервала</span>
        </v-card-title>
        <v-card-text>
            <v-container grid-list-md>
                <v-layout wrap>
                    <v-flex xs12 sm12 md12>
                        <v-select v-model="value" :items="intervals.filter(el=>el.val!==selectedType)" item-text="name" item-value="val" label="Тип интервала" />
                    </v-flex>
                    <v-flex xs12 sm12 md12>
                        <v-textarea v-model="comment" label="Комментарий" />
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card-text>
        <v-card-actions class="sticky-row-bottom">
            <v-row align="center" justify="center" no-gutters>
                <v-btn-toggle rounded>
                    <v-btn color="blue darken-1" style="width: 100px" @click="close">Закрыть</v-btn>
                    <v-btn color="blue darken-1" style="width: 100px" @click="save" :disabled="value===-1">Сохранить</v-btn>
                </v-btn-toggle>
            </v-row>
        </v-card-actions>
    </v-card>
</template>
<script>
    export default {
        name: "modalChangeType",
        props: ['selectedType','intervals'],
        data() {
            return {
                value: -1,
                comment: '',
            }
        },
        methods: {
            close() {
                this.$emit('close')
                this.value = -1
            },
            save() {
                this.$emit('save', {value: this.value, comment: this.comment})
                this.close()
            },
        }
    }
</script>

<style scoped>

</style>
