<template>
  <div class="d-flex flex-row gantt-container">
    <v-container class="d-flex flex-column autowidth flex-grow-1 dop-cont">
      <div class="d-flex">
        <v-btn class="mx-2" icon dark small color="info" v-tooltip.auto="$t('instruction.name')"
               @click="modalInstruction=true">
          <v-icon dark style="font-size: 30px">mdi-information-outline</v-icon>
        </v-btn>
        <v-spacer/>
        <v-btn class="mx-2" fab dark small v-tooltip.auto="$t('cancel')" @click="changeState(0)"
               :disabled="states.length===1 || nowStateInd===0">
          <v-icon dark>mdi-undo</v-icon>
        </v-btn>
        <v-btn class="mx-2" fab dark small v-tooltip.auto="$t('back')" @click="changeState(1)"
               :disabled="states.length===1||nowStateInd===states.length-1">
          <v-icon dark>mdi-redo</v-icon>
        </v-btn>
        <v-spacer/>
        <v-btn class="mx-2" fab dark small color="error" v-tooltip.auto="`${step}${$t('daysLeft')}`"
               @click="changeHeader(0)">
          <v-icon dark>mdi-chevron-left</v-icon>
        </v-btn>
      </div>
      <div v-if="usersWithoutGantt.length">
        <h3> {{ $t('needToCreateSchedule') }}:</h3>
        <p v-for="user in usersWithoutGantt" :key="user.id" class="user-wt-gantt">
          {{ user.fio }}
          <v-btn class="mx-2" fab dark small icon color="error" v-tooltip.auto="$t('createSchedule')"
                 @click="openEditorGantt(user)">
            <v-icon dark>mdi-lead-pencil</v-icon>
          </v-btn>
        </p>
      </div>
    </v-container>
    <v-container class="d-flex flex-column justify-start overflow-auto calendar autowidth">
      <div class="d-flex flex-row">
        <div :style="{'max-width': `${columns[0]}px`,'min-width': `${columns[0]}px`}" v-text="$t('day')" />
        <div v-for="day in header" class="dayColumn border-right" :class="day.class" :key="day.s" :ref="`el_${day.i}`"
             :style="{'max-width': `${timeWidth*24}px`,'min-width': `${timeWidth*24}px`}">{{ day.s }}
        </div>
      </div>
      <div class="d-flex flex-row userrow" v-for="user in usersWithGantt" :key="`${user.id}_${user.upd_timestamp}`"
           :id="`${user.id}_${user.upd_timestamp}`">
        <div :style="{'max-width': `${columns[0]}px`,'min-width': `${columns[0]}px`}">
          {{ user.fio }}
          <div class="titleButton" @click="openMenu(user.id)" v-tooltip.auto="$t('actions')">
            <v-icon>{{ user.showMenu ? 'mdi-close' : 'mdi-dots-vertical' }}</v-icon>
          </div>
          <div v-if="user.showMenu" class="titleButton">
            <ul>
              <li @click="openModalPeriod(user)">{{ $t('addInterval') }}</li>
              <li @click="openModalChangeGantt(user)">{{ $t('changeSchedule') }}</li>
            </ul>
          </div>
        </div>
        <template v-for="day in header">
          <template v-for="(i2,hour) in Array(24)">
            <div
              :style="Object.assign({'max-width': `${timeWidth}px`,'min-width': `${timeWidth}px`},user.ganttData[`${day.i}_${hour}`].style)"
              :class="user.ganttData[`${day.i}_${hour}`].class"
              :key="`${user.id}_${day.i}_${hour}_time`"
              :ref="`${user.id}_${day.i}_${hour}_time`"
              :id="`${user.id}_${day.i}_${hour}_time`"
              v-tooltip.auto="user.ganttData[`${day.i}_${hour}`].tooltip"
              :draggable="user.ganttData[`${day.i}_${hour}`].draggable || false"
              @dragstart="dragStart($event,user.ganttData[`${day.i}_${hour}`])"
              @dragenter="dragEnter($event,user.ganttData[`${day.i}_${hour}`])"
              @dragover="dragOver($event,user.ganttData[`${day.i}_${hour}`])"
              @dragleave="dragLeave($event,user.ganttData[`${day.i}_${hour}`])"
              @drop="onDrop($event,user.ganttData[`${day.i}_${hour}`])"
              @dragend="dragEnd"

              @mouseover="mouseover($event,user.ganttData[`${day.i}_${hour}`])"
              @mouseout="mouseout($event,user.ganttData[`${day.i}_${hour}`])"
              @mousedown="mousedown($event,user.ganttData[`${day.i}_${hour}`])"
              @mouseup="mouseup($event,user.ganttData[`${day.i}_${hour}`])"

              @contextmenu="showPeriodContextMenu($event,user.ganttData[`${day.i}_${hour}`],`${day.i}_${hour}`)"
            ></div>
            <div v-if="user.ganttData[`${day.i}_${hour}`].menu" :key="`${day.i}_${hour}_menu`" class="titleButton">
              <ul>
                <li @click="openModalChange(user.ganttData[`${day.i}_${hour}`],`${day.i}_${hour}`)">
                  {{ $t('changeIntervalType') }}
                </li>
                <li @click="deleteInterval(user.ganttData[`${day.i}_${hour}`])">{{ $t('deleteInterval') }}</li>
              </ul>
            </div>
          </template>
        </template>
      </div>
    </v-container>
    <v-container class="d-flex flex-column autowidth dop-cont">
      <v-btn class="mx-2" fab dark small color="error" v-tooltip.auto="`${step}${$t('daysRight')}`"
             @click="changeHeader(1)">
        <v-icon dark>mdi-chevron-right</v-icon>
      </v-btn>
      <div class="color-container">
        <v-row v-for="type in periodTypes" :key="type.type" dense align="center">
          <v-col cols="12" sm="1">
            <div :style="{'background-color':type.color,width:'10px',height:'10px','border-radius':'50%'}"></div>
          </v-col>
          <v-col>
            {{ type.name }}
          </v-col>
        </v-row>
      </div>
    </v-container>
    <v-dialog width="400" v-model="gantEditor">
      <mGantEditor :uid="dataGantEditor.uidGantEditor" :startDateWork="dataGantEditor.startDateWork"
                   :key="dataGantEditor.uidGantEditor" @close="gantEditor=false" @save="saveGantt"/>
    </v-dialog>
    <v-dialog width="420" v-model="modalPeriod">
      <modalNewPeriod :key="dataModalPeriod.uid" @close="modalPeriod=false" @save="savePeriod" :intervals="intervals"/>
    </v-dialog>
    <v-dialog width="420" v-model="modalChange">
      <modalChangeType :key="dataModalChange.uid" @close="closeModalChange" :selectedType="dataModalChange.type"
                       :intervals="intervals" @save="saveModalChange"/>
    </v-dialog>
    <v-dialog width="1200" v-model="modalInstruction">
      <instruction @close="modalInstruction=false"/>
    </v-dialog>
  </div>
