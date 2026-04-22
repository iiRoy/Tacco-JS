const monthNamesArray = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];

function populateDateSelectors(startMonthElemId, startYearElemId, endMonthElemId, endYearElemId) {
    const currentDate = new Date();

    const startMonthSelector = document.getElementById(startMonthElemId);
    const startYearSelector = document.getElementById(startYearElemId);
    const endMonthSelector = document.getElementById(endMonthElemId);
    const endYearSelector = document.getElementById(endYearElemId);

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        startMonthSelector.options[monthIndex] = new Option(monthNamesArray[monthIndex], monthIndex);
        endMonthSelector.options[monthIndex] = new Option(monthNamesArray[monthIndex], monthIndex);
    }

    let currentIterationYear = currentDate.getFullYear();
    for (let yearOffset = 0; yearOffset < 5; yearOffset++) {
        startYearSelector.options[yearOffset] = new Option(currentIterationYear, currentIterationYear);
        endYearSelector.options[yearOffset] = new Option(currentIterationYear, currentIterationYear);
        currentIterationYear -= 1;
    }

    startMonthSelector.options[0] = new Option('January', 0, true, true);
    endMonthSelector.options[currentDate.getMonth()] = new Option(monthNamesArray[currentDate.getMonth()], currentDate.getMonth(), true, true);
}

function fetchIssueMetrics() {
    const httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            let startIndex = httpRequest.responseText.indexOf("retrivalTime") + "retrivalTime/>".length;
            let endIndex = httpRequest.responseText.indexOf('</span>', startIndex);
            const lastUpdateTime = httpRequest.responseText.substring(startIndex, endIndex);
            const updateTimestampElement = document.getElementById("retrivalTime");
            updateTimestampElement.innerHTML = "Last Updated On : " + lastUpdateTime;

            startIndex = httpRequest.responseText.indexOf('datasets', endIndex) + "datasets/>".length;
            endIndex = httpRequest.responseText.indexOf('</span>', startIndex);
            const metricDataSets = eval(httpRequest.responseText.substring(startIndex, endIndex));

            displayMetricChart(metricDataSets, metricPeriodStart, metricPeriodEnd);
        }
    };

    const requestPath = "buggraph?";
    const startMonthInput = document.getElementById("monthFrom");
    const startYearInput = document.getElementById("yearFrom");
    const endMonthInput = document.getElementById("monthTo");
    const endYearInput = document.getElementById("yearTo");

    let formattedStartMonth = (startMonthInput.selectedIndex + 1).toString();
    const selectedStartYear = startYearInput.options[startYearInput.selectedIndex].value;
    let formattedEndMonth = (endMonthInput.selectedIndex + 1).toString();
    const selectedEndYear = endYearInput.options[endYearInput.selectedIndex].value;

    if (formattedStartMonth.length === 1) {
        formattedStartMonth = '0' + formattedStartMonth;
    }
    if (formattedEndMonth.length === 1) {
        formattedEndMonth = '0' + formattedEndMonth;
    }

    const metricPeriodStart = selectedStartYear + "/" + formattedStartMonth + "/" + "01";
    const metricPeriodEnd = selectedEndYear + "/" + formattedEndMonth + "/" + "31";

    if ((new Date(metricPeriodEnd)) < (new Date(metricPeriodStart))) {
        alert('Please ensure the start date is before or equal to the end date.');
        return;
    }

    const queryParameters = 'fromDate=' + metricPeriodStart + '&toDate=' + metricPeriodEnd;
    httpRequest.open("GET", requestPath + queryParameters, true);
    httpRequest.send(null);
}

function displayMetricChart(chartDataSets, periodBegin, periodEnd) {
    const newIssues = [];
    const confirmedIssues = [];
    const featureRequests = [];

    for (const outerIndex in chartDataSets) {
        for (const innerIndex in chartDataSets[outerIndex]) {
            if (outerIndex == 0) {
                newIssues.push([(new Date(chartDataSets[outerIndex][innerIndex][0] + '/' + chartDataSets[outerIndex][innerIndex][1] + '/01')).getTime(), chartDataSets[outerIndex][innerIndex][2]]);
            } else if (outerIndex == 1) {
                confirmedIssues.push([(new Date(chartDataSets[outerIndex][innerIndex][0] + '/' + chartDataSets[outerIndex][innerIndex][1] + '/01')).getTime(), chartDataSets[outerIndex][innerIndex][2]]);
            } else {
                featureRequests.push([(new Date(chartDataSets[outerIndex][innerIndex][0] + '/' + chartDataSets[outerIndex][innerIndex][1] + '/01')).getTime(), chartDataSets[outerIndex][innerIndex][2]]);
            }
        }
    }

    $.plot($("#chartContainer"),
        [{
            data: newIssues,
            label: "New",
            lines: {
                show: true,
                lineWidth: 1
            }
        }, {
            data: confirmedIssues,
            label: "Confirmed",
            lines: {
                show: true,
                lineWidth: 1
            }
        }, {
            data: featureRequests,
            label: "Wishlist",
            lines: {
                show: true,
                lineWidth: 1
            }
        }], {
            xaxis: {
                mode: "time",
                timeformat: "%b%y",
                minTickSize: [1, "month"],
                min: (new Date(periodBegin)).getTime(),
                max: (new Date(periodEnd)).getTime()
            },
            yaxis: {
                min: 0
            },
            shadowSize: 2,
            selection: {
                mode: "xy"
            },
            legend: {
                show: true,
                position: 'ne',
                noColumns: 2
            },
            grid: {
                hoverable: true,
                clickable: true,
                backgroundColor: "#fcfcfc"
            },
            points: {
                show: true,
                radius: 3
            }
        });

    function renderHoverTooltip(xPosition, yPosition, tooltipHtmlContent) {
        $('<div id="chartTooltip">' + tooltipHtmlContent + '</div>').css({
            position: 'absolute',
            display: 'none',
            top: yPosition + 8,
            left: xPosition + 8,
            border: '1px solid #cce',
            padding: '4px',
            'background-color': '#eef',
            opacity: 0.9
        }).appendTo("body").fadeIn(280);
    }

    let lastHoveredPoint = null;
    $("#chartContainer").bind("plothover", function(event, plotPosition, hoverItem) {
        $("#xCoordinates").text(plotPosition.x.toFixed(0));
        $("#yCoordinates").text(plotPosition.y.toFixed(0));

        if (hoverItem) {
            if (lastHoveredPoint !== hoverItem.datapoint) {
                lastHoveredPoint = hoverItem.datapoint;

                $("#chartTooltip").remove();
                const pointX = hoverItem.datapoint[0];
                const pointY = hoverItem.datapoint[1];
                const dateObject = new Date(pointX);
                const formattedDateLabel = monthNamesArray[dateObject.getMonth()] + " " + dateObject.getFullYear();

                if (hoverItem.series.label === 'New') {
                    renderHoverTooltip(hoverItem.pageX, hoverItem.pageY,
                        pointY + " " + hoverItem.series.label + " Issues " + " for " + formattedDateLabel);
                } else if (hoverItem.series.label === 'Confirmed') {
                    renderHoverTooltip(hoverItem.pageX, hoverItem.pageY,
                        pointY + ' (' + hoverItem.series.label + " and In Progress )" + " Issues for " + formattedDateLabel);
                } else {
                    renderHoverTooltip(hoverItem.pageX, hoverItem.pageY,
                        pointY + " " + hoverItem.series.label + " for " + formattedDateLabel);
                }
            }
        } else {
            $("#chartTooltip").remove();
            lastHoveredPoint = null;
        }
    });
}