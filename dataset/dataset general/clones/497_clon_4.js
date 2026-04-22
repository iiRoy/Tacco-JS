class ContextualGraphicsOperations {
    constructor() {
        this.programRegistry = new Map();
        this.bufferRegistry = new Map();
        this.textureRegistry = new Map();
        this.currentAnimationHandle = null;
    }

    acquireRenderContext(canvasElement, options) {
        const graphicsContext = canvasElement.getContext('webgl', options) || canvasElement.getContext('experimental-webgl', options);
        if (!graphicsContext) {
            throw new Error("WebGL context unavailable.");
        }
        return graphicsContext;
    }

    assembleShaders(graphicsContext, vertexSourceCode, fragmentSourceCode) {
        const compileSingleShader = (type, source) => {
            const shaderObject = graphicsContext.createShader(type);
            graphicsContext.shaderSource(shaderObject, source);
            graphicsContext.compileShader(shaderObject);
            if (!graphicsContext.getShaderParameter(shaderObject, graphicsContext.COMPILE_STATUS)) {
                console.error('Shader compilation failure:', graphicsContext.getShaderInfoLog(shaderObject));
                graphicsContext.deleteShader(shaderObject);
                return null;
            }
            return shaderObject;
        };

        const vertexShader = compileSingleShader(graphicsContext.VERTEX_SHADER, vertexSourceCode);
        const fragmentShader = compileSingleShader(graphicsContext.FRAGMENT_SHADER, fragmentSourceCode);

        if (!vertexShader || !fragmentShader) return null;

        const programObject = graphicsContext.createProgram();
        graphicsContext.attachShader(programObject, vertexShader);
        graphicsContext.attachShader(programObject, fragmentShader);
        graphicsContext.linkProgram(programObject);

        if (!graphicsContext.getProgramParameter(programObject, graphicsContext.LINK_STATUS)) {
            console.error('Shader program linking failure:', graphicsContext.getProgramInfoLog(programObject));
            graphicsContext.deleteProgram(programObject);
            return null;
        }

        const shaderWrapper = {
            _program: programObject,
            _uniformLocationsCache: {},
            _attributeLocationsCache: {},

            activate() { graphicsContext.useProgram(this._program); },
            getUniformLocation(name) {
                if (!(name in this._uniformLocationsCache)) {
                    this._uniformLocationsCache[name] = graphicsContext.getUniformLocation(this._program, name);
                }
                return this._uniformLocationsCache[name];
            },
            getAttributeLocation(name) {
                if (!(name in this._attributeLocationsCache)) {
                    this._attributeLocationsCache[name] = graphicsContext.getAttribLocation(this._program, name);
                }
                return this._attributeLocationsCache[name];
            }
        };
        this.programRegistry.set(programObject, shaderWrapper);
        return shaderWrapper;
    }

    createGeometryBuffer(graphicsContext, bufferTarget, dataType, itemDimension, usagePattern, dataArray) {
        const bufferInstance = graphicsContext.createBuffer();
        graphicsContext.bindBuffer(bufferTarget, bufferInstance);
        graphicsContext.bufferData(bufferTarget, new (dataType === graphicsContext.FLOAT ? Float32Array : Uint16Array)(dataArray), usagePattern);

        const geometryBufferWrapper = {
            _buffer: bufferInstance,
            _target: bufferTarget,
            _dataType: dataType,
            _itemDimension: itemDimension,
            _elementCount: dataArray.length / itemDimension,
            bind() { graphicsContext.bindBuffer(this._target, this._buffer); },
            setVertexAttributePointer(location) {
                graphicsContext.vertexAttribPointer(location, this._itemDimension, this._dataType, false, 0, 0);
                graphicsContext.enableVertexAttribArray(location);
            }
        };
        this.bufferRegistry.set(bufferInstance, geometryBufferWrapper);
        return geometryBufferWrapper;
    }

    makeTextureObject(graphicsContext) {
        const textureHandle = graphicsContext.createTexture();
        const textureWrapper = {
            _texture: textureHandle,
            _graphicsContext: graphicsContext,
            _targetType: graphicsContext.TEXTURE_2D,

            configureParameters(minFilter, magFilter, wrapS, wrapT, generateMipmaps) {
                graphicsContext.bindTexture(this._targetType, this._texture);
                graphicsContext.texParameteri(this._targetType, graphicsContext.TEXTURE_MIN_FILTER, minFilter);
                graphicsContext.texParameteri(this._targetType, graphicsContext.TEXTURE_MAG_FILTER, magFilter);
                graphicsContext.texParameteri(this._targetType, graphicsContext.TEXTURE_WRAP_S, wrapS);
                graphicsContext.texParameteri(this._targetType, graphicsContext.TEXTURE_WRAP_T, wrapT);
                if (generateMipmaps) {
                    graphicsContext.generateMipmap(this._targetType);
                }
            },
            assignToTextureUnit(unitIndex, uniformLocation) {
                graphicsContext.activeTexture(graphicsContext.TEXTURE0 + unitIndex);
                graphicsContext.bindTexture(this._targetType, this._texture);
                graphicsContext.uniform1i(uniformLocation, unitIndex);
            },
            loadFromHTMLElement(imageSourceElement) {
                graphicsContext.bindTexture(this._targetType, this._texture);
                graphicsContext.texImage2D(this._targetType, 0, graphicsContext.RGBA, graphicsContext.RGBA, graphicsContext.UNSIGNED_BYTE, imageSourceElement);
            }
        };
        this.textureRegistry.set(textureHandle, textureWrapper);
        return textureWrapper;
    }

    beginAnimationLoop(renderCallback, canvasElement, frameIntervalMs, continuousExecution) {
        let lastTimestamp = 0;
        const frameDuration = frameIntervalMs;
        const animationStep = (currentTime) => {
            if (continuousExecution || (currentTime - lastTimestamp >= frameDuration)) {
                renderCallback();
                lastTimestamp = currentTime;
            }
            this.currentAnimationHandle = requestAnimationFrame(animationStep);
        };
        this.currentAnimationHandle = requestAnimationFrame(animationStep);
        return {
            halt: () => {
                cancelAnimationFrame(this.currentAnimationHandle);
                this.currentAnimationHandle = null;
            }
        };
    }
}

