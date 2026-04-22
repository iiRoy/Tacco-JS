module.exports = {
    configureDataFeed: function (accountIdentifier, securityKey, targetFeed) {
        const uniqueKey = `${accountIdentifier}:${securityKey}`;

        let currentManager = activeHandlers.get(uniqueKey);

        if (!currentManager) {
            console.log('No existing manager for these credentials. Creating a new one.');
            currentManager = new StreamConnectionManager(accountIdentifier, securityKey);
            activeHandlers.set(uniqueKey, currentManager);
        } else {
            console.log('Utilizing existing manager for these credentials.');
        }

        currentManager.requestFeedSubscription(targetFeed);
    }
};

const activeHandlers = new Map();

class StreamConnectionManager {
    #dataSource;
    #credentials;
    #subscribedFeeds = new Set();
    #connectionStatus = 'DISCONNECTED'; // 'DISCONNECTED', 'CONNECTING', 'CONNECTED'

    constructor(user, key) {
        this.#credentials = `${user}:${key}`;
        console.log(`Setting up manager for ${this.#credentials}`);
        this.#dataSource = new DataSift(user, key);
        this.#setupEventDispatchers();
    }

    #setupEventDispatchers() {
        this.#dataSource.on("connect", () => {
            console.log("Connection established by manager!");
            this.#connectionStatus = 'CONNECTED';
            this.#subscribedFeeds.forEach(feed => {
                this.#dataSource.subscribe(feed);
            });
        });

        this.#dataSource.on("error", (err) => {
            console.log(`Stream error encountered: ${err.message}`);
            this.#connectionStatus = 'DISCONNECTED';
        });

        this.#dataSource.on("warning", (msg) => {
            console.log(`Stream warning: ${msg}`);
        });

        this.#dataSource.on("disconnect", () => {
            console.log("Stream disconnected!");
            this.#connectionStatus = 'DISCONNECTED';
        });

        this.#dataSource.on("interaction", (payload) => {
            if (payload.data) {
                io.sockets.emit('streamEvent', {
                    payloadContent: payload.data
                });
            }
        });
    }

    async commenceConnection() {
        if (this.#connectionStatus === 'CONNECTED') {
            console.log('Manager: Already connected.');
            return;
        }
        if (this.#connectionStatus === 'CONNECTING') {
            console.log('Manager: Connection already in progress.');
            return;
        }

        console.log('Manager: Initiating connection...');
        this.#connectionStatus = 'CONNECTING';
        this.#dataSource.connect();
    }

    requestFeedSubscription(feedIdentifier) {
        if (this.#subscribedFeeds.has(feedIdentifier)) {
            console.log(`Manager: Already tracking subscription for ${feedIdentifier}.`);
            return;
        }

        this.#subscribedFeeds.add(feedIdentifier);

        if (this.#connectionStatus === 'CONNECTED') {
            console.log(`Manager: Subscribing to ${feedIdentifier} on active connection.`);
            this.#dataSource.subscribe(feedIdentifier);
        } else {
            console.log(`Manager: Connection not active. Will subscribe to ${feedIdentifier} once connected.`);
            this.commenceConnection();
        }
    }
}