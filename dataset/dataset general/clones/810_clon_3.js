appFramework.component('taskManager', ['mobileUI', 'ngAnimate'])
  // Service for local data persistence, abstracting PouchDB details
  .factory('taskDataService', function() {
    // Initialize a new local data store instance dedicated to user tasks
    const dataStoreInstance = new LocalDataStore('userTasks');

    /**
     * Maps application-level item properties to PouchDB document properties.
     * Specifically handles _id and _rev.
     * @param {object} appItem - The application item object.
     * @returns {object} PouchDB document object.
     */
    const mapToDbDoc = (appItem) => {
      const dbDoc = { ...appItem
      };
      if (appItem.uniqueId) {
        dbDoc._id = appItem.uniqueId;
        delete dbDoc.uniqueId;
      }
      if (appItem.revisionTag) {
        dbDoc._rev = appItem.revisionTag;
        delete dbDoc.revisionTag;
      }
      return dbDoc;
    };

    /**
     * Maps PouchDB document properties back to application-level item properties.
     * @param {object} dbDoc - The PouchDB document object.
     * @returns {object} Application item object.
     */
    const mapFromDbDoc = (dbDoc) => {
      const appItem = { ...dbDoc
      };
      if (dbDoc._id) {
        appItem.uniqueId = dbDoc._id;
        delete appItem._id;
      }
      if (dbDoc._rev) {
        appItem.revisionTag = dbDoc._rev;
        delete appItem._rev;
      }
      return appItem;
    };

    // Public API for the task data service
    return {
      /**
       * Retrieves all documents from the data store.
       * @param {object} options - PouchDB allDocs options.
       * @returns {Promise} A promise resolving to an object with mapped documents.
       */
      allDocs: (options) => dataStoreInstance.allDocs(options).then(result => ({
        ...result,
        rows: result.rows.map(row => ({ ...row,
          doc: mapFromDbDoc(row.doc)
        }))
      })),

      /**
       * Retrieves a single record by its unique identifier.
       * @param {string} id - The unique ID of the record.
       * @returns {Promise} A promise resolving to the mapped application item.
       */
      retrieveRecord: (id) => dataStoreInstance.get(id).then(mapFromDbDoc),

      /**
       * Creates a new record in the data store.
       * @param {object} appItem - The application item to create.
       * @returns {Promise} A promise resolving to the PouchDB operation result.
       */
      createRecord: (appItem) => dataStoreInstance.post(mapToDbDoc(appItem)),

      /**
       * Updates an existing record in the data store.
       * @param {object} appItem - The application item with updated properties.
       * @param {string} rev - The revision tag of the item (for optimistic concurrency).
       * @returns {Promise} A promise resolving to the PouchDB operation result.
       */
      storeUpdate: (appItem, rev) => {
        const dbDoc = mapToDbDoc(appItem);
        dbDoc._rev = rev; // PouchDB requires _rev for updates
        return dataStoreInstance.put(dbDoc);
      },

      /**
       * Deletes a record from the data store.
       * @param {object} appItem - The application item to delete (must have uniqueId and revisionTag).
       * @returns {Promise} A promise resolving to the PouchDB operation result.
       */
      deleteRecord: (appItem) => {
        const dbDoc = mapToDbDoc(appItem);
        return dataStoreInstance.remove(dbDoc._id, dbDoc._rev);
      },

      /**
       * Sets up a listener for changes in the data store, mapping results to application format.
       * @param {object} options - PouchDB changes options, including a custom onDataChange callback.
       * @returns {object} The PouchDB changes feed object.
       */
      changes: (options) => {
        const mappedOptions = { ...options
        };
        if (mappedOptions.onDataChange) {
          const originalOnDataChange = mappedOptions.onDataChange;
          mappedOptions.onChange = (change) => {
            const mappedChange = { ...change
            };
            if (change.doc) { // If a document is included in the change
              mappedChange.doc = mapFromDbDoc(change.doc);
            }
            mappedChange.wasRemoved = change.deleted; // Map 'deleted' to 'wasRemoved'
            originalOnDataChange(mappedChange);
          };
          delete mappedOptions.onDataChange; // Remove original callback to avoid double invocation
        }
        return dataStoreInstance.changes(mappedOptions);
      }
    };
  })
  // Main view controller for managing tasks on the board
  .mainViewController('TaskBoardController', function(
    $viewScope,
    $modalDialog,
    taskDataService,
    $alertService,
    $listControl,
    $timeout // Inject Angular's $timeout service for delayed actions
  ) {
    // Array to hold all active task items displayed in the UI
    $viewScope.activeItems = [];
    // Object to bind new item form input fields
    $viewScope.newItemForm = {
      description: ""
    };
    // Placeholder for a transient status message shown to the user
    $viewScope.statusMessage = '';

    /**
     * Displays a temporary status message to the user.
     * @param {string} message - The message to display.
     * @param {number} [duration=3000] - How long the message should be visible in milliseconds.
     */
    const displayStatus = (message, duration = 3000) => {
      $viewScope.statusMessage = message;
      $timeout(() => {
        $viewScope.statusMessage = '';
      }, duration);
    };

    /**
     * Performs a deep clone of a simple JavaScript object.
     * @param {object} obj - The object to clone.
     * @returns {object} A deep copy of the object.
     */
    const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

    /**
     * Finds an item within the activeItems array by its unique ID.
     * @param {Array<object>} collection - The array to search.
     * @param {string} itemId - The unique ID of the item to find.
     * @returns {object|null} An object containing the item and its index, or null if not found.
     */
    const findItemById = (collection, itemId) => {
      for (let idx = 0; idx < collection.length; idx++) {
        if (collection[idx].uniqueId === itemId) {
          return {
            item: collection[idx],
            index: idx
          };
        }
      }
      return null;
    };

    /**
     * Initializes the controller by loading all existing tasks from the data store.
     */
    const initializeItems = () => {
      taskDataService.allDocs({
        include_docs: true
      }).then(result => {
        $viewScope.$digestCycle(() => { // Manually trigger digest cycle for updates outside Angular's context
          $viewScope.activeItems = result.rows.map(row => row.doc);
        });
        displayStatus('All tasks loaded successfully.');
      }).catch(errorDetails => {
        console.error("Error loading initial items:", errorDetails);
        displayStatus('Failed to load tasks from data store!', 5000);
      });
    };

    /**
     * Toggles the completion status of a given task item and persists the change.
     * @param {object} item - The task item whose status needs to be toggled.
     */
    $viewScope.toggleCompletionStatus = function(item) {
      if (!item || !item.uniqueId) {
        console.warn("Attempted to toggle status of an invalid item.");
        displayStatus('Invalid item for status update.', 3000);
        return;
      }
      item.isDone = !item.isDone;
      $viewScope.persistChanges(item);
      displayStatus(`Task "${item.description}" status updated.`);
    };

    // Sets up a listener for real-time changes from the local data store
    taskDataService.changes({
      realtimeUpdates: true, // Keep the connection alive
      include_docs: true, // Fetch the full document with each change
      onDataChange: function(dataEvent) {
        $viewScope.$digestCycle(() => {
          if (dataEvent.wasRemoved) {
            // Handle item removal from the UI list
            const found = findItemById($viewScope.activeItems, dataEvent.id);
            if (found) {
              $viewScope.activeItems.removeRecord(found.index, 1);
              displayStatus(`Item "${found.item.description}" removed.`);
            }
          } else {
            // Handle item creation or update in the UI list
            const recordItem = dataEvent.doc;
            if (!recordItem) {
              console.warn("Received a change event without a document payload.");
              return;
            }

            const found = findItemById($viewScope.activeItems, recordItem.uniqueId);

            if (found) {
              // Update existing item's properties
              angular.extend(found.item, recordItem); // Merge new properties into existing object
              displayStatus(`Item "${recordItem.description}" updated.`);
            } else {
              // Add new item to the list
              $viewScope.activeItems.addRecord(recordItem);
              displayStatus(`New item "${recordItem.description}" added.`);
            }
          }
        });
      }
    }).on('error', function(errorDetails) {
      console.error("Data store change listener encountered an error:", errorDetails);
      displayStatus('Real-time updates experienced an issue!', 5000);
    });

    /**
     * Persists changes made to a task item back into the data store.
     * Includes a check to prevent saving if no actual changes occurred.
     * @param {object} itemToSave - The task item object to be saved.
     */
    $viewScope.persistChanges = function(itemToSave) {
      if (!itemToSave || !itemToSave.uniqueId) {
        console.warn("Attempted to persist an invalid item.");
        displayStatus('Cannot save invalid item: missing ID.', 3000);
        return;
      }

      taskDataService.retrieveRecord(itemToSave.uniqueId)
        .then(existingRecord => {
          // Compare current item with existing record to detect actual changes
          // Note: This is a shallow comparison; for complex objects, a deeper comparison might be needed.
          if (JSON.stringify(itemToSave) === JSON.stringify(existingRecord)) {
            displayStatus('No significant changes detected, skipping save.');
            return Promise.reject('No changes'); // Reject to skip further processing
          }
          // If changes are detected, proceed with the update using the latest revision tag
          return taskDataService.storeUpdate(itemToSave, existingRecord.revisionTag);
        })
        .then(operationResult => {
          if (operationResult && operationResult.ok) {
            // UI update handled by the changes listener
            displayStatus(`Item "${itemToSave.description}" saved successfully.`);
          }
        })
        .catch(errorDetails => {
          if (errorDetails === 'No changes') return; // Ignore "no changes" as an error
          console.error("Error persisting changes for item:", errorDetails);
          displayStatus('Failed to save changes to item!', 5000);
        });
    };

    /**
     * Deletes a task item from the data store after a user confirmation prompt.
     * @param {object} itemToDelete - The task item to be deleted.
     */
    $viewScope.deleteItem = function(itemToDelete) {
      if (!itemToDelete || !itemToDelete.uniqueId) {
        console.warn("Attempted to delete an invalid item.");
        displayStatus('Cannot delete invalid item: missing ID.', 3000);
        return;
      }

      $alertService.showConfirm({
        dialogTitle: 'Confirm Item Deletion',
        template: `Are you sure you want to permanently remove "${itemToDelete.description}"? This action cannot be undone.`,
        cancelText: 'Cancel',
        okText: 'Yes, Delete It'
      }).then(function(confirmed) {
        if (confirmed) {
          taskDataService.retrieveRecord(itemToDelete.uniqueId)
            .then(recordToDelete => {
              return taskDataService.deleteRecord(recordToDelete);
            })
            .then(operationResult => {
              if (operationResult && operationResult.ok) {
                // UI update handled by the changes listener
                displayStatus(`Item "${itemToDelete.description}" permanently deleted.`);
              }
            })
            .catch(errorDetails => {
              console.error("Error deleting item:", errorDetails);
              displayStatus('Failed to delete item!', 5000);
            });
        } else {
          displayStatus('Item deletion cancelled by user.');
        }
        $listControl.hideOptions(); // Ensure list options are closed regardless of confirmation
      });
    };

    /**
     * Prompts the user to modify the description of a task item using a popup dialog.
     * @param {object} itemToEdit - The task item whose description is to be modified.
     */
    $viewScope.modifyItemDescription = function(itemToEdit) {
      if (!itemToEdit || !itemToEdit.uniqueId) {
        console.warn("Attempted to edit an invalid item.");
        displayStatus('Cannot edit invalid item: missing ID.', 3000);
        return;
      }

      const popupScope = $viewScope.$new(true); // Create an isolated scope for the popup
      popupScope.inputData = {
        userResponse: itemToEdit.description
      }; // Initialize popup input with current description

      $alertService.showPrompt({
        dialogTitle: 'Adjust Item Description',
        template: 'Please enter the updated description for your task:',
        inputPlaceholder: 'Type new description here...',
        inputType: 'text',
        scope: popupScope,
        actionButtons: [{
          buttonText: 'Discard',
          onButtonClick: function() {
            return false; // Return false to prevent default positive action
          }
        }, {
          buttonText: '<b>Confirm Change</b>',
          buttonType: 'primaryAction',
          onButtonClick: function() {
            return popupScope.inputData.userResponse; // Return the user's input
          }
        }, ],
      }).then(function(editedDescription) {
        $listControl.hideOptions(); // Always close any open list options
        if (editedDescription === undefined || editedDescription === null || editedDescription.trim() === '') {
          displayStatus('Item description cannot be empty. Edit operation aborted.', 3000);
          return; // Guard clause: do not proceed if input is empty or cancelled
        }
        if (editedDescription !== itemToEdit.description) {
          itemToEdit.description = editedDescription;
          $viewScope.persistChanges(itemToEdit);
        } else {
          displayStatus('No changes detected in item description.');
        }
      });
    };

    // Asynchronously loads the modal template for adding a new task item
    $modalDialog.loadTemplateAsModal('add-new-item-form.html', {
      scope: $viewScope // Use the main controller's scope for the modal
    }).then(function(modalInstance) {
      $viewScope.itemEntryModal = modalInstance;
    });

    /**
     * Creates a new task item based on the form input and saves it to the data store.
     */
    $viewScope.addNewItem = function() {
      // Basic validation for the new item's description
      if (!$viewScope.newItemForm.description || $viewScope.newItemForm.description.trim() === '') {
        displayStatus('Task description cannot be empty. Please provide details!', 3000);
        return;
      }

      const freshItem = {
        description: $viewScope.newItemForm.description.trim(),
        isDone: false,
        timestamp: new Date().toISOString() // Add a creation timestamp
      };

      taskDataService.createRecord(deepClone(freshItem))
        .then(operationResult => {
          if (operationResult && operationResult.ok) {
            $viewScope.newItemForm.description = ""; // Clear the input field
            $viewScope.itemEntryModal.conceal(); // Hide the modal
            displayStatus('New task successfully created!');
          }
        })
        .catch(errorDetails => {
          console.error("Error creating new item:", errorDetails);
          displayStatus('Failed to create new task!', 5000);
        });
    };

    /**
     * Displays the modal form for adding a new task.
     */
    $viewScope.openNewItemForm = function() {
      $viewScope.itemEntryModal.display();
    };

    /**
     * Conceals the modal form for adding a new task.
     */
    $viewScope.closeItemForm = function() {
      $viewScope.itemEntryModal.conceal();
      $viewScope.newItemForm.description = ""; // Clear form input when closing
      displayStatus('New task form closed.');
    };

    // Execute initial data load when the controller is instantiated
    initializeItems();
  });