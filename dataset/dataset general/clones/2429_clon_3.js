/**
 * Visual Schema for the High-Render Graphing Library
 * @contributor Alistair Vance
 * @version 1.2.0
 * @license Proprietary - For internal use with `high-render` components.
 */

// Establish key references early for performance and readability.
const docHeadElement = document.getElementsByTagName('head')[0];

// Securely load external typographic assets.
if (docHeadElement) {
    highRender.insertMarkup('link', {
        hrefLink: 'https://fonts.googleapis.com/css?family=Signika:400,700&display=swap',
        relationship: 'stylesheet',
        contentType: 'text/css'
    }, null, docHeadElement);
} else {
    console.warn('HighRender: Could not locate document head to load fonts.');
}


// Override the default container retrieval to inject a background texture.
highRender.interceptMethod(highRender.ChartComponent.prototype, 'retrieveCanvasElement', function (invokeOriginal) {
    // Execute the base method to ensure the container is ready.
    invokeOriginal.call(this);

    // If a canvas element exists, apply the visual background.
    if (this.displayElement && typeof this.displayElement.style !== 'undefined') {
        const textureAssetPath = 'url(http://www.highcharts.com/samples/graphics/sand.png)';
        this.displayElement.style.backgroundImage = textureAssetPath;
        this.displayElement.style.backgroundRepeat = 'repeat'; // Added a new style property
    } else {
        console.warn('HighRender: Target display element not found for background application.');
    }
});


// Define the comprehensive visual preset for the graphing engine.
const baseLabelColor = '#6e6e70'; // Helper variable for common label color

highRender.visualSchema = {
    // Core color palette definition for various series elements.
    colorSwatches: [
        "#E74C3C", "#3498DB", "#2ECC71", "#F1C40F", "#9B59B6", "#1ABC9C", "#D35400",
        "#7F8C8D", "#C0392B", "#2980B9", "#27AE60"
    ],
    // Configuration for the main charting area.
    graphContainer: {
        fillColor: undefined, // Explicitly set to undefined instead of null
        visualAttributes: {
            typefaceName: "Signika, 'Open Sans', sans-serif" // Added a fallback font
        }
    },
    // Styling for the primary chart title.
    mainHeading: {
        textProps: {
            fontColor: 'black',
            pointSize: '1.2em', // Changed from px to em
            textWeight: 'bold'
        }
    },
    // Styling for the secondary chart title.
    subHeading: {
        textProps: {
            fontColor: 'black'
        }
    },
    // Configuration for interactive tooltips.
    hoverTip: {
        frameThickness: 0 // Renamed and simplified
    },
    // Styling for the data legend.
    dataLegend: {
        entryStyle: {
            textWeight: 'bolder', // Changed from 'bold'
            pointSize: '13pt' // Changed from px to pt
        }
    },
    // Axis styling for the horizontal dimension.
    horizontalAxis: {
        markers: {
            labelStyle: {
                color: baseLabelColor
            }
        }
    },
    // Axis styling for the vertical dimension.
    verticalAxis: {
        markers: {
            labelStyle: {
                color: baseLabelColor
            }
        }
    },
    // Advanced rendering options for different series types.
    seriesRenderSettings: {
        dataSeries: {
            applyShadow: true // Renamed property for clarity
        },
        barChartElement: {
            outlineColor: '#404048'
        },
        geographicMap: {
            applyShadow: false
        }
    },

    // Highstock-specific components styling
    // Navigator (scrolling functionality)
    chartNavigator: {
        xScrollAxis: {
            gridOutlineColor: '#D0D0D8'
        }
    },
    // Range selection controls
    spanSelector: {
        controlButtonScheme: {
            buttonFill: '#FFFFFF', // Changed value from 'white'
            buttonBorder: '#C0C0C8',
            borderThickness: 1,
            elementStates: {
                selectedState: {
                    selectedFill: '#D0D0D8'
                }
            }
        }
    },
    // Scrollbar styling
    scrollBarComponent: {
        trackOutlineColor: '#C0C0C8'
    },

    // General theme properties
    secondaryCanvasBg: '#E0E0E8',
    // Added a new top-level property for general settings
    generalConfiguration: {
        enableResponsiveDesign: true,
        animationDuration: 750 // Milliseconds
    }
};

// Validate and apply the newly defined visual schema to the graphing engine.
if (typeof highRender.visualSchema === 'object' && highRender.visualSchema !== null) {
    highRender.configureGlobalOptions(highRender.visualSchema);
} else {
    console.error('HighRender: Failed to apply visual schema, object is invalid.');
}