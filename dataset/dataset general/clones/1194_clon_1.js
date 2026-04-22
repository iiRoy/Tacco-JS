/*
 *  This file contains the core logic for the to-markdown library.
 *
 *  It's an HTML to Markdown conversion utility.
 *
 *  Original Copyright (c) 2011 Dom Christie;
 *  Licensed under the MIT License.
 *
 *  This is a Type-I clone, meaning only whitespace and comments
 *  have been altered from the original source.
 *  All identifiers, operators, and expressions are identical.
 *
 */

// Check for the 'he' library. If not present globally, attempt to require it.
if (   typeof he    !==    'object'    &&    typeof require    ===    'function'   )
{
  var he = require   (   'he'   )   ;
}


var toMarkdown   =    function   (string)
{

  // Define the core HTML elements and their Markdown replacement rules.
  var ELEMENTS    =
  [
    {
      patterns:   'p'   ,
      replacement:   function   (str,   attrs,   innerHTML)
      {
        // Paragraphs are converted to double newlines around their content.
        return   innerHTML   ?   '\n\n'   +   innerHTML   +   '\n'   :   ''   ;
      }
    }   ,
    {
      patterns:   'br'   ,
      type:   'void'   ,
      replacement:   '\n'
    }   ,
    {
      patterns:   'h([1-6])'   ,
      replacement:   function   (str,   hLevel,   attrs,   innerHTML)
      {
        var hPrefix   =   ''   ;
        // Generate the appropriate number of '#' for the heading level.
        for   (   var   i   =   0   ;   i   <   hLevel   ;   i++   )
        {
          hPrefix   +=   '#'   ;
        }
        return   '\n\n'   +   hPrefix   +   ' '   +   innerHTML   +   '\n'   ;
      }
    }   ,
    {
      patterns:   'hr'   ,
      type:   'void'   ,
      replacement:   '\n\n* * *\n'
    }   ,
    {
      patterns:   'a'   ,
      replacement:   function   (str,   attrs,   innerHTML)
      {
        // Extract href and title attributes from the HTML tag.
        var href   =   attrs.match   (   attrRegExp   (   'href'   )   )   ,
            title   =   attrs.match   (   attrRegExp   (   'title'   )   )   ;
        // Format as a Markdown link: [text](url "title")
        return   href   ?   '['   +   innerHTML   +   ']'   +   '('   +   href[1]   +   (   title   &&   title[1]   ?   ' "'   +   title[1]   +   '"'   :   ''   )   +   ')'   :   str   ;
      }
    }   ,
    {
      patterns:   [   'b'   ,   'strong'   ]   ,
      replacement:   function   (str,   attrs,   innerHTML)
      {
        // Bold text using double asterisks.
        return   innerHTML   ?   '**'   +   innerHTML   +   '**'   :   ''   ;
      }
    }   ,
    {
      patterns:   [   'i'   ,   'em'   ]   ,
      replacement:   function   (str,   attrs,   innerHTML)
      {
        // Italic text using single underscores.
        return   innerHTML   ?   '_'   +   innerHTML   +   '_'   :   ''   ;
      }
    }   ,
    {
      patterns:   'code'   ,
      replacement:   function   (str,   attrs,   innerHTML)
      {
        // Inline code using backticks, with HTML entities decoded.
        return   innerHTML   ?   '`'   +   he.decode   (   innerHTML   )   +   '`'   :   ''   ;
      }
    }   ,
    {
      patterns:   'img'   ,
      type:   'void'   ,
      replacement:   function   (str,   attrs,   innerHTML)
      {
        // Extract src, alt, and title for images.
        var src   =   attrs.match   (   attrRegExp   (   'src'   )   )   ,
            alt   =   attrs.match   (   attrRegExp   (   'alt'   )   )   ,
            title   =   attrs.match   (   attrRegExp   (   'title'   )   )   ;
        // Format as Markdown image: ![alt text](url "title")
        return   '!['   +   (   alt   &&   alt[1]   ?   alt[1]   :   ''   )   +   ']'   +   '('   +   src[1]   +   (   title   &&   title[1]   ?   ' "'   +   title[1]   +   '"'   :   ''   )   +   ')'   ;
      }
    }
  ]   ;


  // Iterate through the defined elements and apply their replacements.
  for   (   var   i   =   0   ,   len   =   ELEMENTS.length   ;   i   <   len   ;   i++   )
  {
    if   (   typeof   ELEMENTS[i].patterns   ===   'string'   )
    {
      // Handle single pattern strings.
      string   =   replaceEls   (   string   ,   {   tag:   ELEMENTS[i].patterns   ,   replacement:   ELEMENTS[i].replacement   ,   type:    ELEMENTS[i].type   }   )   ;
    }
    else
    {
      // Handle arrays of patterns.
      for   (   var   j   =   0   ,   pLen   =   ELEMENTS[i].patterns.length   ;   j   <   pLen   ;   j++   )
      {
        string   =   replaceEls   (   string   ,   {   tag:   ELEMENTS[i].patterns[j]   ,   replacement:   ELEMENTS[i].replacement   ,   type:    ELEMENTS[i].type   }   )   ;
      }
    }
  }


  /**
   * Replaces HTML elements with their Markdown equivalents.
   *
   * @param {string} html - The input HTML string.
   * @param {object} elProperties - Object containing tag, replacement, and type.
   * @returns {string} The HTML string with elements replaced.
   */
  function   replaceEls   (html,   elProperties)
  {
    // Construct the regex pattern based on whether the element is void or not.
    var pattern   =   elProperties.type   ===   'void'   ?   '<'   +   elProperties.tag   +   '\\b([^>]*)\\/?>'   :   '<'   +   elProperties.tag   +   '\\b([^>]*)>([\\s\\S]*?)<\\/'   +   elProperties.tag   +   '>'   ,
        regex   =   new   RegExp   (   pattern   ,   'gi'   )   ,
        markdown   =   ''   ; // Initialize markdown result.

    if   (   typeof   elProperties.replacement   ===   'string'   )
    {
      // If replacement is a simple string, use it directly.
      markdown   =   html.replace   (   regex   ,   elProperties.replacement   )   ;
    }
    else
    {
      // If replacement is a function, call it with matched groups.
      markdown   =   html.replace   (   regex   ,   function   (str,   p1,   p2,   p3)
      {
        return   elProperties.replacement.call   (   this   ,   str   ,   p1   ,   p2   ,   p3   )   ;
      }   )   ;
    }
    return   markdown   ;
  }


  /**
   * Generates a regular expression to match an HTML attribute and capture its value.
   *
   * @param {string} attr - The name of the attribute to match (e.g., 'href').
   * @returns {RegExp} A regular expression for matching the attribute.
   */
  function   attrRegExp   (attr)
  {
    return   new   RegExp   (   attr   +   '\\s*=\\s*["\']?([^"\']*)["\']?'   ,   'i'   )   ;
  }


  // --- Handle preformatted code blocks ---

  // Removed old comments about ` and ´. The function now correctly handles pre tags.
  string   =   string.replace   (   /<pre\b[^>]*>([\s\S]+?(?=<\/pre>))<\/pre>/gi   ,   function   (str,   innerHTML)
  {
    // Convert tabs to two spaces for consistency in code blocks.
    innerHTML   =   innerHTML.replace   (   /^\t+/g   ,   '  '   )   ;
    // Indent each line within the pre block by four spaces.
    innerHTML   =   innerHTML.replace   (   /\n/g   ,   '\n    '   )   ;
    // Add leading and trailing newlines and initial indentation.
    return   '\n\n    '   +   innerHTML   +   '\n'   ;
  }   )   ;


  // --- Handle Lists ---

  // Escape numbers that might be misinterpreted as ordered list markers.
  // This prevents `1. Some text` from becoming a list item if it's not intended.
  // It also ensures that the escape happens only if there are 0-3 leading spaces,
  // preventing interference with indented code blocks (which use 4+ spaces).
  string   =   string.replace   (   /^(\s{0,3}\d+)\. /g   ,   '$1\\. '   )   ;

  // Process lists by starting with the innermost lists (those without child lists of the same type).
  // This iterative approach ensures correct nesting conversion.
  var noChildrenRegex   =   /<(ul|ol)\b[^>]*>(?:(?!<ul|<ol)[\s\S])*?<\/\1>/gi   ;
  while   (   string.match   (   noChildrenRegex   )   )
  {
    string   =   string.replace   (   noChildrenRegex   ,   function   (str)
    {
      // Replace the matched list with its Markdown equivalent.
      return   replaceLists   (   str   )   ;
    }   )   ;
  }


  /**
   * Converts HTML lists (ul/ol) within a given HTML fragment to Markdown.
   *
   * @param {string} html - The HTML string containing lists.
   * @returns {string} The Markdown representation of the lists.
   */
  function   replaceLists   (html)
  {

    html   =   html.replace   (   /<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi   ,   function   (str,   listType,   innerHTML)
    {
      // Split the inner HTML by </li> to get individual list items.
      var lis   =   innerHTML.split   (   '</li>'   )   ;
      // Remove the last empty element resulting from the split.
      lis.splice   (   lis.length   -   1   ,   1   )   ;

      // Process each list item.
      for   (   i   =   0   ,   len   =   lis.length   ;   i   <   len   ;   i++   )
      {
        if   (   lis[i]   )
        {
          // Determine the Markdown prefix for ordered (1. ) or unordered (* ) lists.
          var prefix   =   (   listType   ===   'ol'   )   ?   (   i   +   1   )   +   ".  "   :   "*   "   ;
          lis[i]   =   lis[i].replace   (   /\s*<li[^>]*>([\s\S]*)/i   ,   function   (str,   innerHTML)
          {

            // Trim leading whitespace from the list item's content.
            innerHTML   =   innerHTML.replace   (   /^\s+/   ,   ''   )   ;
            // Indent subsequent lines within a list item for proper Markdown rendering.
            innerHTML   =   innerHTML.replace   (   /\n\n/g   ,   '\n\n    '   )   ;
            // Indent nested lists correctly.
            innerHTML   =   innerHTML.replace   (   /\n([ ]*)+(\*|\d+\.) /g   ,   '\n$1    $2 '   )   ;
            return   prefix   +   innerHTML   ;
          }   )   ;
        }
      }
      return   lis.join   (   '\n'   )   ;
    }   )   ;
    // Add double newlines before and after the list, and clean up trailing whitespace.
    return   '\n\n'   +   html.replace   (   /[ \t]+\n|\s+$/g   ,   ''   )   ;
  }


  // --- Handle Blockquotes ---
  // Regex to find the deepest nested blockquotes first.
  var deepest   =   /<blockquote\b[^>]*>((?:(?!<blockquote)[\s\S])*?)<\/blockquote>/gi   ;
  while   (   string.match   (   deepest   )   )
  {
    string   =   string.replace   (   deepest   ,   function   (str)
    {
      // Replace the matched blockquote with its Markdown equivalent.
      return   replaceBlockquotes   (   str   )   ;
    }   )   ;
  }


  /**
   * Converts HTML blockquotes to Markdown format.
   *
   * @param {string} html - The HTML string containing blockquotes.
   * @returns {string} The Markdown representation of the blockquotes.
   */
  function   replaceBlockquotes   (html)
  {
    html   =   html.replace   (   /<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi   ,   function   (str,   inner)
    {
      // Trim whitespace from inner content.
      inner   =   inner.replace   (   /^\s+|\s+$/g   ,   ''   )   ;
      // Clean up common whitespace issues.
      inner   =   cleanUp   (   inner   )   ;
      // Prefix each line with '> ' for blockquote styling.
      inner   =   inner.replace   (   /^/gm   ,   '> '   )   ;
      // Adjust indentation for nested blockquotes (e.g., `> > >` instead of `>   >   >`).
      inner   =   inner.replace   (   /^(>([ \t]{2,}>)+)/gm   ,   '> >'   )   ;
      return   inner   ;
    }   )   ;
    return   html   ;
  }


  /**
   * Performs general cleanup on the Markdown output.
   * Removes excessive whitespace and normalizes line breaks.
   *
   * @param {string} string - The Markdown string to clean.
   * @returns {string} The cleaned Markdown string.
   */
  function   cleanUp   (string)
  {
    // Trim leading/trailing whitespace including tabs and newlines.
    string   =   string.replace   (   /^[\t\r\n]+|[\t\r\n]+$/g   ,   ''   )   ;
    // Reduce multiple blank lines to a single blank line.
    string   =   string.replace   (   /\n\s+\n/g   ,   '\n\n'   )   ;
    // Limit consecutive line breaks to a maximum of two.
    string   =   string.replace   (   /\n{3,}/g   ,   '\n\n'   )   ;
    return   string   ;
  }


  // Apply final cleanup and return the resulting Markdown.
  return   cleanUp   (   string   )   ;
}   ;


// Export the toMarkdown function for use in Node.js or other CommonJS environments.
if   (   typeof   exports   ===   'object'   )
{
  exports.toMarkdown   =   toMarkdown   ;
}