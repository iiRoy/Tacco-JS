'use strict'; // Enforce strict JavaScript parsing and execution.

/*
 * This module integrates the Switchery library as an Angular directive.
 * Note: A potential future enhancement could be to refactor Switchery
 * into an Angular service, as discussed in the linked GitHub issue.
 * See: https://github.com/abpetkov/switchery/pull/11
 */
angular
    .module ( 'NgSwitchery' , [ ] )

    .directive ( 'uiSwitch' ,
        [ '$window' , '$timeout' , '$log' , '$parse' ,
        function ( $window , $timeout , $log , $parse )
        {

            /**
             * The primary linking function for the uiSwitch directive.
             * This function is responsible for initializing the HTML element
             * as a Switchery switch instance.
             *
             * A `$timeout` is specifically utilized here to resolve potential
             * rendering issues when the directive is used within components
             * like `angular-ui` tabs, ensuring the switch initializes correctly.
             *
             * @param {object} scope    The current Angular scope.
             * @param {object} elem     The jQLite-wrapped element.
             * @param {object} attrs    The element's attributes.
             * @param {object} ngModel  The NgModelController instance.
             * @returns {void}
             */
            function linkSwitchery (
                scope ,
                elem ,
                attrs ,
                ngModel
            ) {

                // If ngModel is not present, there's nothing to link.
                if ( ! ngModel )
                {
                    return false ;
                }


                var options = { } ;

                try
                {
                    // Attempt to parse options from the 'uiSwitch' attribute.
                    options = $parse ( attrs . uiSwitch ) ( scope ) ;
                }
                catch ( e )
                {
                    /*
                     * Error parsing options.
                     * For a Type I clone, we must keep 'catch (e) {}' as is.
                     * No logging or specific error handling here to maintain exact logic.
                     */
                }

                var switcher ; // Holds the Switchery instance.
                var previousDisabledValue ; // Stores the last known 'disabled' attribute value.

                /*
                 * Observe changes to the 'disabled' attribute.
                 * If the 'disabled' state changes, the switch needs to be reinitialized
                 * to properly reflect the new state.
                 */
                attrs . $observe ( 'disabled' , function ( value )
                {
                    if ( value == undefined || value == previousDisabledValue )
                    {
                        // No effective change or initial observation.
                        return ;
                    }
                    else
                    {
                        // The 'disabled' state has changed, update and reinitialize.
                        previousDisabledValue = value ;
                    }

                    initializeSwitch ( ) ; // Recreate the switch.
                } ) ;


                /**
                 * (Re)initializes the Switchery switch.
                 * This function handles the creation or recreation of the Switchery instance,
                 * ensuring it reflects the current state of the checkbox and its options.
                 */
                function initializeSwitch ( )
                {
                    $timeout ( function ( )
                    {
                        // Before creating a new one, remove any existing Switchery instance.
                        if ( switcher )
                        {
                            angular
                                .element ( switcher . switcher )
                                .remove ( ) ;
                        }

                        /*
                         * Create or recreate the Switchery instance.
                         * This ensures the switch reflects the most recent
                         * state and options of the underlying checkbox element.
                         */
                        switcher = new $window . Switchery ( elem [ 0 ] , options ) ;

                        var element = switcher . element ;

                        // Set the initial checked state based on the scope's initValue.
                        element . checked = scope . initValue ;

                        // Manually set the position to ensure visual consistency.
                        switcher . setPosition ( false ) ;

                        // Attach an event listener for changes to the switch.
                        element . addEventListener ( 'change' , function ( evt )
                        {
                            scope . $apply ( function ( )
                            {
                                // Update the ngModel's view value when the switch state changes.
                                ngModel . $setViewValue ( element . checked ) ;
                            } ) ;
                        } ) ;
                    } , 0 ) ; // Use a 0ms timeout for next tick execution.
                }

                // Initial call to set up the switch when the directive links.
                initializeSwitch ( ) ;
            }


            // The directive definition object.
            return {
                require     : 'ngModel' , // The directive requires ngModel.
                restrict    : 'AE'      , // Can be used as an attribute or element.
                scope       : {         // Isolate scope definition.
                    initValue : '=ngModel' // Binds initValue to ngModel's value.
                } ,
                link        : linkSwitchery // The linking function.
            } ;
        }
    ] ) ; // End of directive definition.