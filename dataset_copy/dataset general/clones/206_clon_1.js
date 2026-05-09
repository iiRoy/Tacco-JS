/*
 * This file defines the TestSetup module,
 * responsible for initializing and managing UI parameters
 * for various plotting and data visualization functionalities.
 *
 * It generates several input elements (checkboxes, text fields, range sliders)
 * and attaches event handlers to them.
 *
 * The module also includes logic for combining default parameters with
 * user-provided parameters, and for triggering replotting functions
 * based on UI changes.
 *
 * Author: [Cloned by AI]
 * Date: [Current Date]
 */

// Immediately Invoked Function Expression (IIFE) to encapsulate the module
! function () {


    // Define the main TestSetup constructor/function.
    // It takes a div element, initial line parameters, and an array of replotting functions.
    var TestSetup = function ( div, lineParameter, replotFunctions ) {

        // --- SECTION: Normal Parameters UI Generation ---
        // Append a container div for normal parameters.
        div.append( "<div id='normalParameters' class='parameterBox'></div>" );

        // Add 'apply' checkbox input.
        $( "#normalParameters" ).append( "<input class='parameterInput' id='apply' type='checkbox' onchange='TestSetup.applyChanged()'>apply</input>" );

        // Add 'monotonicFit' checkbox input.
        $( "#normalParameters" ).append( "<input class='parameterInput' id='monotonicFit' type='checkbox' onchange='TestSetup.monotonicFitChanged()'>monotonicFit</input>" );

        // Add 'tension' range slider input.
        $( "#normalParameters" ).append( "<input class='parameterInput' id='tension' type='range' min='0' max='1' step='0.1' onchange='TestSetup.tensionChanged()'>tension /in [0,1]</input>" );

        // Add 'nrSplinePoints' text input.
        $( "#normalParameters" ).append( "<input class='parameterInput' id='nrSplinePoints' type='text' onchange='TestSetup.nrSplinePointsChanged()'># spline points</input>" );


        // --- SECTION: Legacy Parameters UI Generation ---
        // Append a container div for legacy parameters.
        div.append( "<div id='legacyParameters' class='parameterBox'></div>" );

        // Add 'useLegacy' checkbox input.
        $( "#legacyParameters" ).append( "<input class='parameterInput' id='useLegacy' type='checkbox' onchange='TestSetup.useLegacyChanged()'>use legacy options</input>" );

        // Add 'legacyFit' checkbox input.
        $( "#legacyParameters" ).append( "<input class='parameterInput' id='legacyFit' type='checkbox' onchange='TestSetup.legacyFitChanged()'>fit</input>" );

        // Add 'legacyPointFactor' text input.
        $( "#legacyParameters" ).append( "<input class='parameterInput' id='legacyPointFactor' type='text' onchange='TestSetup.legacyPointFactorChanged()'>point factor</input>" );

        // Add 'legacyFitPointDist' text input.
        $( "#legacyParameters" ).append( "<input class='parameterInput' id='legacyFitPointDist' type='text' onchange='TestSetup.legacyFitPointDistChanged()'>fit point dist</input>" );


        /**
         * @function replotAll
         * @description Gathers current UI parameter values and triggers all registered replotting functions.
         */
        function replotAll ( ) {

            // Create a parameter object from current UI states.
            var parameter = {
                apply:            $( "#apply" ).prop( "checked" ),
                monotonicFit:     $( "#monotonicFit" ).prop( "checked" ),
                tension:          $( "#tension" ).val( ),
                nrSplinePoints:   $( "#nrSplinePoints" ).val( ),
                legacyOverride:   undefined /* Initially undefined, may be set below */
            };

            // Check if legacy options are enabled.
            if ( $( "#useLegacy" ).prop( "checked" ) ) {

                // Get legacy fit point distance value.
                var fDist = $( "#legacyFitPointDist" ).val( );

                // Populate legacy override properties.
                parameter.legacyOverride = {
                    fit:              $( "#legacyFit" ).prop( "checked" ),
                    curvePointFactor: $( "#legacyPointFactor" ).val( ),
                    fitPointDist:     ( fDist == '' ) ? undefined : fDist /* Convert empty string to undefined */
                };
            }

            // Iterate through the array of replot functions and call each with the current parameters.
            for ( var i = 0; i < replotFunctions.length; i ++ ) {
                replotFunctions[ i ]( parameter );
            }
        }


        /**
         * @function init
         * @description Initializes the UI elements with provided or default parameter values.
         * @param {object} parameter - An object containing initial parameter values.
         */
        function init ( parameter ) {

            // Define default parameters for the main configuration.
            var defaultParam = {
                active:           false,
                apply:            false,
                monotonicFit:     false,
                tension:          0.0,
                nrSplinePoints:   20,
                legacyOverride:   undefined
            };

            // Define default parameters for the legacy configuration.
            var defaultLegacy = {
                fit:              false,
                curvePointFactor: 20,
                fitPointDist:     undefined
            };

            // If legacyOverride is present in the initial parameters,
            // ensure it's properly initialized with default legacy values if it's 'true'.
            if ( typeof parameter.legacyOverride != 'undefined' ) {
                defaultParam.legacyOverride = defaultLegacy; // Assign default legacy structure
                if ( parameter.legacyOverride == true ) {
                    parameter.legacyOverride = defaultLegacy; // If simply true, use full default legacy object
                }
            }

            // Combine default parameters with the provided ones,
            // using deep merge to handle nested objects like legacyOverride.
            var combinedParam = jQuery.extend( true, defaultParam, parameter );

            // --- SECTION: Apply combined parameters to UI elements ---
            $( "#apply" ).prop( "checked", combinedParam.apply );

            // Extract relevant flags and values for easier access and clarity.
            var withLegacy  = ( typeof combinedParam.legacyOverride != 'undefined' );
            var fit         = combinedParam.legacyOverride ? combinedParam.legacyOverride.fit : defaultLegacy.fit; // Safely access if legacyOverride exists
            var pointFactor = combinedParam.legacyOverride ? combinedParam.legacyOverride.curvePointFactor : defaultLegacy.curvePointFactor;
            var fitDist     = combinedParam.legacyOverride ? combinedParam.legacyOverride.fitPointDist : defaultLegacy.fitPointDist;
            var monotone    = combinedParam.monotonicFit;
            var tension     = combinedParam.tension;
            var nrPoints    = combinedParam.nrSplinePoints;

            // Set UI element states based on the combined parameters.
            $( "#useLegacy" ).prop( "checked", withLegacy );
            $( "#legacyFit" ).prop( "checked", fit );
            $( "#legacyPointFactor" ).val( pointFactor );
            $( "#legacyFitPointDist" ).val( fitDist );
            $( "#monotonicFit" ).prop( "checked", monotone );
            $( "#tension" ).val( tension );
            $( "#nrSplinePoints" ).val( nrPoints );

            // After initializing UI, trigger an initial replot.
            replotAll( parameter, replotFunctions );
        }


        // --- SECTION: Event Handlers for TestSetup UI Elements ---

        // Handler for 'apply' checkbox change.
        TestSetup.applyChanged = function ( ) {
            replotAll( );
        };

        // Handler for 'useLegacy' checkbox change.
        TestSetup.useLegacyChanged = function ( ) {
            replotAll( );
        };

        // Handler for 'legacyFit' checkbox change. Only replots if legacy is active.
        TestSetup.legacyFitChanged = function ( ) {
            if ( $( "#useLegacy" ).prop( "checked" ) ) {
                replotAll( );
            }
        };

        // Handler for 'legacyPointFactor' text input change. Only replots if legacy is active.
        TestSetup.legacyPointFactorChanged = function ( ) {
            if ( $( "#useLegacy" ).prop( "checked" ) ) {
                replotAll( );
            }
        };

        // Handler for 'legacyFitPointDist' text input change. Only replots if legacy is active.
        TestSetup.legacyFitPointDistChanged = function ( ) {
            if ( $( "#useLegacy" ).prop( "checked" ) ) {
                replotAll( );
            }
        };

        // Handler for 'monotonicFit' checkbox change. Disables legacy and replots.
        TestSetup.monotonicFitChanged = function ( ) {
            $( "#useLegacy" ).prop( "checked", false ); // Automatically uncheck legacy when monotonic is changed
            replotAll( );
        };

        // Handler for 'tension' slider change. Disables legacy and replots.
        TestSetup.tensionChanged = function ( ) {
            $( "#useLegacy" ).prop( "checked", false ); // Automatically uncheck legacy when tension is changed
            replotAll( );
        };

        // Handler for 'nrSplinePoints' text input change. Disables legacy and replots.
        TestSetup.nrSplinePointsChanged = function ( ) {
            $( "#useLegacy" ).prop( "checked", false ); // Automatically uncheck legacy when spline points are changed
            replotAll( );
        };

        // Perform initial setup of the UI using the provided line parameters.
        init( lineParameter );

    }; // End of TestSetup function definition.

    // Expose the TestSetup function to the global scope (or 'this' context, typically window).
    this.TestSetup = TestSetup;

} ( ); // End of IIFE.