const makeCodeDescriptor = (payloadString, encodingLevel, errorLevelConstant) => {
    let internalCodeInstance;
    try {
        internalCodeInstance = new QRCode(encodingLevel, errorLevelConstant);
        internalCodeInstance.addData(payloadString);
        internalCodeInstance.make();
    } catch (generationIssue) {
        throw new Error("Core QR data generation failed: " + generationIssue.message);
    }

    return {
        getDimension: () => internalCodeInstance.getModuleCount(),
        isDarkModule: (yCoordinate, xCoordinate) => internalCodeInstance.isDark(yCoordinate, xCoordinate)
    };
};

const drawModulesRecursively = (
    drawingContext,
    codeDescriptor,
    currentYPosition,
    currentXPosition,
    totalDimension,
    moduleSizePixels,
    offsetAmount,
    darkModuleColor,
    lightModuleColor
) => {
    if (currentYPosition >= totalDimension) {
        return;
    }

    const currentModuleColor = codeDescriptor.isDarkModule(currentYPosition, currentXPosition) ? darkModuleColor : lightModuleColor;
    drawingContext.fillStyle = currentModuleColor;
    drawingContext.fillRect(
        (currentXPosition * moduleSizePixels) + offsetAmount,
        (currentYPosition * moduleSizePixels) + offsetAmount,
        moduleSizePixels,
        moduleSizePixels
    );

    if (currentXPosition + 1 < totalDimension) {
        drawModulesRecursively(drawingContext, codeDescriptor, currentYPosition, currentXPosition + 1, totalDimension, moduleSizePixels, offsetAmount, darkModuleColor, lightModuleColor);
    } else {
        drawModulesRecursively(drawingContext, codeDescriptor, currentYPosition + 1, 0, totalDimension, moduleSizePixels, offsetAmount, darkModuleColor, lightModuleColor);
    }
};

function fabricateVisualCode(inputPayload) {
    const visualSettings = {
        modulePixelSize: 5,
        borderSpace: 10,
        darkModuleColor: "rgb(0,0,0)",
        lightModuleColor: "rgb(255,255,255)",
        codeEncodingVersion: 15,
        correctionLevel: QRErrorCorrectLevel.L
    };

    const drawingSurface = document.createElement('canvas');
    const renderContext = drawingSurface.getContext('2d');

    let codeInformation;
    try {
        codeInformation = makeCodeDescriptor(
            inputPayload,
            visualSettings.codeEncodingVersion,
            visualSettings.correctionLevel
        );
    } catch (problem) {
        const problemParagraph = document.createElement("p");
        const problemMessage = document.createTextNode("Visual code generation failed! " + problem.message);
        problemParagraph.appendChild(problemMessage);
        return problemParagraph;
    }

    const moduleCount = codeInformation.getDimension();
    const totalCanvasDimension = (moduleCount * visualSettings.modulePixelSize) + visualSettings.borderSpace;
    const paddingOffset = visualSettings.borderSpace / 2;

    drawingSurface.setAttribute('height', totalCanvasDimension);
    drawingSurface.setAttribute('width', totalCanvasDimension);

    if (renderContext) {
        drawModulesRecursively(
            renderContext,
            codeInformation,
            0,
            0,
            moduleCount,
            visualSettings.modulePixelSize,
            paddingOffset,
            visualSettings.darkModuleColor,
            visualSettings.lightModuleColor
        );
    }

    const displayImage = document.createElement("img");
    displayImage.src = drawingSurface.toDataURL("image/png");

    return displayImage;
}