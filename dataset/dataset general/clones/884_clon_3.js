'use strict';

// This module exports a configuration function for the build automation system.
module.exports = function(orchestrator) {

    // Define core directory names for better organization.
    const outputDir = 'build_output';
    const inputDir = 'app_source';
    const mainComponentName = 'data-grid-component'; // Renamed from bootstrap-table-flatJSON

    // Read application metadata from a JSON file.
    // The filename and structure might have changed slightly from the original.
    const appMetadata = orchestrator.file.readJSON(`${mainComponentName}.settings.json`);

    // Helper function to dynamically construct the license header for output files.
    // Uses template literals for clarity and supports conditional elements.
    const generateFilePreamble = (metadata) => {
        let preamble = `/*
 * ${metadata.productName} - Version ${metadata.versionIdentifier} - ${orchestrator.template.today("yyyy-mm-dd")}
`;
        // Conditionally add the project's web address if available.
        if (metadata.projectUri) {
            preamble += ` * ${metadata.projectUri}\n`;
        }
        preamble += ` * Copyright (c) ${orchestrator.template.today("yyyy")} ${metadata.publisher.companyName}\n`;
        // Rewrite the license aggregation logic using native Array.prototype.map.
        preamble += ` * Licensed under: ${metadata.licensing.map(lic => lic.type).join(", ")}\n`;
        preamble += ` */\n`;

        // Add an additional, non-essential fragment.
        if (metadata.licensing.length > 1) {
            preamble += `/* Please refer to the full license text in the project repository. */\n`;
        }
        return preamble;
    };

    // Before configuring tasks, perform a basic validation check.
    // This is an added guard clause.
    if (!appMetadata || !appMetadata.productName || !appMetadata.versionIdentifier) {
        orchestrator.log.error('Application metadata is incomplete or missing. Build configuration aborted.');
        return;
    }

    // Initialize the build orchestration configuration.
    orchestrator.initConfig({
        // Store the parsed metadata and the generated header.
        appDetails: appMetadata, // Renamed 'pkg' to 'appDetails'
        outputHeader: generateFilePreamble(appMetadata), // Renamed 'banner' and refactored its generation

        // Task to remove previous build artifacts.
        // Added 'options.force' for more aggressive cleaning.
        cleanupBuildDirectory: { // Renamed 'clean'
            options: {
                force: true // Added a new option
            },
            targetPaths: [outputDir] // Renamed 'dist' to 'build_output'
        },

        // Task for JavaScript minification.
        // Renamed 'uglify' to 'minifyScripts'.
        minifyScripts: {
            options: {
                banner: '<%= outputHeader %>' // Use the new banner variable
            },
            // Configuration for the primary JavaScript module.
            mainModuleBundle: { // Renamed 'my_target' to 'mainModuleBundle'
                files: {
                    // Changed output path to include a 'core' subdirectory and new suffix.
                    [`${outputDir}/core/${appMetadata.productName}.compact.js`]: [`${inputDir}/main/${appMetadata.productName}.js`] // Renamed paths, suffix
                }
            },
            // Configuration for internationalization (i18n) files.
            i18nBundles: { // Renamed 'locale_target' to 'i18nBundles'
                expand: true,
                cwd: `${inputDir}/localization`, // Renamed 'src/locale' to 'app_source/localization'
                src: ['**/*.js'],
                dest: `${outputDir}/localization`, // Renamed 'dist/locale' to 'build_output/localization'
                ext: '.compact.js' // Renamed '.min.js' to '.compact.js'
            }
        },

        // Task for CSS minification.
        // Renamed 'cssmin' to 'minifyStylesheets'.
        minifyStylesheets: {
            applyHeaderToMain: { // Renamed 'add_banner' to 'applyHeaderToMain'
                options: {
                    banner: '<%= outputHeader %>'
                },
                files: {
                    // Changed output path to include a 'theme' subdirectory and new suffix.
                    [`${outputDir}/theme/${appMetadata.productName}.compact.css`]: [`${inputDir}/styles/${appMetadata.productName}.css`] // Renamed paths, suffix
                }
            }
        },

        // Added a new, simple task for copying static assets.
        copyStaticAssets: {
            imagesAndFonts: {
                files: [{
                    expand: true,
                    cwd: `${inputDir}/assets`,
                    src: ['**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf,eot}'], // Expanded file types
                    dest: `${outputDir}/static` // New destination subdirectory
                }]
            }
        }
    });

    // Load necessary Grunt plugins.
    orchestrator.loadNpmTasks('grunt-contrib-clean');
    orchestrator.loadNpmTasks('grunt-contrib-uglify');
    orchestrator.loadNpmTasks('grunt-contrib-cssmin');
    // Load the plugin for the newly added copy task.
    orchestrator.loadNpmTasks('grunt-contrib-copy');


    // Register various build tasks.

    // Define a development-focused task for quick iteration (e.g., no minification).
    orchestrator.registerTask('devBuild', ['cleanupBuildDirectory', 'copyStaticAssets']); // Added 'devBuild' task

    // Register the main production build task.
    // Renamed 'default' to 'productionBuild' and included the new copy task.
    orchestrator.registerTask('productionBuild', [
        'cleanupBuildDirectory',
        'minifyScripts',
        'minifyStylesheets',
        'copyStaticAssets'
    ]);

    // Set 'default' as an alias to the 'productionBuild' task for convenience.
    orchestrator.registerTask('default', ['productionBuild']); // Alias for backward compatibility or ease of use
};