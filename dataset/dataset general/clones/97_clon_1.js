/*
 *  This is an extensively modified version of the original source code.
 *  Its purpose is to demonstrate a Type I code clone,
 *  where only whitespace and comments have been altered.
 *
 *  AngularUI - The official companion suite for AngularJS applications.
 *  @version v0.3.2 - Released on 2012-12-12
 *  @link http://angular-ui.github.com - Visit the official website for more information.
 *  @license MIT License, available at http://www.opensource.org/licenses/MIT
 *
 *  All functional aspects, variable names, and logic remain precisely identical.
 *  Only formatting and descriptive text have been changed.
 */


angular . module ( 'ui.config' , [ ] ) . value ( 'ui.config' , { } ) ;
angular . module ( 'ui.filters' , [ 'ui.config' ] ) ;
angular . module ( 'ui.directives' , [ 'ui.config' ] ) ;
angular . module ( 'ui' , [ 'ui.filters' , 'ui.directives' , 'ui.config' ] ) ;



/**
 *  This directive is responsible for animating the injection of new DOM elements.
 *  It achieves this by adding a specific CSS class upon creation and then
 *  immediately removing it after a short delay.
 *
 *  Animations should be implemented using CSS3 transitions for optimal performance
 *  and flexibility.
 *
 *  @todo A future enhancement would be to properly support animating elements *out* of the DOM.
 *  @param [options] {mixed} This parameter can either be an object containing multiple configuration options,
 *                           or a simple string representing the animation class to be applied.
 *    @option class {string} Specifies the CSS class(es) to utilize for the animation.
 *                           For instance, 'ui-hide' could serve as an effective alternative class.
 *  @example
 *  A typical usage example:
 *  <li ng-repeat="item in items" ui-animate=" 'ui-hide' ">{{item}}</li>
 */
angular . module ( 'ui.directives' ) . directive ( 'uiAnimate' , [ 'ui.config' , '$timeout' ,
function ( uiConfig , $timeout ) {
  var options = { } ; // Initialize options object.

  // Check if uiConfig.animate is a string.
  if ( angular . isString ( uiConfig . animate ) ) {
    options [ 'class' ] = uiConfig . animate ; // Assign the string as the class.
  }
  // Otherwise, if uiConfig.animate exists (and is not a string).
  else if ( uiConfig . animate ) {
    options = uiConfig . animate ; // Use it directly as the options object.
  }

  return {
    restrict : 'A' , // This directive can be used as an attribute.
                     // (Supports element, attribute, and class usage implicitly by Angular).
    link : function ( $scope , element , attrs ) {
      var opts = { } ; // Local options for this specific instance.

      // If uiAnimate attribute is present.
      if ( attrs . uiAnimate ) {
        opts = $scope . $eval ( attrs . uiAnimate ) ; // Evaluate the attribute's expression.
        // If the evaluated options are a string, wrap them in an object.
        if ( angular . isString ( opts ) ) {
          opts = { 'class' : opts } ;
        }
      }

      // Extend default options with global config and instance-specific options.
      opts = angular . extend ( { 'class' : 'ui-animate' } , options , opts ) ;

      // Add the animation class to the element.
      element . addClass ( opts [ 'class' ] ) ;

      // Use $timeout to remove the class after a short delay, allowing CSS transitions to occur.
      // The delay of 20ms is typically sufficient for browsers to render the initial state.
      // 'false' means it won't trigger a $digest cycle immediately after timeout.
      $timeout ( function ( ) {
        element . removeClass ( opts [ 'class' ] ) ;
      } , 20 , false ) ;
    }
  } ;
} ] ) ;


/*
 *  This section provides the AngularJs Fullcalendar Wrapper for the JQuery FullCalendar library.
 *  It is heavily inspired by the original work of Adam Shaw's FullCalendar: http://arshaw.com/fullcalendar/
 *
 *  This is a fundamental Angular Calendar Directive. It accepts live event data via ng-model
 *  and actively monitors the event array for any changes, subsequently updating the calendar view.
 *  Additionally, it supports fetching events from a URL by defining source object(s),
 *  which allows events to be loaded dynamically per view.
 *
 */

