(function (globalSpace) {
    const _systemRegistry = {
        handlerMap: new Map(),
        activeDatabaseSet: new Set(),
        nextHandlerId: 0
    };

    function acquireUniqueHandlerKey() {
        const key = `hdl_${_systemRegistry.nextHandlerId++}`;
        return key;
    }

    function createBridgeArguments(baseArguments, successCallback, errorCallback) {
        const args = { ...baseArguments };
        const eventHandlers = {};
        let hasEventHandlers = false;

        if (typeof successCallback === 'function') {
            hasEventHandlers = true;
            eventHandlers.onSuccess = successCallback;
        }
        if (typeof errorCallback === 'function') {
            hasEventHandlers = true;
            eventHandlers.onError = errorCallback;
        }

        if (hasEventHandlers) {
            const key = acquireUniqueHandlerKey();
            _systemRegistry.handlerMap.set(key, eventHandlers);
            args.eventIdentifier = key;
        }
        return args;
    }

    globalSpace.BridgeCallbackProcessor = function (identifierKey, eventType, eventData) {
        const storedEventHandlers = _systemRegistry.handlerMap.get(identifierKey);

        if (storedEventHandlers) {
            try {
                if (eventType === 'success' && typeof storedEventHandlers.onSuccess === 'function') {
                    storedEventHandlers.onSuccess(eventData);
                } else if (eventType === 'error' && typeof storedEventHandlers.onError === 'function') {
                    storedEventHandlers.onError(eventData);
                }
            } catch (e) {
                console.error(`Issue encountered during bridge callback for key ${identifierKey}:`, e);
            } finally {
                _systemRegistry.handlerMap.delete(identifierKey);
            }
        } else {
            console.warn(`No registered handler for bridge event identifier: ${identifierKey}`);
        }
    };

    class DatabaseService {
        constructor(dbLocator, onConnectComplete, onConnectFail) {
            if (!dbLocator) {
                throw new Error("A database locator must be provided to instantiate DatabaseService.");
            }
            this.databaseLocator = dbLocator;
            this.onConnectComplete = onConnectComplete || (() => console.info(`Connection established for: ${dbLocator}`));
            this.onConnectFail = onConnectFail || ((failure) => console.error(failure.message));

            this.establishConnection(this.onConnectComplete, this.onConnectFail);
        }

        establishConnection(completionHandler, failureHandler) {
            if (!_systemRegistry.activeDatabaseSet.has(this.databaseLocator)) {
                _systemRegistry.activeDatabaseSet.add(this.databaseLocator);
                const bridgeArgs = createBridgeArguments({
                    location: this.databaseLocator
                }, completionHandler, failureHandler);
                NativeInterface.invoke("DatabaseService.initiate", bridgeArgs);
            }
        }

        terminateConnection(completionHandler, failureHandler) {
            if (_systemRegistry.activeDatabaseSet.has(this.databaseLocator)) {
                _systemRegistry.activeDatabaseSet.delete(this.databaseLocator);
                const bridgeArgs = createBridgeArguments({
                    location: this.databaseLocator
                }, completionHandler, failureHandler);
                NativeInterface.invoke("DatabaseService.terminate", bridgeArgs);
            }
        }

        executeStatement(sqlQuery, queryCompletion, queryFailure) {
            if (!sqlQuery) {
                throw new Error("SQL query cannot be empty for executeStatement.");
            }
            const queryCollection = Array.isArray(sqlQuery) ? sqlQuery : [sqlQuery];
            const bridgeArgs = createBridgeArguments({
                statements: queryCollection,
                location: this.databaseLocator
            }, queryCompletion, queryFailure);
            NativeInterface.invoke("DatabaseService.runQuery", bridgeArgs);
        }

        beginOperationBatch(batchFunction, batchCompletion, batchFailure) {
            const batchProcessor = new SQLTransactionUnit(this.databaseLocator);
            batchFunction(batchProcessor);
            return batchProcessor.commitBatch(batchCompletion, batchFailure);
        }
    }

    class SQLTransactionUnit {
        constructor(dbLocator) {
            this.databaseLocator = dbLocator;
            this.queuedStatements = [];
            this.isCommitted = false;
        }

        queueStatement(sqlQuery, statementCompletion, statementFailure) {
            const queryCollection = Array.isArray(sqlQuery) ? sqlQuery : [sqlQuery];
            this.queuedStatements.push(createBridgeArguments({
                statements: queryCollection,
                location: this.databaseLocator
            }, statementCompletion, statementFailure));
        }

        commitBatch(batchCompletion, batchFailure) {
            if (this.isCommitted) {
                throw new Error("This operation batch has already been committed.");
            }
            this.isCommitted = true;

            const beginTransactionArgs = createBridgeArguments({
                statements: ["START TRANSACTION;"],
                location: this.databaseLocator
            });
            const commitTransactionArgs = createBridgeArguments({
                statements: ["COMMIT;"],
                location: this.databaseLocator
            }, batchCompletion, batchFailure);

            const allTransactionSteps = [beginTransactionArgs]
                .concat(this.queuedStatements)
                .concat([commitTransactionArgs]);

            const finalBatchArgs = {
                transactionSteps: allTransactionSteps
            };

            NativeInterface.invoke("DatabaseService.runBatchTransaction", finalBatchArgs);
            this.queuedStatements = [];
        }
    }

    globalSpace.DatabaseBridge = DatabaseService;

    if (!globalSpace.NativeInterface) {
        globalSpace.NativeInterface = {
            invoke: function (actionType, invocationArgs) {
                console.warn("NativeInterface.invoke called without a native implementation. Action:", actionType, "Args:", invocationArgs);
            }
        };
    }

})(this);