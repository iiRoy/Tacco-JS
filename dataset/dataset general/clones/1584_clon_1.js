// This file contains a series of QUnit tests designed to thoroughly
// evaluate the functionality and various use cases of the 'el' utility function.
// It covers basic element creation, attribute handling, nested structures,
// and advanced content provisioning, including asynchronous operations.

// --- Test Block 1: Basic Element Creation ---
// This test suite verifies the fundamental capability of 'el' to create
// a simple HTML element without any attributes or content initially.
test ( "Creating a basic element",
  function ( )
  {
    // Initialize 'actual' with a div created by the 'el' function.
    var actual = el ( 'div' ) ;

    // Initialize 'expected' with a standard div created via native DOM API.
    var expected = document . createElement ( 'div' ) ;


    // Perform assertions to confirm that the 'el' function's output
    // matches the native DOM element's characteristics.
    equal ( actual . tagName, expected . tagName, 'The tag names should be identical for a basic div' ) ;
    equal ( actual . className, expected . className, 'The class names must match (expected to be empty)' ) ;
    equal ( actual . id, expected . id, 'The ID attributes should also match (expected to be empty)' ) ;
    equal ( actual . attributes . length, expected . attributes . length, 'The number of attributes must be consistent' ) ;
  }
) ;


// --- Test Block 2: Element Creation with Constructor-like Call ---
// This test ensures that 'el' can be used directly to create elements
// with initial attributes, mimicking a constructor-like behavior.
test ( 'use the constructor for el instead of calling the function',
  function ( )
  {
    var actual,
        expected
    ; // Declare variables for the element under test and its comparison counterpart.

    // Create an anchor element using 'el', providing an href attribute.
    actual = el ( 'a', { 'href' : 'https://github.com/markgandolfo/el.js' } ) ;

    // Create the equivalent element using native DOM methods for comparison.
    expected = document . createElement ( 'a' ) ;
    expected . href = 'https://github.com/markgandolfo/el.js' ; // Set the href property on the expected element.

    // Verify that the tag names are identical.
    equal ( actual . tagName, expected . tagName ) ;
    // Verify that the href attributes are identical.
    equal ( actual . href, expected . href ) ;
  }
) ;


// --- Test Block 3: Element Creation with Mixed Attributes and Content ---
// This test focuses on creating a complex element with various attributes
// (class, id, href, rel) and also includes inner text content.
test ( "Create an element with mixed attributes",
  function ( )
  {
    var actual = el (
      'a', // The tag name for the element.
      {
        'class' : 'my classes', // CSS class attribute.
        'id'    : 'myId',       // ID attribute.
        'href'  : 'https://github.com/markgandolfo/el.js', // Hyperlink reference.
        'rel'   : 'nofollow'    // Relationship attribute.
      },
      'el.js ftw' // The textual content inside the element.
    ) ;

    var expected = document . createElement ( 'a' ) ; // Create a native anchor element.

    expected . className = 'my classes' ; // Set class name.
    expected . id = 'myId' ;             // Set ID.
    expected . setAttribute ( 'rel', 'nofollow' ) ; // Set 'rel' attribute using setAttribute.
    expected . href = 'https://github.com/markgandolfo/el.js' ; // Set href.
    expected . innerHTML = 'el.js ftw' ; // Set inner HTML content.

    // --- Assertions for verification of mixed attribute handling ---
    equal ( actual . tagName, expected . tagName, 'Tag names must match for mixed attributes test' ) ;
    equal ( actual . className, expected . className, 'Class names should be correctly assigned and match' ) ;
    equal ( actual . id, expected . id, 'ID values should be consistent and match' ) ;
    equal ( actual . attributes . length, expected . attributes . length, 'The total number of attributes must match' ) ;
    equal ( actual . getAttribute ( 'id' ), expected . getAttribute ( 'id' ), 'The ID attribute value should be identical' ) ;
    equal ( actual . getAttribute ( 'rel' ), expected . getAttribute ( 'rel' ), 'The rel attribute value should be identical' ) ;
    equal ( actual . getAttribute ( 'href' ), expected . getAttribute ( 'href' ), 'The href attribute value should be identical' ) ;
    equal ( actual . innerHTML, expected . innerHTML, 'The inner HTML content must match precisely' ) ;
  }
) ;


