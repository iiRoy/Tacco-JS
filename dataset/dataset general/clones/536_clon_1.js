var chartArray = [ ]; // This array holds all the configuration data for each chart generated.
var currentChartNumber = 0; // Tracks the number of charts currently active or generated.
var showLog = false; // Flag to enable/disable console logging. Could be configured via options.

// A utility function to parse data from an HTML table into a JSON array.
// It iterates through table rows and cells, extracting header and cell values.
// Note: There might be more efficient ways to do this, possibly using D3's table parsing capabilities.
function createJSON( tableName )
{
    var myRows = [ ] ;
    var headersText = [ ] ;

    var tableHeaders = tableName + " th" // Selector for table headers.
      , rowNames     = tableName + " tbody tr"  ; // Selector for table body rows.

    var $headers = $( tableHeaders ) ;
    var theCellValue = '' ; // Temporary variable to hold cell value during processing.

    // Begin looping through all selected rows to extract data.
    var $rows = $( rowNames ) . each ( function ( index )
    {
        $cells = $( this ) . find ( "td" ) ; // Find all data cells within the current row.
        myRows [ index ] = { } ; // Initialize an empty object for the current row's data.

        $cells . each ( function ( cellIndex )
        {
            // If the header text for this column hasn't been captured yet, do so.
            if ( headersText [ cellIndex ] === undefined )
            {
                headersText [ cellIndex ] = $( $headers [ cellIndex ] ) . text ( ) ;
            }

            // Get the raw text content of the current cell.
            theCellValue = $( this ) . text ( ) ;

            // Remove any common currency symbols, percentage signs, or commas from the cell value.
            // This prepares the value for potential numeric conversion.
            var tempCellValue = theCellValue . replace ( / [£€$%¢,] / g , "" ) ;

            // Check if the cleaned cell value is a number.
            if ( isNumber ( tempCellValue ) == true )
            {
                theCellValue = parseFloat ( tempCellValue ) ; // Convert to float if it's a number.
            }

            // Assign the processed cell value to the corresponding header in the current row's object.
            myRows [ index ] [ headersText [ cellIndex ] ] = theCellValue ;
        } ) ;
    } ) ;

    return myRows ; // Return the array of row objects.
}


// Helper function to determine if a given value is a valid number.
// It checks if it's not NaN (Not-a-Number) after parsing and if it's finite.
function isNumber ( n )
{
    return ! isNaN ( parseFloat ( n ) ) && isFinite ( n ) ;
}


// ==== REBUILD CHARTS AFTER WINDOW RESIZING OR OTHER LAYOUT CHANGES ====================
// This function ensures charts are correctly redrawn when the browser window is resized.
function rebuildCharts ( )
{
    // Uses a debounce function to wait for the resizing to stop before executing.
    waitForFinalEvent ( function ( )
    {
        for ( i = 0 ; i < chartArray . length ; i ++ )
        {
            // console.log ( chartArray ) ; // Debugging line.
            d3 . select ( chartArray [ i ] . options . svgID ) . remove ( ) ; // Remove the existing SVG element for the chart.

            var legendID = chartArray [ i ] . options . targetDiv + " div.legend" ;
            d3 . select ( legendID ) . remove ( ) ; // Remove the associated legend div.

            // Extract chart parameters from the stored configuration.
            var typeOfChart   = chartArray [ i ] . type
              , sourceTable   = chartArray [ i ] . sourceTable
              , dataColumn    = chartArray [ i ] . graphingVariable
              , options       = chartArray [ i ] . options ;

            // Recreate the chart using its original parameters.
            createChart ( typeOfChart , sourceTable , dataColumn , options ) ;
        }
    } , 500 , "some unique string" ) ; // 500ms debounce delay.
}



// A debounce function that waits for an event to finish firing before executing its callback.
// Useful for events like window resizing to prevent excessive function calls.
var waitForFinalEvent = ( function ( )
{
    var timers = { } ; // Stores timers for different unique IDs.
    return function ( callback , ms , uniqueId )
    {
        if ( ! uniqueId )
        {
            uniqueId = "Don't call this twice without a uniqueId" ; // Default ID if none provided.
        }
        if ( timers [ uniqueId ] )
        {
            clearTimeout ( timers [ uniqueId ] ) ; // Clear any existing timer for this ID.
        }
        timers [ uniqueId ] = setTimeout ( callback , ms ) ; // Set a new timer.
    } ;
} ) ( ) ;



