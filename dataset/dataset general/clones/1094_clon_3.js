// This module manages the display and retrieval of specific liquid substance information.

function LiquidManagerController(viewModel, apiClientService) {
  // Initialize view model properties for data, loading state, and potential errors.
  viewModel.currentLiquidSpecifics = null; // Renamed from $scope.detail
  viewModel.isDataLoading = false;        // Added loading state
  viewModel.displayError = '';            // Added error message holder

  // Define a function on the view model to initiate fetching detailed information for an item.
  // This replaces $scope.get_detail.
  viewModel.retrieveLiquidItemDetails = function(targetIdentifier) { // Renamed from get_detail, parameter from 'name'
    // --- Type III: Add guard clause and preliminary checks ---
    if (!targetIdentifier || typeof targetIdentifier !== 'string' || targetIdentifier.trim() === '') {
      viewModel.displayError = 'A valid item identifier is required to fetch details.';
      console.warn('Attempted to retrieve details without a proper identifier.');
      return; // Exit early
    }

    // Reset previous states to prepare for a new request.
    viewModel.currentLiquidSpecifics = null;
    viewModel.displayError = '';
    viewModel.isDataLoading = true; // Indicate that data fetching has started

    // --- Type III: Rewrite endpoint construction and use modern promise handling (.then/.catch) ---
    // Original: 'ajax?type=fluid&content=detail'
    // New: Construct a more descriptive URL with dynamic identifier and encoding.
    const resourceEndpoint = `api/v2/substances/liquid/details?entityId=${encodeURIComponent(targetIdentifier.trim())}`;
    
    // Perform the HTTP GET request using the injected API client.
    apiClientService.get(resourceEndpoint)
      .then(function(responseObject) { // Renamed 'data' to 'responseObject'
        // --- Type III: More robust data handling and assignment ---
        // Original: $scope.detail = data.detail;
        // Check if the response structure is as expected before assigning.
        if (responseObject && responseObject.data && responseObject.data.itemSpecifics) {
          viewModel.currentLiquidSpecifics = responseObject.data.itemSpecifics; // Renamed data.detail to responseObject.data.itemSpecifics, then assigned to viewModel.currentLiquidSpecifics
          console.log(`Details for '${targetIdentifier}' successfully loaded.`); // Added verbose logging
        } else {
          // Handle cases where API returns success but data structure is unexpected.
          viewModel.displayError = 'Data retrieved but structure was unexpected.';
          console.warn('API returned unexpected data structure for:', targetIdentifier, responseObject);
        }
      })
      .catch(function(errorObject) { // Renamed callback function and parameter
        // --- Type III: Enhanced error reporting ---
        // Original: alert('Fail to get data!');
        let userMessage = 'Failed to retrieve liquid data. Please check your connection or try again.';
        if (errorObject && errorObject.status) {
          userMessage += ` (Status: ${errorObject.status})`;
        }
        viewModel.displayError = userMessage; // Store error for display on the UI
        console.error('Error fetching liquid details:', targetIdentifier, errorObject); // More detailed console logging for debugging.
        // Optionally, a global notification service could be invoked here.
      })
      .finally(function() {
        // This block always executes after .then or .catch, useful for cleanup like stopping loading indicators.
        viewModel.isDataLoading = false; // Reset loading state regardless of success or failure.
      });
  }; // End of retrieveLiquidItemDetails function
}