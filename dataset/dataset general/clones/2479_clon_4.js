const monthLabelsArr = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function initializeDateSelectors(startMonthId, startYearId, endMonthId, endYearId) {
    const currentMoment = new Date();
    const currentYear = currentMoment.getFullYear();

    const startMonthSelect = document.querySelector(`#${startMonthId}`);
    const startYearSelect = document.querySelector(`#${startYearId}`);
    const endMonthSelect = document.querySelector(`#${endMonthId}`);
    const endYearSelect = document.querySelector(`#${endYearId}`);

    const generateMonthOptions = (targetSelect, defaultMonthIndex = null) => {
        // Clear existing options first to match the original's overwrite behavior
        targetSelect.innerHTML = '';
        monthLabelsArr.forEach((label, index) => {
            const opt = document.createElement('option');
            opt.value = index.toString();
            opt.textContent = label;
            if (defaultMonthIndex !== null && index === defaultMonthIndex) {
                opt.selected = true;
                opt.defaultSelected = true;
            }
            targetSelect.appendChild(opt);
        });
    };

    // Original code populates months and years within the same loop,
    // leading to repeated year population and selection overwrites.
    // To replicate the *final state* and *behavior* (Jan selected for from, current month for to),
    // while still being divergent, we'll perform these operations sequentially.
    // The original's year population happens 12 times, but only the last 5 options remain.
    // The selection overwrites happen 12 times, but the final one sticks.

    // Populating month dropdowns
    generateMonthOptions(startMonthSelect, 0); // January (index 0) selected for 'from'
    generateMonthOptions(endMonthSelect, currentMoment.getMonth()); // Current month selected for 'to'

    // Populating year dropdowns
    const generateYearOptions = (targetSelect, numYearsBack) => {
        targetSelect.innerHTML = ''; // Clear existing options
        Array.from({ length: numYearsBack }, (_, i) => currentYear - i)
             .forEach(yearVal => {
                const opt = document.createElement('option');
                opt.value = yearVal.toString();
                opt.textContent = yearVal.toString();
                targetSelect.appendChild(opt);
            });
    };

    generateYearOptions(startYearSelect, 5); // Current year and 4 preceding
    generateYearOptions(endYearSelect, 5);   // Current year and 4 preceding
}


async function retrieveBugStatistics() {
    const bugDataEndpoint = "buggraph?";
    
    const startMonthSelector = document.querySelector("#monthFrom");
    const startYearSelector = document.querySelector("#yearFrom");
    const endMonthSelector = document.querySelector("#monthTo");
    const endYearSelector = document.querySelector("#yearTo");

    const selectedStartMonthIdx = parseInt(startMonthSelector.value, 10);
    const selectedStartYearVal = startYearSelector.value;
    const selectedEndMonthIdx = parseInt(endMonthSelector.value, 10);
    const selectedEndYearVal = endYearSelector.value;

    const formatMonthForDate = (monthIndex) => String(monthIndex + 1).padStart(2, '0');
    
    const formattedStartMonth = formatMonthForDate(selectedStartMonthIdx);
    const formattedEndMonth = formatMonthForDate(selectedEndMonthIdx);

    const startDateString = `${selectedStartYearVal}/${formattedStartMonth}/01`;
    const endDateString = `${selectedEndYearVal}/${formattedEndMonth}/31`;

    const checkStartDate = new Date(startDateString);
    const checkEndDate = new Date(endDateString);

    if (checkEndDate < checkStartDate) {
        alert('Please ensure the "From Date" is earlier than or equal to the "To Date".');
        return;
    }

    const queryParams = new URLSearchParams({
        fromDate: startDateString,
        toDate: endDateString
    });

    try {
        const response = await fetch(`${bugDataEndpoint}${queryParams.toString()}`);
        const rawResponseText = await response.text();

        const extractTaggedContent = (fullText, tagName) => {
            const pattern = new RegExp(`<${tagName}\\s*\\/>(.*?)(<\\/span>)`, 's');
            const match = fullText.match(pattern);
            return match ? match[1] : '';
        };

        const retrievalTimestamp = extractTaggedContent(rawResponseText, "retrivalTime");
        document.querySelector("#retrivalTime").innerHTML = `Last Updated On : ${retrievalTimestamp}`;

        const datasetContent = extractTaggedContent(rawResponseText, "datasets");
        const parsedDatasets = (new Function('return ' + datasetContent))();

        renderGraphVisualization(parsedDatasets, startDateString, endDateString);
    } catch (error) {
        console.error("Error fetching bug data:", error);
        alert("Failed to retrieve bug data. Please try again.");
    }
}

