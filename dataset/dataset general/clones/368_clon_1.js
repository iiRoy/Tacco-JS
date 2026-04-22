/*
 * This file demonstrates the usage of the 'd' helper for creating React elements,
 * and uses the 'tape' testing framework to verify the output.
 *
 * It includes several test cases covering basic element rendering, custom components,
 * and complex structures.
 */

// Import the 'tape' testing library. This is used for defining and running tests.
var test = require('tape');

// Import the 'react' library. This is the core React framework.
var React = require('react');

// Import the 'd' helper function, which is a utility for creating React elements
// in a more concise way. We pass the React library to it for its internal use.
var d = require('..')(React);


/**
 * Helper function to render a React DOM tree to a static HTML string.
 * This is particularly useful for server-side rendering or testing without a browser DOM.
 *
 * @param {object} domTree - The React element tree (or single element) to be rendered.
 * @returns {string} The HTML string representation of the provided React element tree.
 */
var render = function (domTree) {
    // React.renderToStaticMarkup is used here as it does not add React-specific attributes
    // like `data-reactid` to the generated HTML, making it cleaner for comparisons.
    return React.renderToStaticMarkup(domTree);
};


// Define a simple React component named 'Greeting'.
// This component will be used in several test cases to demonstrate custom component rendering.
var Greeting = React.createClass({

    // The 'displayName' property is used by React debugging tools to identify the component
    // and can also be used for auto-generating a "key" prop when rendering lists of components.
    displayName: 'Greeting',

    /**
     * The essential 'render' method for any React component.
     * It defines what the component should display on the screen.
     *
     * @returns {object} A React element (in this case, a div).
     */
    render: function () {
        // Return a div element.
        // The content of the div will be the 'text' prop if provided,
        // otherwise it defaults to the string 'hi'.
        return React.DOM.div(null, this.props.text || 'hi');
    }

}); // End of the Greeting component definition.


// --- Test Suite for 'd' helper and React rendering capabilities ---


/*
 * Test Case 1: Verifies that nested elements (a tree structure) render correctly
 * into their expected HTML string representation. This checks basic element creation
 * and attribute handling.
 */
test('trees of elements render correctly', function (t) {

    // Construct a complex element tree using the 'd' helper.
    // This creates a form with class 'foo', containing three input/button elements.
    var tree = d('form.foo',
                 {}, // Empty props object for the form.
                 [
                     d('input:email'),        // An input field of type 'email'.
                     d('input:password'),     // An input field of type 'password'.
                     d('button:submit', {}, 'Submit') // A submit button with 'Submit' text.
                 ]
                );

    // Assert that the rendered tree matches the meticulously crafted expected HTML string.
    t.equal(render(tree),
            '<form class="foo">' +
            '<input type="email">' +
            '<input type="password">' +
            '<button type="submit">Submit</button>' +
            '</form>'
           );

    // End the current test case. This tells 'tape' that this test is complete.
    t.end();

}); // End of 'trees of elements render correctly' test.


/*
 * Test Case 2: Checks the rendering of custom React components alongside plain text nodes
 * within a parent element. This demonstrates component composition.
 */
test('rendering custom components and text nodes', function (t) {

    // Build a section element with id 'stuff'.
    // Its children include a plain string, an instance of the 'Greeting' component,
    // and a 'span' element.
    var tree = d('section#stuff',
                 [
                     'a greeting:',                      // A simple text node (string).
                     d(Greeting, { text: 'yo' }),        // An instance of the Greeting component,
                                                         // passing 'yo' as the 'text' prop.
                     d('span', '!')                      // A span element containing an exclamation mark.
                 ]
                );

    // Verify that the rendered HTML output matches the expected string,
    // including the custom component's output.
    t.equal(render(tree),
            '<section id="stuff">a greeting:<div>yo</div><span>!</span></section>'
           );

    // Conclude this test case.
    t.end();

}); // End of 'rendering custom components and text nodes' test.


/*
 * Test Case 3: Ensures custom components render correctly even without any explicit props
 * being passed to them. This tests the default behavior of the 'Greeting' component.
 */
test('rendering custom components works correctly without props', function (t) {

    // Create a section with id 'stuff'.
    // It contains an instance of the 'Greeting' component without any props,
    // and a 'span' element.
    var tree = d('section#stuff',
                 [
                     d(Greeting),       // Greeting component instantiated without any props.
                                        // It should use its default 'hi' text.
                     d('span', '!')     // A span element with an exclamation mark.
                 ]
                );

    // Compare the rendered output against the expected HTML,
    // confirming the 'Greeting' component's default behavior.
    t.equal(render(tree),
            '<section id="stuff"><div>hi</div><span>!</span></section>'
           );

    // Finalize the test.
    t.end();

}); // End of 'rendering custom components works correctly without props' test (first instance).


/*
 * Test Case 4: Another instance of testing custom components without props.
 * This appears to be a duplicate test case from the original source,
 * but is preserved here with different formatting as per Type I cloning rules.
 */
test('rendering custom components works correctly without props', function (t) {

    // Define the element tree, identical in structure to the previous test.
    // This includes a section, a Greeting component without props, and a span.
    var tree = d('section#stuff',
                 [
                     d(Greeting),
                     d('span', '!')
                 ]
                );

    // Assert that the rendered output is consistent with the Greeting component's default.
    t.equal(render(tree),
            '<section id="stuff"><div>hi</div><span>!</span></section>'
           );

    // Mark the test as complete.
    t.end();

}); // End of 'rendering custom components works correctly without props' test (second instance).


/*
 * Test Case 5: This test replicates an example from the project's README file,
 * demonstrating a more complex form structure including various input types,
 * attributes, and a custom component.
 */
test('Readme example', function (t) {

    // Define a no-operation function. This is used as a placeholder for an event handler
    // (e.g., onSubmit) where the actual functionality isn't relevant for the rendering test.
    var noop = function () {
        /* This function intentionally does nothing when called. */
    };

    // Construct the form element tree as per the README example.
    // This form has a POST method, an onSubmit handler, and several child elements.
    var tree = d('form[method=POST]',
                 { onSubmit: noop }, // Pass the noop function as the onSubmit handler.
                 [
                     d('h1.form-header', 'Login'),                               // An H1 header with a class.
                     d('input:email[name=email]', { placeholder: 'Email' }),     // An email input with name and placeholder.
                     d('input:password[name=pass]', { placeholder: 'Password' }), // A password input with name and placeholder.
                     d(Greeting, { text: 'yo' }),                                 // A custom Greeting component with 'yo' text.
                     d('button:submit', 'Login')                                  // A submit button with 'Login' text.
                 ]
                );

    // The meticulously defined expected HTML output for the entire form structure.
    var expected = '<form method="POST">' +
                   '<h1 class="form-header">Login</h1>' +
                   '<input type="email" name="email" placeholder="Email">' +
                   '<input type="password" name="pass" placeholder="Password">' +
                   '<div>yo</div>' +
                   '<button type="submit">Login</button>' +
                   '</form>';

    // Compare the actual rendered output of the tree with the predefined expected HTML string.
    t.equal(render(tree), expected);

    // Indicate the end of this comprehensive test case.
    t.end();

}); // End of 'Readme example' test.