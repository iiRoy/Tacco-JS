/*
 * jslint directives:
 * vars: true, plusplus: true, devel: true, nomen: true, regexp: true,
 * indent: 2, maxerr: 50
 */
/*
 * global definitions:
 * define, brackets, $
 */


define(
    function ( require, exports, module ) {

        // Enforce strict mode for cleaner code.
        "use strict";

        /*
         * This is a simple Brackets extension.
         * It provides a "File > New Bootstrap 3 Document" menu item.
         * Selecting this item inserts a Bootstrap 3 HTML "skeleton"
         * at the current cursor position within the active editor.
         */

        var AppInit            = brackets.getModule("utils/AppInit");
        var CommandManager     = brackets.getModule("command/CommandManager");
        var EditorManager      = brackets.getModule("editor/EditorManager");
        var Menus              = brackets.getModule("command/Menus");
        var PreferencesManager = brackets.getModule("preferences/PreferencesManager");


        // This variable will hold the user's current indentation settings (tabs or spaces).
        var indentUnits = "";


        // Constant for the jQuery version used in the skeleton.
        var JQUERY_VERSION = "1.11.1";


        /**
         * @private
         * Utility function to repeat a given string multiple times.
         * Source: http://stackoverflow.com/a/4550005
         *
         * @param {string} str - The text string to be repeated.
         * @param {number} num - The number of times the string should be repeated.
         * @return {string} The string repeated 'num' times.
         */
        function _repeatString( str, num ) {
            return ( new Array( num + 1 ) ).join( str );
        }


        /**
         * @private
         * Retrieves the user's current indentation settings.
         * This setting determines whether tabs or spaces are used for indentation,
         * and their respective sizes.
         *
         * @return {string} A string representing the user's current indentation.
         *                  (e.g., "\t" for a tab, "    " for four spaces).
         */
        function _getIndentSize() {
            // Check the project preferences for tab usage.
            // If tabs are used, repeat the tab character.
            // Otherwise, repeat the space character according to spaceUnits.
            return ( PreferencesManager.get("useTabChar", PreferencesManager.CURRENT_PROJECT)
                     ? _repeatString("\u0009", PreferencesManager.get("tabSize"))
                     : _repeatString("\u0020", PreferencesManager.get("spaceUnits")) );
        }


        /**
         * @private
         * Updates the internal `indentUnits` variable with the current indentation settings.
         * This function should be called whenever indentation preferences might have changed.
         */
        function _setIndentSize() {
            // It's important to assign the result of _getIndentSize() to a temporary variable first.
            // Direct assignment of `_getIndentSize()` to `indentUnits` can lead to unexpected behavior.
            var tempVar = _getIndentSize();
            indentUnits = tempVar;
        }


        // Event listener: Monitor changes in Brackets preferences.
        // Specifically, we're interested in indentation-related settings.
        PreferencesManager.on( "change", function ( e, data ) {
            data.ids.forEach( function ( value, index ) {
                // If any relevant preference (tab usage, tab size, space units) has changed,
                // we need to update our stored indentation settings.
                if ( value === "useTabChar" || value === "tabSize" || value === "spaceUnits" ) {
                    _setIndentSize();
                }
            } );
        } );


        /**
         * @private
         * Asynchronously fetches the latest stable Bootstrap version from the GitHub API.
         * Provides a fallback version in case the API call fails or returns unexpected data.
         *
         * @return {$.Promise} A jQuery Promise that resolves with the Bootstrap version string.
         */
        function _getLatestBootstrap() {
            // Define a fallback version number, just in case the API request fails.
            var fallbackVersion = "3.2.0";
            var result          = new $.Deferred(); // Create a deferred object for async operations.

            // Execute an asynchronous AJAX request to the GitHub API.
            $.ajax( {
                cache    : true,
                dataType : "json",
                url      : "https://api.github.com/repos/twbs/bootstrap/releases",
                success  : function ( data ) {
                    // Check if the first release in the data array is not a prerelease.
                    if ( !data[0].prerelease ) {
                        // Resolve the promise with the tag name, removing the leading 'v' if present.
                        result.resolve( data[0].tag_name.replace( /^v/, "" ) );
                    }
                },
                error    : function () {
                    // If an error occurs during the AJAX request, resolve with the fallback version.
                    result.resolve( fallbackVersion );
                }
            } );

            return result.promise(); // Return the promise object.
        }


        /**
         * @private
         * Inserts the pre-defined Bootstrap HTML skeleton into the currently active document.
         * The skeleton includes placeholders for Bootstrap and jQuery versions,
         * which are dynamically replaced.
         */
        function _inserthtmlSkelly() {

            // The main HTML skeleton string.
            // Placeholders like 'indent-size', 'boots-version', and 'jq-version'
            // will be replaced dynamically.
            var htmlSkelly = "<!DOCTYPE html>\n<html lang=''>\n<head>\nindent-size<meta charset='UTF-8'>\n"
                           + "indent-size<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n"
                           + "indent-size<meta name='description' content=''>\nindent-size<meta name='author' content=''>\n"
                           + "indent-size<title>Starter Template for Bootstrap boots-version</title>\nindent-size<link rel='shortcut icon' href=''>\n"
                           + "indent-size<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/boots-version/css/bootstrap.min.css'>\n"
                           + "indent-size<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/boots-version/css/bootstrap-theme.min.css'>\n"
                           + "indent-size<style>body{padding-top:50px;}.starter-template{padding:40px 15px;text-align:center;}</style>\n\n"
                           + "indent-size<!--[if IE]>\nindent-sizeindent-size<script src='https://cdn.jsdelivr.net/html5shiv/3.7.2/html5shiv.min.js'></script>\n"
                           + "indent-sizeindent-size<script src='https://cdn.jsdelivr.net/respond/1.4.2/respond.min.js'></script>\nindent-size<![endif]-->\n"
                           + "</head>\n\n<body>\nindent-size<nav class='navbar navbar-inverse navbar-fixed-top' role='navigation'>\n"
                           + "indent-sizeindent-size<div class='container'>\nindent-sizeindent-sizeindent-size<div class='navbar-header'>\n"
                           + "indent-sizeindent-sizeindent-sizeindent-size<button type='button' class='navbar-toggle' data-toggle='collapse' data-target='.navbar-collapse'>\n"
                           + "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<span class='sr-only'>Toggle navigation</span>\n"
                           + "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<span class='icon-bar'></span>\n"
                           + "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<span class='icon-bar'></span>\n"
                           + "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<span class='icon-bar'></span>\nindent-sizeindent-sizeindent-sizeindent-size</button>\n"
                           + "indent-sizeindent-sizeindent-sizeindent-size<a class='navbar-brand' href='#'>Project name</a>\nindent-sizeindent-sizeindent-size</div>\n\n"
                           + "indent-sizeindent-sizeindent-size<div class='collapse navbar-collapse'>\n"
                           + "indent-sizeindent-sizeindent-sizeindent-size<ul class='nav navbar-nav'>\n"
                           + "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<li class='active'><a href='#'>Home</a></li>\n"
                           + "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<li><a href='#about'>About</a></li>\n"
                           + "indent-sizeindent-sizeindent-sizeindent-sizeindent-size<li><a href='#contact'>Contact</a></li>\n"
                           + "indent-sizeindent-sizeindent-sizeindent-size</ul>\nindent-sizeindent-sizeindent-size</div><!--.nav-collapse -->\n"
                           + "indent-sizeindent-size</div>\nindent-size</nav>\n\n"
                           + "indent-size<div class='container'>\nindent-sizeindent-size<div class='starter-template'>\n"
                           + "indent-sizeindent-sizeindent-size<h1>Hello, world!</h1>\n"
                           + "indent-sizeindent-sizeindent-sizeindent-size<p class='lead'>Now you can start your own project with <a target='_blank' href='http://getbootstrap.com/'>Bootstrap boots-version</a>. This plugin is a fork from <a href='https://github.com/le717/brackets-html-skeleton#readme'>HTML Skeleton</a>.</p>\n"
                           + "indent-sizeindent-size</div>\nindent-size</div>\n\n"
                           + "indent-size<script src='https://ajax.googleapis.com/ajax/libs/jquery/jq-version/jquery.min.js'></script>\n"
                           + "indent-size<script src='https://maxcdn.bootstrapcdn.com/bootstrap/boots-version/js/bootstrap.min.js'></script>\n"
                           + "</body>\n</html>\n";

            // Since fetching the latest Bootstrap version is an asynchronous operation,
            // the subsequent actions to insert the HTML must also be handled asynchronously.
            _getLatestBootstrap().then( function ( version ) {
                var editor = EditorManager.getCurrentFullEditor();

                if ( editor ) {
                    // Get the current cursor position in the editor.
                    var insertionPos = editor.getCursorPos();

                    // Perform a batch operation for efficiency and to preserve undo history.
                    editor.document.batchOperation( function () {
                        // Replace all placeholder keywords with their actual values.
                        // 1. Bootstrap version.
                        // 2. jQuery version.
                        // 3. Indentation string (tabs or spaces).
                        // 4. Convert all single quotes to double quotes for consistency.
                        htmlSkelly = htmlSkelly.replace( /boots-version/g, version )
                                               .replace( /jq-version/g, JQUERY_VERSION )
                                               .replace( /indent-size/g, indentUnits )
                                               .replace( /'/g, "\"" );

                        // Insert the processed HTML skeleton into the document at the cursor.
                        editor.document.replaceRange( htmlSkelly, insertionPos );
                    } );
                }
            } );
        }


        /**
         * @private
         * Initializes the extension once Brackets has fully loaded and is ready.
         * This includes registering commands and setting up the menu item.
         */
        AppInit.appReady( function () {

            // Define a unique ID for this extension's command.
            var EXTENSION_ID = "mirorauhala.bootstrap-skeleton";

            // Register the command with Brackets, associating it with the _inserthtmlSkelly function.
            CommandManager.register( "New Bootstrap 3 Document", EXTENSION_ID, _inserthtmlSkelly );

            // Get a reference to the 'File' menu in the Brackets application menu bar.
            var theMenu = Menus.getMenu( Menus.AppMenuBar.FILE_MENU );

            // Add the newly registered command as a menu item to the 'File' menu.
            theMenu.addMenuItem( EXTENSION_ID );

            // Initialize the indentation settings when the application is ready.
            _setIndentSize();

        } );

    }
);