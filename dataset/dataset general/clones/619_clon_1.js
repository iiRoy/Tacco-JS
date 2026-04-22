// This file contains unit tests for the Knockout.js 'fastForEach' binding.
// It uses Mocha for the test framework and Chai for assertions.

// Main test suite for Knockout Else functionality.
/*
 *  Knockout Else - Test Suite
 *  Ensures the 'fastForEach' custom binding works as expected.
 */

// Configure Mocha test runner.
mocha . setup ( 'bdd' ) ;

// Initialize Chai's assert interface for tests.
assert = chai . assert ;

// Helper function to make frame animations synchronous for easier testing.
// This function will be called within 'describe' blocks.
function setupSynchronousFrameAnimation ( )
{
  // Store the original animation frame function.
  var originalAnimateFrame = FastForEach . animateFrame ;

  // Before each test case in the current suite, override the animation frame.
  beforeEach (
    function ( )
    {
      // Re-save the original just in case it was modified elsewhere (defensive).
      originalAnimateFrame = FastForEach . animateFrame ;

      // Replace with a synchronous version: directly execute the frame callback.
      FastForEach . animateFrame = function ( frame ) { frame ( ) } ;
    }
  ) ;

  // After each test case, restore the original animation frame function.
  afterEach ( function ( )
              {
                FastForEach . animateFrame = originalAnimateFrame ;
              }
            ) ;
} // End of setupSynchronousFrameAnimation function.

