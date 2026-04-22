var RankedCollection = function(maximumRank) {
    var instance = {};
    var rankedBins = new Map();
    var totalStoredItems = 0;

    maximumRank = Math.max(parseInt(maximumRank, 10) || 1, 1);

    instance.itemCount = function() {
        return totalStoredItems;
    };

    instance.addEntry = function(payload, rank) {
        rank = (rank && parseInt(rank, 10)) || 0;

        var originalRank = rank;
        if (rank < 0 || rank >= maximumRank) {
            rank = maximumRank - 1;
            console.error("invalid rank: " + originalRank + " must be between 0 and " + rank);
        }

        if (!rankedBins.has(rank)) {
            rankedBins.set(rank, []);
        }
        rankedBins.get(rank).push(payload);
        totalStoredItems++;
    };

    instance.extractHighest = function() {
        if (totalStoredItems === 0) {
            return null;
        }

        var sortedRanks = Array.from(rankedBins.keys()).sort((a, b) => a - b);

        for (var idx = 0; idx < sortedRanks.length; idx++) {
            var currentRank = sortedRanks[idx];
            var bin = rankedBins.get(currentRank);
            if (bin && bin.length > 0) {
                totalStoredItems--;
                var item = bin.shift();
                if (bin.length === 0) {
                    rankedBins.delete(currentRank);
                }
                return item;
            }
        }
        return null;
    };

    return instance;
};

if (typeof exports === 'undefined') {
    var exports = {};
}