// --- Test Block 4: Merging Selector-based Attributes with Object Attributes ---
// This test case examines how 'el' merges attributes defined in a selector string
// (e.g., 'a#id.class') with attributes provided in an object.
test ( "Create an element with selector elements and watch them merge",
  function ( )
  {
    var actual = el (
      'a#my2ndId.mySecond-class', // Selector string: tag, ID, and class.
      {
        'class' : 'my classes', // Class attribute from object.
        'id'    : 'myId',       // ID attribute from object.
        'href'  : 'https://github.com/markgandolfo/el.js',
        'rel'   : 'nofollow'
      },
      'el.js ftw' // Element's inner text content.
    ) ;

    var expected = document . createElement ( 'a' ) ; // Native element for comparison.

    expected . className = 'my classes mySecond-class' ; // Expected merged class names.
    expected . id = 'myId my2ndId' ;                   // Expected merged IDs.
    expected . setAttribute ( 'rel', 'nofollow' ) ;
    expected . href = 'https://github.com/markgandolfo/el.js' ;
    expected . innerHTML = 'el.js ftw' ;

    // --- Assertions for merged attributes ---
    equal ( actual . tagName, expected . tagName, 'Tag names should be consistent after merging' ) ;
    equal ( actual . className, expected . className, 'Merged class names must precisely match' ) ;
    equal ( actual . id, expected . id, 'Merged ID values must be identical' ) ;
    equal ( actual . attributes . length, expected . attributes . length, 'Total count of attributes should match after merging' ) ;
    equal ( actual . getAttribute ( 'id' ), expected . getAttribute ( 'id' ), 'The final ID attribute value should match' ) ;
    equal ( actual . getAttribute ( 'rel' ), expected . getAttribute ( 'rel' ), 'The final rel attribute value should match' ) ;
    equal ( actual . getAttribute ( 'href' ), expected . getAttribute ( 'href' ), 'The final href attribute value should match' ) ;
    equal ( actual . innerHTML, expected . innerHTML, 'The inner HTML content should be preserved' ) ;
  }
) ;


// --- Test Block 5: Creation of Nested Elements ---
// This test evaluates the ability of 'el' to construct elements that contain
// other 'el'-generated elements as children, creating a nested structure.
test ( "Test nested tags",
  function ( )
  {
    // Create an image element to be nested.
    var img = el ( 'img', { 'src' : 'http://placekitten.com/200/300' } ) ;
    // Create an anchor element, nesting the 'img' element as its child.
    var actual = el ( 'a', { 'href' : 'https://github.com/markgandolfo/el.js' }, img ) ;

    // --- Setup for expected native DOM structure ---
    var imgExpected = document . createElement ( 'img' ) ;
    var expected = document . createElement ( 'a' ) ;

    imgExpected . src = 'http://placekitten.com/200/300' ;
    expected . href = 'https://github.com/markgandolfo/el.js' ;
    expected . appendChild ( imgExpected ) ; // Append the native image to the native anchor.
    // --- End setup ---

    // Verify that the inner HTML (children) of the actual and expected elements match.
    equal ( actual . innerHTML, expected . innerHTML, 'The child object was placed correctly inside of the parent' ) ;
    // Verify that the outer HTML (including the parent element itself) matches.
    equal ( actual . outerHTML, expected . outerHTML, 'The full nested elements structure worked as expected' ) ;
  }
) ;


// --- Test Block 6: Direct 'el' Call Without Explicit '.create' (if applicable) ---
// This test confirms that the 'el' function can be invoked directly
// to create elements, implying it doesn't require a chained 'create' method.
test ( 'el without the .create',
  function ( )
  {
    // Create an image element using the direct 'el' function call.
    var actual = el ( 'img', { 'src' : 'http://placekitten.com/200/300' } ) ;
    // Create a corresponding native DOM image element.
    var expected = document . createElement ( 'img' ) ;
    expected . src = 'http://placekitten.com/200/300' ; // Set the source attribute.

    // --- Assertions for direct 'el' usage ---
    equal ( actual . tagName, expected . tagName, 'Tag names are confirmed to be the same' ) ;
    equal ( actual . innerHTML, expected . innerHTML, 'Inner HTML content matches for direct el call' ) ;
    equal ( actual . outerHTML, expected . outerHTML, 'Outer HTML structure matches for direct el call' ) ;
  }
) ;


