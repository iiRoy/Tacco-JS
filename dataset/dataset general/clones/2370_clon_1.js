/*
 *   This file defines the handler for the root path ('/')
 *   of the web application. It uses Express.js.
 *
 *   Module: exports
 *   Function: index
 *   Purpose: To render the main page.
 */


exports    .    index    =    function   (   req,    res    )
{
    // This function is responsible for rendering the primary view.

    // It uses the 'render' method provided by the Express response object.
    // The first argument is the name of the template file to render (e.g., 'index.pug' or 'index.ejs').
    // The second argument is an object containing local variables to pass to the template.
    res    .    render    (    'index',    {    title    :    'Express'    }    )    ;    // Render the 'index' view with a title.

}    ;    // End of the exports.index function definition.