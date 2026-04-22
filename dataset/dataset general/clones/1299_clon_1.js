/* This JavaScript file defines a React component for a dynamic form.
 * It includes components for input fields and select dropdowns.
 * The form handles its own state for input values and manages changes.
 */

var Form = React.createClass({ // Main form component definition starts here.
   // Method to initialize the component's state.
   getInitialState: function () {
      // The initial state holds an object to store form values.
      return {
         values: {}
      };
   }, // End of getInitialState method.


   // Nested component for text input fields.
   Input: React.createClass({
      // Initializes the state for an individual input field.
      getInitialState: function () {
         /* The value of the input field is taken from the item's initial value
          * provided via props. */
         return {
            value: this.props.item.value
         };
      }, // End of getInitialState for Input.

      // Renders the input field component.
      render: function () {
         // Returns a div element acting as a form group container.
         return React.DOM.div({
            className: "form-group", // CSS class for styling.
            children: [ // Array of child elements.
               // Label for the input field.
               React.DOM.label({
                  className: "control-label col-sm-" + this.props.cols[0], // Dynamic column class.
                  children: [
                     this.props.item.label // Display label text.
                  ]
               }), // End of label.

               // Container for the input element itself.
               React.DOM.div({
                  className: "col-sm-" + this.props.cols[1], // Dynamic column class.
                  children: [
                     // The actual input element.
                     React.DOM.input({
                        type: "text", // Specifies input type as text.
                        name: this.props.item.name, // Name attribute for form submission.
                        className: "form-control", // Bootstrap class for styling.
                        value: this.state.value, // Controlled component value.
                        onChange: function (event) { // Event handler for input changes.
                           // Updates the component's internal state with the new value.
                           this.setState({
                              value: event.target.value
                           });
                           // Calls the parent's change handler to update global form state.
                           this.props.changeHandler(event.target.name, event.target.value);
                        }.bind(this), // Binds 'this' context to the onChange function.
                     }) // End of input element.
                  ]
               }) // End of input container div.
            ]
         }) // End of form-group div.
      } // End of render for Input.
   }), // End of Input component definition.


   // Nested component for select (dropdown) fields.
   Select: React.createClass({
      // Initializes the state for an individual select field.
      getInitialState: function () {
         return {
            value: this.props.item.value
         };
      }, // End of getInitialState for Select.

      // Lifecycle method: Called when component receives new props.
      componentWillReceiveProps: function (props) {
         // Updates the state value if new props contain a different item value.
         this.setState({
            value: props.item.value
         });
      }, // End of componentWillReceiveProps.

      // Renders the select field component.
      render: function () {
         // Returns a div element acting as a form group container.
         return React.DOM.div({
            className: "form-group", // CSS class for styling.
            children: [
               // Label for the select field.
               React.DOM.label({
                  className: "control-label col-sm-" + this.props.cols[0],
                  children: [
                     this.props.item.label
                  ]
               }), // End of label.

               // Container for the select element itself.
               React.DOM.div({
                  className: "col-sm-" + this.props.cols[1],
                  children: [
                     // The actual select element.
                     React.DOM.select({
                        className: "form-control", // Bootstrap class for styling.
                        name: this.props.item.name, // Name attribute for form submission.
                        value: this.state.value, // Controlled component value.
                        onChange: function (event) { // Event handler for select changes.
                           // Updates the component's internal state with the new value.
                           this.setState({
                              value: event.target.value
                           });
                           // Calls the parent's change handler to update global form state.
                           this.props.changeHandler(event.target.name, event.target.value);
                        }.bind(this), // Binds 'this' context.
                        // Maps options from props to React.DOM.option elements.
                        children: this.props.item.options.map(function (option) {
                           return React.DOM.option({
                              disabled: option.disabled || false, // Disable option if specified.
                              children: [
                                 option.value // Display option value as content.
                              ]
                           }); // End of option element.
                        }) // End of map function.
                     }) // End of select element.
                  ]
               }) // End of select container div.
            ]
         }) // End of form-group div.
      } // End of render for Select.
   }), // End of Select component definition.


   // Method to get the current values of all form items.
   getCurrentValues: function () {
      var values = {}; // Initialize an empty object to hold current values.
      // Loop through each item provided in props.
      for (var i = 0; i < this.props.items.length; i++) {
         var item = this.props.items[i]; // Current item.
         // Check if a value for this item exists in the component's state.
         if (this.state.values.hasOwnProperty(item.name)) {
            values[item.name] = this.state.values[item.name]; // Use state value.
         } else if (item.value != undefined) { // Check if item has a default value.
            values[item.name] = item.value; // Use item's default value.
         } else if (item.type == "select" && item.options.length > 0) {
            // For select fields, if no value, use the first option's value.
            values[item.name] = item.options[0].value;
         }
      } // End of for loop.
      return values; // Return the collected values.
   }, // End of getCurrentValues.


   // Handles changes from individual input/select components.
   handleChange: function (key, value) {
      var values = this.state.values; // Get current values from state.
      values[key] = value; // Update the specific key with the new value.
      this.setState({
         values: values
      }); // Set the updated values back to state.
   }, // End of handleChange.


   // Determines if a select option should be disabled based on dependencies.
   shallDisableOption: function (opt, currentValues) {
      // Check if the option has dependencies defined.
      if (opt.dependencies != undefined) {
         // Iterate over each dependency key.
         for (var key in opt.dependencies) {
            // Ensure the dependent key exists in current form values.
            if (currentValues.hasOwnProperty(key)) {
               var found = false; // Flag to track if dependency is met.
               // Iterate over the allowed values for the dependency.
               for (var i = 0; i < opt.dependencies[key].length; i++) {
                  // If the current value matches an allowed dependency value.
                  if (currentValues[key] == opt.dependencies[key][i]) {
                     found = true; // Dependency met.
                     break; // No need to check further for this dependency.
                  }
               }
               if (!found) { // If dependency not met.
                  return true; // Disable the option.
               }
            } // End of hasOwnProperty check.
         } // End of for...in loop.
      } // End of dependencies check.
      return false; // Option should not be disabled.
   }, // End of shallDisableOption.


   /*
    * This function verifies that the currently selected value is still valid
    * among the list of available (non-disabled) options.
    * If the current value is not valid, it defaults to the first available option.
    */
   getCurrentOptionValue: function (currentValue, options) {
      // Filter out disabled options and get their values.
      var optValues = options.filter(function (opt) {
         return !opt.disabled;
      }).map(function (opt) {
         return opt.value;
      });

      var found = false; // Flag to check if current value is in enabled options.
      // Loop through enabled option values.
      for (var i = 0; i < optValues.length; i++) {
         if (optValues[i] == currentValue) { // If current value matches an enabled option.
            found = true; // Value is valid.
            break; // Exit loop.
         }
      }
      // Return current value if valid, otherwise return the first enabled option's value.
      return found ? currentValue : optValues[0];
   }, // End of getCurrentOptionValue.


   // Formats select item data, including disability status of options.
   formatSelect: function (item, currentValues) {
      // Map through options to determine their disabled status.
      var options = item.options.map(function (opt) {
         return {
            value: opt.value,
            disabled: this.shallDisableOption(opt, currentValues)
         };
      }.bind(this)); // Bind 'this' for shallDisableOption.

      // Determine the correct value for the select based on current values and option availability.
      var value = this.getCurrentOptionValue(currentValues[item.name], options);
      // Return a new item object with formatted options and value.
      return {
         label: item.label,
         name: item.name,
         options: options,
         type: item.type,
         value: value
      };
   }, // End of formatSelect.


   // Main render method for the Form component.
   render: function () {
      // Get the current values for all form fields.
      var currentValues = this.getCurrentValues();
      // Render the main form element.
      return React.DOM.form({
         className: "form-horizontal", // Bootstrap class for horizontal form layout.
         // Map through form items to render appropriate components.
         children: this.props.items.map(function (item) {
            // Check item type to render corresponding component.
            if (item.type == "select") {
               // Render a Select component for 'select' type items.
               return this.Select({
                  item: this.formatSelect(item, currentValues), // Formatted item data.
                  cols: this.props.cols, // Column configuration.
                  changeHandler: this.handleChange // Change handler callback.
               });
            } else if (item.type == "input") {
               // Render an Input component for 'input' type items.
               return this.Input({
                  item: item, // Original item data.
                  cols: this.props.cols,
                  changeHandler: this.handleChange
               })
            } else {
               // For other types, render a hidden input field.
               return React.DOM.input({
                  type: "hidden", // Hidden input.
                  name: item.name,
                  value: item.value
               });
            }
         }.bind(this)) // Bind 'this' to the map function.
      }); // End of form element.
   } // End of render for Form.
}); // End of Form component definition.