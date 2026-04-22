angular.module ( 'todo' , [ 'ionic' ] )
    /* This is a simple factory for PouchDB,
     * providing a database instance named 'todoDb'. */
    .factory (
        'todoDb' ,
        function ( ) {
            // Instantiate a new PouchDB database for 'todos'.
            var db = new PouchDB ( 'todos' ) ;
            return db ;
        }
    )
    .controller (
        'TodoCtrl' ,
        function ( $scope , $ionicModal , todoDb , $ionicPopup , $ionicListDelegate ) {
            // Initialize the tasks array on the scope.
            $scope.tasks = [ ] ;

            /*
             * Toggles the completion status of a task and updates it in the database.
             * @param {object} task - The task object to modify.
             */
            $scope.completionChanged = function ( task ) {
                task.completed = ! task.completed ; // Invert status
                $scope.update ( task ) ;            // Persist changes
            } ;

            // Set up live synchronization with the PouchDB database.
            todoDb.changes ( {
                live : true , // Keep connection alive
                onChange : function ( change ) {
                    /*
                     * Handle changes from the database.
                     * This function is called whenever a document is added, updated, or deleted.
                     */
                    if ( ! change.deleted ) {
                        // If not deleted, fetch the full document.
                        todoDb.get ( change.id , function ( err , doc ) {
                            if ( err ) {
                                // Log any errors during document retrieval.
                                console.log ( err ) ;
                            }
                            $scope.$apply ( function ( ) {
                                // Update the UI inside an Angular digest cycle.
                                for ( var i = 0 ; i < $scope.tasks.length ; i ++ ) {
                                    if ( $scope.tasks[ i ] . _id === doc . _id ) {
                                        $scope.tasks[ i ] = doc ; // Found existing task, update it.
                                        return ;                   // Exit loop after update.
                                    }
                                }
                                // If task not found (it's new), add it to the list.
                                $scope.tasks.push ( doc ) ;
                            } ) ;
                        } ) ;
                    } else {
                        // If a document was deleted, remove it from the UI.
                        $scope.$apply ( function ( ) {
                            for ( var i = 0 ; i < $scope.tasks.length ; i ++ ) {
                                if ( $scope.tasks[ i ] . _id === change.id ) {
                                    $scope.tasks.splice ( i , 1 ) ; // Remove the task.
                                    break ; // Task found and removed, no need to continue loop.
                                }
                            }
                        } ) ;
                    }
                }
            } ) ;

            /**
             * Updates an existing task in the database.
             * @param {object} task - The task object to update.
             */
            $scope.update = function ( task ) {
                todoDb.get ( task._id , function ( err , doc ) {
                    if ( err ) {
                        // Handle error during document retrieval.
                        console.log ( err ) ;
                    } else {
                        // Put the updated task back into the database.
                        // angular.copy ensures no reference issues.
                        todoDb.put ( angular.copy ( task ) , doc._rev , function ( err , res ) {
                            if ( err ) {
                                // Log any errors during the update operation.
                                console.log ( err ) ;
                            }
                        } ) ;
                    }
                } ) ;
            } ;

            // Function to delete a task from the database.
            $scope.delete = function ( task ) {
                todoDb.get ( task._id , function ( err , doc ) {
                    // Remove the document using its retrieved _rev.
                    todoDb.remove ( doc , function ( err , res ) {
                        /* No specific handling for success/failure here for simplicity */
                    } ) ;
                } ) ;
            } ;

            // Allows editing a task's title using an Ionic popup.
            $scope.editTitle = function ( task ) {
                var scope = $scope.$new ( true ) ; // Create an isolated child scope for the popup.
                scope.data = { response : task.title } ; // Initialize popup input with current title.
                $ionicPopup.prompt ( {
                    title : 'Edit task:' , // Popup title.
                    scope : scope ,        // Use the isolated scope for data binding.
                    buttons : [            // Define popup buttons.
                        {
                            text : 'Cancel' ,
                            onTap : function ( e ) {
                                return false ; // Do not return a value on cancel.
                            }
                        } ,
                        {
                            text : '<b>Save</b>' ,
                            type : 'button-positive' ,
                            onTap : function ( e ) {
                                // Return the new title if 'Save' is tapped.
                                return scope.data.response ;
                            }
                        } ,
                    ]
                } ) . then ( function ( newTitle ) {
                    // Callback after popup closes.
                    if ( newTitle && newTitle != task.title ) {
                        task.title = newTitle ; // Update task title.
                        $scope.update ( task ) ;  // Persist changes to DB.
                    }
                    $ionicListDelegate.closeOptionButtons ( ) ; // Close any open list option buttons.
                } ) ;
            } ;

            // Load the modal for creating new tasks from a template.
            $ionicModal.fromTemplateUrl ( 'new-task.html' , function ( modal ) {
                $scope.taskModal = modal ; // Assign the modal instance to the scope.
            } , {
                scope : $scope // Use the current scope for the modal.
            } ) ;

            // Function to create a new task.
            $scope.createTask = function ( task ) {
                task.completed = false ; // New tasks are initially not completed.
                todoDb.post ( angular.copy ( task ) , function ( err , res ) {
                    if ( err ) {
                        console.log ( err ) ; // Log any errors during task creation.
                    }
                    task.title = "" ; // Clear the input field after creation.
                } ) ;
                $scope.taskModal.hide ( ) ; // Hide the new task modal.
            } ;

            // Shows the modal for creating a new task.
            $scope.newTask = function ( ) {
                $scope.taskModal.show ( ) ;
            } ;

            // Hides the new task modal.
            $scope.closeNewTask = function ( ) {
                $scope.taskModal.hide ( ) ;
            } ;
        }
    ) ; // End of TodoCtrl and module definition