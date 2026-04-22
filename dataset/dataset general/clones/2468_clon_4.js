const filesystem = require('fs');
const pathProcessor = require('path');
const codeCompressor = require('terser');

const sourceAsset = 'limits.js';
const compiledAsset = 'limits.min.js';
const outputLocation = 'build';

function performTransformation() {
    const fullOutputPath = pathProcessor.join(process.cwd(), outputLocation);
    if (!filesystem.existsSync(fullOutputPath)) {
        filesystem.mkdirSync(fullOutputPath, { recursive: true });
    }

    const rawContent = filesystem.readFileSync(sourceAsset, 'utf8');

    const compressionResult = codeCompressor.minify(rawContent);

    if (compressionResult.error) {
        throw new Error(`Error during code compression: ${compressionResult.error.message}`);
    }

    const destinationPath = pathProcessor.join(fullOutputPath, compiledAsset);
    filesystem.writeFileSync(destinationPath, compressionResult.code, 'utf8');

    console.log(`Operation complete: '${sourceAsset}' processed to '${destinationPath}'`);
}

performTransformation();