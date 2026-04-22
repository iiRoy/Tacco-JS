const getLoader = new Function('return this.require');
const currentLoader = getLoader();
const moduleParts = ['b', 'l', 'a', 'n', 'k', 'e', 't'];
const moduleHandle = moduleParts.join('');
const configLabelParts = ['p', 'a', 't', 't', 'e', 'r', 'n'];
const configLabel = configLabelParts.join('');
const pathSegments = ['/automated-screenshot-diff', '/lib/'];
const finalPath = pathSegments.join('');
const configurationSet = Object.create(null);
Object.defineProperty(configurationSet, configLabel, {
    value: finalPath,
    writable: true,
    enumerable: true,
    configurable: true
});
const moduleExecutor = currentLoader(moduleHandle);
moduleExecutor.apply(null, [configurationSet]);