/*
 * wangEditor version 1.3 JavaScript source file
 * Author: 王福朋
 * Date: 2015-04-08
 * This file contains the core logic for the wangEditor rich text editor.
 * It is structured as an immediately invoked function expression (IIFE)
 * to encapsulate its scope and prevent global variable pollution.
 */
( function ( window, $, undefined ) {

    // --- Core jQuery Dependency Check ---
    // This section ensures that jQuery is loaded and available
    // before wangEditor attempts to use it.
    if ( ! $ ) {
        alert ( 'Error: jQuery is not loaded. wangEditor requires jQuery to function. Please include jQuery before wangEditor.' ) ;
    } else if ( typeof $ !== 'function' || /^\d+\.\d+\.\d+$/.test ( $ ( ) . jquery ) === false ) {
        // Checks if jQuery object is a function and if its version matches a standard format
        alert ( 'Error: window.jQuery has been modified or is not a standard version. wangEditor cannot proceed.' ) ;
    }


    // --- Browser Detection for Legacy IE Versions ---
    // Initializes flags for specific Internet Explorer versions (IE6, IE7, IE8).
    // These flags are used later for compatibility adjustments, especially with font icons.
    var isIE6 = false, /* Flag for Internet Explorer 6 */
        isIE7 = false, /* Flag for Internet Explorer 7 */
        isIE8 = false, /* Flag for Internet Explorer 8 */
        appVersion;    /* Stores the application version string */

    if ( navigator.appName === "Microsoft Internet Explorer" ) {
        appVersion = navigator.appVersion.split ( ";" ) [ 1 ] . replace ( / [ ] /g, "" ) ; // Extract and clean version string
        isIE6 = appVersion === 'MSIE6.0' ; // Check for IE6
        isIE7 = appVersion === 'MSIE7.0' ; // Check for IE7
        isIE8 = appVersion === 'MSIE8.0' ; // Check for IE8
    }


    // --- Font-Icon Configuration for Legacy IE (IE6, IE7, IE8) ---
    // This block handles the display of font icons, which might not render correctly
    // in older IE versions without specific workarounds.
    if ( isIE6 || isIE7 || isIE8 ) {
        // This specific fix targets only IE6, IE7, and IE8.
        window.onload = function ( ) {
            /**
             * Helper function to replace an element's content with a font icon span.
             * @param {HTMLElement} elem The DOM element to modify.
             * @param {string} entity The HTML entity code for the icon.
             */
            function addIcon ( elem, entity ) {
                elem.className = ''; // Clear existing classes
                elem.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>'; // Insert icon span
            }

            // Mapping of icon class names to their respective HTML entity codes.
            var icons = {
                'icon-wangEditor-link'        : '&#xe800;',
                'icon-wangEditor-unlink'      : '&#xe801;',
                'icon-wangEditor-code'        : '&#xe802;',
                'icon-wangEditor-cancel'      : '&#xe803;',
                'icon-wangEditor-terminal'    : '&#xe804;',
                'icon-wangEditor-angle-down'  : '&#xe805;',
                'icon-wangEditor-font'        : '&#xe806;',
                'icon-wangEditor-bold'        : '&#xe807;',
                'icon-wangEditor-italic'      : '&#xe808;',
                'icon-wangEditor-header'      : '&#xe809;',
                'icon-wangEditor-align-left'  : '&#xe80a;',
                'icon-wangEditor-align-center': '&#xe80b;',
                'icon-wangEditor-align-right' : '&#xe80c;',
                'icon-wangEditor-list-bullet' : '&#xe80d;',
                'icon-wangEditor-indent-left' : '&#xe80e;',
                'icon-wangEditor-indent-right': '&#xe80f;',
                'icon-wangEditor-list-numbered':'&#xe810;',
                'icon-wangEditor-underline'   : '&#xe811;',
                'icon-wangEditor-table'       : '&#xe812;',
                'icon-wangEditor-eraser'      : '&#xe813;',
                'icon-wangEditor-text-height' : '&#xe814;',
                'icon-wangEditor-brush'       : '&#xe815;',
                'icon-wangEditor-pencil'      : '&#xe816;',
                'icon-wangEditor-minus'       : '&#xe817;',
                'icon-wangEditor-picture'     : '&#xe818;',
                'icon-wangEditor-file-image'  : '&#xe819;',
                'icon-wangEditor-cw'          : '&#xe81a;',
                'icon-wangEditor-ccw'         : '&#xe81b;'
            };

            // Iterates through all icon elements within the wangEditor container
            // and replaces them with the appropriate font icon using the `addIcon` function.
            $ ( '.wangEditor-container i' ) . each ( function ( ) {
                var elem = this,
                    className = this.className,
                    matchs = className.match ( /icon-wangEditor-[^\s'"]+/ ); // Regex to find icon class

                if ( matchs ) {
                    addIcon ( elem, icons [ matchs [ 0 ] ] ) ; // Apply the icon
                }
            } ) ;
        } ;
    }


    // --- Global Variable Definitions ---
    // Defines several essential global variables used throughout the editor's lifecycle.
    var document        = window.document, // Reference to the document object
        $document       = $ ( document ),  // jQuery-wrapped document
        $window         = $ ( window ),    // jQuery-wrapped window
        $body           = $ ( 'body' ),    // jQuery-wrapped body

        // Feature detection: Check for W3C selection/range API support.
        supportRange    = typeof document.createRange === 'function',

        // Browser type detection flags.
        isIE            = !!window.ActiveXObject || "ActiveXObject" in window, // Detects IE, including IE11
        isFireFox       = navigator.userAgent.indexOf ( "Firefox" ) > 0,      // Detects Firefox

        // Unique ID prefix generation for editor instances.
        idPrefix        = 'wangeditor_' + Math.random ( ) . toString ( ) . replace ( '.', '' ) + '_',
        globalNum       = 1, // Counter for unique IDs

        // Masking overlay element, used for modals and popups.
        $maskDiv        = $ ( '<div class="wangEditor-mask"></div>' ),

        // Maximum number of command history steps to store for undo/redo.
        comandRecordMaxLength = 10,

        // Keywords considered unsafe in URLs to prevent XSS attacks.
        urlUnsafeKeywords = [ 'javascript:', '<', '>', '(', ')' ],

        // The main constructor function for the wangEditor instance.
        // This is the public interface for creating a new editor.
        $E = function ( $textarea, $initContent, menuConfig, onchange, uploadUrl ) {
            return new $E.fn.init ( $textarea, $initContent, menuConfig, onchange, uploadUrl ) ;
        } ;

    // Alias for prototype to shorten access (e.g., $E.fn instead of $E.prototype).
    $E.fn = $E.prototype ;


    // --- Mask Div Prepend Logic ---
    // The mask div is added to the body only if the browser is not IE6 or IE7,
    // due to various compatibility issues with overlays in those older browsers.
    if ( ! isIE6 && ! isIE7 ) {
        // Adds the mask layer (IE6, 7 have various compatibility issues with mask layers!)
        $body.prepend ( $maskDiv ) ;
    }


    // --- Utility Methods (Public) ---
    // Extends the $E object with common utility functions.
    $.extend ( $E, {
        // Provides a console log message, prefixed for wangEditor.
        'consoleLog': function ( info ) {
            if ( window.console && window.console.log ) {
                window.console.log ( 'wangEditor hint:', info ) ;
            }
        },

        // Generates a unique ID using the editor's prefix and a global counter.
        'getUniqeId': function ( ) {
            return idPrefix + ( globalNum++ ) ;
        },

        // Performs basic XSS validation for URLs by checking against unsafe keywords.
        'filterXSSForUrl': function ( url ) {
            var result = true ; // Assume safe initially
            $.each ( urlUnsafeKeywords, function ( key, val ) {
                if ( url.indexOf ( val ) >= 0 ) {
                    result = false ; // Mark as unsafe if keyword found
                    return false; // Break the loop
                }
            } ) ;
            return result ;
        }
    } ) ;


    // --- Configuration: Styles and HTML Templates ---
    // Extends the $E object with configuration settings for editor styles
    // and a collection of HTML string templates used for various UI components.
    $.extend ( $E, {
        // Style-related configuration options.
        'styleConfig': {
            // Available font family options for the editor.
            'fontFamilyOptions': [
                '宋体', '黑体', '楷体', '隶书', '幼圆', '微软雅黑',
                'Arial', 'Verdana', 'Georgia', 'Times New Roman',
                'Trebuchet MS', 'Courier New', 'Impact', 'Comic Sans MS'
            ],
            // Predefined color options with their Chinese names.
            'colorOptions': {
                '#880000': '暗红色', // Dark Red
                '#800080': '紫色',   // Purple
                '#ff0000': '红色',   // Red
                '#ff00ff': '鲜粉色', // Hot Pink
                '#000080': '深蓝色', // Dark Blue
                '#0000ff': '蓝色',   // Blue
                '#00ffff': '湖蓝色', // Aqua
                '#008080': '蓝绿色', // Teal
                '#008000': '绿色',   // Green
                '#808000': '橄榄色', // Olive
                '#00ff00': '浅绿色', // Lime
                '#ffcc00': '橙黄色', // Orange Yellow
                '#808080': '灰色',   // Gray
                '#c0c0c0': '银色',   // Silver
                '#000000': '黑色'    // Black
            },
            // Font size options mapped to pixel values.
            'fontsizeOptions': {
                1: '10px',
                2: '13px',
                3: '16px',
                4: '19px',
                5: '22px',
                6: '25px',
                7: '28px'
            }
        },

        // HTML string templates for various editor UI elements.
        'htmlTemplates': {
            // Buttons for deleting elements like tables or images.
            'elemDeleteBtn': '<a href="#" class="wangEditor-elemDeleteBtn"><i class="icon-wangEditor-cancel"></i></a>',
            'imgResizeBtn': '<div class="wangEditor-imgResize"></div>',

            // The main container for the entire editor interface.
            'editorContainer': '<div class="wangEditor-container"></div>',

            // Container for menu buttons, includes a clearfix for layout.
            'btnContainer': '<div class="wangEditor-btn-container clearfix"></div>',

            // Grouping container for related menu buttons.
            'btnContainerGroup': '<div class="wangEditor-btn-container-group"></div>',

            // Template for a single menu button. Note: `href='#'` is crucial for blur events.
            'btn': '<a class="wangEditor-btn-container-btn wangEditor-btn-container-btn-default" href="#"></a>',

            // Small downward-pointing arrow icon for dropdown menus.
            'btnAngleDown': '<i class="icon-wangEditor-angle-down"></i>',

            // Tooltip container for buttons.
            'tooltip': '<div class="wangEditor-toolTip"></div>',

            // Content for the button tooltip, dynamically populated with a title.
            'tooltipContent': '<div class="wangEditor-toolTip-content">{title}</div>',

            // Container for all modal dialogs.
            'modalContainer': '<div class="wangEditor-modal-container"></div>',

            // Generic modal template, and specific size variations.
            'modal':      '<div class="wangEditor-modal">{content}</div>',
            'modalBig':   '<div class="wangEditor-modal wangEditor-modal-big">{content}</div>',
            'modalSmall': '<div class="wangEditor-modal wangEditor-modal-small">{content}</div>',
            'modalMini':  '<div class="wangEditor-modal wangEditor-modal-mini">{content}</div>',

            // Header for modal dialogs, including a close button and title.
            'modalHeader': '<div class="wangEditor-modal-header">' +
                                '<a href="#" commandName="close" class="wangEditor-modal-header-close"><i class="icon-wangEditor-cancel"></i></a>' +
                                '<b>{title}</b>' +
                                '<div class="wangEditor-modal-header-line"></div>' +
                            '</div>',

            // Container for the editable text area.
            'txtContainer': '<div class="wangEditor-textarea-container"></div>',

            // The actual editable content area.
            'txt': '<div class="wangEditor-textarea" contenteditable="true"></div>',

            // Template for dropdown menus.
            'dropMenu': '<ul class="wangEditor-drop-menu">{content}<ul>'
        }
    } ) ;


    // --- Command-Related Utility Functions ---
    // Extends $E with functions for checking command enablement and finding suitable elements for insertion.
    $.extend ( $E, {
        /**
         * Checks if a given document command is enabled in the current context.
         * @param {string} commandName The name of the command to check (e.g., 'bold', 'insertImage').
         * @returns {boolean} True if the command is enabled, false otherwise.
         */
        'commandEnabled': function ( commandName ) {
            var enabled;
            try {
                enabled = document.queryCommandEnabled ( commandName ) ;
            } catch ( ex ) {
                enabled = false ; // If an error occurs (e.g., unsupported command), assume disabled.
            }
            return enabled ;
        },

        /**
         * Recursively finds a suitable parent element for inserting a table.
         * This function is specifically designed for `commandHooks['insertHTML']`.
         * It ensures tables are inserted into an appropriate editable block.
         * @param {jQuery} $elem The starting jQuery element.
         * @returns {jQuery|undefined} The appropriate element to append the table to, or undefined if none found.
         */
        'getElemForInsertTable': function ( $elem ) {
            // If the element is the body, it's not a suitable insertion point.
            if ( $elem [ 0 ] . nodeName.toLowerCase ( ) === 'body' ) {
                return ;
            }

            // If the parent is the editable container, the current element is suitable.
            if ( $elem.parent ( ) . is ( 'div[contenteditable="true"]' ) ) {
                return $elem ;
            }

            // If the element itself is the editable container, append to its last child or add a new paragraph.
            if ( $elem.is ( 'div[contenteditable="true"]' ) ) {
                if ( $elem.children ( ) . length === 0 ) {
                    $elem.append ( $ ( '<p></p>' ) ) ; // Add a default paragraph if empty
                }
                return $elem.children ( ) . last ( ) ; // Return the last child
            }
            // If none of the above, recursively check the parent element.
            else {
                return this.getElemForInsertTable ( $elem.parent ( ) ) ;
            }
        }
    } ) ;


    // --- Menu Creation Functions ---
    // Extends $E with functions responsible for creating individual menu buttons and groups.
    $.extend ( $E, {
        /**
         * Creates a group of menus and inserts them into the editor.
         * @param {Array} menuGroup An array of menu IDs to be created as a group.
         * @param {object} editor The current editor instance.
         */
        'createMenuGroup': function ( menuGroup, editor ) {
            // Ensure menuGroup is an array.
            if ( menuGroup instanceof Array === false ) {
                return ;
            }

            var $group = $ ( $E.htmlTemplates.btnContainerGroup ) ; // Create the group container

            $.each ( menuGroup, function ( key, menuId ) {
                // Iterate through the menu IDs in the group and create each individual menu.
                var btn = $E.createMenu ( menuId, editor ) ; // Create the menu button(s)

                if ( btn instanceof Array ) {
                    // If `createMenu` returns an array (e.g., for dropdowns with tooltips), append all elements.
                    $.each ( btn, function ( key, value ) {
                        $group.append ( value ) ;
                    } ) ;
                } else {
                    // Otherwise, append the single button.
                    $group.append ( btn ) ;
                }
            } ) ;

            // Insert the complete menu group into the editor's UI.
            editor.insertMenuGroup ( $group ) ;
        },

        /**
         * Creates a single menu button or a set of related elements (like a button with its dropdown/modal/tooltip).
         * @param {string} menuId The ID of the menu to create.
         * @param {object} editor The current editor instance.
         * @returns {jQuery|Array<jQuery>} The created jQuery element(s) for the menu.
         */
        'createMenu': function ( menuId, editor ) {
            // Basic validation for the menu ID.
            if ( menuId == null ) {
                return ;
            }

            // Trim whitespace and retrieve the menu definition from the editor's `menus` collection.
            var menu = $.trim ( menuId.toString ( ) ) ;
            menu = editor.menus [ menu ] ;
            if ( ! menu ) {
                return ; // If menu definition not found, exit.
            }

            var dependence = menu.dependence,
                dependenceAlert = menu.dependenceAlert ;

            // Check for menu dependencies. If a dependency is specified and not met, log a warning and return.
            if ( ( 'dependence' in menu ) && dependence == null ) {
                $E.consoleLog ( dependenceAlert ) ; // Log dependency warning
                return ;
            }

            // Destructure menu properties for easier access.
            var title       = menu.title,
                type        = menu.type,
                txt         = menu.txt,
                txtArr,
                command     = menu.command,      // Can be a string (document command) or a function (custom command)
                hotKey      = menu.hotKey,       // Keyboard shortcut for the button
                fnKeys      = [ ],               // Array to hold functional keys (Ctrl, Shift, Alt, Meta)
                keyCode,                         // Key code for the hotkey
                $dropMenu   = menu.dropMenu && menu.dropMenu ( ), // Dynamic dropdown menu content
                $modal      = menu.modal && menu.modal ( editor ), // Dynamic modal dialog content
                callback    = menu.callback,     // Callback function after command execution
                $btn        = $ ( $E.htmlTemplates.btn ), // Base button element
                resultArray = [ $btn ] ;         // Array to hold all elements for this menu (button, tooltip, dropdown, etc.)

            // If the command is a string, ensure it's trimmed.
            if ( typeof command === 'string' ) {
                command = $.trim ( command ) ;
            }

            // --- Button Text (Icon) Rendering ---
            // Determines how the button's text/icon is rendered based on the `txt` property.
            if ( txt.indexOf ( '|' ) !== -1 ) {
                txtArr = txt.split ( '|' ) ; // Split if a style is provided (e.g., "icon-class|style-string")
                txt = '<i class="' + txtArr [ 0 ] + '" style="' + txtArr [ 1 ] + '"></i>' ;
            } else {
                txt = '<i class="' + txt + '"></i>' ; // Simple icon class
            }
            $btn.html ( txt ) ; // Set the button's HTML content.

            // --- Button Title Attribute ---
            // Sets the `title` attribute for the button if provided.
            if ( title ) {
                $btn.attr ( 'title', title ) ;
            }

            // --- Menu Type Handling: 'btn' (Standard Button) ---
            if ( type === 'btn' ) {
                // Store the command name as a data attribute if it's a string.
                if ( typeof command === 'string' ) {
                    $btn.attr ( 'commandName', command ) ;
                }

                // If `command` is a string, it's a standard document command.
                if ( typeof command === 'string' ) {
                    $btn.click ( function ( e ) {
                        editor.hideModal ( ) ; // Hide any currently open modal first.
                        // Execute the document command.
                        editor.command ( e, command, undefined, callback ) ;

                        e.stopPropagation ( ) ; // Prevent event bubbling.
                    } ) ;
                }
                // If `command` is a function, it's a custom command.
                if ( typeof command === 'function' ) {
                    $btn.click ( function ( e ) {
                        editor.hideModal ( ) ; // Hide any currently open modal.

                        command ( e ) ; // Directly execute the custom function.

                        e.stopPropagation ( ) ; // Prevent event bubbling.
                    } ) ;
                }

                // --- Hotkey (Keyboard Shortcut) Handling ---
                if ( hotKey ) {
                    hotKey = hotKey.toLowerCase ( ) ; // Normalize hotkey string.
                    keyCode = $.trim ( hotKey.split ( '+' ) [ 1 ] ) ; // Extract the main key.
                    fnKeys = hotKey.split ( '+' ) [ 0 ] . split ( ',' ) ; // Extract functional keys (e.g., 'ctrl', 'shift').
                    $.each ( fnKeys, function ( key, value ) {
                        fnKeys [ key ] = $.trim ( value ) ; // Trim functional keys.
                    } ) ;

                    /**
                     * Helper function to check if the functional keys (Ctrl, Shift, Alt, Meta)
                     * pressed during a keyboard event match the hotkey's requirements.
                     * @param {KeyboardEvent} e The keyboard event object.
                     * @returns {boolean} True if functional keys match, false otherwise.
                     */
                    function isFnKeys ( e ) {
                        var flag = true ; // Assume match initially.
                        // Supported functional keys.
                        $.each ( [ 'ctrl', 'shift', 'alt', 'meta' ], function ( key, value ) {
                            if ( fnKeys.indexOf ( value ) !== -1 && ! e [ value + 'Key' ] ) {
                                flag = false ; // Required functional key not pressed.
                            } else if ( fnKeys.indexOf ( value ) === -1 && e [ value + 'Key' ] ) {
                                flag = false ; // Unwanted functional key was pressed.
                            }
                        } ) ;
                        return flag ;
                    }

                    // Bind the keydown event to the editor's text area.
                    editor.bindEventFor$txt ( 'keydown', function ( e ) {
                        if ( isFnKeys ( e ) === false ) {
                            return ; // If functional keys don't match, ignore.
                        }
                        // Check if the main key matches.
                        if ( String.fromCharCode ( e.keyCode ) . toLowerCase ( ) === keyCode ) {
                            e.preventDefault ( ) ; // Prevent default browser action for the hotkey.
                            $btn.click ( ) ; // Trigger the button's click handler programmatically.
                        }
                    } ) ;
                }
            }
            // --- Menu Type Handling: 'dropMenu' (Dropdown Menu) ---
            else if ( type === 'dropMenu' ) {
                $btn.append ( $ ( $E.htmlTemplates.btnAngleDown ) ) ; // Add the dropdown arrow icon.

                resultArray.unshift ( $dropMenu ) ; // Add the dropdown menu itself to the result array.

                /** Helper function to hide the dropdown menu. */
                function hideDropMenu ( ) {
                    $dropMenu.hide ( ) ;
                }

                $btn.click ( function ( e ) {
                    editor.hideModal ( ) ; // Hide any currently open modal.

                    $dropMenu.css ( 'display', 'inline-block' ) ; // Show the dropdown.
                    e.preventDefault ( ) ; // Prevent default button action.
                    this.focus ( ) ; // Set focus to the button (important for 360 Speed Browser).

                    e.stopPropagation ( ) ; // Prevent event bubbling.
                } ) . blur ( function ( e ) {
                    // Hide dropdown after a short delay to allow clicks on dropdown items.
                    setTimeout ( hideDropMenu, 200 ) ;
                } ) ;

                // Attach click event listener to dropdown items using event delegation.
                $dropMenu.on ( 'click', 'a[commandValue]', function ( e ) {
                    var $this = $ ( this ),
                        value = $this.attr ( 'commandValue' ) ; // Get the command value from the clicked item.

                    editor.command ( e, command, value, callback ) ; // Execute the command with the value.
                } ) ;

                hideDropMenu ( ) ; // Initially hide the dropdown menu.
            }
            // --- Menu Type Handling: 'modal' (Modal Dialog) ---
            else if ( type === 'modal' ) {
                // Prepend the modal header with the dynamic title.
                $modal.prepend ( $ (
                    $E.htmlTemplates.modalHeader.replace ( '{title}', title )
                ) ) ;

                editor.insertModal ( $modal ) ; // Insert the modal into the editor's DOM.

                $btn.click ( function ( e ) {
                    editor.hideModal ( ) ; // Hide any currently open modal.

                    // Calculate and set the `margin-left` to center the modal horizontally.
                    $modal.css ( 'margin-left', ( $window.outerWidth ( ) / 2 - $modal.outerWidth ( ) / 2 ) ) ;

                    $maskDiv.show ( ) ; // Show the background mask.
                    $modal.show ( ) ;   // Show the modal.
                    e.preventDefault ( ) ; // Prevent default button action.

                    e.stopPropagation ( ) ; // Prevent event bubbling.
                } ) ;

                // Attach click handler for the modal's close button.
                $modal.find ( '[commandName=close]' ) . click ( function ( e ) {
                    $maskDiv.hide ( ) ; // Hide the mask.
                    $modal.hide ( ) ;   // Hide the modal.
                    e.preventDefault ( ) ; // Prevent default link action.
                } ) ;
            }

            // --- Button Tooltip Effect ---
            // If a title is provided, create and manage a tooltip for the button.
            if ( title ) {
                $btn.attr ( 'title', '' ) ; // Clear the native title attribute to prevent default browser tooltip.
                if ( hotKey ) {
                    title = title + '(' + hotKey + ')' ; // Append hotkey to tooltip title.
                }

                var $toolTip        = $ ( $E.htmlTemplates.tooltip ),
                    $toolTipContent = $ ( $E.htmlTemplates.tooltipContent.replace ( '{title}', title ) ),
                    timer,         // Timer for delayed tooltip display.
                    margin_left ;  // Cached margin-left for tooltip centering.

                $toolTip.append ( $toolTipContent ) ; // Add content to tooltip.
                resultArray.unshift ( $toolTip ) ;    // Add tooltip to the beginning of the result array.

                /** Helper function to show the tooltip. */
                function showToolTip ( ) {
                    $toolTip.css ( 'display', 'inline-block' ) ;
                }

                $btn.mouseenter ( function ( ) {
                    // Calculate $tooltip's margin-left only once for centering.
                    if ( ! margin_left ) {
                        margin_left = $toolTip.css ( 'margin-left' ) ;
                    }
                    if ( margin_left === '0px' ) {
                        margin_left = ( 0 - ( $toolTip.outerWidth ( ) / 2 - $btn.outerWidth ( ) / 2 ) ) + 'px' ;
                        $toolTip.css ( 'margin-left', margin_left ) ;
                    }

                    // Delay showing the tooltip to prevent flickering on quick mouse-overs.
                    timer = setTimeout ( showToolTip, 200 ) ;
                } ) . mouseleave ( function ( ) {
                    clearTimeout ( timer ) ; // Clear the show timer.
                    $toolTip.hide ( ) ;      // Hide the tooltip immediately.
                } ) ;
            }

            // Return the array of created elements for this menu.
            return resultArray ;
        }
    } ) ;


    // ====================================
    // ==================================== SECTION DIVIDER: UTILITY FUNCTIONS / OBJECT FUNCTIONS ====================================
    // ====================================


    // ------------------------------------ Initialization (init) Method ------------------------------------
    // Extends the prototype of $E (accessible via $E.fn) with the `init` function,
    // which is the entry point for creating a new editor instance.
    $.extend ( $E.fn, {
        /**
         * The initialization function for a new wangEditor instance.
         * This function is called internally by the $E constructor.
         * @param {jQuery} $textarea The jQuery object of the textarea to convert into an editor.
         * @param {string} $initContent Initial HTML content for the editor.
         * @param {Array} menuConfig Configuration array for the editor's menu bar.
         * @param {function} onchange Callback function to execute when editor content changes.
         * @param {string} uploadUrl URL for image/file uploads.
         */
        'init': function ( $textarea, $initContent, menuConfig, onchange, uploadUrl ) {
            var editor = this,
                height = $textarea.height ( ) ; // Get the height of the original textarea.

            // Set a unique ID for the editor instance. If the textarea already has an ID, use it;
            // otherwise, generate a new unique ID using the editor's internal helper.
            var id = $textarea.attr ( 'id' ) ;
            if ( ! id ) {
                id = $E.getUniqeId ( ) ;
            }
            editor.id = id ; // Assign the ID to the editor instance.