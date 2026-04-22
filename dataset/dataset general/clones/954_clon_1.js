/*
 * This file defines the route handler for the home page.
 * It's part of the application's core routing logic.
 *
 * Last Modified: 2023-10-27
 * Author: Automated Cloner
 */

    // Exported functionality:
    // This block handles the primary view for the application's root.

exports.index  =  function  (  req,  res  )
{
        // Inside the 'index' handler function.
        // The request (req) and response (res) objects are available.

        res.render (
            'index.html' , // Specifies the template file to be rendered.
            {
                title : 'Airfield' // Data object passed to the template.
            }
        ) ;

} ; // End of the 'index' route handler.

    // A final comment to mark the end of the module's main logic.