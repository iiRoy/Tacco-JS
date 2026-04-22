const fetch = require('node-fetch');

module.exports = async (messenger, inputData, finalizer) => {
    try {
        const resourceAddress = 'https://rawgit.com/mridgway/10be75846faa22eb6e22/raw/';
        const requestSettings = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        const serverResponse = await fetch(resourceAddress, requestSettings);

        if (!serverResponse.ok) {
            throw new Error(`HTTP fetch failed with status: ${serverResponse.status} ${serverResponse.statusText}`);
        }

        const retrievedObjects = await serverResponse.json();

        messenger.dispatch('RECEIVE_MESSAGES', retrievedObjects);
        finalizer();
    } catch (processingError) {
        // The original code does not explicitly call 'done()' on error.
        // Mimic this behavior by not calling 'finalizer()' in the catch block.
        // The error itself would propagate or be logged, matching original's implicit failure.
        console.error('Data retrieval operation encountered an error:', processingError.message);
    }
};