/*
 * This file contains the implementation of the Modals object,
 * responsible for managing interactive modal windows within the application.
 * It handles creation, population, and destruction of various
 * types of modals, including dialogues, choices, and notifications.
 */

function Modals ( ) {

    // Initialize properties for the modal system.
    this.activeModal = ''; // Stores the currently active modal element.
    this.allowPress = true; // Controls whether key presses are currently processed.
    this.cancelTyping = false; // Flag to indicate if typing animation should be interrupted.
    this.continueIcon = '<div class="icon continue"></div>'; // HTML for the 'continue' icon.
    this.id = 0; // A generic ID, not heavily used in the provided code.
    this.modalCounter = 0; // Counter for generating unique modal IDs.
    this.npc = ''; // Reference to an NPC object, if the modal is related to one.
    this.typing = false; // Indicates if text is currently being typed out.

    /**
     * checkButtons: This method processes keyboard input
     * when a modal is active. It handles navigation and
     * interaction within modal dialogues and choice lists.
     *
     * @returns {void}
     */
    this.checkButtons = function ( ) {
        // Retrieve the currently active modal.
        var modal = $.modals.activeModal;

        // If no modal is active or it's empty, do nothing.
        if ( modal.length === 0 || modal.html( ) === '' ) {
            return;
        }

        // Get the currently active DOM element and the dialogue data.
        var
            activeElement = $( document.activeElement ) ,
            dialogue = modal.data( 'modal' )[ 'dialogue' ] ;

        // If key presses are not allowed, exit early.
        if ( ! $.modals.allowPress ) {
            return;
        }

        // Handle the Shift key - currently no specific action.
        if ( Game.pressedKeys[ 16 ] ) {
            // Placeholder for future Shift-related functionality.
        }

        // Handle Spacebar (32) or Enter (13) key presses.
        if ( Game.pressedKeys[ 13 ] || Game.pressedKeys[ 32 ] ) {
            $.modals.allowPress = false; // Prevent rapid multiple presses.

            // Determine action based on the active element.
            switch ( true ) {
                case ( activeElement.is( 'li' ) ) :
                    // If an 'li' (list item) is active, it's a choice.
                    var choice = dialogue.choices[ activeElement.index( ) ] ;

                    // Execute choice's action if defined.
                    if ( choice.action ) {
                        choice.action( ) ;
                    }

                    // Go to a new dialogue if 'goTo' is specified.
                    if ( choice.goTo ) {
                        return modal.modal( 'populate', Dialogue[ choice.goTo ] ) ;
                    }

                    break;

                default :
                    // Default case, usually for dialogue progression.
                    if ( $.modals.typing ) {
                        // If text is still typing, cancel it and show full text.
                        $.modals.cancelTyping = true;
                        return;
                    }

                    // If dialogue has a 'goTo', populate with the next dialogue.
                    if ( dialogue.goTo ) {
                        modal.modal( 'populate', Dialogue[ dialogue.goTo ] ) ;
                        break;
                    } else if ( dialogue.end ) {
                        // If dialogue ends, destroy the modal.
                        modal.modal( 'destroy', $( '#player' ) ) ;

                        // If an NPC was associated, resume its wandering.
                        if ( modal.data( 'modal' )[ 'npc' ] ) {
                            modal.data( 'modal' )[ 'npc' ].data( 'npc' )[ 'wanderPause' ] = false;
                        }

                        break;
                    }

                    break;
            }
        }

        // Handle directional key presses (W, S, A, D, Up, Down, Left, Right).
        switch ( true ) {
            // W (87), Up Arrow (38)
            case ( ( Game.pressedKeys[ 87 ] || Game.pressedKeys[ 38 ] ) ) :
                $.modals.allowPress = false; // Prevent multiple presses.

                switch ( true ) {
                    case ( activeElement.is( 'li' ) ) :
                        // Move focus to the previous list item.
                        activeElement.prev( 'li' ).trigger( 'focus' ) ;
                        break;
                }

                break;

            // S (83), Down Arrow (40)
            case ( ( Game.pressedKeys[ 83 ] || Game.pressedKeys[ 40 ] ) ) :
                $.modals.allowPress = false; // Prevent multiple presses.

                switch ( true ) {
                    case ( activeElement.is( 'li' ) ) :
                        // Move focus to the next list item.
                        activeElement.next( 'li' ).trigger( 'focus' ) ;
                        break;
                }

                break;

            // A (65), Left Arrow (37)
            case ( ( Game.pressedKeys[ 65 ] || Game.pressedKeys[ 37 ] ) ) :
                $.modals.allowPress = false; // Prevent multiple presses.
                // No specific action defined for Left Arrow in this context.
                break;

            // D (68), Right Arrow (39)
            case ( ( Game.pressedKeys[ 68 ] || Game.pressedKeys[ 39 ] ) ) :
                $.modals.allowPress = false; // Prevent multiple presses.
                // No specific action defined for Right Arrow in this context.
                break;

            default:
                // No action for other keys.
                break;
        }
    }; // End of checkButtons function.

    /**
     * create: This function is responsible for creating and displaying a new modal window.
     * It handles sizing, positioning, and initial population of the modal.
     *
     * @param {object} size - Object containing height and width for the modal.
     * @param {object} position - Object containing left and top coordinates for the modal.
     * @param {object} dialogue - The dialogue data to populate the modal with.
     * @param {object} npc - Optional NPC object associated with the modal.
     * @returns {void}
     */
    this.create = function ( size, position, dialogue, npc ) {

        var
            delay = 0, // Initial delay before creating the modal.
            modal = '', // Placeholder for the jQuery modal object.
            id = $.modals.modalCounter + ''; // Generate a string ID for the modal.

        $.modals.allowPress = false; // Disable key presses while creating.

        // Pad the modal ID with leading zeros to ensure a consistent format (e.g., m001).
        while ( id.length < ( 3 - ( ( $.modals.modalCounter + '' ) ).length + 1 ) ) {
            id = '0' + id;
        }

        id = 'm' + id; // Prepend 'm' to the ID.

        // Special handling for 'notification' type modals.
        if ( dialogue.type === 'notification' ) {
            delay = 180; // Notifications have a slight delay.

            // Destroy any existing notification modals to ensure only one is visible.
            $( '.modal.notification' ).not( modal ).each( function ( index, element ) {
                $( element ).modal( 'destroy', null );
            } );
        }

        // Set a timeout to create the modal after the specified delay.
        setTimeout( function ( ) {
            // Append the new modal div to the '#modals' container.
            $( '#modals' ).append( '<div id="' + id + '" class="modal ' + dialogue.type + '" tabindex="0"></div>' ) ;

            $.modals.modalCounter++; // Increment the counter for the next modal.

            modal = $( '#' + id ); // Get the newly created modal as a jQuery object.

            // Store a new Modals instance in the modal's data.
            modal.data( 'modal', new Modals( ) ) ;
            modal.data( 'modal' )[ 'id' ] = id; // Set the modal's internal ID.

            // If an NPC is provided, associate it with the modal.
            if ( npc ) {
                modal.data( 'modal' )[ 'npc' ] = npc ? npc : '';
            }

            // Set the initial position of the modal.
            modal.css( {
                left: position.left,
                top: position.top
            } ) ;

            // Animate the modal's size to its target dimensions.
            modal.animate( {
                height: size.height,
                width: size.width
            }, 180, function ( ) {
                // Once animation is complete, populate the modal with dialogue.
                modal.modal( 'populate', dialogue ) ;
                $.modals.activeModal = modal; // Set this modal as the active one.
            } ) ;
        }, delay ) ;
    }, // End of create function.

    /**
     * destroy: This method removes a modal window from the DOM.
     * It animates the modal's closure and handles associated NPC actions.
     *
     * @param {jQuery} focus - The element to focus on after the modal is destroyed.
     * @returns {void}
     */
    this.destroy = function ( focus ) {

        var
            modal = $( this ), // The modal element being destroyed.
            npc = modal.data( 'modal' )[ 'npc' ]; // Associated NPC.

        modal.html( '' ) ; // Clear modal content immediately.

        // Animate the modal shrinking and fading out.
        modal.animate( {
            height: 0,
            width: 0,
            zIndex: 0
        }, 180, function ( ) {
            modal.remove( ) ; // Remove the modal element from the DOM.

            // If an NPC was associated, destroy its emote and free the talking state.
            if ( npc ) {
                npc.npc( 'destroyEmote' ) ;
                $.npc.talking = false;
            }

            // If a focus element was provided, trigger focus on it.
            if ( focus ) {
                focus.trigger( 'focus' ) ;
            }
        } ) ;
    }, // End of destroy function.

    /**
     * option: This function acts as a getter/setter for modal options.
     * It allows accessing or modifying specific data stored within the modal.
     *
     * @param {string} option - The name of the option to get or set.
     * @param {*} [value] - The new value for the option (optional, for setting).
     * @returns {*} The option's value if getting, or nothing if setting.
     */
    this.option = function ( option, value ) {

        var
            element = $( this ), // The modal element.
            data = element.data( 'modal' ); // The internal modal data object.

        // If 'value' is undefined, it's a getter call.
        if ( typeof value === 'undefined' ) {
            return data[ option ] ;
        } else {
            // Otherwise, it's a setter call.
            data[ option ] = value;

            // Placeholder for potential actions based on the option being set.
            switch ( option ) {
                // No specific actions defined in the provided code for setting options.
            }
        }
    }, // End of option function.

    /**
     * populate: This method fills a modal with content based on the provided dialogue data.
     * It handles different modal types like 'choice', 'dialogue', and 'notification'.
     *
     * @param {object} dialogue - The dialogue object containing text, choices, type, etc.
     * @returns {void}
     */
    this.populate = function ( dialogue ) {

        var
            emote = dialogue.emote, // Emote for associated NPC.
            modal = $( this ), // The modal element to populate.
            npc = Game.activeNPC, // Currently active NPC.
            type = dialogue.type; // Type of the dialogue (choice, dialogue, notification).

        // If an NPC is active and an emote is specified, trigger the NPC's emote.
        if ( npc && emote ) {
            npc.npc( 'emote', emote ) ;
        }

        // Store the current dialogue data within the modal.
        modal.data( 'modal' )[ 'dialogue' ] = dialogue;

        // Populate the modal based on its type.
        switch ( type ) {

            // Case for 'choice' modals.
            case 'choice':
                var choices = '<ul class="choice">'; // Start an unordered list for choices.

                // Iterate through choices and create list items.
                $.each( dialogue.choices, function ( index, value ) {
                    choices += '<li tabindex="0">' + value.label + '</li>' ;
                } ) ;

                choices += '</ul>'; // Close the unordered list.

                // Set modal HTML and focus on the first choice.
                modal.html( choices ).find( 'li:first' ).trigger( 'focus' ) ;

                break;

            // Case for 'dialogue' modals with typing animation.
            case 'dialogue':
                var
                    counter = 0, // Counter for characters typed.
                    interval = setInterval( function ( ) {
                        // If typing is cancelled, display the rest of the text immediately.
                        if ( $.modals.cancelTyping ) {
                            modal.append( dialogue.text.substr( counter, dialogue.text.length ) ) ;

                            $.modals.cancelTyping = false;
                            $.modals.typing = false;

                            modal.append( $.modals.continueIcon ) ;

                            clearInterval( interval ) ; // Stop the typing interval.

                            return;
                        } ;

                        modal.append( dialogue.text.charAt( counter ) ) ; // Append one character.

                        Sounds.fx.bip.play( ) ; // Play a 'bip' sound for typing.

                        counter++; // Move to the next character.

                        // If all characters are typed.
                        if ( counter >= dialogue.text.length ) {
                            $.modals.typing = false; // Mark typing as complete.

                            modal.append( $.modals.continueIcon ) ; // Add the continue icon.

                            clearInterval( interval ) ; // Stop the typing interval.

                            return;
                        }
                    }, 50 ) ; // Typing speed (50ms per character).

                $.modals.typing = true; // Set typing flag to true.

                modal.html( '' ) ; // Clear modal content before typing.

                // Execute dialogue's action if defined.
                if ( dialogue.action ) {
                    dialogue.action( ) ;
                }

                break;

            // Case for 'notification' modals.
            case 'notification':
                modal.append( dialogue.text ) ; // Simply append the notification text.

                // Set a timeout to automatically destroy the notification after 10 seconds.
                setTimeout( function ( ) {
                    modal.modal( 'destroy', null ) ;
                }, 10000 ) ;

                break;

        }
    } // End of populate function.
} // End of Modals constructor function.

/*
 * jQuery plugin definition for 'modal'.
 * This allows jQuery objects to interact with the Modals functionality.
 */
$.fn.modal = function ( option ) {

    var
        element = $( this[ 0 ] ), // The first element in the jQuery collection.
        otherArgs = Array.prototype.slice.call( arguments, 1 ) ; // Any additional arguments.

    // If an option and additional arguments are provided, it's a method call.
    if ( typeof option !== 'undefined' && otherArgs.length > 0 ) {
        // Call the corresponding method on the modal's internal instance.
        return element.data( 'modal' )[ option ].apply( this[ 0 ], [ ].concat( otherArgs ) ) ;
    }

    // Otherwise, return the modal's internal data instance.
    return element.data( 'modal' ) ;
} ;

// Initialize the global Modals instance.
$.modals = new Modals( ) ;