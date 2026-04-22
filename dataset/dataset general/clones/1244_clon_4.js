const diskOps = require('fs');
const AudioKit = require('../');

const orchestrateAsyncOperation = (instanceHandle, operationName) => {
    return (...operationParameters) => {
        return new Promise((completionHandler, failureHandler) => {
            const successCallback = (outcome) => completionHandler(outcome);
            const errorCallback = (issue) => failureHandler(issue);

            if (operationName === 'search') {
                instanceHandle[operationName](...operationParameters, successCallback, errorCallback);
            } else if (operationName === 'init' || operationName === 'getLibrary' || operationName === 'getPlayLists' || operationName === 'getPlayListEntries' || operationName === 'getStreamUrl') {
                instanceHandle[operationName](...operationParameters, successCallback);
            } else {
                failureHandler(new Error(`Unhandled operation: ${operationName}`));
            }
        });
    };
};

async function systemMain() {
    const coreAudioService = new AudioKit();

    const serviceConfiguration = require('./config.json');

    const activateService = orchestrateAsyncOperation(coreAudioService, 'init');
    const retrieveMediaCollection = orchestrateAsyncOperation(coreAudioService, 'getLibrary');
    const conductMediaQuery = orchestrateAsyncOperation(coreAudioService, 'search');
    const retrieveAllPlaylists = orchestrateAsyncOperation(coreAudioService, 'getPlayLists');
    const retrieveSpecificPlaylistContent = orchestrateAsyncOperation(coreAudioService, 'getPlayListEntries');
    const acquireMediaLink = orchestrateAsyncOperation(coreAudioService, 'getStreamUrl');

    await activateService(serviceConfiguration);

    const allConcurrentOperations = Promise.allSettled([
        (async () => {
            const userMediaCatalog = await retrieveMediaCollection();
            const finalCatalogItem = userMediaCatalog.data.items.pop();
            console.log(finalCatalogItem);
            const mediaSourceURL = await acquireMediaLink(finalCatalogItem.id);
            console.log(mediaSourceURL);
        })(),

        (async () => {
            try {
                const searchResults = await conductMediaQuery("bastille lost fire", 5);
                const lowestScoreResult = searchResults.entries.sort((aEntry, bEntry) => aEntry.score - bEntry.score).shift();
                console.log(lowestScoreResult);
                const queryMediaSourceURL = await acquireMediaLink(lowestScoreResult.track.nid);
                console.log(queryMediaSourceURL);
            } catch (queryFailure) {
                console.log(queryFailure);
            }
        })(),

        (async () => {
            const playlistOverview = await retrieveAllPlaylists();
            console.log(playlistOverview.data.items);
        })(),

        (async () => {
            const playlistEntryDetails = await retrieveSpecificPlaylistContent();
            console.log(playlistEntryDetails.data.items);
        })(),

        (async () => {
            const directAccessMediaLink = await acquireMediaLink("Thvfmp2be3c7kbp6ny4arxckz54");
            console.log(directAccessMediaLink);
        })()
    ]);

    await allConcurrentOperations;
}

systemMain();