describe ( 'Circles',      function ( ) {
    // This block describes the Circles functionality.
    it ( 'is defined', function ( ) {
        expect ( typeof   Circles ) . toEqual ( 'function' ) ; // Verifies the type.
    } ) ;


    /*
     * Declare global variables for the test suite.
     * 'element' will hold the DOM element for rendering.
     * 'circle' will hold the Circles instance.
     */
    var     element ,    circle ;

    /**
     * Helper function to retrieve the text element.
     * @returns {HTMLElement} The second child of the first child of 'element'.
     */
    function    getText ( )
    {
        return    element . firstChild . children [ 1 ] ;
    }

    /**
     * Another helper function to get the SVG element.
     * @returns {SVGElement} The first SVG element found within 'element'.
     */
    function  getSVG ( )
    {
        return    element . firstChild . getElementsByTagName ( 'svg' ) [ 0 ] ;
    }


    // This block runs before each test case.
    beforeEach ( function ( ) {
        // Create a new div element for each test.
        element    =    document . createElement ( 'div' ) ;
        element . id    =    'circles-1' ; // Assign a unique ID.
        document . body . appendChild ( element ) ; // Add it to the document body.
    } ) ;


    // This block runs after each test case to clean up.
    afterEach ( function ( ) {
        // Remove the created element from the DOM to prevent side effects.
        element . parentNode . removeChild ( element ) ;
    } ) ;

    // Start of the 'Creation' test suite.
    describe ( 'Creation', function ( ) {

        // Test case: Verify that Circles.create returns an instance of Circles.
        it ( 'returns a Circles instance', function ( ) {
            var    circles    =    Circles . create ( { } ) ; // Create a new Circles instance.
            expect ( circles    instanceof    Circles ) . toBeTruthy ( ) ; // Assertion.
        } ) ;

        // Test case: Check if the created instance has a default value of 0.
        it ( 'returns an instance with 0 as value', function ( ) {
            var    circles    =    Circles . create ( { id : element . id } ) ; // Create with element ID.
            expect ( circles . getValue ( ) ) . toEqual ( 0 ) ; // Check the value.
        } ) ;

        // Test case: Ensure the max value defaults to 100.
        it ( 'returns an instance with 100 as max value', function ( ) {
            var    circles    =    Circles . create ( { id : element . id } ) ; // Create with element ID.
            expect ( circles . getMaxValue ( ) ) . toEqual ( 100 ) ; // Check max value.
        } ) ;


        // Nested describe block for 'Generated content'.
        describe ( 'Generated content', function ( ) {

            // Set up a circle instance before each test in this suite.
            beforeEach ( function ( ) {
                circle    =    Circles . create ( {
                    id : element . id , // Use the test element's ID.
                    value : 40 , // Initial value.
                    radius : 60 , // Circle radius.
                    duration : null // No animation duration.
                } ) ;
            } ) ;

            // Test case: Check for a custom wrapper class.
            it ( 'contains a wrapper with default class', function ( ) {

                // Create a new Circles instance with a specific wrapper class.
                Circles . create ( {
                    id : element . id ,
                    value : 40 ,
                    radius : 60 ,
                    duration : null ,
                    wrpClass : 'wrapContainer' // Custom class name.
                } ) ;

                // Verify the class name of the first child element.
                expect ( element . firstChild . className ) . toEqual ( 'wrapContainer' ) ;
            } ) ;

            // Test case: Check for the default wrapper class when none is provided.
            it ( 'contains a wrapper with provided class', function ( ) {
                // The beforeEach setup ensures 'circle' is created.
                // This test checks the default class, which is 'circles-wrp'.
                expect ( element . firstChild . className ) . toEqual ( 'circles-wrp' ) ;
            } ) ;

            // Test case: Verify the presence of an SVG tag.
            it ( 'contains a SVG tag', function ( ) {
                // Use the helper function to get the SVG and check its type.
                expect ( getSVG ( )    instanceof    SVGSVGElement ) . toBeTruthy ( ) ;
            } ) ;

            // Test case: Check if the SVG contains exactly two PATH tags.
            it ( 'contains two PATH tags into the SVG', function ( ) {
                // Get SVG and count path elements.
                expect ( getSVG ( ) . getElementsByTagName ( 'path' ) . length ) . toEqual ( 2 ) ;
            } ) ;

            // Test case: Verify the 'd' attribute of the SVG path when no animation is present (duration: null).
            it ( 'contains the SVG without animation', function ( ) {
                // The circle was created in beforeEach with duration: null.
                var    dValue    =    getSVG ( ) . getElementsByTagName ( 'path' ) [ 1 ] . getAttribute ( 'd' ) ;
                expect ( dValue ) . toEqual ( 'M 59.988797973796764 5.000001140776291 A 55 55 0 0 1 92.3939094694214 104.44811165040569 ' ) ;
            } ) ;

            // Test case: Verify the 'd' attribute of the SVG path when animation is implied (duration not null).
            it ( "contains the SVG with animation", function ( ) {
                // Re-create the circle without 'duration: null' to enable default animation.
                circle    =    Circles . create ( {
                    id : element . id ,
                    value : 40 ,
                    radius : 60
                } ) ;

                // Retrieve the 'd' attribute of the second path element.
                var    dValue    =    element . firstChild . getElementsByTagName ( 'svg' ) [ 0 ] . getElementsByTagName ( 'path' ) [ 1 ] . getAttribute ( 'd' ) ;
                expect ( dValue ) . toEqual ( 'M 59.988797973796764 5.000001140776291 A 55 55 0 0 1 63.396635173034774 5.1049831997356705 ' ) ;
            } ) ;

            // Test case: Check if the wrapper element has default styles applied.
            it ( 'has styles by default', function ( ) {
                // Create a new circle instance with text and no duration.
                circle    =    Circles . create ( {
                    id : element . id ,
                    value : 40 ,
                    radius : 60 ,
                    text : '%' ,
                    duration : null
                } ) ;

                // Expect the first style property to be truthy (indicating styles are present).
                expect ( element . firstChild . style [ 0 ] ) . toBeTruthy ( ) ;
            } ) ;

            // Test case: Verify that wrapper styles can be overridden (disabled).
            it ( 'can have its styles overridden', function ( ) {
                // Create a circle with 'styleWrapper' set to false.
                circle    =    Circles . create ( {
                    id : element . id ,
                    value : 40 ,
                    radius : 60 ,
                    duration : null ,
                    text : '%' ,
                    styleWrapper : false // Disable wrapper styling.
                } ) ;

                // Expect no style properties on the wrapper.
                expect ( element . firstChild . style [ 0 ] ) . toBeFalsy ( ) ;
            } ) ;

        } ) ; // End of 'Generated content' describe block.


        // Start of the 'Text' test suite.
        describe ( 'Text', function ( ) {

            // Test case: Check if the text element is an HTMLDivElement.
            it ( 'has a container', function ( ) {
                // Create a circle instance.
                circle    =    Circles . create ( {
                    id : element . id ,
                    value : 40 ,
                    radius : 60 ,
                    duration : null
                } ) ;
                // Use helper to get text element and check its type.
                expect ( getText ( )    instanceof    HTMLDivElement ) . toBeTruthy ( ) ;
            } ) ;

            // Test case: Verify the default class of the text container.
            it ( 'has a container with default class', function ( ) {
                // Create a circle instance.
                circle    =    Circles . create ( {
                    id : element . id ,
                    value : 40 ,
                    radius : 60 ,
                    duration : null
                } ) ;

                // Check the class name.
                expect ( getText ( ) . className ) . toEqual ( 'circles-text' ) ;
            } ) ;

            // Test case: Check if a custom class for the text container is applied.
            it ( 'has a container with provided class', function ( ) {
                // Create a circle with a custom text class.
                circle    =    Circles . create ( {
                    id : element . id ,
                    value : 40 ,
                    radius : 60 ,
                    duration : null ,
                    textClass : 'textContainer' // Custom text class name.
                } ) ;

                // Verify the class name.
                expect ( getText ( ) . className ) . toEqual ( 'textContainer' ) ;
            } ) ;

            // Test case: Ensure the text content matches the supplied string.
            it ( 'contains the supplied text', function ( ) {
                // Create a circle with specific text.
                circle    =    Circles . create ( {
                    id : element . id ,
                    value : 40 ,
                    radius : 60 ,
                    text : '%' ,
                    duration : null
                } ) ;

                // Check the inner HTML of the text element.
                expect ( getText ( ) . innerHTML ) . toEqual ( '%' ) ;
            } ) ;

            // Test case: Check if the text can be generated by a function.
            it ( 'can be managed by a function', function ( ) {
                // Create a circle with a text-generating function.
                circle    =    Circles . create ( {
                    id : element . id ,
                    value : 40 ,
                    radius : 60 ,
                    text : function ( value ) // Function to generate text.
                    {
                        return    value    +    '%' ;
                    } ,
                    duration : null
                } ) ;

                // Expect the function's output.
                expect ( getText ( ) . innerHTML ) . toEqual ( '40%' ) ;
            } ) ;

            // Test case: Verify that text can be empty (null).
            it ( 'can be empty', function ( ) {
                // Create a circle with text set to null.
                circle    =    Circles . create ( {
                    id : element . id ,
                    value : 40 ,
                    radius : 60 ,
                    text : null , // No text.
                    duration : null
                } ) ;

                // Expect the inner HTML to be falsy (empty).
                expect ( getText ( ) . innerHTML ) . toBeFalsy ( ) ;
            } ) ;

            // Test case: Check for default styles on the text element.
            it ( 'has styles by default', function ( ) {
                // Create a circle with text.
                circle    =    Circles . create ( {
                    id : element . id ,
                    value : 40 ,
                    radius : 60 ,
                    text : '%' ,
                    duration : null
                } ) ;

                // Expect the first style property to be truthy.
                expect ( getText ( ) . style [ 0 ] ) . toBeTruthy ( ) ;
            } ) ;

            // Test case: Verify that text styles can be overridden (disabled).
            it ( 'can have its styles overridden', function ( ) {
                // Create a circle with 'styleText' set to false.
                circle    =    Circles . create ( {
                    id : element . id ,
                    value : 40 ,
                    radius : 60 ,
                    duration : null ,
                    text : '%' ,
                    styleText : false // Disable text styling.
                } ) ;

                // Expect no style properties on the text element.
                expect ( getText ( ) . style [ 0 ] ) . toBeFalsy ( ) ;
            } ) ;

        } ) ; // End of 'Text' describe block.

    } ) ; // End of 'Creation' describe block.


    // Start of the 'API' test suite.
    describe ( 'API', function ( ) {

        // Setup for API tests: create a circle instance.
        beforeEach ( function ( ) {
            circle    =    Circles . create ( {
                id : element . id ,
                value : 40 ,
                radius : 60 ,
                duration : null
            } ) ;
        } ) ;

        // Test case: Verify the ability to update the circle's radius.
        it ( 'can update radius', function ( ) {
            circle . updateRadius ( 30 ) ; // Update radius to 30.

            // The SVG width should be twice the radius (2 * 30 = 60).
            expect ( getSVG ( ) . getAttribute ( 'width' )    ==    60 ) . toBeTruthy ( ) ;
        } ) ;

        // Test case: Verify the ability to update the stroke width.
        it ( 'can update stroke width', function ( ) {
            circle . updateWidth ( 20 ) ; // Set stroke width to 20.

            // Check the 'stroke-width' attribute of the second path.
            expect ( getSVG ( ) . getElementsByTagName ( 'path' ) [ 1 ] . getAttribute ( 'stroke-width' )    ==    20 ) . toBeTruthy ( ) ;
        } ) ;

        // Test case: Verify the ability to update circle colors.
        it ( 'can update colors', function ( ) {
            circle . updateColors ( [ '#000' , '#fff' ] ) ; // Set new colors.

            var    paths    =    getSVG ( ) . getElementsByTagName ( 'path' ) ; // Get all path elements.

            // Check stroke attributes of both paths.
            expect ( paths [ 0 ] . getAttribute ( 'stroke' )    ===    '#000'    &&    paths [ 1 ] . getAttribute ( 'stroke' )    ===    '#fff' ) . toBeTruthy ( ) ;
        } ) ;

        // Test case: Check if the current percentage can be retrieved correctly.
        it ( 'can get correct percentage', function ( ) {
            // The circle was created with value 40 in beforeEach.
            expect ( circle . getPercent ( ) ) . toEqual ( 40 ) ;
        } ) ;

        // Test case: Verify the ability to update the circle's value.
        it ( 'can update value', function ( ) {
            circle . update ( 50 ) ; // Update the value to 50.
            expect ( circle . getPercent ( ) ) . toEqual ( 50 ) ; // Check the new percentage.
        } ) ;

        // Test case: Ensure correct value calculation from a given percentage.
        it ( 'can get correct value from percentage', function ( ) {

            // Create a new circle with a different maxValue.
            circle    =    Circles . create ( {
                id : element . id ,
                maxValue : 1000 , // Set max value to 1000.
                duration : null
            } ) ;

            // 25% of 1000 should be 250.
            expect ( circle . getValueFromPercent ( 25 ) ) . toEqual ( 250 ) ;
        } ) ;

        // Test case: Check the HTML representation of a number with custom class names.
        it ( 'can return HTML representation of a number', function ( ) {
            expect ( circle . htmlifyNumber ( 12.43 , 'int' , 'float' ) ) . toEqual ( '<span class="int">12</span>.<span class="float">43</span>' ) ;
        } ) ;

    } ) ; // End of 'API' describe block.

} ) ; // End of main 'Circles' describe block.