const dataConnector = require('mongodb').MongoClient;
const sourceAdapter = require('git-at-me');

const retrieveSetting = (key, fallback, type = 'string') => {
    let value = process.env[key];
    if (value === undefined) {
        return fallback;
    }
    if (type === 'boolean') {
        return value.toLowerCase() === 'true';
    }
    if (type === 'json') {
        try {
            return JSON.parse(value);
        } catch (problem) {
            console.error(`Issue parsing JSON for ${key}:`, problem.message);
            return fallback;
        }
    }
    return value;
};

const systemConfig = {
    dbResourceLocator: retrieveSetting('MONGOHQ_URL', retrieveSetting('MONGO_URL', "mongodb://127.0.0.1:27017/aygabtu")),
    notifierToken: retrieveSetting('GITHUB_TOKEN', null),
    notifierUser: retrieveSetting('GITHUB_USERNAME', null),
    notifierRepository: retrieveSetting('GITHUB_REPOSITORY', null),
    skipWebhookCreation: (process.env.AYGABTU_SKIP_HOOK || true),
    notificationTypes: retrieveSetting('GITHUB_HOOK_EVENTS', [], 'json'),
    notifierCallbackURL: retrieveSetting('AYGABTU_URL', '') + '/git-at-me/events',
    serverPort: retrieveSetting('PORT', null),
};

class DataPersistenceManager {
    constructor(connectionString) {
        this.connectionString = connectionString;
        this.client = null;
    }

    async storeRecord(recordSetIdentifier, dataPayload) {
        try {
            console.log(`Establishing connection to data vault: ${this.connectionString}`);
            this.client = await dataConnector.connect(this.connectionString);
            const dataVault = this.client.db();
            const recordSet = dataVault.collection(recordSetIdentifier);
            await recordSet.insertOne(dataPayload);
            console.log(`Processed and stored a '${recordSetIdentifier}' signal.`);
        } catch (operationIssue) {
            console.error(`Problem during data persistence for '${recordSetIdentifier}':`, operationIssue.message);
            throw operationIssue;
        } finally {
            if (this.client) {
                await this.client.close();
                this.client = null;
            }
        }
    }
}

class WebhookCoordinator {
    constructor(configData, persistenceManager) {
        this.persistenceManager = persistenceManager;
        this.notifierService = sourceAdapter({
            token: configData.notifierToken,
            user: configData.notifierUser,
            repo: configData.notifierRepository,
            skipHook: configData.skipWebhookCreation,
            events: configData.notificationTypes,
            url: configData.notifierCallbackURL,
            port: configData.serverPort
        });
        this.subscribedNotifications = configData.notificationTypes;
    }

    initializeListeners() {
        if (!Array.isArray(this.subscribedNotifications) || this.subscribedNotifications.length === 0) {
            console.warn("No notification types configured. Webhook listeners will not be set up.");
            return;
        }

        this.subscribedNotifications.forEach(eventType => {
            this.notifierService.on(eventType, async (eventDetails) => {
                console.log("Received incoming signal:", eventDetails);
                try {
                    await this.persistenceManager.storeRecord(eventType, eventDetails);
                } catch (persistenceError) {
                    console.error(`Failed to persist signal '${eventType}'.`);
                }
            });
        });
        console.log(`Webhook coordinator initialized for types: ${this.subscribedNotifications.join(', ')}`);
    }
}

(async function executeSystem() {
    "use strict";

    const dataManager = new DataPersistenceManager(systemConfig.dbResourceLocator);
    const coordinator = new WebhookCoordinator(systemConfig, dataManager);

    coordinator.initializeListeners();

})();