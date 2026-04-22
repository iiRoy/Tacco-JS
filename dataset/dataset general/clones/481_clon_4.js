const geoConverter = require('ngeohash');

class CoordinateLookupService {
    #dataStore;
    #collectionKey;

    constructor(configurationObject) {
        this.#dataStore = configurationObject.client;
        this.#collectionKey = configurationObject.zset;
    }

    static #decodeGeoInteger(integerHash, identifierLabel) {
        if (integerHash === null || integerHash === undefined) {
            return {
                label: identifierLabel,
                latitude: null,
                longitude: null
            };
        }
        const decodedPosition = geoConverter.decode_int(Number(integerHash), 52);
        return {
            label: identifierLabel,
            latitude: decodedPosition.latitude,
            longitude: decodedPosition.longitude
        };
    }

    async acquireSingleCoordinate(entityLabel) {
        try {
            const hashResult = await this.#dataStore.zscore(this.#collectionKey, entityLabel);
            return CoordinateLookupService.#decodeGeoInteger(hashResult, entityLabel);
        } catch (operationError) {
            throw operationError;
        }
    }

    async acquireMultipleCoordinates(entityLabelArray) {
        try {
            const hashRetrievalPromises = entityLabelArray.map(label =>
                this.#dataStore.zscore(this.#collectionKey, label)
            );
            const hashResults = await Promise.all(hashRetrievalPromises);

            return entityLabelArray.map((label, idx) =>
                CoordinateLookupService.#decodeGeoInteger(hashResults[idx], label)
            );
        } catch (operationError) {
            throw operationError;
        }
    }

    async browseByScoreIntervals(scoreBoundsList, includeScoresInResult) {
        const commandSequence = scoreBoundsList.map(bounds => {
            const [lowerBound, upperBound] = bounds;
            return includeScoresInResult
                ? ['ZRANGEBYSCORE', this.#collectionKey, lowerBound, upperBound, 'WITHSCORES']
                : ['ZRANGEBYSCORE', this.#collectionKey, lowerBound, upperBound];
        });

        try {
            const transaction = this.#dataStore.multi(commandSequence);
            const transactionResponses = await transaction.exec();

            if (includeScoresInResult) {
                return transactionResponses.flatMap(responseItem => {
                    const [commandError, rawData] = responseItem;
                    if (commandError) throw commandError;

                    const formattedEntries = [];
                    for (let i = 0; i < rawData.length; i += 2) {
                        const entityName = rawData[i];
                        const entityHash = rawData[i + 1];
                        const { latitude, longitude } = geoConverter.decode_int(Number(entityHash), 52);
                        formattedEntries.push([entityName, latitude, longitude]);
                    }
                    return formattedEntries;
                });
            } else {
                return transactionResponses.flatMap(responseItem => {
                    const [commandError, rawData] = responseItem;
                    if (commandError) throw commandError;
                    return rawData;
                });
            }
        } catch (operationError) {
            throw operationError;
        }
    }
}

module.exports = (serviceConfiguration) => new CoordinateLookupService(serviceConfiguration);