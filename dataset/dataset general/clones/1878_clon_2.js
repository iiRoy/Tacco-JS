let DataPersistor = (  function (  ) {
    // Internal reference to the browser's session storage for data persistence.
    let _repository = self.sessionStorage;

    /*
     * Checks if the underlying storage mechanism (sessionStorage) is operational
     * and accessible in the current execution environment.
     * @returns {boolean} True if storage is available, false otherwise.
     */
    function isAvailable (  ) {
        return ( typeof _repository !== "undefined" );
    }

    return { // Public interface for data handling operations.

        /*
         * Stores a given value associated with a specific key in the storage.
         * Operation only proceeds if the storage is available.
         * @param {string} itemKey - The unique key to identify the stored data.
         * @param {string} itemValue - The data string to be stored.
         */
        storeData : function ( itemKey , itemValue ) {
            if ( isAvailable (  ) )
            _repository[ itemKey ] = itemValue;
        },

        /*
         * Retrieves a value from storage using its associated key.
         * Returns null if storage is not available or the key does not exist.
         * @param {string} itemKey - The key of the data to retrieve.
         * @returns {string|null} The retrieved data string, or null.
         */
        retrieveData : function ( itemKey ) {
            if ( ! isAvailable (  ) )
            return null;
            return _repository[ itemKey ];
        },

        /*
         * Determines if a specific key exists within the storage.
         * Returns false if storage is unavailable.
         * @param {string} itemKey - The key to check for existence.
         * @returns {boolean} True if the key exists and has a value, false otherwise.
         */
        checkExistence : function ( itemKey ) {
            if ( ! isAvailable (  ) )
            return false;
            // A concise check for existence and non-null/non-undefined value.
            return _repository[ itemKey ] ? true : false;
        }
    }; // End of public methods.

} ) (  ); // Immediately invoked function expression for DataPersistor.