angular . module ( 'ui.directives' ) . directive ( 'uiCalendar' , [ 'ui.config' , '$parse' , function ( uiConfig , $parse ) {

    // Ensure uiCalendar configuration object exists, or initialize it as an empty object.
    uiConfig . uiCalendar = uiConfig . uiCalendar || { } ;

    // The directive's return object.
    return {
        require : 'ngModel' , // This directive requires ngModel to bind to event data.
        restrict : 'A' ,      // It is an attribute directive.
        scope : {
          events : "=ngModel" // Two-way binding for the 'events' property to ngModel.
        } ,
        link : function ( scope , elm , $attrs ) {
            var ngModel = $parse ( $attrs . ngModel ) ; // Parse the ngModel expression.

            // The main update method. This function is invoked on initial load
            // and whenever the bound events array undergoes changes.
            function update ( ) {
              // Define default FullCalendar view options.
              var expression ,
                options = {
                  header : {
                  left : 'prev,next today' ,
                  center : 'title' ,
                  right : 'month,agendaWeek,agendaDay'
                } ,
              // Custom event handler: add event title to the DOM element's 'title' attribute
              // when the mouse hovers over an event, but only if not in 'agendaDay' view.
              eventMouseover : function ( event , jsEvent , view ) {
                if ( view . name !== 'agendaDay' ) {
                  $ ( jsEvent . target ) . attr ( 'title' , event . title ) ;
                }
              } ,

              // Bind the calendar's events directly to the 'events' property from the scope,
              // which is linked to ng-model.
              events : scope . events
              } ;

              // If additional attributes are provided for uiCalendar, evaluate them.
              if ( $attrs . uiCalendar ) {
                 expression = scope . $eval ( $attrs . uiCalendar ) ;
              }
              // Otherwise, use an empty object for expression.
              else {
                expression = { } ;
              }

              // Extend the default options with global uiConfig.uiCalendar settings
              // and then with instance-specific expression overrides.
              angular . extend ( options , uiConfig . uiCalendar , expression ) ;

              // Initialize FullCalendar on the element.
              // elm.html('') is used to clear the element content before initialization,
              // ensuring Angular's template compilation doesn't interfere.
              elm . html ( '' ) . fullCalendar ( options ) ;
            }

            // Initial call to update the calendar when the directive loads.
            update ( ) ;

            // Watch the 'events.length' property for changes.
            // Watching length is more efficient than deep watching the entire array
            // for simple additions/removals, as it avoids performance overhead.
            scope . $watch ( 'events.length' , function ( newVal , oldVal ) {
              // Trigger a calendar update whenever the number of events changes.
              update ( ) ;
            } , true ) ; // 'true' enables objectEquality checking for the watch (deep watch, though 'length' is primitive).
        }
    } ;
} ] ) ;


/*global angular, CodeMirror, Error */

/**
 *  This directive binds a CodeMirror editor widget to a standard <textarea> HTML element.
 *  It leverages the CodeMirror library to provide advanced code editing capabilities.
 */
