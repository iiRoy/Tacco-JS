const createGraphicsToolkit = (webglContext) => {
    const retrieveFractionalComponent = (inputNumber) => {
        return inputNumber - Math.floor(inputNumber);
    };

    const computeVectorScalarProduct = (firstVector, secondVector) => {
        return firstVector.reduce((total, currentVal, index) => total + (currentVal * secondVector[index]), 0);
    };

    const compileSingleShader = (shaderType, sourceCode, programHandle, debugLabel) => {
        const shaderHandle = webglContext.createShader(shaderType);
        webglContext.shaderSource(shaderHandle, sourceCode);
        webglContext.compileShader(shaderHandle);

        if (!webglContext.getShaderParameter(shaderHandle, webglContext.COMPILE_STATUS)) {
            const logInfo = webglContext.getShaderInfoLog(shaderHandle) || 'No specific error message.';
            console.error(`Shader compilation failed for ${debugLabel} (${shaderType === webglContext.VERTEX_SHADER ? 'vertex' : 'fragment'}):`);
            console.error(logInfo);

            if (shaderType === webglContext.FRAGMENT_SHADER) {
                const errorLogEntries = logInfo.split('\n')
                    .filter(entry => entry.startsWith('ERROR'))
                    .map(errorLine => {
                        const parts = errorLine.split(':');
                        return {
                            lineNumber: parseInt(parts[2]),
                            errorMessage: errorLine
                        };
                    });

                const sourceLines = webglContext.getShaderSource(shaderHandle).split('\n');
                sourceLines.unshift(''); 

                sourceLines.forEach((lineText, lineNum) => {
                    const errorOnThisLine = errorLogEntries.find(err => err.lineNumber === lineNum);
                    if (errorOnThisLine) {
                        console.error(`►►${lineNum} ${lineText}\n${errorOnThisLine.errorMessage}`);
                    } else {
                        console.log(`${lineNum} ${lineText}`);
                    }
                });
            }
            return null; 
        }
        webglContext.attachShader(programHandle, shaderHandle);
        return shaderHandle; 
    };

    return {
        generateRectangularGeometry: (elementRef, widthDimension, heightDimension) => {
            const halfWidth = widthDimension === undefined ? 0.5 : widthDimension;
            const halfHeight = heightDimension === undefined ? 0.5 : heightDimension;

            const positionData = [
                -halfWidth, -halfHeight, 0.0,
                halfWidth, -halfHeight, 0.0,
                halfWidth, halfHeight, 0.0,
                -halfWidth, halfHeight, 0.0
            ];

            const textureCoordData = [
                0.0, 0.0, 0.0,
                1.0, 0.0, 0.0,
                1.0, 1.0, 0.0,
                0.0, 1.0, 0.0
            ];

            const faceIndices = [0, 1, 2, 0, 2, 3];

            return {
                vertexData: positionData,
                vertexComponentSize: 3,
                vertexCount: 4,

                textureData: textureCoordData,
                textureComponentSize: 3, 
                textureCount: 4,

                indexData: faceIndices,
                indexComponentSize: 1,
                indexCount: 6
            };
        },

        assembleShaderPipeline: (programAlias, vertexCode, fragmentCode, targetProgram) => {
            const vertexShaderResult = compileSingleShader(webglContext.VERTEX_SHADER, vertexCode, targetProgram, programAlias + ' (vertex)');
            const fragmentShaderResult = compileSingleShader(webglContext.FRAGMENT_SHADER, fragmentCode, targetProgram, programAlias + ' (fragment)');

            if (vertexShaderResult && fragmentShaderResult) {
                webglContext.linkProgram(targetProgram);
                if (!webglContext.getProgramParameter(targetProgram, webglContext.LINK_STATUS)) {
                    const programLog = webglContext.getProgramInfoLog(targetProgram) || 'Unknown program linking error';
                    console.error(`Error encountered while linking shader program ${programAlias}:`);
                    console.error(programLog);
                }
            } else {
                console.warn(`Shader program ${programAlias} was not fully assembled due to previous compilation issues.`);
            }
        },

        convertImageToPixelArray: (sourceImage) => {
            const workingCanvas = (typeof OffscreenCanvas !== 'undefined' && OffscreenCanvas) ?
                new OffscreenCanvas(sourceImage.width, sourceImage.height) :
                document.createElement('canvas');

            workingCanvas.width = sourceImage.width;
            workingCanvas.height = sourceImage.height;

            const canvasContext = workingCanvas.getContext("2d");
            canvasContext.drawImage(sourceImage, 0, 0);

            const imageData = canvasContext.getImageData(0, 0, sourceImage.width, sourceImage.height);
            return imageData.data;
        },

        computeVectorScalarProduct: computeVectorScalarProduct,

        retrieveFractionalComponent: retrieveFractionalComponent,

        serializeFloatToVec4: (inputFloat) => {
            const scaleFactors = [1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0];

            const rVal = inputFloat;
            const gVal = retrieveFractionalComponent(rVal * 255.0);
            const bVal = retrieveFractionalComponent(gVal * 255.0);
            const aVal = retrieveFractionalComponent(bVal * 255.0);
            const outputVector = [rVal, gVal, bVal, aVal];

            const finalVector = [
                outputVector[0] - (outputVector[1] * scaleFactors[0]),
                outputVector[1] - (outputVector[2] * scaleFactors[1]),
                outputVector[2] - (outputVector[3] * scaleFactors[2]),
                outputVector[3] - (outputVector[3] * scaleFactors[3]) 
            ];
            
            return finalVector;
        },

        deserializeVec4ToFloat: (inputRGBAVector) => {
            const componentWeights = [1.0, 1.0 / 255.0, 1.0 / (255.0 * 255.0), 1.0 / (255.0 * 255.0 * 255.0)];
            return computeVectorScalarProduct(inputRGBAVector, componentWeights);
        },

        getFloatSerializationGLSL: () => {
            return `vec4 pack_depth_value (float input_depth) {
                const vec4 bias_factors = vec4(1.0 / 255.0,
                                                1.0 / 255.0,
                                                1.0 / 255.0,
                                                0.0);
                float r_channel = input_depth;
                float g_channel = fract(r_channel * 255.0);
                float b_channel = fract(g_channel * 255.0);
                float a_channel = fract(b_channel * 255.0);
                vec4 pixel_color = vec4(r_channel, g_channel, b_channel, a_channel);
                return pixel_color - (pixel_color.yzww * bias_factors);
            }`;
        },

        getFloatDeserializationGLSL: () => {
            return `float unpack_depth_value (vec4 pixel_color) {
                const vec4 shift_multipliers = vec4(1.0,
                                                    1.0 / 255.0,
                                                    1.0 / (255.0 * 255.0),
                                                    1.0 / (255.0 * 255.0 * 255.0));
                return dot(pixel_color, shift_multipliers);
            }`;
        }
    };
};