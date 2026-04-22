const fileSystemOperations = require('fs').promises;
const directoryManagement = require('fs-extra');
const pathResolution = require('path');
const consoleReporter = console;
const graphicStyleProcessor = require('./lib/iconify');
const svgToPngConverter = require('svg2png');
const stylesheetCompiler = require('node-sass');
const filePatternMatcher = require('glob');
const programTerminator = process;

function validateInputConfiguration(processingSettings) {
    const issueCollection = {};

    if (!processingSettings.graphicSourcePaths) {
        issueCollection.graphicSourcePaths = "Issue: graphicSourcePaths not specified; please provide your source (e.g., './img/icons/*.svg').";
    }

    if (Object.keys(issueCollection).length) {
        Object.keys(issueCollection).forEach(problemIdentifier => {
            consoleReporter.error(issueCollection[problemIdentifier]);
        });
        programTerminator.exit();
    }
}

function applyDefaultValues(processingSettings) {
    const notificationMessages = {};
    const baseDirectory = pathResolution.dirname(processingSettings.graphicSourcePaths);

    if (!processingSettings.rasterImageOutputLocation) {
        processingSettings.rasterImageOutputLocation = pathResolution.join(baseDirectory, 'png');
        notificationMessages.rasterImageOutputLocation = `Notification: rasterImageOutputLocation not specified. Using default (${processingSettings.rasterImageOutputLocation}).`;
    }

    if (!processingSettings.compiledStyleOutputLocation) {
        processingSettings.compiledStyleOutputLocation = './css';
        notificationMessages.compiledStyleOutputLocation = `Notification: compiledStyleOutputLocation not specified. Using default (${processingSettings.compiledStyleOutputLocation}).`;
    }

    if (!processingSettings.preprocessedStyleOutputLocation) {
        processingSettings.preprocessedStyleGenerationDisabled = true;
        notificationMessages.preprocessedStyleOutputLocation = "Notification: preprocessedStyleOutputLocation not specified. SCSS files will not be saved.";
    }

    if (!processingSettings.styleTemplateFile) {
        processingSettings.styleTemplateFile = pathResolution.join(__dirname, 'lib/output.mustache');
        notificationMessages.styleTemplateFile = "Notification: styleTemplateFile not specified. Using system default template.";
    }

    if (!processingSettings.svgOptimizationParameters) {
        processingSettings.svgOptimizationParameters = { enabled: true };
        notificationMessages.svgOptimizationParameters = "Notification: SVG optimization parameters not specified, enabling by default.";
    }

    if (!processingSettings.defaultGraphicWidth) {
        processingSettings.defaultGraphicWidth = "300px";
        notificationMessages.defaultGraphicWidth = `Notification: defaultGraphicWidth not specified. Using default (${processingSettings.defaultGraphicWidth}) if SVG lacks width information.`;
    }

    if (!processingSettings.defaultGraphicHeight) {
        processingSettings.defaultGraphicHeight = "200px";
        notificationMessages.defaultGraphicHeight = `Notification: defaultGraphicHeight not specified. Using default (${processingSettings.defaultGraphicHeight}) if SVG lacks height information.`;
    }

    if (Object.keys(notificationMessages).length) {
        Object.keys(notificationMessages).forEach(messageKey => {
            consoleReporter.info(notificationMessages[messageKey]);
        });
    }
}

