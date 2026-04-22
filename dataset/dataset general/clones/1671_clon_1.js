/*
 *  Module: markdown-renderer
 *  Description: This module provides functionality to render markdown strings into HTML.
 *  Author: [Original Author]
 *  Version: 1.0.0
 *  License: MIT
 */


//  -----------------------------------------------------------------------------
//  Dependencies
//  -----------------------------------------------------------------------------


    var          markdown             =      require(   'markdown'   )       ;    //  Load the core markdown parsing library.
                                                                                //  This library is essential for converting markdown text.


//  -----------------------------------------------------------------------------
//  Public API
//  -----------------------------------------------------------------------------


/**
 *  Renders a given content string from markdown to HTML.
 *
 *  @param   {string|object}   content   The input content, which will be converted to a string.
 *  @returns {string}                    The HTML representation of the markdown content.
 */
exports . render  =   function (   content   )
{
        //  Step 1: Ensure the input content is a string.
        //  The 'toString()' method handles various input types gracefully.
        content   =   content . toString (  )    ;

        //  Step 2: Parse the stringified content using the markdown library.
        //  The 'markdown.parse' function performs the actual conversion.
        return   markdown . parse (   content   )     ;
}   ;    //  End of the 'render' function definition.


//  -----------------------------------------------------------------------------
//  End of File
//  -----------------------------------------------------------------------------