angular.module('vehicleInventoryApp', ['ui.multiselect']) // Renamed module 'app' to 'vehicleInventoryApp'

.controller('InventoryController', ['$scope', function(viewScope) { // Renamed 'appCtrl' to 'InventoryController', '$scope' to 'viewScope'

    /*
     * This controller manages the initial setup of various
     * selectable inventory lists within the application.
     * It handles both vehicle and produce item data.
     * All data is loaded directly into the viewScope for UI binding.
     */

    // Log a message to indicate controller initialization for debugging purposes.
    console.log('InventoryController has been successfully initialized and is ready to load data.');

    // Define a temporary array for vehicle options before assigning to the scope.
    // Changed property names from 'id' to 'carID' and 'name' to 'carName'.
    // Added an additional item to the list.
    let availableCarsList = [
        { carID: 101, carName: 'Audi A4 Sedan' },
        { carID: 102, carName: 'BMW X5 SUV' },
        { carID: 103, carName: 'Honda Civic Hatchback' },
        { carID: 104, carName: 'Mercedes-Benz C-Class Coupe' } // New item added
    ];

    // Assign the prepared list of automobiles to the scope.
    viewScope.automobileOptions = availableCarsList;

    // Initialize the selection for automobiles.
    // This is expected to be an array for multi-selection scenarios.
    viewScope.selectedAutomobiles = []; // Renamed 'selectedCar' to 'selectedAutomobiles'

    // Introduce a new helper variable to track the total number of unique vehicles.
    viewScope.totalVehicleTypes = viewScope.automobileOptions.length;

    // Define a temporary array for produce items.
    // Changed property names from 'id' to 'produceID' and 'name' to 'produceName'.
    // Added an additional item to the list.
    let availableProduceItems = [
        { produceID: 'FRT_001', produceName: 'Gala Apple' },
        { produceID: 'FRT_002', produceName: 'Valencia Orange' },
        { produceID: 'FRT_003', produceName: 'Cavendish Banana' },
        { produceID: 'VEG_001', produceName: 'Green Bell Pepper' } // New item added, note changed ID scheme
    ];

    // Assign the prepared produce items to the scope.
    viewScope.produceChoices = availableProduceItems;

    // Update: Instead of initializing 'selectedFruit' to null,
    // initialize it with the first item from the 'produceChoices' array.
    // Added a guard clause to ensure the array is not empty.
    if (viewScope.produceChoices && viewScope.produceChoices.length > 0) {
        viewScope.currentProduceSelection = viewScope.produceChoices[0]; // Renamed 'selectedFruit'
        console.log(`Default produce selection set to: ${viewScope.currentProduceSelection.produceName}`);
    } else {
        viewScope.currentProduceSelection = null; // Fallback if no produce items are available
        console.warn('No produce items available to set a default selection.');
    }

    // Add a new boolean scope variable to indicate data readiness.
    viewScope.dataReady = true;

    // Add a new function to the scope to reset all selections.
    // This demonstrates adding new functional fragments.
    viewScope.clearAllSelections = function() {
        viewScope.selectedAutomobiles = []; // Clear vehicle selection
        if (viewScope.produceChoices && viewScope.produceChoices.length > 0) {
            viewScope.currentProduceSelection = viewScope.produceChoices[0]; // Reset produce to default
        } else {
            viewScope.currentProduceSelection = null;
        }
        viewScope.statusMessage = "All selections have been reset to initial state.";
        console.info('User selections have been successfully cleared and reset.');
    };

    // Add a simple status message variable to the scope.
    viewScope.statusMessage = "Application data loaded and initialized.";

}]);
// End of InventoryController definition.