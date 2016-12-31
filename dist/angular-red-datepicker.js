/*!
 * angular-red-datepicker
 * https://github.com/johnnyswan/angular-red-datepicker
 * Red Swan
 * Version: 0.0.1 - 2016-12-31T13:27:41.394Z
 * License: MIT
 */


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
                /** @param {boolean} listShow - show date range or not.*/
                listShow: '@listShow',
                /** @param {object} output - variable that return date values.*/
                output: '=output',
                /** @param {object} todayBtn - show or not today btns.*/
                todayBtn: '@todayBtn',
                /** @param {number} startSelection - quantity of days from today.*/
                numberOfDays: '@numberOfDays'
            },
            controller: datepickerController,
            controllerAs: 'calendar',
            bindToController: true
        };
    }

    datepickerController.$inject = ['moment', '_'];
    function datepickerController(moment, _) {
        var vm = this;

        vm.init = init;

        function init() {
            /** @description Variables show/hide elements*/
            vm.rangeShow = false;
            // TODO change to false before commit
            vm.calendarShow = true;

            vm.numberOfDays = +vm.numberOfDays ? +vm.numberOfDays : (+vm.numberOfDays == 0 ? 0 : 7);

            /** @description Set locale from scope or by default */
            vm.locale = vm.locale ? (vm.locale !== '' ? vm.locale : 'en') : 'en';
            moment.locale(vm.locale);
            vm.localeInfo = moment.localeData();
            vm.weekStartDay = vm.localeInfo._week.dow;
            
            vm.earliestDate = moment(new Date('January 01, 1990')).startOf('day');
            vm.latestDate = moment(new Date('December 31, 2030')).startOf('day');

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
                vm.list = [
                    {
                        label: 'Last Week',
                        start: moment(vm.today.date).subtract(6, 'days').format('L'),
                        end: vm.today.date.format('L')
                    }, {
                        label: 'Last 15 days',
                        start: moment(vm.today.date).subtract(14, 'days').format('L'),
                        end: vm.today.date.format('L')
                    }, {
                        label: 'Last 30 days',
                        start: moment(vm.today.date).subtract(29, 'days').format('L'),
                        end: vm.today.date.format('L')
                    }, {
                        label: 'Last month',
                        start: moment(vm.today.date).subtract(1, 'month').startOf('month').format('L'),
                        end: moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day').format('L')
                    }, {
                        label: 'Last 3 months',
                        start: moment(vm.today.date).subtract(3, 'month').startOf('month').format('L'),
                        end: moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day').format('L')
                    }, {
                        label: 'Last 6 months',
                        start: moment(vm.today.date).subtract(6, 'month').startOf('month').format('L'),
                        end: moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day').format('L')
                    }, {
                        label: 'Last year',
                        start: moment(vm.today.date).subtract(12, 'month').startOf('month').format('L'),
                        end: moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day').format('L')
                    }, {
                        label: 'All time',
                        start: vm.earliestDate.format('L'),
                        end: vm.latestDate.format('L')
                    }
                ];
            } else {
                vm.list = '';
            }
        }


        vm.init();

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
                    _.forEach(vm.selectedDays, function (value) {
                        value.active = false;
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
                if (vm.month.id === 1) {
                    vm.year = thisMoment.subtract(1, 'year').format('YYYY');
                }
                vm.month.name = thisMoment.subtract(1, 'month').format('MMMM');
                vm.month.id = moment().month(vm.month.name).format('M');
                vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            } else if (direction === 'right') {
                if (vm.month.id === 12) {
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
            return _.reverse(vm.getNextMonth(nextMonth, endDay).concat(vm.getCurrentMonth(currentMonth), vm.getPreviousMonth(previousMonth, startDay)));
        }

        function getPreviousMonth(previousMonth, startDay) {
            var previousMonthArray = [], start = '';
            if (vm.weekStartDay === 0) {
                start = (Number(startDay) ? (startDay === 1 ? 8 : startDay) : 7);
            } else {
                start = (Number(startDay) ? (startDay === 1 ? 7 : startDay - 1) : 6);
            }
            _.times(start, function (n) {
                var a = {
                    str: +previousMonth.format('D'),
                    current: previousMonth.isSame(vm.today.date),
                    date: previousMonth.toArray(),
                    fade: true,
                    active: false,
                    beforeMonth: true,
                    selected: previousMonth.isBetween(vm.startSelection, vm.endSelection, null, '[]')
                };
                previousMonthArray.push(a);
                previousMonth.subtract(1, 'day');
            });
            return previousMonthArray;
        }

        function getCurrentMonth(currentMonth) {
            var currentMonthArray = [];
            _.times(currentMonth.daysInMonth(), function (n) {
                var a = {
                    str: +currentMonth.format('D'),
                    current: currentMonth.isSame(vm.today.date),
                    date: currentMonth.toArray(),
                    fade: false,
                    afterCurrent: currentMonth.isAfter(vm.today.date),
                    active: false,
                    selected: currentMonth.isBetween(vm.startSelection, vm.endSelection, null, '[]')
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
            _.times(end, function (n) {
                var a = {
                    str: +nextMonth.format('D'),
                    current: nextMonth.isSame(vm.today.date),
                    fade: true,
                    date: nextMonth.toArray(),
                    afterCurrentNextMonth: nextMonth.isAfter(vm.today.date),
                    active: false,
                    nextMonth: true,
                    selected: nextMonth.isBetween(vm.startSelection, vm.endSelection, null, '[]')
                };
                nextMonthArray.push(a);
                nextMonth.add(1, 'day');
            });
            return nextMonthArray;
        }


        function listSelected(item) {
            vm.startSelection = moment(new Date(item.start));
            vm.endSelection = moment(new Date(item.end));
            vm.inputStart = item.start;
            vm.inputEnd = item.end;
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


        vm.days = vm.getDaysNames(vm.weekStartDay, vm.localeInfo._weekdaysMin);
        vm.monthShow = new vm.calendarArray(vm.today.date);
    }

})();

angular.module("redDatepickerModule").run(["$templateCache", function($templateCache) {$templateCache.put("angular-red-datepicker.html","<div class=\"calendar\"><div class=\"output\"><div class=\"output__field\"><div class=\"output__field_start\">{{calendar.inputStart}}</div><div class=\"output__field_separator\">&mdash;</div><div class=\"output__field_end\">{{calendar.inputEnd}}</div></div><div class=\"output__btns\"><div id=\"calendar-list-btn\" ng-click=\"calendar.showPopup(\'calendarShow\')\"><svg height=\"24\" viewbox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M0 0h24v24H0z\" fill=\"none\"></path><path d=\"M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z\"></path></svg></div><div ng-if=\"calendar.todayBtn\" id=\"calendar-today-btn\" ng-click=\"calendar.activeRange([calendar.todayForFront, calendar.todayForFront])\"><svg height=\"24\" viewbox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M0 0h24v24H0z\" fill=\"none\"></path><path d=\"M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z\"></path></svg></div><div ng-if=\"calendar.listShow\" id=\"range-list-btn\" ng-click=\"calendar.showPopup(\'rangeShow\')\"><svg height=\"24\" viewbox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z\"></path><path d=\"M0 0h24v24H0z\" fill=\"none\"></path></svg></div></div></div><div ng-mouseleave=\"calendar.calendarShow = false\" class=\"calendar-box calendar-box-show\" ng-show=\"calendar.calendarShow\"><div class=\"switchers\"><div class=\"month\"><i class=\"left\" aria-hidden=\"true\" ng-click=\"calendar.monthChange(calendar.month.id, \'left\')\"></i> <span>{{calendar.month.name}}</span> <i class=\"right\" aria-hidden=\"true\" ng-click=\"calendar.monthChange(calendar.month.id, \'right\')\" ng-hide=\"calendar.today.month == calendar.month.id\"></i></div><div class=\"year\"><i class=\"left\" aria-hidden=\"true\" ng-click=\"calendar.yearChange(\'left\')\"></i> <span>{{calendar.year}}</span> <i class=\"right\" aria-hidden=\"true\" ng-click=\"calendar.yearChange(\'right\')\" ng-hide=\"calendar.today.year == calendar.year\"></i></div></div><div class=\"calendar-container\"><ul class=\"days-name\"><li ng-repeat=\"dayName in calendar.days track by $index\">{{dayName}}</li></ul><ul class=\"calendar-body\"><li class=\"day\" ng-repeat=\"day in calendar.monthShow\" ng-class=\"{ \'day_fade\': day.fade, \'day_current\': day.current, \'day_cantUse\': day.afterCurrent, \'day_fadeNonClick\': day.afterCurrentNextMonth, \'day_active\': day.active, \'day_selected\': day.selected }\" ng-click=\"calendar.getDay(day)\">{{day.str}}</li></ul></div></div><div ng-mouseleave=\"calendar.rangeShow = false\" class=\"range-list range-list-show\" ng-show=\"calendar.rangeShow\"><ul><li ng-repeat=\"item in calendar.list\" ng-click=\"calendar.listSelected(item)\"><span class=\"item-name\">{{item.label}}</span> <span class=\"item-date-start\">{{item.start}}</span> <span class=\"item-date-separator\">&mdash;</span> <span class=\"item-date-end\">{{item.end}}</span></li></ul></div></div>");}]);