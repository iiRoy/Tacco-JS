angular.module('myApp.taskManager', ['pouchConnect'])
  .controller('TaskController', [
    '$scope',
    '$q',
    'pouchConnect',
    'TaskModel',
    'DataConflictService',
    function($vm, $asyncService, pouchConnect, TaskModel, DataConflictService) {

      // --- Controller Initialization and State Variables ---

      // Object to hold user input and form data.
      $vm.inputData = {};
      // Array to store the list of tasks retrieved from the database.
      $vm.taskList = [];
      // Flag indicating the current authentication status of the user.
      $vm.isAuthenticated = false;
      // Reference to the PouchDB connection service instance.
      $vm.pouchServiceInstance = pouchConnect;
      // Flag to show/hide a loading spinner or indicator.
      $vm.isLoadingData = true;
      // A message to display to the user, e.g., for errors or status updates.
      $vm.statusMessage = '';
      // Array to store data conflicts that need resolution.
      $vm.pendingResolutions = [];

      // Initialize the task description input field to an empty string.
      $vm.inputData.taskDescriptionInput = '';

      // --- Data Loading and Synchronization ---

      /**
       * Asynchronously fetches initial application data, including tasks and potential conflicts.
       * This method is designed to be called once the PouchDB service is fully initialized.
       */
      const initializeDataFetch = async () => {
        $vm.isLoadingData = true;
        $vm.statusMessage = 'Loading tasks and checking for conflicts...';

        try {
          // Promise to fetch all active tasks using the TaskModel service.
          const taskPromise = TaskModel.retrieveAll()
            .then(retrievedTasks => {
              // Ensure the returned data structure is as expected.
              if (retrievedTasks && Array.isArray(retrievedTasks.rows)) {
                $vm.taskList = retrievedTasks.rows;
                console.info(`[TaskController] Successfully loaded ${$vm.taskList.length} tasks.`);
              } else {
                console.warn('[TaskController] TaskModel.retrieveAll did not return an array in "rows". Initializing empty list.');
                $vm.taskList = []; // Default to an empty array for safety.
              }
            })
            .catch(taskErr => {
              console.error('[TaskController] Error occurred while fetching tasks:', taskErr);
              $vm.statusMessage = `Failed to load tasks: ${taskErr.message || taskErr}`;
              // Re-throw the error to ensure $q.all catches it.
              throw taskErr;
            });

          // Promise to concurrently fetch any pending data conflicts.
          const conflictPromise = DataConflictService.getAllConflicts()
            .then(conflictResults => {
              if (conflictResults && Array.isArray(conflictResults)) {
                $vm.pendingResolutions = conflictResults;
                console.info(`[TaskController] Identified ${$vm.pendingResolutions.length} pending data conflicts.`);
              } else {
                console.warn('[TaskController] DataConflictService.getAllConflicts returned no valid results. Initializing empty conflict list.');
                $vm.pendingResolutions = [];
              }
            })
            .catch(conflictErr => {
              console.error('[TaskController] Error occurred while fetching conflicts:', conflictErr);
              $vm.statusMessage = `Failed to load conflicts: ${conflictErr.message || conflictErr}`;
              // Re-throw the error.
              throw conflictErr;
            });

          // Wait for both data fetching operations to complete successfully.
          await $asyncService.all([taskPromise, conflictPromise]);
          $vm.statusMessage = 'All data loaded successfully.';

        } catch (overallError) {
          console.error('[TaskController] Overall data initialization process failed:', overallError);
          $vm.statusMessage = `Initialization failed: ${overallError.message || overallError}`;
        } finally {
          $vm.isLoadingData = false;
          // Manually trigger a digest cycle if not already in one, to update the view.
          if (!$vm.$$phase) {
            $vm.$apply();
          }
        }
      };

      // Register the initialization function to be executed once the pouchConnect service is ready.
      pouchConnect.onReady(initializeDataFetch);

      // --- Task Management Functions ---

      /**
       * Updates the status or details of an existing task in the database.
       * @param {object} taskEntry - The task object (including its _id and _rev) to be updated.
       */
      $vm.modifyTaskStatus = function(taskEntry) {
        // Guard clause: Ensure a valid task object is provided.
        if (!taskEntry || !taskEntry.id || !taskEntry.doc) {
          console.warn('[TaskController] Attempted to update an invalid or incomplete task entry.', taskEntry);
          $vm.statusMessage = 'Cannot update an invalid task. Please check the task data.';
          return;
        }

        // Add or update a timestamp for the last modification.
        taskEntry.doc.lastModified = new Date().toISOString();

        TaskModel.updateExisting(taskEntry)
          .then(() => {
            console.log(`[TaskController] Task '${taskEntry.doc.description}' (ID: ${taskEntry.id}) updated successfully.`);
            $vm.statusMessage = 'Task updated successfully.';
          })
          .catch(err => {
            console.error('[TaskController] Failed to update task:', err, taskEntry);
            $vm.statusMessage = `Failed to update task: ${err.message || err}`;
          });
      };

      /**
       * Adds a new task to the database based on user input.
       * Clears the input field upon successful addition.
       */
      $vm.addNewTask = function() {
        const descriptionText = $vm.inputData.taskDescriptionInput ? $vm.inputData.taskDescriptionInput.trim() : '';

        // Input validation: ensure the task description is not empty.
        if (!descriptionText) {
          $vm.statusMessage = 'Task description cannot be empty. Please enter a value.';
          return;
        }

        // Construct the payload for the new task, including additional metadata.
        const newTaskPayload = {
          description: descriptionText,
          completed: false, // New tasks are always incomplete by default.
          createdAt: new Date().toISOString(),
          priority: 'medium' // Assign a default priority.
        };

        TaskModel.create(newTaskPayload)
          .then(() => {
            $vm.inputData.taskDescriptionInput = ''; // Clear the input field for the next task.
            $vm.statusMessage = 'Task added successfully.';
            console.log(`[TaskController] A new task has been added: "${descriptionText}".`);
            // Re-fetch all data to ensure the UI is synchronized with the latest database state.
            return initializeDataFetch();
          })
          .catch(err => {
            console.error('[TaskController] An error occurred while adding the new task:', err);
            $vm.statusMessage = `Failed to add task: ${err.message || err}`;
          });
      };

      /**
       * Calculates the total number of tasks that are currently incomplete.
       * @returns {number} The count of tasks not yet marked as completed.
       */
      $vm.countIncompleteTasks = function() {
        let incompleteCount = 0;
        // Guard clause: Handle cases where taskList is not yet populated or is empty.
        if (!$vm.taskList || $vm.taskList.length === 0) {
          return 0;
        }

        // Iterate through the tasks using a modern for...of loop.
        for (const task of $vm.taskList) {
          // Robust check for task structure before accessing properties.
          if (task && task.doc && typeof task.doc.completed === 'boolean') {
            if (!task.doc.completed) {
              incompleteCount++;
            }
          } else {
            console.warn('[TaskController] Encountered a malformed task entry, skipping:', task);
          }
        }
        return incompleteCount;
      };

      // --- Authentication and Connection Management ---

      /**
       * Initiates a connection session to a specified remote database.
       * Updates authentication status and re-fetches data upon success.
       */
      $vm.initiateSession = function() {
        const dbConfig = {
          dbEndpoint: 'http://localhost:5984/my_project_tasks', // Changed database name for isolation.
          maintainConnection: true, // Keep the connection alive across sessions.
          autoSync: true // Enable automatic synchronization in the background.
        };

        pouchConnect.configureAndConnect(dbConfig)
          .then(() => {
            $vm.isAuthenticated = true;
            $vm.statusMessage = 'Successfully connected to the remote database.';
            console.log('[TaskController] Remote database connection has been established.');
            // After successful connection, re-fetch all data to populate the UI.
            return initializeDataFetch();
          })
          .catch(err => {
            $vm.isAuthenticated = false;
            $vm.statusMessage = `Connection failed: ${err.message || err}. Please check network and server.`;
            console.error('[TaskController] Failed to connect to remote database:', err);
          });
      };

      /**
       * Terminates the current database session and disconnects from the remote endpoint.
       * Clears local task and conflict lists upon disconnection.
       */
      $vm.terminateSession = function() {
        pouchConnect.disconnect()
          .then(() => {
            $vm.isAuthenticated = false;
            $vm.statusMessage = 'Disconnected from remote database.';
            console.log('[TaskController] Remote database connection has been terminated.');
            // Clear all displayed data as the user is no longer connected.
            $vm.taskList = [];
            $vm.pendingResolutions = [];
          })
          .catch(err => {
            $vm.statusMessage = `An error occurred during disconnection: ${err.message || err}`;
            console.error('[TaskController] Error encountered during disconnection:', err);
          });
      };

      /**
       * Archives (permanently deletes) all tasks that are currently marked as completed.
       * Includes a user confirmation step before proceeding with deletion.
       */
      $vm.clearCompletedTasks = function() {
        // Filter out only the tasks that are marked as completed.
        const completedTasksToArchive = $vm.taskList.filter(task => task.doc && task.doc.completed);

        // Guard clause: If there are no completed tasks, inform the user.
        if (completedTasksToArchive.length === 0) {
          $vm.statusMessage = 'There are no completed tasks to clear at this time.';
          return;
        }

        // Add a confirmation prompt as an additional safety measure.
        if (!confirm(`Are you absolutely sure you want to delete ${completedTasksToArchive.length} completed tasks? This action cannot be reversed.`)) {
          $vm.statusMessage = 'Deletion of completed tasks cancelled by user.';
          return;
        }

        // Create an array of promises for each deletion operation.
        const deletionPromises = completedTasksToArchive.map(completedTask =>
          TaskModel.remove(completedTask)
            .then(() => console.log(`[TaskController] Successfully archived task: "${completedTask.doc.description}" (ID: ${completedTask.id})`))
            .catch(err => {
              console.error(`[TaskController] Failed to archive task "${completedTask.doc.description}" (ID: ${completedTask.id}):`, err);
              // Return an error object instead of re-throwing to allow other deletions to complete.
              return { error: err, task: completedTask };
            })
        );

        // Wait for all deletion promises to settle.
        $asyncService.all(deletionPromises)
          .then(results => {
            // Check if any deletions failed.
            const failedDeletions = results.filter(r => r && r.error);
            if (failedDeletions.length > 0) {
              $vm.statusMessage = `Successfully cleared some tasks, but ${failedDeletions.length} tasks failed to archive.`;
              console.warn('[TaskController] Some tasks could not be archived:', failedDeletions);
            } else {
              $vm.statusMessage = 'All completed tasks cleared successfully from the database.';
            }
            // After attempting deletions, refresh the task list to reflect changes.
            return initializeDataFetch();
          })
          .catch(overallErr => {
            console.error('[TaskController] An unexpected error occurred during the archive operation:', overallErr);
            $vm.statusMessage = `Failed to clear completed tasks due to an unexpected error: ${overallErr.message || overallErr}`;
          });
      };

      // --- Controller Lifecycle Hook ---
      // This function is called when the controller's scope is destroyed.
      $vm.$on('$destroy', () => {
        console.log('[TaskController] Controller instance is being destroyed. Performing necessary cleanup...');
        // In a real application, you might unsubscribe from events or release resources here.
        // E.g., if pouchConnect had an `offReady` method: pouchConnect.offReady(initializeDataFetch);
      });

    }
  ]);