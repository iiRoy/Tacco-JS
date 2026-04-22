// Initialize a new YUI module for component specifications
YUI.add('component-spec', function (Core) {
    // Create a collection of test cases for the Y.Component functionality
    var testCollection = new Core.Test.Suite('Specification Set for Y.Component');

    testCollection.add(new Core.Test.Case({
        // Name of this particular test case block
        name: 'Validating renderHtml()',

        // Test scenario: Missing style property should result in a default container div
        'Missing styleProperty should result in a default container': function () {
            var component = new Core.Unit(), // Instantiate a new component
                outputHtml = '<div class="yui3-u ">\n</div>\n'; // Expected HTML output

            Core.Assert.areEqual(outputHtml, component.toMarkup()); // Verify the generated markup
        },

        // Test scenario: A specified style property should be appended to the default container div
        'A specified styleProperty should append to the default container': function () {
            var component = new Core.Unit({ className: 'align-left' }), // Component with a custom class
                outputHtml = '<div class="yui3-u align-left">\n</div>\n'; // Expected HTML output with custom class

            Core.Assert.areEqual(outputHtml, component.toMarkup()); // Compare actual to expected HTML
        },

        // Test scenario: Simple textual data should be embedded directly within the component's container
        'Textual data should be embedded within the component': function () {
            var component = new Core.Unit(), // Create a basic component
                outputHtml = '<div class="yui3-u ">\nGREETINGS\n</div>\n'; // Expected markup with text

            component.set('content', ['GREETINGS']); // Set textual content
            Core.Assert.areEqual(outputHtml, component.toMarkup()); // Check if content is rendered correctly
        },

        // Test scenario: Layout structures (grids) should be nestable within a component
        'Layout structures should be nestable within a component': function () {
            var component = new Core.Unit(), // Initialize a component instance
                outputHtml = '<div class="yui3-u ">\n' // Expected HTML for nested grid
                    + '<div class="yui3-g ">\n<div class="yui3-u ">\n</div>\n</div>\n'
                    + '</div>\n';

            component.set('content', [new Core.Grid()]); // Add a grid as content
            Core.Assert.areEqual(outputHtml, component.toMarkup()); // Assert the generated HTML
        },

        // Test scenario: Mixed content (layout and text) should maintain their original sequence when rendered
        'Layout and textual content should maintain their sequence': function () {
            var component = new Core.Unit(), // New component for mixed content test
                outputHtml = '<div class="yui3-u ">\n' // Complex expected HTML with grid, text, grid
                    + '<div class="yui3-g ">\n<div class="yui3-u ">\n</div>\n</div>\n'
                    + 'GREETINGS\n'
                    + '<div class="yui3-g ">\n<div class="yui3-u ">\n</div>\n</div>\n'
                    + '</div>\n';

            component.set('content', [new Core.Grid(), 'GREETINGS', new Core.Grid()]); // Set mixed content
            Core.Assert.areEqual(outputHtml, component.toMarkup()); // Verify the sequence in the output
        }
    }));

    testCollection.add(new Core.Test.Case({
        // Second test case block: focusing on content assignment logic
        name: 'Validating content assignment to a Component',

        // Test scenario: The data parameter for content should strictly be an array
        'Data parameter should strictly be an array': function () {
            var component = new Core.Unit({ content: 'invalid-type' }); // Attempt to set non-array content
            Core.Assert.areNotEqual('invalid-type', component.get('content')); // Ensure content is not the invalid type
        },

        // Test scenario: The data parameter should accept an array containing strings and Y.Layout objects
        'Data parameter should accept an array of strings and Y.Layout objects': function () {
            var component = new Core.Unit(), // Component instance
                contentItems = ['first', new Core.Grid(), 'third']; // Valid mixed content array

            component.set('content', contentItems); // Assign the valid content array
            Core.Assert.areEqual(contentItems, component.get('content')); // Confirm content is correctly stored
        },

        // Test scenario: The content array should reject unsupported object types (e.g., Date)
        'Data array should reject unsupported object types': function () {
            var component = new Core.Unit(), // Another component instance
                contentItems = ['first', new Date(), 'third']; // Array with an illegal object

            component.set('content', contentItems); // Attempt to set illegal content
            Core.Assert.areNotEqual('invalid-type', component.get('content')); // Verify that the illegal content is not stored directly
        }
    }));

    // Add the entire collection of test cases to the YUI test runner
    Core.Test.Runner.add(testCollection);

}, "2.0", { requires: ['layout-module', 'spec-runner'] }); // Module version and dependencies