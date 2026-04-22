/*
 * This is a Type I clone of Redactor v9.1.9.
 * Original version updated on December 12, 2013.
 *
 * For original documentation and license, please refer to:
 * http://imperavi.com/redactor/
 * http://imperavi.com/redactor/license/
 *
 * Copyright details: (c) 2009-2013, Imperavi LLC.
 *
 * Example initialization:
 *   jQuery('#content').redactor();
 *
 * This clone adheres strictly to Type I definition:
 * - No logical changes.
 * - Only whitespace and comments are altered.
 */

( function ( $ )
{
    // Internal counter for unique IDs
    var uuid = 0 ;

    // Enforce strict JavaScript mode for better error handling
    "use strict" ;

    /**
     * Represents a selected range in the editor.
     * @param {Range} range - The native DOM Range object.
     */
    var Range = function ( range )
    {
        // Store start and end offsets
        this [ 0 ] = range . startOffset ;
        this [ 1 ] = range . endOffset ;

        // Keep a reference to the original range object
        this . range = range ;

        return this ;
    } ;

    // Prototype method for Range object
    Range . prototype . equals = function ( )
    {
        // Check if the start and end offsets are the same
        return this [ 0 ] === this [ 1 ] ;
    } ;

    // jQuery plugin definition for Redactor.
    // This makes Redactor available on jQuery objects like `$('#editor').redactor();`
    $ . fn . redactor = function ( options )
    {
        // Array to store return values from method calls
        var val = [ ] ;
        // Convert arguments object to a true array, skipping the 'options' argument
        var args = Array . prototype . slice . call ( arguments , 1 ) ;

        // Check if the first argument is a string, indicating a method call
        if ( typeof options === 'string' )
        {
            // Iterate over each selected element
            this . each ( function ( )
            {
                // Retrieve the Redactor instance associated with the current element
                var instance = $ . data ( this , 'redactor' ) ;

                // Ensure an instance exists and the method is a function
                if ( typeof instance !== 'undefined' && $ . isFunction ( instance [ options ] ) )
                {
                    // Call the method on the instance, passing remaining arguments
                    var methodVal = instance [ options ] . apply ( instance , args ) ;

                    // If the method returned a value (and it's not the instance itself), store it
                    if ( methodVal !== undefined && methodVal !== instance )
                    {
                        val . push ( methodVal ) ;
                    }
                }
                // If the method does not exist, throw an error
                else
                {
                    return $ . error ( 'No such method "' + options + '" for Redactor' ) ;
                }
            } ) ;
        }
        // If the first argument is not a string, it means we are initializing Redactor
        else
        {
            // Iterate over each selected element
            this . each ( function ( )
            {
                // Initialize Redactor only if it hasn't been initialized yet for this element
                if ( ! $ . data ( this , 'redactor' ) )
                {
                    $ . data ( this , 'redactor' , Redactor ( this , options ) ) ;
                }
            } ) ;
        }


        // Handle return values based on how many were collected
        if ( val . length === 0 )
        {
            // If no values, return the jQuery object for chaining
            return this ;
        }
        else if ( val . length === 1 )
        {
            // If one value, return that value directly
            return val [ 0 ] ;
        }
        else
        {
            // If multiple values, return the array of values
            return val ;
        }

    } ;

    // Main Redactor initialization function.
    // This serves as a constructor wrapper.
    function Redactor ( el , options )
    {
        // Create a new instance of Redactor's prototype init method.
        return new Redactor . prototype . init ( el , options ) ;
    }

    // Expose Redactor constructor globally via jQuery
    $ . Redactor = Redactor ;
    // Set the version number for the Redactor instance
    $ . Redactor . VERSION = '9.1.9' ;
    // Define default options for Redactor instances
    $ . Redactor . opts =
    {
        // Core configuration settings
        rangy : false ,

        iframe : false ,
        fullpage : false ,
        css : false , // Path to custom CSS file for iframe mode

        lang : 'en' ,
        direction : 'ltr' , // Text direction: 'ltr' (left-to-right) or 'rtl' (right-to-left)

        placeholder : false , // Placeholder text for empty editor

        wym : false , // What You Mean mode (experimental)
        mobile : true , // Enable mobile optimizations
        cleanup : true , // Clean HTML on paste/input
        tidyHtml : true , // Tidy up HTML output
        pastePlainText : false , // Paste as plain text by default
        removeEmptyTags : true , // Remove empty tags (e.g., <p></p>)
        templateVars : false , // Enable template variables parsing
        xhtml : false , // Output XHTML compliant HTML

        visual : true , // Start in visual mode
        focus : false , // Focus on editor on initialization
        tabindex : false , // Set tabindex attribute
        autoresize : true , // Automatically resize editor height
        minHeight : false , // Minimum height for the editor
        maxHeight : false , // Maximum height for the editor
        shortcuts : true , // Enable keyboard shortcuts

        autosave : false , // URL for autosaving content, or false to disable
        autosaveInterval : 60 , // Autosave interval in seconds

        plugins : false , // Array of plugin names to load

        linkAnchor : true , // Allow inserting anchors
        linkEmail : true , // Allow inserting email links
        linkProtocol : 'http://' , // Default protocol for links
        linkNofollow : false , // Add rel="nofollow" to links
        linkSize : 50 , // Max length for link text

        imageFloatMargin : '10px' , // Margin for floated images
        imageGetJson : false , // URL to fetch image list (e.g., /folder/images.json) or false

        imageUpload : false , // URL for image upload endpoint
        imageUploadParam : 'file' , // Name of the file input field for image uploads
        fileUpload : false , // URL for general file upload endpoint
        fileUploadParam : 'file' , // Name of the file input field for file uploads
        clipboardUpload : true , // Allow image uploads from clipboard
        clipboardUploadUrl : false , // URL for clipboard image upload
        dragUpload : true , // Allow drag-and-drop uploads (images and files)

        dnbImageTypes : [ 'image/png' , 'image/jpeg' , 'image/gif' ] , // Allowed image types for drag-and-drop/clipboard upload, or false

        s3 : false , // S3 upload configuration (object)
        uploadFields : false , // Additional fields to send with uploads (object)

        observeImages : true , // Observe image insertions
        observeLinks : true , // Observe link insertions

        modalOverlay : true , // Show an overlay behind modals

        tabSpaces : false , // Convert tabs to spaces (true or number of spaces)
        tabFocus : true , // Allow tab key to move focus out of editor

        air : false , // Enable Air toolbar
        airButtons : [ 'formatting' , '|' , 'bold' , 'italic' , 'deleted' , '|' , 'unorderedlist' , 'orderedlist' , 'outdent' , 'indent' ] ,

        toolbar : true , // Show the main toolbar
        toolbarFixed : false , // Fix toolbar position
        toolbarFixedTarget : document , // Target element for fixed toolbar positioning
        toolbarFixedTopOffset : 0 , // Offset from top for fixed toolbar
        toolbarFixedBox : false , // Fix toolbar within its parent box
        toolbarExternal : false , // ID selector for an external toolbar container
        buttonSource : true , // Show the HTML source button

        buttonSeparator : '<li class="redactor_separator"></li>' , // HTML for toolbar button separator

        buttonsCustom : { } , // Custom buttons configuration (object)
        buttonsAdd : [ ] , // Additional buttons to add to the toolbar (array)
        buttons : [ 'html' , '|' , 'formatting' , '|' , 'bold' , 'italic' , 'deleted' , '|' , 'unorderedlist' , 'orderedlist' , 'outdent' , 'indent' , '|' , 'image' , 'video' , 'file' , 'table' , 'link' , '|' , 'alignment' , '|' , 'horizontalrule' ] , // List of buttons to display // 'underline', 'alignleft', 'aligncenter', 'alignright', 'justify'

        activeButtons : [ 'deleted' , 'italic' , 'bold' , 'underline' , 'unorderedlist' , 'orderedlist' , 'alignleft' , 'align_center' , 'align_right' , 'justify' , 'table' ] , // Buttons that show active state
        activeButtonsStates :
        {
            b : 'bold' ,
            strong : 'bold' ,
            i : 'italic' ,
            em : 'italic' ,
            del : 'deleted' ,
            strike : 'deleted' ,
            ul : 'unorderedlist' ,
            ol : 'orderedlist' ,
            u : 'underline' ,
            tr : 'table' ,
            td : 'table' ,
            table : 'table'
        } ,
        activeButtonsAdd : false , // Additional active button states (object, e.g., { tag: 'buttonName' })

        formattingTags : [ 'p' , 'blockquote' , 'pre' , 'h1' , 'h2' , 'h3' , 'h4' , 'h5' , 'h6' ] , // Tags available for formatting

        linebreaks : false , // Use <br> for new lines instead of <p>
        paragraphy : true , // Wrap content in <p> tags
        convertDivs : true , // Convert <div> to <p> where appropriate
        convertLinks : true , // Convert raw URLs to hyperlinks
        convertImageLinks : false , // Convert image URLs to <img> tags
        convertVideoLinks : false , // Convert video URLs to embedded videos
        formattingPre : false , // Apply formatting inside <pre> tags
        phpTags : false , // Allow PHP tags in HTML source

        allowedTags : false , // Array of allowed HTML tags, or false to allow all
        deniedTags : [ 'html' , 'head' , 'link' , 'body' , 'meta' , 'script' , 'style' , 'applet' ] , // Array of denied HTML tags

        boldTag : 'strong' , // Tag to use for bold (<b> or <strong>)
        italicTag : 'em' , // Tag to use for italic (<i> or <em>)

        // Internal/private options (not typically exposed for configuration)
        indentValue : 20 , // Indentation value in pixels
        buffer : [ ] , // Undo buffer
        rebuffer : [ ] , // Redo buffer
        textareamode : false , // Internal flag for textarea mode
        emptyHtml : '<p>&#x200b;</p>' , // HTML for an empty editor
        invisibleSpace : '&#x200b;' , // Zero-width space character
        rBlockTest : /^(P|H[1-6]|LI|ADDRESS|SECTION|HEADER|FOOTER|ASIDE|ARTICLE)$/i , // Regex to test for block-level elements
        alignmentTags : [ 'P' , 'H1' , 'H2' , 'H3' , 'H4' , 'H5' , 'H6' , 'DD' , 'DL' , 'DT' , 'DIV' , 'TD' ,
                            'BLOCKQUOTE' , 'OUTPUT' , 'FIGCAPTION' , 'ADDRESS' , 'SECTION' ,
                            'HEADER' , 'FOOTER' , 'ASIDE' , 'ARTICLE' ] ,
        ownLine : [ 'area' , 'body' , 'head' , 'hr' , 'i?frame' , 'link' , 'meta' , 'noscript' , 'style' , 'script' , 'table' , 'tbody' , 'thead' , 'tfoot' ] ,
        contOwnLine : [ 'li' , 'dt' , 'dt' , 'h[1-6]' , 'option' , 'script' ] ,
        newLevel : [ 'blockquote' , 'div' , 'dl' , 'fieldset' , 'form' , 'frameset' , 'map' , 'ol' , 'p' , 'pre' , 'select' , 'td' , 'th' , 'tr' , 'ul' ] ,
        blockLevelElements : [ 'P' , 'H1' , 'H2' , 'H3' , 'H4' , 'H5' , 'H6' , 'DD' , 'DL' , 'DT' , 'DIV' , 'LI' ,
                                'BLOCKQUOTE' , 'OUTPUT' , 'FIGCAPTION' , 'PRE' , 'ADDRESS' , 'SECTION' ,
                                'HEADER' , 'FOOTER' , 'ASIDE' , 'ARTICLE' , 'TD' ] ,
        // Language definitions
        langs :
        {
            en :
            {
                html : 'HTML' ,
                video : 'Insert Video' ,
                image : 'Insert Image' ,
                table : 'Table' ,
                link : 'Link' ,
                link_insert : 'Insert link' ,
                link_edit : 'Edit link' ,
                unlink : 'Unlink' ,
                formatting : 'Formatting' ,
                paragraph : 'Normal text' ,
                quote : 'Quote' ,
                code : 'Code' ,
                header1 : 'Header 1' ,
                header2 : 'Header 2' ,
                header3 : 'Header 3' ,
                header4 : 'Header 4' ,
                header5 : 'Header 5' ,
                bold : 'Bold' ,
                italic : 'Italic' ,
                fontcolor : 'Font Color' ,
                backcolor : 'Back Color' ,
                unorderedlist : 'Unordered List' ,
                orderedlist : 'Ordered List' ,
                outdent : 'Outdent' ,
                indent : 'Indent' ,
                cancel : 'Cancel' ,
                insert : 'Insert' ,
                save : 'Save' ,
                _delete : 'Delete' ,
                insert_table : 'Insert Table' ,
                insert_row_above : 'Add Row Above' ,
                insert_row_below : 'Add Row Below' ,
                insert_column_left : 'Add Column Left' ,
                insert_column_right : 'Add Column Right' ,
                delete_column : 'Delete Column' ,
                delete_row : 'Delete Row' ,
                delete_table : 'Delete Table' ,
                rows : 'Rows' ,
                columns : 'Columns' ,
                add_head : 'Add Head' ,
                delete_head : 'Delete Head' ,
                title : 'Title' ,
                image_position : 'Position' ,
                none : 'None' ,
                left : 'Left' ,
                right : 'Right' ,
                image_web_link : 'Image Web Link' ,
                text : 'Text' ,
                mailto : 'Email' ,
                web : 'URL' ,
                video_html_code : 'Video Embed Code' ,
                file : 'Insert File' ,
                upload : 'Upload' ,
                download : 'Download' ,
                choose : 'Choose' ,
                or_choose : 'Or choose' ,
                drop_file_here : 'Drop file here' ,
                align_left : 'Align text to the left' ,
                align_center : 'Center text' ,
                align_right : 'Align text to the right' ,
                align_justify : 'Justify text' ,
                horizontalrule : 'Insert Horizontal Rule' ,
                deleted : 'Deleted' ,
                anchor : 'Anchor' ,
                link_new_tab : 'Open link in new tab' ,
                underline : 'Underline' ,
                alignment : 'Alignment' ,
                filename : 'Name (optional)' ,
                edit : 'Edit'
            }
        }
    } ;

    // Define Redactor's prototype methods and properties.
    // This makes methods available to all Redactor instances.
    Redactor . fn = $ . Redactor . prototype =
    {
        // Key codes for common keyboard events
        keyCode :
        {
            BACKSPACE : 8 ,
            DELETE : 46 ,
            DOWN : 40 ,
            ENTER : 13 ,
            ESC : 27 ,
            TAB : 9 ,
            CTRL : 17 ,
            META : 91 , // Command key on Mac
            LEFT : 37 ,
            LEFT_WIN : 91 // Windows key
        } ,

        /**
         * Constructor method for Redactor instances.
         * This is called when `new Redactor.prototype.init()` is invoked.
         * @param {HTMLElement} el - The DOM element to initialize Redactor on.
         * @param {object} options - User-provided options to override defaults.
         */
        init : function ( el , options )
        {
            this . rtePaste = false ; // Flag to indicate rich text paste
            this . $element = this . $source = $ ( el ) ; // jQuery object of the source element
            this . uuid = uuid ++ ; // Assign a unique ID to this instance

            // Clone the default options to avoid modifying them directly
            var opts = $ . extend ( true , { } , $ . Redactor . opts ) ;

            // Merge default options with element data attributes and user-provided options
            this . opts = $ . extend (
                { } ,
                opts ,
                this . $element . data ( ) ,
                options
            ) ;

            this . start = true ; // Flag for initial setup state
            this . dropdowns = [ ] ; // Array to hold references to active dropdowns

            // Retrieve initial dimensions of the source element
            this . sourceHeight = this . $source . css ( 'height' ) ;
            this . sourceWidth = this . $source . css ( 'width' ) ;

            // Adjust options based on dependencies or conflicts
            if ( this . opts . fullpage )
            {
                this . opts . iframe = true ; // Fullpage implies iframe mode
            }
            if ( this . opts . linebreaks )
            {
                this . opts . paragraphy = false ; // Linebreaks conflict with paragraphy
            }
            if ( this . opts . paragraphy )
            {
                this . opts . linebreaks = false ; // Paragraphy conflict with linebreaks
            }
            if ( this . opts . toolbarFixedBox )
            {
                this . opts . toolbarFixed = true ; // Fixed box implies fixed toolbar
            }

            // Create aliases for document and window, especially useful in iframe mode
            this . document = document ;
            this . window = window ;

            // Placeholder for a saved text selection range
            this . savedSel = false ;

            // Regular expressions for HTML cleaning and parsing
            this . cleanlineBefore = new RegExp ( '^<(/?' + this . opts . ownLine . join ( '|/?' ) + '|' + this . opts . contOwnLine . join ( '|' ) + ')[ >]' ) ;
            this . cleanlineAfter = new RegExp ( '^<(br|/?' + this . opts . ownLine . join ( '|/?' ) + '|/' + this . opts . contOwnLine . join ( '|/' ) + ')[ >]' ) ;
            this . cleannewLevel = new RegExp ( '^</?(' + this . opts . newLevel . join ( '|' ) + ')[ >]' ) ;

            // Regular expression to test if an element is block-level
            this . rTestBlock = new RegExp ( '^(' + this . opts . blockLevelElements . join ( '|' ) + ')$' , 'i' ) ;

            // Adjust allowed/denied tags based on linebreak mode
            if ( this . opts . linebreaks === false )
            {
                if ( this . opts . allowedTags !== false )
                {
                    var arrSearch = [ 'strong' , 'em' , 'del' ] ;
                    var arrAdd = [ 'b' , 'i' , 'strike' ] ;

                    // Ensure 'p' tag is allowed if linebreaks are off
                    if ( $ . inArray ( 'p' , this . opts . allowedTags ) === '-1' )
                    {
                        this . opts . allowedTags . push ( 'p' ) ;
                    }

                    // Add corresponding shorthand tags if their longhand versions are allowed
                    for ( i in arrSearch )
                    {
                        if ( $ . inArray ( arrSearch [ i ] , this . opts . allowedTags ) != '-1' )
                        {
                            this . opts . allowedTags . push ( arrAdd [ i ] ) ;
                        }
                    }
                }

                if ( this . opts . deniedTags !== false )
                {
                    // Remove 'p' from denied tags if linebreaks are off
                    var pos = $ . inArray ( 'p' , this . opts . deniedTags ) ;
                    if ( pos !== '-1' )
                    {
                        this . opts . deniedTags . splice ( pos , pos ) ;
                    }
                }
            }

            // Browser-specific adjustments (e.g., for IE and Opera)
            if ( this . browser ( 'msie' ) || this . browser ( 'opera' ) )
            {
                // Remove 'horizontalrule' button for browsers that don't support it well
                this . opts . buttons = this . removeFromArrayByValue ( this . opts . buttons , 'horizontalrule' ) ;
            }

            // Load the current language pack
            this . opts . curLang = this . opts . langs [ this . opts . lang ] ;

            // Begin the Redactor editor construction process
            this . buildStart ( ) ;
        } ,

        /**
         * Initializes the toolbar buttons configuration.
         * @param {object} lang - The language object containing button titles.
         * @returns {object} The toolbar buttons configuration.
         */
        toolbarInit : function ( lang )
        {
            return {
                // HTML source code toggle button
                html :
                {
                    title : lang . html ,
                    func : 'toggle'
                } ,
                // Formatting dropdown button
                formatting :
                {
                    title : lang . formatting ,
                    func : 'show' ,
                    dropdown :
                    {
                        // Paragraph format
                        p :
                        {
                            title : lang . paragraph ,
                            func : 'formatBlocks'
                        } ,
                        // Blockquote format
                        blockquote :
                        {
                            title : lang . quote ,
                            func : 'formatQuote' ,
                            className : 'redactor_format_blockquote'
                        } ,
                        // Preformatted text format
                        pre :
                        {
                            title : lang . code ,
                            func : 'formatBlocks' ,
                            className : 'redactor_format_pre'
                        } ,
                        // Header 1 format
                        h1 :
                        {
                            title : lang . header1 ,
                            func : 'formatBlocks' ,
                            className : 'redactor_format_h1'
                        } ,
                        // Header 2 format
                        h2 :
                        {
                            title : lang . header2 ,
                            func : 'formatBlocks' ,
                            className : 'redactor_format_h2'
                        } ,
                        // Header 3 format
                        h3 :
                        {
                            title : lang . header3 ,
                            func : 'formatBlocks' ,
                            className : 'redactor_format_h3'
                        } ,
                        // Header 4 format
                        h4 :
                        {
                            title : lang . header4 ,
                            func : 'formatBlocks' ,
                            className : 'redactor_format_h4'
                        } ,
                        // Header 5 format
                        h5 :
                        {
                            title : lang . header5 ,
                            func : 'formatBlocks' ,
                            className : 'redactor_format_h5'
                        }
                    }
                } ,
                // Bold text button
                bold :
                {
                    title : lang . bold ,
                    exec : 'bold'
                } ,
                // Italic text button
                italic :
                {
                    title : lang . italic ,
                    exec : 'italic'
                } ,
                // Strikethrough text button
                deleted :
                {
                    title : lang . deleted ,
                    exec : 'strikethrough'
                } ,
                // Underline text button
                underline :
                {
                    title : lang . underline ,
                    exec : 'underline'
                } ,
                // Unordered list button
                unorderedlist :
                {
                    title : '&bull; ' + lang . unorderedlist ,
                    exec : 'insertunorderedlist'
                } ,
                // Ordered list button
                orderedlist :
                {
                    title : '1. ' + lang . orderedlist ,
                    exec : 'insertorderedlist'
                } ,
                // Outdent button
                outdent :
                {
                    title : '< ' + lang . outdent ,
                    func : 'indentingOutdent'
                } ,
                // Indent button
                indent :
                {
                    title : '> ' + lang . indent ,
                    func : 'indentingIndent'
                } ,
                // Image insertion button
                image :
                {
                    title : lang . image ,
                    func : 'imageShow'
                } ,
                // Video insertion button
                video :
                {
                    title : lang . video ,
                    func : 'videoShow'
                } ,
                // File insertion button
                file :
                {
                    title : lang . file ,
                    func : 'fileShow'
                } ,