/**
 * @author Johnny Swan <ferdinandgrau@gmail.com>
 */
(function () {
    'use strict';

    angular.module('redDatepickerModule', [])
        .constant('moment', window.moment)
        .directive('redDatepicker', redDatepicker)
        .service('redDatepickerService', redDatepickerService);

    function redDatepicker() {
        return {
            restrict: 'E',
            templateUrl: 'angular-red-datepicker.html',
            scope: {
                /** @param {string} locale - Set locale from directive attr.*/
                locale: '@?',
                /** @param {object} output - variable that return date values.*/
                output: '=?',
                /** @param {object} todayBtn - show or not today btns.*/
                todayBtn: '@?',
                /** @param {number} startSelection - quantity of days from today.*/
                numberOfDays: '@?',
                /** @param {boolean} listShow - show date range or not.*/
                listShow: '@?',
                /** @param {array} listArr - set list of dates for quick change with list button.*/
                listArr: '=?'
            },
            controller: datepickerController,
            controllerAs: 'calendar',
            bindToController: true
        };
    }

    datepickerController.$inject = ['moment', '$attrs', '$rootScope'];
    function datepickerController(moment, $attrs, $rootScope) {
        var vm = this;
        /** @description Variables show/hide elements*/
        vm.rangeShow = false;
        vm.calendarShow = false;
        vm.selectedDays = [];

        (function () {
            vm.locale = vm.locale || $attrs.locale;
            vm.todayBtn = vm.todayBtn || $attrs.todayBtn;
            vm.numberOfDays = vm.numberOfDays || $attrs.numberOfDays;
            vm.listShow = vm.listShow || $attrs.listShow;
            vm.dateEnd = vm.dateEnd || $attrs.dateEnd;
            vm.dateStart = vm.dateStart || $attrs.dateStart;

            /** @description Set locale from scope or by default */
            vm.locale = vm.locale ? (vm.locale !== '' ? vm.locale : 'en') : 'en';
            moment.locale(vm.locale);
            vm.localeInfo = moment.localeData();
            vm.weekStartDay = vm.localeInfo._week.dow;

            /** @description Date variables*/
            var date = moment(new Date());
            vm.todayForFront = date.format('DD.MM.YYYY');
            vm.today = {
                date: date.startOf('day'),
                year: date.format('YYYY'),
                month: date.format('M')
            };
            vm.month = {
                name: date.format('MMMM'),
                id: date.format('M')
            };
            vm.year = date.year();

            /** @description Variables for showing selected days*/
            vm.endSelection = date.startOf('day').toArray();
            vm.startSelection = moment(vm.endSelection).subtract(vm.numberOfDays, 'day').startOf('day').toArray();
            /** @description Variables for input date*/
            vm.inputStart = moment(vm.startSelection).format('L');
            vm.inputEnd = moment(vm.endSelection).format('L');
            vm.output = {start: vm.inputStart, end: vm.inputEnd};

            setTimeout(function () {
                vm.listArr = vm.listArr || $attrs.listArr;
                if (vm.listShow) {
                    if (Array.isArray(vm.listArr)) {
                        vm.list = listSetByUser();
                    } else {
                        vm.list = listDefault();
                    }
                } else {
                    vm.list = '';
                }
            }, 300);
        })();

        vm.getDay = getDay;
        vm.daySelect = daySelect;
        vm.activeRange = activeRange;
        vm.monthChange = monthChange;
        vm.yearChange = yearChange;
        vm.calendarArray = calendarArray;
        vm.listSelected = listSelected;
        vm.showPopup = showPopup;
        vm.getDaysNames = getDaysNames;
        vm.getPreviousMonth = getPreviousMonth;
        vm.getCurrentMonth = getCurrentMonth;
        vm.getNextMonth = getNextMonth;
        vm.formatFrontDate = formatFrontDate;


        /**
         * @description Checking from what day week start
         */
        function getDaysNames(weekStartDay, localeDays) {
            if (weekStartDay === 1) {
                localeDays.push(localeDays.splice(0, 1)[0]);
            }
            return localeDays;
        }

        /**
         * Getting day by click on it on calendar box
         * @param {object} day
         */
        function getDay(day) {
            if (day.fade && !day.afterCurrentNextMonth) {
                if (day.beforeMonth) {
                    vm.monthChange(vm.month.id, 'left');
                } else if (day.nextMonth) {
                    vm.monthChange(vm.month.id, 'right');
                }
            } else {
                vm.daySelect(day);
            }
        }

        function daySelect(day) {
            if (!day.afterCurrentNextMonth && !day.afterCurrent) {
                day.active = !day.active;
                if (vm.selectedDays.length === 2) {
                    for (var i = 0, len = vm.selectedDays.length; i < len; i++) {
                        vm.selectedDays[i].active = false;
                    }
                    vm.selectedDays.length = 0;
                    vm.selectedDays.push(day);
                } else if (vm.selectedDays.length === 1) {
                    vm.selectedDays.push(day);
                    vm.activeRange(vm.selectedDays);
                } else {
                    vm.selectedDays.push(day);
                }
            }
        }

        function activeRange(value) {
            if (moment(value[0].date).isBefore(value[1].date)) {
                vm.startSelection = moment(value[0].date).toArray();
                vm.endSelection = moment(value[1].date).toArray();
            } else {
                vm.startSelection = moment(value[1].date).toArray();
                vm.endSelection = moment(value[0].date).toArray();
            }
            vm.inputStart = moment(vm.startSelection).format('L');
            vm.inputEnd = moment(vm.endSelection).format('L');
            vm.output = {start: vm.inputStart, end: vm.inputEnd};
            vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
        }

        function monthChange(id, direction) {
            var thisMoment = moment([vm.year, id - 1, 1]);
            if (direction === 'left') {
                if (+vm.month.id === 1) {
                    vm.year = thisMoment.subtract(1, 'year').format('YYYY');
                }
                vm.month.name = thisMoment.subtract(1, 'month').format('MMMM');
                vm.month.id = moment().month(vm.month.name).format('M');
                vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            } else if (direction === 'right') {
                if (+vm.month.id === 12) {
                    vm.year = thisMoment.add(1, 'year').format('YYYY');
                }
                vm.month.name = thisMoment.add(1, 'month').format('MMMM');
                vm.month.id = moment().month(vm.month.name).format('M');
                vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            }
        }

        function yearChange(direction) {
            var thisMoment = moment([vm.year, vm.month.id - 1, 1]);
            if (direction === 'left') {
                vm.year = thisMoment.subtract(1, 'year').format('YYYY');
                vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            } else if (direction === 'right') {
                vm.year = thisMoment.add(1, 'year').format('YYYY');
                vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            }
        }

        function calendarArray(current) {
            var currentMonth = moment(current).startOf('month'),
                previousMonth = moment(current).subtract(1, 'month').endOf('month').startOf('day'),
                nextMonth = moment(current).add(1, 'month').startOf('month'),
                startDay = moment(current).startOf('month').format('d'),
                endDay = moment(current).endOf('month').format('d');
            return vm.getPreviousMonth(previousMonth, startDay)
                .concat(vm.getCurrentMonth(currentMonth), vm.getNextMonth(nextMonth, endDay));
        }

        function getPreviousMonth(previousMonth, startDay) {
            var previousMonthArray = [], start = '', date = '';
            if (vm.weekStartDay === 0) {
                start = (Number(startDay) ? (startDay === 1 ? 8 : startDay) : 7);
            } else {
                start = (Number(startDay) ? (startDay === 1 ? 7 : startDay - 1) : 6);
            }
            date = previousMonth.subtract(start - 1, 'day');
            for (var i = 0; i < start; i++) {
                var a = {
                    str: +date.format('D'),
                    current: date.isSame(vm.today.date),
                    date: date.toArray(),
                    fade: true,
                    active: false,
                    beforeMonth: true,
                    selected: date.isBetween(vm.startSelection, vm.endSelection, null, '[]'),
                    dayStart: date.isSame(moment(vm.startSelection)),
                    dayEnd: date.isSame(moment(vm.endSelection))
                };
                previousMonthArray.push(a);
                date.add(1, 'day');
            }
            return previousMonthArray;
        }

        function getCurrentMonth(currentMonth) {
            var currentMonthArray = [];

            for (var i = 0, times = currentMonth.daysInMonth(); i < times; i++) {
                var a = {
                    str: +currentMonth.format('D'),
                    current: currentMonth.isSame(vm.today.date),
                    date: currentMonth.toArray(),
                    fade: false,
                    afterCurrent: currentMonth.isAfter(vm.today.date),
                    active: false,
                    selected: currentMonth.isBetween(vm.startSelection, vm.endSelection, null, '[]'),
                    dayStart: currentMonth.isSame(moment(vm.startSelection)),
                    dayEnd: currentMonth.isSame(moment(vm.endSelection))
                };
                currentMonthArray.push(a);
                currentMonth.add(1, 'day');
            }
            return currentMonthArray;
        }

        function getNextMonth(nextMonth, endDay) {
            var nextMonthArray = [], end = '';
            if (vm.weekStartDay === 0) {
                end = (Number(endDay) ? (endDay === 6 ? 7 : 6 - endDay ) : 6);
            } else {
                end = (Number(endDay) ? (endDay === 6 ? 1 : 7 - endDay ) : 7);
            }
            for (var i = 0; i < end; i++) {
                var a = {
                    str: +nextMonth.format('D'),
                    current: nextMonth.isSame(vm.today.date),
                    fade: true,
                    date: nextMonth.toArray(),
                    afterCurrentNextMonth: nextMonth.isAfter(vm.today.date),
                    active: false,
                    nextMonth: true,
                    selected: nextMonth.isBetween(vm.startSelection, vm.endSelection, null, '[]'),
                    dayStart: nextMonth.isSame(moment(vm.startSelection)),
                    dayEnd: nextMonth.isSame(moment(vm.endSelection))
                };
                nextMonthArray.push(a);
                nextMonth.add(1, 'day');
            }
            return nextMonthArray;
        }


        function listSelected(item) {
            vm.startSelection = moment(new Date(item.start));
            vm.endSelection = moment(new Date(item.end));
            vm.inputStart = moment(new Date(item.start)).format('L');
            vm.inputEnd = moment(new Date(item.end)).format('L');
            vm.output = {start: vm.inputStart, end: vm.inputEnd};
            vm.monthShow = new vm.calendarArray(vm.today.date);
        }

        function showPopup(el) {
            if (el === 'calendarShow') {
                vm.calendarShow = !vm.calendarShow;
                vm.rangeShow = false;
            } else if (el === 'rangeShow') {
                vm.rangeShow = !vm.rangeShow;
                vm.calendarShow = false;
            }
        }

        function formatFrontDate(el) {
            return el.format('L');
        }

        function listSetByUser() {
            for (var i = 0, len = vm.listArr.length; i < len; i++) {
                if (vm.listArr[i].days < 30) {
                    vm.listArr[i].start = moment(vm.today.date).subtract(vm.listArr[i].days - 1, 'days');
                    vm.listArr[i].end = vm.today.date;
                } else {
                    vm.listArr[i].start = moment(vm.today.date).subtract(vm.listArr[i].days, 'days').startOf('month');
                    vm.listArr[i].end = moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day');
                }
            }
            return vm.listArr;
        }

        function listDefault() {
            return [{
                label: 'Last Week',
                start: moment(vm.today.date).subtract(6, 'days'),
                end: vm.today.date
            }, {
                label: 'Last 15 days',
                start: moment(vm.today.date).subtract(14, 'days'),
                end: vm.today.date
            }, {
                label: 'Last 30 days',
                start: moment(vm.today.date).subtract(29, 'days'),
                end: vm.today.date
            }, {
                label: 'Last month',
                start: moment(vm.today.date).subtract(30, 'days').startOf('month'),
                end: moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day')
            }, {
                label: 'Last 3 months',
                start: moment(vm.today.date).subtract(3, 'month').startOf('month'),
                end: moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day')
            }, {
                label: 'Last 6 months',
                start: moment(vm.today.date).subtract(6, 'month').startOf('month'),
                end: moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day')
            }, {
                label: 'Last year',
                start: moment(vm.today.date).subtract(12, 'month').startOf('month'),
                end: moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day')
            }];
        }

        $rootScope.$on('updateDate', function (event, data) {
            vm.endSelection = moment(data.end, vm.localeInfo._longDateFormat.L);
            vm.startSelection = moment(data.start, vm.localeInfo._longDateFormat.L);
            vm.inputStart = moment(vm.startSelection).format('L');
            vm.inputEnd = moment(vm.endSelection).format('L');
            vm.output = {start: vm.inputStart, end: vm.inputEnd};
            vm.monthShow = new vm.calendarArray(vm.today.date);
        });

        vm.days = vm.getDaysNames(vm.weekStartDay, vm.localeInfo._weekdaysMin);
        vm.monthShow = new vm.calendarArray(vm.today.date);
    }

    redDatepickerService.$inject = ['$rootScope'];
    function redDatepickerService($rootScope) {
        var a = {};
        this.setData = function (start, end, fire) {
            a = {start: start, end: end};
            if (fire) {
                $rootScope.$emit('updateDate', a);
            }
            return a;
        };
        this.getData = function () {
            return a;
        };
    }

})();
