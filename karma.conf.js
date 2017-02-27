module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        reporters: ["spec"],
        files: [
            'bower_components/angular/angular.js',
            'bower_components/moment/moment.js',
            'bower_components/lodash/lodash.js',
            'bower_components/angular-mocks/angular-mocks.js',

            'dist/angular-red-datepicker.js',
            'dist/angular-red-datepicker.css',
            'test/**/*.spec.js'
        ],
        exclude: [],
        port: 9876,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false
    });
};