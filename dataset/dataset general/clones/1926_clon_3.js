'use strict'; // Enforce strict mode for cleaner code practices.

// Helper utility to safely transfer a set of properties from a source data object
// to a target context object. This is useful for mapping API responses to UI models.
function populateContextProperties(targetContext, sourcePayload, propertyKeysToExtract) {
  // Defensive checks to ensure valid inputs before proceeding with property assignments.
  if (!targetContext || typeof targetContext !== 'object' || targetContext === null) {
    console.error('Target context for property population is invalid or null.');
    return;
  }
  if (!sourcePayload || typeof sourcePayload !== 'object' || sourcePayload === null) {
    console.warn('Source payload for property population is invalid or null. No properties will be transferred.');
    return;
  }
  if (!Array.isArray(propertyKeysToExtract) || propertyKeysToExtract.length === 0) {
    console.debug('No specific property keys provided for extraction. Skipping.');
    return;
  }

  // Iterate through each specified key and assign its corresponding value from the source
  // payload to the target context.
  propertyKeysToExtract.forEach(keyName => {
    // Ensure the key exists in the source payload to avoid assigning 'undefined' unnecessarily.
    if (Object.prototype.hasOwnProperty.call(sourcePayload, keyName)) {
      targetContext[keyName] = sourcePayload[keyName];
    } else {
      // Log a debug message if a requested property is not found in the source.
      console.debug(`Property "${keyName}" not found in the source payload.`);
    }
  });
}

// --- API Configuration Constants ---
// Define the base URL for all timeline API requests.
const TIMELINE_API_ENDPOINT_BASE = 'http://hreader.local/timeline.json';
// Configure the default caching behavior for API calls.
const API_REQUEST_CACHE_ENABLED = false;

// Helper function to build the complete API URL dynamically based on the desired page.
function buildTimelineResourceUrl(pageQualifier) {
  return `${TIMELINE_API_ENDPOINT_BASE}?page=${pageQualifier}`;
}

// Controller responsible for managing the daily view of timeline data.
function DailySummaryViewController(uiModel, apiConnector) {
  // Log the initialization of the controller for tracking and debugging.
  console.info('DailySummaryViewController: Initializing data fetch.');

  const pageSpecificId = 'day';
  const apiCallOptions = { cache: API_REQUEST_CACHE_ENABLED };

  // Execute the API request to retrieve daily timeline information.
  apiConnector.get(buildTimelineResourceUrl(pageSpecificId), apiCallOptions)
    .then(apiResponse => {
      // Extract the actual data payload from the API response object.
      const dataPayload = apiResponse.data;

      // Perform a crucial validation step on the received data.
      if (!dataPayload || typeof dataPayload !== 'object' || Object.keys(dataPayload).length === 0) {
        console.error('DailySummaryViewController: Received invalid or empty data payload from API.');
        uiModel.dataLoadError = 'Could not load daily summary data.';
        return; // Halt further processing if data is invalid.
      }

      // Define the specific data fields expected for the daily summary.
      const dailyContextFields = [
        'vitals', 'results', 'symptoms', 'pain', 'mood', 'energy', 'conditions', 'levels'
      ];
      // Use the helper to populate the UI model with these fields.
      populateContextProperties(uiModel, dataPayload, dailyContextFields);

      // Handle medications data specifically, including a type check and renaming.
      const rawMedications = dataPayload.timeline_medications;
      if (Array.isArray(rawMedications)) {
        uiModel.currentMedications = rawMedications; // Renamed property for clarity.
      } else {
        uiModel.currentMedications = []; // Ensure an empty array if data is missing or malformed.
        console.warn('DailySummaryViewController: Medication data was not an array or missing.');
      }

      // Set a customized date format for display purposes in the UI.
      uiModel.displayDatePattern = 'dd-MM-yyyy'; // Modified date format string.
    })
    .catch(errorDetails => {
      // Catch and log any errors that occur during the API request.
      console.error('DailySummaryViewController: Failed to fetch daily data.', errorDetails);
      uiModel.apiProblem = 'Failed to retrieve daily timeline. Please check network.';
    })
    .finally(() => {
      // Ensure a final log message, regardless of success or failure.
      console.info('DailySummaryViewController: Data fetch process concluded.');
    });
}

// Controller for presenting weekly timeline data.
function WeeklyTimelineController(uiModel, apiConnector) {
  console.info('WeeklyTimelineController: Initiating data request.');

  const pageIdForWeek = 'week';
  const requestConfiguration = { cache: API_REQUEST_CACHE_ENABLED };

  apiConnector.get(buildTimelineResourceUrl(pageIdForWeek), requestConfiguration)
    .then(apiResponse => {
      const receivedData = apiResponse.data;
      if (!receivedData || typeof receivedData !== 'object') {
        console.error('WeeklyTimelineController: API returned invalid or no data.');
        uiModel.loadFailed = true;
        return;
      }
      const weekSpecificKeys = [
        'vitals', 'symptoms', 'levels', 'conditions', 'observations', 'start_date', 'end_date'
      ];
      populateContextProperties(uiModel, receivedData, weekSpecificKeys);
    })
    .catch(apiError => {
      console.error('WeeklyTimelineController: Error during weekly data fetch:', apiError);
      uiModel.fetchErrorMessage = 'Error loading weekly timeline.';
    })
    .finally(() => {
      console.info('WeeklyTimelineController: Weekly data fetch sequence completed.');
    });
}

