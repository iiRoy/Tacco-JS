"use strict";
const named = require('node-named');

class DnsRecordKeeper {
    constructor() {
        this.addressEntries = new Map();
        this.aliasEntries = new Map();
        this.serviceEntries = new Map();
        this.authorityEntry = null;
        this.activityLog = null;
        this.validSymbolPattern = /[A-Za-z0-9\.\*-_]*/;
        this.starWildcardPattern = /\*/g;
    }

    assignActivityLog(logInstance) {
        this.activityLog = logInstance;
    }

    async constructAddressEntries(inputData) {
        if (!inputData || !inputData.a) return;
        this.addressEntries.clear();
        for (const item of inputData.a) {
            this.addressEntries.set(item.fqdn, new named.ARecord(item.ip));
        }
    }

    async constructAliasEntries(inputData) {
        if (!inputData || !inputData.cname) return;
        this.aliasEntries.clear();
        for (const item of inputData.cname) {
            this.aliasEntries.set(item.fqdn, new named.CNAMERecord(item.a));
        }
    }

    async constructServiceEntries(inputData) {
        if (!inputData || !inputData.srv) return;
        this.serviceEntries.clear();
        for (const item of inputData.srv) {
            if (!this.serviceEntries.has(item.fqdn)) {
                this.serviceEntries.set(item.fqdn, []);
            }
            this.serviceEntries.get(item.fqdn).push(new named.SRVRecord(item.name, item.port));
        }
    }

    async loadRecordSet(rawRecords) {
        this.activityLog.info("Initiating record set refresh.");
        await Promise.all([
            this.constructAddressEntries(rawRecords),
            this.constructAliasEntries(rawRecords),
            this.constructServiceEntries(rawRecords)
        ]);
    }

    convertNameToPattern(targetName) {
        const transformed = targetName.replace(this.starWildcardPattern, ".*");
        return new RegExp(transformed);
    }

    async locateServiceRecords(targetName) {
        let matchedEntries = [];

        if (this.serviceEntries.has(targetName)) {
            this.activityLog.debug(`Direct SRV hit for: ${targetName}`);
            matchedEntries = this.serviceEntries.get(targetName);
        } else {
            const lookupPattern = this.convertNameToPattern(targetName);
            for (const [key, records] of this.serviceEntries.entries()) {
                if (key.match(lookupPattern)) {
                    this.activityLog.debug(`Pattern SRV match: ${key} for ${targetName}`);
                    matchedEntries.push(...records);
                }
            }
        }

        const uniqueTargets = new Map();
        for (const entry of matchedEntries) {
            uniqueTargets.set(entry.target, entry);
        }
        return Array.from(uniqueTargets.values());
    }
}

class DnsServiceHost {
    constructor() {
        this.dnsResponderInstance = named.createServer();
        this.recordStore = new DnsRecordKeeper();
        this.serviceConfiguration = null;
        this.activityLog = null;

        this.dnsResponderInstance.on('query', this.processDnsRequest.bind(this));
        this.dnsResponderInstance.on('clientError', (err) => this.activityLog.error("Client interaction failure:", err));
        this.dnsResponderInstance.on('uncaughtException', (err) => this.activityLog.error("Service runtime exception:", err.message));
    }

    async processDnsRequest(requestPacket) {
        const queryName = requestPacket.name();
        const queryType = requestPacket.type();

        if (!queryName.match(this.recordStore.validSymbolPattern)) {
            this.activityLog.error('Unacceptable query name:', queryName);
            this.dnsResponderInstance.send(requestPacket);
            return;
        }

        this.activityLog.info('Incoming DNS Query:', queryType, queryName);

        const responseDispatchTable = {
            'A': async () => {
                let addrRec = this.recordStore.addressEntries.get(queryName);
                if (addrRec) {
                    requestPacket.addAnswer(queryName, addrRec);
                } else {
                    const aliasRec = this.recordStore.aliasEntries.get(queryName);
                    if (aliasRec) {
                        requestPacket.addAnswer(queryName, aliasRec);
                        const aliasedAddrRec = this.recordStore.addressEntries.get(aliasRec.target);
                        if (aliasedAddrRec) { // Only add if the target A record exists
                            this.activityLog.debug('CNAME A:', aliasRec.target, aliasedAddrRec);
                            requestPacket.addAnswer(aliasRec.target, aliasedAddrRec);
                        }
                    }
                }
            },
            'CNAME': async () => {
                const aliasRec = this.recordStore.aliasEntries.get(queryName);
                if (aliasRec) {
                    requestPacket.addAnswer(queryName, aliasRec);
                    const aliasedAddrRec = this.recordStore.addressEntries.get(aliasRec.target);
                    if (aliasedAddrRec) { // Only add if the target A record exists
                        this.activityLog.debug('CNAME A:', aliasRec.target, aliasedAddrRec);
                        requestPacket.addAnswer(aliasRec.target, aliasedAddrRec);
                    }
                }
            },
            'SOA': async () => {
                if (this.recordStore.authorityEntry) {
                    requestPacket.addAnswer(queryName, this.recordStore.authorityEntry);
                }
            },
            'SRV': async () => {
                const matchedServiceRecords = await this.recordStore.locateServiceRecords(queryName);
                for (const rec of matchedServiceRecords) {
                    this.activityLog.debug("SRV match:", rec);
                    requestPacket.addAnswer(queryName, rec);
                }
            },
            'default': async () => {
                // No specific action, will send empty response
            }
        };

        const handler = responseDispatchTable[queryType] || responseDispatchTable['default'];
        await handler();
        this.dnsResponderInstance.send(requestPacket);
    }

    async commenceOperating(operationOptions, callbackFunction) {
        this.serviceConfiguration = operationOptions;
        this.activityLog = operationOptions.journal;
        this.recordStore.assignActivityLog(this.activityLog);

        this.recordStore.authorityEntry = new named.SOARecord(this.serviceConfiguration.rootDomain, {
            ttl: 10
        });

        this.dnsResponderInstance.listen(this.serviceConfiguration.listener.port, this.serviceConfiguration.listener.address, () => {
            this.activityLog.info('Commenced DNS resolution on', this.serviceConfiguration.listener.address, this.serviceConfiguration.listener.port);
            if (callbackFunction) callbackFunction();
        });
    }
}

const dnsServiceModule = new DnsServiceHost();

module.exports.ingestRecordCollection = async (payload, completionHandler) => {
    try {
        await dnsServiceModule.recordStore.loadRecordSet(payload);
        completionHandler();
    } catch (error) {
        completionHandler(error);
    }
};

module.exports.initiateService = (options, completionHandler) => {
    dnsServiceModule.commenceOperating(options, completionHandler);
};