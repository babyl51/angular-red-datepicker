(function () {
    'use strict';

    angular.module('calendarApp', [])
        .constant('moment', moment)
        .constant('_', window._)
        .directive('calendar', calendar);

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
            angular.element(el).find('ul').on('click', function (e) {
                console.log(angular.element(e.target).html());
            });
        }
    }

    calendarController.$inject = ['$scope'];

    function calendarController($scope) {
        var vm = this;
        moment.locale('ru');
        var date = moment(new Date());
        vm.days = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

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


        vm.monthChange = function (id, direction) {
            var this_moment = moment([vm.year, id - 1, 1]);
            if (direction == 'left') {
                if (vm.month.id == 1) {
                    vm.year = this_moment.subtract(1, 'year').format('YYYY');
                }
                vm.month.name = this_moment.subtract(1, 'month').format('MMMM');
                vm.month.id = moment().month(vm.month.name).format('M');

                vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            } else if (direction == 'right') {
                if (vm.month.id == 12) {
                    vm.year = this_moment.add(1, 'year').format('YYYY');
                }
                vm.month.name = this_moment.add(1, 'month').format('MMMM');
                vm.month.id = moment().month(vm.month.name).format('M');
                vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            }
        };

        vm.yearChange = function (direction) {
            var this_moment = moment([vm.year, vm.month.id - 1, 1]);
            if (direction == 'left') {
                vm.year = this_moment.subtract(1, 'year').format('YYYY');
                vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
            } else if (direction == 'right') {
                vm.year = this_moment.add(1, 'year').format('YYYY');
                vm.calendarArray(moment([vm.year, vm.month.id - 1, 1]));
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
                    date: month.toString(),
                    fade: true,
                    nameOfDay: month.format('dd'),
                    idOfDay: month.format('d')
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
                    date: month.toString(),
                    fade: false,
                    nameOfDay: month.format('dd'),
                    idOfDay: month.format('d'),
                    afterCurrent: month.isAfter(vm.today.date)
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
                    date: month.toString(),
                    nameOfDay: month.format('dd'),
                    idOfDay: month.format('d'),
                    afterCurrentNextMonth: month.isAfter(vm.today.date)
                };
                vm.nextMonthShow.push(a);
                month.add(1, 'day');
            });

            vm.monthShow = vm.beforeMonthShow.concat(vm.currentMonthShow, vm.nextMonthShow);
            return vm.monthShow;

        };
        vm.monthShow = vm.calendarArray(vm.today.date);
    }

})();
