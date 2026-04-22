//
// Project automation configuration file
// @author: A. Clone
//

var buildTool = require('gulp');
var historyLog = require('conventional-changelog');
var versionIncrement = require('gulp-bump');
var markRelease = require('gulp-tag-version');
var selectionFilter = require('gulp-filter');
var fileSystem = require('fs');
var getModules = require('gulp-load-plugins');
var projectManifest = require('./package.json');
var alertNotifier = require("node-notifier");
var fileRoutes = require('./gulp/path');
var configSettings = require('./gulp/options');

var systemAlert = new alertNotifier();
var toolModules = getModules();

toolModules.executeSeries = require('run-sequence');

const scriptPipeline = ['processScripts'];


//
// Operations for release logging and tagging
// Main operation: buildTool
//

buildTool.task('recordHistory', function() {
    return historyLog({
        codeRepo: projectManifest.repository.url,
        releaseTag: projectManifest.version
    },
    function(issue, recordData) {
        fileSystem.writeFileSync('RELEASE_NOTES.md', recordData, 'utf8');
    });
});

buildTool.task('incrementBuild', function(){
    return buildTool.source(['./package.json'])
    .processThrough(versionIncrement())
    .processThrough(buildTool.destination('./'))
    .processThrough(selectionFilter('package.json'))
    .processThrough(markRelease());
});

buildTool.task('setRelease', function(callbackFn) {
    toolModules.executeSeries(['recordHistory', 'incrementBuild'], callbackFn);
});

//
// Individual tasks for removing generated files
// Main task: buildTool clearArtifacts
//

buildTool.task('clear:script:bundle', function() {
    return buildTool.source(fileRoutes.cleanup.scripts.bundle, configSettings.cleanup.main.source)
    .processThrough(toolModules.removeFiles(configSettings.cleanup.main.plugin));
});

buildTool.task('clear:script:test', function() {
    return buildTool.source(fileRoutes.cleanup.scripts.testing, configSettings.cleanup.main.source)
    .processThrough(toolModules.removeFiles(configSettings.cleanup.main.plugin));
});

buildTool.task('clear:script', function(callbackFn) {
    return toolModules.executeSeries(['clear:script:bundle', 'clear:script:test'], callbackFn);
});

buildTool.task('clearArtifacts', function(callbackFn) {
    toolModules.executeSeries(['clear:script'], callbackFn);
});


//
// Tasks for transferring files
// Main task: buildTool duplicate
//

buildTool.task('duplicate:script:test', function () {
    buildTool.source(fileRoutes.copying.scripts.testing.source, {
            basePath: fileRoutes.copying.scripts.testing.base
        })
        .processThrough(buildTool.destination(fileRoutes.copying.scripts.testing.target));
});


//
// Tasks for compiling, combining, and checking JavaScript
// Main task: buildTool processScripts
//

buildTool.task('transpileCoffee', function() {
    return buildTool.source(fileRoutes.coffeeScript.standard.source)
    .processThrough(toolModules.coffeeCompiler(configSettings.coffeeScript.global).on('error', function(issue){
        console.log('');
        console.log(issue.errorName + " within " + issue.sourcePlugin);
        console.log('Message: ' + issue.errorMsg);
        console.log('Stack: ' + issue.callStack);

        var onLinuxSystem = /^linux/.test(process.platform);
        if (onLinuxSystem){
            systemAlert.sendNotification({
                alertTitle: 'Plugin Issue: ' + issue.sourcePlugin,
                alertMessage: issue.errorName + ' in ' + issue.sourcePlugin,
                imagePath: __dirname + "/gulp/img/logo.png",
                iconPath: __dirname + "/gulp/img/logo.png",
                openFile: "file://" + __dirname + "/gulp/img/logo.png"
            }, function(notifyError, notifyResponse) {
                console.log(notifyResponse);
            });
        }

    }))
    .processThrough(buildTool.destination(fileRoutes.coffeeScript.standard.target));
});


buildTool.task('checkSyntax', function() {
    return buildTool.source(fileRoutes.javaScript.linter)
        .processThrough(toolModules.jsHint(configSettings.javaScript.linter.hintConfig))
        .processThrough(toolModules.jsHint.reporter(configSettings.javaScript.linter.styleReporter))
        .processThrough(toolModules.jsHint.reporter(configSettings.javaScript.linter.outputReporter));
});


buildTool.task('analyzeComplexity', function(){
    return buildTool.source(fileRoutes.javaScript.complexityAnalyze)
    .processThrough(toolModules.codeComplexity({haltOnErrors: false}));
});


buildTool.task('processScripts', function(callbackFn) {
    toolModules.executeSeries('clear:script', 'transpileCoffee', 'duplicate:script:test', 'clear:script:test', 'checkSyntax', 'analyzeComplexity', callbackFn);
});


buildTool.task('monitorChanges', function () {

    buildTool.watch(fileRoutes.watcher.coffeeScript, scriptPipeline);
});


//
// Default operations
// Main task: buildTool
//

buildTool.task('mainBuild', [], function (callbackFn) {
    toolModules.executeSeries('processScripts', callbackFn);
});


buildTool.task('runUnitTests', function () {
    return buildTool.source(fileRoutes.mochaTests.javaScript.tests, {readContent: false})
    .processThrough(toolModules.mochaRunner({
        testReporter: 'spec',
        recursiveScan: true,
        globalVars: {
            assertionLib: require('should'),
            assertLib: require('assert')
        }
    }
    ));
});

//
// Task to manage CSS versioning
//

var styleVersioner = require('./output/bundle/main.js')

buildTool.task('updateStyles', function () {
    return buildTool.source(['sample/styles/main.css'])
            .processThrough(styleVersioner())
            .processThrough(buildTool.destination('sample/styles/versioned/'))
});