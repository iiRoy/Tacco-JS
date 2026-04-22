/*
 * This is a Type I clone of the original JavaScript code.
 *
 * The purpose of this file is to define mock data,
 * set up mock AJAX responses using $.mockjax,
 * and then run a series of asynchronous and synchronous QUnit tests
 * against Backbone.Tastypie models and collections.
 *
 * Changes are strictly limited to whitespace and comments
 * to adhere to the Type I clone definition.
 */


    // Define a collection of test users for mocking purposes.
    // This array will serve as our in-memory database for mockjax.
var test_users = _(
    [
        // User 1: Andrew
        { id:             1,
          username:       "andrew",
          resource_uri:   '/api/v1/user/1/'
        },
        // User 2: Jackie
        { id:             2,
          username:       "jackie",
          resource_uri:   '/api/v1/user/2/'
        },
        // User 3: Genie
        { id:             3,
          username:       "genie",
          resource_uri:   '/api/v1/user/3/'
        },
        // User 4: Kirt
        { id:             4,
          username:       "kirt",
          resource_uri:   '/api/v1/user/4/'
        },
        // User 5: Kory
        { id:             5,
          username:       "kory",
          resource_uri:   '/api/v1/user/5/'
        },
        // User 6: Anton
        { id:             6,
          username:       "anton",
          resource_uri:   '/api/v1/user/6/'
        },
        // User 7: Azat
        { id:             7,
          username:       "azat",
          resource_uri:   '/api/v1/user/7/'
        }
    ]
);


// Set up mock AJAX responses using jQuery Mockjax.
// This intercepts AJAX calls and returns predefined data,
// simulating a backend API without making actual network requests.
$.mockjax(
    function(request)
    {
        // Attempt to extract a user ID from the request URL.
        // This regex matches URLs like /api/v1/user/123/
        var userDetail = request.url.match(
            /\/api\/v1\/user\/(\d+)\/$/i
        );

        // Check if a user detail URL was matched.
        if (userDetail) {
            // Extract the user ID from the matched groups.
            var userId = userDetail[1];

            // Return a mock response for a single user fetch.
            return {
                success:        true,
                responseText:   test_users.find(
                    function(user)
                    {
                        // Find the user in our test_users array by ID.
                        return user.id == userDetail[1];
                    }
                )
            };
        }

        // If not a specific user detail, it's likely a collection request.
        // Initialize an empty object to store query string parameters.
        var qs = {};

        // Parse query string parameters from the request URL.
        // Example: ?limit=3&offset=0
        _.each(
            request.url.split('?')[1].split('&'),
            function(arg)
            {
                // Split each argument into key-value pairs.
                arg = arg.split('=');
                // Store the key-value pair in the qs object.
                qs[arg[0]] = arg[1];
            }
        );

        // Extract limit and offset from query string, defaulting to 0.
        var limit   = Number(qs.limit || 0),
            offset  = Number(qs.offset || 0),
            objects = []; // Array to hold the sliced user objects.

        // Apply limit and offset to the test_users data.
        if (limit)
            // If a limit is specified, slice from offset up to offset + limit.
            objects = test_users.slice(offset, offset + limit);
        else
            // If no limit, slice from offset to the end of the array.
            objects = test_users.slice(offset);

        // Return the mock response for a collection fetch.
        return {
            success:        true,
            responseText:   {
                objects:        objects, // The paginated user objects.
                meta:           {
                    limit:          limit,          // The requested limit.
                    offset:         offset,         // The requested offset.
                    total_count:    test_users.value().length // Total count of all users.
                }
            }
        };
    }
);


// Define a Backbone model for a single User, extending Backbone.Tastypie.Model.
// This model automatically handles API interactions for a single user resource.
var User = Backbone.Tastypie.Model.extend(
    {
        urlRoot: '/api/v1/user/'    // The base URL for user resources.
    }
);


// Define a Backbone collection for Users, extending Backbone.Tastypie.Collection.
// This collection manages a list of User models and handles API interactions for the collection.
var Users = Backbone.Tastypie.Collection.extend(
    {
        urlRoot:    '/api/v1/user/',    // The base URL for the user collection.
        model:      User                // Specifies that this collection holds User models.
    }
);


/*
 *  Begin QUnit asynchronous tests for Backbone.Tastypie functionality.
 *  This test suite focuses on parsing responses from a Tastypie-like API.
 */
