/*
 *
 * This is a Type I clone of alert.js.
 * Original file: alert.js v0.0.0, 03.22.2015
 * Purpose: Beautifully crafted javascript alert boxes.
 * Author: Ankit Pokhrel (http://ankitpokhrel.com.np, @ankitpokhrel)
 * License: MIT
 *
 * This version includes extensive changes to whitespace and comments
 * while maintaining exact logical and structural identity.
 *
 */
; ( function( window ,  document ,  undefined )  {

    'use strict' ;


    // Main Alert class definition.
    // This constructor initializes the core alert functionality.
    /**
     * @class
     * @description Represents the primary Alert functionality.
     * @constructor
     */
    var Alert = function ( ) {

        /**
         * @private
         * Internal variables and helper functions for the Alert class.
         */
        var

            // Default configuration options for alert boxes.
            // These can be overridden by user-provided settings.
            defaults = {
                type     : 'alert' ,
                title    : '' ,
                subtitle : '' ,
                text     : '' ,
                buttons  : {
                    OK     : {
                        label : 'Ok' ,
                        attrs : {
                            id      : 'btn_ok' ,
                            'class' : 'alert-js-btn alert-js-btn-ok'
                        }
                    } ,
                    CANCEL : {
                        label : 'Cancel' ,
                        attrs : {
                            id      : 'btn_cancel' ,
                            'class' : 'alert-js-btn alert-js-btn-cancel'
                        }
                    }
                } ,
                overlay   : true ,
                header    : true ,
                effect    : 'ease-in' ,
                wait      : 0 ,
                from      : 'middle' ,
                x         : '50%' ,
                y         : '80%' ,
                hideOnClick : false ,
                showTime  : 2000 ,
                success   : null ,
                cancelled : null ,
                complete  : null
            } ,

            /*
             * Function to create and assemble various components
             * of the alert box based on provided options.
             *
             * @param  {Object} options User-defined settings for the alert.
             * @return {Object} The artisan (creator) object for further manipulation.
             */
            make = function ( options ) {
                var me  = this ,
                    a   = me.artisan ,
                    s   = ( JSON.parse( JSON.stringify(defaults) ) ) , // Perform a deep clone of defaults
                    opt = _.map(s, options) ;

                // Apply the mapped options to the artisan instance.
                a.setOptions(opt) ;

                // For 'alert' type, the cancel button is not required.
                if ( a.options.type === 'alert' ) {
                    a.options.buttons.CANCEL = false ;
                }

                // Apply specific settings for 'flash' type alerts.
                flashSettings(a, options) ;

                // Begin creating the necessary DOM elements.
                a.create('layer') ;

                // Create header and title if header is enabled.
                if ( a.options.header !== false ) {
                    a.create('header') ;
                    a.create('title') ;

                    // Create subtitle if it's provided.
                    if ( a.options.subtitle !== '' ) {
                        a.create('subtitle') ;
                    }
                }

                a.create('body') ;

                // Create an input field specifically for 'prompt' type alerts.
                if ( a.options.type === 'prompt' ) {
                    a.create('input') ;
                }

                a.create('overlay') ;

                // Check user-provided button options;
                // the mapper might add default values if not explicitly set to false.
                if ( options.buttons !== false ) {
                    a.create('footer') ;
                    a.create('okButton') ;

                    // Create cancel button if it's not explicitly disabled.
                    if ( a.options.buttons.CANCEL !== false ) {
                        a.create('cancelButton') ;
                    }
                }

                // Assemble all created elements into the DOM.
                assemble(a) ;
                return a ; // Return the artisan (creator) object.
            } ,

            /**
             * Assembles all generated DOM elements into their correct hierarchy.
             * @param {Object} a The artisan (creator) object containing the elements.
             */
            assemble = function ( a ) {

                document.body.appendChild(a.layer) ;
                // The original code had a commented-out line here.
                // a.layer.appendChild(a.header);
                put(a.layer, a.header) ;
                a.layer.appendChild(a.body) ;
                put(a.header, a.title) ;
                put(a.header, a.subtitle) ;
                put(a.body, a.input) ;
                put(a.layer, a.footer) ;


                // Append OK and Cancel buttons to the footer, if they exist.
                if ( a.footer !== null && a.okButton !== null ) {

                    a.footer.appendChild(a.okButton) ;

                    // Attach a click listener to the OK button.
                    listen(a.okButton, 'click', function ( ) {
                        addEvent(true) ;
                    }) ;
                }


                if ( a.footer !== null && a.cancelButton !== null ) {

                    a.footer.appendChild(a.cancelButton) ;

                    // Attach a click listener to the CANCEL button.
                    listen(a.cancelButton, 'click', function ( ) {
                        addEvent(false) ;
                    }) ;
                }

                // For 'flash' type, clicking anywhere on the layer triggers the success event.
                if ( a.options.type === 'flash' ) {
                    listen(a.layer, 'click', function ( ) {
                        addEvent(true) ;
                    }) ;
                }

                // Automatically focus the input field for prompt, if it exists and not on mobile.
                if ( a.input !== null && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                    a.input.focus() ;
                }
            } ,

            /*
             * Helper function to append a child element to a parent
             * only if the child element is not null.
             * @param {HTMLElement} elm The parent element.
             * @param {HTMLElement|null} prop The child element to append.
             */
            put = function ( elm , prop ) {
                if ( prop !== null ) {
                    elm.appendChild(prop) ;
                }
            } ,

            // Applies specific settings for the 'flash' alert type,
            // overriding some default options.
            flashSettings = function ( a , options ) {
                if ( a.options.type === 'flash' ) {
                    a.options.overlay = false ;
                    a.options.header  = false ;
                    a.options.from    = 'middle' ;
                    options.buttons   = false ;
                }
            } ,

            // Attaches and handles different event callbacks (success, cancelled, complete).
            addEvent = function ( status ) {
                var a = fn().ref ,
                    o = a.artisan.options ;

                a.hide() ;

                // Execute success callback if status is true and defined.
                if ( status && o.success !== null ) {
                    successCb(a) ;
                }
                // Execute cancelled callback if status is false and defined.
                else if ( !status && o.cancelled !== null ) {
                    o.cancelled.apply(this) ;
                }

                // Always execute the complete callback if defined.
                if ( o.complete !== null ) {
                    completeCb(a, status) ;
                }
            } ,

            // Handles the success callback logic, including data retrieval for prompts/custom HTML.
            successCb = function ( a ) {
                var o = a.artisan.options ;
                if ( o.type === 'prompt' ) {
                    o.success.call(this, a.artisan.input.value) ;
                } else if ( o.text.charAt(0) === '#' ) {
                    o.success.call(this, getCustomData(a.artisan.layer)) ;
                } else {
                    o.success.apply(this) ;
                }
            } ,

            // Handles the complete callback logic, including data retrieval for prompts/custom HTML.
            completeCb = function ( a , status ) {
                var o = a.artisan.options ;
                if ( o.type === 'prompt' ) {
                    o.complete.call(this, status, a.artisan.input.value) ;
                } else if ( o.text.charAt(0) === '#' ) {
                    o.complete.call(this, status, getCustomData(a.artisan.layer)) ;
                } else {
                    o.complete.call(this, status) ;
                }
            } ,

            // Fetches data from input fields within a custom HTML content.
            getCustomData = function ( wrapper ) {
                var inp  = wrapper.querySelectorAll('input, textarea, select') ,
                    data = {} ,
                    i , name ;

                if ( inp.length > 0 ) {
                    for ( i = 0 ; i < inp.length ; i++ ) {
                        name = inp[i].getAttribute('name') ;
                        if ( name !== null ) {
                            data[name] = inp[i].value ;
                        } else {
                            data[i] = inp[i].value ;
                        }
                    }
                }

                return data ;
            } ,

            /**
             * Initiates the animation and displays the alert box.
             * @param {Object} a The alert instance to animate.
             */
            animate = function ( a ) {
                _.wait() ;
                if ( Object.keys(a).length > 0 ) {
                    a = a.artisan ;

                    setTimeout(function ( ) {

                        // Insert the overlay into the document body.
                        document.body.insertBefore(a.overlay, a.layer) ;
                        // Hide overlay if not explicitly desired.
                        if ( !a.options.overlay ) {
                            a.overlay.style.visibility = 'hidden' ;
                        }

                        // Trigger animation by adding and then removing classes.
                        _.addClass(a.layer, 'alert-js-' + a.options.effect, function ( ) {
                            // A small delay for smoother transition.
                            setTimeout(function ( ) {
                                _.removeClass(a.layer, 'alert-js-animation-' + a.options.from) ;
                            }, 10) ;
                        }) ;

                        // Specific positioning and auto-hide for 'flash' alerts.
                        if ( a.options.type === 'flash' ) {
                            a.layer.style.left = a.options.x ;
                            a.layer.style.top  = a.options.y ;
                            setTimeout(function ( ) {
                                fn().ref.hide() ;
                            }, a.options.showTime) ;
                        }

                    }, a.options.wait) ;
                }
            } ,

            /**
             * Binds an event listener to a DOM element, handling cross-browser compatibility.
             * @param {HTMLElement} el The element to bind the event to.
             * @param {string} evt The event type (e.g., 'click', 'mouseover').
             * @param {Function} cb The callback function to execute when the event fires.
             */
            listen = function ( el , evt , cb ) {

                if ( typeof el.addEventListener === 'function' ) {
                    el.addEventListener(evt, cb, false) ;
                } else if ( el.attachEvent ) {
                    el.attachEvent("on" + evt, cb) ;
                }

            } ,

            // Fires the animation for the next alert in the queue, if not locked.
            fire = function ( ) {
                if ( !_lock ) {
                    var o = fn() ,
                        t = make.call(o.ref, o.opt) ;

                    animate(o.ref) ;
                    return t ;
                }

                return false ;
            } ,

            /*
             * Provides access to the current alert object's public methods
             * from within private functions, by retrieving from the pool.
             * @returns {Object} The current alert object or an empty object if pool is empty.
             */
            fn = function ( ) {
                if ( _pool.length <= 0 ) {
                    return {} ;
                }

                return _pool.slice(0, 1).pop() ;
            } ;

        // Public interface of the Alert class.
        return {
            /**
             * @public
             * An instance of the Creator class, responsible for building alert components.
             */
            artisan : new Creator() ,

            /**
             * Displays an alert box with specified options.
             * @param  {Object}   options  User-defined options for the alert.
             * @return {Object} The current Alert object instance for chaining.
             */
            show : function ( options ) {
                var self = this ;

                // Set default type if not provided or invalid.
                if ( typeof options.type === 'undefined' || !_.inArray(options.type, _.validTypes()) ) {
                    options.type = 'alert' ; // Default to 'alert' type.
                }

                // Push a new Alert instance and its options to the processing queue.
                _pool.push({ ref : new Alert() , opt : options }) ;

                // Fire the alert animation process.
                this.artisan = fire() ;
                return self ;
            } ,

            /*
             * Hides the currently displayed alert box.
             * It removes the alert and overlay from the DOM and processes the next in queue.
             */
            hide : function ( ) {
                var me      = this ,
                    elm     = me.artisan.layer ,
                    overlay = me.artisan.overlay ,
                    opt     = me.artisan.options ;

                // Add animation class to hide the alert.
                _.addClass(elm, 'alert-js-animation-' + opt.from, function ( ) {
                    if ( _pool.length > 0 ) {
                        // Delay removal to allow animation to complete.
                        setTimeout(function ( ) {
                            document.body.removeChild(overlay) ;
                            document.body.removeChild(elm) ;
                            _pool.splice(0, 1) ; // Remove from queue.
                            _.release() ; // Release any locks.
                            if ( _pool.length > 0 ) {
                                fire() ; // Process next alert in queue.
                            }
                        }, 400) ;
                    }

                }) ;
            }

        } ;
    } ;

    // Global variables for managing alert queue and concurrency.
    var _pool = [] , // Queue to hold multiple alert instances.
        _lock = false ; // Mutex to prevent simultaneous alert displays.

    /**
     * The Creator class is responsible for generating all the necessary HTML
     * elements that form an alert box.
     * @constructor
     * @class
     */
    var Creator = function ( ) {
        /**
         * @private
         * Internal helper functions for element creation.
         */
        var

            // Creates the main wrapper element for the alert dialog.
            createOuterLayer = function ( ) {
                var layer = document.createElement('section') ;
                layer.setAttribute('id', 'alertJS') ;
                layer.className = 'alert-js alert-js-animation-' + this.options.from + ' ' + this.options.type ;

                return layer ;
            } ,

            // Creates the header element of the alert box.
            createHeader = function ( ) {
                var header = document.createElement('header') ;
                header.className = 'alert-js-header' ;

                return header ;
            } ,

            // Creates the title (h1) element for the alert box.
            createTitle = function ( ) {
                var h1 = document.createElement('h1') ;
                h1.innerHTML = this.options.title ;

                return h1 ;
            } ,

            // Creates the subtitle (h2) element for the alert box.
            createSubtitle = function ( ) {
                var h2 = document.createElement('h2') ;
                h2.innerHTML = this.options.subtitle ;

                return h2 ;
            } ,

            // Creates the body (div) element, containing the main message or custom content.
            createBody = function ( ) {
                var body = document.createElement('div') ;
                body.className = 'alert-js-body' ;
                // If text starts with '#', it's treated as a selector for custom HTML.
                if ( this.options.text.charAt(0) === '#' ) {
                    body.innerHTML = _.pick(this.options.text.slice(1), true).innerHTML ;
                } else {
                    body.innerHTML = this.options.text ;
                }

                return body ;
            } ,

            // Creates an input field for 'prompt' type alerts.
            createInput = function ( ) {
                var input = document.createElement('input') ;
                input.setAttribute('type', 'text') ;
                input.className = 'alert-js-input' ;

                return input ;
            } ,

            // Creates the footer element, typically for buttons.
            createFooter = function ( ) {
                var footer = document.createElement('footer') ;
                footer.className = 'alert-js-footer' ;

                return footer ;
            } ,

            // Generic function to create a button based on type (OK or CANCEL).
            createButton = function ( type ) {
                var btn   = document.createElement('button') ,
                    scope = this.options.buttons[type] ;

                // Set attributes for the button from the options.
                if ( typeof scope === 'object' && _.keyExist('attrs', scope) ) {
                    for ( var attr in scope.attrs ) {
                        if ( typeof scope.attrs[attr] !== 'function' && scope.attrs.hasOwnProperty(attr) ) {
                            btn.setAttribute(attr, scope.attrs[attr]) ;
                        }
                    }
                }

                // Set the button's inner HTML (label).
                if ( typeof scope === 'object' && _.keyExist('label', scope) ) {
                    btn.innerHTML = scope.label ;
                } else if ( typeof scope === 'string' ) {
                    btn.innerHTML = scope ;
                } else {
                    btn.innerHTML = scope.toString() ;
                }

                return btn ;
            } ,

            // Creates the OK button specifically.
            createOKbutton = function ( ) {
                return createButton.call(this, 'OK') ;
            } ,

            // Creates the CANCEL button specifically.
            createCancelButton = function ( ) {
                return createButton.call(this, 'CANCEL') ;
            } ,

            // Creates the overlay element that darkens the background.
            createOverlay = function ( ) {
                var overlay = document.createElement('div') ;
                overlay.className = 'alert-js-overlay' ;

                return overlay ;
            } ;


        // Public properties and methods of the Creator class.
        return {
            /** @public */
            layer       : null ,
            header      : null ,
            title       : null ,
            subtitle    : null ,
            body        : null ,
            input       : null ,
            footer      : null ,
            buttons     : null ,
            okButton    : null ,
            cancelButton: null ,
            overlay     : null ,
            options     : null ,
            customHTML  : false ,

            /**
             * The primary builder method that creates a specific component.
             * Calls the appropriate internal creation function based on the 'type' argument.
             * @param  {string} type Specifies which component to build (e.g., 'layer', 'header').
             * @return {Object | boolean} The created HTML element or boolean false if type is unknown.
             */
            create : function ( type ) {
                switch ( type ) {
                    case 'layer' :
                        return ( this.layer = createOuterLayer.call(this) ) ;

                    case 'header' :
                        return ( this.header = createHeader.call(this) ) ;

                    case 'title' :
                        return ( this.title = createTitle.call(this) ) ;

                    case 'subtitle' :
                        return ( this.subtitle = createSubtitle.call(this) ) ;

                    case 'body' :
                        return ( this.body = createBody.call(this) ) ;

                    case 'input' :
                        return ( this.input = createInput.call(this) ) ;

                    case 'footer' :
                        return ( this.footer = createFooter.call(this) ) ;

                    case 'okButton' :
                        return ( this.okButton = createOKbutton.call(this) ) ;

                    case 'cancelButton' :
                        return ( this.cancelButton = createCancelButton.call(this) ) ;

                    case 'overlay' :
                        return ( this.overlay = createOverlay.call(this) ) ;

                    default :
                        return false ;
                }
            } ,

            /**
             * Sets the options for the creator instance.
             * @param {Object} opts The options object to set.
             */
            setOptions : function ( opts ) {
                this.options = opts ;
            }
        } ;
    } ;

    /**
     * A utility object containing helper functions.
     * This object is assumed to be globally available or injected.
     */
    var _ = {
        /**
         * Checks if a key exists in an object.
         * @param {string} key The key to check.
         * @param {Object} obj The object to search within.
         * @returns {boolean} True if the key exists, false otherwise.
         */
        keyExist : function ( key , obj ) {
            return obj.hasOwnProperty(key) ;
        } ,

        /**
         * Extends an object with properties from another object.
         * @param {Object} destination The object to extend.
         * @param {Object} source The object to copy properties from.
         * @returns {Object} The extended destination object.
         */
        map : function ( destination , source ) {
            for ( var property in source ) {
                if ( source.hasOwnProperty(property) ) {
                    destination[property] = source[property] ;
                }
            }
            return destination ;
        } ,

        /**
         * Adds a class to an HTML element.
         * @param {HTMLElement} el The element to add the class to.
         * @param {string} className The class name to add.
         * @param {Function} [cb] Optional callback function to execute after adding the class.
         */
        addClass : function ( el , className , cb ) {
            if ( el.classList ) {
                el.classList.add(className) ;
            } else {
                el.className += ' ' + className ;
            }
            if ( typeof cb === 'function' ) {
                cb() ;
            }
        } ,

        /**
         * Removes a class from an HTML element.
         * @param {HTMLElement} el The element to remove the class from.
         * @param {string} className The class name to remove.
         * @param {Function} [cb] Optional callback function to execute after removing the class.
         */
        removeClass : function ( el , className , cb ) {
            if ( el.classList ) {
                el.classList.remove(className) ;
            } else {
                el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ') ;
            }
            if ( typeof cb === 'function' ) {
                cb() ;
            }
        } ,

        /**
         * Checks if a value exists within an array.
         * @param {*} needle The value to search for.
         * @param {Array} haystack The array to search within.
         * @returns {boolean} True if the value is found, false otherwise.
         */
        inArray : function ( needle , haystack ) {
            var length = haystack.length ;
            for ( var i = 0 ; i < length ; i++ ) {
                if ( haystack[i] == needle ) return true ;
            }
            return false ;
        } ,

        /**
         * Retrieves an HTML element by ID or a selector.
         * @param {string} selector The ID or selector string.
         * @param {boolean} [returnNode] If true, returns the DOM node; otherwise, returns its innerHTML.
         * @returns {HTMLElement|string|null} The DOM node, its innerHTML, or null if not found.
         */
        pick : function ( selector , returnNode ) {
            var elm = document.getElementById(selector) ;
            if ( elm === null ) {
                elm = document.querySelector(selector) ;
            }

            if ( returnNode ) {
                return elm ;
            } else {
                return elm.innerHTML ;
            }
        } ,

        /**
         * Returns an array of valid alert types.
         * @returns {Array<string>} An array containing 'alert', 'prompt', 'flash', 'confirm'.
         */
        validTypes : function ( ) {
            return ['alert', 'prompt', 'flash', 'confirm'] ;
        } ,

        /**
         * Locks the alert system, preventing new alerts from firing.
         */
        wait : function ( ) {
            _lock = true ;
        } ,

        /**
         * Releases the lock, allowing new alerts to fire.
         */
        release : function ( ) {
            _lock = false ;
        }
    } ;

    // Expose the Alert function globally or as a module.
    // This allows `window.Alert()` or `new Alert()` to be used.
    window.Alert = Alert ;

} ) ( window , document ) ;