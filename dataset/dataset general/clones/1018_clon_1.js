var fs      =   require('fs') ; // Node.js File System module
var path    =   require('path') ; // Node.js Path module utility
var marked  =   require('marked'); // Markdown parser
var cardinal=   require('cardinal'); // JavaScript syntax highlighter
var xtend   =   require('xtend'); // Extend objects
var color   =   require('./color'); // Custom color utility

/*
 * Default options for rendering markdown to console output.
 * These can be overridden by user-provided options.
 */
var defaultOptions =
{
    collapseNewlines    :   true    // Collapse multiple newlines into fewer
  , space               :   ''      // Empty string for 'space' token
  , hrStart             :   ''      // Horizontal rule start string
  , hrEnd               :   ''      // Horizontal rule end string
  , headingStart        :   '\n'    // Heading start prefix
  , headingEnd          :   '\n\n'  // Heading end suffix
  , headingIndentChar   :   '#'     // Character used for heading indentation (e.g., #, ##)
  , codeStart           :   '\n'    // Code block start prefix
  , codeEnd             :   '\n\n'  // Code block end suffix
  , codePad             :   '    '  // Padding for code blocks
  , blockquoteStart     :   '\n'    // Blockquote start prefix
  , blockquoteEnd       :   '\n\n'  // Blockquote end suffix
  , blockquoteColor     :   'blockquote' // Color scheme for blockquote text
  , blockquotePad       :   '  > '  // Padding for blockquote lines
  , blockquotePadColor  :   'syntax' // Color scheme for blockquote padding
  , listStart           :   '\n'    // List start prefix
  , listEnd             :   '\n'    // List end suffix
  , listItemStart       :   ''      // List item start prefix
  , listItemEnd         :   '\n'    // List item end suffix
  , listItemColor       :   'ul'    // Color scheme for list item text
  , listItemPad         :   '  * '  // Padding for list item lines
  , listItemPadColor    :   'syntax' // Color scheme for list item padding
  , paragraphStart      :   ''      // Paragraph start prefix
  , paragraphEnd        :   '\n'    // Paragraph end suffix
} ; // End of defaultOptions object definition

var tokens;     // Stores the array of parsed markdown tokens
var inline;     // Instance of marked.InlineLexer for inline processing
var token;      // Current token being processed
var blockDepth = 0; // Current nesting depth of block-level elements (e.g., blockquotes)

/**
 * Processes inline markdown elements within a given source string.
 *
 * @param   {string} src        The source string to process.
 * @param   {object} options    Configuration options.
 * @returns {string}            The processed output string.
 */
function processInline ( src , options )
{
    var out = '' ; // Output accumulator
    var cap ;      // Capture array for regex matches

    /**
     * Helper function to format and append a link to the output.
     *
     * @param {string} title    Link title.
     * @param {string} href     Link URL.
     */
    function outLink ( title , href )
    {
        out += '[' + color ( title , 'strong' ) + '](' + color ( href , 'link' ) + ')' ;
    }

    // Loop until the source string is empty
    while ( src )
    {
        // Check for escaped characters
        if ( cap = inline.rules.escape.exec ( src ) )
        {
          src = src.substring ( cap[0].length ) ;
          out += cap[1] ;
          continue ;
        }

        // Check for inline code
        if ( cap = inline.rules.code.exec ( src ) )
        {
            src = src.substring ( cap[0].length ) ;
            out += color ( cap[2] , 'code' ) ;
            continue ;
        }

        // Check for autolinks (e.g., <http://example.com>)
        if ( cap = inline.rules.autolink.exec ( src ) )
        {
            src = src.substring ( cap[0].length ) ;
            out += color ( cap[0] , 'link' ) ;
            continue ;
        }

        // Check for URLs (GFM style)
        if ( cap = inline.rules.url.exec ( src ) )
        {
            src = src.substring ( cap[0].length ) ;
            outLink ( cap[1] , cap[1] ) ;
          continue ;
        }

        // Check for HTML tags
        if ( cap = inline.rules.tag.exec ( src ) )
        {
            src = src.substring ( cap[0].length ) ;
            out += cap[0] ;
            continue ;
        }

        // Check for standard markdown links
        if ( cap = inline.rules.link.exec ( src ) )
        {
            src = src.substring ( cap[0].length ) ;
            outLink ( cap[1] , cap[2] ) ;
            continue ;
        }

        // Check for reference links or nolinks
        if ( ( cap = inline.rules.reflink.exec ( src ) )
                || ( cap = inline.rules.nolink.exec ( src ) ) )
        {
            src = src.substring ( cap[0].length ) ;
            out += cap[0] ;
            continue ;
        }

        // Check for strong emphasis (bold)
        if ( cap = inline.rules.strong.exec ( src ) )
        {
            src = src.substring ( cap[0].length ) ;
            out += color ( processInline ( cap[2] || cap[1] ) , 'strong' ) ;
            continue ;
        }

        // Check for emphasis (italic)
        if ( cap = inline.rules.em.exec ( src ) )
        {
            src = src.substring ( cap[0].length ) ;
            out += color ( processInline ( cap[2] || cap[1] ) , 'em' ) ;
            continue ;
        }

        // Check for line breaks
        if ( cap = inline.rules.br.exec ( src ) )
        {
            src = src.substring ( cap[0].length ) ;
            out += '\n' ;
            continue ;
        }

        // Check for strikethrough (GFM style)
        if ( cap = inline.rules.del.exec ( src ) )
        {
            src = src.substring ( cap[0].length ) ;
            out += color ( processInline ( cap[1] ) , 'del' ) ;
            continue ;
        }

        // Check for plain text
        if ( cap = inline.rules.text.exec ( src ) )
        {
            src = src.substring ( cap[0].length ) ;
            out += cap[0] ;
            continue ;
        }

        // If src still has content, it means no rule matched, indicating an error
        if ( src )
        {
          throw new Error ( 'Infinite loop on byte: ' + src.charCodeAt ( 0 ) ) ;
        }
    }

    return out ; // Return the accumulated processed string
}

