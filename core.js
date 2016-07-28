(function () {
    'use strict';

    angular.module('calendarApp', [])
        .constant('moment', moment)
        .constant('_', window._)
        .directive('calendar', calendar)
        .directive('dateMask', dateMask);

    function calendar() {
        return {
            restrict: 'E',
            templateUrl: 'calendar.html',
            scope: {},
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

    calendarController.$inject = ['$scope'];

    function calendarController($scope) {
        var vm = this;
        moment.locale('ru');
        var date = moment(new Date());
        
        vm.regex = '/(19|20)\d\d-((0[1-9]|1[012])-(0[1-9]|[12]\d)|(0[13-9]|1[012])-30|(0[13578]|1[02])-31)/g';
        
        vm.days = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

        vm.selectedDays = [];
        vm.startSelection = '';
        vm.endSelection = '';

        vm.earliest_date = moment(new Date('January 1, 2010')).startOf('day');
        vm.latest_date = moment(new Date('December 31, 2026 ')).startOf('day');
        vm.today = {
            date: date.startOf('day'),
            year: date.format('YYYY'),
            month: date.format('M')
        };
        vm.month = {
            name: moment().format('MMMM'),
            id: moment().format('M')
        };
        vm.year = moment().year();

        // TODO change locales
        // vm.allMoment = moment.localeData();
        // vm.weekDaysName = vm.allMoment._weekdaysMin;
        // vm.weekStart = vm.allMoment._week.dow;
        //
        // if (vm.allMoment._week.dow == 1) {
        //     var removed = vm.weekDaysName.splice(0, 1);
        //     vm.weekDaysName.push(removed[0]);
        // }


        vm.getDay = function (day) {
            if (day.fade && !day.afterCurrentNextMonth) {
                if (day.beforeMonth) {
                    vm.monthChange(vm.month.id, 'left');
                } else if (day.nextMonth) {
                    vm.monthChange(vm.month.id, 'right');
                }
            }

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
        };

        vm.activeRange = function (value) {
            if (moment(value[0].date).isBefore(value[1].date)) {
                vm.startSelection = moment(value[0].date).toISOString();
                vm.endSelection = moment(value[1].date).toISOString();
            } else {
                vm.startSelection = moment(value[1].date).toISOString();
                vm.endSelection = moment(value[0].date).toISOString();
            }
            vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
        };


        vm.monthChange = function (id, direction) {
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
        };
        vm.yearChange = function (direction) {
            var this_moment = moment([vm.year, vm.month.id - 1, 1]);
            if (direction == 'left') {
                vm.year = this_moment.subtract(1, 'year').format('YYYY');
                vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            } else if (direction == 'right') {
                vm.year = this_moment.add(1, 'year').format('YYYY');
                vm.monthShow = new vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            }
        };
        vm.calendarArray = function (current) {
            vm.beforeMonthShow = [];
            vm.currentMonthShow = [];
            vm.nextMonthShow = [];
            vm.currentMonth = moment(current).startOf('month');
            vm.beforeMonth = moment(current).subtract(1, 'month').endOf('month');
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

        };
        vm.monthShow = new vm.calendarArray(vm.today.date);

        vm.list = [{
            label: 'Last 30 days',
            start: moment(vm.today.date).subtract(29, 'days').toISOString(),
            end: vm.today.date.toISOString()
        }, {
            label: 'Last month',
            start: moment(vm.today.date).subtract(1, 'month').startOf('month').toISOString(),
            end: moment(vm.today.date).subtract(1, 'month').endOf('month').toISOString()
        }, {
            label: 'Last 3 months',
            start: moment(vm.today.date).subtract(3, 'month').startOf('month').toISOString(),
            end: moment(vm.today.date).subtract(1, 'month').endOf('month').toISOString()
        }, {
            label: 'Last 6 months',
            start: moment(vm.today.date).subtract(6, 'month').startOf('month').toISOString(),
            end: moment(vm.today.date).subtract(1, 'month').endOf('month').toISOString()
        }, {
            label: 'Last year',
            start: moment(vm.today.date).subtract(12, 'month').startOf('month').toISOString(),
            end: moment(vm.today.date).subtract(1, 'month').endOf('month').toISOString()
        }, {
            label: 'All time',
            start: vm.earliest_date,
            end: vm.latest_date
        }];

        vm.listSelected = function (item) {
            vm.startSelection = item.start;
            vm.endSelection = item.end;
        }
    }

    function dateMask() {
        return {

            restrict: 'E',
            scope: {},
            link: linkFunc
        };

        function linkFunc($scope, element, attrs, controller) {
           
        }
    }

})();
