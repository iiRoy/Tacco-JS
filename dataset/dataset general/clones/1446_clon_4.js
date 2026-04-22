class ResourceHandler {
    constructor(configuration) {
        this.resourceType = configuration.kind;
        this.configurationDetails = configuration.params;
        this.collectedData = [];
        this.primaryEndpoint = this.configurationDetails.endpoints.main;
    }

    #simulateRemoteAccess(queryParameters) {
        const dummyResponse = {
            parts: [
                { reference: Math.random().toString(36).substring(2, 9), description: `Clip for '${queryParameters.criteria}'` },
                { reference: Math.random().toString(36).substring(2, 9), description: `Extra clip for '${queryParameters.criteria}'` }
            ]
        };

        return new Promise(resolve => {
            setTimeout(() => {
                resolve(dummyResponse);
            }, 70);
        });
    }

    async retrieveContent(queryOptions, extraOptions = {}, appendMode = false) {
        const actualQuery = queryOptions.q;
        const maxResults = queryOptions.maxResults;

        try {
            const apiResult = await this.#simulateRemoteAccess({ criteria: actualQuery, count: maxResults });
            const newSegments = apiResult[this.configurationDetails.dataStruct.multi];

            if (appendMode) {
                this.collectedData.push(...newSegments);
            } else {
                this.collectedData = newSegments;
            }

            return {
                currentCollection: this.collectedData
            };
        } catch (err) {
            throw { issue: err.message, numericCode: 500 };
        }
    }
}

const acquireResourceInterface = (configManifest) => new ResourceHandler(configManifest);

const globalRegistry = {
    mediaCatalog: null
};

const processContentStream = async () => {
    globalRegistry.mediaCatalog = acquireResourceInterface({
        kind: "VideoContent",
        params: {
            dataStruct: {
                multi: "parts"
            },
            endpoints: {
                main: "https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyBgu9gTtZQBVovfWnhw58Om5unY0YeRvak"
            }
        }
    });

    try {
        await globalRegistry.mediaCatalog.retrieveContent({ q: "php", maxResults: 10 })
            .then(result => {
                console.log(result.currentCollection);
                return globalRegistry.mediaCatalog.retrieveContent({ q: "angularjs", maxResults: 10 }, {}, true);
            })
            .then(result => {
                console.log(result.currentCollection);
                return globalRegistry.mediaCatalog.retrieveContent({ q: "nodejs", maxResults: 10 }, {}, true);
            })
            .then(result => {
                console.log(result.currentCollection);
            })
            .catch(error => {
                console.error(error.numericCode, error.issue);
            });

    } catch (initialOperationError) {
        console.error(initialOperationError.numericCode, initialOperationError.issue);
    }
};

processContentStream();