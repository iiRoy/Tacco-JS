// This module manages the retrieval and presentation of marketing campaign data
// for administrative reporting purposes within the application.

// Assuming 'appServices' is an initialized object containing various API clients
// and services, comparable to the original 'mc' object.
const appServices = require('./application_clients/api_gateway'); // Renamed 'mc' to 'appServices' and changed path.
const MODULE_LOG_IDENTIFIER = '[CampaignReportingService]'; // Added a unique identifier for logging.

/**
 * Standardized utility function for setting user-facing alert messages in the session.
 * This consolidates error message formatting and storage.
 * @param {object} currentSession - The express session object.
 * @param {string|number|null} errorCode - An optional numerical or string code for the error.
 * @param {string} userMessage - The primary message to display to the user.
 */
function assignSessionAlert(currentSession, errorCode, userMessage) {
  if (!currentSession || typeof currentSession.notification === 'undefined') { // Added a check for session and notification object existence.
    console.error(`${MODULE_LOG_IDENTIFIER} Session or notification object is missing for alert: ${userMessage}`);
    return;
  }
  let fullAlertText = "An unexpected problem occurred.";
  if (userMessage) {
    fullAlertText = userMessage;
    if (errorCode) {
      fullAlertText = `Issue ${errorCode}: ${userMessage}`;
    }
  }
  currentSession.notification = fullAlertText; // Renamed 'error_flash' to 'notification'.
}

/**
 * Controller endpoint to fetch and display a list of all completed (dispatched) campaigns.
 * This action renders an overview page showing campaigns that have already been sent.
 * @param {object} incomingRequest - The Express request object. (Renamed 'req' to 'incomingRequest')
 * @param {object} outgoingResponse - The Express response object. (Renamed 'res' to 'outgoingResponse')
 */
module.exports.getDispatchedCampaigns = function(incomingRequest, outgoingResponse) { // Renamed 'exports.list'
  // Basic validation to ensure the necessary service is available.
  if (!appServices || !appServices.campaignManagement) { // Renamed 'mc.campaigns' to 'appServices.campaignManagement'.
    assignSessionAlert(incomingRequest.session, null, "System service for campaigns is currently unavailable.");
    return outgoingResponse.redirect("/admin/control_panel"); // Changed redirect path.
  }

  const CAMPAIGN_COMPLETION_STATE = 'dispatched'; // Renamed 'sent' to 'dispatched' and made it a constant.
  const CAMPAIGN_LIST_VIEW_PATH = 'admin/campaign_overview'; // Renamed 'reports/index' template path.

  console.log(`${MODULE_LOG_IDENTIFIER} Attempting to retrieve campaigns in '${CAMPAIGN_COMPLETION_STATE}' state.`);

  // Utilize the campaign management service to query for relevant campaigns.
  appServices.campaignManagement.fetchRecords({ campaignState: CAMPAIGN_COMPLETION_STATE }, function(apiResultContainer) { // Renamed 'list' method to 'fetchRecords', 'status' to 'campaignState', 'data' to 'apiResultContainer'.
    // Extract actual campaign data, defaulting to an empty array if none found.
    const fetchedCampaigns = apiResultContainer && Array.isArray(apiResultContainer.items) ? apiResultContainer.items : []; // Renamed 'data.data' to 'apiResultContainer.items'.

    console.log(`${MODULE_LOG_IDENTIFIER} Successfully retrieved ${fetchedCampaigns.length} campaigns.`);

    // Render the view with the retrieved campaign data.
    outgoingResponse.render(CAMPAIGN_LIST_VIEW_PATH, { // Renamed 'res.render'.
      pageHeading: 'Dispatched Marketing Campaigns', // Renamed 'title' to 'pageHeading'.
      campaignListings: fetchedCampaigns // Renamed 'campaigns' to 'campaignListings'.
    });
  }, function(serviceFailureDetails) { // Renamed 'error' to 'serviceFailureDetails'.
    console.error(`${MODULE_LOG_IDENTIFIER} Error fetching dispatched campaigns:`, serviceFailureDetails);

    // Process and display the error message to the user.
    if (serviceFailureDetails && serviceFailureDetails.detailedErrorDescription) { // Renamed 'error.error' to 'detailedErrorDescription'.
      assignSessionAlert(incomingRequest.session, serviceFailureDetails.statusCode, serviceFailureDetails.detailedErrorDescription); // Renamed 'error.code' to 'statusCode'.
    } else {
      assignSessionAlert(incomingRequest.session, null, "An unknown issue occurred while trying to list campaigns.");
    }
    outgoingResponse.redirect("/admin/control_panel"); // Changed redirect path.
  });
};

/**
 * Controller endpoint to display a comprehensive report for a specific campaign.
 * This action fetches details for a single campaign and its associated performance metrics.
 * @param {object} incomingRequest - The Express request object.
 * @param {object} outgoingResponse - The Express response object.
 */
