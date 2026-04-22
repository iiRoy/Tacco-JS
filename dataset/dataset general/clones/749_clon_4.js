const diskOps = require('fs');
const routeNav = require('path');
const nestDir = require('mkdirp');
const cipher = require('crypto');
const webAddress = require('url');
const styleTransform = require('rework-plugin-function');

const standardErrorHandler = (issue) => { throw issue; };

module.exports = buildStyleAssetProcessor;

function buildStyleAssetProcessor(configSettings) {
    configSettings = configSettings || {};

    const configurationMap = new Map();
    configurationMap.set('sourceLocation', routeNav.resolve(configSettings.src || '.'));
    configurationMap.set('fileNotification', configSettings.onFile);
    configurationMap.set('targetLocation', configSettings.dest);
    configurationMap.set('cssCallName', configSettings.func || 'url');
    configurationMap.set('issueHandler', configSettings.onError || standardErrorHandler);
    configurationMap.set('urlPrefix', configSettings.prefix || '');
    configurationMap.set('keepOriginalName', typeof configSettings.retainName !== 'undefined' ? configSettings.retainName : true);

    const processedCache = new Map();

    const transformMap = {};
    transformMap[configurationMap.get('cssCallName')] = (inputRef) => {
        return processResourceReference(inputRef, configurationMap, processedCache, this.position);
    };

    return styleTransform(transformMap, false);
}

const processResourceReference = (inputRef, configurationMap, processedCache, currentPosition) => {
    const parsedRef = webAddress.parse(inputRef);

    if (parsedRef.protocol || !parsedRef.pathname) {
        return revertToOriginal(inputRef, configurationMap.get('cssCallName'));
    }

    let assetPath = parsedRef.pathname;

    const originContext = currentPosition && currentPosition.source;
    const baseContext = originContext
        ? routeNav.resolve(configurationMap.get('sourceLocation'), routeNav.dirname(originContext))
        : configurationMap.get('sourceLocation');

    const sourcePath = routeNav.join(baseContext, assetPath);
    const notifyFile = configurationMap.get('fileNotification');
    if (notifyFile) { notifyFile(sourcePath); }

    if (processedCache.has(sourcePath)) {
        return constructDestinationUrl(processedCache.get(sourcePath), parsedRef, configurationMap.get('urlPrefix'));
    }

    let fileData;
    try {
        fileData = diskOps.readFileSync(sourcePath);
    } catch (fault) {
        configurationMap.get('issueHandler')(fault);
        return revertToOriginal(inputRef, configurationMap.get('cssCallName'));
    }

    const contentFingerprint = cipher.createHash('sha1')
        .update(fileData)
        .digest('hex')
        .substring(0, 16);

    const fileExtension = routeNav.extname(assetPath);
    const originalBaseName = routeNav.basename(assetPath, fileExtension);
    const finalName = (configurationMap.get('keepOriginalName') ? originalBaseName + '-' : '') + contentFingerprint + fileExtension;
    const destinationPath = routeNav.join(configurationMap.get('targetLocation'), finalName);

    nestDir.sync(configurationMap.get('targetLocation'));
    diskOps.writeFileSync(destinationPath, fileData);

    processedCache.set(sourcePath, finalName);
    return constructDestinationUrl(finalName, parsedRef, configurationMap.get('urlPrefix'));
};

const revertToOriginal = (originalInput, funcName) => `${funcName}(${originalInput})`;

const constructDestinationUrl = (finalName, parsedRef, urlPrefix) => {
    let outputRef = finalName;
    if (parsedRef.search) outputRef += parsedRef.search;
    if (parsedRef.hash) outputRef += parsedRef.hash;
    return `url(${urlPrefix}${outputRef})`;
};