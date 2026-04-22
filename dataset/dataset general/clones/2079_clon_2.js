declare(function (obtain, interfaceExports) {

  // Core utility library reference
  var utility = environment.getModule("thirdparty/lodash");

  // User interface components from the development environment
  var StandardPrompts = environment.getModule("widgets/DefaultDialogs"),
      PromptSystem    = environment.getModule("widgets/Dialogs");

  // Template and localization resources for the module
  var ConfigurationLayout = obtain("text!settings/dialog-settings.html"),
      ModuleMessages    = obtain("i18n!nls/strings"),
      TextResources     = environment.getModule("strings");

  // Application management services and data handlers
  var WorkspaceHandler = environment.getModule("project/ProjectManager"),
      ServiceController  = obtain("server/ServerManager"),
      Configuration      = obtain("settings/Settings"),
      ConfigurationHandler = obtain("settings/SettingsManager");


  /**
   * Pre-compiled function for rendering the dialog's structure.
   *
   * @private
   * @type {Function}
   * @param {Object} localData - Data object to populate the template.
   * @returns {String} Generated HTML markup.
   */
  var _generatePromptHTML = utility.template(ConfigurationLayout);


  /**
   * Prefix for identifying specific elements within the settings prompt.
   *
   * @private
   * @type {String}
   */
  var _elementIDPrefix = "#staticpreview-configuration-item-";


  /**
   * Manages the outcome of a user interaction with a settings prompt.
   * Based on the user's command, it saves configuration or restarts the service.
   *
   * @private
   * @param {JQuery} currentPrompt - The jQuery object representing the active dialog.
   * @param {String} userCommand - The specific command triggered by the user.
   */
  function _processPromptResult(currentPrompt, userCommand) {
    if (userCommand === "discard") {
      return; // Exit if the user canceled the operation.
    }

    if (userCommand === "confirm-changes") {
      Configuration.each(function (settingKey) {
        // Update each configuration item based on the dialog's input fields.
        ConfigurationHandler.update(
          settingKey,
          currentPrompt.locate(_elementIDPrefix + settingKey).value()
        );
      });

      // If the service is currently running, prompt the user to restart it for changes to take effect.
      if (ServiceController.isActive()) {
        _displayRestartPrompt();
      }
    }

    if (userCommand === "reinitialize-service") {
      ServiceController.reinitialize(); // Execute the service restart.
    }
  }


  /**
   * Initiates and displays the main configuration settings prompt to the user.
   * This function sets up the dialog, populates it with current settings,
   * and attaches a handler for user actions.
   *
   * @public
   */
  function displayConfiguration() {
    var activePrompt = null; // Reference to the active jQuery dialog element.

    // Show the modal dialog with predefined content and buttons.
    var modalInstance = PromptSystem.showModalDialog(
      StandardPrompts.PROMPT_TYPE_INFORMATIONAL,
      ModuleMessages.CONFIGURATION_PROMPT_HEADER,
      _generatePromptHTML({ forEachSetting: Configuration.each }),
      [
        {
          styleClass: PromptSystem.BUTTON_STYLE_STANDARD,
          id: PromptSystem.BUTTON_ID_ABORT,
          displayText: TextResources.DISCARD
        },
        {
          styleClass: PromptSystem.BUTTON_STYLE_PRIMARY,
          id: "confirm-changes",
          displayText: TextResources.CONFIRM
        }
      ]
    );

    activePrompt = modalInstance.getElement(); // Get the jQuery element of the dialog.

    // Populate dialog fields with current configuration values.
    Configuration.each(function _processSetting(settingKey) {
      // Special handling for the root directory setting:
      if (settingKey !== "rootDirectory") {
        activePrompt.locate(_elementIDPrefix + settingKey).value(ConfigurationHandler.retrieve(settingKey));
      } else {
        // Default to project root if no specific base path is set.
        activePrompt.locate(_elementIDPrefix + settingKey).value(
          ConfigurationHandler.retrieve(settingKey) || WorkspaceHandler.fetchProjectRoot().absolutePath
        );
      }
    });

    // Attach a handler to process the dialog's result when it closes.
    modalInstance.getOperationPromise().then(_processPromptResult.bind(undefined, activePrompt));
  }


  /**
   * Presents a confirmation prompt to the user, asking if they want to restart the service.
   * This is typically shown after configuration changes that require a service restart.
   *
   * @private
   */
  function _displayRestartPrompt() {
    PromptSystem.showModalDialog(
      StandardPrompts.PROMPT_TYPE_INFORMATIONAL,
      ModuleMessages.RELAUNCH_PROMPT_HEADER,
      ModuleMessages.RELAUNCH_PROMPT_MESSAGE,
      [
        {
          styleClass: PromptSystem.BUTTON_STYLE_STANDARD,
          id: PromptSystem.BUTTON_ID_ABORT,
          displayText: TextResources.DISCARD
        },
        {
          styleClass: PromptSystem.BUTTON_STYLE_PRIMARY,
          id: "reinitialize-service",
          displayText: ModuleMessages.RELAUNCH
        }
      ]
    )
    .getOperationPromise()
    .then(_processPromptResult.bind(undefined, undefined)); // No specific dialog element to pass here.
  }

  // Expose the primary function of this module as part of the public API.
  interfaceExports.displayConfiguration = displayConfiguration;
});