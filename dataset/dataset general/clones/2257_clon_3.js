(function( jQueryAlias ) {

  // A collection of internal routines for managing file drag and drop uploads.
  // This module provides functionality to make any DOM element a drop target.
  const handlerCollection = {

    /**
     * Initializes the drop target functionality on selected elements.
     * @param {object} initialConfiguration - An object containing setup parameters.
     * @returns {jQueryAlias} The jQuery object to allow chaining.
     */
    initializeDropTarget : function( initialConfiguration ) {

      return this.each( function () { // Iterate over each matched DOM element.

        const currentDropZone = jQueryAlias(this); // Cache the current element as a jQuery object.

        // Apply configuration settings to the element's data attributes.
        // This makes settings accessible during event handling.
        for (const configKey in initialConfiguration) {
          if (Object.prototype.hasOwnProperty.call(initialConfiguration, configKey)) {
            currentDropZone.data(configKey, initialConfiguration[configKey]);
          }
        }

        // Attach necessary event listeners for drag-and-drop operations.
        // Using jQuery's .on() for event delegation and namespacing.
        currentDropZone.on('dragenter.fileTransfer', handlerCollection.handleDragEntry);
        currentDropZone.on('dragover.fileTransfer', handlerCollection.handleDragHover);
        currentDropZone.on('drop.fileTransfer', handlerCollection.handleFileDrop);

        // Optional: Add a visual class to indicate it's a drop zone.
        currentDropZone.addClass('is-drop-target');

      });
    },

    /**
     * Handles the 'dragenter' event. Prevents default browser behavior.
     * @param {jQuery.Event} dragEntryEvent - The jQuery event object.
     */
    handleDragEntry : function ( dragEntryEvent ) {
      // Stop event propagation to parent elements.
      dragEntryEvent.stopPropagation();
      // Prevent the browser's default handling (e.g., opening the file).
      dragEntryEvent.preventDefault();
    },

    /**
     * Handles the 'dragover' event. Prevents default browser behavior.
     * @param {jQuery.Event} dragHoverEvent - The jQuery event object.
     */
    handleDragHover : function ( dragHoverEvent ) {
      // Stop event propagation.
      dragHoverEvent.stopPropagation();
      // Prevent default browser behavior (e.g., showing a disabled cursor).
      dragHoverEvent.preventDefault();
    },

    /**
     * Handles the 'drop' event, processing dropped files for upload.
     * @param {jQuery.Event} dropEvent - The jQuery event object.
     */
    handleFileDrop : function( dropEvent ) {
      // Ensure the event doesn't bubble up and default actions are prevented.
      dropEvent.stopPropagation();
      dropEvent.preventDefault();

      const currentDropTarget = jQueryAlias(this); // Reference to the element where files were dropped.
      const originalBrowserEvent = dropEvent.originalEvent;

      // Validate the presence of the dataTransfer object.
      if (!originalBrowserEvent || !originalBrowserEvent.dataTransfer) {
        console.warn("Drag and drop operation failed: dataTransfer object not found.");
        return; // Exit if no data transfer mechanism is available.
      }

      const transferDataContainer = originalBrowserEvent.dataTransfer;
      const transferredFiles = transferDataContainer.files;

      // Proceed only if files were actually dropped.
      if (transferredFiles && transferredFiles.length > 0) {

        const uploadEndpoint = currentDropTarget.data('uploadUrl') || '/api/upload';
        const uploadHttpMethod = currentDropTarget.data('uploadMethod') || 'POST';

        // Iterate through each dropped file and initiate an upload.
        for (let i = 0; i < transferredFiles.length; i++) {
          const currentFile = transferredFiles[i];

          // Basic validation for file existence.
          if (!currentFile) {
            console.warn(`Skipping invalid file at index ${i}.`);
            continue;
          }

          const fileRequest = new XMLHttpRequest();
          const progressTracker = fileRequest.upload; // Can be used for upload progress tracking.

          // Configure the AJAX request.
          fileRequest.open(uploadHttpMethod, uploadEndpoint, true); // Async upload.
          fileRequest.setRequestHeader('X-File-Name', encodeURIComponent(currentFile.name));
          fileRequest.setRequestHeader('Content-Type', currentFile.type || 'application/octet-stream'); // Set content type explicitly.

          // Add a basic error handler for the request.
          fileRequest.onerror = function() {
            console.error(`File upload failed for ${currentFile.name}.`);
            currentDropTarget.trigger('uploadError.fileTransfer', [currentFile, fileRequest]);
          };

          // Add a basic load handler for successful completion.
          fileRequest.onload = function() {
             if (fileRequest.status >= 200 && fileRequest.status < 300) {
                 console.log(`File ${currentFile.name} uploaded successfully.`);
                 currentDropTarget.trigger('uploadComplete.fileTransfer', [currentFile, fileRequest.responseText]);
             } else {
                 console.error(`Server error for ${currentFile.name}: Status ${fileRequest.status}`);
                 currentDropTarget.trigger('uploadError.fileTransfer', [currentFile, fileRequest]);
             }
          };

          // Send the file data.
          fileRequest.send(currentFile);

          // Trigger a custom event indicating that an upload has started.
          currentDropTarget.trigger('uploadStarted.fileTransfer', [currentFile]);
        }
      } else {
        // Log if no files were found in the drop event.
        console.info("No files detected in the drop event.");
      }
    }
  };

  /**
   * Defines the jQuery plugin for file drop functionality.
   * Allows calling methods or initializing the plugin.
   * @param {string|object} actionOrConfig - The method name to call or an initialization object.
   * @returns {jQueryAlias} The jQuery object for chaining.
   */
  jQueryAlias.fn.dragUploadWidget = function( actionOrConfig ) {
    // Check if the first argument is a string (indicating a method call).
    if ( typeof actionOrConfig === 'string' && handlerCollection[actionOrConfig] ) {
      // Execute the specified method with remaining arguments.
      // The `apply` method ensures `this` context is correct for the handler.
      const methodArguments = Array.prototype.slice.call( arguments, 1 );
      return handlerCollection[actionOrConfig].apply( this, methodArguments );
    }
    // If it's an object or undefined, assume initialization.
    else if ( typeof actionOrConfig === 'object' || ! actionOrConfig ) {
      // Call the initialization routine.
      return handlerCollection.initializeDropTarget.apply( this, arguments );
    }
    // If an unknown method is requested, throw an error.
    else {
      // Using a more explicit error message and console warning.
      const errorMessage = `Method '${actionOrConfig}' does not exist on jQuery.dragUploadWidget.`;
      console.error(errorMessage);
      throw new Error(errorMessage); // Throw an actual error to halt execution if critical.
    }
  };

  // Provide a default configuration object that users can override.
  jQueryAlias.fn.dragUploadWidget.defaults = {
      uploadUrl: '/files/upload',
      uploadMethod: 'POST',
      maxFileSize: 5 * 1024 * 1024 // 5MB default limit
      // Add more default settings as needed
  };

})( jQuery );