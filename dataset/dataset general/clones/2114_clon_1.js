jQuery ( window ).on ( "load resize", function( e ) {

    /*
     * This function initializes and manages an Isotope layout.
     * It dynamically calculates column widths based on the window size
     * and applies specific dimensions to different item types.
     */
    var $container = $( '.isotope' ),

        // Function to determine the optimal column width for the Isotope layout
        colWidth = function ( ) {
            var w = $container.width ( ) ,
                columnNum = 1 , // Default to a single column
                columnWidth = 0 ;

            // Select the number of columns for the layout based on container width
            // This is a responsive logic to adjust the grid dynamically
            if      ( w > 1040 ) { columnNum = 6 ; }
            else if ( w > 850 )  { columnNum = 5 ; }
            else if ( w > 768 )  { columnNum = 4 ; }
            else if ( w > 480 )  { columnNum = 3 ; }
            else if ( w > 300 )  { columnNum = 2 ; }

            // Calculate the base column width, ensuring it's an integer
            columnWidth = Math.floor ( w / columnNum ) ;

            // --- Apply calculated dimensions to different item types ---

            // Default items: 1x width, 1x height
            $container.find ( '.item' ).each ( function ( ) {
                var $item   = $( this ) ,
                    width   = columnWidth ,
                    height  = columnWidth ;
                $item.css ( {
                    width:  width ,
                    height: height
                } ) ;
            } ) ;


            // Items with class 'width2': 2x width, 1x height
            $container.find ( '.width2' ).each ( function ( ) {
                var $item   = $( this ) ,
                    width   = columnWidth * 2 ,
                    height  = columnWidth ;
                $item.css ( {
                    width:  width ,
                    height: height
                } ) ;
            } ) ;


            // Items with class 'height2': 1x width, 2x height
            $container.find ( '.height2' ).each ( function ( ) {
                var $item   = $( this ) ,
                    width   = columnWidth ,
                    height  = columnWidth * 2 ;
                $item.css ( {
                    width:  width ,
                    height: height
                } ) ;
            } ) ;


            // Items with classes 'width2' and 'height2': 2x width, 2x height
            $container.find ( '.width2.height2' ).each ( function ( ) {
                var $item   = $( this ) ,
                    width   = columnWidth * 2 ,
                    height  = columnWidth * 2 ;
                $item.css ( {
                    width:  width ,
                    height: height
                } ) ;
            } ) ;

            // Return the calculated column width for Isotope configuration
            return columnWidth ;
        } , // End of colWidth function definition

        // Function to initialize or re-layout the Isotope grid
        isotope = function ( ) {
            $container.isotope ( {
                resizable:      true ,          // Allow Isotope to resize items
                itemSelector:   '.item' ,       // Selector for the grid items
                masonry: {
                    columnWidth:    colWidth ( ) ,  // Dynamically calculated column width
                    gutterWidth:    10              // Spacing between items
                }
            } ) ;
        } ; // End of isotope function definition

    // Initial call to set up the Isotope layout
    isotope ( ) ;


    // --- Event Handlers for Filtering and Active State ---

    // Bind click events to filter buttons within the '.isotope-filters' group
    $( '.isotope-filters' ).on ( 'click', 'button', function ( ) {
        var filterValue = $( this ).attr ( 'data-filter' ) ; // Get the filter value from data-filter attribute
        $container.isotope ( { filter: filterValue } ) ;     // Apply the filter to the Isotope container
    } ) ;


    // Manage the active class for filter buttons
    $( '.isotope-filters' ).each ( function ( i, buttonGroup ) {
        var $buttonGroup = $( buttonGroup ) ; // Cache the current button group

        // On click of any button within this group
        $buttonGroup.on ( 'click', 'button', function ( ) {
            $buttonGroup.find ( '.active' ).removeClass ( 'active' ) ; // Remove 'active' from previously active button
            $( this ).addClass ( 'active' ) ;                          // Add 'active' class to the clicked button
        } ) ;
    } ) ;

} ) ; // End of jQuery(window).on("load resize" ... )