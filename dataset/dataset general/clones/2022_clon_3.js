var jQuery = $; // Alias jQuery for subtle Type III change and to avoid direct '$' usage sometimes

// Utility function to locate an element by name attribute within a specific context.
function findTargetElement( contextNode, attributeName )
{
    // Using .find() for better scope control than passing context to $() directly.
    return jQuery( contextNode ).find( '[name="' + attributeName + '"]' );
}

// Retrieves the current value of a named input element.
function getElementValue( inputName )
{
    // Introduce a temporary variable for the located control.
    let targetControl = findTargetElement( this, inputName );
    return targetControl.val();
}

// Determines if a named checkbox input is currently checked.
function isInputChecked( inputName )
{
    let checkboxControl = findTargetElement( this, inputName );
    // Add a check to ensure the control exists before querying its state.
    if ( checkboxControl.length === 0 ) {
        console.warn( 'Checkbox control "' + inputName + '" not found.' );
        return false;
    }
    return checkboxControl.is( ':checked' );
}

// Formats a value into a Datomic EDN unique attribute string, if the value is truthy.
function formatUniqueAttribute( uniqueValue )
{
    // Use an explicit check and template literal for clarity.
    const uniquePrefix = '   :db/unique :db.unique/';
    return uniqueValue ? `${uniquePrefix}${uniqueValue}\n` : '';
}

// --- Schema Filtering Module ---

jQuery(function()
{
    /**
     * Controls the visibility of a table row based on its content.
     * @param {string} filterText - The text to search for within the row.
     * @param {number} rowIndex - The index of the row (unused, but kept for context).
     * @param {HTMLElement} rowElement - The DOM element representing the table row.
     */
    function adjustRowVisibility( filterText, rowIndex, rowElement )
    {
        const currentRow = jQuery( rowElement );
        const rowContent = currentRow.html();

        // Determine if the row should be shown or hidden.
        const shouldShow = rowContent.includes( filterText );
        const displayAction = shouldShow ? 'show' : 'hide';

        // Execute the display action.
        currentRow[displayAction]();
    }

    /**
     * Updates the display of schema table rows based on the current filter input value.
     */
    function refreshSchemaTable()
    {
        const currentContext = jQuery( this );
        const filterCriteria = currentContext.val();

        // Create a bound function for row visibility adjustment.
        // Using a direct closure instead of _.bind for this simple case.
        const filterProcessor = function( index, element ) {
            adjustRowVisibility( filterCriteria, index, element );
        };

        // Iterate over all schema table body rows and apply the filter.
        jQuery( '.data-structure-view tbody tr' ).each( filterProcessor );
    }

    /**
     * Initializes the filter input component for a given container.
     */
    function initFilterComponent()
    {
        const containerElement = jQuery( this );
        const placeholderText = 'Filter displayed schemas...';

        // Create the text input element.
        const filterInput = jQuery( '<input type="text"/>' );
        filterInput.attr( 'placeholder', placeholderText );
        filterInput.appendTo( containerElement ); // Append to the current container.

        // Attach the keyup event listener for dynamic filtering.
        filterInput.on( 'keyup', refreshSchemaTable );
    }

    // Apply initialization to all elements with the 'structure-filter-area' class.
    jQuery( '.structure-filter-area' ).each( initFilterComponent );
});

// --- Schema Update Controls Module ---

