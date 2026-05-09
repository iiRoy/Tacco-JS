( function( ) {
    "use strict";

    /*
     * This file contains the implementation of the bindonce module for AngularJS.
     * It provides a mechanism for one-time data binding, reducing the number of watchers
     * and improving application performance.
     *
     * Project: Bindonce
     * Version: 0.3.3
     * Repository: https://github.com/Pasvaz/bindonce
     * Author: Pasquale Vazzana
     * Contact: pasqualevazzana@gmail.com
     * License: MIT - For details, refer to http://www.opensource.org/licenses/MIT
     *
     * This code is designed to work with AngularJS applications.
     */



    var bindonceModule = angular.module( 'pasvaz.bindonce' , [ ] );

    bindonceModule.directive( 'bindonce' , function( ) {

        // Helper function to convert a value to a boolean.
        // This is a custom implementation for bindonce's specific needs.
        var toBoolean = function( value ) {
            if ( value && value.length !== 0 ) {
                var v = angular.lowercase( "" + value );
                value = !( v === 'f' || v === '0' || v === 'false' || v === 'no' || v === 'n' || v === '[]' );
            } else {
                value = false;
            }
            return value;
        };

        // Detect IE version for specific handling, especially for 'src' attribute.
        var msie = parseInt( ( /msie (\d+)/.exec( angular.lowercase( navigator.userAgent ) ) || [ ] )[ 1 ] , 10 );
        if ( isNaN( msie ) ) {
            msie = parseInt( ( /trident\/.*; rv:(\d+)/.exec( angular.lowercase( navigator.userAgent ) ) || [ ] )[ 1 ] , 10 );
        }

        // Define the main bindonce directive configuration.
        var bindonceDirective = {
            restrict    : "AM" ,
            controller  : [ '$scope' , '$element' , '$attrs' , '$interpolate' , function( $scope , $element , $attrs , $interpolate ) {

                // Function to handle showing or hiding an element based on a boolean value.
                var showHideBinder = function( elm , attr , value ) {
                    var show = ( attr === 'show' ) ? '' : 'none' ;
                    var hide = ( attr === 'hide' ) ? '' : 'none' ;
                    elm.css( 'display' , toBoolean( value ) ? show : hide );
                };

                // Function to handle adding CSS classes to an element.
                var classBinder = function( elm , value ) {
                    if ( angular.isObject( value ) && !angular.isArray( value ) ) {
                        var results = [ ];
                        angular.forEach( value , function( value , index ) {
                            if ( value ) { results.push( index ); }
                        } );
                        value = results;
                    }
                    if ( value ) {
                        elm.addClass( angular.isArray( value ) ? value.join( ' ' ) : value );
                    }
                };

                // Custom transclusion logic for elements.
                var transclude = function( transcluder , scope ) {
                    transcluder.transclude( scope , function( clone ) {
                        var parent = transcluder.element.parent( );
                        var afterNode = transcluder.element && transcluder.element[ transcluder.element.length - 1 ];
                        var parentNode = parent && parent[ 0 ] || afterNode && afterNode.parentNode ;
                        var afterNextSibling = ( afterNode && afterNode.nextSibling ) || null ;
                        angular.forEach( clone , function( node ) {
                            parentNode.insertBefore( node , afterNextSibling );
                        } );
                    } );
                };


                // Controller logic for the bindonce directive.
                var ctrl = {
                    watcherRemover  :   undefined ,
                    binders         :   [ ] ,
                    group           :   $attrs.boName ,
                    element         :   $element ,
                    ran             :   false ,

                    // Adds a new binder configuration to the queue.
                    addBinder       :   function( binder ) {
                        this.binders.push( binder );

                        // If the bindonce controller has already run,
                        // immediately execute the new binder.
                        if ( this.ran ) {
                            this.runBinders( );
                        }
                    } ,

                    // Sets up a watcher on the bindonce expression.
                    setupWatcher    :   function( bindonceValue ) {
                        var that = this ;
                        this.watcherRemover = $scope.$watch( bindonceValue , function( newValue ) {
                            if ( newValue === undefined ) { return; }
                            that.removeWatcher( ); // Remove watcher once value is defined
                            that.checkBindonce( newValue );
                        } , true );
                    } ,

                    // Checks the bindonce value, handling promises if necessary.
                    checkBindonce   :   function( value ) {
                        var that = this , promise = ( value.$promise ) ? value.$promise.then : value.then ;
                        // Since Angular 1.2, promises are no longer undefined until they resolve.
                        if ( typeof promise === 'function' ) {
                            promise( function( ) {
                                that.runBinders( ); // Run binders after promise resolves.
                            } );
                        } else {
                            that.runBinders( ); // Run binders immediately if not a promise.
                        }
                    } ,

                    // Removes the watcher if it exists.
                    removeWatcher   :   function( ) {
                        if ( this.watcherRemover !== undefined ) {
                            this.watcherRemover( );
                            this.watcherRemover = undefined ;
                        }
                    } ,

                    // Executes all queued binders.
                    runBinders      :   function( ) {
                        while ( this.binders.length > 0 ) {
                            var binder = this.binders.shift( );
                            if ( this.group && this.group != binder.group ) { continue; }
                            var value = binder.scope.$eval( ( binder.interpolate ) ? $interpolate( binder.value ) : binder.value );
                            switch ( binder.attr ) {
                                case 'boIf' :
                                    if ( toBoolean( value ) ) {
                                        transclude( binder , binder.scope.$new( ) );
                                    }
                                    break;
                                case 'boSwitch' :
                                    var selectedTranscludes , switchCtrl = binder.controller[ 0 ] ;
                                    if ( ( selectedTranscludes = switchCtrl.cases[ '!' + value ] || switchCtrl.cases[ '?' ] ) ) {
                                        binder.scope.$eval( binder.attrs.change );
                                        angular.forEach( selectedTranscludes , function( selectedTransclude ) {
                                            transclude( selectedTransclude , binder.scope.$new( ) );
                                        } );
                                    }
                                    break;
                                case 'boSwitchWhen' :
                                    var ctrl = binder.controller[ 0 ] ;
                                    ctrl.cases[ '!' + binder.attrs.boSwitchWhen ] = ( ctrl.cases[ '!' + binder.attrs.boSwitchWhen ] || [ ] ) ;
                                    ctrl.cases[ '!' + binder.attrs.boSwitchWhen ].push( { transclude : binder.transclude , element : binder.element } );
                                    break;
                                case 'boSwitchDefault' :
                                    var ctrl = binder.controller[ 0 ] ;
                                    ctrl.cases[ '?' ] = ( ctrl.cases[ '?' ] || [ ] ) ;
                                    ctrl.cases[ '?' ].push( { transclude : binder.transclude , element : binder.element } );
                                    break;
                                case 'hide' :
                                case 'show' :
                                    showHideBinder( binder.element , binder.attr , value );
                                    break;
                                case 'class' :
                                    classBinder( binder.element , value );
                                    break;
                                case 'text' :
                                    binder.element.text( value );
                                    break;
                                case 'html' :
                                    binder.element.html( value );
                                    break;
                                case 'style' :
                                    binder.element.css( value );
                                    break;
                                case 'disabled' :
                                    binder.element.prop( 'disabled' , value );
                                    break;
                                case 'src' :
                                    binder.element.attr( binder.attr , value );
                                    if ( msie ) { binder.element.prop( 'src' , value ); } // IE specific src handling
                                    break;
                                case 'attr' :
                                    angular.forEach( binder.attrs , function( attrValue , attrKey ) {
                                        var newAttr , newValue ;
                                        if ( attrKey.match( /^boAttr\./ ) && binder.attrs[ attrKey ] ) {
                                            newAttr = attrKey.replace( /^boAttr/ , '' ).replace( /([a-z])([A-Z])/g , '$1-$2' ).toLowerCase( );
                                            newValue = binder.scope.$eval( binder.attrs[ attrKey ] );
                                            binder.element.attr( newAttr , newValue );
                                        }
                                    } );
                                    break;
                                case 'href' :
                                case 'alt' :
                                case 'title' :
                                case 'id' :
                                case 'value' :
                                    binder.element.attr( binder.attr , value );
                                    break;
                            }
                        }
                        this.ran = true ; // Mark as run
                    }
                };

                angular.extend( this , ctrl ); // Extend the controller with the defined logic.
            } ] ,

            // Linking function for the bindonce directive.
            link        :   function( scope , elm , attrs , bindonceController ) {
                var value = attrs.bindonce && scope.$eval( attrs.bindonce ) ;
                if ( value !== undefined ) {
                    bindonceController.checkBindonce( value ); // If value is already defined, check it immediately.
                } else {
                    bindonceController.setupWatcher( attrs.bindonce ); // Otherwise, set up a watcher.
                    elm.bind( "$destroy" , bindonceController.removeWatcher ); // Remove watcher on element destruction.
                }
            }
        };

        return bindonceDirective;
    } );

    // Register various bindonce sub-directives.
    angular.forEach(
        [
            { directiveName: 'boShow' , attribute: 'show' } ,
            { directiveName: 'boHide' , attribute: 'hide' } ,
            { directiveName: 'boClass' , attribute: 'class' } ,
            { directiveName: 'boText' , attribute: 'text' } ,
            { directiveName: 'boBind' , attribute: 'text' } , // Alias for boText
            { directiveName: 'boHtml' , attribute: 'html' } ,
            { directiveName: 'boSrcI' , attribute: 'src' , interpolate: true } , // Interpolated src
            { directiveName: 'boSrc' , attribute: 'src' } ,
            { directiveName: 'boHrefI' , attribute: 'href' , interpolate: true } , // Interpolated href
            { directiveName: 'boHref' , attribute: 'href' } ,
            { directiveName: 'boAlt' , attribute: 'alt' } ,
            { directiveName: 'boTitle' , attribute: 'title' } ,
            { directiveName: 'boId' , attribute: 'id' } ,
            { directiveName: 'boStyle' , attribute: 'style' } ,
            { directiveName: 'boDisabled' , attribute: 'disabled' } ,
            { directiveName: 'boValue' , attribute: 'value' } ,
            { directiveName: 'boAttr' , attribute: 'attr' } , // Generic attribute binding

            { directiveName: 'boIf' , transclude: 'element' , terminal: true , priority: 1000 } ,
            { directiveName: 'boSwitch' , require: 'boSwitch' , controller: function( ) { this.cases = { }; } } ,
            { directiveName: 'boSwitchWhen' , transclude: 'element' , priority: 800 , require: '^boSwitch' } ,
            { directiveName: 'boSwitchDefault' , transclude: 'element' , priority: 800 , require: '^boSwitch' }
        ] ,
        function( boDirective ) {
            var childPriority = 200 ;
            return bindonceModule.directive( boDirective.directiveName , function( ) {
                var bindonceDirective = {
                    priority    :   boDirective.priority || childPriority ,
                    transclude  :   boDirective.transclude || false ,
                    terminal    :   boDirective.terminal || false ,
                    require     :   [ '^bindonce' ].concat( boDirective.require || [ ] ) ,
                    controller  :   boDirective.controller ,
                    compile     :   function( tElement , tAttrs , transclude ) {
                        return function( scope , elm , attrs , controllers ) {
                            var bindonceController = controllers[ 0 ] ;
                            var name = attrs.boParent ;
                            if ( name && bindonceController.group !== name ) {
                                var element = bindonceController.element.parent( ) ;
                                bindonceController = undefined ;
                                var parentValue ;

                                // Traverse up the DOM to find the correct parent bindonce controller.
                                while ( element[ 0 ].nodeType !== 9 && element.length ) {
                                    if ( ( parentValue = element.data( '$bindonceController' ) )
                                        && parentValue.group === name ) {
                                        bindonceController = parentValue ;
                                        break ;
                                    }
                                    element = element.parent( ) ;
                                }
                                if ( !bindonceController ) {
                                    throw new Error( "No bindonce controller: " + name ) ;
                                }
                            }

                            // Add the current directive's binder to the controller.
                            bindonceController.addBinder( {
                                element     :   elm ,
                                attr        :   boDirective.attribute || boDirective.directiveName ,
                                attrs       :   attrs ,
                                value       :   attrs[ boDirective.directiveName ] ,
                                interpolate :   boDirective.interpolate ,
                                group       :   name ,
                                transclude  :   transclude ,
                                controller  :   controllers.slice( 1 ) ,
                                scope       :   scope
                            } ) ;
                        } ;
                    }
                } ;

                return bindonceDirective ;
            } ) ;
        }
    ) ;

} ) ( ) ;