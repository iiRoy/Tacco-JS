/******************************************************************************************************************************

 * @ Original idea by by Binny V A, Original version: 2.00.A
 *
 * This script provides keyboard shortcut functionality.
 *
 * @ See original source: http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * @ Original License : BSD License.
 *
 *
 * @ jQuery Plugin by Tzury Bar Yochay
 *
 * Feel free to contact the author:
 *        mail: tzury.by@gmail.com
 *        blog: evalinux.wordpress.com
 *        face: facebook.com/profile.php?id=513676303
 *
 *        (c) Copyrights 2007 - All rights reserved.
 *
 * @ jQuery Plugin version Beta (0.0.2)
 * @ License: jQuery-License.
 *
 * TODO list for future enhancements:
 *    - Add queue support (similar to Gmail's 'x' then 'y' sequence).
 *    - Implement mouse and mouse wheel events for shortcuts.
 *
 * Basic USAGE examples:
 *    // Assign a simple shortcut for 'Ctrl+c'
 *    $.hotkeys.add('Ctrl+c', function(){ alert('copy anyone?');});
 *
 *    // Assign a shortcut with specific options (target, event type, propagation)
 *    $.hotkeys.add('Ctrl+c', {target:'div#editor', type:'keyup', propagate: true},function(){ alert('copy anyone?');});
 *
 *    // Remove a previously defined shortcut
 *    $.hotkeys.remove('Ctrl+c');
 *
 *    // Remove a shortcut with specific options (target, event type)
 *    $.hotkeys.remove('Ctrl+c', {target:'div#editor', type:'keypress'});
 *
 ******************************************************************************************************************************/