module.exports.displayCampaignReport = function(incomingRequest, outgoingResponse) { // Renamed 'exports.view'.
  const targetCampaignIdentifier = incomingRequest.params.campaignIdParam; // Renamed 'req.params.id' to 'campaignIdParam' and stored in a new variable.
  const REPORT_DETAIL_VIEW_PATH = 'analytics/campaign_performance_report'; // Renamed 'reports/view' template path.
  const CAMPAIGN_REDIRECT_FALLBACK = '/admin/campaigns_overview'; // Changed redirect path.

  // Pre-check: Ensure a campaign identifier was provided in the request parameters.
  if (!targetCampaignIdentifier) {
    assignSessionAlert(incomingRequest.session, null, "No campaign ID was specified for the report request.");
    return outgoingResponse.redirect(CAMPAIGN_REDIRECT_FALLBACK);
  }

  console.log(`${MODULE_LOG_IDENTIFIER} Initiating report retrieval for campaign ID: ${targetCampaignIdentifier}`);

  // Step 1: Retrieve the specific campaign's basic information.
  appServices.campaignManagement.fetchRecords({ uniqueCampaignRef: targetCampaignIdentifier }, function(campaignInfoResponse) { // Renamed 'list' to 'fetchRecords', 'campaign_id' to 'uniqueCampaignRef', 'campaignData' to 'campaignInfoResponse'.
    const foundCampaignRecords = campaignInfoResponse && Array.isArray(campaignInfoResponse.items) ? campaignInfoResponse.items : []; // Renamed 'data' to 'items'.

    // Validate if the campaign was actually found.
    if (foundCampaignRecords.length === 0) {
      assignSessionAlert(incomingRequest.session, null, "The requested campaign could not be found.");
      return outgoingResponse.redirect(CAMPAIGN_REDIRECT_FALLBACK);
    }

    const currentCampaignEntity = foundCampaignRecords[0]; // Renamed 'campaign' to 'currentCampaignEntity'.

    // Step 2: With campaign details, proceed to fetch its analytical summary.
    appServices.analyticsService.getPerformanceSummary({ entityId: targetCampaignIdentifier }, function(summaryMetricsData) { // Renamed 'reports.summary' to 'analyticsService.getPerformanceSummary', 'cid' to 'entityId', 'reportData' to 'summaryMetricsData'.
      // Construct the page title, falling back to a generic one if the campaign title is missing.
      const reportPageTitle = currentCampaignEntity.campaignName ? `Performance Report: ${currentCampaignEntity.campaignName}` : 'Detailed Campaign Report'; // Renamed 'campaign.title' to 'currentCampaignEntity.campaignName' and added a fallback.

      console.log(`${MODULE_LOG_IDENTIFIER} Successfully generated report for campaign: ${currentCampaignEntity.campaignName || targetCampaignIdentifier}`);

      outgoingResponse.render(REPORT_DETAIL_VIEW_PATH, { // Renamed 'res.render'.
        pageHeading: reportPageTitle, // Renamed 'title'.
        campaignData: currentCampaignEntity, // Renamed 'campaign' to 'campaignData'.
        performanceMetrics: summaryMetricsData // Renamed 'report' to 'performanceMetrics'.
      });
    }, function(reportIssueDetails) { // Renamed 'error' to 'reportIssueDetails'.
      console.error(`${MODULE_LOG_IDENTIFIER} Error fetching report summary for ID ${targetCampaignIdentifier}:`, reportIssueDetails);

      // Handle different types of reporting errors.
      if (reportIssueDetails && reportIssueDetails.errorTypeIdentifier === "CampaignNotFoundException") { // Renamed 'error.name' to 'errorTypeIdentifier', "Campaign_DoesNotExist" to "CampaignNotFoundException".
        assignSessionAlert(incomingRequest.session, null, "Report generation failed: Campaign details are unavailable.");
      } else if (reportIssueDetails && reportIssueDetails.detailedErrorDescription) { // Renamed 'error.error' to 'detailedErrorDescription'.
        assignSessionAlert(incomingRequest.session, reportIssueDetails.statusCode, reportIssueDetails.detailedErrorDescription);
      } else {
        assignSessionAlert(incomingRequest.session, null, "An unspecified error occurred during report generation.");
      }
      outgoingResponse.redirect(CAMPAIGN_REDIRECT_FALLBACK); // Changed redirect path.
    });
  }, function(campaignDetailsFetchError) { // Added an error callback for the initial campaign fetch.
    console.error(`${MODULE_LOG_IDENTIFIER} Initial campaign details fetch failed for ID ${targetCampaignIdentifier}:`, campaignDetailsFetchError);

    if (campaignDetailsFetchError && campaignDetailsFetchError.detailedErrorDescription) {
      assignSessionAlert(incomingRequest.session, campaignDetailsFetchError.statusCode, campaignDetailsFetchError.detailedErrorDescription);
    } else {
      assignSessionAlert(incomingRequest.session, null, "Failed to retrieve campaign information required for report.");
    }
    outgoingResponse.redirect(CAMPAIGN_REDIRECT_FALLBACK);
  });
};