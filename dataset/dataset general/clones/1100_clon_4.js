const focusGroup = describe;
const testCase = it;
const beforeEachRun = beforeEach;
const afterEachRun = afterEach;
const assert = expect;

function createResourceAgent(setupInfo) {
    const root = setupInfo.rootPath;
    const entity = setupInfo.entityName;

    const formatQueryParams = (queryMap) => {
        if (queryMap === undefined || queryMap === null) return '';
        if (typeof queryMap !== 'object' || Array.isArray(queryMap)) {
            throw new Error('Options must be passed as object.');
        }
        const segments = Object.keys(queryMap).reduce((accumulator, currentKey) => {
            accumulator.push(`${encodeURIComponent(currentKey)}=${encodeURIComponent(queryMap[currentKey])}`);
            return accumulator;
        }, []);
        return segments.length > 0 ? '?' + segments.join('&') : '';
    };

    const initiateNetworkCall = (methodVerb, resourcePath, contentPayload, completionCallback) => {
        const networkRequest = new XMLHttpRequest();
        networkRequest.open(methodVerb, resourcePath);
        if (contentPayload && (methodVerb === 'POST' || methodVerb === 'PUT')) {
            networkRequest.setRequestHeader('Content-Type', 'application/json');
            networkRequest.send(JSON.stringify(contentPayload));
        } else {
            networkRequest.send();
        }
    };

    return {
        retrieveAll: (completion, queryOptions) => {
            const queryComponent = formatQueryParams(queryOptions);
            const fullPath = `${root}${entity}/${queryComponent}`;
            initiateNetworkCall('GET', fullPath, null, completion);
        },
        locateOne: (idValue, completion, queryOptions) => {
            const queryComponent = formatQueryParams(queryOptions);
            const fullPath = `${root}${entity}/${idValue}${queryComponent}`;
            initiateNetworkCall('GET', fullPath, null, completion);
        },
        depositItem: (itemData, completion, queryOptions) => {
            const queryComponent = formatQueryParams(queryOptions);
            const fullPath = `${root}${entity}/${queryComponent}`;
            initiateNetworkCall('POST', fullPath, itemData, completion);
        },
        modifyRecord: (idValue, itemData, completion, queryOptions) => {
            const queryComponent = formatQueryParams(queryOptions);
            const fullPath = `${root}${entity}/${idValue}${queryComponent}`;
            initiateNetworkCall('PUT', fullPath, itemData, completion);
        },
        removeEntry: (idValue, completion, queryOptions) => {
            const queryComponent = formatQueryParams(queryOptions);
            const fullPath = `${root}${entity}/${idValue}${queryComponent}`;
            initiateNetworkCall('DELETE', fullPath, null, completion);
        }
    };
}

focusGroup('API resource access operations', function () {
    var personnelData;

    beforeEachRun(function () {
        jasmine.Ajax.install();
        personnelData = createResourceAgent({
            rootPath: '/api/v3/',
            entityName: 'people'
        });
    });

    afterEachRun(function () {
        jasmine.Ajax.uninstall();
    });

    focusGroup('Query parameter handling', function () {
        testCase('should throw an issue if options are not passed as object', function () {
            try {
                personnelData.retrieveAll(function (issue, payload) {}, 'some string');
            } catch (issue) {
                assert(issue.message).toEqual('Options must be passed as object.');
            }
        });

        testCase('should not append query when no options are provided', function () {
            personnelData.retrieveAll(function (issue, payload) {});
            assert(jasmine.Ajax.requests.mostRecent().url).toBe('/api/v3/people/');
        });

        testCase('should append query for retrieveAll method', function () {
            personnelData.retrieveAll(function (issue, payload) {}, { kind: 'nice', job: 'developers' });
            assert(jasmine.Ajax.requests.mostRecent().url).toBe('/api/v3/people/?kind=nice&job=developers');
        });

        testCase('should append query for locateOne method', function () {
            personnelData.locateOne(12, function (issue, payload) {}, { job: 'developers' });
            assert(jasmine.Ajax.requests.mostRecent().url).toBe('/api/v3/people/12?job=developers');
        });

        testCase('should append query for depositItem method', function () {
            personnelData.depositItem({ name: 'apy' }, function (issue, payload) {}, { job: 'developers' });
            assert(jasmine.Ajax.requests.mostRecent().url).toBe('/api/v3/people/?job=developers');
        });

        testCase('should append query for modifyRecord method', function () {
            personnelData.modifyRecord(12, { name: 'apy' }, function (issue, payload) {}, { changed: 'name' });
            assert(jasmine.Ajax.requests.mostRecent().url).toBe('/api/v3/people/12?changed=name');
        });

        testCase('should append query for removeEntry method', function () {
            personnelData.removeEntry(12, function (issue, payload) {}, { soft: true });
            assert(jasmine.Ajax.requests.mostRecent().url).toBe('/api/v3/people/12?soft=true');
        });
    });

    focusGroup('HTTP Method Verification', function () {
        testCase('should send GET request for retrieveAll', function () {
            personnelData.retrieveAll(function (issue, payload) {});
            assert(jasmine.Ajax.requests.mostRecent().method).toBe('GET');
        });

        testCase('should send GET request for locateOne', function () {
            personnelData.locateOne(12, function (issue, payload) {});
            assert(jasmine.Ajax.requests.mostRecent().method).toBe('GET');
        });

        testCase('should send POST request for depositItem', function () {
            personnelData.depositItem({ name: 12 }, function (issue, payload) {});
            assert(jasmine.Ajax.requests.mostRecent().method).toBe('POST');
        });

        testCase('should send PUT request for modifyRecord', function () {
            personnelData.modifyRecord(12, { name: 'apy' }, function (issue, payload) {});
            assert(jasmine.Ajax.requests.mostRecent().method).toBe('PUT');
        });

        testCase('should send DELETE request for removeEntry', function () {
            personnelData.removeEntry(12, function (issue, payload) {});
            assert(jasmine.Ajax.requests.mostRecent().method).toBe('DELETE');
        });
    });

    focusGroup('URL Path Accuracy', function () {
        testCase('should point to right url for retrieveAll', function () {
            personnelData.retrieveAll(function (issue, payload) {});
            assert(jasmine.Ajax.requests.mostRecent().url).toBe('/api/v3/people/');
        });

        testCase('should point to right url for locateOne', function () {
            personnelData.locateOne(12, function (issue, payload) {});
            assert(jasmine.Ajax.requests.mostRecent().url).toBe('/api/v3/people/12');
        });

        testCase('should point to right url for depositItem', function () {
            personnelData.depositItem({ name: 12 }, function (issue, payload) {});
            assert(jasmine.Ajax.requests.mostRecent().url).toBe('/api/v3/people/');
        });

        testCase('should point to right url for modifyRecord', function () {
            personnelData.modifyRecord(12, { name: 'apy' }, function (issue, payload) {});
            assert(jasmine.Ajax.requests.mostRecent().url).toBe('/api/v3/people/12');
        });

        testCase('should point to right url for removeEntry', function () {
            personnelData.removeEntry(12, function (issue, payload) {});
            assert(jasmine.Ajax.requests.mostRecent().url).toBe('/api/v3/people/12');
        });
    });
});