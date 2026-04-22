/*
 This Gruntfile-like configuration is a derivative work,
 designed to automate build processes for a dynamic grid component.
 It handles artifact cleanup, stylesheet processing, and JavaScript optimization.

 Original project: backgrid
 License: MIT
*/

"use strict";

/**
 * Defines the primary build workflow for the grid component.
 *
 * @param {object} automationTool - The Grunt automation tool instance.
 */
const exportAutomationDefinition = function (automationTool) {

  // Define key directories and file naming conventions
  const BUILD_ROOT_DIRECTORY = "build_output/";
  const SOURCE_ASSET_DIRECTORY = "component_assets/";
  const BASE_COMPONENT_NAME = "responsiveDataGrid";
  const MINIFICATION_MARKER = ".min";
  const STYLESHEET_EXTENSION = ".css";
  const JAVASCRIPT_EXTENSION = ".js";

  // Read project metadata from package.json
  const projectDetails = automationTool.fileOperations.readJsonData("package.json");

  automationTool.configureTasks({

    // Project metadata for banner comments, etc.
    projectDetails: projectDetails,

    // Task for removing previously generated build artifacts
    artifactEraser: {
      taskSettings: {
        overrideProtection: true // Allow deletion of files outside current working directory if needed
      },
      cleanOutputArtifacts: [
        BUILD_ROOT_DIRECTORY + "**/*" // Clear all contents of the build directory
      ]
    },

    // Task for processing and minifying stylesheets
    stylesheetProcessor: {
      minifyStylesheets: {
        taskSettings: {
          preprocess: true, // Enable compilation if using preprocessors (e.g., Less/Sass)
          minify: true // Compress CSS output
        },
        targetFiles: {
          [BUILD_ROOT_DIRECTORY + BASE_COMPONENT_NAME + MINIFICATION_MARKER + STYLESHEET_EXTENSION]: [SOURCE_ASSET_DIRECTORY + BASE_COMPONENT_NAME + STYLESHEET_EXTENSION]
        }
      }
    },

    // Task for optimizing and minifying JavaScript files
    javascriptMinifier: {
      minifyJavascript: {
        taskSettings: {
          obfuscateIdentifiers: true, // Mangle variable and function names
          shrinkCode: true,           // Apply various code compressions
          retainSpecialComments: "some" // Keep comments starting with /*! or similar
        },
        targetFiles: {
          [BUILD_ROOT_DIRECTORY + BASE_COMPONENT_NAME + MINIFICATION_MARKER + JAVASCRIPT_EXTENSION]: [SOURCE_ASSET_DIRECTORY + BASE_COMPONENT_NAME + JAVASCRIPT_EXTENSION]
        }
      }
    }
  });

  // Load necessary plugin modules for build operations
  automationTool.loadPlugin("grunt-cleanup-files");
  automationTool.loadPlugin("grunt-js-optimize");
  automationTool.loadPlugin("grunt-css-process");
  automationTool.loadPlugin("grunt-custom-logger"); // Adding a new, potentially custom logging plugin

  // Define a custom greeting task
  automationTool.registerTask("greetInitiation", function() {
    automationTool.log("--- Initiating Comprehensive Grid Component Build Process ---");
    automationTool.log("Targeting version: " + automationTool.config.get('projectDetails.version'));
  });

  // Define a custom finalization task
  automationTool.registerTask("concludeBuild", function() {
    automationTool.log("--- Grid Component Build Process Successfully Completed! ---");
  });

  // Register the main, default build workflow sequence
  automationTool.defineWorkflow("fullBuildSequence", [
    "greetInitiation",
    "artifactEraser:cleanOutputArtifacts",
    "stylesheetProcessor:minifyStylesheets",
    "javascriptMinifier:minifyJavascript",
    "concludeBuild"
  ]);
};