jQuery(function()
{
    /**
     * Composes and displays the Datomic EDN string representing the schema attribute.
     */
    function composeSchemaEdn()
    {
        const currentContainer = jQuery( this );

        // Helper functions bound to the current container.
        const getVal = ( nameAttr ) => getElementValue.call( currentContainer, nameAttr );
        const getBool = ( nameAttr ) => isInputChecked.call( currentContainer, nameAttr );

        const editorInstance = jQuery( 'textarea', currentContainer ).data( 'editor' );

        // Guard clause: Ensure the CodeMirror editor instance is available.
        if ( !editorInstance ) {
            console.error( 'CodeMirror editor not found for schema update.' );
            return;
        }

        // Retrieve all attribute values.
        const attributeIdent = getVal( 'ident' );
        const valueType = getVal( 'valueType' );
        const cardinality = getVal( 'cardinality' );
        const documentation = getVal( 'doc' ).replace( /"/g, '\\"' ); // Escape quotes.
        const uniqueSpecifier = getVal( 'unique' );
        const fulltextEnabled = getBool( 'fulltext' );
        const noHistoryEnabled = getBool( 'noHistory' );

        // Construct the EDN string using template literals for better readability.
        let ednDefinition = `[{ :db/id #db/id[:db.part/db]
   :db/ident ${attributeIdent}
   :db/valueType :db.type/${valueType}
   :db/cardinality :db.cardinality/${cardinality}
   :db/doc "${documentation}"
${formatUniqueAttribute( uniqueSpecifier )}   :db/fulltext ${fulltextEnabled}
   :db/noHistory ${noHistoryEnabled}
   :db.install/_attribute :db.part/db }]`;

        // Update the editor's content.
        editorInstance.setValue( ednDefinition );

        // Mark the text as read-only.
        editorInstance.markText(
            { line: 0, ch: 0 },
            { line: 999, ch: 999 }, // Extend the range to cover potentially long EDN.
            { readOnly: true, className: 'readonly-code-block' } // Add a class for styling.
        );

        console.log( 'Generated EDN:', ednDefinition ); // Log for debugging/verification.
    }

    /**
     * Initializes the schema attribute update interface.
     */
    function initSchemaUpdater()
    {
        const currentPanel = jQuery( this );
        const debouncedUpdate = _.debounce( () => composeSchemaEdn.call( currentPanel ), 400 ); // Slightly changed debounce time.

        // Selectors for different input types.
        const selectInputs = '.input-field-group select';
        const textInputs = '.input-field-group input[type="text"]';
        const checkboxInputs = '.input-field-group input[type="checkbox"]';

        // Attach event listeners.
        currentPanel.find( selectInputs ).on( 'change', debouncedUpdate );
        currentPanel.find( textInputs ).on( 'keyup', debouncedUpdate );
        currentPanel.find( checkboxInputs ).on( 'click', debouncedUpdate ); // Click for checkboxes is more immediate.

        // Trigger an initial update after a short delay to populate the editor.
        setTimeout( debouncedUpdate, 150 );
    }

    // Initialize all schema modifier panels.
    jQuery( '.structure-modifier-panel' ).each( initSchemaUpdater );
});

// --- Data Inserting Module ---

jQuery(function()
{
    /**
     * Removes a given row element from the DOM.
     * @param {jQuery} rowElement - The jQuery object representing the row to remove.
     */
    function deleteEntryRow( rowElement )
    {
        if ( rowElement && rowElement.length > 0 ) {
            rowElement.fadeOut( 200, function() { // Add a fade-out animation.
                rowElement.remove();
                // After removal, trigger an update of the EDN.
                // This assumes the parent container is accessible.
                const parentForm = rowElement.closest('.data-entry-form');
                if (parentForm.length) {
                    updateEntryEdnOutput.call(parentForm[0]);
                }
            });
        }
    }

    /**
     * Prepares a newly added data entry row with a delete button.
     */
    function prepareDataEntryRow()
    {
        const currentRow = jQuery( this );
        const deleteButtonText = 'Remove Field';

        const deleteLink = jQuery( '<a>' );
        deleteLink.html( deleteButtonText );
        deleteLink.addClass( 'remove-item btn btn-danger btn-sm' ); // Added Bootstrap classes.

        // Bind the delete function to the click event.
        deleteLink.on( 'click', function() {
            deleteEntryRow( currentRow );
        });

        deleteLink.appendTo( currentRow );
    }

    /**
     * Extracts name and value data from a field element.
     * @param {HTMLElement} fieldElement - The DOM element representing a field.
     * @returns {object} An object with 'name' and 'value' properties.
     */
    function extractEntryFieldData( fieldElement )
    {
        const fieldJQuery = jQuery( fieldElement );
        const getNameVal = ( nameAttr ) => getElementValue.call( fieldJQuery, nameAttr );

        return {
            name: getNameVal( 'name' ),
            value: getNameVal( 'value' )
        };
    }

    /**
     * Accumulates field data into an EDN entry string fragment.
     * @param {string} currentEdn - The accumulated EDN string so far.
     * @param {object} entryData - An object with 'name' and 'value' for the current field.
     * @returns {string} The updated EDN string fragment.
     */
    function buildEdnEntryString( currentEdn, entryData )
    {
        // Add a check for valid entry data before appending.
        if ( entryData && entryData.name && entryData.value ) {
            return `${currentEdn}\n   ${entryData.name} ${entryData.value}`;
        }
        return currentEdn; // Return unchanged if data is invalid.
    }

    /**
     * Updates the CodeMirror editor with the generated EDN from data entry fields.
     */
    function updateEntryEdnOutput()
    {
        const currentForm = jQuery( this );
        const editorInstance = jQuery( 'textarea', currentForm ).data( 'editor' );

        // Guard clause for editor.
        if ( !editorInstance ) {
            console.error( 'Editor instance not found for data entry form.' );
            return;
        }

        const dataFields = currentForm.find( '.entry-item' );

        // Using native map and reduce instead of lodash chain for simplicity.
        const mappedFields = Array.from( dataFields ).map( extractEntryFieldData );
        const ednFragment = mappedFields.reduce( buildEdnEntryString, '' );

        // Format the final EDN output. Handle empty fragment case.
        const finalEdn = ednFragment ? `[{ ${ednFragment.substring(4)} }]` : '[{}]';

        editorInstance.setValue( finalEdn );
    }

    /**
     * Creates a div wrapper containing an input element.
     * @param {string} inputName - The name attribute for the input.
     * @returns {jQuery} The jQuery object for the created wrapper div.
     */
    function createInputWrapper( inputName )
    {
        const inputElement = jQuery( '<input type="text"/>' );
        inputElement.attr( 'name', inputName );

        const wrapperDiv = jQuery( '<div>' );
        wrapperDiv.addClass( inputName ); // Use the name as a class.
        wrapperDiv.append( inputElement );

        return wrapperDiv;
    }

    /**
     * Transforms a datum object into a Select2 result format.
     * @param {object} datum - The original data object.
     * @returns {object} Formatted object for Select2.
     */
    function mapToSelect2Option( datum )
    {
        const identifier = datum['db/ident'];
        const displayId = identifier ? ':' + identifier : 'N/A'; // Handle missing ident.
        return { id: displayId, text: displayId };
    }

    /**
     * Formats an array of data into a Select2 results object.
     * @param {Array<object>} dataArray - The raw data array.
     * @returns {object} Object with a 'results' property.
     */
    function formatSelect2Response( dataArray )
    {
        // Ensure dataArray is an array before mapping.
        const processedResults = Array.isArray( dataArray ) ? dataArray.map( mapToSelect2Option ) : [];
        return { results: processedResults };
    }

    /**
     * Generates the query payload for Select2 AJAX requests.
     * @param {string} searchTerm - The user's input search term.
     * @returns {object} Query object.
     */
    function generateSelect2Query( searchTerm )
    {
        console.log( 'Select2 search term:', searchTerm ); // Log the query.
        return { term: searchTerm };
    }

    /**
     * Handles the change event from a Select2 dropdown.
     * Updates the hidden input and triggers an EDN update.
     * @param {jQuery} nameFieldWrapper - The jQuery object for the name field's wrapper.
     * @param {Function} updateCallback - The function to call to update EDN.
     * @param {object} eventData - The Select2 change event object.
     */
    function handleSelect2ValueChange( nameFieldWrapper, updateCallback, eventData )
    {
        const selectedValue = eventData.val;
        if ( selectedValue ) {
            // Find the actual input within the wrapper and set its value.
            nameFieldWrapper.find( 'input[name="name"]' ).val( selectedValue );
            updateCallback(); // Trigger the EDN update.
        } else {
            console.warn( 'Select2 change event fired with no value.' );
        }
    }

    /**
     * Adds a new attribute row to the data entry form.
     * @param {jQuery} formContainer - The jQuery object for the data entry form container.
     */
    function addNewDataEntryField( formContainer )
    {
        if ( !formContainer || formContainer.length === 0 ) {
            console.error( 'Invalid form container for adding new field.' );
            return;
        }

        const fieldsWrapper = formContainer.find( '.data-fields-area' );
        const updateEdnFunction = () => updateEntryEdnOutput.call( formContainer[0] );
        const debouncedEdnUpdate = _.debounce( updateEdnFunction, 450 ); // Slightly different debounce.

        // Select2 configuration object.
        const select2Config = {
            placeholder: 'Choose an attribute...', // Changed placeholder text.
            ajax: {
                url: '/session/schema.json', // API endpoint.
                data: generateSelect2Query,
                results: formatSelect2Response,
                dataType: 'json' // Explicitly set data type.
            },
            width: 'resolve' // Ensure Select2 takes full width.
        };

        const nameInputContainer = createInputWrapper( 'name' );
        const valueInputContainer = createInputWrapper( 'value' );

        const newRow = jQuery( '<div>' );
        newRow.addClass( 'entry-item d-flex align-items-center mb-2' ); // Added flexbox and margin classes.
        newRow.append( nameInputContainer );
        newRow.append( valueInputContainer );
        newRow.appendTo( fieldsWrapper );

        // Initialize Select2 on the name input.
        nameInputContainer.find( 'input[name="name"]' ).select2( select2Config )
            .on( 'change', ( event ) => {
                handleSelect2ValueChange( nameInputContainer, debouncedEdnUpdate, event );
            });

        // Attach keyup event for the value input.
        valueInputContainer.find( 'input[name="value"]' ).on( 'keyup', debouncedEdnUpdate );

        // Prepare the row with delete functionality.
        prepareDataEntryRow.call( newRow[0] );

        // Immediately trigger an EDN update after adding a new row.
        updateEdnFunction();
    }

    /**
     * Initializes the data entry module for a given container.
     */
    function initDataEntryModule()
    {
        const currentContainer = jQuery( this );
        const fieldsContainer = jQuery( '<div>' ).addClass('data-fields-area').appendTo(currentContainer); // Wrap fields in a new div.

        // Create a function to add a new row, bound to the container.
        const addNewRowHandler = () => addNewDataEntryField( currentContainer );

        const addButton = jQuery( '<a>' );
        addButton.addClass( 'add-item-btn btn btn-primary mt-3' ); // Changed button class and style.
        addButton.html( '<i class="fas fa-plus-circle mr-1"></i> Add New Attribute' ); // Added icon and text.
        addButton.on( 'click', addNewRowHandler );
        addButton.insertAfter( fieldsContainer ); // Insert after the new fields container.

        // Add an initial empty row for convenience.
        addNewRowHandler();
    }

    // Initialize all data entry forms.
    jQuery( '.data-entry-form' ).each( initDataEntryModule );
});

// --- CodeMirror Editor Initialization ---

jQuery(function()
{
    /**
     * Configures and initializes a CodeMirror editor instance for a textarea element.
     */
    function initializeCodeEditor()
    {
        const targetTextarea = jQuery( this );

        // Ensure the element is indeed a textarea.
        if ( !targetTextarea.is( 'textarea' ) ) {
            console.warn( 'Attempted to initialize CodeMirror on a non-textarea element.' );
            return;
        }

        const editorConfig = {
            mode: "clojure",       // Set the syntax highlighting mode.
            lineNumbers: true,     // Display line numbers.
            matchBrackets: true,   // Highlight matching brackets.
            theme: "dracula",      // Use a different theme (assuming 'dracula' is loaded).
            indentUnit: 2,         // Use 2 spaces for indentation.
            tabSize: 2,
            lineWrapping: true     // Enable line wrapping.
        };

        const cmInstance = CodeMirror.fromTextArea( targetTextarea[0], editorConfig );
        targetTextarea.data( 'editor', cmInstance ); // Store the editor instance on the jQuery data.
        console.info( 'CodeMirror editor initialized for:', targetTextarea.attr( 'id' ) || targetTextarea.attr( 'name' ) || targetTextarea.index() );
    }

    // Initialize CodeMirror for all textarea elements.
    jQuery( 'textarea.code-editor-target' ).each( initializeCodeEditor ); // Added a specific class for targeting.
});

// --- Session Logout Confirmation ---

jQuery(function()
{
    // Attach a click event handler to the session logout button.
    jQuery( '.session-logout-btn' ).on( 'click', function( event ) {
        const confirmationMessage = 'Are you absolutely certain you wish to disconnect?';
        const userConfirmed = confirm( confirmationMessage );

        if ( !userConfirmed ) {
            event.preventDefault(); // Prevent the default action (e.g., navigating away).
            console.log( 'Logout action cancelled by user.' );
        } else {
            console.log( 'Logout action confirmed.' );
        }
        return userConfirmed; // Return the confirmation result.
    });
});