if ( ! window.appLoad ) { // Check if the application has already been loaded once.

 // Require the application configuration from a local JSON file.
 var appconfig = require ( "./package.json" ) ;

 window.appLoad = function ( gui ) { // This function serves as the main entry point for the application logic.

  // Obtain core ACE Editor objects and necessary utility modules.
  var ace = window . ace ; // Reference to the global ACE editor object.
  var detectedMode ; // A variable to hold the currently identified syntax highlighting mode.

  var Range = ace . require ( "ace/range" ) . Range ; // Import the Range object for text selections.
  var jsbeautify = require ( "./jsbeautify/jsbeautify.js" ) ; // Load the JavaScript beautifier library.

  // Initialize and display the application window using NW.js GUI.
  var win = gui . Window . get ( ) ; // Get a reference to the current application window.
  win . show ( ) ; // Make sure the window is visible to the user.

  // Load Node.js modules for file system operations and path manipulation.
  var fs = require ( "fs" ) ; // File system module for reading/writing files.
  var Path = require ( "path" ) ; // Path module for handling file paths.

  // Set up a global event listener for opening files, but only once.
  if ( ! window . global . OpenerLoaded ) {
   window . global . OpenerLoaded = true ; // Mark the opener as loaded to prevent duplicate event handlers.
   gui . App . on ( "open" , function ( filename ) {
    // When a file is opened (e.g., via drag-and-drop or command line), open it in a new window.
    OpenFileWindow ( filename ) ;
   } ) ;
  }

  // Function to create and open a new window for a specified file.
  function OpenFileWindow ( filename ) {
   var win = gui . Window . open ( 'index.html' , appconfig . window ) ; // Create a new NW.js window.
   win . currentFile = filename ; // Assign the filename to the new window's properties.
  }

  // Initialize the ACE editor instance, linking it to the HTML element.
  var editor = ace . edit ( "editor" ) ; // Create an ACE editor control attached to the element with ID "editor".

  // Define and register a custom 'beautify' command within the editor.
  editor . commands . addCommand ( {
   name : 'beautify' , // The name of the command.
   bindKey : { mac : "Command-Shift-B" , win : "Shift-Ctrl-B" } , // Keyboard shortcuts for different OS.
   exec : function ( editor ) { // The function that executes when the command is triggered.

    var sel = editor . selection ; // Get the current text selection object.
    var session = editor . session ; // Get the current editor session.
    var range = sel . getRange ( ) ; // Retrieve the selected text range.

    // Configure options for the beautifier library.
    var options = { } ;
    options . space_before_conditional = true ; // Add space before 'if', 'for', 'while' conditions.
    options . keep_array_indentation = false ; // Do not preserve original array indentation.
    options . preserve_newlines = true ; // Keep existing newlines.
    options . unescape_strings = true ; // Convert escaped characters in strings back to their original form.
    options . jslint_happy = false ; // Do not force JSLint-friendly formatting.
    options . brace_style = "end-expand" ; // Set the brace style (e.g., `if (condition) { ... }`).

    // Dynamically set indentation based on editor's current settings (soft tabs vs. hard tabs).
    if ( session . getUseSoftTabs ( ) ) {
     options . indent_char = " " ; // Use space as the indentation character.
     options . indent_size = session . getTabSize ( ) ; // Use the editor's configured tab size.
    } else {
     options . indent_char = "\t" ; // Use tab as the indentation character.
     options . indent_size = 1 ; // A tab character counts as 1 unit of indentation.
    }

    var line = session . getLine ( range . start . row ) ; // Get the text content of the line where the selection begins.
    var indent = line . match ( /^\s*/ ) [ 0 ] ; // Extract any leading whitespace from that line.
    var trim = false ; // A flag to indicate if extra trimming is required.

    // Adjust the selection range if it starts within existing indentation.
    if ( range . start . column < indent . length ) {
     range . start . column = 0 ; // Expand selection to the beginning of the line.
    } else {
     trim = true ; // Mark for trimming, as selection starts after initial indent.
    }

    var value = session . getTextRange ( range ) ; // Retrieve the actual text content from the determined range.
    $ ( "[data-mode]" ) . parent ( ) . removeClass ( "active" ) ; // Remove 'active' styling from all mode buttons.
    // var syntax = session.syntax; // This line was commented out in the original source, keeping it as-is.
    var type = null ; // Variable to store the detected language type for beautification.

    // Logic to infer the type of code (JS, CSS, HTML) for correct beautifier application.
    if ( detectedMode == "javascript" ) {
     type = "js" ;
    } else if ( detectedMode == "css" ) {
     type = "css" ;
    }
    if ( /^\s*<!?\w/ . test ( value ) ) { // Check for HTML-like start tags.
     type = "html" ;
    } else if ( detectedMode == "xml" ) {
     type = "html" ; // Treat XML as HTML for beautification purposes.
    } else if ( detectedMode == "html" ) {
     // If the overall mode is HTML, further inspect content to differentiate embedded CSS/JS.
     if ( /[^<]+?\{[\s\-\w]+:[^}]+;/ . test ( value ) ) { // Looks like CSS rules.
      type = "css" ;
     } else if ( /<\w+[ \/>]/ . test ( value ) ) { // Looks like HTML tags.
      type = "html" ;
     } else {
      type = "js" ; // Default to JavaScript if no strong HTML/CSS patterns are found within HTML context.
     }
    }

    // Execute the beautification process and handle any potential errors.
    try {
     value = jsbeautify [ type + "_beautify" ] ( value , options ) ; // Call the specific beautifier function.
     if ( trim ) {
      value = value . replace ( /^/gm , indent ) . trim ( ) ; // Reapply original indentation after beautification.
     }
     if ( range . end . column === 0 ) {
      value += "\n" + indent ; // Add a newline and indentation if selection ended at start of line.
     }
    }
    catch ( e ) {
     window . alert ( "Error: This code could not be beautified " + syntax + " is not supported yet" ) ; // Inform user of error.
     return ; // Exit the function gracefully.
    }

    var end = session . replace ( range , value ) ; // Replace the original text with the beautified version.
    sel . setSelectionRange ( Range . fromPoints ( range . start , end ) ) ; // Update the selection to cover the newly beautified text.

   } , // End of 'exec' function definition.
   readOnly : false // This command should be executable even when the editor is not in read-only mode.
  } ) ;


  // Theme management.
  var theme = window . localStorage . aceTheme || "twilight" ; // Retrieve theme from local storage, default to 'twilight'.
  editor . setTheme ( "ace/theme/" + theme ) ; // Apply the determined theme to the ACE editor.
  var editorSession = editor . getSession ( ) ; // Get the current editor session for further operations.

  // Definition of all supported syntax highlighting modes.
  // Each entry is an array: [ "Menu Caption" , "File Extensions" , "Content-Type" , "Category (hidden|other)" ].
  var SupportedModes = {
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

  // Initialize various lookup objects and an HTML string for the syntax menu.
  var fileExtensions = { } , ModesCaption = { } , contentTypes = { } , hiddenMode = { } , otherMode = { } ;
  var syntaxMenuHtml = "" ;

  // Process the SupportedModes object to populate lookup maps and build the syntax menu HTML.
  Object . keys ( SupportedModes ) . forEach ( function ( name ) {
   var mode = SupportedModes [ name ] ; // Get the array defining the current mode.
   mode . caption = mode [ 0 ] ; // Assign the user-friendly caption.
   mode . mime = mode [ 2 ] ; // Assign the MIME type.
   mode . hidden = mode [ 3 ] == "hidden" ? true : false ; // Determine if the mode should be hidden in menus.
   mode . other = mode [ 3 ] == "other" ? true : false ; // Determine if the mode is categorized as 'other'.
   mode . ext = mode [ 1 ] ; // Assign the string of file extensions.

   mode . ext . split ( "|" ) . forEach ( function ( ext ) {
    fileExtensions [ ext ] = name ; // Map each file extension to its corresponding mode name.
   } ) ;

   ModesCaption [ mode . caption ] = name ; // Map caption to mode name.
   hiddenMode [ mode . caption ] = mode . hidden ; // Map caption to hidden status.
   otherMode [ mode . caption ] = mode . other ; // Map caption to 'other' status.
   contentTypes [ mode . mime ] = name ; // Map MIME type to mode name.

   syntaxMenuHtml += '<li><a href="#" data-mode="' + name + '">' + mode . caption + '</a></li>' ; // Append HTML for a menu item.
  } ) ;

  // Insert the generated syntax menu HTML into the DOM.
  $ ( "#syntaxMenu" ) . html ( syntaxMenuHtml ) ;


  var hasChanged = false ; // A boolean flag indicating if the current file has unsaved modifications.

  // Determine the current file path based on several possible sources (NW.js window property, command line argument).
  var currentFile =
   win . currentFile ? // First, check if the window itself has a 'currentFile' property.
   win . currentFile :
   process && // If not, check for the Node.js 'process' object (indicates NW.js environment).
   process . _nw_app && // And check for the NW.js application object.
   fs . existsSync ( process . _nw_app . argv [ 0 ] ) ? // Then, check if the first command line argument is an existing file.
   process . _nw_app . argv [ 0 ] : // Use the command line argument as the file path.
   null ; // If no file path is found, set it to null.

  // Initial file loading logic when the application starts.
  if ( win . currentFile ) {
   openFile ( currentFile ) ; // If a file is associated with the window, open it.
  } else if ( process && process . _nw_app && fs . existsSync ( process . _nw_app . argv [ 0 ] ) ) {
   try {
    openFile ( process . _nw_app . argv [ 0 ] ) ; // Attempt to open the file specified in command line arguments.
   }
   catch ( e ) {
    console . log ( e ) ; // Log any errors encountered during file opening.
   }
  } else {
   openFile ( ) ; // If no specific file is provided, open an empty, untitled document.
  }


  // Event listener for changes within the editor session.
  editorSession . on ( "change" , function ( ) {
   if ( currentFile ) {
    hasChanged = true ; // Set the 'hasChanged' flag to true.
    $ ( "title" ) . text ( "*" + currentFile ) ; // Prepend an asterisk to the window title to indicate unsaved changes.
   }
  } ) ;

  // Global keypress handler to intercept Ctrl+S (or Cmd+S on Mac) for saving.
  $ ( window ) . keypress ( function ( event ) {
   // Check if the key combination is Ctrl+S (Windows) or Cmd+S (Mac).
   if ( ! ( ( event . which == 115 && event . ctrlKey ) || event . which == 19 ) ) {
    return true ; // If not a save shortcut, allow the event to propagate normally.
   }
   event . preventDefault ( ) ; // Prevent the browser's default save action.
   if ( ! currentFile ) {
    return false ; // If there's no current file, saving is not possible.
   }
   saveFileFN ( ) ; // Call the file saving function.
   return false ; // Prevent further default actions or bubbling.
  } ) ;

  // Function responsible for opening a file and loading its content into the editor.
  function openFile ( path ) {
   // If there are unsaved changes and the user cancels saving, abort opening the new file.
   if ( hasChanged && ! saveFileFN ( true ) ) {
    return false ;
   }
   currentFile = null ; // Temporarily clear the current file path.

   if ( path ) {
    // If a file path is provided:
    var fileMode = fileExtensions [ Path . basename ( path ) . split ( "." ) [ 1 ] ] ; // Determine the syntax mode by file extension.
    if ( fileMode ) {
     detectedMode = fileMode ; // Update the detected mode.
     editor . getSession ( ) . setMode ( "ace/mode/" + fileMode ) ; // Apply the determined syntax highlighting mode.
    }
    hasChanged = false ; // Reset the change flag before loading new content.
    editor . getSession ( ) . setValue ( fs . readFileSync ( path , "utf8" ) ) ; // Read file content and set it in the editor.
    hasChanged = false ; // Reset the change flag again after setting content.
   } else {
    // If no path is provided, treat it as a new, untitled file.
    path = "Untitled" ; // Set the file name to "Untitled".
    editor . getSession ( ) . setValue ( "" ) ; // Clear the editor's content.
   }

   currentFile = path ; // Update the application's current file path.
   $ ( "title" ) . text ( currentFile ) ; // Update the window's title bar.
  }

  // Function to trigger a "Save As" file dialog.
  function saveasDialog ( name ) {
   var chooser = $ ( name ) ; // Get the hidden file input element (used for triggering file dialog).
   chooser . trigger ( 'click' ) ; // Programmatically click the input to open the native file dialog.
   chooser . change ( function ( evt ) {
    // Event listener for when a file is selected in the "Save As" dialog.
    var saveFilename = $ ( this ) . val ( ) ; // Get the chosen file path.
    currentFile = saveFilename ; // Update the current file path to the new name.
    hasChanged = true ; // Mark as changed, as it's a new save location.
    saveFileFN ( ) ; // Proceed to save the file.
   } ) ;
  }

  // Function to save the current file, prompting for "Save As" if it's untitled.
  function saveFileFN ( ) {
   if ( currentFile !== "Untitled" ) { // If the file has a real name (not "Untitled").
    var data = editor . getSession ( ) . getValue ( ) ; // Get the current content from the editor.
    // .replace(/\n/g,"\r\n"); // Original commented-out line, kept as-is.
    if ( currentFile == "Untitled" ) {
     saveasDialog ( '#saveasDialog' ) ; // If it's still "Untitled" at this point, force a "Save As".
    } else {
     fs . writeFileSync ( currentFile , data , "utf8" ) ; // Write the content to the file system.
     $ ( "title" ) . text ( currentFile ) ; // Update the window title.
     hasChanged = false ; // Reset the 'hasChanged' flag.
    }
   } else {
    saveasDialog ( '#saveasDialog' ) ; // If the file is "Untitled", always prompt for "Save As".
   }
  }

  // UI event handlers for file-related actions.
  $ ( "#newFile" ) . click ( function ( ) {
   if ( confirm ( "All Changes will be lost?" ) ) { // Ask for confirmation before discarding changes.
    openFile ( ) ; // Open a new, empty, untitled file.
   }
  } ) ;

  $ ( "#openFile" ) . click ( function ( ) {
   function chooseFile ( name ) {
    var chooser = $ ( name ) ; // Get the file input element.
    chooser . trigger ( 'click' ) ; // Programmatically click to open the file selection dialog.
    chooser . change ( function ( evt ) {
     var openFilename = $ ( this ) . val ( ) ; // Get the path of the selected file.
     // openFile(openFilename); // Original commented-out line, now using new window.
     OpenFileWindow ( openFilename ) ; // Open the selected file in a new application window.
    } ) ;
   }
   chooseFile ( '#openfileDialog' ) ; // Trigger the file open dialog.
  } ) ;

  $ ( "#saveFile" ) . click ( function ( ) {
   saveFileFN ( ) ; // Call the save file function directly.
  } ) ;

  $ ( "#saveasFile" ) . click ( function ( ) {
   saveasDialog ( '#saveasDialog' ) ; // Call the "Save As" dialog function.
  } ) ;

  // --- Theme Selection Functionality ---

  $ ( "[data-theme]" ) . click ( function ( e ) {
   theme = e . target . attributes [ "data-theme" ] . value ; // Get the value of the 'data-theme' attribute.
   window . localStorage . aceTheme = theme ; // Store the selected theme in local storage for persistence.
   editor . setTheme ( "ace/theme/" + theme ) ; // Apply the new theme to the ACE editor.

   $ ( "[data-theme]" ) . parent ( ) . removeClass ( "active" ) ; // Remove the 'active' class from all theme menu items.
   $ ( "[data-theme='" + theme + "']" ) . parent ( ) . addClass ( "active" ) ; // Add 'active' class to the currently selected theme.
  } ) ;

  // A list of known dark themes, used for adjusting UI elements like the navbar.
  var darkThemes = [
   'ambiance' , 'chaos' , 'clouds_midnight' , 'cobalt' , 'idle_fingers' , 'kr_theme' ,
   'merbivore' , 'merbivore_soft' , 'mono_industrial' , 'monokai' , 'pastel_on_dark' ,
   'solarized_dark' , 'tomorrow_night' , 'tomorrow_night_blue' , 'tomorrow_night_bright' ,
   'tomorrow_night_eighties' , 'twilight' , 'vibrant_ink'
  ] ;

  // Helper function to check if a given theme is considered "dark".
  function isDarkTheme ( theme ) {
   for ( var i in darkThemes ) {
    if ( darkThemes [ i ] == theme ) {
     return true ;
    }
   }
   return false ;
  }

  // Hover effect for theme selection: temporarily change theme and navbar style.
  $ ( "[data-theme]" ) . hover ( function ( e ) {
   var ttheme = e . target . attributes [ "data-theme" ] . value ; // Get the theme name from the hovered element.
   editor . setTheme ( "ace/theme/" + ttheme ) ; // Apply the hovered theme to the editor.
   if ( isDarkTheme ( ttheme ) ) {
    $ ( ".navbar-static-top" ) . addClass ( "navbar-inverse" ) ; // Add dark navbar style if hovered theme is dark.
   } else {
    $ ( ".navbar-static-top" ) . removeClass ( "navbar-inverse" ) ; // Remove dark navbar style otherwise.
   }
  } , function ( ) {
   var ttheme = window . localStorage . aceTheme ; // Revert to the theme stored in local storage.
   editor . setTheme ( "ace/theme/" + ttheme ) ; // Apply the stored theme back to the editor.
   if ( isDarkTheme ( ttheme ) ) {
    $ ( ".navbar-static-top" ) . addClass ( "navbar-inverse" ) ; // Reapply navbar style based on the stored theme.
   } else {
    $ ( ".navbar-static-top" ) . removeClass ( "navbar-inverse" ) ; // Revert navbar style.
   }
  } ) ;

  // Initial setup for the active theme and corresponding navbar style on load.
  $ ( "[data-theme]" ) . parent ( ) . removeClass ( "active" ) ; // Clear any pre-existing active theme indicators.
  $ ( "[data-theme='" + theme + "']" ) . parent ( ) . addClass ( "active" ) ; // Set the 'active' class for the current theme.
  if ( isDarkTheme ( theme ) ) {
   $ ( ".navbar-static-top" ) . addClass ( "navbar-inverse" ) ; // Apply dark navbar style if the current theme is dark.
  } else {
   $ ( ".navbar-static-top" ) . removeClass ( "navbar-inverse" ) ; // Otherwise, ensure the light navbar style.
  }

  // --- Syntax Mode Selection Functionality ---

  $ ( "[data-mode]" ) . click ( function ( e ) {
   // Handle clicks on syntax mode menu items.
   var mode = e . target . attributes [ "data-mode" ] . value ; // Get the mode name from the clicked element.
   editor . getSession ( ) . setMode ( "ace/mode/" + mode ) ; // Apply the selected syntax mode to the editor session.
   detectedMode = mode ; // Update the globally detected mode.
   $ ( "[data-mode]" ) . parent ( ) . removeClass ( "active" ) ; // Remove 'active' class from all mode menu items.
   $ ( "[data-mode='" + mode + "']" ) . parent ( ) . addClass ( "active" ) ; // Add 'active' class to the newly selected mode.
  } ) ;


  // Hover effect for syntax mode selection: temporarily apply mode.
  $ ( "[data-mode]" ) . hover ( function ( e ) {
   var mode = e . target . attributes [ "data-mode" ] . value ; // Get the mode name from the hovered element.
   editor . getSession ( ) . setMode ( "ace/mode/" + mode ) ; // Apply the hovered mode to the editor.
  } , function ( ) {
   editor . getSession ( ) . setMode ( "ace/mode/" + detectedMode ) ; // Revert to the previously detected mode when hover ends.
  } ) ;

  // Initial setup for the active syntax mode display.
  $ ( "[data-mode]" ) . parent ( ) . removeClass ( "active" ) ; // Clear all active mode indicators.
  $ ( "[data-mode='" + detectedMode + "']" ) . parent ( ) . addClass ( "active" ) ; // Set 'active' class for the initially detected mode.

  // Window close event handler for NW.js.
  win . on ( 'close' , function ( ) {
   // Placeholder function for a confirmation dialog (e.g., for unsaved changes).
   function disp_confirm ( ) {
    var r = confirm ( "Press a button!" ) ; // A generic confirmation prompt.
    if ( r === true ) {
     alert ( "You pressed OK!" ) ; // User chose OK.
    }
    else {
     this . close ( true ) ; // User chose to close.
    }
   }
   // Currently, the window is simply closed without confirmation.
   win . close ( true ) ; // Forcefully close the window.
  } ) ;

  // UI button handler for closing the window.
  $ ( "#windowClose" ) . click ( function ( ) {
   win . close ( ) ; // Trigger the window close event.
  } ) ;
 } ; // End of the 'window.appLoad' function.
} // End of the initial 'if' condition.