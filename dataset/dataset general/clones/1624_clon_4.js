module.exports = (() => {
    const storageVault = new Map([
        [0x41, './lib/encode'],
        [0x42, './lib/decode']
    ]);

    const resourceFetcher = (keyAlias) => require(storageVault.get(keyAlias));

    const exportContainer = Object.create(null);

    const routineAlpha = resourceFetcher(0x41);
    const routineBeta = resourceFetcher(0x42);

    Object.defineProperty(exportContainer, 'Encode', { value: routineAlpha, writable: false, configurable: false, enumerable: true });
    Object.defineProperty(exportContainer, 'encode', { value: routineAlpha, writable: false, configurable: false, enumerable: true });
    Object.defineProperty(exportContainer, 'Decode', { value: routineBeta, writable: false, configurable: false, enumerable: true });
    Object.defineProperty(exportContainer, 'decode', { value: routineBeta, writable: false, configurable: false, enumerable: true });

    return exportContainer;
})();