</template>

<script>
import {formatDateJS, getUnixTime} from "@/helpers/dates";
import mGantEditor from "./mGantEditor";
import modalNewPeriod from "./modalNewPeriod";
import modalChangeType from "./modalChangeType";
import instruction from "./instruction";

export default {
  name: "gantCalendar",
  components: {
    mGantEditor,
    modalNewPeriod,
    modalChangeType,
    instruction,
  },
  data() {
    return {
      //
      modalInstruction: false,
      dataGantEditor: {
        uidGantEditor: -1,
        startDateWork: -1
      },
      gantEditor: false,
      modalPeriod: false,
      dataModalPeriod: {
        uid: -1,
        value: null,
        mouseMove: false,
        mouseDown: false,
        blockedUp: true,
        comment: '',
      },
      modalChange: false,
      dataModalChange: {
        uid: -1,
        uind: -1,
        dataKey: null,
        type: null,
      },
      //
      viewCount: 8,
      startDate: 0,
      today: 0,
      step: 3,
      //
      timeWidth: 5,
      widthDay: -1,
      columns: [
        195
      ],
      //
      users: [],
      nowDragabble: null,
      reinitColorsArr: [],
      nowStateInd: -1,
      states: [],
      lastMenu: -1,
      lastContext: false,
      //
      typeColors: {
        'work': 'green',
        'daily_duty': 'yellow',
        'default': '#e2e2e2',
        'time_off': '#58bad2',
        'vacation': '#5129aa',
        'at_my_own': '#8e1d7c',
        'transfer': '#bd9e25',
        'sick': '#b64d24',
      },
    }
  },
  computed: {
    typeNames() {
      return {
        'work': this.$t('typeNames.work'),
        'daily_duty': this.$t('typeNames.daily_duty'),
        'default': '',
        'time_off': this.$t('typeNames.time_off'),
        'vacation': this.$t('typeNames.vacation'),
        'at_my_own': this.$t('typeNames.at_my_own'),
        'transfer': this.$t('typeNames.transfer'),
        'sick': this.$t('typeNames.sick'),
      }
    },
    dayType() {
      return [
        this.$t('dayType.su'),
        this.$t('dayType.mo'),
        this.$t('dayType.tu'),
        this.$t('dayType.we'),
        this.$t('dayType.th'),
        this.$t('dayType.fr'),
        this.$t('dayType.sa')
      ]
    },
    periodTypes() {
      let tmp = []
      for (let type in this.typeColors) {
        if (this.typeColors)
          tmp.push({
            name: type === 'default' ? this.$t('typeNames.default') : this.typeNames[type],
            color: this.typeColors[type],
            type,
          })
      }
      return tmp
    },
    intervals() {
      let tmp = []
      for (let val in this.typeNames) {
        tmp.push({
          val,
          name: this.typeNames[val]
        })
      }
      return tmp.filter(el => el.val !== 'default')
    },
    header() {
      let arr = []
      for (let i = this.startDate; i < this.today; i += 86400) {
        let date = new Date(i * 1000)
        arr.push({
          i: i,
          s: `${formatDateJS(i, 'DD MMMM YYYY', this.$i18n.locale)} (${this.dayType[date.getDay()]})`,
          d: date.getDate(),
          y: date.getFullYear(),
          m: date.getMonth() + 1,
          class: {'weekend': [6, 0].includes(date.getDay())}
        })
      }
      return arr
    },
    usersWithoutGantt() {
      return this.users.filter(el => !el.gantt.length)
    },
    usersWithGantt() {
      return this.users.filter(el => el.hasOwnProperty('ganttData'))
    }
  },
  methods: {
    // модалки
    // поповер по периоду
    showPeriodContextMenu(evt, item, dataKey) {
      if (item.type !== 'none') {
        this.hideOldContextMenu()
        item.menu = true
        let uind = this.users.findIndex(el => el.id === item.uid)
        this.lastContext = [uind, dataKey]
        evt.preventDefault()
      }
    },
    hideOldContextMenu() {
      if (this.lastContext !== false) {
        this.users[this.lastContext[0]].ganttData[this.lastContext[1]].menu = false
        this.lastContext = false
      }
    },
    // функция удаления интервала
    deleteInterval(item) {
      let uind = this.users.findIndex(el => el.id === item.uid),
        user = this.users[uind],
        isExistPeriod = user.periods.findIndex(el => el.start_i === item.period.start_i && el.start_hour === item.period.start_hour)
      if (isExistPeriod === -1) {
        this.setShortedByPeriod(item.period, user.shortedWorks)
      } else {
        user.periods.splice(isExistPeriod, 1)
      }
      this.reinitGant(uind)
    },
    // модалка изменения типа периода
    openModalChange(item, dataKey) {
      let uind = this.users.findIndex(el => el.id === item.uid)
      this.dataModalChange = {
        uid: item.uid,
        uind: uind,
        type: item.type,
        dataKey: dataKey
      }
      this.modalChange = true
    },
    saveModalChange(data) {
      let {uind, dataKey} = this.dataModalChange,
        user = this.users[uind],
        nowPeriod = JSON.parse(JSON.stringify(user.ganttData[dataKey]?.period)),
        isExistPeriod = user.periods.findIndex(el => el.start_i === nowPeriod.start_i && el.start_hour === nowPeriod.start_hour)
      nowPeriod.type = data.value
      nowPeriod.comment = data.comment
      if (isExistPeriod === -1) {
        user.periods.push(nowPeriod)
        this.setShortedByPeriod(nowPeriod, user.shortedWorks)
      } else {
        user.periods[isExistPeriod] = nowPeriod
      }
      this.reinitGant(uind)
    },
    closeModalChange() {
      this.modalChange = false
      this.dataModalChange = {
        uid: -1,
        uind: -1,
        dataKey: null,
        type: null,
      }
    },
    // поповер пользователя
    hideOldPopoverMenu() {
      if (this.lastMenu >= 0) {
        this.users[this.lastMenu].showMenu = false
        this.lastMenu = -1
      }
    },
    openMenu(id) {
      let uind = this.users.findIndex(el => el.id === id)
      this.hideOldPopoverMenu()
      this.users[uind].showMenu = true
      this.lastMenu = uind
    },
    // модалка добавления нового периода
    openModalPeriod(user) {
      this.dataModalPeriod.uid = user.id
      this.modalPeriod = true
      this.users[this.lastMenu].showMenu = false
      this.lastMenu = -1
    },
    savePeriod(data) {
      this.dataModalPeriod.value = data.value
      this.dataModalPeriod.comment = data.comment
      this.dataModalPeriod.mouseMove = true
    },
    // модалка изменения графика работы
    openModalChangeGantt(user) {
      this.dataGantEditor.uidGantEditor = user.id
      let first = getUnixTime(new Date().toLocaleDateString('en-CA') + ' 00:00:00') + 86400,
        lastGanttFirst = user.gantt[user.gantt.length - 1].firstDayWork
      this.dataGantEditor.startDateWork = Math.max(lastGanttFirst, first)
      this.gantEditor = true
    },
    // редактирование ганта
    // добавление через поповер и клики мышью
    mousedown(evt, item) {
      if (!this.dataModalPeriod.value || this.dataModalPeriod.mouseDown || this.dataModalPeriod.value === item.type) return;
      this.dataModalPeriod.mouseMove = false
      this.dataModalPeriod.mouseDown = true
      this.nowDragabble = JSON.parse(JSON.stringify(item))
      this.nowDragabble.type = this.dataModalPeriod.value
      this.nowDragabble.oldPeriod = JSON.parse(JSON.stringify(this.nowDragabble.period))
      this.nowDragabble.period = Object.assign(this.nowDragabble.period, {
        type: this.dataModalPeriod.value,
        start_i: this.nowDragabble.dateObj.i,
        start_hour: this.nowDragabble.hour,
      })
    },
    mouseup(evt, item) {
      if (!this.dataModalPeriod.value) return;
      if (this.dataModalPeriod.blockedUp) {
        this.reinitColorsArr = []
        this.onDrop(evt, item)
      }
      this.dragLeave(evt, item)
      this.dataModalPeriod = {
        uid: -1,
        value: null,
        mouseMove: false,
        mouseDown: false,
        blockedUp: true,
        comment: ''
      }
    },
    mouseover(evt, item) {
      if (!this.dataModalPeriod.value) return;
      if (this.dataModalPeriod.value === item.type) {
        this.$refs[item.key][0].classList.add('not-allowed')
      } else if (this.dataModalPeriod.mouseDown) {
        this.dragEnter({
          preventDefault: () => {
          }
        }, item)
      } else if (this.dataModalPeriod.mouseMove && this.dataModalPeriod.uid === item.uid) {
        let ref = this.$refs[item.key][0]
        this.reinitColorsArr.push({key: item.key, color: ref.style.backgroundColor})
        ref.style.backgroundColor = this.typeColors[this.dataModalPeriod.value]
        ref.classList.add('pointer')
      }
    },
    mouseout(evt, item) {
      if (!this.dataModalPeriod.value) return;
      if (this.dataModalPeriod.mouseDown) {
        this.dragLeave({
          preventDefault: () => {
          }
        }, item)
        this.$refs[item.key][0].classList.remove('pointer')
      } else if (this.dataModalPeriod.mouseMove && this.dataModalPeriod.uid === item.uid) {
        this.reinitColors()
        this.$refs[item.key][0].classList.remove('pointer')
      }
    },
    // перетаскивания и броски
    dragEnter(evt, item) {
      this.reinitColors()
      if (this.getFlTime(item)) {
        evt.preventDefault()
        this.$refs[item.key][0].classList.add('hoveredtime')
        // реверс - когда тянем в обратную от положения края сторону
        // реверс второй - когда это еще и левая сторона со своими заморочками
        // абсолюты - день + час
        let absoluteNow = this.nowDragabble.dateObj.i + this.nowDragabble.hour * 3600,
          absoluteItem = item.dateObj.i + item.hour * 3600,
          reverse = this.nowDragabble.isLeft ? (absoluteItem > absoluteNow) : (absoluteItem < absoluteNow),
          color = this.typeColors[this.nowDragabble.type],
          rev2 = this.nowDragabble.isLeft && absoluteItem > absoluteNow,
          start = ((reverse || this.nowDragabble.isLeft) && !rev2) ? absoluteItem + 3600 : absoluteNow,
          end = ((reverse || this.nowDragabble.isLeft) && !rev2) ? absoluteNow : (rev2 ? absoluteItem - 3600 : absoluteItem)
        for (let i = start, c = end; i <= c; i += 3600) {
          let date = new Date(formatDateJS(i, 'YYYY-MM-DD hh:mm:ss')),
            day = getUnixTime(date.toLocaleDateString('en-CA').toString() + ' 00:00:00'),
            hour = date.getHours(),
            key = `${this.nowDragabble.uid}_${day}_${hour}_time`
          let ref = this.$refs[key][0]
          this.reinitColorsArr.push({key, color: ref.style.backgroundColor})
          ref.style.backgroundColor = reverse ? this.typeColors['default'] : color
        }
      } else {
        this.$refs[item.key][0].classList.add('not-allowed')
      }
    },
    dragEnd() {
      this.reinitColors()
    },
    dragOver(evt, item) {
      if (this.getFlTime(item)) {
        evt.preventDefault()
      }
    },
    dragLeave(evt, item) {
      this.$refs[item.key][0].classList.remove('hoveredtime')
      this.$refs[item.key][0].classList.remove('not-allowed')
    },
    dragStart(evt, item) {
      if (!this.$refs[item.key][0].classList.contains('is-drag-el') || this.dataModalPeriod.value !== null) {
        evt.preventDefault()
        return;
      }
      evt.dataTransfer.dropEffect = 'move'
      evt.dataTransfer.effectAllowed = 'move'
      this.nowDragabble = item
    },
    onDrop(evt, item) {
      this.$refs[item.key][0].classList.remove('hoveredtime')
      if (item.key === this.nowDragabble.key && !this.dataModalPeriod.value) return;
      let uInd = this.users.findIndex(el => el.id === this.nowDragabble.uid), //ид пользователя
        user = this.users[uInd], //объект пользователя
        nowPeriod = JSON.parse(JSON.stringify(this.nowDragabble.period)), // период отрезка с которым работаем
        left = this.nowDragabble.isLeft, // тянули за левый край?
        createdPeriod = { //объект нового отрезка
          start_i: left ? item.dateObj.i : nowPeriod.start_i,
          end_i: left ? nowPeriod.end_i : item.dateObj.i,
          start_hour: left ? item.hour : nowPeriod.start_hour,
          end_hour: left ? nowPeriod.end_hour : item.hour,
          type: nowPeriod.type,
          comment: nowPeriod.comment ?? (this.dataModalPeriod.comment ?? '')
        },
        isExistPeriod = user.periods.findIndex(el => el.start_i === nowPeriod.start_i && el.start_hour === nowPeriod.start_hour),//такой период существует в массиве
        absoluteTimeStart = createdPeriod.start_i + createdPeriod.start_hour * 3600, //таймстамп нового начала отрезка
        absoluteTimeEnd = createdPeriod.end_i + createdPeriod.end_hour * 3600, //таймстамп нового окончания отрезка
        delInd = [], // удаление периодов по индексам
        unionWas = false, //было объединение ячеек (одного типа)
        breakWas = false, //был разрыв ячеек (наслоение разных типов)
        period = JSON.parse(JSON.stringify(item.period)), // период отрезка в который упали
        absPeriodItemStart = period.start_i + period.start_hour * 3600, //таймстамп начала отрезка в который упали
        absPeriodItemEnd = period.end_i + period.end_hour * 3600, // таймстамп окончания отрезка в который упали
        oldPeriodMouse = JSON.parse(JSON.stringify(this.nowDragabble.oldPeriod || false))//период в который мы кликнули мышью при добавлении нового
      ///////////////////////////////////////////////////////////
      this.debug(createdPeriod, 'createdPeriod')
      this.debug(this.users[uInd].periods, 'do', true)
      /////////////////////////////////////////////////////
      // скачем по периодам пользователя и изменяем их на горячую при необходимости
      user.periods.forEach((period, ind) => {
        if (isExistPeriod === ind) return;
        let absoluteStartEl = period.start_i + period.start_hour * 3600, //таймстемп начала периода
          absoluteEndEl = period.end_i + period.end_hour * 3600 //таймстемп окончания периода
        // если период полностью попадает в новый интервал
        // тогда удаляем его
        if ((absoluteTimeStart <= absoluteStartEl && absoluteTimeEnd >= absoluteEndEl)) {
          delInd.push(ind)
        }
          // если пересекаем какой-то существующий период
        // тогда объединяем или разбиваем
        else if ((!left && absoluteTimeEnd >= absoluteStartEl && absoluteTimeEnd <= absoluteEndEl) || (left && absoluteTimeStart >= absoluteStartEl && absoluteTimeStart <= absoluteEndEl)) {
          // если это период того же типа или это был период в один час
          // тогда удаляем период и сдвигаем конец нового на конец удаленного // является объединением
          if (period.type === createdPeriod.type || absoluteStartEl === absoluteEndEl) {
            delInd.push(ind)
            if (left) {
              createdPeriod.start_i = period.start_i
              createdPeriod.start_hour = period.start_hour
            } else {
              createdPeriod.end_i = period.end_i
              createdPeriod.end_hour = period.end_hour
            }
            unionWas = true
          }
            // если это были разного тип периоды
          // тогда сдвигаем его начало на конец нового+1ч // является разрывом
          else {
            // если мы режем не включая начало
            // тогда отделяем от начала до места разреза в отдельный период
            if (absoluteTimeStart > absoluteStartEl && !left) {
              let periodLeftSide = JSON.parse(JSON.stringify(period))
              this.breakInterval(periodLeftSide, createdPeriod, 0)
              this.users[uInd].periods.push(periodLeftSide)
            }
            this.breakInterval(period, createdPeriod, !left ? 1 : 0)
            breakWas = true
          }
        }
        // если это добавление мышью и начинаем резать период
        // тогда отделяем от начала до места разреза в отдельный период
        if (oldPeriodMouse && oldPeriodMouse.start_i === period.start_i && oldPeriodMouse.start_hour === period.start_hour) {
          this.breakInterval(period, createdPeriod, 0)
          breakWas = true
        }
      })
      let isOneHourExistPeriod = user.periods.findIndex(el => el.start_i === period.start_i && el.start_hour === period.start_hour) // мы упали в существующий период в 1 час?
      // если это период в один час
      // тогда у нас объединение
      if (absPeriodItemStart === absPeriodItemEnd && period.type !== 'none') {
        // если это существующий период
        // тогда удаляем его для объединения
        if (isOneHourExistPeriod !== -1) {
          delInd.push(isOneHourExistPeriod)
        }
        unionWas = true
      }
      //удаляем периоды в обратном порядке
      delInd.sort((a, b) => (a < b) ? 1 : ((b < a) ? -1 : 0))
      delInd.map(ind => user.periods.splice(ind, 1))
      //если не было объединения и разрыва и мы не упали не тот же самый, что изменяем
      //тогда это был автоматический период и с ним надо что-то сделать
      if (!unionWas && !breakWas && absPeriodItemStart !== nowPeriod.start_i + nowPeriod.start_hour * 3600) {
        //если типы не отличаются
        //тогда объединяем периоды
        if (period.type === createdPeriod.type) {
          if (left) {
            createdPeriod.start_i = period.start_i
            createdPeriod.start_hour = period.start_hour
          } else {
            createdPeriod.end_i = period.end_i
            createdPeriod.end_hour = period.end_hour
          }
        }
          //если наткнулись на автопериод работы
        //тогда разбиваем его и пушим как существующий
        else if (period.type === 'work') {
          this.breakInterval(period, createdPeriod, !left ? 1 : 0)
          this.users[uInd].periods.push(period)
          //если это разрыв в середине периода (при мыши)
          //тогда разрываем его начало и добиваем шортами
          if (oldPeriodMouse && oldPeriodMouse.type !== createdPeriod.type) {
            this.breakInterval(oldPeriodMouse, createdPeriod, 0)
            this.users[uInd].periods.push(oldPeriodMouse)
            user.shortedWorks = this.setShortedByPeriod(oldPeriodMouse, user.shortedWorks)//добавляем шорты
          }
        } else if (oldPeriodMouse) {
          this.breakInterval(oldPeriodMouse, createdPeriod, 0)
          this.users[uInd].periods.push(oldPeriodMouse)
          user.shortedWorks = this.setShortedByPeriod(oldPeriodMouse, user.shortedWorks)//добавляем шорты
        }
      }
      user.shortedWorks = this.setShortedByPeriod(createdPeriod, user.shortedWorks)//добавляем шорты
      user.shortedWorks = this.setShortedByPeriod(nowPeriod, user.shortedWorks)//добавляем шорты
      isExistPeriod = user.periods.findIndex(el => el.start_i === nowPeriod.start_i && el.start_hour === nowPeriod.start_hour)//проверяем изменяемый период на существование
      //если изменяемый период не существует
      //тогда пушим его как существующий
      if (isExistPeriod === -1) {
        user.periods.push(createdPeriod)
      }
        //если изменяемый период существует
      // тогда обновляем его
      else {
        user.periods[isExistPeriod] = createdPeriod
      }
      // выбиваем обновление графика из потока
      setTimeout(() => {
        this.reinitGant(uInd)
        //////////////////////////////
        this.debug(this.users[uInd].periods, 'posle', true)
        this.debug(user.shortedWorks, 'shorted', false, true)
        /////////////////////////////////////////////
      }, 50)
    },
    // действия с юзером
    // работа с данными
    getUsers() {
      setTimeout(() => {
        this.users = [
          {
            showMenu: false,
            fio: 'день 5/2 сб-вс 9-18',
            upd_timestamp: 0,
            id: 1,
            name: 'test',
            surname: "test1",
            secondname: 'test2',
            description: "descr",
            image_url: '',
            user_id: 123,
            card_number: 123,
            position: 'kek',
            working_time: 0,
            from_work: 0,
            norm_of_texs: 5,
            norm_character_count: 10,
            start_date_work: 1620950400,
            shortedWorks: {},
            periods: [
              {
                start_i: 1623542400,
                start_hour: 7,
                end_i: 1623542400,
                end_hour: 14,
                type: 'work'
              }, {
                start_i: 1623542400,
                start_hour: 15,
                end_i: 1623628800,
                end_hour: 14,
                type: 'daily_duty'
              }, {
                start_i: 1623628800,
                start_hour: 15,
                end_i: 1623628800,
                end_hour: 17,
                type: 'work'
              }
            ],
            gantt: [
              {
                graph: 1,
                weekends: 6,
                workingTime: 1,
                workingTimeStart: 9,
                workingTimeEnd: 17,
                firstDayWork: 1620950400,
                next: 0,
              }
            ],
          },
          {
            showMenu: false,
            fio: 'test test test',
            id: 2,
            name: 'test',
            surname: "test1",
            secondname: 'test2',
            description: "descr",
            image_url: '',
            user_id: 123,
            card_number: 123,
            position: 'kek',
            working_time: 0,
            from_work: 0,
            norm_of_texs: 5,
            norm_character_count: 10,
            start_date_work: 1620950400,
            shortedWorks: {},
            periods: [],
            gantt: [],
          },
          {
            showMenu: false,
            fio: 'ночь 5/2 сб-вс 21-08',
            upd_timestamp: 0,
            id: 3,
            name: 'test',
            surname: "test1",
            secondname: 'test2',
            description: "descr",
            image_url: '',
            user_id: 123,
            card_number: 123,
            position: 'kek',
            working_time: 0,
            from_work: 0,
            norm_of_texs: 5,
            norm_character_count: 10,
            start_date_work: 1620950400,
            shortedWorks: {},
            periods: [
              {
                start_i: 1623542400 + 86400,
                start_hour: 15,
                end_i: 1623628800 + 86400 * 3,
                end_hour: 14,
                type: 'daily_duty'
              }
            ],
            gantt: [
              {
                graph: 1,
                weekends: 6,
                workingTime: 2,
                workingTimeStart: 21,
                workingTimeEnd: 7,
                firstDayWork: 1620950400,
                next: 0,
              }
            ],
          },
          {
            showMenu: false,
            fio: 'день 2/2 09-18',
            upd_timestamp: 0,
            id: 4,
            name: 'test',
            surname: "test1",
            secondname: 'test2',
            description: "descr",
            image_url: '',
            user_id: 123,
            card_number: 123,
            position: 'kek',
            working_time: 0,
            from_work: 0,
            norm_of_texs: 5,
            norm_character_count: 10,
            start_date_work: 1620950400,
            shortedWorks: {},
            periods: [],
            gantt: [
              {
                graph: 2,
                weekends: -1,
                workingTime: 1,
                workingTimeStart: 9,
                workingTimeEnd: 17,
                firstDayWork: 1620950400,
                next: 0,
              }
            ],
          },
          {
            showMenu: false,
            fio: 'ночь 3/1 20-05',
            upd_timestamp: 0,
            id: 5,
            name: 'test',
            surname: "test1",
            secondname: 'test2',
            description: "descr",
            image_url: '',
            user_id: 123,
            card_number: 123,
            position: 'kek',
            working_time: 0,
            from_work: 0,
            norm_of_texs: 5,
            norm_character_count: 10,
            start_date_work: 1620950400,
            shortedWorks: {},
            periods: [],
            gantt: [
              {
                graph: 3,
                weekends: -1,
                workingTime: 2,
                workingTimeStart: 20,
                workingTimeEnd: 4,
                firstDayWork: 1623801600,
                next: 0,
              }
            ],
          },
        ]
        this.reinitGant()
      }, 100)
    },
    reinitGant(ind) {
      if (ind) {
        let user = this.users[ind]
        user.upd_timestamp = new Date().getTime()
        if (user.gantt.length) user.ganttData = this.getUserGantt(user)
      } else {
        this.users.forEach(user => {
          if (user.gantt.length) user.ganttData = this.getUserGantt(user)
        })
      }
      this.users = JSON.parse(JSON.stringify(this.users))
      if (this.nowStateInd !== this.states.length - 1) {
        this.states.splice(this.nowStateInd + 1, 100)
      }
      this.states.push(JSON.parse(JSON.stringify(this.users)))
      this.nowStateInd++
    },
    getUserGantt(user) {
      let obj = {},//объект объектов, где один объект - один час
        ganttArr = JSON.parse(JSON.stringify(user.gantt)).filter(el => (el.firstDayWork >= this.startDate && el.firstDayWork <= this.today) || (el.firstDayWork < this.startDate && el.next >= this.startDate && el.next <= this.today) || (el.firstDayWork <= this.startDate && el.next === 0)),//массив гантов пользователя отфильтрованный по началу за пределами и концу внутри отрезка и началу внутри отрезка
        gantt = ganttArr.shift(), //текущий гант
        shortedWorks = user.shortedWorks,//дни в которые отключается стандартный вывод работы
        daysNum = [7, 1, 2, 3, 4, 5, 6],//доп массив для преобразования дня недели в порядковый номер
        periods = user.periods.sort(function compare(a, b) {//сортируем периоды пользователя и копируем в одельный объект
          if (a.start_i < b.start_i) {
            return -1;
          }
          if (a.start_i > b.start_i) {
            return 1;
          }
          if (a.start_i === b.start_i) {
            if (a.start_hour < b.start_hour) {
              return -1;
            }
            if (a.start_hour > b.start_hour) {
              return 1;
            }
          }
          return 0;
        })
      if (!gantt) {
        gantt = JSON.parse(JSON.stringify(user.gantt[0]))
      }
      periods = JSON.parse(JSON.stringify(periods)).filter(per => (per.end_i >= this.startDate && per.end_i <= this.today) || (per.start_i >= this.startDate && per.start_i <= this.today)) //фильтруем на те, что входят в промежуток просмотра
      //цикл по всем дням, которые видит пользователь на экране
      for (let i = this.startDate; i < this.today; i += 86400) {
        if (i === gantt.next) {
          gantt = ganttArr.shift()
        }
        let {workingTime, workingTimeStart, workingTimeEnd, weekends, graph, firstDayWork} = gantt
        let date = new Date(i * 1000),
          isWeekend = false,//сегодня выходной?
          predIsWeekend = false,//завтра выходной?
          // eslint-disable-next-line no-prototype-builtins
          isShortedWork = shortedWorks.hasOwnProperty(i),//отключить стандартный вывод рабочих часов?
          dateObj = {
            i: i, s: date.toLocaleDateString('ru-RU'),
            d: date.getDate(), y: date.getFullYear(), m: date.getMonth() + 1
          }
        //свичкейс по типу рабочей смены
        switch (graph) {
          case 1:// 5/2
            isWeekend = [weekends, weekends + 1 > 7 ? 1 : weekends + 1].includes(daysNum[date.getDay()])
            predIsWeekend = [weekends, weekends + 1 > 7 ? 1 : weekends + 1].includes(daysNum[new Date((i - 86400) * 1000).getDay()])
            break
          case 2:// 2/2
            isWeekend = this.checkWeekend(2, 2, firstDayWork, i)
            predIsWeekend = this.checkWeekend(2, 2, firstDayWork, i - 86400)
            break
          case 3:// 3/1
            isWeekend = this.checkWeekend(3, 1, firstDayWork, i)
            predIsWeekend = this.checkWeekend(3, 1, firstDayWork, i - 86400)
            break
        }
        // если это до начала трудоустройства или это первый день работы
        // тогда это выходной и предыдущий выходной
        if (i < firstDayWork) {
          isWeekend = true
          predIsWeekend = true
        } else if (i === firstDayWork) {
          predIsWeekend = true
        }
        // цикл по часам внутри дня
        for (let hour = 0, c = 23; hour <= c; hour++) {
          let
            periodExist = periods.length ? ((i + hour * 3600) >= (periods[0].start_i + periods[0].start_hour * 3600) && (i + hour * 3600) <= (periods[0].end_i + periods[0].end_hour * 3600)) : false, // входит ли данный час в период
            period = false,
            key = `${i}_${hour}`,
            objTmp = {
              menu: false,
              dateObj,
              period: {
                start_i: i,
                start_hour: hour,
                end_i: i,
                end_hour: hour,
                type: 'none'
              },
              hour,
              key: `${user.id}_${i}_${hour}_time`,
              uid: user.id,
              type: 'none',
              style: {'background-color': this.typeColors['default']},
              tooltip: '',
              draggable: false,
              isLeft: false,
              class: {
                'border-right': hour === c
              }
            }
          if (periodExist) period = periods[0]
          // если это выходной и нет периода,
          // или это еще до первого рабочего дня,
          // и это не первый выходной ночной смены
          // тогда в этот час ничего
          // eslint-disable-next-line no-empty
          if (!(workingTime === 2 && !predIsWeekend && isWeekend) && ((isWeekend && !periodExist) || (i < firstDayWork))) {
          }
            // если это час без периода
          // тогда отрисовываем базовый рабочий час
          else if (!periodExist) {
            //можем перемещать только крайний час
            let isDraggable = hour === workingTimeStart || hour === workingTimeEnd
            // если это шортед и час попадает в один из указанных промежутков
            // тогда не отрисовываем
            if (isShortedWork && shortedWorks[i].findIndex(perTime => hour >= perTime[0] && hour <= perTime[1]) !== -1) {
              obj[key] = objTmp
            }
              // если это дневная смена и час попадает в рабочие часы
            // тогда это рабочий час
            else if (workingTime === 1 && hour >= workingTimeStart && hour <= workingTimeEnd) {
              objTmp = Object.assign(objTmp, {
                period: {
                  start_i: i,
                  start_hour: workingTimeStart,
                  end_i: i,
                  end_hour: workingTimeEnd,
                  type: 'work'
                },
                type: 'work',
                tooltip: `${this.typeNames['work']}<br>${workingTimeStart}:00 - ${workingTimeEnd + 1}:00`,
                draggable: isDraggable,
                isLeft: hour === workingTimeStart && workingTimeStart !== workingTimeEnd,
                //
                style: Object.assign(objTmp.style, {
                  'background-color': this.typeColors['work']
                }),
                class: Object.assign(objTmp.class, {
                  'is-drag-el': isDraggable,
                  'round-left': hour === workingTimeStart,
                  'round-right': hour === workingTimeEnd,
                })
              })
            }
              // если это ночная смена и час попадает в рабочие часы тогда проверяем другие условия:
              // если вчера был выходной, тогда пропускаем все часы от 00:00 до конца работы
            // если сегодня выходной,тогда пропускаем все часы от начала работы до 00:00
            else if (workingTime === 2 && (hour <= workingTimeEnd || hour >= workingTimeStart) && !(hour <= workingTimeEnd && predIsWeekend) && !(isWeekend && hour >= workingTimeStart)) {
              let start_i = hour >= workingTimeStart ? i : i - 86400
              let end_i = hour <= workingTimeEnd ? i : i + 86400
              objTmp = Object.assign(objTmp, {
                period: {
                  start_i: start_i,
                  start_hour: workingTimeStart,
                  end_i: end_i,
                  end_hour: workingTimeEnd,
                  type: 'work'
                },
                type: 'work',
                tooltip: `${this.typeNames['work']}<br>${start_i === end_i ? '' : formatDateJS(start_i, 'DD.MM')} ${workingTimeStart}:00 - ${start_i === end_i ? '' : formatDateJS(end_i, 'DD.MM')} ${workingTimeEnd + 1}:00`,
                draggable: isDraggable,
                isLeft: hour === workingTimeStart && workingTimeStart !== workingTimeEnd,
                style: Object.assign(objTmp.style, {
                  'background-color': this.typeColors['work']
                }),
                class: Object.assign(objTmp.class, {
                  'is-drag-el': isDraggable,
                  'round-left': hour === workingTimeStart,
                  'round-right': hour === workingTimeEnd,
                })
              })
            }
              // если ничего не подошло
            // тогда нам не надо ничего красить
            else {
              obj[key] = objTmp
            }
          }
            // если это период
          // тогда красим в тип периода
          else if (periodExist) {
            let isDraggable = (period.end_i === i && period.end_hour === hour) || (period.start_i === i && period.start_hour === hour)
            objTmp = Object.assign(objTmp, {
              type: period.type,
              period,
              draggable: isDraggable,
              isLeft: period.start_i === i && period.start_hour === hour && !(period.start_i === period.end_i && period.start_hour === period.end_hour),
              tooltip: `${this.typeNames[period.type]}<br>${period.start_i === period.end_i ? '' : formatDateJS(period.start_i, 'DD.MM')} ${period.start_hour}:00 - ${period.start_i === period.end_i ? '' : formatDateJS(period.end_i, 'DD.MM')} ${period.end_hour + 1}:00<br>${period.comment ?? ''}`,
              style: Object.assign(objTmp.style, {
                'background-color': this.typeColors[period.type]
              }),
              class: Object.assign(objTmp.class, {
                'is-drag-el': isDraggable,
                'round-left': hour === period.start_hour && i === period.start_i,
                'round-right': hour === period.end_hour && i === period.end_i,
              })
            })
          }
          // если период закончился - удаляем его
          if (period.end_i === i && period.end_hour === hour) {
            periods.shift()
          }
          obj[key] = objTmp
        }
      }
      return obj
    },
    changeState(plus) {
      plus ? this.nowStateInd++ : this.nowStateInd--
      this.users = JSON.parse(JSON.stringify(this.states[this.nowStateInd]))
    },
    // модалка настрйоки графика пользователя
    openEditorGantt(user) {
      this.dataGantEditor.uidGantEditor = user.id
      this.dataGantEditor.startDateWork = user.start_date_work
      this.gantEditor = true
    },
    saveGantt(data) {
      data.firstDayWork = getUnixTime(data.firstDayWork + ' 00:00:00')
      let uind = this.users.findIndex(el => el.id === this.dataGantEditor.uidGantEditor)
      if (this.users[uind].gantt.length) {
        let lastGanttInd = this.users[uind].gantt.length - 1
        if (this.users[uind].gantt[lastGanttInd].firstDayWork === data.firstDayWork) {
          this.users[uind].gantt[lastGanttInd] = data
        } else {
          this.users[uind].gantt[lastGanttInd].next = data.firstDayWork
          this.users[uind].gantt.push(data)
        }
      } else {
        this.users[uind].gantt.push(data)
      }
      this.reinitGant(uind)
    },
    // переключение временных интервалов
    changeHeader(plus) {
      if (plus) {
        this.startDate += 86400 * this.step
        this.today += 86400 * this.step
      } else {
        this.startDate -= 86400 * this.step
        this.today -= 86400 * this.step
      }
      this.states = []
      this.nowStateInd = -1
      this.reinitGant()
    },
    // доп методы
    breakInterval(period, createdPeriod, plus) {
      if (plus) {
        period.start_i = createdPeriod.end_i
        period.start_hour = createdPeriod.end_hour + 1
        if (period.start_hour > 23) {
          period.start_i += 86400
          period.start_hour = 0
        }
      } else {
        period.end_i = createdPeriod.start_i
        period.end_hour = createdPeriod.start_hour - 1
        if (period.start_hour < 0) {
          period.start_i -= 86400
          period.start_hour = 23
        }
      }
      return period
    },
    addShortedInterval(objDays, day, start, end) {
      // eslint-disable-next-line no-prototype-builtins
      if (!objDays.hasOwnProperty(day)) {
        objDays[day] = [];
      }
      let indExist = objDays[day].findIndex(interval => interval[0] === start)
      if (indExist !== -1) {
        objDays[day][indExist] = [start, Math.max(end, objDays[day][indExist][1])]
      } else {
        objDays[day].push([start, end])
      }
      objDays[day].sort((a, b) => (a[0] < b[0]) ? 1 : ((b[0] < a[0]) ? -1 : 0))
      let delInd = []
      for (let i = 0, c = objDays[day].length; i < c; i++) {
        for (let j = i + 1; j < c; j++) {
          if (objDays[day][i][0] >= objDays[day][j][0] && objDays[day][i][1] <= objDays[day][j][1]) {
            delInd.push(i)
          }
        }
      }
      delInd.sort((a, b) => (a < b) ? 1 : ((b < a) ? -1 : 0))
      delInd.map(ind => objDays[day].splice(ind, 1))
      return objDays
    },
    reinitColors() {
      this.reinitColorsArr.map(el => this.$refs[el.key][0].style.backgroundColor = el.color)
      this.reinitColorsArr = []
    },
    getFlTime(item) {
      let
        t1 = this.nowDragabble.dateObj.i + this.nowDragabble.hour * 3600,
        t2 = item.dateObj.i + item.hour * 3600,
        change = (this.nowDragabble.period.end_i + this.nowDragabble.period.end_hour * 3600) - (this.nowDragabble.period.start_i + this.nowDragabble.period.start_hour * 3600) + 3600
      this.nowDragabble.isLeft ? t1 += change : t1 -= change
      return this.nowDragabble.uid === item.uid && (this.nowDragabble.isLeft ? (t1 > t2) : (t1 < t2))
    },
    setShortedByPeriod(period, shorted) {
      for (let i = period.start_i; i <= period.end_i; i += 86400) {
        //указываем шортед промежутки, чтобы авторабота не отрисовывалась
        if (i === period.start_i && period.start_i !== period.end_i) {
          shorted = this.addShortedInterval(shorted, i, period.start_hour, 23)
        } else if (i === period.end_i && period.start_i !== period.end_i) {
          shorted = this.addShortedInterval(shorted, i, 0, period.end_hour)
        } else if (period.start_i === period.end_i) {
          shorted = this.addShortedInterval(shorted, i, period.start_hour, period.end_hour)
        } else {
          shorted = this.addShortedInterval(shorted, i, 0, 23)
        }
      }
      return shorted
    },
    checkWeekend(n, m, start, today) {
      let c = m + n
      return !((Math.round(Math.abs(today - start) / 86400) % c) / c < n / c)
    },
    debug(data, text, periods = false, shorted = false) {
      let copy = JSON.parse(JSON.stringify(data))
      if (periods) {
        let sortCopy = function compare(a, b) {
          if (a.start_i < b.start_i) {
            return -1;
          }
          if (a.start_i > b.start_i) {
            return 1;
          }
          if (a.start_i === b.start_i) {
            if (a.start_hour < b.start_hour) {
              return -1;
            }
            if (a.start_hour > b.start_hour) {
              return 1;
            }
          }
          return 0;
        }
        copy.sort(sortCopy)
        copy.forEach(el => {
          el.start_i = formatDateJS(el.start_i + el.start_hour * 3600, 'DD.MM.YYYY hh:mm:ss')
          el.end_i = formatDateJS(el.end_i + el.end_hour * 3600, 'DD.MM.YYYY hh:mm:ss')
        })
      }
      if (shorted) {
        let shortKopy = {}
        for (let ke in copy) {
          shortKopy[formatDateJS(ke, 'DD.MM.YYYY')] = copy[ke]
        }
        copy = shortKopy
      }
      console.log(text, JSON.stringify(copy, null, 2))
    },
  },
  created() {
    setTimeout(() => {
      if (this.$el.offsetWidth < 1600) {
        this.viewCount = 6
      }
      this.startDate = getUnixTime(new Date().toLocaleDateString('en-CA') + ' 00:00:00') - (86400 * (this.viewCount / 2))
      this.today = this.startDate + 86400 * this.viewCount
      let self = this
      document.getElementById('app').addEventListener('click', function (event) {
        let target = document
          .elementFromPoint(event.clientX, event.clientY)
          .closest(".titleButton");
        if (!target) {
          if (self.lastMenu >= 0) {
            self.users[self.lastMenu].showMenu = false
            self.lastMenu = -1
          }
          self.hideOldContextMenu()
        }
      })
      this.getUsers()
    })
  },
  mounted() {
    let instructionShow = localStorage.getItem('instruction_gantt')
    if (!instructionShow) {
      this.modalInstruction = true
      localStorage.setItem('instruction_gantt', '1');
    }
  }
}
</script>

