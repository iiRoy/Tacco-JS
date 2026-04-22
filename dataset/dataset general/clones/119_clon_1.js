var fsm = angular . module ( 'fsm' , [ ] ) ; // Initializing the main Angular module for FSM components


fsm . directive ( 'fsmStickyHeader' , function ( )
{
    /*
     * This directive implements a sticky header functionality.
     * It makes an element stick to the top of the viewport
     * when scrolled past, and allows for a 'scrollStop' offset.
     */
    return {
        restrict: 'EA' , // Can be used as an element or an attribute
        replace: false , // Do not replace the original element
        scope:
        {
            // Two-way data binding for various scroll parameters
            scrollBody: '=' ,
            scrollStop: '=' ,
            scrollableContainer: '='
        } ,
        link: function ( scope , element , attributes , control )
        {
            // Reference to the original header element
            var header = $( element , this ) ;

            // This variable will hold the dynamically created cloned header
            var clonedHeader = null ;

            // The main content area that the sticky header monitors
            var content = $( scope . scrollBody ) ;

            // The container that is actually being scrolled. Defaults to window.
            var scrollableContainer = $( scope . scrollableContainer ) ;


            // If no specific scrollable container is defined, assume the window is the scrollable area
            if ( scrollableContainer . length == 0 )
            {
                scrollableContainer = $( window ) ;
            }


            // This function creates the sticky clone of the header
            function createClone ( )
            {
                /*
                 *   Strategy: The original 'header' reference is temporarily assigned to 'clonedHeader'.
                 *   Then, a *new* clone is created and assigned back to 'header'.
                 *   This ensures that any Angular bindings on the original element remain intact
                 *   while we manipulate the visual representation.
                 */
                clonedHeader = header ;
                header = clonedHeader . clone ( ) ; // Create a deep copy of the original header
                clonedHeader . after ( header ) ; // Insert the newly cloned header immediately after the original
                clonedHeader . addClass ( 'fsm-sticky-header' ) ; // Add a class for specific styling

                // Apply necessary CSS for the sticky behavior
                clonedHeader . css ( {
                    position: 'fixed' ,
                    'z-index': 10000 , // Ensure it's above other content
                    visibility: 'hidden' // Start as hidden until needed
                } ) ;

                // Recalculate its size and position after creation
                calculateSize ( ) ;
            }


            // Determines and sets the size and position of the cloned sticky header
            function calculateSize ( )
            {
                clonedHeader . css ( {
                    top: scope . scrollStop , // Position from the top, considering the scrollStop offset
                    width: header . outerWidth ( ) , // Match the width of the original header
                    left: header . offset ( ) . left // Match the horizontal position of the original header
                } ) ;

                setColumnHeaderSizes ( ) ; // Adjust column widths if it's a table row
            } ;


            // Specifically handles column header sizing for table rows (<tr>)
            function setColumnHeaderSizes ( )
            {
                if ( clonedHeader . is ( 'tr' ) )
                {
                    var clonedColumns = clonedHeader . find ( 'th' ) ; // Find all cloned table headers
                    header . find ( 'th' ) . each ( function ( index , column )
                    {
                        var clonedColumn = $( clonedColumns [ index ] ) ;
                        clonedColumn . css ( 'width' , column . offsetWidth + 'px' ) ; // Set width explicitly
                    } ) ;
                }
            }


            // This is the core logic: determines when the sticky header should be visible or hidden
            function determineVisibility ( )
            {
                // Current scroll position + the user-defined offset
                var scrollTop = scrollableContainer . scrollTop ( ) + scope . scrollStop ;

                // Position of the content area
                var contentTop = content . position ( ) . top ;
                var contentBottom = contentTop + content . outerHeight ( false ) ; // Bottom edge of the content


                // Check if the scroll position is within the bounds of the content area
                if ( ( scrollTop > contentTop ) && ( scrollTop < contentBottom ) )
                {
                    // If the cloned header doesn't exist yet, create it
                    if ( ! clonedHeader )
                    {
                        createClone ( ) ;
                        clonedHeader . css ( { "visibility": "visible" } ) ; // Make it visible once created
                    }

                    // Handle the case where the header is approaching the bottom of the content area
                    if ( scrollTop < contentBottom && scrollTop > contentBottom - clonedHeader . outerHeight ( false ) )
                    {
                        // Calculate a dynamic 'top' position to make it appear to "push" off the bottom
                        var top = contentBottom - scrollTop + scope . scrollStop - clonedHeader . outerHeight ( false ) ;
                        clonedHeader . css ( 'top' , top + 'px' ) ;
                    }
                    else
                    {
                        // Otherwise, just keep it at its fixed position
                        calculateSize ( ) ;
                    }
                }
                else
                {
                    // If outside the content area, hide and remove the cloned header
                    if ( clonedHeader )
                    {
                        /*
                         *   Revert the header back to its original state and position.
                         *   The 'header' variable now points to the original element again.
                         */
                        header . remove ( ) ; // Remove the temporary clone from the DOM
                        header = clonedHeader ; // Restore the original header element
                        clonedHeader = null ; // Clear the reference to the cloned element

                        header . removeClass ( 'fsm-sticky-header' ) ; // Remove sticky class
                        header . css ( {
                            position: 'relative' , // Back to its original positioning
                            left: 0 ,
                            top: 0 ,
                            width: 'auto' ,
                            'z-index': 0 ,
                            visibility: 'visible'
                        } ) ;
                    }
                }
            } ;

            // Attach scroll and resize event listeners to the scrollable container
            scrollableContainer . scroll ( determineVisibility ) . trigger ( "scroll" ) ; // Trigger once on load
            scrollableContainer . resize ( determineVisibility ) ;
        }
    }
} ) ;


