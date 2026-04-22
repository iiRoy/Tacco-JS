/*
 * Core Graphics Utilities
 * @class
 * @constructor
 */
GraphicsCoreHelper = function(webglContext) {
    // Ensure a valid WebGL context is provided upon initialization.
    if (!webglContext || !(webglContext instanceof WebGLRenderingContext)) {
        console.error("GraphicsCoreHelper: Invalid WebGL context provided. Initialization aborted.");
        throw new Error("Invalid WebGL context.");
    }
    this.webglContext = webglContext;
    // Internal logger for debugging purposes.
    this._internalLogger = console; // Can be replaced with a custom logger.
};

/**
 * @private
 * Helper for compiling a single shader.
 * @param {WebGLRenderingContext} gl - The WebGL rendering context.
 * @param {number} shaderType - The type of shader (e.g., gl.VERTEX_SHADER).
 * @param {string} shaderSource - The GLSL source code for the shader.
 * @param {string} shaderIdentifier - A descriptive name for the shader (for error logging).
 * @returns {WebGLShader|null} The compiled shader object, or null on failure.
 */
GraphicsCoreHelper.prototype._compileSingleShader = function(gl, shaderType, shaderSource, shaderIdentifier) {
    let shaderObject = gl.createShader(shaderType);
    if (!shaderObject) {
        this._internalLogger.error(`Failed to create shader object for ${shaderIdentifier}.`);
        return null;
    }

    gl.shaderSource(shaderObject, shaderSource);
    gl.compileShader(shaderObject);

    if (!gl.getShaderParameter(shaderObject, gl.COMPILE_STATUS)) {
        let errorLog = gl.getShaderInfoLog(shaderObject);
        this._internalLogger.error(`Compilation error in ${shaderIdentifier} (${shaderType === gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'} Shader):`);
        this._internalLogger.error(errorLog);

        // Enhanced error reporting for fragment shaders (similar to original, but simplified)
        if (shaderType === gl.FRAGMENT_SHADER && errorLog) {
            const errorLines = errorLog.split('\n').filter(line => line.startsWith('ERROR'));
            const sourceLines = shaderSource.split('\n');
            this._internalLogger.groupCollapsed(`Detailed ${shaderIdentifier} Fragment Shader Source Errors`);
            sourceLines.forEach((lineText, index) => {
                const lineNumber = index + 1;
                let errorAnnotation = '';
                for (const err of errorLines) {
                    const match = err.match(/:(\d+):/);
                    if (match && parseInt(match[1]) === lineNumber) {
                        errorAnnotation = `►► ERROR: ${err}`;
                        break;
                    }
                }
                this._internalLogger.log(`${lineNumber.toString().padStart(4, ' ')}: ${lineText} ${errorAnnotation}`);
            });
            this._internalLogger.groupEnd();
        }

        gl.deleteShader(shaderObject); // Clean up the failed shader
        return null;
    }
    return shaderObject;
};

/**
 * Creates, compiles, and links a WebGL shader program from vertex and fragment sources.
 * @param {string} programName - A unique identifier for the shader program (for logging).
 * @param {string} vertexShaderSource - The GLSL source code for the vertex shader.
 * @param {string} fragmentShaderSource - The GLSL source code for the fragment shader.
 * @returns {WebGLProgram|null} The linked WebGLProgram object, or null if compilation/linking fails.
 */
GraphicsCoreHelper.prototype.compileAndLinkProgram = function(programName, vertexShaderSource, fragmentShaderSource) {
    const gl = this.webglContext;

    if (!gl) {
        this._internalLogger.error(`Attempted to compile shader program '${programName}' without a valid WebGL context.`);
        return null;
    }

    let program = gl.createProgram();
    if (!program) {
        this._internalLogger.error(`Failed to create WebGLProgram object for '${programName}'.`);
        return null;
    }

    let vertexShader = this._compileSingleShader(gl, gl.VERTEX_SHADER, vertexShaderSource, `${programName} Vertex Shader`);
    let fragmentShader = this._compileSingleShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource, `${programName} Fragment Shader`);

    if (!vertexShader || !fragmentShader) {
        this._internalLogger.error(`Shader compilation failed for program '${programName}'. Aborting program creation.`);
        if (vertexShader) gl.deleteShader(vertexShader);
        if (fragmentShader) gl.deleteShader(fragmentShader);
        gl.deleteProgram(program);
        return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Detach and delete shaders after linking; they are no longer needed
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        let linkError = gl.getProgramInfoLog(program);
        this._internalLogger.error(`Link error in shader program '${programName}':`);
        this._internalLogger.error(linkError);
        gl.deleteProgram(program); // Clean up the failed program
        return null;
    }

    this._internalLogger.debug(`Successfully compiled and linked shader program: '${programName}'.`);
    return program;
};

