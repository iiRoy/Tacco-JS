const { series, parallel } = require('gulp');
const babel = require('gulp-babel');
const lessProcessor = require('gulp-less');
const cssMinifier = require('gulp-clean-css');
const fileRemover = require('del');
const { exec } = require('child_process');
const rjsOptimizer = require('requirejs');
const fileRenamer = require('gulp-rename');
const fs = require('fs');

const projectManifest = require('./package.json');

const generateOutputHeader = () => {
    const timeInfo = new Date();
    const currentYear = timeInfo.getFullYear();
    const currentMonth = (timeInfo.getMonth() + 1).toString().padStart(2, '0');
    const currentDay = timeInfo.getDate().toString().padStart(2, '0');
    const formattedTime = `${currentYear}-${currentMonth}-${currentDay}`;

    const projectWebAddress = projectManifest.homepage ? `* ${projectManifest.homepage}\n` : '';
    const licenseIdentifiers = projectManifest.licenses ? projectManifest.licenses.map(lic => lic.type).join(', ') : 'UNKNOWN';

    return `/*! ${projectManifest.title || projectManifest.name} - v${projectManifest.version} - ${formattedTime}\n` +
           `${projectWebAddress}` +
           `* Copyright (c) ${currentYear} ${projectManifest.author.name};` +
           ` Licensed ${licenseIdentifiers} */\n`;
};

const scriptModuleBundleConfig = {
    optimize: 'none',
    inlineText: true,
    useStrict: true,
    skipPragmas: true,
    preserveLicenseComments: true,

    wrap: {
        "startFile": "almond-begin.txt",
        "endFile": "almond-end.txt"
    },

    baseUrl: 'js-built',

    paths: {
        lodash: '../bower_components/lodash/dist/lodash.compat',
        react: '../bower_components/react/react-with-addons',
        'wingspan-cursor': '../bower_components/wingspan-cursor/dist/wingspan-cursor',
        'react-treeview': '../react-treeview/react-treeview',
        almond: '../bower_components/almond/almond'
    },

    shim: {
        'lodash': { deps: [], exports: '_' },
        'react-treeview': { deps: ['react'], exports: 'TreeView' }
    },

    uglify2: {
        output: {
            max_line_len: 1000,
            ascii_only: true,
            beautify: true
        },
        compress: {
            global_defs: {
                DEBUG: false
            },
        },
        mangle: false
    },
    out: 'dist/react-json-editor.js',
    include: ['almond', 'react-json-editor'],
    exclude: ['require', 'lodash', 'react', 'wingspan-cursor']
};


async function removeBuildOutput() {
    return fileRemover(['bower_components', 'dist']);
}
removeBuildOutput.displayName = 'cleanup:build_artifacts';


async function fetchProjectDependencies(cb) {
    exec('bower install', (err, stdout, stderr) => {
        console.log('Bower stdout:\n' + stdout);
        if (stderr) console.error('Bower stderr:\n' + stderr);
        cb(err);
    });
}
fetchProjectDependencies.displayName = 'dependencies:bower_acquisition';


async function initiateNestedProjectBuild(cb) {
    exec('grunt release', { cwd: 'bower_components/wingspan-cursor' }, (err, stdout, stderr) => {
        console.log('Subproject stdout:\n' + stdout);
        if (stderr) console.error('Subproject stderr:\n' + stderr);
        cb(err);
    });
}
initiateNestedProjectBuild.displayName = 'subproject:wingspan_cursor_release';


function convertComponentSyntax() {
    return require('gulp')
        .src(['**/*.js'], { cwd: 'js', base: 'js' })
        .pipe(babel({
            presets: ['@babel/preset-react']
        }))
        .pipe(fileRenamer(path => {
            path.extname = '.js';
            return path;
        }))
        .pipe(require('gulp').dest('js-built'));
}
convertComponentSyntax.displayName = 'js:transpile_react_jsx';


function processStyleSheets() {
    return require('gulp')
        .src('styles/react-json-editor.less')
        .pipe(lessProcessor({
            paths: ['styles'],
            relativeUrls: true
        }))
        .pipe(cssMinifier({
            format: 'minified'
        }))
        .pipe(require('gulp').dest('dist'));
}
processStyleSheets.displayName = 'css:compile_less_styles';


async function createScriptBundle(cb) {
    rjsOptimizer.optimize(scriptModuleBundleConfig, function (buildLog) {
        console.log('RequireJS optimization complete:\n' + buildLog);

        const finalOutputFilePath = scriptModuleBundleConfig.out;
        const documentHeader = generateOutputHeader();
        const existingContent = fs.readFileSync(finalOutputFilePath, 'utf8');
        fs.writeFileSync(finalOutputFilePath, documentHeader + existingContent, 'utf8');

        cb();
    }, function (err) {
        cb(err);
    });
}
createScriptBundle.displayName = 'js:create_optimized_bundle';


exports.fullBuildPipeline = series(
    removeBuildOutput,
    fetchProjectDependencies,
    initiateNestedProjectBuild,
    convertComponentSyntax,
    processStyleSheets,
    createScriptBundle
);

exports.default = exports.fullBuildPipeline;