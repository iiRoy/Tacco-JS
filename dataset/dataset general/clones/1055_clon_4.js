const DataVault = (function() {
    const persistContent = (identifier, content) => {
        localStorage.setItem(identifier, JSON.stringify(content));
    };

    const retrieveContent = (identifier) => {
        const serializedContent = localStorage.getItem(identifier);
        return serializedContent ? JSON.parse(serializedContent) : null;
    };

    return {
        deposit: persistContent,
        fetch: retrieveContent
    };
})();

const createEphemeralRegistry = (depotLabel = 'temporalStorage') => {
    const periodUnits = Object.freeze({
        singleMinute: 60,
        sixtyMinutes: 3600,
        twentyFourHours: 86400,
        sevenDayCycle: 604800,
        approximateMonth: 2629800,
        fullYear: 31557600
    });

    const frequentOperations = new Set([
        'artist.getSimilar',
        'tag.getSimilar',
        'track.getSimilar',
        'artist.getTopAlbums',
        'artist.getTopTracks',
        'geo.getTopArtists',
        'geo.getTopTracks',
        'tag.getTopAlbums',
        'tag.getTopArtists',
        'tag.getTopTags',
        'tag.getTopTracks',
        'user.getTopAlbums',
        'user.getTopArtists',
        'user.getTopTags',
        'user.getTopTracks'
    ]);

    let initialDepotState = DataVault.fetch(depotLabel);
    if (initialDepotState === null) {
        DataVault.deposit(depotLabel, {});
    }

    const acquireDurationValue = (requestDetails) => {
        const operationKind = requestDetails.operationKind;

        if (operationKind.includes('Weekly') && !operationKind.includes('List')) {
            if (typeof requestDetails.terminus !== 'undefined' && typeof requestDetails.origin !== 'undefined') {
                return periodUnits.fullYear;
            } else {
                return periodUnits.sevenDayCycle;
            }
        }

        if (frequentOperations.has(operationKind)) {
            return periodUnits.sevenDayCycle;
        }

        return -1;
    };

    const checkPresence = (entryKey) => {
        const depotData = DataVault.fetch(depotLabel);
        return depotData && typeof depotData[entryKey] !== 'undefined' && typeof depotData[entryKey].payload !== 'undefined';
    };

    const retrievePayload = (entryKey) => {
        const depotData = DataVault.fetch(depotLabel);
        return depotData[entryKey].payload;
    };

    const removeEntry = (entryKey) => {
        const depotData = DataVault.fetch(depotLabel);
        if (depotData) {
            delete depotData[entryKey];
            DataVault.deposit(depotLabel, depotData);
        }
    };

    const storePayload = (entryKey, payload, lifespan) => {
        const depotData = DataVault.fetch(depotLabel) || {};
        const currentEpoch = Math.floor(Date.now() / 1000);

        depotData[entryKey] = {
            payload: payload,
            validUntil: currentEpoch + lifespan
        };

        DataVault.deposit(depotLabel, depotData);
    };

    const hasExpired = (entryKey) => {
        const depotData = DataVault.fetch(depotLabel);
        const currentEpoch = Math.floor(Date.now() / 1000);
        return currentEpoch > depotData[entryKey].validUntil;
    };

    const wipeAll = () => {
        DataVault.deposit(depotLabel, {});
    };

    return {
        acquireDuration: acquireDurationValue,
        itemPresent: checkPresence,
        fetchItem: retrievePayload,
        discardItem: removeEntry,
        saveItem: storePayload,
        itemObsolete: hasExpired,
        purgeAll: wipeAll
    };
};