// Controller for handling monthly timeline data.
function MonthlyReportPresenter(uiModel, apiConnector) {
  console.info('MonthlyReportPresenter: Starting data retrieval.');

  const monthPageName = 'month';
  const optionsForHttp = { cache: API_REQUEST_CACHE_ENABLED };

  apiConnector.get(buildTimelineResourceUrl(monthPageName), optionsForHttp)
    .then(responseObj => {
      const monthlyData = responseObj.data;
      if (!monthlyData || typeof monthlyData !== 'object') {
        console.error('MonthlyReportPresenter: API response for month is not valid.');
        uiModel.reportStatus = 'Failed to load monthly report.';
        return;
      }
      const monthlyRelevantInfo = [
        'vitals', 'symptoms', 'medications', 'conditions', 'encounters', 'start_date', 'end_date'
      ];
      populateContextProperties(uiModel, monthlyData, monthlyRelevantInfo);
    })
    .catch(issue => {
      console.error('MonthlyReportPresenter: Problem fetching monthly data:', issue);
      uiModel.dataRetrievalIssue = 'Monthly data could not be displayed.';
    })
    .finally(() => console.info('MonthlyReportPresenter: Monthly data operation finalized.'));
}

// Controller for managing yearly timeline data.
function YearlyChronicleManager(uiModel, apiConnector) {
  console.info('YearlyChronicleManager: Preparing to fetch data.');

  const yearPageKey = 'year';
  const httpClientConfig = { cache: API_REQUEST_CACHE_ENABLED };

  apiConnector.get(buildTimelineResourceUrl(yearPageKey), httpClientConfig)
    .then(serverResponse => {
      const timelineData = serverResponse.data;
      if (!timelineData || typeof timelineData !== 'object') {
        console.error('YearlyChronicleManager: Server response for year data was malformed.');
        uiModel.yearlyDataStatus = 'Error: Yearly data unavailable.';
        return;
      }
      const annualDataPoints = [
        'vitals', 'symptoms', 'conditions', 'treatments', 'start_date', 'end_date'
      ];
      populateContextProperties(uiModel, timelineData, annualDataPoints);

      // Add a new, derived piece of information to the UI model.
      uiModel.currentCalendarYear = new Date().getFullYear();
    })
    .catch(problem => {
      console.error('YearlyChronicleManager: An error occurred fetching yearly timeline:', problem);
      uiModel.loadError = true;
    })
    .finally(() => console.info('YearlyChronicleManager: Yearly data processing complete.'));
}

// Controller for decennial (decade-long) timeline data and related calculations.
function DecennialAggregationController(uiModel, apiConnector) {
  console.info('DecennialAggregationController: Initiating aggregated data retrieval.');

  const decadePageId = 'decade';
  const httpCallSettings = { cache: API_REQUEST_CACHE_ENABLED };

  apiConnector.get(buildTimelineResourceUrl(decadePageId), httpCallSettings)
    .then(apiResult => {
      const aggregatedData = apiResult.data;
      if (!aggregatedData || typeof aggregatedData !== 'object') {
        console.error('DecennialAggregationController: Aggregated data from API is invalid.');
        uiModel.decadeLoadIssue = 'Failed to load decade-long data.';
        return;
      }
      const decadeSpecificAttributes = [
        'vitals', 'symptoms', 'conditions', 'levels', 'start_date', 'end_date'
      ];
      populateContextProperties(uiModel, aggregatedData, decadeSpecificAttributes);

      // Expose a utility object for mathematical operations within the UI.
      uiModel.mathHelpers = window.Math; // Renamed variable.

      // Introduce a new derived property: count of unique conditions.
      if (Array.isArray(aggregatedData.conditions)) {
        uiModel.uniqueConditionCount = new Set(aggregatedData.conditions.map(c => c.name)).size;
      } else {
        uiModel.uniqueConditionCount = 0;
      }
    })
    .catch(fault => {
      console.error('DecennialAggregationController: Encountered an error fetching decade data:', fault);
      uiModel.apiError = 'Cannot display decennial timeline.';
    })
    .finally(() => console.info('DecennialAggregationController: Aggregated data operation finished.'));

  // Function to compute a visual offset for timeline entries, positioning them horizontally.
  uiModel.calculateTimelineDisplayOffset = function(timelineEntryItem) {
    // Validate the input entry for robustness.
    if (!timelineEntryItem || typeof timelineEntryItem.date !== 'number') {
      console.warn('DecennialAggregationController: Invalid timeline entry or date for offset calculation.');
      return { horizontalOffset: '0px' }; // Return a default safe value.
    }

    // Break down the complex calculation into clearer, intermediate steps.
    const entryDateInMs = timelineEntryItem.date * 1000; // Convert seconds to milliseconds.
    const fixedReferencePointMs = 1.01e+12; // A specific historical timestamp (e.g., early 2002).
    const timeSpanDifferenceMs = entryDateInMs - fixedReferencePointMs;

    // This scaling factor maps a duration (approximately 10 years) to a specific pixel range.
    // The original divisor: 315569259747 / 460
    // 315569259747 ms is roughly 10 years, and 460 could be a max pixel width or unit.
    const decadeToPixelScale = 315569259747 / 460;

    const finalPixelOffset = timeSpanDifferenceMs / decadeToPixelScale;

    // Return the calculated offset as a CSS-compatible style object.
    return { 'horizontalOffset' : `${finalPixelOffset}px` }; // Renamed CSS property key.
  };
}