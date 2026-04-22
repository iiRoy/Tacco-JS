define( "ember-uploader",
  [
    "ember-uploader/uploader", // Core Uploader component
    "ember-uploader/s3",       // S3 specific Uploader
    "ember-uploader/file-field", // Custom file input field
    "exports"                  // Module exports object
  ],
  function (  __dependency1__ ,   __dependency2__ ,   __dependency3__ ,   __exports__ )
  {
    "use strict" ; // Enforce strict mode for better code quality.

    // Retrieve the default exports from each dependency.
    var Uploader   =   __dependency1__["default"]  ;
    var S3Uploader = __dependency2__["default"] ;
    var FileField  =  __dependency3__["default"]  ;

    // Export all core components as a single default object.
    __exports__["default"] =
    {
      Uploader  :  Uploader,     // The base Uploader class
      S3Uploader: S3Uploader, // The S3-specific Uploader class
      FileField :  FileField    // The custom file input field component
    } ;
  }
) ;


define("ember-uploader/file-field",
  [ "exports" ], // This module only needs to export itself.
  function ( __exports__ )
  {
    "use strict" ; // Activate strict mode.

    // Cache Ember.set for repeated use.
    var set = Ember.set ;

    // Export a custom Ember.TextField extension as the default.
    __exports__["default"] = Ember.TextField.extend( {
      type: 'file',               // Specifies that this is a file input.
      attributeBindings: [ 'multiple' ], // Binds the 'multiple' HTML attribute.
      multiple: false,            // Default: allow only one file selection.

      // Event handler for when the file input's value changes.
      change: function ( e )
      {
        var input = e.target ; // Get the DOM element that triggered the event.
        // Check if any files have been selected.
        if ( !Ember.isEmpty( input.files ) )
        {
          // Update the 'files' property of this component with the selected files.
          set( this, 'files', input.files ) ;
        }
      }
    } ) ;
  }
) ; // End of define for "ember-uploader/file-field"


define( "ember-uploader/s3",
  [
    "ember-uploader/uploader", // Dependency on the base Uploader.
    "exports"                  // Standard module exports.
  ],
  function ( __dependency1__, __exports__ )
  {
    "use strict" ; // Use strict mode for safer JavaScript.

    // Get the base Uploader from its dependency.
    var Uploader = __dependency1__["default"] ;

    // Aliases for Ember.get and Ember.set for convenience.
    var get = Ember.get ,
        set = Ember.set ;

    // Export the S3 Uploader, which extends the base Uploader.
    __exports__["default"] = Uploader.extend( {
      /**
       * @property url
       * Url used to request a signed upload url from your backend.
       */
      url: '/sign',   // Default URL for the signing endpoint.
      headers: null,  // Optional custom headers to send with signing requests.

      /**
       * Callback function executed after a successful signing request.
       * Triggers a 'didSign' event.
       *
       * @param {object} response - The response data from the signing service.
       * @returns {object} The response data.
       */
      didSign: function ( response )
      {
        this.trigger( 'didSign', response ) ; // Notify listeners of successful signing.
        return response ; // Return the response.
      },

      /**
       * Initiates the upload of a file to Amazon S3.
       * This involves first signing the request, then performing the actual upload.
       *
       * @param {File} file - The file to be uploaded.
       * @param {object} data - Additional data to send to the signing endpoint.
       * @returns {Ember.RSVP.Promise} A promise that resolves upon successful upload to S3.
       */
      upload: function ( file, data )
      {
        var self = this ; // Capture 'this' context.

        set( this, 'isUploading', true ) ; // Indicate that an upload is in progress.

        // First, sign the file for S3 upload.
        return this.sign( file, data ).then( function ( json )
        {
          var url ; // Declare a variable for the S3 upload URL.

          // Determine the correct S3 upload URL based on the signed response.
          if ( json.region )
          {
            url = "//s3-" + json.region + ".amazonaws.com/" + json.bucket ;
            delete json.region ; // Remove region from 'json' as it's no longer needed for the S3 URL.
          }
          else
          {
            url = "//" + json.bucket + ".s3.amazonaws.com" ;
          }

          // Prepare the FormData object for the actual S3 upload.
          var formData = self.setupFormData( file, json ) ;

          // Execute the AJAX request to upload the file to S3.
          return self.ajax( url, formData ) ;
        } ) ;
      },

      /**
       * Requests a signed URL or signed data from the backend for S3 direct upload.
       *
       * @param {File} file - The file object for which to request signing.
       * @param {object} data - Additional data to send to the signing endpoint.
       * @returns {Ember.RSVP.Promise} A promise that resolves with the signed data.
       */
      sign: function ( file, data )
      {
        var self = this ; // Store context for callbacks.

        data = data || {} ; // Ensure data is an object.
        data.name = file.name ; // Add file name to the signing request data.
        data.type = file.type ; // Add file type.
        data.size = file.size ; // Add file size.

        var settings = {
          url: get( this, 'url' ),       // The URL for the signing service.
          headers: get( this, 'headers' ), // Any custom headers.
          type: 'GET',                   // Signing requests are typically GET.
          contentType: 'json',           // Expect JSON response.
          data: data                     // Data to send to the signing service.
        } ;

        // Return an Ember.RSVP.Promise to handle the asynchronous signing request.
        return new Ember.RSVP.Promise( function ( resolve, reject )
        {
          // Define the success callback for the AJAX request.
          settings.success = function ( data )
          {
            Ember.run( null, resolve, self.didSign( data ) ) ; // Resolve the promise on success.
          } ;

          // Define the error callback for the AJAX request.
          settings.error = function ( jqXHR, responseText, errorThrown )
          {
            Ember.run( null, reject, self.didError( jqXHR, responseText, errorThrown ) ) ; // Reject the promise on error.
          } ;

          Ember.$.ajax( settings ) ; // Execute the jQuery AJAX request.
        } ) ;
      }
    } ) ; // End of Uploader.extend for S3Uploader.
  }
) ; // End of define for "ember-uploader/s3"