class OmniView {
    #graphicsEngineInstance;
    #renderContextInstance;
    #shaderPipelineInstance;
    #quadVertexGeometry;
    #panoramaSourceTextureInstance;
    #idleActivityCompletionTimer;

    #circleConstantValue = 3.1415926535897932384626433832795029;

    #scrollableContentContainer;
    #primaryViewportElement;
    #drawingSurfaceCanvas;

    #magnificationLevel = 1.0;
    #sphericalProjectionAspectRatio = 4.0; // 8/2
    #idleNotificationDelayMilliseconds = 500;

    #currentElevationAngle = 0;
    #currentAzimuthAngle = 0;
    #lastRenderedElevation = null;
    #lastRenderedAzimuth = null;

    #cachedViewportWidth = 0;
    #cachedViewportHeight = 0;
    #scrollAreaPadding = 4;

    animationControlInterface;

    constructor() {
        this.#graphicsEngineInstance = new ContextualGraphicsOperations();
    }

    #initializeGraphicsContext() {
        this.#renderContextInstance = this.#graphicsEngineInstance.acquireRenderContext(this.#drawingSurfaceCanvas, {});

        if (!this.#renderContextInstance) {
            throw new Error("No WebGL context could be obtained.");
        }

        const vertexShaderCode = `
            attribute vec2 p;
            uniform   vec3 z;
            varying   vec3 fpos;
            void main(void) {
              fpos = vec3(p*z.z, z.x);
              fpos.y *= z.y;
              gl_Position = vec4(p.x,p.y,z.x,1.0);
            }`;

        const fragmentShaderCode = `#ifdef GL_ES
            precision highp float;
            #endif
            const float ipi = 1.0 / 3.1415926535897932384626433832795029 ;
            uniform sampler2D pan;
            uniform mat3 trans;
            uniform vec2 sas;
            varying vec3 fpos;
            void main(void) {
              vec3 q = normalize(fpos) * trans ;
              vec2 l = vec2( atan(q.z,q.x) * 0.5, sas.y-asin(q.y)*sas.x) * ipi ;
              l.y += 0.5;
              gl_FragColor = texture2D(pan, l.xy );
            }`;

        this.#shaderPipelineInstance = this.#graphicsEngineInstance.assembleShaders(this.#renderContextInstance, vertexShaderCode, fragmentShaderCode);

