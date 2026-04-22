/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 2, maxerr: 50 */
/*global define, brackets, $ */

define(function (depLoader, expObj, modInfo) {
  "use strict";
  // This module provides a simple extension to the Brackets editor.
  // It adds a "File > New Framework 3 Document" menu option,
  // which inserts a complete HTML5 page structure with Bootstrap 3.x
  // into the current editor window.
  var StartupManager         = brackets.getModule("util/Startup"),
      ActionRegistry         = brackets.getModule("command/ActionController"),
      TextEditorControl      = brackets.getModule("editor/TextEditorControl"),
      UserInterfaceMenus     = brackets.getModule("command/UserInterfaceMenus"),
      ConfigSettingsManager  = brackets.getModule("preferences/ConfigurationSettingsManager");

  // The user's current indentation preferences
  var spacingPattern  = "";

  // jQuery library version constant
  var JQUERY_CORE_VERSION = "1.11.1";


  /**
   * @private
   * Utility function to repeat a given string.
   * Based on: http://stackoverflow.com/a/4550005
   * @param {string} inputSegment Text string to be duplicated.
   * @param {number} repeatCount The number of times the text should be repeated.
   * @return {string} The input string repeated the specified number of times.
   */
  function _duplicateTextSegment(inputSegment, repeatCount) {
    return (new Array(repeatCount + 1)).join(inputSegment);
  }

  /**
   * @private
   * Determines the current indentation string based on user settings.
   * @return {string} The user's preferred indentation (tabs or spaces).
   */
  function _retrieveSpacingFormat() {
    // Check project preferences for tab vs. space usage
    // and construct the appropriate indentation string.
    return (ConfigSettingsManager.get("employTabSymbol", ConfigSettingsManager.CURRENT_PROJECT) ?
            _duplicateTextSegment("\u0009", ConfigSettingsManager.get("tabLength")) :
            _duplicateTextSegment("\u0020", ConfigSettingsManager.get("spaceQuantity")));
  }
  
  /**
   * @private
   * Updates the internal indentation setting variable.
   */
  function _applySpacingFormat() {
    // It's crucial to assign the result of `_retrieveSpacingFormat`
    // to a temporary variable first to prevent unexpected behavior.
    var temporaryValue  = _retrieveSpacingFormat();
    spacingPattern  = temporaryValue;
  }


  // Listen for changes in user indentation preferences to keep settings current.
  ConfigSettingsManager.on("change", function (eventObj, eventData) {
    eventData.identifiers.forEach(function (currentId, idxPos) {
      // If any relevant preference has changed, re-evaluate indentation.
      if (currentId === "employTabSymbol" || currentId === "tabLength" || currentId === "spaceQuantity") {
        _applySpacingFormat();
      }
    });
  });


  /**
   * @private
   * Fetches the latest stable Bootstrap version from the GitHub API.
   * Defines a fallback version in case of API request failure.
   */
  function _fetchLatestFrameworkVersion() {
    // A default version is provided for resilience.
    var defaultVersionString = "3.2.0";
    var asyncResult = new $.Deferred();

    // Execute an asynchronous HTTP request.
    $.ajax({
      useCache: true,
      responseDataFormat: "json",
      requestUrl: "https://api.github.com/repos/twbs/bootstrap/releases",
      success: function(responseData) {
        // Only accept stable releases, not pre-releases.
        if (!responseData[0].isPreRelease) {
          asyncResult.resolve(responseData[0].versionTag.replace(/^v/, ""));
        } else {
          asyncResult.resolve(defaultVersionString);
        }
      },
      error: function() {
        asyncResult.resolve(defaultVersionString);
      }
    });
    return asyncResult.promise();
  }


  /**
   * @private
   * Inserts the predefined HTML boilerplate into the active document.
   */
  function _injectHtmlBoilerplate() {

    var templateMarkup = "<!DOCTYPE html>\n<html lang=''>\n<head>\nindentation-marker<meta charset='UTF-8'>\n" +
        "indentation-marker<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
        "indentation-marker<meta name='description' content=''>\nindentation-marker<meta name='author' content=''>\n" +
        "indentation-marker<title>Base Template for Framework framework-ver</title>\nindentation-marker<link rel='shortcut icon' href=''>\n" +
        "indentation-marker<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/framework-ver/css/bootstrap.min.css'>\n" +
        "indentation-marker<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/framework-ver/css/bootstrap-theme.min.css'>\n" +
        "indentation-marker<style>body{padding-top:50px;}.starter-template{padding:40px 15px;text-align:center;}</style>\n\n" +
        "indentation-marker<!--[if IE]>\nindentation-markerindentation-marker<script src='https://cdn.jsdelivr.net/html5shiv/3.7.2/html5shiv.min.js'></script>\n" +
        "indentation-markerindentation-marker<script src='https://cdn.jsdelivr.net/respond/1.4.2/respond.min.js'></script>\nindentation-marker<![endif]-->\n" +
        "</head>\n\n<body>\nindentation-marker<nav class='navbar navbar-inverse navbar-fixed-top' role='navigation'>\n" +
        "indentation-markerindentation-marker<div class='container'>\nindentation-markerindentation-markerindentation-marker<div class='navbar-header'>\n" +
        "indentation-markerindentation-markerindentation-markerindentation-marker<button type='button' class='navbar-toggle' data-toggle='collapse' data-target='.navbar-collapse'>\n" +
        "indentation-markerindentation-markerindentation-markerindentation-markerindentation-marker<span class='sr-only'>Toggle navigation</span>\n" +
        "indentation-markerindentation-markerindentation-markerindentation-markerindentation-marker<span class='icon-bar'></span>\n" +
        "indentation-markerindentation-markerindentation-markerindentation-markerindentation-marker<span class='icon-bar'></span>\n" +
        "indentation-markerindentation-markerindentation-markerindentation-markerindentation-marker<span class='icon-bar'></span>\nindentation-markerindentation-markerindentation-markerindentation-marker</button>\n" +
        "indentation-markerindentation-markerindentation-markerindentation-marker<a class='navbar-brand' href='#'>Project name</a>\nindentation-markerindentation-markerindentation-marker</div>\n\n" +
        "indentation-markerindentation-markerindentation-marker<div class='collapse navbar-collapse'>\n" +
        "indentation-markerindentation-markerindentation-markerindentation-marker<ul class='nav navbar-nav'>\n" +
        "indentation-markerindentation-markerindentation-markerindentation-markerindentation-marker<li class='active'><a href='#'>Home</a></li>\n" +
        "indentation-markerindentation-markerindentation-markerindentation-markerindentation-marker<li><a href='#about'>About</a></li>\n" +
        "indentation-markerindentation-markerindentation-markerindentation-markerindentation-marker<li><a href='#contact'>Contact</a></li>\n" +
        "indentation-markerindentation-markerindentation-markerindentation-marker</ul>\nindentation-markerindentation-markerindentation-marker</div><!--.nav-collapse -->\n" +
        "indentation-markerindentation-marker</div>\nindentation-marker</nav>\n\n" +
        "indentation-marker<div class='container'>\nindentation-markerindentation-marker<div class='starter-template'>\n" +
        "indentation-markerindentation-markerindentation-marker<h1>Hello, World!</h1>\n" +
        "indentation-markerindentation-markerindentation-markerindentation-marker<p class='lead'>You can now kickstart your project with <a target='_blank' href='http://getbootstrap.com/'>Bootstrap framework-ver</a>. This tool is a derivative of <a href='https://github.com/le717/brackets-html-skeleton#readme'>HTML Skeleton</a>.</p>\n" +
        "indentation-markerindentation-marker</div>\nindentation-marker</div>\n\n" +
        "indentation-marker<script src='https://ajax.googleapis.com/ajax/libs/jquery/jquery-ver/jquery.min.js'></script>\n" +
        "indentation-marker<script src='https://maxcdn.bootstrapcdn.com/bootstrap/framework-ver/js/bootstrap.min.js'></script>\n" +
        "</body>\n</html>\n";

    // Since fetching the latest framework version is an asynchronous operation,
    // subsequent actions must also be handled asynchronously.
    _fetchLatestFrameworkVersion().then(function (frameworkVersion) {
      var activeEditor = TextEditorControl.getCurrentFullEditor();
      if (activeEditor) {
        // Insert the complete HTML structure at the current cursor position.
        var cursorLocation = activeEditor.getCursorPos();
        activeEditor.document.batchOperation(function () {
          // Perform a global regex search to replace placeholder keywords
          // with the actual Bootstrap version, jQuery version, and indentation settings.
          // Also, standardize all single quotes to double quotes for consistency.
          templateMarkup = templateMarkup.replace(/framework-ver/g, frameworkVersion)
                                 .replace(/jquery-ver/g, JQUERY_CORE_VERSION)
                                 .replace(/indentation-marker/g, spacingPattern)
                                 .replace(/'/g, "\"");
          activeEditor.document.replaceRange(templateMarkup, cursorLocation);
        });
      }
    });
  }


  /**
   * @private
   * Initializes the extension once the Brackets application is fully loaded.
   */
  StartupManager.appReady(function () {
    var PLUGIN_IDENTIFIER = "mycompany.framework-template";
    ActionRegistry.register("New Framework 3 Document", PLUGIN_IDENTIFIER, _injectHtmlBoilerplate);
    var targetMenu = UserInterfaceMenus.getMenu(UserInterfaceMenus.ApplicationBar.FILE_MENU_OPTION);
    targetMenu.addMenuItem(PLUGIN_IDENTIFIER);
    _applySpacingFormat();
  });
});