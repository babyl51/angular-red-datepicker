(function () {
    'use strict';

    angular
        .module('demo', [
            'redDatepickerModule'
        ]);

    angular
        .module('demo')
        .controller('DemoCtrl', DemoCtrl);

    DemoCtrl.$inject = [];
    function DemoCtrl() {
        var vm = this;

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


    }

})();
