/*
 * This entire script is encapsulated within an anonymous self-executing function.
 * It takes jQuery as its argument, aliased as '$', ensuring no global conflicts.
 * The primary purpose of this module is to render and manage interactive graphical
 * representations of sequence alignment hits, typically seen in bioinformatics tools.
 */
( function  ( $ )
{


    //  Utility function to initialize all tooltips present on the page.
    //  Tooltips provide additional information on hover for various elements.
    var setupTooltip = function ( )
    {
        // Selects elements that have the 'data-toggle="tooltip"' attribute.
        // These elements will display a tooltip on hover.
        $ ( '[data-toggle="tooltip"]' ) . tooltip (
            {
                'placement'   : 'top'      ,  //  Configures the tooltip to appear above the element.
                'container'   : 'body'     ,  //  Attaches the tooltip DOM element directly to the <body>.
                                              //  This prevents z-index issues and clipping within parent containers.
                'html'        : 'true'     ,  //  Allows the tooltip content to be rendered as HTML.
                'white-space' : 'nowrap'      //  Ensures the tooltip text does not wrap, keeping it on a single line.
            }
        ) ;
    } ; /*  End of setupTooltip function  */


    //  Function to set up click event handlers for anchor tags within a graph division.
    //  When clicked, these links will update the URL hash without a full page reload.
    var setupClick = function ( $graphDiv )
    {
        //  Finds all anchor ('a') elements that are children of the provided $graphDiv.
        $ ( 'a' ,  $graphDiv ) . click ( function ( evt )
        {
            //  Prevent the browser's default action for the anchor tag (i.e., navigating to a new page).
            evt . preventDefault ( ) ;
            //  Stop the event from propagating further up the DOM tree to parent elements.
            evt . stopPropagation ( ) ;
            //  Update the URL's hash fragment using the 'href' attribute of the clicked anchor.
            window . location . hash = $ ( this ) . attr ( 'href' ) ;
        } ) ;
    } ; /*  End of setupClick function  */



    //  This function manages the responsiveness of the graph, redrawing it on window resize events.
    var setupResponsiveness = function ( $queryDiv ,  $graphDiv ,  index ,  opts )
    {
        //  Store the initial width of the window.
        var currentWidth = $ ( window ) . width ( ) ;

        //  Create a debounced version of the drawing function.
        //  This ensures the graph is not redrawn excessively during a resize,
        //  improving performance by waiting for a pause in resizing events.
        var debounced_draw = _ . debounce ( function ( )
        {
            //  Check if the window width has actually changed since the last draw.
            if  ( currentWidth !== $ ( window ) . width ( ) )
            {
                //  Recalculate the number of currently shown hits.
                var shownHits = $queryDiv . find ( '.ghit > g' ) . length ;
                //  Redraw the graph with the current parameters.
                $ . graphIt ( $queryDiv ,  $graphDiv ,  shownHits ,  index ,  opts ) ;
                //  Update the stored window width.
                currentWidth = $ ( window ) . width ( ) ;
            }
        } ,  125 ) ; //  Debounce delay of 125 milliseconds.

        //  Attach the debounced drawing function to the window's resize event.
        $ ( window ) . resize ( debounced_draw ) ;
    } ; /*  End of setupResponsiveness function  */



    //  Manages the 'View More' and 'View Less' buttons for the graph,
    //  allowing users to dynamically load more or fewer hits.
    var graphControls = function ( $queryDiv ,  $graphDiv ,  isInit )
    {
        //  Define a constant for the minimum number of hits to display.
        var MIN_HITS_TO_SHOW = 20 ;

        //  Declare variables to hold total hit count, currently shown hits, and button references.
        var totalHits ,  shownHits ,  lessButton ,  moreButton ;

        //  Inner function to update the total and shown hit counts.
        var countHits = function ( )
        {
            totalHits = $queryDiv . data ( ) . hitCount ;
            shownHits = $queryDiv . find ( '.ghit > g' ) . length ;
        } ;

        //  Inner function responsible for appending the 'More' and 'Less' buttons to the graph container.
        var setupButtons = function ( $queryDiv ,  $graphDiv )
        {
            $graphDiv
            . append (
                $ ( '<button/>' )
                . addClass ( 'btn btn-link more' )
                . attr ( 'type' ,  'button' )
                . attr ( 'data-parent-query' ,  $queryDiv . attr ( 'id' ) )
                . html ( 'View More&nbsp;' )
                . append (
                    $ ( '<i/>' )
                    . addClass ( 'fa fa-angle-double-down' )
                ) ,
                $ ( '<button/>' )
                . addClass ( 'btn btn-link less' )
                . attr ( 'type' ,  'button' )
                . attr ( 'data-parent-query' ,  $queryDiv . attr ( 'id' ) )
                . html ( 'View Less&nbsp;' )
                . append (
                    $ ( '<i/>' )
                    . addClass ( 'fa fa-angle-double-up' )
                )
            ) ;

            //  Cache references to the newly created buttons.
            lessButton = $ ( '.less' ,  $graphDiv ) ;
            moreButton = $ ( '.more' ,  $graphDiv ) ;
        } ;

        //  Inner function to determine and set the initial visibility state of the 'More' and 'Less' buttons.
        var initButtons = function ( )
        {
            countHits ( ) ; //  First, update the hit counts.

            //  Logic to control button visibility based on hit counts.
            if  ( totalHits === MIN_HITS_TO_SHOW  ||
                shownHits < MIN_HITS_TO_SHOW )
            {
                lessButton . hide ( ) ;
                moreButton . hide ( ) ;
            }
            else if  ( shownHits === totalHits )
            {
                moreButton . hide ( ) ;
                lessButton . show ( ) ;
            }
            else if  ( shownHits === MIN_HITS_TO_SHOW )
            {
                lessButton . hide ( ) ;
                moreButton . show ( ) ;
            }
            else
            {
                lessButton . show ( ) ;
                moreButton . show ( ) ;
            }
        } ; /*  End of initButtons  */

        //  Setup view buttons' state properly if called for the first time.
        if ( isInit === true )
        {
            setupButtons ( $queryDiv ,  $graphDiv ) ;
            initButtons ( ) ;
        }

        //  Attach click handler for the 'More' button.
        moreButton . on ( 'click' ,  function ( e )
        {
            countHits ( ) ; //  Refresh hit counts.
            //  Call graphIt to display more hits. The 'index' parameter here is shownHits,
            //  and 'howMany' is MIN_HITS_TO_SHOW, indicating how many additional hits to load.
            $ . graphIt ( $queryDiv ,  $graphDiv ,  shownHits ,  MIN_HITS_TO_SHOW ) ;
            initButtons ( ) ; //  Re-evaluate button visibility.
            setupTooltip ( ) ; //  Re-initialize tooltips for newly added elements.
            e . stopPropagation ( ) ; //  Prevent event bubbling.
        } ) ;

        //  Attach click handler for the 'Less' button.
        lessButton . on ( 'click' ,  function ( e )
        {
            countHits ( ) ; //  Refresh hit counts.
            var diff = shownHits - MIN_HITS_TO_SHOW ; //  Calculate the difference.

            //  Decrease the number of shown hits by a defined constant.
            if  ( diff >= MIN_HITS_TO_SHOW )
            {
                //  If enough hits are present, decrease by MIN_HITS_TO_SHOW.
                $ . graphIt ( $queryDiv ,  $graphDiv ,  shownHits ,  -MIN_HITS_TO_SHOW ) ;
                initButtons ( ) ; //  Update button states.
            }
            else if  ( diff !== 0 )
            {
                //  If fewer than MIN_HITS_TO_SHOW additional hits, remove just enough to reach MIN_HITS_TO_SHOW.
                //  Ensures a certain number of hits always stay in the graph.
                $ . graphIt ( $queryDiv ,  $graphDiv ,  shownHits ,  MIN_HITS_TO_SHOW - shownHits ) ;
                initButtons ( ) ; //  Update button states.
            }
            setupTooltip ( ) ; //  Re-initialize tooltips.
            e . stopPropagation ( ) ; //  Prevent event bubbling.
        } ) ;
    } ; /*  End of graphControls function  */


    /*
     *  extractData: This function is responsible for parsing and extracting
     *  hit data from the DOM, specifically from elements within the $queryDiv,
     *  based on their 'data-' attributes. It returns the data in a structured
     *  object format suitable for graph rendering.
     */
    var extractData = function ( $queryDiv ,  index ,  howMany )
    {
        var hitPanels ,  hits = [ ] ;
        //  Selects a subset of hit panels based on the 'index' and 'howMany' parameters.
        hitPanels = $queryDiv . find ( '.hitn' ) . slice ( 0 ,  index + howMany ) ;
        hitPanels . map ( function ( )
        {
            var $this = $ ( this ) ;
            var _hsps = [ ] ; //  Temporary array to store HSPs for the current hit.
            $this . find ( '.hsp' ) . each ( function ( )
            {
                var __hsps = [ ] ;
                //  Extract data attributes from the current HSP element.
                __hsps = $ ( this ) . data ( ) ;
                __hsps . hspId = this . id ; //  Assign the element's ID as hspId.
                _hsps . push ( __hsps ) ; //  Add the processed HSP to the _hsps array.
            } ) ;
            _hsps . hitId = $this . attr ( 'id' ) ; //  Assign the hit panel's ID.
            _hsps . hitDef = $this . data ( ) . hitDef ; //  Extract hit definition.
            _hsps . hitEvalue = $this . data ( ) . hitEvalue ; //  Extract E-value.
            hits . push ( _hsps ) ; //  Add the complete hit object to the main 'hits' array.
        } ) ;
        return hits ; //  Return the array of structured hit data.
    } ; /*  End of extractData function  */


    //  drawLegend: Draws the color gradient legend for the graph,
    //  indicating the strength of hits based on their E-value.
    var drawLegend = function ( svg ,  options ,  width ,  height )
    {
        //  Append a group element for the legend and position it at the bottom of the SVG.
        var svg_legend = svg . append ( 'g' )
            . attr ( 'transform' ,
                'translate(0,' + ( height - options . margin - options . legend * 1.25 ) + ')' ) ;

        //  Draw the rectangular gradient bar for the legend.
        svg_legend . append ( 'rect' )
            . attr ( 'x' ,  7 * ( width - 2 * options . margin ) / 10 )
            . attr ( 'width' ,  2 * ( width - 4 * options . margin ) / 10 )
            . attr ( 'height' ,  options . legend )
            . attr ( 'fill' ,  'url(#legend-grad)' ) ;

        //  Add text label for "Weaker hits" to the left of the gradient.
        svg_legend . append ( 'text' )
            . attr ( 'transform' ,  'translate(0, ' + options . legend + ')' )
            . attr ( 'x' ,  6 * ( width - 2 * options . margin ) / 10 - options . margin / 2 )
            . text ( "Weaker hits" ) ;

        //  Add text label for "Stronger hits" to the right of the gradient.
        svg_legend . append ( 'text' )
            . attr ( 'transform' ,  'translate(0, ' + options . legend + ')' )
            . attr ( 'x' ,  9 * ( width - 2 * options . margin ) / 10 + options . margin / 2 )
            . text ( "Stronger hits" ) ;

        //  Define the linear gradient used for the legend bar.
        svg . append ( 'linearGradient' )
            . attr ( 'id' ,  'legend-grad' )
        . selectAll ( 'stop' )
        . data ( [
            { offset : "0%"   ,  color : "#ccc" } ,  //  Lightest color for weaker hits.
            { offset : '50%'  ,  color : '#888' } ,  //  Mid-range color.
            { offset : "100%" ,  color : "#000" }    //  Darkest color for stronger hits.
        ] )
        . enter ( )
        . append ( 'stop' )
            . attr ( 'offset' ,  function ( d )
            {
                return d . offset ;
            } )
            . attr ( 'stop-color' ,  function ( d )
            {
                return d . color ;
            } ) ;
    } ; /*  End of drawLegend function  */


    /*
     *  Main method responsible for drawing the graphical overview of sequence alignments.
     *  It accepts a query division, a graph division, current index, number of hits to show,
     *  and optional settings. This function orchestrates the data extraction, SVG creation,
     *  axis drawing, hit track rendering, and legend display.
     */
    $ . extend ( {
        graphIt : function ( $queryDiv ,  $graphDiv ,  index ,  howMany ,  opts )
        {
            /*
             *  Configuration options for the graph visualization:
             *  barHeight:    Height of each individual hit track.
             *  barPadding:   Vertical spacing between hit tracks.
             *  legend:       Height reserved for the overview legend.
             *  margin:       General margin around the entire SVG element.
             */
            var defaults = {
                barHeight  : 4  ,
                barPadding : 5  ,
                legend     : 10 ,
                margin     : 20
            } ,
            options = $ . extend ( defaults ,  opts ) ,
            hits = extractData ( $queryDiv ,  index ,  howMany ) ;

            //  If no hits are extracted, there's nothing to draw, so exit early.
            if  ( hits . length < 1 )  return false ;

            //  If this is not the initial draw (i.e., 'index' is not 0),
            //  remove any existing SVG to redraw the graph from scratch.
            //  This is a current limitation, as extending existing graphs is not yet implemented.
            if  ( index !== 0 )
            {
                $graphDiv . find ( 'svg' ) . remove ( ) ;
            }

            //  Retrieve the query length from the query division's data attributes.
            var queryLen = $queryDiv . data ( ) . queryLen ;
            //  Get the ID of the query division.
            var q_i = $queryDiv . attr ( 'id' ) ;

            //  Calculate the width and height of the SVG canvas.
            var width = $graphDiv . width ( ) ;
            var height = hits . length * ( options . barHeight + options . barPadding ) +
                5 * options . margin + options . legend * 3 ;

            //  Initialize the D3 SVG canvas.
            //  Selects the graph division, binds hit data, enters the data,
            //  and inserts a new SVG element as the first child.
            var svg = d3 . select ( $graphDiv [ 0 ] )
                . selectAll ( 'svg' )
                . data ( [ hits ] )
                . enter ( )
                . insert ( 'svg' ,  ':first-child' )
                    . attr ( 'width' ,  width )
                    . attr ( 'height' ,  height )
                . append ( 'g' ) //  Append a group element within the SVG for transformations.
                    . attr ( 'transform' ,  'translate(' + options . margin / 4 + ', ' + options . margin / 4 + ')' ) ;

            //  Set up the X-axis scale (linear scale for query coordinates).
            var x = d3 . scale
                . linear ( )
                . range ( [ 0 ,  width - options . margin ] ) ;

            //  Define the domain for the X-axis, from 1 to the query length.
            x . domain ( [ 1 ,  queryLen ] ) ;

            //  Generate tick values for the X-axis.
            var _tValues = x . ticks ( 11 ) ;
            _tValues . pop ( ) ; //  Remove the last tick to avoid overlap if queryLen is a tick.

            //  Configure the D3 X-axis.
            var xAxis = d3 . svg
                . axis ( )
                . scale ( x )
                . orient ( 'top' ) //  Position the axis at the top.
                . tickValues ( _tValues . concat ( [ 1 ,  queryLen ] ) ) ; //  Include 1 and queryLen explicitly.

            //  Append the X-axis to the SVG.
            svg . append ( 'g' )
                . attr ( 'transform' ,  'translate(0, ' + options . margin + ')' )
                . append ( 'g' )
                    . attr ( 'class' ,  'x axis' )
                    . call ( xAxis ) ; //  Call the axis generator.

            //  Set up the Y-axis scale (ordinal scale for hit IDs).
            var y = d3 . scale
                . ordinal ( )
                . rangeBands ( [ 0 ,  height - 3 * options . margin - 2 * options . legend ] ,  0.3 ) ;

            //  Define the domain for the Y-axis using hit IDs.
            y . domain ( hits . map ( function ( d )
            {
                return d . hitId ;
            } ) ) ;

            //  Set up a logarithmic scale for coloring hits based on their E-value.
            //  This maps E-values to a range of colors (represented by numbers here).
            var gradScale = d3 . scale
                . log ( )
                . domain ( [
                    d3 . min ( [ 1e-5 ,  d3 . min ( hits . map ( function ( d )
                    {
                        if  ( parseFloat ( d . hitEvalue ) === 0.0 )  return undefined ;
                        return d . hitEvalue ;
                        } )
                    ) ] ) ,
                    d3 . max ( hits . map ( function ( d )
                    {
                        return d . hitEvalue ;
                    } ) )
                ] )
                . range ( [ 40 , 150 ] ) ; //  Output range for color component.

            //  Draw the individual hit tracks and their HSPs.
            svg . append ( 'g' )
                . attr ( 'class' ,  'ghit' )
                . attr ( 'transform' ,  'translate(0, ' + ( 2 * options . margin - options . legend ) + ')' )
                . selectAll ( '.hits' )
                . data ( hits )
                . enter ( )
                . append ( 'g' )
                    . attr ( 'data-toggle' ,  'tooltip' )
                    . attr ( 'title' ,  function ( d )
                    {
                        //  Format the E-value for display in the tooltip.
                        var regex = /(\d*\.\d*)e?([+-]\d*)?/ ;
                        var parsedVal = regex . exec ( d . hitEvalue ) ;
                        var prettyEvalue = parseFloat ( parsedVal [ 1 ] ) . toFixed ( 3 ) ;
                        var returnString = d . hitDef + '<br><strong>E value:</strong> ' + prettyEvalue ;
                        if  ( parsedVal [ 2 ] !== undefined )
                        {
                            returnString +=  ' &times; 10<sup>' + parsedVal [ 2 ] + '</sup>' ;
                        }
                        return returnString ;
                    } )
                    . each ( function ( d , i )
                    {
                        //  TODO: Refactor these variable names for better clarity and reduce their count.
                        var h_i = i + 1 ; //  Hit index.
                        var p_hsp = d ;   //  Current hit's HSPs.
                        var p_id = d . hitId ; //  Current hit's ID.
                        var p_count = d . length ; //  Number of HSPs in the current hit.

                        d3 . select ( this )
                        . selectAll ( '.hsp' )
                        . data ( d ) . enter ( )
                        . append ( 'a' ) //  Append an anchor tag for each HSP, enabling click navigation.
                        . each ( function ( _ ,  j )
                        {
                            //  Drawing the HSPs connector line using the same
                            //  color as that of the hit track (determined by E-value).
                            var yHspline = y ( p_id ) + options . barHeight / 2 ;
                            var hsplineColor = d3 . rgb ( gradScale ( p_hsp . hitEvalue ) ,
                                                      gradScale ( p_hsp . hitEvalue ) ,
                                                      gradScale ( p_hsp . hitEvalue ) ) ;

                            //  Check if there's a subsequent HSP to draw a connector to.
                            if  ( j + 1 < p_count )
                            {
                                //  Case 1: HSPs are in increasing order.
                                if  ( p_hsp [ j ] . hspEnd <= p_hsp [ j + 1 ] . hspStart )
                                {
                                    d3 . select ( this . parentNode )
                                    . append ( 'line' )
                                        . attr ( 'x1' ,  x ( p_hsp [ j ] . hspEnd ) )
                                        . attr ( 'y1' ,  yHspline )
                                        . attr ( 'x2' ,  x ( p_hsp [ j + 1 ] . hspStart ) )
                                        . attr ( 'y2' ,  yHspline )
                                        . attr ( 'stroke' ,  hsplineColor ) ;
                                }
                                //  Case 2: HSPs are in decreasing order (e.g., reverse strand alignment).
                                else if  ( p_hsp [ j ] . hspStart > p_hsp [ j + 1 ] . hspEnd )
                                {
                                    d3 . select ( this . parentNode )
                                    . append ( 'line' )
                                        . attr ( 'x1' ,  x ( p_hsp [ j + 1 ] . hspEnd ) )
                                        . attr ( 'y1' ,  yHspline )
                                        . attr ( 'x2' ,  x ( p_hsp [ j ] . hspStart ) )
                                        . attr ( 'y2' ,  yHspline )
                                        . attr ( 'stroke' ,  hsplineColor ) ;
                                }
                            }

                            //  Draw the rectangular hit tracks themselves.
                            d3 . select ( this )
                                . attr ( 'xlink:href' ,  '#' + q_i + '_hit_' + h_i )
                                . append ( 'rect' )
                                    . attr ( 'x' ,  function ( d )
                                    {
                                        return x ( d . hspStart ) ;
                                    } )
                                    . attr ( 'y' ,  y ( p_id ) )
                                    . attr ( 'width' ,  function ( d )
                                    {
                                        return x ( d . hspEnd - d . hspStart + 1 ) ;
                                    } )
                                    . attr ( 'height' ,  options . barHeight )
                                    . attr ( 'fill' ,  d3 . rgb ( hsplineColor ) ) ;
                        } ) ;
                    } ) ;

            //  Draw the legend only if there's more than one hit to justify it.
            if  ( hits . length > 1 )
            {
                drawLegend ( svg ,  options ,  width ,  height ) ;
            }
            //  Bind listener events once all the graphical elements have
            //  been drawn for the first time (initial graph rendering).
            if  ( index === 0 )
            {
                graphControls ( $queryDiv ,  $graphDiv ,  true ) ;
                //  Set up responsiveness to redraw the SVG on a browser window resize event.
                setupResponsiveness ( $queryDiv ,  $graphDiv ,  index ,  opts ) ;
            }
            //  Refresh tooltips each time the graph is redrawn or updated.
            setupTooltip ( ) ;
            //  Ensure clicking on 'rect' elements correctly navigates the user
            //  to the relevant hit section across all supported browsers.
            setupClick ( $graphDiv ) ;
        }
    } ) ;
} ( jQuery ) ) ; //  Pass jQuery object to the anonymous function.