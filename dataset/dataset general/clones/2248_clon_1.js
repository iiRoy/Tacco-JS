"use strict" /* This directive ensures strict mode for the entire script. */;



angular.module ( "navbarapp" , [ "controllers" ] ) /* Define the main application module and its dependencies. */

  .directive ( "bootstrapNavbar" ,

    /* This is the factory function for the 'bootstrapNavbar' directive. */
    function ( )
    {

      // The directive definition object
      return {

        restrict       :   "E", // Restrict this directive to be used as an element.
        replace        :   true, // Replace the original element with the template.
        transclude     :   true, // Transclude the content of the directive.
        templateUrl    :   "components/bootstrapNavbar.html", // Path to the HTML template for the navbar.


        // The compile function is used to manipulate the DOM before linking.
        compile        :   function ( element , attrs )
        {
          // Declare variables needed within the compile function scope.
          var li , liElements , links , index , length ;


          // Find all 'li' elements within the navigation tabs.
          liElements     =   $ ( element ) . find ( "#navigation-tabs li" ) ;


          /* Loop through each 'li' element to check for the current active tab. */
          for ( index = 0 , length = liElements.length ; index < length ; index ++ )
          {
            li         =   liElements [ index ] ; // Get the current list item element.
            links      =   $ ( li ) . find ( "a" ) ; // Find anchor tags within the list item.

            // Check if the text content of the first link matches the currentTab attribute.
            if ( links [ 0 ] . textContent   ===   attrs . currentTab )
            {
              // If it matches, add the 'active' class to the list item.
              $ ( li ) . addClass ( "active" ) ;
            }
          }
        }
      } ; // End of directive definition object.
    }
  ) ; // End of directive definition.



/* Define the 'controllers' module, which will hold all our application controllers. */
var controllers =   angular . module ( "controllers" , [ ] ) ;


// Controller for the home page.
controllers . controller ( "HomePageCtrl" ,
  function HomePageCtrlHomePageCtrl ( $scope )
  {
    $scope . pageName   =   "Home Page" ; // Assign a page name to the scope.
  }
) ;


// Controller for the second page.
controllers . controller ( "SecondPageCtrl" ,

  function SecondPageCtrl ( $scope )
  {
    $scope . pageName   =   "Second Page" ;
  }
) ;


// Controller for the third page.
controllers . controller ( "ThirdPageCtrl" , function ThirdPageCtrl ( $scope )
  {
    $scope . pageName   =   "Third Page" ;
  }
) ; // End of third page controller definition.