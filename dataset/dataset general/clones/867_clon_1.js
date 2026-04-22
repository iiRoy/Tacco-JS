var  app   =  angular .  module ( 'ngViewEffects' ,
  [
    'ngRoute' ,  // Core routing module for SPA navigation
    'ngAnimate' // Module for CSS-based animations
  ]
) ;


/*
 *  Configuration block for setting up application routes.
 *  This uses the ngRoute module to define different views
 *  based on the URL path.
 */
app .  config (  function ( $routeProvider  )
{
  $routeProvider

    // Route definition for dynamic pages based on an ID
    .  when (  '/page/:pageId'  ,
    {
      controller :  'pageController' , // Assigns a controller to manage this view

      templateUrl :  function ( params )
      {
        // Dynamically constructs the template URL using the pageId parameter
        return  'views/page'  +  params .  pageId  +  '.html' ;
      }
    }
    )

    // Route for the 'code' section of the application
    .  when (  '/code'  ,
    {
      controller  :   'codeController' ,
      templateUrl :   'views/code.html' // Static template for the code view
    }
    )

    // Route for the 'about' page
    .  when (  '/about'  ,
    {
      templateUrl :   'views/about.html' , // Static template for the about view
      controller  :   'aboutController'
    }
    )

    /*
     *  Default fallback route:
     *  If no other route matches the current URL,
     *  the user will be redirected to the first page.
     */
    .  otherwise (
    {
      redirectTo :   '/page/1'
    }
    ) ;

} ) ;