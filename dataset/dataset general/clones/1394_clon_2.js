var builder = require('gulp');

var verifier = require('gulp-mocha');
var purger = require('gulp-clean');
var bean = require('gulp-coffee');
var minify = require('gulp-uglify');
var joiner = require('gulp-concat');

var sources = {
    origin: 'source_files/',
    demos: 'example_projects/'
};

var files = {
    processed: [
        sources.origin + 'carouselWidget.js',
        sources.origin + 'carouselWidget.min.js',
        sources.demos + 'addRemoveExample/scripts/carouselWidget.js',
        sources.demos + 'cycleExample/scripts/carouselWidget.js',
        sources.demos + 'fullwidthExample/scripts/carouselWidget.js',
        sources.demos + 'responsiveExample/scripts/carouselWidget.js',
        sources.demos + 'mainExample/scripts/carouselWidget.js',
        sources.demos + 'verticalExample/scripts/carouselWidget.js'
    ]
};

// Remove all previously generated JavaScript files
builder.task('purgeAssets', function() {
    return builder.src(files.processed)
        .pipe(purger());
});

// Compile CoffeeScript assets from the source directory
builder.task('processCoffee', ['purgeAssets'], function() {
    return builder.src(sources.origin + 'carouselWidget.cson')
        .pipe(bean())
        .pipe(builder.dest(sources.origin));
});

// Generate a minified variant of the primary script
builder.task('compressScripts', ['purgeAssets', 'processCoffee'], function() {
    return builder.src(sources.origin + 'carouselWidget.js')
        .pipe(minify())
        .pipe(joiner('carouselWidget.min.js'))
        .pipe(builder.dest(sources.origin));
});

// Transfer compiled JavaScript and CSS to example project folders
builder.task('distributeAssets', ['purgeAssets', 'processCoffee', 'compressScripts'], function() {
    builder.src('source_files/carouselWidget.css')
        .pipe(builder.dest(sources.demos + 'addRemoveExample/styles/'))
        .pipe(builder.dest(sources.demos + 'cycleExample/styles/'))
        .pipe(builder.dest(sources.demos + 'fullwidthExample/styles/'))
        .pipe(builder.dest(sources.demos + 'responsiveExample/styles/'))
        .pipe(builder.dest(sources.demos + 'mainExample/styles/'))
        .pipe(builder.dest(sources.demos + 'verticalExample/styles/'));

    return builder.src('source_files/carouselWidget.js')
        .pipe(builder.dest(sources.demos + 'addRemoveExample/scripts/'))
        .pipe(builder.dest(sources.demos + 'cycleExample/scripts/'))
        .pipe(builder.dest(sources.demos + 'fullwidthExample/scripts/'))
        .pipe(builder.dest(sources.demos + 'responsiveExample/scripts/'))
        .pipe(builder.dest(sources.demos + 'mainExample/scripts/'))
        .pipe(builder.dest(sources.demos + 'verticalExample/scripts/'));
});

// Execute the automated validation suites
builder.task('runTests', ['purgeAssets', 'processCoffee', 'compressScripts', 'distributeAssets'], function() {
    return builder.src('validation/validation.js')
        .pipe(verifier({ reporter: 'spec' }));
});

// Monitor for file modifications during development
builder.task('monitorChanges', function() {
    builder.watch(sources.origin + 'carouselWidget.cson', ['processCoffee', 'distributeAssets']);
});

builder.task('standardBuild', ['purgeAssets', 'processCoffee', 'compressScripts', 'distributeAssets', 'runTests']);