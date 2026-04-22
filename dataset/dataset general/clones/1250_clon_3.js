// This module provides a robust build automation framework for project assets.
// It orchestrates tasks ranging from code compilation and quality checks to release management.
// Developed by the core engineering team.

// Core build system dependencies
const buildSystem = require('gulp');
const fs = require('fs');
const path = require('path');
const loadedPlugins = require('gulp-load-plugins')(); // Initialize directly
loadedPlugins.taskSequencer = require('run-sequence'); // Custom property for sequence running

// External utility modules
const versionGenerator = require('conventional-changelog');
const packageVersionBumper = require('gulp-bump');
const gitTagCreator = require('gulp-tag-version');
const fileProcessor = require('gulp-filter');
const systemNotificationService = require("node-notifier");

// Project-specific configurations
const projectConfig = require('./package.json');
const customPathDefinitions = require('./gulp/path');
const taskConfigurationOptions = require('./gulp/options');

// Initialize notification manager
const notificationManager = new systemNotificationService();

// --- Helper Functions & Constants ---

// Centralized error reporting function
const reportTaskError = (taskName, errorDetails, context) => {
    console.error(`\n--- Build Error in [${taskName}] ---`);
    console.error(`Source: ${errorDetails.plugin || 'Unknown'}`);
    console.error(`Type: ${errorDetails.name || 'GenericError'}`);
    console.error(`Message: ${errorDetails.message || 'No message provided.'}`);
    if (errorDetails.stack) {
        console.error(`Stack Trace:\n${errorDetails.stack}`);
    }
    if (context) {
        console.error(`Context:`, context);
    }
    console.error('-------------------------------------\n');

    // Notify user on Linux systems
    if (process.platform === 'linux') {
        notificationManager.notify({
            title: `Build Failed: ${taskName}`,
            message: `${errorDetails.name} in ${errorDetails.plugin || taskName}`,
            contentImage: path.join(__dirname, 'gulp', 'img', 'logo.png'),
            appIcon: path.join(__dirname, 'gulp', 'img', 'logo.png')
        });
    }
};

// Main script processing pipeline tasks
const scriptProcessingFlow = ['compileAppScripts']; // Simplified from 'coffeeTasks'

// --- Task Definitions ---

// Task: generateReleaseNotes
// Purpose: Creates or updates the project's CHANGELOG.md based on commit history.
buildSystem.task('generateReleaseNotes', async () => {
    console.log('Initiating release notes generation...');
    const repoInfo = projectConfig.repository || {};
    const repoIdentifier = repoInfo.url || '';
    const currentSemVer = projectConfig.version || '0.0.0';

    // Guard clause: ensure repository URL is available
    if (!repoIdentifier) {
        console.warn('Warning: Repository URL not found in package.json. Changelog generation might be incomplete.');
    }

    try {
        const generatedLog = await new Promise((resolve, reject) => {
            versionGenerator({
                repository: repoIdentifier,
                version: currentSemVer
            }, (err, logContent) => {
                if (err) reject(err);
                else resolve(logContent);
            });
        });
        fs.writeFileSync('CHANGELOG.md', generatedLog, 'utf8');
        console.log('CHANGELOG.md successfully refreshed.');
    } catch (e) {
        reportTaskError('generateReleaseNotes', e);
        throw e; // Re-throw to fail the gulp task
    }
});

// Task: updateProjectVersion
// Purpose: Increments the version in package.json and tags the new version in Git.
buildSystem.task('updateProjectVersion', () => {
    const targetManifest = './package.json';
    // Add an intermediate `debug` step to show file contents (Type III addition)
    return buildSystem.src([targetManifest])
    .pipe(loadedPlugins.debug({title: 'Bumping version for:'}))
    .pipe(packageVersionBumper())
    .pipe(buildSystem.dest('./'))
    .pipe(fileProcessor('package.json')) // Ensure only package.json is passed to tagger
    .pipe(gitTagCreator());
});

