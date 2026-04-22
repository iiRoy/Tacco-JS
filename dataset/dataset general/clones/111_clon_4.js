const fileSystem = require('fs');
const pathUtility = require('path');
const codeMinifier = require('uglify-js');
const syntaxChecker = require('jshint');

const primarySourceFile = 'src/Please.js';
const destinationFolder = 'dist';
const configurationManifests = ['./bower.json', './component.json', './package.json'];

function ensureDirectoryExists(directoryPath) {
    if (!fileSystem.existsSync(directoryPath)) {
        fileSystem.mkdirSync(directoryPath, { recursive: true });
    }
}

function processSourceCompression() {
    ensureDirectoryExists(destinationFolder);
    const originalContent = fileSystem.readFileSync(primarySourceFile, 'utf8');
    const compressionSettings = {
        output: {
            comments: 'some'
        }
    };
    const compressionResult = codeMinifier.minify(originalContent, compressionSettings);

    if (compressionResult.error) {
        console.error('Minification Failure:', compressionResult.error);
        process.exit(1);
    }

    const outputLocation = pathUtility.join(destinationFolder, pathUtility.basename(primarySourceFile));
    fileSystem.writeFileSync(outputLocation, compressionResult.code, 'utf8');
    console.log(`Source compressed and saved to ${outputLocation}`);
}

function performSyntaxValidation() {
    const originalContent = fileSystem.readFileSync(primarySourceFile, 'utf8');

    const validationOptions = {
        esversion: 5,
        undef: true,
        unused: true,
        browser: true,
        node: true,
        devel: true
    };

    const globalSymbols = {};

    if (!syntaxChecker.JSHINT(originalContent, validationOptions, globalSymbols)) {
        console.log('--- Syntax Validation Report ---');
        syntaxChecker.JSHINT.errors.forEach(function(issue) {
            if (issue) {
                console.log(`Line ${issue.line}, Column ${issue.character}: ${issue.reason} (${issue.code})`);
                if (issue.evidence) {
                    console.log(`  ${issue.evidence.trim()}`);
                }
            }
        });
        console.log('--- End Report ---');
        process.exit(1);
    } else {
        console.log('Syntax validation passed. No issues detected.');
    }
}

function advanceVersionNumber(currentNumber, incrementKind) {
    let [majorComponent, minorComponent, patchComponent] = currentNumber.split('.').map(Number);

    switch (incrementKind) {
        case 'major':
            majorComponent++;
            minorComponent = 0;
            patchComponent = 0;
            break;
        case 'minor':
            minorComponent++;
            patchComponent = 0;
            break;
        case 'patch':
            patchComponent++;
            break;
        default:
            throw new Error(`Unsupported increment type: ${incrementKind}`);
    }
    return `${majorComponent}.${minorComponent}.${patchComponent}`;
}

function updateProjectManifests(updateKind) {
    configurationManifests.forEach(manifestLocation => {
        try {
            const manifestText = fileSystem.readFileSync(manifestLocation, 'utf8');
            const manifestData = JSON.parse(manifestText);

            if (manifestData.version) {
                const newVersionIdentifier = advanceVersionNumber(manifestData.version, updateKind);
                manifestData.version = newVersionIdentifier;
                fileSystem.writeFileSync(manifestLocation, JSON.stringify(manifestData, null, 2), 'utf8');
                console.log(`Updated ${manifestLocation} to version ${newVersionIdentifier}`);
            } else {
                console.warn(`No 'version' field found in ${manifestLocation}. Skipping update.`);
            }
        } catch (error) {
            console.error(`Error processing ${manifestLocation}:`, error.message);
            process.exit(1);
        }
    });
}

/*
// Function to monitor files for changes (original was commented out)
function initiateFileWatcher() {
    console.log(`Monitoring ${primarySourceFile} for modifications...`);
    fileSystem.watch(primarySourceFile, (eventTrigger, changedFilename) => {
        if (eventTrigger === 'change') {
            console.log(`Modification detected in ${changedFilename}. Recompressing...`);
            processSourceCompression();
        }
    });
}
*/

function executeInitialOperations() {
    console.log('Initiating standard build processes...');
    processSourceCompression();
    performSyntaxValidation();
    console.log('Standard build processes completed.');
}

function orchestrateOperations() {
    const requestedOperation = process.argv[2];

    switch (requestedOperation) {
        case 'compress':
            processSourceCompression();
            break;
        case 'validate':
            performSyntaxValidation();
            break;
        case 'promote-major':
            updateProjectManifests('major');
            break;
        case 'promote-minor':
            updateProjectManifests('minor');
            break;
        case 'promote-patch':
            updateProjectManifests('patch');
            break;
        // case 'observe': // If watcher was uncommented
        //     initiateFileWatcher();
        //     break;
        case 'bootstrap':
        case undefined:
            executeInitialOperations();
            break;
        default:
            console.log(`Unrecognized command: "${requestedOperation}"`);
            console.log('Available commands: compress, validate, promote-major, promote-minor, promote-patch, bootstrap');
            process.exit(1);
    }
}

orchestrateOperations();