/*
 ***************************************************************************************************
 *  glDatePicker v2.0 - A Flexible jQuery Date Picker Plugin
 *  Project Homepage: http://glad.github.com/glDatePicker/
 *
 *  Copyright (c) 2013 Gautam Lad. All rights reserved.
 *  This software is distributed under the MIT License.
 *
 *  Last Updated: Wednesday, March 15, 2023
 ***************************************************************************************************
*/
;( function( ) {


    // Extend jQuery's prototype with our glDatePicker plugin.
    $.fn.glDatePicker = function( options ) {


        // Define the plugin's name as a constant string.
        var pluginName = 'glDatePicker';


        // Attempt to retrieve an existing instance of the plugin from the element's data.
        var instance   = this.data( pluginName );


        // If no instance is found on the current element, proceed to create a new one.
        if ( ! instance ) {


            // For each selected element, create a new glDatePicker instance and attach it.
            return this.each( function( ) {
                return $( this ).data( pluginName , new glDatePicker( this , options ) ) ;
            } ) ;

        }


        // If an instance already exists, check the 'options' parameter.
        // If 'options' is strictly true, return the plugin instance itself.
        // Otherwise, return the jQuery element for chaining.
        return ( options === true ) ? instance : this ;

    } ;


    // Define default configuration options for the glDatePicker plugin.
    // These defaults can be overridden by user-provided options during initialization.
    $.fn.glDatePicker.defaults =
    {
        // The base CSS class name for the calendar. This string is prefixed with "gldp-"
        // to form the full class name for styling (e.g., "gldp-default").
        cssName         : 'default' ,

        // The CSS z-index property value for the calendar control,
        // determining its stacking order relative to other elements.
        zIndex          : 1000 ,

        // The thickness of the border (in pixels) around calendar elements.
        borderSize      : 1 ,

        // An object specifying the pixel offset for positioning the calendar
        // relative to its target input element.
        calendarOffset  : { x : 0 , y : 1 } ,

        // A boolean flag: if true, the calendar will always be visible.
        // Note: If the target element is hidden, the calendar will also be hidden.
        showAlways      : false ,

        // A boolean flag: if true, the calendar will automatically hide
        // when a date is selected (only applies if `showAlways` is false).
        hideOnClick     : true ,

        // A boolean flag: enables or disables the ability to select months
        // by clicking on the month name in the calendar's title bar.
        allowMonthSelect : true ,

        // A boolean flag: enables or disables the ability to select years
        // by clicking on the year in the calendar's title bar.
        allowYearSelect : true ,

        // The date object representing 'today'. By default, it's the current date.
        todayDate       : new Date( ) ,

        // The date that will be pre-selected when the calendar first renders.
        // If null, it defaults to `todayDate`.
        selectedDate    : null ,

        // Unicode characters for the 'Previous' and 'Next' month navigation arrows.
        // Set to empty strings (e.g., `''`) to hide the arrows completely.
        prevArrow       : '\u25c4' ,
        nextArrow       : '\u25ba' ,

        // An array of specific dates that users are allowed to select.
        // Each date can optionally include `repeatYear` or `repeatMonth` flags
        // to make the selection repeatable across years or months.
        // Example structure:
        //    selectableDates: [
        //        { date: new Date(0, 8, 5), repeatYear: true }, // Repeats every year
        //        { date: new Date(2013, 11, 25) }               // One-time selection
        //    ]
        selectableDates : null ,

        // An array defining ranges of dates that are selectable.
        // Each range must specify `from` and can optionally specify `to`.
        // `repeatYear` can be set to true for recurring ranges.
        // Example structure:
        //     selectableDateRange: [
        //         { from: new Date(2013, 1, 1), to: new Date(2013, 2, 1) },
        //         { from: new Date(0, 8, 10), repeatYear: true } // Repeats yearly
        //     ]
        selectableDateRange : null ,

        // An array of dates marked as 'special'. Similar to `selectableDates`,
        // these can repeat yearly/monthly. They can also have custom CSS classes
        // and arbitrary data attached, which is passed to callbacks.
        // Example structure:
        //    specialDates: [
        //        {
        //            date: new Date(0, 8, 5),
        //            data: { message: 'Happy Birthday!' },
        //            repeatYear: true,
        //            cssClass: 'special-bday'
        //        }
        //    ]
        specialDates : null ,

        // An array of month indices (0-11) that are selectable.
        // If provided, only these months will be available in month selection dropdowns.
        // Example: `[8, 11]` for September and December.
        selectableMonths : null ,

        // An array of specific years that are selectable.
        // If not provided, a default range (5 years back/forward from today) is used.
        // Example: `[2012, 2013, 2015]`
        selectableYears : null ,

        // An array of day-of-week indices (0=Sunday, 1=Monday, etc.) that are selectable.
        // Example: `[0, 2, 4]` for Sunday, Tuesday, Thursday.
        selectableDOW : null ,

        // An array of strings for month names to be displayed in the calendar title.
        // Defaults to long-form English names if not specified.
        monthNames : null ,

        // An array of strings for day-of-week names to be displayed.
        // Defaults to short-form English names if not specified.
        dowNames : null ,

        // The starting day of the week for the calendar grid (0=Sunday, 1=Monday, etc.).
        dowOffset : 0 ,

        // Callback function triggered when a selectable date is clicked.
        // Parameters: `el` (input element), `cell` (clicked cell),
        // `date` (associated Date object), `data` (special data, if any).
        onClick : ( function( el , cell , date , data ) {
            // Default behavior: update the input element's value with the selected date.
            el.val( date.toLocaleDateString( ) ) ;
        } ) ,

        // Callback function triggered when the user hovers over a selectable date.
        // Receives the same parameters as the `onClick` callback.
        onHover : function( el , cell , date , data ) { /* No default action */ } ,

        // Callback function triggered when the calendar needs to become visible.
        // Useful for custom animations. By default, simply calls `calendar.show()`.
        onShow : function( calendar ) { calendar.show( ) ; } ,

        // Callback function triggered when the calendar needs to be hidden.
        // Useful for custom animations. By default, simply calls `calendar.hide()`.
        onHide : function( calendar ) { calendar.hide( ) ; } ,

        // The Date object representing the first date of the month currently displayed.
        // This property is managed internally.
        firstDate : null
    } ;


    // The main plugin object constructor. This function encapsulates all
    // the logic and state for a single glDatePicker instance.
    var glDatePicker = ( function( ) {


        // glDatePicker constructor function.
        // Initializes a new date picker instance for a given HTML element.
        function glDatePicker( element , userOptions ) {

            // Capture a reference to the current instance for use within closures.
            var self = this ;


            // Store the jQuery-wrapped target element.
            self.el = $( element ) ;
            var el = self.el ; // Create a local alias for convenience.


            // Merge user-provided options with the plugin's default options.
            // `true` enables deep merging for nested objects.
            self.options = $.extend( true , { } , $.fn.glDatePicker.defaults , userOptions ) ;
            var options = self.options ; // Create a local alias for convenience.


            // Attempt to find an existing calendar element associated with this input
            // by looking for a 'gldp-el' attribute matching the input's 'gldp-id'.
            self.calendar = $( $.find( '[gldp-el=' + el.attr( 'gldp-id' ) + ' ]' ) ) ;


            // Ensure a selectedDate is set; if not provided, default to todayDate.
            options.selectedDate = options.selectedDate || options.todayDate ;

            // Initialize `firstDate` to the first day of the month of either
            // the provided `firstDate` option or the `selectedDate`.
            options.firstDate = ( new Date( ( options.firstDate || options.selectedDate ) ) )._first( ) ;


            // If the element doesn't have a 'gldp-id' attribute, generate a unique one.
            if ( ! ( el.attr( 'gldp-id' ) || '' ).length ) {
                el.attr( 'gldp-id' , 'gldp-' + Math.round( Math.random( ) * 1e10 ) ) ;
            }


            // Add the 'gldp-el' class to the target element for styling.
            // Bind 'click' and 'focus' events to show the calendar.
            el
                .addClass( 'gldp-el' )
                .bind( 'click' , function( e ) {
                    self.show( e ) ;
                } )
                .bind( 'focus' , function( e ) {
                    self.show( e ) ;
                } ) ;


            // If a custom calendar container was provided and `showAlways` is false,
            // ensure it's hidden initially. The `render` function will manage its visibility.
            if ( self.calendar.length && ! options.showAlways ) {
                self.calendar.hide( ) ;
            }


            // Attach a global mouseup event handler to hide the calendar
            // if the click occurs outside the input and the calendar itself.
            $( document ).bind( 'mouseup' , function( e ) {

                var target = e.target ;      // The element that was clicked.
                var calendar = self.calendar ; // Reference to the calendar element.


                // Check if the click target is not the input, not the calendar,
                // not inside the calendar, and if the calendar is currently visible.
                if ( ! el.is( target ) && ! calendar.is( target ) && calendar.has( target ).length === 0 && calendar.is( ':visible' ) ) {
                    self.hide( ) ; // Hide the calendar.
                }

            } ) ;


            // Perform the initial rendering of the calendar.
            self.render( ) ;

        } ;


        // Define public methods for the glDatePicker plugin prototype.
        glDatePicker.prototype =
        {
            /**
             * Displays the calendar.
             * Hides any other active glDatePicker instances before showing this one.
             * Utilizes the `onShow` callback defined in options.
             */
            show : function( ) {

                // Iterate through all other glDatePicker instances and hide them.
                $.each( $( '.gldp-el' ).not( this.el ) , function( i , o ) {
                    // Check if the instance 'o' exists and has an 'options' property.
                    if ( o.length ) {
                        o.options.onHide( o.calendar ) ;
                    }
                } ) ;


                // Call the `onShow` callback for the current calendar instance.
                this.options.onShow( this.calendar ) ;
            } ,


            /**
             * Hides the calendar.
             * This action is skipped if `showAlways` option is true.
             * Utilizes the `onHide` callback defined in options.
             */
            hide : function( ) {

                // Only hide if the calendar is not set to `showAlways`.
                if ( this.options && ! this.options.showAlways ) {
                    this.options.onHide( this.calendar ) ;
                }

            } ,


            /**
             * Renders or re-renders the calendar UI based on current options and state.
             * @param {function} renderCalback - An optional callback to execute after rendering.
             */
            render : function( renderCalback ) {

                var self        = this ; // Reference to the current glDatePicker instance.
                var el          = self.el ; // The target input element.
                var options     = self.options ; // Current configuration options.
                var calendar    = self.calendar ; // The calendar DOM element.


                // Define a common core class string with a border for various elements.
                var coreClass   = ' core border ' ;
                // Construct the full CSS class name based on the `cssName` option.
                var cssName     = 'gldp-' + options.cssName ;


                // Get the value object for today's date using a custom helper (`_val`).
                var todayVal    = options.todayDate._val( ) ;
                var todayTime   = todayVal.time ; // Timestamp for today.


                // Define calendar grid constants.
                var maxRow      = 6 ; // Maximum number of rows for days.
                var maxCol      = 7 ; // Maximum number of columns for days (7 days a week).
                // Convert border size option to a pixel string.
                var borderSize  = options.borderSize + 'px' ;


                // Helper function to generate a list of selectable numbers (months, years, DOW).
                // It can filter and sort a user-provided list within a min/max range.
                var getSelectableList = function( min , max , userList ) {

                    // Initialize `resultList` with a default sequential range.
                    var resultList = [ ] ;
                    for ( var i = min ; i <= max ; i++ ) {
                        resultList.push( i ) ;
                    }


                    // If the user provided a custom list, filter it to ensure values
                    // are within the valid range and are unique.
                    if ( userList ) {

                        var newList = [ ] ;
                        $.each( userList , function( i , v ) {
                            if ( v >= min && v <= max && newList._indexOf( v ) < 0 ) {
                                newList.push( v ) ;
                            }
                        } ) ;

                        // If `newList` has valid entries, use it; otherwise, stick to `resultList`.
                        resultList = newList.length ? newList : resultList ;
                    }


                    // Sort the final list numerically before returning.
                    resultList.sort( ) ;

                    return resultList ;
                } ;


                // Determine the selectable months, years, and days of the week based on options.
                var selectableMonths    = getSelectableList( 0  , 11 , options.selectableMonths ) ;
                var selectableYears     = getSelectableList( todayVal.year - 5 , todayVal.year + 5 , options.selectableYears ) ;
                var selectableDOW       = getSelectableList( 0  , 6  , options.selectableDOW ) ;

                // Use user-defined DOW names, or default to short English names.
                var dowNames            = options.dowNames || [ 'Sun' , 'Mon' , 'Tue' , 'Wed' , 'Thu' , 'Fri' , 'Sat' ] ;
                // Use user-defined month names, or default to long English names.
                var monthNames          = options.monthNames || [ 'January' , 'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , 'November' , 'December' ] ;


                // Calculate initial container width based on the input element's width.
                var containerWidth      = el.outerWidth( ) ;
                var containerHeight     = containerWidth ; // Assume square calendar initially.


                // Helper function to calculate individual cell dimensions.
                var getCellSize = function( _size , _count ) {
                    // Adjust for border size to ensure consistent total width/height.
                    return ( _size / _count ) + ( ( options.borderSize / _count ) * ( _count - 1 ) ) ;
                } ;

                // Calculate cell width and height based on container dimensions and grid.
                var cellWidth           = getCellSize( containerWidth , maxCol ) ;
                var cellHeight          = getCellSize( containerHeight , maxRow + 2 ) ; // +2 for title/DOW rows.


                // If the calendar element doesn't exist yet, create it.
                if ( ! calendar.length ) {

                    self.calendar = calendar = $( '<div/>' )
                        .attr( 'gldp-el' , el.attr( 'gldp-id' ) ) // Link to the input element.
                        .data( 'is' , true ) // Mark as a glDatePicker calendar.
                        .css(
                        {
                            display : ( options.showAlways ? undefined : 'none' ) , // Initial visibility.
                            zIndex  : options.zIndex , // Set stacking order.
                            width   : ( cellWidth * maxCol ) + 'px' // Total calendar width.
                        } ) ;

                    // Append the newly created calendar to the document body.
                    $( 'body' ).append( calendar ) ;

                }
                else {
                    // If the calendar already exists, and it's not a newly created one,
                    // recalculate cell sizes based on its current dimensions.
                    if ( ! eval( calendar.data( 'is' ) ) ) { // 'is' data property is used to check if it's a new instance or pre-existing
                        containerWidth  = calendar.outerWidth( ) ;
                        containerHeight = calendar.outerHeight( ) ;

                        cellWidth       = getCellSize( containerWidth , maxCol ) ;
                        cellHeight      = getCellSize( containerHeight , maxRow + 2 ) ;
                    }
                }


                // If the target input element is not visible, hide the calendar.
                if ( ! el.is( ':visible' ) ) {
                    calendar.hide( ) ;
                }


                // Clear existing classes and content, then add the new CSS class.
                calendar
                    .removeClass( )
                    .addClass( cssName )
                    .children( ).remove( ) ;


                // Define a function to position the calendar relative to the input element.
                var onResize = function( ) {

                    var elPos = el.offset( ) ; // Get the input element's position.
                    calendar.css(
                    {
                        top     : ( elPos.top + el.outerHeight( ) + options.calendarOffset.y ) + 'px' ,
                        left    : ( elPos.left + options.calendarOffset.x ) + 'px'
                    } ) ;
                } ;

                // Bind the positioning function to the window's resize event.
                $( window ).resize( onResize ) ;
                // Call it immediately to set initial position.
                onResize( ) ;


                // Define common CSS properties for calendar cells.
                var cellCSS =
                {
                    width       : cellWidth + 'px' ,
                    height      : cellHeight + 'px' ,
                    lineHeight  : cellHeight + 'px'
                } ;


                // Helper function to update the first displayed date and re-render the calendar.
                var setFirstDate = function( _date ) {

                    if ( _date ) {
                        options.firstDate = _date ; // Update the stored first date.
                        self.render( ) ; // Re-render the calendar.
                    }

                } ;


                // Helper function to get the first valid date for a given month offset.
                var getFirstDate = function( _offset ) {

                    // Start with the current `firstDate` option.
                    var _date = new Date( options.firstDate ) ;

                    // Default offset to 0 if not provided.
                    _offset = _offset || 0 ;


                    // Loop to find a selectable month/year, especially for navigation.
                    while ( true ) {

                        // Adjust the month by the given offset.
                        _date.setMonth( _date.getMonth( ) + _offset ) ;
                        // Ensure the day is 1 (first day of the month), clamped by max days in month.
                        _date.setDate( Math.min( 1 , _date._max( ) ) ) ;


                        // If no offset, we're done with the initial date.
                        if ( _offset == 0 ) {
                            break ;
                        }


                        // Get date components for validation.
                        var dateVal     = _date._val( ) ;
                        var dateMonth   = dateVal.month ;
                        var dateYear    = dateVal.year ;


                        // Check if the month is in the `selectableMonths` list.
                        if ( selectableMonths._indexOf( dateMonth ) != -1 ) {

                            // If the year is also selectable, this is a valid date.
                            if ( selectableYears._indexOf( dateYear ) != -1 ) {
                                break ; // Found a valid date, exit loop.
                            }
                            else {
                                // If the year is outside the range of selectable years,
                                // there's no valid date in this direction.
                                if ( dateYear < selectableYears[ 0 ] || dateYear > selectableYears[ selectableYears.length - 1 ] ) {
                                    return null ; // Indicate no valid date found.
                                }
                            }
                        }
                    }

                    return _date ; // Return the determined first date.
                } ;


                // Calculate the first dates for the previous and next months,
                // considering selectable constraints.
                var prevFirstDate   = getFirstDate( -1 ) ;
                var nextFirstDate   = getFirstDate( 1 ) ;


                // Get the actual `firstDate` for the current month being rendered.
                var firstDate       = ( options.firstDate = getFirstDate( ) ) ;
                var firstDateVal    = firstDate._val( ) ;
                var firstDateMonth  = firstDateVal.month ;
                var firstDateYear   = firstDateVal.year ;


                // Determine the calendar's start date (which might be in the previous month)
                // based on `dowOffset`.
                var startDate       = new Date( firstDate ) ;


                // Sanitize the `dowOffset` option to be between 0 and 6.
                var dowOffset       = Math.abs( Math.min( 6 , Math.max( 0 , options.dowOffset ) ) ) ;


                // Calculate the offset for the first day of the week.
                var startOffset     = startDate.getDay( ) - dowOffset ;
                // Adjust `startOffset` to ensure it's a negative value representing days
                // to subtract to get to the first displayed day.
                    startOffset     = startOffset < 1 ? -7 - startOffset : -startOffset ;
                // Reorder `dowNames` based on `dowOffset` to start with the correct day.
                    dowNames        = ( dowNames.concat( dowNames ) )
                                .slice( dowOffset , dowOffset + 7 ) ;


                // Adjust the `startDate` by the calculated `startOffset`.
                startDate._add( startOffset ) ;


                // Determine if 'Previous' and 'Next' arrows should be active.
                var showPrev        = ( prevFirstDate ) ;
                var showNext        = ( nextFirstDate ) ;


                // Define a common class for month/year navigation elements.
                var monyearClass    = coreClass + 'monyear ' ;


                // Create the 'Previous Month' navigation cell.
                var prevCell        = $( '<div/>' )
                                .addClass( monyearClass )
                                .css(
                                    $.extend( { } , cellCSS ,
                                    {
                                        borderWidth : borderSize + ' 0 0 ' + borderSize // Custom border for top-left.
                                    } )
                                )
                                .append(
                                    $( '<a/>' )
                                        .addClass( 'prev-arrow' + ( showPrev ? '' : '-off' ) ) // Add '-off' class if not active.
                                        .html( options.prevArrow ) // Set arrow character.
                                )
                                .mousedown( function( ) { return false ; } ) // Prevent text selection on click.
                                .click( function( e ) {
                                    // Only navigate if the arrow is active and not blank.
                                    if ( options.prevArrow != '' && showPrev ) {
                                        e.stopPropagation( ) ; // Prevent event bubbling.
                                        setFirstDate( prevFirstDate ) ; // Navigate to the previous month.
                                    }
                                } ) ;


                // Calculate the number of columns for the title section.
                var titleCellCount  = maxCol - 2 ;
                // Calculate the width of the title cell, accounting for borders.
                var titleWidth      = ( cellWidth * titleCellCount ) - ( titleCellCount * options.borderSize ) + ( options.borderSize ) ;
                // Create the central title cell (Month Year display).
                var titleCell       = $( '<div/>' )
                                .addClass( monyearClass + 'title' )
                                .css(
                                    $.extend( { } , cellCSS ,
                                    {
                                        width           : titleWidth + 'px' ,
                                        borderTopWidth  : borderSize ,
                                        marginLeft      : '-' + ( borderSize ) // Overlap border with previous cell.
                                    } )
                                ) ;


                // Create the 'Next Month' navigation cell.
                var nextCell        = $( '<div/>' )
                                .addClass( monyearClass )
                                .css(
                                    $.extend( { } , cellCSS ,
                                    {
                                        marginLeft  : '-' + ( borderSize ) , // Overlap border with title cell.
                                        borderWidth : borderSize + ' ' + borderSize + ' 0 0' // Custom border for top-right.
                                    } )
                                )
                                .append(