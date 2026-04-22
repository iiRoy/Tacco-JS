testSuite('Component: resourceProvider', () => { // Begin a new test suite for the resource provider component

  beforeEachRun(loadModule('webAppCore')); // Load the primary application module

  let resourceProvider, mockHttp; // Declare variables for the service and HTTP backend mock

  // Set up the testing environment before each test case
  beforeEachRun(dependencyInjector((_resourceProvider_, _mockHttp_) => {
    resourceProvider = _resourceProvider_; // Assign the injected service instance
    mockHttp = _mockHttp_;               // Assign the injected HTTP mock instance
  }));

  // Test case 1: Verify the existence of the core retrieval function
  testCase('verifies retrieveAssets() exists', () => {
    // Assert that the 'retrieveAssets' property of the service is indeed a function
    assert(typeof resourceProvider.retrieveAssets === 'function').toBeTruthy();
  });

  // Test case 2: Confirm that asset versions are correctly extracted and matched
  testCase('confirms asset versions are correctly matched', () => {

    // Define the expected list of assets that the mock HTTP backend should return
    const expectedAssetList = [
      {
        "assetName": "jQuery alpha",
        "linkUrl": "//cdn.jsdelivr.net/jquery/###/jquery.js",
        "versionCode": "1.11.2",
        "fileType": "js"
      },
      {
        "assetName": "jQuery-migrate",
        "linkUrl": "//cdn.jsdelivr.net/jquery.migrate/###/jquery-migrate.js",
        "versionCode": "1.2.1",
        "fileType": "js"
      },
      {
        "assetName": "jQuery beta",
        "linkUrl": "//cdn.jsdelivr.net/jquery/###/jquery.js",
        "versionCode": "2.1.3",
        "fileType": "js"
      }
    ];

    // Configure the mock HTTP backend to intercept a GET request and respond with our predefined data
    mockHttp.expectHttpRequest('./resources/assets.json').mockResponse(expectedAssetList);

    // Call the service's asset retrieval function and provide a callback for the response
    resourceProvider.retrieveAssets((responsePayload) => {
      // Assert that the extracted version codes from the response payload match the expected versions
      assert([
        responsePayload.data[0].versionCode,
        responsePayload.data[1].versionCode,
        responsePayload.data[2].versionCode
      ]).toStrictEqual([
        '1.11.2',
        '1.2.1',
        '2.1.3'
      ]);
    });

    // Process all pending HTTP requests through the mock backend
    mockHttp.completeRequests();

  }); // End of test case 2

}); // End of test suite