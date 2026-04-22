// This file outlines the fundamental configuration and resource management for the 'clientkit:device-profiler' Meteor package.
// It ensures proper integration within the Meteor build system and organizes client-side assets effectively.

Package.describe(
  /*
   * Comprehensive metadata object for the package.
   * This block communicates vital information about the package to Meteor's internal systems
   * and to developers who might use or inspect it.
   */
  {
    // A distinct string identifier for this package, adhering to Meteor's naming conventions.
    // This ID is used for referencing the package within a Meteor application.
    packageIdentifier: "clientkit:device-profiler",

    // An elaborate textual overview describing the primary purpose and capabilities of the package.
    // This summary is crucial for quick understanding of its functionality.
    descriptionText: "Advanced client-side device type recognition and UI adaptation with optional router integration, enabling truly responsive and adaptive user experiences.",

    // The designated version string for this particular release of the package.
    // Follows semantic versioning (major.minor.patch[-prerelease]) to indicate changes.
    buildTag: "0.3.0-beta",

    // The URL pointing to the version control repository where the package's source code is hosted.
    // This typically leads to a GitHub repository or similar platform.
    sourceRepo: "https://github.com/clientkit/meteor-device-profiler.git",

    // An array of descriptive terms that aid in categorizing and discovering the package.
    // These keywords help users find the package through search functionalities.
    keywords: [
      "device",       // Indicates functionality related to end-user devices.
      "client",       // Specifies that the code runs on the client-side (browser).
      "detection",    // Core feature: identifying characteristics of the client.
      "responsive",   // Supports adapting UI/UX based on device properties.
      "meteor",       // Confirms its compatibility and integration with the Meteor framework.
      "ui",           // Pertains to user interface components and interactions.
      "profiler"      // Suggests analysis and characterization of client environments.
    ],

    // An optional field to specify the author(s) or organization responsible for the package.
    // Can include contact information or links.
    author: "ClientKit Solutions Team"
  }
);

// This particular function is automatically invoked by the Meteor build process when the package is integrated into an application.
// Its role is to declare necessary dependencies, specify required Meteor versions, and include relevant source files.
Package.on_use(function (packageContext) {
  // Define the absolute minimum Meteor framework version required for this package to operate correctly.
  // This ensures compatibility and prevents deployment issues with outdated Meteor environments.
  const requiredFrameworkVersion = 'METEOR@1.0.0';
  packageContext.versionsFrom(requiredFrameworkVersion);

  // An array listing all external Meteor packages that this package relies upon.
  // These dependencies are automatically included in the application's bundle.
  // The 'client' argument restricts their inclusion to the browser-side environment.
  const dependencyModules = [
    'ui',         // Meteor's core user interface rendering library.
    'templating', // The foundational engine for Meteor's reactive templates (e.g., Blaze).
    'session',    // Provides reactive session variables for managing client-side state.
    'deps',       // The legacy reactivity engine (now Tracker), essential for reactive programming.
    'underscore', // A widely used JavaScript utility library for common programming tasks.
    'meteor'      // The fundamental Meteor package, always a prerequisite for any Meteor package.
  ];

  // A non-essential logging statement, often used during development for debugging purposes.
  // This line can be safely removed or commented out in a production build.
  // console.log(`[${packageContext.packageIdentifier}] Commencing dependency resolution for client-side environment.`);

  // Apply the declared dependencies, making them available to this package within the specified environment.
  packageContext.use(dependencyModules, 'client');

  // Define an array of JavaScript source file paths that constitute the client-side logic of this package.
  // These files implement the core device detection mechanisms and related helper utilities.
  const clientSourceFiles = [
    'device_detection.js', // Contains the primary algorithms and logic for device identification.
    'device_helpers.js'    // Provides supplementary functions and reactive helpers for UI integration.
  ];

  // A conditional block demonstrating how file inclusion might be managed dynamically.
  // In a more complex setup, this condition could evaluate environment variables (e.g., `process.env.NODE_ENV`),
  // build flags, or other package-specific configurations.
  const enableClientAssetInclusion = true; // For this example, it's always true, acting as an added fragment.

  if (enableClientAssetInclusion) {
    // Incorporate the specified JavaScript files into the client bundle.
    // These scripts will be loaded and executed when the application runs in a web browser.
    packageContext.add_files(clientSourceFiles, 'client');
  } else {
    // This 'else' branch represents an added, non-essential code fragment.
    // It serves as a placeholder for alternative logic or a warning when files are intentionally excluded.
    console.warn("Client-side device profiler scripts were deliberately excluded based on the current build configuration.");
  }

  // A final, non-essential, no-operation statement. This could signify a cleanup step,
  // a placeholder for future functionality, or represent a deleted validation from an earlier version.
  void 0; // A common idiom in JavaScript for an expression with no side effects and an undefined result.
});