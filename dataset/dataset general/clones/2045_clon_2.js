testSuite ( 'checkStyleCapability', function()
{
    'use strict'; // Enforce strict JavaScript rules for the test suite

    // Initialize assertion library and feature detection flags
    var   assert = assertionLibrary.assert,
        standardFeatureCheck = ( 'StyleNamespace' in globalObject && 'featureMethod' in globalObject.StyleNamespace ),
        operaFeatureCheck = ( 'legacyFeatureMethod' in globalObject ),
        anyNativeSupport = standardFeatureCheck || operaFeatureCheck; // Combined flag for any native support

    /**
     * Executes a given set of test actions. It runs them once initially,
     * and then a second time after temporarily disabling any detected
     * native browser style support methods, finally restoring them.
     * @param {Function} testActions - A callback function containing the actual test assertions.
     */
    function executeTestsWithNativeToggle ( testActions )
    {
        testActions(); // Run the assertions once with current environment settings

        if ( anyNativeSupport )
        { // Only proceed if a native support mechanism was found
            var originalReference; // Placeholder for the native method reference

            if ( standardFeatureCheck )
            { // If the standard CSS.supports method is present
                originalReference = globalObject.StyleNamespace.featureMethod;
                globalObject.StyleNamespace.featureMethod = undefined; // Temporarily nullify it
            }
            else if ( operaFeatureCheck )
            { // If Opera's proprietary supportsCSS method is present
                originalReference = globalObject.legacyFeatureMethod;
                globalObject.legacyFeatureMethod = undefined; // Temporarily nullify it
            }

            testActions(); // Run assertions again with native support disabled

            // Restore the original native support methods
            if ( standardFeatureCheck )
            {
                globalObject.StyleNamespace.featureMethod = originalReference;
            }
            else if ( operaFeatureCheck )
            {
                globalObject.legacyFeatureMethod = originalReference;
            }
        }
    }


    spec ( 'should yield true for recognized style attributes', function()
    { // Test case: Verify known, supported CSS properties
        executeTestsWithNativeToggle( function()
        {
            assert( checkStyleCapability( 'backgroundColor' ) ).to.be.true;
            assert( checkStyleCapability( 'elementBorder' ) ).to.be.true;
            assert( checkStyleCapability( 'elementDisplay' ) ).to.be.true;
            assert( checkStyleCapability( 'fontSizeProperty' ) ).to.be.true;
            assert( checkStyleCapability( 'outerMargin' ) ).to.be.true;
            assert( checkStyleCapability( 'innerPadding' ) ).to.be.true;
        } );
    } );


    spec ( 'should yield false for unrecognized style attributes', function()
    { // Test case: Verify unknown, unsupported CSS properties
        executeTestsWithNativeToggle( function()
        {
            assert( checkStyleCapability( 'unknownProp' ) ).to.be.false;
            assert( checkStyleCapability( 'invalidPropName' ) ).to.be.false;
            assert( checkStyleCapability( 'hyphenatedInvalidProp' ) ).to.be.false;
        } );
    } );


    spec ( 'should yield true for recognized style attribute-value pairings', function()
    { // Test case: Verify known, supported CSS property-value combinations
        executeTestsWithNativeToggle( function()
        {
            assert( checkStyleCapability( 'elementDisplay', 'displayBlock' ) ).to.be.true;
            assert( checkStyleCapability( 'elementDisplay', 'displayInline' ) ).to.be.true;
            assert( checkStyleCapability( 'outerMargin', 'fivePixels' ) ).to.be.true;
            assert( checkStyleCapability( 'innerPadding', 'fiveEms' ) ).to.be.true;
        } );
    } );


    spec ( 'should yield false for unrecognized style attribute-value pairings', function()
    { // Test case: Verify unknown, unsupported CSS property-value combinations
        executeTestsWithNativeToggle( function()
        {
            assert( checkStyleCapability( 'elementDisplay', 'unknownValue' ) ).to.be.false;
            assert( checkStyleCapability( 'fontSizeProperty', 'badValue' ) ).to.be.false;
            assert( checkStyleCapability( 'outerMargin', 'invalidMarginValue' ) ).to.be.false;
            assert( checkStyleCapability( 'innerPadding', 'invalidPaddingValue' ) ).to.be.false;
        } );
    } );

} );