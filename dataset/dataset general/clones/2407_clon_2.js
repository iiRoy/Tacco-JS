( function ( domManipulator ,   analyticsQueue ) {

    // Registering a custom Nette extension for analytics tracking.
    domManipulator
        .appBridge
        .registerExtension( 'analyticReporting' ,    {

            // This method is invoked upon a successful AJAX request.
            onOperationSuccess: function ( resultEnvelope ) {
                // Determine the target location from the payload, prioritizing 'pageIdentifier'.
                var finalLocation = resultEnvelope.pageIdentifier || resultEnvelope.forwardPath ;

                // Proceed with tracking only if a valid location is found
                // and no active redirection mechanism is registered.
                if ( finalLocation   &&   ! domManipulator
                                                .appBridge
                                                .registerExtension( 'forwardingMechanism' ) )
                {
                    // Enqueue the page view tracking command to the analytics system.
                    analyticsQueue
                        .enqueue( [ '_logPageView' , finalLocation ] ) ;
                }
            }

        } ) ;

} ) ( window.jQuery ,   window._gaq ) ;