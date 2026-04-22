const browserCanvasFactory = require('webpage');
const runtimeEnvironment = require('system');
const processExit = phantom.exit;
const logOutput = console.log;

const displaySurface = browserCanvasFactory.create();

const defaultViewportWidthValue = 5000;
const pdfFileExtension = '.pdf';
const sizeDimensionDelimiter = '*';
const zeroPixelMargin = '0px';
const oneCentimeterMargin = '1cm';
const successfulLoadStatus = 'success';
const renderingDelayMs = 200;

const scriptUsageSyntax = 'Input: source_url destination_file [paper_dimensions|paper_format] [zoom_level]';
const paperFormatExamples = '  Paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"';
const webAddressLoadFailure = 'Unable to access the specified web address!';

const parseProgramArguments = (argumentCollection) => {
    const argumentCount = argumentCollection.length;
    if (argumentCount < 3 || argumentCount > 5) {
        logOutput(scriptUsageSyntax);
        logOutput(paperFormatExamples);
        processExit(1);
    }
    return {
        webSource: argumentCollection[1],
        outputLocation: argumentCollection[2],
        paperSpecification: argumentCollection[3],
        magnificationFactor: argumentCollection[4],
        totalArguments: argumentCount
    };
};

const computePaperSettings = (specifierValue, outputFilePath) => {
    if (!specifierValue || outputFilePath.slice(-pdfFileExtension.length) !== pdfFileExtension) {
        return null;
    }

    const dimensionTokens = specifierValue.split(sizeDimensionDelimiter);
    return dimensionTokens.length === 2
        ? { width: dimensionTokens[0], height: dimensionTokens[1], margin: zeroPixelMargin }
        : { format: specifierValue, orientation: 'portrait', margin: oneCentimeterMargin };
};

const executeWebRenderOperation = (environmentData) => {
    const parsedArgs = parseProgramArguments(environmentData.args);
    const { webSource, outputLocation, paperSpecification, magnificationFactor, totalArguments } = parsedArgs;

    displaySurface.viewportSize = { width: defaultViewportWidthValue };

    const paperConfiguration = computePaperSettings(paperSpecification, outputLocation);
    if (paperConfiguration) {
        displaySurface.paperSize = paperConfiguration;
    }

    if (totalArguments > 4) {
        displaySurface.zoomFactor = magnificationFactor;
    }

    displaySurface.onConsoleMessage = function() {
        logOutput.apply(null, arguments);
    };

    displaySurface.open(webSource, (responseStatus) => {
        if (responseStatus !== successfulLoadStatus) {
            logOutput(webAddressLoadFailure);
            processExit();
        } else {
            setTimeout(() => {
                displaySurface.render(outputLocation);
                processExit();
            }, renderingDelayMs);
        }
    });
};

executeWebRenderOperation(runtimeEnvironment);