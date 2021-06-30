<template>
    <v-card>
        <v-card-title class="sticky-row pa-6">
            <span class="headline">Настройка графика работы</span>
        </v-card-title>
        <v-card-text>
            <v-container grid-list-md>
                <v-layout wrap>
                    <v-flex xs12 sm12 md12>
                        <v-select v-model="value.graph" :items="graphArr" item-text="name" item-value="val" label="График работы" @change="clearValue"/>
                    </v-flex>
                    <v-expand-transition>
                        <v-flex xs12 sm12 md12 v-if="value.graph===1">
                            <v-select v-model="value.weekends" :items="weekendsArr" item-text="name" item-value="val" label="Выходные"/>
                        </v-flex>
                    </v-expand-transition>
                    <v-expand-transition>
                        <v-flex xs12 sm12 md12 v-if="value.graph>1">
                            <v-menu
                                    ref="menu"
                                    v-model="menu"
                                    :close-on-content-click="false"
                                    :return-value.sync="value.firstDayWork"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="auto"
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                            filled
                                            single-line
                                            v-model="rutext"
                                            label="Нажмите для выбора даты"
                                            prepend-icon="mdi-calendar"
                                            class="mrgdown"
                                            readonly
                                            v-bind="attrs"
                                            v-on="on"
                                    ></v-text-field>
                                </template>
                                <v-date-picker
                                        v-model="value.firstDayWork"
                                        :first-day-of-week="1"
                                        no-title
                                        locale="ru-RU"
                                        class="mt-0 mb-0 datepickerstyle"
                                        event-color="white"
                                        scrollable
                                        :min="minimax[0]"
                                        :max="minimax[1]"
                                >
                                    <v-btn
                                            class="btnup"
                                            outlined
                                            rounded
                                            color="primary"
                                            @click="$refs.menu.save(value.firstDayWork)"
                                    >OK</v-btn>
                                </v-date-picker>
                            </v-menu>
                        </v-flex>
                    </v-expand-transition>
                    <v-expand-transition>
                        <v-flex xs12 sm12 md12 v-if="value.graph>0">
                            <v-select v-model="value.workingTime" :items="workingTimeArr" item-text="name" item-value="val" label="Время работы"/>
                        </v-flex>
                    </v-expand-transition>
                    <v-expand-transition>
                        <v-flex xs12 sm12 md12 v-if="value.workingTime>0">
                            <v-select v-model="value.workingTimeStart" :items="timeArr" item-text="name" item-value="val" label="Время начала работы" @change="value.workingTimeEnd=-1"/>
                        </v-flex>
                    </v-expand-transition>
                    <v-expand-transition>
                        <v-flex xs12 sm12 md12 v-if="value.workingTimeStart>=0">
                            <v-select v-model="value.workingTimeEnd" :items="timeArr2" item-text="name" item-value="val" label="Время окончания работы"/>
                        </v-flex>
                    </v-expand-transition>
                </v-layout>
            </v-container>
        </v-card-text>
        <v-card-actions class="sticky-row-bottom">
            <v-row align="center" justify="center" no-gutters>
                <span class="text-center font-weight-bold red--text">{{error}}</span>
                <v-btn-toggle rounded>
                    <v-btn color="blue darken-1" style="width: 100px" @click="close">Закрыть</v-btn>
                    <v-btn color="blue darken-1" style="width: 100px" @click="save" :disabled="!canBeSave">Сохранить</v-btn>
                </v-btn-toggle>
            </v-row>
        </v-card-actions>
    </v-card>
</template>

<script>
    export default {
        name: "mGantEditor",
        props: ['uid','startDateWork'],
        data() {
            return {
                menu: false,
                error: '',
                value: {
                    graph: -1,
                    weekends: -1,
                    workingTime: -1,
                    workingTimeStart: -1,
                    workingTimeEnd: -1,
                    firstDayWork: new Date(this.startDateWork * 1000).toLocaleDateString('en-CA'),
                    next: 0,
                },
                workingTimeArr: [
                    {val: 1, name: 'День'},
                    {val: 2, name: 'Ночь'},
                ],
                graphArr: [
                    {val: 1, name: '5/2'},
                    {val: 2, name: '2/2'},
                    {val: 3, name: '3/1'},
                    {val: 4, name: 'Без выходных'},
                ],
                weekendsArr: [
                    {val: 1, name: 'пн-вт'},
                    {val: 2, name: 'вт-ср'},
                    {val: 3, name: 'ср-чт'},
                    {val: 4, name: 'чт-пт'},
                    {val: 5, name: 'пт-сб'},
                    {val: 6, name: 'сб-вс'},
                    {val: 7, name: 'вс-пн'},
                ],
            }
        },
        methods: {
            close() {
                this.$emit('close')
                this.value = {
                    graph: -1,
                    weekends: -1,
                    workingTime: -1,
                    workingTimeStart: -1,
                    workingTimeEnd: -1,
                    firstDayWork: new Date(this.startDateWork*1000).toLocaleDateString('en-CA'),
                }
            },
            save() {
                this.$emit('save',JSON.parse(JSON.stringify(this.value)))
                this.close()
            },
            clearValue(){
                this.value = Object.assign(this.value,{
                    weekends: -1,
                    workingTime: -1,
                    workingTimeStart: -1,
                    workingTimeEnd: -1,
                    firstDayWork: new Date(this.startDateWork*1000).toLocaleDateString('en-CA'),
                })
            },
        },
        computed: {
            minimax() {
                let min = new Date(this.startDateWork*1000).toLocaleDateString('en-CA'),
                    max = new Date().toLocaleDateString('en-CA')
                if (this.startDateWork>=new Date().getTime()/1000) {
                    max = new Date(new Date().getTime()+86400*365*1000).toLocaleDateString('en-CA')
                }
                return [min,max]
            },
            rutext() {
                return new Date(this.value.firstDayWork).toLocaleDateString('ru-RU')
            },
            canBeSave() {
                let {graph,weekends,workingTime,workingTimeStart,workingTimeEnd} = this.value
                if (graph<0 || workingTime<0 || workingTimeEnd<0 || workingTimeStart<0) return false
                if (graph===1 && weekends<0) return false
                if (workingTime===1 && workingTimeStart>workingTimeEnd) {
                    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                    this.error = 'Время начала работы в дневную смену не может быть больше окончания'
                    return false
                }
                if (workingTime===2 && workingTimeStart<workingTimeEnd) {
                    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                    this.error = 'Время начала работы в ночную смену не может быть меньше окончания'
                    return false
                }
                return true
            },
            timeArr() {
                let arr = []
                for (let i = 0, c = 24; i < c; i ++ ) {
                    if (i<10) {
                        arr.push({name:`0${i}:00`,val:i})
                    } else {
                        arr.push({name:`${i}:00`,val:i})
                    }
                }
                return arr
            },
            timeArr2() {
                let arr = []
                for (let i = 1, c = 24; i <= c; i ++ ) {
                    if (i<10) {
                        arr.push({name:`0${i}:00`,val:i-1})
                    } else {
                        arr.push({name:`${i===24?'00':i}:00`,val:i-1})
                    }
                }
                if (this.value.workingTimeStart>=0) {
                    arr = arr.filter(el=>this.value.workingTime===1 ? el.val>=this.value.workingTimeStart : el.val<=this.value.workingTimeStart)
                }
                return arr
            }
        }
    }
</script>

<style scoped>
    .btnup {
        margin-left: 100px !important;
        margin-top: -40px !important;
    }
</style>
