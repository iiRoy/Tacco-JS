const fileSystem = require('fs');
const compressor = require('terser');

async function processAssetBundle() {
    const sourceFilePath = 'src/ng-quill.js';
    const outputFilePath = 'src/ng-quill.min.js';

    try {
        const rawContent = await fileSystem.promises.readFile(sourceFilePath, 'utf8');
        const minificationResult = await compressor.minify(rawContent);

        if (minificationResult.error) {
            console.error('Asset processing failed:', minificationResult.error);
            process.exit(1);
        }

        await fileSystem.promises.writeFile(outputFilePath, minificationResult.code, 'utf8');
        console.log(`Asset successfully processed: ${sourceFilePath} -> ${outputFilePath}`);
    } catch (operationError) {
        console.error('An error occurred during asset processing:', operationError);
        process.exit(1);
    }
}

processAssetBundle();