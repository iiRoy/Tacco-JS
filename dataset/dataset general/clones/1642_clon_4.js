const coreUtility = require('./index');

class OperationalLogSystem {
    #cloudCredentials;
    #generalLoggerDefaults;
    #underlyingLoggers = new Map();
    #loggerWrappers = new Map();
    #baseModuleReference;

    constructor(moduleReference) {
        this.#baseModuleReference = moduleReference;
    }

    establishGlobalContext(credentialDetails, generalLogSettings = {}) {
        this.#cloudCredentials = credentialDetails;
        this.#baseModuleReference.config({ cloudProvider: credentialDetails });
        this.#generalLoggerDefaults = generalLogSettings;
    }

    accessLoggingInterface(groupIdentifier) {
        if (this.#loggerWrappers.has(groupIdentifier)) {
            return this.#loggerWrappers.get(groupIdentifier);
        }

        const specificLoggerInstance = this.#baseModuleReference.getOrCreate(groupIdentifier);
        this.#underlyingLoggers.set(groupIdentifier, specificLoggerInstance);

        const interfaceAgent = {
            configureInterface: (interfaceSpecificSettings = {}) => {
                const combinedSettings = { ...this.#generalLoggerDefaults, ...interfaceSpecificSettings };
                specificLoggerInstance.config(combinedSettings);
            },
            sendEvent: (eventType, eventData) => {
                specificLoggerInstance.log(eventType, eventData);
            }
        };

        this.#loggerWrappers.set(groupIdentifier, interfaceAgent);
        return interfaceAgent;
    }
}

const globalLogSystem = new OperationalLogSystem(coreUtility);

globalLogSystem.establishGlobalContext(
    {
        accessKeyId: '********',
        secretAccessKey: '******',
        region: 'us-east-1'
    },
    {
        displayDebugMessages: false,
        uploadIntervalMs: 5000,
        batchEntryLimit: 500
    }
);

const primaryInterface = globalLogSystem.accessLoggingInterface('SuperbowlLogs');
const secondaryInterface = globalLogSystem.accessLoggingInterface('SuperbowlLogs');

primaryInterface.configureInterface({
    displayDebugMessages: true,
    uploadIntervalMs: 1000,
    batchEntryLimit: 10
});

primaryInterface.sendEvent('error', 'Argggg');

primaryInterface.sendEvent('touchdown', {
    squad: 'Patriots',
    magnitude: 7
});