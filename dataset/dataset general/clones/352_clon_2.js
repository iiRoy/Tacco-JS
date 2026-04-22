// This software is provided under both the GNU General Public License (GPL) and the MIT License.
// See the accompanying license files for full details on usage and distribution.

if ( typeof JQueryLib === 'undefined' ) {
    throw ( "JQueryLib library was not found in the global scope." ) ;
}

( function ( $lib ) {

  $lib.extend ( {
    FormStateEngine: {
      enableLogging          : false, // Should debug messages be displayed? Optimized for browser developer consoles.
      modifiedElementClass   : 'has-modifications',
      applyStyleOn           : new Function(),
      hasDevToolsConsole     : "console" in window && "firebug" in window.console,
      trackHiddenInputs      : false,
      changeDetectionEvent   : 'blur',
      outputLogMessage       : function ( messageText ) {
                                 if ( this.enableLogging ) {
                                   messageText = "FormStateEngine: " + messageText;
                                   this.hasDevToolsConsole ? window.console.log( messageText ) : window.alert( messageText );
                                 }
                               },
      retrieveElementValue   : function ( targetElement ) {
                                 if ( targetElement.is( ':radio,:checkbox' ) ) {
                                   return typeof ( targetElement.prop( "checked" ) ) === "undefined" ? false : targetElement.prop( "checked" );
                                 } else {
                                   return targetElement.val();
                                 }
                               },
      revertElementValue     : function ( targetElement ) {
                                 if ( targetElement.is( ':radio,:checkbox' ) ) {
                                   targetElement.prop( 'checked', targetElement.data( 'originalValue' ) );
                                 } else {
                                   targetElement.val( targetElement.data( 'originalValue' ) );
                                 }
                                 targetElement.trigger( $lib.FormStateEngine.changeDetectionEvent + '.form_monitoring' );
                               },
      elementChangeHandler   : function ( eventObject ) {
                                 var inputNode      = $lib( eventObject.target ),
                                     containingForm = inputNode.parents( '.form_monitored' ),
                                     originalData   = inputNode.data( "originalValue" ),
                                     currentData    = $lib.FormStateEngine.retrieveElementValue( inputNode ),
                                     formElements   = eventObject.data.elements,
                                     configuration  = eventObject.data.config;

                                 // Compare the initial and current input values
                                 if ( originalData !== currentData ) {
                                   $lib.FormStateEngine.outputLogMessage( "Form " + containingForm.attr( 'class' ) + " is modified. Changed from \"" + originalData + "\" to \"" + currentData + "\"" );
                                   $lib.FormStateEngine.outputLogMessage( "Class: " + configuration.modifiedElementClass );
                                   containingForm
                                     .data( "isModified", true )
                                     // Dispatch a custom event to signal form modification
                                     .trigger( "formModified", { source: inputNode, fromValue: originalData, toValue: currentData, preventDefault: function () { return false }, stopPropagation: function () { return false }, bubbles: true, cancelable: true } );
                                   inputNode
                                     .add( configuration.applyStyleOn.apply( inputNode ) )
                                     .addClass( configuration.modifiedElementClass ); // Add a class to indicate modification
                                 } else {
                                   inputNode
                                     .add( configuration.applyStyleOn.apply( inputNode ) )
                                     .removeClass( configuration.modifiedElementClass ); // Remove the class if value reverted
                                 }

                                 // Check if any other inputs in the form are still modified
                                 if ( !formElements.filter( '.' + configuration.modifiedElementClass ).length ) {
                                   containingForm
                                     .data( "isModified", false )
                                     // Dispatch a custom event to signal form restoration
                                     .trigger( "formRestored", { source: inputNode, preventDefault: function () { return false }, stopPropagation: function () { return false }, bubbles: true, cancelable: true } );
                                 }
                               }
    }

  } );

  // Resets the state of a form, clearing all modifications
  $lib.fn.resetFormModifications = function () {
    return this.each( function ( idx, elem ) {
      var currentForm = $lib( this );
      if ( currentForm.is( 'form' ) ) {
        // Use native form reset, then trigger monitoring event on modified fields
        currentForm.get( 0 ).reset();
        currentForm.find( '.' + $lib.FormStateEngine.modifiedElementClass + ':input' ).each( function () {
          $lib( this ).trigger( $lib.FormStateEngine.changeDetectionEvent + '.form_monitoring' );
        } );
      } else {
        var exclusionSelectors = ':submit,:password,:button';
        if ( !$lib.FormStateEngine.trackHiddenInputs ) {
          exclusionSelectors = ':hidden,' + exclusionSelectors;
        }

        $lib( ':input:not(' + exclusionSelectors + ')', currentForm ).each( function () {
          $lib.FormStateEngine.revertElementValue( $lib( this ) );
        } );
      }
    } );
  };

  // Activates change tracking for form elements.
  $lib.fn.enableFormChangeTracking = function () {
    var defaultOptions = {
      modifiedElementClass   : $lib.FormStateEngine.modifiedElementClass,
      applyStyleOn           : $lib.FormStateEngine.applyStyleOn,
      useLiveQuery           : $lib.isFunction( $lib.livequery ) // Check for livequery plugin
    };

    var configuration = $lib.extend( defaultOptions, arguments.length !== 0 ? arguments[0] : {} );

    return this.each( function () {
      var targetForm = $lib( this );

      var filterExpressions = ':submit,:password,:button';
      if ( !configuration.trackHiddenInputs ) {
        filterExpressions = ':hidden,' + filterExpressions;
      }

      var monitoredInputs = $lib( ':input:not(' + filterExpressions + ')', targetForm );

      // If form is already being monitored, remove existing event handlers first
      if ( targetForm.hasClass( 'form_monitored' ) ) {
        targetForm.off( "formModified" ).off( "formRestored" );
        monitoredInputs.off( $lib.FormStateEngine.changeDetectionEvent + ".form_monitoring" );
      } else {
        // Mark this form as being monitored
        $lib( this ).addClass( 'form_monitored' );
      }

      $lib.FormStateEngine.outputLogMessage( 'Storing original data for form element: ' + targetForm.get( 0 ) );

      if ( configuration.useLiveQuery ) {
        // Use livequery for dynamically added elements
        monitoredInputs.livequery( function () {
          $lib( this )
            .on( $lib.FormStateEngine.changeDetectionEvent + ".form_monitoring", { elements: monitoredInputs, config: configuration }, $lib.FormStateEngine.elementChangeHandler )
            .data( 'originalValue', $lib.FormStateEngine.retrieveElementValue( $lib( this ) ) );
        } );
      } else {
        // Bind events directly to existing elements
        monitoredInputs.each( function () {
          $lib( this )
            .on( $lib.FormStateEngine.changeDetectionEvent + ".form_monitoring", { elements: monitoredInputs, config: configuration }, $lib.FormStateEngine.elementChangeHandler )
            .data( "originalValue", $lib.FormStateEngine.retrieveElementValue( $lib( this ) ) );
        } );
      }
    } );
  };

  // This functionality is intended for links that should prevent navigation if unsaved changes exist.
  $lib.fn.unsavedChangesPreventer = function () {
    var defaultSettings = {
      dialogOptions : {
        title: "Warning: Unsaved Modifications!",
        height: 300,
        width: 500,
        modal: true,
        resizable: false,
        autoResize: false,
        overlay: { backgroundColor: "black", opacity: 0.5 }
      },
      warningMessage : '<br/><p>You have made changes to form data without saving them. All your modifications will be lost.</p><p>Are you sure you wish to proceed?</p>'
    };

    var currentSettings = $lib.extend( true, defaultSettings, arguments.length !== 0 ? arguments[0] : {} );

    $lib.FormStateEngine.outputLogMessage( "Configuring unsaved changes prevention mechanisms" );

    return this.each( function () {
      var triggerElement = $lib( this );

      // Handle tab navigation specifically
      if ( $lib( this ).parents( '.ui-tab-navigation' ).length > 0 ) {
        // It seems removing specific tab event handlers caused issues.
        // Re-binding them to ensure consistency.
        var tabContainer = $lib( this ).parents( '.ui-tab-navigation' );
        tabContainer.find( 'a' ).off( 'click.form_monitoring' );
        tabContainer.off( 'tabsselect.form_monitoring' );
        tabContainer.on( 'tabsselect.form_monitoring', function ( eventObject, uiElement ) {
          if ( $lib( '.form_monitored' ).haveUnsavedChanges() ) {
            eventObject.preventDefault();
            var dialogDiv = $lib( "<div id='unsaved_changes_dialog'/>" ).appendTo( document.body );
            // var destinationUrl = $lib(this).attr('href'); // This variable was unused in original logic for tabs
            dialogDiv.dialog( $lib.extend( true, currentSettings.dialogOptions, {
              buttons: {
                ContinueAnyway: function () {
                  var activeTabId = $lib( uiElement.tab ).parent().siblings( '.ui-tabs-selected' ).find( 'a' ).attr( 'href' );
                  // Reset the form in the currently active tab and ensure cleanup
                  $lib( '.form_monitored', activeTabId ).resetFormModifications();

                  // Now that the old tab is clean, select the new tab
                  tabContainer.tabs( 'select', $lib( uiElement.tab ).attr( 'href' ) );

                  // Close and remove the dialog
                  $lib( this ).dialog( 'destroy' ).remove();
                },
                AbortAction: function () { $lib( this ).dialog( 'destroy' ).remove(); }
              }
            } ) ).dialog( "moveToTop" ).append( currentSettings.warningMessage );
            return false;
          }
        } );
      } else {
        // Handle regular links
        triggerElement.off( 'click.form_monitoring' );
        triggerElement.on( 'click.form_monitoring', function ( eventObject ) {
          if ( $lib( '.form_monitored' ).haveUnsavedChanges() ) {
            eventObject.preventDefault();
            var dialogDiv = $lib( "<div id='unsaved_changes_dialog'/>" ).appendTo( document.body ),
                targetLink = $lib( this ).attr( 'href' );
            dialogDiv.dialog( $lib.extend( true, {
              buttons: {
                ContinueAction: function () { window.location.href = targetLink; },
                CancelAction: function () { $lib( this ).dialog( 'destroy' ).remove(); return false; }
              }
            }, currentSettings.dialogOptions ) ).dialog( "moveToTop" ).append( currentSettings.warningMessage );
          }
        } );
      }
    } );
  };

  // Not chainable.
  // Returns true if any monitored forms on the page have unsaved modifications.
  $lib.fn.haveUnsavedChanges = function () {
    var isAnyModified = false;
    this.each( function () {
      if ( $lib( this ).data( 'isModified' ) ) {
        isAnyModified = true;
      }
    } );
    return isAnyModified;
  };

  // This function is purely for demonstration and testing purposes.
  $lib.fn.formStateTester = function () {
    $lib.FormStateEngine.outputLogMessage( "Initializing form state testing utility!" );

    return this.each( function () {
      var testButton = $lib( this );
      testButton.on( 'click', function () {
        if ( $lib( "form" ).haveUnsavedChanges() ) {
          window.alert( "Form has unsaved changes!" );
        } else {
          window.alert( "All forms are clean!" );
        }
      } );
    } );
  };

  // Shorthand methods to attach handlers for custom form state events
  $lib.fn.extend( {
    formModified: function ( callbackFunction ) {
      return this.on( 'formModified', callbackFunction );
    },
    formRestored: function ( callbackFunction ) {
      return this.on( 'formRestored', callbackFunction );
    }
  } );
} )( JQueryLib );