/*
 * This is a jQuery plugin for a markdown editor.
 * It provides functionality for editing, previewing, and uploading images.
 */
( function  ( $ )
{
    // Enforce strict mode for better error handling and cleaner code.
    "use strict" ;

    // Define the core methods for the plugin.
    var methods =
    {
        /**
         * Initializes the markdown editor.
         * @param {object} options - Configuration options for the editor.
         */
        init: function ( options )
        {
            // Merge default options with user-provided options.
            var defaults = $.extend ( true , { } , $.fn.markdownEditor.defaults , options ) ,
                plugin = this ,
                preview = false , // Flag to track if preview mode is active.
                fullscreen = false ; // Flag to track if fullscreen mode is active.

            // Replace the content of the target div with the editor's HTML structure.
            plugin . addClass ( 'md-container' ) . html ( editorHtml ( this . text ( ) , defaults ) ) ;

            // Check if Bootstrap tooltip library is available and initialize tooltips.
            if  ( typeof $ ( ) . tooltip  ===  'function' )
            {
                plugin . find ( '[data-mdtooltip="tooltip"]' ) . tooltip ( {
                    container : 'body'
                } ) ;
            }

            // Cache commonly used elements for performance.
            var mdEditor  =  plugin . find ( '.md-editor' ) ,
                mdPreview  =  plugin . find ( '.md-preview' ) ,
                mdLoading  =  plugin . find ( '.md-loading' ) ;

            // Set the overall width of the plugin container.
            plugin . css ( {
                width : defaults . width
            } ) ;

            // Apply styling to the editor area.
            mdEditor . css ( {
                width : defaults . width ,
                height : defaults . height ,
                fontSize : defaults . fontSize
            } ) ;

            // Apply styling to the preview area.
            mdPreview . css ( {
                width : defaults . width ,
                height : defaults . height
            } ) ;

            // Initialize the Ace editor instance.
            var editor  =  ace . edit ( mdEditor [ 0 ] ) ,
                snippetManager ; // Will hold the Ace snippet manager.

            // Configure Ace editor theme and mode.
            editor . setTheme ( 'ace/theme/' + defaults . theme ) ;
            editor . getSession ( ) . setMode ( 'ace/mode/markdown' ) ;
            editor . getSession ( ) . setUseWrapMode ( true ) ;

            // Disable unnecessary Ace editor features for a cleaner look.
            editor . setHighlightActiveLine ( false ) ;
            editor . setShowPrintMargin ( false ) ;
            editor . renderer . setShowGutter ( false ) ;

            // Load Ace language tools for snippet management and auto-completion.
            ace . config . loadModule ( 'ace/ext/language_tools' , function ( )
            {
                snippetManager = ace . require ( 'ace/snippets' ) . snippetManager ;
                setShortcuts ( editor , snippetManager ) ; // Set custom keyboard shortcuts.
            } ) ;


            // Handle image drag-and-drop and upload events if enabled.
            if ( defaults . imageUpload )
            {
                // Event listener for file input change.
                plugin . find ( '.md-input-upload' ) . on ( 'change' , function ( )
                {
                    var files = $ ( this ) . get ( 0 ) . files ;

                    if ( files . length )
                    {
                        uploadFiles ( defaults . uploadPath , $ ( this ) . get ( 0 ) . files , editor , snippetManager , mdLoading ) ;
                    }
                } ) ;

                // Prevent default drag behaviors.
                plugin . on ( 'dragenter' , function ( e )
                {
                    e . stopPropagation ( ) ;
                    e . preventDefault ( ) ;
                } ) ;

                plugin . on ( 'dragover' , function ( e )
                {
                    e . stopPropagation ( ) ;
                    e . preventDefault ( ) ;
                } ) ;

                // Handle file drop event for uploads.
                plugin . on ( 'drop' , function ( e )
                {
                    e . preventDefault ( ) ;
                    var files = e . originalEvent . dataTransfer . files ;

                    uploadFiles ( defaults . uploadPath , files , editor , snippetManager , mdLoading ) ;
                } ) ;
            }

            // Window resize event handler, specifically for fullscreen mode.
            if ( defaults . fullscreen  ===  true )
            {
                $ ( window ) . resize ( function ( )
                {
                    if ( fullscreen  ===  true )
                    {
                        if ( preview  ===  false )
                        {
                            adjustFullscreenLayout ( mdEditor ) ;
                        }
                        else
                        {
                            adjustFullscreenLayout ( mdPreview ) ;
                        }
                    }
                } ) ;
            }

            // Toolbar button click events.
            plugin . find ( '.md-btn' ) . click ( function ( )
            {
                var btnType = $ ( this ) . data ( 'btn' ) ,
                    selectedText = editor . session . getTextRange ( editor . getSelectionRange ( ) ) ;

                // Handle different button types.
                if ( btnType  ===  'h1' )
                {
                    insertHeader ( editor , '#' ) ;
                }
                else if ( btnType  ===  'h2' )
                {
                    insertHeader ( editor , '##' ) ;
                }
                else if ( btnType  ===  'h3' )
                {
                    insertHeader ( editor , '###' ) ;
                }
                else if ( btnType  ===  'bold' )
                {
                    editor . execCommand ( 'bold' ) ;
                }
                else if ( btnType  ===  'italic' )
                {
                    editor . execCommand ( 'italic' ) ;
                }
                else if ( btnType  ===  'link' )
                {
                    editor . execCommand ( 'link' ) ;
                }
                else if ( btnType  ===  'image' )
                {
                    if ( selectedText  ===  '' )
                    {
                        snippetManager . insertSnippet ( editor , '![${1:text}](http://$2)' ) ;
                    }
                    else
                    {
                        snippetManager . insertSnippet ( editor , '![' + selectedText + '](http://$1)' ) ;
                    }
                }
                else if ( btnType  ===  'edit' )
                {
                    // Switch to edit mode.
                    preview = false ;

                    mdPreview . hide ( ) ;
                    mdEditor . show ( ) ;
                    plugin . find ( '.btn-edit' ) . addClass ( 'active' ) ;
                    plugin . find ( '.btn-preview' ) . removeClass ( 'active' ) ;

                    if ( fullscreen  ===  true )
                    {
                        adjustFullscreenLayout ( mdEditor ) ;
                    }
                }
                else if ( btnType  ===  'preview' )
                {
                    // Switch to preview mode.
                    preview = true ;

                    // Display loading message while preview is generated.
                    mdPreview . html ( '<p style="text-align:center; font-size:16px">' + defaults . label . loading + '...</p>' ) ;

                    // Call the custom onPreview function to get rendered content.
                    defaults . onPreview ( editor . getSession ( ) . getValue ( ) , function ( content )
                    {
                        mdPreview . html ( content ) ;
                    } ) ;

                    mdEditor . hide ( ) ;
                    mdPreview . show ( ) ;
                    plugin . find ( '.btn-preview' ) . addClass ( 'active' ) ;
                    plugin . find ( '.btn-edit' ) . removeClass ( 'active' ) ;

                    if ( fullscreen  ===  true )
                    {
                        adjustFullscreenLayout ( mdPreview ) ;
                    }
                }
                else if ( btnType  ===  'fullscreen' )
                {
                    // Toggle fullscreen mode.
                    if ( fullscreen  ===  true )
                    {
                        fullscreen = false ;

                        $ ( 'body, html' ) . removeClass ( 'md-body-fullscreen' ) ;
                        plugin . removeClass ( 'md-fullscreen' ) ;

                        // Restore original heights.
                        mdEditor . css ( 'height' , defaults . height ) ;
                        mdPreview . css ( 'height' , defaults . height ) ;
                    }
                    else
                    {
                        fullscreen = true ;

                        $ ( 'body, html' ) . addClass ( 'md-body-fullscreen' ) ;
                        plugin . addClass ( 'md-fullscreen' ) ;

                        // Adjust layout based on current view (edit/preview).
                        if ( preview  ===  false )
                        {
                            adjustFullscreenLayout ( mdEditor ) ;
                        }
                        else
                        {
                            adjustFullscreenLayout ( mdPreview ) ;
                        }
                    }

                    editor . resize ( ) ; // Inform Ace editor about size change.
                }

                editor . focus ( ) ; // Keep focus on the editor.
            } ) ;

            return this ; // Allow for jQuery method chaining.
        } ,

        /**
         * Retrieves the current content of the editor.
         * @returns {string} The content of the editor.
         */
        content: function ( )
        {
            var editor = ace . edit ( this . find ( '.md-editor' ) [ 0 ] ) ;
            return editor . getSession ( ) . getValue ( ) ;
        }
    } ;

    // jQuery plugin definition.
    $.fn.markdownEditor = function ( options )
    {
        // Check if a specific method is called.
        if ( methods [ options ] )
        {
            return methods [ options ] . apply ( this , Array . prototype . slice . call ( arguments , 1 ) ) ;
        }
        // If options is an object or undefined, initialize the plugin.
        else if ( typeof options  ===  'object'  ||  ! options )
        {
            return methods . init . apply ( this , arguments ) ;
        }
        // Handle unknown method calls.
        else
        {
            $.error ( 'Method ' +  options + ' does not exist on jQuery.markdownEditor' ) ;
        }
    } ;

    /**
     * Handles file uploads.
     * @param {string} url - The URL to upload files to.
     * @param {FileList} files - The files to upload.
     * @param {object} editor - The Ace editor instance.
     * @param {object} snippetManager - The Ace snippet manager.
     * @param {jQuery} loading - The loading indicator element.
     */
    function uploadFiles ( url , files , editor , snippetManager , loading )
    {
        loading . show ( ) ; // Show loading indicator.

        var data = new FormData ( ) ,
            i = 0 ;

        // Append each file to the FormData object.
        for ( i = 0 ; i < files . length ; i ++ )
        {
            data . append ( 'file' + i , files [ i ] ) ;
        }

        // Perform AJAX file upload.
        $.ajax ( {
            url : url ,
            type : 'POST' ,
            contentType : false ,
            data : data ,
            processData : false ,
            cache : false ,
            dataType : 'json'
        } ) . done ( function ( uploadedFiles )
        {
            var separation = '' ;
            if ( uploadedFiles . length  >  1 )
            {
                separation = "\n" ; // Add newline for multiple images.
            }

            // Insert image markdown for each uploaded file.
            for ( var i = 0 ; i < uploadedFiles . length ; i ++ )
            {
                snippetManager . insertSnippet ( editor , '![](' + uploadedFiles [ i ] + ')' + separation ) ;
            }
        } ) . always ( function ( )
        {
            loading . hide ( ) ; // Hide loading indicator regardless of success or failure.
        } ) ;
    }

    /**
     * Adjusts the layout for fullscreen mode.
     * @param {jQuery} mdPanel - The jQuery object of the panel to adjust (editor or preview).
     */
    function adjustFullscreenLayout ( mdPanel )
    {
        var hWindow = $ ( window ) . height ( ) ,
            tEditor = mdPanel . offset ( ) . top ,
            hEditor ;

        if ( hWindow  >  tEditor )
        {
            hEditor = hWindow  -  tEditor ;
            mdPanel . css ( 'height' , hEditor + 'px' ) ;
        }
    }

    /**
     * Sets custom keyboard shortcuts for the Ace editor.
     * @param {object} editor - The Ace editor instance.
     * @param {object} snippetManager - The Ace snippet manager.
     */
    function setShortcuts ( editor , snippetManager )
    {
        // Shortcut for bold text.
        editor . commands . addCommand ( {
            name : 'bold' ,
            bindKey : { win : 'Ctrl-B' ,  mac : 'Command-B' } ,
            exec : function ( editor )
            {
                var selectedText = editor . session . getTextRange ( editor . getSelectionRange ( ) ) ;

                if ( selectedText  ===  '' )
                {
                    snippetManager . insertSnippet ( editor , '**${1:text}**' ) ;
                }
                else
                {
                    snippetManager . insertSnippet ( editor , '**' + selectedText + '**' ) ;
                }
            } ,
            readOnly : false
        } ) ;

        // Shortcut for italic text.
        editor . commands . addCommand ( {
            name : 'italic' ,
            bindKey : { win : 'Ctrl-I' ,  mac : 'Command-I' } ,
            exec : function ( editor )
            {
                var selectedText = editor . session . getTextRange ( editor . getSelectionRange ( ) ) ;

                if ( selectedText  ===  '' )
                {
                    snippetManager . insertSnippet ( editor , '*${1:text}*' ) ;
                }
                else
                {
                    snippetManager . insertSnippet ( editor , '*' + selectedText + '*' ) ;
                }
            } ,
            readOnly : false
        } ) ;

        // Shortcut for inserting a link.
        editor . commands . addCommand ( {
            name : 'link' ,
            bindKey : { win : 'Ctrl-K' ,  mac : 'Command-K' } ,
            exec : function ( editor )
            {
                var selectedText = editor . session . getTextRange ( editor . getSelectionRange ( ) ) ;

                if ( selectedText  ===  '' )
                {
                    snippetManager . insertSnippet ( editor , '[${1:text}](http://$2)' ) ;
                }
                else
                {
                    snippetManager . insertSnippet ( editor , '[' + selectedText + '](http://$1)' ) ;
                }
            } ,
            readOnly : false
        } ) ;
    }

    /**
     * Inserts a header prefix at the current cursor position or line start.
     * @param {object} editor - The Ace editor instance.
     * @param {string} string - The header prefix (e.g., '#', '##').
     */
    function insertHeader ( editor , string )
    {
        // If cursor is at the beginning of the line, just insert.
        if ( editor . getCursorPosition ( ) . column  ===  0 )
        {
            editor . navigateLineStart ( ) ;
            editor . insert ( string + ' ' ) ;
        }
        // Otherwise, navigate to line start, insert, then navigate back to line end.
        else
        {
            editor . navigateLineStart ( ) ;
            editor . insert ( string + ' ' ) ;
            editor . navigateLineEnd ( ) ;
        }
    }

    /**
     * Generates the HTML structure for the markdown editor.
     * @param {string} content - The initial content for the editor.
     * @param {object} options - Configuration options.
     * @returns {string} The generated HTML string.
     */
    function editorHtml ( content , options )
    {
        var html = '' ;

        // Loading spinner HTML.
        html += '<div class="md-loading"><span class="md-icon-container"><span class="md-icon"></span></span></div>' ;
        html += '<div class="md-toolbar">' ;
            html += '<div class="btn-toolbar">' ;

                // Header buttons group.
                html += '<div class="btn-group">' ;
                    html += '<button type="button" data-mdtooltip="tooltip" title="' + options . label . btnHeader1 + '" class="md-btn btn btn-sm btn-default" data-btn="h1">H1</button>' ;
                    html += '<button type="button" data-mdtooltip="tooltip" title="' + options . label . btnHeader2 + '" class="md-btn btn btn-sm btn-default" data-btn="h2">H2</button>' ;
                    html += '<button type="button" data-mdtooltip="tooltip" title="' + options . label . btnHeader3 + '" class="md-btn btn btn-sm btn-default" data-btn="h3">H3</button>' ;
                html += '</div>' ; // End .btn-group for headers.

                // Bold and Italic buttons group.
                html += '<div class="btn-group">' ;
                    html += '<button type="button" data-mdtooltip="tooltip" title="' + options . label . btnBold + '" class="md-btn btn btn-sm btn-default" data-btn="bold"><span class="glyphicon glyphicon-bold"></span></button>' ;
                    html += '<button type="button" data-mdtooltip="tooltip" title="' + options . label . btnItalic + '" class="md-btn btn btn-sm btn-default" data-btn="italic"><span class="glyphicon glyphicon-italic"></span></button>' ;
                html += '</div>' ; // End .btn-group for bold/italic.

                // Link and Image buttons group.
                html += '<div class="btn-group">' ;
                    html += '<button type="button" data-mdtooltip="tooltip" title="' + options . label . btnLink + '" class="md-btn btn btn-sm btn-default" data-btn="link"><span class="glyphicon glyphicon-link"></span></button>' ;
                    html += '<button type="button" data-mdtooltip="tooltip" title="' + options . label . btnImage + '" class="md-btn btn btn-sm btn-default" data-btn="image"><span class="glyphicon glyphicon-picture"></span></button>' ;
                    // Conditionally add image upload button.
                    if ( options . imageUpload  ===  true )
                    {
                        html += '<button type="button" data-mdtooltip="tooltip" title="' + options . label . btnUpload + '" class="btn btn-sm btn-default md-btn-file"><span class="glyphicon glyphicon-upload"></span><input class="md-input-upload" type="file" multiple accept=".jpg,.jpeg,.png,.gif"></button>' ;
                    }
                html += '</div>' ; // End .btn-group for link/image.

                // Fullscreen button (if enabled).
                if ( options . fullscreen  ===  true )
                {
                    html += '<div class="btn-group pull-right">' ;
                        html += '<button type="button" class="md-btn btn btn-sm btn-default" data-btn="fullscreen"><span class="glyphicon glyphicon-fullscreen"></span> ' + options . label . btnFullscreen + '</button>' ;
                    html += '</div>' ; // End .btn-group for fullscreen.
                }

                // Edit/Preview toggle buttons (if enabled).
                if ( options . preview  ===  true )
                {
                    html += '<div class="btn-group pull-right">' ;
                        html += '<button type="button" class="md-btn btn btn-sm btn-default btn-edit active" data-btn="edit"><span class="glyphicon glyphicon-pencil"></span> ' + options . label . btnEdit + '</button>' ;
                        html += '<button type="button" class="md-btn btn btn-sm btn-default btn-preview" data-btn="preview"><span class="glyphicon glyphicon-eye-open"></span> ' + options . label . btnPreview + '</button>' ;
                    html += '</div>' ; // End .btn-group for edit/preview.
                }

            html += '</div>' ; // End .btn-toolbar.
        html += '</div>' ; // End .md-toolbar.

        // Editor and preview panels.
        html += '<div class="md-editor">' + $.trim ( content ) + '</div>' ;
        html += '<div class="md-preview" style="display:none"></div>' ;

        return html ;
    }

    // Default configuration options for the markdown editor.
    $.fn.markdownEditor.defaults =
    {
        width : '100%' , // Default width of the editor.
        height : '400px' , // Default height of the editor.
        fontSize : '14px' , // Default font size for the editor.
        theme : 'tomorrow' , // Ace editor theme.
        fullscreen : true , // Enable/disable fullscreen mode.
        imageUpload : false , // Enable/disable image upload functionality.
        uploadPath : '' , // URL for image uploads.
        preview : false , // Enable/disable preview functionality.
        // Custom function to handle content preview.
        onPreview : function ( content , callback )
        {
            callback ( content ) ; // Default behavior: just return the content.
        } ,
        // Labels for toolbar buttons and messages.
        label :
        {
            btnHeader1 : 'Header 1' ,
            btnHeader2 : 'Header 2' ,
            btnHeader3 : 'Header 3' ,
            btnBold : 'Bold' ,
            btnItalic : 'Italic' ,
            btnLink : 'Link' ,
            btnImage : 'Insert image' ,
            btnUpload : 'Uplaod image' , // Typo: Should be "Upload image" but must remain unchanged.
            btnEdit : 'Edit' ,
            btnPreview : 'Preview' ,
            btnFullscreen : 'Fullscreen' ,
            loading : 'Loading'
        }
    } ;

} ( jQuery ) ) ; // End of the self-executing anonymous function.