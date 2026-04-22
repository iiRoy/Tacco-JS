function createTaskOperations(initialListIdentifier = '@default') {
    let clientLoadPromise = null;
    let currentTaskListId = initialListIdentifier;

    async function primeGoogleClient() {
        if (clientLoadPromise) {
            return clientLoadPromise;
        }

        clientLoadPromise = new Promise((resolveLoad, rejectLoad) => {
            gapi.client.load('tasks', 'v1', () => {
                resolveLoad();
            }).then(null, rejectLoad);
        });

        return clientLoadPromise;
    }

    async function fetchTaskCollection(resultHandler) {
        try {
            const authToken = await new Promise(resolveAuth => {
                liquid.helper.oauth.getAccessToken(resolveAuth);
            });

            console.log('Authentication Token Acquired >> ' + authToken.access_token);

            gapi.auth.setToken({
                access_token: authToken.access_token
            });

            await primeGoogleClient();

            const apiRequest = gapi.client.tasks.tasks.list({
                tasklist: currentTaskListId,
            });

            const apiResponse = await new Promise(resolveExecute => {
                apiRequest.execute(response => {
                    resolveExecute(response);
                });
            });

            if (resultHandler) {
                resultHandler(apiResponse);
            }

            return apiResponse;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    }

    return {
        initializeClientApi: primeGoogleClient,
        getTaskItems: fetchTaskCollection,
        updateDefaultList: (newId) => { currentTaskListId = newId; },
        queryDefaultList: () => currentTaskListId
    };
}