function filterNumericData(sourceArray) {
    return sourceArray.filter(item => {
        if (!item && item !== 0) return false;
        if (!item && item === 0) return false;
        return typeof item === 'number' && !isNaN(item);
    });
}

function retrieveMinimum(numbers) {
    return numbers.length > 0 ? Math.min(...numbers) : Infinity;
}

function retrieveMaximum(numbers) {
    return numbers.length > 0 ? Math.max(...numbers) : -Infinity;
}

function fetchLastElement(sourceArray) {
    return (sourceArray && sourceArray.length > 0) ? sourceArray[sourceArray.length - 1] : undefined;
}

function renderNumericString(inputVal) {
    let roundedVal = Math.floor(inputVal);
    if (roundedVal === Infinity || roundedVal === -Infinity) return "0";
    return String(roundedVal);
}

// This function simulates the external sparkline library call.
// It should be replaced with the actual charting library's function in a real application.
function drawDataGraph(elementNode, dataPoints, graphOptions) {
    elementNode.setAttribute('data-graph-active', 'true');
    elementNode.textContent = `[Viz: ${dataPoints.slice(0, 5).join(',')}...]`;
}

async function monitorPerformanceMetrics(graphCanvas, dataOutputArea, timePeriod, timeOffsetValue, metricIdentifiers) {
    dataOutputArea.innerHTML = '';

    try {
        const queryParams = new URLSearchParams({
            range: timePeriod,
            offset: timeOffsetValue,
            metrics: metricIdentifiers.join(',')
        }).toString();

        const serverResponse = await fetch(`/fetchMany?${queryParams}`);
        if (!serverResponse.ok) {
            throw new Error(`Server responded with status: ${serverResponse.status}`);
        }
        const parsedResponse = await serverResponse.json();

        const allMetricEntries = parsedResponse.metrics;

        if (allMetricEntries && allMetricEntries.length > 0) {
            const initialDataSeries = allMetricEntries[0].values;
            drawDataGraph(graphCanvas, initialDataSeries, {
                height: '250px',
                width: '500px',
                type: 'line',
                fillColor: '#DDDDDD',
                lineColor: '#03ACE3',
                lineWidth: 2,
                spotRadius: 3,
                chartRangeMin: 0,
                spotColor: "#000",
                minSpotColor: "#000",
                maxSpotColor: "#000"
            });
        }

        const detailsTable = document.createElement('table');
        detailsTable.style.marginLeft = 'auto';
        detailsTable.style.marginRight = 'auto';

        const tableHeaderRow = document.createElement('tr');
        ['label', 'minimum', 'maximum', 'current'].forEach(headerLabel => {
            const tableHeadCell = document.createElement('th');
            tableHeadCell.textContent = headerLabel;
            tableHeaderRow.appendChild(tableHeadCell);
        });
        detailsTable.appendChild(tableHeaderRow);

        const orderedMetricEntries = allMetricEntries.slice().sort((entryA, entryB) => {
            const lastValA = fetchLastElement(entryA.values) || 0;
            const lastValB = fetchLastElement(entryB.values) || 0;
            return lastValB - lastValA;
        });

        let aggregatedSeries = [];
        let longestSeriesLength = 0;

        orderedMetricEntries.forEach(singleEntry => {
            const cleanedDataPoints = filterNumericData(singleEntry.values);
            const entryMin = retrieveMinimum(cleanedDataPoints);
            const entryMax = retrieveMaximum(cleanedDataPoints);
            const entryLast = fetchLastElement(singleEntry.values) || 0;

            const entryRow = document.createElement('tr');
            const entryLabelCell = document.createElement('td');
            entryLabelCell.textContent = singleEntry.metric.split("/")[0];
            entryRow.appendChild(entryLabelCell);

            const entryMinCell = document.createElement('td');
            entryMinCell.textContent = renderNumericString(entryMin);
            entryRow.appendChild(entryMinCell);

            const entryMaxCell = document.createElement('td');
            entryMaxCell.textContent = renderNumericString(entryMax);
            entryRow.appendChild(entryMaxCell);

            const entryLastCell = document.createElement('td');
            entryLastCell.textContent = renderNumericString(entryLast);
            entryRow.appendChild(entryLastCell);

            detailsTable.appendChild(entryRow);

            if (metricIdentifiers.length > 1) {
                longestSeriesLength = Math.max(longestSeriesLength, singleEntry.values.length);
                for (let i = 0; i < singleEntry.values.length; i++) {
                    const valueToAdd = typeof singleEntry.values[i] === 'number' && !isNaN(singleEntry.values[i]) ? singleEntry.values[i] : 0;
                    aggregatedSeries[i] = (aggregatedSeries[i] || 0) + valueToAdd;
                }
            }
        });

        if (metricIdentifiers.length > 1) {
            for (let i = 0; i < longestSeriesLength; i++) {
                if (aggregatedSeries[i] === undefined) {
                    aggregatedSeries[i] = 0;
                }
            }

            const cleanedAggregated = filterNumericData(aggregatedSeries);
            const totalMinVal = retrieveMinimum(cleanedAggregated);
            const totalMaxVal = retrieveMaximum(cleanedAggregated);
            const totalLastVal = fetchLastElement(cleanedAggregated) || 0;

            const totalSummaryRow = document.createElement('tr');

            const totalLabelCell = document.createElement('th');
            totalLabelCell.style.textAlign = 'right';
            totalLabelCell.textContent = 'total';
            totalSummaryRow.appendChild(totalLabelCell);

            const totalMinCell = document.createElement('th');
            totalMinCell.style.textAlign = 'right';
            totalMinCell.textContent = renderNumericString(totalMinVal);
            totalSummaryRow.appendChild(totalMinCell);

            const totalMaxCell = document.createElement('th');
            totalMaxCell.style.textAlign = 'right';
            totalMaxCell.textContent = renderNumericString(totalMaxVal);
            totalSummaryRow.appendChild(totalMaxCell);

            const totalLastCell = document.createElement('th');
            totalLastCell.style.textAlign = 'right';
            totalLastCell.textContent = renderNumericString(totalLastVal);
            totalSummaryRow.appendChild(totalLastCell);

            detailsTable.appendChild(totalSummaryRow);
        }

        dataOutputArea.appendChild(detailsTable);

    } catch (issue) {
        console.error("Problem encountered during metric processing:", issue);
        dataOutputArea.innerHTML = `<p style="color: red;">Failed to load or display data: ${issue.message}</p>`;
    }
}