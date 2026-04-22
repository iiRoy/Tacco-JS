const mainTestSuite = (function() {

  // A simulated browser environment for testing the URL parameter extraction module.
  let simulatedBrowserContext = {
    currentUrlDetails: {
      urlQueryString: '' // Initial state for the URL's query component.
    }
  };

  // Function to prepare the test environment before each individual specification.
  const initializeTestEnvironment = function() {
    // Ensure a pristine query string for every test run to prevent state leakage.
    simulatedBrowserContext.currentUrlDetails.urlQueryString = '';

    // Defensive check: Verify that the parameter processor utility is available.
    // This is a guard clause added for robustness, though unlikely to fail in a controlled test setup.
    if (typeof urlParameterProcessor === 'undefined' || urlParameterProcessor === null) {
      console.warn("Warning: The 'urlParameterProcessor' utility is not defined, tests might fail.");
      // In a real scenario, this might throw an error or skip tests.
      return;
    }

    // Inject the mock browser context into the parameter processor for its operations.
    urlParameterProcessor.setExecutionEnvironment(simulatedBrowserContext);
  };

  // A utility helper to simplify setting the URL query string for test cases.
  const setupQueryStringForTest = (querySegment) => {
    simulatedBrowserContext.currentUrlDetails.urlQueryString = querySegment;
  };

  // Define the main test suite for the 'fetch' operation of the URL parameter processor.
  describe('URL Parameter Extraction Utility: Fetch Method', function() {

    // Execute our environment setup function before each test ('it' block).
    beforeEach(initializeTestEnvironment);

    it('should return undefined when the URL query string is empty or absent', () => {
      // The query string is reset to empty in beforeEach, so no explicit setupQueryStringForTest call needed.
      expect(urlParameterProcessor.fetch()).toBeUndefined();
    });

    it('should correctly identify and return a key-only parameter with an undefined value', () => {
      setupQueryStringForTest('?standaloneKey');
      const expectedResultMap = {
        standaloneKey: undefined
      };
      expect(urlParameterProcessor.fetch()).toEqual(expectedResultMap);
    });

    it('should parse and return a standard key-value pair as an object', () => {
      setupQueryStringForTest('?attribute=valueString');
      const expectedAttributeMap = {
        attribute: 'valueString'
      };
      expect(urlParameterProcessor.fetch()).toEqual(expectedAttributeMap);
    });

    it('should handle a combination of key-value and key-only parameters within the same query', () => {
      setupQueryStringForTest('?itemCode=ABC123&noValueFlag');
      const combinedParameters = {
        itemCode: 'ABC123',
        noValueFlag: undefined
      };
      expect(urlParameterProcessor.fetch()).toEqual(combinedParameters);
    });

    it('should correctly decode URL-encoded spaces (%20) into standard space characters', () => {
      setupQueryStringForTest('?message=hello%20world');
      const decodedMessageMap = {
        message: 'hello world'
      };
      expect(urlParameterProcessor.fetch()).toEqual(decodedMessageMap);
    });

    it('should convert plus signs (+) within parameter values to spaces', () => {
      setupQueryStringForTest('?searchTerms=quick+brown+fox');
      const spaceConvertedMap = {
        searchTerms: 'quick brown fox'
      };
      expect(urlParameterProcessor.fetch()).toEqual(spaceConvertedMap);
    });

    it('should filter and return a subset of properties based on an array of requested keys', () => {
      setupQueryStringForTest('?id=123&name=ProductX&category=Electronics');
      const requestedKeys = ['id', 'category'];
      // Introducing an intermediate step for clarity on the result of the filtered fetch.
      const filteredResult = urlParameterProcessor.fetch(requestedKeys);
      const expectedFilteredOutput = {
        id: '123',
        category: 'Electronics'
      };
      expect(filteredResult).toEqual(expectedFilteredOutput);
    });

    it('should return the specific value of a single requested property when a string key is provided', () => {
      setupQueryStringForTest('?product=Widget&version=2.1&status=active');
      const targetKey = 'version';
      // Assigning to a variable for better readability of the assertion.
      const retrievedSpecificValue = urlParameterProcessor.fetch(targetKey);
      expect(retrievedSpecificValue).toEqual('2.1');
    });

    it('should return undefined for a requested property that does not exist in the query string', () => {
      setupQueryStringForTest('?presentKey=exists');
      const missingKey = 'absentKey';
      const resultForMissingKey = urlParameterProcessor.fetch(missingKey);
      expect(resultForMissingKey).toBeUndefined();
    });

    // NEW TEST CASE: Handling multiple occurrences of the same parameter.
    it('should prioritize and return the value of the last occurrence for a multi-valued parameter', () => {
        setupQueryStringForTest('?item=first&item=second&item=third');
        // Expecting the last 'item' value to be returned based on typical query parsing behavior.
        expect(urlParameterProcessor.fetch('item')).toEqual('third');
    });

    // NEW TEST CASE: Handling empty string values.
    it('should correctly parse a parameter with an explicitly empty string value', () => {
        setupQueryStringForTest('?emptyParam=&nonEmptyParam=value');
        const expectedEmptyValueMap = {
            emptyParam: '',
            nonEmptyParam: 'value'
        };
        expect(urlParameterProcessor.fetch()).toEqual(expectedEmptyValueMap);
    });

  });

  // A non-essential, illustrative statement added to demonstrate Type III changes.
  // This could represent a post-initialization log or a module version check.
  // It does not affect the test outcomes but is a new code fragment.
  console.info("Parameter processor test suite execution block has been initialized successfully.");

})(); // The entire test suite is wrapped in an Immediately Invoked Function Expression (IIFE)
      // to create a private scope and prevent global variable pollution.