var buildTool    = require('gulp');
var graphicProcessor = require('./lib/iconify');
var fileRemover     = require('del');
var vectorToRaster = require('gulp-svg2png');
var styleCompiler    = require('gulp-sass');
var utilityLogger   = require('gulp-util');
var filePath    = require('path');

function validateConfiguration(configSettings) {
    var issueContainer = {}; /* Object to hold configuration issues */

    if (!configSettings.src) {
        issueContainer.sourcePath = "Error: Input source path missing; please specify where your images are (e.g., sourcePath: './assets/vectors/*.svg').";
    }

    if (Object.keys(issueContainer).length > 0) {
        Object.keys(issueContainer).forEach(function(issueKey) {
            utilityLogger.log(issueContainer[issueKey]);
        }); /* Log all detected issues */

        process.exit(1); /* Terminate process due to critical errors */
    }
}

function applyDefaultValues(configSettings) {
    var advisoryMessages = {}; /* Container for informational messages */

    if (!configSettings.rasterOutput) {
        configSettings.rasterOutput = filePath.dirname(configSettings.src) + '/raster-images';
        advisoryMessages.rasterOutput = "Notice: PNG output directory not set. Using default path (" + configSettings.rasterOutput + ").";
    }

    if (!configSettings.styleOutput) {
        configSettings.styleOutput = './styles';
        advisoryMessages.styleOutput = "Notice: CSS output directory not defined. Using default path (" + configSettings.styleOutput + ").";
    }

    if (!configSettings.scssOutputFolder) {
        configSettings.scssSuppressed = true;
        advisoryMessages.scssOutputFolder = "Notice: SCSS output directory not specified. SCSS files will not be generated.";
    }

    if (!configSettings.templatePath) {
        configSettings.templatePath = filePath.join(__dirname, 'lib/output.mustache');
        advisoryMessages.templatePath = "Notice: Style template not defined. Utilizing the standard template.";
    }

    if (!configSettings.svgOptimizationOptions) {
        configSettings.svgOptimizationOptions = { active: true };
        advisoryMessages.svgOptimizationOptions = "Notice: SVG optimization options not provided, enabling optimization by default.";
    }

    if (!configSettings.fallbackWidth) {
        configSettings.fallbackWidth = "350px"; /* Default width for SVGs without explicit dimensions */
        advisoryMessages.fallbackWidth = "Notice: Default width not specified. Using fallback value (" + configSettings.fallbackWidth + ") if SVG lacks width attribute.";
    }

    if (!configSettings.fallbackHeight) {
        configSettings.fallbackHeight = "250px"; /* Default height for SVGs without explicit dimensions */
        advisoryMessages.fallbackHeight = "Notice: Default height not specified. Using fallback value (" + configSettings.fallbackHeight + ") if SVG lacks height attribute.";
    }

    if (Object.keys(advisoryMessages).length > 0) {
        Object.keys(advisoryMessages).forEach(function(msgKey) {
            utilityLogger.log(advisoryMessages[msgKey]);
        }); /* Output all informational messages */
    }
}

module.exports = function(configuration) {
    configuration = configuration || {};
    configuration.scssSuppressed = false; /* Initialize SCSS suppression flag */

    validateConfiguration(configuration); /* Verify essential settings */
    applyDefaultValues(configuration); /* Set up any missing default options */

    buildTool.task('asset-purge', function(completionCallback) {
        if (!configuration.scssOutputFolder) {
            configuration.scssSuppressed = true;
            configuration.scssOutputFolder = configuration.styleOutput; /* Use CSS output as fallback for SCSS */
        }

        fileRemover([configuration.scssOutputFolder + '/icons.*.scss', configuration.styleOutput + '/icons.*.css', configuration.rasterOutput + '/*.png'], completionCallback); /* Clean up generated files */
    });

    buildTool.task('graphic-transform', ['asset-purge'], function() {
        buildTool.source(configuration.src) /* Read source SVG files */
            .pipe(graphicProcessor({
                templatePath: configuration.templatePath,
                outputStylesheetName: 'icons.vector.scss',
                svgOptimizationOptions: configuration.svgOptimizationOptions,
                fallbackWidth: configuration.fallbackWidth,
                fallbackHeight: configuration.fallbackHeight
            }))
            .pipe(buildTool.destination(configuration.scssOutputFolder)); /* Output SCSS for SVG sprites */

        var processingStream = buildTool.source(configuration.src) /* Get SVGs again for PNG conversion */
            .pipe(vectorToRaster()) /* Convert SVGs to PNGs */
                .pipe(buildTool.destination(configuration.rasterOutput)) /* Save PNG images */
                    .pipe(graphicProcessor({
                        templatePath: configuration.templatePath,
                        outputStylesheetName: 'icons.raster.scss',
                        fallbackWidth: configuration.fallbackWidth,
                        fallbackHeight: configuration.fallbackHeight
                    }))
                    .pipe(buildTool.destination(configuration.scssOutputFolder)); /* Output SCSS for PNG sprites */

        return processingStream;
    });

    buildTool.task('image-fallback', ['asset-purge', 'graphic-transform'], function() {
        var processingStream = buildTool.source(configuration.rasterOutput + '/*.png') /* Process existing PNGs */
            .pipe(graphicProcessor({
                outputTemplatePath: configuration.templatePath,
                outputStylesheetName: 'icons.fallback.scss',
                disableConversion: true, /* Do not re-convert, just generate styles */
                conversionTargetFolder: configuration.scssOutputFolder
            }))
            .pipe(buildTool.destination(configuration.scssOutputFolder)); /* Output SCSS for PNG fallbacks */

        return processingStream;
    });

    buildTool.task('style-compile', ['graphic-transform', 'image-fallback'], function() {
        var processingStream = buildTool.source(configuration.scssOutputFolder + '/icons.*.scss') /* Take all generated SCSS files */
            .pipe(styleCompiler({
                compilationStyle: 'minimize' /* Compile SCSS to minified CSS */
            }))
            .pipe(buildTool.destination(configuration.styleOutput)); /* Output compiled CSS */

        return processingStream;
    });

    buildTool.task('asset-pipeline', ['graphic-transform', 'image-fallback', 'style-compile'], function() {
        /* Remove SCSS files if generation was suppressed. */
        if (configuration.scssSuppressed) {
            fileRemover.sync([configuration.scssOutputFolder + '/icons.*.scss']);
        }
    });

    buildTool.start('asset-pipeline'); /* Initiate the main asset processing task */
};