        this.#quadVertexGeometry = this.#graphicsEngineInstance.createGeometryBuffer(
            this.#renderContextInstance,
            this.#renderContextInstance.ARRAY_BUFFER,
            this.#renderContextInstance.FLOAT,
            2,
            this.#renderContextInstance.STATIC_DRAW,
            [-1., -1., 1., -1., -1., 1., 1., 1.]
        );
    }

    #prepareRenderingPipeline() {
        this.#panoramaSourceTextureInstance = this.#graphicsEngineInstance.makeTextureObject(this.#renderContextInstance);
        this.#panoramaSourceTextureInstance.configureParameters(
            this.#renderContextInstance.LINEAR,
            this.#renderContextInstance.LINEAR,
            this.#renderContextInstance.REPEAT,
            this.#renderContextInstance.CLAMP_TO_EDGE,
            false
        );
        this.#renderContextInstance.disable(this.#renderContextInstance.DEPTH_TEST);
        this.#renderContextInstance.disable(this.#renderContextInstance.BLEND);

        this.#shaderPipelineInstance.activate();
        this.#panoramaSourceTextureInstance.assignToTextureUnit(0, this.#shaderPipelineInstance.getUniformLocation('pan'));
        this.#quadVertexGeometry.setVertexAttributePointer(this.#shaderPipelineInstance.getAttributeLocation('p'));
    }

    #adjustLayoutDimensions() {
        this.#cachedViewportWidth = this.#primaryViewportElement.clientWidth;
        this.#cachedViewportHeight = this.#primaryViewportElement.clientHeight;

        this.#scrollableContentContainer.style.width = (this.#cachedViewportWidth * 2 / this.#magnificationLevel + this.#scrollAreaPadding) + 'px';
        this.#scrollableContentContainer.style.height = (this.#cachedViewportHeight * 2 / (this.#magnificationLevel * this.#sphericalProjectionAspectRatio)) + 'px';

        this.#primaryViewportElement.scrollLeft = this.#currentAzimuthAngle * (this.#scrollableContentContainer.offsetWidth - this.#cachedViewportWidth - this.#scrollAreaPadding) / (2 * this.#circleConstantValue) + this.#scrollAreaPadding / 2;
        this.#primaryViewportElement.scrollTop = (-this.#currentElevationAngle * this.#sphericalProjectionAspectRatio / this.#circleConstantValue + 0.5) * (this.#scrollableContentContainer.offsetHeight - this.#cachedViewportHeight);
    }

    #synchronizeCanvasResolution() {
        this.#renderContextInstance.viewport(0, 0,
            this.#renderContextInstance.drawingBufferWidth = this.#drawingSurfaceCanvas.width = this.#cachedViewportWidth,
            this.#renderContextInstance.drawingBufferHeight = this.#drawingSurfaceCanvas.height = this.#cachedViewportHeight);
    }

    #triggerLayoutRecalculation() {
        this.#adjustLayoutDimensions();
        this.#synchronizeCanvasResolution();
        this.animationControlInterface.halt();
        this.animationControlInterface = this.#graphicsEngineInstance.beginAnimationLoop(this.#drawFrame.bind(this), this.#drawingSurfaceCanvas, 1000 / 30, true);
    }

    #drawFrame() {
        const currentViewportWidth = this.#primaryViewportElement.clientWidth;
        const currentViewportHeight = this.#primaryViewportElement.clientHeight;

        this.#currentAzimuthAngle = 2 * this.#circleConstantValue * (this.#primaryViewportElement.scrollLeft - this.#scrollAreaPadding / 2) / (this.#scrollableContentContainer.offsetWidth - currentViewportWidth - this.#scrollAreaPadding);
        this.#currentElevationAngle = (1 / this.#sphericalProjectionAspectRatio) * -this.#circleConstantValue * (this.#primaryViewportElement.scrollTop / (this.#scrollableContentContainer.offsetHeight - currentViewportHeight) - 0.5);

        if (this.#currentAzimuthAngle > 2 * this.#circleConstantValue) {
            this.#currentAzimuthAngle -= 2 * this.#circleConstantValue;
            this.#adjustLayoutDimensions();
        }
        if (this.#currentAzimuthAngle < 0) {
            this.#currentAzimuthAngle += 2 * this.#circleConstantValue;
            this.#adjustLayoutDimensions();
        }

        if (currentViewportWidth !== this.#cachedViewportWidth || currentViewportHeight !== this.#cachedViewportHeight) {
            this.animationControlInterface.halt();
            setTimeout(() => this.#triggerLayoutRecalculation(), 200);
        } else if (this.#currentElevationAngle !== this.#lastRenderedElevation || this.#currentAzimuthAngle !== this.#lastRenderedAzimuth) {
            const cosElev = Math.cos(this.#currentElevationAngle);
            const sinElev = Math.sin(this.#currentElevationAngle);
            const cosAzi = Math.cos(this.#currentAzimuthAngle);
            const sinAzi = Math.sin(this.#currentAzimuthAngle);

            const transformationMatrix = [
                cosAzi, -sinAzi * sinElev, sinAzi * cosElev,
                0, cosElev, sinElev,
                sinAzi, sinElev * cosAzi, -cosAzi * cosElev
            ];

            const depthValue = 1.0;

            this.#renderContextInstance.uniform3f(this.#shaderPipelineInstance.getUniformLocation('z'), depthValue, currentViewportHeight / currentViewportWidth, this.#magnificationLevel);
            this.#renderContextInstance.uniform2f(this.#shaderPipelineInstance.getUniformLocation('sas'), this.#sphericalProjectionAspectRatio, 0);
            this.#renderContextInstance.uniformMatrix3fv(this.#shaderPipelineInstance.getUniformLocation('trans'), false, transformationMatrix);
            this.#renderContextInstance.drawArrays(this.#renderContextInstance.TRIANGLE_STRIP, 0, this.#quadVertexGeometry._elementCount);

            this.#lastRenderedElevation = this.#currentElevationAngle;
            this.#lastRenderedAzimuth = this.#currentAzimuthAngle;

            clearTimeout(this.#idleActivityCompletionTimer);
            this.#idleActivityCompletionTimer = setTimeout(() => this.onViewingIdle(this.#currentAzimuthAngle, this.#currentElevationAngle, this.#magnificationLevel), this.#idleNotificationDelayMilliseconds);
        }
    }

    synchronizeDisplayResolution() {
        this.#synchronizeCanvasResolution();
    }

    updateComponentLayout() {
        this.#adjustLayoutDimensions();
    }

    initializeView(containerElement) {
        this.#primaryViewportElement = containerElement;

        this.#drawingSurfaceCanvas = document.createElement("canvas");
        this.#drawingSurfaceCanvas.style.zIndex = "-1";
        this.#drawingSurfaceCanvas.style.position = "absolute";

        this.#scrollableContentContainer = document.createElement("div");
        this.#scrollableContentContainer.style.zIndex = "1";
        this.#scrollableContentContainer.appendChild(this.#drawingSurfaceCanvas);
        this.#primaryViewportElement.appendChild(this.#scrollableContentContainer);

        this.#initializeGraphicsContext();
        this.#prepareRenderingPipeline();
        this.#adjustLayoutDimensions();
        this.#synchronizeCanvasResolution();
        this.animationControlInterface = this.#graphicsEngineInstance.beginAnimationLoop(this.#drawFrame.bind(this), this.#drawingSurfaceCanvas, 1000 / 30, true);
    }

    assignSourceImage(imageElement) {
        const sourceImageWidth = imageElement.naturalWidth;
        const sourceImageHeight = imageElement.naturalHeight;
        this.#sphericalProjectionAspectRatio = (sourceImageWidth / sourceImageHeight) * 0.5;
        this.#panoramaSourceTextureInstance.loadFromHTMLElement(imageElement);
        this.#magnificationLevel = 1 / this.#sphericalProjectionAspectRatio;
        this.#lastRenderedElevation = null;
        this.#lastRenderedAzimuth = null;
        this.#triggerLayoutRecalculation();
    }

    adjustMagnification(newMagnificationValue) {
        this.#magnificationLevel = newMagnificationValue;
        this.#adjustLayoutDimensions();
    }

    orientView(azimuthAngle, elevationAngle) {
        this.#currentElevationAngle = elevationAngle;
        this.#currentAzimuthAngle = azimuthAngle;
        this.#adjustLayoutDimensions();
    }

    onViewingIdle(azimuth, elevation, magnification) {
        // Default callback, intended for external override.
    }
}