// --- Test Block 7: Creation of Elements with Multiple Children from an Array ---
// This test verifies 'el's ability to create a parent element and populate it
// with multiple child elements provided in an array.
test ( "Test multiple children",
  function ( )
  {
    var list = el (
      'ul', // Parent element tag.
      { 'class' : 'someclass' }, // Attributes for the parent.
      [
        el ( 'li', { "class" : "active" }, "first" ), // First list item.
        el ( 'li', null, "second" ), // Second list item.
        el ( 'li', null, "third" ) // Third list item.
      ]
    ) ;

    // The expected complete HTML string for the generated list.
    var expected = '<ul class="someclass"><li class="active">first</li><li>second</li><li>third</li></ul>' ;

    // Verify that the outer HTML of the created list matches the expected string.
    equal ( list . outerHTML, expected, 'A list with correctly nested elements should be created' ) ;

  }
) ;


// --- Test Block 8: Function as a Content Provider (Synchronous and Asynchronous) ---
// This test explores various ways a function can provide content to 'el',
// including immediate returns, 'done' callbacks, and mixed content arrays.
test ( "Test function as a content provider",
  function ( )
  {

    var actual,
        expected
    ; // Declare variables for test results.

    // Scenario 1: Synchronous content provider function.
    actual = el ( 'div', { }, function ( ) {
      return el ( 'span' ) ; // Returns an element immediately.
    } ) ;

    expected = '<div><span></span></div>' ; // Expected HTML.

    equal ( actual . outerHTML, expected, 'Content successfully created with a synchronous callback function' ) ;

    // Scenario 2: Asynchronous content provider function using a 'done' callback.
    actual = el ( 'div', { }, function ( done ) {
      done ( el ( 'span' ) ) ; // Calls 'done' with the element.
    } ) ;

    expected = '<div><span></span></div>' ; // Expected HTML.

    equal ( actual . outerHTML, expected, 'Content successfully created with an asynchronous callback function' ) ;

    // Scenario 3: Mixed content providers in an array.
    actual = el ( 'div', { }, [
      function ( done ) {
        done ( el ( 'span.fromAsyncCallback' ) ) ; // Async callback.
      },

      function ( done ) {
        return el ( 'span', { 'class' : 'fromCallback' } ) ; // Sync callback returning an element.
      },
      el ( 'span.fromLiteral' ), // A literal element.
      'plain text content' // Plain text string.
    ] ) ;

    expected = '<div><span class=\"fromAsyncCallback\"></span><span class=\"fromCallback\"></span><span class=\"fromLiteral\"></span>plain text content</div>' ;
    equal ( actual . outerHTML, expected, 'Content created successfully with a mixture of different content providers' ) ;
  }
) ;


// --- Test Block 9: Advanced Asynchronous Content Provider with Timeout ---
// This asyncTest specifically verifies the behavior of 'el' when dealing
// with content provided via an asynchronous function that uses `setTimeout`.
asyncTest ( 'Test async content provider function',
  function ( )
  {
    var actual,
        expected
    ; // Variables for the element and its final expected HTML.

    // The complete expected HTML string, including the element generated after a timeout.
    expected = '<div><span class="fromAsyncCallback"></span><span class="fromCallback"></span><span class="fromLiteral"></span>plain text content<span class="fromTimeoutAsyncCallback"></span></div>' ;

    actual = el ( 'div', { }, [
      function ( done ) {
        done ( el ( 'span.fromAsyncCallback' ) ) ; // An immediate async callback.
      },
      function ( done ) {
        // This function simulates a delayed asynchronous operation.
        setTimeout ( function ( ) {
          done ( el ( 'span.fromTimeoutAsyncCallback' ) ) ; // The 'done' callback is invoked after delay.

          // This assertion is placed here to capture the state of 'actual'
          // *after* all asynchronous content has been processed and appended.
          equal ( actual . outerHTML, expected, 'Content created with mixed async providers, including timeout-based ones' ) ;
          start ( ) ; // Signal to QUnit that this asynchronous test has finished.

        }, 0 ) ; // Zero-delay timeout to push execution to the end of the event queue.
      },
      function ( done ) {
        return el ( 'span', { 'class' : 'fromCallback' } ) ; // A synchronous content provider.
      },
      el ( 'span.fromLiteral' ), // A directly provided element.
      'plain text content' // A simple text node.
    ] ) ;
  }
) ;


