// --- Tendina jQuery plugin v0.11.1 ---
// Copyright (c) 2015 Ivan Prignano
// Released under the MIT License
// This file contains the core logic for the Tendina menu system.

( function ()
{
    // Local aliases for common functions/objects to improve minification and readability.
    var __bind = function ( fn, me )
    {
        return function ()
        {
            return fn.apply( me, arguments );
        };
    },
        __slice = [].slice; // Used for converting arguments to an array.

    // Immediately invoked function expression (IIFE) to encapsulate the plugin.
    ( function ( $, window )
    {
        var Tendina; // Declare the Tendina class constructor.

        Tendina = ( function ()
        {
            // Define default options for the Tendina plugin.
            Tendina.prototype.defaults = {
                animate: true, // Whether to use animation for opening/closing submenus.
                speed: 500, // Animation speed in milliseconds.
                onHover: false, // Activate submenus on hover instead of click.
                hoverDelay: 200, // Delay for hover activation.
                activeMenu: null // Selector for initially active menu item.
            };

            /**
             * Tendina constructor function.
             * Initializes the Tendina menu on a given element.
             * @param {HTMLElement} el - The DOM element to initialize Tendina on.
             * @param {Object} options - User-defined options to override defaults.
             */
            function Tendina( el, options )
            {
                // Bind '_eventHandler' to the Tendina instance context.
                this._eventHandler = __bind( this._eventHandler, this );

                // Merge default options with user-provided options.
                this.options = $.extend( {}, this.defaults, options );

                // Store the jQuery-wrapped element.
                this.$el = $( el );

                // Determine the selector for the main element (ID or first class).
                this.elSelector = this._getSelector( this.$el );

                // Add the main class to the element for styling.
                this.$el.addClass( 'tendina' );

                // Construct the selector for all anchor tags within the menu.
                this.linkSelector = "" + this.elSelector + " a";

                // Find all list items that are parents of the links.
                this.$listElements = $( this.linkSelector ).parent( 'li' );

                // Initially hide all submenus.
                this._hideSubmenus();

                // Determine the event type based on 'onHover' option.
                this.mouseEvent = this.options.onHover === true ? 'mouseenter.tendina' : 'click.tendina';

                // Bind the necessary events to the menu.
                this._bindEvents();

                // If an active menu is specified, open it.
                if ( this.options.activeMenu !== null )
                {
                    this._openActiveMenu( this.options.activeMenu );
                }
            }

            /**
             * Binds event listeners to the menu links.
             * Uses delegated events on the document for efficiency.
             * @returns {jQuery} The document object with the event handler attached.
             */
            Tendina.prototype._bindEvents = function ()
            {
                return $( document ).on( this.mouseEvent, this.linkSelector, this._eventHandler );
            };

            /**
             * Unbinds all event listeners associated with this Tendina instance.
             * Prevents memory leaks and allows for reinitialization.
             * @returns {jQuery} The document object with the event handler detached.
             */
            Tendina.prototype._unbindEvents = function ()
            {
                return $( document ).off( this.mouseEvent );
            };

            /**
             * Generates a unique CSS selector for a given element.
             * Prefers ID over the first class name.
             * @param {jQuery} el - The jQuery-wrapped element.
             * @returns {string} The CSS selector for the element.
             */
            Tendina.prototype._getSelector = function ( el )
            {
                var elId, firstClass, _ref;

                // Get the first class name if available.
                firstClass = ( _ref = $( el ).attr( 'class' ) ) != null ? _ref.split( ' ' )[0] : void 0;

                // Get the ID of the element.
                elId = $( el ).attr( 'id' );

                // Return ID selector if present, otherwise class selector.
                if ( elId !== void 0 )
                {
                    return "#" + elId;
                }
                else
                {
                    return "." + firstClass;
                }
            };

            /**
             * Checks if a given target element is a first-level menu item.
             * @param {HTMLElement} targetEl - The element to check.
             * @returns {boolean} True if it's a first-level item, false otherwise.
             */
            Tendina.prototype._isFirstLevel = function ( targetEl )
            {
                // Check if the grandparent has the 'tendina' class.
                if ( $( targetEl ).parent().parent().hasClass( 'tendina' ) )
                {
                    return true;
                }
            };

            /**
             * The main event handler for mouse interactions (click or hover).
             * Manages opening and closing of submenus based on user interaction.
             * @param {Event} event - The DOM event object.
             * @returns {void}
             */
            Tendina.prototype._eventHandler = function ( event )
            {
                var targetEl; // The element that triggered the event.

                targetEl = event.currentTarget;

                // Check if the target has children and those children are hidden.
                if ( this._hasChildren( targetEl ) && this._IsChildrenHidden( targetEl ) )
                {
                    event.preventDefault(); // Prevent default link behavior.

                    // Handle hover-specific logic.
                    if ( this.options.onHover )
                    {
                        return setTimeout( ( function ( _this )
                        {
                            return function ()
                            {
                                // Only open if the element is still being hovered over.
                                if ( $( targetEl ).is( ':hover' ) )
                                {
                                    return _this._openSubmenu( targetEl );
                                }
                            };
                        } )( this ), this.options.hoverDelay );
                    }
                    else
                    {
                        // For click events, just open the submenu.
                        return this._openSubmenu( targetEl );
                    }
                }
                // Check if the target is currently open and has children.
                else if ( this._isCurrentlyOpen( targetEl ) && this._hasChildren( targetEl ) )
                {
                    event.preventDefault(); // Prevent default link behavior.

                    // Only close on click, not on hover.
                    if ( !this.options.onHover )
                    {
                        return this._closeSubmenu( targetEl );
                    }
                }
            };

            /**
             * Opens a submenu associated with the given element.
             * Handles closing other open menus in the same level.
             * @param {HTMLElement} el - The link element whose submenu should be opened.
             * @returns {void}
             */
            Tendina.prototype._openSubmenu = function ( el )
            {
                var $openMenus, $targetMenu; // jQuery objects for menus.

                // Get the submenu (next 'ul' sibling).
                $targetMenu = $( el ).next( 'ul' );

                // Find other currently open submenus that are not the target or its ancestors.
                $openMenus = this.$el.find( '> .selected ul' ).not( $targetMenu ).not( $targetMenu.parents( 'ul' ) );

                // Add 'selected' class to the parent list item of the clicked link.
                $( el ).parent( 'li' ).addClass( 'selected' );

                // Close the other open menus.
                this._close( $openMenus );

                // Remove 'selected' class from items that are no longer active.
                this.$el.find( '.selected' ).not( $targetMenu.parents( 'li' ) ).removeClass( 'selected' );

                // Open the target submenu.
                this._open( $targetMenu );

                // Execute the optional open callback.
                if ( this.options.openCallback )
                {
                    return this.options.openCallback( $( el ).parent() );
                }
            };

            /**
             * Closes a submenu associated with the given element.
             * Also closes any nested submenus within the target submenu.
             * @param {HTMLElement} el - The link element whose submenu should be closed.
             * @returns {void}
             */
            Tendina.prototype._closeSubmenu = function ( el )
            {
                var $nestedMenus, $targetMenu; // jQuery objects for menus.

                // Get the submenu to be closed.
                $targetMenu = $( el ).next( 'ul' );

                // Find all selected nested menus within the target submenu.
                $nestedMenus = $targetMenu.find( 'li.selected' );

                // Remove 'selected' class from the parent list item.
                $( el ).parent().removeClass( 'selected' );

                // Close the target submenu.
                this._close( $targetMenu );

                // Remove 'selected' class from all nested selected items.
                $nestedMenus.removeClass( 'selected' );

                // Close all nested submenus.
                this._close( $nestedMenus.find( 'ul' ) );

                // Execute the optional close callback.
                if ( this.options.closeCallback )
                {
                    return this.options.closeCallback( $( el ).parent() );
                }
            };

            /**
             * Opens a given jQuery element (submenu) with or without animation.
             * @param {jQuery} $el - The jQuery object representing the submenu to open.
             * @returns {jQuery} The opened element.
             */
            Tendina.prototype._open = function ( $el )
            {
                if ( this.options.animate )
                {
                    return $el.stop( true, true ).slideDown( this.options.speed );
                }
                else
                {
                    return $el.show();
                }
            };

            /**
             * Closes a given jQuery element (submenu) with or without animation.
             * @param {jQuery} $el - The jQuery object representing the submenu to close.
             * @returns {jQuery} The closed element.
             */
            Tendina.prototype._close = function ( $el )
            {
                if ( this.options.animate )
                {
                    return $el.stop( true, true ).slideUp( this.options.speed );
                }
                else
                {
                    return $el.hide();
                }
            };

            /**
             * Checks if an element has a submenu (an immediate 'ul' sibling).
             * @param {HTMLElement} el - The element to check.
             * @returns {boolean} True if it has children, false otherwise.
             */
            Tendina.prototype._hasChildren = function ( el )
            {
                return $( el ).next( 'ul' ).length > 0;
            };

            /**
             * Checks if the submenu of an element is currently hidden.
             * @param {HTMLElement} el - The element whose submenu is to be checked.
             * @returns {boolean} True if the children are hidden, false otherwise.
             */
            Tendina.prototype._IsChildrenHidden = function ( el )
            {
                return $( el ).next( 'ul' ).is( ':hidden' );
            };

            /**
             * Checks if the parent list item of an element has the 'selected' class.
             * @param {HTMLElement} el - The element to check.
             * @returns {boolean} True if currently open, false otherwise.
             */
            Tendina.prototype._isCurrentlyOpen = function ( el )
            {
                return $( el ).parent().hasClass( 'selected' );
            };

            /**
             * Hides all submenus within the Tendina instance.
             * @returns {jQuery} The Tendina element.
             */
            Tendina.prototype._hideSubmenus = function ()
            {
                return this.$el.find( 'ul' ).hide();
            };

            /**
             * Shows all submenus and marks all list items as 'selected'.
             * @returns {jQuery} The Tendina element.
             */
            Tendina.prototype._showSubmenus = function ()
            {
                this.$el.find( 'ul' ).show();
                return this.$el.find( 'li' ).addClass( 'selected' );
            };

            /**
             * Opens a specific menu item and its parent hierarchy.
             * Used for the 'activeMenu' option.
             * @param {string|jQuery} element - A selector string or a jQuery object pointing to the active item.
             * @returns {void}
             */
            Tendina.prototype._openActiveMenu = function ( element )
            {
                var $activeMenu, $activeParents; // jQuery objects for active menu items.

                // Resolve the active menu element.
                $activeMenu = element instanceof jQuery ? element : this.$el.find( element );

                // Find all parent links leading up to the active menu.
                $activeParents = $activeMenu.closest( 'ul' ).parents( 'li' ).find( '> a' );

                // If parent has children and they are hidden, show them.
                if ( this._hasChildren( $activeParents ) && this._IsChildrenHidden( $activeParents ) )
                {
                    $activeParents.next( 'ul' ).show();
                }
                else
                {
                    // Otherwise, show the direct submenu of the active menu.
                    $activeMenu.next( 'ul' ).show();
                }

                // Mark the active menu item and its parents as 'selected'.
                $activeMenu.parent().addClass( 'selected' );
                return $activeParents.parent().addClass( 'selected' );
            };

            /**
             * Destroys the Tendina instance, removing all added classes and event listeners.
             * Resets the menu to its initial state.
             * @returns {jQuery} The Tendina element.
             */
            Tendina.prototype.destroy = function ()
            {
                this.$el.removeData( 'tendina' ); // Remove the data associated with the element.
                this._unbindEvents(); // Detach all event handlers.
                this._showSubmenus(); // Show all submenus (undo initial hiding).
                this.$el.removeClass( 'tendina' ); // Remove the main tendina class.
                return this.$el.find( '.selected' ).removeClass( 'selected' ); // Remove 'selected' classes.
            };

            /**
             * Public method to hide all submenus.
             * @returns {jQuery} The Tendina element.
             */
            Tendina.prototype.hideAll = function ()
            {
                return this._hideSubmenus();
            };

            /**
             * Public method to show all submenus.
             * @returns {jQuery} The Tendina element.
             */
            Tendina.prototype.showAll = function ()
            {
                return this._showSubmenus();
            };

            return Tendina; // Return the Tendina class constructor.

        } )();

        // Attach the Tendina plugin to jQuery's prototype.
        return $.fn.extend( {
            tendina: function ()
            {
                var args, option;

                // Extract options and arguments from the function call.
                option = arguments[0], args = 2 <= arguments.length ? __slice.call( arguments, 1 ) : [];

                // Iterate over each selected element to apply the plugin.
                return this.each( function ()
                {
                    var $this, data;

                    $this = $( this ); // Current element as a jQuery object.
                    data = $this.data( 'tendina' ); // Retrieve existing Tendina instance data.

                    // If no instance exists, create a new one and store it.
                    if ( !data )
                    {
                        $this.data( 'tendina', ( data = new Tendina( this, option ) ) );
                    }

                    // If the option is a string, it's a method call.
                    if ( typeof option === 'string' )
                    {
                        return data[option].apply( data, args );
                    }
                } );
            }
        } );
    } )( window.jQuery, window ); // Pass jQuery and window objects.

} ).call( this ); // Call the outer IIFE, binding 'this' to the global context.