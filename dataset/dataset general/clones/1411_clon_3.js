/*

  An experimental Gulp build orchestration file for managing a basic
  Cordova-based application. This system directly leverages `cordova-lib`
  instead of relying on the `cordova-cli` for core operations.

  The Cordova project is established within the `./build/` directory,
  which is treated as a generated artifact.
  `gulp purgeBuildArtifacts` will remove this temporary build directory.
  `gulp provisionProject` or `gulp scaffoldProject` will set it up from scratch.

*/


/////// CONFIGURATION SETTINGS ////////////

// List of Cordova plugins that should be installed.
// Note: Plugins are typically published to the Cordova plugin registry, not npm,
// and often don't declare their dependencies cleanly, especially platform-specific ones.
const activePlugins = [
  'cordova-plugin-file', // Renamed from org.apache.cordova.file
  'cordova-plugin-device' // Added a new plugin
];

// The operating system target for running or emulating the application.
// Can be 'ios', 'android', 'browser', etc.
const targetDeviceOS = 'android';


const pathModule = require('path');
const fsExtra = require('fs-extra'); // Using fs-extra for more robust file operations
const delUtility = require('del');

const appPackage = require('./package.json');
const gulpOrchestrator = require('gulp');
const jsLinter = require('gulp-jshint');
const cordovaCore = require('cordova-lib');
const rawCordovaAPI = cordovaCore.cordova.raw;
const outputBasePath = pathModule.join(__dirname, 'build');
const distributionPath = pathModule.join(__dirname, 'dist'); // New: for release artifacts


// Discover platforms based on `package.json` dependencies.
// This allows npm to manage platform versions and downloads.
let installedPlatforms = [];  // e.g., ['cordova-ios', 'cordova-android']
let platformModulePaths = []; // Subdirectories in `node_modules` where platform files reside

if (!appPackage.dependencies) {
    console.warn("Warning: No 'dependencies' found in package.json. Cannot detect Cordova platforms.");
} else {
    for (const platformKey in cordovaCore.cordova_platforms) {
        const fullPlatformName = `cordova-${platformKey}`;
        if (appPackage.dependencies[fullPlatformName]) {
            const modulePath = pathModule.join(__dirname, 'node_modules', fullPlatformName);
            if (fsExtra.existsSync(modulePath)) {
                installedPlatforms.push(fullPlatformName);
                platformModulePaths.push(modulePath);
            } else {
                console.error(`Error: Expected platform module "${fullPlatformName}" at "${modulePath}" but it was not found. Please run "npm install".`);
                process.exit(1); // Exit if critical dependency is missing
            }
        }
    }
}

// Helper to change directory and execute a Cordova command
async function runCordovaCommandInBuildDir(commandFn, args = []) {
    if (!fsExtra.existsSync(outputBasePath)) {
        throw new Error(`Build directory "${outputBasePath}" does not exist. Please run a project creation task first (e.g., 'gulp provisionProject').`);
    }
    const originalCwd = process.cwd();
    try {
        process.chdir(outputBasePath);
        console.log(`Executing Cordova command in: ${outputBasePath}`);
        await commandFn(...args);
        console.log(`Cordova command completed successfully.`);
    } catch (err) {
        console.error(`Cordova command failed: ${err.message}`);
        throw err; // Re-throw to propagate the error
    } finally {
        process.chdir(originalCwd); // Always revert to original CWD
    }
}


//////////////////////// GULP AUTOMATION TASKS /////////////////////////////

// All `cordova-lib` invocations (excluding `cordova create`) must originate
// from within the Cordova project directory. This is because `cordova-lib`
// typically infers the project root from `process.cwd()` in its internal utilities.

// Default task to provide guidance
gulpOrchestrator.task('default', gulpOrchestrator.series('lintScripts', async () => {
    console.log(`
    -----------------------------------------------------
    Gulp Cordova Workflow - Available Commands:
    -----------------------------------------------------
    gulp lintScripts        : Checks JavaScript code quality.
    gulp purgeBuildArtifacts: Removes the 'build' directory.
    gulp provisionProject   : Creates build/ using file copying (links in original).
    gulp scaffoldProject    : Creates build/ using 'cordova create' command.
    gulp stageAssets        : Prepares the app assets for platform builds.
    gulp compileApp         : Builds the app for all configured platforms.
    gulp deployAndRun       : Deploys and runs the app on a connected device.
    gulp simulateDevice     : Emulates the app on a virtual device.
    gulp packageRelease     : Builds a release version and moves artifacts.
    -----------------------------------------------------
    `);
}));


// Task for static analysis of JavaScript source files
gulpOrchestrator.task('lintScripts', () => {
    console.log('Initiating JavaScript linting...');
    return gulpOrchestrator.src('./src/www/js/**/*.js') // More specific glob
        .pipe(jsLinter())
        .pipe(jsLinter.reporter('default'))
        .pipe(jsLinter.reporter('fail')) // Fail the build if linting issues are found
        .on('end', () => console.log('JavaScript linting complete.'));
});

// Task to remove the entire build directory
gulpOrchestrator.task('purgeBuildArtifacts', async () => {
    console.log('Cleaning up build artifacts...');
    try {
        const deletedPaths = await delUtility([outputBasePath]);
        console.log('Deleted files and directories:\n', deletedPaths.join('\n'));
        console.log('Build directory purged.');
    } catch (err) {
        console.error(`Error during build cleanup: ${err.message}`);
        throw err;
    }
});

// Task to prepare the application assets for platform builds
gulpOrchestrator.task('stageAssets', async () => {
    console.log('Staging application assets...');
    await runCordovaCommandInBuildDir(rawCordovaAPI.prepare);
    console.log('Assets staged successfully.');
});

