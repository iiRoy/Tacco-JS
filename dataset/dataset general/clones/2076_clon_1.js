// This file is a clone of the jQuery File Upload User Interface Plugin,
// originally developed by Sebastian Tschan.
// All original logic and identifiers are preserved.
// Changes are limited to whitespace and comments only, as per Type I clone definition.

// Original license information:
/*
 * jQuery File Upload User Interface Plugin 6.7
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

// Original JSLint and global declarations:
/*jslint nomen: true, unparam: true, regexp: true */
/*global define, window, document, URL, webkitURL, FileReader */


( function( factory ) {
  'use strict';
  // Check for AMD loader and define module if available.
  // This block handles module registration for environments like RequireJS.
  if ( typeof define === 'function' && define.amd ) {
    define( [
      'jquery',
      'tmpl',
      'load-image',
      './jquery.fileupload-fp'
    ], factory );
  } else {
    // If no AMD, assume browser globals and pass them directly.
    // This makes the plugin available globally under jQuery.
    factory(
      window.jQuery,
      window.tmpl,
      window.loadImage
    );
  }
} ( function( $, tmpl, loadImage ) {
  'use strict';

  // The UI version extends the FP (file processing) version
  // or the basic file upload widget.
  // It provides comprehensive user interface interaction.
  var parentWidget = ( $.blueimpFP || $.blueimp ).fileupload;

  // Define the jQuery UI widget.
  $.widget( 'blueimpUI.fileupload', parentWidget, {

    options: {
      // Automatic upload setting:
      // Set to true to enable uploads as soon as files are added.
      autoUpload: false,

      // Maximum number of files allowed for upload.
      // Undefined means no limit.
      maxNumberOfFiles: undefined,

      // Maximum allowed file size in bytes.
      maxFileSize: undefined,

      // Minimum allowed file size in bytes.
      minFileSize: undefined,

      // Regular expression for allowed file types.
      // Matches against file type or file name.
      acceptFileTypes: /.+$/i,

      // Regular expression for files that should have a preview image.
      // Matches against the file type.
      previewSourceFileTypes: /^image\/(gif|jpeg|png)$/,

      // Maximum size of source files for preview generation.
      previewSourceMaxFileSize: 5000000, // 5MB

      // Maximum width for generated preview images.
      previewMaxWidth: 80,

      // Maximum height for generated preview images.
      previewMaxHeight: 80,

      // Flag to determine if previews are rendered as canvas elements.
      // Set to false to always use img elements.
      previewAsCanvas: true,

      // ID of the template used for displaying files during upload.
      uploadTemplateId: 'template-upload',

      // ID of the template used for displaying files after download/completion.
      downloadTemplateId: 'template-download',

      // Container for the list of files.
      // If undefined, it defaults to an element with class "files" inside the widget.
      filesContainer: undefined,

      // Determines if new files are prepended or appended to the files container.
      prependFiles: false,

      // Expected data type for the upload response.
      // This sets the dataType option for $.ajax upload requests.
      dataType: 'json',


      // Callback function for when files are added to the widget.
      // Triggered by file input selection, drag & drop, or API calls.
      add: function( e, data ) {
        var that = $( this ).data( 'fileupload' ),
          options = that.options,
          files = data.files;

        // Process files, then adjust file count and validate.
        $( this ).fileupload( 'process', data ).done( function() {
          that._adjustMaxNumberOfFiles( -files.length );
          data.isAdjusted = true;
          data.files.valid = data.isValidated = that._validate( files );

          // Render upload template and append/prepend to container.
          data.context = that._renderUpload( files ).data( 'data', data );
          options.filesContainer[
            options.prependFiles ? 'prepend' : 'append'
          ]( data.context );

          // Render previews and initiate transitions.
          that._renderPreviews( files, data.context );
          that._forceReflow( data.context );
          that._transition( data.context ).done(
            function() {
              // Trigger 'added' event and automatically submit if conditions met.
              if ( ( that._trigger( 'added', e, data ) !== false ) &&
                ( options.autoUpload || data.autoUpload ) &&
                data.autoUpload !== false && data.isValidated ) {
                data.submit();
              }
            }
          );
        } );
      },


      // Callback function for the start of each file upload request.
      send: function( e, data ) {
        var that = $( this ).data( 'fileupload' );

        // Validate files if not already validated.
        if ( !data.isValidated ) {
          if ( !data.isAdjusted ) {
            that._adjustMaxNumberOfFiles( -data.files.length );
          }
          if ( !that._validate( data.files ) ) {
            return false; // Prevent upload if validation fails.
          }
        }

        // Handle progress bar for iframe transport, which lacks progress events.
        if ( data.context && data.dataType &&
          data.dataType.substr( 0, 6 ) === 'iframe' ) {
          data.context
            .find( '.progress' ).addClass(
              !$.support.transition && 'progress-animated'
            )
            .find( '.bar' ).css(
              'width',
              parseInt( 100, 10 ) + '%'
            );
        }

        // Trigger 'sent' event.
        return that._trigger( 'sent', e, data );
      },


      // Callback function for successful uploads.
      done: function( e, data ) {
        var that = $( this ).data( 'fileupload' ),
          template,
          preview;

        if ( data.context ) {
          data.context.each( function( index ) {
            var file = ( $.isArray( data.result ) &&
              data.result[ index ] ) || { error: 'emptyResult' };

            // If an error occurred, adjust the max number of files.
            if ( file.error ) {
              that._adjustMaxNumberOfFiles( 1 );
            }

            // Transition the upload context.
            that._transition( $( this ) ).done(
              function() {
                var node = $( this );
                // Render the download template and replace the upload node.
                template = that._renderDownload( [ file ] )
                  //.css('height', node.height()) // Original commented line, kept as is.
                  .replaceAll( node );
                that._forceReflow( template );
                that._transition( template ).done(
                  function() {
                    data.context = $( this );
                    that._trigger( 'completed', e, data );
                  }
                );
              }
            );
          } );
        } else {
          // If no context, append the download template directly.
          template = that._renderDownload( data.result )
            .appendTo( that.options.filesContainer );
          that._forceReflow( template );
          that._transition( template ).done(
            function() {
              data.context = $( this );
              that._trigger( 'completed', e, data );
            }
          );
        }
      },


      // Callback function for failed uploads (abort or error).
      fail: function( e, data ) {
        var that = $( this ).data( 'fileupload' ),
          template;

        // Adjust file count.
        that._adjustMaxNumberOfFiles( data.files.length );

        if ( data.context ) {
          data.context.each( function( index ) {
            if ( data.errorThrown !== 'abort' ) {
              var file = data.files[ index ];
              file.error = file.error || data.errorThrown ||
                true; // Assign error message.

              // Transition the context and render download template with error.
              that._transition( $( this ) ).done(
                function() {
                  var node = $( this );
                  template = that._renderDownload( [ file ] )
                    .replaceAll( node );
                  that._forceReflow( template );
                  that._transition( template ).done(
                    function() {
                      data.context = $( this );
                      that._trigger( 'failed', e, data );
                    }
                  );
                }
              );
            } else {
              // If aborted, just remove the context.
              that._transition( $( this ) ).done(
                function() {
                  $( this ).remove();
                  that._trigger( 'failed', e, data );
                }
              );
            }
          } );
        } else if ( data.errorThrown !== 'abort' ) {
          // If no context and not aborted, re-render upload with error.
          that._adjustMaxNumberOfFiles( -data.files.length );
          data.context = that._renderUpload( data.files )
            .appendTo( that.options.filesContainer )
            .data( 'data', data );
          that._forceReflow( data.context );
          that._transition( data.context ).done(
            function() {
              data.context = $( this );
              that._trigger( 'failed', e, data );
            }
          );
        } else {
          // If aborted and no context, just trigger failed.
          that._trigger( 'failed', e, data );
        }
      },


      // Callback for upload progress events.
      progress: function( e, data ) {
        if ( data.context ) {
          data.context.find( '.progress .bar' ).css(
            'width',
            parseInt( data.loaded / data.total * 100, 10 ) + '%'
          );
        }
      },


      // Callback for global upload progress events.
      progressall: function( e, data ) {
        $( this ).find( '.fileupload-buttonbar .progress .bar' ).css(
          'width',
          parseInt( data.loaded / data.total * 100, 10 ) + '%'
        );
      },


      // Callback for uploads start, equivalent to global ajaxStart.
      start: function( e ) {
        var that = $( this ).data( 'fileupload' );
        that._transition( $( this ).find( '.fileupload-buttonbar .progress' ) ).done(
          function() {
            that._trigger( 'started', e );
          }
        );
      },


      // Callback for uploads stop, equivalent to global ajaxStop.
      stop: function( e ) {
        var that = $( this ).data( 'fileupload' );
        that._transition( $( this ).find( '.fileupload-buttonbar .progress' ) ).done(
          function() {
            $( this ).find( '.bar' ).css( 'width', '0%' );
            that._trigger( 'stopped', e );
          }
        );
      },


      // Callback for file deletion.
      destroy: function( e, data ) {
        var that = $( this ).data( 'fileupload' );

        // If a URL is provided, send an AJAX delete request.
        if ( data.url ) {
          $.ajax( data );
        }

        that._adjustMaxNumberOfFiles( 1 ); // Increment max file count.

        // Transition and remove the file context.
        that._transition( data.context ).done(
          function() {
            $( this ).remove();
            that._trigger( 'destroyed', e, data );
          }
        );
      }
    }, // End of options.


    // Enables drag & drop download functionality for links.
    _enableDragToDesktop: function() {
      var link = $( this ),
        url = link.prop( 'href' ),
        name = link.prop( 'download' ),
        type = 'application/octet-stream';

      link.bind( 'dragstart', function( e ) {
        try {
          e.originalEvent.dataTransfer.setData(
            'DownloadURL',
            [ type, name, url ].join( ':' )
          );
        } catch ( err ) {
          // Ignore errors, some browsers might not support this.
        }
      } );
    },


    // Adjusts the maximum number of files allowed based on the operand.
    _adjustMaxNumberOfFiles: function( operand ) {
      if ( typeof this.options.maxNumberOfFiles === 'number' ) {
        this.options.maxNumberOfFiles += operand;
        if ( this.options.maxNumberOfFiles < 1 ) {
          this._disableFileInputButton();
        } else {
          this._enableFileInputButton();
        }
      }
    },


    // Formats a file size in bytes to a human-readable string (e.g., KB, MB, GB).
    _formatFileSize: function( bytes ) {
      if ( typeof bytes !== 'number' ) {
        return '';
      }
      if ( bytes >= 1000000000 ) {
        return ( bytes / 1000000000 ).toFixed( 2 ) + ' GB';
      }
      if ( bytes >= 1000000 ) {
        return ( bytes / 1000000 ).toFixed( 2 ) + ' MB';
      }
      return ( bytes / 1000 ).toFixed( 2 ) + ' KB';
    },


    // Checks a file for various validation errors (size, type, count).
    _hasError: function( file ) {
      if ( file.error ) {
        return file.error;
      }
      // If maxNumberOfFiles is less than 0, it means the limit is exceeded.
      if ( this.options.maxNumberOfFiles < 0 ) {
        return 'maxNumberOfFiles';
      }
      // Check file type/name against acceptFileTypes regex.
      if ( !( this.options.acceptFileTypes.test( file.type ) ||
          this.options.acceptFileTypes.test( file.name ) ) ) {
        return 'acceptFileTypes';
      }
      // Check maximum file size.
      if ( this.options.maxFileSize &&
        file.size > this.options.maxFileSize ) {
        return 'maxFileSize';
      }
      // Check minimum file size.
      if ( typeof file.size === 'number' &&
        file.size < this.options.minFileSize ) {
        return 'minFileSize';
      }
      return null; // No error.
    },


    // Validates a list of files using _hasError.
    _validate: function( files ) {
      var that = this,
        valid = !!files.length; // Assume valid if files exist.
      $.each( files, function( index, file ) {
        file.error = that._hasError( file );
        if ( file.error ) {
          valid = false; // Mark as invalid if any file has an error.
        }
      } );
      return valid;
    },


    // Renders a template using the provided function and data.
    _renderTemplate: function( func, files ) {
      if ( !func ) {
        return $(); // Return empty jQuery object if no template function.
      }
      var result = func( {
        files: files,
        formatFileSize: this._formatFileSize,
        options: this.options
      } );
      if ( result instanceof $ ) {
        return result; // Return directly if it's already a jQuery object.
      }
      return $( this.options.templatesContainer ).html( result ).children();
    },


    // Renders a single preview image for a file.
    _renderPreview: function( file, node ) {
      var that = this,
        options = this.options,
        dfd = $.Deferred();

      return ( ( loadImage && loadImage(
        file,
        function( img ) {
          node.append( img );
          that._forceReflow( node );
          that._transition( node ).done( function() {
            dfd.resolveWith( node );
          } );
          // If the node is not in the DOM, transition events won't fire,
          // so resolve manually.
          if ( !$.contains( document.body, node[ 0 ] ) ) {
            dfd.resolveWith( node );
          }
        },
        {
          maxWidth: options.previewMaxWidth,
          maxHeight: options.previewMaxHeight,
          canvas: options.previewAsCanvas
        }
      ) ) || dfd.resolveWith( node ) ) && dfd;
    },


    // Renders multiple preview images for a list of files.
    _renderPreviews: function( files, nodes ) {
      var that = this,
        options = this.options;
      nodes.find( '.preview span' ).each( function( index, element ) {
        var file = files[ index ];
        // Check if file type and size are suitable for preview.
        if ( options.previewSourceFileTypes.test( file.type ) &&
          ( $.type( options.previewSourceMaxFileSize ) !== 'number' ||
            file.size < options.previewSourceMaxFileSize ) ) {
          that._processingQueue = that._processingQueue.pipe( function() {
            var dfd = $.Deferred();
            that._renderPreview( file, $( element ) ).done(
              function() {
                dfd.resolveWith( that );
              }
            );
            return dfd.promise();
          } );
        }
      } );
      return this._processingQueue;
    },


    // Renders the upload template for given files.
    _renderUpload: function( files ) {
      return this._renderTemplate(
        this.options.uploadTemplate,
        files
      );
    },


    // Renders the download template for given files.
    _renderDownload: function( files ) {
      return this._renderTemplate(
        this.options.downloadTemplate,
        files
      ).find( 'a[download]' ).each( this._enableDragToDesktop ).end();
    },


    // Handler for the 'start' button click.
    _startHandler: function( e ) {
      e.preventDefault();
      var button = $( this ),
        template = button.closest( '.template-upload' ),
        data = template.data( 'data' );

      // If data and submit function exist, and not already submitting, initiate upload.
      if ( data && data.submit && !data.jqXHR && data.submit() ) {
        button.prop( 'disabled', true ); // Disable button after submission.
      }
    },


    // Handler for the 'cancel' button click.
    _cancelHandler: function( e ) {
      e.preventDefault();
      var template = $( this ).closest( '.template-upload' ),
        data = template.data( 'data' ) || {};

      if ( !data.jqXHR ) {
        // If no active AJAX request, mark as aborted and trigger fail.
        data.errorThrown = 'abort';
        e.data.fileupload._trigger( 'fail', e, data );
      } else {
        data.jqXHR.abort(); // Abort the ongoing AJAX request.
      }
    },


    // Handler for the 'delete' button click.
    _deleteHandler: function( e ) {
      e.preventDefault();
      var button = $( this );

      // Trigger 'destroy' event with relevant data for deletion.
      e.data.fileupload._trigger( 'destroy', e, {
        context: button.closest( '.template-download' ),
        url: button.attr( 'data-url' ),
        type: button.attr( 'data-type' ) || 'DELETE',
        dataType: e.data.fileupload.options.dataType
      } );
    },


    // Forces a reflow/repaint of the DOM element to ensure transitions work correctly.
    _forceReflow: function( node ) {
      this._reflow = $.support.transition &&
        node.length && node[ 0 ].offsetWidth;
    },


    // Handles CSS transitions for elements with 'fade' class.
    _transition: function( node ) {
      var that = this,
        dfd = $.Deferred();

      if ( $.support.transition && node.hasClass( 'fade' ) ) {
        node.bind(
          $.support.transition.end,
          function( e ) {
            // Ensure we only respond to the transition event for the node itself.
            if ( e.target === node[ 0 ] ) {
              node.unbind( $.support.transition.end );
              dfd.resolveWith( node );
            }
          }
        ).toggleClass( 'in' ); // Toggle the 'in' class to start/end transition.
      } else {
        node.toggleClass( 'in' ); // No transition, just toggle class.
        dfd.resolveWith( node );
      }
      return dfd;
    },


    // Initializes event handlers for buttons in the button bar.
    _initButtonBarEventHandlers: function() {
      var fileUploadButtonBar = this.element.find( '.fileupload-buttonbar' ),
        filesList = this.options.filesContainer,
        // ... (rest of the _initButtonBarEventHandlers method would follow)
        // This is a partial method, assuming it continues.
        // For Type I clone, I will not complete it if the original is truncated.
        // The original snippet was cut off here.
        // If it were a full method, I'd continue cloning it.
        // As it is, I'll stop here to match the input.
        ; // End of the given code snippet.
    }
  } );
} ) );