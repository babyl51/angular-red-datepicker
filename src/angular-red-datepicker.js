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
                /** @param {string} earliestDate - Set Earliest Date For Calendar.*/
                earliestDate: '@earliestDate',
                /** @param {string} latestDate - Set Latest Date For Calendar.*/
                latestDate: '@latestDate',
                /** @param {boolean} listShow - show date range or not.*/
                listShow: '@listShow',
                /** @param {oject} output - show date range or not.*/
                output: '=output'
            },
            controller: datepickerController,
            controllerAs: 'calendar',
            bindToController: true
        };
    }

    datepickerController.$inject = ['$scope', 'moment', '_'];
    function datepickerController($scope, moment, _) {
        var vm = this;
        /** @description Variables show/hide elements*/
        vm.rangeShow = false;
        vm.calendarShow = false;

        /** @description Set locale from scope or by default */
        vm.locale = vm.locale ? (vm.locale != '' ? vm.locale : 'en') : 'en';
        moment.locale(vm.locale);
        vm.localeInfo = moment.localeData();
        vm.weekStartDay = vm.localeInfo._week.dow;

        /** @description Get earliest and latest date from scope */
        vm.earliestDate = vm.earliestDate ? ( vm.earliestDate !== '' ? vm.earliestDate : 'January 01, 1990' ) : 'January 01, 1990';
        vm.latestDate = vm.latestDate ? ( vm.latestDate !== '' ? vm.latestDate : 'December 31, 2030' ) : 'December 31, 2030';
        vm.earliest_date = moment(new Date(vm.earliestDate)).startOf('day');
        vm.latest_date = moment(new Date(vm.latestDate)).startOf('day');

        /** @description Date variables*/
        var date = moment(new Date());
        vm.todayForFront = date.format('DD');
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
        vm.startSelection = moment(vm.endSelection).subtract(6, 'day').startOf('day').toArray();

        //TODO
        /** @description Variables for input date*/
        vm.inputStart = moment(vm.startSelection).format('L');
        vm.inputEnd = moment(vm.endSelection).format('L');

        // $scope.$watch('calendar.inputStart', function (current, original) {
        //     vm.checkInputs(current);
        // });
        // $scope.$watch('calendar.inputEnd', function (current, original) {
        //     vm.checkInputs(current);
        // });

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
                    start: vm.earliest_date.format('L'),
                    end: vm.latest_date.format('L')
                }
            ];
        } else {
            vm.list = '';
        }


        vm.getDay = getDay;
        vm.daySelect = daySelect;
        vm.activeRange = activeRange;
        vm.monthChange = monthChange;
        vm.yearChange = yearChange;
        vm.calendarArray = calendarArray;
        vm.listSelected = listSelected;
        vm.showPopup = showPopup;
        vm.getDaysNames = getDaysNames;
        // vm.checkInputs = checkInputs;
        // vm.validateDate = validateDate;


        /**
         * @description Checking from what day week start
         */
        function getDaysNames(weekStartDay, localeDays) {
            if (weekStartDay == 1) {
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
                day.active = day.active ? false : true;
                if (vm.selectedDays.length == 2) {
                    _.forEach(vm.selectedDays, function (value) {
                        value.active = false;
                    });
                    _.remove(vm.selectedDays);
                    vm.selectedDays.push(day);
                } else if (vm.selectedDays.length == 1) {
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
            var this_moment = moment([vm.year, id - 1, 1]);
            if (direction == 'left') {
                if (vm.month.id == 1) {
                    vm.year = this_moment.subtract(1, 'year').format('YYYY');
                }
                vm.month.name = this_moment.subtract(1, 'month').format('MMMM');
                vm.month.id = moment().month(vm.month.name).format('M');
                vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            } else if (direction == 'right') {
                if (vm.month.id == 12) {
                    vm.year = this_moment.add(1, 'year').format('YYYY');
                }
                vm.month.name = this_moment.add(1, 'month').format('MMMM');
                vm.month.id = moment().month(vm.month.name).format('M');
                vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            }
        }

        function yearChange(direction) {
            var this_moment = moment([vm.year, vm.month.id - 1, 1]);
            if (direction == 'left') {
                vm.year = this_moment.subtract(1, 'year').format('YYYY');
                vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            } else if (direction == 'right') {
                vm.year = this_moment.add(1, 'year').format('YYYY');
                vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            }
        }

        function calendarArray(current) {
            vm.beforeMonthShow = [];
            vm.currentMonthShow = [];
            vm.nextMonthShow = [];
            vm.currentMonth = moment(current).startOf('month');
            vm.beforeMonth = moment(current).subtract(1, 'month').endOf('month').startOf('day');
            vm.nextMonth = moment(current).add(1, 'month').startOf('month');
            vm.startDay = moment(current).startOf('month').format('d');
            vm.endDay = moment(current).endOf('month').format('d');


            //Before month
            var start = '';
            if (vm.weekStartDay == 0) {
                start = (Number(vm.startDay) ? (vm.startDay == 1 ? 8 : vm.startDay) : 7);
            } else {
                start = (Number(vm.startDay) ? (vm.startDay == 1 ? 7 : vm.startDay - 1) : 6);
            }
            _.times(start, function (n) {
                var month = vm.beforeMonth;
                var a = {
                    str: +month.format('D'),
                    current: month.isSame(vm.today.date),
                    date: month.toArray(),
                    fade: true,
                    active: false,
                    beforeMonth: true,
                    selected: month.isBetween(vm.startSelection, vm.endSelection, null, '[]')
                };
                vm.beforeMonthShow.push(a);
                month.subtract(1, 'day');
            });

            //Current Month
            _.times(vm.currentMonth.daysInMonth(), function (n) {
                var month = vm.currentMonth;
                var a = {
                    str: +month.format('D'),
                    current: month.isSame(vm.today.date),
                    date: month.toArray(),
                    fade: false,
                    afterCurrent: month.isAfter(vm.today.date),
                    active: false,
                    selected: month.isBetween(vm.startSelection, vm.endSelection, null, '[]')
                };
                vm.currentMonthShow.push(a);
                month.add(1, 'day');
            });
            _.reverse(vm.beforeMonthShow);


            //End Month
            var end = '';
            if (vm.weekStartDay == 0) {
                end = (Number(vm.endDay) ? (vm.endDay == 6 ? 7 : 6 - vm.endDay ) : 6);
            } else {
                end = (Number(vm.endDay) ? (vm.endDay == 6 ? 1 : 7 - vm.endDay ) : 7);
            }
            _.times(end, function (n) {
                var month = vm.nextMonth;
                var a = {
                    str: +month.format('D'),
                    current: month.isSame(vm.today.date),
                    fade: true,
                    date: month.toArray(),
                    afterCurrentNextMonth: month.isAfter(vm.today.date),
                    active: false,
                    nextMonth: true,
                    selected: month.isBetween(vm.startSelection, vm.endSelection, null, '[]')
                };
                vm.nextMonthShow.push(a);
                month.add(1, 'day');
            });

            return vm.beforeMonthShow.concat(vm.currentMonthShow, vm.nextMonthShow);
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
            if (el == 'calendarShow') {
                vm.calendarShow = !vm.calendarShow;
                vm.rangeShow = false;
            } else if (el == 'rangeShow') {
                vm.rangeShow = !vm.rangeShow;
                vm.calendarShow = false;
            }
        }

        // function checkInputs(date) {
        //     // console.log(date);
        //     var regexp = /([0-9]{2}\/[0-9]{2}\/[0-9]{4})|([0-9]{2}-[0-9]{2}-[0-9]{4})|([0-9]{2}.[0-9]{2}.[0-9]{4})|([0-9]{4}\/[0-9]{2}\/[0-9]{2})|([0-9]{4}-[0-9]{2}-[0-9]{2})|([0-9]{4}.[0-9]{2}.[0-9]{2})/g;
        //     if (date.match(regexp)) {
        //         vm.validateDate(date);
        //     } else if (date.length == 10) {
        //         console.log('wrong format');
        //     }
        // }

        // //TODO update checking  and validate data
        // function validateDate(date) {
        //     var a = moment(new Date(date));
        //     if (a.isValid()) {
        //         console.log(a + ' date is valid');
        //     } else {
        //         console.log(a + ' date is invalid');
        //     }
        // }

        vm.days = vm.getDaysNames(vm.weekStartDay, vm.localeInfo._weekdaysMin);
        vm.monthShow = new vm.calendarArray(vm.today.date);
    }

})();
