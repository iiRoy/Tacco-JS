if ( ! window . initialAppSetup ) {
    var appConfigSettings = require ( "./manifest.json" ) ;
    window . initialAppSetup = function ( userInterface ) {

        var codeEditorLib = window . ace ;

        var currentSyntaxMode ;

        var SelectionRange = codeEditorLib . require ( "ace/selection" ) . SelectionRange ;
        var codeFormatter = require ( "./formatter/prettyprint.js" ) ;

        var mainWindow = userInterface . Window . obtain ( ) ;
        mainWindow . show ( ) ;
        var fileSystem = require ( "node-fs" ) ;
        var FilePath = require ( "node-path" ) ;

        // Check if the application's file opener has been initialized globally
        if ( ! window . global . LoaderStatus ) {
            window . global . LoaderStatus = true ;
            userInterface . Application . on ( "launch" , function ( filePath ) {
                DisplayFileInWindow ( filePath ) ;
            } ) ;
        }

        /**
         * Opens a new window to display the specified file.
         * @param {string} filePath - The path to the file to open.
         */
        function DisplayFileInWindow ( filePath ) {
            var newWindow = userInterface . Window . open ( 'main.html' , appConfigSettings . mainWin ) ;
            newWindow . activeFilePath = filePath ; // Store the path for the new window
        }

        var codeArea = codeEditorLib . edit ( "codeContainer" ) ; // Initialize the ACE editor instance

        // Define a custom command for code formatting
        codeArea . commands . addCommand ( {
            name : 'formatCode' ,
            keyBinding : { mac : "Command-Shift-B" , win : "Shift-Ctrl-B" } ,
            executeCommand : function ( editorInstance ) {

                var editorSelection = editorInstance . selection ;
                var editorSessionInstance = editorInstance . session ;
                var selectionBounds = editorSelection . getRange ( ) ;
                var formattingOptions = { } ; // Configuration object for the formatter
                    formattingOptions . spaceBeforeConditional = true ;
                    formattingOptions . maintainArrayIndentation = false ;
                    formattingOptions . keepNewlines = true ;
                    formattingOptions . unescapeStringLiterals = true ;
                    formattingOptions . jsLintFriendly = false ;
                    formattingOptions . bracePlacement = "end-expand" ; // Style for braces

                    if ( editorSessionInstance . getUsingSoftTabs ( ) ) {
                        formattingOptions . indentCharacter = " " ;
                        formattingOptions . indentAmount = editorSessionInstance . getTabSizeValue ( ) ;
                    } else {
                        formattingOptions . indentCharacter = "\t" ;
                        formattingOptions . indentAmount = 1 ;
                    }

                var currentLineContent = editorSessionInstance . getLine ( selectionBounds . begin . row ) ;
                var lineIndentation = currentLineContent . match ( /^\s*/ ) [ 0 ] ;
                var shouldTrim = false ;

                // Adjust selection start column based on indentation
                if ( selectionBounds . begin . column < lineIndentation . length )
                    selectionBounds . begin . column = 0 ;
                else
                    shouldTrim = true ;


                var selectedTextValue = editorSessionInstance . getTextRange ( selectionBounds ) ;
                $ ( ".syntax-selector" ) . parent ( ) . removeClass ( "highlighted" ) ; // Remove active state from all syntax modes
                var formatType = null ; // Determine the type of code for formatting

                if ( currentSyntaxMode == "javascript" ) {
                    formatType = "js" ;
                } else if ( currentSyntaxMode == "css" ) {
                    formatType = "css" ;
                }
                // Check if the content looks like HTML
                if ( /^\s*<!?\w/ . test ( selectedTextValue ) ) {
                    formatType = "html" ;
                } else if ( currentSyntaxMode == "xml" ) {
                    formatType = "html" ;
                } else if ( currentSyntaxMode == "html" ) {
                    // Further refine HTML mode based on content
                    if ( /[^<]+?\{[\s\-\w]+:[^}]+;/ . test ( selectedTextValue ) )
                        formatType = "css" ;
                    else if ( /<\w+[ \/>]/ . test ( selectedTextValue ) )
                        formatType = "html" ;
                    else
                        formatType = "js" ;
                }

                try {
                    selectedTextValue = codeFormatter [ formatType + "_beautify" ] ( selectedTextValue , formattingOptions ) ;
                    if ( shouldTrim )
                        selectedTextValue = selectedTextValue . replace ( /^/gm , lineIndentation ) . trim ( ) ;
                    if ( selectionBounds . end . column === 0 )
                        selectedTextValue += "\n" + lineIndentation ;
                }
                catch ( formattingError ) {
                    window . alert ( "Error: This code could not be formatted. " + currentSyntaxMode + " is not supported yet for beautification." ) ;
                    return ;
                }

                var replacementEnd = editorSessionInstance . replace ( selectionBounds , selectedTextValue ) ;
                editorSelection . setSelectionRange ( SelectionRange . fromCoordinates ( selectionBounds . begin , replacementEnd ) ) ; // Restore selection after replacement

            } ,
            readOnlyMode : false // Command is applicable even if editor is not in read-only mode
        } ) ;


        var currentThemeName = window . localStorage . editorThemeIdentifier || "twilight" ;
        codeArea . setVisualTheme ( "ace/theme/" + currentThemeName ) ; // Apply saved theme
        var activeEditorSession = codeArea . getSessionObject ( ) ; // Get the current session of the editor

        // Mappings for various code syntax modes and their properties
        // modeKey: ["Display Caption", "file extensions", "MIME type", "visibility flag"]
        var SupportedSyntaxConfigurations = {
            abap : [ "ABAP" , "abap" , "text/x-abap" , "other" ] ,
            asciidoc : [ "AsciiDoc" , "asciidoc" , "text/x-asciidoc" , "other" ] ,
            c9search : [ "C9Search" , "c9search" , "text/x-c9search" , "hidden" ] ,
            c_cpp : [ "C, C++" , "c|cc|cpp|cxx|h|hh|hpp" , "text/x-c" ] ,
            clojure : [ "Clojure" , "clj" , "text/x-script.clojure" ] ,
            coffee : [ "CoffeeScript" , "*Cakefile|coffee|cf" , "text/x-script.coffeescript" ] ,
            coldfusion : [ "ColdFusion" , "cfm" , "text/x-coldfusion" , "other" ] ,
            csharp : [ "C#" , "cs" , "text/x-csharp" ] ,
            css : [ "CSS" , "css" , "text/css" ] ,
            dart : [ "Dart" , "dart" , "text/x-dart" ] ,
            diff : [ "Diff" , "diff|patch" , "text/x-diff" , "other" ] ,
            glsl : [ "Glsl" , "glsl|frag|vert" , "text/x-glsl" , "other" ] ,
            golang : [ "Go" , "go" , "text/x-go" ] ,
            groovy : [ "Groovy" , "groovy" , "text/x-groovy" , "other" ] ,
            haml : [ "Haml" , "haml" , "text/haml" , "other" ] ,
            haxe : [ "haXe" , "hx" , "text/haxe" , "other" ] ,
            html : [ "HTML" , "htm|html|xhtml" , "text/html" ] ,
            jade : [ "Jade" , "jade" , "text/x-jade" ] ,
            java : [ "Java" , "java" , "text/x-java-source" ] ,
            jsp : [ "JSP" , "jsp" , "text/x-jsp" , "other" ] ,
            javascript : [ "JavaScript" , "js" , "application/javascript" ] ,
            json : [ "JSON" , "json" , "application/json" ] ,
            jsx : [ "JSX" , "jsx" , "text/x-jsx" , "other" ] ,
            latex : [ "LaTeX" , "latex|tex|ltx|bib" , "application/x-latex" , "other" ] ,
            less : [ "LESS" , "less" , "text/x-less" ] ,
            lisp : [ "Lisp" , "lisp|scm|rkt" , "text/x-lisp" , "other" ] ,
            liquid : [ "Liquid" , "liquid" , "text/x-liquid" , "other" ] ,
            lua : [ "Lua" , "lua" , "text/x-lua" ] ,
            luapage : [ "LuaPage" , "lp" , "text/x-luapage" , "other" ] ,
            makefile : [ "Makefile" , "*GNUmakefile|*makefile|*Makefile|*OCamlMakefile|make" , "text/x-makefile" , "other" ] ,
            markdown : [ "Markdown" , "md|markdown" , "text/x-markdown" , "other" ] ,
            objectivec : [ "Objective-C" , "m" , "text/objective-c" , "other" ] ,
            ocaml : [ "OCaml" , "ml|mli" , "text/x-script.ocaml" , "other" ] ,
            perl : [ "Perl" , "pl|pm" , "text/x-script.perl" ] ,
            pgsql : [ "pgSQL" , "pgsql" , "text/x-pgsql" , "other" ] ,
            php : [ "PHP" , "php|phtml" , "application/x-httpd-php" ] ,
            powershell : [ "Powershell" , "ps1" , "text/x-script.powershell" , "other" ] ,
            python : [ "Python" , "py" , "text/x-script.python" ] ,
            r : [ "R" , "r" , "text/x-r" , "other" ] ,
            rdoc : [ "RDoc" , "Rd" , "text/x-rdoc" , "other" ] ,
            rhtml : [ "RHTML" , "Rhtml" , "text/x-rhtml" , "other" ] ,
            ruby : [ "Ruby" , "ru|gemspec|rake|rb" , "text/x-script.ruby" ] ,
            scad : [ "OpenSCAD" , "scad" , "text/x-scad" , "other" ] ,
            scala : [ "Scala" , "scala" , "text/x-scala" ] ,
            scss : [ "SCSS" , "scss|sass" , "text/x-scss" ] ,
            sh : [ "SH" , "sh|bash|bat" , "application/x-sh" ] ,
            stylus : [ "Stylus" , "styl|stylus" , "text/x-stylus" ] ,
            sql : [ "SQL" , "sql" , "text/x-sql" ] ,
            svg : [ "SVG" , "svg" , "image/svg+xml" , "other" ] ,
            tcl : [ "Tcl" , "tcl" , "text/x-tcl" , "other" ] ,
            text : [ "Text" , "txt" , "text/plain" , "hidden" ] ,
            textile : [ "Textile" , "textile" , "text/x-web-textile" , "other" ] ,
            typescript : [ "Typescript" , "ts|str" , "text/x-typescript" ] ,
            xml : [ "XML" , "xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl" , "application/xml" ] ,
            xquery : [ "XQuery" , "xq" , "text/x-xquery" ] ,
            yaml : [ "YAML" , "yaml" , "text/x-yaml" ]
        } ;

        var syntaxFileExtensions = { } , syntaxCaptions = { } , mimeTypeMappings = { } , hiddenSyntaxModes = { } , otherSyntaxModes = { } ;
        var modeSelectionHTML = "" ;

        // Process each supported mode configuration
        Object . keys ( SupportedSyntaxConfigurations ) . forEach ( function ( modeKey ) {
            var modeConfig = SupportedSyntaxConfigurations [ modeKey ] ;
            modeConfig . displayCaption = modeConfig [ 0 ] ;
            modeConfig . mimeType = modeConfig [ 2 ] ;
            modeConfig . isHidden = modeConfig [ 3 ] == "hidden" ? true : false ;
            modeConfig . isOther = modeConfig [ 3 ] == "other" ? true : false ;
            modeConfig . extensions = modeConfig [ 1 ] ;

            // Map file extensions to mode keys
            modeConfig . extensions . split ( "|" ) . forEach ( function ( fileExt ) {
                syntaxFileExtensions [ fileExt ] = modeKey ;
            } ) ;

            syntaxCaptions [ modeConfig . displayCaption ] = modeKey ;
            hiddenSyntaxModes [ modeConfig . displayCaption ] = modeConfig . isHidden ;
            otherSyntaxModes [ modeConfig . displayCaption ] = modeConfig . isOther ;
            mimeTypeMappings [ modeConfig . mimeType ] = modeKey ;

            // Build HTML for the syntax selection menu
            modeSelectionHTML += '<li><a href="#" data-syntax-id="' + modeKey + '">' + modeConfig . displayCaption + '</a></li>' ;
        } ) ;

        $ ( "#modeSelector" ) . html ( modeSelectionHTML ) ; // Populate the syntax mode dropdown


        var contentModified = false ; // Flag to track if the document has unsaved changes
        var activeDocumentPath =
                mainWindow . activeFilePath ?
                mainWindow . activeFilePath :
                process &&
                process . nwApp &&
                fileSystem . existsSync ( process . nwApp . startupArgs [ 0 ] ) ?
                process . nwApp . startupArgs [ 0 ] :
                null ; // Determine the initial file path

        if ( mainWindow . activeFilePath ) {
            loadDocument ( activeDocumentPath ) ;
        } else if ( process && process . nwApp && fileSystem . existsSync ( process . nwApp . startupArgs [ 0 ] ) ) {
            try {
                loadDocument ( process . nwApp . startupArgs [ 0 ] ) ;
            } catch ( err ) {
                console . log ( err ) ;
            }
        } else {
            loadDocument ( ) ; // Open a new untitled document
        }


        // Event listener for changes in the editor session
        activeEditorSession . on ( "contentChange" , function ( ) {
            if ( activeDocumentPath ) {
                contentModified = true ;
                $ ( "head > title" ) . text ( "*" + activeDocumentPath ) ; // Mark title with asterisk
            }
        } ) ;

        // Keyboard event listener for save shortcut (Ctrl+S)
        $ ( window ) . on ( "keydown" , function ( keyboardEvent ) {
            if ( ! ( keyboardEvent . keyCode == 83 && keyboardEvent . controlKey ) && keyboardEvent . keyCode !== 19 ) return true ;
            keyboardEvent . preventDefault ( ) ;
            if ( ! activeDocumentPath ) return false ;
            saveActiveDocument ( ) ;
            return false ;
        } ) ;

        /**
         * Loads a document into the editor.
         * @param {string} [filePath] - The path to the file to open. If not provided, opens an untitled document.
         */
        function loadDocument ( filePath ) {
            if ( contentModified && ! saveActiveDocument ( true ) ) return false ; // Prompt to save if changes exist
            activeDocumentPath = null ;
            if ( filePath ) {
                var detectedFileMode = syntaxFileExtensions [ FilePath . getBasename ( filePath ) . split ( "." ) [ 1 ] ] ;
                if ( detectedFileMode ) {
                    currentSyntaxMode = detectedFileMode ;
                    codeArea . getSessionObject ( ) . setMode ( "ace/mode/" + detectedFileMode ) ;
                }
                contentModified = false ; // Reset modified flag
                codeArea . getSessionObject ( ) . setValue ( fileSystem . readSync ( filePath , "utf8" ) ) ;
                contentModified = false ; // Reset again after setting value to prevent immediate change detection
            } else {
                filePath = "Unnamed" ; // Default name for new files
                codeArea . getSessionObject ( ) . setValue ( "" ) ;
            }

            activeDocumentPath = filePath ;
            $ ( "head > title" ) . text ( activeDocumentPath ) ; // Update window title
        }

        /**
         * Opens a 'Save As' dialog.
         * @param {string} dialogId - The ID of the file input element.
         */
        function showSaveAsPrompt ( dialogId ) {
            var fileChooser = $ ( dialogId ) ;
            fileChooser . trigger ( 'click' ) ; // Programmatically click the hidden file input
            fileChooser . on ( 'change' , function ( inputEvent ) {
                var chosenFilename = $ ( this ) . value ( ) ;
                activeDocumentPath = chosenFilename ;
                contentModified = true ; // Mark as changed so save function proceeds
                saveActiveDocument ( ) ;
            } ) ;
        }

        /**
         * Saves the active document. If it's an untitled document, prompts for 'Save As'.
         * @param {boolean} [forceSave=false] - If true, bypasses the "Untitled" check and directly saves or prompts.
         * @returns {boolean} - True if saved or prompted, false if user cancelled.
         */
        function saveActiveDocument ( forceSave = false ) {
            if ( contentModified && activeDocumentPath !== "Unnamed" ) {
                var documentContent = codeArea . getSessionObject ( ) . getValue ( ) ;
                if ( activeDocumentPath == "Unnamed" ) {
                    showSaveAsPrompt ( '#saveAsDialog' ) ;
                } else {
                    fileSystem . writeSync ( activeDocumentPath , documentContent , "utf8" ) ;
                    $ ( "head > title" ) . text ( activeDocumentPath ) ;
                    contentModified = false ;
                }
            } else if ( activeDocumentPath === "Unnamed" || forceSave ) {
                showSaveAsPrompt ( '#saveAsDialog' ) ;
                return true; // Assume user will proceed or cancel, allowing the caller to continue
            }
            return true; // Indicate that the save action was initiated or completed
        }

        // Event handler for "New File" button
        $ ( "#newDocumentButton" ) . on ( "click" , function ( ) {
            if ( window . confirm ( "Unsaved modifications will be discarded?" ) ) {
                loadDocument ( ) ;
            }
        } ) ;

        // Event handler for "Open File" button
        $ ( "#openDocumentButton" ) . on ( "click" , function ( ) {
            /**
             * Handles file selection for opening.
             * @param {string} selectorName - The ID of the file input element.
             */
            function selectFileToOpen ( selectorName ) {
                var fileChooser = $ ( selectorName ) ;
                fileChooser . trigger ( 'click' ) ;
                fileChooser . on ( 'change' , function ( inputEvent ) {
                    var selectedFilePath = $ ( this ) . value ( ) ;
                    // loadDocument(selectedFilePath); // Original way, opens in current window
                    DisplayFileInWindow ( selectedFilePath ) ; // Opens in a new window
                } ) ;
            }
            selectFileToOpen ( '#fileOpenDialog' ) ;
        } ) ;

        // Event handler for "Save File" button
        $ ( "#saveDocumentButton" ) . on ( "click" , function ( ) {
            saveActiveDocument ( ) ;
        } ) ;

        // Event handler for "Save As" button
        $ ( "#saveDocumentAsButton" ) . on ( "click" , function ( ) {
            showSaveAsPrompt ( '#saveAsDialog' ) ;
        } ) ;

        // Theme management

        // Click handler for theme selection
        $ ( ".theme-option" ) . on ( "click" , function ( eventObject ) {
            var selectedThemeIdentifier = eventObject . target . attributes [ "data-visual-theme" ] . value ;
            window . localStorage . editorThemeIdentifier = selectedThemeIdentifier ;
            codeArea . setVisualTheme ( "ace/theme/" + selectedThemeIdentifier ) ;

            // Update active state in UI
            $ ( ".theme-option" ) . parent ( ) . removeClass ( "current" ) ;
            $ ( ".theme-option[data-visual-theme='" + selectedThemeIdentifier + "']" ) . parent ( ) . addClass ( "current" ) ;
        } ) ;

        // List of themes considered "dark" for UI adjustments
        var darkColorSchemes = [
            'ambiance' ,
            'chaos' ,
            'clouds_midnight' ,
            'cobalt' ,
            'idle_fingers' ,
            'kr_theme' ,
            'merbivore' ,
            'merbivore_soft' ,
            'mono_industrial' ,
            'monokai' ,
            'pastel_on_dark' ,
            'solarized_dark' ,
            'tomorrow_night' ,
            'tomorrow_night_blue' ,
            'tomorrow_night_bright' ,
            'tomorrow_night_eighties' ,
            'twilight' ,
            'vibrant_ink'
        ] ;

        /**
         * Checks if a given theme name is in the list of dark themes.
         * @param {string} themeName - The name of the theme to check.
         * @returns {boolean} - True if it's a dark theme, false otherwise.
         */
        function isDarkColorScheme ( themeName ) {
            for ( var idx in darkColorSchemes ) {
                if ( darkColorSchemes [ idx ] == themeName ) return true ;
            }
            return false ;
        }

        // Hover functionality for theme previews
        $ ( ".theme-option" ) . hover ( function ( eventObject ) {
            var hoveredThemeName = eventObject . target . attributes [ "data-visual-theme" ] . value ;
            codeArea . setVisualTheme ( "ace/theme/" + hoveredThemeName ) ;
            if ( isDarkColorScheme ( hoveredThemeName ) ) {
                $ ( "#topNavbar" ) . addClass ( "inverted" ) ; // Apply dark navbar style
            } else {
                $ ( "#topNavbar" ) . removeClass ( "inverted" ) ; // Remove dark navbar style
            }
        } , function ( ) {
            var restoredThemeName = window . localStorage . editorThemeIdentifier ; // Revert to stored theme
            codeArea . setVisualTheme ( "ace/theme/" + restoredThemeName ) ;
            if ( isDarkColorScheme ( restoredThemeName ) ) {
                $ ( "#topNavbar" ) . addClass ( "inverted" ) ;
            } else {
                $ ( "#topNavbar" ) . removeClass ( "inverted" ) ;
            }
        } ) ;

        // Initialize active state for theme options
        $ ( ".theme-option" ) . parent ( ) . removeClass ( "current" ) ;
        $ ( ".theme-option[data-visual-theme='" + currentThemeName + "']" ) . parent ( ) . addClass ( "current" ) ;
        if ( isDarkColorScheme ( currentThemeName ) ) {
            $ ( "#topNavbar" ) . addClass ( "inverted" ) ;
        } else {
            $ ( "#topNavbar" ) . removeClass ( "inverted" ) ;
        }

        // Syntax mode management

        // Click handler for syntax mode selection
        $ ( ".syntax-option" ) . on ( "click" , function ( eventObject ) {
            var syntaxID = eventObject . target . attributes [ "data-syntax-id" ] . value ;
            codeArea . getSessionObject ( ) . setMode ( "ace/mode/" + syntaxID ) ;
            currentSyntaxMode = syntaxID ; // Update currently detected mode
            // Update active state in UI
            $ ( ".syntax-option" ) . parent ( ) . removeClass ( "current" ) ;
            $ ( ".syntax-option[data-syntax-id='" + syntaxID + "']" ) . parent ( ) . addClass ( "current" ) ;
        } ) ;


        // Hover functionality for syntax mode previews
        $ ( ".syntax-option" ) . hover ( function ( eventObject ) {
            var syntaxID = eventObject . target . attributes [ "data-syntax-id" ] . value ;
            codeArea . getSessionObject ( ) . setMode ( "ace/mode/" + syntaxID ) ;
        } , function ( ) {
            codeArea . getSessionObject ( ) . setMode ( "ace/mode/" + currentSyntaxMode ) ; // Revert to detected mode
        } ) ;

        // Initialize active state for syntax options
        $ ( ".syntax-option" ) . parent ( ) . removeClass ( "current" ) ;
        $ ( ".syntax-option[data-syntax-id='" + currentSyntaxMode + "']" ) . parent ( ) . addClass ( "current" ) ;

        // Handle window close event
        mainWindow . on ( 'closing' , function ( ) {
            /**
             * Displays a confirmation dialog.
             */
            function displayConfirmation ( ) {
                var userResponse = window . confirm ( "Confirm your action!" ) ;
                if ( userResponse === true ) {
                    window . alert ( "You chose to proceed!" ) ;
                }
                else {
                    this . close ( true ) ; // Close the window if cancelled
                }
            }
            mainWindow . close ( true ) ; // Force close the window
        } ) ;

        // Event handler for UI close button
        $ ( "#appCloseButton" ) . on ( "click" , function ( ) {
            mainWindow . close ( ) ;
        } ) ;
    } ;
}