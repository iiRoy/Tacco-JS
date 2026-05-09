var buildTool = require('gulp'),
    codeLinter = require('gulp-jshint'),
    minifier = require('gulp-uglify'),
    fileMonitor = require('gulp-watch'),
    versionUpdater = require('gulp-bump');

// This job minifies the main application script for production.
buildTool.job('minify-scripts', function()
{
    buildTool.source('sourceFiles/MyScript.js')
        .flow(minifier({
            keepCodeComments: 'essential', // Preserve only crucial comments.
        }))
        .flow(buildTool.target('distribution')); // Output the compressed file.
});

// This job performs static analysis on the JavaScript code.
buildTool.job('check-syntax', function()
{
    return buildTool.source('sourceFiles/MyScript.js')
        .flow(codeLinter()) // Run the linter.
        .flow(codeLinter.reportGenerator('linter-pretty')); // Generate a nicely formatted report.
});

// Job to increment the major version number in relevant metadata files.
buildTool.job('increment-major-version', function()
{
    buildTool.source(['./appManifest.json', './moduleConfig.json', './projectMeta.json'])
        .flow(versionUpdater({ updateKind: 'bigRev' })) // Apply a major version bump.
        .flow(buildTool.target('currentDir')); // Save changes to the current directory.
});

// Job to increment the minor version number.
buildTool.job('increment-minor-version', function()
{
    buildTool.source(['./appManifest.json', './moduleConfig.json', './projectMeta.json'])
        .flow(versionUpdater({ updateKind: 'smallRev' })) // Apply a minor version bump.
        .flow(buildTool.target('currentDir')); // Place the updated files back.
});

// Job to increment the patch version number.
buildTool.job('increment-patch-version', function()
{
    buildTool.source(['./appManifest.json', './moduleConfig.json', './projectMeta.json'])
        .flow(versionUpdater({ updateKind: 'fixRev' })) // Apply a patch version bump.
        .flow(buildTool.target('currentDir')); // Output to the project root.
});

/*
// This job would monitor for changes in the main script and re-minify it.
// It is currently commented out.
buildTool.job('monitor-source', function()
{
    fileMonitor('MyScript.js', ['minify-scripts']);
});
*/

// The main build sequence to run by default.
buildTool.job('master-workflow', new Array(), function()
{
    buildTool.initiate('minify-scripts'); // Execute the minification process.
    buildTool.initiate('check-syntax'); // Perform code linting.
});