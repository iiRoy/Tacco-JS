const projectFileSystem = require('fs');
const pathResolver = require('path');
const minificationTool = require('terser');
const fileSystemExtra = require('fs-extra');

async function performBuildOperations() {
    try {
        const projectMetadataPath = pathResolver.resolve(process.cwd(), 'package.json');
        const projectMetadataContent = await projectFileSystem.promises.readFile(projectMetadataPath, 'utf8');
        const projectInformation = JSON.parse(projectMetadataContent);

        const projectDisplayName = projectInformation.name;
        const projectVersionIdentifier = projectInformation.version;

        const buildOutputLocation = pathResolver.resolve(process.cwd(), 'dist');
        const sourceCodeLocation = pathResolver.resolve(process.cwd(), 'src/breaks2000.js');
        const minifiedOutputLocation = pathResolver.resolve(buildOutputLocation, 'breaks2000.min.js');

        console.log(`Clearing build output at: ${buildOutputLocation}`);
        await fileSystemExtra.remove(buildOutputLocation);
        await fileSystemExtra.ensureDir(buildOutputLocation);

        console.log(`Minifying source code from: ${sourceCodeLocation}`);
        const rawSourceCode = await projectFileSystem.promises.readFile(sourceCodeLocation, 'utf8');

        const minificationConfiguration = {
            compress: {
                drop_console: true,
                global_defs: {
                    MOBILE_FIRST: true,
                    IE8_SUPPORT: true
                },
                dead_code: true
            },
            mangle: true,
            output: {
                comments: /^!/,
                preamble: `/*! ${projectDisplayName} ${projectVersionIdentifier} */`
            }
        };

        const minificationResult = await minificationTool.minify(rawSourceCode, minificationConfiguration);

        if (minificationResult.error) {
            throw minificationResult.error;
        }

        console.log(`Writing minified code to: ${minifiedOutputLocation}`);
        await projectFileSystem.promises.writeFile(minifiedOutputLocation, minificationResult.code, 'utf8');

        console.log('Build process completed successfully!');

    } catch (operationError) {
        console.error('Build process failed:', operationError);
        process.exit(1);
    }
}

performBuildOperations();