// GET HELP IN THE CONSOLE WITH CREATING THE CHART ===================================================================================
// This function prints a sample `createChart` call to the console,
// demonstrating available options and their structure.
function chartHelp ( )
{
    console . log ( 'createChart("typeOfChart", "#sourceTable", "dataColumn", \n{"labels":""\n, "targetDiv":""\n, "height":200\n, "showTable":false //Show (true) or hide (false) the source table\n, "barHeight": 30\n, "padding": 15\n, "ticks": 4 //Set the approximate number of ticks in the axis\n, "xAxis":true //Show (true) or hide (false) the xAxis.\n, "colorScale": ["#D4451D", "#FF6C0C", "#FFB819", "#95D600"] //You can set the color palette for pie charts. \n, "donutHole": 55\n, "decimalPlaces": "none"\n, "addComma": false //You can add commas to numbers.\n, "prefix": ""\n, "suffix": ""\n, "clicked": "" //You can add a custom onClick function by defining it like this: var myFunctionBar = function (d, i){console.log("This is a custom function. "+d.Sport+" players run "+d.Miles+ " "+i)}\n, "addLegend": false //You can add a legend.\n, "donutLabel": "Goals" //A label for the donut hole. This can be a string, "min", "max", "minPercentage" or "maxPercentage"\n, "donutLabelTag": "Goals" //A small label under the donut hole label.\n, "chartLabels": "value" //Defaults to the data values. Other options "percentage" or "both".\n , "showLog": true //Show the console.log statements. Default is false.})' )
}