module.exports = async function(configurationOptions) {
    configurationOptions = configurationOptions || {};
    configurationOptions.preprocessedStyleGenerationDisabled = false;

    validateInputConfiguration(configurationOptions);
    applyDefaultValues(configurationOptions);

    let effectiveScssOutputFolder = configurationOptions.preprocessedStyleOutputLocation;
    if (!effectiveScssOutputFolder) {
        effectiveScssOutputFolder = configurationOptions.compiledStyleOutputLocation;
        configurationOptions.preprocessedStyleGenerationDisabled = true;
    }
    configurationOptions.preprocessedStyleOutputLocation = effectiveScssOutputFolder;

    await directoryManagement.ensureDir(configurationOptions.rasterImageOutputLocation);
    await directoryManagement.ensureDir(configurationOptions.compiledStyleOutputLocation);
    await directoryManagement.ensureDir(configurationOptions.preprocessedStyleOutputLocation);

    const filesForDeletion = [];
    filesForDeletion.push(pathResolution.join(configurationOptions.preprocessedStyleOutputLocation, 'icons.*.scss'));
    filesForDeletion.push(pathResolution.join(configurationOptions.compiledStyleOutputLocation, 'icons.*.css'));
    filesForDeletion.push(pathResolution.join(configurationOptions.rasterImageOutputLocation, '*.png'));

    const resolvedDeletionPaths = await Promise.all(
        filesForDeletion.map(pattern => filePatternMatcher.glob(pattern))
    ).then(arrays => [].concat(...arrays));

    await Promise.all(resolvedDeletionPaths.map(p => directoryManagement.remove(p)));
    consoleReporter.info('Existing output artifacts cleared.');

    const sourceSvgFilepaths = await filePatternMatcher.glob(configurationOptions.graphicSourcePaths);
    const svgFileContents = await Promise.all(sourceSvgFilepaths.map(fp => fileSystemOperations.readFile(fp, 'utf8')));

    const commonProcessorSettings = {
        templatePath: configurationOptions.styleTemplateFile,
        defaultImageWidth: configurationOptions.defaultGraphicWidth,
        defaultImageHeight: configurationOptions.defaultGraphicHeight,
    };

    const svgBasedScssContent = graphicStyleProcessor.generateStyles(svgFileContents, {
        ...commonProcessorSettings,
        styleName: 'icons.svg.scss',
        svgOptimizationOptions: configurationOptions.svgOptimizationParameters,
    });
    await fileSystemOperations.writeFile(pathResolution.join(configurationOptions.preprocessedStyleOutputLocation, 'icons.svg.scss'), svgBasedScssContent);
    consoleReporter.info('SCSS generated from SVG sources.');

    const generatedPngFilepaths = [];
    const pngImageBuffers = [];

    for (const [idx, svgData] of svgFileContents.entries()) {
        const originalSvgFilename = pathResolution.basename(sourceSvgFilepaths[idx], '.svg');
        const pngTargetFilepath = pathResolution.join(configurationOptions.rasterImageOutputLocation, `${originalSvgFilename}.png`);
        const convertedPngBuffer = await svgToPngConverter(Buffer.from(svgData));
        await fileSystemOperations.writeFile(pngTargetFilepath, convertedPngBuffer);
        generatedPngFilepaths.push(pngTargetFilepath);
        pngImageBuffers.push(convertedPngBuffer);
    }
    consoleReporter.info(`${generatedPngFilepaths.length} PNG images produced.`);

    const pngBasedScssContent = graphicStyleProcessor.generateStyles(pngImageBuffers, {
        ...commonProcessorSettings,
        styleName: 'icons.png.scss',
    });
    await fileSystemOperations.writeFile(pathResolution.join(configurationOptions.preprocessedStyleOutputLocation, 'icons.png.scss'), pngBasedScssContent);
    consoleReporter.info('SCSS generated from PNG rasterizations.');

    const fallbackPngFileContents = await Promise.all(generatedPngFilepaths.map(fp => fileSystemOperations.readFile(fp)));
    const fallbackScssContent = graphicStyleProcessor.generateStyles(fallbackPngFileContents, {
        ...commonProcessorSettings,
        styleName: 'icons.fallback.scss',
        noConversion: true,
        noConversionTarget: configurationOptions.preprocessedStyleOutputLocation
    });
    await fileSystemOperations.writeFile(pathResolution.join(configurationOptions.preprocessedStyleOutputLocation, 'icons.fallback.scss'), fallbackScssContent);
    consoleReporter.info('Fallback SCSS styles created.');

    const allScssSourceFiles = await filePatternMatcher.glob(pathResolution.join(configurationOptions.preprocessedStyleOutputLocation, 'icons.*.scss'));
    const concatenatedScssText = (await Promise.all(allScssSourceFiles.map(fp => fileSystemOperations.readFile(fp, 'utf8')))).join('\n');

    const compiledCssOutput = await new Promise((resolve, reject) => {
        stylesheetCompiler.render({
            data: concatenatedScssText,
            outputStyle: 'compressed',
            outFile: pathResolution.join(configurationOptions.compiledStyleOutputLocation, 'icons.css')
        }, (err, result) => {
            if (err) reject(err);
            else resolve(result.css.toString());
        });
    });
    await fileSystemOperations.writeFile(pathResolution.join(configurationOptions.compiledStyleOutputLocation, 'icons.css'), compiledCssOutput);
    consoleReporter.info('SCSS successfully compiled to CSS.');

    if (configurationOptions.preprocessedStyleGenerationDisabled) {
        const scssFilesToRemove = await filePatternMatcher.glob(pathResolution.join(configurationOptions.preprocessedStyleOutputLocation, 'icons.*.scss'));
        await Promise.all(scssFilesToRemove.map(p => directoryManagement.remove(p)));
        consoleReporter.info('Generated SCSS files removed as per configuration.');
    }

    consoleReporter.info('Graphics asset processing workflow concluded.');
};