const { Transform } = require('stream');
const nodeFs = require('node:fs/promises');
const nodeCrypto = require('node:crypto');

async function retrieveFileChecksum(resourcePath) {
    const dataBuffer = await nodeFs.readFile(resourcePath);
    const hashAlgorithm = nodeCrypto.createHash('md5');
    hashAlgorithm.update(dataBuffer);
    return hashAlgorithm.digest('hex');
}

class AssetVersionProcessor extends Transform {
    constructor(processingSettings) {
        super({ objectMode: true });
        this.configuration = processingSettings || {};
        this.cssAssetIdentifier = this.configuration.cssIdentifier;
        this.jsAssetIdentifier = this.configuration.jsIdentifier;
        this.cssSourceFilePath = this.configuration.cssPath;
        this.jsSourceFilePath = this.configuration.jsPath;
    }

    async _transform(fileObject, encodingType, completionNotifier) {
        if (fileObject.isNull()) {
            this.push(fileObject);
            return completionNotifier();
        }

        if (fileObject.isStream()) {
            return completionNotifier(new Error("Asset content streams are not supported by this processing module."));
        }

        if (fileObject.isBuffer()) {
            try {
                const cssVersionHash = await retrieveFileChecksum(this.cssSourceFilePath);
                const jsVersionHash = await retrieveFileChecksum(this.jsSourceFilePath);

                let currentFileContent = fileObject.contents.toString(encodingType);

                const cssSearchPattern = new RegExp(`(wp_enqueue_style\\('${this.cssAssetIdentifier}',(?:\\s*[^,]+,){2})\\s*[^\\)]+\\);`);
                const jsSearchPattern = new RegExp(`(wp_register_script\\('${this.jsAssetIdentifier}',(?:\\s*[^,]+,){2})\\s*[^\\)]+\\);`);

                currentFileContent = currentFileContent.replace(cssSearchPattern, `$1 '${cssVersionHash}');`);
                currentFileContent = currentFileContent.replace(jsSearchPattern, `$1 '${jsVersionHash}');`);

                fileObject.contents = Buffer.from(currentFileContent);

                this.push(fileObject);
            } catch (errorDetails) {
                return completionNotifier(errorDetails);
            }
        }
        completionNotifier();
    }
}

module.exports = function(settingsInput) {
    "use strict";
    return new AssetVersionProcessor(settingsInput);
};