// Creating a D3 SVG chart Function ===================================================================================
// This is the main function to generate various types of D3 charts.
function createChart ( type , sourceTable , graphingVariable , options )
{
    // First, check if the browser supports SVG.
    var supportsSVG = document . implementation . hasFeature ( "http://www.w3.org/TR/SVG11/feature#BasicStructure" , "1.1" ) ;

    if ( ! supportsSVG )
    {
        if ( type == 'bar' || type == 'column' )
        {
            // console.log ( "The browser doesn't support SVG and the chart type will be reset to a table-based bar chart." ) ;
            type = "tableBarChart" ; // Fallback to a non-SVG chart type.
        }
        else if ( type == 'donut' || type == 'pie' )
        {
            // console.log ( "The browser doesn't support SVG and the chart type will be reset to a table-based stacked bar chart." ) ;
            type = "tableStackedAreaChart" ; // Fallback to a non-SVG chart type.
        }
    }

    // A simple internal logger function that respects the global `showLog` flag.
    function logger ( consoleString )
    {
        if ( showLog )
        {
            console . log ( consoleString ) ;
        }
    }


    // DEFINE THE DEFAULT OPTIONS --------------------------------------------------------
    var defaultOptions = {
        "labels"         : ""
      , "targetDiv"      : ""
      , "height"         : 200
      , "showTable"      : false
      , "barHeight"      : 30
      , "padding"        : 15
      , "paddingLabels"  : 90
      , "ticks"          : 4
      , "xAxis"          : true
      , "colorScale"     : [ "#D4451D" , "#FF6C0C" , "#FFB819" , "#95D600" ]
      , "donutHole"      : 55
      , "addLegend"      : false
      , "donutLabel"     : ""
      , "labelSlices"    : true
      , "decimalPlaces"  : "none"
      , "addComma"       : false
      , "prefix"         : ""
      , "suffix"         : ""
      , "clicked"        : ""
      , "donutLabelTag"  : ""
      , "chartLabels"    : "value" // Default to data values; other options: "percentage" or "both".
      , "showLog"        : false
      // , "columnLabels": false // Removed: column labels are based on whether they have .hide class in <th>
    } ;

    // Merge provided options with defaults.
    if ( options )
    {
        if ( ! options . labels ) { options . labels = defaultOptions . labels ; } ;
        if ( ! options . targetDiv ) { options . targetDiv = defaultOptions . targetDiv ; } ;
        if ( ! options . height ) { options . height = defaultOptions . height ; } ;
        if ( typeof options . showTable === 'undefined' ) { options . showTable = true ; } ;
        if ( ! options . barHeight ) { options . barHeight = defaultOptions . barHeight ; } ;
        if ( ! options . padding ) { options . padding = defaultOptions . padding ; } ;
        if ( ! options . paddingLabels ) { options . paddingLabels = defaultOptions . paddingLabels ; } ;
        if ( typeof options . xAxis === 'undefined' ) { options . xAxis = true ; } ;
        if ( ! options . ticks ) { options . ticks = defaultOptions . ticks ; } ;
        if ( ! options . colorScale ) { options . colorScale = defaultOptions . colorScale ; } ;
        if ( ! options . donutHole ) { options . donutHole = defaultOptions . donutHole ; } ;
        if ( typeof options . decimalPlaces === 'undefined' ) { options . decimalPlaces = defaultOptions . decimalPlaces ; } ;
        if ( typeof options . addComma === 'undefined' ) { options . addComma = defaultOptions . addComma ; } ;
        if ( ! options . prefix ) { options . prefix = defaultOptions . prefix ; } ;
        if ( ! options . suffix ) { options . suffix = defaultOptions . suffix ; } ;
        if ( ! options . clicked ) { options . clicked = defaultOptions . clicked ; } ;
        if ( typeof options . addLegend === 'undefined' ) { options . addLegend = defaultOptions . addLegend ; } ;
        if ( ! options . donutLabel ) { options . donutLabel = defaultOptions . donutLabel ; } ;
        if ( ! options . donutLabelTag ) { options . donutLabelTag = defaultOptions . donutLabelTag ; } ;
        if ( typeof options . labelSlices === 'undefined' ) { options . labelSlices = true ; } ;
        if ( ! options . chartLabels ) { options . chartLabels = defaultOptions . chartLabels ; } ;
        if ( options . showLog == true ) { showLog = true ; } ;
        // if (typeof options.columnLabels === 'undefined' ) { options.columnLabels = false };
    }
    else
    {
        options = typeof options !== 'undefined' ? options : defaultOptions ;
        // console.log("No option parameters set, so we'll just use the default settings. Type chartHelp() in the console for a list of the parameters.")
    }


    // CREATE THE JSON FROM THE SOURCE TABLE --------------------------------------------------------
    var tableJSON = createJSON ( sourceTable ) ;
    logger ( "tableJSON (The JSON created from the target table): " ) ;
    logger ( tableJSON ) ;
    logger ( "" ) ;


    // Hide the source table if specified in options, but only if SVG is supported or for specific chart types.
    if ( ! options . showTable )
    {
        if ( supportsSVG || type == 'bar' || type == 'tableBarChart' )
        {
            $( sourceTable ) . css ( { 'position' : 'absolute' , 'left' : '-9999px' } ) ; // Visually hides but keeps accessible for screen readers.
        }
    }

    var graphingVariableName ;
    if ( graphingVariable instanceof Array )
    {
        // console.log ( 'this is an array' )
        graphingVariableName = graphingVariable [ 0 ] ; // Use the first element if graphingVariable is an array.
    }
    else
    {
        // console.log ( 'not an array' )
        graphingVariableName = graphingVariable ; // Use directly if not an array.
    }

    // Determine the target div for the chart. If not specified, create one.
    var targetChart ;
    if ( options . targetDiv == "" )
    {
        var chartID = type + '_chart_' + graphingVariableName + currentChartNumber ;
        targetChart = '#' + chartID ;
        // console.log ( 'targetDiv not set. Adding new div' + targetChart + " " + chartID ) ;
        $( sourceTable ) . after ( "<div id='" + chartID + "' class='graphic'></div>" ) ; // Insert after the source table.
        options . targetDiv = targetChart ; // Store the new targetDiv in options for `chartArray`.
    }
    else
    {
        targetChart = options . targetDiv ;
    }


    // Set up core chart dimensions and padding.
    var margin = { top : 20 , left : 0 , bottom : 10 , right : 0 }
      , width = parseInt ( d3 . select ( targetChart ) . style ( 'width' ) )
      , width = width - margin . left - margin . right
      , height = options . height
      , barPadding = 10
      , padding = options . padding
      , paddingLeftLabels = 0
      , label = options . labels
      , donutHole = options . donutHole ;

    if ( options . labels != "" ) { paddingLeftLabels = options . paddingLabels ; /* console.log('pll = '+paddingLeftLabels)*/ } ;

    // Adjust height for bar/comparison charts based on data length.
    if ( type == 'bar' || type == 'comparison' )
    {
        height = tableJSON . length * options . barHeight + 10 ;
        // console.log ( 'Automatically setting the height to ' + height + " pixels (because of the amount of data)." ) ;
    }

    // Pie charts have no donut hole.
    if ( type == 'pie' )
    {
        donutHole = 0 ;
    }


    // CREATE THE SVG CONTAINER OR TARGET DIV FOR NON-SVG CHARTS -------------------------------------------------------

    var svgID = 'svg_' + type + '_chart_' + graphingVariableName + currentChartNumber ;
    options . svgID = '#' + svgID ;

    var viz ; // Variable to hold the D3 selection for the visualization container.

    if ( type == 'bar' || type == 'column' || type == 'scatterplot' || type == 'donut' || type == 'pie' )
    {
        viz = d3 . selectAll ( targetChart )
          . append ( 'svg' )
          . attr ( "id" , svgID )
          . style ( 'width' , ( width + margin . left + margin . right ) + 'px' )
          . style ( 'height' , height + margin . top + margin . bottom + padding )
          . append ( 'g' )
          . attr ( 'transform' , 'translate(' + [ margin . left , margin . top ] + ')' ) ;

        // Add group elements for bars in bar/column/scatterplot charts.
        if ( type == 'bar' || type == 'column' || type == 'scatterplot' )
        {
            var g = viz . selectAll ( 'g' )
              . data ( tableJSON )
              . enter ( )
              . append ( 'g' ) ;
        }
    }
    else if ( type == 'tableBarChart' || type == 'tableStackedArea' )
    {
        // For table-based charts, the 'SVG' ID refers to a div.
        svgID = 'div_' + type + '_chart_' + graphingVariable + currentChartNumber ;
        options . svgID = '#' + svgID ;
        viz = d3 . selectAll ( targetChart ) ; // Select the target div directly.
    }
    else
    {
        // Handle other chart types or comparison charts (which are handled separately below).
    }


    // Add the chart creation information to the `chartArray` for resizing and recreation. -----------------------------------------------
    var chartInfo = {
        'type'           : type
      , 'sourceTable'    : sourceTable
      , 'graphingVariable' : graphingVariable
      , 'options'        : options
    } ;

    var check = false ; // Flag to check if this chart already exists in the array.

    for ( var i = 0 ; i < chartArray . length ; i ++ )
    {
        if ( options . svgID === chartArray [ i ] . options . svgID )
        {
            check = true ; // Chart found, no need to add again.
        }
    }

    if ( ! check )
    {
        chartArray . push ( chartInfo ) ; // Add the chart's info if it's new.
    }



    // CREATE THE DIFFERENT X- and Y-SCALES --------------------------------------------------------

    if ( graphingVariable instanceof Array )
    {
        // console.log ( 'this is an array' )
        // Scales for array-based graphing variables (e.g., comparison charts) are handled differently.
    }
    else
    {
        // console.log ( 'not an array' )

        // Create the Y-scale (linear for most charts).
        var yScale = d3 . scale . linear ( )
          . domain ( [ 0 , d3 . max ( tableJSON , function ( d ) { return d [ graphingVariable ] } ) ] )
          . range ( [ height , 0 ] ) ; // Maps data to pixel range (inverted for SVG y-axis).

        // Create the X-scale (linear for most charts).
        var xScale = d3 . scale . linear ( )
          . domain ( [ 0 , d3 . max ( tableJSON , function ( d ) { return d [ graphingVariable ] } ) ] )
          . range ( [ 0 , width ] ) ; // Maps data to pixel range.



        // CREATE THE X- and Y-AXIS GENERATORS --------------------------------------------------------
        var xAxis = d3 . svg . axis ( )
          . scale ( xScale )
          . orient ( 'bottom' )
          . ticks ( options . ticks ) ;

        // Function to add the X-axis to the visualization.
        function addXaxis ( )
        {
            if ( options . xAxis )
            {
                viz . append ( 'g' )
                  . attr ( 'class' , 'axis' )
                  . attr ( 'transform' , 'translate(0,' + height + ')' ) // Moves the axis to the bottom.
                  . call ( xAxis ) ;
            }
        }


        var yAxis = d3 . svg . axis ( )
          . scale ( yScale )
          . orient ( 'left' )
          . ticks ( options . ticks ) ;

        // Function to add the Y-axis to the visualization.
        function addYaxis ( )
        {
            viz . append ( 'g' )
              . attr ( 'class' , 'axis' )
              . attr ( 'transform' , 'translate(' + padding + ',0)' )
              . call ( yAxis ) ;
        }
    }


    // ADD LEGEND -------------------------------------------------------------
    // This function appends an HTML legend to the chart's target container.
    function addLegend ( )
    {
        var htmlLegend = d3 . select ( targetChart ) ;

        // Add the main legend div, then a paragraph for each item, and a span for its text label.
        htmlLegend
          . append ( 'div' )
          . classed ( 'legend' , true )
          . selectAll ( 'p' )
          . data ( tableJSON )
          . enter ( )
          . append ( 'p' )
          . append ( 'span' )
          . classed ( 'keyText' , true ) . text ( function ( d , i ) { return d [ options . labels ] } ) ;

        // Insert a color swatch (span.keySwatch) before the text label.
        htmlLegend . selectAll ( '.legend p' ) . insert ( "span" , "span.keyText" )
          . style ( 'background-color' , function ( d , i ) { /*console.log(i + " " + options.colorScale[i]);*/ return options . colorScale [ i ] } )
          . classed ( 'keySwatch' , true ) ;

        // console.log ( "CREATE THE LEGEND!" )
    }


    // Reformat numbers based on user options (decimal places, commas, prefix/suffix). --------------------------------------------------------
    var reformatTheNumber = false
      , decimalPlaces     = options . decimalPlaces
      , addComma          = options . addComma
      , addCommaSeparator = ""
      , prefix            = options . prefix
      , suffix            = options . suffix ;

    // Determine if any number reformatting is required.
    if ( decimalPlaces >= 0 || prefix != "" || suffix != "" || addComma ) { reformatTheNumber = true ; }

    var formatDecimals ;
    // Set up the decimal formatting function.
    if ( decimalPlaces == "none" )
    {
        formatDecimals = function ( originalNumber ) { return originalNumber } ;
    }
    else if ( decimalPlaces >= 0 )
    {
        if ( addComma ) { addCommaSeparator = "," }
        var styleNumber = addCommaSeparator + "." + decimalPlaces + "f" ;
        formatDecimals = d3 . format ( styleNumber ) ;
    }

    var formatNumber ;
    // Set up the main number formatting function, including prefix/suffix.
    if ( reformatTheNumber )
    {
        if ( decimalPlaces === 'undefined' )
        {
            formatNumber = function ( originalNumber ) { return prefix + originalNumber + suffix } ; // For currencies without specific decimal formatting.
        }
        else
        {
            formatNumber = function ( originalNumber ) { return prefix + formatDecimals ( originalNumber ) + suffix } ; // For numbers with decimals and prefix/suffix.
        }
    }
    else
    {
        formatNumber = function ( originalNumber ) { return originalNumber } ; // No reformatting needed.
    }


    /*
    // FIND THE MAXIMUM WIDTH FOR A SELECTION----------------------------------------------------
    function maximumWidth(selection){
        var textWidth = [];// an array for storing the width of the labels
        var textBoxes = d3.selectAll(selection)
          .each(function () {
            var textWidthNumber = d3.select(this).style("width");
            textWidthNumber = textWidthNumber.replace("px","");
            textWidthNumber = Number(textWidthNumber);
            textWidth.push(textWidthNumber);
          });

        paddingLeftLabels = Math.max.apply(Math, textWidth) + 7;
        console.log('dkfjalksdjf;a')
      }
    */


    // DEFINE BASIC HOVER FUNCTIONS FOR INTERACTIVITY -------------------------------------------------------------
    var hoverColor = function ( ) { d3 . select ( this ) . style ( "fill-opacity" , .8 ) ; } ;
    var offColor   = function ( ) { d3 . select ( this ) . style ( "fill-opacity" , 1 ) ; } ;



    // DEFINE THE DIFFERENT TYPES OF CHARTS =======================================


    // Comparison bar chart :: Responsive view (grouped charts with labels)? Or just show the table below a certain width? -----------------
    function comparisonBarChart ( )
    {
        if ( width > 400 )
        {
            // Find the maximum value across both graphing variables for scale determination.
            var maxValueArray = [ ] ;
            for ( var i = 0 ; i < tableJSON . length ; i ++ )
            {
                maxValueArray . push ( tableJSON [ i ] [ graphingVariable [ 0 ] ] ) ;
                maxValueArray . push ( tableJSON [ i ] [ graphingVariable [ 1 ] ] ) ;
            } ;
            var maxValue = Math . max . apply ( Math , maxValueArray ) ;
            if ( options . suffix == "%" ) { maxValue = 100 } ; // Special handling for percentages.

            // Determine label padding based on whether column headers are hidden.
            var labelPadding = 0 ;
            var hideLabelsSelection = sourceTable + " thead tr th.hide" ; // Checks for hidden labels.
            var hideLabels = d3 . selectAll ( hideLabelsSelection ) ;
            if ( hideLabels [ 0 ] . length == 0 ) { labelPadding = 20 } ;

            // Append the SVG container for the comparison chart.
            var viz = d3 . selectAll ( targetChart )
              . append ( 'svg' )
              . attr ( "id" , svgID )
              // .style('width', (width + margin.left + margin.right) )
              . style ( 'height' , height + labelPadding ) ;

            // Add the center column for labels.
            viz . append ( 'g' )
              . classed ( 'middle' , true )
              . attr ( "transform" , "translate(" + width / 2 + ", " + labelPadding * 1.5 + ")" )
              . selectAll ( 'text' )
              . data ( tableJSON )
              . enter ( )
              . append ( 'text' )
              . text ( function ( d , i ) { return d [ label ] } )
              . attr ( 'y' , function ( d , i ) { return i * ( options . barHeight ) + .5 * ( options . barHeight ) } )
              . attr ( 'text-anchor' , 'middle' )
              . style ( 'font-weight' , 'bold' ) ;


            // Determine the width of the center column dynamically.
            // Firefox and similar browsers might report 'auto' for SVG element widths, requiring a fallback.
            var testIfAutoWidth = false ;
            var middleWidth ;
            var columnWidth ;
            var textWidth = [ ] ; // Array to store the width of labels.
            var textBoxes = viz . selectAll ( 'text' )
              . each ( function ( )
              {
                  var textWidthNumber = d3 . select ( this ) . style ( "width" ) ;
                  if ( textWidthNumber == 'auto' ) { testIfAutoWidth = true } ;
                  textWidthNumber = textWidthNumber . replace ( "px" , "" ) ;
                  textWidthNumber = Number ( textWidthNumber ) ;
                  textWidth . push ( textWidthNumber ) ;
              } ) ;
            if ( testIfAutoWidth )
            {
                // console.log ( "you're using firefox or another browser that sets 'auto' widths for svg elements." + options . paddingLabels )
                middleWidth = options . paddingLabels ; // Use a default padding if width cannot be determined.
            }
            else
            {
                middleWidth = Math . max . apply ( Math , textWidth ) + 50 ;
                columnWidth = ( width - middleWidth ) / 2 ;
            }

            // Create the X-scale for comparison charts.
            var xScaleComparison = d3 . scale . linear ( )
              . domain ( [ 0 , maxValue ] )
              . range ( [ 0 , columnWidth - 40 ] ) ;


            // Add column labels if they are not hidden in the source table.
            if ( hideLabels [ 0 ] . length == 0 )
            {
                viz . append ( 'text' )
                  . text ( graphingVariable [ 0 ] )
                  . attr ( 'y' , 20 )
                  . style ( 'font-weight' , 'bold' )

                viz . append ( 'text' )
                  . text ( graphingVariable [ 1 ] )
                  . attr ( 'y' , 20 )