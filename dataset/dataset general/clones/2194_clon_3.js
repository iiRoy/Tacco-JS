'use strict'; // Enforce strict mode for cleaner code execution

// Core performance measurement utility
const PerformanceMeasure = require('benchmark');

// Custom color manipulation library under test
const CustomColorProcessor = require('./index');
// Industry-standard color library for comparison 1
const StandardColorJS = require('color');
// Another popular color utility library for comparison 2
const MinimalColorTool = require('tinycolor2');
// Advanced color toolkit for comparison 3
const ArtisticColorEngine = require('chroma-js');

// Configuration for benchmark suite execution
const benchmarkOptions = {
  // Run tests asynchronously to prevent blocking the event loop
  async: true,
  // Minimum time a test is run for in seconds
  minSamples: 5,
};

/**
 * Executes a group of performance tests for various color operations.
 * @param {string} groupIdentifier - A unique label for the test group.
 * @param {Object.<string, Function>} evaluationCases - An object where keys are test names and values are functions to benchmark.
 */
const orchestrateBenchmarks = (groupIdentifier, evaluationCases) => {
  // Display the current benchmark group being processed
  console.log(`\n--- Evaluating: ${groupIdentifier.toUpperCase()} ---`);

  // Initialize a new benchmark suite instance
  const activeBenchmarkSuite = new PerformanceMeasure.Suite();

  // Add each provided test case to the suite
  Object.entries(evaluationCases).forEach(([testName, testFn]) => {
    activeBenchmarkSuite.add(testName, testFn);
  });

  // Event listener for each test cycle completion
  activeBenchmarkSuite.on('cycle', (cycleEvent) => {
    // Output the string representation of the completed test cycle
    console.log(`  ${String(cycleEvent.target)}`);
  });

  // Event listener for the entire suite completion
  activeBenchmarkSuite.on('complete', function() {
    // Determine and report the fastest performing test within the suite
    const leadingPerformer = this.filter('fastest').pluck('name');
    console.log(`\n  >>> Optimal choice for this scenario: ${leadingPerformer} <<<`);
  });

  // Execute the benchmark suite with predefined options
  activeBenchmarkSuite.run(benchmarkOptions);
};

// --- Test Data Definitions ---
// A standard hexadecimal color string
const sampleHexValue = '#bada55';
// HSV color representation as an object
const sampleHsvFormat = { hue: 180, saturation: 50, value: 50 };
// HSV color representation as an array
const sampleHsvArr = [180, 50, 50];
// HSL color representation as an object
const sampleHslFormat = { hue: 180, saturation: 50, lightness: 50 };
// HSL color representation as an array
const sampleHslArr = [180, 50, 50];

