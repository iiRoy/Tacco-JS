/*
 * This file contains three AngularJS controllers.
 * Each controller manages a specific part of the user interface,
 * interacting with a shared DemoService to synchronize data.
 */

// Controller for the 'top' section of the application.
function TopController ( $scope , DemoService )
{
    // Initialize model variables within the scope.
    $scope . topValue    =    0    ;
    $scope . middleValue = 0 ;
    $scope . bottomValue = 0 ;


    // Set up a watch on the 'topValue' property.
    // Any change to this value will trigger an update in the DemoService.
    $scope . $watch ( 'topValue' ,
        function ( )
        {
            // Call the service method to update the top value.
            DemoService . updateTopValue ( $scope . topValue ) ;
        }
    ) ;


    // Listen for the 'valuesUpdated' event broadcast from the DemoService.
    // This indicates that shared values have changed and need to be reflected locally.
    $scope . $on ( 'valuesUpdated' ,
        function ( )
        {
            // Update local scope variables from the service's current state.
            $scope . middleValue = DemoService . middleValue ;
            $scope . bottomValue = DemoService . bottomValue ;
        }
    ) ;
}


// Controller for the 'middle' section.
function   MiddleController   (   $scope   ,   DemoService   )
{
    // Initializing all values to zero.
    $scope   .   topValue   =   0   ;
    $scope   .   middleValue   =   0   ;
    $scope   .   bottomValue   =   0   ;


    // Watch for changes specifically in the 'middleValue'.
    $scope   .   $watch   (   'middleValue'   ,
        function   (   )
        {
            // Update the service when the middle value changes.
            DemoService   .   updateMiddleValue   (   $scope   .   middleValue   )   ;
        }
    )   ;


    // React to the global 'valuesUpdated' event.
    $scope   .   $on   (   'valuesUpdated'   ,
        function   (   )
        {
            /*
             * When values are updated elsewhere, this controller
             * needs to refresh its view of the top and bottom values
             * from the shared service.
             */
            $scope   .   topValue   =   DemoService   .   topValue   ;
            $scope   .   bottomValue   =   DemoService   .   bottomValue   ;
        }
    )   ;
}


// Controller for the 'bottom' section.
// This function handles interactions related to the bottom part of the UI.
function BottomController ( $scope , DemoService )
{
    // Set initial values for all three properties.
    $scope . topValue      =      0      ;
    $scope . middleValue   =   0   ;
    $scope . bottomValue   =   0   ;


    // Establish a watch on the 'bottomValue' variable.
    // Any modification to this will trigger the associated service update.
    $scope . $watch ( 'bottomValue' ,
        function ( )
        {
            // Delegate the actual update logic to the DemoService.
            DemoService . updateBottomValue ( $scope . bottomValue ) ;
        }
    ) ;


    // Handle the 'valuesUpdated' event to keep this controller's state consistent.
    $scope . $on ( 'valuesUpdated' ,
        function ( )
        {
            // Fetch the latest top and middle values from the service.
            $scope . topValue    =    DemoService . topValue    ;
            $scope . middleValue = DemoService . middleValue ;
        }
    ) ;
}