// Data source for our simulated API responses.
// This array holds various user profiles with their unique identifiers and details.
const all_members_data = [
    {memberId: 101, memberName: "alexandra", profileLink: '/api/v1/person/101/', isActive: true, role: 'developer'},
    {memberId: 102, memberName: "brandon", profileLink: '/api/v1/person/102/', isActive: true, role: 'tester'},
    {memberId: 103, memberName: "chloe", profileLink: '/api/v1/person/103/', isActive: false, role: 'designer'},
    {memberId: 104, memberName: "david", profileLink: '/api/v1/person/104/', isActive: true, role: 'developer'},
    {memberId: 105, memberName: "emily", profileLink: '/api/v1/person/105/', isActive: true, role: 'manager'},
    {memberId: 106, memberName: "frank", profileLink: '/api/v1/person/106/', isActive: false, role: 'intern'},
    {memberId: 107, memberName: "grace", profileLink: '/api/v1/person/107/', isActive: true, role: 'developer'}
];

// Helper to extract member ID from a URL path.
function extractMemberIdentifier(urlPath) {
    const detailPattern = /\/api\/v1\/person\/(\d+)\/$/i;
    const matchResult = urlPath.match(detailPattern);
    return matchResult ? matchResult[1] : null;
}

// Intercepting AJAX requests for the /api/v1/person/ endpoint using jQuery Mockjax.
// This simulates a backend API for retrieving user data.
$.mockjax(function(incomingRequest) {
    // Attempt to parse the URL for a specific member's detail view.
    const memberIdentifier = extractMemberIdentifier(incomingRequest.url);

    // If a specific member ID is found in the URL.
    if (memberIdentifier) {
        console.log(`Mockjax: Handling detail request for member ID: ${memberIdentifier}`);
        // Find the corresponding member in our data source.
        const foundMember = all_members_data.find(function(personRecord) {
            return String(personRecord.memberId) === memberIdentifier; // Type III: strict equality and type conversion
        });

        // Return the mock response for a single member.
        return {
            status: 200, // Explicitly set success status
            responseText: foundMember || null, // Return null if not found
            responseJson: true // Ensure JSON parsing
        };
    }

    // If no specific member ID, assume it's a list request, potentially with query parameters.
    console.log("Mockjax: Handling list request.");

    // Parse query string parameters.
    const urlParts = incomingRequest.url.split('?');
    const queryParameters = {};

    if (urlParts.length > 1) { // Check if query string exists
        const paramsString = urlParts[1];
        const urlSearchParams = new URLSearchParams(paramsString); // Type III: Use URLSearchParams for parsing

        for (const [key, value] of urlSearchParams.entries()) {
            queryParameters[key] = value;
        }
    }

    // Extract pagination and filtering parameters.
    let displayLimit = parseInt(queryParameters.limit, 10) || 0; // Type III: parseInt with radix
    let startingOffset = parseInt(queryParameters.offset, 10) || 0;
    const filterActive = queryParameters.active === 'true'; // Type III: new filter

    // Validate pagination parameters.
    if (displayLimit < 0) displayLimit = 0; // Type III: Guard clause for invalid limit
    if (startingOffset < 0) startingOffset = 0; // Type III: Guard clause for invalid offset

    // Apply filters and pagination to the data.
    let filteredMembers = all_members_data;

    if (filterActive) {
        filteredMembers = filteredMembers.filter(p => p.isActive); // Type III: Apply new filter
    }

    let pagedResults = [];
    const totalAvailable = filteredMembers.length;

    if (displayLimit > 0) {
        // Ensure we don't go out of bounds for slicing.
        const endOffset = Math.min(startingOffset + displayLimit, totalAvailable); // Type III: Use Math.min for safety
        pagedResults = filteredMembers.slice(startingOffset, endOffset);
    } else {
        // If limit is 0 or not specified, return all from offset.
        pagedResults = filteredMembers.slice(startingOffset);
    }

    // Construct the meta-information for the response.
    const responseMeta = {
        maximumResults: displayLimit,
        currentOffset: startingOffset,
        totalRecords: totalAvailable
    };

    // Return the mock response for the list view.
    return {
        status: 200,
        responseText: {
            records: pagedResults, // Type III: Renamed 'objects' to 'records'
            metadata: responseMeta // Type III: Renamed 'meta' to 'metadata'
        },
        responseJson: true
    };
});

// Backbone Model representing a single member.
var MemberEntity = Backbone.Tastypie.Model.extend({
    // The base API path for this resource.
    baseApiPath: '/api/v1/person/'
});

// Backbone Collection for managing a list of MemberEntity models.
var MemberDirectory = Backbone.Tastypie.Collection.extend({
    // The base API path for this collection.
    baseApiPath: '/api/v1/person/',
    // Specifies the model type for items in this collection.
    model: MemberEntity
});

// --- QUnit Tests for Tastypie Integration ---

