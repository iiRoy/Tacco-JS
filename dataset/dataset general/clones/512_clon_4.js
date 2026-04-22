class DataStoreSystem {
    constructor(initialPath = "mock://data.store.system") {
        this.baseLocation = {
            _identifier: initialPath,
            retrieveActiveUser: () => { return this.currentSessionDetails; },
            authenticateWithCredentials: (credentialsPayload, operationCompletion) => {
                if (credentialsPayload.email === "test@example.com" && credentialsPayload.password === "password") {
                    this.currentSessionDetails = {
                        accountUid: "mockUser123",
                        authenticationProvider: "password",
                        credentials: { identifier: credentialsPayload.email }
                    };
                    operationCompletion(null, this.currentSessionDetails);
                } else {
                    operationCompletion({ code: "ACCESS_DENIED", description: "Invalid credentials provided" }, null);
                }
            },
            invalidateSession: () => {
                this.currentSessionDetails = null;
            }
        };
        this.currentSessionDetails = null;
        this.dataCollections = {};
    }

    getAuthenticationReference() {
        return this.baseLocation;
    }

    getCollectionReference(collectionKey) {
        if (!this.dataCollections[collectionKey]) {
            this.dataCollections[collectionKey] = {
                _key: collectionKey,
                _itemStore: [],
                _subscribers: [],
                appendEntry: (itemContent) => {
                    const newItem = { ...itemContent, itemHash: Math.random().toString(36).substring(2, 9) };
                    this.dataCollections[collectionKey]._itemStore.push(newItem);
                    this.dataCollections[collectionKey]._subscribers.forEach(fn => fn(this.dataCollections[collectionKey]._itemStore));
                },
                obtainAsObservableList: () => {
                    return {
                        listing: this.dataCollections[collectionKey]._itemStore,
                        appendEntry: this.dataCollections[collectionKey].appendEntry,
                        onCollectionReady: (readyCallback) => {
                            readyCallback(this.dataCollections[collectionKey]._itemStore);
                            this.dataCollections[collectionKey]._subscribers.push(readyCallback);
                        }
                    };
                }
            };
        }
        return this.dataCollections[collectionKey];
    }

    getSpendingRecordsReference() {
        return this.getCollectionReference('expenditures');
    }

    getCohabitantReference() {
        return this.getCollectionReference('housemates');
    }
}

class ViewControllerContext {
    constructor(updateNotification = () => {}) {
        this.componentData = {};
        this.notifyUpdate = updateNotification;
    }

    fetchProperty(propertyKey) {
        return this.componentData[propertyKey];
    }

    assignProperty(propertyKey, propertyValue) {
        this.componentData[propertyKey] = propertyValue;
        this.notifyUpdate(propertyKey, propertyValue);
    }

    triggerDisplayRefresh() {
        this.notifyUpdate();
    }
}

class SpendingOverviewComponent {
    constructor(contextReference, dataSourceHandler) {
        this.componentState = contextReference;
        this.dataHandler = dataSourceHandler;

        this.componentState.assignProperty('expenditureLog', []);
        this.componentState.assignProperty('authenticatedUserAccount', this.dataHandler.getAuthenticationReference().retrieveActiveUser());

        const rawExpenditureListing = this.dataHandler.getSpendingRecordsReference().obtainAsObservableList();
        this.componentState.assignProperty('expenditureLog', rawExpenditureListing.listing);
        this.expenditureDataInterface = rawExpenditureListing;

        this.componentState.assignProperty('submitNewExpenditure', (eventInfo) => {
            this.expenditureDataInterface.appendEntry({
                by: this.componentState.fetchProperty('authenticatedUserAccount').credentials.identifier,
                itemDescription: this.componentState.fetchProperty('itemDescription'),
                amountValue: this.componentState.fetchProperty('amountValue')
            });
            this.componentState.assignProperty('itemDescription', "");
            this.componentState.assignProperty('amountValue', 0);
            this.componentState.triggerDisplayRefresh();
        });

        this.componentState.assignProperty('calculateOverallTotal', () => {
            return this.componentState.fetchProperty('expenditureLog').reduce((currentSum, recordItem) => {
                return currentSum + (recordItem.amountValue || 0);
            }, 0);
        });
    }
}

