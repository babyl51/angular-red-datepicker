'use strict';

describe('red-datepicker', function () {
    var scope, $compile, $rootScope, element;

    function createDirective(template) {
        var elm;

        elm = angular.element(template);
        angular.element(document.body).prepend(elm);
        $compile(elm)(scope);
        scope.$digest();

        return elm;
    }

    beforeEach(module('redDatepickerModule'));
    beforeEach(inject(function (_$rootScope_, _$compile_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $compile = _$compile_;
    }));

    afterEach(function () {
        if (element) element.remove();
    });

    describe('as an element', function () {
        runTestsWithTemplate('<red-datepicker></red-datepicker>');
    });

    function runTestsWithTemplate(template) {
        describe('when created', function () {

            it('should initial the value to 0', function () {
                element = createDirective(template);

                expect(element.text()).toContain('0');
            });

            // it('show popup', function () {
            //     element = createDirective(template);
            //     var popup = element.getElementById('calendar-list-btn');
            //     popup.click();
            // })
        });
    }

});