var ResourceCustodian = function (configParams) {
    var managerInterface = {};

    var inactivityThresholdMs = configParams.idleTimeoutMillis || 30000;
    var cleanupIntervalMs = configParams.reapIntervalMillis || 1000;
    var resurrectIdleItems = ('refreshIdle' in configParams) ? configParams.refreshIdle : true;
    
    function ResourceWrapper(item) {
        this.item = item;
        this.idleTimestamp = Date.now() + inactivityThresholdMs;
    }

    var inactiveAssets = [];
    var pendingRequests = new RankedCollection(configParams.priorityRange || 1);
    var activeAssetCount = 0;
    var cleanupTaskScheduled = false;
    var cleanupTimerHandle = null;
    var shutdownInitiated = false;
    var returnToFront = configParams.returnToHead || false;

    var eventLogger = configParams.log ?
        (function (message, level) {
            if (typeof configParams.log === 'function') {
                configParams.log(message, level);
            } else {
                console.log(level.toUpperCase() + " custodian " + configParams.name + " - " + message);
            }
        }) :
        function () {};

    configParams.validate = configParams.validate || function () { return true; };

    configParams.maximumCapacity = parseInt(configParams.max, 10);
    configParams.minimumSupply = parseInt(configParams.min, 10);

    configParams.maximumCapacity = Math.max(isNaN(configParams.maximumCapacity) ? 1 : configParams.maximumCapacity, 1);
    configParams.minimumSupply = Math.min(isNaN(configParams.minimumSupply) ? 0 : configParams.minimumSupply, configParams.maximumCapacity - 1);

    function adaptCallbackExecution(callbackFunc, errorVal, payloadVal) {
        if (!callbackFunc) return;
        if (callbackFunc.length <= 1) {
            callbackFunc(payloadVal);
        } else {
            callbackFunc(errorVal, payloadVal);
        }
    }

    managerInterface.decommissionAsset = function (item) {
        activeAssetCount--;
        inactiveAssets = inactiveAssets.filter(function (wrapper) {
            return (wrapper.item !== item);
        });
        configParams.destroy(item);

        maintainMinimumSupply();
    };

    function purgeStaleAssets() {
        var itemsToDecommission = [];
        var currentTime = Date.now();
        var i;

        cleanupTaskScheduled = false;

        for (i = 0; i < inactiveAssets.length; i++) {
            var currentWrapper = inactiveAssets[i];
            var itemTimeout = currentWrapper.idleTimestamp;

            if (currentTime >= itemTimeout || (!resurrectIdleItems && (activeAssetCount - configParams.minimumSupply > itemsToDecommission.length))) {
                eventLogger("purgeStaleAssets() destroying item - now:" + currentTime + " timeout:" + itemTimeout + " item:" + currentWrapper.item, 'verbose');
                itemsToDecommission.push(currentWrapper.item);
            }
        }

        for (i = 0; i < itemsToDecommission.length; i++) {
            managerInterface.decommissionAsset(itemsToDecommission[i]);
        }

        if (inactiveAssets.length > 0) {
            eventLogger("inactiveAssets.length=" + inactiveAssets.length, 'verbose');
            schedulePurge();
        } else {
            eventLogger("purgeStaleAssets() all objects removed", 'verbose');
        }
    }

    function schedulePurge() {
        if (!cleanupTaskScheduled) {
            cleanupTaskScheduled = true;
            cleanupTimerHandle = setTimeout(purgeStaleAssets, cleanupIntervalMs);
        }
    }

    function allocateResource() {
        var retrievedWrapper = null;
        var requestError = null;
        var clientCallback = null;
        var pendingCount = pendingRequests.itemCount();

        eventLogger("allocateResource() requests=" + pendingCount + " inactive=" + inactiveAssets.length, 'info');

        if (pendingCount > 0) {
            while (inactiveAssets.length > 0 && pendingRequests.itemCount() > 0) {
                eventLogger("allocateResource() - reusing item", 'verbose');
                retrievedWrapper = inactiveAssets[0];
                if (!configParams.validate(retrievedWrapper.item)) {
                    managerInterface.decommissionAsset(retrievedWrapper.item);
                    continue;
                }
                inactiveAssets.shift();
                clientCallback = pendingRequests.extractHighest();
                if (clientCallback) {
                    adaptCallbackExecution(clientCallback, requestError, retrievedWrapper.item);
                }
            }

            if (pendingRequests.itemCount() > 0 && activeAssetCount < configParams.maximumCapacity) {
                provisionNewAsset();
            }
        }
    }

    function provisionNewAsset() {
        activeAssetCount++;
        eventLogger("provisionNewAsset() - provisioning item - count=" + activeAssetCount + " min=" + configParams.minimumSupply + " max=" + configParams.maximumCapacity, 'verbose');

        configParams.create(function () {
            var creationError, newlyCreatedItem;

            if (arguments.length > 1) {
                creationError = arguments[0];
                newlyCreatedItem = arguments[1];
            } else {
                creationError = (arguments[0] instanceof Error) ? arguments[0] : null;
                newlyCreatedItem = (arguments[0] instanceof Error) ? null : arguments[0];
            }

            var callbackForClient = pendingRequests.extractHighest();

            if (creationError) {
                activeAssetCount--;
                if (callbackForClient) {
                    adaptCallbackExecution(callbackForClient, creationError, newlyCreatedItem);
                }
                process.nextTick(function () {
                    allocateResource();
                });
            } else {
                if (callbackForClient) {
                    adaptCallbackExecution(callbackForClient, creationError, newlyCreatedItem);
                } else {
                    managerInterface.releaseResource(newlyCreatedItem);
                }
            }
        });
    }

    function maintainMinimumSupply() {
        var deficit, i;
        if (!shutdownInitiated && (activeAssetCount < configParams.minimumSupply)) {
            deficit = configParams.minimumSupply - activeAssetCount;
            for (i = 0; i < deficit; i++) {
                provisionNewAsset();
            }
        }
    }

    managerInterface.obtainResource = function (callbackFunc, rank) {
        if (shutdownInitiated) {
            throw new Error("Custodian is shutting down and cannot accept new requests.");
        }
        pendingRequests.addEntry(callbackFunc, rank);
        allocateResource();
        return (activeAssetCount < configParams.maximumCapacity);
    };

    managerInterface.borrow = function (callbackFunc, rank) {
      eventLogger("borrow() is deprecated. use obtainResource() instead", 'warn');
      managerInterface.obtainResource(callbackFunc, rank);
    };

    managerInterface.releaseResource = function (item) {
        var isAlreadyInactive = inactiveAssets.some(function (wrapper) { return (wrapper.item === item); });
        if (isAlreadyInactive) {
            eventLogger("releaseResource called twice for the same item: " + (new Error().stack), 'error');
            return;
        }

        var newWrapper = new ResourceWrapper(item);
        if (returnToFront) {
            inactiveAssets.unshift(newWrapper);
        } else {
            inactiveAssets.push(newWrapper);
        }
        eventLogger("item timeout set to: " + newWrapper.idleTimestamp, 'verbose');
        allocateResource();
        schedulePurge();
    };

    managerInterface.returnToPool = function (item) {
      eventLogger("returnToPool() is deprecated. use releaseResource() instead", 'warn');
      managerInterface.releaseResource(item);
    };

    managerInterface.initiateShutdown = function (completionCallback) {
        eventLogger("initiating shutdown", 'info');

        shutdownInitiated = true;

        var checkCompletion = function () {
            if (pendingRequests.itemCount() > 0) {
                setTimeout(checkCompletion, 100);
            } else if (inactiveAssets.length !== activeAssetCount) {
                setTimeout(checkCompletion, 100);
            } else {
                if (completionCallback) {
                    completionCallback();
                }
            }
        };
        checkCompletion();
    };

    managerInterface.eradicateAllAssets = function (completionCallback) {
        eventLogger("force destroying all assets", 'info');
        var assetsToDestroy = inactiveAssets.slice();
        inactiveAssets = [];

        var currentAssetWrapper;
        while ((currentAssetWrapper = assetsToDestroy.shift()) !== undefined) {
            managerInterface.decommissionAsset(currentAssetWrapper.item);
        }
        cleanupTaskScheduled = false;
        clearTimeout(cleanupTimerHandle);
        if (completionCallback) {
            completionCallback();
        }
    };

    managerInterface.wrapWithPooling = function (targetFunction, rank) {
        return function () {
            var originalArguments = arguments;
            var finalArgument = originalArguments[originalArguments.length - 1];
            var hasCallback = typeof finalArgument === 'function';

            managerInterface.obtainResource(function (acquisitionError, acquiredItem) {
                if (acquisitionError) {
                    if (hasCallback) {
                        finalArgument(acquisitionError);
                    }
                    return;
                }

                var funcArgs = [acquiredItem].concat(Array.prototype.slice.call(originalArguments, 0, hasCallback ? -1 : undefined));
                funcArgs.push(function () {
                    managerInterface.releaseResource(acquiredItem);
                    if (hasCallback) {
                        finalArgument.apply(null, arguments);
                    }
                });
                
                targetFunction.apply(null, funcArgs);
            }, rank);
        };
    };

    managerInterface.getCurrentAssetCount = function () { return activeAssetCount; };
    managerInterface.getManagerName = function () { return configParams.name; };
    managerInterface.getInactiveAssetCount = function () { return inactiveAssets.length; };
    managerInterface.getPendingRequestCount = function () { return pendingRequests.itemCount(); };
    managerInterface.getMaximumCapacity = function () { return configParams.maximumCapacity; };

    maintainMinimumSupply();

    return managerInterface;
};

exports.ResourceCustodian = ResourceCustodian;