function renderGraphVisualization(inputDataSeries, initialDateBoundary, finalDateBoundary) {
    const seriesCategorizedData = new Map([
        [0, []], // Corresponds to 'newbug'
        [1, []], // Corresponds to 'confirmed'
        [2, []]  // Corresponds to 'wishlist'
    ]);

    inputDataSeries.forEach((categoryArray, categoryIndex) => {
        const targetArray = seriesCategorizedData.get(categoryIndex);
        if (targetArray) {
            categoryArray.forEach(dataPoint => {
                const [yearValue, monthValue, metricValue] = dataPoint;
                const pointDate = new Date(yearValue, monthValue - 1, 1);
                targetArray.push([pointDate.getTime(), metricValue]);
            });
        }
    });

    const newIssuesData = seriesCategorizedData.get(0);
    const confirmedIssuesData = seriesCategorizedData.get(1);
    const desiredFeaturesData = seriesCategorizedData.get(2);

    const plotDataSeries = [
        { data: newIssuesData,     label: "New",        lines: { show: true, lineWidth: 1 } },
        { data: confirmedIssuesData,  label: "Confirmed",  lines: { show: true, lineWidth: 1 } },
        { data: desiredFeaturesData,   label: "Wishlist",   lines: { show: true, lineWidth: 1 } }
    ];

    const plotOptions = {
        xaxis: {
            mode: "time",
            timeformat: "%b%y",
            minTickSize: [1, "month"],
            min: (new Date(initialDateBoundary)).getTime(),
            max: (new Date(finalDateBoundary)).getTime()
        },
        yaxis: { min: 0 },
        shadowSize: 1,
        selection: { mode: "xy" },
        legend: { show: true, position: 'nw', noColumns: 3 },
        grid: { hoverable: true, clickable: true, backgroundColor: "#fffaff" },
        points: { show: true }
    };

    $.plot($("#placeholder"), plotDataSeries, plotOptions);

    function displayHoverTip(xCoord, yCoord, contentText) {
        $('<div id="hoverTipContainer">' + contentText + '</div>').css({
            position: 'absolute',
            display: 'none',
            top: yCoord + 5,
            left: xCoord + 5,
            border: '1px solid #fdd',
            padding: '2px',
            'background-color': '#fee',
            opacity: 0.80
        }).appendTo("body").fadeIn(200);
    }

    let lastHoveredGraphPoint = null;

    $("#placeholder").bind("plothover", function (eventDetails, plotPoint, hoveredItem) {
        $("#x").text(plotPoint.x.toFixed(0));
        $("#y").text(plotPoint.y.toFixed(0));

        if (hoveredItem) {
            const currentPointIdentifier = `${hoveredItem.seriesIndex}-${hoveredItem.dataIndex}`;
            const lastPointIdentifier = lastHoveredGraphPoint ? `${lastHoveredGraphPoint.seriesIndex}-${lastHoveredGraphPoint.dataIndex}` : null;

            if (currentPointIdentifier !== lastPointIdentifier) {
                lastHoveredGraphPoint = hoveredItem;
                
                $("#hoverTipContainer").remove();
                const dataPointX = hoveredItem.datapoint[0];
                const dataPointY = hoveredItem.datapoint[1];
                const dataPointDate = new Date(dataPointX);

                const monthName = monthLabelsArr[dataPointDate.getMonth()];
                const yearNumber = dataPointDate.getFullYear();
                const formattedDateLabel = `${monthName} ${yearNumber}`;

                const messageMap = new Map([
                    ["New", `${dataPointY} New Bugs of ${formattedDateLabel}`],
                    ["Confirmed", `${dataPointY} (Confirmed+Inprogress )Bugs of ${formattedDateLabel}`],
                    ["Wishlist", `${dataPointY} Wishlist of ${formattedDateLabel}`]
                ]);
                
                const tooltipContent = messageMap.get(hoveredItem.series.label) || `${dataPointY} ${hoveredItem.series.label} of ${formattedDateLabel}`;
                
                displayHoverTip(hoveredItem.pageX, hoveredItem.pageY, tooltipContent);
            }
        } else {
            $("#hoverTipContainer").remove();
            lastHoveredGraphPoint = null;            
        }
    });
}