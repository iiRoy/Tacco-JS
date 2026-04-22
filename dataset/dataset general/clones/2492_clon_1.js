angular . module ( 'ng-atp' ) // Main module definition for ng-atp library
  // The primary directive 'ngAtp'
  .directive(
    'ngAtp' ,
    [ '$parse' ,
      function( $parse ) { // Dependency injection for $parse service
          /*
           * This directive serves as a container for other ATP-related directives.
           * It sets up the main scope and controller.
           */
          return {
            restrict   : 'AE' , // Can be used as an attribute or element
            compile    : ATP$Directive$compileATP , // Custom compile function
            scope      : true , // Create an isolated scope for the directive
            controller : 'ATPMainCtrl' // Associate with the ATPMainCtrl
          };

          /**
           * Compile function for the ngAtp directive.
           * @param {object} tElement - The template element.
           * @param {object} attrs    - The element's attributes.
           * @returns {function} A post-link function.
           */
          function ATP$Directive$compileATP( tElement , attrs ) {
            // The post-link function
            return function ( scope , element , attrs ) {
              // This directive's link function currently does nothing specific.
              // Logic is mostly handled by the controller and child directives.
            };
          }

      }
    ]
  ) // End of ngAtp directive definition

  // Directive for the input field where autocompletion happens
  .directive(
    'ngAtpInput' ,
    [ '$compile' , '$parse' , '$document' , '$timeout' , 'ATPhelpers' , 'ATPEvents' , // Injected services and custom factories
      function ( $compile , $parse , $document , $timeout , helpers , events ) {
        return {
          restrict : 'A' , // Restrict to attribute only
          require  : '^ngAtp' , // Requires the parent 'ngAtp' directive
          terminal : true , // Prevents other directives on the same element from running
          compile  : ATP$Directive$compileATPInput , // Custom compile function for the input
          scope    : false // Use the parent scope (from ngAtp directive)
        };

        /**
         * Compile function for the ngAtpInput directive.
         * This function prepares the element before linking.
         * @param {object} tElement - The template element.
         * @param {object} attrs    - The element's attributes.
         * @returns {function} The post-link function.
         */
        function ATP$Directive$compileATPInput ( tElement , attrs ) {
          // Check if ng-model is present. If not, we need to add it and recompile.
          var require_recompile = ! attrs . ngModel ;

          // If ng-model is missing, add 'ng-model="ATP.query"' to the element.
          if ( require_recompile ) {
            tElement . attr ( 'ng-model' , 'ATP.query' ) ;
          }

          // Return the post-link function.
          return function ( scope , inputElement , attrs ) {
            // If the element was recompiled due to missing ng-model,
            // recompile it with the added ng-model and then exit.
            if ( require_recompile ) {
              $compile ( inputElement ) ( scope ) ;
              return ; // Stop further linking for this instance as it's recompiled
            }

            // Create the hint element that displays the suggestion preview.
            var hint = bulidHint ( inputElement ) ;

            // Set ng-show for the hint based on ATP.showSuggestions.
            hint . attr ( 'ng-show' , 'ATP.showSuggestions' ) ;

            // Insert the hint element before the input element in the DOM.
            inputElement . parent () [ 0 ] . insertBefore ( hint [ 0 ] , inputElement [ 0 ] ) ;

            // Compile the hint element against the current scope.
            $compile ( hint ) ( scope ) ;

            // Bind keydown event to the input element for navigation and completion logic.
            inputElement . bind ( 'keydown' , function ( event ) {
              // Clear the hint value on every keydown.
              hint . val ( '' ) ;

              // Handle different key codes for navigation and actions.
              if ( event . keyCode == 40 ) { // Down arrow key
                // Prevent default behavior if there are suggestions to navigate.
                if ( scope . ATP . suggestions . length > 0 ) {
                  event . preventDefault ( ) ;
                }
                // Select the next suggestion in the list.
                scope . $apply ( function ( ) {
                  scope . ATP . select ( scope . ATP . selected + 1 ) ;
                } ) ;
              } else if ( event . keyCode == 38 ) { // Up arrow key
                // Prevent default behavior if there are suggestions to navigate.
                if ( scope . ATP . suggestions . length > 0 ) {
                  event . preventDefault ( ) ;
                }
                // Select the previous suggestion in the list.
                scope . $apply ( function ( ) {
                  scope . ATP . select ( scope . ATP . selected - 1 ) ;
                } ) ;
              } else if ( event . keyCode == 13 ) { // Enter key
                event . preventDefault ( ) ; // Prevent form submission or new line
                scope . $apply ( function ( ) {
                  // Attempt to complete the suggestion.
                  if ( scope . ATP . tryComplete ( ) ) {
                    // Emit a COMPLETE event if autocompletion was successful.
                    scope . $emit ( events . COMPLETE , {
                      value       : scope . ATP . importValue ( ) ,
                      triggeredBy : events . triggers . enter ,
                      model       : scope . ATP . modelExpression
                    } ) ;
                  }
                } ) ;
              } else if ( event . keyCode == 39 ) { // Right arrow key
                // Check if completion on right arrow is enabled.
                if ( ! scope . ATP . completeOn . rightArrow ) {
                  return ;
                }
                // Only autocomplete if caret is at the end of the input value.
                if ( getCaretPosition ( inputElement [ 0 ] ) < inputElement . val ( ) . length ) {
                  return ;
                }
                event . preventDefault ( ) ; // Prevent default right arrow behavior

                // Get the suggested value.
                var suggested = scope . ATP . getSuggested ( true ) ;
                scope . $apply ( function ( ) {
                  // Attempt to complete and update suggestion visibility.
                  scope . ATP . showSuggestions = ! scope . ATP . tryComplete ( ) ;
                  // If autocomplete was successful (showSuggestions is false).
                  if ( ! scope . ATP . showSuggestions ) {
                    scope . $emit ( events . COMPLETE , {
                      value       : scope . ATP . importValue ( ) ,
                      triggeredBy : events . triggers . rightArrow ,
                      model       : scope . ATP . modelExpression
                    } ) ;
                  }
                } ) ;
              } else if ( event . keyCode == 9 ) { // Tab key
                // Check if completion on tab is enabled.
                if ( ! scope . ATP . completeOn . tab ) {
                  return ;
                }
                // If a suggestion is selected, attempt to complete.
                if ( scope . ATP . selected > -1 ) {
                  scope . $apply ( function ( ) {
                    // Attempt to complete and update suggestion visibility.
                    scope . ATP . showSuggestions = ! scope . ATP . tryComplete ( ) ;
                    // If autocomplete was successful.
                    if ( ! scope . ATP . showSuggestions ) {
                      scope . $emit ( events . COMPLETE , {
                        value       : scope . ATP . importValue ( ) ,
                        triggeredBy : events . triggers . tab ,
                        model       : scope . ATP . modelExpression
                      } ) ;
                    }
                  } ) ;
                } else {
                  // If no suggestion is selected, just hide suggestions.
                  scope . $apply ( function ( ) {
                    scope . ATP . showSuggestions = false ;
                  } )
                }
              }
            } ) ; // End of keydown event binding

            // Bind keyup event to update the hint text.
            inputElement . bind ( 'keyup' , function ( event ) {
              var suggested = scope . ATP . getSuggested ( true ) ;
              var val       = scope . ATP . format ( suggested ) ;

              // Update hint only if suggestions are shown and the suggested value starts with current input.
              if ( scope . ATP . showSuggestions && helpers . startWith ( val , inputElement . val ( ) ) ) {
                hint . val ( val ) ;
              }
            } ) ;

            // Stop propagation for click event on the input to prevent document click from hiding suggestions.
            inputElement . bind ( 'click' , function ( event ) {
              event . stopPropagation ( ) ;
            } ) ;

            // Handle blur event for the input element.
            inputElement . bind ( 'blur' , function ( event ) {
              // Use a timeout to allow click events on suggestions to register first.
              $timeout ( function ( ) {
                scope . ATP . showSuggested = false ; // Hide suggestions on blur.
              } , 25 ) ;
            } ) ;

            // Bind a global click event to the document to hide suggestions when clicking outside.
            $document . bind ( 'click' , function ( event ) {
              scope . $apply ( function ( ) {
                scope . ATP . showSuggestions = false ; // Hide suggestions.
              } ) ;
            } ) ;
          } ; // End of post-link function
        } // End of ATP$Directive$compileATPInput

        /**
         * Helper function to get the caret (cursor) position in an input field.
         * Supports both IE and modern browsers.
         * @param {HTMLElement} oField - The input HTML element.
         * @returns {number} The caret position.
         */
        function getCaretPosition ( oField ) {
          var iCaretPos = 0 ; // Initialize caret position

          // Internet Explorer Support
          if ( document . selection ) {
            oField . focus ( ) ; // Set focus on the element

            // Get empty selection range
            var oSel = document . selection . createRange ( ) ;

            // Move selection start to 0 position
            oSel . moveStart ( 'character' , - oField . value . length ) ;

            // The caret position is the length of the selection
            iCaretPos = oSel . text . length ;
          }
          // Modern Browser Support (Firefox, Chrome, etc.)
          else if ( oField . selectionStart || oField . selectionStart == '0' ) {
            iCaretPos = oField . selectionStart ;
          }
          return ( iCaretPos ) ;
        } // End of getCaretPosition function

        /**
         * Builds and returns a jQuery/jqLite element for the hint input field.
         * The hint field displays the autocompletion suggestion preview.
         * @param {object} input - The original input element (jQuery/jqLite wrapped).
         * @returns {object} The hint input element (jQuery/jqLite wrapped).
         */
        function bulidHint ( input ) {
          return angular . element ( '<input class="tt-hint" type="text" autocomplete="false" spellcheck="false" disabled>' )
            . css ( {
              padding       : input . css ( 'padding' ) ,
              fontFamily    : input . css ( 'font-family' ) ,
              fontSize      : input . css ( 'font-size' ) ,
              fontStyle     : input . css ( 'font-style' ) ,
              fontVariant   : input . css ( 'font-variant' ) ,
              fontWeight    : input . css ( 'font-weight' ) ,
              wordSpacing   : input . css ( 'word-spacing' ) ,
              letterSpacing : input . css ( 'letter-spacing' ) ,
              textIndent    : input . css ( 'text-indent' ) ,
              textRendering : input . css ( 'text-rendering' ) ,
              textTransform : input . css ( 'text-transform' ) ,
              color         : 'gray' , // Hint text color
              width         : input . css ( 'width' ) // Match width of original input
            } ) ;
        } // End of bulidHint function

      }
    ]
  ) // End of ngAtpInput directive definition

  // Directive for displaying the list of suggestions
  .directive(
    'ngAtpSuggestions' ,
    [ '$parse' , '$compile' , // Injected services
      function ( $parse , $compile ) {

        // Define the HTML template for a single suggestion item.
        // This template is used inside the ng-repeat.
        var template = [
          '<li ' ,
          'ng-repeat="suggestion in ATP.suggestions track by (ATP._idAttrib ? suggestion[ATP._idAttrib] : $id(suggestion))" ' ,
          'ng-click="onClickSuggestion($index); $event.stopPropagation(); $event.preventDefault()" ' ,
          'ng-class="{ selected : $index == ATP.selected }" ' ,
          'ng-mouseover="ATP.select($index)">' ,
          '<ng-switch on="$templateUrl">' ,
          '  <span ng-switch-when="false">{{ ATP.format(suggestion) }}</span>' ,
          '  <ng-switch-default><ng-include src="$templateUrl"></ng-include></ng-switch-default>' ,
          '</ng-switch>' ,
          '</li>'
        ] . join ( '' ) ;

        return {
          require  : '^ngAtp' , // Requires the parent 'ngAtp' directive
          restrict : 'AE' , // Can be used as an attribute or element
          scope    : false , // Use the parent scope
          compile  : function ( element , attrs ) {
            // Check if ng-show attribute is present. If not, we need to add it and recompile.
            var require_recompile = ! attrs . ngShow ;

            // Ensure the suggestions list is hidden/shown based on ATP.showSuggestions.
            element . attr ( 'ng-show' , 'ATP.showSuggestions' ) ;

            return {
              pre : function ( scope , element , attrs ) {
                // If the element was recompiled due to missing ng-show,
                // inject the template and recompile.
                if ( require_recompile ) {
                  element [ 0 ] . innerHTML = template ;
                  $compile ( element ) ( scope ) ;
                  return ; // Stop further linking for this instance
                }
                // Determine the template URL for custom suggestion rendering, if provided.
                scope . $templateUrl = attrs . templateUrl ? $parse ( attrs . templateUrl ) ( scope ) : false ;
              } ,
              post : angular . noop // No specific post-link logic needed for this directive.
            } ;
          }
        } ;

      }
    ]
  ) ; // End of ngAtpSuggestions directive definition