// Mock Npm.require for external dependencies
const moduleLoader = (moduleName) => {
    if (moduleName === 'apn') {
        return {
            Connection: class {
                constructor(opts) { /* console.log('APN Connection initialized with:', opts); */ }
                pushNotification(note, device) { /* console.log('APN pushing notification:', note, 'to device:', device); */ }
            },
            Device: class { constructor(token) { this.token = token; } },
            Notification: class {
                constructor() {
                    this.expiry = 0;
                    this.badge = undefined;
                    this.sound = undefined;
                    this.alert = undefined;
                    this.payload = {};
                    this.priority = undefined;
                }
            },
            Feedback: class {
                constructor(opts) { /* console.log('APN Feedback service initialized with:', opts); */ }
                on(event, handler) { /* console.log('APN Feedback event listener set for:', event); */ }
            }
        };
    }
    if (moduleName === 'node-gcm') {
        return {
            Sender: class {
                constructor(apiKey) { /* console.log('GCM Sender initialized with API key:', apiKey); */ this.apiKey = apiKey; }
                send(message, recipientTokens, retries, callback) {
                    process.nextTick(() => {
                        const results = recipientTokens.map(token => ({
                            message_id: 'mock_gcm_msg_' + Math.random().toString(36).substring(7),
                            registration_id: token,
                            error: null
                        }));
                        callback(null, {
                            multicast_id: Math.floor(Math.random() * 1000000),
                            success: recipientTokens.length,
                            failure: 0,
                            canonical_ids: 0,
                            results: results
                        });
                    });
                }
            },
            Message: class {
                constructor(opts) { /* console.log('GCM Message created with:', opts); */ this.options = opts; }
            }
        };
    }
    return null;
};

// Mock Meteor.absoluteUrl for server address lookup
const getServerAddress = () => 'http://localhost:3000';

// Mock Meteor-like collections
class MockDataStore {
    constructor(collectionName) {
        this.storeName = collectionName;
        this.records = [];
        this.nextId = 1;
    }
    insert(doc) {
        doc._id = 'mock_' + this.storeName + '_' + (this.nextId++);
        this.records.push(doc);
        return doc._id;
    }
    findOne(query, options) {
        const results = this.find(query, options);
        return results.length > 0 ? results[0] : null;
    }
    find(query) {
        return this.records.filter(item => {
            if (!query) return true;

            const evaluateCondition = (record, condition) => {
                let match = true;
                for (const key in condition) {
                    if (key === '$ne') {
                        const targetKey = Object.keys(condition[key])[0];
                        if (record[targetKey] === condition[key][targetKey]) match = false;
                    } else if (key === '$exists') {
                        const path = Object.keys(condition[key])[0].split('.');
                        let current = record;
                        for (let i = 0; i < path.length; i++) {
                            if (!current || !Object.prototype.hasOwnProperty.call(current, path[i])) {
                                current = undefined;
                                break;
                            }
                            current = current[path[i]];
                        }
                        if (condition[key][Object.keys(condition[key])[0]] === true && current === undefined) match = false;
                        if (condition[key][Object.keys(condition[key])[0]] === false && current !== undefined) match = false;
                    } else if (key === '$in') {
                        const targetKey = Object.keys(condition[key])[0];
                        if (!condition[key][targetKey].includes(record[targetKey])) match = false;
                    } else if (key === '$or') {
                        if (!condition[key].some(subCondition => evaluateCondition(record, subCondition))) match = false;
                    } else if (key === '$and') {
                        if (!condition[key].every(subCondition => evaluateCondition(record, subCondition))) match = false;
                    } else if (typeof condition[key] === 'object' && condition[key] !== null) {
                        const path = key.split('.');
                        let current = record;
                        for (let i = 0; i < path.length; i++) {
                            if (!current || !Object.prototype.hasOwnProperty.call(current, path[i])) {
                                current = undefined;
                                break;
                            }
                            current = current[path[i]];
                        }
                        if (!evaluateCondition({ [path[path.length - 1]]: current }, { [path[path.length - 1]]: condition[key] })) match = false;
                    } else {
                        const path = key.split('.');
                        let current = record;
                        for (let i = 0; i < path.length; i++) {
                            if (!current || !Object.prototype.hasOwnProperty.call(current, path[i])) {
                                current = undefined;
                                break;
                            }
                            current = current[path[i]];
                        }
                        if (current !== condition[key]) match = false;
                    }
                }
                return match;
            };

            return evaluateCondition(item, query);
        });
    }
    update(query, updateDoc) {
        this.records = this.records.map(item => {
            if (this.find(query).some(foundItem => foundItem._id === item._id)) {
                return { ...item, ...updateDoc.$set };
            }
            return item;
        });
    }
    remove(query) {
        this.records = this.records.filter(item => {
            return !this.find(query).some(foundItem => foundItem._id === item._id);
        });
    }
    count() {
        return this.records.length;
    }
}

