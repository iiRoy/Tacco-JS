"use strict";

const failureTimeoutMillis = 1000;

const checkModuleAvailability = (moduleIdentifier) => {
    try {
        require.resolve(moduleIdentifier);
        return true;
    } catch (incident) {
        return false;
    }
};

const transformSQLSpecials = (inputString) =>
    Array.from(inputString).reduce((accumulator, character) => {
        switch (character) {
            case '?': return accumulator + '\\?';
            case ';': return accumulator + '\\\\;';
            default: return accumulator + character;
        }
    }, '');

const ConnectionState = Object.freeze({
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2
});

const createDatabaseLink = (settings, notifierCallback, driverType) => {
    let currentConnectionState = ConnectionState.DISCONNECTED;
    let databaseHandle = null;
    let connectionAttemptTimer = null;
    let isAttemptingConnection = false;

    const updateStatus = (newState) => {
        currentConnectionState = newState;
        if (newState === ConnectionState.CONNECTED) {
            notifierCallback(1);
            isAttemptingConnection = false;
        } else if (newState === ConnectionState.DISCONNECTED) {
            notifierCallback(0);
            isAttemptingConnection = false;
        } else if (newState === ConnectionState.CONNECTING) {
            isAttemptingConnection = true;
        }
    };

    const attemptReconnection = (issue) => {
        updateStatus(ConnectionState.DISCONNECTED);
        clearTimeout(connectionAttemptTimer);
        connectionAttemptTimer = setTimeout(initiateConnection, failureTimeoutMillis);
        if (issue) {
            console.error("Database link issue:", issue);
        }
    };

    const initiateConnection = () => {
        if (currentConnectionState !== ConnectionState.CONNECTED && !isAttemptingConnection) {
            updateStatus(ConnectionState.CONNECTING);
            try {
                if (driverType === 'mariasql') {
                    databaseHandle = new (require("mariasql"))();
                    databaseHandle.connect({
                        host: settings.host,
                        user: settings.user,
                        port: settings.port,
                        password: settings.pass,
                        db: settings.base,
                    });
                    databaseHandle.on("connect", () => updateStatus(ConnectionState.CONNECTED))
                                  .on("error", attemptReconnection)
                                  .on("close", attemptReconnection);
                } else if (driverType === 'mysql') {
                    databaseHandle = require("mysql").createConnection({
                        host: settings.host,
                        user: settings.user,
                        port: settings.port,
                        password: settings.pass,
                        database: settings.base,
                        socketPath: settings.sock,
                    });
                    databaseHandle.on("error", attemptReconnection);
                    databaseHandle.connect((connError) => {
                        if (connError) {
                            attemptReconnection(connError);
                        } else {
                            updateStatus(ConnectionState.CONNECTED);
                        }
                    });
                }
            } catch (setupIssue) {
                console.error("Failed to establish database link:", setupIssue);
                attemptReconnection(setupIssue);
            }
        }
    };

    initiateConnection();

    return {
        processQueryArgument: (dataString) => {
            if (!databaseHandle) {
                throw new Error("Cannot process query argument: Database link not active.");
            }
            let escapedSegment;
            if (driverType === 'mariasql') {
                escapedSegment = databaseHandle.escape(dataString);
            } else {
                escapedSegment = databaseHandle.escape(dataString).slice(1, -1);
            }
            return transformSQLSpecials(escapedSegment);
        },
        executeStatement: (statementContent, completionCallback) => {
            if (!databaseHandle || currentConnectionState !== ConnectionState.CONNECTED) {
                if (completionCallback) {
                    completionCallback(undefined, new Error("Database link not ready for execution."));
                }
                return;
            }

            if (driverType === 'mariasql') {
                databaseHandle.query(statementContent).on("result", (resultStream) => {
                    const collectedData = [];
                    resultStream.on("row", (record) => {
                        collectedData.push(record);
                    }).on("end", () => {
                        if (completionCallback) {
                            completionCallback(collectedData);
                        }
                    });
                }).on("error", (errorEncountered) => {
                    console.error("Query execution error (mariasql):", errorEncountered);
                    if (completionCallback) {
                        completionCallback(undefined, errorEncountered);
                    }
                });
            } else {
                databaseHandle.query(statementContent, (errorEncountered, resultSet) => {
                    if (completionCallback) {
                        completionCallback(resultSet, errorEncountered);
                    }
                });
            }
        },
        isOnline: () => currentConnectionState === ConnectionState.CONNECTED,
        getState: () => currentConnectionState,
        getInternalHandle: () => databaseHandle
    };
};

exports.establishDatabaseInterface = (interfaceConfiguration) => {
    let linkCreatorFunction;
    const activeDataSources = [];

    let driverKind;
    try {
        require.resolve("mariasql");
        driverKind = 'mariasql';
    } catch (e) {
        driverKind = 'mysql';
    }
    
    linkCreatorFunction = (configDetails, statusUpdateFunc) =>
        createDatabaseLink(configDetails, statusUpdateFunc, driverKind);

    const normalizedConfigurations = Array.isArray(interfaceConfiguration)
        ? interfaceConfiguration
        : [interfaceConfiguration];

    normalizedConfigurations.forEach((individualConfig) => {
        const sourceIndex = activeDataSources.length;
        activeDataSources.push({
            connector: linkCreatorFunction(individualConfig, (connectionStatus) => {
                activeDataSources[sourceIndex].onlineStatus = connectionStatus === 1;
            }),
            onlineStatus: false
        });
    });

    const obtainSpecificConnector = (() => {
        let rotationIndex = -1;
        const numberOfSources = activeDataSources.length;

        return () => {
            let traversalAttempts = 0;
            while (traversalAttempts < numberOfSources) {
                rotationIndex = (rotationIndex + 1) % numberOfSources;
                if (activeDataSources[rotationIndex].onlineStatus) {
                    return activeDataSources[rotationIndex].connector;
                }
                traversalAttempts++;
            }
            return null;
        };
    })();

    return {
        performDatabaseOperation: (queryText, operationCompletionCallback) => {
            const executeWithRetry = () => {
                const activeLink = obtainSpecificConnector();

                if (!activeLink) {
                    setTimeout(() => executeWithRetry(), 100);
                    return;
                }
                activeLink.executeStatement(queryText, operationCompletionCallback);
            };
            executeWithRetry();
        },
        obtainSpecificConnector: obtainSpecificConnector,
    };
};