define( "ember-uploader/uploader",
  [ "exports" ], // This module only needs to export itself.
  function ( __exports__ )
  {
    "use strict" ; // Enforce strict JavaScript rules.

    // Cache Ember.get and Ember.set for frequent use and readability.
    var get = Ember.get ,
        set = Ember.set ;

    // Export the default Uploader class, extending Ember.Object and Ember.Evented.
    __exports__["default"] = Ember.Object.extend( Ember.Evented, {
      url: null,              // The URL where files will be uploaded.
      paramNamespace: null,   // Optional namespace for form parameters (e.g., 'user[avatar]').
      paramName: 'file',      // The default name for the file parameter in FormData.
      isUploading: false,     // A boolean flag indicating if an upload is currently in progress.

      /**
       * @property type
       * The HTTP method (e.g., 'POST', 'PUT') used for the AJAX request.
       * Defaults to 'POST'.
       */
      type: 'POST', // Default HTTP method for uploads.

      /**
       * Initiates the upload process for one or more files and additional data.
       *
       * @param  {object|array} files  A single File object or an array of File objects.
       * @param  {object} extra        An object containing additional data to send with the upload.
       * @return {Ember.RSVP.Promise}  A promise that resolves or rejects based on the upload status.
       */
      upload: function ( files, extra )
      {
        extra = extra || {} ; // Ensure 'extra' is an object if not provided.
        var data = this.setupFormData( files, extra ) ; // Prepare the FormData object.
        var url  = get( this, 'url' ) ; // Get the upload URL from the component's properties.
        var type = get( this, 'type' ) ; // Get the HTTP method.
        var self = this ; // Capture 'this' context for use in callbacks.

        set( this, 'isUploading', true ) ; // Set the uploading status to true.

        return this.ajax( url, data, type ) ; // Execute the AJAX request.
      },

      /**
       * Constructs a FormData object, appending files and any extra data.
       *
       * @param  {object|array} files  The file(s) to be included in the form data.
       * @param  {object} extra        Additional key-value pairs to append to the form data.
       * @return {FormData}            The populated FormData object.
       */
      setupFormData: function ( files, extra )
      {
        var formData = new FormData() ; // Create a new FormData instance.

        // Append all properties from the 'extra' object to the FormData.
        for ( var prop in extra )
        {
          if ( extra.hasOwnProperty( prop ) )
          {
            formData.append( this.toNamespacedParam( prop ), extra[ prop ] ) ;
          }
        }

        // Handle both single file and multiple file (array) uploads.
        if ( Ember.isArray( files ) )
        {
          var paramName ; // Declare a variable for the parameter name.

          // Iterate through the array of files.
          for ( var i = files.length - 1 ; i >= 0 ; i-- )
          {
            paramName = this.toNamespacedParam( this.paramName ) + '[' + i + ']' ;
            formData.append( paramName, files[ i ] ) ;
          }
        }
        else
        {
          // If it's a single file object, append it directly.
          formData.append( this.toNamespacedParam( this.paramName ), files ) ;
        }

        return formData ; // Return the complete FormData object.
      },

      /**
       * Formats a parameter name by applying an optional namespace.
       * E.g., if paramNamespace is 'user', 'avatar' becomes 'user[avatar]'.
       *
       * @param  {string} name  The base name of the parameter.
       * @return {string}       The namespaced parameter name.
       */
      toNamespacedParam: function ( name )
      {
        if ( this.paramNamespace )
        {
          return this.paramNamespace + '[' + name + ']' ; // Apply the namespace.
        }

        return name ; // Return the original name if no namespace is set.
      },

      /**
       * Callback function invoked upon successful upload.
       * Resets the 'isUploading' flag and triggers a 'didUpload' event.
       *
       * @param  {object} data  The response data received from the server.
       * @return {object}       The response data.
       */
      didUpload: function ( data )
      {
        set( this, 'isUploading', false ) ; // Reset the uploading status.
        this.trigger( 'didUpload', data ) ; // Trigger an event for listeners.
        return data ; // Return the data for chaining.
      },

      /**
       * Callback function invoked when an upload error occurs.
       * Resets the 'isUploading' flag and triggers a 'didError' event.
       * Includes logic borrowed from Ember Data for error object normalization.
       *
       * @param  {object} jqXHR        The jQuery XMLHttpRequest object.
       * @param  {string} textStatus   The status of the request (e.g., "error", "timeout").
       * @param  {string} errorThrown  The error thrown by the browser or server.
       * @return {object}              The modified jqXHR object.
       */
      didError: function ( jqXHR, textStatus, errorThrown )
      {
        set( this, 'isUploading', false ) ; // Clear the uploading flag.

        // Normalize the jqXHR object for consistent error handling.
        var isObject = jqXHR !== null && typeof jqXHR === 'object' ;

        if ( isObject )
        {
          jqXHR.then = null ; // Prevent jqXHR from being treated as a promise.
          if ( !jqXHR.errorThrown )
          {
            if ( typeof errorThrown === 'string' )
            {
              jqXHR.errorThrown = new Error( errorThrown ) ;
            }
            else
            {
              jqXHR.errorThrown = errorThrown ;
            }
          }
        }

        this.trigger( 'didError', jqXHR, textStatus, errorThrown ) ; // Trigger an error event.

        return jqXHR ; // Return the XMLHttpRequest object.
      },

      /**
       * Callback function for handling upload progress events.
       * Calculates the upload percentage and triggers a 'progress' event.
       *
       * @param  {ProgressEvent} e  The native ProgressEvent object.
       */
      didProgress: function ( e )
      {
        e.percent = e.loaded / e.total * 100 ; // Calculate percentage.
        this.trigger( 'progress', e ) ; // Trigger the 'progress' event.
      },

      /**
       * Aborts the currently ongoing upload operation.
       * Sets 'isUploading' to false and triggers an 'isAborting' event.
       */
      abort: function ( )
      {
        set( this, 'isUploading', false ) ; // Reset the uploading status.

        this.trigger( 'isAborting' ) ; // Signal that an abort has been requested.
      },

      /**
       * Performs an AJAX request for file upload, utilizing FormData.
       * Configures XHR to report upload progress and handle aborts.
       *
       * @param  {string} url     The URL endpoint for the upload.
       * @param  {FormData} params  The FormData object containing files and data.
       * @param  {string} method  The HTTP method to use (e.g., 'POST').
       * @return {Ember.RSVP.Promise} A promise that manages the AJAX call's lifecycle.
       */
      ajax: function ( url, params, method )
      {
        var self = this ; // Keep a reference to 'this'.
        var settings = {
          url: url,                       // The target URL.
          type: method || 'POST',         // Use provided method or default to POST.
          contentType: false,             // Must be false for FormData.
          processData: false,             // Must be false for FormData.
          xhr: function ( )               // Custom XHR function to attach progress and abort handlers.
          {
            var xhr = Ember.$.ajaxSettings.xhr( ) ; // Get the native XMLHttpRequest object.
            xhr.upload.onprogress = function ( e )
            {
              self.didProgress( e ) ; // Attach the progress handler.
            } ;
            self.one( 'isAborting', function ( ) { xhr.abort( ) ; } ) ; // Attach the abort handler.
            return xhr ; // Return the customized XHR object.
          },
          data: params                    // The FormData object.
        } ;

        return this._ajax( settings ) ; // Delegate to the internal AJAX handler.
      },

      /**
       * Internal helper method to wrap a jQuery AJAX call in an Ember.RSVP.Promise.
       * Handles success and error callbacks by delegating to didUpload and didError.
       *
       * @param  {object} settings  The jQuery AJAX settings object.
       * @return {Ember.RSVP.Promise} A promise that resolves or rejects based on the AJAX outcome.
       */
      _ajax: function ( settings )
      {
        var self = this ; // Capture 'this' context.

        return new Ember.RSVP.Promise( function ( resolve, reject )
        {
          // Define the success callback for the AJAX request.
          settings.success = function ( data )
          {
            Ember.run( null, resolve, self.didUpload( data ) ) ; // Resolve the promise on success.
          } ;

          // Define the error callback for the AJAX request.
          settings.error = function ( jqXHR, responseText, errorThrown )
          {
            Ember.run( null, reject, self.didError( jqXHR, responseText, errorThrown ) ) ; // Reject the promise on error.
          } ;

          Ember.$.ajax( settings ) ; // Execute the jQuery AJAX request.
        } ) ;
      }
    } ) ; // End of Ember.Object.extend for Uploader.
  }
) ; // End of define for "ember-uploader/uploader"