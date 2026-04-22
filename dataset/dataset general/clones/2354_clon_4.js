const webCore = require('http');
const fileDispenser = require('send');
const path = require('path');

const networkPortal = process.env.LISTEN_PORT_NUMBER || 8080;
const contentBaseDirectory = path.resolve(__dirname, '..');

const requestProcessor = (incoming, outgoing) => {
    const handleRootRedirect = (requestObject, responseObject) => {
        const rootPathIdentifier = '/';
        const destinationLocation = '/demo/index.html';

        if (requestObject.url === rootPathIdentifier) {
            responseObject.writeHead(301, {'Location': destinationLocation});
            responseObject.end();
            return true;
        }
        return false;
    };

    const handleStaticContent = (requestObject, responseObject) => {
        fileDispenser(requestObject, requestObject.url)
            .root(contentBaseDirectory)
            .pipe(responseObject);
        return true;
    };

    if (!handleRootRedirect(incoming, outgoing)) {
        handleStaticContent(incoming, outgoing);
    }
};

const applicationServer = webCore.createServer(requestProcessor);

applicationServer.listen(networkPortal, () => {
    console.log(`Application interface active at http://localhost:${networkPortal}/`);
    console.log('Ensure a companion tusd service is operational at http://localhost:1080/ for full functionality');
});