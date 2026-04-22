'use strict'; // Enforces strict mode for cleaner code.

// This is the main application module definition.
// It pulls in several dependent modules for various functionalities.
angular.module( 'myApp', [
  'myApp.directives',     // Custom directives for the application
  'myApp.controllers',    // Application controllers
  'imgEditor.directives'  // Directives specifically for image editing features
] );

// Defining the 'myApp.controllers' module and its associated controllers.
angular.module('myApp.controllers', [ 'angularFileUpload' ] )
  .controller('myController', function ( $scope, FileUploader, $http, $sce ) {

    // Initialize an array to hold uploaded image data.
    // These are example entries, simulating data from a server or previous uploads.
    $scope.uploads = [
      { // First example upload item.
        'url': 'https://scontent-a-iad.xx.fbcdn.net/hphotos-prn2/t1.0-9/1151081_10201852161326618_2087299939_n.jpg',
        'name': 'Test From Server'
      },
      { // Second example upload item, demonstrating cropping.
        'url': 'https://scontent-b-iad.xx.fbcdn.net/hphotos-frc3/t31.0-8/416754_3799985799085_1769166011_o.jpg',
        'name': 'Test Crop',
        'crop': { // Crop coordinates: (x1, y1) to (x2, y2)
          'x': 0,
          'y': 286,
          'x2': 2046,
          'y2': 971
        }
      },
      { // Third example upload item, demonstrating rotation.
        'url': 'https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-ash3/t1.0-9/221754_2045126368696_101105_n.jpg',
        'name': 'Test Rotate',
        'rotation': 180 // Rotation in degrees.
      },
      { // Fourth example upload item, combining crop and rotation.
        'url': 'https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-ash2/t31.0-8/738229_10200191249604863_465734781_o.jpg',
        'name': 'Test Crop and Rotate',
        'crop': { // Crop coordinates for this item.
          'x': 400,
          'y': 9,
          'x2': 821,
          'y2': 667
        },
        'rotation': 90 // Rotation for this item.
      }
    ]; // End of $scope.uploads array initialization.


    // --- Angular File Uploader Integration ---
    // This section handles file uploads using the angular-file-upload library.

    // Instantiate a new FileUploader object.
    var uploader = $scope.uploader = new FileUploader( {
      scope: $scope,          // Pass the current scope to the uploader.
      url: 'test-upload.php'  // The URL endpoint for file uploads.
    } );

    // Custom override for the default 'uploadItem' method.
    // This allows sending base64 encoded image data via HTTP POST.
    uploader.uploadItem = function ( value ) {
      var index = this.getIndexOfItem( value ); // Get the index of the item in the queue.
      var item = this.queue[ index ];           // Retrieve the actual item.
      item.index = item.index || this._nextIndex++; // Assign an index if not present.
      item.isReady = true;                      // Mark the item as ready for upload.

      // Extract the filename without its extension.
      var filename = item.file.name.split( '.' );
      filename.pop(); // Remove the last part (extension).
      filename = filename.join( '.' ); // Rejoin the parts to form the name.

      if ( this.isUploading ) return; // Prevent multiple concurrent uploads if flag is set.

      this.isUploading = true; // Set the uploader's uploading status to true.
      var that = this;         // Store 'this' context for use in callbacks.

      // Perform the HTTP POST request to send the base64 data.
      $http( {
        method: 'POST', // HTTP method.
        url: item.url,  // Upload URL for this specific item.
        data: {         // Data payload for the request.
          base64: item.base64, // The base64 encoded image string.
          name: filename,      // The name of the file.
          type: item.file.type // The MIME type of the file.
        }
      } ).success( function ( data, status, headers, config ) {
        // This success callback is invoked when the server responds successfully.
        var xhr = { // Create a dummy XHR object for consistent event handling.
          response: data,
          status: status,
          dummy: true
        };
        that.trigger( 'in:success', xhr, item, data );   // Trigger success event.
        that.trigger( 'in:complete', xhr, item, data );  // Trigger complete event.
      } ).error( function ( data, status, headers, config ) {
        // This error callback is invoked if the server responds with an error status.
        alert( 'error' );      // Display a simple error alert.
        console.log( data );   // Log the error data to the console for debugging.
        var xhr = {            // Create a dummy XHR object for error event.
          response: data,
          status: status,
          dummy: true
        };
        that.trigger( 'in:error', xhr, item );    // Trigger error event.
        that.trigger( 'in:complete', xhr, item ); // Trigger complete event for error scenario.
      } );
    }; // End of uploader.uploadItem override.

    // --- Uploader Filters ---
    // Filters control which files are allowed to be added to the upload queue.

    // This filter ensures only image files are accepted.
    uploader.filters.push( function ( item /* {File|HTMLInputElement} */ ) {
      var type = uploader.isHTML5 ? item.type : '/' + item.value.slice( item.value.lastIndexOf( '.' ) + 1 );
      type = '|' + type.toLowerCase( ).slice( type.lastIndexOf( '/' ) + 1 ) + '|';
      return '|jpg|png|jpeg|bmp|gif|'.indexOf( type ) !== -1;
    } ); // End of image filter.


    // --- Uploader Event Handlers ---
    // These functions respond to various stages of the file upload process.

    // Called after a file has been successfully added to the queue.
    uploader.onAfteraddingfile = function ( event, item ) {
      console.info( 'After adding a file', item );
    };

    // Called if adding a file to the queue failed due to filters or other reasons.
    uploader.onWhenaddingfilefailed = function ( event, item ) {
      console.info( 'When adding a file failed', item );
    };

    // Called after all files have been added to the queue (either successfully or failed).
    uploader.onAfteraddingall = function ( event, items ) {
      console.info( 'After adding all files', items );
    };

    // Called just before an individual file starts uploading.
    uploader.onBeforeupload = function ( event, item ) {
      console.info( 'Before upload', item );
    };

    // Called periodically as an individual file uploads, reporting progress.
    uploader.onProgress = function ( event, item, progress ) {
      console.info( 'Progress: ' + progress, item );
    };

    // Called when an individual file upload completes successfully.
    uploader.onSuccess = function ( event, xhr, item, response ) {
      console.info( 'Success', xhr, item, response );
    };

    // Called if an individual file upload is cancelled.
    uploader.onCancel = function ( event, xhr, item ) {
      console.info( 'Cancel', xhr, item );
    };

    // Called if an individual file upload encounters an error.
    uploader.onError = function ( event, xhr, item, response ) {
      console.info( 'Error', xhr, item, response );
    };

    // Called after an individual file upload has completed (success, error, or cancel).
    uploader.onComplete = function ( event, xhr, item, response ) {
      console.info( 'Complete', xhr, item, response );
    };

    // Called periodically as all files in the queue upload, reporting overall progress.
    uploader.onProgressall = function ( event, progress ) {
      console.info( 'Total progress: ' + progress );
    };

    // Called after all files in the queue have completed their upload process.
    uploader.onCompleteall = function ( event, items ) {
      console.info( 'Complete all', items );
    };

    // --- End of Angular File Uploader section ---


    // --- Custom Controller Logic ---
    // This area is reserved for additional controller-specific logic beyond file uploads.
    // (Currently empty in the provided example, but can be extended.)


  } ); // End of 'myController' definition.


