describe  ( "Restangular" ,  function ( )  {
    /*
     * This section declares all variables that will be used throughout
     * the test suite. These include API objects, model data, and
     * Restangular instances.
     */
    // Core API objects for testing
    var Restangular, $httpBackend;

    // Model data and Restangularized instances
    var accountsModel, restangularAccounts, restangularAccount0, restangularAccount1;
    var messages, newAccount;

    /*
     * The beforeEach hook is used to load necessary modules
     * before each test specification runs.
     */
    beforeEach(angular.mock.module("restangular"));


    /*
     * This `beforeEach` block is crucial for setting up the mock HTTP backend
     * and initializing Restangular resources. It simulates server responses.
     */
    beforeEach(inject(function ($injector) {
        // Initialize the test model data for accounts.
        accountsModel = [
            { id: 0, user: "Martin ", amount: 42, transactions: [] },
            { id: 1, user: "Paul", amount: 3.1416, transactions: [{ from: "Martin", amount: 3, id: 0 }, { from: "Anonymous", amount: 0.1416, id: 1 }] }
        ];

        // Define a new account object for POST operations.
        newAccount = { id: 44, user: "First User", amount: 45, transactions: [] };

        // Initialize mock messages data.
        messages = [{ id: 23, name: "Gonto" }, { id: 45, name: "John" }]


        /*
         * Obtain the $httpBackend service from the injector.
         * This service allows us to mock HTTP requests and control their responses.
         */
        $httpBackend = $injector.get("$httpBackend");


        // --- Mocking various HTTP methods for the /accounts endpoint ---
        $httpBackend.when("HEAD", "/accounts").respond();
        $httpBackend.when("TRACE", "/accounts").respond();
        $httpBackend.when("OPTIONS", "/accounts").respond();

        // --- Mocking GET requests ---
        $httpBackend.whenGET("/accounts").respond(accountsModel);
        $httpBackend.whenJSONP("/accounts").respond(accountsModel); // JSONP specific mock
        $httpBackend.whenGET("/accounts/0,1").respond(accountsModel); // Multiple IDs
        $httpBackend.whenGET("/accounts/messages").respond(messages); // Sub-resource
        $httpBackend.whenGET("/accounts/1/message").respond(messages[0]); // Specific sub-resource
        $httpBackend.whenGET("/accounts/1/messages").respond(messages);
        $httpBackend.whenGET("/accounts/0").respond(accountsModel[0]);
        $httpBackend.whenGET("/accounts/1").respond(accountsModel[1]);
        $httpBackend.whenJSONP("/accounts/1").respond(accountsModel[1]);
        $httpBackend.whenGET("/accounts/1/transactions").respond(accountsModel[1].transactions);
        $httpBackend.whenGET("/accounts/1/transactions/1").respond(accountsModel[1].transactions[1]);

        // Mock a GET request to a full URL, demonstrating external API calls.
        $httpBackend.whenGET('http://accounts.com/all').respond(accountsModel);

        /*
         * Mock POST request for /accounts.
         * It simulates a server response that adds a 'fromServer' property.
         */
        $httpBackend.whenPOST("/accounts").respond(function (method, url, data, headers) {
            var newData = angular.fromJson(data);
            newData.fromServer = true; // Add a server-specific property
            return [201, JSON.stringify(newData), ""]; // Respond with 201 Created
        });

        // Mock POST request for transactions under a specific account.
        $httpBackend.whenPOST("/accounts/1/transactions").respond(function (method, url, data, headers) {
            return [201, "", ""]; // Simulate successful creation with no body
        });

        // Mock DELETE request for a specific transaction.
        $httpBackend.whenDELETE("/accounts/1/transactions/1").respond(function (method, url, data, headers) {
            return [200, "", ""]; // Simulate successful deletion
        });

        // Mock DELETE request for a specific account.
        $httpBackend.whenDELETE("/accounts/1").respond(function (method, url, data, headers) {
            return [200, "", ""]; // Simulate successful deletion
        });

        /*
         * Mock PUT request for updating an account.
         * It updates the local accountsModel to reflect the change.
         */
        $httpBackend.whenPUT("/accounts/1").respond(function (method, url, data, headers) {
            accountsModel[1] = angular.fromJson(data); // Update the model
            return [201, data, ""]; // Respond with 201 Created and the updated data
        });

        // Get the Restangular service and initialize main Restangular instances.
        Restangular = $injector.get("Restangular");
        restangularAccounts = Restangular.all("accounts");        // Collection endpoint
        restangularAccount0 = Restangular.one("accounts", 0);     // Specific resource
        restangularAccount1 = Restangular.one("accounts", 1);     // Another specific resource
    }));


    /*
     * This `afterEach` hook ensures that no unexpected HTTP requests or
     * expectations are left outstanding after each test, promoting test isolation.
     */
    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation(); // Check for unfulfilled expectations
        $httpBackend.verifyNoOutstandingRequest();     // Check for unhandled requests
    });


    /*
     * Test suite for Restangular interceptors, which modify requests
     * before they are sent and responses before they are processed.
     */
    describe("Interceptors", function () {
        it("Should add multiple request and response interceptors", function () {
            // Add a first request interceptor
            Restangular.addRequestInterceptor(function (elem) {
                elem.firstRequestInterceptor = true;
                return elem; // Return the modified element
            });

            // Add a second request interceptor
            Restangular.addRequestInterceptor(function (elem) {
                elem.secondRequestInterceptor = true;
                return elem;
            });

            // Add a full request interceptor, which provides more control
            Restangular.addFullRequestInterceptor(function (elem) {
                elem.thirdRequestInterceptor = true;
                return {
                    element: elem // Wrap the element in an object
                };
            });


            // Add a first response interceptor
            Restangular.addResponseInterceptor(function (elem) {
                elem.firstResponseInterceptor = true;
                return elem;
            });

            // Add a second response interceptor
            Restangular.addResponseInterceptor(function (elem) {
                elem.secondResponseInterceptor = true;
                return elem;
            });


            // Mock the POST request to '/list' to verify interceptor effects.
            $httpBackend.whenPOST("/list").respond(function (method, url, data, headers) {
                var elem = angular.fromJson(data);
                // Assert that all request interceptors have modified the element
                expect(elem.firstRequestInterceptor).toBeDefined();
                expect(elem.secondRequestInterceptor).toBeDefined();
                expect(elem.thirdRequestInterceptor).toBeDefined();
                return [200, elem, ""]; // Respond with the modified element
            });

            // Expect a POST request to '/list'
            $httpBackend.expectPOST('/list');

            // Make a POST request using Restangular and check response interceptors.
            Restangular.all('list').post({ name: "Gonto" }).then(function (elem) {
                // Assert that all response interceptors have modified the element
                expect(elem.firstResponseInterceptor).toBeDefined();
                expect(elem.secondResponseInterceptor).toBeDefined();
            });

            // Flush the HTTP backend to resolve pending requests.
            $httpBackend.flush();
        });
    });


    /*
     * Test suite for Restangular transformers (extendModel),
     * which are used to add custom methods or properties to models.
     */
    describe("Transformers", function () {
        it("Should decorate element both on server and local by default", function () {

            // Extend the 'accounts' model with a custom method 'extended'.
            Restangular.extendModel('accounts', function (account) {
                account.extended = function () { return true; } // Add a new method
                return account;
            });

            // Fetch an account from the server and verify decoration.
            Restangular.one('accounts', 1).get().then(function (account) {
                expect(account.extended).toBeDefined();
            });

            // Create a local object and restangularize it to verify local decoration.
            var local = {};
            Restangular.restangularizeElement(null, local, 'accounts');
            expect(local.extended).toBeDefined();

            $httpBackend.flush();
        });

        it("Should decorate element only server if config set", function () {

            // Extend the 'accounts' model as before.
            Restangular.extendModel('accounts', function (account) {
                account.extended = function () { return true; }
                return account;
            });

            // Configure Restangular to transform only server-fetched elements.
            Restangular.setTransformOnlyServerElements(true)

            // Fetch an account from the server and verify decoration.
            Restangular.one('accounts', 1).get().then(function (account) {
                expect(account.extended).toBeDefined();
            });

            // Create a local object and restangularize it; decoration should NOT happen.
            var local = {};
            Restangular.restangularizeElement(null, local, 'accounts');
            expect(local.extended).toBeUndefined(); // Expect it to be undefined

            $httpBackend.flush();
        });
    });


    /*
     * Test suite for Restangular's `withUrl` functionality,
     * specifically checking how suffixes are handled.
     */
    describe("With Url", function () {
        it("Shouldn't add suffix to URL", function () {
            // Create a new Restangular instance with a custom request suffix.
            var suffixRestangular = Restangular.withConfig(function (RestangularConfigurer) {
                RestangularConfigurer.setRequestSuffix('.json');
            });

            // Expect a GET request to the full URL without the suffix.
            $httpBackend.expectGET('http://accounts.com/all');
            suffixRestangular.allUrl('accounts', 'http://accounts.com/all').getList();
            $httpBackend.flush();
        });
    });


    /*
     * Test suite for JSONP support in Restangular.
     */
    describe("JSONp", function () {
        it("should work for get", function () {
            // Enable JSONP for Restangular.
            Restangular.setJsonp(true);
            Restangular.one('accounts', 1).get();

            // Expect a JSONP request.
            $httpBackend.expectJSONP('/accounts/1');
            $httpBackend.flush();
        });

        it("should work for getList", function () {
            // Enable JSONP.
            Restangular.setJsonp(true);
            Restangular.all('accounts').getList();

            // Expect a JSONP request for a list.
            $httpBackend.expectJSONP('/accounts');
            $httpBackend.flush();
        });

        it("shouldn't override post", function () {
            // Even if JSONP is enabled, POST requests should still be standard POST.
            Restangular.setJsonp(true);
            restangularAccounts.post({ id: 2, user: "Someone" });

            // Expect a standard POST request.
            $httpBackend.expectPOST('/accounts').respond(201, '');
            $httpBackend.flush();
        });


    });


    /*
     * Test suite for handling local data and restangularizing it.
     */
    describe("Local data", function () {
        it("Should restangularize a collection OK", function () {
            var collection = angular.copy(accountsModel); // Create a deep copy

            // Restangularize the local collection.
            Restangular.restangularizeCollection(null, collection, 'accounts');

            // Verify that Restangular methods are added to the collection and its elements.
            expect(_.has(collection, 'get')).toBe(true);
            expect(_.has(collection[0], 'get')).toBe(true);

            // Verify the generated Restangular URLs.
            expect(collection.getRestangularUrl()).toBe('/accounts');
            expect(collection[0].getRestangularUrl()).toBe('/accounts/0');

        });
    });


    /*
     * Test suite for the `$object` property on promises,
     * which provides immediate access to the promise's eventual value.
     */
    describe("$object", function () {
        it("Should work for single get", function () {
            var promise = Restangular.one('accounts', 1).get();
            var obj = promise.$object; // Access the $object immediately
            expect(obj).toBeDefined();
            expect(obj.amount).toBeUndefined(); // Value not yet resolved

            $httpBackend.flush(); // Resolve the promise

            expect(obj.amount).toEqual(3.1416); // Now the value should be present
        });

        it("Should be restangularized by default", function () {
            // Extend the model to add a custom method.
            Restangular.extendModel('accounts', function (account) {
                account.extended = function () { return true; }
                return account;
            });

            var promise = Restangular.one('accounts', 1).get();
            var obj = promise.$object;
            expect(obj).toBeDefined();
            expect(obj.extended).toBeDefined(); // Should be restangularized immediately

            $httpBackend.flush();
        });

        it("Should work for single getList", function () {
            var promise = Restangular.all('accounts').getList();
            var list = promise.$object;
            expect(list).toBeDefined();
            expect(list.length).toEqual(0); // List is empty before resolution

            $httpBackend.flush();

            expect(list.length).toEqual(2); // List populated after resolution
            expect(list[1].amount).toEqual(3.1416);
        });
    });


    /*
     * Test suite for operations on collections (ALL resources).
     */
    describe("ALL", function () {
        it("getList() should return an array of items", function () {
            restangularAccounts.getList().then(function (accounts) {
                // Verify the fetched accounts match the model after stripping Restangular properties.
                expect(Restangular.stripRestangular(accounts)).toEqual(Restangular.stripRestangular(accountsModel));
            });

            $httpBackend.flush();
        });

        it("several getList() should return an array of items", function () {
            $httpBackend.expectGET('/accounts/0,1'); // Expect a GET request for multiple IDs
            Restangular.several("accounts", 0, 1).getList().then(function (accounts) {
                expect(Restangular.stripRestangular(accounts)).toEqual(Restangular.stripRestangular(accountsModel));
            });

            $httpBackend.flush();
        });

        it("several remove() should work", function () {
            $httpBackend.expectDELETE('/accounts/0,1').respond([200, "", ""]); // Expect a DELETE for multiple IDs
            Restangular.several("accounts", 0, 1).remove();

            $httpBackend.flush();
        });

        it("get(id) should return the item with given id", function () {
            restangularAccounts.get(0).then(function (account) {
                expect(Restangular.stripRestangular(account)).toEqual(Restangular.stripRestangular(accountsModel[0]));
            });

            $httpBackend.flush();
        });

        it('uses all to get the list without parameters', function () {
            // This test verifies that calling .all() on an element works correctly for sub-resources.
            Restangular.one('accounts', 1).all('messages').getList();
            $httpBackend.expectGET('/accounts/1/messages');
            $httpBackend.flush();
        });

        it("Custom GET methods should work", function () {
            restangularAccounts.customGETLIST("messages").then(function (msgs) {
                expect(Restangular.stripRestangular(msgs)).toEqual(Restangular.stripRestangular(messages));
            });

            $httpBackend.flush();
        });

        it("post() should add a new item", function () {
            restangularAccounts.post({ id: 2, user: "Someone" }).then(function () {
                // Note: The mock backend doesn't actually add to accountsModel in this specific test.
                // It only validates the request. The expectation is on the client-side logic.
                expect(accountsModel.length).toEqual(2); // This assertion is based on initial model size, not actual addition.
            });

            $httpBackend.expectPOST('/accounts').respond(201, ''); // Expect a POST and respond with 201.
            $httpBackend.flush();
        });

        it("post() should work with arrays", function () {
            Restangular.all('places').post([{ name: "Gonto" }, { name: 'John' }]).then(function (value) {
                expect(value.length).toEqual(2); // Expect the returned array to have 2 elements.
            });

            // Mock the POST for '/places' to return the posted data.
            $httpBackend.expectPOST('/places').respond(function (method, url, data, headers) {
                return [201, angular.fromJson(data), ""];
            });

            $httpBackend.flush();
        });

        it("post() should add a new item with data and return the data from the server", function () {
            restangularAccounts.post(newAccount).then(function (added) {
                // Verify properties added by the server mock.
                expect(added.fromServer).toEqual(true);
                expect(added.id).toEqual(newAccount.id);
            });

            $httpBackend.expectPOST('/accounts'); // Expect the POST request.
            $httpBackend.flush();
        });

        it("Doing a post and then other operation (delete) should call right URLs", function () {
            restangularAccounts.post(newAccount).then(function (added) {
                added.remove(); // Call remove on the newly added item.
                $httpBackend.expectDELETE('/accounts/44').respond(201, ''); // Expect DELETE for the item's ID.
            });

            $httpBackend.flush();
        });

        it("Doing a post to a server that returns no element will return undefined", function () {
            restangularAccounts.getList().then(function (accounts) {
                var newTransaction = { id: 1, name: "Gonto" };
                // Post a transaction to account 1. The mock for this returns no body.
                accounts[1].post('transactions', newTransaction).then(function (transaction) {
                    expect(transaction).toBeUndefined(); // Expect undefined as the server returned no body.
                });
            });

            $httpBackend.flush();
        });

        it("head() should safely return", function () {
            restangularAccounts.head().then(function () {
                expect(true).toBe(true); // Simply verify the promise resolves.
            });
            $httpBackend.flush();
        });

        it("trace()  should safely return", function () {
            restangularAccounts.trace().then(function () {
                expect(true).toBe(true);
            });

            $httpBackend.flush();
        });

        it("customPUT should work", function () {
            $httpBackend.expectPUT('/accounts/hey').respond(accountsModel); // Expect PUT to a custom path.
            restangularAccounts.customPUT({ key: 'value' }, 'hey'); // Perform custom PUT.

            $httpBackend.flush();
        });

        it("options()  should safely return", function () {
            restangularAccounts.options().then(function () {
                expect(true).toBe(true);
            });

            $httpBackend.flush();
        });

        it("getList() should correctly handle params after customDELETE", function () {
            // First GET list with params.
            $httpBackend.expectGET('/accounts?foo=1').respond(accountsModel);
            restangularAccounts.getList({ foo: 1 }).then(function () {
                // Then perform a custom DELETE with params.
                $httpBackend.expectDELETE('/accounts?id=1').respond(201, '');
                return restangularAccounts.customDELETE('', { id: 1 });
            }).then(function () {
                // Then GET list again with the original params, ensuring they are not lost.
                $httpBackend.expectGET('/accounts?foo=1').respond(accountsModel);
                return restangularAccounts.getList({ foo: 1 });
            }).then(function (accounts) {
                expect(Restangular.stripRestangular(accounts)).toEqual(Restangular.stripRestangular(accountsModel));
            });

            $httpBackend.flush();
        });
    });


    /*
     * Test suite for operations on single elements (ONE resource).
     */
    describe("ONE", function () {
        it("get() should return a JSON item", function () {
            restangularAccount1.get().then(function (account) {
                expect(Restangular.stripRestangular(account))
                    .toEqual(Restangular.stripRestangular(accountsModel[1]));
            });

            $httpBackend.flush();
        });

        it("Should make RequestLess connections with one", function () {
            // Chaining 'one' on an existing Restangularized element.
            restangularAccount1.one("transactions", 1).get().then(function (transaction) {
                expect(Restangular.stripRestangular(transaction))
                    .toEqual(Restangular.stripRestangular(accountsModel[1].transactions[1]));
            });

            $httpBackend.flush();
        });

        it("Should make RequestLess connections with all", function () {
            // Chaining 'all' on an existing Restangularized element.
            restangularAccount1.all("transactions").getList().then(function (transactions) {
                expect(Restangular.stripRestangular(transactions))
                    .toEqual(Restangular.stripRestangular(accountsModel[1].transactions));
            });

            $httpBackend.flush();
        });


        it("Custom GET methods should work", function () {
            restangularAccount1.customGET("message").then(function (msg) {
                expect(Restangular.stripRestangular(msg)).toEqual(Restangular.stripRestangular(messages[0]));
            });

            $httpBackend.flush();
        });

        it("put() should update the value", function () {
            restangularAccount1.get().then(function (account) {
                account.amount = 1.618; // Modify the local account object.
                account.put().then(function (newAc) {
                    expect(accountsModel[1].amount).toEqual(1.618); // Verify model update by mock backend.
                    newAc.remove(); // Perform a DELETE on the updated item.
                    $httpBackend.expectDELETE("/accounts/1"); // Expect the DELETE request.
                });
                $httpBackend.expectPUT("/accounts/1"); // Expect the PUT request.


            });

            $httpBackend.flush();
        });

        it("should return an array when accessing a subvalue", function () {
            restangularAccount1.get().then(function (account) {
                account.getList("transactions").then(function (transactions) {
                    expect(Restangular.stripRestangular(transactions))
                        .toEqual(Restangular.stripRestangular(accountsModel[1].transactions));
                });
            });

            $httpBackend.flush();
        });
    });


    /*
     * Test suite for the `copy` functionality in Restangular.
     */
    describe("COPY", function () {
        it("should copy an object and 'this' should reference the copied object", function () {
            var copiedAccount = Restangular.copy(accountsModel[0]); // Create a copy.
            var that;

            copiedAccount.user = "Copied string"; // Modify the copy.
            expect(copiedAccount).not.toBe(accountsModel[0]); // Ensure it's a distinct object.

            // Use a spy to capture 'this' when a method is invoked on the copied object.
            spyOn(copiedAccount, 'getRestangularUrl').andCallFake(function () {
                that = this; // 'this' inside the fake function refers to the object it's called on.
            });

            copiedAccount.getRestangularUrl(); // Invoke the method.
            expect(that).toBe(copiedAccount); // Verify 'this' is the copied object.
        });
    });


    /*
     * Test suite for `getRestangularUrl` method.
     */
    describe("getRestangularUrl", function () {
        it("should return the generated URL when you chain Restangular methods together", function () {
            // Chain multiple 'one' and 'all' calls to build a complex URL path.
            var restangularSpaces = Restangular.one("accounts", 123).one("buildings", 456).all("spaces");
            expect(restangularSpaces.getRestangularUrl()).toEqual("/accounts/123/buildings/456/spaces");
        });
    });


    /*
     * Test suite for `getRestangularUrl` with `useCannonicalId` configuration.
     */
    describe("getRestangularUrl with useCannonicalId set to true", function () {
        it("should return the generated URL when you chain Restangular methods together", function () {
            // Create a new Restangular instance with `setUseCannonicalId` enabled.
            var R = Restangular.withConfig(function (config) {
                config.setUseCannonicalId(true); // This setting doesn't affect URL generation for known IDs.
            });
            var restangularSpaces = R.one("accounts", 123).one("buildings", 456).all("spaces");
            expect(restangularSpaces.getRestangularUrl()).toEqual("/accounts/123/buildings/456/spaces");
        });
    });

});