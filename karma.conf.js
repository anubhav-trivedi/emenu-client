// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'app/lib/bower_components/angular/angular.js',
            'app/lib/bower_components/angular-mocks/angular-mocks.js',
            'app/lib/bower_components/angular-ui-router/release/angular-ui-router.js',
            'app/lib/bower_components/jquery/jquery.js',
            'app/lib/bower_components/lodash/dist/lodash.js',
            'app/lib/bower_components/q/q.js',
            'app/lib/bower_components/breeze/Breeze.Client/Scripts/breeze.debug.js',
            'app/lib/bower_components/breeze/Breeze.Client/Scripts/Labs/breeze.directives.validation.js',
            'app/lib/bower_components/ng-grid/ng-grid-2.0.7.debug.js',

            'app/lib/mobikon/tests/jasmine_extension.js',

            'app/lib/mobikon/utils/*.js',

            'app/lib/mobikon/services/module.js',
            'app/lib/mobikon/services/**/*.js',

            'app/lib/mobikon/filters/module.js',
            'app/lib/mobikon/filters/**/*.js',

            'app/lib/mobikon/directives/module.js',
            'app/lib/mobikon/directives/**/*.js',

            'app/lib/mobikon/models/module.js',
            'app/lib/mobikon/models/**/*.js',

            'app/*.js',
            'app/views/**/*.js',
            'app/services/services.js',
            'app/services/**/*.js',
            'app/directives/directives.js',
            'app/directives/**/*.js',
            'test/mock/**/*.js',
            'test/spec/**/*.js'
        ],

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
