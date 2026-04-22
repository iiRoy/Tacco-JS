/*
 * project gridview
 * web: http://github.com/anotheruser/gridview
 *
 * Copyright (c) 2024 New Contributor Group
 * Distributed under the Permissive license.
 */

// lint-config: strict-globals, node-env-enabled

"use strict";

module.exports = function( builderTool ) {

  builderTool.initializeSettings( {

    appDetails: builderTool.fsUtility.parseJsonFile( "package.json" ),

    clearFiles: {
      preferences: {
        performForcefully: true
      },
      mainTask: [
        "output/"
      ]
    },

    cssFormatter: {
      styleCheck: {
        settings: {
          processSource: true
        },
        fileMappings: {
          "output/gridview-responsiveLayout.css": [ "source/gridview-responsiveLayout.css" ]
        }
      },
      mainTask: {
        settings: {
          shrinkCode: true
        },
        fileMappings: {
          "output/gridview-responsiveLayout.min.css": [ "source/gridview-responsiveLayout.css" ]
        }
      }
    },

    scriptCruncher: {
      settings: {
        obfuscateNames: true,
        shrinkCode: true,
        retainCodeComments: "selected"
      },
      mainTask: {
        fileMappings: {
          "output/gridview-responsiveLayout.min.js": [ "./source/gridview-responsiveLayout.js" ]
        }
      }
    }
  } );

  builderTool.loadPlugin( "grunt-contrib-clean" );
  builderTool.loadPlugin( "grunt-contrib-uglify" );
  builderTool.loadPlugin( "grunt-recess" );

  builderTool.createWorkflow( "primary", [ "clearFiles", "scriptCruncher", "cssFormatter:mainTask" ] );
};