angular . module ( 'ui.directives' ) . directive ( 'uiCodemirror' , [ 'ui.config' , '$parse' , function ( uiConfig , $parse ) {
  'use strict' ; // Enforce strict mode for cleaner code.

  // Initialize uiConfig.codemirror if it doesn't already exist.
  uiConfig . codemirror = uiConfig . codemirror || { } ;

  return {
    require : 'ngModel' , // This directive must be used with ngModel.
    link : function ( scope , elm , attrs , ngModel ) {
      // Validate that the directive is applied only to a <textarea> element.
      if ( ! elm . is ( 'textarea' ) ) {
        throw new Error ( 'ui-codemirror can only be applied to a textarea element' ) ;
      }

      var codemirror ; // Variable to hold the CodeMirror instance.

      // This function parses and retrieves the value of the 'uiCodemirror' attribute expression.
      var uiCodemirrorGet = $parse ( attrs . uiCodemirror ) ;

      // This handler is invoked whenever the content of the CodeMirror widget changes.
      var onChangeHandler = function ( ed ) {
        // We only update the model if the value has genuinely changed.
        // This prevents unnecessary $digest cycles and addresses a potential issue
        // where $render might trigger a change even when already within an $apply loop.
        var newValue = ed . getValue ( ) ;
        if ( newValue !== ngModel . $viewValue ) {
          ngModel . $setViewValue ( newValue ) ; // Update the ngModel's view value.
          scope . $apply ( ) ;                   // Trigger a digest cycle to propagate changes.
        }
      } ;

      // This function creates and wires up a new CodeMirror widget.
      // It also handles unwiring any existing widget if necessary.
      var updateCodeMirror = function ( options ) {
        // Merge the provided options with the global uiConfig.codemirror settings.
        // The onChange event handler is also integrated here.
        options = angular . extend ( { } , options , uiConfig . codemirror ) ;

        // If the user has supplied their own 'onChange' handler, we need to call both.
        var userOnChange = options . onChange ;
        if ( userOnChange ) {
          options . onChange = function ( ed ) {
            onChangeHandler ( ed ) ; // Call our internal handler first.
            userOnChange ( ed ) ;    // Then call the user's custom handler.
          } ;
        } else {
          options . onChange = onChangeHandler ; // If no user handler, just use ours.
        }

        // If a CodeMirror widget already exists for this element, destroy it first.
        if ( codemirror ) {
          codemirror . toTextArea ( ) ; // Revert the CodeMirror instance back to a textarea.
        }

        // Create a brand new CodeMirror widget from the textarea element.
        codemirror = CodeMirror . fromTextArea ( elm [ 0 ] , options ) ;
      } ;

      // Initialize the CodeMirror widget upon directive linking.
      updateCodeMirror ( uiCodemirrorGet ( ) ) ;

      // Set up a watch to monitor changes in the 'uiCodemirror' attribute's expression.
      // If the expression's value changes (e.g., options are updated), re-initialize CodeMirror.
      scope . $watch ( uiCodemirrorGet , updateCodeMirror , true ) ; // Deep watch for object changes.

      // CodeMirror expects a string value.
      // This formatter ensures that the model value is converted to a string before being passed to CodeMirror.
      // This operation does NOT modify the underlying model value itself.
      ngModel . $formatters . push ( function ( value ) {
        if ( angular . isUndefined ( value ) || value === null ) {
          return '' ; // Return an empty string for undefined or null values.
        }
        else if ( angular . isObject ( value ) || angular . isArray ( value ) ) {
          // CodeMirror cannot handle object or array models directly.
          throw new Error ( 'ui-codemirror cannot use an object or an array as a model' ) ;
        }
        return value ; // Otherwise, return the value as is (expected to be a string).
      } ) ;

      // Override the ngModelController's $render method.
      // This method is invoked whenever the model value is updated from outside the directive.
      // Its purpose here is to synchronize the CodeMirror editor's content with the model.
      ngModel . $render = function ( ) {
        codemirror . setValue ( ngModel . $viewValue ) ; // Update the CodeMirror editor with the new model value.
      } ;
    }
  } ;
} ] ) ;


/*
 *  This directive enhances currency display by allowing styling based on its numerical sign
 *  (positive, negative, or zero).
 */
