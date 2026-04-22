const utilityPath = require('path');
const fileSystem = require('fs');
const coreEngine = require('cordova-lib');
const engineInterface = coreEngine.cordova.raw;

const projectConfiguration = require('./package.json');

// Global configuration constants for the build process
const buildArtifactPath = utilityPath.join(__dirname, 'build');
const sourceApplicationRoot = utilityPath.join(__dirname, 'src');
const requiredModules = ['org.apache.cordova.file'];
const currentSimulationTarget = 'android';

// Discover platform components based on package.json dependencies
const availablePlatforms = [];
const platformModuleLocations = [];

Object.entries(coreEngine.cordova_platforms).forEach(([platformKey]) => {
    const platformName = `cordova-${platformKey}`;
    if (projectConfiguration.dependencies[platformName]) {
        availablePlatforms.push(platformName);
        platformModuleLocations.push(utilityPath.join(__dirname, 'node_modules', platformName));
    }
});

// Utility function to execute cordova-lib actions within the build directory
async function performEngineAction(actionFunction, ...actionArgs) {
    const originalWorkingDir = process.cwd();
    try {
        process.chdir(buildArtifactPath);
        await actionFunction(...actionArgs);
    } finally {
        process.chdir(originalWorkingDir);
    }
}

// Operation functions (replacing individual Gulp tasks)

async function cleanArtifacts() {
    console.log('Initiating removal of build artifacts...');
    await fileSystem.promises.rm(buildArtifactPath, { recursive: true, force: true }).catch(err => {
        if (err.code !== 'ENOENT') { // Ignore "No such file or directory" error
            throw err;
        }
    });
    console.log('Build artifacts cleared.');
}

async function prepareProject() {
    console.log('Commencing project preparation...');
    await performEngineAction(engineInterface.prepare);
    console.log('Project preparation complete.');
}

async function constructApplication() {
    console.log('Executing application build process...');
    await performEngineAction(engineInterface.build);
    console.log('Application build finished.');
}

async function launchOnDevice() {
    console.log(`Deploying and running on device for: ${currentSimulationTarget}...`);
    await performEngineAction(engineInterface.run, { platforms: [currentSimulationTarget], options: ['--device'] });
    console.log('Application deployed and launched on device.');
}

async function simulateDevice() {
    console.log(`Initiating emulation for platform: ${currentSimulationTarget}...`);
    await performEngineAction(engineInterface.emulate, { platforms: [currentSimulationTarget] });
    console.log('Application emulation complete.');
}

async function generateRelease() {
    console.log('Generating production-ready release build...');
    await performEngineAction(engineInterface.build, { options: ['--release'] });
    console.log('Release build successfully generated.');
}

async function establishProject() {
    console.log('Setting up new project structure from source...');
    await cleanArtifacts(); // Ensure a clean slate

    await fileSystem.promises.mkdir(buildArtifactPath, { recursive: true });

    // Copying source files instead of symlinking for a different approach
    console.log('Copying application configuration and web assets...');
    await fileSystem.promises.copyFile(
        utilityPath.join(sourceApplicationRoot, 'config.xml'),
        utilityPath.join(buildArtifactPath, 'config.xml')
    );
    await fileSystem.promises.cp(
        utilityPath.join(sourceApplicationRoot, 'www'),
        utilityPath.join(buildArtifactPath, 'www'),
        { recursive: true }
    );
    console.log('Configuration and web assets copied.');

    console.log('Incorporating necessary plugins...');
    await performEngineAction(engineInterface.plugins, 'add', requiredModules);
    console.log('Plugins integrated.');

    console.log('Integrating platform components...');
    await performEngineAction(engineInterface.platform, 'add', platformModuleLocations);
    console.log('Platform components integrated.');
    console.log('New project structure successfully established.');
}

async function createFreshProject() {
    console.log('Creating a fresh Cordova project using cordova-lib create...');
    await cleanArtifacts();

    const applicationIdentifier = 'com.alternative.app.builder';
    const applicationDisplayName = projectConfiguration.name + 'Alternative';
    const creationOptions = { lib: { www: { uri: sourceApplicationRoot, url: sourceApplicationRoot, link: true } } };

    await engineInterface.create(buildArtifactPath, applicationIdentifier, applicationDisplayName, creationOptions);

    // Subsequent cordova-lib commands must be run from inside the project directory
    const initialLocation = process.cwd();
    try {
        process.chdir(buildArtifactPath);
        console.log('Adding platform components to fresh project...');
        await engineInterface.platform('add', platformModuleLocations);
        console.log('Adding required plugins to fresh project...');
        await engineInterface.plugins('add', requiredModules);
    } finally {
        process.chdir(initialLocation);
    }
    console.log('Fresh project creation and setup complete.');
}


// Main command dispatcher
async function processCommand(commandIdentifier) {
    switch (commandIdentifier) {
        case 'eradicate':
            await cleanArtifacts();
            break;
        case 'prime':
            await prepareProject();
            break;
        case 'construct':
            await constructApplication();
            break;
        case 'deploy':
            await launchOnDevice();
            break;
        case 'mimic':
            await simulateDevice();
            break;
        case 'finalise':
            await generateRelease();
            break;
        case 'initiate':
            await establishProject();
            break;
        case 'forge':
            await createFreshProject();
            break;
        default:
            console.log(`Unrecognized command: ${commandIdentifier}`);
            console.log('Supported commands: eradicate, prime, construct, deploy, mimic, finalise, initiate, forge');
            process.exit(1);
    }
}

// Execute command based on command-line argument
const requestedCommand = process.argv[2];

if (requestedCommand) {
    processCommand(requestedCommand).catch(err => {
        console.error('Command execution failed:', err);
        process.exit(1);
    });
} else {
    console.log('No command specified.');
    console.log('Usage: node your_script_name.js <command>');
    console.log('Supported commands: eradicate, prime, construct, deploy, mimic, finalise, initiate, forge');
    process.exit(1);
}