asyncTest(
    "parsing tastypie response",    // Test name.
    3,                              // Expected number of assertions.
    function()
    {
        // Define a limit for the number of users to fetch.
        var limit = 3;

        // Create a new Users collection instance with filters.
        var users = new Users(
            [],
            {
                filters: {
                    limit:  limit,  // Request a specific limit of users.
                    active: true    // An additional filter (not mocked, but demonstrates usage).
                }
            }
        );

        // Fetch the users collection from the mock API.
        users.fetch(
            {
                success: function(users)
                {
                    // Assertion 1: Check if the number of models fetched matches the limit.
                    equal(
                        users.models.length,
                        limit
                    );
                    // Assertion 2: Verify that the meta.limit property is correctly parsed.
                    equal(
                        users.meta.limit,
                        limit
                    );
                    // Assertion 3: Verify that the meta.offset property is correctly parsed (should be 0 for first fetch).
                    equal(
                        users.meta.offset,
                        0
                    );
                    // Signal QUnit that the asynchronous part of this test is complete.
                    start();

                    // Nested synchronous test: Check the URL generation for a single model.
                    test(
                        "model url",    // Nested test name.
                        1,              // Expected number of assertions for this nested test.
                        function()
                        {
                            // Get the first user from the fetched collection and the test data.
                            var user        = users.first(),
                                compare     = test_users.first();

                            // Assertion 1: Compare the model's generated URL with the expected resource_uri.
                            equal(
                                user.url(),
                                compare.resource_uri
                            );
                        }
                    );

                    // Nested asynchronous test: Fetch the next page of users.
                    asyncTest(
                        "fetching next page",   // Nested async test name.
                        3,                      // Expected number of assertions.
                        function()
                        {
                            // Fetch the next page of users.
                            users.fetchNext(
                                {
                                    success: function(users)
                                    {
                                        // Assertion 1: Check if the number of models now reflects two pages.
                                        equal(
                                            users.models.length,
                                            limit * 2
                                        );
                                        // Assertion 2: Verify meta.limit remains the same for the next fetch.
                                        equal(
                                            users.meta.limit,
                                            limit
                                        );
                                        // Assertion 3: Verify meta.offset is updated to the previous limit.
                                        equal(
                                            users.meta.offset,
                                            limit
                                        );
                                        // Signal QUnit that this nested async test is complete.
                                        start();
                                    }
                                }
                            );
                        }
                    );
                }
            }
        );
    }
);


/*
 *  Another QUnit asynchronous test case.
 *  This one checks behavior when the requested limit exceeds the total available items.
 */
asyncTest(
    "limit greater than total",     // Test name.
    6,                              // Expected number of assertions.
    function()
    {
        // Define a limit much larger than the total number of test users.
        var limit   = 100,
            total   = test_users.value().length; // Get the actual total count of users.

        // Create a new Users collection with the large limit filter.
        var users = new Users(
            [],
            {
                filters: {
                    limit: limit
                }
            }
        );

        // Fetch the collection.
        users.fetch(
            {
                success: function(users)
                {
                    // Assertion 1: The number of models should be the total available, not the requested limit.
                    equal(
                        users.models.length,
                        total
                    );
                    // Assertion 2: The meta.limit should reflect the requested limit.
                    equal(
                        users.meta.limit,
                        limit
                    );
                    // Assertion 3: The initial offset should be 0.
                    equal(
                        users.meta.offset,
                        0
                    );

                    // Fetch the next page.
                    users.fetchNext(
                        {
                            success: function(users)
                            {
                                // Assertion 4: Even after fetching next, models length should still be total.
                                equal(
                                    users.models.length,
                                    total
                                );
                                // Assertion 5: Meta.limit should still be the requested limit.
                                equal(
                                    users.meta.limit,
                                    limit
                                );
                                // Assertion 6: The offset should now be the total count, indicating no more items.
                                equal(
                                    users.meta.offset,
                                    total
                                );
                                // Signal QUnit that this async test is complete.
                                start();
                            }
                        }
                    );
                }
            }
        );
    }
);


/*
 *  Synchronous QUnit test: Verify URL generation for a brand new model.
 */
test(
    "new model url",    // Test name.
    function()
    {
        // Create a new, unsaved User model.
        var user = new User();
        // Assert that its URL is the base urlRoot, as it has no ID yet.
        equal(
            user.url(),
            '/api/v1/user/'
        );
    }
);


/*
 *  Synchronous QUnit test: Check that collection meta objects are distinct instances.
 */
test(
    "model meta",   // Test name.
    function()
    {
        // Define two generic Tastypie collections.
        var Foo = Backbone.Tastypie.Collection.extend();
        var Bar = Backbone.Tastypie.Collection.extend();

        // Instantiate both collections.
        foo = new Foo();
        bar = new Bar();

        // Modify the meta object of the first instance.
        foo.meta.offset = 12;

        // Assert that the meta object of the second instance is not affected,
        // proving they are separate objects.
        notEqual(
            foo.meta.offset,
            bar.meta.offset
        );
    }
);