// Main execution block for all benchmark suites
(function performAllColorTests() {

  // Test Suite 1: Convert HSV to RGB
  orchestrateBenchmarks('HSV to RGB Conversion', {
    // Custom library test
    customLib: () => {
      CustomColorProcessor.fromHsvObject(sampleHsvFormat).toRgbObject();
    },
    // Standard JS color library test
    standardLib: () => {
      StandardColorJS(sampleHsvFormat).rgb().object(); // Added .object() for a slightly different, but equivalent, call
    },
    // Minimal Color Tool test
    minimalTool: () => {
      MinimalColorTool(sampleHsvFormat).toRgb();
    },
    // Artistic Color Engine test
    artisticEngine: () => {
      // Ensure array is valid before processing
      if (!Array.isArray(sampleHsvArr) || sampleHsvArr.length !== 3) {
        throw new Error("Invalid HSV array provided for artisticEngine.");
      }
      ArtisticColorEngine(sampleHsvArr, 'hsv').rgb();
    },
  });

  // Test Suite 2: Hex to Lighten to Hex
  orchestrateBenchmarks('Hex Color Lightening Sequence', {
    // Custom library test
    customLib: () => {
      const baseColor = CustomColorProcessor.fromHex(sampleHexValue);
      baseColor.lighter(20).toHex(); // Intermediate variable
    },
    // Standard JS color library test
    standardLib: () => {
      StandardColorJS(sampleHexValue).lighten(0.2).hexString();
    },
    // Minimal Color Tool test
    minimalTool: () => {
      MinimalColorTool(sampleHexValue).lighten(20).toHexString();
    },
    // Artistic Color Engine test
    artisticEngine: () => {
      const brighteningFactor = 20; // Helper variable
      ArtisticColorEngine(sampleHexValue).brighten(brighteningFactor).hex();
    },
  });

  // Test Suite 3: Hex to Lighten to Darken to Hex
  orchestrateBenchmarks('Complex Hex Adjustment Chain', {
    // Custom library test
    customLib: () => {
      CustomColorProcessor.fromHex(sampleHexValue).lighter(10).darker(20).toHex();
    },
    // Standard JS color library test
    standardLib: () => {
      let currentWorkingColor = StandardColorJS(sampleHexValue);
      currentWorkingColor = currentWorkingColor.lighten(0.1); // Reassignment
      currentWorkingColor.darken(0.2).hexString();
    },
    // Minimal Color Tool test
    minimalTool: () => {
      MinimalColorTool(sampleHexValue).lighten(10).darken(20).toHexString();
    },
    // Artistic Color Engine test
    artisticEngine: () => {
      ArtisticColorEngine(sampleHexValue).brighten(20).darken(20).hex();
    },
  });

  // Test Suite 4: Hex to Hex (Identity Conversion)
  orchestrateBenchmarks('Direct Hex String Retrieval', {
    // Custom library test
    customLib: () => {
      CustomColorProcessor.fromHex(sampleHexValue).toHex();
    },
    // Standard JS color library test
    standardLib: () => {
      StandardColorJS(sampleHexValue).hexString();
    },
    // Minimal Color Tool test
    minimalTool: () => {
      MinimalColorTool(sampleHexValue).toHexString();
    },
    // Artistic Color Engine test
    artisticEngine: () => {
      ArtisticColorEngine(sampleHexValue).hex();
    },
  });

  // Test Suite 5: HSV to RGB to Hex
  orchestrateBenchmarks('Full HSV to RGB to Hex Path', {
    // Custom library test
    customLib: () => {
      const hsvSource = CustomColorProcessor.fromHsvObject(sampleHsvFormat);
      hsvSource.toRgbObject(); // Intermediate step
      hsvSource.toHex();
    },
    // Standard JS color library test
    standardLib: () => {
      const colorRef = StandardColorJS(sampleHsvFormat);
      colorRef.rgb();
      // Optional check for robustness, though unlikely to fail here
      if (colorRef && typeof colorRef.hexString === 'function') {
        colorRef.hexString();
      }
    },
    // Minimal Color Tool test
    minimalTool: () => {
      const tinyColorRef = MinimalColorTool(sampleHsvFormat);
      tinyColorRef.toRgb();
      tinyColorRef.toHexString();
    },
    // Artistic Color Engine test
    artisticEngine: () => {
      const chromaInstance = ArtisticColorEngine(sampleHsvArr, 'hsv');
      chromaInstance.rgb();
      chromaInstance.hex();
    },
  });

  // Test Suite 6: HSV to HSL
  orchestrateBenchmarks('HSV to HSL Conversion', {
    // Custom library test
    customLib: () => {
      CustomColorProcessor.fromHsvObject(sampleHsvFormat).toHslObject();
    },
    // Standard JS color library test
    standardLib: () => {
      StandardColorJS(sampleHsvFormat).hsl().object(); // Consistent output format
    },
    // Minimal Color Tool test
    minimalTool: () => {
      MinimalColorTool(sampleHsvFormat).toHsl(); // Adjusted to match test name
    },
    // Artistic Color Engine test
    artisticEngine: () => {
      ArtisticColorEngine(sampleHsvArr, 'hsv').hsl();
    },
  });

  // Test Suite 7: HSL to HSV
  orchestrateBenchmarks('HSL to HSV Conversion', {
    // Custom library test
    customLib: () => {
      CustomColorProcessor.fromHslObject(sampleHslFormat).toHsvObject();
    },
    // Standard JS color library test
    standardLib: () => {
      StandardColorJS(sampleHslFormat).hsv().array(); // Different output format
    },
    // Minimal Color Tool test
    minimalTool: () => {
      MinimalColorTool(sampleHslFormat).toHsv(); // Adjusted to match test name
    },
    // Artistic Color Engine test
    artisticEngine: () => {
      ArtisticColorEngine(sampleHslArr, 'hsl').hsv();
    },
  });

})(); // Immediately-invoked function expression to encapsulate tests