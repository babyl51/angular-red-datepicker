(function () {
    'use strict';

    angular
        .module('demo', [
            'redDatepickerModule'
        ]);

    angular
        .module('demo')
        .controller('DemoCtrl', DemoCtrl);

    DemoCtrl.$inject = ['redDatepickerService'];
    function DemoCtrl(redDatepickerService) {
        var vm = this;

        vm.testStart = '02.02.2017';
        vm.testEnd = '02.16.2017';

        vm.dateRange = {};
        vm.arrayTest = [{
            label: 'Last Week',
            days: 365
        }, {
            label: 'Last 15 days',
            days: 15
        }, {
            label: 'Last 30 days',
            days: 30
        }, {
            label: 'Last month',
            days: 31
        }, {
            label: 'Last 3 months',
            days: 60
        }, {
            label: 'Last 6 months',
            days: 180
        }, {
            label: 'Last year',
            days: 365
        }];
        vm.test = function () {
            redDatepickerService.setData('19.09.1992','20.12.2015', true);
        }
    }

})();