fsm . directive ( 'fsmMenuButton' , function ( )
{
    return {
        restrict: 'EA' , // Element or Attribute
        replace: false ,
        scope: { } , // Isolated scope
        link: function ( scope , element , attributes , control )
        {
            var menuButton = $( element , this ) ; // Cache the menu button element

            menuButton . addClass ( 'fsm-menu-button' ) ; // Apply base styling class
            menuButton . click ( menuOnClick ) ; // Attach click handler


            // Handles the click event for the menu button
            function menuOnClick ( )
            {
                $ ( 'body' ) . toggleClass ( 'fsm-menu-toggle' ) ; // Toggle a class on the body for menu visibility
                setMenuSpin ( ) ; // Animate the button icons
                setTimeout ( setMenuSpin , 50 ) ; // Re-animate after a short delay for better effect
            } ;


            // Rotates the menu button icons
            function setMenuSpin ( )
            {
                menuButton . find ( '.fsm-menu-button-open' ) . toggleClass ( 'fsm-spin-forward' ) ;
                menuButton . find ( '.fsm-menu-button-closed' ) . toggleClass ( 'fsm-spin-backward' ) ;
            } ;
        }
    }
} ) ;


fsm . directive ( 'fsmBigData' , function ( $filter )
{
    // This directive is designed to handle large datasets by paginating them
    // and loading more data as the user scrolls.

    return {
        restrict: 'AE' , // Attribute or Element
        scope: { } , // Isolated scope
        replace: false ,
        transclude: true , // Allows the directive to wrap other content
        link: function ( scope , element , attrs , controller , transclude )
        {
            var orderBy = $filter ( 'orderBy' ) ; // Get the orderBy filter service

            var currentPage = 0 ; // Tracks the current page of data being displayed

            // Parse the directive's attribute value to extract variable names and page size
            var pagedDataName = attrs . fsmBigData . split ( ' of ' ) [ 0 ] ; // e.g., 'pagedItems' from 'pagedItems of allItems take 20'
            var rightHandExpression = attrs . fsmBigData . split ( ' of ' ) [ 1 ] ; // e.g., 'allItems take 20'
            var pageSize = parseInt ( rightHandExpression . split ( ' take ' ) [ 1 ] ) ; // e.g., 20
            var sourceData = rightHandExpression . split ( ' take ' ) [ 0 ] ; // e.g., 'allItems'

            // Interesting things can be done here with the source object...
            // var displayGetter = $parse(sourceData);
            // var displaySetter = displayGetter.assign;
            // var results = orderBy(displayGetter(scope.$parent), sortColumns);
            // displaySetter(scope.$parent, results)

            var rawData = [ ] ; // Stores the original, unfiltered data
            var sortedData = [ ] ; // Stores the data after sorting
            var pagedData = [ ] ; // The data currently displayed in the view (paged)

            var page = $ ( window ) ; // Reference to the window for scroll events

            var sortTypes = [ 'None' , 'Ascending' , 'Descending' ] ; // Available sort options
            var sortColumns = [ ] ; // Array to hold current sort definitions (e.g., ['-name', 'age'])

            scope . sortTypes = sortTypes ; // Expose sortTypes to the scope


            // Transclude the content and link it to the isolated scope
            transclude ( scope , function ( clone , transcludedScope )
            {
                element . append ( clone ) ; // Append the transcluded content to the directive's element
                transcludedScope [ pagedDataName ] = pagedData ; // Make the paged data available in the transcluded scope


                // Loads the next page of data into pagedData
                function nextPage ( )
                {
                    var dataSlice = sortedData . slice ( pageSize * currentPage , ( pageSize * ( currentPage + 1 ) ) ) ;
                    if ( dataSlice . length > 0 )
                    {
                        pagedData . push . apply ( pagedData , dataSlice ) ; // Add new items to the pagedData array
                        currentPage ++ ;
                    }
                }


                // Adds or modifies a sort column definition
                function addSortColumn ( columnName , sortType )
                {
                    // If this column is currently in the sort stack, remove it first.
                    for ( var i = 0 ; i < sortColumns . length ; i ++ )
                    {
                        if ( sortColumns [ i ] . indexOf ( columnName ) > -1 )
                        {
                            sortColumns . splice ( i , 1 ) ;
                        }
                    }

                    // Push this new sort definition onto the top of the stack (aka. array)
                    if ( sortType > 0 )
                    {
                        var direction = '' ;
                        if ( sortTypes [ sortType ] === 'Descending' )
                        {
                            direction = '-' ; // Prepend '-' for descending sort
                        }
                        sortColumns . unshift ( direction + columnName ) ;
                    }

                    renderData ( ) ; // Re-render the data after sorting changes
                }


                // Applies sorting and pagination to the raw data
                function renderData ( )
                {
                    if ( sortColumns . length )
                    {
                        sortedData = orderBy ( rawData , sortColumns ) ; // Apply sorting if sort columns exist
                    }
                    else
                    {
                        sortedData = rawData ; // Otherwise, use raw data
                    }

                    pagedData . length = 0 ; // Clear current paged data
                    currentPage = 0 ; // Reset page counter
                    nextPage ( ) ; // Load the first page
                }


                // Event handler for window scroll events to detect when to load more data
                function onPageScroll ( )
                {
                    var s = $ ( window ) . scrollTop ( ) , // Current scroll position from the top
                    d = $ ( document ) . height ( ) , // Total height of the document
                    c = $ ( window ) . height ( ) ; // Height of the viewport
                    scrollPercent = ( s / ( d - c ) ) ; // Calculate scroll percentage

                    if ( scrollPercent > 0.98 )
                    {
                        // We use scope.$apply here to tell angular about these changes because
                        // they happen outside of angularjs context... we're using jquery here
                        // to figure out when we need to load another page of data.
                        transcludedScope . $apply ( nextPage ) ; // Load next page within Angular's digest cycle
                    }
                }

                page . scroll ( onPageScroll ) . trigger ( 'scroll' ) ; // Attach scroll listener and trigger once on load


                // Watch for changes in the source data provided by the parent scope
                scope . $parent . $watchCollection ( sourceData , function ( newData )
                {
                    if ( newData )
                    {
                        rawData = newData ; // Update raw data
                        renderData ( ) ; // Re-render data
                    }
                } ) ;

                scope . addSortColumn = addSortColumn ; // Expose addSortColumn function to the scope
            } ) ;
        }
    }
} ) ;


