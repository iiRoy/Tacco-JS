( function ( )
{
    // Check if the current browser environment supports the Canvas rendering API
    if ( EnvCapabilities . hasCanvasSupport )
    {
        // Initialize a new test group specifically for layout verification without any animations
        TestFramework . defineGroup ( "Rendering verifications, static display" ) ;

        // Begin a test case: verifying a circular component initialized with a zero value
        TestFramework . runTest ( "Verify disk with zero value (no custom settings)" , function ( checker )
        {
            // Declare and initialize local variables required for this specific test
            var drawingSurface = constructRenderable ( { metric : 0 } ) ,
                $drawingSurface = $ ( drawingSurface ) ,
                standardDimension = 100 , // The default pixel dimension for the rendered component
                baseWidth = Math . floor ( standardDimension / 14.0 ) ; // Calculated stroke thickness, typically 7 pixels

            // Perform assertions on the component's default configuration values
            checker . isEqual ( $ . circularDisplay . options . dimension , standardDimension , "Standard disk dimension: 100 units" ) ;
            checker . isEqual ( $ . circularDisplay . options . strokeWidth , 'automatic' , "Standard disk stroke width: 'automatic' (meaning 1/14 of total size)" ) ;
            checker . isEqual ( drawingSurface . nodeName . toLocaleLowerCase ( ) , 'canvas' , "Function .circularDisplay('visualElement') yields HTMLCanvasElement" ) ;
            checker . isEqual ( $drawingSurface . currentWidth ( ) , standardDimension , "Standard horizontal span: 100 units" ) ;
            checker . isEqual ( $drawingSurface . currentHeight ( ) , standardDimension , "Standard vertical span: 100 units" ) ;

            // Execute pixel-level checks to confirm the initial, non-animated state
            checker . approxPixelRGBA ( drawingSurface , 0 , standardDimension / 2 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            checker . approxPixelRGBA ( drawingSurface , baseWidth - 1 , standardDimension / 2 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            checker . exactPixelRGBA ( drawingSurface , baseWidth + 1 , standardDimension / 2 , 'rgba(0,0,0,0)' ) ;
        } ) ;

        // Initiate another test: a circular component with a value of 0.5 using the default fill style
        TestFramework . runTest ( "Verify disk with 0.5 metric and standard fill" , function ( checker )
        {
            var drawingSurface = constructRenderable ( {
                    metric : 0.5 ,
                    animEffect : false
                } ) ,
                compDimension = $ . circularDisplay . options . dimension ; // Fetch the default size setting

            // Validate the pixel colors at various coordinates for the half-filled circle
            checker . approxPixelHex ( drawingSurface , 1 , compDimension / 2 - 1 , '#3aeabb' , 0.015 ) ;
            checker . approxPixelRGBA ( drawingSurface , 1 , compDimension / 2 + 1 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            checker . approxPixelHex ( drawingSurface , compDimension - 1 , compDimension / 2 - 1 , '#fdd250' , 0.015 ) ;
            checker . approxPixelRGBA ( drawingSurface , compDimension - 1 , compDimension / 2 + 1 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            checker . approxPixelHex ( drawingSurface , compDimension / 2 , 1 , '#9ade85' , 0.015 ) ;
            checker . exactPixelRGBA ( drawingSurface , compDimension / 2 , 8 , 'rgba(0,0,0,0)' ) ;
            checker . approxPixelRGBA ( drawingSurface , compDimension / 2 , compDimension - 1 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            checker . exactPixelRGBA ( drawingSurface , compDimension / 2 , compDimension - 9 , 'rgba(0,0,0,0)' ) ;
        } ) ;

        // Execute a test for a circular component with a 0.5 value and a singular solid color fill
        TestFramework . runTest ( "Verify disk with 0.5 metric and plain color fill" , function ( checker )
        {
            var paintHue = '#ff0000' , // Define the specific solid fill color (red)
                drawingSurface = constructRenderable ( {
                    metric : 0.5 ,
                    colorFill : { paintHue : paintHue } ,
                    animEffect : false
                } ) ,
                standardDimension = $ . circularDisplay . options . dimension ;

            // Check specific pixels to confirm the solid red fill
            checker . exactPixelHex ( drawingSurface , 1 , standardDimension / 2 - 1 , paintHue ) ;
            checker . exactPixelHex ( drawingSurface , standardDimension - 1 , standardDimension / 2 - 1 , paintHue ) ;
        } ) ;

        // Define a new test module for layout checks that involve animation
        TestFramework . defineGroup ( "Rendering verifications with motion" ) ;

        // Test case for an animated circular component with a 0.5 value and a solid fill
        TestFramework . runTest ( "Verify animated disk with 0.5 metric and plain color fill" , function ( checker )
        {
            var paintHue = '#00aa55' , // A custom green shade for the fill
                drawingSurface = constructRenderable ( {
                    metric : 0.5 ,
                    colorFill : { paintHue : paintHue }
                } ) ,
                compDimension = $ . circularDisplay . options . dimension ;

            // Indicate the expected number of assertions for this asynchronous test
            checker . expectAssertions ( 8 ) ;
            TestFramework . pause ( ) ; // Temporarily halt the test runner until explicitly resumed

            // Initial state check (before the animation fully completes)
            checker . approxPixelRGBA ( drawingSurface , 1 , compDimension / 2 - 1 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            // Check after a brief delay to observe animation progress
            setTimeout ( function ( )
            {
                checker . exactPixelHex ( drawingSurface , 1 , compDimension / 2 - 1 , paintHue ) ;
            } , 200 ) ;

            checker . approxPixelRGBA ( drawingSurface , compDimension / 2 + 1 , 1 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            setTimeout ( function ( )
            {
                checker . exactPixelHex ( drawingSurface , compDimension / 2 + 1 , 1 , paintHue ) ;
            } , 700 ) ;

            checker . approxPixelRGBA ( drawingSurface , compDimension - 2 , compDimension / 2 - 1 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            setTimeout ( function ( )
            {
                checker . exactPixelHex ( drawingSurface , compDimension - 2 , compDimension / 2 - 1 , paintHue ) ;
                TestFramework . resume ( ) ; // Resume the test runner after this segment
            } , 1300 ) ;

            // Further initial state pixel checks
            checker . approxPixelRGBA ( drawingSurface , 1 , compDimension / 2 + 1 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            checker . approxPixelRGBA ( drawingSurface , compDimension - 2 , compDimension / 2 + 1 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
        } ) ;

        // Test with custom size and a gradient fill, also animated
        TestFramework . runTest ( "Verify disk with 0.5 metric, 80px size, and specific gradient" , function ( checker )
        {
            var drawingSurface = constructRenderable ( {
                    metric : 0.5 ,
                    dimension : 80 ,
                    colorFill : {
                        colorBlend : [ '#ff327a' , '#fff430' , '#ff8989' ]
                    }
                } ) ,
                compDimension = 80 ; // The custom dimension set for this component

            checker . expectAssertions ( 8 ) ;
            TestFramework . pause ( ) ;

            checker . approxPixelRGBA ( drawingSurface , 1 , compDimension / 2 - 1 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            setTimeout ( function ( )
            {
                checker . approxPixelHex ( drawingSurface , 1 , compDimension / 2 - 1 , '#ff3777' , 0.01 ) ;
            } , 200 ) ;

            checker . approxPixelRGBA ( drawingSurface , compDimension / 2 , 1 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            setTimeout ( function ( )
            {
                checker . approxPixelHex ( drawingSurface , compDimension / 2 , 1 , '#fff330' , 0.01 ) ;
            } , 700 ) ;

            checker . approxPixelRGBA ( drawingSurface , compDimension - 2 , compDimension / 2 - 1 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            setTimeout ( function ( )
            {
                checker . approxPixelHex ( drawingSurface , compDimension - 2 , compDimension / 2 - 1 , '#ff8c86' , 0.01 ) ;
                TestFramework . resume ( ) ;
            } , 1300 ) ;

            checker . approxPixelRGBA ( drawingSurface , 1 , compDimension / 2 + 1 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            checker . approxPixelRGBA ( drawingSurface , compDimension - 2 , compDimension / 2 + 1 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
        } ) ;

        // Test with a custom starting angle and a specific animation start value
        TestFramework . runTest ( "Verify disk with 0.75 metric, custom initial angle, and animation start point" , function ( checker )
        {
            var drawingSurface = constructRenderable ( {
                metric : 0.75 ,
                initialAngle : - Math . PI / 4 ,
                animStartMetric : 0.25
            } ) ;

            checker . expectAssertions ( 8 ) ;
            TestFramework . pause ( ) ;

            checker . approxPixelRGBA ( drawingSurface , 80 , 15 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            checker . approxPixelHex ( drawingSurface , 85 , 20 , '#e0d55f' , 0.01 ) ;
            checker . approxPixelHex ( drawingSurface , 85 , 80 , '#e0d55f' , 0.01 ) ;
            checker . approxPixelRGBA ( drawingSurface , 80 , 85 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            setTimeout ( function ( )
            {
                checker . approxPixelHex ( drawingSurface , 80 , 85 , '#d6d664' , 0.01 ) ;
            } , 400 ) ;

            checker . approxPixelRGBA ( drawingSurface , 15 , 20 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
            setTimeout ( function ( )
            {
                checker . approxPixelHex ( drawingSurface , 15 , 20 , '#57e6aa' , 0.01 ) ;
                checker . approxPixelRGBA ( drawingSurface , 20 , 15 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
                TestFramework . resume ( ) ;
            } , 1300 ) ;
        } ) ;

        // Asynchronous test involving an image background and reversed animation
        TestFramework . asyncTest ( "Verify disk with 0.5 metric, background image, and reversed animation" , function ( checker )
        {
            var pathBase = $ ( 'script[src*="testing_scripts.js"]' ) . attr ( 'src' ) . replace ( /testing_scripts\.js.*$/ , '' ) , // Determine the base path for assets
                imageSource = pathBase + 'assets/circular_graphic.png' , // Construct the full image path
                graphicObj = new Image ( ) ; // Create a new image object instance

            checker . expectAssertions ( 9 ) ;
            graphicObj . src = imageSource ; // Set the source to load the image

            $ ( graphicObj ) . on ( 'load' , function ( )
            {
                var drawingSurface = constructRenderable ( {
                    metric : 0.5 ,
                    strokeWidth : 20 ,
                    colorFill : { image : graphicObj } ,
                    invertDirection : true
                } ) ;

                // Initial pixel checks for regions that should be empty
                checker . exactPixelRGBA ( drawingSurface , 21 , 49 , 'rgba(0,0,0,0)' ) ;
                checker . exactPixelRGBA ( drawingSurface , 78 , 49 , 'rgba(0,0,0,0)' ) ;
                checker . exactPixelRGBA ( drawingSurface , 49 , 77 , 'rgba(0,0,0,0)' ) ;

                // Animated pixel checks with timed delays
                checker . approxPixelRGBA ( drawingSurface , 17 , 51 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
                setTimeout ( function ( )
                {
                    checker . approxPixelHex ( drawingSurface , 17 , 51 , '#00f7ff' , 0.01 ) ;
                } , 400 ) ;

                checker . approxPixelRGBA ( drawingSurface , 49 , 81 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
                setTimeout ( function ( )
                {
                    checker . approxPixelHex ( drawingSurface , 49 , 81 , '#7700ff' , 0.01 ) ;
                } , 700 ) ;

                checker . approxPixelRGBA ( drawingSurface , 81 , 51 , 'rgba(0,0,0,0.1)' , 0.01 ) ;
                setTimeout ( function ( )
                {
                    checker . approxPixelHex ( drawingSurface , 81 , 51 , '#ff0008' , 0.01 ) ;
                    TestFramework . resume ( ) ; // Resume the test execution
                } , 1400 ) ;
            } ) ;
        } ) ;
    }
    else
    {
        // Define a fallback test for environments that do not support Canvas
        TestFramework . runTest ( "Your browser lacks Canvas capabilities" , function ( checker )
        {
            checker . isTrue ( true , "That's acceptable" ) ; // Affirmative, it's okay if Canvas isn't supported.
        } ) ;
    }

    // Utility function to create and initialize a circular display component for testing
    function constructRenderable ( configuration )
    {
        var outputContainer = $ ( '#test-output-area' ) ; // Attempt to locate the designated test output area
        if ( ! outputContainer [ 0 ] )
            outputContainer = $ ( 'body' ) ; // If not found, default to appending to the document body

        // Create a new span element, append it to the container, and initialize the circular display
        var elementRef = $ ( '<span>' ) . appendTo ( outputContainer ) . circularDisplay ( configuration ) ;
        return elementRef . circularDisplay ( 'visualElement' ) ; // Return the underlying HTMLCanvasElement
    }
} ) ( ) ;