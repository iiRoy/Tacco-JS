describe("DataService Integration", function() {
  // Core API components for testing
  var DataService, $mockServer;
  var userAccountsData, dataServiceUsers, dataServiceUser0, dataServiceUser1;
  var notificationMsgs, freshUserData;

  // Load the application's primary module
  beforeEach(angular.mock.module("restangular")); // Retain module name as it's an external dependency

  // Initialize mock HTTP backend and DataService resources
  beforeEach(inject(function($injector) {
    // Define initial dataset for user accounts
    userAccountsData = [
      {userID: 10, userName: "Alice", balance: 42.00, transactionsList: []},
      {userID: 11, userName: "Bob", balance: 3.14, transactionsList: [{fromParty: "Alice", value: 3.00, txnID: 201}, {fromParty: "Guest", value: 0.14, txnID: 202}]}
    ];

    // Define a new user entry for creation tests
    freshUserData = {userID: 99, userName: "New Participant", balance: 45.00, transactionsList: []};

    // Define mock notification messages
    notificationMsgs = [{msgID: 101, sender: "Alice"}, {msgID: 102, sender: "Bob"}];

    // Retrieve the mocked HTTP backend service
    $mockServer = $injector.get("$httpBackend");

    // Define base API path for clarity
    const apiBasePath = '/v1';

    // Mock various HTTP requests
    $mockServer.when("HEAD", apiBasePath + "/accounts").respond();
    // Removed TRACE and OPTIONS as they are less frequently tested and can be considered non-essential for a clone.

    $mockServer.whenGET(apiBasePath + "/accounts").respond(userAccountsData);
    $mockServer.whenJSONP(apiBasePath + "/accounts").respond(userAccountsData);
    $mockServer.whenGET(apiBasePath + "/accounts/10,11").respond(userAccountsData);
    $mockServer.whenGET(apiBasePath + "/accounts/notificationMsgs").respond(notificationMsgs);
    $mockServer.whenGET(apiBasePath + "/accounts/11/singleMsg").respond(notificationMsgs[0]);
    $mockServer.whenGET(apiBasePath + "/accounts/11/messages").respond(notificationMsgs);
    $mockServer.whenGET(apiBasePath + "/accounts/10").respond(userAccountsData[0]);
    $mockServer.whenGET(apiBasePath + "/accounts/11").respond(userAccountsData[1]);
    $mockServer.whenJSONP(apiBasePath + "/accounts/11").respond(userAccountsData[1]);
    $mockServer.whenGET(apiBasePath + "/accounts/11/transactionsList").respond(userAccountsData[1].transactionsList);
    $mockServer.whenGET(apiBasePath + "/accounts/11/transactionsList/202").respond(userAccountsData[1].transactionsList[1]);

    // Mock for requests to a full external URL
    $mockServer.whenGET('http://api.external.com/users').respond(userAccountsData);

    // Mock POST request to create a new account
    $mockServer.whenPOST(apiBasePath + "/accounts").respond(function(method, url, data, headers) {
      var postedData = angular.fromJson(data);
      postedData.serverGeneratedFlag = true; // Add a new property
      postedData.creationTimestamp = new Date().toISOString(); // Add another property
      return [201, JSON.stringify(postedData), ""];
    });

    // Mock POST for adding a transaction
    $mockServer.whenPOST(apiBasePath + "/accounts/11/transactionsList").respond(function(method, url, data, headers) {
      // Simple validation: check if 'value' is present in the transaction
      const txn = angular.fromJson(data);
      if (!txn || typeof txn.value === 'undefined') {
        return [400, "Missing transaction value", ""];
      }
      return [201, "", ""];
    });

    // Mock DELETE for a specific transaction
    $mockServer.whenDELETE(apiBasePath + "/accounts/11/transactionsList/202").respond(200, "", ""); // Simplified response

    // Mock DELETE for an account
    $mockServer.whenDELETE(apiBasePath + "/accounts/11").respond(200, "", "");

    // Mock PUT to update an account
    $mockServer.whenPUT(apiBasePath + "/accounts/11").respond(function(method, url, data, headers) {
      userAccountsData[1] = angular.fromJson(data); // Update the internal data model
      return [200, data, ""]; // Changed status to 200 for update success
    });

    // Retrieve the main DataService instance
    DataService = $injector.get("Restangular"); // Keep the original name for the injected service
    dataServiceUsers = DataService.all("accounts");
    dataServiceUser0 = DataService.one("accounts", 10);
    dataServiceUser1 = DataService.one("accounts", 11);
  }));

  // Ensure no pending HTTP expectations or requests after each test
  afterEach(function() {
    $mockServer.verifyNoOutstandingExpectation();
    $mockServer.verifyNoOutstandingRequest();
  });

  describe("Request/Response Pipeline", function() {
    it("Should apply multiple request and response interceptors sequentially", function() {
      DataService.addRequestInterceptor(function(requestObject) {
        requestObject.reqPhaseOne = true;
        return requestObject;
      });
      DataService.addFullRequestInterceptor(function(fullReqObject) {
        fullReqObject.element.reqPhaseTwo = true; // Access element via the full object
        return {
          element: fullReqObject.element
        };
      });

      DataService.addResponseInterceptor(function(responseObject) {
        responseObject.resPhaseOne = true;
        return responseObject;
      });
      DataService.addResponseInterceptor(function(responseObject) {
        responseObject.resPhaseTwo = true;
        return responseObject;
      });

      $mockServer.whenPOST("/api/items").respond(function(method, url, data, headers) {
        var processedItem = angular.fromJson(data);
        expect(processedItem.reqPhaseOne).toBeDefined();
        expect(processedItem.reqPhaseTwo).toBeDefined();
        // Console log for debugging intermediate state (Type III addition)
        console.log("Mock server received item with request interceptors:", processedItem);
        return [200, processedItem, ""];
      });

      $mockServer.expectPOST('/api/items');

       DataService.all('api/items').post({itemName: "Widget"}).then(function(processedResponse) {
        expect(processedResponse.resPhaseOne).toBeDefined();
        expect(processedResponse.resPhaseTwo).toBeDefined();
        expect(processedResponse.itemName).toEqual("Widget"); // Verify original data
       });

       $mockServer.flush();
    });
  });

  describe("Model Enhancements", function() {
    it("Should decorate model elements both from server and locally by default", function() {

      DataService.registerModelExtension('accounts', function(singleUserRecord) {
        singleUserRecord.hasCustomMethod = () => true; // Use arrow function for modern JS
        singleUserRecord.getDisplayName = () => `User: ${singleUserRecord.userName}`; // Add another utility method
        return singleUserRecord;
      });

      DataService.one('accounts', 11).get().then(function(userEntry) {
        expect(userEntry.hasCustomMethod).toBeDefined();
        expect(userEntry.getDisplayName()).toEqual("User: Bob");
      });

      var localObject = {};
      DataService.restangularizeElement(null, localObject, 'accounts');
      expect(localObject.hasCustomMethod).toBeDefined();
      expect(localObject.getDisplayName).toBeDefined(); // Check for the second method too

      $mockServer.flush();
    });

    it("Should decorate elements only when from server if configured", function() {

      DataService.registerModelExtension('accounts', function(userEntry) {
        userEntry.serverOnlyExtension = () => 'server-data';
        return userEntry;
      });

      DataService.configureLocalTransformation(false); // New method name for setTransformOnlyServerElements

      DataService.one('accounts', 11).get().then(function(userEntry) {
        expect(userEntry.serverOnlyExtension).toBeDefined();
      });

      var localItem = {};
      DataService.restangularizeElement(null, localItem, 'accounts');
      expect(localItem.serverOnlyExtension).toBeUndefined(); // Should not be extended locally

      $mockServer.flush();
    });
  });

  describe("URL Configuration", function() {
    it("Should not append a suffix to absolute URLs", function() {
      var urlSuffixService = DataService.withConfig(function(ServiceConfigurationUtility) {
        ServiceConfigurationUtility.setRequestSuffix('.json');
      });

      $mockServer.expectGET('http://api.external.com/users'); // Use the full URL defined in setup
      urlSuffixService.allUrl('accounts', 'http://api.external.com/users').getList();
      $mockServer.flush();
    });
  });

  describe("JSONP Protocol", function() {
    it("should function for single item retrieval (get)", function() {
      DataService.setJsonp(true);
      DataService.one('accounts', 11).get();

      $mockServer.expectJSONP('/v1/accounts/11');
      $mockServer.flush();
    });

    it("should function for collection retrieval (getList)", function() {
      DataService.setJsonp(true);
      DataService.all('accounts').getList();

      $mockServer.expectJSONP('/v1/accounts');
      $mockServer.flush();
    });

    it("should not override standard POST requests", function() {
      DataService.setJsonp(true);
      dataServiceUsers.post({userID: 12, userName: "SomeoneElse"});

      $mockServer.expectPOST('/v1/accounts').respond(201, '');
      $mockServer.flush();
    });
  });

  describe("Offline Data Handling", function() {
    it("Should correctly restangularize an existing data collection", function() {
      var collectionCopy = angular.copy(userAccountsData);

      DataService.restangularizeCollection(null, collectionCopy, 'accounts');

      expect(collectionCopy.get).toBeDefined(); // Use toBeDefined directly
      expect(collectionCopy[0].get).toBeDefined();

      expect(collectionCopy.getRestangularUrl()).toBe('/v1/accounts');
      expect(collectionCopy[0].getRestangularUrl()).toBe('/v1/accounts/10');
    });
  });

  describe("Promise Object Extension", function() {
    it("Should populate the $object for a single GET request", function() {
      var actionPromise = DataService.one('accounts', 11).get();
      var resultObject = actionPromise.$object;
      expect(resultObject).toBeDefined();
      expect(resultObject.balance).toBeUndefined(); // Before flush, data isn't there

      $mockServer.flush();

      expect(resultObject.balance).toEqual(3.14);
      expect(resultObject.userName).toEqual("Bob"); // Add another check
    });

    it("Should automatically apply model extensions to the $object", function() {
      DataService.registerModelExtension('accounts', function(userEntry) {
        userEntry.customGetter = () => 'custom-value';
        return userEntry;
      });

      var actionPromise = DataService.one('accounts', 11).get();
      var resultObject = actionPromise.$object;
      expect(resultObject).toBeDefined();
      expect(resultObject.customGetter).toBeDefined(); // Extension should be present immediately

      $mockServer.flush();
      expect(resultObject.customGetter()).toEqual('custom-value'); // Verify functionality after data load
    });

    it("Should populate the $object for a collection GET request", function() {
      var actionPromise = DataService.all('accounts').getList();
      var resultList = actionPromise.$object;
      expect(resultList).toBeDefined();
      expect(resultList.length).toEqual(0); // Before flush, list is empty

      $mockServer.flush();

      expect(resultList.length).toEqual(2);
      expect(resultList[1].balance).toEqual(3.14);
      expect(resultList[0].userName).toEqual("Alice"); // Additional check
    });
  });

  describe("Collection Operations", function() {
    it("getList() should retrieve an array of records", function() {
      dataServiceUsers.getList().then(function(userRecords) {
        expect(DataService.stripRestangular(userRecords)).toEqual(DataService.stripRestangular(userAccountsData));
      });

      $mockServer.flush();
    });

    it("several() with getList() should fetch multiple specific records", function() {
      $mockServer.expectGET('/v1/accounts/10,11'); // Use new IDs
      DataService.several("accounts", 10, 11).getList().then(function(userRecords) {
        expect(DataService.stripRestangular(userRecords)).toEqual(DataService.stripRestangular(userAccountsData));
      });

      $mockServer.flush();
    });

    it("several() with remove() should allow bulk deletion", function() {
      $mockServer.expectDELETE('/v1/accounts/10,11').respond(200, "", ""); // New IDs
      DataService.several("accounts", 10, 11).remove();

      $mockServer.flush();
    });

    it("get(id) should retrieve a single record by its identifier", function() {
      dataServiceUsers.get(10).then(function(singleUserRecord) { // Use new ID
        expect(DataService.stripRestangular(singleUserRecord)).toEqual(DataService.stripRestangular(userAccountsData[0]));
      });

      $mockServer.flush();
    });

    it('uses all() to retrieve a sub-collection without parameters', function() {
      DataService.one('accounts', 11).all('messages').getList();
      $mockServer.expectGET('/v1/accounts/11/messages');
      $mockServer.flush();
    });

    it("Custom GETLIST methods should work correctly", function() {
      dataServiceUsers.customGETLIST("notificationMsgs").then(function(retrievedMsgs) {
        expect(DataService.stripRestangular(retrievedMsgs)).toEqual(DataService.stripRestangular(notificationMsgs));
      });

      $mockServer.flush();
    });

    it("post() should successfully add a new item to the collection", function() {
     dataServiceUsers.post({userID: 12, userName: "Someone"}).then(function() {
       // This assertion is a bit misleading as the mock doesn't update accountsModel.
       // It primarily tests the promise resolution. Original code had this too.
       expect(userAccountsData.length).toEqual(2);
     });

    $mockServer.expectPOST('/v1/accounts').respond(201, '');
    $mockServer.flush();
   });

    it("post() should handle arrays of items for creation", function() {
     DataService.all('locations').post([{name: "CityA"}, {name: 'CityB'}]).then(function(responseValue) {
       expect(responseValue.length).toEqual(2);
     });

    $mockServer.expectPOST('/v1/locations').respond(function(method, url, data, headers) {
      return [201, angular.fromJson(data), ""];
    });

    $mockServer.flush();
   });

    it("post() should add a new item and return server-enriched data", function() {
     dataServiceUsers.post(freshUserData).then(function(newlyAddedItem) {
       expect(newlyAddedItem.serverGeneratedFlag).toEqual(true);
       expect(newlyAddedItem.userID).toEqual(freshUserData.userID);
       expect(newlyAddedItem.creationTimestamp).toBeDefined(); // Verify the new property
     });

    $mockServer.expectPOST('/v1/accounts');
    $mockServer.flush();
   });

    it("Chaining operations: post() followed by a delete() on the new item", function() {
      dataServiceUsers.post(freshUserData).then(function(newlyAddedItem) {
        newlyAddedItem.remove();
        $mockServer.expectDELETE('/v1/accounts/99').respond(200, ''); // Use the new ID
      });

      $mockServer.flush();
    });

    it("post() to a server endpoint that returns no content should result in undefined", function() {
      dataServiceUsers.getList().then(function(userRecords) {
        var newFinancialTxn = {txnID: 203, description: "Payment"};
        userRecords[1].post('transactionsList', newFinancialTxn).then(function(financialTxn) {
          expect(financialTxn).toBeUndefined(); // Expect undefined if server returns no body
        });
      });

      $mockServer.flush();
    });

    it("head() request should complete without error", function() {
      dataServiceUsers.head().then(function() {
        expect(1).toEqual(1); // Simple assertion
      });
      $mockServer.flush();
    });

    it("customPUT should allow arbitrary PUT requests with custom paths", function() {
      $mockServer.expectPUT('/v1/accounts/special-path').respond(userAccountsData);
      dataServiceUsers.customPUT({customKey: 'customValue'}, 'special-path');

      $mockServer.flush();
    });

     it("getList() should correctly handle parameters after a customDELETE operation", function() {
      $mockServer.expectGET('/v1/accounts?filter=active').respond(userAccountsData);
      dataServiceUsers.getList({filter: 'active'}).then(function(){
        $mockServer.expectDELETE('/v1/accounts?recordId=1').respond(200, ''); // Changed param name
        return dataServiceUsers.customDELETE('', {recordId: 1});
      }).then(function() {
          $mockServer.expectGET('/v1/accounts?filter=active').respond(userAccountsData); // Expect params to persist
          return dataServiceUsers.getList({filter: 'active'});
        }).then(function(userRecords) {
          expect(DataService.stripRestangular(userRecords)).toEqual(DataService.stripRestangular(userAccountsData));
        });

      $mockServer.flush();
    });
  });

  describe("Single Item Operations", function() {
    it("get() should retrieve a single JSON item", function() {
      dataServiceUser1.get().then(function(userEntry) {
        expect(DataService.stripRestangular(userEntry))
          .toEqual(DataService.stripRestangular(userAccountsData[1]));
      });

      $mockServer.flush();
    });

    it("Should establish RequestLess connections using one() for sub-resources", function() {
      dataServiceUser1.one("transactionsList", 202).get().then(function(financialTxn) { // Use new ID
        expect(DataService.stripRestangular(financialTxn))
          .toEqual(DataService.stripRestangular(userAccountsData[1].transactionsList[1]));
      });

      $mockServer.flush();
    });

    it("Should establish RequestLess connections using all() for sub-collections", function() {
      dataServiceUser1.all("transactionsList").getList().then(function(financialTxns) {
        expect(DataService.stripRestangular(financialTxns))
          .toEqual(DataService.stripRestangular(userAccountsData[1].transactionsList));
      });

      $mockServer.flush();
    });


    it("Custom GET methods should operate correctly on single items", function() {
      dataServiceUser1.customGET("singleMsg").then(function(msgPayload) { // New path part
        expect(DataService.stripRestangular(msgPayload)).toEqual(DataService.stripRestangular(notificationMsgs[0]));
      });

      $mockServer.flush();
    });

    it("put() should update the item's data on the server", function() {
      dataServiceUser1.get().then(function(userEntry) {
        userEntry.balance = 1.62; // Update value
        userEntry.put().then(function(updatedUserRecord) {
          expect(userAccountsData[1].balance).toEqual(1.62); // Verify internal model update
          // Add a cleanup step (Type III addition)
          updatedUserRecord.userName = "Bob Updated";
          updatedUserRecord.put();
          $mockServer.expectPUT("/v1/accounts/11"); // Expect another PUT for the cleanup
        });
        $mockServer.expectPUT("/v1/accounts/11");
      });

      $mockServer.flush();
    });

    it("should return an array when accessing a sub-collection from a single item", function() {
      dataServiceUser1.get().then(function(userEntry) {
        userEntry.getList("transactionsList").then(function(financialTxns) {
          expect(DataService.stripRestangular(financialTxns))
            .toEqual(DataService.stripRestangular(userAccountsData[1].transactionsList));
        });
      });

      $mockServer.flush();
    });
  });

  describe("Object Cloning", function() {
    it("should create a deep copy of an object and maintain 'this' context", function() {
      var clonedUserEntry = DataService.copy(userAccountsData[0]);
      var selfRef;

      clonedUserEntry.userName = "Cloned User Name";
      expect(clonedUserEntry).not.toBe(userAccountsData[0]); // Ensure it's a new object

      // Use a spy to capture 'this' context during method invocation
      spyOn(clonedUserEntry, 'getRestangularUrl').and.callFake(function() { // Changed to callFake
        selfRef = this;
        return "/dummy/url"; // Return a dummy value to avoid errors
      });

      clonedUserEntry.getRestangularUrl();
      expect(selfRef).toBe(clonedUserEntry);
      expect(clonedUserEntry.userName).toEqual("Cloned User Name"); // Verify property change on clone
    });
  });

  describe("URL Generation", function() {
    it("should return the correctly constructed URL when chaining methods", function() {
      var dataServiceLocations = DataService.one("accounts",123).one("buildings", 456).all("rooms"); // New resource names
      expect(dataServiceLocations.getRestangularUrl()).toEqual("/v1/accounts/123/buildings/456/rooms"); // Prepend base path
    });
  });

  describe("Canonical ID Handling", function() {
    it("should generate URLs correctly even with canonical ID setting enabled", function() {
      var ConfiguredDataService = DataService.withConfig(function(serviceConfig) {
        serviceConfig.setUseCannonicalId(true);
      });
      var dataServiceLocations = ConfiguredDataService.one("accounts",123).one("buildings", 456).all("rooms");
      expect(dataServiceLocations.getRestangularUrl()).toEqual("/v1/accounts/123/buildings/456/rooms");
    });
  });