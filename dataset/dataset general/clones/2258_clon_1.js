( function ( $, chrome ) {
    'use strict';

    /*
     * This variable will hold a jQuery Object containing an HTMLElement.
     * This element serves as a template for a local map pair, which links a
     * repository name to its local file system path.
     * Each such pair is presented as a row, comprising two input fields:
     * one for the repository identifier and another for its corresponding local path.
     */
    var $localMappingRowTemplate;

    /*
     * This function is responsible for saving the current options configuration
     * into the Chrome browser's synchronized storage area.
     *
     * @author Tomás Girardi <tgirardi@gmail.com>
     * @since  0.0.1
     * @returns {undefined} This function does not return any value.
     */
    function saveOptions () {
        var localMapping = {};

        // Iterate through all preceding sibling elements of the template
        // to collect the configured local mapping pairs.
        $localMappingRowTemplate . prevAll () . each ( function () {
            var $localMappingRow = $ ( this );
            var repoName = $localMappingRow . find ( '[name="repo-name"]' ) . val ();

            // Only consider adding this mapping pair if the repository name is provided and not empty.
            if ( repoName && repoName . trim () !== '' ) {
                var localPath = $localMappingRow . find ( '[name="local-path"]' ) . val ();
                localMapping[repoName] = localPath;
            }
        } );

        // Persist the collected local mapping object into Chrome's sync storage.
        chrome . storage . sync . set ( {
            localMapping : localMapping
        }, function () {
            // Update the user interface to indicate that options have been successfully saved.
            var status = $ ( '#status' );
            status . textContent = 'Options saved.';

            // Briefly display the status message, then clear it after a short delay.
            setTimeout ( function () {
                status . textContent = '';
            }, 750 );
        } );
    }


    /*
     * This function retrieves the stored options values from chrome.storage
     * and populates them into the relevant fields within the options form.
     *
     * @author Tomás Girardi <tgirardi@gmail.com>
     * @since  0.0.1
     * @returns {undefined} No explicit return value.
     */
    function restoreOptions () {
        // Initialize the template by selecting it and removing its ID attribute.
        $localMappingRowTemplate = $ ( '#local-mapping-row-template' ) . removeAttr ( 'id' );

        // Retrieve the stored local mapping data from Chrome's sync storage.
        // Provide an empty object as a default if no data is found.
        chrome . storage . sync . get ( {
            localMapping : {},
        }, function ( items ) {
            var localMapping = items . localMapping;

            // Iterate over each stored local mapping pair and display it.
            for ( var repoName in localMapping ) {
                // Ensure the property belongs to the object itself, not its prototype chain.
                if ( localMapping . hasOwnProperty ( repoName ) ) {
                    addLocalMappingRow ( repoName, localMapping[repoName] );
                }
            }

            // Add an additional empty row at the end, allowing the user to add a new mapping.
            addLocalMappingRow ();
        } );
    }

    /*
     * This routine creates and displays a new row within the table,
     * which is used to manage all local mapping pairs.
     *
     * @author Tomás Girardi <tgirardi@gmail.com>
     * @since  0.0.1
     * @param  {string} [repoName]  Optional: The name of the repository to be displayed in the new row.
     * @param  {string} [localPath] Optional: The local file path corresponding to the repository name.
     * @returns  {undefined} This function does not explicitly return a value.
     */
    function addLocalMappingRow ( repoName, localPath ) {
        // Clone the template row and make it visible.
        var $localMappingRow = $localMappingRowTemplate . clone () . removeClass ( 'hide' );

        // If a repository name is provided, pre-fill the corresponding input field.
        if ( repoName ) {
            $localMappingRow . find ( '[name="repo-name"]' ) . val ( repoName );
        }
        // If a local path is provided, pre-fill its input field.
        if ( localPath ) {
            $localMappingRow . find ( '[name="local-path"]' ) . val ( localPath );
        }
        // Insert the newly created row before the template row in the DOM.
        $localMappingRowTemplate . before ( $localMappingRow );
    }

    /*
     * This function handles the removal of a local mapping row from the UI.
     * It is typically triggered by a click event on a delete button within a row.
     *
     * @author Tomás Girardi <tgirardi@gmail.com>
     * @since  0.0.1
     * @returns {undefined} No return value.
     */
    function deleteLocalMappingRow () {
        // Locate the closest table row (<tr>) ancestor of the clicked element
        // and remove it entirely from the Document Object Model.
        $ ( this ) . closest ( 'tr' ) . remove ();
    }

    // Execute the following code block once the entire DOM structure is fully loaded and ready.
    $ ( function () {
        // Initialize and display existing options.
        restoreOptions ();

        // Attach an event listener to the save button; when clicked, invoke the saveOptions function.
        $ ( '#save' ) . on ( 'click', saveOptions );

        // Configure the button responsible for adding new mapping rows.
        $ ( '#add-local-mapping-row' ) . on ( 'click', function () {
            // An anonymous function wrapper is used here to prevent the jQuery event object
            // from being passed as an argument to addLocalMappingRow, which expects
            // repoName and localPath parameters.
            addLocalMappingRow ();
        } );

        // Delegate click events for delete buttons to the document body.
        // This ensures that dynamically added rows also have their delete functionality.
        $ ( document . body ) . on ( 'click', '.btn-local-mapping-delete',
            deleteLocalMappingRow );
    } );

} ) ( window . jQuery, window . chrome );