angular . module ( 'ui.directives' ) . directive ( 'uiCurrency' , [ 'ui.config' , 'currencyFilter' , function ( uiConfig , currencyFilter ) {

  var options = {
    pos : 'ui-currency-pos' ,  // CSS class for positive values.
    neg : 'ui-currency-neg' ,  // CSS class for negative values.
    zero : 'ui-currency-zero'  // CSS class for zero values.
  } ;

  // Extend default options with any custom currency configurations from uiConfig.
  if ( uiConfig . currency ) {
    angular . extend ( options , uiConfig . currency ) ;
  }

  return {
    restrict : 'EAC' , // Can be used as an Element, Attribute, or Class.
    require : 'ngModel' , // Requires ngModel controller for data binding.
    link : function ( scope , element , attrs , controller ) {
      var opts ,       // Instance-specific options.
        renderview ,   // Function to render the view based on value.
        value ;        // Current model value.

      // Merge global options with any instance-specific options provided via uiCurrency attribute.
      opts = angular . extend ( { } , options , scope . $eval ( attrs . uiCurrency ) ) ;

      // This function handles the visual rendering of the currency value.
      renderview = function ( viewvalue ) {
        var num ;
        num = viewvalue * 1 ; // Convert viewvalue to a number for comparison.

        // Apply/remove positive class based on value.
        if ( num > 0 ) {
          element . addClass ( opts . pos ) ;
        } else {
          element . removeClass ( opts . pos ) ;
        }

        // Apply/remove negative class based on value.
        if ( num < 0 ) {
          element . addClass ( opts . neg ) ;
        } else {
          element . removeClass ( opts . neg ) ;
        }

        // Apply/remove zero class based on value.
        if ( num === 0 ) {
          element . addClass ( opts . zero ) ;
        } else {
          element . removeClass ( opts . zero ) ;
        }

        // Update element text content.
        if ( viewvalue === '' ) {
          element . text ( '' ) ; // Display empty string if viewvalue is empty.
        } else {
          element . text ( currencyFilter ( num , opts . symbol ) ) ; // Format and display currency.
        }
        return true ; // Indicate successful rendering.
      } ;

      // Override the ngModelController's $render method.
      // This method is called when the model value changes programmatically.
      controller . $render = function ( ) {
        value = controller . $viewValue ; // Get the current view value from the model.
        element . val ( value ) ;         // Set the value of the input element (if applicable).
        renderview ( value ) ;            // Render the currency with appropriate styling.
      } ;
    }
  } ;
} ] ) ;


/*global angular */

/*
 *  This is a wrapper directive for the popular jQuery UI Datepicker plugin.
 *  It integrates the Datepicker functionality seamlessly into AngularJS applications.
 *
 *  @param [ui-date] {object} Options to be passed directly to the jQuery `$.fn.datepicker()` method.
 *                             These options are merged with any global configurations defined in `ui.config`.
 */

angular . module ( 'ui.directives' )

. directive ( 'uiDate' , [ 'ui.config' , function ( uiConfig ) {
  'use strict' ; // Enforce strict JavaScript syntax.

  var options ;
  options = { } ; // Initialize an empty options object.

  // If uiConfig has a 'date' property and it's an object, extend our options with it.
  if ( angular . isObject ( uiConfig . date ) ) {
    angular . extend ( options , uiConfig . date ) ;
  }

  return {
    require : '?ngModel' , // Optionally require ngModel. If not present, it still works.
    link : function ( scope , element , attrs , controller ) {

      // Helper function to get the combined options for the datepicker.
      var getOptions = function ( ) {
        // Merge global uiConfig.date options with instance-specific options from the uiDate attribute.
        return angular . extend ( { } , uiConfig . date , scope . $eval ( attrs . uiDate ) ) ;
      } ;

      // Function to initialize or re-initialize the datepicker widget.
      var initDateWidget = function ( ) {
        var opts = getOptions ( ) ; // Get the current set of merged options.

        // If a controller (ngModelController) is present, wire it up.
        if ( controller ) {
          // Function to update the model when the datepicker's value changes.
          var updateModel = function ( ) {
            scope . $apply ( function ( ) {
              var date = element . datepicker ( "getDate" ) ; // Get the date object from the datepicker.
              element . datepicker ( "setDate" , element . val ( ) ) ; // Ensure the datepicker's internal value matches the input.
              controller . $setViewValue ( date ) ; // Update the ngModel's view value.
            } ) ;
          } ;

          // If the user has specified their own 'onSelect' callback.
          if ( opts . onSelect ) {
            // We need to store their handler and then wrap it.
            var userHandler = opts . onSelect ;
            opts . onSelect = function ( value , picker ) {
              updateModel ( ) ; // Call our model update logic first.
              return userHandler ( value , picker ) ; // Then call the user's original handler.
            } ;
          } else {
            // If no 'onSelect' is specified, simply use our model update function.
            opts . onSelect = updateModel ;
          }

          // Bind to the 'change' event on the input box.
          // This catches cases where the user types directly into the input field.
          element . bind ( 'change' , updateModel ) ;

          // Override the ngModelController's $render method.
          // This ensures the datepicker updates when the model changes programmatically.
          controller . $render = function ( ) {
            var date = controller . $viewValue ; // Get the current model value.

            // Validate that the ng-Model value is a Date object (or undefined/null).
            if ( angular . isDefined ( date ) && date !== null && ! angular . isDate ( date ) ) {
              throw new Error ( 'ng-Model value must be a Date object - currently it is a ' + typeof date + ' - use ui-date-format to convert it from a string' ) ;
            }
            element . datepicker ( "setDate" , date ) ; // Set the datepicker's date.
          } ;
        }

        // Destroy the old datepicker instance before creating a new one.
        // This is crucial for proper updates when configuration options change.
        element . datepicker ( 'destroy' ) ;

        // Create the new datepicker widget with the (potentially updated) options.
        element . datepicker ( opts ) ;

        // Force an immediate render to ensure the input field reflects the model value,
        // overriding any initial text content the input might have had.
        controller . $render ( ) ;
      } ;

      // Watch for changes to the directive's options.
      // If options change, re-initialize the datepicker.
      scope . $watch ( getOptions , initDateWidget , true ) ; // Deep watch for object changes.
    }
  } ;
} ] )


