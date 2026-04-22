const dataMetrics = ['rpm', 'cache0', 'cache1', 'http_status', 'wp_login', 'aurt', 'aurtli', 'mysql', 'df'];
const layoutSpec = [0, 1];
const valuePanelIndex = layoutSpec.length;

const makeDiv = (parentSelector, classN, idN, content = '') => {
    const newDiv = $('<div>').addClass(classN).attr('id', idN).html(content);
    $(parentSelector).append(newDiv);
    return newDiv;
};

const constructDisplayColumn = (panelIdentifier) => {
    makeDiv('#container', 'column', `column-${panelIdentifier}`);
};

const constructMetricPlot = (panelIdentifier, metricKey) => {
    const targetColumn = $(`#column-${panelIdentifier}`);
    makeDiv(targetColumn, 'plot', `plot-${panelIdentifier}-${metricKey}`, `plot-${panelIdentifier}-${metricKey}`);
};

const constructMetricValueDisplay = (panelIdentifier, metricKey) => {
    const targetColumn = $(`#column-${panelIdentifier}`);
    makeDiv(targetColumn, 'value', `value-${metricKey}`, metricKey);
};

const setupVisuals = () => {
    layoutSpec.forEach(identifier => {
        constructDisplayColumn(identifier);
        dataMetrics.forEach(metric => {
            constructMetricPlot(identifier, metric);
        });
    });

    constructDisplayColumn(valuePanelIndex);
    dataMetrics.forEach(metric => {
        constructMetricValueDisplay(valuePanelIndex, metric);
    });
};

const updatePlotAndLabel = (panelIdentifier, metricKey, currentValues, displayName, historyLen, plotOptions) => {
    const plotTargetId = `#plot-${panelIdentifier}-${metricKey}`;
    $.plot($(plotTargetId), currentValues, plotOptions);

    const valueTargetId = `#value-${metricKey}`;
    $(valueTargetId).html(displayName);
};

const processIncomingData = (rawPayload) => {
    const parsedData = JSON.parse(rawPayload);
    const labelMap = parsedData['labels'];
    const historicalData = parsedData['history'];
    const dataHistoryLength = parsedData['history_length'];
    const graphOptionsMap = parsedData['flot_options'];
    const targetPanelIdentifier = parsedData['index'];

    dataMetrics.forEach(metricKey => {
        updatePlotAndLabel(
            targetPanelIdentifier,
            metricKey,
            historicalData[metricKey],
            labelMap[metricKey],
            dataHistoryLength,
            graphOptionsMap[metricKey]
        );
    });
};

const initDataStream = () => {
    const communicator = new STOMPClient();

    communicator.onopen = () => {};
    communicator.onclose = (code) => { alert('Connection Interrupted, Code: ' + code); };
    communicator.onerror = (err) => { alert("Error Occurred: " + err); };
    communicator.onerrorframe = (frameContent) => { alert("Frame Error: " + frameContent.body); };
    communicator.onconnectedframe = () => {
        communicator.subscribe("/topic/graph");
    };
    communicator.onmessageframe = (messageFrame) => {
        processIncomingData(messageFrame.body);
    };

    communicator.connect('localhost', 61613);
};

$(() => {
    setupVisuals();
    initDataStream();
});