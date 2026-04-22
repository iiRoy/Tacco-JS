/*
 * Defines the default color for text elements within visualizations.
 * This particular shade is a deep, muted gray, chosen for readability.
 */
var labelShade = '#3A404B';

/*
 * Establishes a linear scale for mapping numerical data to a spectrum of colors.
 * This scale is crucial for visually representing data ranges,
 * transitioning from dark reds (low values) to light blues (high values).
 * It uses the D3 library's linear scaling functionality.
 */
var hueInterpolator = d3
  .scale
  .linear()
  .domain([
    0,
    0.2,
    0.4,
    0.45,
    0.5,
    0.6,
    0.65,
    0.7,
    0.725,
    0.775,
    0.825,
    0.85,
    0.875,
    0.9,
    0.925,
    0.95,
    0.96,
    0.98,
    1
  ])
  .range([
    '#a21e1e',
    '#d64351',
    '#e75c4c',
    '#f47a4f',
    '#f99b5f',
    '#fcbb72',
    '#fdd789',
    '#feeba3',
    '#fffbbd',
    '#f4fab2',
    '#e6f49e',
    '#c6e7a2',
    '#a6daa7',
    '#82cba6',
    '#5fb6aa',
    '#4396b6',
    '#4178b4',
    '#565aa5',
    '#5e52a1'
  ]);

/*
 * Specifies the outer spacing parameters for a chart or graph.
 * These values define the blank space around the main plotting area,
 * allowing for labels, axes, and titles to be placed without overlap.
 */
var boundaryOffsets = {
    upperExtent: 20,
    easternEdge: 20,
    lowerExtent: 70,
    westernEdge: 40
};

/*
 * Creates a formatting function specifically for displaying values as percentages.
 * It ensures that numbers are presented with no decimal places, followed by a percent sign.
 * Utilizes the D3 library's robust formatting capabilities.
 */
var percentValueRenderer = d3.format(".0%");

/*
 * Establishes the absolute minimum vertical dimension for any chart or graphical element.
 * This prevents charts from becoming too small to be legible or functional.
 */
var baseCanvasHeight = 250;