. directive ( 'uiDateFormat' , [ function ( ) {
  var directive = {
    require : 'ngModel' , // This directive requires ngModel.
    link : function ( scope , element , attrs , modelCtrl ) {

      // If the uiDateFormat attribute has no value (i.e., it's just `ui-date-format`).
      if ( attrs . uiDateFormat === '' ) {
        // Default to ISO 8601 formatting for date conversion.
        modelCtrl . $formatters . push ( function ( value ) {
          if ( angular . isString ( value ) ) {
            return new Date ( value ) ; // Convert string to Date object.
          }
        } ) ;
        modelCtrl . $parsers . push ( function ( value ) {
          if ( value ) {
            return value . toISOString ( ) ; // Convert Date object to ISO string.
          }
        } ) ;
      } else {
        // If a format string is provided (e.g., `ui-date-format="yy-mm-dd"`).
        var format = attrs . uiDateFormat ;
        // Use jQuery UI Datepicker's utility functions for custom formatting.
        modelCtrl . $formatters . push ( function ( value ) {
          if ( angular . isString ( value ) ) {
            return $ . datepicker . parseDate ( format , value ) ; // Parse string to Date object using custom format.
          }
        } ) ;
        modelCtrl . $parsers . push ( function ( value ) {
          if ( value ) {
            return $ . datepicker . formatDate ( format , value ) ; // Format Date object to string using custom format.
          }
        } ) ;
      }
    }
  } ;
  return directive ;
} ] ) ;


/**
 *  This directive provides general-purpose event binding capabilities.
 *  It allows binding to any event not natively supported by AngularJS's `ng-` directives.
 *
 *  To use it, pass an object literal where keys are event names and values are
 *  the expressions to execute.
 *  The `$event` object and a `$params` object (containing additional arguments)
 *  are made available within the expression's scope.
 *
 *  @example
 *  Binding to focus and blur events:
 *  <input ui-event="{ focus : 'counter++', blur : 'someCallback()' }">
 *
 *  @example
 *  Binding to a custom event and passing parameters:
 *  <input ui-event="{ myCustomEvent : 'myEventHandler($event, $params)'}">
 *
 *  @param ui-event {string|object literal} This attribute specifies the events to bind to.
 *                                         It can be a string representing a single event and callback,
 *                                         or a hash (object literal) mapping event names to their respective callbacks.
 */
