import * as fileSystemPromises from 'node:fs/promises';
import * as pathUtilities from 'node:path';
import * as apiFramework from 'restify';

const defaultApplicationParameters = Object.freeze({
  applicationHost: {
    listeningPort: 3500,
    bindAddress: '0.0.0.0'
  },
  dataStore: {
    portNumber: 27017,
    hostName: 'localhost'
  },
  persistenceMechanism: 'mongodb',
  detailedLogging: false
});

const diagnosticMessageTag = "DIAGNOSTIC: ";

export const applicationFramework = apiFramework;
export let applicationConfiguration = { ...defaultApplicationParameters };
export let systemLogger = (messageText) => { /* Placeholder until configuration is loaded */ };
export let runningService = null;

const processLogInternal = (messageText) => {
  if (applicationConfiguration.detailedLogging) {
    console.log(diagnosticMessageTag + messageText);
  }
};

const retrieveConfiguration = async () => {
  const configurationPath = pathUtilities.join(process.cwd(), "config.json");

  try {
    const fileData = await fileSystemPromises.readFile(configurationPath, { encoding: 'utf8' });
    const parsedData = JSON.parse(fileData);
    Object.assign(applicationConfiguration, parsedData);
  } catch (error) {
    processLogInternal("External configuration file (config.json) not found or malformed. Proceeding with default settings.");
  }
  systemLogger = processLogInternal;
};

const commenceService = async () => {
  await retrieveConfiguration();

  const webService = apiFramework.createServer({
    name: "system-interface"
  });

  const acceptedContentFormats = [
    'application/json'
  ];
  webService.acceptable = acceptedContentFormats;

  const middlewareComponents = [
    apiFramework.acceptParser(acceptedContentFormats),
    apiFramework.bodyParser(),
    apiFramework.fullResponse(),
    apiFramework.queryParser(),
    apiFramework.jsonp()
  ];

  middlewareComponents.forEach(component => webService.use(component));

  runningService = webService;

  try {
    const endpointModule = await import('./service_endpoints.js');
    if (typeof endpointModule.initializeRoutes === 'function') {
      endpointModule.initializeRoutes(webService);
    } else {
      systemLogger("Service endpoint module did not export an 'initializeRoutes' function.");
    }
  } catch (err) {
    systemLogger(`Failed to load service endpoints: ${err.message}`);
  }

  webService.listen(applicationConfiguration.applicationHost.listeningPort, () => {
    console.info(`Server '${webService.name}' active on ${webService.url}`);
  });
};

commenceService().catch(startupError => {
  console.error("Service initialization failure:", startupError);
  process.exit(1);
});