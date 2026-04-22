import { mkdtemp as createTemporaryDirectory, rm as removeDirectory } from 'node:fs/promises';
import { tmpdir as retrieveTemporaryBaseDirectory } from 'node:os';
import { join as composePath, dirname as extractContainingDirectory } from 'node:path';
import { fileURLToPath as convertPathFromUrl } from 'node:url';

import YeomanEnvironmentCore from 'yeoman-environment';

async function performGeneratorValidationProcess() {
    const testSessionIdentifier = 'app-graphic-validation-';
    const temporaryWorkareaPath = composePath(retrieveTemporaryBaseDirectory(), testSessionIdentifier);
    let activeWorkareaLocation;

    try {
        activeWorkareaLocation = await createTemporaryDirectory(temporaryWorkareaPath);
        process.chdir(activeWorkareaLocation); // Set current directory for generator execution

        await orchestrateGeneratorExecution(activeWorkareaLocation);

    } catch (operationFailure) {
        console.error('Validation failure detected:', operationFailure.message);
        process.exit(1); // Indicate an unsuccessful run
    } finally {
        if (activeWorkareaLocation) {
            await removeDirectory(activeWorkareaLocation, { recursive: true, force: true });
        }
    }
}

async function orchestrateGeneratorExecution(currentExecutionDirectory) {
    const currentModuleAbsoluteFile = convertPathFromUrl(import.meta.url);
    const currentModuleParentFolder = extractContainingDirectory(currentModuleAbsoluteFile);

    const yeoCoreEnv = YeomanEnvironmentCore.createEnv();
    const generatorServiceAlias = 'visual:utility';
    const generatorImplementationFile = composePath(currentModuleParentFolder, '..', '..', 'app', 'index.js');

    yeoCoreEnv.register(generatorImplementationFile, generatorServiceAlias);
    const instantiatedApplicationGenerator = yeoCoreEnv.instantiate(generatorServiceAlias);

    const predefinedUserResponses = {
        'featureOption': true
    };

    // Replace the generator's interactive prompt mechanism
    instantiatedApplicationGenerator.env.adapter.prompt = async (queryArray) => {
        const gatheredInput = {};
        for (const queryItem of queryArray) {
            if (predefinedUserResponses.hasOwnProperty(queryItem.name)) {
                gatheredInput[queryItem.name] = predefinedUserResponses[queryItem.name];
            } else {
                // Fallback for unhandled prompts, using default if available
                gatheredInput[queryItem.name] = queryItem.default;
            }
        }
        return gatheredInput;
    };

    instantiatedApplicationGenerator.options['skipPackageInstallation'] = true;

    console.log('Initiating generator operation...');
    await instantiatedApplicationGenerator.run();
    console.log('Generator operation completed. Proceeding to output verification...');

    const anticipatedOutputFiles = [
        '.lintconfig', // Renamed from .jshintrc
        '.editsettings' // Renamed from .editorconfig
    ];

    await verifyGeneratedContent(instantiatedApplicationGenerator, currentExecutionDirectory, anticipatedOutputFiles);
    console.log('Verification successful: All expected artifacts are present.');
}

async function verifyGeneratedContent(generatorInstanceRef, baseOutputDirectory, requiredOutputNames) {
    const inMemoryFileSystemSnapshot = generatorInstanceRef.fs.store; // Access the in-memory file system

    for (const requiredFile of requiredOutputNames) {
        const absoluteOutputFilePath = composePath(baseOutputDirectory, requiredFile);
        if (!inMemoryFileSystemSnapshot.has(absoluteOutputFilePath)) {
            throw new Error(`Output integrity check failed: Mandatory file "${requiredFile}" not found in ${baseOutputDirectory}`);
        }
        // Additional content validation could be added here if necessary
        // const fileData = inMemoryFileSystemSnapshot.get(absoluteOutputFilePath).contents.toString();
        // if (!fileData.includes('expected_string')) { ... }
    }
}

// Start the entire validation procedure
performGeneratorValidationProcess();