// Describe block for tests related to initial binding application.
describe ( "applying bindings" ,
           function ( )
           {
             // Enable synchronous frame animation for these tests.
             setupSynchronousFrameAnimation ( ) ;

             // Test case: Verify fastForEach works with a simple static JavaScript array.
             it ( "works with a static list" ,
                  function ( )
                  {
                    // Create a target UL element with the fastForEach binding.
                    var target = $ ( "<ul data-bind='fastForEach: $data'><li data-bind='text: $data'></li></div>" ) ;
                    // Define a static list of numbers.
                    var list   = [ 1 , 2 , 3 ] ;
                    // Apply Knockout bindings.
                    ko . applyBindings ( list , target [ 0 ] ) ;
                    // Assert that 3 list items were created.
                    assert . equal ( $ ( target ) . find ( "li" ) . length , 3 ) ;
                  }
                ) ;

             // Test case: Verify fastForEach works correctly with a Knockout observable array.
             it ( "works with an observable array" ,
                  function ( )
                  {
                    var target = $ ( "<ul data-bind='fastForEach: $data'><li data-bind='text: $data'></li></div>" ) ;
                    var list   = [ 1 , 2 , 3 ] ;
                    ko . applyBindings ( ko . observableArray ( list ) , target [ 0 ] ) ;
                    assert . equal ( $ ( target ) . find ( "li" ) . length , 3 ) ;
                  }
                ) ;

             // Test case: Verify fastForEach works when the data source is a plain observable holding an array.
             it ( "works with a plain observable with an array" ,
                  function ( )
                  {
                    var target = $ ( "<ul data-bind='fastForEach: $data'><li data-bind='text: $data'></li></div>" ) ;
                    var list   = [ 1 , 2 , 3 ] ;
                    ko . applyBindings ( ko . observable ( list ) , target [ 0 ] ) ;
                    assert . equal ( $ ( target ) . find ( "li" ) . length , 3 ) ;
                  }
                ) ;

             // Test case: Verify fastForEach works when the data source is a Knockout computed observable.
             it ( "works with a computed observable" ,
                  function ( )
                  {
                    var target = $ ( "<ul data-bind='fastForEach: $data'><li data-bind='text: $data'></li></div>" ) ;
                    var list   = [ 1 , 2 , 3 ] ;
                    ko . applyBindings ( ko . computed ( { read : function ( ) { return list } } ) , target [ 0 ] ) ;
                    assert . equal ( $ ( target ) . find ( "li" ) . length , 3 ) ;
                  }
                ) ;

             // Test case: Ensure bindings are applied to the immediate child elements.
             it ( "applies bindings to the immediate child" ,
                  function ( )
                  {
                    var target = $ ( "<ul data-bind='fastForEach: $data'><li data-bind='text: $data'></li></div>" ) ;
                    var list   = [ 'a' , 'b' , 'c' ] ;
                    ko . applyBindings ( list , target [ 0 ] ) ;
                    assert . equal ( $ ( target ) . find ( "li" ) . text ( ) , "abc" ) ;
                  }
                ) ;

             // Test case: Ensure bindings are applied correctly to children nested deeper within the template.
             it ( "applies to inner children" ,
                  function ( )
                  {
                    var target = $ ( "<ul data-bind='fastForEach: $data'><li><em data-bind='text: $data'></em></li></div>" ) ;
                    var list   = [ 'a' , 'b' , 'c' ] ;
                    ko . applyBindings ( list , target [ 0 ] ) ;
                    assert . equal ( $ ( target ) . html ( ) , '<li><em data-bind="text: $data">a</em></li>' +
                                                               '<li><em data-bind="text: $data">b</em></li>' +
                                                               '<li><em data-bind="text: $data">c</em></li>' ) ;
                  }
                ) ;

             // Test case: Verify fastForEach works with Knockout's virtual elements (comment-based templates).
             it ( "works with virtual elements" ,
                  function ( )
                  {
                    var target = $ ( "<div><!-- ko fastForEach: $data --><em data-bind='text: $data'></em><!-- /ko --></div>" ) ;
                    var list   = [ 'A' , 'B' ] ;
                    ko . applyBindings ( list , target [ 0 ] ) ;
                    assert . equal ( $ ( target ) . html ( ) , '<!-- ko fastForEach: $data -->' +
                                                               '<em data-bind="text: $data">A</em>' +
                                                               '<em data-bind="text: $data">B</em>' +
                                                               '<!-- /ko -->' ) ;
                  }
                ) ;

             // Test case: Ensure only the inner (virtual) element is bound and replicated.
             it ( "bindings only inner (virtual) element" ,
                  function ( )
                  {
                    var target = $ ( "<ul data-bind='fastForEach: $data'><!-- ko text: $data -->Z<!-- /ko --></ul>" ) ;
                    var list   = [ 'E' , 'V' ] ;
                    ko . applyBindings ( list , target [ 0 ] ) ;
                    assert . equal ( target . html ( ) , '<!-- ko text: $data -->E<!-- /ko -->' +
                                                          '<!-- ko text: $data -->V<!-- /ko -->' ) ;
                  }
                ) ;

             // Test case: Check handling of mixed content with virtual elements inside fastForEach.
             it ( "bindings mixed inner virtual elements" ,
                  function ( )
                  {
                    var target = $ ( "<ul data-bind='fastForEach: $data'>Q<!-- ko text: $data -->Z2<!-- /ko -->R</ul>" ) ;
                    var list   = [ 'E2' , 'V2' ] ;
                    ko . applyBindings ( list , target [ 0 ] ) ;
                    assert . equal ( target . html ( ) , 'Q<!-- ko text: $data -->E2<!-- /ko -->R' +
                                                          'Q<!-- ko text: $data -->V2<!-- /ko -->R' ) ;
                  }
                ) ;

             // Test case: Verify fastForEach can use a <template> tag specified by name/ID.
             it ( "uses the name/id of a <template>" ,
                  function ( )
                  {
                    var target    = $ ( "<ul data-bind='fastForEach: {name: \"tID\", data: $data}'>Zee</ul>" ) ;
                    var list      = [ 'F1' , 'F2' ] ;
                    // Create and append a template element to the document body.
                    var $template = $ ( "<template id='tID'>X<!-- ko text: $data--><!--/ko--></template>" )
                                      . appendTo ( document . body ) ;
                    ko . applyBindings ( list , target [ 0 ] ) ;
                    assert . equal ( target . html ( ) , "X<!-- ko text: $data-->F1<!--/ko-->" +
                                                          "X<!-- ko text: $data-->F2<!--/ko-->" ) ;
                    // Clean up: remove the temporary template.
                    $template . remove ( ) ;
                  }
                ) ;

             // Test case: Verify fastForEach can use a <script> tag as a template, specified by name/ID.
             it ( "uses the name/id of a <script>" ,
                  function ( )
                  {
                    var target    = $ ( "<ul data-bind='fastForEach: {name: \"tID\", data: $data}'>Zee</ul>" ) ;
                    var list      = [ 'G1' , 'G2' ] ;
                    // Create a script tag with type 'text/ko-template' and append it.
                    var $template = $ ( "<script type='text/ko-template' id='tID'></script>" )
                                      . appendTo ( document . body ) ;
                    // Set the template content.
                    $template . text ( "Y<!-- ko text: $data--><!--/ko-->" ) ;
                    ko . applyBindings ( list , target [ 0 ] ) ;
                    assert . equal ( target . html ( ) , "Y<!-- ko text: $data-->G1<!--/ko-->" +
                                                          "Y<!-- ko text: $data-->G2<!--/ko-->" ) ;
                    $template . remove ( ) ;
                  }
                ) ;

             // Test case: Verify fastForEach can use a regular <div> tag as a template, specified by name/ID.
             it ( "uses the name/id of a <div>" ,
                  function ( )
                  {
                    var target    = $ ( "<ul data-bind='fastForEach: {name: \"tID2\", data: $data}'>Zee</ul>" ) ;
                    var list      = [ 'H1' , 'H2' ] ;
                    // Create and append a div element to serve as a template.
                    var $template = $ ( "<div id='tID2'>Z<!-- ko text: $data--><!--/ko--></div>" )
                                      . appendTo ( document . body ) ;
                    ko . applyBindings ( list , target [ 0 ] ) ;
                    assert . equal ( target . html ( ) , "Z<!-- ko text: $data-->H1<!--/ko-->" +
                                                          "Z<!-- ko text: $data-->H2<!--/ko-->" ) ;
                    $template . remove ( ) ;
                  }
                ) ;
           }
         ) ; // End of "applying bindings" describe block.

