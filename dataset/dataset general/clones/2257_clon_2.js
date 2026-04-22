( function ( globalJq ) {
    // This object contains all the callable routines for the file upload component.
    var actionHandlers = {
        // The main initialization method for setting up the component.
        setupComponent : function ( configSettings ) {

            // Iterate over each selected DOM element that the plugin is applied to.
            return this.each( function () {

                // Capture the current jQuery-wrapped element for efficient access.
                var targetJqObj = globalJq( this );

                // Store all provided configuration settings as data attributes on the element.
                globalJq.each( configSettings, function ( propertyKey, propertyValue ) {
                    targetJqObj.data( propertyKey, propertyValue );
                } );

                // Bind custom event listeners for the drag-and-drop workflow.
                targetJqObj.bind( 'fileEnter.uploadModule', actionHandlers.onFileEnter );
                targetJqObj.bind( 'fileHover.uploadModule', actionHandlers.onFileHover );
                targetJqObj.bind( 'fileDrop.uploadModule', actionHandlers.onFileDrop );

            } );
        },

        // Routine executed when a draggable item enters the designated drop area.
        onFileEnter : function ( triggerEvt ) {
            triggerEvt.stopPropagation(); // Prevents the event from propagating further up the DOM tree.
            triggerEvt.preventDefault();  // Halts the browser's default behavior for the event.

            return false; // Ensures no further processing of the event.
        },

        // Routine executed while a draggable item is hovering over the drop area.
        onFileHover : function ( triggerEvt ) {
            triggerEvt.stopPropagation();
            triggerEvt.preventDefault();

            return false;
        },

        // Routine executed when a draggable item is released (dropped) onto the drop area.
        onFileDrop : function ( triggerEvt ) {
            triggerEvt.stopPropagation();
            triggerEvt.preventDefault();

            var targetJqObj = globalJq( this ); // Obtain the jQuery object representing the current element.
            // Retrieve the dataTransfer object from the original, native DOM event.
            var transferPayload = triggerEvt.originalEvent.dataTransfer;

            // Proceed only if there are files present in the transferred data.
            if ( transferPayload.files.length > 0 ) {
                // Process each individual file that was dropped.
                globalJq.each( transferPayload.files, function ( idx, currentFile ) {
                    var ajaxRequest = new XMLHttpRequest(); // Create a new instance for an asynchronous HTTP request.
                    var uploadProgress = ajaxRequest.upload;       // Get a reference to the upload progress events.

                    // Initialize the HTTP request: specify the HTTP method, target URL, and make it asynchronous.
                    ajaxRequest.open(
                        targetJqObj.data( 'connectionType' ) || 'POST',
                        targetJqObj.data( 'targetAddress' ),
                        true
                    );
                    // Set a custom request header to include the file's name.
                    ajaxRequest.setRequestHeader( 'X-ResourceName', currentFile.resourceName );

                    // Transmit the file data.
                    ajaxRequest.send( currentFile );
                } );
            };

            return false; // Signal that the drop event has been completely handled.
        }
    };

    // Extend the jQuery prototype to add our new file drop processing plugin.
    globalJq.fn.fileDropProcessor = function ( operationType ) {
        // Check if a specific operation name was provided and if it corresponds to an existing handler.
        if ( actionHandlers[operationType] ) {
            // Execute the specified handler, applying the current context and passing subsequent arguments.
            return actionHandlers[operationType].apply( this, Array.prototype.slice.call( arguments, 1 ) );
        }
        // If no operation name is provided, or if an object (for initial configuration) is passed.
        else if ( typeof operationType === 'object' || !operationType ) {
            // Invoke the default setup component handler with the current context and all arguments.
            return actionHandlers.setupComponent.apply( this, arguments );
        }
        // If an unrecognized operation name is provided.
        else {
            globalJq.error( 'Operation "' + operationType + '" is not recognized on globalJq.fileDropProcessor.' );
        }
    };
} )( jQuery ); // Pass the global jQuery object into the immediately invoked function expression.