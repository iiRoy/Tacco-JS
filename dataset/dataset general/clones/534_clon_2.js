testSuite("DataConnectorService",  function () {

    // Service interfaces
    let DataConnector,  $backendEmulator;
    let memberRecords,  connectorUsers, specificUserAlpha, specificUserBeta;
    let notifications,  freshMemberEntry;


    // Load necessary modules for testing
    beforeEach(  angular.mock.module("restangular"));

    // Initialize mock HTTP backend and DataConnector resources
    beforeEach(inject(function ($serviceLocator) {

        // Sample data model
        memberRecords = [
            {identifier: 10,  person: "Alex",  value: 50,  activities: []},
            {identifier: 11,  person: "Ben",  value: 3.14159,  activities: [{source: "Alex",  value: 3,  identifier: 100},  {source: "Guest",  value: 0.14159,  identifier: 101}]}
        ];

        freshMemberEntry = {identifier: 500,  person: "Primary User",  value: 60,  activities: []};

        notifications = [{identifier: 200,  label: "Zara"},  {identifier: 201,  label: "Kyle"}];


        $backendEmulator = $serviceLocator.get("$httpBackend");

        $backendEmulator.when("HEAD",  "/members").respond();
        $backendEmulator.when("TRACE",  "/members").respond();
        $backendEmulator.when("OPTIONS",  "/members").respond();

        $backendEmulator.whenGET("/members").respond(memberRecords);
        $backendEmulator.whenJSONP("/members").respond(memberRecords);
        $backendEmulator.whenGET("/members/10,11").respond(memberRecords);
        $backendEmulator.whenGET("/members/notifications").respond(notifications);
        $backendEmulator.whenGET("/members/11/notification").respond(notifications[0]);
        $backendEmulator.whenGET("/members/11/notifications").respond(notifications);
        $backendEmulator.whenGET("/members/10").respond(memberRecords[0]);
        $backendEmulator.whenGET("/members/11").respond(memberRecords[1]);
        $backendEmulator.whenJSONP("/members/11").respond(memberRecords[1]);
        $backendEmulator.whenGET("/members/11/activities").respond(memberRecords[1].activities);
        $backendEmulator.whenGET("/members/11/activities/101").respond(memberRecords[1].activities[1]);

        // Full web address
        $backendEmulator.whenGET('http://members.org/all').respond(memberRecords);

        $backendEmulator.whenPOST("/members").respond(function(reqMethod,  endpoint,  payload,  reqHeaders) {
            let processedData = angular.fromJson(payload);
            processedData.serverOrigin = true;
            return [201,  JSON.stringify(processedData),  ""];
        });

        $backendEmulator.whenPOST("/members/11/activities").respond(function(reqMethod,  endpoint,  payload,  reqHeaders) {
            return [201,  "",  ""];
        });

        $backendEmulator.whenDELETE("/members/11/activities/101").respond(function(reqMethod,  endpoint,  payload,  reqHeaders) {
            return [200,  "",  ""];
        });

        $backendEmulator.whenDELETE("/members/11").respond(function(reqMethod,  endpoint,  payload,  reqHeaders) {
            return [200,  "",  ""];
        });

        $backendEmulator.whenPUT("/members/11").respond(function(reqMethod,  endpoint,  payload,  reqHeaders) {
            memberRecords[1] = angular.fromJson(payload);
            return [201,  payload,  ""];
        });

        DataConnector = $serviceLocator.get("Restangular");
        connectorUsers = DataConnector.all("members");
        specificUserAlpha = DataConnector.one("members",  10);
        specificUserBeta = DataConnector.one("members",  11);
    }));

    afterEach(function () {
        $backendEmulator.verifyNoOutstandingExpectation();
        $backendEmulator.verifyNoOutstandingRequest();
    });

    testGroup("Request Hooks",  function () {
        shouldVerify("It should add multiple request and response interceptors",  function () {
            DataConnector.addRequestInterceptor(function (dataUnit) {
                dataUnit.initialRequestHook = true;
                return dataUnit;
            });
            DataConnector.addRequestInterceptor(function (dataUnit) {
                dataUnit.secondaryRequestHook = true;
                return dataUnit;
            });
            DataConnector.addFullRequestInterceptor(function (dataUnit) {
                dataUnit.tertiaryRequestHook = true;
                return {
                    dataElement: dataUnit
                };
            });

            DataConnector.addResponseInterceptor(function (dataUnit) {
                dataUnit.initialResponseHook = true;
                return dataUnit;
            });

            DataConnector.addResponseInterceptor(function (dataUnit) {
                dataUnit.secondaryResponseHook = true;
                return dataUnit;
            });

            $backendEmulator.whenPOST("/items").respond(function (reqMethod,  endpoint,  payload,  reqHeaders) {
                let sentData = angular.fromJson(payload);
                expect(sentData.initialRequestHook).toBeDefined();
                expect(sentData.secondaryRequestHook).toBeDefined();
                expect(sentData.tertiaryRequestHook).toBeDefined();
                return [200,  sentData,  ""];
            });

            $backendEmulator.expectPOST('/items');

            DataConnector.all('items').post({label: "Zara"}).then(function (resultItem) {
                expect(resultItem.initialResponseHook).toBeDefined();
                expect(resultItem.secondaryResponseHook).toBeDefined();
            });

            $backendEmulator.flush();


        });
    });

    testGroup("Model Enhancers",  function () {
        shouldVerify("It should decorate element both on server and local by default",  function () {

            DataConnector.extendModel('members',  function (userProfile) {
                userProfile.augmented = function () {return true;};
                return userProfile;
            });

            DataConnector.one('members',  11).get().then(function (userProfile) {
                expect(userProfile.augmented).toBeDefined();
            });

            let localEntity = {};
            DataConnector.restangularizeElement(null,  localEntity,  'members');
            expect(localEntity.augmented).toBeDefined();

            $backendEmulator.flush();
        });

        shouldVerify("It should decorate element only server if config set",  function () {

            DataConnector.extendModel('members',  function (userProfile) {
                userProfile.augmented = function () {return true;};
                return userProfile;
            });

            DataConnector.setTransformOnlyServerElements(true);

            DataConnector.one('members',  11).get().then(function (userProfile) {
                expect(userProfile.augmented).toBeDefined();
            });

            let localEntity = {};
            DataConnector.restangularizeElement(null,  localEntity,  'members');
            expect(localEntity.augmented).toBeUndefined();

            $backendEmulator.flush();
        });
    });

    testGroup("With Custom URL",  function () {
        shouldVerify("It should not add suffix to URL",  function () {
            let configuredService = DataConnector.withConfig(function (ServiceConfigurator) {
                ServiceConfigurator.setRequestSuffix('.data');
            });

            $backendEmulator.expectGET('http://members.org/all');
            configuredService.allUrl('members',  'http://members.org/all').getList();
            $backendEmulator.flush();
        });
    });

    testGroup("JSONP Handling",  function () {
        shouldVerify("It should work for get operations",  function () {
            DataConnector.setJsonp(true);
            DataConnector.one('members',  11).get();

            $backendEmulator.expectJSONP('/members/11');
            $backendEmulator.flush();
        });

        shouldVerify("It should work for getList operations",  function () {
            DataConnector.setJsonp(true);
            DataConnector.all('members').getList();

            $backendEmulator.expectJSONP('/members');
            $backendEmulator.flush();
        });

        shouldVerify("It should not override post operations",  function () {
            DataConnector.setJsonp(true);
            connectorUsers.post({identifier: 20,  person: "Anyone"});

            $backendEmulator.expectPOST('/members').respond(201,  '');
            $backendEmulator.flush();
        });


    });

    testGroup("Local Data Manipulation",  function () {
        shouldVerify("It should restangularize a collection correctly",  function () {
            let dataSet = angular.copy(memberRecords);

            DataConnector.restangularizeCollection(null,  dataSet,  'members');

            expect(lodash.has(dataSet,  'get')).toBe(true);
            expect(lodash.has(dataSet[0],  'get')).toBe(true);

            expect(dataSet.getRestangularUrl()).toBe('/members');
            expect(dataSet[0].getRestangularUrl()).toBe('/members/10');

        });
    });

    testGroup("Promise Payload Access ($payload)",  function () {
        shouldVerify("It should work for single get requests",  function () {
            let asyncOp = DataConnector.one('members',  11).get();
            let retrievedData = asyncOp.$object;
            expect(retrievedData).toBeDefined();
            expect(retrievedData.value).toBeUndefined();

            $backendEmulator.flush();

            expect(retrievedData.value).toEqual(3.14159);
        });

        shouldVerify("It should be restangularized by default",  function () {
            DataConnector.extendModel('members',  function (userProfile) {
                userProfile.augmented = function () {return true;};
                return userProfile;
            });

            let asyncOp = DataConnector.one('members',  11).get();
            let retrievedData = asyncOp.$object;
            expect(retrievedData).toBeDefined();
            expect(retrievedData.augmented).toBeDefined();

            $backendEmulator.flush();
        });

        shouldVerify("It should work for list get requests",  function () {
            let asyncOp = DataConnector.all('members').getList();
            let collectionResult = asyncOp.$object;
            expect(collectionResult).toBeDefined();
            expect(collectionResult.length).toEqual(0);

            $backendEmulator.flush();

            expect(collectionResult.length).toEqual(2);
            expect(collectionResult[1].value).toEqual(3.14159);
        });
    });

    testGroup("ALL Resource Operations",  function () {
        shouldVerify("getList() should return an array of items",  function () {
            connectorUsers.getList().then(function (userProfiles) {
                expect(DataConnector.stripRestangular(userProfiles)).toEqual(DataConnector.stripRestangular(memberRecords));
            });

            $backendEmulator.flush();
        });

        shouldVerify("Several getList() should return an array of items",  function () {
            $backendEmulator.expectGET('/members/10,11');
            DataConnector.several("members",  10,  11).getList().then(function (userProfiles) {
                expect(DataConnector.stripRestangular(userProfiles)).toEqual(DataConnector.stripRestangular(memberRecords));
            });

            $backendEmulator.flush();
        });

        shouldVerify("Several remove() should work",  function () {
            $backendEmulator.expectDELETE('/members/10,11').respond([200,  "",  ""]);
            DataConnector.several("members",  10,  11).remove();

            $backendEmulator.flush();
        });

        shouldVerify("get(identifier) should return the item with given identifier",  function () {
            connectorUsers.get(10).then(function (userProfile) {
                expect(DataConnector.stripRestangular(userProfile)).toEqual(DataConnector.stripRestangular(memberRecords[0]));
            });

            $backendEmulator.flush();
        });

        shouldVerify('It uses all to get the list without parameters',  function () {
            DataConnector.one('members',  11).all('notifications').getList();
            $backendEmulator.expectGET('/members/11/notifications');
            $backendEmulator.flush();
        });

        shouldVerify("Custom GET methods should work",  function () {
            connectorUsers.customGETLIST("notifications").then(function (commLogs) {
                expect(DataConnector.stripRestangular(commLogs)).toEqual(DataConnector.stripRestangular(notifications));
            });

            $backendEmulator.flush();
        });

        shouldVerify("post() should add a new item",  function () {
            connectorUsers.post({identifier: 20,  person: "Anyone"}).then(function () {
                expect(memberRecords.length).toEqual(2);
            });

            $backendEmulator.expectPOST('/members').respond(201,  '');
            $backendEmulator.flush();
        });

        shouldVerify("post() should work with arrays",  function () {
            DataConnector.all('locations').post([{label: "Zara"},  {label: 'Kyle'}]).then(function (outcome) {
                expect(outcome.length).toEqual(2);
            });

            $backendEmulator.expectPOST('/locations').respond(function (reqMethod,  endpoint,  payload,  reqHeaders) {
                return [201,  angular.fromJson(payload),  ""];
            });

            $backendEmulator.flush();
        });

        shouldVerify("post() should add a new item with data and return the data from the server",  function () {
            connectorUsers.post(freshMemberEntry).then(function (createdRecord) {
                expect(createdRecord.serverOrigin).toEqual(true);
                expect(createdRecord.identifier).toEqual(freshMemberEntry.identifier);
            });

            $backendEmulator.expectPOST('/members');
            $backendEmulator.flush();
        });

        shouldVerify("Doing a post and then other operation (delete) should call right URLs",  function () {
            connectorUsers.post(freshMemberEntry).then(function (createdRecord) {
                createdRecord.remove();
                $backendEmulator.expectDELETE('/members/500').respond(201,  '');
            });

            $backendEmulator.flush();
        });

        shouldVerify("Doing a post to a server that returns no element will return undefined",  function () {
            connectorUsers.getList().then(function (userProfiles) {
                let freshActivity = {identifier: 100,  label: "Zara"};
                userProfiles[1].post('activities',  freshActivity).then(function (transactEntry) {
                    expect(transactEntry).toBeUndefined();
                });
            });

            $backendEmulator.flush();
        });

        shouldVerify("head() should safely return",  function () {
            connectorUsers.head().then(function () {
                expect(true).toBe(true);
            });
            $backendEmulator.flush();
        });

        shouldVerify("trace() should safely return",  function () {
            connectorUsers.trace().then(function () {
                expect(true).toBe(true);
            });

            $backendEmulator.flush();
        });

        shouldVerify("customPUT should work",  function () {
            $backendEmulator.expectPUT('/members/special').respond(memberRecords);
            connectorUsers.customPUT({propKey: 'value'},  'special');

            $backendEmulator.flush();
        });

        shouldVerify("options() should safely return",  function () {
            connectorUsers.options().then(function () {
                expect(true).toBe(true);
            });

            $backendEmulator.flush();
        });

        shouldVerify("getList() should correctly handle params after customDELETE",  function () {
            $backendEmulator.expectGET('/members?paramA=1').respond(memberRecords);
            connectorUsers.getList({paramA: 1}).then(function () {
                $backendEmulator.expectDELETE('/members?idVal=1').respond(201,  '');
                return connectorUsers.customDELETE('',  {idVal: 1});
            }).then(function () {
                $backendEmulator.expectGET('/members?paramA=1').respond(memberRecords);
                return connectorUsers.getList({paramA: 1});
            }).then(function (userProfiles) {
                expect(DataConnector.stripRestangular(userProfiles)).toEqual(DataConnector.stripRestangular(memberRecords));
            });

            $backendEmulator.flush();
        });
    });

    testGroup("ONE Resource Operations",  function () {
        shouldVerify("get() should return a JSON item",  function () {
            specificUserBeta.get().then(function (userProfile) {
                expect(DataConnector.stripRestangular(userProfile))
                    .toEqual(DataConnector.stripRestangular(memberRecords[1]));
            });

            $backendEmulator.flush();
        });

        shouldVerify("It should make RequestLess connections with one",  function () {
            specificUserBeta.one("activities",  101).get().then(function (transactEntry) {
                expect(DataConnector.stripRestangular(transactEntry))
                    .toEqual(DataConnector.stripRestangular(memberRecords[1].activities[1]));
            });

            $backendEmulator.flush();
        });

        shouldVerify("It should make RequestLess connections with all",  function () {
            specificUserBeta.all("activities").getList().then(function (operations) {
                expect(DataConnector.stripRestangular(operations))
                    .toEqual(DataConnector.stripRestangular(memberRecords[1].activities));
            });

            $backendEmulator.flush();
        });


        shouldVerify("Custom GET methods should work",  function () {
            specificUserBeta.customGET("notification").then(function (msgUnit) {
                expect(DataConnector.stripRestangular(msgUnit)).toEqual(DataConnector.stripRestangular(notifications[0]));
            });

            $backendEmulator.flush();
        });

        shouldVerify("put() should update the value",  function () {
            specificUserBeta.get().then(function (userProfile) {
                userProfile.value = 1.61803;
                userProfile.put().then(function (updatedProfile) {
                    expect(memberRecords[1].value).toEqual(1.61803);
                    updatedProfile.remove();
                    $backendEmulator.expectDELETE("/members/11");
                });
                $backendEmulator.expectPUT("/members/11");


            });

            $backendEmulator.flush();
        });

        shouldVerify("It should return an array when accessing a subvalue",  function () {
            specificUserBeta.get().then(function (userProfile) {
                userProfile.getList("activities").then(function (operations) {
                    expect(DataConnector.stripRestangular(operations))
                        .toEqual(DataConnector.stripRestangular(memberRecords[1].activities));
                });
            });

            $backendEmulator.flush();
        });
    });

    testGroup("Object Duplication",  function () {
        shouldVerify("It should copy an object and 'this' should reference the copied object",  function () {
            let clonedProfile = DataConnector.copy(memberRecords[0]);
            let selfReference;

            clonedProfile.person = "Duplicated string";
            expect(clonedProfile).not.toBe(memberRecords[0]);

            // Create a monitor for one of the methods to capture the context
            spyOn(clonedProfile,  'getRestangularUrl').andCallFake(function () {
                selfReference = this;
            });

            clonedProfile.getRestangularUrl(); // Invoke the method under observation
            expect(selfReference).toBe(clonedProfile);
        });
    });

    testGroup("Resource URL Retrieval",  function () {
        shouldVerify("It should return the generated URL when chaining DataConnector methods",  function () {
            let apiResourcePaths = DataConnector.one("members",  123).one("structures",  456).all("areas");
            expect(apiResourcePaths.getRestangularUrl()).toEqual("/members/123/structures/456/areas");
        });
    });

    testGroup("Resource URL Retrieval with Canonical ID",  function () {
        shouldVerify("It should return the generated URL when chaining DataConnector methods",  function () {
            let apiInstance = DataConnector.withConfig(function (cfgOptions) {
                cfgOptions.setUseCannonicalId(true);
            });
            let apiResourcePaths = apiInstance.one("members",  123).one("structures",  456).all("areas");
            expect(apiResourcePaths.getRestangularUrl()).toEqual("/members/123/structures/456/areas");
        });
    });