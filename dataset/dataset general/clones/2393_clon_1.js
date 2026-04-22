( function ( $ ) {
    // This is the main plugin definition for actionsBuilder
    // It extends jQuery's prototype to make 'actionsBuilder' a jQuery plugin.
    $.fn.actionsBuilder = function ( options ) {


        // Check if the user is trying to retrieve data
        if ( options == "data" ) {

            // Get the first element in the jQuery collection
            var builder = $( this ).eq( 0 ).data( "actionsBuilder" );

            // Return the collected data from the builder instance
            return builder.collectData();

        } else {

            // If not retrieving data, initialize the plugin on each selected element
            return $( this ).each( function () {

                // Create a new instance of the ActionsBuilder class
                var builder = new ActionsBuilder( this, options );

                // Store the builder instance on the element's data
                $( this ).data( "actionsBuilder", builder );

            } ); // End of each()

        } // End of if-else for options

    }; // End of $.fn.actionsBuilder function


    /**
     * @constructor
     * Defines the ActionsBuilder class.
     * This class manages the building and interaction of action elements.
     * @param {HTMLElement} element - The DOM element to attach the builder to.
     * @param {Object} options - Configuration options for the builder.
     */
    function ActionsBuilder ( element, options ) {

        // Store the jQuery-wrapped element
        this.element = $( element );

        // Store options, using an empty object as default if none provided
        this.options = options || {};

        // Initialize the builder
        this.init();

    } // End of ActionsBuilder constructor


    // Define methods for the ActionsBuilder prototype
    ActionsBuilder.prototype = {

        /**
         * Initializes the ActionsBuilder instance.
         * Sets up initial data and renders the actions.
         */
        init: function () {

            // Assign actions from options
            this.actions = this.options.actions;

            // Assign data from options, defaulting to an empty array
            this.data = this.options.data || [];

            // Build the initial set of actions based on provided data
            var actions = this.buildActions( this.data );

            // Insert the generated HTML into the element
            this.element.html( actions );

        }, // End of init method


        /**
         * Builds the main container for actions and populates it.
         * @param {Array} data - An array of action objects to pre-populate.
         * @returns {jQuery} The jQuery object representing the actions container.
         */
        buildActions: function ( data ) {

            // Create a main container div for all actions
            var container = $( "<div>", { "class": "actions" } );

            // Create a div for action buttons (e.g., "Add Action")
            var buttons = $( "<div>", { "class": "action-buttons" } );

            // Create the "Add Action" button
            var addButton = $( "<a>", { "href": "#", "class": "add", "text": "Add Action" } );

            // Store 'this' context for use inside event handlers
            var _this = this;


            // Attach a click event handler to the "Add Action" button
            addButton.click( function ( e ) {

                e.preventDefault(); // Prevent default link behavior

                // Append a new, empty action div to the container
                container.append( _this.buildAction( {} ) );

            } ); // End of addButton.click handler


            // Append the "Add Action" button to its container
            buttons.append( addButton );

            // Append the buttons container to the main actions container
            container.append( buttons );


            // Loop through existing data to build initial actions
            for ( var i = 0; i < data.length; i++ ) {

                var actionObj = data[ i ]; // Current action object

                // Build a single action div based on the object
                var actionDiv = this.buildAction( actionObj );

                /*
                 * This section is responsible for populating the
                 * input fields within the newly created actionDiv
                 * with values from the actionObj, including nested parameters.
                 */
                var params = [ actionObj ]; // Initialize params with the current action object
                var field;

                // Process parameters recursively
                while ( field = params.shift() ) {

                    // Find the input field by name and set its value, then trigger change
                    actionDiv.find( ":input[name='" + field.name + "']" ).val( field.value ).change();

                    // If there are nested parameters, add them to the queue for processing
                    if ( field.params ) {
                        params = params.concat( field.params );
                    }

                } // End of while loop for params

                // Append the fully populated action div to the main container
                container.append( actionDiv );

            } // End of for loop for data


            return container; // Return the complete actions container

        }, // End of buildActions method


        /**
         * Builds a single action block, including a select for action type,
         * fields for parameters, and a remove button.
         * @param {Object} data - The data object for the action (e.g., name, params).
         * @returns {jQuery} The jQuery object for the action div.
         */
        buildAction: function ( data ) {

            // Find the field definition based on the action's name
            var field = this._findField( data.name );

            // Create the main div for a single action
            var div = $( "<div>", { "class": "action" } );

            // Create a div for subfields (parameters of the selected action)
            var fieldsDiv = $( "<div>", { "class": "subfields" } );

            // Create the select element for choosing an action type
            var select = $( "<select>", { "class": "action-select", "name": "action-select" } );


            // Populate the select dropdown with available actions
            for ( var i = 0; i < this.actions.length; i++ ) {

                var possibleField = this.actions[ i ]; // Current action definition

                // Create an option element for each action
                var option = $( "<option>", { "text": possibleField.label, "value": possibleField.name } );

                // Append the option to the select dropdown
                select.append( option );

            } // End of for loop for actions


            var _this = this; // Store 'this' context


            // Attach a change event handler to the action select dropdown
            select.change( function () {

                var val = $( this ).val(); // Get the selected value

                // Find the new field definition based on the selected value
                var newField = _this._findField( val );

                fieldsDiv.empty(); // Clear existing subfields


                // If the new field has parameters, build and append them
                if ( newField.params ) {

                    // Loop through parameters and build corresponding fields
                    for ( var key in newField.params ) {

                        fieldsDiv.append( _this.buildField( newField.params[ key ] ) );

                    } // End of for-in loop for newField.params

                } // End of if newField.params


                // Update the class of the action div to reflect the selected action type
                div.attr( "class", "action " + val );

            } ); // End of select.change handler


            // Create the "Remove Action" link
            var removeLink = $( "<a>", { "href": "#", "class": "remove", "text": "Remove Action" } );

            // Attach a click event handler to the "Remove Action" link
            removeLink.click( function ( e ) {

                e.preventDefault(); // Prevent default link behavior

                div.remove(); // Remove the entire action div from the DOM

            } ); // End of removeLink.click handler


            // If an initial field is provided (i.e., editing an existing action)
            if ( field ) {

                select.val( field.name ); // Set the select value to the field's name

                select.change(); // Trigger the change event to populate subfields

                // If there are initial parameters for the action
                if ( data.params ) {

                    // Loop through the parameters and set their values
                    for ( var key in data.params ) {

                        fieldsDiv.find( ':input[name=' + key + ']' ).val( data.params[ key ] );

                    } // End of for-in loop for data.params

                } // End of if data.params

            } else {

                // If no initial field, just trigger change to set up default subfields
                select.change();

            } // End of if-else for field


            // Append elements to the main action div in order
            div.append( select );
            div.append( fieldsDiv );
            div.append( removeLink );

            return div; // Return the complete action div

        }, // End of buildAction method


        /**
         * Builds a single input field or a select field based on its definition.
         * Includes handling for nested subfields.
         * @param {Object} field - The field definition object.
         * @returns {jQuery} The jQuery object for the field div.
         */
        buildField: function ( field ) {

            // Create the main div for a single field
            var div = $( "<div>", { "class": "field" } );

            // Create a div for nested subfields
            var subfields = $( "<div>", { "class": "subfields" } );

            var _this = this; // Store 'this' context


            // Create and append a label for the field
            var label = $( "<label>", { "text": field.label } );
            div.append( label );


            // Check the field type and build appropriate input element
            if ( field.fieldType == "select" ) {

                // (Redundant label creation, but keeping as per Type I rule)
                var label = $( "<label>", { "text": field.label } );
                var select = $( "<select>", { "name": field.name } );


                // Populate the select dropdown with options
                for ( var i = 0; i < field.options.length; i++ ) {

                    var optionData = field.options[ i ]; // Current option definition

                    var option = $( "<option>", { "text": optionData.label, "value": optionData.name } );

                    // Store option data directly on the option element
                    option.data( "optionData", optionData );

                    select.append( option );

                } // End of for loop for field.options


                // Attach a change event handler to the select field
                select.change( function () {

                    var option = $( this ).find( "> :selected" ); // Get the selected option element

                    var optionData = option.data( "optionData" ); // Retrieve stored option data

                    subfields.empty(); // Clear existing subfields


                    // If the selected option has nested parameters, build and append them
                    if ( optionData.params ) {

                        for ( var i = 0; i < optionData.params.length; i++ ) {

                            var f = optionData.params[ i ]; // Current nested field definition

                            subfields.append( _this.buildField( f ) ); // Recursively build nested field

                        } // End of for loop for optionData.params

                    } // End of if optionData.params

                } ); // End of select.change handler


                select.change(); // Trigger change initially to populate default subfields

                div.append( select ); // Append the select element to the field div

            } else if ( field.fieldType == "text" ) {

                var input = $( "<input>", { "type": "text", "name": field.name } );
                div.append( input );

            } else if ( field.fieldType == "numeric" ) {

                var input = $( "<input>", { "type": "text", "name": field.name, "class": "numeric" } );
                div.append( input );

            } else if ( field.fieldType == "textarea" ) {

                // Generate a unique ID for the textarea
                var id = "textarea-" + Math.floor( Math.random() * 100000 );

                var area = $( "<textarea>", { "name": field.name, "id": id } );
                div.append( area );

            } // End of if-else if for field.fieldType


            div.append( subfields ); // Append the subfields container to the field div

            return div; // Return the complete field div

        }, // End of buildField method


        /**
         * Collects all action data from the DOM, recursively.
         * @param {jQuery} [params] - Optional jQuery collection of action elements to collect from.
         * @returns {Array} An array of action data objects.
         */
        collectData: function ( params ) {

            var _this = this; // Store 'this' context

            // If no params provided, find all '.action' elements within the builder's element
            params = params || this.element.find( ".action" );

            var out = []; // Array to store collected action data


            // Iterate over each action element
            params.each( function () {

                var input = $( this ).find( "> :input" ); // Find the direct input (e.g., the action-select)

                var subfields = $( this ).find( "> .subfields > .field" ); // Find direct subfield containers

                var value = input.val(); // Get the value of the main input

                // If the input has a 'numeric' class, convert its value to a number
                if ( input.hasClass( 'numeric' ) ) {
                    value = Number( value );
                }

                var action = { name: value }; // Create an action object with its name/value

                // If there are subfields, recursively collect their parameters
                if ( subfields.length > 0 ) {
                    action.params = _this.collectParams( subfields );
                }

                out.push( action ); // Add the collected action to the output array

            } ); // End of params.each


            return out; // Return the array of collected action data

        }, // End of collectData method


        /**
         * Collects parameter data from a collection of field elements.
         * @param {jQuery} params - A jQuery collection of field elements.
         * @returns {Object} An object mapping input names to their values.
         */
        collectParams: function ( params ) {

            var out = {}; // Object to store collected parameters


            // Iterate over each field element
            params.each( function () {

                var input = $( this ).find( ':input' ); // Find the input element within the field

                // Store the input's value using its name as the key
                out[ input.attr( 'name' ) ] = input.val();

            } ); // End of params.each


            return out; // Return the collected parameters object

        }, // End of collectParams method


        /**
         * Finds a field definition from the available actions by its name.
         * @param {string} fieldName - The name of the field to find.
         * @returns {Object|undefined} The field definition object if found, otherwise undefined.
         */
        _findField: function ( fieldName ) {

            // Iterate through all defined actions
            for ( var i = 0; i < this.actions.length; i++ ) {

                var field = this.actions[ i ]; // Current action definition

                // If the field name matches, return the field
                if ( field.name == fieldName ) {
                    return field;
                }

            } // End of for loop

            // If no field is found, implicitly returns undefined

        } // End of _findField method

    }; // End of ActionsBuilder.prototype


} )( jQuery ); // End of IIFE, passing jQuery as $