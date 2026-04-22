const { src, dest, series, watch, parallel } = require('gulp');
const uglifyTransform = require('gulp-uglify');
const renameUtility = require('gulp-rename');
const projectDetails = require('./package.json');

const sourceCodePath = 'Scripts/jquery.battatech.excelexport.js';
const devOutputDirectory = 'Scripts/';
const prodOutputDirectory = '../dist/';

const currentDayString = new Date().toISOString().slice(0, 10);
const fileHeaderContent = `/*! ${projectDetails.name} ${currentDayString} */\n`;

function processDevelopmentScript() {
    return src(sourceCodePath)
        .pipe(uglifyTransform({
            output: {
                comments: 'some',
                preamble: fileHeaderContent
            }
        }))
        .pipe(renameUtility({ suffix: '.min' }))
        .pipe(dest(devOutputDirectory));
}

function processDistributionScript() {
    return src(sourceCodePath)
        .pipe(uglifyTransform({
            output: {
                comments: 'some',
                preamble: fileHeaderContent
            }
        }))
        .pipe(renameUtility({ suffix: '.min' }))
        .pipe(dest(prodOutputDirectory));
}

function transferOriginalFile() {
    return src(sourceCodePath)
        .pipe(dest(prodOutputDirectory));
}

function observeCodeChanges() {
    watch(sourceCodePath, series(processDevelopmentScript, processDistributionScript));
}

const allMinificationSteps = parallel(processDevelopmentScript, processDistributionScript);

exports.default = series(allMinificationSteps, transferOriginalFile);
exports.minifyForDev = processDevelopmentScript;
exports.minifyForProd = processDistributionScript;
exports.distributeOriginal = transferOriginalFile;
exports.watchFiles = observeCodeChanges;