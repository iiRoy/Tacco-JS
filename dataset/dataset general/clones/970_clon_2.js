( function ( ) {
    // Main function for displaying quick notifications
    $.easyPop = function ( contentData , kindStyle , configParams ) {
        // Merge user-provided settings with default and system options
        configParams = $.extend( true , { } , $.easyPop.presetConfig , configParams ) ;

        // Construct the HTML string for the notification element
        var domString = '<div class="easy-pop notify notify-' + ( kindStyle ? kindStyle : configParams.kindStyle ) + ' ' + ( configParams.extraClass ? configParams.extraClass : '' ) + '">' ;
        if ( configParams.canBeClosed ) {
            domString += '<span class="close-btn" data-action="close">&times;</span>' ; // Add dismiss button if allowed
        }
        domString += contentData ;
        domString += '</div>' ;

        // Calculate the vertical or horizontal offset for positioning
        var cumulativeOffset = configParams.positioning.value ;
        if ( ! configParams.groupAdjacent ) {
            // If not stacking, find the maximum offset from existing notifications
            $( '.easy-pop' ).each ( function ( ) {
                return cumulativeOffset = Math.max ( cumulativeOffset , parseInt ( $( this ).css ( configParams.positioning.origin ) ) + this.offsetHeight + configParams.gapSize ) ;
            } ) ;
        } else {
            // If stacking, find the maximum offset only within the target container
            $( configParams.attachTo ).find ( '.easy-pop' ).each ( function ( ) {
                return cumulativeOffset = Math.max ( cumulativeOffset , parseInt ( $( this ).css ( configParams.positioning.origin ) ) + this.offsetHeight + configParams.gapSize ) ;
            } ) ;
        }

        // Define CSS properties for the new notification box
        var styleProps = {
            'position'  : ( configParams.attachTo === 'body' ? 'fixed' : 'absolute' ) ,
            'margin'    : 0 ,
            'z-index'   : '9999' ,
            'display'   : 'none' ,
            'min-width' : configParams.minimumWidth ,
            'max-width' : configParams.maximumWidth
        } ;

        // Apply the calculated offset to the appropriate CSS property
        styleProps[ configParams.positioning.origin ] = cumulativeOffset + 'px' ;

        // Create the jQuery object, apply styles, and append to the DOM
        var $notification = $( domString ).css ( styleProps )
                                       .appendTo ( configParams.attachTo ) ;

        // Adjust horizontal placement based on configuration
        switch ( configParams.placement ) {
            case "center" :
                $notification.css ( {
                    "left" : "50%" ,
                    "margin-left" : "-" + ( $notification.outerWidth ( ) / 2 ) + "px"
                } ) ;
                break ;
            case "left" :
                $notification.css ( "left" , "20px" ) ;
                break ;
            default : // Default to right alignment
                $notification.css ( "right" , "20px" ) ;
        }
        
        // Show the notification, using fadeIn if available
        if ( $notification.fadeIn ) { $notification.fadeIn ( ) ; }
        else { $notification.css ( { display : 'block' , opacity : 1 } ) ; }
        
        // Internal function to remove the notification from display
        function dismissNotification ( ) {
            $.easyPop.clearDisplay ( $notification ) ;
        }

        // Set a timeout for automatic removal if a duration is specified
        if ( configParams.duration > 0 ) {
            setTimeout ( dismissNotification , configParams.duration ) ;
        }

        // Attach event handler for the close button
        $notification.find ( "[data-action=\"close\"]" ).removeAttr ( 'data-action' ).click ( dismissNotification ) ;

        // Return the jQuery object for the notification
        return $notification ;
    } ;

    // Function to programmatically remove a notification
    $.easyPop.clearDisplay = function ( $notificationBox ) {
        if ( $notificationBox.fadeOut ) {
            // Use fadeOut if available, then remove from DOM
            return $notificationBox.fadeOut ( function ( ) {
                return $notificationBox.remove ( ) ;
            } ) ;
        }
        else {
            // Otherwise, just remove it directly
            return $notificationBox.remove ( ) ;
        }
    } ;

    // Default configuration settings for easyPop
    $.easyPop.presetConfig = {
        attachTo      : "body" ,         // Element to which notifications are appended
        groupAdjacent : false ,          // Whether to stack notifications or position them individually
        extraClass    : false ,          // Additional CSS class for customization
        kindStyle     : "info" ,         // Default notification style (e.g., 'info', 'success', 'warning', 'danger')
        positioning   :                  // Positioning details
        {
            origin : "top" ,             // Side from which to offset (e.g., 'top', 'bottom', 'left', 'right')
            value  : 20                  // Initial offset amount in pixels
        } ,
        placement     : "right" ,        // Horizontal alignment (e.g., 'left', 'center', 'right')
        minimumWidth  : 250 ,            // Minimum width of the notification
        maximumWidth  : 450 ,            // Maximum width of the notification
        duration      : 4000 ,           // Time in milliseconds before auto-dismissal (0 for no auto-dismiss)
        canBeClosed   : true ,           // Allow user to manually dismiss the notification
        gapSize       : 10               // Spacing between stacked notifications
    } ;
} ) ( ) ;