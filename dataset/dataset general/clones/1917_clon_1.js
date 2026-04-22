/*
 * This file contains a Type I clone of a JavaScript test suite.
 * It has been modified extensively in terms of whitespace and comments,
 * but its core logic and structure remain absolutely identical to the original.
 */
// Original JSDoc comment for React JSX transform.
/**
 * @jsx React.DOM
 * This directive tells Babel/JSX transformer to use React.DOM for JSX elements.
 */
// Jest configuration to prevent mocking the footer module.
jest
    .dontMock('../footer.js'); // Ensure the actual footer module is used.


// Describe block for the 'footer' component test suite.
describe ( 'footer' , function ( ) {

    // Variable declarations for React and testing utilities.
    var React = require('react/addons') , // Load the main React library with addons.
        TestUtils = React.addons.TestUtils , // Extract TestUtils for component rendering and querying.

        // The component under test.
        Footer = require('../footer') ; // Load the Footer component itself.


    // Individual test case: ensures correct rendering of plural comments text.
    it ( 'should correctly render the footer text comments as plural for multiple comments' , function ( ) {

         // Define a mock post object with specific properties for testing.
         var post = {
             points         :         5 , // Number of points for the post.
             postedBy       :       'Prabir Shrestha' , // Author of the post.
             postedAgo      :      '4 hours ago' , // Time elapsed since posting.
             commentCount   :   7 // Number of comments, which should trigger plural text.
         } ; // End of post object definition.

        // Render the Footer component into a detached DOM environment.
        var footer = TestUtils . renderIntoDocument ( < Footer post = { post } /> ) ;

        // Find the 'small' HTML element within the rendered footer component.
        var small = TestUtils . findRenderedDOMComponentWithTag ( footer , 'small' ) ;

        // Extract the text content from the found 'small' element.
        var text = small . getDOMNode ( ) . textContent ;

        // Assertion: Check if the text contains 'comments' (plural form).
        // The indexOf check is robust against the position of 'comments'.
        expect ( text . indexOf ( 'comments' , text . length - 'comments' . length ) ) . not . toBe ( -1 ) ;
    } ) ; // End of the 'it' block for this test case.

} ) ; // End of the 'describe' block for the footer component.