const fileSystem = require('fs').promises;
const scriptCompressor = require('terser');
const pathUtility = require('path');

module.exports = async function() {
    const primarySourceFile = 'src/js/howler.js';
    const secondarySourceFile = 'src/js/sosv.js';
    const intermediateMinifiedBundle = 'src/js/sosv.min.js';
    const finalDistributionLocation = 'build/sosv.min.js';
    const descriptionFilePath = 'package.json';

    let currentProjectDescription;
    try {
        const rawDescriptor = await fileSystem.readFile(descriptionFilePath, 'utf8');
        currentProjectDescription = JSON.parse(rawDescriptor);
    } catch (errorReadingDescriptor) {
        console.error('Error acquiring project manifest:', errorReadingDescriptor.message);
        process.exit(1);
    }

    try {
        const contentOfFirst = await fileSystem.readFile(primarySourceFile, 'utf8');
        const contentOfSecond = await fileSystem.readFile(secondarySourceFile, 'utf8');
        const concatenatedPayload = contentOfFirst + '\n' + contentOfSecond;

        const compressionOutcome = await scriptCompressor.minify(concatenatedPayload, {
            // Terser options can be configured here if necessary
        });

        if (compressionOutcome.error) {
            throw compressionOutcome.error;
        }

        await fileSystem.mkdir(pathUtility.dirname(intermediateMinifiedBundle), { recursive: true });
        await fileSystem.writeFile(intermediateMinifiedBundle, compressionOutcome.code, 'utf8');
    } catch (errorDuringCompression) {
        console.error('Script optimization process failed:', errorDuringCompression.message);
        process.exit(1);
    }

    try {
        await fileSystem.mkdir(pathUtility.dirname(finalDistributionLocation), { recursive: true });
        await fileSystem.copyFile(intermediateMinifiedBundle, finalDistributionLocation);
    } catch (errorDuringTransfer) {
        console.error('Minified artifact transfer failed:', errorDuringTransfer.message);
        process.exit(1);
    }
};