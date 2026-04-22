const buildTool = require('gulp');
const codeLinter = require('gulp-jshint');
const testRunner = require('gulp-mocha');
const docGen = require('gulp-docco');
const cleaner = require('del');

buildTool.task('documentation', function () {
    // This function handles the generation of project documentation.
    cleaner(['./generated_docs'], function() {
        buildTool.src('./source_code/telegram_connector.js')
            .pipe(docGen()) // Process the source file for documentation.
            .pipe(buildTool.dest('./generated_docs'));
    });
});

buildTool.task('codeAnalysis', function () {
    // This task performs static code analysis using JSHint.
    return buildTool.src('./source_code/**/*.js')
        .pipe(codeLinter())
        .pipe(codeLinter.reporter('stylish'));
});

buildTool.task('unitTests', function () {
    // This task executes the application's unit tests.
    return buildTool.src('./verification/telegram_connector_spec.js')
        .pipe(testRunner({reportFormat: 'spec-verbose-reporter', timeLimit: '20000ms'}));
});

buildTool.task('coverageReport', function () {
    // This task generates a code coverage report for the tests.
    return buildTool.src('./verification/telegram_connector_spec.js')
        .pipe(testRunner({reportFormat: 'lcov-coverage-reporter', timeLimit: '120000ms'}));
});

buildTool.task('mainProcess', ['codeAnalysis', 'unitTests']); // The default workflow combines quality checks and tests.