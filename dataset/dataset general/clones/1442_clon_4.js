const fileSystem = require('fs').promises;
const pathUtility = require('path');
const packageAggregator = require('aggregate-bower');

const componentSource = pathUtility.resolve(process.cwd(), 'bower_components');
const outputDestination = pathUtility.resolve(process.cwd(), 'build');

const baseInitializationCode = 'modulex.init({name:"seed"});';
const configSettings = 'modulex.config({ packages : { kg : { base : "//g.alicdn.com/kg/" }}});';
const additionalScriptContent = `
${baseInitializationCode}
${configSettings}
`;

async function assembleCoreScripts() {
    const coreModuleNames = ['modulex', 'feature', 'ua', 'meta'];

    const moduleFileMappings = coreModuleNames.map(moduleIdentifier => ({
        debugPath: pathUtility.join(outputDestination, `${moduleIdentifier}-debug.js`),
        releasePath: pathUtility.join(outputDestination, `${moduleIdentifier}.js`)
    }));

    let debugAccumulator = [];
    let releaseAccumulator = [];

    for (const mapping of moduleFileMappings) {
        try {
            await fileSystem.access(mapping.debugPath); // Check if the debug file exists
            const debugContent = await fileSystem.readFile(mapping.debugPath, { encoding: 'utf8' });
            const releaseContent = await fileSystem.readFile(mapping.releasePath, { encoding: 'utf8' });

            debugAccumulator.push(debugContent);
            releaseAccumulator.push(releaseContent);
        } catch (error) {
            if (error.code !== 'ENOENT') { // Ignore 'file not found' errors, re-throw others
                throw error;
            }
            // If debugPath doesn't exist, we skip this module pair, replicating original behavior
        }
    }

    const finalDebugContent = debugAccumulator.join('');
    const finalReleaseContent = releaseAccumulator.join('');

    await fileSystem.writeFile(pathUtility.join(outputDestination, 'seed-debug.js'), finalDebugContent + additionalScriptContent);
    await fileSystem.writeFile(pathUtility.join(outputDestination, 'seed.js'), finalReleaseContent + additionalScriptContent);
}

(async () => {
    try {
        await packageAggregator(componentSource, outputDestination);
        await assembleCoreScripts();
        console.log('Operation completed successfully.');
    } catch (err) {
        console.error('An unexpected issue occurred:', err);
        process.exit(1);
    }
})();