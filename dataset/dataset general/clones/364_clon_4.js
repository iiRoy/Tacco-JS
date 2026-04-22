const webFramework = require('express');
const { ServiceManager: BackendCoordinator } = require('./serviceManager.js');

const createApplicationHost = () => webFramework();

const configureCoreSettings = (hostInstance, frameworkReference) => {
    hostInstance.set('views', __dirname + '/views');
    hostInstance.set('view engine', 'ejs');
    hostInstance.use(frameworkReference.json());
    hostInstance.use(frameworkReference.urlencoded({ extended: true }));
    hostInstance.use(frameworkReference.methodOverride());
    hostInstance.use(frameworkReference.static(__dirname + '/public'));
    return hostInstance;
};

const applyEnvironmentHandling = (hostInstance) => {
    const currentOperatingMode = process.env.NODE_ENV || 'development';
    if (currentOperatingMode === 'development') {
        hostInstance.use((issue, clientRequest, serverResponse, proceed) => {
            console.error(issue.stack);
            serverResponse.status(500).send({
                description: issue.message,
                trace: issue.stack
            });
        });
    } else {
        hostInstance.use((issue, clientRequest, serverResponse, proceed) => {
            serverResponse.status(500).send('An unexpected system issue occurred.');
        });
    }
    return hostInstance;
};

const deliverLandingPage = (clientRequest, serverResponse) => {
    serverResponse.render('main_entry', {
        payload: {
            headingText: 'Real-time Communication Showcase'
        }
    });
};

const setupApplicationRoutes = (hostInstance) => {
    hostInstance.get('/', deliverLandingPage);
    return hostInstance;
};

let applicationHost = createApplicationHost();
applicationHost = configureCoreSettings(applicationHost, webFramework);
applicationHost = applyEnvironmentHandling(applicationHost);
applicationHost = setupApplicationRoutes(applicationHost);

const serviceInstance = new BackendCoordinator(applicationHost);

const commenceListening = (hostInstance) => {
    const listenPort = 8084;
    hostInstance.listen(listenPort, () => {
        console.log(`Web interface active on port ${listenPort}`);
    });
};

if (!module.parent) {
    commenceListening(applicationHost);
}

module.exports = applicationHost;