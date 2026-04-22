/*
 * This file defines the primary route handlers for the web application.
 * It manages rendering of different views and partials.
 */



exports.index = function  (  req  ,  res  )
{
    // Handler for the main application home page.
    // It provides a dynamic title for the view.
    res  .  render  (  'index'  ,  {  title  :  "Couchbase Ideas"  }  )  ;

}  ;




exports.login  =  function  (  req  ,  res  )
{
    // This function is responsible for rendering the user login page.
    res  .  render  (  'login'  )  ;
}  ;


/*
 * The following function manages the serving of UI partials.
 * It retrieves the partial name from the request parameters.
 */

exports.partials = function   ( req  ,  res )
{
    // Extract the name of the partial from the request parameters.
    var   name   =   req.params.name   ;

    // Render the requested partial view, located in the 'partials' directory.
    res.render(   'partials/'   +   name   )   ;
}   ;