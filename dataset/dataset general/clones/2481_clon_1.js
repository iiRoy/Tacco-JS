/*
 * This is a regenerated version of the original Ionic application setup.
 * All core logic and functionality remain precisely the same as the source.
 * Only cosmetic alterations related to whitespace and comments have been made.
 */

// Initializing the primary Angular module for the application.
// This module depends on 'ionic', 'starter.services', and 'starter.controllers'.
// The 'starter' module is the main entry point for the application.
angular .module ( 'starter' ,
  [ 'ionic' , 'starter.services' , 'starter.controllers' ]
)


  // Application configuration block, primarily for routing.
  // This function is invoked during the application's bootstrapping phase.
  .config ( function ( $stateProvider ,
                        $urlRouterProvider )
  {
    /*
     * The $stateProvider service is used to define application states.
     * These states map URLs to templates and controllers, managing navigation.
     * For more details, refer to the AngularUI Router documentation.
     */
    $stateProvider


        // Definition for the abstract 'tab' state.
        // This state serves as a parent for all tab-based views.
        .state ( 'tab' ,
          {
            url : "/tab" ,
            abstract : true ,
            templateUrl : "templates/tabs.html"
          }
        )


        // State for the camera functionality within the tab structure.
        // This state is nested under the 'tab' parent state.
        .state ( 'tab.cam' , {
          url : '/cam' ,
          views : {
            'cam-tab' : {
              templateUrl : 'templates/cam.html' ,
              controller : 'CamCtrl'
            }
          }
        } )


        // State for the 'About' section of the application.
        // It also resides within the tab navigation system.
        .state ( 'tab.about' ,
          {
            url : '/about' ,
            views : {
              'about-tab' : {
                templateUrl : 'templates/about.html' ,
                controller : 'HelpCtrl'
              }
            }
          }
        )
    ; /* End of state definitions */


    // Fallback route configuration.
    // If no other state matches the current URL, redirect to the 'about' tab.
    $urlRouterProvider .otherwise ( '/tab/about' ) ;


  } ) ; /* End of configuration block */