/**
 * Graphic Operations Assistance
 * @class
 * @constructor
 */
RenderToolbox = function (renderCtx) {
    this.renderCtx = renderCtx;
};

/**
 * @private
 */
RenderToolbox.prototype.generateRectangleMesh = function (meshContainer, widthVal, depthVal) {
    let halfWidth = (widthVal === undefined) ? 0.5 : widthVal;
    let halfDepth = (depthVal === undefined) ? 0.5 : depthVal;

    this.positionCoords = [
        -halfWidth, -halfDepth, 0.0,
         halfWidth, -halfDepth, 0.0,
         halfWidth,  halfDepth, 0.0,
        -halfWidth,  halfDepth, 0.0
    ];

    this.texCoords = [
        0.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 1.0, 0.0,
        0.0, 1.0, 0.0
    ];

    this.faceIndices = [0, 1, 2, 0, 2, 3];

    let geometryData = {};
    geometryData.positionCoords = this.positionCoords;
    geometryData.posComponentCount = this.vertexItemSize; // Assuming these are defined elsewhere
    geometryData.posVertexCount = this.vertexNumItems;    // or are placeholders.

    geometryData.texCoords = this.texCoords;
    geometryData.uvComponentCount = this.textureItemSize;
    geometryData.uvVertexCount = this.textureNumItems;

    geometryData.faceIndices = this.faceIndices;
    geometryData.idxComponentCount = this.indexItemSize;
    geometryData.idxFaceCount = this.indexNumItems;

    return geometryData;
};

/**
 * @private
 */
RenderToolbox.prototype.buildShaderProgram = function (programIdentifier, vertexShaderCode, fragmentShaderCode, targetProgram) {
    let vtxCompiled = false;
    let fragCompiled = false;

    let vertexShaderObj = this.renderCtx.createShader(this.renderCtx.VERTEX_SHADER);
    this.renderCtx.shaderSource(vertexShaderObj, vertexShaderCode);
    this.renderCtx.compileShader(vertexShaderObj);
    if (!this.renderCtx.getShaderParameter(vertexShaderObj, this.renderCtx.COMPILE_STATUS)) {
        alert('Error in vertex source for shader: ' + programIdentifier + '. Check console for details.');
        console.log('Vertex shader compilation error for ' + programIdentifier + ':\n ' + this.renderCtx.getShaderInfoLog(vertexShaderObj));
        if (this.renderCtx.getShaderInfoLog(vertexShaderObj) !== undefined) {
            console.log(this.renderCtx.getShaderInfoLog(vertexShaderObj));
        }
    } else {
        this.renderCtx.attachShader(targetProgram, vertexShaderObj);
        vtxCompiled = true;
    }

    let fragmentShaderObj = this.renderCtx.createShader(this.renderCtx.FRAGMENT_SHADER);
    this.renderCtx.shaderSource(fragmentShaderObj, fragmentShaderCode);
    this.renderCtx.compileShader(fragmentShaderObj);
    if (!this.renderCtx.getShaderParameter(fragmentShaderObj, this.renderCtx.COMPILE_STATUS)) {
        alert('Error in fragment source for shader: ' + programIdentifier + '. Check console for details.');
        let logMessage = this.renderCtx.getShaderInfoLog(fragmentShaderObj);
        console.log('Fragment shader compilation error for ' + programIdentifier + ':\n ' + logMessage);
        if (logMessage !== undefined) {
            console.log(logMessage);
            let errorDetailsList = [];
            let errorLines = logMessage.split("\n");
            for (let errorIndex = 0, totalErrors = errorLines.length; errorIndex < totalErrors; errorIndex++) {
                if (errorLines[errorIndex].match(/^ERROR/gim) !== null) {
                    let errorParts = errorLines[errorIndex].split(':');
                    let lineNumber = parseInt(errorParts[2]);
                    errorDetailsList.push([lineNumber, errorLines[errorIndex]]);
                }
            }
            let sourceLines = this.renderCtx.getShaderSource(fragmentShaderObj).split("\n");
            sourceLines.unshift("");
            for (let errorIndex = 0, totalLines = sourceLines.length; errorIndex < totalLines; errorIndex++) {
                let hasLineError = false;
                let currentErrorString = '';
                for (let errIdx = 0, numErrors = errorDetailsList.length; errIdx < numErrors; errIdx++) {
                    if (errorIndex === errorDetailsList[errIdx][0]) {
                        hasLineError = true;
                        currentErrorString = errorDetailsList[errIdx][1];
                        break;
                    }
                }
                if (hasLineError === false) {
                    console.log(errorIndex + ' ' + sourceLines[errorIndex]);
                } else {
                    console.log('►►' + errorIndex + ' ' + sourceLines[errorIndex] + '\n' + currentErrorString);
                }
            }
        }
    } else {
        this.renderCtx.attachShader(targetProgram, fragmentShaderObj);
        fragCompiled = true;
    }

    if (vtxCompiled === true && fragCompiled === true) {
        this.renderCtx.linkProgram(targetProgram);
        if (!this.renderCtx.getProgramParameter(targetProgram, this.renderCtx.LINK_STATUS)) {
            alert('Error linking shader program: ' + programIdentifier);
            console.log('Shader program linking error for ' + programIdentifier + ':\n ');
            if (this.renderCtx.getProgramInfoLog(targetProgram) !== undefined) {
                console.log(this.renderCtx.getProgramInfoInfoLog(targetProgram));
            }
        }
    }
};

