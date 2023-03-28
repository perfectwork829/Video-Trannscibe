<template>
  <div class="edmon-datepicker-wrapper" v-click-outside="hide">
    <b-form-group :label="label" :label-for="componentId">
      <div class="label-wrapper">
        <input
          :id="componentId"
          :class="labelClassName"
          autocomplete="off"
          :value="dateLabel"
          :placeholder="placeholder"
        />
        <div
          class="touch-picker"
          @click="clickPickerDiv"
          ref="anchor-div"
        ></div>
      </div>
    </b-form-group>
    <div
      :class="`calender-content-wrapper ${open && 'show'}`"
      ref="anchro-dropdown"
    >
      <div class="edmon-calender-header">
        <a class="btn-change-month" title="Prev" @click="changeMonth(-1)">
          <fa-icon :icon="['fas', 'chevron-left']"></fa-icon>
        </a>
        <a>
          {{ monthLabel }}
        </a>
        <a class="btn-change-month" title="Next" @click="changeMonth(1)">
          <fa-icon :icon="['fas', 'chevron-right']"></fa-icon>
        </a>
      </div>
      <div class="edmon-calender-body">
        <table>
          <thead>
            <tr>
              <th v-for="(item, idx) in dayName" :key="idx">{{ item }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(trItem, idx) in new Array(6)" :key="idx">
              <td
                v-for="(tdItem, idxTd) in new Array(7)"
                :key="idx * 7 + idxTd"
              >
                <a
                  :class="getDateClsName(idx * 7 + idxTd + 1)"
                  v-if="getCalDateNumber(idx * 7 + idxTd + 1)"
                  @click="setDate(idx * 7 + idxTd + 1)"
                  >{{ getCalDateNumber(idx * 7 + idxTd + 1) }}</a
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EdmonDatePicker',
  props: {
    componentId: {
      type: String,
      default: function () {
        return new Date().valueOf().toString();
      },
    },
    label: {
      type: String,
      default: 'Value',
    },
    placeholder: {
      type: String,
      default: 'mm/dd/yyyy',
    },
    dateValue: {
      type: [Number, String, null],
      default: null,
    },
  },
  data: function () {
    return {
      open: false,
      selectedMonth: new Date().valueOf(),
      dayName: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    };
  },
  watch: {
    open: function (newVal) {
      if (newVal) {
        const anchorRef = this.$refs['anchor-div'];
        const anchroDropdownRef = this.$refs['anchro-dropdown'];

        const left = anchorRef.getBoundingClientRect().left;
        const bottom = anchorRef.getBoundingClientRect().bottom;

        anchroDropdownRef.style.left = `${left}px`;
        anchroDropdownRef.style.top = `${bottom}px`;
      }
    },
  },
  computed: {
    labelClassName: function () {
      let returnClsName = 'form-control label-input';
      if (!this.dateValue) returnClsName += ' is-invalid';
      if (this.open) returnClsName += ' opened';
      return returnClsName;
    },
    dateLabel: function () {
      if (!this.dateValue) return '';
      const date = new Date(this.dateValue);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return mm + '/' + dd + '/' + yyyy;
    },
    monthLabel: function () {
      const date = new Date(this.selectedMonth);
      const yyyy = date.getFullYear();
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      return `${monthNames[date.getMonth()]} ${yyyy}`;
    },
  },
  methods: {
    hide: function () {
      this.open = false;
    },
    clickPickerDiv: function () {
      this.open = !this.open;
    },
    changeMonth: function (newValue) {
      let monthTemp = new Date(this.selectedMonth);
      monthTemp.setMonth(monthTemp.getMonth() + newValue);
      this.selectedMonth = monthTemp.valueOf();
    },
    getCalDateNumber: function (nIndex) {
      let monthTemp = new Date(this.selectedMonth);
      let firstDay = new Date(monthTemp.getFullYear(), monthTemp.getMonth(), 1);
      let firstDayNum = firstDay.getDay();
      var lastDay = new Date(
        monthTemp.getFullYear(),
        monthTemp.getMonth() + 1,
        0
      );
      if (nIndex - firstDayNum < 0) return '';
      if (nIndex - firstDayNum > lastDay.getDate()) return '';

      return nIndex - firstDayNum;
    },
    getDateClsName: function (nIndex) {
      const date = new Date(this.dateValue);
      const ddOne = String(date.getDate()).padStart(2, '0');
      const mmOne = String(date.getMonth() + 1).padStart(2, '0');
      const yyyyOne = date.getFullYear();

      const dateSelected = new Date(this.selectedMonth);
      const mmTwo = String(dateSelected.getMonth() + 1).padStart(2, '0');
      const yyyyTwo = dateSelected.getFullYear();

      if (yyyyOne !== yyyyTwo || mmOne !== mmTwo) return '';

      let firstDay = new Date(
        dateSelected.getFullYear(),
        dateSelected.getMonth(),
        1
      );
      if (nIndex - firstDay.getDay() === date.getDate()) return 'selected';
      else return '';
    },
    setDate: function (newDay) {
      this.open = false;
      let monthTemp = new Date(this.selectedMonth);
      let firstDay = new Date(monthTemp.getFullYear(), monthTemp.getMonth(), 1);
      let firstDayNum = firstDay.getDay();
      this.$emit(
        'changeDate',
        new Date(
          monthTemp.getFullYear(),
          monthTemp.getMonth(),
          newDay - firstDayNum
        ).valueOf()
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.edmon-datepicker-wrapper {
  position: relative;
  width: 100%;
  text-align: left;
  outline: none;
  overflow: visible;
  .label-wrapper {
    position: relative;
    .label-input {
      &.opened {
        border: 1px solid #5d78ff;
      }
    }
    .touch-picker {
      cursor: pointer;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }
  .calender-content-wrapper {
    display: none;
    position: fixed;
    background: black;
    box-shadow: 0 0.125rem 0.5rem rgb(0 0 0 / 10%);
    border-radius: 0.5rem;
    padding: 0.5rem;
    width: 296px;
    font-size: 14px;
    flex-direction: column;
    z-index: 1;
    &.show {
      display: inline-flex;
    }
    .edmon-calender-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 36px;
      .btn-change-month {
        color: #a1a0a7;
        cursor: pointer;
      }
    }
    .edmon-calender-body {
      width: 100%;
      table {
        width: 100%;
        th {
          text-align: center;
          font-size: 12px;
          font-weight: normal;
          line-height: 20px;
        }
        td {
          text-align: center;
          vertical-align: middle;
          a {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 4px;
            color: #a1a0a7;
            line-height: 30px;
            &:hover {
              color: white;
              background: #5d78ff;
            }
            &.selected {
              color: white;
              background: #5d78ff;
            }
          }
        }
      }
    }
  }
}
</style>
