;( function ( Q , $ ) {

    // This section handles drag and drop functionality for images.
    // It defines how drag information is stored and retrieved.

    var DRAGINFO_PREFIX = "draginfo" ; // Prefix for storing drag-and-drop metadata on elements.

    /**
     * Handles the 'ondragstart' event for draggable images.
     * Sets the drag data with information about the dragged item.
     * @param {Event} evt - The drag event.
     */
    function ondrag ( evt ) {

        evt = evt || window . event ; // Ensure event object is available, especially for older IE.

        var dataTransfer = evt . dataTransfer ; // Get the dataTransfer object from the event.
        var img          = evt . target       ; // The image element being dragged.

        // Set the data to be transferred. The data type is "text", and the value is
        // retrieved from the image's attribute, prefixed with DRAGINFO_PREFIX.
        dataTransfer . setData ( "text" , img . getAttribute ( DRAGINFO_PREFIX ) ) ;

    } // End of ondrag function definition.



    /**
     * Creates a draggable image element and appends it to a parent container.
     *
     * @param {HTMLElement} parent - The parent DOM element to which the image will be appended.
     * @param {string} src         - The source URL for the image.
     * @param {string} title       - The title attribute for the image (tooltip text).
     * @param {object} info        - Additional information/metadata for the draggable item,
     *                                 which will be JSON.stringified and set as drag data.
     * @returns {HTMLElement} The newly created image element.
     */
    function createDNDImage ( parent , src , title , info ) {

        var img = document . createElement ( "img" ) ; // Create a new image element.

        img . src = src ; // Set the image source.

        img . setAttribute ( "draggable" , "true" ) ; // Make the image draggable.
        img . setAttribute ( "title"     , title  ) ; // Set the title for the image.

        info = info || { } ; // Initialize info object if it's null or undefined.

        // If no specific image is provided in info, and it's a 'Node' type (or no type specified),
        // use the image's src as the info.image.
        if ( ! info . image && ( ! info . type || info . type == "Node" ) ) {
            info . image = src ;
        }

        info . label = info . label || title ; // Set label for info, defaulting to title.
        info . title = title ; // Ensure title is also set in the info object.

        // Stringify the info object and set it as an attribute for drag data.
        img . setAttribute ( DRAGINFO_PREFIX , JSON . stringify ( info ) ) ;

        img . ondragstart = ondrag ; // Assign the ondragstart event handler.

        parent . appendChild ( img ) ; // Append the image to the specified parent.

        return img ; // Return the created image element.

    } // End of createDNDImage function.

    // Expose the createDNDImage function on the Q object.
    Q . createDNDImage = createDNDImage ;




    /**
     * Creates a collection of buttons or button groups within a toolbar.
     *
     * @param {object} buttons   - An object or array of button configurations.
     * @param {HTMLElement} toolbar - The toolbar DOM element to append buttons to.
     * @param {object} scope     - The scope (this context) for button actions.
     * @param {boolean} vertical - True if button groups should be vertical, false otherwise.
     * @param {boolean} togglable - True if buttons within groups are togglable (e.g., radio/checkbox).
     */
    function createButtons ( buttons , toolbar , scope , vertical , togglable ) {

        // Iterate over each button configuration provided.
        for ( var n in buttons ) {

            var info = buttons [ n ] ; // Get the current button configuration.

            // If the info is an array, it signifies a button group.
            if ( Q . isArray ( info ) ) {

                createButtonGroup ( info , toolbar , scope , vertical , togglable ) ; // Create a button group.
                continue ; // Move to the next item in the 'buttons' object.

            }

            // Otherwise, it's a single button.
            toolbar . appendChild ( createGraphButton ( info , scope ) ) ; // Create and append a single graph button.

        } // End of for-in loop.

    } // End of createButtons function.



    /**
     * Creates a button group element and populates it with individual buttons.
     *
     * @param {Array<object>} info    - An array of button configurations for the group.
     * @param {HTMLElement} toolbar - The toolbar DOM element to append the button group to.
     * @param {object} scope     - The scope (this context) for button actions.
     * @param {boolean} vertical  - True if the button group should be vertical, false for horizontal.
     * @param {boolean} togglable - True if buttons within this group are togglable (e.g., radio/checkbox).
     */
    function createButtonGroup ( info , toolbar , scope , vertical , togglable ) {

        var buttonGroup = document . createElement ( "div" ) ; // Create a new div for the button group.

        // Assign appropriate CSS class based on vertical orientation.
        buttonGroup . className = vertical ? "btn-group-vertical" : "btn-group" ;

        // If togglable is not explicitly false, add the data-toggle attribute for Bootstrap button groups.
        if ( togglable !== false ) {
            buttonGroup . setAttribute ( "data-toggle" , "buttons" ) ;
        }

        // Iterate through each button configuration within the group.
        for ( var i = 0 , l = info . length ; i < l ; i ++ ) {

            // If a button has no type and the group is togglable, default its type to 'radio'.
            if ( ! info [ i ] . type && togglable !== false ) {
                info [ i ] . type = 'radio' ;
            }

            // Create and append the individual button to the button group.
            buttonGroup . appendChild ( createGraphButton ( info [ i ] , scope ) ) ;

        } // End of for loop for group buttons.

        toolbar . appendChild ( buttonGroup ) ; // Append the completed button group to the toolbar.

    } // End of createButtonGroup function.



    /**
     * Creates a single graph button based on the provided information.
     * This function handles various button types like search, input, select, and standard buttons.
     *
     * @param {object} info  - Configuration object for the button.
     * @param {object} scope - The scope (this context) for button actions.
     * @returns {HTMLElement} The created button or container element.
     */
    function createGraphButton ( info , scope ) {

        // --- Handle 'search' type button ---
        if ( info . type == "search" ) {

            var div = document . createElement ( "div" ) ; // Container div for the search input.

            div . style . display       = "inline-block" ; // Make it inline-block.
            div . style . verticalAlign = "middle"       ; // Align vertically in the middle.

            // Set inner HTML for a Bootstrap-style search input group.
            div . innerHTML = '<div class="input-group input-group-sm" style="width: 150px;">' +
                              '<input type="text" class="form-control" placeholder="' + ( info . placeholder || '' ) + '">' +
                              '<span class="input-group-btn">' +
                              '<div class="btn btn-default" type="button"></div>' +
                              '</span>' +
                              '</div>' ;

            var input = div . getElementsByTagName ( "input" ) [ 0 ] ; // Get the input element.

            if ( info . id ) {
                input . id = info . id ; // Set the input's ID if provided.
            }

            var button = $ ( div ) . find ( '.btn' ) [ 0 ] ; // Find the associated button element.

            // Add icon or name to the button.
            if ( info . iconClass ) {

                var icon = document . createElement ( 'div' ) ; // Create a div for the icon.
                $ ( icon ) . addClass ( info . iconClass ) ; // Add the icon class.
                button . appendChild ( icon ) ; // Append the icon to the button.

            } else if ( info . name ) {

                button . appendChild ( document . createTextNode ( " " + info . name ) ) ; // Add button name as text.

            }

            info . input = input ; // Store a reference to the input element in the info object.

            // --- Search functionality logic ---
            if ( info . search ) {

                // Function to clear search information.
                var clear = function ( ) {
                    info . searchInfo = null ;
                } ;

                // Function to perform the search.
                var doSearch = function ( prov ) {

                    var value = input . value ; // Get current input value.

                    if ( ! value ) {
                        clear ( ) ; // If value is empty, clear search and return.
                        return ;
                    }

                    // Perform search only if value has changed or no search info exists.
                    if ( ! info . searchInfo || info . searchInfo . value != value ) {

                        var result = info . search ( value , info ) ; // Call the custom search function.

                        if ( ! result || ! result . length ) {
                            clear ( ) ; // If no results, clear search.
                            return ;
                        }

                        info . searchInfo = { value : value , result : result } ; // Store search results.

                    }

                    doNext ( prov ) ; // Process the next result.

                } ; // End of doSearch function.

                // Function to navigate through search results.
                var doNext = function ( prov ) {

                    // Check if select function is available and if there are search results.
                    if ( ! ( info . select instanceof Function ) || ! info . searchInfo || ! info . searchInfo . result || ! info . searchInfo . result . length ) {
                        return ;
                    }

                    var searchInfo = info . searchInfo ; // Reference to current search info.
                    var result     = info . searchInfo . result ; // Reference to search results array.

                    // If only one result, select it directly.
                    if ( result . length == 1 ) {
                        info . select ( result [ 0 ] , 0 ) ;
                        return ;
                    }

                    // Determine the next index for navigation.
                    if ( searchInfo . index === undefined ) {
                        searchInfo . index = 0 ;
                    } else {
                        searchInfo . index += prov ? -1 : 1 ; // Move prev/next based on 'prov'.
                        if ( searchInfo . index < 0 ) {
                            searchInfo . index += result . length ; // Wrap around for previous.
                        }
                        searchInfo . index %= result . length ; // Wrap around for next.
                    }

                    // Select the item. If select returns false, re-do search (e.g., if item not found).
                    if ( info . select ( result [ searchInfo . index ] , searchInfo . index ) === false ) {
                        info . searchInfo = null ;
                        doSearch ( ) ;
                    } ;

                } ; // End of doNext function.

                // --- Event handlers for search input and button ---

                input . onkeydown = function ( evt ) {
                    // Handle Escape key to clear search.
                    if ( evt . keyCode == 27 ) {
                        clear ( ) ;
                        input . value = "" ;
                        Q . stopEvent ( evt ) ; // Stop event propagation.
                        return ;
                    }
                    // Handle Enter key to perform search.
                    if ( evt . keyCode == 13 ) {
                        doSearch ( evt . shiftKey ) ; // Shift+Enter for previous.
                    }
                } ;

                button . onclick = function ( evt ) {
                    doSearch ( ) ; // Click performs a standard search.
                } ;

            } // End of if (info.search) block.

            return div ; // Return the container div for the search button.

        } // End of if (info.type == "search") block.


        // --- Handle 'input' type button ---
        if ( info . type == "input" ) {

            var div = document . createElement ( "div" ) ; // Container div for the input.

            div . style . display       = "inline-block" ; // Make it inline-block.
            div . style . verticalAlign = "middle"       ; // Align vertically in the middle.

            // Set inner HTML for a Bootstrap-style input group with a button.
            div . innerHTML = '<div class="input-group input-group-sm" style="width: 150px;">' +
                              '<input type="text" class="form-control">' +
                              '<span class="input-group-btn">' +
                              '<button class="btn btn-default" type="button"></button>' +
                              '</span>' +
                              '</div>' ;

            var input  = div . getElementsByTagName ( "input" ) [ 0 ] ; // Get the input element.
            var button = div . getElementsByTagName ( "button" ) [ 0 ] ; // Get the button element.

            button . innerHTML = info . name ; // Set the button's text.
            info . input       = input       ; // Store reference to input in info object.

            if ( info . action ) {
                // Attach the action handler to the button's click event.
                button . onclick = function ( evt ) {
                    info . action . call ( scope || window . graph , evt , info ) ;
                } ;
            }

            return div ; // Return the container div for the input button.

        } // End of if (info.type == "input") block.


        // --- Handle 'select' type button ---
        else if ( info . type == "select" ) {

            var div = document . createElement ( "select" ) ; // Create a select element.

            div . className = "form-control" ; // Assign Bootstrap form-control class.

            var options = info . options ; // Get the array of options.

            // Populate the select element with options.
            options . forEach ( function ( v ) {
                var option = document . createElement ( "option" ) ;
                option . innerHTML = v ;
                option . value     = v ;
                div . appendChild ( option ) ;
            } ) ;

            div . value = info . value ; // Set the default selected value.

            if ( info . action ) {
                // Attach action handler to custom onValueChange event (might be a typo, usually 'onchange').
                div . onValueChange = function ( evt ) {
                    info . action . call ( scope || window . graph , evt , info ) ;
                } ;
            }

            return div ; // Return the select element.

        } // End of else if (info.type == "select") block.


        // --- Handle generic buttons (radio, checkbox, or simple div) ---
        if ( ! info . type ) { // If no specific type, create a generic div.
            var label = document . createElement ( "div" ) ;
        } else { // For 'radio' or 'checkbox' types.
            var label  = document . createElement ( "label" ) ; // Create a label element.
            var button = document . createElement ( "input" ) ; // Create an input element (radio/checkbox).

            info . input = button ; // Store a reference to the input element.

            button . setAttribute ( 'type' , info . type ) ; // Set the input type.
            label . appendChild ( button ) ; // Append the input to the label.

            if ( info . selected ) {
                button . setAttribute ( 'checked' , 'checked' ) ; // Mark as checked if 'selected'.
                if ( info . type == 'radio' ) {
                    label . className += "active" ; // Add 'active' class for radio buttons.
                }
            }
        }

        label . className += "btn btn-default btn-sm" ; // Add common button classes.

        // Add icon or name to the label.
        if ( info . icon ) {

            var icon = document . createElement ( 'img' ) ; // Create an image for the icon.
            icon . src = info . icon ; // Set icon source.
            label . appendChild ( icon ) ; // Append icon to label.

        } else if ( info . iconClass ) {

            var icon = document . createElement ( 'div' ) ; // Create a div for the icon.
            $ ( icon ) . addClass ( info . iconClass ) ; // Add icon class.
            label . appendChild ( icon ) ; // Append icon to label.

        } else if ( info . name ) {

            label . appendChild ( document . createTextNode ( " " + info . name ) ) ; // Add button name as text.

        }

        if ( info . name ) {
            label . setAttribute ( "title" , info . name ) ; // Set title attribute for tooltip.
        }

        if ( info . action ) {
            // Attach action handler to the label's click event.
            label . onclick = function ( evt ) {
                info . action . call ( scope || window . graph , evt , info ) ;
            } ;
        }

        return label ; // Return the created label (button) element.

    } // End of createGraphButton function.



    /**
     * Creates and populates a toolbar with predefined and custom buttons.
     *
     * @param {Q.Graph|function} graph - The Q.Graph instance or a function that returns it.
     * @param {HTMLElement} toolbar - The DOM element that will serve as the toolbar.
     * @param {object} customButtons - Optional object containing additional custom button configurations.
     * @returns {HTMLElement} The populated toolbar element.
     */
    function createToolbar ( graph , toolbar , customButtons ) {

        /**
         * Helper function to get the graph instance, handling both direct instance and factory function.
         * @returns {Q.Graph} The graph instance.
         */
        function getGraph ( ) {
            if ( graph instanceof Q . Graph ) {
                return graph ;
            }
            return graph ( ) ; // If graph is a function, call it to get the instance.
        }

        /**
         * Sets the interaction mode for the graph.
         * @param {Event} evt - The event object.
         * @param {object} info - Information about the interaction mode.
         * @param {object} [interactionProperties] - Optional properties for the interaction mode.
         */
        function setInteractionMode ( evt , info , interactionProperties ) {
            getGraph ( ) . interactionMode     = info . value ; // Set the graph's interaction mode.
            getGraph ( ) . interactionProperties = interactionProperties || info ; // Set interaction properties.
        }


        // Define default button configurations for the toolbar.
        var buttons = {

            interactionModes : [ // Group for interaction mode buttons.
                {
                    name      : '默认模式' ,
                    value     : Q . Consts . INTERACTION_MODE_DEFAULT ,
                    selected  : true ,
                    iconClass : 'icon toolbar-default' ,
                    action    : setInteractionMode
                } ,
                {
                    name      : '框选模式' ,
                    value     : Q . Consts . INTERACTION_MODE_SELECTION ,
                    iconClass : 'icon toolbar-rectangle_selection' ,
                    action    : setInteractionMode
                } ,
                {
                    name      : '浏览模式' ,
                    value     : Q . Consts . INTERACTION_MODE_VIEW ,
                    iconClass : 'icon toolbar-pan' ,
                    action    : setInteractionMode
                }
            ] , // End of interactionModes group.

            zoom : [ // Group for zoom control buttons.
                {
                    name      : '放大' ,
                    iconClass : 'icon toolbar-zoomin' ,
                    action    : function ( ) {
                        getGraph ( ) . zoomIn ( )
                    }
                } ,
                {
                    name      : '缩小' ,
                    iconClass : 'icon toolbar-zoomout' ,
                    action    : function ( ) {
                        getGraph ( ) . zoomOut ( )
                    }
                } ,
                {
                    name      : '1:1' ,
                    iconClass : 'icon toolbar-zoomreset' ,
                    action    : function ( ) {
                        getGraph ( ) . scale = 1 ;
                    }
                } ,
                {
                    name      : '纵览' ,
                    iconClass : 'icon toolbar-overview' ,
                    action    : function ( ) {
                        getGraph ( ) . zoomToOverview ( )
                    }
                }
            ] , // End of zoom group.

            editor : [ // Group for editor-related creation tools.
                {
                    name      : '创建连线' ,
                    value     : Q . Consts . INTERACTION_MODE_CREATE_EDGE ,
                    iconClass : 'icon toolbar-edge' ,
                    action    : setInteractionMode
                } ,
                // The following commented section is an example of a disabled/alternative button configuration.
                //{
                //  name: '创建曲线',
                //  value: Q.Consts.INTERACTION_MODE_CREATE_SIMPLE_EDGE,
                //  iconClass: 'icon toolbar-edge_flex',
                //  action: setInteractionMode,
                //  uiClass: FlexEdgeUI
                //},
                {
                    name      : '创建L型连线' ,
                    value     : Q . Consts . INTERACTION_MODE_CREATE_SIMPLE_EDGE ,
                    iconClass : 'icon toolbar-edge_VH' ,
                    action    : setInteractionMode ,
                    edgeType  : Q . Consts . EDGE_TYPE_VERTICAL_HORIZONTAL
                } ,
                {
                    name      : '创建多边形' ,
                    value     : Q . Consts . INTERACTION_MODE_CREATE_SHAPE ,
                    iconClass : 'icon toolbar-polygon' ,
                    action    : setInteractionMode
                } ,
                {
                    name      : '创建线条' ,
                    value     : Q . Consts . INTERACTION_MODE_CREATE_LINE ,
                    iconClass : 'icon toolbar-line' ,
                    action    : setInteractionMode
                }
            ] , // End of editor group.

            search : { // Search button configuration.
                name        : 'Find' ,
                placeholder : 'Name' ,
                iconClass   : 'icon toolbar-search' ,
                type        : 'search' ,
                id          : 'search_input' ,
                search      : function ( name , info ) {
                    var result = [ ] ;
                    var reg    = new RegExp ( name , 'i' ) ;
                    getGraph ( ) . forEach ( function ( e ) {
                        if ( e . name && reg . test ( e . name ) ) {
                            result . push ( e . id ) ;
                        }
                    } ) ;
                    return result ;
                } ,
                select      : function ( item ) {
                    item = getGraph ( ) . graphModel . getById ( item ) ;
                    if ( ! item ) {
                        return false ;
                    }
                    getGraph ( ) . setSelection ( item ) ;
                    getGraph ( ) . sendToTop ( item ) ;
                    var bounds = getGraph ( ) . getUIBounds ( item ) ;
                    if ( bounds ) {
                        getGraph ( ) . centerTo ( bounds . cx , bounds . cy , Math . max ( 2 , getGraph ( ) . scale ) , true ) ;
                    }
                }
            } , // End of search button.

            export : { // Export button configuration.
                name      : '导出图片' ,
                iconClass : 'icon toolbar-print' ,
                action    : function ( ) {
                    Q . showExportPanel ( getGraph ( ) ) ;
                }
            }
        } ; // End of buttons object definition.


        // Merge custom buttons into the default buttons configuration.
        if ( customButtons ) {

            for ( var n in customButtons ) {
                buttons [ n ] = customButtons [ n ] ;
            }

        } // End of customButtons merge.

        // Create the buttons on the toolbar using the combined configurations.
        createButtons ( buttons , toolbar , this , false , false ) ;

        return toolbar ; // Return the populated toolbar.

    } // End of createToolbar function.

    // Expose the createToolbar and createButtonGroup functions on the Q object.
    Q . createToolbar = createToolbar ;
    Q . createButtonGroup = createButtonGroup ;

} ) ( Q , jQuery ) ; // Immediately invoked function expression closure.