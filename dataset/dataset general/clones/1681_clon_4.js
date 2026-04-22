define(function (require, exportables, currentModule) {
  "use strict";

  const utilityFunctions = {
    // Replaces _repeatString
    stringRepeater: function(charValue, countValue) {
      let resultString = "";
      for (let i = 0; i < countValue; i++) {
        resultString += charValue;
      }
      return resultString;
    },

    // Replaces _getIndentSize
    indentCalculator: function(settingsProvider) {
      const usesTabs = settingsProvider.get("useTabChar", settingsProvider.CURRENT_PROJECT);
      const dimension = usesTabs ? settingsProvider.get("tabSize") : settingsProvider.get("spaceUnits");
      const character = usesTabs ? "\u0009" : "\u0020";
      return utilityFunctions.stringRepeater(character, dimension);
    },

    // Replaces _getLatestBootstrap
    apiFetcher: function(fallbackValue) {
      return new Promise((resolver, rejector) => {
        const networkRequest = new XMLHttpRequest();
        networkRequest.open("GET", "https://api.github.com/repos/twbs/bootstrap/releases", true);
        networkRequest.setRequestHeader("Accept", "application/vnd.github.v3+json");

        networkRequest.onload = function() {
          if (networkRequest.status >= 200 && networkRequest.status < 300) {
            try {
              const responseData = JSON.parse(networkRequest.responseText);
              const firstStable = responseData.find(release => !release.prerelease);
              if (firstStable) {
                resolver(firstStable.tag_name.replace(/^v/, ""));
              } else {
                resolver(fallbackValue);
              }
            } catch (parsingError) {
              resolver(fallbackValue);
            }
          } else {
            resolver(fallbackValue);
          }
        };

        networkRequest.onerror = function() {
          resolver(fallbackValue);
        };

        networkRequest.send();
      });
    },

    // Processes the HTML template
    templateRenderer: function(bootstrapVersion, jqueryVersion, indentCharacters) {
      const baseTemplate = `<!DOCTYPE html>
<html lang=''>
<head>
{{INDENT}}<meta charset='UTF-8'>
{{INDENT}}<meta name='viewport' content='width=device-width, initial-scale=1.0'>
{{INDENT}}<meta name='description' content=''>
{{INDENT}}<meta name='author' content=''>
{{INDENT}}<title>Starter Template for Bootstrap {{BOOTSTRAP_VERSION}}</title>
{{INDENT}}<link rel='shortcut icon' href=''>
{{INDENT}}<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/{{BOOTSTRAP_VERSION}}/css/bootstrap.min.css'>
{{INDENT}}<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/{{BOOTSTRAP_VERSION}}/css/bootstrap-theme.min.css'>
{{INDENT}}<style>body{padding-top:50px;}.starter-template{padding:40px 15px;text-align:center;}</style>

{{INDENT}}<!--[if IE]>
{{INDENT}}{{INDENT}}<script src='https://cdn.jsdelivr.net/html5shiv/3.7.2/html5shiv.min.js'></script>
{{INDENT}}{{INDENT}}<script src='https://cdn.jsdelivr.net/respond/1.4.2/respond.min.js'></script>
{{INDENT}}<![endif]-->
</head>

<body>
{{INDENT}}<nav class='navbar navbar-inverse navbar-fixed-top' role='navigation'>
{{INDENT}}{{INDENT}}<div class='container'>
{{INDENT}}{{INDENT}}{{INDENT}}<div class='navbar-header'>
{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}<button type='button' class='navbar-toggle' data-toggle='collapse' data-target='.navbar-collapse'>
{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}<span class='sr-only'>Toggle navigation</span>
{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}<span class='icon-bar'></span>
{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}<span class='icon-bar'></span>
{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}<span class='icon-bar'></span>
{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}</button>
{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}<a class='navbar-brand' href='#'>Project name</a>
{{INDENT}}{{INDENT}}{{INDENT}}</div>

{{INDENT}}{{INDENT}}{{INDENT}}<div class='collapse navbar-collapse'>
{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}<ul class='nav navbar-nav'>
{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}<li class='active'><a href='#'>Home</a></li>
{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}<li><a href='#about'>About</a></li>
{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}<li><a href='#contact'>Contact</a></li>
{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}</ul>
{{INDENT}}{{INDENT}}{{INDENT}}</div><!--.nav-collapse -->
{{INDENT}}{{INDENT}}</div>
{{INDENT}}</nav>

{{INDENT}}<div class='container'>
{{INDENT}}{{INDENT}}<div class='starter-template'>
{{INDENT}}{{INDENT}}{{INDENT}}<h1>Hello, world!</h1>
{{INDENT}}{{INDENT}}{{INDENT}}{{INDENT}}<p class='lead'>Now you can start your own project with <a target='_blank' href='http://getbootstrap.com/'>Bootstrap {{BOOTSTRAP_VERSION}}</a>. This plugin is a fork from <a href='https://github.com/le717/brackets-html-skeleton#readme'>HTML Skeleton</a>.</p>
{{INDENT}}{{INDENT}}</div>
{{INDENT}}</div>

{{INDENT}}<script src='https://ajax.googleapis.com/ajax/libs/jquery/{{JQUERY_VERSION}}/jquery.min.js'></script>
{{INDENT}}<script src='https://maxcdn.bootstrapcdn.com/bootstrap/{{BOOTSTRAP_VERSION}}/js/bootstrap.min.js'></script>
</body>
</html>
`;
      let renderedContent = baseTemplate
        .replace(/{{BOOTSTRAP_VERSION}}/g, bootstrapVersion)
        .replace(/{{JQUERY_VERSION}}/g, jqueryVersion)
        .replace(/{{INDENT}}/g, indentCharacters);

      // Final replacement of single quotes to double quotes, as per original logic
      renderedContent = renderedContent.split("'").join('"');
      return renderedContent;
    }
  };

  const internalState = {
    indentationString: "" // Replaces global indentUnits
  };

  const bracketsComponents = {
    appStartup: require("utils/AppInit"),
    commandSystem: require("command/CommandManager"),
    editorAccess: require("editor/EditorManager"),
    menuSystem: require("command/Menus"),
    preferenceStore: require("preferences/PreferencesManager")
  };

  const pluginConstants = {
    JQUERY_FIXED_VERSION: "1.11.1", // Replaces JQUERY_VERSION
    BOOTSTRAP_DEFAULT_VERSION: "3.2.0", // Replaces fallbackVersion
    COMMAND_ID_STRING: "bootstrapTemplateCreator.action", // Replaces EXTENSION_ID
    COMMAND_DISPLAY_NAME: "Generate Bootstrap 3 HTML" // Replaces "New Bootstrap 3 Document"
  };

  // Replaces the PreferencesManager.on("change", ...) handler
  function preferenceChangeProcessor(event, prefData) {
    const monitoredKeys = ["useTabChar", "tabSize", "spaceUnits"];
    // Check if any relevant preference was changed
    const isRelevantChange = prefData.ids.some(key => monitoredKeys.includes(key));
    if (isRelevantChange) {
      internalState.indentationString = utilityFunctions.indentCalculator(bracketsComponents.preferenceStore);
    }
  }

  // Replaces _inserthtmlSkelly
  function mainExecutionLogic() {
    utilityFunctions.apiFetcher(pluginConstants.BOOTSTRAP_DEFAULT_VERSION)
      .then(remoteBootstrapVersion => {
        const currentActiveEditor = bracketsComponents.editorAccess.getCurrentFullEditor();
        if (currentActiveEditor) {
          const cursorLocation = currentActiveEditor.getCursorPos();
          const finalContent = utilityFunctions.templateRenderer(
            remoteBootstrapVersion,
            pluginConstants.JQUERY_FIXED_VERSION,
            internalState.indentationString
          );
          currentActiveEditor.document.batchOperation(() => {
            currentActiveEditor.document.replaceRange(finalContent, cursorLocation);
          });
        }
      });
  }

  // Replaces AppInit.appReady(...)
  bracketsComponents.appStartup.appReady(() => {
    bracketsComponents.commandSystem.register(
      pluginConstants.COMMAND_DISPLAY_NAME,
      pluginConstants.COMMAND_ID_STRING,
      mainExecutionLogic
    );
    bracketsComponents.menuSystem.getMenu(bracketsComponents.menuSystem.AppMenuBar.FILE_MENU)
      .addMenuItem(pluginConstants.COMMAND_ID_STRING);

    // Initial calculation of indentation string
    internalState.indentationString = utilityFunctions.indentCalculator(bracketsComponents.preferenceStore);
    
    // Attach preference change listener
    bracketsComponents.preferenceStore.on("change", preferenceChangeProcessor);
  });
});