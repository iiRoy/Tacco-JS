const { src, dest, series, parallel, watch } = require('gulp');
const path = require('path');

const codeLinter = require('gulp-jshint');
const scriptAggregator = require('gulp-concat');
const minifier = require('gulp-uglify');
const versionElevator = require('gulp-bump');
const webPublisher = require('gulp-gh-pages');
const fileEraser = require('del');
const textReplacer = require('gulp-replace');
const fileNameChanger = require('gulp-rename');

const testRunner = require('karma').Server;

const projectManifest = require('./package.json');

let targetPlatforms;
const commandLineArguments = process.argv.slice(2);
const platformsOptionIndex = commandLineArguments.findIndex(arg => arg.startsWith('--platforms='));
if (platformsOptionIndex !== -1) {
    targetPlatforms = commandLineArguments[platformsOptionIndex].split('=')[1].split(',');
} else {
    const standalonePlatformsIndex = commandLineArguments.indexOf('--platforms');
    if (standalonePlatformsIndex !== -1 && commandLineArguments[standalonePlatformsIndex + 1] && !commandLineArguments[standalonePlatformsIndex + 1].startsWith('--')) {
        targetPlatforms = commandLineArguments[standalonePlatformsIndex + 1].split(',');
    }
}

const sourceScriptsPattern = 'src/**/*.js';
const outputFolder = 'dist';
const releaseContainer = 'release';

const artifactLabel = `-dev-${new Date().toISOString().slice(0, 10)}`;

const standardPlatforms = ['PhantomJS'];

const scriptHeader = `/**
 * ${projectManifest.description}
 * @version v${projectManifest.version}
 * @link ${projectManifest.repository.url}
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */`;

const generalLinterOptions = {
    boss: true,
    browser: true,
    camelcase: true,
    curly: true,
    eqeqeq: true,
    eqnull: true,
    forin: true,
    immed: true,
    latedef: true,
    newcap: true,
    noarg: true,
    sub: true,
    undef: true,
    globals: {
        angular: false,
        matchMedia: false,
        dump: false,
        console: false
    }
};

const specLinterOptions = {
    camelcase: false,
    globals: {
        $: false,
        angular: false,
        beforeEach: false,
        browser: false,
        browserTrigger: false,
        describe: false,
        ddescribe: false,
        dump: false,
        expect: false,
        inject: false,
        input: false,
        it: false,
        iit: false,
        module: false,
        repeater: false,
        runs: false,
        spyOn: false,
        waits: false,
        waitsFor: false
    }
};

function purgeArtifacts() {
    return fileEraser([outputFolder, releaseContainer]);
}

function examineSourceCode() {
    return src(sourceScriptsPattern)
        .pipe(codeLinter(generalLinterOptions))
        .pipe(codeLinter.reporter('default'));
}

function examineSpecificationCode() {
    return src(['test/**/*.js', '!test/lib/**/*.js', '!test/config/*'])
        .pipe(codeLinter(specLinterOptions))
        .pipe(codeLinter.reporter('default'));
}

const examineCode = parallel(examineSourceCode, examineSpecificationCode);

function amalgamateScripts() {
    return src(sourceScriptsPattern)
        .pipe(scriptAggregator(`${projectManifest.name}.js`))
        .pipe(textReplacer(/^/, scriptHeader))
        .pipe(dest(outputFolder));
}

function compressCode() {
    return src(`${outputFolder}/${projectManifest.name}.js`)
        .pipe(minifier())
        .pipe(textReplacer(/^/, scriptHeader))
        .pipe(fileNameChanger(`${projectManifest.name}.min.js`))
        .pipe(dest(outputFolder));
}

const assembleSoftware = series(examineCode, amalgamateScripts, compressCode);

function testingFrameworkUnit(completionCallback) {
    new testRunner({
        configFile: path.resolve('test/config/karma.conf.js'),
        autoWatch: false,
        singleRun: true,
        browsers: targetPlatforms || standardPlatforms
    }, completionCallback).start();
}

function testingFrameworkWatch(completionCallback) {
    new testRunner({
        configFile: path.resolve('test/config/karma.conf.js'),
        autoWatch: true,
        singleRun: false,
        browsers: targetPlatforms || standardPlatforms
    }, completionCallback).start();
}

const replicateAssets = parallel(
    function copyManifest() {
        return src('bower.json').pipe(dest(releaseContainer));
    },
    function copyBuiltScripts() {
        return src(`${outputFolder}/**/*.js`).pipe(dest(`${releaseContainer}/js`));
    }
);

function elevateVersion() {
    return src(['package.json', 'bower.json'])
        .pipe(versionElevator({
            commit: true,
            createTag: false,
            push: false
        }))
        .pipe(dest('./'));
}

function deploySite() {
    delete require.cache[require.resolve('./package.json')];
    const updatedProjectManifest = require('./package.json');
    return src(`${releaseContainer}/**/*`)
        .pipe(webPublisher({
            base: releaseContainer,
            tag: `v${updatedProjectManifest.version}`,
            message: `Release v${updatedProjectManifest.version}`,
            add: true,
            push: true
        }));
}

function monitorChanges() {
    watch(['test/**/*.js', `${outputFolder}/**/*.js`, '!test/config/*'], examineCode);
    watch([sourceScriptsPattern], series(assembleSoftware));
}

exports.default = series(examineCode, purgeArtifacts, assembleSoftware, testingFrameworkUnit);

exports.verifySystem = series(examineCode, purgeArtifacts, assembleSoftware, testingFrameworkUnit);

exports.observeDevelopment = parallel(testingFrameworkWatch, monitorChanges);

exports.assembleSoftware = assembleSoftware;

exports.distributeProduct = series(
    purgeArtifacts,
    elevateVersion,
    assembleSoftware,
    replicateAssets,
    deploySite
);