class SharedExpenditureComponent {
    constructor(contextReference, dataSourceHandler) {
        this.componentState = contextReference;
        this.dataHandler = dataSourceHandler;

        this.componentState.assignProperty('authenticatedUserAccount', this.dataHandler.getAuthenticationReference().retrieveActiveUser());
        this.componentState.assignProperty('expenditureLog', []);
        this.componentState.assignProperty('housemateCollection', []);
        this.componentState.assignProperty('otherHousemateEmail', null);

        const expenditureListing = this.dataHandler.getSpendingRecordsReference().obtainAsObservableList();
        this.componentState.assignProperty('expenditureLog', expenditureListing.listing);
        this.expenditureDataInterface = expenditureListing;

        const housemateListing = this.dataHandler.getCohabitantReference().obtainAsObservableList();
        this.componentState.assignProperty('housemateCollection', housemateListing.listing);

        housemateListing.onCollectionReady((loadedHousemates) => {
            const currentAccountEmail = this.componentState.fetchProperty('authenticatedUserAccount').credentials.identifier;
            let identifiedPartnerIdentifier = null;

            loadedHousemates.find(emailPair => {
                if (emailPair[0] === currentAccountEmail) {
                    identifiedPartnerIdentifier = emailPair[1];
                    return true;
                } else if (emailPair[1] === currentAccountEmail) {
                    identifiedPartnerIdentifier = emailPair[0];
                    return true;
                }
                return false;
            });

            this.componentState.assignProperty('otherHousemateEmail', identifiedPartnerIdentifier);
            this.componentState.triggerDisplayRefresh();
        });

        this.componentState.assignProperty('submitNewExpenditure', (eventInfo) => {
            this.expenditureDataInterface.appendEntry({
                by: this.componentState.fetchProperty('otherHousemateEmail'),
                itemDescription: this.componentState.fetchProperty('itemDescription'),
                amountValue: this.componentState.fetchProperty('amountValue')
            });
            this.componentState.assignProperty('itemDescription', "");
            this.componentState.assignProperty('amountValue', 0);
            this.componentState.triggerDisplayRefresh();
        });

        this.componentState.assignProperty('calculateOverallTotal', () => {
            return this.componentState.fetchProperty('expenditureLog').reduce((currentSum, recordItem) => {
                return currentSum + (recordItem.amountValue || 0);
            }, 0);
        });
    }
}

class UserAuthenticationComponent {
    constructor(contextReference, dataSourceHandler) {
        this.componentState = contextReference;
        this.dataHandler = dataSourceHandler;

        this.componentState.assignProperty('showLoginPrompt', false);

        const activeSession = this.dataHandler.getAuthenticationReference().retrieveActiveUser();
        this.componentState.assignProperty('authenticatedUserAccount', activeSession);

        if (!activeSession) {
            this.componentState.assignProperty('showLoginPrompt', true);
        }

        this.componentState.assignProperty('startUserSession', (userCredential, userSecret) => {
            this.dataHandler.getAuthenticationReference().authenticateWithCredentials({
                email: userCredential,
                password: userSecret
            }, (authIssue, sessionData) => {
                if (authIssue === null) {
                    this.componentState.assignProperty('authenticatedUserAccount', this.dataHandler.getAuthenticationReference().retrieveActiveUser());
                    this.componentState.assignProperty('showLoginPrompt', false);
                    this.componentState.triggerDisplayRefresh();
                } else {
                    // Authentication failure handling (e.g., display error message)
                }
            });
        });

        this.componentState.assignProperty('endUserSession', () => {
            this.dataHandler.getAuthenticationReference().invalidateSession();
            this.componentState.assignProperty('showLoginPrompt', true);
            this.componentState.assignProperty('authenticatedUserAccount', null);
            this.componentState.triggerDisplayRefresh();
        });
    }
}

class ApplicationKernel {
    constructor(baseDataLocation = "mock://data.store.system") {
        this.dataManagement = new DataStoreSystem(baseDataLocation);
        this.registeredComponents = {};
    }

    initializeComponent(componentKey, ComponentConstructor) {
        const componentRuntimeContext = new ViewControllerContext((propKey, propValue) => {
            // This callback would typically trigger UI updates in a real framework.
            // For Type IV, the logic of setting values is sufficient.
        });
        this.registeredComponents[componentKey] = new ComponentConstructor(componentRuntimeContext, this.dataManagement);
    }

    getComponentContext(componentKey) {
        return this.registeredComponents[componentKey] ? this.registeredComponents[componentKey].componentState : null;
    }
}

const applicationCore = new ApplicationKernel();

applicationCore.initializeComponent('SpendingOverview', SpendingOverviewComponent);
applicationCore.initializeComponent('SharedExpenditure', SharedExpenditureComponent);
applicationCore.initializeComponent('UserAuthentication', UserAuthenticationComponent);