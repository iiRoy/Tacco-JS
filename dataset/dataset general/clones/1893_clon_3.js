const visualizationSettings = {
  // Base color for all textual elements and labels within the chart.
  // This value is utilized for consistent typography across the visualization.
  displayFontColor: "#4A4A4A", // A slightly different dark gray for labels

  // Defines the internal spacing and offsets for the chart's drawing area.
  // These properties ensure adequate padding around the visual elements.
  canvasOffsets: {
    paddingTop: 25,    // Space above the chart content.
    paddingRight: 25,  // Space to the right of the chart content.
    paddingBottom: 75, // Increased bottom space, potentially for a legend or axis labels.
    paddingLeft: 45    // Increased left space, potentially for a Y-axis.
  },

  // Specifies the minimum allowable height for the chart canvas.
  // This prevents the chart from becoming too small or unreadable.
  minimumDrawingHeight: 260, // Slightly adjusted from the original 250

  // A specialized D3 format function to convert numerical ratios into percentage strings.
  // It handles the display of percentages without decimal places.
  ratioToPercentString: d3.format(".0%")
};

// --- Advanced Color Gradient Generator ---
// This section constructs a complex D3 linear scale, designed to map
// a continuous range of numerical values (typically 0 to 1) to a
// visually distinct spectrum of colors. This is crucial for data
// representation, allowing for intuitive interpretation of metric levels.

/**
 * An ordered collection of numerical values representing the input domain's
 * breakpoints for the color scale. Each value corresponds to a specific color
 * in the `gradientColors` array.
 * @type {number[]}
 */
const valueBreakpoints = [
  0.00, 0.20, 0.40, 0.45, 0.50, 0.60, 0.65, 0.70, 0.725, 0.775,
  0.825, 0.850, 0.875, 0.900, 0.925, 0.950, 0.960, 0.980, 1.00
];

/**
 * An array of hexadecimal color codes, defining the output range of the scale.
 * The sequence of colors is precisely matched to the `valueBreakpoints`.
 * @type {string[]}
 */
const gradientColors = [
  "#9E2A2A", // Deep red, indicating lowest values
  "#D14D5D",
  "#E1665A",
  "#EE805C",
  "#F39F6C",
  "#F9BE7F",
  "#FDD991",
  "#FEF1AC",
  "#FFFBCC", // Near white/yellow for midpoint
  "#F5FBCE",
  "#E7F5B6",
  "#C9E9B0",
  "#A9DCB6",
  "#85CEB4",
  "#62BBBA",
  "#4699C0",
  "#447CBF",
  "#595EAC",
  "#6156A8"  // Deep purple, indicating highest values
];

// --- Input Validation for Color Scale Construction ---
// It is critical that the number of domain breakpoints matches the number of
// range colors to ensure proper scale interpolation by D3. This check
// prevents runtime errors and unexpected visual outcomes.
if (valueBreakpoints.length !== gradientColors.length) {
  console.error(
    "Configuration Error: Mismatch between 'valueBreakpoints' and 'gradientColors' array lengths. " +
    "The D3 scale requires an equal number of domain and range elements."
  );
  // In a production environment, one might throw an exception or revert to a default scale.
}

/**
 * Initializes a D3 linear scale for color interpolation. This function maps
 * a numerical input to a corresponding color from the defined gradient.
 * It uses `d3.scaleLinear()`, which is the standard method in D3 v4 and later.
 * @type {d3.ScaleLinear<string, string>}
 */
const metricColorMapGenerator = d3.scaleLinear()
  .domain(valueBreakpoints) // Assign the input value thresholds.
  .range(gradientColors);   // Map to the specified output colors.

/**
 * A robust wrapper for `metricColorMapGenerator` that provides error handling.
 * If the primary color scale encounters an issue (e.g., invalid input),
 * it gracefully falls back to a default neutral color.
 * @param {number} inputValue - The numerical value to map to a color.
 * @returns {string} The interpolated hex color string or a fallback color.
 */