/**
 * Generates a simple 2D quadrilateral mesh with default texture coordinates.
 * This mesh is suitable for rendering fullscreen quads or other flat surfaces.
 * @param {number} [widthDim=0.5] - Half-width of the quad.
 * @param {number} [heightDim=0.5] - Half-height of the quad.
 * @returns {object} An object containing vertex, texture, and index data for the quad.
 */
GraphicsCoreHelper.prototype.create2DPlaneMesh = function(widthDim = 0.5, heightDim = 0.5) {
    // Ensure dimensions are positive. If not, default to 0.5.
    const halfWidth = Math.max(0.001, widthDim);
    const halfHeight = Math.max(0.001, heightDim);

    // Define vertex positions for a quad centered at the origin
    const vertices = new Float32Array([
        -halfWidth, -halfHeight, 0.0, // Bottom-left
         halfWidth, -halfHeight, 0.0, // Bottom-right
         halfWidth,  halfHeight, 0.0, // Top-right
        -halfWidth,  halfHeight, 0.0  // Top-left
    ]);

    // Define texture coordinates (UVs) corresponding to the vertices
    const uvs = new Float32Array([
        0.0, 0.0, // Bottom-left
        1.0, 0.0, // Bottom-right
        1.0, 1.0, // Top-right
        0.0, 1.0  // Top-left
    ]);

    // Define indices to form two triangles from the four vertices
    const indices = new Uint16Array([
        0, 1, 2, // First triangle
        0, 2, 3  // Second triangle
    ]);

    // Construct and return the mesh data object
    return {
        vertexPositions: vertices,
        positionItemSize: 3, // Each vertex has 3 components (x, y, z)
        positionNumItems: vertices.length / 3,

        textureCoordinates: uvs,
        texCoordItemSize: 2, // Each UV coordinate has 2 components (u, v)
        texCoordNumItems: uvs.length / 2,

        elementIndices: indices,
        indexItemSize: 1, // Each index is a single value
        indexNumItems: indices.length,
        primitiveType: this.webglContext.TRIANGLES // Default primitive type
    };
};

/**
 * Extracts raw pixel data (Uint8Array) from an HTMLImageElement.
 * This involves drawing the image to a canvas and retrieving its ImageData.
 * @param {HTMLImageElement} inputImage - The image element to process.
 * @returns {Uint8Array} A Uint8Array containing the RGBA pixel data.
 * @throws {Error} If the input is not a valid HTMLImageElement.
 */
GraphicsCoreHelper.prototype.extractImageDataBytes = function(inputImage) {
    if (!(inputImage instanceof HTMLImageElement)) {
        throw new Error("Invalid input: 'inputImage' must be an HTMLImageElement.");
    }
    if (inputImage.width === 0 || inputImage.height === 0) {
        this._internalLogger.warn("Attempted to extract data from an image with zero dimensions.");
        return new Uint8Array(0); // Return an empty array for empty images
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = inputImage.width;
    tempCanvas.height = inputImage.height;

    const canvasCtx = tempCanvas.getContext("2d");
    if (!canvasCtx) {
        throw new Error("Failed to get 2D rendering context from canvas.");
    }

    canvasCtx.drawImage(inputImage, 0, 0);
    const imageData = canvasCtx.getImageData(0, 0, inputImage.width, inputImage.height);

    return imageData.data; // Returns a Uint8ClampedArray, which is a Uint8Array subclass
};

/**
 * Calculates the dot product of two 4-component vectors.
 * @param {number[]} vecA - The first 4-component vector (e.g., [x, y, z, w]).
 * @param {number[]} vecB - The second 4-component vector (e.g., [x, y, z, w]).
 * @returns {number} The dot product result.
 * @throws {Error} If input vectors are not arrays of length 4.
 */
GraphicsCoreHelper.prototype.calculateVector4DotProduct = function(vecA, vecB) {
    if (!Array.isArray(vecA) || vecA.length !== 4 || !Array.isArray(vecB) || vecB.length !== 4) {
        throw new Error("Input vectors must be arrays of exactly 4 numbers for dot product calculation.");
    }
    return vecA[0] * vecB[0] + vecA[1] * vecB[1] + vecA[2] * vecB[2] + vecA[3] * vecB[3];
};

/**
 * Computes the fractional part of a given numeric value.
 * For example, `getFractionalPart(3.14)` returns `0.14`.
 * Handles negative numbers by ensuring a positive fractional part (e.g., `fract(-3.14)` is `0.86`).
 * @param {number} value - The input number.
 * @returns {number} The fractional component of the number.
 * @throws {Error} If the input is not a number.
 */
GraphicsCoreHelper.prototype.getFractionalPart = function(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new Error("Input 'value' must be a valid number for fractional part calculation.");
    }
    // Ensures positive fractional part for negative numbers as well, consistent with GLSL fract().
    return value - Math.floor(value);
};

