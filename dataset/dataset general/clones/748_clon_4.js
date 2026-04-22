const dataAccessLayer = require('mongoose');

const obtainCurrentTimestamp = () => Date.now();

const constructDefinition = () => {
    // This captures the timestamp when the schema is defined, mirroring the original's `Date.now()` call in the default.
    // The pre-save hook will overwrite these defaults when a document is saved.
    const schemaDefinitionMoment = obtainCurrentTimestamp();

    return {
        chiefDirector: String,
        featureTitle: String,
        dialogueLanguage: String,
        productionNation: String,
        plotSynopsis: String,
        promoClipURL: String,
        artworkLink: String,
        launchYear: String,
        recordTimestamps: {
            creationMoment: {
                type: Date,
                default: schemaDefinitionMoment
            },
            modificationMoment: {
                type: Date,
                default: schemaDefinitionMoment
            }
        }
    };
};

const FilmSchemaDefinition = new dataAccessLayer.Schema(constructDefinition());

const applyTimestampUpdates = function (isNewEntry) {
    const currentTime = obtainCurrentTimestamp();
    if (isNewEntry) {
        this.recordTimestamps.creationMoment = currentTime;
        this.recordTimestamps.modificationMoment = currentTime;
    } else {
        this.recordTimestamps.modificationMoment = currentTime;
    }
};

FilmSchemaDefinition.pre('save', function (operationCompletion) {
    applyTimestampUpdates.call(this, this.isNew);
    operationCompletion();
});

const retrieveAllFeatures = function (responseCallback) {
    return this
        .find({})
        .sort('recordTimestamps.modificationMoment')
        .exec(responseCallback);
};

const locateFeatureByIdentifier = function (uniqueIdentifier, responseCallback) {
    return this
        .findOne({ _id: uniqueIdentifier })
        .exec(responseCallback);
};

FilmSchemaDefinition.statics = {
    fetchAll: retrieveAllFeatures,
    findEntryById: locateFeatureByIdentifier
};

module.exports = FilmSchemaDefinition;