const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// --- Configuration Registry ---
const assetLocations = {
    sourceRoot: 'src',
    sampleAppRoot: 'examples'
};

const artifactNames = {
    sourceCoffeeFile: 'jquery.openCarousel.coffee',
    mainPluginScript: 'jquery.openCarousel.js',
    minifiedPluginScript: 'jquery.openCarousel.min.js',
    pluginStylesheet: 'jquery.openCarousel.css',
    integrationTestScript: 'test/test.js'
};

const deletableArtifacts = [
    path.join(assetLocations.sourceRoot, artifactNames.mainPluginScript),
    path.join(assetLocations.sourceRoot, artifactNames.minifiedPluginScript),
    path.join(assetLocations.sampleAppRoot, 'addRemove', 'scripts', artifactNames.mainPluginScript),
    path.join(assetLocations.sampleAppRoot, 'cycle', 'scripts', artifactNames.mainPluginScript),
    path.join(assetLocations.sampleAppRoot, 'fullwidth', 'scripts', artifactNames.mainPluginScript),
    path.join(assetLocations.sampleAppRoot, 'responsive', 'scripts', artifactNames.mainPluginScript),
    path.join(assetLocations.sampleAppRoot, 'main', 'scripts', artifactNames.mainPluginScript),
    path.join(assetLocations.sampleAppRoot, 'vertical', 'scripts', artifactNames.mainPluginScript)
];

const stylesheetDistributionTargets = [
    path.join(assetLocations.sampleAppRoot, 'addRemove', 'styles'),
    path.join(assetLocations.sampleAppRoot, 'cycle', 'styles'),
    path.join(assetLocations.sampleAppRoot, 'fullwidth', 'styles'),
    path.join(assetLocations.sampleAppRoot, 'responsive', 'styles'),
    path.join(assetLocations.sampleAppRoot, 'main', 'styles'),
    path.join(assetLocations.sampleAppRoot, 'vertical', 'styles')
];

const scriptDistributionTargets = [
    path.join(assetLocations.sampleAppRoot, 'addRemove', 'scripts'),
    path.join(assetLocations.sampleAppRoot, 'cycle', 'scripts'),
    path.join(assetLocations.sampleAppRoot, 'fullwidth', 'scripts'),
    path.join(assetLocations.sampleAppRoot, 'responsive', 'scripts'),
    path.join(assetLocations.sampleAppRoot, 'main', 'scripts'),
    path.join(assetLocations.sampleAppRoot, 'vertical', 'scripts')
];

// --- Auxiliary Operations ---
function establishDirectory(targetPath) {
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
    }
}

function executeSystemCommand(operationDescription, commandString) {
    try {
        console.log(`Initiating ${operationDescription}...`);
        execSync(commandString, { stdio: 'inherit' });
        console.log(`${operationDescription} concluded.`);
    } catch (error) {
        console.error(`Failure during ${operationDescription}:`, error.message);
        process.exit(1);
    }
}

// --- Core Build Functions ---

function obliterateBuildOutputs() {
    console.log('Commencing build output obliteration...');
    for (const itemLocation of deletableArtifacts) {
        if (fs.existsSync(itemLocation)) {
            try {
                fs.unlinkSync(itemLocation);
                console.log(`Removed: ${itemLocation}`);
            } catch (error) {
                console.error(`Failed to remove ${itemLocation}:`, error.message);
            }
        }
    }
    console.log('Build output obliteration finalized.');
}

function transpileCoffeeSource() {
    const inputPath = path.join(assetLocations.sourceRoot, artifactNames.sourceCoffeeFile);
    executeSystemCommand(
        'CoffeeScript transpilation',
        `npx coffee -c "${inputPath}"`
    );
}

function minimizeApplicationScript() {
    const sourceFilePath = path.join(assetLocations.sourceRoot, artifactNames.mainPluginScript);
    const destinationFilePath = path.join(assetLocations.sourceRoot, artifactNames.minifiedPluginScript);
    executeSystemCommand(
        'JavaScript minimization',
        `npx uglifyjs "${sourceFilePath}" -o "${destinationFilePath}"`
    );
}