<style scoped>
.color-container {
  margin-top: 10px;
}

.hoveredtime {
  opacity: 0.4;
}

.user-wt-gantt {
  margin-left: 20px;
}

.is-drag-el {
  cursor: w-resize;
}

.is-drag-el:hover {
  opacity: 0.5;
}

.round-left {
  border-top-left-radius: 100%;
  border-bottom-left-radius: 100%;
}

.round-right {
  border-top-right-radius: 100%;
  border-bottom-right-radius: 100%;
}

.dayColumn {
  padding-left: 4px;
  border-bottom: solid 1px #898989;
  font-size: 11px;
}

.border-right {
  border-right: solid 2px #898989;
}

.border-bottom {
  border-bottom: solid 2px #e2e2e2;
}

.border-left {
  border-left: solid 2px #898989;
}

.border-top {
  border-top: solid 2px #898989;
}

.autowidth {
  width: auto;
}

.userrow {
  padding-top: 2px;
  /*margin-top: 10px*/
}

.weekend {
  color: darkred;
}

.dop-cont {
  background-color: #eeeeee;
}

.calendar {
  background-color: #e2e2e2;
  min-height: 200px;
}

.titleButton {
  display: inline-block;
  position: relative;
  line-height: 0;
  cursor: pointer;
}

.titleButton:hover .theme--light.v-icon {
  color: #000;
}

.titleButton > ul {
  position: absolute;
  background-color: white;
  top: 0;
  left: 100%;
  line-height: initial;
  text-align: start;
  z-index: 1;
  padding: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

li {
  list-style-type: none;
  padding: 2%;
  white-space: nowrap;
}

li:hover {
  background-color: #dce1df;
}

.pointer {
  cursor: pointer;
}

.not-allowed {
  cursor: not-allowed;
}

@media (max-width: 800px) {
  .gantt-container {
    display: block !important;
  }
}
</style>
