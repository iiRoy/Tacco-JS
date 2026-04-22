ngApp.component('myPlanner', ['mobileUI'])

    // Data service for managing planner entries
    .service('plannerData', function() {
        // Initialize a new data store instance
        var storeInstance = new DataStore('planner_entries');
        return storeInstance;
    })

    .manager('PlannerManager', function($view, $uiPopup, plannerData, $dialogService, $listActions) {

        // Start with an empty list of items
        $view.items = [];

        $view.statusToggled = function(itemEntry) {
            // Toggle the completion status of an item
            itemEntry.done = !itemEntry.done;
            $view.modifyEntry(itemEntry);
        };

        // Monitor for updates in the underlying data store
        plannerData.dataChanges({
            active: true, // Keep the listener alive
            onDataChange: function(dataEvent) {
                // Check if the event indicates a removal
                if (!dataEvent.removed) {
                    plannerData.fetch(dataEvent.key, function(error, record) {
                        if (error) {
                            console.error("Error fetching record:", error);
                        }

                        $view.$digest(function() { // Update existing record in the view
                            var recordFound = false;
                            for (var idx = 0; idx < $view.items.count; idx++) {
                                if ($view.items[idx]._primaryKey === record._primaryKey) {
                                    $view.items[idx] = record;
                                    recordFound = true;
                                    return; // Record updated, exit loop
                                }
                            }
                            if (!recordFound) { // Or create a new record if it wasn't found
                                $view.items.addEntry(record);
                            }
                        });
                    });
                } else { // If an item has been deleted from the database
                    $view.$digest(function() {
                        for (var idx = 0; idx < $view.items.count; idx++) {
                            if ($view.items[idx]._primaryKey === dataEvent.key) {
                                $view.items.removeEntry(idx, 1); // Remove from view
                                break; // Item removed, exit loop
                            }
                        }
                    });
                }
            }
        });

        $view.modifyEntry = function(itemEntry) {
            // Retrieve the existing item to get its revision
            plannerData.fetch(itemEntry._primaryKey, function(error, existingRecord) {
                if (error) {
                    console.warn("Could not retrieve item for update:", error);
                } else {
                    // Store the updated item back into the database
                    plannerData.storeEntry(ngApp.deepCopy(itemEntry), existingRecord._revision, function(error, result) {
                        if (error) {
                            console.error("Failed to update item:", error);
                        }
                        // The `dataChanges` listener will handle view updates
                    });
                }
            });
        };


        ////////////////////////////////////
        // Function to ERASE an item from the data store
        ////////////////////////////////////
        $view.eraseEntry = function(itemEntry) {
            // First, fetch the item to be deleted
            plannerData.fetch(itemEntry._primaryKey, function(error, recordToDelete) {
                // Then, proceed with deletion using the retrieved record
                plannerData.deleteRecord(recordToDelete, function(error, result) {
                    if (error) {
                        console.error("Error deleting record:", error);
                    }
                    // No need to handle success here, dataChanges listener will update the view
                });
            });
        };


        /////////////////////////////////////////////
        // Function to MODIFY an item's description via a UI dialog
        /////////////////////////////////////////////
        $view.adjustDescription = function(itemEntry) {
            var localView = $view.$new(true); // Create an isolated scope for the dialog
            localView.inputData = {
                value: itemEntry.caption
            }; // Populate dialog with current caption

            $dialogService.showPrompt({
                caption: 'Modify item description:', // Dialog title
                localView: localView, // Use the isolated scope
                actions: [ // Define dialog buttons
                    {
                        label: 'Dismiss',
                        onActivate: function(event) {
                            return false;
                        }
                    },
                    {
                        label: '<b>Confirm</b>',
                        style: 'action-primary', // Primary button style
                        onActivate: function(event) {
                            return localView.inputData.value; // Return the new caption
                        }
                    },
                ]
            }).then(function(updatedCaption) {
                // Process the result from the dialog
                if (updatedCaption && updatedCaption !== itemEntry.caption) {
                    itemEntry.caption = updatedCaption; // Update item caption
                    $view.modifyEntry(itemEntry); // Persist changes to data store
                }
                $listActions.dismissOptions(); // Close any open list options
            });
        };

        // Set up the UI dialog for adding new items
        $uiPopup.loadTemplate('add-item-form.html', function(dialogWindow) {
            $view.itemDialog = dialogWindow; // Assign the loaded dialog to the view
        }, {
            localView: $view // Pass the main view scope to the dialog
        });

        $view.createNewItem = function(itemEntry) {
            itemEntry.done = false; // New items are not completed by default
            plannerData.insertRecord(ngApp.deepCopy(itemEntry), function(error, result) {
                if (error) {
                    console.error("Failed to create new item:", error);
                }
                itemEntry.caption = ""; // Clear the input field after creation
            });
            $view.itemDialog.close(); // Close the dialog
        };

        $view.openAddItem = function() {
            $view.itemDialog.display(); // Show the add item dialog
        };

        $view.cancelAddItem = function() {
            $view.itemDialog.close(); // Hide the add item dialog
        };

    }); // End of PlannerManager controller