/* This is an Angular module definition for the To-Do application. */
angular . module ( 'app.todoCtrl' , [ 'ngPouch' ] )

    // Controller definition for managing To-Do list functionalities.
    . controller ( 'TodoController' , [ '$scope' , '$q' , 'ngPouch' , 'Todo' , 'PouchConflict' ,
        /*
         * Main controller function.
         * Injects necessary services: $scope, $q, ngPouch, Todo, PouchConflict.
         */
        function ( $scope , $q , ngPouch , Todo , PouchConflict ) {

            // Initialize the form object for data binding.
            $scope . form = { } ;

            // Array to hold all the To-Do items.
            $scope . todos = [ ] ;

            // Flag to indicate user login status.
            $scope . logged_in = false ;

            // Store the ngPouch service reference on scope for direct access if needed.
            $scope . ng_pouch = ngPouch ;

            // The original code had ngPouch.reset() commented out. Keeping it commented here.
            // ngPouch.reset();

            // Publish function to synchronize data from PouchDB.
            ngPouch . publish ( function ( ) {

                // Fetch all To-Do items from the database.
                var p1 = Todo . all ( )
                    . then ( function ( results ) {
                        // Update the scope's todos array with fetched data.
                        $scope . todos = results [ "rows" ] ;
                    } ) ;

                // Fetch all conflicts from the database.
                var p2 = PouchConflict . all ( )
                    . then ( function ( results ) {
                        // Store conflicts in the scope.
                        $scope . conflicts = results ;

                    } ) ;

                // Return a promise that resolves when both p1 and p2 promises are settled.
                return $q . all ( [ p1 , p2 ] ) ;
            } ) ;


            /**
             * Function to update an existing To-Do item.
             * @param {object} todo - The To-Do item to be updated.
             */
            $scope . updateTodo = function ( todo ) {
                Todo . update ( todo ) ;
            } ;


            /*
             * Adds a new To-Do item to the list.
             * The new item's text is taken from $scope.todoText.
             */
            $scope . addTodo = function ( ) {
                Todo . add ( { text : $scope . todoText , done : false } ) ;
                $scope . todoText = '' ; // Clear the input field after adding.
            } ;


            /**
             * Calculates the number of remaining undone To-Do items.
             * @returns {number} - The count of undone To-Do items.
             */
            $scope . remaining = function ( ) {
                var count = 0 ;
                angular . forEach ( $scope . todos , function ( todo ) {
                    // Increment count if the todo item is not marked as 'done'.
                    count += todo . doc . done ? 0 : 1 ;
                } ) ;
                return count ;
            } ;


            /*
             * Handles user login functionality.
             * Configures ngPouch settings for database connection.
             */
            $scope . login = function ( ) {
                ngPouch . saveSettings ( { database : 'http://localhost:5984/test20' ,
                    stayConnected : true } ) ; // Ensure connection persists.
                $scope . logged_in = true ; // Update login status.

            } ;


            // Function to handle user logoff.
            $scope . logoff = function ( ) {
                ngPouch . logoff ( ) ; // Disconnect from the database.
                $scope . logged_in = false ; // Update login status.
            } ;


            /*
             * Archives (deletes) all completed To-Do items.
             * Iterates through all todos and calls destroy on each.
             */
            $scope . archive = function ( ) {
                angular . forEach ( $scope . todos , function ( todo ) {
                    Todo . destroy ( todo ) ; // Remove the To-Do item from the database.
                } ) ;
            } ;

        } ] ) ; // End of TodoController definition.