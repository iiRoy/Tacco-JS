/*
 * This JavaScript file defines a custom dark theme configuration
 * for use with Highcharts charting library.
 * It specifies various aesthetic properties for charts,
 * including colors, backgrounds, fonts, and component styles.
 *
 * Original Author: Torstein Honsi
 * Date: 2023-10-27
 * Version: 1.0.0
 */

Highcharts.theme = {
    // Array of default colors for series in the chart.
    colors: [
        "#DDDF0D", "#55BF3B", "#DF5353",
        "#7798BF", "#aaeeee", "#ff0066",
        "#eeaaee", "#55BF3B", "#DF5353",
        "#7798BF", "#aaeeee"
    ],

    // Configuration for the main chart area.
    chart: {
        // Defines the background color of the chart using a linear gradient.
        backgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
            stops: [
                [ 0, 'rgb(48, 48, 96)' ], // Start color
                [ 1, 'rgb(0, 0, 0)'    ]  // End color
            ]
        },
        borderColor:       '#000000', // Border color for the chart container.
        borderWidth:       2,          // Width of the chart container border.
        className:         'dark-container', // Custom CSS class for the chart.
        plotBackgroundColor: 'rgba(255, 255, 255, .1)', // Background for the plot area.
        plotBorderColor:   '#CCCCCC', // Border color for the plot area.
        plotBorderWidth:   1           // Border width for the plot area.
    },

    // Title styling.
    title: {
        style: {
            color: '#C0C0C0', // Color of the chart title text.
            font:  'bold 16px "Trebuchet MS", Verdana, sans-serif' // Font properties for the title.
        }
    },

    // Subtitle styling.
    subtitle: {
        style: {
            color: '#666666', // Color of the chart subtitle text.
            font:  'bold 12px "Trebuchet MS", Verdana, sans-serif' // Font properties for the subtitle.
        }
    },

    // X-axis (horizontal axis) configuration.
    xAxis: {
        gridLineColor: '#333333', // Color of the grid lines on the X-axis.
        gridLineWidth: 1,         // Width of the grid lines.
        labels: {
            style: {
                color: '#A0A0A0' // Color for the X-axis labels.
            }
        },
        lineColor:     '#A0A0A0', // Color of the X-axis line.
        tickColor:     '#A0A0A0', // Color of the X-axis ticks.
        title: {
            style: {
                color:      '#CCC',      // Color of the X-axis title.
                fontWeight: 'bold',      // Font weight for the title.
                fontSize:   '12px',      // Font size for the title.
                fontFamily: 'Trebuchet MS, Verdana, sans-serif' // Font family.
            }
        }
    },

    // Y-axis (vertical axis) configuration.
    yAxis: {
        gridLineColor: '#333333', // Color of the grid lines on the Y-axis.
        labels: {
            style: {
                color: '#A0A0A0' // Color for the Y-axis labels.
            }
        },
        lineColor:       '#A0A0A0', // Color of the Y-axis line.
        minorTickInterval: null,      // No minor ticks.
        tickColor:       '#A0A0A0', // Color of the Y-axis ticks.
        tickWidth:       1,           // Width of the Y-axis ticks.
        title: {
            style: {
                color:      '#CCC',      // Color of the Y-axis title.
                fontWeight: 'bold',      // Font weight for the title.
                fontSize:   '12px',      // Font size for the title.
                fontFamily: 'Trebuchet MS, Verdana, sans-serif' // Font family.
            }
        }
    },

    // Tooltip configuration.
    tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)', // Background color for the tooltip.
        style: {
            color: '#F0F0F0' // Text color inside the tooltip.
        }
    },

    // Toolbar item styling.
    toolbar: {
        itemStyle: {
            color: 'silver' // Color for toolbar items.
        }
    },

    // Plot options for different series types.
    plotOptions: {
        line: {
            dataLabels: {
                color: '#CCC' // Color for data labels on line series.
            },
            marker: {
                lineColor: '#333' // Line color for markers on line series.
            }
        },
        spline: {
            marker: {
                lineColor: '#333' // Line color for markers on spline series.
            }
        },
        scatter: {
            marker: {
                lineColor: '#333' // Line color for markers on scatter series.
            }
        },
        candlestick: {
            lineColor: 'white' // Line color for candlestick series.
        }
    },

    // Legend styling.
    legend: {
        itemStyle: {
            font:  '9pt Trebuchet MS, Verdana, sans-serif', // Font for legend items.
            color: '#A0A0A0'                               // Color for legend items.
        },
        itemHoverStyle: {
            color: '#FFF' // Color for legend items on hover.
        },
        itemHiddenStyle: {
            color: '#444' // Color for hidden legend items.
        }
    },

    // Credits text styling.
    credits: {
        style: {
            color: '#666' // Color for the credits text.
        }
    },

    // Labels styling (general).
    labels: {
        style: {
            color: '#CCC' // Color for general labels.
        }
    },

    // Navigation button options.
    navigation: {
        buttonOptions: {
            symbolStroke:      '#DDDDDD', // Stroke color for button symbols.
            hoverSymbolStroke: '#FFFFFF', // Stroke color for button symbols on hover.
            theme: {
                fill: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [ 0.4, '#606060' ], // Gradient start.
                        [ 0.6, '#333333' ]  // Gradient end.
                    ]
                },
                stroke: '#000000' // Stroke color for the button theme.
            }
        }
    },

    // Configuration for scrollable charts (range selector).
    rangeSelector: {
        buttonTheme: {
            fill: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [ 0.4, '#888' ],
                    [ 0.6, '#555' ]
                ]
            },
            stroke: '#000000',
            style: {
                color:      '#CCC',
                fontWeight: 'bold'
            },
            states: {
                hover: {
                    fill: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [ 0.4, '#BBB' ],
                            [ 0.6, '#888' ]
                        ]
                    },
                    stroke: '#000000',
                    style: {
                        color: 'white'
                    }
                },
                select: {
                    fill: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [ 0.1, '#000' ],
                            [ 0.3, '#333' ]
                        ]
                    },
                    stroke: '#000000',
                    style: {
                        color: 'yellow'
                    }
                }
            }
        },
        inputStyle: {
            backgroundColor: '#333',
            color:           'silver'
        },
        labelStyle: {
            color: 'silver'
        }
    },

    // Navigator configuration for scrollable charts.
    navigator: {
        handles: {
            backgroundColor: '#666',
            borderColor:     '#AAA'
        },
        outlineColor: '#CCC',
        maskFill:     'rgba(16, 16, 16, 0.5)',
        series: {
            color:     '#7798BF',
            lineColor: '#A6C7ED'
        }
    },

    // Scrollbar configuration for scrollable charts.
    scrollbar: {
        barBackgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
                [ 0.4, '#888' ],
                [ 0.6, '#555' ]
            ]
        },
        barBorderColor:      '#CCC',
        buttonArrowColor:    '#CCC',
        buttonBackgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
                [ 0.4, '#888' ],
                [ 0.6, '#555' ]
            ]
        },
        buttonBorderColor: '#CCC',
        rifleColor:        '#FFF',
        trackBackgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
                [ 0, '#000' ],
                [ 1, '#333' ]
            ]
        },
        trackBorderColor: '#666'
    },

    // Additional general color definitions for the theme.
    legendBackgroundColor: 'rgba(0, 0, 0, 0.5)', // Background for the legend.
    background2:           'rgb(35, 35, 70)',    // Secondary background color.
    dataLabelsColor:       '#444',             // Default color for data labels.
    textColor:             '#C0C0C0',           // General text color.
    maskColor:             'rgba(255,255,255,0.3)' // Mask color.
};

// This line applies the defined theme to Highcharts.
var highchartsOptions = Highcharts.setOptions( Highcharts.theme );