angular . module ( 'ui.directives' ) . directive ( 'uiEvent' , [ '$parse' ,
  function ( $parse ) {
    return function ( scope , elm , attrs ) {
      var events = scope . $eval ( attrs . uiEvent ) ; // Evaluate the uiEvent attribute to get the events object.

      // Iterate over each event defined in the events object.
      angular . forEach ( events , function ( uiEvent , eventName ) {
        var fn = $parse ( uiEvent ) ; // Parse the event expression into a function.

        // Bind the specified event name to the element.
        elm . bind ( eventName , function ( evt ) {
          // Collect all arguments passed to the event handler.
          var params = Array . prototype . slice . call ( arguments ) ;
          // The first parameter is typically the event object itself, so remove it from $params.
          params = params . splice ( 1 ) ;

          // Apply the parsed function within the Angular scope.
          scope . $apply ( function ( ) {
            // Execute the function, providing $event and $params as local variables.
            fn ( scope , { $event : evt , $params : params } ) ;
          } ) ;
        } ) ;
      } ) ;
    } ;
  } ] ) ;


/*
 *  This directive defines the `ui-if` tag, which conditionally removes or adds an element
 *  to the DOM based on a given expression's truthiness.
 *  It functions similarly to `ng-if` but might offer different compilation priorities or behaviors.
 *
 *  Originally created by @tigbro, as part of the @jquery-mobile-angular-adapter project.
 *  Source repository: https://github.com/tigbro/jquery-mobile-angular-adapter
 */
angular . module ( 'ui.directives' ) . directive ( 'uiIf' , [ function ( ) {
  return {
    transclude : 'element' , // Transclude the element itself, not just its content.
    priority : 1000 ,        // High priority to ensure it runs before other directives.
    terminal : true ,        // This directive stops other directives from running on the same element.
    restrict : 'A' ,         // Can only be used as an attribute.
    compile : function ( element , attr , linker ) {
      // The compile function returns a post-link function.
      return function ( scope , iterStartElement , attr ) {
        iterStartElement [ 0 ] . doNotMove = true ; // Mark the element to prevent unwanted DOM manipulation.

        var expression = attr . uiIf ; // Get the conditional expression from the uiIf attribute.
        var lastElement ;              // Reference to the last cloned element.
        var lastScope ;                // Reference to the last child scope created.

        // Watch the expression for changes.
        scope . $watch ( expression , function ( newValue ) {
          // If a previous element exists, remove it from the DOM.
          if ( lastElement ) {
            lastElement . remove ( ) ;
            lastElement = null ;
          }
          // If a previous child scope exists, destroy it.
          if ( lastScope ) {
            lastScope . $destroy ( ) ;
            lastScope = null ;
          }

          // If the new value of the expression is truthy.
          if ( newValue ) {
            lastScope = scope . $new ( ) ; // Create a new child scope.
            linker ( lastScope , function ( clone ) {
              lastElement = clone ;          // Store a reference to the cloned element.
              iterStartElement . after ( clone ) ; // Insert the cloned element after the original marker.
            } ) ;
          }
          // Important: Trigger a custom event on the parent.
          // This is necessary because jQuery cannot trigger events on comment nodes,
          // and Angular uses comment nodes for transcluded elements like ng-repeat.
          iterStartElement . parent ( ) . trigger ( "$childrenChanged" ) ;
        } ) ;
      } ;
    }
  } ;
} ] ) ;


/**
 *  This is a general-purpose jQuery plugin wrapper directive.
 *  It allows easy integration of any jQuery plugin into AngularJS.
 *  The plugin name is passed as the expression in `ui-jq`.
 *
 *  It's possible to define a default set of parameters for each jQuery plugin.
 *  Under the `jq` key in `ui.config`, namespace each plugin by the name
 *  that will be used with `ui-jq`.
 *  Note: Currently, only the first parameter (usually an options object) can be pre-defined.
 *
 *  @example
 *  Configuration in `ui.config`:
 *  { jq : { datepicker : { showOn:'click' } } }
 *
 *  @param ui-jq {string} The name of the jQuery function to call (e.g., "$elm.pluginName()").
 *  @param [ui-options] {mixed} An expression to be evaluated. The result(s) will be passed
 *                               as arguments to the jQuery plugin function.
 *                               Multiple parameters can be separated by commas within the expression.
 *                               Set `{ngChange:false}` within the options object to disable
 *                               passthrough support for `change` events. (Angular typically watches `input` events, not `change`).
 *
 *  @example
 *  Using the directive with options:
 *  <input ui-jq="datepicker" ui-options="{showOn:'click'},secondParameter,thirdParameter">
 */
