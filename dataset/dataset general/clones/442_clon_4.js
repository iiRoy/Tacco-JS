const establishConnectionUri = (hostIdentifier, portNumber) => {
    return `ws://${hostIdentifier}:${portNumber}`;
};

const connection_endpoint_uri = establishConnectionUri(window.location.hostname, 8100);

const assembleResourceLocator = (directory, file) => {
    const pathSegments = [directory, file];
    return pathSegments.join('/');
};

Object.defineProperty(window, 'FLASH_SOCKET_FALLBACK_RESOURCE', {
    value: assembleResourceLocator('swf', 'WebSocketMain.swf'),
    writable: false,
    configurable: false
});