// --- ng-thumb Directive Definition ---
// This directive provides image thumbnail generation capabilities.
// Author: nerv
// Version: 0.1.2, 2014-01-09

angular.module( 'myApp.directives', [] )
  .directive( 'ngThumb', [ '$window',
    function ( $window ) {

      // Helper object to provide utility functions for the directive.
      var helper = {
        // Checks if FileReader and CanvasRenderingContext2D are supported by the browser.
        support: !! ( $window.FileReader && $window.CanvasRenderingContext2D ),
        // Checks if the given item is an instance of a File object.
        isFile: function ( item ) {
          return angular.isObject( item ) && item instanceof $window.File;
        },
        // Checks if the given file's type indicates it's an image.
        isImage: function ( file ) {
          var type = '|' + file.type.slice( file.type.lastIndexOf( '/' ) + 1 ) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf( type ) !== -1;
        }
      }; // End of helper object.

      return {
        restrict: 'A',      // Restrict this directive to be used as an attribute.
        template: '<canvas/>', // The directive will replace its content with a canvas element.
        link: function ( scope, element, attributes ) {
          // If browser support for necessary features is lacking, do nothing.
          if ( !helper.support ) return;

          // Evaluate the ngThumb attribute value to get parameters (e.g., file, width, height).
          var params = scope.$eval( attributes.ngThumb );

          // Validate if a valid file object is provided.
          if ( !helper.isFile( params.file ) ) return;
          // Validate if the provided file is an image.
          if ( !helper.isImage( params.file ) ) return;

          var canvas = element.find( 'canvas' ); // Get the canvas element.
          var reader = new FileReader( );       // Create a new FileReader instance.

          reader.onload = onLoadFile;           // Set the callback for when the file is loaded.
          reader.readAsDataURL( params.file );  // Read the file as a Data URL (base64).

          // Callback function when the FileReader finishes loading the file.
          function onLoadFile ( event ) {
            var img = scope.img = new Image( ); // Create a new Image object.
            img.onload = onLoadImage;           // Set the callback for when the image is loaded.
            img.src = event.target.result;      // Set the image source to the loaded Data URL.
          }

          // Callback function when the Image object finishes loading.
          function onLoadImage ( ) {
            // Calculate width and height, prioritizing provided params, otherwise maintaining aspect ratio.
            var width = params.width || this.width / this.height * params.height;
            var height = params.height || this.height / this.width * params.width;

            // Set the canvas dimensions.
            canvas.attr( {
              width: width,
              height: height
            } );
            // Draw the loaded image onto the canvas.
            canvas[ 0 ].getContext( '2d' ).drawImage( this, 0, 0, width, height );
          }
        } // End of link function.
      }; // End of directive return object.
    }
  ] ); // End of 'ngThumb' directive definition.