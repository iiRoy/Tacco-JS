( function ( exports ) {
    /*
     *  Initialize the catcorr library version.
     *  This constant defines the current release version of the module.
     */
    catcorr . version = "0.2.0" ;



    /*
     *  Export the main catcorr function for external use.
     *  This makes the catcorr function accessible from the global scope
     *  or as a module export.
     */
    exports . catcorr = catcorr ;


    /**
     *  Main function to generate a categorical correlation visualization.
     *
     *  @param {string} div_id - The ID of the HTML div element where the visualization will be rendered.
     *  @param {Object} data   - The input data object containing questions and responses.
     */
    function catcorr( div_id , data )
    {

        // Extract questions and responses from the provided data object.
        var questions = data . questions ;
        var responses = data . responses ;



        /*
         *  Create a lookup table (label2index) for efficient mapping
         *  of survey answer labels to their corresponding numerical indices.
         *  This is crucial for setting up the x-coordinates correctly.
         */
        var label2index = {} ;
        questions . forEach ( function ( q ) {
            label2index [ q . number ] = {} ; // Initialize an object for each question number.
            q . choices . forEach ( function ( choice , j ) {
                label2index [ q . number ] [ choice ] = j ; // Map choice label to its index 'j'.
            } ) ;
        } ) ;



        /*
         *  Re-cast non-numeric answers in the responses data
         *  into their corresponding numerical index using the label2index map.
         *  This step is essential for crossfilter.js to correctly process
         *  and filter the categorical data, as it typically operates on numeric values.
         */
        responses . forEach ( function ( r ) {
            questions . forEach ( function ( q ) {
                r [ q . number ] = label2index [ q . number ] [ r [ q . number ] ] ;
            } ) ;
        } ) ;



        // Dynamically add the question text to the DOM.
        // Each question gets its own div container for the chart.
        questions . forEach ( function ( q ) {
            d3 . select ( div_id )
                . append ( "div" )
                . attr ( "id" , q . number + "-chart" )
                . attr ( "class" , "catcorr chart" )
                . append ( "div" )
                . attr ( "class" , "title" )
                . text ( q . number + '. ' + q . text ) ;
        } ) ;



        /*
         *  Define various D3 formatters for numerical display.
         *  This one formats numbers with comma separators.
         */
        var formatNumber = d3 . format ( ",d" ) ;



        /*
         *  Initialize crossfilter for the responses data.
         *  This enables efficient multi-dimensional filtering and aggregation.
         */
        var respondents = crossfilter ( responses ) ,
            all         = respondents . groupAll ( ) ; // A special group representing all records.


        var dimensions = [] ; // Array to hold crossfilter dimensions.
        var groups     = [] ; // Array to hold crossfilter groups.

        // Create a dimension and a group for each question.
        questions . forEach ( function ( q , i ) {
            dimensions . push ( respondents . dimension ( function ( d ) { return d [ q . number ] } ) ) ;
            groups     . push ( dimensions [ i ] . group ( ) ) ;
        } ) ;



        /*
         *  Record the total number of respondents within each group.
         *  This information will be utilized later to accurately calculate
         *  the proportionPath lines, which represent expected proportions.
         */
        groups . forEach ( function ( g ) {
            g . __all__ = g . all ( ) . map ( function ( o ) { return o . value } ) ;
        } ) ;



        // Declare variables for scales and charts.
        var xscales = [] ,
            xscale  ;

        // Initialize the linear y-scale, mapping data values to pixel heights.
        var yscale = d3 . scale . linear ( ) . range ( [ 100 , 0 ] ) ;

        var tooltips = [] ,
            tooltip  ;

        var charts = [] ,
            chart  ;

        // Define bar width and gap for visualization.
        var bar_width = 80 ;
        var bar_gap   = 3  ;


        // Iterate through each question to create individual charts.
        questions . forEach ( function ( q , i ) {

            // Retrieve labels for the current question's axis.
            var labels = {} ;
            q . choices . forEach ( function ( choice , c ) {
                labels [ c ] = choice ;
            } ) ;



            // Initialize tooltips using d3.tip if the library is available.
            if ( d3 . tip ) {
                tooltip = d3 . tip ( )
                    . attr ( 'class' , 'd3-tip' )
                    . direction ( 's' )
                    . html ( function ( d ) { return "awesome " + d } ) ;
                tooltips . push ( tooltip ) ;
            }



            // Create the x-scale for the current chart.
            var a = 0 ,
                b = q . choices . length - 1 ; // 'b' represents the maximum index of choices.

            xscale = d3 . scale . linear ( )
                . domain ( [ -0.5 , b + 0.5 ] ) // Domain adjusted for bar positioning.
                . rangeRound ( [ 0 , bar_width * ( ( b - a ) + 1 ) ] ) ; // Range based on bar width.

            xscale . labels = labels ; // Attach labels to the scale for easy access.
            xscales . push ( xscale ) ;



            // Update the yscale's domain to encompass the maximum possible value
            // across all groups, ensuring consistent height interpretation.
            yscale . domain ( [ 0 , d3 . max ( [
                yscale . domain ( ) [ 1 ] , // Current max domain value.
                groups [ i ] . top ( 1 ) [ 0 ] . value // Max value from the current group.
            ] ) ] ) ;



            // Create an instance of the barChart for the current question.
            chart = barChart ( q ) . dimension ( dimensions [ i ] )
                . group ( groups [ i ] )
                . x ( xscale ) ;
            charts . push ( chart ) ;

        } ) ;



        /*
         *  Bind the generated charts to the corresponding DOM elements.
         *  Each chart listens for brush events to trigger re-rendering.
         */
        var chart = d3 . selectAll ( ".catcorr.chart" )
            . data ( charts )
            . each ( function ( chart ) {
                chart . on ( "brush" , renderAll )
                    . on ( "brushend" , renderAll ) ;
            } ) ;



        /*
         *  Append an <aside> element to display the fraction of currently selected respondents.
         *  This serves as a legend for the overall selection state.
         */
        var legend = d3 . select ( div_id )
            . append ( "aside" )
            . attr ( "id" , "legend" )
            . attr ( "class" , "catcorr" )
            . html ( "<div style='clear:both;margin-top:20px'></div>" +
                "<span id='active'>-</span> " +
                "<span>/</span> <span id='total'>-</span> <br/> selected respondents" ) ;


        var legend_width  = 300 ,
            legend_height = 120 ;

        var legend_svg = legend . insert ( "svg" , "div" )
            . attr ( "width" , legend_width )
            . attr ( "height" , legend_height )
            . append ( "g" )
            . attr ( "transform" , "translate(0,0)" ) ;



        // Add a clear div at the bottom as a temporary fix for issue #18,
        // ensuring proper layout clearing.
        d3 . select ( div_id )
            . append ( "div" )
            . style ( "clear" , "both" ) ;



        // Draw the explanatory bars within the legend SVG.
        legend_svg . selectAll ( ".bar" )
            . data ( [ "all_background" , "background" , "foreground" ,
                "all_proportion"
            ] )
            . enter ( ) . append ( "path" )
            . attr ( "class" , function ( d , i ) {
                if ( i === 0 ) {
                    return "catcorr " + d + " all_bar outcome" ;
                }
                else if ( i === 3 ) {
                    return "catcorr " + d + " all_bar outcome" ;
                }
                return "catcorr " + d + " bar outcome" ;
            } ) ;

        // Define the 'd' attribute for the "all_background" bar.
        legend_svg . select ( ".all_background.all_bar" )
            . attr ( "d" , [ "M" , ( legend_width - ( bar_width - 2 * bar_gap ) ) / 2 , "," , 10 , "v" , 100 , "h" , bar_width - 2 * bar_gap , "v" , -100 ] . join ( "" ) ) ;

        // Define the 'd' attribute for the "foreground" bar.
        legend_svg . select ( ".foreground.bar" )
            . attr ( "d" , [ "M" , ( legend_width - ( bar_width - 2 * bar_gap ) ) / 2 , "," , 80 , "v" , 30 , "h" , bar_width - 2 * bar_gap , "v" , -30 ] . join ( "" ) ) ;

        // Define the 'd' attribute for the "all_proportion" bar.
        legend_svg . select ( ".all_proportion.all_bar" )
            . attr ( "d" , [ "M" , ( legend_width - ( bar_width - 2 * bar_gap ) ) / 2 , "," , 40 , "h" , bar_width - 2 * bar_gap , "M" , legend_width / 2 , "," , 15 , "v" , 44 ] . join ( "" ) ) ;



        // Display label for "all respondents".
        legend_svg . append ( "foreignObject" )
            . attr ( "class" , "catcorr legend" )
            . attr ( "width" , ( legend_width - bar_width ) / 2 )
            . attr ( "height" , "3em" )
            . attr ( "x" , legend_width / 2 + bar_width / 2 + bar_gap )
            . attr ( "y" , 0 )
            . text ( "all respondents" ) ;

        legend_svg . append ( "path" )
            . attr ( "class" , "catcorr legend" )
            . attr ( "d" , [ "M" , legend_width / 2 + bar_width / 2 , "," , 7 ,
                "h" , -15 , "l" , -7 , "," , 7
            ] . join ( "" ) ) ;



        // Display label for "selected respondents".
        legend_svg . append ( "foreignObject" )
            . attr ( "class" , "catcorr legend" )
            . attr ( "width" , ( legend_width - bar_width ) / 2 )
            . attr ( "height" , "3em" )
            . attr ( "x" , legend_width / 2 + bar_width / 2 + bar_gap )
            . attr ( "y" , 106 )
            . text ( "selected respondents" ) ;

        legend_svg . append ( "path" )
            . attr ( "class" , "catcorr legend" )
            . attr ( "d" , [ "M" , legend_width / 2 + bar_width / 2 , "," , 113 ,
                "h" , -15 , "l" , -7 , "," , -7
            ] . join ( "" ) ) ;



        // Display label for "expected number of selected respondents".
        legend_svg . append ( "foreignObject" )
            . attr ( "class" , "catcorr legend" )
            . attr ( "width" , ( legend_width - bar_width ) / 2 )
            . attr ( "height" , "3em" )
            . attr ( "x" , legend_width / 2 + bar_width / 2 + bar_gap )
            . attr ( "y" , 35 )
            . text ( "expected number of selected respondents" ) ;

        legend_svg . append ( "path" )
            . attr ( "class" , "catcorr legend" )
            . attr ( "d" , [ "M" , legend_width / 2 + bar_width / 2 , "," , 47 ,
                "h" , -15 , "l" , -7 , "," , -7
            ] . join ( "" ) ) ;



        // Display label for "variation in expected selected respondents".
        legend_svg . append ( "foreignObject" )
            . attr ( "class" , "catcorr legend right" )
            . attr ( "width" , ( legend_width - bar_width ) / 2 - 20 )
            . attr ( "height" , "5em" )
            . attr ( "x" , 0 )
            . attr ( "y" , 12 )
            . attr ( "text-align" , "right" )
            . text ( "variation in expected number of selected respondents" ) ;

        legend_svg . append ( "path" )
            . attr ( "class" , "catcorr legend" )
            . attr ( "d" , [ "M" , legend_width / 2 - bar_width / 2 - 18 , "," , 36 ,
                "h" , 15 , "v" , 22 , "h" , 42 ,
                "M" , legend_width / 2 - bar_width / 2 - 3 , "," , 36 ,
                "v" , -22 , "h" , 42
            ] . join ( "" ) ) ;



        /*
         *  If there are multiple types of questions, render a color legend.
         *  This helps distinguish different question categories visually.
         */
        var question_types = d3 . set ( ) ;
        questions . forEach ( function ( q ) {
            question_types . add ( q . type ) ;
        } ) ;

        question_types = question_types . values ( ) ; // Get unique question types.

        if ( question_types . length > 1 )
        {
            var swatch_w    = 20 ,
                swatch_gap  = 5  ;

            legend . insert ( "div" , "svg" )
                . style ( "clear" , "both" ) ;

            var color_legend_svg = legend . insert ( "svg" , "div" )
                . attr ( "width" , legend_width )
                . attr ( "height" , question_types . length * ( swatch_w + swatch_gap ) + swatch_gap )
                . style ( "margin-bottom" , 20 )
                . append ( "g" )
                . attr ( "transform" , "translate(0,0)" ) ;

            color_legend_svg . selectAll ( )
                . data ( question_types ) . enter ( )
                . append ( "path" )
                . attr ( "class" , function ( d ) {
                    return "catcorr foreground bar " + d
                } )
                . attr ( "d" , function ( d , i ) {
                    return [ "M" , legend_width / 2 - swatch_w / 2 , "," ,
                        swatch_gap + i * ( swatch_w + swatch_gap ) ,
                        "h" , swatch_w , "v" , swatch_w , "h" , -swatch_w
                    ]
                        . join ( "" )
                } ) ;

            color_legend_svg . selectAll ( )
                . data ( question_types ) . enter ( )
                . append ( "text" )
                . attr ( "class" , "catcorr legend" )
                . attr ( "x" , legend_width / 2 + swatch_w / 2 + bar_gap )
                . attr ( "y" , function ( d , i ) {
                    return swatch_gap + i * ( swatch_w + swatch_gap ) + swatch_w / 2
                } )
                . attr ( "dy" , "0.35em" )
                . text ( function ( d ) { return d } ) ;
        }



        // Update the total number of respondents displayed in the aside element.
        d3 . selectAll ( "aside.catcorr #total" )
            . text ( formatNumber ( respondents . size ( ) ) ) ;



        // Initial rendering of all charts.
        renderAll ( ) ;



        /*
         *  Helper function to render a single chart using its specified method.
         *  @param {Function} method - The rendering method for the chart.
         */
        function render ( method )
        {
            d3 . select ( this ) . call ( method ) ;
        }



        /*
         *  Function called whenever the brush moves or ends.
         *  It re-renders all charts and updates the active respondents count.
         */
        function renderAll ( )
        {
            chart . each ( render ) ; // Render each individual chart.
            d3 . select ( "aside.catcorr #active" ) . text ( formatNumber ( all . value ( ) ) ) ; // Update active count.
        }



        /*
         *  Global function to apply filters to charts.
         *  @param {Array} filters - An array of filter values to apply to each chart.
         */
        window . filter = function ( filters )
        {
            filters . forEach ( function ( d , i ) { charts [ i ] . filter ( d ) ; } ) ;
            renderAll ( ) ;
        } ;



        /*
         *  Global function to reset a specific chart's filter.
         *  @param {number} i - The index of the chart to reset.
         */
        window . reset = function ( i )
        {
            charts [ i ] . filter ( null ) ; // Clear the filter for the specified chart.
            renderAll ( ) ;
        } ;



        /**
         *  Factory function to create a bar chart component.
         *  This function returns a reusable chart object with methods
         *  for configuration and rendering.
         *
         *  @param {Object} question - The question object associated with this chart.
         *  @returns {Function} A configurable chart function.
         */
        function barChart ( question )
        {
            // Initialize a static ID for each bar chart instance.
            if ( ! barChart . id ) barChart . id = 0 ;

            var margin = { top : 10 , right : 10 , bottom : 20 , left : 10 } ,
                x , // X-scale for the chart.
                y        = yscale , // Y-scale, shared across all charts.
                tooltip  = tooltips [ barChart . id ] , // Tooltip specific to this chart.
                id       = barChart . id ++ , // Unique ID for this chart instance.
                axis     = d3 . svg . axis ( ) . orient ( "bottom" ) . tickSize ( 6 , 0 , 0 ) , // X-axis configuration.
                brush    = d3 . svg . brush ( ) , // D3 brush component for interaction.
                dimension , // Crossfilter dimension for this chart.
                group , // Crossfilter group for this chart.
                round     ; // Rounding function (not used in this snippet but declared).


            /**
             *  The main chart rendering function.
             *  @param {D3.selection} div - The D3 selection of the div element to render into.
             */
            function chart ( div )
            {
                var width  = d3 . max ( x . range ( ) ) , // Calculate chart width from x-scale.
                    height = d3 . max ( y . range ( ) ) ; // Calculate chart height from y-scale.

                // Set the tick values for the x-axis to correspond to each choice.
                axis . tickValues ( d3 . range ( 0 , d3 . keys ( x . labels ) . length ) ) ;

                div . each ( function ( ) {
                    var div_element = d3 . select ( this ) , // Current div element.
                        g           = div_element . select ( "g" ) ; // SVG group element.

                    // Create the skeletal chart structure if it doesn't exist.
                    if ( g . empty ( ) )
                    {
                        div_element . select ( ".title" ) . append ( "a" )
                            . attr ( "href" , "javascript:reset(" + id + ")" )
                            . attr ( "class" , "catcorr reset" )
                            . text ( "reset" )
                            . style ( "display" , "none" ) ; // Initially hide the reset button.

                        g = div_element . append ( "svg" )
                            . attr ( "width" , width + margin . left + margin . right )
                            . attr ( "height" , height + margin . top + margin . bottom )
                            . append ( "g" )
                            . attr ( "transform" , "translate(" + margin . left + "," + margin . top + ")" ) ;

                        // Create a hatching pattern for displaying the brush.
                        // Reference: http://stackoverflow.com/a/14500054/564709
                        var pattern = div_element . select ( "svg" )
                            . insert ( "pattern" , "g" )
                            . attr ( "id" , "diagonalHatch" )
                            . attr ( "patternUnits" , "userSpaceOnUse" )
                            . attr ( "width" , 10 )
                            . attr ( "height" , 10 ) ;

                        pattern . append ( "path" )
                            . attr ( "class" , "catcorr hatching" )
                            . attr ( "d" , "M-1,1l2,-2M0,10l10,-10M9,11l2,-2" ) ;

                        // Invoke tooltip for this visualization if available.
                        if ( tooltip )
                        {
                            g . call ( tooltip ) ;
                        }

                        g . append ( "clipPath" )
                            . attr ( "id" , "clip-" + id )
                            . append ( "rect" )
                            . attr ( "width" , width )
                            . attr ( "height" , height ) ;

                        // Append paths for different bar types (background, foreground, proportion).
                        g . selectAll ( ".bar" )
                            . data ( [ "all_background" , "background" , "foreground" ,
                                "all_proportion"
                            ] )
                            . enter ( ) . append ( "path" )
                            . attr ( "class" , function ( d , i ) {
                                if ( i === 0 ) {
                                    return "catcorr " + d + " all_bar " + question . type ;
                                }
                                else if ( i === 3 ) {
                                    return "catcorr " + d + " all_bar " + question . type ;
                                }
                                return "catcorr " + d + " bar " + question . type ;
                            } )
                            . datum ( group . all ( ) ) ; // Bind the full group data as datum.

                        // Apply clip-path to the foreground bars.
                        g . selectAll ( ".foreground.bar" )
                            . attr ( "clip-path" , "url(#clip-" + id + ")" ) ;

                        // Append the x-axis.
                        g . append ( "g" )
                            . attr ( "class" , "catcorr axis" )
                            . attr ( "transform" , "translate(0," + height + ")" )
                            . call ( axis ) ;

                        // Manipulate the axis label text for brevity.
                        var labels = g . selectAll ( "g.axis text" )
                            . text ( function ( d ) {
                                var n = 20 ; // Maximum label length.
                                var s = x . labels [ d ] ; // Original label string.
                                if ( s === undefined ) {
                                    return '' ; // Return empty if label is undefined.
                                }
                                else if ( s . length > n ) {
                                    var parts = s . substring ( 0 , n - 3 ) . split ( " " ) ;
                                    s = parts . slice ( 0 , parts . length - 1 ) . join ( " " ) ;
                                    s += "..." ; // Truncate and add ellipsis.
                                }
                                return s ;
                            } ) ;

                        // Attach tooltip events to labels if tooltip is present.
                        if ( tooltip ) {
                            tooltip . html ( function ( d ) {
                                return x . labels [ d ] ; // Full label for tooltip.
                            } ) ;
                            labels . on ( "mouseover" , tooltip . show )
                                . on ( "mouseout" , tooltip . hide ) ;
                        }

                        // Initialize the brush component with custom resize handles.
                        var gBrush = g . append ( "g" )
                            . attr ( "class" , "catcorr brush" )
                            . call ( brush ) ;

                        gBrush . selectAll ( "rect" )
                            . attr ( "fill" , "url(#diagonalHatch)" ) // Apply hatching pattern to brush.
                            . attr ( "height" , height ) ;

                        gBrush . selectAll ( ".resize" )
                            . append ( "path" )
                            . attr ( "d" , resizePath ) ; // Custom resize handle path.
                    }

                    // This section uses the group data to set the path for the bars.
                    g . selectAll ( ".bar" ) . attr ( "d" , barPath ) ;

                    // Render the ".all_background.all_bar" data only once at the beginning.
                    g . selectAll ( ".all_background.all_bar" )
                        . attr ( "d" , function ( groups_data , index ) {
                            var v = d3 . select ( this ) . attr ( "d" ) ;
                            if ( v === null ) {
                                return barPath ( groups_data , index ) ;
                            }
                            return v ;
                        } ) ;

                    // Render the ".all_proportion.all_bar" to show the proportion
                    // of selected responses that fall into each group.
                    if ( brush . empty ( ) ) {
                        g . selectAll ( ".all_proportion.all_bar" )
                            . attr ( "d" , proportionPath ) ;
                    }

                    // Ensure asterisks (significance indicators) are removed
                    // on dimensions that are currently selected (brushed).
                    else {
                        g . selectAll ( ".asterisk" ) . remove ( ) ;
                    }
                } ) ;


                /**
                 *  Generates the SVG path string for the bars.
                 *  @param {Array} groups_data - The data array for the group.
                 *  @returns {string} The SVG path string.
                 */
                function barPath ( groups_data )
                {
                    var path = [] ,
                        i    = -1 ,
                        n    = groups_data . length ,
                        d    ;

                    while ( ++i < n ) {
                        d = groups_data [ i ] ;
                        path . push ( "M" , x ( d . key - 0.5 ) + bar_gap , "," ,
                            height , "V" , y ( d . value ) , "h" , bar_width - 2 * bar_gap ,
                            "V" , height ) ;
                    }
                    return path . join ( "" ) ;
                }

                /*
                 *  Previous versions of this code utilized a random process
                 *  simulated 250 times to estimate 95% confidence intervals.
                 *  While conceptually sound, these simulations were not exact
                 *  and led to visual flickering in the user interface, which
                 *  was confusing for users.
                 *
                 *  This revised approach employs an approximation to estimate
                 *  the 95% confidence interval. Crucially, because it provides
                 *  an exact solution, it completely eliminates the flickering problem.
                 *  For more details on the statistical methodology, refer to:
                 *  http://stats.stackexchange.com/a/19142/31771
                 */
                function calc_confidence_intervals ( )
                {
                    var N = d3 . sum ( group . __all__ ) ; // Total number of respondents in the full dataset.
                    var n = all . value ( ) ; // Number of currently selected respondents.

                    /*
                     *  Create an array of probabilities for each group.
                     *  'alpha' is the hyperparameter of the categorical distribution.
                     *  Refer to: http://en.wikipedia.org/wiki/Categorical_distribution
                     */
                    var p     = [] ,
                        alpha = 1  ;

                    group . __all__ . forEach ( function ( x_val ) {
                        p . push ( ( x_val + alpha ) / ( N + alpha * group . __all__ . length ) ) ;
                    } ) ;

                    var confidence_intervals = [] ,
                        bound                  ;

                    p . forEach ( function ( pp ) {
                        bound = 1.96 * Math . sqrt ( ( pp * ( 1 - pp ) ) / n ) ; // Calculate margin of error.
                        confidence_intervals . push ( [
                            n * Math . max ( pp - bound , 0 ) , // Lower bound.
                            n * Math . min ( pp + bound , 1 )   // Upper bound.
                        ] ) ;
                    } ) ;
                    console . log ( confidence_intervals ) ; // Log intervals for debugging/inspection.
                    return confidence_intervals ;
                }

                /**
                 *  Generates the path for a "backer box" (background rectangle) for a given x-coordinate.
                 *  @param {number} xc - The center x-coordinate.
                 *  @returns {string} The SVG path string.
                 */
                function backer_box ( xc )
                {
                    return "M" + ( xc - bar_width / 2 ) + "," + ( -margin . top ) +
                        "h" + bar_width +
                        "v" + ( margin . top + y . range ( ) + margin . bottom ) +
                        "h" + ( -bar_width ) +
                        "Z" ;
                }

                /**
                 *  Generates the SVG path string for the proportion lines.
                 *  Also handles the display of significance asterisks.
                 *  @param {Array} groups_data - The data array for the group.
                 *  @returns {string} The SVG path string.
                 */
                function proportionPath ( groups_data )
                {

                    // Remove any previously rendered significance asterisks.
                    var svg = d3 . select ( this . parentNode ) ;
                    svg . selectAll ( ".asterisk" ) . remove ( ) ;

                    var path = [] ,
                        i    = -1 ,
                        n    = groups_data . length ,
                        g , p , lwr , upr , // Variables for group, probability, lower/upper bounds.
                        a    = all . value ( ) , // Total number of active (selected) respondents.
                        confidence_intervals ; // Array to hold calculated confidence intervals.