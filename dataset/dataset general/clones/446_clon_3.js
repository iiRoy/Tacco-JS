const path = require('path');
const PolygonClippingFunctionality = require(path.resolve(__dirname, '../../lib/geometry-utils.js'));
const testDoubles = require('sinon');
const testAssertions = require('expect.js');

// Main test suite for the PolygonClippingFunctionality module
testAssertions.describe('PolygonClippingFunctionality Module Validation', function() {

    // Variables to hold our test subject and mocks for each test run
    let utilityUnderTest = null;
    let domSimulator = null;
    let mockDomElement = null;

    // Setup routine executed before each test case
    testAssertions.beforeEach(function() {
        // Initializing our DOM interaction simulator, mimicking jQuery's behavior
        domSimulator = {
            // A history of all selectors passed to the `locateElements` method
            queryHistory: [],
            // The `attr` method that will be spied upon directly
            attributeHandler: function(key, value) {
                // This method is primarily here to be spied on by `sinon`.
                // It returns `this` to allow method chaining, similar to jQuery.
                return this;
            },
            // The `find` method, renamed to `locateElements`
            locateElements: function(elementLocator) {
                this.queryHistory.push(elementLocator); // Track the selector
                return this; // Returns itself for method chaining
            },
            // An additional, unrelated method for Type III clone testing (e.g., to assert it wasn't called)
            unrelatedMethod: testDoubles.spy()
        };

        // Simulate the jQuery factory function ($)
        const mockJQueryFactory = function(initialLocator) {
            // Reset query history for each test and add the initial locator
            domSimulator.queryHistory = [initialLocator];
            // Return the main simulator object, allowing direct chaining of methods like `attr` or `find`
            return domSimulator;
        };

        // Mocking a DOM element with a CSS method spy
        mockDomElement = {
            applyStyle: testDoubles.spy() // Renamed 'css' to 'applyStyle'
        };

        // Define initial polygon coordinates for the utility's constructor
        const initialPolygonCoords = [
            [3, 2],
            [6, 7]
        ];

        // Instantiate the utility under test
        utilityUnderTest = new PolygonClippingFunctionality(mockJQueryFactory, mockDomElement, initialPolygonCoords);

        // Optional: add a guard clause for robust testing setup (Type III addition)
        if (!utilityUnderTest) {
            throw new Error("Utility under test failed to initialize, check constructor arguments!");
        }
    });

    // Test suite for the coordinate value formatting helper (e.g., adding 'px' or '%')
    testAssertions.describe('Coordinate Value Processing (Private Method)', function() {

        // Test case: should return a simple number when no unit is requested
        testAssertions.it('should provide a raw numeric output when unit formatting is explicitly disabled', function() {
            // Define the input and anticipated outcome for this scenario
            const inputCoordinate = 20;
            const enableUnitSuffix = false;
            const treatAsPercentage = false;
            const anticipatedResult = 20;

            // Execute the method under test with the given parameters
            const computedValue = utilityUnderTest._processUnitValue(inputCoordinate, enableUnitSuffix, treatAsPercentage);

            // Assert that the computed value matches the expected raw number
            testAssertions.expect(computedValue).to.be.equal(anticipatedResult);
        });

        // Test case: handles zero correctly with unit enabled
        testAssertions.it('should yield zero as a numeric value, even if unit formatting is requested, for a zero input', function() {
            // Set up test variables
            const inputCoordinate = 0;
            const enableUnitSuffix = true;
            const treatAsPercentage = false;
            const anticipatedResult = 0; // Zero should remain zero, not "0px" or "0%"

            // Invoke the target method
            const computedValue = utilityUnderTest._processUnitValue(inputCoordinate, enableUnitSuffix, treatAsPercentage);

            // Verify the outcome
            testAssertions.expect(computedValue).to.be.equal(anticipatedResult);
        });

        // Test case: handles zero correctly without unit formatting
        testAssertions.it('should return a plain zero when the input is zero and unit formatting is also off', function() {
            // Prepare test data
            const inputVal = 0;
            const withUnitFlag = false;
            const isPercentFlag = false;
            const expectedOut = 0;

            // Invoke the target method
            const actualOut = utilityUnderTest._processUnitValue(inputVal, withUnitFlag, isPercentFlag);

            // Verify the outcome
            testAssertions.expect(actualOut).to.be.equal(expectedOut);
        });

        // Test case: should append 'px' when unit is requested and value is positive
        testAssertions.it('should append the pixel unit suffix for positive numeric values when unit formatting is enabled', function() {
            // Set up our test scenario
            const inputValue = 20;
            const includeUnit = true;
            const isPercent = false;
            const desiredOutput = "20px";

            // Call the function under examination
            const actualOutput = utilityUnderTest._processUnitValue(inputValue, includeUnit, isPercent);

            // Check if the result matches the desired pixel-suffixed string
            testAssertions.expect(actualOutput).to.be.equal(desiredOutput);
        });

        // Test case: converts to decimal for percentage without unit
        testAssertions.it('should convert a percentage value to its decimal equivalent when no unit string is explicitly desired', function() {
            // Establish preconditions for the test
            const rawValue = 20;
            const attachUnit = false;
            const isPercentage = true;
            const anticipatedDecimal = 0.2;

            // Perform the operation by calling the utility method
            const calculatedValue = utilityUnderTest._processUnitValue(rawValue, attachUnit, isPercentage);

            // Validate that the calculated value matches the anticipated decimal
            testAssertions.expect(calculatedValue).to.be.equal(anticipatedDecimal);
        });

        // Test case: appends '%' for percentage with unit
        testAssertions.it('should correctly format a percentage value by appending the percent sign when unit formatting is active', function() {
            // Define inputs and the expected string output
            const valInput = 20;
            const unitEnabled = true;
            const percentEnabled = true;
            const expectedPercentString = '20%';

            // Execute the helper function with the defined inputs
            const actualPercentString = utilityUnderTest._processUnitValue(valInput, unitEnabled, percentEnabled);

            // Verify the correctness of the generated percentage string
            testAssertions.expect(actualPercentString).to.be.equal(expectedPercentString);
        });

    });

    // Test suite for the coordinate list serialization helper (e.g., converting array to SVG string)
    testAssertions.describe('Vertex List Serialization (Private Method)', function() {

        // Helper function to create a common coordinate set for reuse (Type III addition)
        const createCommonCoordinateSet = () => [
            [0, 20],
            [9, 2],
            [4, 4],
            [2, 0],
            [0, 0]
        ];

        // Test case: should translate points with pixel units
        testAssertions.it('should generate a string of coordinates with pixel units appended for each non-zero component', function() {
            // Given a set of points (coordinates)
            const coordinateSet = createCommonCoordinateSet();
            const anticipatedString = "0 20px, 9px 2px, 4px 4px, 2px 0, 0 0";

            // When the serialization method is called with unit formatting enabled (for pixels)
            const computedString = utilityUnderTest._convertVertexListToString(coordinateSet, true, false);

            // Then the output should match the expected pixel-suffixed format
            testAssertions.expect(computedString).to.be.equal(anticipatedString);
        });

        // Test case: should translate points without pixel units
        testAssertions.it('should generate a string of raw numeric coordinates without any unit suffixes', function() {
            // Given a set of input points
            const coordinateSet = createCommonCoordinateSet();
            const anticipatedString = "0 20, 9 2, 4 4, 2 0, 0 0";

            // When the serialization method is called without unit formatting
            const computedString = utilityUnderTest._convertVertexListToString(coordinateSet, false, false);

            // Then the output should precisely match the expected raw numeric format
            testAssertions.expect(computedString).to.be.equal(anticipatedString);
        });

        // Test case: should translate points with percentage units
        testAssertions.it('should generate a string of coordinates with percentage units appended for each non-zero component', function() {
            // Given a set of points for conversion
            const coordinateSet = createCommonCoordinateSet();
            const anticipatedString = "0 20%, 9% 2%, 4% 4%, 2% 0, 0 0";

            // When the serialization method is called with percentage and unit formatting enabled
            const computedString = utilityUnderTest._convertVertexListToString(coordinateSet, true, true);

            // Then the output should match the expected percentage-suffixed format
            testAssertions.expect(computedString).to.be.equal(anticipatedString);
        });

        // Test case: should translate points as decimals for percentages without units
        testAssertions.it('should generate a string of decimal coordinates for percentage values when no unit string is required', function() {
            // Given a set of points that represent percentages
            const coordinateSet = createCommonCoordinateSet();
            const anticipatedString = "0 0.2, 0.09 0.02, 0.04 0.04, 0.02 0, 0 0";

            // When the serialization method is called with percentage enabled but unit formatting disabled
            const computedString = utilityUnderTest._convertVertexListToString(coordinateSet, false, true);

            // Then the output should match the expected decimal format
            testAssertions.expect(computedString).to.be.equal(anticipatedString);
        });

    });

    // Test suite for the clip path definition creation mechanisms
    testAssertions.describe('Clip Path Generation Mechanisms', function() {

        // Test case for SVG-based clip path creation
        testAssertions.it('should correctly construct an SVG-based clip path definition and apply it to the target element', function() {
            // Pre-conditions: Retrieve the SVG ID and set up a spy on the mock's attribute setter
            const svgIdString = utilityUnderTest.svgDefId;
            const attributeSpy = testDoubles.spy(domSimulator, "attributeHandler"); // Spying on the actual mock method
            const elementLocator = `#${svgIdString} polygon`;
            const firstAttrKey = 'points';
            const secondAttrValue = '2 1, 5 7, 8 8';
            const coordinatesToProcess = [
                [2, 1],
                [5, 7],
                [8, 8]
            ];

            // Execute the SVG clip path generation method
            utilityUnderTest._applySvgPolygonClip(coordinatesToProcess);

            // Assertions:
            // 1. Verify the correct element selector was used by the mock jQuery's `find` method
            testAssertions.expect(domSimulator.queryHistory.join(' ')).to.be.equal(elementLocator);
            // 2. Verify the 'points' attribute was set correctly on the located element mock
            testAssertions.expect(attributeSpy.withArgs(firstAttrKey, secondAttrValue).calledOnce).to.be.true;
            // 3. Verify the CSS 'clip-path' property was applied to the target element
            testAssertions.expect(mockDomElement.applyStyle.withArgs('clip-path', `url(#${svgIdString})`).calledOnce).to.be.true;

            // Add an extra assertion for Type III: ensure an unrelated mock method was not invoked
            testAssertions.expect(domSimulator.unrelatedMethod.notCalled).to.be.true;
        });

        // Test case for SVG-based clip path creation with percentage values
        testAssertions.it('should construct an SVG-based clip path definition using percentage coordinates transformed to decimals', function() {
            // Pre-conditions: Enable percentage mode on the utility and prepare inputs
            utilityUnderTest.isPercentage = true;
            const svgIdString = utilityUnderTest.svgDefId;
            const attributeSpy = testDoubles.spy(domSimulator, "attributeHandler");
            const elementLocator = `#${svgIdString} polygon`;
            const firstAttrKey = 'points';
            const secondAttrValue = '0.02 0.01, 0.05 0.07, 0.08 0.08'; // Expected decimal percentage string
            const coordinatesToProcess = [
                [2, 1],
                [5, 7],
                [8, 8]
            ];

            // Execute the method under test
            utilityUnderTest._applySvgPolygonClip(coordinatesToProcess);

            // Assertions: Verify the selector, attribute setting, and CSS application
            testAssertions.expect(domSimulator.queryHistory.join(' ')).to.be.equal(elementLocator);
            testAssertions.expect(attributeSpy.withArgs(firstAttrKey, secondAttrValue).calledOnce).to.be.true;
            testAssertions.expect(mockDomElement.applyStyle.withArgs('clip-path', `url(#${svgIdString})`).calledOnce).to.be.true;
        });

        // Test case for Webkit-specific clip path creation
        testAssertions.it('should correctly set a Webkit-specific clip path style using direct CSS properties', function() {
            // Pre-conditions: Define the expected CSS string and set up a spy for attributes (to ensure it's not used)
            const cssClipValue = 'polygon(2px 1px, 0 7px, 8px 8px)';
            const attributeSpy = testDoubles.spy(domSimulator, "attributeHandler");
            const coordinatesToProcess = [
                [2, 1],
                [0, 7],
                [8, 8]
            ];

            // Execute the Webkit clip path generation method
            utilityUnderTest._applyWebkitPolygonClip(coordinatesToProcess);

            // Assertions:
            // 1. Ensure no attributes were set via the general attribute setter (as this method uses CSS directly)
            testAssertions.expect(attributeSpy.notCalled).to.be.true;
            // 2. Verify the CSS '-webkit-clip-path' property was applied correctly to the mock element
            testAssertions.expect(mockDomElement.applyStyle.withArgs('-webkit-clip-path', cssClipValue).calledOnce).to.be.true;

            // Add a simple logging statement as a Type III addition for demonstration
            console.log("Webkit clip path test completed successfully for pixel values.");
        });

        // Test case for Webkit-specific clip path creation with percentage values
        testAssertions.it('should set a Webkit-specific clip path style utilizing percentage coordinates', function() {
            // Pre-conditions: Enable percentage mode and define the expected CSS string
            utilityUnderTest.isPercentage = true;
            const cssClipValue = 'polygon(2% 1%, 0 7%, 8% 8%)';
            const attributeSpy = testDoubles.spy(domSimulator, "attributeHandler");
            const coordinatesToProcess = [
                [2, 1],
                [0, 7],
                [8, 8]
            ];

            // Execute the method under test
            utilityUnderTest._applyWebkitPolygonClip(coordinatesToProcess);

            // Assertions:
            // 1. Confirm that the attribute handler was not called, as expected for Webkit CSS
            testAssertions.expect(attributeSpy.notCalled).to.be.true;
            // 2. Verify that the correct CSS property and value were applied
            testAssertions.expect(mockDomElement.applyStyle.withArgs('-webkit-clip-path', cssClipValue).calledOnce).to.be.true;
        });

    });

});