/**
 * Processes a single markdown token and formats it for console output.
 *
 * @param   {object} options    Configuration options.
 * @returns {string}            Formatted string for the token.
 */
function processToken ( options )
{
    var type    = token.type ; // Type of the current token
    var text    = token.text ; // Text content of the current token
    var content ;              // Variable to hold processed content

    switch ( type )
    {
        case 'space' :
        {
            return options.space ; // Return configured space string
        }
        case 'hr' : // Horizontal Rule
        {
            var hrStr = new Array ( 80 ).join ( '-' ) + '\n' ; // Create a line of 80 hyphens
            return options.hrStart + color ( hrStr , type ) + options.hrEnd ;
        }
        case 'heading' : // Heading (h1, h2, etc.)
        {
            var syntaxFlag = color (
                Array ( token.depth + 1 ).join ( options.headingIndentChar ) ,
                'syntax'
            ) ;
            text    = processInline ( text ) ; // Process inline elements within the heading text
            content = color ( text , type ) ;  // Apply heading color

            return options.headingStart + syntaxFlag + ' ' + content + options.headingEnd ;
        }
        case 'code' : // Code Block
        {
            content = '' ; // Initialize content for code block

            try
            {
                // Attempt to highlight with Cardinal if it's JavaScript
                content = cardinal.highlight ( text ) ;
            }
            catch ( e )
            {
                // Fallback to basic coloring if Cardinal fails
                content = color ( text , type ) ;
            }
            
            // Apply block formatting (padding)
            content = blockFormat ( content , {
                pad_str : options.codePad
            } ) ;

            return options.codeStart + content + options.codeEnd ;
        }
        case 'table' : // Table (TODO: implement table rendering)
        {
            // Currently, tables are not rendered. Placeholder.
        }
        case 'blockquote_start' : // Start of a Blockquote
        {
            content = '' ; // Initialize content for blockquote
            blockDepth++ ; // Increase block depth counter

            // Process all tokens until the blockquote ends
            while ( next ( ).type !== 'blockquote_end' )
            {
                content += processToken ( options ) ;
            }
            // Apply block formatting (padding and color) to the blockquote content
            content = blockFormat ( content , {
                block_color : options.blockquoteColor ,
                pad_str     : options.blockquotePad ,
                pad_color   : options.blockquotePadColor
            } ) ;

            blockDepth-- ; // Decrease block depth counter
            return options.blockquoteStart + content + options.blockquoteEnd ;
        }
        case 'list_start' : // Start of a List (unordered or ordered)
        {
            content = '' ; // Initialize content for list

            // Process all tokens until the list ends
            while ( next ( ).type !== 'list_end' )
            {
                content += processToken ( options ) ;
            }

            return options.listStart + content + options.listEnd ;
        }
        case 'list_item_start' : // Start of a List Item
        {
            content = '' ; // Initialize content for list item

            // Process tokens within the list item until it ends
            while ( next ( ).type !== 'list_item_end' )
            {
                if ( type === 'text' )
                {
                    content += text ;
                }
                else
                {
                    content += processToken ( options ) ;
                }
            }
            // Apply block formatting (padding and color) to the list item content
            content = blockFormat ( content , {
                block_color : options.listItemColor ,
                pad_str     : options.listItemPad ,
                pad_color   : options.listItemPadColor
            } ) ;
            return options.listItemStart + content + options.listItemEnd ;
        }
        case 'paragraph' : // Paragraph
        {
            // If inside another block (like a blockquote), just return the text
            if ( blockDepth > 0 )
            {
                return text ;
            }
            text = processInline ( text ) ; // Process inline elements within the paragraph text
            return options.paragraphStart + color ( text , type ) + options.paragraphEnd ;
        }
        default : // Default case for unhandled token types
        {
            if ( text )
            {
                return text ; // If there's text, return it as is
            }
        }
    }
}