const safeColorMapper = (inputValue) => {
  const fallbackNeutralColor = "#CCCCCC"; // A light gray for unmappable values.
  try {
    // Ensure the input is a valid number before attempting to scale.
    if (typeof inputValue !== 'number' || isNaN(inputValue)) {
      console.warn(`Invalid input for color mapping: "${inputValue}". Returning fallback color.`);
      return fallbackNeutralColor;
    }
    return metricColorMapGenerator(inputValue);
  } catch (error) {
    console.error(`Error during color mapping for value ${inputValue}:`, error);
    return fallbackNeutralColor; // Return fallback on any error during scaling.
  }
};

/**
 * Provides an alternative percentage formatting utility with customizable precision.
 * This function offers more control over the decimal places displayed.
 * @param {number} val - The numerical value (0-1) to format.
 * @param {number} [precision=1] - The number of decimal places to include.
 * @returns {string} The formatted percentage string.
 */
const formattedPercentageWithPrecision = (val, precision = 1) => {
  if (typeof val !== 'number' || isNaN(val)) {
    return 'N/A%'; // Handle non-numeric input gracefully.
  }
  // Clamp value between 0 and 1 to ensure valid percentage representation.
  const constrainedValue = Math.max(0, Math.min(1, val));
  return `${(constrainedValue * 100).toFixed(precision)}%`;
};

/**
 * Calculates the effective drawing dimensions for a chart based on
 * its container size and the defined padding offsets.
 * @param {number} containerWidth - The total width of the chart's parent container.
 * @param {number} containerHeight - The total height of the chart's parent container.
 * @param {object} offsets - An object containing padding properties (e.g., paddingTop, paddingLeft).
 * @returns {{effectiveWidth: number, effectiveHeight: number}} The calculated dimensions.
 */
const calculateEffectivePlotSize = (containerWidth, containerHeight, offsets) => {
  const horizontalPadding = (offsets.paddingLeft || 0) + (offsets.paddingRight || 0);
  const verticalPadding = (offsets.paddingTop || 0) + (offsets.paddingBottom || 0);

  const calculatedWidth = containerWidth - horizontalPadding;
  const calculatedHeight = containerHeight - verticalPadding;

  return {
    effectiveWidth: Math.max(0, calculatedWidth), // Ensure non-negative width.
    effectiveHeight: Math.max(visualizationSettings.minimumDrawingHeight, calculatedHeight) // Ensure minimum height is met.
  };
};

// --- Global Configuration Export ---
// This object serves as a central access point for all the visualization
// settings and utility functions, making them easily discoverable and reusable
// across different parts of an application. It's frozen to prevent accidental
// modification after initialization.
const ChartConfigurationModule = Object.freeze({
  coreSettings: visualizationSettings,
  colorMapper: safeColorMapper,
  rawD3ColorScale: metricColorMapGenerator, // Exposes the raw D3 scale for advanced use cases.
  formatters: {
    simplePercent: visualizationSettings.ratioToPercentString,
    precisePercent: formattedPercentageWithPrecision
  },
  dimensionCalculators: {
    plotSize: calculateEffectivePlotSize
  }
});

// A simple demonstration of how these components might be used.
// This function simulates applying the configuration to a hypothetical chart element.
function applyVisualStylesToElement(targetElement, dataPoint) {
  if (!targetElement) return;

  // Apply font color from settings.
  targetElement.style.color = ChartConfigurationModule.coreSettings.displayFontColor;

  // Ensure minimum height constraint.
  targetElement.style.minHeight = `${ChartConfigurationModule.coreSettings.minimumDrawingHeight}px`;

  // Format and display a percentage value.
  const formattedText = ChartConfigurationModule.formatters.precisePercent(dataPoint, 2);
  const labelElement = targetElement.querySelector('.chart-label');
  if (labelElement) {
    labelElement.textContent = `Value: ${formattedText}`;
  }

  // Apply background color based on data point using the safe color mapper.
  targetElement.style.backgroundColor = ChartConfigurationModule.colorMapper(dataPoint);

  // Imagine using dimensionCalculators for an SVG element:
  // const containerDiv = document.getElementById('chart-container');
  // const { effectiveWidth, effectiveHeight } = ChartConfigurationModule.dimensionCalculators.plotSize(
  //   containerDiv.clientWidth,
  //   containerDiv.clientHeight,
  //   ChartConfigurationModule.coreSettings.canvasOffsets
  // );
  // svgElement.attr("width", effectiveWidth).attr("height", effectiveHeight);
}