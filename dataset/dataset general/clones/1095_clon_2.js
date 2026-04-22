(function(jq){

  var config; // Global configuration object reference for the plugin instance

  // Core functional handlers for various file processing operations
  var handlers = {

    /**
     * Initializes the plugin instance.
     * @returns {void}
     */
    initialize: function(){},

    // Signals the commencement of a file processing sequence
    beginProcess: function(){},

    /*
     * Callback invoked upon successful completion of a file operation.
     */
    finalizeUpload: function(){},

    /**
     * Updates the visual progress indicator element.
     * @param {number} completionRatio - The percentage of completion.
     * @param {jQuery} visualMeter - The progress bar element.
     * @param {jQuery} targetZone - The main container element.
     * @returns {void}
     */
    updateVisuals: function(completionRatio, visualMeter, targetZone) {
      visualMeter.css({
        'height': completionRatio + "%",
        'line-height': (targetZone.height() * completionRatio / 100) + 'px',
        'vertical-align': 'middle'
      });

      visualMeter.find('.bar').html(completionRatio + "%");
    },

    // Executes a pre-upload validation check for the file.
    preUploadCheck: function(currentFile, fileInputEl, targetZone){
      return true;
    },

    /**
     * Handles and reports any errors encountered during file operations.
     * @param {object} errorDetails - Details about the specific error.
     * @param {jQuery} fileInputEl - The associated file input element.
     * @param {jQuery} targetZone - The container element.
     * @returns {number} Always returns 0 to signify an error state.
     */
    reportFailure: function(errorDetails, fileInputEl, targetZone){
      console.error('Operation Failed:', errorDetails);

      return 0;
    },

    // Iterates through a given list of files for individual processing.
    processFiles: function(fileList, fileInputEl, targetZone){
      if (typeof fileList !== "undefined") {
        handlers.totalFilesCount = fileList.length;

        for (var idx = 0, len = fileList.length; idx < len; idx++) {
          handlers.validateAndHandle(fileList[idx], fileInputEl, targetZone);
        }
      } else {
        targetZone.html(config.noApiSupportMsg);
      }
    },

    /**
     * Validates a single file and determines the next action (resize or direct upload).
     * @param {File} currentFile - The file object to be processed.
     * @param {jQuery} fileInputEl - The corresponding input element.
     * @param {jQuery} targetZone - The drop area element.
     * @returns {boolean} False if validation fails, otherwise proceeds.
     */
    validateAndHandle: function(currentFile, fileInputEl, targetZone){
      var fileExtension = currentFile.name.toLowerCase().split(/\./);
      fileExtension = fileExtension[fileExtension.length - 1];

      var allowedFormats = (jq(targetZone).data('type') && jq(targetZone).data('type').split(/,/)) || [];

      // Perform file type validation
      if (fileInputEl.data('type') && !allowedFormats.indexOf(currentFile.type)) {
        config.reportFailure({
          'error': 'Only specific file types are permitted: ' + fileInputEl.data('type')
        }, fileInputEl, targetZone);
        return false;
      }

      // Perform file size validation
      if (currentFile.size > (config.maximumSize * 1048576)) {
        config.reportFailure({
          'error': 'Maximum allowed upload size: ' + config.maximumSize + ' MB'
        }, fileInputEl, targetZone);
        return false;
      }

      if (config.preUploadCheck(currentFile, fileInputEl, targetZone) === false) {
        console.warn('File upload aborted by `preUploadCheck` filter.');
        return;
      }

      // If the currentFile is an image and a resize parameter is configured,
      // the image is resized in the browser before initiating the upload.
      if ((/image/i).test(currentFile.type) && fileInputEl.data('canvas'))
        handlers.adjustImageDimensions(currentFile, fileInputEl, targetZone);
      else
        handlers.executeUpload(currentFile, fileInputEl, targetZone);
    },

    /**
     * Resizes an image file using HTML5 Canvas capabilities.
     * @param {File} currentFile - The image file to be resized.
     * @param {jQuery} fileInputEl - The input element.
     * @param {jQuery} targetZone - The drop area.
     * @returns {void}
     */
    adjustImageDimensions: function(currentFile, fileInputEl, targetZone){
      // Store the original filename for later use after the resize operation
      var originalFilename = currentFile.name;

      // Dynamically create new DOM elements for image manipulation
      var drawingSurface = document.createElement("canvas");
      //jq(drawingSurface).appendTo(targetZone); // This line remains commented out as in the original code
      var sourceImage = document.createElement("img");

      var targetWidth = 0 | fileInputEl.data('width');
      var targetHeight = 0 | fileInputEl.data('height');

      // Initialize a FileReader to read the file content asynchronously
      var fileContentReader = new FileReader();
      fileContentReader.onloadend = function(eventData) {
        sourceImage.src = eventData.target.result;

        // Calculate new image dimensions based on constraints
        var imgWidth = sourceImage.width;
        var imgHeight = sourceImage.height;
        var shouldCrop = fileInputEl.data('crop');

        if ((targetWidth && imgWidth > targetWidth) || (targetHeight && imgHeight > targetHeight)) {
          var aspectRatio = imgWidth / imgHeight;
          if ((aspectRatio >= 1 || targetHeight == 0) && targetWidth && !shouldCrop) {
            imgWidth  = targetWidth;
            imgHeight = targetWidth / aspectRatio;
          } else if (shouldCrop && aspectRatio <= (targetWidth / targetHeight)) {
            imgWidth  = targetWidth;
            imgHeight = targetWidth / aspectRatio;
          } else {
            imgWidth  = targetHeight * aspectRatio;
            imgHeight = targetHeight;
          }
        }

        // Draw the new image onto the canvas context
        drawingSurface.width = imgWidth;
        drawingSurface.height = imgHeight;
        var renderContext = drawingSurface.getContext("2d");
        renderContext.drawImage(sourceImage, 0, 0, imgWidth, imgHeight);

        var imageDataURL = drawingSurface.toDataURL("image/jpeg");

        // Validate the generated image data URL
        if (imageDataURL.length <= 6) {
          config.reportFailure({
            'error': 'Image creation failed. Please try again.'
          }, fileInputEl, targetZone);
          return 0;
        } else {
          // Convert the canvas data URL to a Blob and update the file object
          currentFile = handlers.convertDataURLtoBlob(imageDataURL);
          currentFile.name = originalFilename;

          if (fileInputEl.data('post')) {
            // Initiate the upload of the newly resized file
            handlers.executeUpload(currentFile, fileInputEl, targetZone);
          } else {
            jq(drawingSurface).appendTo(targetZone);
            fileInputEl.attr('disabled', 'disabled');
            jq('<input>').attr('name', fileInputEl.attr('name'))
                         .val(imageDataURL).insertAfter(fileInputEl);
          }
        }
      };
      fileContentReader.readAsDataURL(currentFile);
    },

    /**
     * Executes the actual file upload process via XMLHttpRequest.
     * @param {File} currentFile - The file to be uploaded.
     * @param {jQuery} fileInputEl - The input element.
     * @param {jQuery} targetZone - The drop area.
     * @returns {void}
     */
    executeUpload: function(currentFile, fileInputEl, targetZone){
      if (this.totalFilesCount > 1) {
        targetZone.empty();
      } else {
        targetZone.children('div').empty();
      }

      var uploadProgressIndicator = jq('<div class="progress"><div class="bar"></div></div>');
      targetZone.append(uploadProgressIndicator);

      // Create a new XMLHttpRequest object for handling the upload
      var httpRequest = new XMLHttpRequest();
      httpRequest.open("post", fileInputEl.data('post'), true);

      // DEVISE FIX: Include CSRF token header if available for security
      var csrfTokenValue = jq('meta[name="csrf-token"]').attr('content');
      if (csrfTokenValue) httpRequest.setRequestHeader('X-CSRF-Token', csrfTokenValue);

      httpRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");

      // Attach an event listener for progress updates during the upload
      httpRequest.upload.addEventListener("progress", function (eventData) {
        if (eventData.lengthComputable) {
          var bytesLoaded = Math.ceil((eventData.loaded / eventData.total) * 100);

          if (config.updateVisuals) {
            config.updateVisuals(bytesLoaded, uploadProgressIndicator, targetZone);
          } else {
            uploadProgressIndicator.html(bytesLoaded + "%");
          }
        }
      }, false);

      // Attach an event listener for upload completion or error
      httpRequest.addEventListener("load", function (eventData) {
        if (eventData.target.status != '200') {
          config.reportFailure({
            'error': eventData.target.statusText
          }, fileInputEl, targetZone);

          return;
        }

        var uploadResult = jQuery.parseJSON(eventData.target.responseText);

        // Invoke the user-defined completion function
        config.finalizeUpload(uploadResult, currentFile, fileInputEl, targetZone);

        uploadProgressIndicator.addClass('uploaded');
        uploadProgressIndicator.html(config.uploadSuccessText).fadeOut('slow');
      }, false);

      // Construct a FormData object to send the file and other data
      var formDataObject = new FormData();

      // Append optional form data extracted from the input element's data attributes
      for (var propName in fileInputEl.data())
        if (typeof fileInputEl.data(propName) !== "object")
          formDataObject.append(propName, fileInputEl.data(propName));

      // Append the actual file data using the input's name attribute
      formDataObject.append(fileInputEl.attr('name'), currentFile);

      // Send the formed data to the server
      httpRequest.send(formDataObject);
    },

    /**
     * Converts a Data URI string to a Blob object.
     * This utility is essential for handling resized images before upload.
     * @param {string} imageDataURL - The Data URI string representing the image.
     * @returns {Blob} The resulting Blob object.
     */
    convertDataURLtoBlob: function(imageDataURL){
      // For a detailed explanation, refer to: http://stackoverflow.com/questions/4998908/
      // Convert the base64 encoded string to raw binary data
      var binaryString = atob(imageDataURL.split(',')[1]);

      // Extract the MIME type component from the Data URI
      var contentType = imageDataURL.split(',')[0].split(':')[1].split(';')[0];

      // Write the bytes of the binary string into an ArrayBuffer
      var arrayBuffer = new ArrayBuffer(binaryString.length);
      var uint8Array = new Uint8Array(arrayBuffer);
      for (var idx = 0; idx < binaryString.length; idx++) {
        uint8Array[idx] = binaryString.charCodeAt(idx);
      }

      // Create a Blob object from the ArrayBuffer
      var blobBuilder = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder)();
      blobBuilder.append(arrayBuffer);
      return blobBuilder.getBlob(contentType);
    }
  };

  // Define the jQuery plugin method for file uploading functionality
  jq.fn.fileUploader = function(userOptions) {
    // Default configuration settings for the plugin instance
    config = {
      'initialize'        : handlers.initialize,
      'beginProcess'      : handlers.beginProcess,
      'finalizeUpload'    : handlers.finalizeUpload,
      'reportFailure'     : handlers.reportFailure,
      'preUploadCheck'    : handlers.preUploadCheck,
      'instructions'      : 'Place files here for upload',
      'over'              : 'Release to upload!',
      'noApiSupportMsg'   : 'File API not supported in this browser version.',
      'unsupportedTypeMsg': 'This file type cannot be processed!',
      'uploadSuccessText' : 'Upload Complete',
      'maximumSize'       : 10, // Default maximum upload size in megabytes
      'encapsulateElement': false,
      'enableClickTrigger': false
    };

    // Merge user-provided options with the default settings
    if (userOptions) jq.extend(config, userOptions);

    // Iterate over each selected DOM element to apply the plugin behavior
    this.each(function(){
      var targetZone = jq(this),
          fileInputEl = jq(this).children('input') || jq(this),
          infoDisplay = jq('<div class="instructions"></div>');

      targetZone.prepend(infoDisplay);

      if (config.encapsulateElement === true) {
        targetZone = jq('<div' + ((jq(this).attr('class')) ? ' class="' + jq(this).attr('class') + '"' : '') + '>').insertAfter(jq(this));
        infoDisplay = jq('<div>').appendTo(targetZone);
        fileInputEl = jq(this).appendTo(targetZone);
      }

      config.initialize(jq(this));
      if (fileInputEl.data('value') && fileInputEl.data('value').length)
        jq('<img src="' + fileInputEl.data('value') + '">').appendTo(targetZone);
      else
        infoDisplay.addClass('instructions').html(config.instructions);

      if (config.enableClickTrigger === true) {
        fileInputEl.css({ position: 'absolute', top: '-1000px' });
      }

      // Attach global drag-and-drop event handlers to the document
      jq(document).bind({
        dragleave: function (eventData) {
          eventData.preventDefault();
          if (fileInputEl.data('value') || targetZone.find('img').length)
            infoDisplay.removeClass('over').empty();
          else
            infoDisplay.removeClass('over').html(config.instructions);
        },
        drop: function (eventData) {
          eventData.preventDefault();
          if (fileInputEl.data('value') || targetZone.find('img').length)
            infoDisplay.removeClass('over').empty();
          else
            infoDisplay.removeClass('over').html(config.instructions);
        },
        dragenter: function (eventData) {
          eventData.preventDefault();
          infoDisplay.addClass('instructions over').html(config.over);
        },
        dragover: function (eventData) {
          eventData.preventDefault();
          infoDisplay.addClass('instructions over').html(config.over);
        }
      });

      // Attach file drop event listener to the current element
      this.addEventListener("drop", function (eventData) {
        eventData.preventDefault();
        config.beginProcess(jq(this));
        handlers.processFiles(eventData.dataTransfer.files, fileInputEl, targetZone);
        infoDisplay.removeClass('over').empty();
        fileInputEl.val('');
      }, false);

      // Attach a click event listener to trigger the file input click
      this.addEventListener('click', function(eventData) {
        fileInputEl.click();
      });

      // Attach a change event listener for the file input (when files are selected via browse dialog)
      fileInputEl.change(function(eventData){
        handlers.processFiles(eventData.target.files, fileInputEl, targetZone);
        fileInputEl.val('');
      });
    });
    return this;
  };

})(jQuery); // Pass the jQuery object to the immediately invoked function expression