(   function    (    jQuery    )    {

    // Plugin version information
    this.version        =       '(beta)(0.0.3)';

    // Central storage for all registered hotkeys across different elements and event types
    this.all            =       {};

    // Mapping of special key codes to their string representations
    this.special_keys   =       {

        27:     'esc',
        9:      'tab',
        32:     'space',
        13:     'return',
        8:      'backspace',
        145:    'scroll',
        20:     'capslock',

        144:    'numlock',
        19:     'pause',
        45:     'insert',
        36:     'home',
        46:     'del',
        35:     'end',
        33:     'pageup',

        34:     'pagedown',
        37:     'left',
        38:     'up',
        39:     'right',
        40:     'down',
        112:    'f1',
        113:    'f2',
        114:    'f3',

        115:    'f4',
        116:    'f5',
        117:    'f6',
        118:    'f7',
        119:    'f8',
        120:    'f9',
        121:    'f10',
        122:    'f11',
        123:    'f12'
    };

    // Mapping of standard keys to their shift-modified counterparts
    this.shift_nums     =       {
        "`":"~",
        "1":"!",
        "2":"@",
        "3":"#",
        "4":"$",
        "5":"%",
        "6":"^",
        "7":"&",

        "8":"*",
        "9":"(",
        "0":")",
        "-":"_",
        "=":"+",
        ";":":",
        "'":"\"",
        ",":"<",

        ".":">",
        "/":"?",
        "\\":"|"
    };


    /**
     * Adds a new keyboard shortcut.
     *
     * @param {string} combi - The key combination (e.g., 'Ctrl+c', 'shift+a').
     * @param {object|function} options - Optional settings or the callback function directly.
     * @param {function} [callback] - The function to execute when the shortcut is triggered.
     * @returns {jQuery} - The jQuery object for chaining.
     */
    this.add            =       function (    combi,    options,    callback    )     {

        // If options is a function, it means it's the callback, and options are default.
        if      (       jQuery.isFunction(    options    )       )       {

            callback        =       options;

            options         =       {};

        }


        var     opt         =       {},

            // Default settings for a hotkey
            defaults    =       {
                type:               'keydown',
                propagate:          false,
                disableInInput:     false,
                target:             jQuery('html')[0],
                checkParent:        true
            },
            that            =       this; // Reference to the hotkeys object


        // Merge provided options with defaults
        opt         =       jQuery.extend(    opt,    defaults,    options    ||    {}    );

        // Convert key combination to lowercase for consistent matching
        combi       =       combi.toLowerCase();


        /**
         * The event inspector function, attached to the DOM element.
         * This function checks if a triggered keyboard event matches any registered hotkey.
         *
         * @param {Event} event - The keyboard event object.
         */
        var     inspector   =       function    (    event    )     {

            event       =       jQuery.event.fix(    event    );    // jQuery event normalization for cross-browser consistency.

            var     element     =       event.target;

            // For text nodes (nodeType == 3), get the parent element.
            element     =       (    element.nodeType    ==    3    )    ?    element.parentNode    :    element;


            // Check if the shortcut should be disabled in input/textarea fields
            if      (    opt['disableInInput']    )     {

                var     target      =       jQuery(    element    );

                if      (    target.is("input")    ||    target.is("textarea")    )     {

                    return;     // Do not process shortcut if in an input field.

                }

            }

            var     code        =       event.which,
                type        =       event.type,
                character   =       String.fromCharCode(    code    ).toLowerCase(),
                special     =       that.special_keys[    code    ],
                shift       =       event.shiftKey,
                ctrl        =       event.ctrlKey,
                alt         =       event.altKey,
                propagate   =       true,     // Default behavior: allow event propagation
                mapPoint    =       null;     // Placeholder for the matched callback data


            // In Opera and Safari, event.target can be unpredictable.
            // This loop ensures we check up the DOM tree for the correct element context.
            if      (    jQuery.browser.opera    ||    jQuery.browser.safari    ||    opt.checkParent    )    {

                while   (    !that.all[    element    ]    &&    element.parentNode    )    {

                    element     =       element.parentNode;

                }

            }


            // Retrieve the callback map for the current element and event type.
            var     cbMap       =       that.all[    element    ].events[    type    ].callbackMap;

            // Handle cases with no modifiers (Shift, Ctrl, Alt)
            if      (    !shift    &&    !ctrl    &&    !alt    )     {

                mapPoint    =       cbMap[    special    ]    ||    cbMap[    character    ];

            }
            // Handle combinations with modifiers (Alt, Ctrl, Shift + any key)
            else    {

                var     modif       =       '';

                if      (    alt    )       modif       +=      'alt+';

                if      (    ctrl    )      modif       +=      'ctrl+';

                if      (    shift    )     modif       +=      'shift+';

                // Try to match: modifiers + special key, or modifiers + character, or modifiers + shift-modified character
                mapPoint    =       cbMap[    modif    +    special    ]    ||    cbMap[    modif    +    character    ]    ||    cbMap[    modif    +    that.shift_nums[    character    ]    ];

            }


            // If a matching hotkey is found, execute its callback.
            if      (    mapPoint    )    {

                mapPoint.cb(    event    );

                // If the hotkey is set not to propagate, stop event propagation and prevent default action.
                if      (    !mapPoint.propagate    )    {

                    event.stopPropagation();

                    event.preventDefault();

                    return  false;

                }

            }

        };


        // --- Hotkey registration logic ---

        // If this is the first hotkey for this target element, initialize its entry.
        if      (    !this.all[    opt.target    ]    )    {

            this.all[    opt.target    ]     =     {    events:{    }    };

        }

        // If this is the first hotkey for this event type on this target, initialize and attach the inspector.
        if      (    !this.all[    opt.target    ].events[    opt.type    ]    )    {

            this.all[    opt.target    ].events[    opt.type    ]     =     {    callbackMap:    {}    };

            // Attach the global inspector function to the target element for the specified event type.
            jQuery.event.add(    opt.target,    opt.type,    inspector    );

        }

        // Store the callback and propagation setting for the specific key combination.
        this.all[    opt.target    ].events[    opt.type    ].callbackMap[    combi    ]     =     {    cb:    callback,    propagate:opt.propagate    };

        return  jQuery;    // Return jQuery for chainability.

    };


    /**
     * Removes a previously registered keyboard shortcut.
     *
     * @param {string} exp - The key combination to remove (e.g., 'Ctrl+c').
     * @param {object} [opt] - Optional settings, including 'target' and 'type'.
     * @returns {jQuery} - The jQuery object for chaining.
     */
    this.remove         =       function    (    exp,    opt    )     {

        opt         =       opt    ||    {};

        var     target      =       opt.target    ||    jQuery('html')[0],
            type        =       opt.type    ||    'keydown';

        exp         =       exp.toLowerCase();

        // Delete the entry for the specified key combination.
        delete  this.all[    target    ].events[    type    ].callbackMap[    exp    ];

        return  jQuery;     // Return jQuery for chainability.

    };


    // Expose the hotkeys object as a jQuery plugin.
    jQuery.hotkeys      =       this;

    // Return the jQuery object to maintain chainability in the IIFE.
    return  jQuery;

}   )   (   jQuery   );