fsm . directive ( 'fsmSort' , function ( )
{
    // Template for the sort icon
    var sortIconTemplate = '<i class="fa fa-sort"></i>' ;

    return {
        restrict: 'AE' , // Can be used as an attribute or element
        replace: false ,
        scope: { } , // Isolated scope
        link: function ( scope , element , attrs )
        {
            var columnHeader = element ; // The element this directive is on
            var columnName = attrs . fsmSort ; // The name of the column to sort by (from the attribute value)
            var sortIcon = angular . element ( sortIconTemplate ) ; // Create the sort icon element

            columnHeader . append ( '&nbsp;' ) ; // Add a non-breaking space for spacing
            columnHeader . append ( sortIcon ) ; // Append the sort icon to the header

            var currentSortType = 0 ; // 0: None, 1: Ascending, 2: Descending


            // Function to update the sort icon based on the current sort type
            function swapIcons ( )
            {
                sortIcon . removeClass ( 'fa-sort-desc fa-sort-asc fa-sort' ) ; // Remove all possible sort classes

                var classToAdd = 'fa-sort' ; // Default icon (unsorted)

                if ( scope . $parent . sortTypes [ currentSortType ] === 'Ascending' )
                {
                    classToAdd = 'fa-sort-asc' ; // Ascending icon
                }
                else if ( scope . $parent . sortTypes [ currentSortType ] === 'Descending' )
                {
                    classToAdd = 'fa-sort-desc' ; // Descending icon
                }

                sortIcon . addClass ( classToAdd ) ; // Apply the correct icon class
            }


            columnHeader . css ( { cursor: 'pointer' } ) ; // Make the header clickable


            // Attach a click event handler to the column header
            columnHeader . bind ( 'click' , function ( )
            {
                // Cycle through sort types: None -> Ascending -> Descending -> None
                currentSortType ++ ;
                if ( currentSortType == scope . $parent . sortTypes . length )
                {
                    currentSortType = 0 ;
                }

                // Call the addSortColumn function from the parent (fsmBigData) directive's scope
                scope . $apply ( scope . $parent . addSortColumn ( columnName , currentSortType ) ) ;

                swapIcons ( ) ; // Update the visual sort icon
            } ) ;
        }
    }
} ) ;