// Describe block for tests related to changes in observable arrays.
describe ( "observable array changes" ,
           function ( )
           {
             // Ensure synchronous frame animation for these tests as well.
             setupSynchronousFrameAnimation ( ) ;

             // Declare variables to be used in each test.
             var div , obs , view ;

             // Setup code to run before each test in this suite.
             beforeEach ( function ( )
                          {
                            // Initialize a div with fastForEach binding.
                            div  = $ ( "<div data-bind='fastForEach: obs'><i data-bind='text: $data'></i></div>" ) ;
                            // Initialize an empty observable array.
                            obs  = ko . observableArray ( ) ;
                            // Create a view model object.
                            view = { obs : obs } ;
                          }
                        ) ;

             // Test case: Adding a single item to an initially empty list.
             it ( "adds an item to an empty list" ,
                  function ( )
                  {
                    ko . applyBindings ( view , div [ 0 ] ) ;
                    obs ( [ 'a' ] ) ; // Update the observable array.
                    assert . equal ( div . text ( ) , 'a' ) ;
                  }
                ) ;

             // Test case: Adding an item to the end of a list that already has elements.
             it ( "adds an item to the end of a pre-existing list" ,
                  function ( )
                  {
                    obs ( [ 'a' ] ) ;
                    ko . applyBindings ( view , div [ 0 ] ) ;
                    obs . push ( 'b' ) ; // Add 'b' to the end.
                    assert . equal ( div . text ( ) , 'ab' ) ;
                  }
                ) ;

             // Test case: Adding an item to the beginning of a pre-existing list.
             it ( "adds an item to the beginning of a pre-existing list" ,
                  function ( )
                  {
                    obs ( [ 'a' ] ) ;
                    ko . applyBindings ( view , div [ 0 ] ) ;
                    obs . unshift ( 'b' ) ; // Add 'b' to the beginning.
                    assert . equal ( div . text ( ) , 'ba' ) ;
                  }
                ) ;

             // Test case: Adding an item into the middle of an existing list.
             it ( "adds an item to the middle of a pre-existing list" ,
                  function ( )
                  {
                    obs ( [ 'a' , 'b' ] ) ;
                    ko . applyBindings ( view , div [ 0 ] ) ;
                    obs . splice ( 1 , 0 , 'c' ) ; // Insert 'c' at index 1.
                    assert . equal ( div . text ( ) , 'acb' ) ;
                  }
                ) ;

             // Test case: Deleting the last item from a list, making it empty.
             it ( "deletes the last item" ,
                  function ( )
                  {
                    obs ( [ 'a' ] ) ;
                    ko . applyBindings ( view , div [ 0 ] ) ;
                    obs ( [ ] ) ; // Clear the array.
                    assert . equal ( div . text ( ) , '' ) ;
                  }
                ) ;

             // Test case: Deleting items when the template has surrounding text nodes.
             it ( "deletes text nodes" ,
                  function ( )
                  {
                    div = $ ( "<div data-bind='fastForEach: obs'>x<i data-bind='text: $data'></i>y</div>" ) ;
                    ko . applyBindings ( view , div [ 0 ] ) ;
                    obs ( [ 'a' , 'b' , 'c' ] ) ;
                    assert . equal ( div . text ( ) , 'xayxbyxcy' ) ;
                    obs ( [ 'a' , 'c' ] ) ;
                    assert . equal ( div . text ( ) , 'xayxcy' ) ;
                    obs ( [ 'a' ] ) ;
                    assert . equal ( div . text ( ) , 'xay' ) ;
                    obs ( [ ] ) ;
                    assert . equal ( div . text ( ) , '' ) ;
                  }
                ) ;

             // Test case: Deleting items from a virtual element (comment-based template).
             it ( "deletes from virtual elements" ,
                  function ( )
                  {
                    div = $ ( "<div>" ) ;
                    div . append ( document . createComment ( "ko fastForEach: obs" ) ) ;
                    div . append ( $ ( "<i data-bind='text: $data'></i>" ) [ 0 ] ) ;
                    div . append ( document . createComment ( "/ko" ) ) ;
                    ko . applyBindings ( view , div [ 0 ] ) ;
                    obs ( [ 'a' , 'b' , 'c' ] ) ;
                    assert . equal ( div . text ( ) , 'abc' ) ;
                    obs ( [ 'a' , 'c' ] ) ;
                    assert . equal ( div . text ( ) , 'ac' ) ;
                    obs ( [ 'a' ] ) ;
                    assert . equal ( div . text ( ) , 'a' ) ;
                    obs ( [ ] ) ;
                    assert . equal ( div . text ( ) , '' ) ;
                    obs ( [ 'a' , 'b' ] ) ;
                    assert . equal ( div . text ( ) , 'ab' ) ;
                    obs ( [ ] ) ;
                    assert . equal ( div . text ( ) , '' ) ;
                    obs ( [ 'a' , 'b' , 'c' ] ) ;
                    assert . equal ( div . text ( ) , 'abc' ) ;
                    obs ( [ 'a' ] ) ;
                    assert . equal ( div . text ( ) , 'a' ) ;
                    obs ( [ 'a' , 'b' , 'c' ] ) ;
                    assert . equal ( div . text ( ) , 'abc' ) ;
                    obs ( [ 'c' ] ) ;
                    assert . equal ( div . text ( ) , 'c' ) ;
                  }
                ) ;

             // Test case: Deleting an item from the beginning of the list using `shift`.
             it ( "deletes from the beginning" ,
                  function ( )
                  {
                    obs ( [ 'a' , 'b' , 'c' ] ) ;
                    ko . applyBindings ( view , div [ 0 ] ) ;
                    obs . shift ( ) ; // Remove the first item.
                    assert . equal ( div . text ( ) , 'bc' ) ;
                  }
                ) ;

             // Another test case for deleting from the beginning, using `pop` (which deletes from end).
             // NOTE: This test description is misleading, as `pop` deletes from the end.
             // The original code has this description, so we keep it.
             it ( "deletes from the beginning" ,
                  function ( )
                  {
                    obs ( [ 'a' , 'b' , 'c' ] ) ;
                    ko . applyBindings ( view , div [ 0 ] ) ;
                    obs . pop ( ) ; // Remove the last item.
                    assert . equal ( div . text ( ) , 'ab' ) ;
                  }
                ) ;

             // Test case: Combining multiple additions and deletions in a single update.
             it ( "combines multiple adds and deletes" ,
                  function ( )
                  {
                    obs ( [ 'A' , 'B' , 'C' , 'D' , 'E' , 'F' ] ) ;
                    ko . applyBindings ( view , div [ 0 ] ) ;
                    obs ( [ 'x' , 'B' , 'C' , 'D' , 'z' , 'F' ] ) ;
                    assert . equal ( div . text ( ) , 'xBCDzF' ) ;
                  }
                ) ;

             // Test case: Processing a series of multiple delete operations.
             // Addresses a specific issue (#6) in the original project.
             it ( "processes multiple deletes" ,
                  function ( )
                  {
                    // Per issue #6
                    ko . applyBindings ( view , div [ 0 ] ) ;
                    obs ( [ 0 , 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 ] ) ;
                    assert . equal ( div . text ( ) , '0123456789' ) ;
                    obs ( [ 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 ] ) ;
                    assert . equal ( div . text ( ) , '12345678' ) ;
                    obs ( [ 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 ] ) ;
                    assert . equal ( div . text ( ) , '23456789' ) ;
                    obs ( [ 3 , 4 , 5 , 6 , 7 , 8 , 9 ] ) ;
                    assert . equal ( div . text ( ) , '3456789' ) ;
                    obs ( [ 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 ] ) ;
                    assert . equal ( div . text ( ) , '23456789' ) ;
                    obs ( [ 6 , 7 , 8 , 9 ] ) ;
                    assert . equal ( div . text ( ) , '6789' ) ;
                    obs ( [ 1 , 2 , 3 , 6 , 7 , 8 ] ) ;
                    assert . equal ( div . text ( ) , '123678' ) ;
                    obs ( [ 0 , 1 , 2 , 3 , 4 ] ) ;
                    assert . equal ( div . text ( ) , '01234' ) ;
                    obs ( [ 1 , 2 , 3 , 4 ] ) ;
                    assert . equal ( div . text ( ) , '1234' ) ;
                    obs ( [ 3 , 4 ] ) ;
                    assert . equal ( div . text ( ) , '34' ) ;
                    obs ( [ 3 ] ) ;
                    assert . equal ( div . text ( ) , '3' ) ;
                    obs ( [ ] ) ;
                    assert . equal ( div . text ( ) , '' ) ;
                  }
                ) ;

             // Test case: Processing numerous and varied changes to the observable array.
             it ( "processes numerous changes" ,
                  function ( )
                  {
                    ko . applyBindings ( view , div [ 0 ] ) ;
                    obs ( [ 5 , 6 , 7 , 8 , 9 ] ) ;
                    assert . equal ( div . text ( ) , '56789' ) ;
                    obs ( [ 0 , 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 ] ) ;
                    assert . equal ( div . text ( ) , '0123456789' ) ;
                    obs ( [ 'a' , 'b' , 'c' ] ) ;
                    assert . equal ( div . text ( ) , 'abc' ) ;
                  }
                ) ;

             // Test case: Verifies that changes via a computed observable are correctly reflected.
             it ( "accepts changes via a computed observable" ,
                  function ( )
                  {
                    var target = $ ( "<ul data-bind='fastForEach: $data'><li data-bind='text: $data'></li></div>" ) ;
                    var toggle = ko . observable ( true ) ;
                    var list1  = [ 1 , 2 , 3 ] ;
                    var list2  = [ 1 , 2 , 3 , 4 , 5 , 6 ] ;
                    ko . applyBindings ( ko . computed ( {
                                                           read : function ( )
                                                           {
                                                             return toggle ( ) ? list1 : list2 ;
                                                           }
                                                         } ) ,
                                         target [ 0 ]
                                       ) ;
                    assert . equal ( target . text ( ) , "123" ) ;
                    toggle ( false ) ; // Change the observable, which should trigger the computed.
                    assert . equal ( target . text ( ) , "123456" ) ;
                  }
                ) ;

           }
         ) ; // End of "observable array changes" describe block.

// Run all the defined Mocha tests.
mocha . run ( ) ;