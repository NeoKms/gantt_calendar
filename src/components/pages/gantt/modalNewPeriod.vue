<template>
    <v-card>
        <v-card-title class="sticky-row pa-6">
            <span class="headline" v-text="$t('addNewInterval')" />
        </v-card-title>
        <v-card-text>
            <v-container grid-list-md>
                <v-layout wrap>
                    <v-flex xs12 sm12 md12>
                        <v-select v-model="value" :items="intervals" item-text="name" item-value="val" :label="$t('intervalType')" />
                    </v-flex>
                    <v-flex xs12 sm12 md12>
                        <v-textarea v-model="comment" :label="$t('comment')" />
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card-text>
        <v-card-actions class="sticky-row-bottom">
            <v-row align="center" justify="center" no-gutters>
                <v-btn-toggle rounded>
                    <v-btn color="blue darken-1" style="width: 100px" @click="close" v-text="$t('close')" />
                    <v-btn color="blue darken-1" style="width: 100px" @click="save" :disabled="value===-1" v-text="$t('save')" />
                </v-btn-toggle>
            </v-row>
        </v-card-actions>
    </v-card>
</template>
<script>
    export default {
        name: "modalNewPeriod",
        props: ['intervals'],
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
