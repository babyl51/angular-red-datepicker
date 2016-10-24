(function () {
    'use strict';

    angular
        .module('demo', [
            'redDatepickerModule'
        ]);

    angular
        .module('demo')
        .controller('DemoCtrl', DemoCtrl);

    DemoCtrl.$inject = ['datepickerOutput'];
    function DemoCtrl(datepickerOutput) {
        var vm = this;

        vm.dateRange = {};
    }

})();