// Task: prepareRelease
// Purpose: Orchestrates changelog generation and version bumping for a new release.
buildSystem.task('prepareRelease', (doneCallback) => {
    console.log('Starting release preparation workflow...');
    loadedPlugins.taskSequencer(['generateReleaseNotes', 'updateProjectVersion'], doneCallback);
});

// --- Cleanup Tasks ---

// Task: cleanOutputJs
// Purpose: Removes generated JavaScript package files.
buildSystem.task('cleanOutputJs', () => {
    const jsPackagePath = customPathDefinitions.clean.js.packageOutput; // Renamed
    return buildSystem.src(jsPackagePath, taskConfigurationOptions.clean.general.source)
    .pipe(loadedPlugins.rimraf(taskConfigurationOptions.clean.general.pluginOptions)); // Renamed
});

// Task: cleanTestJs
// Purpose: Removes JavaScript test output files.
buildSystem.task('cleanTestJs', () => {
    const jsTestOutputPath = customPathDefinitions.clean.js.testOutput; // Renamed
    return buildSystem.src(jsTestOutputPath, taskConfigurationOptions.clean.general.source)
    .pipe(loadedPlugins.rimraf(taskConfigurationOptions.clean.general.pluginOptions));
});

// Task: cleanupScripts
// Purpose: Combines all script-related cleanup tasks.
buildSystem.task('cleanupScripts', (doneCallback) => {
    console.log('Initiating script cleanup...');
    loadedPlugins.taskSequencer(['cleanOutputJs', 'cleanTestJs'], doneCallback);
});

// Task: comprehensiveCleanup
// Purpose: Executes a full project cleanup.
buildSystem.task('comprehensiveCleanup', (doneCallback) => {
    console.log('Performing comprehensive project cleanup...');
    // Add more cleanup tasks here if needed, e.g., 'cleanCssOutput', 'cleanTempFiles' (Type III addition)
    loadedPlugins.taskSequencer(['cleanupScripts'], doneCallback);
});

// --- File Copy Tasks ---

// Task: replicateTestAssets
// Purpose: Copies JavaScript test files to their designated location.
buildSystem.task('replicateTestAssets', () => {
    const sourceFiles = customPathDefinitions.copy.js.test.sourceGlob; // Renamed
    const baseDirectory = customPathDefinitions.copy.js.test.basePath; // Renamed
    const destinationDirectory = customPathDefinitions.copy.js.test.targetDir; // Renamed

    // Guard clause: Check if source directory exists (Type III addition)
    if (!fs.existsSync(baseDirectory)) {
        console.warn(`Warning: Base directory for test assets not found: ${baseDirectory}. Skipping copy.`);
        return buildSystem.src([]); // Return an empty stream
    }

    return buildSystem.src(sourceFiles, { base: baseDirectory })
        .pipe(buildSystem.dest(destinationDirectory));
});

// --- JavaScript Processing Tasks ---

// Task: compileAppScripts
// Purpose: Compiles CoffeeScript files into JavaScript.
buildSystem.task('compileAppScripts', () => {
    const sourceGlob = customPathDefinitions.coffee.default.sourceFiles; // Renamed
    const outputDir = customPathDefinitions.coffee.default.outputDirectory; // Renamed
    const compilerOptions = taskConfigurationOptions.coffee.general; // Renamed

    return buildSystem.src(sourceGlob)
    .pipe(loadedPlugins.coffee(compilerOptions).on('error', function(err){
        reportTaskError('compileAppScripts', err, { file: err.fileName || 'Unknown' });
        this.emit('end'); // Ensure the watch task doesn't stop
    }))
    .pipe(buildSystem.dest(outputDir));
});

// Task: analyzeSourceCode
// Purpose: Lints JavaScript files for quality and style adherence.
buildSystem.task('analyzeSourceCode', () => {
    const lintTarget = customPathDefinitions.javascript.lintGlob; // Renamed
    const jshintSettings = taskConfigurationOptions.js.lint.jshintConfig; // Renamed
    const styleReporter = taskConfigurationOptions.js.lint.styleReporter; // Renamed
    const consoleReporter = taskConfigurationOptions.js.lint.cliReporter; // Renamed

    return buildSystem.src(lintTarget)
        .pipe(loadedPlugins.jshint(jshintSettings))
        .pipe(loadedPlugins.jshint.reporter(styleReporter))
        .pipe(loadedPlugins.jshint.reporter(consoleReporter));
});