let ContentRenderer = (  function (  ) {
    // Module-level variables to hold current state and configuration.
    let _previousContent = null;         // Stores the last processed content.
    let _lastInputType = null;           // Stores the type of markup used last.
    let _currentDisplayMode = null;      // Keeps track of the active layout mode (e.g., half-half, fixed-width).
    const refreshIntervalMs = 1000;      // Defines the delay in milliseconds for debounced updates.
    
    let _scheduledUpdateId = 0;          // Identifier for the pending timeout, allowing cancellation.

    /*
     * Dynamically adjusts the dimensions of the input and output panels
     * based on the chosen display mode and the current window size.
     * This ensures the UI remains responsive and correctly proportioned.
     */
    function adjustViewDimensions (  ) {
        if ( _currentDisplayMode === "fixed-width" ) {
            // Apply a fixed width to the output panel for "exact" mode.
            jQuery("#outputPanel").css("width", "907px");
            // Calculate width for the input panel, accounting for document width and a small separator.
            jQuery("#inputPanel").css("width", ( jQuery(document).width(  ) - 907 - 1 ) + "px");
        } else {
            // Default to a split view, approximately 50/50 for "half-half" mode.
            jQuery(".sectionDiv").css("width", "49.9999%");
        }
        // Adjust height of content areas within both panels to fill available vertical space.
        jQuery("#outputPanel .displayArea").height( jQuery(window).height(  ) - 95 + 1 );
        jQuery("#sourceEditor").height( jQuery(window).height(  ) - 95 + 1 );
        // Adjust width of the textarea within the input panel.
        jQuery("#sourceEditor").width( jQuery("#inputPanel").width(  ) - 34 );
    }

    /*
     * Initiates an update of the rendered content. This function is debounced,
     * meaning it will only execute if the content or type has actually changed,
     * preventing unnecessary server requests and UI refreshes.
     */
    function refreshDisplay (  ) {
        clearTimeout( _scheduledUpdateId ); // Clear any existing scheduled update to debounce.

        let currentInput = jQuery("#sourceEditor").val(  ); // Get current text from editor.
        let inputType = jQuery("#formatSelector").val(  );   // Get selected markup type.

        // If content and type haven't changed since the last update, reschedule and exit early.
        if ( currentInput === _previousContent && _lastInputType === inputType ) {
            _scheduledUpdateId = setTimeout( refreshDisplay , refreshIntervalMs );
            return;
        }

        _previousContent = currentInput; // Update last processed content.
        _lastInputType = inputType;     // Update last processed input type.

        // Persist the current content and type to session storage for continuity.
        DataPersistor.storeData("contentData", _previousContent);
        DataPersistor.storeData("contentType", _lastInputType);
        
        // Asynchronously request rendering from the server using AJAX.
        jQuery.ajax({
            type: "POST",
            url:    "./render", // The server endpoint responsible for rendering markup.
            data: {
                type: jQuery("#formatSelector").val(  ), // Send the selected markup type.
                markup: _previousContent                  // Send the content to be rendered.
            }
        }).done(function ( responseData ) { // Callback for successful AJAX request.
            jQuery("#outputPanel .displayArea").html( responseData ); // Display rendered HTML.
            adjustViewDimensions(  ); // Re-adjust layout after content update to ensure fit.
            _scheduledUpdateId = setTimeout( refreshDisplay , refreshIntervalMs ); // Schedule the next potential update.
        });
    }


    return { // Public API for the ContentRenderer module.

        /*
         * Initializes the module by setting up event listeners, loading saved preferences,
         * and performing initial UI adjustments and content rendering.
         */
        initializeModule : function (  ) {
            // Check for specific URL hash to load a WordPress example configuration.
            if ( window.location.hash === "#wp" ) {
                window.globalExampleSource = 'wp-example.txt'; 
                window.globalMarkupVariant = 'wp';
                // window.location.hash = ''; // Original comment preserved, indicates potential hash clearing.
            }
            // Event listener for layout selection buttons in the header.
            jQuery("#mainHeader .buttonGroup .actionButton").on('click', function (  ) {
                jQuery("button.activeMode").removeClass("activeMode"); // Deactivate any previously active button.
                let currentButton = jQuery(this); // Store a reference to the clicked button.
                currentButton.addClass("activeMode"); // Mark the current button as active.
                let displayButtonId = currentButton.attr("id"); // Retrieve the ID of the clicked button.

                if ( displayButtonId === "half-half" ) { // Check if the "50-50" layout button was clicked.
                    _currentDisplayMode = "half-half";
                } else { // Otherwise, assume the "exact" (fixed-width) layout.
                    _currentDisplayMode = "fixed-width";
                }
                adjustViewDimensions(  ); // Apply the new layout dimensions immediately.
                DataPersistor.storeData("currentLayout", _currentDisplayMode); // Persist the chosen layout.
            });

            // Load saved content from storage, or a default example if none exists.
            if ( DataPersistor.checkExistence("contentData") ) {
                jQuery("#sourceEditor").val( DataPersistor.retrieveData("contentData") );
            } else { // This block executes for a first-time visit or cleared storage.
                jQuery.ajax({
                    url: window.globalExampleSource || "./example.md", // Use global example URL or a default markdown file.
                }).done(function ( responseData ) {
                    jQuery("#sourceEditor").val( responseData ); // Populate editor with example content.
                    adjustViewDimensions(  ); // Adjust layout for the new content.
                    refreshDisplay(  );       // Trigger an immediate render of the example.
                });
            }

            // Load and apply saved markup type preference.
            if ( DataPersistor.checkExistence("contentType") ) {
                console.debug( DataPersistor.retrieveData('contentType') ); // Log the loaded type for debugging.
                jQuery("#formatSelector").children("option").prop("selected", false); // Deselect all options first.
                jQuery("#formatSelector").children("option").each(function (  ) {
                    if ( jQuery(this).val(  ) === DataPersistor.retrieveData("contentType") ) {
                        jQuery(this).prop("selected", true); // Select the option matching the saved type.
                    }
                });
                refreshDisplay(  ); // Update display with the loaded type.
            } else {
                // If no type is saved, select the default based on a global variable.
                jQuery("#formatSelector").children("option").each(function (  ) {
                    if ( jQuery(this).val(  ) === window.globalMarkupVariant ) {
                        jQuery(this).prop("selected", true);
                    }
                });
            }

            // Load and apply saved layout preference by simulating a click on the corresponding button.
            if ( DataPersistor.checkExistence("currentLayout") ) {
                jQuery("#" + DataPersistor.retrieveData("currentLayout")).trigger("click");
            }
            
            // Attach event listeners for dynamic updates.
            jQuery("#formatSelector").on('change', refreshDisplay); // Rerender on type change.
            jQuery(window).on('resize', adjustViewDimensions);     // Adjust layout on window resize.

            // Perform initial setup calls.
            adjustViewDimensions(  ); // Set initial layout dimensions.
            refreshDisplay(  );       // Render initial content.
        }
    };

} ) (  ); // Immediately invoked function expression for ContentRenderer.


jQuery( document ).on( 'DOMContentLoaded' , function (  ) { // Ensures the DOM is fully loaded and parsed before executing.
    ContentRenderer.initializeModule(  ); // Initialize the main application module.
} );