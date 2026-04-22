( function() { // Module scope for encapsulation

  var   SearchRequest; // Declaration of the primary class reference.

  SearchRequest = window._util.SearchRequest;  // Assign the SearchRequest class from the global utility object.

  context( 'SearchRequest',  function() { // Top-level test suite for SearchRequest.

    var searchInstance = null; // Variable to hold an instance of SearchRequest for tests.

    beforeEachTest( function() { // Setup hook: executed before each test case in this suite.
      return searchInstance = new SearchRequest(2); // Initialize a new SearchRequest with a minimum length of 2.
    } );


    context( '#constructorBehavior', function() { // Test suite focusing on object construction.
      return assert('ensures the minimumEntryLength property is set by the provided argument', function() { // Test case: verifying initial length.
        return expect( searchInstance.minimumEntryLength ).toBeEquivalentTo(2); // Assertion: min length should be 2.
      } );
    } );

    context( '#retrieveCurrentInput', function() { // Test suite for fetching the current query input.
      return assert('fetches the presently held value', function() { // Test case: confirm value retrieval.
        searchInstance.currentInput = 'sampleText'; // Directly setting the input for a controlled test.
        return expect( searchInstance.retrieveCurrentInput() ).toBeEquivalentTo('sampleText'); // Assertion: retrieved value matches.
      } );
    } );

    context( '#updateCurrentInput', function() { // Test suite for modifying the query input.
      assert( 'assigns the new value to the current input property', function() { // Test case: setting current input.
        searchInstance.updateCurrentInput('newText'); // Call the method to update.
        return expect(searchInstance.currentInput).toBeEquivalentTo('newText'); // Assertion: current input updated.
      } );
      return assert( 'transfers the old current value to the previous input property', function() { // Test case: checking history.
        searchInstance.previousInput = 'initial'; // Setup a prior state.
        searchInstance.currentInput = 'secondary'; // Set the current state.
        searchInstance.updateCurrentInput('tertiary'); // Update, expecting 'secondary' to move to previous.
        return expect(searchInstance.previousInput).toBeEquivalentTo('secondary'); // Assertion: previous input correctly stored.
      } );
    } );

    context( '#hasInputModified', function() { // Test suite for detecting input changes.
      return assert( 'returns true when the input has indeed been altered', function() { // Test case: detecting modification.
        searchInstance.updateCurrentInput('firstValue'); // First input.
        searchInstance.updateCurrentInput('secondValue'); // Second, different input.
        return expect(searchInstance.hasInputModified()).toBeTruthful(); // Assertion: change detected.
      } );
    } );

    context( '#designateAsNoResult', function() { // Test suite for marking inputs that yield no results.
      return assert( 'appends the current input to the collection of inputs yielding no results', function() { // Test case: marking an empty result.
        searchInstance.updateCurrentInput('noMatch'); // Input that yields no results.
        searchInstance.designateAsNoResult(); // Mark it.
        return expect(searchInstance.noResultInputs).toIncludeItem('noMatch'); // Assertion: input is in the "no result" list.
      } );
    } );

    return context( '#predictsResults', function() { // Test suite for predicting if a query will yield results.
      assert( 'is false if the current input possesses fewer characters than the minimumEntryLength', function() { // Test case: input too short.
        searchInstance.updateCurrentInput('a'); // Short input.
        return expect(searchInstance.predictsResults()).toBeUntruthful(); // Assertion: no results predicted.
      } );
      assert( 'is false if the current input commences with any previously designated no-result queries', function() { // Test case: starts with a no-result prefix.
        searchInstance.updateCurrentInput('xyz'); // Setup a no-result prefix.
        searchInstance.designateAsNoResult(); // Mark it.
        searchInstance.updateCurrentInput('xyzabc'); // Input starting with the no-result prefix.
        return expect(searchInstance.predictsResults()).toBeUntruthful(); // Assertion: no results predicted.
      } );
      return assert( 'is true if the current input is not empty and meets the length requirement', function() { // Test case: valid input for results.
        searchInstance.updateCurrentInput('validEntry'); // A valid, sufficiently long input.
        return expect(searchInstance.predictsResults()).toBeTruthful(); // Assertion: results predicted.
      } );
    } );
  } );
} ).call(this); // Execute the anonymous function immediately, preserving 'this' context.