/**
 * Retrieves a Uint8Array containing pixel data from an HTMLImageElement.
 * @returns {Uint8Array} The pixel data array.
 * @param {HTMLImageElement} inputImage The source image element.
 */
RenderToolbox.prototype.extractPixelDataFromImage = function (inputImage) {
    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = inputImage.width;
    tempCanvas.height = inputImage.height;
    let canvas2DContext = tempCanvas.getContext("2d");
    canvas2DContext.drawImage(inputImage, 0, 0);
    let pixelBuffer = canvas2DContext.getImageData(0, 0, inputImage.width, inputImage.height);

    return pixelBuffer.data;
};

/**
 * Computes the dot product of two 4-component vectors.
 * @private
 */
RenderToolbox.prototype.calculateVector4DotProduct = function (vecA, vecB) {
    return vecA[0] * vecB[0] + vecA[1] * vecB[1] + vecA[2] * vecB[2] + vecA[3] * vecB[3];
};

/**
 * Determines the fractional portion of a number. Example: getFractionalPart(3.14) yields 0.14.
 * @private
 */
RenderToolbox.prototype.getFractionalPart = function (inputValue) {
    return inputValue - Math.floor(inputValue);
};

/**
 * Converts a float (0.0-1.0) into a 4-component RGBA vector (0.0-1.0 each).
 * @private
 */
RenderToolbox.prototype.encodeFloatToRGBA = function (floatValue) {
    let scalingFactors = [1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0];

    let redComp = floatValue;
    let greenComp = this.getFractionalPart(redComp * 255.0);
    let blueComp = this.getFractionalPart(greenComp * 255.0);
    let alphaComp = this.getFractionalPart(blueComp * 255.0);
    let encodedColor = [redComp, greenComp, blueComp, alphaComp];

    let adjustedComponents = [
        encodedColor[1] * scalingFactors[0],
        encodedColor[2] * scalingFactors[1],
        encodedColor[3] * scalingFactors[2],
        encodedColor[3] * scalingFactors[3]
    ];

    return [
        encodedColor[0] - adjustedComponents[0],
        encodedColor[1] - adjustedComponents[1],
        encodedColor[2] - adjustedComponents[2],
        encodedColor[3] - adjustedComponents[3]
    ];
};

/**
 * Decodes a 4-component RGBA vector (0.0-1.0 each) back into a single float (0.0-1.0).
 * @private
 */
RenderToolbox.prototype.decodeRGBAToFloat = function (inputColorVec) {
    let weightMultipliers = [1.0, 1.0 / 255.0, 1.0 / (255.0 * 255.0), 1.0 / (255.0 * 255.0 * 255.0)];
    return this.calculateVector4DotProduct(inputColorVec, weightMultipliers);
};

/**
 * Provides the GLSL source string for the float-to-RGBA packing function.
 * @returns {String} The GLSL function as a string.
 */
RenderToolbox.prototype.getGLSLPackFunction = function () {
    return 'vec4 pack (float valueToPack) {' +
        'const vec4 colorBias = vec4(1.0 / 255.0,' +
        '1.0 / 255.0,' +
        '1.0 / 255.0,' +
        '0.0);' +

        'float compR = valueToPack;' +
        'float compG = fract(compR * 255.0);' +
        'float compB = fract(compG * 255.0);' +
        'float compA = fract(compB * 255.0);' +
        'vec4 packedColor = vec4(compR, compG, compB, compA);' +

        'return packedColor - (packedColor.yzww * colorBias);' +
        '}';
};

/**
 * Provides the GLSL source string for the RGBA-to-float unpacking function.
 * @returns {String} The GLSL function as a string.
 */
RenderToolbox.prototype.getGLSLUnpackFunction = function () {
    return 'float unpack (vec4 packedInput) {' +
        'const vec4 channelWeights = vec4(1.0,' +
        '1.0 / 255.0,' +
        '1.0 / (255.0 * 255.0),' +
        '1.0 / (255.0 * 255.0 * 255.0));' +
        'return dot(packedInput, channelWeights);' +
        '}';
};