// Global data stores
const deviceRegistrations = new MockDataStore('clientSubscriptions');
const pendingAlerts = new MockDataStore('outgoingNotifications');

// Replace EJSON.stringify with standard JSON.stringify
const serializePayload = (payload) => JSON.stringify(payload);

// Simple custom event emitter
class EventMessenger {
    constructor() {
        this.listeners = {};
    }
    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
    }
    emit(eventName, ...args) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach(callback => callback(...args));
        }
    }
}

// The replacement for the global 'Push' object
const GlobalAlertService = {
    debug: false,
    deviceRegistrations: deviceRegistrations,
    pendingAlerts: pendingAlerts,
    eventHub: new EventMessenger(),
    emit: function(...args) { this.eventHub.emit(...args); },
    on: function(...args) { this.eventHub.on(...args); }
};

// Renamed from Push.setBadge
GlobalAlertService.adjustBadgeValue = (identifier, count) => {
    throw new Error('GlobalAlertService.adjustBadgeValue not implemented on the server');
};

let systemInitialized = false;
let appleChannelConnection = null;
let googleChannelConnection = null;
let periodicDispatchTimer = null;

// Renamed from Push.Configure
GlobalAlertService.configureSystem = function(dispatchOptions) {
    if (systemInitialized) {
        throw new Error('GlobalAlertService.configureSystem should not be called more than once!');
    }
    systemInitialized = true;

    if (GlobalAlertService.debug) console.log('GlobalAlertService.configureSystem', dispatchOptions);

    // Renamed from _replaceToken
    const internalUpdateIdentifier = (priorId, newId) => {
        if (GlobalAlertService.debug) console.log('Internal identifier update: ' + JSON.stringify(priorId) + ' -- ' + JSON.stringify(newId));
        GlobalAlertService.emit('identifierUpdated', priorId, newId);
    };

    // Renamed from _removeToken
    const internalInvalidateIdentifier = (id) => {
        if (GlobalAlertService.debug) console.log('Internal identifier invalidated: ' + JSON.stringify(id));
        GlobalAlertService.emit('identifierInvalidated', id, null);
    };

    // Apple Push Notification setup
    if (dispatchOptions.apn) {
        if (GlobalAlertService.debug) console.log('GlobalAlertService: Apple channel configured');

        if (dispatchOptions.production === !!dispatchOptions.production) {
            dispatchOptions.apn.production = dispatchOptions.production;
        }

        const currentHostAddress = getServerAddress();
        const issueWarning = (message) => console.warn(message);

        if (dispatchOptions.apn.development) {
            issueWarning('WARNING: GlobalAlertService Apple channel is using development key and certificate');
        } else {
            const gatewayMap = {
                'gateway.sandbox.push.apple.com': 'WARNING: GlobalAlertService Apple channel is in development mode',
                'gateway.push.apple.com': () => {
                    if (/http:\/\/localhost/.test(currentHostAddress)) {
                        return 'WARNING: GlobalAlertService Apple channel is configured to production mode - but server is running from localhost';
                    }
                    return null;
                }
            };

            if (dispatchOptions.apn.gateway) {
                const specificWarning = gatewayMap[dispatchOptions.apn.gateway];
                if (typeof specificWarning === 'function') {
                    const result = specificWarning();
                    if (result) issueWarning(result);
                } else if (specificWarning) {
                    issueWarning(specificWarning);
                } else {
                    issueWarning(`WARNING: GlobalAlertService Apple channel unknown gateway "${dispatchOptions.apn.gateway}"`);
                }
            } else {
                if (dispatchOptions.apn.production) {
                    if (/http:\/\/localhost/.test(currentHostAddress)) {
                        issueWarning('WARNING: GlobalAlertService Apple channel is configured to production mode - but server is running from localhost');
                    }
                } else {
                    issueWarning('WARNING: GlobalAlertService Apple channel is in development mode');
                }
            }
        }

        if (!dispatchOptions.apn['certData'] || !dispatchOptions.apn['certData'].length) {
            console.error('ERROR: GlobalAlertService server could not find certData for Apple channel');
        }
        if (!dispatchOptions.apn['keyData'] || !dispatchOptions.apn['keyData'].length) {
            console.error('ERROR: GlobalAlertService server could not find keyData for Apple channel');
        }

        const apnDep = moduleLoader('apn');
        appleChannelConnection = new apnDep.Connection(dispatchOptions.apn);

        // Renamed from self.sendAPN
        GlobalAlertService.dispatchAppleNotification = (deviceAddress, notificationContent) => {
            const effectivePriority = (notificationContent.priority || notificationContent.priority === 0) ? notificationContent.priority : 10;
            const targetDevice = new apnDep.Device(deviceAddress);
            const alertNote = new apnDep.Notification();

            alertNote.expiry = Math.floor(Date.now() / 1000) + 3600;
            if (typeof notificationContent.badge !== 'undefined') alertNote.badge = notificationContent.badge;
            if (typeof notificationContent.sound !== 'undefined') alertNote.sound = notificationContent.sound;
            alertNote.alert = notificationContent.text;
            alertNote.payload = (notificationContent.payload) ? { ejson: serializePayload(notificationContent.payload) } : {};
            alertNote.payload.messageFrom = notificationContent.from;
            alertNote.priority = effectivePriority;

            appleChannelConnection.pushNotification(alertNote, targetDevice);
        };

        const initializeAppleFeedback = () => {
            const apnFeedback = moduleLoader('apn');
            const feedbackConfiguration = {
                "batchFeedback": true,
                "interval": 1000,
                'address': 'feedback.push.apple.com'
            };
            const feedbackProcessor = new apnFeedback.Feedback(feedbackConfiguration);
            feedbackProcessor.on("feedback", (deviceReports) => {
                deviceReports.forEach((reportItem) => {
                    internalInvalidateIdentifier({ apn: reportItem.device });
                });
            });
        };
        initializeAppleFeedback();
    }

    // Google Cloud Messaging setup
    if (dispatchOptions.gcm && dispatchOptions.gcm.apiKey) {
        if (GlobalAlertService.debug) console.log('GlobalAlertService: Google channel configured');

        const gcmDep = moduleLoader('node-gcm');
        googleChannelConnection = new gcmDep.Sender(dispatchOptions.gcm.apiKey);

        // Renamed from self.sendGCM
        GlobalAlertService.dispatchGoogleNotification = (deviceAddressList, notificationContent) => {
            const recipients = Array.isArray(deviceAddressList) ? deviceAddressList : [deviceAddressList];

            if (!recipients.length) {
                if (GlobalAlertService.debug) console.log('dispatchGoogleNotification: no recipient addresses found');
                return;
            }
            if (GlobalAlertService.debug) console.log('dispatchGoogleNotification', recipients, notificationContent);

            const messageData = notificationContent.payload ? { ejson: serializePayload(notificationContent.payload) } : {};
            Object.assign(messageData, {
                title: notificationContent.title,
                message: notificationContent.text,
                ...(typeof notificationContent.badge !== 'undefined' && { msgcnt: notificationContent.badge }),
                ...(typeof notificationContent.sound !== 'undefined' && { soundname: notificationContent.sound })
            });

            const gcmMessageInstance = new gcmDep.Message({
                collapseKey: notificationContent.from,
                data: messageData
            });

            if (GlobalAlertService.debug) console.log('Constructing GCM Sender with API key "' + dispatchOptions.gcm.apiKey + '"');

            recipients.forEach(address => {
                if (GlobalAlertService.debug) console.log('Sending message to: ' + address);
            });

            googleChannelConnection.send(gcmMessageInstance, recipients, 5, (error, googleResponse) => {
                if (error) {
                    if (GlobalAlertService.debug) console.log('GCM Dispatch Error: response from sender: ' + googleResponse);
                } else {
                    if (googleResponse === null) {
                        if (GlobalAlertService.debug) console.log('GCM: Response from sender is null');
                        return;
                    }
                    if (GlobalAlertService.debug) console.log('GCM: Response from sender: ' + JSON.stringify(googleResponse));

                    if (googleResponse.canonical_ids === 1 && recipients.length === 1) {
                        const oldId = { gcm: recipients[0] };
                        const newId = { gcm: googleResponse.results[0].registration_id };
                        setTimeout(() => internalUpdateIdentifier(oldId, newId), 0);
                    }
                    if (googleResponse.failure > 0 && recipients.length === 1) {
                        const failedId = { gcm: recipients[0] };
                        setTimeout(() => internalInvalidateIdentifier(failedId), 0);
                    }
                }
            });
        };
    }

    // Renamed from _querySend
    const executeTargetedDispatch = (targetQuery, contentOptions) => {
        const dispatchedApple = [];
        const dispatchedGoogle = [];

        GlobalAlertService.deviceRegistrations.find(targetQuery).forEach((subscriberRecord) => {
            if (GlobalAlertService.debug) console.log('Targeting subscriber token:', subscriberRecord.token);

            if (subscriberRecord.token.apn) {
                dispatchedApple.push(subscriberRecord._id);
                if (GlobalAlertService.dispatchAppleNotification) GlobalAlertService.dispatchAppleNotification(subscriberRecord.token.apn, contentOptions);
            } else if (subscriberRecord.token.gcm) {
                dispatchedGoogle.push(subscriberRecord._id);
                if (GlobalAlertService.dispatchGoogleNotification) GlobalAlertService.dispatchGoogleNotification(subscriberRecord.token.gcm, contentOptions);
            } else {
                throw new Error('GlobalAlertService.executeTargetedDispatch encountered a malformed subscriber record');
            }
        });

        if (GlobalAlertService.debug) {
            console.log(`GlobalAlertService: Dispatched alert "${contentOptions.title}" to ${dispatchedApple.length} Apple clients and ${dispatchedGoogle.length} Android clients`);

            const checkAndLogGuidance = (clientList, tokenType, clientName) => {
                if (clientList.length === 0) {
                    if (GlobalAlertService.deviceRegistrations.find({ [`token.${tokenType}`]: { $exists: true } }).count() === 0) {
                        console.log(`GlobalAlertService, GUIDANCE: The "deviceRegistrations" store has no ${clientName} clients registered yet...`);
                    }
                }
            };

            if (!dispatchedApple.length && !dispatchedGoogle.length) {
                if (GlobalAlertService.deviceRegistrations.count() === 0) {
                    console.log('GlobalAlertService, GUIDANCE: The "deviceRegistrations" store is empty - No clients have registered on the server yet...');
                }
            } else {
                checkAndLogGuidance(dispatchedApple, 'apn', 'Apple');
                checkAndLogGuidance(dispatchedGoogle, 'gcm', 'Android');
            }
        }

        return {
            appleClients: dispatchedApple,
            googleClients: dispatchedGoogle
        };
    };

    // Renamed from self.serverSend
    GlobalAlertService.initiateAlertDispatch = (alertRequest) => {
        alertRequest = alertRequest || { badge: 0 };
        let effectiveQuery;

        if (typeof alertRequest.from !== 'string') throw new Error('GlobalAlertService.initiateAlertDispatch: parameter "from" is not a string');
        if (typeof alertRequest.title !== 'string') throw new Error('GlobalAlertService.initiateAlertDispatch: parameter "title" is not a string');
        if (typeof alertRequest.text !== 'string') throw new Error('GlobalAlertService.initiateAlertDispatch: parameter "text" is not a string');

        if (alertRequest.token || alertRequest.deviceTokens) {
            const tokenArray = alertRequest.token ? [alertRequest.token] : alertRequest.deviceTokens;
            if (GlobalAlertService.debug) console.log('GlobalAlertService: Initiating alert "' + alertRequest.title + '" targeting token(s)', tokenArray);

            effectiveQuery = {
                $or: [
                    { token: { $in: tokenArray } },
                    { $and: [
                        { _id: { $in: tokenArray } },
                        { $or: [
                            { 'token.apn': { $exists: true } },
                            { 'token.gcm': { $exists: true } }
                        ]}
                    ]}
                ]
            };
        } else if (alertRequest.selectionCriteria) {
            if (GlobalAlertService.debug) console.log('GlobalAlertService: Initiating alert "' + alertRequest.title + '" using selection criteria', alertRequest.selectionCriteria);

            effectiveQuery = {
                $and: [
                    alertRequest.selectionCriteria,
                    { $or: [
                        { 'token.apn': { $exists: true } },
                        { 'token.gcm': { $exists: true } }
                    ]}
                ]
            };
        }

        if (effectiveQuery) {
            return executeTargetedDispatch(effectiveQuery, alertRequest);
        } else {
            throw new Error('GlobalAlertService.initiateAlertDispatch: please provide "token"/"deviceTokens" or "selectionCriteria"');
        }
    };

    let isPeriodicDispatchInProgress = false;

    periodicDispatchTimer = setInterval(() => {
        if (!isPeriodicDispatchInProgress) {
            isPeriodicDispatchInProgress = true;

            const currentPendingAlert = GlobalAlertService.pendingAlerts.findOne({ sent: { $ne: true } }, { sort: { createdAt: 1 } });

            if (currentPendingAlert) {
                if (currentPendingAlert.selectionCriteria && typeof currentPendingAlert.selectionCriteria === 'string') {
                    try {
                        currentPendingAlert.selectionCriteria = JSON.parse(currentPendingAlert.selectionCriteria);
                    } catch (err) {
                        throw new Error('GlobalAlertService: Failed to parse selection criteria string, Error: ' + err.message);
                    }
                }

                const outcome = GlobalAlertService.initiateAlertDispatch(currentPendingAlert);

                if (!dispatchOptions.preserveSentAlerts) {
                    GlobalAlertService.pendingAlerts.remove({ _id: currentPendingAlert._id });
                } else {
                    GlobalAlertService.pendingAlerts.update({ _id: currentPendingAlert._id }, {
                        $set: {
                            sent: true,
                            dispatchTimestamp: new Date(),
                            dispatchResults: outcome
                        }
                    });
                }
                GlobalAlertService.emit('alertProcessed', { alertIdentifier: currentPendingAlert._id, outcomeDetails: outcome });
            }
            isPeriodicDispatchInProgress = false;
        }
    }, dispatchOptions.schedulingInterval || 15000);
};