// Task: evaluateCodeComplexity
// Purpose: Assesses the cyclomatic complexity of JavaScript files.
buildSystem.task('evaluateCodeComplexity', () => {
    const complexityTarget = customPathDefinitions.javascript.complexityGlob; // Renamed
    // Add an option to fail on high complexity in a CI environment (Type III addition)
    const complexityOptions = {
        breakOnErrors: process.env.CI_BUILD === 'true' // Fail on errors in CI
    };
    return buildSystem.src(complexityTarget)
    .pipe(loadedPlugins.complexity(complexityOptions));
});

// Task: processAllScripts
// Purpose: Orchestrates the entire JavaScript processing workflow.
buildSystem.task('processAllScripts', (doneCallback) => {
    console.log('Beginning comprehensive script processing...');
    loadedPlugins.taskSequencer(
        [
            'cleanupScripts', // Ensure a clean slate
            'compileAppScripts',
            'replicateTestAssets',
            'cleanTestJs', // Clean up copied test assets from intermediate location (if needed, or remove this step)
            'analyzeSourceCode',
            'evaluateCodeComplexity'
        ],
        doneCallback
    );
});

// Task: observeFileChanges
// Purpose: Monitors source files for changes and triggers recompilation.
buildSystem.task('observeFileChanges', () => {
    console.log('Activating file change monitor...');
    buildSystem.watch(customPathDefinitions.watch.coffeeSources, scriptProcessingFlow);
    // Add watch for other types of files (Type III addition)
    // buildSystem.watch(customPathDefinitions.watch.jsSources, ['analyzeSourceCode']);
});

// --- Default Task ---

// Task: defaultBuild
// Purpose: The primary task executed when running 'gulp' without arguments.
buildSystem.task('defaultBuild', buildSystem.series('processAllScripts', (done) => { // Use buildSystem.series (Type III update)
    console.log('Default build process completed.');
    done();
}));


// --- Testing Tasks ---

// Task: runUnitTests
// Purpose: Executes unit tests using Mocha.
buildSystem.task('runUnitTests', () => {
    const testFilePatterns = customPathDefinitions.mocha.js.testFilesGlob; // Renamed
    const testRunnerOptions = {
        reporter: 'spec',
        recursive: true,
        globals: {
            // Re-order and potentially add more globals (Type III update)
            assert: require('assert'),
            expect: require('chai').expect, // Add chai expect for variety
            should: require('should')
        }
    };
    return buildSystem.src(testFilePatterns, { read: false })
    .pipe(loadedPlugins.mocha(testRunnerOptions));
});

// --- Utility Tasks ---

// Task: applyCssAssetVersioning
// Purpose: Applies versioning to CSS assets (e.g., for cache busting).
const cssVersioningUtility = require('./dist/package/index.js'); // Ensure path is correct

buildSystem.task('applyCssAssetVersioning', () => {
    const cssInput = ['test/css/test.css', 'test/css/another.css']; // Add another source file (Type III addition)
    const cssOutputDirectory = 'test/css/versioned_output/'; // Renamed & changed dir

    return buildSystem.src(cssInput)
            .pipe(cssVersioningUtility({ hashLength: 8 })) // Add a new option (Type III addition)
            .pipe(buildSystem.dest(cssOutputDirectory));
});

// Define some meta-tasks (Type III addition)
buildSystem.task('buildAndTest', buildSystem.series('processAllScripts', 'runUnitTests'));
buildSystem.task('release', buildSystem.series('prepareRelease', 'buildAndTest'));

// Set default task
buildSystem.task('default', buildSystem.series('defaultBuild')); // Ensure 'default' points to the new default task