// Task to compile the application for all specified platforms
gulpOrchestrator.task('compileApp', async () => {
    console.log('Compiling the application...');
    await runCordovaCommandInBuildDir(rawCordovaAPI.build);
    console.log('Application compilation complete.');
});

// Task to run the application on a physical device
gulpOrchestrator.task('deployAndRun', async () => {
    console.log(`Attempting to run app on device for platform: ${targetDeviceOS}`);
    await runCordovaCommandInBuildDir(rawCordovaAPI.run, [{ platforms: [targetDeviceOS], options: ['--device', '--buildConfig=build.json'] }]); // Added buildConfig option
    console.log('Application deployed and running on device.');
});

// Task to emulate the application on a virtual device
gulpOrchestrator.task('simulateDevice', async () => {
    console.log(`Attempting to emulate app for platform: ${targetDeviceOS}`);
    await runCordovaCommandInBuildDir(rawCordovaAPI.emulate, [{ platforms: [targetDeviceOS], options: ['--target=pixel_xl'] }]); // Added a specific target
    console.log('Application emulated on virtual device.');
});

// Task to build a release version of the application and move artifacts
gulpOrchestrator.task('packageRelease', async () => {
    console.log('Building release version of the application...');
    await runCordovaCommandInBuildDir(rawCordovaAPI.build, [{ options: ['--release', '--buildConfig=build.json'] }]);

    // New: Copy release artifacts to a 'dist' folder
    console.log('Copying release artifacts to distribution folder...');
    const platformSpecificReleaseDir = pathModule.join(outputBasePath, 'platforms', targetDeviceOS, 'app', 'build', 'outputs', 'apk', 'release'); // Example for Android
    const targetDistDir = pathModule.join(distributionPath, targetDeviceOS);

    if (fsExtra.existsSync(platformSpecificReleaseDir)) {
        await fsExtra.ensureDir(targetDistDir);
        await fsExtra.copy(platformSpecificReleaseDir, targetDistDir);
        console.log(`Release artifacts copied from ${platformSpecificReleaseDir} to ${targetDistDir}`);
    } else {
        console.warn(`Warning: Could not find release output directory for ${targetDeviceOS} at ${platformSpecificReleaseDir}. Skipping artifact copy.`);
    }
    console.log('Release packaging complete.');
});


// Task to create the Cordova project by copying source files
// This version avoids `cordova create` and directly sets up the project structure.
gulpOrchestrator.task('provisionProject', gulpOrchestrator.series('purgeBuildArtifacts', async () => {
    console.log('Provisioning new Cordova project by copying sources...');
    const sourceApplicationDir = pathModule.join(__dirname, 'src');

    if (!fsExtra.existsSync(sourceApplicationDir)) {
        throw new Error(`Source application directory "${sourceApplicationDir}" does not exist.`);
    }

    await fsExtra.ensureDir(outputBasePath); // Ensures build directory exists
    process.chdir(outputBasePath); // Change to build directory for Cordova operations

    // Copy config.xml and www directory instead of symlinking
    await fsExtra.copy(pathModule.join(sourceApplicationDir, 'config.xml'), 'config.xml');
    await fsExtra.copy(pathModule.join(sourceApplicationDir, 'www'), 'www');
    console.log('Copied config.xml and www directory.');
    // This approach is useful when you have pre-processing (SASS, CoffeeScript)
    // and want a clean separation of source and build output.

    // Must add plugins first, then platforms. If platforms are added first,
    // Cordova might expect the `./build/plugins` directory to exist prematurely.
    // TODO: Explore the 3rd parameter {cli_variables: {...}} for plugins.
    console.log(`Adding plugins: ${activePlugins.join(', ')}`);
    await rawCordovaAPI.plugins('add', activePlugins);

    console.log(`Adding platforms: ${platformModulePaths.join(', ')}`);
    await rawCordovaAPI.platform('add', platformModulePaths);

    console.log('Project provisioning complete. Reverting CWD.');
    process.chdir(__dirname); // Revert CWD
}));


// Alternative task to create the Cordova project using `cordova create`
gulpOrchestrator.task('scaffoldProject', gulpOrchestrator.series('purgeBuildArtifacts', async () => {
    console.log('Scaffolding new Cordova project using `cordova create`...');
    const sourceApplicationRoot = pathModule.join(__dirname, 'src');

    // Configuration object for cordova create. The 'link: true' option
    // makes cordova create symlink the www directory, which is efficient.
    const creationConfig = {
        lib: {
            www: { uri: sourceApplicationRoot, url: sourceApplicationRoot, link: true }
        }
    };

    // Application identifier. Can be customized or pulled from package.json if available.
    const applicationIdentifier = 'com.example.myawesomeapp'; // Hardcoded for clone
    const applicationName = appPackage.name || 'MyAwesomeApp'; // Fallback name

    // Execute cordova create command
    await rawCordovaAPI.create(outputBasePath, applicationIdentifier, applicationName, creationConfig);
    console.log(`Cordova project scaffolded at: ${outputBasePath}`);

    // Further Cordova commands must be executed within the project directory.
    const originalCwd = process.cwd();
    try {
        process.chdir(outputBasePath);
        console.log('Changed directory to project root for further commands.');

        // Add platforms
        console.log(`Adding platforms: ${platformModulePaths.join(', ')}`);
        await rawCordovaAPI.platform('add', platformModulePaths);

        // Add plugins
        console.log(`Adding plugins: ${activePlugins.join(', ')}`);
        await rawCordovaAPI.plugins('add', activePlugins);

        console.log('Project scaffolding complete.');
    } catch (err) {
        console.error(`Error during project scaffolding: ${err.message}`);
        throw err;
    } finally {
        process.chdir(originalCwd); // Always revert to original CWD
    }
}));