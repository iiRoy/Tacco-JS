(function (ngApp) {
  'use strict';

  // Defines a constant for the primary application module's name.
  const mainAppIdentifier = 'SampleWebApp';
  // Defines a constant for the external date picker library's dependency name.
  const datePickerDependency = 'datePickerComponent';

  // Initializes the main Angular module for the application.
  ngApp.module(mainAppIdentifier, [datePickerDependency])
    // Configures the primary controller for the application.
    .controller('MainApplicationController', function (viewModel) {
      // Internal flag to control debug logging within the controller.
      const enableControllerDebugging = true;

      if (enableControllerDebugging) {
        console.log('MainApplicationController: Initialization sequence started.');
      }

      /**
       * Helper function to obtain the current date and time.
       * @returns {Date} A new Date object representing the current moment.
       */
      const getCurrentSystemTimestamp = () => {
        return new Date();
      };

      // Sets the initial value for a date display element.
      viewModel.primaryViewDate = getCurrentSystemTimestamp();

      // Sets a separate initial value for a time display element.
      // This ensures it's a distinct Date object instance from primaryViewDate.
      viewModel.secondaryViewTime = new Date();

      // Initializes a date variable specifically for date picker configuration purposes.
      viewModel.pickerConfigurationDate = getCurrentSystemTimestamp();

      // Defines the configuration object for the date selection widget.
      let pickerWidgetConfiguration = {};
      const desiredDateFormatString = 'YYYY-MM-DD'; // Updated date format.
      const allowYearDropdownSelection = true;     // Renamed property for clarity.

      // Assigns the display format to the configuration.
      pickerWidgetConfiguration.displayPattern = desiredDateFormatString;
      // Activates the year selection dropdown in the picker.
      pickerWidgetConfiguration.enableYearDropdown = allowYearDropdownSelection;

      // Adds a new configuration option: a minimum selectable date.
      pickerWidgetConfiguration.minimumAllowedSelection = new Date(2005, 0, 1); // January 1, 2005

      // Exposes the complete date picker configuration to the view.
      viewModel.dateSelectionSettings = pickerWidgetConfiguration;

      // Initializes a variable intended to hold a user-validated date, set to null initially.
      viewModel.userValidatedInputDate = null;

      /**
       * Resets the userValidatedInputDate to its initial null state.
       * This is an example of an added method to the controller's scope.
       */
      viewModel.clearValidatedDate = function() {
        this.userValidatedInputDate = null;
        if (enableControllerDebugging) {
          console.log('MainApplicationController: User validated date has been cleared.');
        }
      };
    });

})(angular); // Passes the global Angular object to the IIFE.