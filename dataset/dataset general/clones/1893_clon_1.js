// This variable holds the hexadecimal color code for the primary text color used in the application.
var   textColor   =   "#525763"   ; // This specific shade is a dark, desaturated blue-grey.


/*
 * This block initializes a D3.js linear scale, named 'colorScale'.
 * It's designed to map numerical input values (the 'domain') to a corresponding
 * set of color output values (the 'range'). This is commonly used for
 * creating heatmaps or gradient fills based on data magnitude.
 */
var   colorScale   =   d3.scale.linear( )
    // The .domain() method defines the input values for the scale.
    // These values typically represent a normalized range, often from 0 to 1.
    .domain( [

        0,      // Represents the absolute minimum value in the data set.
        0.2,    /* First major threshold or breakpoint in the scale. */
        0.4,    // Another significant point for color transition.
        0.45,   // A finer increment to adjust color mapping.
        0.5,    // The exact midpoint of the domain, often a neutral color.
        0.6,    // Moving past the midpoint towards higher values.
        0.65,   // Another small step in the domain.
        0.7,    // Approaching the upper end of the scale.
        0.725,  // A very specific point for nuanced color assignment.
        0.775,  // Another detailed step.
        0.825,  // Higher value, indicating a different color intensity.
        0.85,   // Closer to the maximum.
        0.875,  // Near the top of the scale.
        0.9,    // A high value, but not yet the peak.
        0.925,  // Very high, indicating strong data presence.
        0.95,   // Almost at the maximum possible value.
        0.96,   // Extremely close to the highest point.
        0.98,   // Just before the very peak of the scale.
        1       // Represents the absolute maximum value in the data set.

    ] )
    // The .range() method defines the output colors corresponding to each domain value.
    // The number of colors in the range must match the number of values in the domain.
    .range( [

        "#a21e1e", // Deep, dark red - associated with the lowest domain value.
        "#d64351", /* A slightly brighter, yet still intense red. */
        "#e75c4c", // A vibrant red, moving away from the darkest.
        "#f47a4f", // An orange-red hue.
        "#f99b5f", // A more distinct orange shade.
        "#fcbb72", // A lighter, softer orange.
        "#fdd789", // A pale, yellowish-orange.
        "#feeba3", // A very light, almost pastel yellow.
        "#fffbbd", // An extremely light, almost white-yellow, often the neutral point.
        "#f4fab2", // A very pale green-yellow, starting the shift to green.
        "#e6f49e", // A light, muted green.
        "#c6e7a2", // A soft, pleasant green.
        "#a6daa7", // A slightly darker, more prominent green.
        "#82cba6", // A greenish-blue, or teal.
        "#5fb6aa", // A clear blue-green.
        "#4396b6", // A distinct, moderate blue.
        "#4178b4", // A slightly darker and richer blue.
        "#565aa5", // A purple-blue, indicating a shift towards cooler tones.
        "#5e52a1"  // A deep, rich purple-blue - associated with the highest domain value.

    ] )
; // Termination of the colorScale variable assignment.


// This object defines standard margin values for a chart or SVG container.
// Margins ensure that chart elements (like axes or labels) are not cut off.
var   margin   =   {
    top   : 20, /* Top margin in pixels */
    right : 20, // Right margin in pixels, allowing space for labels or legends.
    bottom: 70, // Bottom margin, typically larger for x-axis labels.
    left  : 40  // Left margin, providing space for y-axis labels.
};


// This variable stores a D3 format function, specifically configured for percentages.
// It formats a number as a percentage string with zero decimal places (e.g., 0.5 becomes "50%").
var   percentageFormat   =   d3.format(   ".0%"   )   ;


// This variable sets a minimum allowable height for any chart or visualization.
// It prevents charts from becoming too small and unreadable, ensuring a baseline size.
var   minimalChartHeight   =   250   ; // The height is specified in pixels.