/**
 * Encodes a single float value (typically 0.0-1.0 range for depth) into a 4-component RGBA vector.
 * This is a common technique for storing high-precision floats in texture formats that only support 8-bit per channel.
 * @param {number} floatValue - The float value to encode (e.g., depth value).
 * @returns {number[]} A 4-element array representing the RGBA components (each 0.0-1.0).
 * @throws {Error} If the input is not a valid number.
 */
GraphicsCoreHelper.prototype.encodeFloatToRGBA = function(floatValue) {
    if (typeof floatValue !== 'number' || isNaN(floatValue)) {
        throw new Error("Input 'floatValue' must be a valid number for encoding.");
    }

    const channelBias = [1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0];

    // Multiply by 255 to shift bits into integer range, then take fractional part
    // This effectively isolates the "bits" for each channel.
    let r_val = floatValue;
    let g_val = this.getFractionalPart(r_val * 255.0);
    let b_val = this.getFractionalPart(g_val * 255.0);
    let a_val = this.getFractionalPart(b_val * 255.0);

    let encodedColor = [r_val, g_val, b_val, a_val];

    // Subtract bias to correct for floating point precision issues and ensure correct decoding
    let finalColor = [
        encodedColor[0] - (encodedColor[1] * channelBias[0]),
        encodedColor[1] - (encodedColor[2] * channelBias[1]),
        encodedColor[2] - (encodedColor[3] * channelBias[2]),
        encodedColor[3] - (0.0 * channelBias[3]) // Last channel bias is typically 0
    ];

    return finalColor;
};

/**
 * Decodes a 4-component RGBA vector (each 0.0-1.0) back into a single float value.
 * This is the inverse operation of `encodeFloatToRGBA`.
 * @param {number[]} rgbaVector - The 4-element RGBA array to decode.
 * @returns {number} The decoded float value.
 * @throws {Error} If the input is not an array of length 4.
 */
GraphicsCoreHelper.prototype.decodeRGBAToFloat = function(rgbaVector) {
    if (!Array.isArray(rgbaVector) || rgbaVector.length !== 4) {
        throw new Error("Input 'rgbaVector' must be an array of exactly 4 numbers for decoding.");
    }
    // These are the bit shifts applied in reverse, effectively summing the weighted channels.
    const bitShiftWeights = [1.0, 1.0 / 255.0, 1.0 / (255.0 * 255.0), 1.0 / (255.0 * 255.0 * 255.0)];
    return this.calculateVector4DotProduct(rgbaVector, bitShiftWeights);
};

/**
 * Generates the GLSL function string for encoding a float into an RGBA vector.
 * This function can be injected directly into a GLSL shader.
 * @returns {string} The GLSL function source code.
 */
GraphicsCoreHelper.prototype.generateGLSLPackFunction = function() {
    const fnName = "packFloatToRGBA";
    return `
vec4 ${fnName} (float depthValue) {
    const vec4 channelShiftFactor = vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);

    float r_channel = depthValue;
    float g_channel = fract(r_channel * 255.0);
    float b_channel = fract(g_channel * 255.0);
    float a_channel = fract(b_channel * 255.0);
    vec4 encodedColor = vec4(r_channel, g_channel, b_channel, a_channel);

    // Apply correction bias to counteract precision loss
    return encodedColor - (encodedColor.yzww * channelShiftFactor);
}`;
};

/**
 * Generates the GLSL function string for decoding an RGBA vector back into a float.
 * This function can be injected directly into a GLSL shader.
 * @returns {string} The GLSL function source code.
 */
GraphicsCoreHelper.prototype.generateGLSLUnpackFunction = function() {
    const fnName = "unpackRGBAToFloat";
    return `
float ${fnName} (vec4 encodedVector) {
    // Weights for each channel to reconstruct the original float value
    const vec4 bitWeights = vec4(
        1.0,
        1.0 / 255.0,
        1.0 / (255.0 * 255.0),
        1.0 / (255.0 * 255.0 * 255.0)
    );
    return dot(encodedVector, bitWeights);
}`;
};