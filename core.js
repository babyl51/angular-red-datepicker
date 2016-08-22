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
                days: '=days',
                locale: '@locale'
            },
            link: linkFunc,
            controller: calendarController,
            controllerAs: 'calendar',
            bindToController: true
        };
        function linkFunc(scope, el, attr, ctrl) {
            // angular.element(el).find('li').on('click', function (e) {
            //     console.log(angular.element(e.target).html());
            // });
        }
    }

    calendarController.$inject = ['$scope', 'dateOutput'];
    function calendarController($scope, dateOutput) {
        var vm = this;
        var date = moment(new Date());

        var localeDefault = 'en';
        vm.locale = vm.locale ? (vm.locale != '' ? vm.locale : localeDefault) : localeDefault;
        moment.locale(vm.locale);

        var localeInfo = moment.localeData();
        var weekStart = localeInfo._week.dow;
        var localeDays = localeInfo._weekdaysMin;
        if (weekStart == 1) {
            var removed = localeDays.splice(0, 1);
            localeDays.push(removed[0]);
        }
        vm.days = localeDays;

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

        vm.inputStart = vm.startSelection[2] + '.' + (vm.startSelection[1] + 1) + '.' + vm.startSelection[0];
        vm.inputEnd = vm.endSelection[2] + '.' + (vm.endSelection[1] + 1) + '.' + vm.endSelection[0];
        dateOutput.setData(vm.inputStart, vm.inputEnd);

        vm.list = [
            {
                label: 'Last Week',
                start: moment(vm.today.date).subtract(6, 'days').toArray(),
                end: vm.today.date.toArray()
            },
            {
                label: 'Last 15 days',
                start: moment(vm.today.date).subtract(14, 'days').toArray(),
                end: vm.today.date.toArray()
            },
            {
                label: 'Last 30 days',
                start: moment(vm.today.date).subtract(29, 'days').toArray(),
                end: vm.today.date.toArray()
            },
            {
                label: 'Last month',
                start: moment(vm.today.date).subtract(1, 'month').startOf('month').toArray(),
                end: moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day').toArray()
            }, {
                label: 'Last 3 months',
                start: moment(vm.today.date).subtract(3, 'month').startOf('month').toArray(),
                end: moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day').toArray()
            }, {
                label: 'Last 6 months',
                start: moment(vm.today.date).subtract(6, 'month').startOf('month').toArray(),
                end: moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day').toArray()
            }, {
                label: 'Last year',
                start: moment(vm.today.date).subtract(12, 'month').startOf('month').toArray(),
                end: moment(vm.today.date).subtract(1, 'month').endOf('month').startOf('day').toArray()
            }, {
                label: 'All time',
                start: vm.earliest_date.toArray(),
                end: vm.latest_date.toArray()
            }
        ];

        // TODO change locales
        // vm.allMoment = moment.localeData();
        // vm.weekDaysName = vm.allMoment._weekdaysMin;
        // vm.weekStart = vm.allMoment._week.dow;
        //
        // if (vm.allMoment._week.dow == 1) {
        //     var removed = vm.weekDaysName.splice(0, 1);
        //     vm.weekDaysName.push(removed[0]);
        // }


        vm.getDay = getDay;
        vm.daySelect = daySelect;
        vm.activeRange = activeRange;
        vm.monthChange = monthChange;
        vm.yearChange = yearChange;
        vm.calendarArray = calendarArray;
        vm.listSelected = listSelected;
        vm.showPopup = showPopup;

        vm.print = function () {
            console.log(vm.inputStart);
            console.log(vm.inputEnd);
        };
        /**
         * Getting day by click on it on calendar
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
            vm.inputStart = vm.startSelection[2] + '.' + (vm.startSelection[1] + 1) + '.' + vm.startSelection[0];
            vm.inputEnd = vm.endSelection[2] + '.' + (vm.endSelection[1] + 1) + '.' + vm.endSelection[0];
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
            var start = (Number(vm.startDay) ? (vm.startDay == 1 ? 7 : vm.startDay - 1) : 6);
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
            var end = (Number(vm.endDay) ? (vm.endDay == 6 ? 1 : 7 - vm.endDay ) : 7);
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
            vm.startSelection = item.start;
            vm.endSelection = item.end;
            vm.inputStart = vm.startSelection[2] + '.' + (vm.startSelection[1] + 1) + '.' + vm.startSelection[0];
            vm.inputEnd = vm.endSelection[2] + '.' + (vm.endSelection[1] + 1) + '.' + vm.endSelection[0];
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

        vm.monthShow = new vm.calendarArray(vm.today.date);
    }

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
