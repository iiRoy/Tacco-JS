// This script ensures the Document Object Model is fully loaded before executing interactive JavaScript functionality.
jQuery ( 'document' ) . ready (
    function (
    ) {

        // Initialize the first collection of elements to be draggable in groups.
        jQuery ( ".primarySet" ) . groupedMover ( {
            linkedSet : jQuery ( ".primarySet" ),
            initiateMovement : function ( ) { /* This function can be extended to handle custom native drag actions. */ }
        } );

        // Set up a second, distinct assortment of components for similar grouped movement capabilities.
        jQuery ( ".secondarySet" ) . groupedMover ( {
            linkedSet : jQuery ( ".secondarySet" ),
            initiateMovement : function (
            ) {
                // Currently, no specific logic is required for the start of the drag operation.
            }
        } );

    }
);