angular . module ( 'ui.directives' ) . directive ( 'uiJq' , [ 'ui.config' , function ( uiConfig ) {
  return {
    restrict : 'A' , // This directive is used as an attribute.
    compile : function ( tElm , tAttrs ) {

      // Ensure the specified jQuery function actually exists on the element.
      if ( ! angular . isFunction ( tElm [ tAttrs . uiJq ] ) ) {
        throw new Error ( 'ui-jq: The "' + tAttrs . uiJq + '" function does not exist' ) ;
      }

      // Retrieve default options for this plugin from uiConfig.
      var options = uiConfig . jq && uiConfig . jq [ tAttrs . uiJq ] ;

      // Return the post-link function.
      return function ( scope , elm , attrs ) {
        var linkOptions = [ ] , // Array to hold the parameters passed to the jQuery plugin.
            ngChange = 'change' ; // Default event type for ngChange passthrough.

        // If ui-options attribute is present, evaluate it.
        if ( attrs . uiOptions ) {
          // Evaluate the ui-options attribute as an array of arguments.
          linkOptions = scope . $eval ( '[' + attrs . uiOptions + ']' ) ;

          // If global options exist and the first linkOption is an object, merge them.
          if ( angular . isObject ( options ) && angular . isObject ( linkOptions [ 0 ] ) ) {
            linkOptions [ 0 ] = angular . extend ( { } , options , linkOptions [ 0 ] ) ;
          }
        }
        // If only global options are defined.
        else if ( options ) {
          linkOptions = [ options ] ;
        }

        // Handle ngModel integration for input, select, and textarea elements.
        if ( attrs . ngModel && elm . is ( 'select,input,textarea' ) ) {
          // Check if ngChange passthrough is explicitly disabled or overridden.
          if ( linkOptions && angular . isObject ( linkOptions [ 0 ] ) && linkOptions [ 0 ] . ngChange !== undefined ) {
            ngChange = linkOptions [ 0 ] . ngChange ;
          }
          // If ngChange is enabled (not false).
          if ( ngChange ) {
            // Bind to the specified change event and trigger an 'input' event.
            // This ensures Angular's ngModel picks up changes from jQuery plugins.
            elm . on ( ngChange , function ( ) {
              elm . trigger ( 'input' ) ;
            } ) ;
          }
        }

        // Finally, call the jQuery plugin function on the element with the collected options.
        elm [ attrs . uiJq ] . apply ( elm , linkOptions ) ;
      } ;
    }
  } ;
} ] ) ;


angular . module ( 'ui.directives' ) . factory ( 'keypressHelper' , [ '$parse' , function keypress ( $parse ) {

  // Mapping of key codes to their common names.
  var keysByCode = {
    8 : 'backspace' ,
    9 : 'tab' ,
    13 : 'enter' ,
    27 : 'esc' ,
    32 : 'space' ,
    33 : 'pageup' ,
    34 : 'pagedown' ,
    35 : 'end' ,
    36 : 'home' ,
    37 : 'left' ,
    38 : 'up' ,
    39 : 'right' ,
    40 : 'down' ,
    45 : 'insert' ,
    46 : 'delete'
  } ;

  // Helper function to capitalize the first letter of a string.
  var capitaliseFirstLetter = function ( string ) {
    return string . charAt ( 0 ) . toUpperCase ( ) + string . slice ( 1 ) ;
  } ;

  // The factory returns a function that configures keypress handling.
  return function ( mode , scope , elm , attrs ) {
    var params , combinations = [ ] ; // Initialize variables.

    // Evaluate the attribute (e.g., uiKeypress or uiKeydown) to get key configurations.
    params = scope . $eval ( attrs [ 'ui' + capitaliseFirstLetter ( mode ) ] ) ;
    // This is where the original code ended, implying the actual keypress logic
    // would be implemented here or in consuming directives.
  } ;
} ] ) ;