// --- Test Block 10: Async Content Provider with Return Value vs. Done Callback ---
// This asyncTest explores a specific edge case where an async content provider
// function both returns a value *and* calls the 'done' callback, checking for suppression.
asyncTest ( 'Test async content provider function 2',
  function ( )
  {
    var actual,
        expected
    ; // Declare variables for actual element and its expected HTML.

    // Expected HTML. Note that `span.two` is intentionally absent because
    // its `done` callback should be suppressed by the synchronous return of `span.three`.
    expected = '<div><span class="one"></span><span class="three"></span></div>' ;

    actual = el ( 'div', { }, [
      function ( ) {
        return el ( 'span.one' ) ; // This function provides content synchronously.
      },
      function ( done ) {
        setTimeout ( function ( ) {
          done ( el ( 'span.two' ) ) ; // This 'done' call is expected to be ignored.
          equal ( actual . outerHTML, expected, 'The doneCallback should be suppressed when a result is also returned by the function' ) ;
        }, 0 ) ;
        return el ( 'span.three' ) ; // This synchronous return takes precedence.
      }
    ] ) ;
    setTimeout ( start, 0 ) ; // Ensure QUnit starts the next test after this async one concludes.
  }
) ;


// --- Test Block 11: Variadic Create with One Argument (Tag Name Only) ---
// This test verifies the 'el' function's behavior when called with only a single argument,
// which is expected to be the HTML tag name.
test ( 'Variadic create with one arg',
  function ( )
  {
    var actual,
        expected
    ; // Declare variables for the created element and its expected HTML.

    actual = el ( 'div' ) ; // Create a simple div with no attributes or content.
    expected = '<div></div>' ; // The expected HTML string for an empty div.

    equal ( actual . outerHTML, expected, 'An empty div element should be created successfully' ) ;
  }
) ;


// --- Test Block 12: Variadic Create with Two Arguments (Various Combinations) ---
// This comprehensive test suite covers multiple scenarios where the 'el' function
// is invoked with exactly two arguments, testing different types for the second argument.
test ( 'Variadic create with two args',
  function ( )
  {
    var actual,
        expected
    ; // Initialize variables for the actual element and its expected HTML output.

    // Scenario 1: Second argument is an attribute object.
    actual = el ( 'div', { id : 'someId' } ) ;
    expected = '<div id="someId"></div>' ;
    equal ( actual . outerHTML, expected, 'A div element with a specified ID should be correctly created' ) ;

    // Scenario 2: Second argument is a single child element.
    actual = el ( 'div', el ( 'span' ) ) ;
    expected = '<div><span></span></div>' ;
    equal ( actual . outerHTML, expected, 'A div containing a single span element should be created' ) ;

    // Scenario 3: Second argument is an array of child elements.
    actual = el ( 'div', [ el ( 'span' ), el ( 'span' ) ] ) ;
    expected = '<div><span></span><span></span></div>' ;
    equal ( actual . outerHTML, expected, 'A div containing two span elements should be created' ) ;

    // Scenario 4: Second argument is a synchronous function providing content.
    actual = el ( 'div', function ( ) { return el ( 'span' ) ; } ) ;
    expected = '<div><span></span></div>' ;
    equal ( actual . outerHTML, expected, 'A div with a single span generated from a synchronous callback should be created' ) ;

    // Scenario 5: Second argument is an asynchronous function providing content via 'done'.
    actual = el ( 'div', function ( done ) { done ( el ( 'span' ) ) ; } ) ;
    expected = '<div><span></span></div>' ;
    equal ( actual . outerHTML, expected, 'A div with a single span generated from an asynchronous done callback should be created' ) ;
  }
) ;