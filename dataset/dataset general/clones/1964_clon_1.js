var  taskApp  =  angular.module ( 'taskApp' ,  [ 'ui.router' ] ) ; // Define the main Angular application module.

// Configure the application's routing.
taskApp.config ( function ( $stateProvider ,  $urlRouterProvider ) {

    // If no specific route is matched, redirect to the '/list' URL.
    $urlRouterProvider.otherwise ( "/list" ) ;


    // Define various application states.
    $stateProvider

        // State for displaying the list of tasks.
        .state ( 'list' ,  {
            url         : "/list" ,                 // URL path for this state.
            templateUrl : "partials/list.html" ,    // Template to load for this state.
            controller  : ListCtrl                  // Controller associated with this state.
        } )

        // State for displaying tasks in a table format.
        .state ( 'table' ,  {
            url         : "/table" ,                // URL path for this state.
            templateUrl : "partials/table.html" ,   // Template to load for this state.
            controller  : TableCtrl                 // Controller associated with this state.
        } ) ;

} ) ;


// Define a factory service named 'stateService' to manage application data and shared logic.
taskApp.factory ( 'stateService' ,  function ( $http ) {

    var  state  =  { } ; // Initialize an empty object to hold the service's state.

    // Arrays to store fetched tasks and projects.
    state.tasks    =  [ ] ;
    state.projects =  [ ] ;


    // Function to refresh tasks and projects data from the server.
    state.refresh  =  function ( ) {
        console.log ( 'refreshing tasks' ) ; // Log a message indicating data refresh.
        $http.put ( '/tasks' ) ;             // Send a PUT request (e.g., to trigger server-side update).

        // After a short delay, fetch the updated tasks and projects.
        setTimeout ( function ( ) {
            $http.get ( '/tasks' ) . success ( function ( data ) {
                state.tasks  =  data ; // Update the tasks array.
            } ) ;
            $http.get ( '/projects' ) . success ( function ( data ) {
                state.projects  =  data ; // Update the projects array.
            } ) ;
        } ,  1000 ) ; // 1-second delay.
    } ;


    // Function to determine task urgency (assumes 'taskUrgency' is globally defined).
    state.urgency  =  function ( task ) {
        return  taskUrgency ( task ) ;
    } ;


    // Function to check if a task is not done (assumes 'taskNotDone' is globally defined).
    state.taskNotDone  =  function ( task ) {
        return  taskNotDone ( task ) ;
    } ;


    // Function to format a date string into a more readable format.
    state.prettyDate  =  function ( d ) {
        if ( ! d ) return  '' ; // Return empty string if date is not provided.

        // Extract year, month, and day from the YYYYMMDD string.
        var  year   =  d.slice ( 0 , 4 ) ;
        var  month  =  d.slice ( 4 , 6 ) ;
        var  day    =  d.slice ( 6 , 8 ) ;

        // Create a Date object using UTC values to avoid timezone issues.
        var  date   =  new  Date ( Date.UTC ( year ,  month ,  day ) ) ;

        return  date.toLocaleDateString ( ) ; // Return the locale-specific date string.
    } ;


    // Initial data fetch when the service is instantiated.
    $http.get ( '/tasks' ) . success ( function ( data ) {
        state.tasks  =  data ; // Populate tasks on initial load.
    } ) ;
    $http.get ( '/projects' ) . success ( function ( data ) {
        state.projects  =  data ; // Populate projects on initial load.
    } ) ;


    return  state ; // Return the state service object.

} ) ;


// Main application controller.
// Handles global events and actions like navigation tab management and undo.
function  MainCtrl ( $scope ,  $location ,  stateService ,  $http ) {

    // Listen for successful changes in the application's URL.
    $scope.$on ( '$locationChangeSuccess' ,  function ( ) {

        // Array of tab IDs to manage.
        var  tabs  =  [ 'list-tab' ,  'table-tab' ] ;

        // Remove the 'active' class from all tabs.
        for ( var  i  in  tabs ) {
            document.getElementById ( tabs [ i ] ) . classList . remove ( 'active' ) ;
        }

        // Add the 'active' class to the currently selected tab based on the URL.
        switch ( $location.url ( ) ) {
            case  '/table' :
                document.getElementById ( 'table-tab' ) . classList . add ( 'active' ) ;
                break ;
            default : // Default case, e.g., for '/list' or any other URL.
                document.getElementById ( 'list-tab' ) . classList . add ( 'active' ) ;
        }
    } ) ;


    // Function to perform an undo operation by sending a POST request.
    $scope.undo  =  function ( ) {
        $http.post ( '/undo' ,
            { headers : { "Content-Type" : "application/json; charset=UTF-8" } }
        ) . success ( function ( ) {
            // No specific UI update needed on success, server handles undo.
        } ) ;
    } ;


    // Function to trigger a refresh of tasks data via the state service.
    $scope.refreshTasks  =  function ( ) {
        stateService.refresh ( ) ; // Delegate to the shared stateService.
    } ;
}


