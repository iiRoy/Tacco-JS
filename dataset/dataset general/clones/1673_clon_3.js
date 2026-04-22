/*
 * This module defines a distinct visual styling profile
 * for the 'ChartEngine' library. It's tailored for
 * applications requiring a dark, high-contrast aesthetic.
 *
 * It incorporates a blend of deep blues and grays,
 * accented with vibrant highlights for data visualization.
 *
 * @module ChartEngine/VisualPresets
 * @author A. Developer
 * @version 2.1.0
 */

// Define some common color constants for reuse and easier modification.
const primaryDarkBackground = 'rgb(30, 30, 60)';
const secondaryDarkBackground = 'rgb(0, 0, 0)';
const accentGreen = '#5CB85C';
const accentRed = '#D9534F';
const accentBlue = '#5BC0DE';
const neutralGray = '#909090';
const lightText = '#E0E0E0';
const mediumText = '#B0B0B0';
const darkText = '#404040';
const borderGray = '#AAAAAA';
const solidBlack = '#000000';
const solidWhite = '#FFFFFF';

// Helper for linear gradients to add a slight variation in structure.
const createLinearGradient = (x1, y1, x2, y2, stopsArray) => ({
    linearGradient: { x1, y1, x2, y2 },
    stops: stopsArray
});

