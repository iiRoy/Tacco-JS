Error.stackTraceLimit = Infinity;

const dataAccessModule = require('../lib/node-mysql.js');
const DataRegistry = dataAccessModule.DB;

// Helper function to convert a callback-style function to a Promise-style function
const convertToPromise = (originalFunction) => {
  return function(...argumentsArray) {
    return new Promise((resolveResult, rejectError) => {
      originalFunction.apply(this, [...argumentsArray, (operationError, operationResult) => {
        if (operationError) return rejectError(operationError);
        resolveResult(operationResult);
      }]);
    });
  };
};

// A wrapper class for the database interactions, providing a promise-based API
class DataVault {
    constructor(configuration) {
        this._underlyingRegistry = new DataRegistry(configuration);
        this.initSchema = convertToPromise(this._underlyingRegistry._prepare).bind(this._underlyingRegistry);
        this.endConnectionPool = this._underlyingRegistry.end.bind(this._underlyingRegistry);
        this.addDefinition = this._underlyingRegistry.add.bind(this._underlyingRegistry);
        this.alterDefinition = this._underlyingRegistry.extend.bind(this._underlyingRegistry);
        this.retrieveDefinition = this._underlyingRegistry.get.bind(this._underlyingRegistry);
        this.duplicateVault = this._underlyingRegistry.clone.bind(this._underlyingRegistry);
    }

    async executeInTransaction(transactionLogic) {
        return new Promise((resolveResult, rejectError) => {
            this._underlyingRegistry.transaction(null, async (originalConnection, transactionCallback) => {
                const connectionObject = {
                    query: convertToPromise(originalConnection.query).bind(originalConnection),
                    _originalReference: originalConnection // Provide original for library methods
                };
                try {
                    const logicOutput = await transactionLogic(connectionObject);
                    transactionCallback(null, logicOutput);
                } catch (transactionIssue) {
                    transactionCallback(transactionIssue);
                }
            }, (finalError, finalResult) => {
                if (finalError) return rejectError(finalError);
                resolveResult(finalResult);
            });
        });
    }

    async establishSession(sessionLogic) {
        return new Promise((resolveResult, rejectError) => {
            this._underlyingRegistry.connect(async (originalConnection, sessionCallback) => {
                const connectionObject = {
                    query: convertToPromise(originalConnection.query).bind(originalConnection),
                    _originalReference: originalConnection // Provide original for library methods
                };
                try {
                    const logicOutput = await sessionLogic(connectionObject);
                    sessionCallback(null, logicOutput);
                } catch (sessionIssue) {
                    sessionCallback(sessionIssue);
                }
            }, (finalError, finalResult) => {
                if (finalError) return rejectError(finalError);
                resolveResult(finalResult);
            });
        });
    }

    async iterateRecords(queryStatement, recordProcessor) {
        return new Promise((resolveResult, rejectError) => {
            this._underlyingRegistry.cursor(queryStatement, async (singleRecord, cursorNextCallback) => {
                try {
                    await recordProcessor(singleRecord);
                    cursorNextCallback();
                } catch (processorIssue) {
                    cursorNextCallback(processorIssue);
                }
            }, (finalError, finalResult) => {
                if (finalError) return rejectError(finalError);
                resolveResult(finalResult);
            });
        });
    }
}

const acquireCompletionAgent = () => {
    const operationBeginTime = new Date();
    const outputIssue = (issueObject) => {
        if (issueObject && issueObject.stack) {
            console.log(issueObject.stack);
        } else {
            console.log(issueObject);
        }
    };

    return async (outcomeError, outcomeData) => {
        try {
            const operationEndTime = new Date();
            console.log('duration: ', operationEndTime - operationBeginTime);
            if (outcomeError) {
                outputIssue(outcomeError);
            } else {
                console.log(outcomeData);
            }
            dataVaultInstance.endConnectionPool();
        } catch (reporterError) {
            outputIssue(reporterError);
            dataVaultInstance.endConnectionPool();
        }
    };
};
const finalReporter = acquireCompletionAgent();

const dataVaultInstance = new DataVault({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'workr-main-service',
    connectionLimit: 50,
    useTransaction: {
        connectionLimit: 1
    },
    useCursor: {
        connectionLimit: 1
    }
});

async function simpleQueryScenario() {
    await dataVaultInstance.executeInTransaction(async (connectionObject) => {
        const queryResult = await connectionObject.query('select * from user_profiles limit 1');
        console.log(queryResult);
    });
}

async function schemaInitialization() {
    await dataVaultInstance.initSchema();
}

async function iteratorQueryScenario() {
    await dataVaultInstance.establishSession(async (connectionObject) => {
        const statement = 'select * from user_profiles';
        await dataVaultInstance.iterateRecords(statement, async (recordItem) => {
            console.log(recordItem);
        });
    });
}

async function objectMappingScenario() {
    dataVaultInstance.addDefinition({
        name: 'voucherRecords',
        idFieldName: 'coupon_id'
    });

    dataVaultInstance.addDefinition({
        name: 'merchandiseItems',
        idFieldName: 'product_id'
    });

    const originalDataVault = dataVaultInstance;

    dataVaultInstance = dataVaultInstance.duplicateVault();

    dataVaultInstance.alterDefinition({
        name: 'voucherRecords',
        Row: {
            getDiscountTypeIdentifier: function() {
                return this._data['discount_type'];
            }
        }
    })
    .linksTo({
        name: 'singleMerchandise',
        table: 'merchandiseItems',
        key: 'product_id'
    });

    const VoucherModel = dataVaultInstance.retrieveDefinition('voucherRecords').Table;

    await dataVaultInstance.establishSession(async (connectionObject) => {
        const queryStatement = VoucherModel.baseQuery('where product_id is not null limit 1');
        const findVouchers = convertToPromise(VoucherModel.find).bind(VoucherModel);
        const voucherResults = await findVouchers(connectionObject._originalReference, queryStatement);

        const processedVouchers = await Promise.all(voucherResults.map(async (singleVoucher) => {
            const linkVoucherToMerchandise = convertToPromise(singleVoucher.linksTo).bind(singleVoucher);
            await linkVoucherToMerchandise(connectionObject._originalReference, 'singleMerchandise');
            return singleVoucher.getDiscountTypeIdentifier();
        }));
        console.log(processedVouchers);
    });
}

async function orchestrateExecution() {
    try {
        await iteratorQueryScenario();
        return "Async operation successfully concluded.";
    } catch (processError) {
        console.log('asynchronous operation encountered an issue');
        throw processError;
    }
}

orchestrateExecution()
    .then(result => finalReporter(null, result))
    .catch(error => finalReporter(error));