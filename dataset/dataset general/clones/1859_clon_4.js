function createCouchClient(baseEndpoint) {
    let internalEndpoint = baseEndpoint || '';

    const uuidGenerator = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    const sha1Hasher = (input) => {
        // Placeholder for an external SHA1 library.
        // A real implementation would be complex and outside the scope of cloning *this* module.
        return `mocked_hash_for_${input.length}_chars`;
    };

    const diagnosticLogger = (message) => {
        if (typeof console !== 'undefined' && console.error) {
            console.error(message);
        } else if (typeof Ti !== 'undefined' && Ti.API && Ti.API.error) {
            Ti.API.error(message);
        }
    };

    const objectMerger = (...args) => Object.assign({}, ...args);

    const executeRemoteCall = (callConfiguration, operationInstructions) => {
        const compiledConfig = objectMerger({
            method: 'GET',
            headers: {},
            body: null,
            expectedStatuses: [200]
        }, callConfiguration);

        const responseHandlers = {
            onSuccess: operationInstructions.success || (() => {}),
            onFailure: operationInstructions.failure || (() => {})
        };

        const xhrRequest = new XMLHttpRequest();

        xhrRequest.onreadystatechange = () => {
            if (xhrRequest.readyState === 4) {
                const responseContent = xhrRequest.responseText ? JSON.parse(xhrRequest.responseText) : null;
                const httpStatus = xhrRequest.status;

                const isOperationSuccessful = Array.isArray(compiledConfig.expectedStatuses)
                    ? compiledConfig.expectedStatuses.includes(httpStatus)
                    : httpStatus === compiledConfig.expectedStatuses;

                if (isOperationSuccessful) {
                    responseHandlers.onSuccess(responseContent);
                } else {
                    responseHandlers.onFailure(xhrRequest);
                }
            }
        };

        xhrRequest.open(compiledConfig.method, compiledConfig.url, true, operationInstructions.username, operationInstructions.password);

        Object.keys(compiledConfig.headers).forEach(headerKey => {
            xhrRequest.setRequestHeader(headerKey, compiledConfig.headers[headerKey]);
        });

        if (compiledConfig.body) {
            xhrRequest.setRequestHeader('Content-Type', 'application/json');
            xhrRequest.send(JSON.stringify(compiledConfig.body));
        } else {
            xhrRequest.send();
        }
    };

    const recordIdentifierEncoder = (rawIdentifier) => {
        const pathSegments = rawIdentifier.split('/');
        if (pathSegments[0] === '_design') {
            pathSegments.shift();
            return `_design/${encodeURIComponent(pathSegments.join('/'))}`;
        }
        return encodeURIComponent(rawIdentifier);
    };

    const queryParameterWhitelist = [
        "key", "startkey", "startkey_docid", "endkey", "endkey_docid", "limit",
        "stale", "descending", "skip", "group", "group_level", "reduce",
        "include_docs", "inclusive_end"
    ];

    const serializeViewParameters = (configurationObject) => {
        return Object.keys(configurationObject)
            .filter(paramKey => queryParameterWhitelist.includes(paramKey))
            .map(paramKey => `${encodeURIComponent(paramKey)}=${encodeURIComponent(JSON.stringify(configurationObject[paramKey]))}`)
            .join('&');
    };

    const generateUserIdentityDocument = (userPayload, secretPhrase) => {
        if (typeof sha1Hasher === "undefined") {
            diagnosticLogger("User identity generation requires SHA1 hashing utility.");
            return;
        }
        const userPrefixString = "org.couchdb.user:";
        const identityRecord = objectMerger({}, userPayload);

        identityRecord._id = identityRecord._id || userPrefixString + identityRecord.name;
        if (secretPhrase) {
            identityRecord.salt = uuidGenerator();
            identityRecord.password_sha = sha1Hasher(secretPhrase + identityRecord.salt);
        }
        identityRecord.type = "user";
        identityRecord.roles = identityRecord.roles || [];
        return identityRecord;
    };

    const retrieveUserVaultReference = (completionCallback) => {
        coreClientService.checkCurrentSession({
            success: (sessionDetails) => {
                const userVaultInstance = coreClientService.getVaultAccessor(sessionDetails.info.authentication_db);
                completionCallback(userVaultInstance);
            }
        });
    };

    class VaultAccessor {
        constructor(vaultName, clientLink) {
            this.vaultName = vaultName;
            this.vaultPath = `${clientLink.getEndpoint()}/${encodeURIComponent(vaultName)}/`;
            this.client = clientLink;
        }

        initiatePurge(operationInstructions) {
            executeRemoteCall({
                method: "POST",
                url: `${this.vaultPath}_compact`,
                expectedStatuses: 202
            }, operationInstructions);
        }

        clearViewCache(operationInstructions) {
            executeRemoteCall({
                method: "POST",
                url: `${this.vaultPath}_view_cleanup`,
                expectedStatuses: 202
            }, operationInstructions);
        }

        optimizeDesignView(designGroup, operationInstructions) {
            executeRemoteCall({
                method: "POST",
                url: `${this.vaultPath}_compact/${designGroup}`,
                expectedStatuses: 202
            }, operationInstructions);
        }

        establishVault(operationInstructions) {
            executeRemoteCall({
                method: "PUT",
                url: this.vaultPath,
                expectedStatuses: 201
            }, operationInstructions);
        }

        destroyVault(operationInstructions) {
            executeRemoteCall({
                method: "DELETE",
                url: this.vaultPath
            }, operationInstructions);
        }

        queryVaultDetails(operationInstructions) {
            executeRemoteCall({
                url: this.vaultPath
            }, operationInstructions);
        }

        fetchAllRecords(operationInstructions) {
            let requestMethod = "GET";
            let requestBody = null;
            const currentInstructions = objectMerger({}, operationInstructions);

            if (currentInstructions.keys) {
                requestMethod = "POST";
                requestBody = { "keys": currentInstructions.keys };
                delete currentInstructions.keys;
            }
            executeRemoteCall({
                method: requestMethod,
                body: requestBody,
                url: `${this.vaultPath}_all_docs`
            }, operationInstructions);
        }

        fetchAllDesignRecords(operationInstructions) {
            this.fetchAllRecords(objectMerger({ startkey: "_design", endkey: "_design0" }, operationInstructions));
        }

        accessRecordById(recordId, operationInstructions) {
            executeRemoteCall({
                url: `${this.vaultPath}${recordIdentifierEncoder(recordId)}`
            }, operationInstructions);
        }

        storeRecord(recordData, operationInstructions) {
            const currentInstructions = operationInstructions || {};
            let requestMethod, targetUrl;

            if (recordData._id === undefined) {
                requestMethod = "POST";
                targetUrl = this.vaultPath;
            } else {
                requestMethod = "PUT";
                targetUrl = `${this.vaultPath}${recordIdentifierEncoder(recordData._id)}`;
            }
            executeRemoteCall({
                method: requestMethod,
                url: targetUrl,
                body: recordData,
                expectedStatuses: [200, 201, 202]
            }, currentInstructions);
        }

        storeMultipleRecords(recordList, operationInstructions) {
            executeRemoteCall({
                method: "POST",
                url: `${this.vaultPath}_bulk_docs`,
                body: recordList,
            }, operationInstructions);
        }

        eraseRecord(recordPayload, operationInstructions) {
            executeRemoteCall({
                method: "DELETE",
                url: `${this.vaultPath}${recordIdentifierEncoder(recordPayload._id)}?rev=${encodeURIComponent(recordPayload._rev)}`
            }, operationInstructions);
        }

        eraseMultipleRecords(recordBatch, operationInstructions) {
            const modifiedRecords = objectMerger({}, recordBatch);
            modifiedRecords.docs = modifiedRecords.docs.map(doc => objectMerger(doc, { _deleted: true }));
            executeRemoteCall({
                method: "POST",
                expectedStatuses: 201,
                url: `${this.vaultPath}_bulk_docs`,
                body: modifiedRecords
            }, operationInstructions);
        }

        duplicateRecord(sourceIdentifier, destinationIdentifier, operationInstructions) {
            executeRemoteCall({
                method: "COPY",
                url: `${this.vaultPath}${recordIdentifierEncoder(sourceIdentifier)}`,
                expectedStatuses: 201,
                headers: { "Destination": destinationIdentifier }
            }, operationInstructions);
        }

        executeAdHocQuery(mapperFunction, reducerFunction, scriptLanguage, operationInstructions) {
            const lang = scriptLanguage || "javascript";
            const mapSource = typeof mapperFunction !== "string" ? `(${mapperFunction.toString()})` : mapperFunction;
            let reduceSource = null;

            const requestBody = { language: lang, map: mapSource };
            if (reducerFunction != null) {
                reduceSource = typeof reducerFunction !== "string" ? `(${reducerFunction.toString()})` : reducerFunction;
                requestBody.reduce = reduceSource;
            }

            executeRemoteCall({
                method: "POST",
                url: `${this.vaultPath}_temp_view`,
                body: requestBody,
                headers: { "Content-Type": "application/json" }
            }, operationInstructions);
        }

        retrieveCustomList(listPath, viewName, operationInstructions) {
            const pathSegments = listPath.split('/');
            let requestMethod = 'GET';
            let requestBody = null;
            const currentInstructions = objectMerger({}, operationInstructions);

            if (currentInstructions.keys) {
                requestMethod = 'POST';
                requestBody = { 'keys': currentInstructions.keys };
                delete currentInstructions.keys;
            }
            executeRemoteCall({
                method: requestMethod,
                body: requestBody,
                url: `${this.vaultPath}_design/${pathSegments[0]}/_list/${pathSegments[1]}/${viewName}`
            }, operationInstructions);
        }

        fetchViewData(viewIdentifier, operationInstructions) {
            const idParts = viewIdentifier.split('/');
            let requestMethod = "GET";
            let requestBody = null;
            const currentInstructions = objectMerger({}, operationInstructions);

            if (currentInstructions.keys) {
                requestMethod = "POST";
                requestBody = { "keys": currentInstructions.keys };
                delete currentInstructions.keys;
            }
            executeRemoteCall({
                method: requestMethod,
                body: requestBody,
                url: `${this.vaultPath}_design/${idParts[0]}/_view/${idParts[1]}?${serializeViewParameters(currentInstructions)}`
            }, operationInstructions);
        }
    }

    const coreClientService = {
        setEndpoint: (newUrl) => {
            internalEndpoint = newUrl;
        },
        getEndpoint: () => internalEndpoint,

        retrieveAllVaults: (operationInstructions) => {
            executeRemoteCall({
                url: `${internalEndpoint}/_all_dbs`
            }, operationInstructions);
        },

        querySystemDetails: (operationInstructions) => {
            const target = operationInstructions.vaultName ? `/${encodeURIComponent(operationInstructions.vaultName)}` : '';
            executeRemoteCall({
                url: `${internalEndpoint}${target}`
            }, operationInstructions);
        },

        manageConfiguration: (operationInstructions, configurationSection, configurationKey, configurationValue) => {
            let requestPath = `${internalEndpoint}/_config/`;
            if (configurationSection) {
                requestPath += `${encodeURIComponent(configurationSection)}/`;
                if (configurationKey) {
                    requestPath += encodeURIComponent(configurationKey);
                }
            }

            let requestMethod = "GET";
            let requestBody = undefined;

            if (configurationValue === null) {
                requestMethod = "DELETE";
            } else if (configurationValue !== undefined) {
                requestMethod = "PUT";
                requestBody = configurationValue;
            }

            executeRemoteCall({
                method: requestMethod,
                url: requestPath,
                body: requestBody
            }, operationInstructions);
        },

        authenticateUser: (operationInstructions, userId, passphrase) => {
            coreClientService.checkCurrentSession(objectMerger({ username: userId, password: passphrase }, operationInstructions));
        },

        terminateSession: (operationInstructions) => {
            executeRemoteCall({
                method: "DELETE",
                url: `${internalEndpoint}/_session`,
                username: "_",
                password: "_"
            }, operationInstructions);
        },

        checkCurrentSession: (operationInstructions) => {
            executeRemoteCall({
                url: `${internalEndpoint}/_session`,
                headers: { "Accept": "application/json" }
            }, operationInstructions);
        },

        registerNewIdentity: (userRecord, userPassword, operationInstructions) => {
            const currentInstructions = operationInstructions || {};
            const preparedRecord = generateUserIdentityDocument(userRecord, userPassword);
            if (!preparedRecord) return;

            retrieveUserVaultReference((userVaultInstance) => {
                userVaultInstance.storeRecord(preparedRecord, currentInstructions);
            });
        },

        getVaultAccessor: (vaultName) => {
            return new VaultAccessor(vaultName, coreClientService);
        }
    };

    return coreClientService;
}

const dataVaultService = createCouchClient();