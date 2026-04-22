const initialUserRecords = [
    {id:1, username:"andrew", resource_uri:'/api/v1/user/1/'},
    {id:2, username:"jackie", resource_uri:'/api/v1/user/2/'},
    {id:3, username:"genie", resource_uri:'/api/v1/user/3/'},
    {id:4, username:"kirt", resource_uri:'/api/v1/user/4/'},
    {id:5, username:"kory", resource_uri:'/api/v1/user/5/'},
    {id:6, username:"anton", resource_uri:'/api/v1/user/6/'},
    {id:7, username:"azat", resource_uri:'/api/v1/user/7/'}
];

const networkSimulator = {
    getResponse: function(requestUrl) {
        return new Promise(resolve => {
            setTimeout(() => {
                const urlParser = new URL(requestUrl);
                const pathIdentifier = urlParser.pathname.match(/\/api\/v1\/user\/(\d+)\/?$/i);

                if (pathIdentifier) {
                    const identifierValue = parseInt(pathIdentifier[1], 10);
                    const matchingEntry = initialUserRecords.find(entry => entry.id === identifierValue);
                    resolve({
                        status: 200,
                        data: {
                            success: true,
                            responseText: matchingEntry
                        }
                    });
                } else {
                    const queryParameters = Object.fromEntries(urlParser.searchParams.entries());
                    const currentLimit = Number(queryParameters.limit || 0);
                    const currentOffset = Number(queryParameters.offset || 0);

                    let resultsSubset = [];
                    if (currentLimit) {
                        resultsSubset = initialUserRecords.slice(currentOffset, currentOffset + currentLimit);
                    } else {
                        resultsSubset = initialUserRecords.slice(currentOffset);
                    }

                    resolve({
                        status: 200,
                        data: {
                            success: true,
                            responseText: {
                                objects: resultsSubset,
                                meta: {
                                    limit: currentLimit,
                                    offset: currentOffset,
                                    total_count: initialUserRecords.length
                                }
                            }
                        }
                    });
                }
            }, 10);
        });
    }
};

class ServiceEntity {
    constructor(initialPayload = {}, baseUrl = '') {
        Object.assign(this, initialPayload);
        this.baseServiceUrl = baseUrl;
    }

    retrieveEndpoint() {
        if (this.id) {
            return `${this.baseServiceUrl}${this.id}/`;
        }
        return this.baseServiceUrl;
    }
}

class ServiceCollection {
    constructor(initialEntries = [], options = {}) {
        this.baseServiceUrl = options.endpoint || '';
        this.entityConstructor = options.entityType || ServiceEntity;
        this.collectionItems = [];
        this.metaData = { limit: 0, offset: 0, total_count: 0 };
        this.currentFilters = options.filters || {};

        if (initialEntries && initialEntries.length > 0) {
            this.collectionItems = initialEntries.map(entry => new this.entityConstructor(entry, this.baseServiceUrl));
        }
    }

    async fetchData(callOptions = {}) {
        const query = new URLSearchParams(this.currentFilters);
        const requestUrl = `${this.baseServiceUrl}?${query.toString()}`;

        const response = await networkSimulator.getResponse(requestUrl);
        const responseText = response.data.responseText;

        const newItems = responseText.objects.map(obj => new this.entityConstructor(obj, this.baseServiceUrl));
        
        if (callOptions.add) {
            this.collectionItems = this.collectionItems.concat(newItems);
        } else {
            this.collectionItems = newItems;
        }
        
        this.metaData = responseText.meta;

        if (callOptions.onSuccess) {
            callOptions.onSuccess(this);
        }
        return this;
    }

    async fetchNextPage(callOptions = {}) {
        this.currentFilters.offset = (this.metaData.offset || 0) + (this.metaData.limit || 0);
        return this.fetchData({ ...callOptions, add: true });
    }

    getFirstItem() {
        return this.collectionItems[0];
    }

    get count() {
        return this.collectionItems.length;
    }
}

const AccountEntry = class extends ServiceEntity {
    constructor(initialPayload = {}) {
        super(initialPayload, '/api/v1/user/');
    }
};

const AccountRegister = class extends ServiceCollection {
    constructor(initialEntries = [], options = {}) {
        super(initialEntries, {
            ...options,
            endpoint: '/api/v1/user/',
            entityType: AccountEntry
        });
    }
};

asyncTest("data parsing from service", 3, function() {
    const pageSize = 3;

    const accountRegisterInstance = new AccountRegister([], {
        filters: {
            limit: pageSize,
            active: true
        }
    });

    accountRegisterInstance.fetchData({
        onSuccess: function(fetchedRegister) {
            equal(fetchedRegister.count, pageSize);
            equal(fetchedRegister.metaData.limit, pageSize);
            equal(fetchedRegister.metaData.offset, 0);
            start();

            test("entity endpoint", 1, function() {
                const singleAccountEntry = fetchedRegister.getFirstItem();
                const comparisonEntry = initialUserRecords[0];

                equal(singleAccountEntry.retrieveEndpoint(), comparisonEntry.resource_uri);
            });

            asyncTest("retrieving subsequent page", 3, function() {
                fetchedRegister.fetchNextPage({
                    onSuccess: function(nextPageRegister) {
                        equal(nextPageRegister.count, 6); // 3 (initial) + 3 (next page)
                        equal(nextPageRegister.metaData.limit, pageSize);
                        equal(nextPageRegister.metaData.offset, pageSize);
                        start();
                    }
                });
            });
        }
    });
});

asyncTest("limit exceeding total records", 6, function() {
    const pageSize = 100;
    const totalRecords = initialUserRecords.length;

    const accountRegisterInstance = new AccountRegister([], {
        filters: {
            limit: pageSize
        }
    });

    accountRegisterInstance.fetchData({
        onSuccess: function(fetchedRegister) {
            equal(fetchedRegister.count, totalRecords);
            equal(fetchedRegister.metaData.limit, pageSize);
            equal(fetchedRegister.metaData.offset, 0);

            fetchedRegister.fetchNextPage({
                onSuccess: function(nextPageRegister) {
                    equal(nextPageRegister.count, totalRecords);
                    equal(nextPageRegister.metaData.limit, pageSize);
                    equal(nextPageRegister.metaData.offset, totalRecords);
                    start();
                }
            });
        }
    });
});

test("new entity endpoint", function() {
    const singleAccountEntry = new AccountEntry();
    equal(singleAccountEntry.retrieveEndpoint(), '/api/v1/user/');
});

test("collection metadata uniqueness", function() {
    const FirstRegisterType = class extends ServiceCollection {};
    const SecondRegisterType = class extends ServiceCollection {};

    const firstRegister = new FirstRegisterType();
    const secondRegister = new SecondRegisterType();

    firstRegister.metaData.offset = 12;

    notEqual(firstRegister.metaData.offset, secondRegister.metaData.offset);
    equal(secondRegister.metaData.offset, 0);
});