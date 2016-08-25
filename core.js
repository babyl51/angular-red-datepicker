/**
 * @author Johhny Swan <ferdinandgrau@gmail.com>
 */
(function () {
    'use strict';

    angular.module('calendarApp', [])
        .constant('moment', moment)
        .constant('_', window._)
        .directive('calendar', calendar)
        .service('dateOutput', dateOutput);
    // .directive('clickOutsideCalendar', clickOutsideCalendar)
    // .directive('clickOutsideRange', clickOutsideRange);

    function calendar() {
        return {
            restrict: 'E',
            templateUrl: 'datepicker.html',
            scope: {
                /**
                 * @param {string} locale
                 * @description Get locale from directive attr
                 */
                locale: '@locale'
            },
            controller: calendarController,
            controllerAs: 'calendar',
            bindToController: true
        };
    }

    calendarController.$inject = ['dateOutput', '$scope'];
    function calendarController(dateOutput, $scope) {
        var vm = this;
        var date = moment(new Date());

        var localeDefault = 'en';
        vm.locale = vm.locale ? (vm.locale != '' ? vm.locale : localeDefault) : localeDefault;

        /**
         * @description Set locale from locale attr, or 'en' by default
         */
        moment.locale(vm.locale);
        vm.localeInfo = moment.localeData();
        vm.weekStart = vm.localeInfo._week.dow;
        /**
         * @description Get days namespaces
         */



        vm.earliest_date = moment(new Date('January 1, 2010')).startOf('day');
        vm.latest_date = moment(new Date('December 31, 2026 ')).startOf('day');


        vm.today = {
            date: date.startOf('day'),
            year: date.format('YYYY'),
            month: date.format('M')
        };
        vm.todayForFront = vm.today.date.format('DD');
        vm.month = {
            name: moment().format('MMMM'),
            id: moment().format('M')
        };
        vm.year = moment().year();
        vm.selectedDays = [];
        vm.startSelection = moment(vm.endSelection).subtract(6, 'day').startOf('day').toArray();
        vm.endSelection = moment(new Date()).startOf('day').toArray();
        vm.rangeShow = false;
        vm.calendarShow = false;

        vm.inputStart = moment(vm.startSelection).format('L');
        vm.inputEnd = moment(vm.endSelection).format('L');

        $scope.$watch('calendar.inputStart', function (current, original) {
            vm.checkInputs(current);
        });
        $scope.$watch('calendar.inputEnd', function (current, original) {
            vm.checkInputs(current);
        });


        dateOutput.setData(vm.inputStart, vm.inputEnd);

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

        vm.getDay = getDay;
        vm.daySelect = daySelect;
        vm.activeRange = activeRange;
        vm.monthChange = monthChange;
        vm.yearChange = yearChange;
        vm.calendarArray = calendarArray;
        vm.listSelected = listSelected;
        vm.showPopup = showPopup;
        vm.getDaysNames = getDaysNames;
        vm.checkInputs = checkInputs;
        vm.validateDate = validateDate;

        vm.print = function () {
            console.log(vm.inputStart);
            console.log(vm.inputEnd);
        };

        function getDaysNames() {
            var weekStart = vm.weekStart;
            var localeDays = vm.localeInfo._weekdaysMin;
            /**
             * @description Checking from what day week start
             */
            if (weekStart == 1) {
                var removed = localeDays.splice(0, 1);
                localeDays.push(removed[0]);
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
            dateOutput.setData(vm.inputStart, vm.inputEnd);
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
            if (vm.weekStart == 0) {
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
                    //TODO may need after locales change
                    // nameOfDay: month.format('dd'),
                    // idOfDay: month.format('d'),
                    active: false,
                    beforeMonth: true,
                    start: month.isSame(vm.startSelection),
                    end: month.isSame(vm.endSelection),
                    isBetween: month.isBetween(vm.startSelection, vm.endSelection)
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
                    start: month.isSame(vm.startSelection),
                    end: month.isSame(vm.endSelection),
                    isBetween: month.isBetween(vm.startSelection, vm.endSelection)
                };
                vm.currentMonthShow.push(a);
                month.add(1, 'day');
            });
            _.reverse(vm.beforeMonthShow);


            //End Month
            var end = '';
            if (vm.weekStart == 0) {
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
                    start: month.isSame(vm.startSelection),
                    end: month.isSame(vm.endSelection),
                    isBetween: month.isBetween(vm.startSelection, vm.endSelection)
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
            dateOutput.setData(vm.inputStart, vm.inputEnd);
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

        function checkInputs(date) {
            var regexp = /([0-9]{2}\/[0-9]{2}\/[0-9]{4})|([0-9]{2}-[0-9]{2}-[0-9]{4})|([0-9]{2}.[0-9]{2}.[0-9]{4})|([0-9]{4}\/[0-9]{2}\/[0-9]{2})|([0-9]{4}-[0-9]{2}-[0-9]{2})|([0-9]{4}.[0-9]{2}.[0-9]{2})/g;
            if (date.match(regexp)) {
                vm.validateDate(date);
            } else if (date.length == 10) {
                console.log('wrong format');
            }
        }

        //TODO update checking  and validate data
        function validateDate(date) {
            var a = moment(new Date(date));
            if (a.isValid()) {
                console.log('date is valid');
            } else {
                console.log('date is invalid');
            }
        }

        vm.days = vm.getDaysNames();
        vm.monthShow = new vm.calendarArray(vm.today.date);
    }

    //TODO update this directives
    // clickOutsideCalendar.$inject = ['$document'];
    // function clickOutsideCalendar($document) {
    //     return {
    //         restrict: 'A',
    //         link: clickFunction,
    //         controller: calendarController,
    //         scope: {
    //             target: '='
    //         }
    //     };
    //     function clickFunction(scope, el, attr, ctrl) {
    //         el.bind('click', function (event) {
    //             event.stopPropagation();
    //         });
    //         var calendar = document.getElementById('calendar-list-btn');
    //         var calendarIcon = document.getElementById('calendar-list-icon');
    //         $document.bind('click', function (e) {
    //             if (e.target == calendar || e.target == calendarIcon) {
    //                 e.stopPropagation();
    //             } else {
    //                 scope.target = false;
    //             }
    //             scope.$apply();
    //         });
    //     }
    // }
    //
    // clickOutsideRange.$inject = ['$document'];
    // function clickOutsideRange($document) {
    //     return {
    //         restrict: 'A',
    //         link: clickFunction,
    //         controller: calendarController,
    //         scope: {
    //             target: '='
    //         }
    //     };
    //     function clickFunction(scope, el, attr, ctrl) {
    //         el.bind('click', function (event) {
    //             event.stopPropagation();
    //         });
    //         var range = document.getElementById('range-list-btn');
    //         $document.bind('click', function (e) {
    //             if (e.target == range) {
    //                 e.stopPropagation();
    //             } else {
    //                 scope.target = false;
    //             }
    //             scope.$apply();
    //         });
    //     }
    // }


    function dateOutput() {
        var a = {};
        return {
            setData: function (start, end) {
                a = {
                    start: start,
                    end: end
                };
                return a;
            },
            getData: function () {
                return a;
            }
        };
    }

})();
