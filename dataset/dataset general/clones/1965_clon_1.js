/*
 * jQuery Notebook - Enhanced Text Editor
 *
 * Copyright (c) 2014
 * Raphael Cruzeiro - http://raphaelcruzeiro.eu/
 * Otávio Soares - Co-contributor
 *
 * This software is released under the MIT License.
 * For full license text, see: http://opensource.org/licenses/MIT
 *
 * Project repository on GitHub: https://github.com/raphaelcruzeiro/jquery-notebook
 * Current version: 0.5
 *
 * Inspiration for some functionalities of this plugin was drawn from Jacob Kelley's Medium.js project.
 * See: https://github.com/jakiestfu/Medium.js/
 */


( function( $, d, w ) {

    // This module is responsible for handling CSS transforms.
    // Due to the difficulty of combining transform functions directly with JavaScript,
    // this module provides an abstraction layer. It generates a raw transform matrix,
    // and intelligently combines new transforms with any existing transforms applied to the element.

    var transform = ( function() {

        // Converts a CSS transform matrix string into an array of numbers.
        // If no transform is present or it's 'none', returns an identity matrix.
        var matrixToArray = function( str ) {

            if ( !str || str == 'none' ) {
                return [ 1, 0, 0, 1, 0, 0 ];
            }

            return str.match( /(-?[0-9\.]+)/g );
        };


        // Retrieves the current transform string applied to an element,
        // checking for various vendor prefixes.
        var getPreviousTransforms = function( elem ) {

            return elem.css( '-webkit-transform' ) ||
                elem.css( 'transform' ) ||
                elem.css( '-moz-transform' ) ||
                elem.css( '-o-transform' ) ||
                elem.css( '-ms-transform' );
        };


        // Gets the current transform matrix of an element as an array.
        var getMatrix = function( elem ) {

            var previousTransform = getPreviousTransforms( elem );
            return matrixToArray( previousTransform );
        };


        // Applies a given transform string to an element,
        // ensuring cross-browser compatibility with vendor prefixes.
        var applyTransform = function( elem, transform ) {

            elem.css( '-webkit-transform', transform );
            elem.css( '-moz-transform', transform );
            elem.css( '-o-transform', transform );
            elem.css( '-ms-transform', transform );
            elem.css( 'transform', transform );
        };


        // Constructs a CSS matrix() string from an array of matrix values.
        var buildTransformString = function( matrix ) {

            return 'matrix(' + matrix[ 0 ] +
                ', ' + matrix[ 1 ] +
                ', ' + matrix[ 2 ] +
                ', ' + matrix[ 3 ] +
                ', ' + matrix[ 4 ] +
                ', ' + matrix[ 5 ] + ')';
        };


        // Extracts the current translation (x, y) from an element's transform matrix.
        var getTranslate = function( elem ) {

            var matrix = getMatrix( elem );
            return {
                x: parseInt( matrix[ 4 ] ),
                y: parseInt( matrix[ 5 ] )
            };
        };


        // Scales an element by a given factor.
        var scale = function( elem, _scale ) {

            var matrix = getMatrix( elem );
            matrix[ 0 ] = matrix[ 3 ] = _scale; // Scale X and Y components
            var transform = buildTransformString( matrix );
            applyTransform( elem, transform );
        };


        // Translates an element to a new (x, y) position.
        var translate = function( elem, x, y ) {

            var matrix = getMatrix( elem );
            matrix[ 4 ] = x; // Translate X
            matrix[ 5 ] = y; // Translate Y
            var transform = buildTransformString( matrix );
            applyTransform( elem, transform );
        };


        // Rotates an element by a given degree.
        var rotate = function( elem, deg ) {

            var matrix = getMatrix( elem );
            var rad1 = deg * ( Math.PI / 180 ); // Convert degrees to radians
            var rad2 = rad1 * -1;
            matrix[ 1 ] = rad1;
            matrix[ 2 ] = rad2;
            var transform = buildTransformString( matrix );
            applyTransform( elem, transform );
        };


        return {
            scale: scale,
            translate: translate,
            rotate: rotate,
            getTranslate: getTranslate
        };

    } )(); // End of transform module


    var isMac = w.navigator.platform == 'MacIntel', // Checks if the user is on a Mac OS.
        mouseX = 0, // Stores the current X coordinate of the mouse.
        mouseY = 0, // Stores the current Y coordinate of the mouse.
        cache = { // A cache object to store various states and references.
            command: false, // True if command/ctrl key is pressed.
            shift: false, // True if shift key is pressed.
            isSelecting: false, // True if text is currently being selected.
            focusedElement: null, // Reference to the currently focused contenteditable element.
            focusedElementIndex: 0 // Index of the focused element within its parent.
        },
        modifiers = { // Maps keyboard key codes to editor commands.
            66: 'bold', // B key
            73: 'italic', // I key
            85: 'underline', // U key
            112: 'h1', // F1 key (mapped to h1)
            113: 'h2', // F2 key (mapped to h2)
            122: 'undo' // F11 key (mapped to undo)
        },
        options, // Holds the plugin's configuration options.
        utils = { // Collection of general utility functions.

            keyboard: { // Keyboard event utilities.

                isCommand: function( e, callbackTrue, callbackFalse ) {
                    // Checks if the command key (Mac) or Ctrl key (Windows/Linux) is pressed.
                    if ( isMac && e.metaKey || !isMac && e.ctrlKey ) {
                        callbackTrue();
                    } else {
                        callbackFalse();
                    }
                },

                isShift: function( e, callbackTrue, callbackFalse ) {
                    // Checks if the Shift key is pressed.
                    if ( e.shiftKey ) {
                        callbackTrue();
                    } else {
                        callbackFalse();
                    }
                },

                isModifier: function( e, callback ) {
                    // Checks if the pressed key corresponds to a defined modifier command.
                    var key = e.which,
                        cmd = modifiers[ key ];
                    if ( cmd ) {
                        callback.call( this, cmd );
                    }
                },

                isEnter: function( e, callback ) {
                    // Checks if the Enter key is pressed.
                    if ( e.which === 13 ) {
                        callback();
                    }
                },

                isArrow: function( e, callback ) {
                    // Checks if an arrow key (left, up, right, down) is pressed.
                    if ( e.which >= 37 || e.which <= 40 ) {
                        callback();
                    }
                }
            }, // End of keyboard utilities

            html: { // HTML manipulation utilities.

                addTag: function( elem, tag, focus, editable ) {
                    // Creates and appends a new HTML element (tag) to the given element.
                    // Optionally sets contenteditable and focuses it.
                    var newElement = $( d.createElement( tag ) );
                    newElement.attr( 'contenteditable', Boolean( editable ) );
                    newElement.append( ' ' ); // Add a space for cursor placement
                    elem.append( newElement );

                    if ( focus ) {
                        cache.focusedElement = elem.children().last();
                        utils.cursor.set( elem, 0, cache.focusedElement );
                    }
                    return newElement;
                }
            }, // End of HTML utilities

            cursor: { // Cursor/selection manipulation utilities.

                set: function( editor, pos, elem ) {
                    // Sets the cursor position within a specified element.
                    var range;
                    if ( d.createRange ) { // Modern browsers
                        range = d.createRange();
                        var selection = w.getSelection(),
                            lastChild = editor.children().last(),
                            length = lastChild.html().length - 1,
                            toModify = elem ? elem[ 0 ] : lastChild[ 0 ],
                            theLength = typeof pos !== 'undefined' ? pos : length;

                        range.setStart( toModify, theLength );
                        range.collapse( true ); // Collapse the range to a single point
                        selection.removeAllRanges();
                        selection.addRange( range );
                    } else { // IE < 9
                        range = d.body.createTextRange();
                        range.moveToElementText( elem );
                        range.collapse( false );
                        range.select();
                    }
                }
            }, // End of cursor utilities

            selection: { // Text selection utilities.

                save: function() {
                    // Saves the current text selection range.
                    if ( w.getSelection ) {
                        var sel = w.getSelection();
                        if ( sel.rangeCount > 0 ) {
                            return sel.getRangeAt( 0 );
                        }
                    } else if ( d.selection && d.selection.createRange ) { // IE fallback
                        return d.selection.createRange();
                    }
                    return null;
                },

                restore: function( range ) {
                    // Restores a previously saved text selection range.
                    if ( range ) {
                        if ( w.getSelection ) {
                            var sel = w.getSelection();
                            sel.removeAllRanges();
                            sel.addRange( range );
                        } else if ( d.selection && range.select ) { // IE fallback
                            range.select();
                        }
                    }
                },

                getText: function() {
                    // Gets the currently selected text.
                    var txt = '';
                    if ( w.getSelection ) {
                        txt = w.getSelection().toString();
                    } else if ( d.getSelection ) { // Firefox specific
                        txt = d.getSelection().toString();
                    } else if ( d.selection ) { // IE specific
                        txt = d.selection.createRange().text;
                    }
                    return txt;
                },

                clear: function() {
                    // Clears the current text selection.
                    if ( window.getSelection ) {
                        if ( window.getSelection().empty ) { // Chrome, Safari
                            window.getSelection().empty();
                        } else if ( window.getSelection().removeAllRanges ) { // Firefox
                            window.getSelection().removeAllRanges();
                        }
                    } else if ( document.selection ) { // IE
                        document.selection.empty();
                    }
                },

                getContainer: function( sel ) {
                    // Gets the common ancestor container of the selection.
                    if ( w.getSelection && sel && sel.commonAncestorContainer ) {
                        return sel.commonAncestorContainer;
                    } else if ( d.selection && sel && sel.parentElement ) { // IE fallback
                        return sel.parentElement();
                    }
                    return null;
                },

                getSelection: function() {
                    // Returns the current selection object.
                    if ( w.getSelection ) {
                        return w.getSelection();
                    } else if ( d.selection && d.selection.createRange ) { // IE fallback
                        return d.selection;
                    }
                    return null;
                }
            }, // End of selection utilities

            validation: { // Input validation utilities.

                isUrl: function( url ) {
                    // Checks if a given string is a valid URL.
                    return ( /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/ ).test( url );
                }
            } // End of validation utilities

        }, // End of utils object

        bubble = { // Module for managing the formatting bubble (toolbar).

            /*
             * This function is responsible for positioning the formatting bubble
             * directly above the current text selection.
             */
            updatePos: function( editor, elem ) {

                var sel = w.getSelection(),
                    range = sel.getRangeAt( 0 ),
                    boundary = range.getBoundingClientRect(),
                    bubbleWidth = elem.width(),
                    bubbleHeight = elem.height(),
                    offset = editor.offset().left,
                    pos = {
                        x: ( boundary.left + boundary.width / 2 ) - ( bubbleWidth / 2 ),
                        y: boundary.top - bubbleHeight - 8 + $( document ).scrollTop()
                    };

                transform.translate( elem, pos.x, pos.y );
            },

            /*
             * Updates the visual state of the bubble buttons
             * to reflect the formatting of the current selection.
             */
            updateState: function( editor, elem ) {

                elem.find( 'button' ).removeClass( 'active' );
                var sel = w.getSelection(),
                    formats = [];

                bubble.checkForFormatting( sel.focusNode, formats );

                var formatDict = { // Mapping HTML tags to CSS classes for bubble buttons.
                    'b': 'bold',
                    'i': 'italic',
                    'u': 'underline',
                    'h1': 'h1',
                    'h2': 'h2',
                    'a': 'anchor',
                    'ul': 'ul',
                    'ol': 'ol'
                };

                for ( var i = 0; i < formats.length; i++ ) {
                    var format = formats[ i ];
                    elem.find( 'button.' + formatDict[ format ] ).addClass( 'active' );
                }
            },

            /*
             * Recursively traverses up the DOM tree from the current node
             * to identify all active formatting tags enclosing the selection.
             */
            checkForFormatting: function( currentNode, formats ) {

                var validFormats = [ 'b', 'i', 'u', 'h1', 'h2', 'ol', 'ul', 'li', 'a' ];

                if ( currentNode.nodeName === '#text' ||
                    validFormats.indexOf( currentNode.nodeName.toLowerCase() ) != -1 ) {

                    if ( currentNode.nodeName != '#text' ) {
                        formats.push( currentNode.nodeName.toLowerCase() );
                    }
                    if ( currentNode.parentNode ) { // Ensure parent exists before recursing
                        bubble.checkForFormatting( currentNode.parentNode, formats );
                    }
                }
            },

            /*
             * Constructs the menu elements within the formatting bubble.
             */
            buildMenu: function( editor, elem ) {

                var ul = utils.html.addTag( elem, 'ul', false, false ); // Create unordered list for buttons

                for ( var cmd in options.modifiers ) {
                    var li = utils.html.addTag( ul, 'li', false, false );
                    var btn = utils.html.addTag( li, 'button', false, false );
                    btn.attr( 'editor-command', options.modifiers[ cmd ] );
                    btn.addClass( options.modifiers[ cmd ] );
                }

                elem.find( 'button' ).click( function( e ) {
                    e.preventDefault();
                    var cmd = $( this ).attr( 'editor-command' );
                    events.commands[ cmd ].call( editor, e ); // Execute the command
                } );

                var linkArea = utils.html.addTag( elem, 'div', false, false );
                linkArea.addClass( 'link-area' );

                var linkInput = utils.html.addTag( linkArea, 'input', false, false );
                linkInput.attr( {
                    type: 'text'
                } );

                var closeBtn = utils.html.addTag( linkArea, 'button', false, false );
                closeBtn.click( function( e ) {
                    e.preventDefault();
                    var editor = $( this ).closest( '.editor' );
                    $( this ).closest( '.link-area' ).hide();
                    $( this ).closest( '.bubble' ).find( 'ul' ).show();
                } );
            },

            /*
             * Displays the formatting bubble.
             */
            show: function() {

                var tag = $( this ).parent().find( '.bubble' );

                if ( !tag.length ) { // If bubble doesn't exist, create it.
                    tag = utils.html.addTag( $( this ).parent(), 'div', false, false );
                    tag.addClass( 'jquery-notebook bubble' );
                }

                tag.empty(); // Clear previous content
                bubble.buildMenu( this, tag ); // Rebuild menu
                tag.show(); // Make bubble visible
                bubble.updateState( this, tag ); // Update button states

                if ( !tag.hasClass( 'active' ) ) {
                    tag.addClass( 'jump' ); // Add animation class if not already active
                } else {
                    tag.removeClass( 'jump' );
                }

                bubble.updatePos( $( this ), tag ); // Position the bubble
                tag.addClass( 'active' ); // Mark as active
            },

            /*
             * Updates the state of the bubble's buttons based on the current selection.
             */
            update: function() {

                var tag = $( this ).parent().find( '.bubble' );
                bubble.updateState( this, tag );
            },

            /*
             * Hides and deactivates the formatting bubble.
             */
            clear: function() {

                var elem = $( this ).parent().find( '.bubble' );
                if ( !elem.hasClass( 'active' ) ) return; // Only clear if active

                elem.removeClass( 'active' );
                bubble.hideLinkInput.call( this );
                bubble.showButtons.call( this );

                setTimeout( function() {
                    if ( elem.hasClass( 'active' ) ) return; // Prevent hiding if reactivated quickly
                    elem.hide();
                }, 500 ); // Delay hiding to allow for CSS transitions
            },

            /*
             * Hides the main formatting buttons in the bubble.
             */
            hideButtons: function() {

                $( this ).parent().find( '.bubble' ).find( 'ul' ).hide();
            },

            /*
             * Shows the main formatting buttons in the bubble.
             */
            showButtons: function() {

                $( this ).parent().find( '.bubble' ).find( 'ul' ).show();
            },

            /*
             * Displays the link input field within the bubble.
             */
            showLinkInput: function( selection ) {

                bubble.hideButtons.call( this );
                var editor = this;
                var elem = $( this ).parent().find( '.bubble' ).find( 'input[type=text]' );
                var hasLink = elem.closest( '.jquery-notebook' ).find( 'button.anchor' ).hasClass( 'active' );

                elem.unbind( 'keydown' ); // Unbind previous event handlers
                elem.keydown( function( e ) {
                    var elem = $( this );

                    utils.keyboard.isEnter( e, function() {
                        e.preventDefault();
                        var url = elem.val();

                        if ( utils.validation.isUrl( url ) ) {
                            e.url = url;
                            events.commands.createLink( e, selection );
                            bubble.clear.call( editor );
                        } else if ( url === '' && hasLink ) {
                            events.commands.removeLink( e, selection );
                            bubble.clear.call( editor );
                        }
                    } );
                } );

                elem.bind( 'paste', function( e ) {
                    var elem = $( this );
                    setTimeout( function() {
                        var text = elem.val();
                        // Remove "http://" if it's duplicated from a paste operation
                        if ( /http:\/\/https?:\/\//.test( text ) ) {
                            text = text.substring( 7 );
                            elem.val( text );
                        }
                    }, 1 );
                } );

                var linkText = 'http://';
                if ( hasLink ) {
                    var anchor = $( utils.selection.getContainer( selection ) ).closest( 'a' );
                    linkText = anchor.prop( 'href' ) || linkText;
                }

                $( this ).parent().find( '.link-area' ).show();
                elem.val( linkText ).focus();
            },

            /*
             * Hides the link input field within the bubble.
             */
            hideLinkInput: function() {

                $( this ).parent().find( '.bubble' ).find( '.link-area' ).hide();
            }

        }, // End of bubble module

        actions = { // Module for editor actions and setup.

            /*
             * Binds all necessary event listeners to the editor element.
             */
            bindEvents: function( elem ) {

                elem.keydown( rawEvents.keydown );
                elem.keyup( rawEvents.keyup );
                elem.focus( rawEvents.focus );
                elem.bind( 'paste', events.paste ); // Custom paste handler
                elem.mousedown( rawEvents.mouseClick );
                elem.mouseup( rawEvents.mouseUp );
                elem.mousemove( rawEvents.mouseMove );
                elem.blur( rawEvents.blur );

                // Global mouseup to catch selections ending outside the editor
                $( 'body' ).mouseup( function( e ) {
                    if ( e.target == e.currentTarget && cache.isSelecting ) {
                        rawEvents.mouseUp.call( elem, e );
                    }
                } );
            },

            /*
             * Manages the display of the placeholder text.
             * If the editor is empty, displays the placeholder.
             */
            setPlaceholder: function( e ) {

                if ( /^\s*$/.test( $( this ).text() ) ) { // Check if content is empty or only whitespace
                    $( this ).empty();
                    var placeholder = utils.html.addTag( $( this ), 'p' ).addClass( 'placeholder' );
                    placeholder.append( $( this ).attr( 'editor-placeholder' ) );
                    utils.html.addTag( $( this ), 'p', typeof e.focus != 'undefined' ? e.focus : false, true );
                } else {
                    $( this ).find( '.placeholder' ).remove();
                }
            },

            /*
             * Removes the placeholder text from the editor.
             */
            removePlaceholder: function( e ) {

                $( this ).find( '.placeholder' ).remove();
            },

            /*
             * Preserves the focus on the currently active contenteditable element
             * within the editor.
             */
            preserveElementFocus: function() {

                var anchorNode = w.getSelection() ? w.getSelection().anchorNode : d.activeElement;
                if ( anchorNode ) {
                    var current = anchorNode.parentNode,
                        diff = current !== cache.focusedElement,
                        children = this.children,
                        elementIndex = 0;

                    if ( current === this ) { // If direct child of editor
                        current = anchorNode;
                    }

                    for ( var i = 0; i < children.length; i++ ) {
                        if ( current === children[ i ] ) {
                            elementIndex = i;
                            break;
                        }
                    }

                    if ( diff ) {
                        cache.focusedElement = current;
                        cache.focusedElementIndex = elementIndex;
                    }
                }
            },

            /*
             * Sets up a hidden textarea to store the editor's content.
             */
            setContentArea: function( elem ) {

                var id = $( 'body' ).find( '.jquery-editor' ).length + 1;
                elem.attr( 'data-jquery-notebook-id', id );

                var body = $( 'body' );
                contentArea = $( '<textarea></textarea>' );
                contentArea.css( {
                    position: 'absolute',
                    left: -1000 // Position off-screen
                } );
                contentArea.attr( 'id', 'jquery-notebook-content-' + id );
                body.append( contentArea );
            },

            /*
             * Initializes the editor element with necessary attributes and styles.
             */
            prepare: function( elem, customOptions ) {

                options = customOptions; // Store options globally
                actions.setContentArea( elem ); // Create hidden content area
                elem.attr( 'editor-mode', options.mode );
                elem.attr( 'editor-placeholder', options.placeholder );
                elem.attr( 'contenteditable', true ); // Make the element editable
                elem.css( 'position', 'relative' ); // Required for bubble positioning
                elem.addClass( 'jquery-notebook editor' ); // Add editor classes

                actions.setPlaceholder.call( elem, {} ); // Set initial placeholder
                actions.preserveElementFocus.call( elem ); // Preserve focus on init

                if ( options.autoFocus === true ) {
                    var firstP = elem.find( 'p:not(.placeholder)' );
                    utils.cursor.set( elem, 0, firstP ); // Set cursor to the beginning of the first paragraph
                }
            }

        }, // End of actions module

        rawEvents = { // Handlers for raw DOM events.

            keydown: function( e ) {