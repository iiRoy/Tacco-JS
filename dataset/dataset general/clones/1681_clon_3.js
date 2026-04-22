/*
 * This module facilitates the rapid creation of new HTML documents,
 * pre-filled with a foundational Bootstrap v3 structure. It integrates
 * with the Brackets editor to provide a menu option for this utility.
 */
define(function (reqs, exporter, moduel) {
  "use strict";

  // Core Brackets API dependencies for this utility plugin
  var StartupManager   = reqs("utils/AppInit"),
      ActionRegistry   = reqs("command/CommandManager"),
      DocEditor        = reqs("editor/EditorManager"),
      UIComponents     = reqs("command/Menus"),
      ConfigStore      = reqs("preferences/PreferencesManager");

  // Stores the calculated string representing the user's preferred indentation
  var codeFormattingIndent = "";

  // Fixed jQuery version for the template, as specified by the plugin author
  const BASE_JQUERY_VER = "1.11.1";

  /**
   * @private
   * Generates a string by repeating a given character sequence a specified number of times.
   * @param {string} charToRepeat The character or string to be repeated.
   * @param {number} repetitionCount The number of times charToRepeat should be repeated.
   * @returns {string} The resulting concatenated string. Returns an empty string if repetitionCount is invalid.
   */
  function generateStringCopies(charToRepeat, repetitionCount) {
    if (repetitionCount < 0 || typeof repetitionCount !== "number") {
      console.warn("Invalid repetition count provided. Must be a non-negative number.");
      return "";
    }
    // A more modern approach to string repetition
    return Array(repetitionCount + 1).join(charToRepeat);
  }

  /**
   * @private
   * Determines the current indentation settings based on user preferences.
   * This function queries the preferences manager to ascertain whether tabs or spaces
   * are used for indentation and their respective sizes.
   * @returns {string} The string sequence representing a single level of indentation.
   */
  function retrieveCurrentIndentConfig() {
    const currentProjectScope = ConfigStore.CURRENT_PROJECT;
    const useTabs = ConfigStore.get("useTabChar", currentProjectScope);
    let indentSequence;

    if (useTabs) {
      const tabSize = ConfigStore.get("tabSize");
      indentSequence = generateStringCopies("\u0009", tabSize); // Tab character
      console.debug("Indentation set to tabs, size:", tabSize);
    } else {
      const spaceUnits = ConfigStore.get("spaceUnits");
      indentSequence = generateStringCopies("\u0020", spaceUnits); // Space character
      console.debug("Indentation set to spaces, size:", spaceUnits);
    }
    return indentSequence;
  }

  /**
   * @private
   * Updates the module-level variable `codeFormattingIndent` with the latest
   * indentation settings. This ensures the generated HTML template uses the
   * user's preferred formatting.
   */
  function updateIndentConfiguration() {
    const newIndentValue = retrieveCurrentIndentConfig();
    if (codeFormattingIndent !== newIndentValue) {
      codeFormattingIndent = newIndentValue;
      console.info("Indentation configuration updated to:", JSON.stringify(codeFormattingIndent));
    } else {
      console.debug("Indentation configuration unchanged.");
    }
  }

  // Listener for preference changes to dynamically update indentation settings.
  ConfigStore.on("change", function (eventObj, configData) {
    // Ensure configData and its ids property exist before processing
    if (configData && Array.isArray(configData.ids)) {
      for (const settingKey of configData.ids) {
        // Only update if a relevant indentation preference has changed.
        if (settingKey === "useTabChar" || settingKey === "tabSize" || settingKey === "spaceUnits") {
          console.log("Detected change in preference:", settingKey);
          updateIndentConfiguration();
          break; // No need to check other IDs if one relevant was found
        }
      }
    } else {
      console.warn("Preference change event received without valid configData.ids.");
    }
  });

  /**
   * @private
   * Asynchronously fetches the latest stable Bootstrap version number from GitHub's API.
   * Provides a fallback version if the API request fails or returns an invalid response.
   * @returns {jQuery.Promise} A promise that resolves with the Bootstrap version string.
   */
  function fetchBootstrapVersionInfo() {
    const defaultFallbackVersion = "3.2.0"; // A reasonable fallback for Bootstrap 3
    const githubApiUrl = "https://api.github.com/repos/twbs/bootstrap/releases";
    const asyncOperationPromise = new $.Deferred();

    $.ajax({
      method: "GET", // Explicitly define HTTP method
      url: githubApiUrl,
      dataType: "json",
      cache: true,
      timeout: 5000, // Add a timeout for robustness
      success: function(responsePayload) {
        // Validate response structure
        if (Array.isArray(responsePayload) && responsePayload.length > 0 && responsePayload[0]) {
          const latestRelease = responsePayload[0];
          const isPreRelease = latestRelease.prerelease || false; // Ensure boolean
          if (!isPreRelease && latestRelease.tag_name) {
            const stableVersion = latestRelease.tag_name.replace(/^v/, "");
            console.info("Successfully fetched latest Bootstrap version:", stableVersion);
            asyncOperationPromise.resolve(stableVersion);
          } else {
            console.warn("Latest release is a prerelease or missing tag_name. Using fallback version.");
            asyncOperationPromise.resolve(defaultFallbackVersion);
          }
        } else {
          console.error("GitHub API returned an empty or malformed response. Using fallback.");
          asyncOperationPromise.resolve(defaultFallbackVersion);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error(`Failed to fetch Bootstrap version from GitHub API: ${textStatus} - ${errorThrown}. Using fallback version.`);
        asyncOperationPromise.resolve(defaultFallbackVersion);
      },
      complete: function() {
        console.debug("Bootstrap version fetch attempt completed.");
      }
    });
    return asyncOperationPromise.promise();
  }

  /**
   * @private
   * Inserts a predefined Bootstrap 3 HTML skeleton into the currently active editor document.
   * This function dynamically fetches the latest Bootstrap version and applies user's
   * indentation settings before insertion.
   */
  function injectBootstrapMarkup() {
    const indent = codeFormattingIndent; // Use a shorthand for clarity within the template

    // The HTML template string, broken down for readability and easier modification
    // Placeholders like `__BOOTSTRAP_VERSION__`, `__JQUERY_VERSION__`, `__INDENT__` will be replaced.
    let templateString = `<!DOCTYPE html>
<html lang="en">
${indent}<head>
${indent}${indent}<meta charset="UTF-8">
${indent}${indent}<meta name="viewport" content="width=device-width, initial-scale=1.0">
${indent}${indent}<meta name="description" content="A starter template for Bootstrap 3 projects.">
${indent}${indent}<meta name="author" content="Brackets Plugin User">
${indent}${indent}<title>Bootstrap Starter Template v__BOOTSTRAP_VERSION__</title>
${indent}${indent}<link rel="shortcut icon" href="">
${indent}${indent}<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/__BOOTSTRAP_VERSION__/css/bootstrap.min.css">
${indent}${indent}<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/__BOOTSTRAP_VERSION__/css/bootstrap-theme.min.css">
${indent}${indent}<style>
${indent}${indent}${indent}body { padding-top: 50px; }
${indent}${indent}${indent}.starter-template { padding: 40px 15px; text-align: center; }
${indent}${indent}</style>

${indent}${indent}<!--[if IE]>
${indent}${indent}${indent}<script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.min.js"></script>
${indent}${indent}${indent}<script src="https://cdnjs.cloudflare.com/ajax/libs/respond.js/1.4.2/respond.min.js"></script>
${indent}${indent}<![endif]-->
${indent}</head>

${indent}<body>
${indent}${indent}<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
${indent}${indent}${indent}<div class="container">
${indent}${indent}${indent}${indent}<div class="navbar-header">
${indent}${indent}${indent}${indent}${indent}<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
${indent}${indent}${indent}${indent}${indent}${indent}<span class="sr-only">Toggle navigation</span>
${indent}${indent}${indent}${indent}${indent}${indent}<span class="icon-bar"></span>
${indent}${indent}${indent}${indent}${indent}${indent}<span class="icon-bar"></span>
${indent}${indent}${indent}${indent}${indent}${indent}<span class="icon-bar"></span>
${indent}${indent}${indent}${indent}${indent}</button>
${indent}${indent}${indent}${indent}<a class="navbar-brand" href="#">Project Name</a>
${indent}${indent}${indent}</div>

${indent}${indent}${indent}<div id="navbar" class="collapse navbar-collapse">
${indent}${indent}${indent}${indent}<ul class="nav navbar-nav">
${indent}${indent}${indent}${indent}${indent}<li class="active"><a href="#">Home</a></li>
${indent}${indent}${indent}${indent}${indent}<li><a href="#about">About</a></li>
${indent}${indent}${indent}${indent}${indent}<li><a href="#contact">Contact</a></li>
${indent}${indent}${indent}${indent}</ul>
${indent}${indent}${indent}</div><!--/.nav-collapse -->
${indent}${indent}</div>
${indent}</nav>

${indent}${indent}<div class="container">
${indent}${indent}${indent}<div class="starter-template">
${indent}${indent}${indent}${indent}<h1>Hello, world!</h1>
${indent}${indent}${indent}${indent}<p class="lead">Now you can start your own project with <a target="_blank" href="http://getbootstrap.com/">Bootstrap __BOOTSTRAP_VERSION__</a>. This Brackets extension is inspired by <a href="https://github.com/le717/brackets-html-skeleton#readme">HTML Skeleton</a>.</p>
${indent}${indent}${indent}</div>
${indent}${indent}</div>

${indent}${indent}<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/__JQUERY_VERSION__/jquery.min.js"></script>
${indent}${indent}<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/__BOOTSTRAP_VERSION__/js/bootstrap.min.js"></script>
${indent}</body>
</html>
`;

    // As fetching the version is async, the insertion logic must be within the 'then' callback.
    fetchBootstrapVersionInfo().then(function (bsVersion) {
      const activeEditorInstance = DocEditor.getCurrentFullEditor();
      if (!activeEditorInstance) {
        console.error("No active editor found to insert the Bootstrap template.");
        return; // Exit if no editor is open
      }

      try {
        const currentCursorPosition = activeEditorInstance.getCursorPos();

        // Perform the necessary replacements in the template string
        const finalMarkup = templateString
          .replace(/__BOOTSTRAP_VERSION__/g, bsVersion)
          .replace(/__JQUERY_VERSION__/g, BASE_JQUERY_VER);

        activeEditorInstance.document.batchOperation(function () {
          console.info("Inserting Bootstrap template at cursor position:", currentCursorPosition);
          activeEditorInstance.document.replaceRange(finalMarkup, currentCursorPosition);
          console.info("Bootstrap template insertion complete.");
        });
      } catch (error) {
        console.error("An error occurred during template insertion:", error);
      }
    });
  }

  /**
   * @private
   * Initializes the extension once the Brackets application is fully loaded.
   * This includes registering the command and adding it to the 'File' menu.
   */
  StartupManager.appReady(function () {
    const PLUGIN_IDENTIFIER = "myplugin.bootstrap.newdoc"; // A unique identifier for the command
    const menuLabel = "New Bootstrap 3 Document";

    // Register the command with the CommandManager
    ActionRegistry.register(menuLabel, PLUGIN_IDENTIFIER, injectBootstrapMarkup);

    // Get the File menu and add our new menu item
    const fileMenuInstance = UIComponents.getMenu(UIComponents.AppMenuBar.FILE_MENU);
    if (fileMenuInstance) {
        fileMenuInstance.addMenuItem(PLUGIN_IDENTIFIER, null, UIComponents.MenuItem.BEFORE, UIComponents.MenuSection.FILE_OPEN_CLOSE_SECTION);
        console.info(`Brackets Bootstrap 3 Template Plugin: "${menuLabel}" command registered and added to File menu.`);
    } else {
        console.error("Could not find the File menu to add the Bootstrap template command.");
    }

    // Set the initial indentation configuration upon plugin load
    updateIndentConfiguration();
    console.info("Brackets Bootstrap 3 Template Plugin loaded successfully.");
  });
});