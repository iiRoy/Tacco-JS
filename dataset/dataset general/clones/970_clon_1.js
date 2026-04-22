// This is a self-executing anonymous function to encapsulate the plugin logic.
( function( )
{

    // Define the main simplyToast function as a jQuery plugin method.
    // It takes message, type, and options as parameters.
    $.simplyToast = function( message , type , options )
    {
        // Extend default options with user-provided options, ensuring a deep merge.
        options = $.extend( true , { } , $.simplyToast.defaultOptions , options ) ;

        // Start building the HTML string for the toast notification.
        // It uses Bootstrap's alert classes.
        var html = '<div class="simply-toast alert alert-' +
                   ( type ? type : options.type ) + /* Determine alert type */
                   ' ' +
                   ( options.customClass ? options.customClass : '' ) +
                   '">' ;

        // If allowDismiss option is true, add a close button to the toast.
        if ( options.allowDismiss )
        {
            html += '<span class="close" data-dismiss="alert">&times;</span>' ;
        }

        // Append the actual message content.
        html += message ;
        // Close the main div tag.
        html += '</div>' ;


        // Initialize offset sum based on the configured amount.
        var offsetSum = options.offset.amount ;

        // Check if toasts should stack or if only the highest one should be considered for offset.
        if ( ! options.stack )
        {
            // If not stacking, iterate through all existing simply-toasts.
            // Find the maximum offset to position the new toast below the lowest one.
            $( '.simply-toast' ).each( function( )
            {
                // Calculate current element's position + height + spacing.
                var currentOffset = parseInt( $( this ).css( options.offset.from ) ) + this.offsetHeight + options.spacing ;
                // Update offsetSum if current element's offset is greater.
                return offsetSum = Math.max( offsetSum , currentOffset ) ;
            } ) ;
        }
        else // If stacking is enabled (default behavior for some implementations, but here, it means to position relative to parent).
        {
            // Find simply-toasts within the specified appendTo container.
            $( options.appendTo ).find( '.simply-toast' ).each( function( )
            {
                // Calculate current element's position + height + spacing.
                var currentOffset = parseInt( $( this ).css( options.offset.from ) ) + this.offsetHeight + options.spacing ;
                // Update offsetSum if current element's offset is greater.
                return offsetSum = Math.max( offsetSum , currentOffset ) ;
            } ) ;
        }


        // Define the base CSS properties for the toast notification.
        var css =
        {
            'position'  : ( options.appendTo === 'body' ? 'fixed' : 'absolute' ) , // Use fixed for body, absolute for other containers.
            'margin'    : 0 , // No default margin.
            'z-index'   : '9999' , // Ensure toast appears on top.
            'display'   : 'none' , // Initially hide the toast.
            'min-width' : options.minWidth , // Set minimum width.
            'max-width' : options.maxWidth   // Set maximum width.
        } ;

        // Apply the calculated offset to the appropriate CSS property (e.g., 'top' or 'bottom').
        css[ options.offset.from ] = offsetSum + 'px' ;

        // Create the jQuery object for the toast, apply CSS, and append to the DOM.
        var $alert = $( html )
                        .css( css )
                        .appendTo( options.appendTo ) ;


        // Handle toast alignment based on options.align.
        switch ( options.align )
        {
            case "center" :
                // For center alignment, calculate margin-left to center horizontally.
                $alert.css(
                {
                    "left"        : "50%" ,
                    "margin-left" : "-" + ( $alert.outerWidth( ) / 2 ) + "px"
                } ) ;
                break ;

            case "left" :
                // For left alignment, set left position.
                $alert.css( "left" , "20px" ) ;
                break ;

            default :
                // Default to right alignment.
                $alert.css( "right" , "20px" ) ;
        }

        // Animate the toast's appearance. Use fadeIn if available, otherwise just show.
        if ( $alert.fadeIn )
        {
            $alert.fadeIn( ) ;
        }
        else
        {
            $alert.css( { display : 'block' , opacity : 1 } ) ;
        }


        // Define a nested function to remove the alert.
        function removeAlert( )
        {
            $.simplyToast.remove( $alert ) ;
        }


        // If a delay is specified, set a timeout to automatically remove the toast.
        if ( options.delay > 0 )
        {
            setTimeout( removeAlert , options.delay ) ;
        }

        // Attach event listener to the dismiss button.
        // Remove data-dismiss attribute to prevent default Bootstrap behavior.
        $alert.find( "[data-dismiss=\"alert\"]" )
              .removeAttr( 'data-dismiss' )
              .click( removeAlert ) ;

        // Return the jQuery object of the created toast.
        return $alert ;
    } ;


    // Define a static method for simplyToast to programmatically remove an alert.
    $.simplyToast.remove = function( $alert )
    {
        // If fadeOut animation is available, use it before removing.
        if ( $alert.fadeOut )
        {
            return $alert.fadeOut( function( )
            {
                // Callback after fadeOut completes: remove the element from DOM.
                return $alert.remove( ) ;
            } ) ;
        }
        else // If fadeOut is not available, just remove the element immediately.
        {
            return $alert.remove( ) ;
        }
    } ;


    // Define default options for simplyToast.
    $.simplyToast.defaultOptions = {
        appendTo     : "body" ,       // Element to append the toast to.
        stack        : false ,        // Whether toasts should stack or overlap.
        customClass  : false ,        // Custom CSS class to add to the toast.
        type         : "info" ,       // Default alert type (e.g., 'info', 'success', 'warning', 'danger').
        offset       :                // Offset configuration.
        {
            from   : "top" ,          // Side from which to offset (e.g., 'top', 'bottom').
            amount : 20               // Initial offset amount in pixels.
        } ,
        align        : "right" ,      // Alignment of the toast (e.g., 'left', 'center', 'right').
        minWidth     : 250 ,          // Minimum width of the toast.
        maxWidth     : 450 ,          // Maximum width of the toast.
        delay        : 4000 ,         // Delay in milliseconds before auto-removing the toast.
        allowDismiss : true ,         // Whether to show a close button.
        spacing      : 10             // Spacing between stacked toasts.
    } ;

} ) ( ) ; // Execute the anonymous function.