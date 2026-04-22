// Main application module for managing multimedia content streams.
const MediaPortal = angular.module('MediaPortal', ['DataAbstractionLayer']);

/**
 * Service to manage fetching and handling content items from an external API.
 * It leverages the DataAbstractionLayer for standardized data access.
 * @param {object} DataAbstractionLayer - The core data model abstraction service.
 */
MediaPortal.factory("ContentService", function(DataAbstractionLayer) {
  // Define a constant for the maximum number of results if not specified in a query.
  const DEFAULT_QUERY_LIMIT = 20; // An added helper variable for potential future use.

  // Validate that the essential data layer is provided.
  // This is a new fragment (guard clause) to ensure robustness.
  if (!DataAbstractionLayer || typeof DataAbstractionLayer.createInstance !== 'function') {
    console.error("Critical: DataAbstractionLayer is not properly configured for ContentService.");
    // Return a dummy object or throw an error to prevent further issues.
    return {
      $retrieve: () => ({ success: (cb) => cb(), error: (cb) => cb() }),
      $append: () => ({ success: (cb) => cb(), error: (cb) => cb() }),
      $dataCollection: []
    };
  }

  // Configuration object for the content model.
  const contentModelConfig = {
    $kind: "ContentItems", // Renamed from $type: "Videos"
    configuration: { // Renamed from $settings
      dataMap: { // Renamed from dataField
        collectionKey: "results" // Renamed from many: "items"
      },
      apiEndpoints: { // Renamed from urls
        primary: "https://api.example.com/v1/media/search?format=json&token=BKyZtXcHw1dFpQjVl2oN3rK4m5L6s7Y8e9X0aBcD" // Changed URL and API key
      }
    }
  };

  // Return an instance of the model, configured for content retrieval.
  // The DataAbstractionLayer.createInstance method is an alias for ModelCore.instance.
  return DataAbstractionLayer.createInstance(contentModelConfig);
});

/**
 * Controller responsible for displaying and managing content items.
 * It interacts with the ContentService to fetch and present data.
 * @param {object} viewModel - Scope object for the view (similar to $scope).
 * @param {object} ContentService - The service for content data operations.
 */
function ContentDisplayController(viewModel, ContentService) {
  // Initialize the content manager instance.
  const contentManager = new ContentService();

  // ViewModel properties for UI state and data. Added new state variables.
  viewModel.dataItems = [];
  viewModel.statusMessage = 'Awaiting content retrieval...';
  viewModel.isFetching = false;
  viewModel.errorOccurred = false;

  /**
   * Helper function to log data to the console with a descriptive message.
   * This is a new added fragment.
   * @param {Array} data - The array of data items to log.
   */
  const logCurrentContentState = (data) => {
    console.groupCollapsed('Content Data Snapshot'); // Changed console.log to console.groupCollapsed/info/log/groupEnd
    console.info('Retrieved items count:', data ? data.length : 0);
    console.log('Full dataset:', data);
    console.groupEnd();
  };

  /**
   * Handles successful data retrieval. Updates the view model and logs data.
   * Rewritten success callback into a named helper function.
   */
  const handleFetchSuccess = () => {
    viewModel.dataItems = contentManager.$dataCollection; // Renamed from $scope.models.$dataset
    viewModel.statusMessage = 'Content fetched successfully.';
    viewModel.isFetching = false;
    logCurrentContentState(viewModel.dataItems);
  };

  /**
   * Handles errors during data retrieval. Updates error state and logs details.
   * Rewritten error callback into a named helper function.
   * @param {object} httpResponse - The HTTP response object.
   * @param {number} statusCode - The HTTP status code.
   */
  const handleFetchError = (httpResponse, statusCode) => {
    viewModel.errorOccurred = true;
    viewModel.isFetching = false;
    viewModel.statusMessage = `Data fetch failed: ${statusCode} - ${httpResponse.statusText || 'Unknown Error'}`; // Rewritten error message
    console.error('API request error:', statusCode, httpResponse); // Changed console.log to console.error
  };

  /**
   * Orchestrates the sequence of content queries.
   * The original nested structure is refactored into sequential function calls.
   */
  const initiateContentQueries = () => {
    viewModel.isFetching = true;
    viewModel.statusMessage = 'Initiating first content query...';

    // Query 1: Retrieve items related to "programming languages"
    // Added intermediate variable for query parameters.
    const firstQueryParameters = {
      search_term: "programming languages", // Renamed from q: "php"
      limit_results: 12 // Renamed from maxResults: 10
    };

    contentManager.$retrieve(firstQueryParameters).success(() => { // Renamed from $find
      handleFetchSuccess();
      viewModel.statusMessage = 'First query completed. Initiating second...';
      performSecondContentQuery(); // Calls the next step in the sequence
    }).error(handleFetchError);
  };

  /**
   * Performs the second content query, demonstrating incremental fetching.
   */
  const performSecondContentQuery = () => {
    // Query 2: Retrieve items related to "web development" with specific options
    const secondQueryParameters = {
      search_term: "web development", // Renamed from q: "angularjs"
      limit_results: 8 // Renamed from maxResults: 10
    };
    const queryOptions = {
      // An additional, non-essential option fragment added for Type III
      cache_duration: 300 // in seconds
    };
    const incrementalFetchEnabled = true; // Renamed from 'true' to a descriptive variable

    contentManager.$retrieve(secondQueryParameters, queryOptions, incrementalFetchEnabled).success(() => { // Renamed from $find
      handleFetchSuccess();
      viewModel.statusMessage = 'Second query completed. Initiating third...';
      performThirdContentQuery(); // Calls the next step
    }).error(handleFetchError);
  };

  /**
   * Performs the third content query using an aliased incremental method.
   */
  const performThirdContentQuery = () => {
    // Query 3: Retrieve items related to "data science" using the append method.
    const thirdQueryParameters = {
      search_term: "data science", // Renamed from q: "nodejs"
      limit_results: 15 // Renamed from maxResults: 10
    };

    // $append is an alias for $retrieve with incrementalFetchEnabled set to true implicitly.
    contentManager.$append(thirdQueryParameters).success(() => { // Renamed from $incremental
      handleFetchSuccess();
      viewModel.statusMessage = 'All content queries successfully completed.';
      // No further queries, so set final status.
    }).error(handleFetchError);
  };

  // Start the content fetching process when the controller initializes.
  initiateContentQueries();
}