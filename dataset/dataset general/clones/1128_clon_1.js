angular .  module  ( 'MassAutoComplete' , [ ] )
  /* This directive provides the core autocomplete functionality.
     It depends on several Angular services for its operation. */
. directive ( 'massAutocomplete' , [ "$timeout" , "$window" , "$document" , "$q" ,
  function ( $timeout , $window , $document , $q ) {

    'use strict' ; // Enforces strict parsing and error handling.

    return {
      restrict : "A" , // The directive can only be used as an attribute.
      scope : {
        options : '&massAutocomplete' // Isolates scope, binds to an expression for options.
      } ,
      transclude : true , // Allows the directive to contain its own content.

      // The HTML template for the autocomplete dropdown.
      template :
        '<span ng-transclude ></span>' + // Placeholder for transcluded content
        '<div class="ac-container" ng-show="show_autocomplete && results.length > 0"' +
        ' style="position:absolute;" >' + // Container for the autocomplete results
          '<ul class="ac-menu" >' + // List of autocomplete items
            '<li ng-repeat="result in results" ng-if="$index > 0" ' + // Loop through results, skipping the first (original term)
              'class="ac-menu-item" ng-class="$index == selected_index ? \'ac-state-focus\': \'\'" >' + // Highlight selected item
              '<a href ng-click="apply_selection($index)" ng-bind-html="result.label" ></a>' + // Clickable item, displays HTML label
            '</li>' +
          '</ul>' +
        '</div>' ,

      // The link function is used for DOM manipulation and event binding.
      link : function ( scope , element ) {
        /* Stores a reference to the autocomplete container element. */
        scope . container = angular . element (
          element [ 0 ] . getElementsByClassName ( 'ac-container' ) [ 0 ]
        ) ;
      } ,

      // The controller manages the logic and state of the directive.
      controller : [ "$scope" , function ( $scope ) {

          var that = this ; // Alias for the controller instance.

          // Key codes for common keyboard interactions.
          var KEYS = {
            TAB : 9 ,
            ESC : 27 ,
            ENTER : 13 ,
            UP : 38 ,
            DOWN : 40
          } ;

          // Event names used throughout the directive.
          var EVENTS = {
            KEYDOWN : 'keydown' ,
            RESIZE : 'resize' ,
            BLUR : 'blur'
          } ;

          // Retrieve user-defined options, or an empty object if none provided.
          var _user_options = $scope . options ( ) || { } ;

          // Default debounce settings for various operations.
          var user_options = {
            debounce_position : _user_options . debounce_position || 150 ,
            debounce_attach : _user_options . debounce_attach || 300 ,
            debounce_suggest : _user_options . debounce_suggest || 200 ,
            debounce_blur : _user_options . debounce_blur || 150
          } ;

          var // Variables to hold current state information.
              current_element ,
              current_model ,
              current_options ,
              previous_value ,
              value_watch ,
              last_selected_value ;

          $scope . show_autocomplete = false ; // Controls visibility of the autocomplete dropdown.

          /*
           * Debounce function: Limits the rate at which a function can fire.
           * Taken from Underscore.js library.
           */
          function debounce ( func , wait , immediate ) {
              var timeout ;
              return function ( ) {
                  var context = this , args = arguments ;
                  var later = function ( ) {
                      timeout = null ;
                      if ( ! immediate ) { func . apply ( context , args ) ; }
                  } ;
                  var callNow = immediate && ! timeout ;
                  clearTimeout ( timeout ) ;
                  timeout = setTimeout ( later , wait ) ;
                  if ( callNow ) { func . apply ( context , args ) ; }
              } ;
          }

          /*
           * Positions the autocomplete dropdown directly below the input element.
           * Calculates the position based on the input's bounding rectangle and scroll offsets.
           */
          function _position_autocomplete ( ) {
            var rect = current_element [ 0 ] . getBoundingClientRect ( ) ,
                scrollTop = $document [ 0 ] . body . scrollTop || $document [ 0 ] . documentElement . scrollTop || $window . pageYOffset ,
                scrollLeft = $document [ 0 ] . body . scrollLeft || $document [ 0 ] . documentElement . scrollLeft || $window . pageXOffset ,
                container = $scope . container [ 0 ] ;

            container . style . top = rect . top + rect . height + scrollTop + 'px' ;
            container . style . left = rect . left + scrollLeft + 'px' ;
            container . style . width = rect . width + 'px' ;
          }
          // Debounced version of the positioning function to prevent excessive calls.
          var position_autocomplete = debounce ( _position_autocomplete , user_options . debounce_position ) ;

          /*
           * Attaches the autocomplete behavior to a specific input element.
           * This function sets up event listeners and initializes internal state.
           */
          function _attach ( ngmodel , target_element , options ) {
            // Do nothing if already attached to the same element.
            if ( current_element === target_element ) { return ; }
            // Detach from previous element if any.
            if ( current_element ) { that . detach ( ) ; }
            // Ensure the target element is currently focused.
            if ( target_element [ 0 ] !== $document [ 0 ] . activeElement ) { return ; }

            options . on_attach && options . on_attach ( ) ; // Call user-defined on_attach callback.

            current_element = target_element ; // Store reference to the input element.
            current_model = ngmodel ; // Store reference to the ngModel controller.
            current_options = options ; // Store user-defined options for the current input.
            previous_value = ngmodel . $viewValue ; // Save the initial value for ESC key.

            $scope . results = [ ] ; // Initialize results array.
            $scope . selected_index = -1 ; // No item selected initially.
            bind_element ( ) ; // Bind event listeners to the input element.

            // Watch for changes in the model value to trigger suggestions.
            value_watch = $scope . $watch (
              function ( ) {
                return ngmodel . $modelValue ;
              } ,
              function ( nv , ov ) {
                // Avoid re-suggesting if the new value is the one just selected.
                if ( nv === last_selected_value ) {
                  return ;
                }

                _position_autocomplete ( ) ; // Reposition autocomplete dropdown.
                suggest ( nv , current_element ) ; // Trigger suggestion generation.
              }
            ) ;
          }
          // Debounced version of the attach function.
          that . attach = debounce ( _attach , user_options . debounce_attach ) ;

          /*
           * Generates and displays suggestions based on the provided term.
           * Uses the current_options.suggest function.
           */
          function _suggest ( term , target_element ) {
            $scope . selected_index = 0 ; // Reset selected index.
            $scope . waiting_for_suggestion = true ; // Indicate pending suggestion.

            if ( typeof ( term ) === 'string' && term . length > 0 ) {
              $q . when ( current_options . suggest ( term ) , // Call the user-defined suggest function.
                function suggest_succeeded ( suggestions ) {
                  // Ensure the suggestions are for the currently active element.
                  if ( ! current_element || current_element !== target_element ) {
                    return ;
                  }

                  if ( suggestions && suggestions . length > 0 ) {
                  // Prepend the original term to allow returning to it.
                    $scope . results = [ { value : term , label : '' } ] . concat ( suggestions ) ;
                    $scope . show_autocomplete = true ;
                    if ( current_options . auto_select_first ) {
                        set_selection ( 1 ) ; // Auto-select the first actual suggestion.
                    }
                  } else {
                    $scope . results = [ ] ; // Clear results if no suggestions.
                  }
                } ,
                function suggest_failed ( error ) {
                  $scope . show_autocomplete = false ; // Hide autocomplete on error.
                  current_options . on_error && current_options . on_error ( error ) ; // Call error callback.
                }
              ) . finally ( function suggest_finally ( ) {
                $scope . waiting_for_suggestion = false ; // Suggestion process completed.
              } ) ;
            } else {
              $scope . waiting_for_suggestion = false ;
              $scope . show_autocomplete = false ;
              $scope . $apply ( ) ; // Manually trigger a digest cycle.
            }
          }
          // Debounced version of the suggest function.
          var suggest = debounce ( _suggest , user_options . debounce_suggest ) ;

          /*
           * Detaches the autocomplete behavior from the current input element.
           * This cleans up event listeners and resets state.
           */
          that . detach = function ( ) {
            if ( current_element ) {
              var value = current_element . val ( ) ;
              update_model_value ( value ) ; // Update model to current input value.
              current_options . on_detach && current_options . on_detach ( value ) ; // Call detach callback.
              current_element . unbind ( EVENTS . KEYDOWN ) ; // Unbind keyboard events.
              current_element . unbind ( EVENTS . BLUR ) ; // Unbind blur event.
            }

            // Clear all references and events related to the autocomplete.
            $scope . show_autocomplete = false ;
            angular . element ( $window ) . unbind ( EVENTS . RESIZE ) ; // Unbind window resize.
            value_watch && value_watch ( ) ; // Stop watching model value.
            $scope . selected_index = $scope . results = undefined ; // Clear results and selection.
            current_model = current_element = previous_value = undefined ; // Clear element references.
          } ;

          /*
           * Updates Angular's ngModel view value.
           * Ensures the model is synchronized with the visible input value.
           */
          function update_model_value ( value ) {
            if ( current_model . $modelValue !== value ) {
              current_model . $setViewValue ( value ) ; // Update view value.
              current_model . $render ( ) ; // Re-render the view.
            }
          }

          /*
           * Sets the current selection in the autocomplete menu.
           * Updates the input element's value and the selected index.
           */
          function set_selection ( i ) {
            // We update the element's value directly to avoid triggering
            // the model watch and thus a new suggestion cycle.
            var selected = $scope . results [ i ] ;
            current_element . val ( selected . value ) ;
            $scope . selected_index = i ;
            return selected ;
          }

          /*
           * Applies the currently selected item from the autocomplete menu.
           * This is called when an item is clicked or ENTER is pressed.
           */
          $scope . apply_selection = function ( i ) {
            current_element [ 0 ] . focus ( ) ; // Refocus the input element.
            if ( ! $scope . show_autocomplete || i > $scope . results . length || i < 0 ) {
              return ; // Do nothing if autocomplete is not shown or index is invalid.
            }

            var selected = set_selection ( i ) ; // Set the selection.
            last_selected_value = selected . value ; // Store for debounce logic.
            update_model_value ( selected . value ) ; // Update the model.
            $scope . show_autocomplete = false ; // Hide autocomplete.

            current_options . on_select && current_options . on_select ( selected ) ; // Call select callback.
          } ;

          /*
           * Binds event listeners to the current input element and window.
           * Handles keyboard navigation, blur, and window resize.
           */
          function bind_element ( ) {
            angular . element ( $window ) . bind ( EVENTS . RESIZE , position_autocomplete ) ; // Reposition on window resize.

            current_element . bind ( EVENTS . BLUR , function ( ) {
              // Detach after a short delay to allow click events on menu items to register.
              $timeout ( function ( ) {
                if ( ! current_element || current_element [ 0 ] !== $document [ 0 ] . activeElement ) {
                  that . detach ( ) ; // Detach if input is not focused.
                }
              } , user_options . debounce_blur ) ;
            } ) ;

            current_element . bind ( EVENTS . KEYDOWN , function ( e ) {
              // Ignore key combinations with shift.
              if ( e . shiftKey ) { return ; }

              switch ( e . keyCode ) {
                // ESC key: Hide menu or restore previous value.
                case KEYS . ESC :
                  if ( $scope . show_autocomplete ) {
                    $scope . show_autocomplete = false ;
                    $scope . $apply ( ) ;
                  } else {
                    current_element . val ( previous_value ) ;
                  }
                  break ;

                // ENTER key: Apply selection or propagate event.
                case KEYS . ENTER :
                  if ( $scope . show_autocomplete &&
                      $scope . selected_index > 0 &&
                      ! $scope . waiting_for_suggestion ) {
                    $scope . apply_selection ( $scope . selected_index ) ;
                    e . stopPropagation ( ) ; // Prevent event from bubbling up.
                    e . preventDefault ( ) ; // Prevent default browser action (e.g., form submission).
                  }

                  $scope . show_autocomplete = false ;
                  $scope . $apply ( ) ;
                  break ;

                // TAB key: Navigate or allow default behavior.
                case KEYS . TAB :
                  if ( ! $scope . show_autocomplete ) {
                    break ;
                  }

                  e . preventDefault ( ) ; // Prevent default tab behavior (focus change).
                  /* falls through */ // Fall through to DOWN key logic.

                // DOWN arrow key: Navigate down or show menu.
                case KEYS . DOWN :
                  if ( $scope . results . length > 0 ) {
                    if ( $scope . show_autocomplete ) {
                      set_selection ( $scope . selected_index + 1 > $scope . results . length - 1 ? 0 : $scope . selected_index + 1 ) ;
                    } else {
                      $scope . show_autocomplete = true ;
                      $scope . selected_index = 0 ;
                    }
                    $scope . $apply ( ) ;
                  }
                  break ;

                // UP arrow key: Navigate up.
                case KEYS . UP :
                  if ( $scope . show_autocomplete ) {
                    e . preventDefault ( ) ; // Prevent default browser action (e.g., cursor movement).
                    set_selection ( $scope . selected_index - 1 >= 0 ? $scope . selected_index - 1 : $scope . results . length - 1 ) ;
                    $scope . $apply ( ) ;
                  }
                  break ;
              }
            } ) ;
          }

          // Cleanup on scope destruction.
          $scope . $on ( '$destroy' , function ( ) {
            that . detach ( ) ; // Detach all event listeners.
            $scope . container . remove ( ) ; // Remove the autocomplete container from the DOM.
          } ) ;
      } ]
    } ;
} ] )

/*
 * The massAutocompleteItem directive is used on input elements
 * to enable autocomplete functionality.
 */
. directive ( 'massAutocompleteItem' , function ( ) {
  'use strict' ;

  return {
    restrict : "A" , // Attribute directive.
    require : [ "^massAutocomplete" , "ngModel" ] , // Requires parent massAutocomplete and ngModel.
    scope : {
      'massAutocompleteItem' : "&" // Binds to an expression for item-specific options.
    } ,
    link : function ( scope , element , attrs , required ) {
      // Disable browser's native autocomplete.
      attrs . $set ( 'autocomplete' , 'off' ) ;

      // When the input element gains focus, attach autocomplete behavior.
      element . bind ( 'focus' , function ( ) {
        var options = scope . massAutocompleteItem ( ) ; // Get item-specific options.
        if ( ! options ) {
          throw "Invalid options" ; // Error if options are not provided.
        }
        // Call the attach method on the parent massAutocomplete controller.
        required [ 0 ] . attach ( required [ 1 ] , element , options ) ;
      } ) ;
    }
  } ;
} ) ;