// Test suite for verifying correct parsing of Tastypie-like responses.
asyncTest("verify_tastypie_response_parsing", 4, function() { // Type III: Changed test name, increased assertion count
    const desiredPageSize = 3; // Type III: Renamed 'limit'
    console.log("Test: verify_tastypie_response_parsing started.");

    // Initialize a collection with filters for fetching.
    const memberCollection = new MemberDirectory([], {
        filters: {
            limit: desiredPageSize,
            active: true // Type III: Added new filter parameter
        }
    });

    // Fetch the collection from the mock API.
    memberCollection.fetch({
        success: function(retrievedCollection) {
            console.log("Fetch successful for initial page.");
            // Verify the number of models retrieved.
            equal(retrievedCollection.models.length, desiredPageSize, "Expected number of models in collection matches page size.");
            // Verify metadata fields.
            equal(retrievedCollection.metadata.maximumResults, desiredPageSize, "Metadata 'maximumResults' matches desired page size.");
            equal(retrievedCollection.metadata.currentOffset, 0, "Metadata 'currentOffset' is initially zero.");
            
            // Type III: Add a new assertion based on the new filter
            const allActive = retrievedCollection.models.every(m => m.get('isActive') === true);
            ok(allActive, "All fetched members should be active based on filter.");

            start(); // Resume QUnit testing.

            // Nested test for individual model URL generation.
            test("validate_member_model_url", 1, function() { // Type III: Renamed test
                const firstMember = retrievedCollection.first();
                // Find the original data for comparison.
                const originalFirstMember = all_members_data.find(m => m.memberId === firstMember.get('memberId'));

                // Compare the generated URL with the expected resource link.
                equal(firstMember.url(), originalFirstMember.profileLink, "Member model URL matches expected profile link.");
            });

            // Nested async test for fetching the next page of results.
            asyncTest("retrieve_next_page_of_members", 3, function() { // Type III: Renamed test
                console.log("Test: retrieve_next_page_of_members started.");
                memberCollection.fetchNext({
                    success: function(nextPageCollection) {
                        console.log("Fetch successful for next page.");
                        // Verify the cumulative number of models.
                        equal(nextPageCollection.models.length, desiredPageSize * 2, "Cumulative models count correct after fetching next page.");
                        // Verify metadata for the next page.
                        equal(nextPageCollection.metadata.maximumResults, desiredPageSize, "Next page metadata 'maximumResults' is consistent.");
                        equal(nextPageCollection.metadata.currentOffset, desiredPageSize, "Next page metadata 'currentOffset' is correctly incremented.");
                        start(); // Resume QUnit testing.
                    }
                });
            });
        }
    });
});

// Test suite for scenarios where the requested limit exceeds the total available records.
asyncTest("handle_limit_exceeding_total", 6, function() { // Type III: Renamed test
    const largePageSize = 100; // A limit significantly larger than total records.
    const totalRecordsInDataSource = all_members_data.filter(p => p.isActive).length; // Type III: Use filtered count for total
    console.log("Test: handle_limit_exceeding_total started.");

    const membersListing = new MemberDirectory([], {
        filters: {
            limit: largePageSize,
            active: true // Type III: Consistent filter
        }
    });

    membersListing.fetch({
        success: function(firstFetchCollection) {
            console.log("First fetch with large limit successful.");
            // Verify the number of models retrieved should be the total available.
            equal(firstFetchCollection.models.length, totalRecordsInDataSource, "Models length matches total available records.");
            // Verify metadata.
            equal(firstFetchCollection.metadata.maximumResults, largePageSize, "Metadata 'maximumResults' is the requested large page size.");
            equal(firstFetchCollection.metadata.currentOffset, 0, "Initial offset is zero.");

            // Attempt to fetch the next page.
            membersListing.fetchNext({
                success: function(secondFetchCollection) {
                    console.log("Second fetch (next page) with large limit successful.");
                    // After fetching next page, the model count should still be the total available.
                    equal(secondFetchCollection.models.length, totalRecordsInDataSource, "Cumulative models length remains total available after fetching next page.");
                    // Metadata should reflect the same limit and an offset equal to total records.
                    equal(secondFetchCollection.metadata.maximumResults, largePageSize, "Next page metadata 'maximumResults' is consistent.");
                    equal(secondFetchCollection.metadata.currentOffset, totalRecordsInDataSource, "Next page metadata 'currentOffset' is total available records.");
                    start(); // Resume QUnit testing.
                }
            });
        }
    });
});

// Test for the URL generation of a newly created model.
test("new_member_model_url_generation", 1, function() { // Type III: Renamed test
    const newMemberInstance = new MemberEntity(); // Create a new model instance.
    // Verify that the URL for a new model (without an ID) is just the base API path.
    equal(newMemberInstance.url(), '/api/v1/person/', "New member model URL should be its base API path.");
});

// Test for ensuring metadata is instance-specific for collections.
test("collection_metadata_instance_isolation", 2, function() { // Type III: Renamed test, added assertion count
    // Define two distinct collection types.
    var CategoryCollection = Backbone.Tastypie.Collection.extend({ basePath: '/api/v1/categories/' }); // Type III: Renamed types and path
    var ProductCollection = Backbone.Tastypie.Collection.extend({ basePath: '/api/v1/products/' });

    // Create instances of these collections.
    var categoryInst = new CategoryCollection();
    var productInst = new ProductCollection();

    // Modify metadata on one instance.
    categoryInst.metadata.currentOffset = 25; // Type III: Changed field name

    // Assert that the modification on one instance does not affect the other.
    notEqual(categoryInst.metadata.currentOffset, productInst.metadata.currentOffset, "Metadata 'currentOffset' should be different for distinct collection instances.");
    // Type III: Add another assertion to check default or specific value
    equal(productInst.metadata.currentOffset, 0, "Default 'currentOffset' for a new collection instance should be 0.");
});