// The main configuration object for the charting library.
// Renamed from Highcharts.theme to ChartEngine.visualConfig
ChartEngine.visualConfig = (function() {
    // Internal helper for styling objects
    const createTextStyle = (displayColor, weight = 'normal', size = '1em', font = 'Arial, sans-serif') => ({
        color: displayColor,
        fontWeight: weight,
        fontSize: size,
        fontFamily: font
    });

    // Define the core style profile.
    const coreStyleProfile = {
        // Renamed 'colors' to 'seriesColors' and updated values.
        seriesColors: [
            "#FFD700", "#3CB371", "#FF6347", "#6495ED", "#ADD8E6", "#FF4500", "#EE82EE",
            "#20B2AA", "#8A2BE2", "#7FFF00", "#FFC0CB"
        ],

        // Renamed 'chart' to 'canvasSettings'.
        canvasSettings: {
            backgroundColor: createLinearGradient(0, 0, 1, 1, [
                [0, primaryDarkBackground],
                [1, secondaryDarkBackground]
            ]),
            outlineColor: solidBlack, // Renamed from borderColor
            outlineWidth: 3,         // Changed value, renamed from borderWidth
            containerClass: 'dark-chart-wrapper', // Renamed from className
            plotAreaBackground: 'rgba(255, 255, 255, 0.08)', // Changed color and opacity
            plotAreaOutlineColor: borderGray, // Renamed from plotBorderColor
            plotAreaOutlineWidth: 1.5,       // Changed value
            renderShadows: true,             // Added new property
            dropShadow: { color: 'rgba(0,0,0,0.5)', width: 5 } // Added new complex property
        },

        // Renamed 'title' to 'mainHeading'.
        mainHeading: {
            style: createTextStyle(lightText, 'bold', '1.15em', '"Roboto Slab", Georgia, serif'), // Rewritten style, changed font
            align: 'center' // Added new property
        },

        // Renamed 'subtitle' to 'subHeading'.
        subHeading: {
            style: createTextStyle(mediumText, 'normal', '0.9em', '"Roboto", sans-serif'), // Rewritten style, changed font
            enabled: true // Added new property, default is true but explicitly stated.
        },

        // Renamed 'xAxis' to 'horizontalAxis'.
        horizontalAxis: {
            gridLineColor: '#444444', // Changed color
            gridLineThickness: 1,     // Renamed gridLineWidth
            labelConfig: {            // Renamed 'labels' to 'labelConfig'
                style: {
                    color: neutralGray // Changed color
                }
            },
            axisLineColor: neutralGray, // Renamed 'lineColor'
            tickMarkColor: neutralGray, // Renamed 'tickColor'
            axisTitle: {                // Renamed 'title'
                style: createTextStyle('#DDD', 'bolder', '13px', 'Verdana, sans-serif'), // Rewritten style
                rotation: 0 // Added new property
            },
            opposite: false // Added new property, similar to yAxis
        },

        // Renamed 'yAxis' to 'verticalAxis'.
        verticalAxis: {
            gridLineColor: '#444444', // Changed color
            labelConfig: {
                style: {
                    color: neutralGray // Changed color
                }
            },
            axisLineColor: neutralGray,
            minorTickInterval: 'auto', // Changed from null to 'auto'
            tickMarkColor: neutralGray,
            tickMarkWidth: 2,         // Renamed tickWidth, changed value
            axisTitle: {
                style: createTextStyle('#DDD', 'bolder', '13px', 'Verdana, sans-serif') // Rewritten style
            },
            allowDecimals: true // Added new property
        },

        // Renamed 'tooltip' to 'dataTip'.
        dataTip: {
            backgroundFill: 'rgba(0, 0, 0, 0.85)', // Renamed backgroundColor, changed opacity
            textStyle: {                        // Renamed style
                color: '#F5F5F5',               // Changed color
                padding: '5px'                  // Added new property
            },
            shared: true,                       // Added new property
            borderWidth: 0,                     // Added new property (was implicitly 0 or default)
            shadow: false                       // Added new property
        },

        // Renamed 'toolbar' to 'actionPanel'.
        actionPanel: {
            elementStyle: { // Renamed itemStyle
                color: 'lightgray' // Changed color
            },
            visible: true // Added new property
        },

        // Renamed 'plotOptions' to 'seriesOptions'.
        seriesOptions: {
            linePlot: { // Renamed 'line' to 'linePlot'
                valueLabels: { // Renamed 'dataLabels' to 'valueLabels'
                    color: '#BBB' // Changed color
                },
                pointMarker: { // Renamed 'marker' to 'pointMarker'
                    lineColor: '#444', // Changed color
                    radius: 4 // Added new property
                }
            },
            splinePlot: { // Renamed 'spline' to 'splinePlot'
                pointMarker: {
                    lineColor: '#444'
                }
            },
            scatterPlot: { // Renamed 'scatter' to 'scatterPlot'
                pointMarker: {
                    lineColor: '#444'
                }
            },
            candlestickPlot: { // Renamed 'candlestick' to 'candlestickPlot'
                outlineColor: solidWhite, // Renamed 'lineColor'
                upColor: accentGreen, // Added new property
                downColor: accentRed // Added new property
            },
            // Added a new series type option
            areaPlot: {
                fillColor: createLinearGradient(0, 0, 0, 1, [
                    [0, 'rgba(100, 150, 200, 0.5)'],
                    [1, 'rgba(100, 150, 200, 0)']
                ]),
                lineWidth: 2
            }
        },

        // Renamed 'legend' to 'keyDisplay'.
        keyDisplay: {
            itemStyle: {
                font: '10pt "Open Sans", sans-serif', // Changed font and size
                color: mediumText
            },
            itemHoverStyle: {
                color: solidWhite // Changed color
            },
            itemHiddenStyle: {
                color: darkText // Changed color
            },
            layout: 'horizontal', // Added new property
            align: 'center',      // Added new property
            verticalAlign: 'bottom' // Added new property
        },

        // Renamed 'credits' to 'attribution'.
        attribution: {
            style: {
                color: '#777' // Changed color
            },
            enabled: false // Added new property
        },

        // Renamed 'labels' to 'generalLabels'.
        generalLabels: {
            style: {
                color: '#BBB' // Changed color
            }
        },

        // Renamed 'navigation' to 'controlPanel'.
        controlPanel: {
            buttonOptions: {
                symbolOutline: '#CCCCCC', // Renamed symbolStroke
                hoverSymbolOutline: '#FFFFFF', // Renamed hoverSymbolStroke
                widgetTheme: { // Renamed theme
                    fill: createLinearGradient(0, 0, 0, 1, [
                        [0.3, '#505050'], // Changed stop values
                        [0.7, '#222222']  // Changed stop values
                    ]),
                    outline: solidBlack // Renamed stroke
                }
            },
            buttonAlignment: 'right' // Added new property
        },

        // Renamed 'rangeSelector' to 'timeRangeFilter'.
        timeRangeFilter: {
            buttonSkin: { // Renamed buttonTheme
                fill: createLinearGradient(0, 0, 0, 1, [
                    [0.45, '#777'], // Changed stop values
                    [0.55, '#444']  // Changed stop values
                ]),
                stroke: solidBlack,
                labelStyle: { // Renamed style
                    color: '#DDD', // Changed color
                    fontWeight: 'normal' // Changed font weight
                },
                interactionStates: { // Renamed states
                    onHover: { // Renamed hover
                        fill: createLinearGradient(0, 0, 0, 1, [
                            [0.45, '#AAA'],
                            [0.55, '#777']
                        ]),
                        stroke: solidBlack,
                        labelStyle: {
                            color: 'lightyellow' // Changed color
                        }
                    },
                    onSelect: { // Renamed select
                        fill: createLinearGradient(0, 0, 0, 1, [
                            [0.15, '#111'], // Changed stop values
                            [0.35, '#444']  // Changed stop values
                        ]),
                        stroke: solidBlack,
                        labelStyle: {
                            color: 'lime' // Changed color
                        }
                    }
                }
            },
            inputFieldStyle: { // Renamed inputStyle
                backgroundColor: '#222', // Changed color
                color: 'gainsboro' // Changed color
            },
            textLabelStyle: { // Renamed labelStyle
                color: 'gainsboro' // Changed color
            },
            selectedButtonIndex: 0 // Added new property
        },

        // Renamed 'navigator' to 'overviewPanel'.
        overviewPanel: {
            handleElements: { // Renamed handles
                backgroundFill: '#777', // Renamed backgroundColor
                borderOutline: '#BBB' // Renamed borderColor
            },
            borderOutlineColor: '#DDD', // Renamed outlineColor
            maskOverlay: 'rgba(20, 20, 20, 0.6)', // Renamed maskFill, changed opacity
            dataSeries: { // Renamed series
                mainColor: accentBlue, // Renamed color
                outlineStroke: '#B0D0F0' // Renamed lineColor
            },
            panelHeight: 50 // Renamed height (from original plan, added it here)
        },

        // Renamed 'scrollbar' to 'scrollControl'.
        scrollControl: {
            barFill: createLinearGradient(0, 0, 0, 1, [
                [0.4, '#888'],
                [0.6, '#555']
            ]),
            barBorder: '#BBB', // Renamed barBorderColor
            arrowColor: '#DDD', // Renamed buttonArrowColor
            buttonFill: createLinearGradient(0, 0, 0, 1, [
                [0.4, '#888'],
                [0.6, '#555']
            ]),
            buttonBorder: '#BBB', // Renamed buttonBorderColor
            gripColor: solidWhite, // Renamed rifleColor
            trackFill: createLinearGradient(0, 0, 0, 1, [
                [0, '#111'], // Changed stop values
                [1, '#444']  // Changed stop values
            ]),
            trackBorder: '#777', // Renamed trackBorderColor
            showButtons: true // Added new property
        },

        // Global color overrides, renamed and slightly altered.
        globalLegendBackground: 'rgba(0, 0, 0, 0.6)',
        secondaryBackgroundGradient: 'rgb(40, 40, 80)', // Renamed background2
        primaryDataLabelColor: '#555', // Renamed dataLabelsColor
        generalTextColor: '#D0D0D0', // Renamed textColor
        overlayMaskColor: 'rgba(255,255,255,0.2)' // Renamed maskColor
    };

    // Add a simple validation or default assignment for a critical property
    if (!coreStyleProfile.canvasSettings.outlineColor) {
        console.warn("Canvas outline color not defined, defaulting to black.");
        coreStyleProfile.canvasSettings.outlineColor = solidBlack;
    }

    return coreStyleProfile;
})(); // Immediately invoked function to encapsulate helpers and ensure single creation.


// Apply the generated visual configuration to the charting library.
// Renamed 'Highcharts' to 'ChartEngine' and 'setOptions' to 'applyVisualConfig'.
// Renamed 'highchartsOptions' to 'appliedChartConfig'.
const appliedChartConfig = ChartEngine.applyVisualConfig(ChartEngine.visualConfig);