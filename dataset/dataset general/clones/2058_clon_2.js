/* Configuration: Layout indices and data metric identifiers are presently hardcoded. */
/* Distinct data structures are utilized for initial setup versus runtime updates. */
var layoutIndices = [0, 1] ;
var metricIdentifiers = [
    'requestsPerMinute',
    'cacheLevel0',
    'cacheLevel1',
    'httpResponseStatus',
    'wordpressLoginAttempts',
    'averageResponseTime',
    'averageResponseTimeLongInterval',
    'databaseQueries',
    'diskFreeSpacePercentage',
];

var initializeDisplay = function()
{
    for (var currentIdx = 0; currentIdx < layoutIndices.length; currentIdx++)
    {
        setupPanel(currentIdx);
        for (var currentMetricIdx = 0; currentMetricIdx < metricIdentifiers.length; currentMetricIdx++) {
            createChartArea(currentIdx, metricIdentifiers[currentMetricIdx]);
        }
    }
    var finalPanelIndex = layoutIndices.length;
    setupPanel(finalPanelIndex);
    for (var currentMetricIdx = 0; currentMetricIdx < metricIdentifiers.length; currentMetricIdx++) {
        displayMetricValue(finalPanelIndex, metricIdentifiers[currentMetricIdx]);
    }
};

var setupPanel = function(panelIndex)
{
    var rootElement = document.getElementById('mainContainer');
    var sectionDiv = document.createElement('div');
    sectionDiv.className = 'displaySection';
    sectionDiv.id = 'section-' + panelIndex;
    rootElement.appendChild(sectionDiv);
};

var createChartArea = function(sectionNum, dataTag)
{
    var targetSection = document.getElementById('section-' + sectionNum);
    var chartContainer = document.createElement('div');
    chartContainer.className = 'chartVisual';
    chartContainer.id = 'graph-' + sectionNum + '-' + dataTag;
    chartContainer.style.width = targetSection.style.width;
    chartContainer.innerHTML = chartContainer.id;
    targetSection.appendChild(chartContainer);
};

var displayMetricValue = function(sectionNum, dataTag)
{
    var targetSection = document.getElementById('section-' + sectionNum);
    var metricDisplay = document.createElement('div');
    metricDisplay.className = 'metricReadout';
    metricDisplay.id = 'readout-' + dataTag;
    metricDisplay.innerHTML = dataTag;
    targetSection.appendChild(metricDisplay);
};

var refreshDisplay = function(jsonPayload)
{
    var parsedData = JSON.parse(jsonPayload);
    var metricLabels = parsedData['labels'];
    var dataHistory = parsedData['history'];
    var historySize = parsedData['history_length'];
    var chartSettingsList = parsedData['flot_options'];
    var targetPanelIndex = parsedData['index'];
    for (var counterA = 0; counterA < metricIdentifiers.length; counterA++) {
        var currentMetricIdentifier = metricIdentifiers[counterA];
        var metricValues = dataHistory[currentMetricIdentifier];
        var metricLabel = metricLabels[currentMetricIdentifier];
        var chartConfiguration = chartSettingsList[currentMetricIdentifier];
        updateChartAndValue(targetPanelIndex, currentMetricIdentifier, metricValues, metricLabel, historySize, chartConfiguration);
    }
};

var updateChartAndValue = function(sectionNum, dataTag, dataSeries, displayLabel, recordCount, chartOptions)
{
    // Render the visual chart for the current metric.
    var selectorString = '#graph-' + sectionNum + '-' + dataTag;
    $.plot($(selectorString), dataSeries, chartOptions);

    // Update the textual metric display.
    var metricDisplay = document.getElementById('readout-' + dataTag);
    metricDisplay.innerHTML = displayLabel;
    /* Alternative display format could include: metricDisplay.innerHTML = displayLabel + "<br>" + dataSeries[recordCount-1][1]; */
    /* Another commented-out rendering option: metricDisplay.innerHTML = "<br>" + dataSeries[recordCount-1][1]; */
};

// Execute when the Document Object Model is fully loaded and ready for manipulation.
$(function() {
    initializeDisplay();

    var messageClient = new StompConnectionHandler();
    messageClient.onConnectionOpen = function() {
        /* No specific action on connection open. */
    };
    messageClient.onConnectionClose = function(closeCode) {
        alert('Connection Terminated, Code: ' + closeCode);
    };
    messageClient.onGeneralError = function(errorDetails) {
        alert("Error Occurred: " + errorDetails);
    };
    messageClient.onFrameError = function(errorFrame) {
        alert("Frame Error: " + errorFrame.body);
    };
    messageClient.onConnectedFrameReceived = function() {
        messageClient.subscribeToTopic("/topic/graph");
    };
    messageClient.onMessageFrameReceived = function(receivedFrame) {
        refreshDisplay(receivedFrame.body);
    };
    messageClient.establishConnection('localhost', 61613);
});