function deployApplicationResources() {
    console.log('Distributing application resources to sample applications...');

    const cssSource = path.join(assetLocations.sourceRoot, artifactNames.pluginStylesheet);
    for (const targetDirectory of stylesheetDistributionTargets) {
        establishDirectory(targetDirectory);
        const destination = path.join(targetDirectory, artifactNames.pluginStylesheet);
        fs.copyFileSync(cssSource, destination);
        console.log(`Copied CSS to: ${destination}`);
    }

    const jsSource = path.join(assetLocations.sourceRoot, artifactNames.mainPluginScript);
    for (const targetDirectory of scriptDistributionTargets) {
        establishDirectory(targetDirectory);
        const destination = path.join(targetDirectory, artifactNames.mainPluginScript);
        fs.copyFileSync(jsSource, destination);
        console.log(`Copied JS to: ${destination}`);
    }
    console.log('Application resource distribution completed.');
}

function executeUnitAndIntegrationValidations() {
    const validationScriptPath = artifactNames.integrationTestScript;
    executeSystemCommand(
        'System validation execution',
        `npx mocha "${validationScriptPath}" --reporter nyan`
    );
}

// --- Build Process Orchestration ---

const processSteps = {
    'clear_artifacts': obliterateBuildOutputs,
    'transpile_coffee': transpileCoffeeSource,
    'minimize_js': minimizeApplicationScript,
    'deploy_assets': deployApplicationResources,
    'run_validations': executeUnitAndIntegrationValidations
};

const processFlowDependencies = {
    'clear_artifacts': [],
    'transpile_coffee': ['clear_artifacts'],
    'minimize_js': ['clear_artifacts', 'transpile_coffee'],
    'deploy_assets': ['clear_artifacts', 'transpile_coffee', 'minimize_js'],
    'run_validations': ['clear_artifacts', 'transpile_coffee', 'minimize_js', 'deploy_assets'],
    'complete_build': ['clear_artifacts', 'transpile_coffee', 'minimize_js', 'deploy_assets', 'run_validations']
};

const completedProcesses = new Set();

function initiateProcess(processIdentifier) {
    if (!processSteps[processIdentifier]) {
        console.error(`Error: Unknown process identifier '${processIdentifier}'`);
        process.exit(1);
    }

    if (completedProcesses.has(processIdentifier)) {
        // console.log(`(Skipping already completed process: ${processIdentifier})`);
        return;
    }

    const prerequisites = processFlowDependencies[processIdentifier] || [];
    for (const prereqIdentifier of prerequisites) {
        initiateProcess(prereqIdentifier);
    }

    console.log(`\n--- Starting process: ${processIdentifier} ---`);
    processSteps[processIdentifier]();
    completedProcesses.add(processIdentifier);
    console.log(`--- Finished process: ${processIdentifier} ---\n`);
}

// --- Continuous Monitoring ---
function activateFileMonitoring() {
    const monitoredFile = path.join(assetLocations.sourceRoot, artifactNames.sourceCoffeeFile);
    console.log(`\nActivating continuous monitoring for: ${monitoredFile}`);
    fs.watch(monitoredFile, (event, filename) => {
        if (filename) {
            console.log(`\nDetected change in ${filename} (${event}). Triggering rebuild sequence...`);
            try {
                // Simulate the sequence of operations triggered by the original 'watch' task,
                // which would execute 'coffee' and 'copy' tasks along with their dependencies.
                obliterateBuildOutputs(); // Dependency of 'coffee' and 'copy'
                transpileCoffeeSource(); // The 'coffee' task itself
                minimizeApplicationScript(); // Dependency of 'copy'
                deployApplicationResources(); // The 'copy' task itself
                
                console.log('Rebuild sequence triggered by monitoring completed.');
            } catch (error) {
                console.error('Error during monitored rebuild:', error.message);
            }
        }
    });
}

// --- Execution Entry Point ---
const requestedOperation = process.argv[2] || 'complete_build'; // Default to full build

if (requestedOperation === 'monitor_source') { // Renamed from 'watch'
    activateFileMonitoring();
} else if (processSteps[requestedOperation] || requestedOperation === 'complete_build') {
    initiateProcess(requestedOperation);
} else {
    console.error(`Unrecognized operation requested: '${requestedOperation}'`);
    console.log('Available operations: ' + Object.keys(processSteps).concat(['complete_build', 'monitor_source']).join(', '));
    process.exit(1);
}