// Controller for the list view, managing task interactions.
function  ListCtrl ( $scope ,  $http ,  stateService ) {

    // Expose stateService and its utility functions directly to the scope.
    $scope.state       =  stateService ;
    $scope.urgency     =  stateService.urgency ;
    $scope.taskNotDone =  stateService.taskNotDone ;
    $scope.prettyDate  =  stateService.prettyDate ;


    /**
     * Toggles the currently selected task.
     * If the clicked task 't' is already the current one, it's deselected.
     * Otherwise, 't' becomes the new current task.
     * Resets modification and annotation modes.
     * @param {object} t - The task object being toggled.
     */
    $scope.toggleCurrent  =  function ( t ) {
        if ( $scope.current  ===  t ) {
            $scope.current  =  undefined ; // Deselect the task.
        } else {
            $scope.current  =  t ;         // Select the new task.
        }
        $scope.modify   =  false ; // Ensure modify mode is off.
        $scope.annotate =  false ; // Ensure annotate mode is off.
    } ;


    /**
     * Toggles the modification mode for the current task.
     * Updates the text of the 'task-edit' button to reflect the current mode.
     */
    $scope.toggleModify  =  function ( ) {
        $scope.modify  =  ! $scope.modify ; // Invert the boolean flag for modify mode.
        var  button    =  document.getElementById ( 'task-edit' ) ;
        if ( $scope.modify ) {
            button.innerHTML  =  '&#x270e; cancel' ; // Change button text to 'cancel'.
        } else {
            button.innerHTML  =  '&#x270e; modify' ; // Change button text back to 'modify'.
        }
    } ;


    /**
     * Toggles the annotation mode for the current task.
     */
    $scope.toggleAnnotate  =  function ( ) {
        $scope.annotate  =  ! $scope.annotate ; // Invert the boolean flag for annotate mode.
    } ;


    // Watch for changes in the 'current' task to update the UI (e.g., add/remove 'active' class).
    $scope.$watch ( "current" ,  function ( ) {
        var  child  =  document.getElementById ( 'task-list' ) . firstElementChild ;

        // Iterate through all child elements of 'task-list' and remove 'active' class.
        while ( child ) {
            child.classList.remove ( 'active' ) ;
            child  =  child.nextElementSibling ;
        }

        // If a task is currently selected, add the 'active' class to its corresponding DOM element.
        if ( $scope.current ) {
            document.getElementById ( $scope.current.uuid ) . classList . add ( 'active' ) ;
        }
    } ,  true ) ; // The 'true' argument enables deep watching for object properties.


    /**
     * Marks a task as finished.
     * Sends a POST request to the server to update the task's status.
     * On successful completion, deselects the current task and refreshes the task list.
     * @param {object} task - The task object to be finished.
     */
    $scope.finishTask  =  function ( task ) {
        $http.post ( '/tasks/'  +  task.uuid ,
            { headers : { "Content-Type" : "application/json; charset=UTF-8" } }
        ) . success ( function ( ) {
            $scope.current  =  undefined ; // Deselect the task.
            $scope.refreshTasks ( ) ;      // Refresh tasks to reflect the change.
        } ) ;
    } ;


    /**
     * Deletes a task from the system.
     * Sends a DELETE request to the server.
     * On success, deselects the current task and refreshes the task list.
     * Logs success or error messages to the console.
     * @param {object} task - The task object to be deleted.
     */
    $scope.deleteTask  =  function ( task ) {
        $http.delete ( '/tasks/'  +  task.uuid ,
            { headers : { "Content-Type" : "application/json; charset=UTF-8" } }
        ) . success ( function ( ) {
            console.log ( "Delete Successful" ) ; // Log success message.
            $scope.current  =  undefined ;         // Deselect the task.
            $scope.refreshTasks ( ) ;              // Refresh tasks to remove the deleted one.
        } ) . error ( function ( data ,  status ) {
            console.log ( "Delete Failed" ,  data ,  status ) ; // Log error details.
        } ) ;
    } ;


    /**
     * Modifies the details of the currently selected task.
     * Sends a PUT request with the updated description, project, and priority.
     * Requires a description; if missing, an error class is added to the input field.
     * On success, exits modify mode and refreshes the task list.
     */
    $scope.modifyTask  =  function ( ) {
        if ( $scope.current.description ) { // Check if a description is provided.
            var  submissionData  =  {
                description : $scope.current.description ,
                project     : $scope.current.project ,
                priority    : $scope.current.priority
            } ;
            $http.put ( '/tasks/'  +  $scope.current.uuid ,
                JSON.stringify ( submissionData ) , // Convert data to JSON string.
                { headers : { "Content-Type" : "application/json; charset=UTF-8" } }
            ) . success ( function ( ) {
                console.log ( 'SUCCESS!' ) ;   // Log successful modification.
                $scope.toggleModify ( ) ;      // Exit modify mode.
                $scope.refreshTasks ( ) ;      // Refresh tasks to show updated data.
            } ) ;
        } else {
            // If description is missing, highlight the input field as an error.
            document.getElementById ( 'new-description' ) . classList . add ( 'error' ) ;
        }
    } ;


    $scope.newAnnotation  =  { } ; // Initialize an object to hold new annotation data.

    /**
     * Adds a new annotation to the currently selected task.
     * Sends a POST request to the server with the annotation text.
     * Requires an annotation description.
     * On success, exits annotate mode, clears the input, and refreshes the state.
     */
    $scope.annotateTask  =  function ( ) {
        console.log ( $scope.newAnnotation.description ) ; // Log the annotation description.
        if ( $scope.newAnnotation.description ) {          // Check if description is provided.
            $http.post ( 'tasks/'  +  $scope.current.uuid  +  '/annotate' ,
                JSON.stringify ( { "annotation" : $scope.newAnnotation.description } ) , // JSON payload.
                { headers : { "Content-Type" : "application/json; charset=UTF-8" } }
            ) . success ( function ( ) {
                console.log ( 'Annotation Successful' ) ; // Log success.
                $scope.annotate        =  false ;         // Exit annotation mode.
                $scope.newAnnotation   =  { } ;           // Clear the annotation input.
                $scope.state.refresh ( ) ;                // Refresh state to show new annotation.
            } ) ;
        }
    } ;


    $scope.newtask  =  { } ; // Initialize an object to hold new task data.

    /**
     * Adds a new task to the system.
     * Sends a POST request with the new task's description, project, and priority.
     * Requires a description; if missing, an error class is added to the input field.
     * On success, clears the new task input and refreshes the task list.
     */
    $scope.addTask  =  function ( ) {
        if ( $scope.newtask.description ) { // Check if a description is provided.
            var  submissionData  =  {
                description : $scope.newtask.description ,
                project     : $scope.newtask.project ,
                priority    : $scope.newtask.priority
            } ;
            $http.post ( '/tasks' ,
                JSON.stringify ( submissionData ) , // Convert data to JSON string.
                { headers : { "Content-Type" : "application/json; charset=UTF-8" } }
            ) . success ( function ( ) {
                $scope.newtask  =  { } ;      // Clear the new task input fields.
                $scope.refreshTasks ( ) ;     // Refresh tasks to display the newly added one.
            } ) ;
        } else {
            // If description is missing, highlight the input field as an error.
            document.getElementById ( 'new-description' ) . classList . add ( 'error' ) ;
        }
    } ;


    // Watch for changes in the new task description field.
    // If text is entered, remove the 'error' class from the input field.
    $scope.$watch ( 'newtask.description' ,  function ( ) {
        if ( $scope.newtask.description ) {
            document.getElementById ( 'new-description' ) . classList . remove ( 'error' ) ;
        }
    } ) ;

}


// Controller for the table view.
// This controller primarily exposes shared state service functions to its scope.
function  TableCtrl ( $scope ,  stateService ,  $http ) {

    // Assign the shared state service to the scope for direct access in the view.
    $scope.state       =  stateService ;

    // Expose utility functions from the state service directly to the scope.
    $scope.urgency     =  stateService.urgency ;
    $scope.taskNotDone =  stateService.taskNotDone ;
    $scope.prettyDate  =  stateService.prettyDate ;

    // This controller currently serves as a simple pass-through for stateService data and methods.
}