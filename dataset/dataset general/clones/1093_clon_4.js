const fileSystem = require('node:fs');
const pathUtilities = require('node:path');
const fileScanner = require('glob');
const scriptMinifier = require('uglify-js');
const changeWatcher = require('chokidar');

// --- Internal Utilities ---

// Ensures the parent directory for a given file path exists.
function guaranteeDirectory(targetPath) {
    const parent = pathUtilities.dirname(targetPath);
    if (!fileSystem.existsSync(parent)) {
        fileSystem.mkdirSync(parent, { recursive: true });
    }
}

// Reads and parses the project manifest (package.json) to extract relevant details.
function acquireProjectMetadata() {
    const manifestLocation = pathUtilities.resolve(process.cwd(), 'package.json');
    const content = fileSystem.readFileSync(manifestLocation, 'utf8');
    const data = JSON.parse(content);
    const currentMoment = new Date().toISOString().substring(0, 10); // YYYY-MM-DD
    return {
        title: data.name,
        dateStamp: currentMoment
    };
}

// --- Core Build Operations ---

// Combines multiple JavaScript source files into a single output file.
function consolidateScripts(inputGlobPatterns, destinationFile) {
    console.log(`Initiating script consolidation into: ${destinationFile}`);
    guaranteeDirectory(destinationFile);
    let cumulativeContent = '';
    for (const pattern of inputGlobPatterns) {
        const foundFiles = fileScanner.globSync(pattern);
        for (const filePath of foundFiles) {
            cumulativeContent += fileSystem.readFileSync(filePath, 'utf8') + '\n';
        }
    }
    fileSystem.writeFileSync(destinationFile, cumulativeContent, 'utf8');
    console.log(`Script consolidation complete for: ${destinationFile}`);
}

// Minifies a given JavaScript file and prepends a custom header.
function compressAndAnnotateScript(sourcePath, minifiedOutputPath, preambleText) {
    console.log(`Initiating script compression for: ${sourcePath}`);
    guaranteeDirectory(minifiedOutputPath);
    const originalContent = fileSystem.readFileSync(sourcePath, 'utf8');
    const compressionOutcome = scriptMinifier.minify(originalContent, {
        output: {
            comments: "some",
            preamble: preambleText
        }
    });

    if (compressionOutcome.error) {
        console.error('Error during script compression:', compressionOutcome.error);
        throw compressionOutcome.error;
    }

    fileSystem.writeFileSync(minifiedOutputPath, compressionOutcome.code, 'utf8');
    console.log(`Script compression complete for: ${minifiedOutputPath}`);
}

// Sets up a file system watcher to trigger a callback function upon changes.
function establishFileMonitor(patternsForObservation, triggerAction) {
    console.log(`Activating file monitor for patterns: ${patternsForObservation.join(', ')}`);
    const observerInstance = changeWatcher.watch(patternsForObservation, { persistent: true });

    observerInstance.on('change', (changedPath) => {
        console.log(`File modification detected: ${changedPath}. Re-running associated action.`);
        triggerAction();
    });

    observerInstance.on('add', (addedPath) => {
        console.log(`New file detected: ${addedPath}. Re-running associated action.`);
        triggerAction();
    });

    observerInstance.on('unlink', (removedPath) => {
        console.log(`File removal detected: ${removedPath}. Re-running associated action.`);
        triggerAction();
    });
}

// --- Main Configuration Function ---
// This function acts as the entry point for defining build operations.
module.exports = function(orchestrator) { // 'orchestrator' replaces 'grunt'
    // Define key paths and filenames
    const ultimateDirectory = 'build';
    const primarySources = 'src';
    const supportLibraries = 'lib';
    const finalBundleName = 'maptastic.js';
    const minimizedBundleName = 'maptastic.min.js';

    const fullBundlePath = pathUtilities.join(ultimateDirectory, finalBundleName);
    const minifiedBundlePath = pathUtilities.join(ultimateDirectory, minimizedBundleName);

    // Retrieve project information for the banner
    const projectData = acquireProjectMetadata();
    const packageBanner = `/*! ${projectData.title} ${projectData.dateStamp} */\n`;

    // --- Define Task Routines ---

    // Routine for the complete build process (concat + uglify)
    function performComprehensiveBuild() {
        consolidateScripts(
            [pathUtilities.join(supportLibraries, '*.js'), pathUtilities.join(primarySources, '*.js')],
            fullBundlePath
        );
        compressAndAnnotateScript(fullBundlePath, minifiedBundlePath, packageBanner);
    }

    // Routine for development-only build (just concat)
    function conductDevelopmentBuild() {
        consolidateScripts(
            [pathUtilities.join(supportLibraries, '*.js'), pathUtilities.join(primarySources, '*.js')],
            fullBundlePath
        );
    }

    // Routine for watching files and triggering the comprehensive build
    function initiateDevelopmentWatch() {
        establishFileMonitor(
            [pathUtilities.join(primarySources, '*.js')],
            performComprehensiveBuild
        );
    }

    // --- Register Routines with the Orchestrator ---
    // This mimics grunt.registerTask
    orchestrator.registerOperation('fullCompilation', performComprehensiveBuild);
    orchestrator.registerOperation('developmentAssembly', conductDevelopmentBuild);
    orchestrator.registerOperation('observeCodebase', initiateDevelopmentWatch);

    // This mimics grunt.registerTask('default', ...)
    orchestrator.designateDefault('fullCompilation');
    // This mimics grunt.registerTask('dev', ...)
    orchestrator.designateAlias('dev', 'developmentAssembly');
};