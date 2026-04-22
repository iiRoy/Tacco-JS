window  .  onload  =  function ( ) {
    // Initialize global variables for tab management.
    g_Tabs    =    [ ] ;
    cur_tab_set = 0 ;

    /*
     * Tab constructor function.
     * Represents a single browser tab with its associated content and UI elements.
     */
    var Tab = function ( url ) {
        // Store the URL associated with this tab instance.
        this.url = url ;

        /*
         * Create and configure the spinner element.
         * This visual indicator shows when a page is loading.
         */
        var spinner = document.createElement ( "div" ) ;
        spinner.classList.add ( "fa" ) ;
        spinner.classList.add ( "fa-spinner" ) ;
        spinner.classList.add ( "tab-spinner" ) ;
        this.progress = 0 ; // Tracks spinner rotation progress.
        this.timerId = null ; // Holds the ID for the spinner's animation timer.
        this.spinner = spinner ; // Reference to the spinner DOM element.

        /*
         * Create the close button for the tab.
         * It allows users to close individual tabs.
         */
        var closeButton = document.createElement ( "div" ) ;
        closeButton.classList.add ( "fa" ) ;
        closeButton.classList.add ( "fa-times" ) ;
        closeButton.classList.add ( "tab-close-icon" ) ;
        // Event handler for closing the tab.
        closeButton.onclick = function ( e ) {
            this.close ( ) ; // Call the tab's close method.
            e.stopPropagation ( ) ; // Prevent event bubbling to the tab label.
        } . bind ( this ) ;

        // Create a text node for the tab's title.
        this.titleText = document.createTextNode ( url ) ;
        var container = document.createElement ( "div" ) ;
        container.classList.add ( "tab-text" ) ;
        container.appendChild ( this.titleText ) ; // Add the title text to its container.

        /*
         * Assemble the main tab label element.
         * This is what appears in the tab bar.
         */
        var label = document.createElement ( "li" ) ;
        label.classList.add ( "tab" ) ;
        label.appendChild ( spinner ) ; // Add the spinner.
        label.appendChild ( container ) ; // Add the title container.
        label.appendChild ( closeButton ) ; // Add the close button.
        // Click handler for activating this tab.
        label.onclick = function ( ) {
            var prevTab = getActiveTab ( ) ;
            if ( prevTab !== this ) {
                prevTab.deactivate ( ) ; // Deactivate the previously active tab.
                this.activate ( ) ; // Activate this tab.
            }
        } . bind ( this ) ;

        // Method to start the spinner animation.
        this.startSpinner = function ( ) {
            this.stopSpinner ( ) ; // Ensure any existing spinner animation is stopped first.

            this.timerId = setInterval ( function ( ) {
                this.spinner.style.transform = "rotate(" + this.progress + "turn)" ;
                this.progress += 0.01 ; // Increment rotation progress.
            } . bind ( this ) , 16.67 ) ; // Approximately 60 frames per second.
        }
        // Method to stop the spinner animation.
        this.stopSpinner = function ( ) {
            if ( this.timerId !== null ) {
               clearInterval ( this.timerId ) ; // Clear the interval timer.
               this.timerId = null ; // Reset the timer ID.
           }
        }

        /*
         * Create and configure the iframe element.
         * This iframe will host the web content for the tab.
         */
        var iframe = document.createElement ( "iframe" ) ;
        iframe.src = url ; // Set the initial URL for the iframe.
        iframe.mozbrowser = true ; // Enable mozbrowser features for full browser functionality.
        iframe.classList.add ( "page-container" ) ;

        // Check if mozbrowser is supported.
        if ( ! iframe.mozbrowser ) {
            console.log ( "!!!!! Unable to create a mozbrowser frame - are you running with experimental (-e) mode enabled? !!!!!" ) ;
            window.close ( ) ; // Close the application if mozbrowser is not available.
        }

        // Event listener for when the iframe starts loading.
        iframe.addEventListener ( "mozbrowserloadstart" , function ( event ) {
            this.startSpinner ( ) ; // Start the spinner.
        } . bind ( this ) ) ;

        // Event listener for when the iframe finishes loading.
        iframe.addEventListener ( "mozbrowserloadend" , function ( event ) {
            this.stopSpinner ( ) ; // Stop the spinner.
        } . bind ( this ) ) ;

        // Event listener for title changes within the iframe.
        iframe.addEventListener ( "mozbrowsertitlechange" , function ( event ) {
            this.titleText.nodeValue = event.detail ; // Update the tab's title.
            updateUi ( ) ; // Refresh the UI to reflect the new title.
        } . bind ( this ) ) ;

        // Event listener for URL changes within the iframe.
        iframe.addEventListener ( "mozbrowserlocationchange" , function ( event ) {
            this.url = event.detail ; // Update the tab's URL.
            updateUi ( ) ; // Refresh the UI to reflect the new URL.
        } . bind ( this ) ) ;

        // Append the iframe to the main content area.
        var content_element = document.getElementById ( "content" ) ;
        content_element.appendChild ( iframe ) ;

        // Store references to the label and iframe for this tab instance.
        this.label = label ;
        this.iframe = iframe ;

        // Method to close the current tab.
        this.close = function ( ) {
            removeTab ( this ) ; // Call the global removeTab function.
        }
        // Checks if the current tab is active.
        this.isActive = function ( ) {
            return this.label.classList.contains ( "tab-active" ) ;
        } ;
        // Activates the current tab.
        this.activate = function ( ) {
            this.label.classList.add ( "tab-active" ) ; // Add active class to label.
            this.iframe.classList.remove ( "hidden" ) ; // Show the iframe.
            // Determine and set the current tab set based on this tab's position.
            for ( var i in g_Tabs ) {
                if ( g_Tabs [ i ] == this ) {
                    cur_tab_set = Math.floor ( i / calcMaxTabs ( ) ) ;
                    break ;
                }
            }
            updateUi ( ) ; // Update the UI to reflect the active tab.
        } ;
        // Deactivates the current tab.
        this.deactivate = function ( ) {
            this.iframe.classList.add ( "hidden" ) ; // Hide the iframe.
            this.label.classList.remove ( "tab-active" ) ; // Remove active class from label.
        } ;
        // Hides the tab's label in the tab bar.
        this.hideLabel = function ( ) {
            this.label.classList.add ( "hidden" ) ;
        }
        // Shows the tab's label in the tab bar.
        this.showLabel = function ( ) {
            this.label.classList.remove ( "hidden" ) ;
        }
        // Reloads the content of the tab's iframe.
        this.reload = function ( ) {
            try {
                this.iframe.reload ( ) ;
            }
            catch ( e ) {
                console.log ( "iframe.reload is not implemented yet" ) ;
            }
        }
        // Navigates forward in the tab's history.
        this.forward = function ( ) {
            try {
                this.iframe.goForward ( ) ;
            }
            catch ( e ) {
                console.log ( "iframe.goForward doesn't exist - you probably need to run Servo with experimental mode enabled (-e)" ) ;
                window.close ( ) ; // Close application if goForward is not supported.
            }
            updateUi ( ) ; // Update UI after navigation.
        }
        // Navigates back in the tab's history.
        this.back = function ( ) {
            try {
                this.iframe.goBack ( ) ;
            }
            catch ( e ) {
                console.log ( "iframe.goBack doesn't exist - you probably need to run Servo with experimental mode enabled (-e)" ) ;
                window.close ( ) ; // Close application if goBack is not supported.
            }
            updateUi ( ) ; // Update UI after navigation.
        }
        // Loads a new URL into the tab's iframe.
        this.load = function ( url ) {
            var lower_url = url.toLowerCase ( ) ;

            // Prepend "http://" if no protocol is specified.
            if ( lower_url.indexOf ( "http://" ) === -1 &&
                lower_url.indexOf ( "https://" ) === -1 ) {
                url = "http://" + url ;
            }

            this.iframe.src = url ; // Set the iframe's source.
        }
    }

    /*
     * Global function to create a new tab and add it to the UI.
     * @param {string} url - The initial URL for the new tab.
     * @returns {Tab} The newly created tab object.
     */
    createAndAddTab = function ( url ) {
        var tab = new Tab ( url ) ; // Create a new Tab instance.
        g_Tabs.push ( tab ) ; // Add the new tab to the global tabs array.
        tab.activate ( ) ; // Activate the new tab.

        var newTabButton = document.getElementById ( "new-tab" ) ;
        var tabContainer = document.getElementById ( "tab-container" ) ;
        tabContainer.insertBefore ( tab.label , newTabButton ) ; // Insert the tab label before the new tab button.

        return tab ; // Return the created tab object.
    }

    /*
     * Global function to retrieve the currently active tab.
     * @returns {Tab} The active tab object.
     * @throws {string} If no active tab can be found.
     */
    getActiveTab = function ( ) {
        for ( var i=0 ; i < g_Tabs.length ; ++i ) {
            var tab = g_Tabs [ i ] ;
            if ( tab.isActive ( ) ) {
                return tab ; // Return the first active tab found.
            }
        }
        throw "Unable to find active tab!" ; // Error if no active tab.
    }

    /*
     * Global function to remove a specified tab.
     * @param {Tab} tab - The tab object to remove.
     * @throws {string} If the tab to remove cannot be found.
     */
    removeTab = function ( tab ) {
        var index = g_Tabs.indexOf ( tab ) ; // Find the index of the tab.
        if ( index === -1 ) {
            throw "Unable to find tab to remove" ; // Error if tab not found.
        }
        var tab = g_Tabs.splice ( index , 1 ) [ 0 ] ; // Remove the tab from the array.
        var is_active = tab.isActive ( ) ; // Check if the removed tab was active.
        if ( is_active ) {
            tab.deactivate ( ) ; // Deactivate it if it was active.
        }
        tab.label.parentNode.removeChild ( tab.label ) ; // Remove its label from the DOM.

        if ( g_Tabs.length === 0 ) {
            window.close ( ) ; // Close the window if no tabs are left.
        } else if ( is_active ) {
            var nextIndex = index - 1 ; // Determine the next tab to activate.
            if ( nextIndex < 0 ) {
                nextIndex = 0 ;
            }
            var nextTab = g_Tabs [ nextIndex ] ;
            nextTab.activate ( ) ; // Activate the next tab.
        }
        updateUi ( ) ; // Update the UI after tab removal.
    }

    /*
     * Event handler for creating a new blank tab.
     */
    onNewTab = function ( ) {
        if ( g_Tabs.length > 0 ) {
            var prevTab = getActiveTab ( ) ;
            prevTab.deactivate ( ) ; // Deactivate the current tab if any exist.
        }

        createAndAddTab ( "about:blank" ) ; // Create and activate a new blank tab.
    }

    /*
     * Updates the user interface based on the current application state.
     * This includes the URL bar, document title, and tab visibility.
     */
    updateUi = function ( ) {
        var tab = getActiveTab ( ) ; // Get the currently active tab.
        getUrlBar ( ) . value = tab.url ; // Update the URL bar.
        document.title = tab.titleText.nodeValue ; // Update the document title.

        // Only show tab labels that belong to the current "page" of tabs.
        max_tabs = calcMaxTabs ( ) ; // Calculate maximum visible tabs.
        i_min = cur_tab_set * max_tabs ; // Minimum index for visible tabs.
        i_max = i_min + max_tabs ; // Maximum index for visible tabs.
        for ( var i in g_Tabs ) {
            if ( i < i_min || i >= i_max ) {
                g_Tabs [ i ] . hideLabel ( ) ; // Hide tabs outside the current range.
            } else {
                g_Tabs [ i ] . showLabel ( ) ; // Show tabs within the current range.
            }
        }

        // Handle visibility of the "previous tab set" button.
        prev_btn = document.getElementById ( "tab-set-prev" ) ;
        if ( cur_tab_set == 0 ) {
            prev_btn.classList.add ( "hidden" ) ; // Hide if on the first page of tabs.
        } else {
            prev_btn.classList.remove ( "hidden" ) ; // Show otherwise.
        }

        // Handle visibility of the "next tab set" button.
        next_btn = document.getElementById ( "tab-set-next" ) ;
        if ( i_max >= g_Tabs.length ) {
            next_btn.classList.add ( "hidden" ) ; // Hide if on the last page of tabs.
        } else {
            next_btn.classList.remove ( "hidden" ) ; // Show otherwise.
        }
    }

    /*
     * Calculates the maximum number of tabs that can be displayed
     * in the tab bar based on the current window width.
     */
    calcMaxTabs = function ( ) {
        // TODO: replace with document.width once it exists (if applicable).
        windowWidth = document.getElementsByTagName ( "body" ) [ 0 ] . getBoundingClientRect ( ) . width ;

        // Magic numbers for layout calculation (window width - fixed button width) / tab width.
        return Math.floor ( ( windowWidth - 80 ) / 158 ) ;
    }

    /*
     * Navigates to the previous set of tabs, if available.
     */
    prevSet = function ( ) {
        if ( cur_tab_set == 0 ) {
            return ; // Do nothing if already on the first set.
        }
        cur_tab_set-- ; // Decrement the current tab set index.
        updateUi ( ) ; // Update the UI to show the new tab set.
    }

    /*
     * Navigates to the next set of tabs, if available.
     */
    nextSet = function ( ) {
        max_tabs = calcMaxTabs ( ) ;
        if ( g_Tabs.length / max_tabs < cur_tab_set + 1 ) {
            return ; // Do nothing if already on the last set.
        }
        cur_tab_set++ ; // Increment the current tab set index.
        updateUi ( ) ; // Update the UI to show the new tab set.
    }

    /*
     * Event handler for reloading the active tab.
     */
    onReload = function ( ) {
        getActiveTab ( ) . reload ( ) ; // Call reload on the active tab.
    }

    /*
     * Event handler for navigation actions in the URL bar.
     * Handles backspace/delete for clearing and enter for loading.
     */
    onNavigate = function ( event ) {
        if ( event.keyCode == 8 || event.keyCode == 46 ) { // Backspace or Delete key.
            getUrlBar ( ) . value = "" ; // Clear the URL bar.
            event.preventDefault ( ) ; // Prevent default browser action.
        } else if ( event.keyCode == 13 ) { // Enter key.
            var active_tab = getActiveTab ( ) ;
            active_tab.load ( getUrlBar ( ) . value ) ; // Load the URL from the bar into the active tab.
        }
    }

    /*
     * Event handler for navigating forward in the active tab's history.
     */
    onForward = function ( ) {
        getActiveTab ( ) . forward ( ) ; // Call forward on the active tab.
    }

    /*
     * Event handler for navigating back in the active tab's history.
     */
    onBack = function ( ) {
        getActiveTab ( ) . back ( ) ; // Call back on the active tab.
    }

    /*
     * Event handler for window resize events.
     * Re-activates the current tab to ensure UI consistency.
     */
    onResize = function ( ) {
        getActiveTab ( ) . activate ( ) ; // Re-activate the current tab.
    }

    /*
     * Helper function to get the URL bar DOM element.
     * @returns {HTMLElement} The URL bar input element.
     */
    getUrlBar = function ( ) {
        return document.getElementById ( "header-url" ) ;
    }

    // Initial setup: Create the very first tab when the application loads.
    createAndAddTab ( "about:blank" ) ;

    // Add a global event listener for window resizing.
    window.addEventListener ( "resize" , onResize ) ;
}