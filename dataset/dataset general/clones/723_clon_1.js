'use strict' ; // Enable strict mode for better error handling and cleaner code.

// This file contains the Angular controllers for the photo album application.
// Specifically, it manages photo upload functionality using two different approaches.

var photoAlbumControllers = angular
    .module(
        'photoAlbumControllers',
        [
            'angularFileUpload' // Dependency injection for file upload capabilities.
        ]
    );

photoAlbumControllers
    .controller(
        'photoUploadCtrlJQuery',
        [
            '$scope',
            '$rootScope',
            '$routeParams',
            '$location',

            // This controller handles photo uploads using the jQuery File Upload plugin,
            // integrated with Cloudinary's direct upload features.
            function (
                $scope,
                $rootScope,
                $routeParams,
                $location
            ) {
                // Initialize the files object to store upload progress and results.
                $scope.files = {};

                // Function to update the title associated with the uploaded photos.
                $scope.updateTitle = function ( ) {
                    // Retrieve current formData options from the fileupload widget.
                    var uploadParams = $scope.widget.fileupload( 'option', 'formData' );

                    // Update the 'context' parameter with the new photo title.
                    uploadParams[ "context" ] = "photo=" + $scope.title;

                    // Apply the updated formData back to the fileupload widget.
                    $scope.widget.fileupload( 'option', 'formData', uploadParams );
                };

                // Initialize the jQuery File Upload widget for direct Cloudinary uploads.
                $scope.widget = $( ".cloudinary_fileupload" )
                    .unsigned_cloudinary_upload(
                        $.cloudinary.config().upload_preset, // Use the configured upload preset.
                        {
                            tags: 'myphotoalbum', // Assign a default tag to all uploads.
                            context: 'photo='    // Placeholder for photo context/title.
                        },
                        {
                            // Optional configurations for client-side image processing and validation.
                            // To use these, ensure 'cloudinary/processing.js' is included.
                            // disableImageResize: false, // Set to true to disable resizing.
                            // imageMaxWidth: 800,        // Max width for resized images.
                            // imageMaxHeight: 600,       // Max height for resized images.
                            // acceptFileTypes: /(\.|\/)(gif|jpe?g|png|bmp|ico)$/i, // Allowed file types regex.
                            // maxFileSize: 20000000,     // Maximum file size in bytes (e.g., 20MB).

                            dropZone: "#direct_upload_jquery", // Specifies the element to act as a drop zone.

                            // Callback function triggered when an upload starts.
                            start: function ( e ) {
                                $scope.status = "Starting upload..."; // Update status message.
                                $scope.files  = {};                   // Clear previous file data.
                                $scope.$apply( );                     // Manually trigger Angular digest cycle.
                            },

                            // Callback function triggered if an upload fails.
                            fail: function ( e, data ) {
                                $scope.status = "Upload failed"; // Set failure status.
                                $scope.$apply( );                // Update scope.
                            }
                        }
                    )
                    // Event handler for individual file progress updates during upload.
                    .on(
                        "cloudinaryprogress",
                        function ( e, data ) {
                            var name = data.files[ 0 ].name; // Get the name of the current file.
                            var file = $scope.files[ name ] || {}; // Retrieve or initialize file object.

                            // Calculate and store the progress percentage.
                            file.progress = Math.round( ( data.loaded * 100.0 ) / data.total );

                            // Update the status message for the individual file.
                            file.status = "Uploading... " + file.progress + "%";

                            $scope.files[ name ] = file; // Store the updated file object.
                            $scope.$apply( );            // Propagate changes to the Angular view.
                        }
                    )
                    // Event handler for overall progress of all files being uploaded.
                    .on(
                        "cloudinaryprogressall",
                        function ( e, data ) {
                            // Calculate total progress across all files.
                            $scope.progress = Math.round( ( data.loaded * 100.0 ) / data.total );

                            // Update the overall status message.
                            $scope.status = "Uploading... " + $scope.progress + "%";

                            $scope.$apply( ); // Refresh Angular scope.
                        }
                    )
                    // Event handler for when a file upload is successfully completed.
                    .on(
                        "cloudinarydone",
                        function ( e, data ) {
                            $rootScope.photos = $rootScope.photos || []; // Ensure photos array exists on rootScope.

                            // Attach custom context data (e.g., photo title) to the result.
                            data.result.context = { custom: { photo: $scope.title } };

                            $scope.result = data.result; // Store the Cloudinary result.

                            var name = data.files[ 0 ].name; // Get the original file name.
                            var file = $scope.files[ name ] || {}; // Access the file's tracking object.

                            file.name   = name;        // Set the file name.
                            file.result = data.result; // Store the Cloudinary result for this file.

                            $scope.files[ name ] = file; // Update the file object in scope.

                            $rootScope.photos.push( data.result ); // Add the new photo to the global list.

                            $scope.$apply( ); // Trigger an Angular digest cycle to update the UI.
                        }
                    );
            }
        ]
    )
    .controller(
        'photoUploadCtrl',
        [
            '$scope',
            '$rootScope',
            '$routeParams',
            '$location',
            '$upload', // Inject the 'angular-file-upload' service.

            // This controller manages photo uploads using the Angular File Upload library.
            function (
                $scope,
                $rootScope,
                $routeParams,
                $location,
                $upload
            ) {
                // Watch for changes in the 'files' array (e.g., when files are selected or dropped).
                $scope.$watch( 'files', function ( ) {
                    if ( ! $scope.files ) {
                        return; // If no files, do nothing.
                    }

                    // Iterate over each selected file.
                    $scope.files.forEach( function ( file ) {
                        // Initiate the upload process for the current file.
                        $scope.upload = $upload.upload( {
                            url: "https://api.cloudinary.com/v1_1/" + $.cloudinary.config().cloud_name + "/upload",
                            data: {
                                upload_preset: $.cloudinary.config().upload_preset,
                                tags: 'myphotoalbum',
                                context: 'photo=' + $scope.title
                            },
                            file: file // The actual file object to upload.
                        } )
                        .progress( function ( e ) {
                            // Update individual file progress.
                            file.progress = Math.round( ( e.loaded * 100.0 ) / e.total );
                            file.status   = "Uploading... " + file.progress + "%";

                            // Manually apply changes if not already in a digest cycle.
                            if ( ! $scope.$$phase ) {
                                $scope.$apply( );
                            }
                        } )
                        .success( function ( data, status, headers, config ) {
                            // On successful upload:
                            $rootScope.photos = $rootScope.photos || []; // Ensure photos array exists.
                            data.context      = { custom: { photo: $scope.title } }; // Add custom context.
                            file.result       = data;                     // Store Cloudinary response.
                            $rootScope.photos.push( data );               // Add to global photos list.

                            // Manually apply changes if needed.
                            if ( ! $scope.$$phase ) {
                                $scope.$apply( );
                            }
                        } );
                    } );
                } );

                /* This function determines the CSS class for the dropzone based on drag event. */
                $scope.dragOverClass = function ( $event ) {
                    var items   = $event.dataTransfer.items; // Get data transfer items.
                    var hasFile = false;                     // Flag to check for file presence.

                    if ( items != null ) { // Check if items exist.
                        for ( var i = 0 ; i < items.length ; i++ ) { // Loop through items.
                            if ( items[ i ].kind == 'file' ) { // If an item is a file.
                                hasFile = true; // Set flag to true.
                                break;          // Exit loop early.
                            }
                        }
                    } else {
                        // Fallback for browsers that don't support DataTransferItem.kind.
                        hasFile = true;
                    }
                    // Return appropriate class: "dragover" for files, "dragover-err" otherwise.
                    return hasFile ? "dragover" : "dragover-err";
                };
            }
        ]
    );