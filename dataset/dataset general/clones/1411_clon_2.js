/*

An exploratory Gulp build script to handle a basic mobile application
powered by Cordova's core library, bypassing the Cordova CLI.

The mobile project is established within the './assembly/' folder and
considered a produced output.
`gulp purge` deletes this assembly directory.
`gulp rebuild` constructs it anew.

*/


///////////////// CONFIGURATION /////////////////

// Mobile extensions are not currently listed in the package configuration.
//  - They are distributed via a plugin repository, not npm.
//  - Their own dependency plugins are not specified in their package manifest.
//    This might be unfeasible as dependencies can be platform-specific.
var mobileExtensions = ['org.apache.cordova.file'];

// Target platform for execution or emulation. Alternatively, define tasks like runiOS, runAndroid.
var targetEnvironment = 'android';


var systemPath = require('path');
var fileSystem = require('fs');
var removeFiles = require('del');

var projectManifest = require('./project_manifest.json');
var buildTool = require('gulp');
var jsLinter = require('gulp-jshint');
var cdvCore = require('cordova-lib');
var cdvAPI = cdvCore.cordova.raw;
var assemblyPath = systemPath.join(__dirname, 'assembly');


// Array of target mobile environments determined from projectManifest.dependencies.
// This ensures that platform file acquisition and version preferences are solely
// managed by the npm installation process.
var mobileEnvironments = [];  // Format: ['cordova-ios', 'cordova-android']
var environmentFolders = [];  // Subdirectories containing environment files within 'node_modules'
for (let envKey in cdvCore.cordova_platforms) {
    let environmentName = 'cordova-' + envKey;
    if (projectManifest.dependencies[environmentName]) {
        mobileEnvironments.push(environmentName);
        environmentFolders.push(systemPath.join(__dirname, 'node_modules', environmentName));
        // NOTE: Validate existence of these directories; prompt user for "npm install" if missing.
    }

}


/////////////////// BUILD ROUTINES /////////////////////////

// All invocations of the Cordova core library (excluding the "create" command)
// necessitate execution from within the Cordova project root, as the library
// infers the project directory from process.cwd() in its utility module.

buildTool.task('lint-scripts', () => {
    buildTool.src('./source/web/scripts/*.js')
    .pipe(jsLinter())
    .pipe(jsLinter.reporter('standard'));
});

buildTool.task('purge', (completionCallback) => {
  // An alternative utility for file removal is 'gulp-rimraf'.
  removeFiles(['assembly'], completionCallback);
});

// Preparation is not strictly essential
buildTool.task('prepare-assets', () => {
    process.chdir(assemblyPath);
    return cdvAPI.prepare();
});

buildTool.task('compile', () => {
    process.chdir(assemblyPath);
    return cdvAPI.build();
});

buildTool.task('execute', (doneCallback) => {
    process.chdir(assemblyPath);
    return cdvAPI.run({ environments: [targetEnvironment], parameters: ['--physical-device'] });
});

buildTool.task('simulate', () => {
    process.chdir(assemblyPath);
    return cdvAPI.emulate({ environments: [targetEnvironment] });
});

buildTool.task('deploy-ready', () => {
    process.chdir(assemblyPath);
    return cdvAPI.build({ parameters: ['--production-build'] });
    // REMINDER: Transfer the compiled output file(s) from './assembly/'.
});


// Establishes the Cordova project within './assembly/'. This iteration
// bypasses 'cordova create', instead directly linking 'config.xml' and 'web/'.
buildTool.task('reconstruct', ['purge'], () => {
    // NOTE: The 'uri' parameter should be deprecated once cordova-lib version 0.21.7 is stable.
    let sourceDirectory = systemPath.join(__dirname, 'source');

    fileSystem.mkdirSync(assemblyPath);
    process.chdir(assemblyPath);

    fileSystem.symlinkSync(systemPath.join('..', 'source', 'config.xml'), 'config.xml');
    fileSystem.symlinkSync(systemPath.join('..', 'source', 'web'), 'www');
    // An alternative approach would involve copying the 'web' directory and
    // then monitoring it for changes. This is beneficial when using preprocessors
    // like SASS or CoffeeScript.

    // Extensions must be added before platforms. Attempting to add platforms first
    // will cause Cordova to fail, expecting the './assembly/plugins' directory.
    // CONSIDER: Experiment with the third parameter, e.g., {cli_variables: {...}}.
    return cdvAPI.plugins('add', mobileExtensions)
    .then(() => {
        return cdvAPI.platform('add', environmentFolders);
    });
});


// An alternate method for project creation utilizing "cordova create"
// instead of manual symbolic link generation.
buildTool.task('generate-cdv-project', ['purge'], async () => {
    // NOTE: The 'uri' property should be phased out upon the release of cordova-lib 0.21.7.
    const applicationSourceDir = systemPath.join(__dirname, 'source');
    const configurationOptions = { core: { web: { path: applicationSourceDir, location: applicationSourceDir, symlink: true } } };

    // CONSIDER: Is it feasible to store the application ID in 'project_manifest.json'?
    const applicationIdentifier = 'com.example.mobile.GulpApp';
    await cdvAPI.create(assemblyPath, applicationIdentifier, projectManifest.name, configurationOptions);

    // Subsequent Cordova commands must be executed from within the newly created project directory.
    process.chdir(assemblyPath);

    await cdvAPI.platform('add', environmentFolders);

    // CONSIDER: Exploring the third parameter, e.g., cli_variables etc.
    await cdvAPI.plugins('add', mobileExtensions);
});