/**
 * Retrieves the next token from the global tokens array.
 * Assigns it to the global 'token' variable.
 *
 * @returns {object} The next token.
 */
function next ( )
{
    return token = tokens.shift ( ) ;
}

/**
 * Applies block-level formatting (like padding and block coloring) to a source string.
 *
 * @param   {string} src    The source string (e.g., code block content).
 * @param   {object} opts   Formatting options.
 * @returns {string}        The formatted string.
 */
function blockFormat ( src , opts )
{
    opts = opts || { } ; // Ensure opts is an object

    var lines       = src.split ( '\n' ) ; // Split source into individual lines
    var padStr      = opts.pad_str || '' ; // Padding string (e.g., '  > ')
    var padColor    = opts.pad_color || opts.block_color ; // Color for the padding string
    var retLines    = [ ] ; // Array to hold formatted lines

    if ( padColor )
    {
        padStr = color ( padStr , padColor ) ; // Apply color to padding string if specified
    }

    lines.forEach ( function ( line )
    {
        if ( opts.block_color )
        {
            line = color ( line , opts.block_color ) ; // Apply block color to the line itself
        }
        retLines.push ( padStr + line ) ; // Add padded and colored line to the result
    } ) ;

    return retLines.join ( '\n' ) ; // Join processed lines back into a single string
}

/**
 * Parses markdown text and renders it for console output.
 *
 * @param   {string} text       The markdown text to parse.
 * @param   {object} options    Optional configuration options.
 * @returns {string}            The rendered console output.
 */
exports.parse = function ( text , options )
{
    tokens  = marked.lexer ( text ) ; // Lex the markdown text into tokens
    inline  = new marked.InlineLexer ( tokens.links ) ; // Create an inline lexer instance
    options = xtend ( defaultOptions , options ) ; // Merge default and user options

    var outputArr = [ ] ; // Array to collect processed token outputs
    var output ;          // Final output string

    // Process each token until there are no more
    while ( next ( ) )
    {
        outputArr.push ( processToken ( options ) ) ;
    }

    // Collapse multiple newlines if the option is enabled
    if ( options.collapseNewlines )
    {
        output = outputArr.join ( '' ).replace ( /\n\n\n/g , '\n\n' ) ;
    }
    else
    {
        output = outputArr.join ( '' ) ; // Just join without collapsing
    }

    // Clean up global variables
    tokens  = null ;
    token   = null ;

    return output ; // Return the final rendered output
}

/**
 * Reads a markdown file, parses its content, and renders it for console output.
 *
 * @param   {string} file       The path to the markdown file.
 * @param   {object} options    Optional configuration options.
 * @returns {string}            The rendered console output.
 * @throws  {Error}             If the file cannot be read.
 */
exports.parseFile = function ( file , options )
{
    var filePath = path.resolve ( __dirname , file ) ; // Resolve the absolute path to the file
    var ret      = '' ; // Initialize return value

    try
    {
        var text = fs.readFileSync ( filePath ).toString ( ) ; // Read file content as string
        ret      = exports.parse ( text , options ) ; // Parse and render the file content
    }
    catch ( e )
    {
        throw e ; // Re-throw any errors encountered during file reading or parsing
    }

    return ret ; // Return the rendered content
}