/**
 * @author Johhny Swan <ferdinandgrau@gmail.com>
 */
(function () {
    'use strict';

    angular.module('redDatepickerModule', [])
        .constant('moment', moment)
        .constant('_', window._)
        .directive('redDatepicker', redDatepicker);

    function redDatepicker() {
        return {
            restrict: 'E',
            templateUrl: 'angular-red-datepicker.html',
            scope: {
                /** @param {string} locale - Set locale from directive attr.*/
                locale: '@locale',
                /** @param {object} output - variable that return date values.*/
                output: '=output',
                /** @param {object} todayBtn - show or not today btns.*/
                todayBtn: '@todayBtn',
                /** @param {number} startSelection - quantity of days from today.*/
                numberOfDays: '@numberOfDays',
                /** @param {boolean} listShow - show date range or not.*/
                listShow: '@listShow',
                /** @param {array} listArr - set list of dates for quick change with list button.*/
                listArr: '@listArr'
            },
            controller: datepickerController,
            controllerAs: 'calendar',
            bindToController: true
        };
    }

    datepickerController.$inject = ['moment', '_'];
    function datepickerController(moment, _) {
        var vm = this;

        (function () {
            console.log(vm.locale);
            console.log(vm.todayBtn);
            console.log(vm.numberOfDays);
            console.log(vm.listShow);
            console.log(vm.listArr);

            /** @description Variables show/hide elements*/
            vm.rangeShow = false;
            vm.calendarShow = false;

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
            vm.selectedDays = [];
            vm.endSelection = date.startOf('day').toArray();
            vm.startSelection = moment(vm.endSelection).subtract(vm.numberOfDays, 'day').startOf('day').toArray();
            /** @description Variables for input date*/
            vm.inputStart = moment(vm.startSelection).format('L');
            vm.inputEnd = moment(vm.endSelection).format('L');

            vm.output = {start: vm.inputStart, end: vm.inputEnd};


            if (vm.listShow) {
                if (Array.isArray(vm.listArr)) {
                    _.forEach(vm.listArr, function (o) {
                        if (o.days < 30) {
                            o.start = moment(vm.today.date).subtract(o.days - 1, 'days');
                            o.end = vm.today.date;
                        } else {
                            o.start = moment(vm.today.date).subtract(o.days, 'days').startOf('month');
                            o.end = moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day');
                        }
                    });
                    vm.list = vm.listArr;
                } else {
                    vm.list = [
                        {
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
                        }
                    ];
                }
            } else {
                vm.list = '';
            }
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
                    _.forEach(vm.selectedDays, function (o) {
                        o.active = false;
                    });
                    _.remove(vm.selectedDays);
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

                if (vm.month.id == 1) {
                    vm.year = thisMoment.subtract(1, 'year').format('YYYY');
                }
                vm.month.name = thisMoment.subtract(1, 'month').format('MMMM');
                vm.month.id = moment().month(vm.month.name).format('M');
                vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            } else if (direction === 'right') {
                if (vm.month.id == 12) {
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
            return _.reverse(vm.getNextMonth(nextMonth, endDay)
                .concat(vm.getCurrentMonth(currentMonth), vm.getPreviousMonth(previousMonth, startDay)));
        }

        function getPreviousMonth(previousMonth, startDay) {
            var previousMonthArray = [], start = '';
            if (vm.weekStartDay === 0) {
                start = (Number(startDay) ? (startDay === 1 ? 8 : startDay) : 7);
            } else {
                start = (Number(startDay) ? (startDay === 1 ? 7 : startDay - 1) : 6);
            }
            _.times(start, function () {
                var a = {
                    str: +previousMonth.format('D'),
                    current: previousMonth.isSame(vm.today.date),
                    date: previousMonth.toArray(),
                    fade: true,
                    active: false,
                    beforeMonth: true,
                    selected: previousMonth.isBetween(vm.startSelection, vm.endSelection, null, '[]'),
                    dayStart: previousMonth.isSame(moment(vm.startSelection)),
                    dayEnd: previousMonth.isSame(moment(vm.endSelection))
                };
                previousMonthArray.push(a);
                previousMonth.subtract(1, 'day');
            });
            return previousMonthArray;
        }

        function getCurrentMonth(currentMonth) {
            var currentMonthArray = [];
            _.times(currentMonth.daysInMonth(), function () {
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
            });
            _.reverse(currentMonthArray);
            return currentMonthArray;
        }

        function getNextMonth(nextMonth, endDay) {
            var nextMonthArray = [], end = '';
            if (vm.weekStartDay === 0) {
                end = (Number(endDay) ? (endDay === 6 ? 7 : 6 - endDay ) : 6);
            } else {
                end = (Number(endDay) ? (endDay === 6 ? 1 : 7 - endDay ) : 7);
            }
            _.times(end, function () {
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
            });
            return _.reverse(nextMonthArray);
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
            return el.format('L')
        }


        vm.days = vm.getDaysNames(vm.weekStartDay, vm.localeInfo._weekdaysMin);
        vm.monthShow = new vm.calendarArray(vm.today.date);
    }

})();
