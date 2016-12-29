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

    }

})();
