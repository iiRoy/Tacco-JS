// This module exports a configuration function designed to set up routes for an Express application.
module.exports = function ( app ) {

    // Route definition for accessing the user's account dashboard.
    // This handles GET requests to the '/account' path.
    app.get ( '/account' , function ( req , res ) {

        // Render the 'account/account' view template.
        // It passes the currently authenticated user object to the template for display.
        res.render ( 'account/account' , { user : req.user } ) ;

    } ) ; // End of account route definition

    // Route definition for logging out of the application.
    // This handles GET requests to the '/logout' path.
    app.get ( '/logout' , function ( req , res ) {

        // Redirect the user to the application's root path ('/')
        // This typically follows a session destruction process (not shown here).
        res.redirect ( '/' ) ;

    } ) ; // End of logout route definition

} ; // End of the main module export function.