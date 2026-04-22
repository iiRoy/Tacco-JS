/**
 * @fileoverview AngularJS File Upload Module
 * @description Provides directives and a service for handling file uploads in AngularJS applications.
 * @version 1.6.5
 * @license MIT
 * @author Danial Farid <danial.farid@gmail.com>
 */
(function( ) {

  // Initialize the main AngularJS module for file uploads.
  // This module depends on no other core Angular modules.
  var angularFileUpload = angular.module('angularFileUpload', [ ] );


  /**
   * @ngdoc service
   * @name $upload
   * @description
   * The `$upload` service provides methods for handling file uploads,
   * including standard HTTP requests and file-specific uploads using FormData.
   * It wraps the standard `$http` service and extends its functionality
   * with progress tracking, abort capabilities, and FormData handling.
   */
  angularFileUpload.service('$upload', [ '$http', '$q', '$timeout', function( $http, $q, $timeout ) {

    /**
     * @private
     * @ngdoc method
     * @name $upload#sendHttp
     * @param {Object} config - The configuration object for the HTTP request.
     * @returns {Promise} A promise that is resolved with the HTTP response,
     *                    rejected with an error, and notified with upload progress events.
     * @description
     * This is the core internal function responsible for sending HTTP requests.
     * It sets up request configuration, handles XHR progress, and extends the promise
     * with `success`, `error`, `progress`, `abort`, and `xhr` methods.
     */
    function sendHttp( config ) {

      // Ensure that the HTTP method is defined; default to 'POST'.
      config.method = config.method || 'POST';

      // Initialize headers object if it's not already present.
      config.headers = config.headers || { };

      // Override or set the `transformRequest` function.
      // This specifically handles `ArrayBuffer` data types.
      config.transformRequest = config.transformRequest || function( data, headersGetter ) {
        if ( window.ArrayBuffer && data instanceof window.ArrayBuffer ) {
          return data; // Return ArrayBuffer directly without further transformation.
        }
        // For other data types, delegate to Angular's default transformRequest.
        return $http.defaults.transformRequest[0]( data, headersGetter );
      };

      // Create a deferred object to manage the asynchronous operation.
      var deferred = $q.defer();

      // Check if a XMLHttpRequest shim is in use (e.g., for older browsers).
      if ( window.XMLHttpRequest.__isShim ) {
        config.headers['__setXHR_'] = function( ) {
          return function( xhr ) {
            if ( !xhr ) return; // Guard against null XHR object.

            // Store the XHR object for potential external access or control (e.g., abort).
            config.__XHR = xhr;

            // Execute any custom XHR function provided in the config.
            config.xhrFn && config.xhrFn( xhr );

            // Attach an event listener to track upload progress.
            xhr.upload.addEventListener('progress', function( e ) {
              deferred.notify( e ); // Notify the promise listeners of progress.
            }, false );

            // Add an event listener for the 'load' event on upload.
            // This is a workaround for browsers (like Firefox, IE8-9) that might not
            // consistently fire the final progress event or indicate completion correctly.
            xhr.upload.addEventListener('load', function( e ) {
              if ( e.lengthComputable ) {
                deferred.notify( e ); // If total size is known, notify progress.
              }
            }, false );
          };
        };
      }

      // Execute the actual HTTP request using Angular's $http service.
      // The promise returned by $http is then chained to resolve/reject/notify
      // the deferred object created by this service.
      $http( config ).then(
          function( r ) { deferred.resolve( r ); }, // Success callback.
          function( e ) { deferred.reject( e ); },  // Error callback.
          function( n ) { deferred.notify( n ); }   // Notification callback.
      );

      // Retrieve the promise object from the deferred object.
      var promise = deferred.promise;

      // Extend the promise with a 'success' method for convenience.
      promise.success = function( fn ) {
        promise.then( function( response ) {
          fn( response.data, response.status, response.headers, config );
        } );
        return promise;
      };

      // Extend the promise with an 'error' method for convenience.
      promise.error = function( fn ) {
        promise.then( null, function( response ) {
          fn( response.data, response.status, response.headers, config );
        } );
        return promise;
      };

      // Extend the promise with a 'progress' method for convenience.
      promise.progress = function( fn ) {
        promise.then( null, null, function( update ) {
          fn( update );
        } );
        return promise;
      };

      // Extend the promise with an 'abort' method to cancel the request.
      promise.abort = function( ) {
        if ( config.__XHR ) {
          // Use $timeout to ensure the abort operation is run within
          // an Angular digest cycle, if necessary.
          $timeout( function( ) {
            config.__XHR.abort();
          } );
        }
        return promise;
      };

      // Extend the promise with an 'xhr' method to allow access to the underlying XHR object.
      promise.xhr = function( fn ) {
        // Wrap the original xhrFn (if any) to ensure both are called.
        config.xhrFn = ( function( origXhrFn ) {
          return function( ) {
            origXhrFn && origXhrFn.apply( promise, arguments );
            fn.apply( promise, arguments );
          };
        } )( config.xhrFn );
        return promise;
      };

      return promise; // Return the enhanced promise.
    }


    /**
     * @ngdoc method
     * @name $upload#upload
     * @param {Object} config - Configuration object for the file upload.
     *                          Must include `file` (File or FileList) and optionally `data`.
     * @returns {Promise} A promise similar to the one returned by `$http`,
     *                    but enhanced for file upload functionality.
     * @description
     * This method handles the actual file upload process. It prepares the `FormData`
     * object, appends files and other data, and then delegates to `sendHttp`.
     */
    this.upload = function( config ) {
      config.headers = config.headers || { };
      // Set 'Content-Type' to undefined. This allows the browser to automatically
      // set the correct 'multipart/form-data' content type with the boundary.
      config.headers['Content-Type'] = undefined;
      config.transformRequest = config.transformRequest || $http.defaults.transformRequest;

      // Create a new FormData object to send the file(s) and other data.
      var formData = new FormData();
      var origTransformRequest = config.transformRequest;
      var origData = config.data;

      // Custom transformRequest function specifically for file uploads.
      // It populates the FormData object with `config.data` and `config.file`.
      config.transformRequest = function( formData, headerGetter ) {
        if ( origData ) {
          // If a custom formDataAppender is provided, use it to append data.
          if ( config.formDataAppender ) {
            for ( var key in origData ) {
              var val = origData[key];
              config.formDataAppender( formData, key, val );
            }
          } else {
            // Otherwise, iterate through `origData` and append each key-value pair.
            for ( var key in origData ) {
              var val = origData[key];
              // Apply original `transformRequest` if it's a function.
              if ( typeof origTransformRequest == 'function' ) {
                val = origTransformRequest( val, headerGetter );
              } else {
                // If it's an array of functions, apply each transform.
                for ( var i = 0; i < origTransformRequest.length; i++ ) {
                  var transformFn = origTransformRequest[i];
                  if ( typeof transformFn == 'function' ) {
                    val = transformFn( val, headerGetter );
                  }
                }
              }
              formData.append( key, val ); // Append the transformed value to FormData.
            }
          }
        }

        // Handle appending file(s) to the FormData object.
        if ( config.file != null ) {
          var fileFormName = config.fileFormDataName || 'file';

          // If `config.file` is an array (multiple files).
          if ( Object.prototype.toString.call( config.file ) === '[object Array]' ) {
            var isFileFormNameString = Object.prototype.toString.call( fileFormName ) === '[object String]';
            for ( var i = 0; i < config.file.length; i++ ) {
              formData.append(
                  isFileFormNameString ? fileFormName : fileFormName[i],
                  config.file[i],
                  ( config.fileName && config.fileName[i] ) || config.file[i].name
              );
            }
          } else {
            // If `config.file` is a single file.
            formData.append( fileFormName, config.file, config.fileName || config.file.name );
          }
        }
        return formData; // Return the fully populated FormData object.
      };

      // Set the request data to the FormData object.
      config.data = formData;

      // Delegate the actual HTTP request sending to the internal `sendHttp` function.
      return sendHttp( config );
    };


    /**
     * @ngdoc method
     * @name $upload#http
     * @param {Object} config - Standard HTTP configuration object.
     * @returns {Promise} A promise similar to the one returned by `$http`,
     *                    but enhanced with progress, abort, etc.
     * @description
     * This method provides a wrapper around the standard `$http` service,
     * extending its promise with progress, abort, and XHR access methods.
     * It's useful for non-file related HTTP requests where progress tracking
     * or abort functionality is desired.
     */
    this.http = function( config ) {
      return sendHttp( config ); // Simply delegates to the internal `sendHttp` function.
    };

  } ] );


  /**
   * @ngdoc directive
   * @name ngFileSelect
   * @restrict A
   * @param {expression} ngFileSelect - An expression to be executed when files are selected.
   *                                    The expression is passed `$files` (an array of File objects)
   *                                    and `$event` (the original change event).
   * @description
   * This directive allows users to select files from their local file system.
   * It can be applied to an `<input type="file">` element directly, or to any other
   * element, in which case a hidden `<input type="file">` will be created and
   * styled to overlay the element, making it clickable.
   */
  angularFileUpload.directive('ngFileSelect', [ '$parse', '$timeout', function( $parse, $timeout ) {
    return function( scope, elem, attr ) {
      var fn = $parse( attr['ngFileSelect'] ); // Parse the expression provided in the attribute.

      // If the directive is not applied to an actual `<input type="file">` element,
      // a hidden file input will be dynamically created and appended.
      if ( elem[0].tagName.toLowerCase() !== 'input' || ( elem.attr('type') && elem.attr('type').toLowerCase() ) !== 'file' ) {
        var fileElem = angular.element('<input type="file">');

        // Copy all attributes from the original element to the dynamically created file input.
        for ( var i = 0; i < elem[0].attributes.length; i++ ) {
          fileElem.attr( elem[0].attributes[i].name, elem[0].attributes[i].value );
        }

        // If 'data-multiple' attribute is present, enable multiple file selection.
        if ( elem.attr("data-multiple") ) fileElem.attr("multiple", "true");

        // Apply CSS styles to make the hidden file input transparent and position it
        // to cover the original element, effectively making the original element clickable.
        fileElem.css("top", 0).css("bottom", 0).css("left", 0).css("right", 0).css("width", "100%").
        css("opacity", 0).css("position", "absolute").css('filter', 'alpha(opacity=0)');

        elem.append( fileElem ); // Append the hidden file input to the element.

        // Ensure the parent element has a 'relative' position style if it's static or unset,
        // which is necessary for absolute positioning of the child file input.
        if ( elem.css("position") === '' || elem.css("position") === 'static' ) {
          elem.css("position", "relative");
        }
        elem = fileElem; // Now, all subsequent operations will target the actual file input.
      }

      // Bind the 'change' event to the file input element.
      // This event fires when the user selects one or more files.
      elem.bind('change', function( evt ) {
        var files = [ ], fileList, i;
        fileList = evt.__files_ || evt.target.files; // Retrieve the FileList object.

        // Iterate through the FileList and push each File object into an array.
        if ( fileList != null ) {
          for ( i = 0; i < fileList.length; i++ ) {
            files.push( fileList.item( i ) );
          }
        }

        // Execute the parsed expression within an Angular digest cycle.
        $timeout( function( ) {
          fn( scope, {
            $files : files, // Pass the array of selected files.
            $event : evt   // Pass the original change event.
          } );
        } );
      } );

      /*
       * The following commented-out code blocks represent features or workarounds
       * that were part of earlier versions but later removed from the official source.
       *
       * 1. Commented out: `elem.bind('click', ...)`
       *    Reason for removal: It was causing confusion if the user clicked browse and then canceled the file selection dialog (Issue #181).
       *
       * 2. Commented out: Touch screen specific event handling (`if (('ontouchstart' in window) || ...`)
       *    Reason for removal: It was causing a bug (Issue #253) on touch devices.
       */
      // elem.bind('click', function(){
      //  this.value = null;
      // });
      //
      // if (('ontouchstart' in window) ||
      //     (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
      //   elem.bind('touchend', function(e) {
      //     e.preventDefault();
      //     e.target.click();
      //   });
      // }
    };
  } ] );


  /**
   * @ngdoc directive
   * @name ngFileDropAvailable
   * @restrict A
   * @param {expression} ngFileDropAvailable - An expression executed if drag-and-drop
   *                                            functionality is available in the browser.
   * @description
   * This directive checks for the browser's support of the HTML5 `draggable` attribute
   * and, if supported, executes the provided expression. This allows developers to
   * conditionally display or enable drag-and-drop related UI elements.
   */
  angularFileUpload.directive('ngFileDropAvailable', [ '$parse', '$timeout', function( $parse, $timeout ) {
    return function( scope, elem, attr ) {
      // Feature detection: Check if 'draggable' attribute is supported by the browser.
      if ( 'draggable' in document.createElement('span') ) {
        var fn = $parse( attr['ngFileDropAvailable'] ); // Parse the expression.
        $timeout( function( ) {
          fn( scope ); // Execute the expression within an Angular digest cycle.
        } );
      }
    };
  } ] );


  /**
   * @ngdoc directive
   * @name ngFileDrop
   * @restrict A
   * @param {expression} ngFileDrop - An expression to be executed when files are dropped onto the element.
   *                                  The expression is passed `$files` (an array of File objects)
   *                                  and `$event` (the original drop event).
   * @param {string=} ngFileDragOverClass - CSS class to apply when files are dragged over the element.
   * @param {number=} ngFileDragOverDelay - Delay in milliseconds before removing `ngFileDragOverClass`.
   * @description
   * This directive enables drag-and-drop file upload functionality.
   * It handles `dragover`, `dragenter`, `dragleave`, and `drop` events,
   * extracts files (including those from dropped directories), and executes
   * the provided expression with the dropped files.
   */
  angularFileUpload.directive('ngFileDrop', [ '$parse', '$timeout', '$location', function( $parse, $timeout, $location ) {
    return function( scope, elem, attr ) {
      // Ensure drag-and-drop functionality is supported by the browser.
      if ( 'draggable' in document.createElement('span') ) {
        var leaveTimeout = null; // Variable to hold the timeout ID for 'dragleave' event.

        // Event listener for the 'dragover' event.
        // Prevents default browser behavior and applies a CSS class to indicate drag-over state.
        elem[0].addEventListener("dragover", function( evt ) {
          evt.stopPropagation(); // Stop event propagation.
          evt.preventDefault();  // Prevent default browser handling (e.g., opening file).
          $timeout.cancel( leaveTimeout ); // Cancel any pending 'dragleave' timeout.

          // Determine the CSS class to apply when dragging over the element.
          if ( !elem[0].__drag_over_class_ ) {
            var dragOverClassFn;
            // Check if the attribute value is an Angular expression (e.g., "myFunc($event)").
            if ( attr['ngFileDragOverClass'].search(/\) *$/) > -1 ) {
              dragOverClassFn = $parse( attr['ngFileDragOverClass'] );
              var dragOverClass = dragOverClassFn( scope, {
                $event : evt
              } );
              elem[0].__drag_over_class_ = dragOverClass;
            } else {
              // Otherwise, use the attribute value directly or default to "dragover".
              elem[0].__drag_over_class_ = attr['ngFileDragOverClass'] || "dragover";
            }
          }
          elem.addClass( elem[0].__drag_over_class_ ); // Apply the determined CSS class.
        }, false );

        // Event listener for the 'dragenter' event.
        // Primarily used to prevent default browser handling.
        elem[0].addEventListener("dragenter", function( evt ) {
          evt.stopPropagation();
          evt.preventDefault();
        }, false );

        // Event listener for the 'dragleave' event.
        // Uses a timeout to remove the drag-over class, allowing for quick re-entry
        // without the class flickering.
        elem[0].addEventListener("dragleave", function( evt ) {
          leaveTimeout = $timeout( function( ) {
            elem.removeClass( elem[0].__drag_over_class_ );
            elem[0].__drag_over_class_ = null;
          }, attr['ngFileDragOverDelay'] || 1 ); // Use custom delay or default to 1ms.
        }, false );

        var fn = $parse( attr['ngFileDrop'] ); // Parse the expression for the 'ngFileDrop' attribute.

        // Event listener for the 'drop' event.
        // This is where files are actually processed.
        elem[0].addEventListener("drop", function( evt ) {
          evt.stopPropagation();
          evt.preventDefault();
          elem.removeClass( elem[0].__drag_over_class_ ); // Remove the drag-over class immediately.
          elem[0].__drag_over_class_ = null;

          // Extract files from the drop event and then execute the ngFileDrop expression.
          extractFiles( evt, function( files ) {
            fn( scope, {
              $files : files, // Pass the array of extracted files.
              $event : evt   // Pass the original drop event.
            } );
          } );
        }, false );

        /**
         * @private
         * @function isASCII
         * @param {string} str - The string to check.
         * @returns {boolean} True if the string contains only ASCII characters, false otherwise.
         * @description
         * Helper function to check if a string consists purely of ASCII characters.
         * This is used as a workaround for a Chrome bug related to non-ASCII file names
         * when using `webkitGetAsEntry` in drag-and-drop operations.
         * (See: https://code.google.com/p/chromium/issues/detail?id=149735)
         */
        function isASCII( str ) {
          return /^[\000-\177]*$/.test( str );
        }

        /**
         * @private
         * @function extractFiles
         * @param {Event} evt - The drop event object.
         * @param {Function} callback - A callback function to be invoked with the extracted files.
         * @description
         * Extracts files from a `drop` event's `dataTransfer` object.
         * It handles both direct file lists and recursively traverses dropped directory structures
         * using `webkitGetAsEntry` (if supported and not running on 'file://' protocol).
         */
        function extractFiles( evt, callback ) {
          var files = [ ], items = evt.dataTransfer.items;

          // Check for DataTransferItem support (Chrome, Firefox) and webkitGetAsEntry for directories.
          // Also, exclude 'file://' protocol due to security restrictions.
          if ( items && items.length > 0 && items[0].webkitGetAsEntry && $location.protocol() != 'file' ) {
            for ( var i = 0; i < items.length; i++ ) {
              var entry = items[i].webkitGetAsEntry();
              if ( entry != null ) {
                // Apply Chrome bug workaround for non-ASCII file names.
                if ( isASCII( entry.name ) ) {
                  traverseFileTree( files, entry ); // Recursively traverse directories.
                } else if ( !items[i].webkitGetAsEntry().isDirectory ) {
                  files.push( items[i].getAsFile() ); // Add individual files directly.
                }
              }
            }
          } else {
            // Fallback for browsers without DataTransferItem/webkitGetAsEntry or 'file' protocol.
            var fileList = evt.dataTransfer.files;
            if ( fileList != null ) {
              for ( var i = 0; i < fileList.length; i++ ) {
                files.push( fileList.item( i ) ); // Add files from the standard FileList.
              }
            }
          }

          // As directory traversal is asynchronous, wait for all processing to complete.
          ( function waitForProcess( delay ) {
            $timeout( function( ) {
              if ( !processing ) { // If no pending asynchronous file processing.
                callback( files ); // Invoke the callback with the collected files.
              } else {
                waitForProcess( 10 ); // Otherwise, wait a short delay and check again.
              }
            }, delay || 0 );
          } )();
        }

        var processing = 0; // Counter to track ongoing asynchronous file processing tasks.

        /**
         * @private
         * @function traverseFileTree
         * @param {Array} files - The array where collected File objects will be stored.
         * @param {FileSystemEntry} entry - The current file system entry (FileEntry or DirectoryEntry) to process.
         * @param {string} [path] - The relative path of the current entry within the dropped structure.
         * @description
         * Recursively traverses a `FileSystemEntry` to extract all files from a dropped item,
         * including files nested within directories.
         */
        function traverseFileTree( files, entry, path ) {
          if ( entry != null ) {
            if ( entry.isDirectory ) {
              var dirReader = entry.createReader();
              processing++; // Increment counter as a directory read operation starts.
              dirReader.readEntries( function( entries ) {
                for ( var i = 0; i < entries.length; i++ ) {
                  traverseFileTree( files, entries[i], ( path ? path : "" ) + entry.name + "/" );
                }
                processing--; // Decrement counter when all entries in this directory are processed.
              } );
            } else {
              processing++; // Increment counter as a file object retrieval starts.
              entry.file( function( file ) {
                processing--; // Decrement counter when the File object is successfully obtained.
                file._relativePath = ( path ? path : "" ) + file.name; // Store relative path.
                files.push( file ); // Add the File object to the collection.
              } );
            }
          }
        }
      }
    };
  } ] );

})();