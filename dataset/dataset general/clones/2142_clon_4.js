function isPercentValue(valString) {
    return valString.endsWith('%');
}

function canUseWebGraphics() {
    const testCanvas = document.createElement('canvas');
    const testCtx = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    return testCtx && testCtx.getExtension('OES_texture_float') && testCtx.getExtension('OES_texture_float_linear');
}

const supportsWebGraphics = canUseWebGraphics();

function assembleShaderModule(renderingContext, vSource, fSource) {
    function compileShaderPart(type, sourceText) {
        const shaderPart = renderingContext.createShader(type);
        renderingContext.shaderSource(shaderPart, sourceText);
        renderingContext.compileShader(shaderPart);
        if (!renderingContext.getShaderParameter(shaderPart, renderingContext.COMPILE_STATUS)) {
            throw new Error('Shader compilation error: ' + renderingContext.getShaderInfoLog(shaderPart));
        }
        return shaderPart;
    }

    const shaderModule = {};
    shaderModule.programHandle = renderingContext.createProgram();
    renderingContext.attachShader(shaderModule.programHandle, compileShaderPart(renderingContext.VERTEX_SHADER, vSource));
    renderingContext.attachShader(shaderModule.programHandle, compileShaderPart(renderingContext.FRAGMENT_SHADER, fSource));
    renderingContext.linkProgram(shaderModule.programHandle);
    if (!renderingContext.getProgramParameter(shaderModule.programHandle, renderingContext.LINK_STATUS)) {
        throw new Error('Shader linking error: ' + renderingContext.getProgramInfoLog(shaderModule.programHandle));
    }

    shaderModule.uniformMap = {};
    renderingContext.useProgram(shaderModule.programHandle);
    const uniformRegex = /uniform\s+(\w+)\s+(\w+);/g;
    const combinedShaderText = vSource + fSource;
    let match;
    while ((match = uniformRegex.exec(combinedShaderText)) !== null) {
        const uniformName = match[2];
        shaderModule.uniformMap[uniformName] = renderingContext.getUniformLocation(shaderModule.programHandle, uniformName);
    }
    
    return shaderModule;
}

function activateTextureUnit(renderingContext, textureObject, unitIndex = 0) {
    renderingContext.activeTexture(renderingContext.TEXTURE0 + unitIndex);
    renderingContext.bindTexture(renderingContext.TEXTURE_2D, textureObject);
}

document.head.insertAdjacentHTML('afterbegin', '<style>.wave-generator-container { position: relative; z-index: 0; }</style>');

class WaveGen {
    constructor(domElement, configOptions) {
        this.hostElement = domElement;
        this.hostElement.classList.add('wave-generator-container');

        const settings = Object.assign({}, WaveGen.DEFAULT_SETTINGS, configOptions);

        const backgroundStyle = window.getComputedStyle(this.hostElement).backgroundImage;
        const imageUrlMatch = /url\(["']?([^"']*)["']?\)/.exec(backgroundStyle);
        if (!imageUrlMatch) return;

        this.simulationResolution = settings.simulationResolution;
        this.pixelStep = new Float32Array([1 / this.simulationResolution, 1 / this.simulationResolution]);
        this.distortionFactor = settings.distortionFactor;
        this.splashRadius = settings.splashRadius;

        this.renderCanvas = document.createElement('canvas');
        this.renderCanvas.width = this.hostElement.clientWidth;
        this.renderCanvas.height = this.hostElement.clientHeight;
        this.renderCanvas.style.cssText = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: -1;';
        this.hostElement.appendChild(this.renderCanvas);

        this.webGLCtx = this.renderCanvas.getContext('webgl') || this.renderCanvas.getContext('experimental-webgl');
        if (!this.webGLCtx) {
            console.error("WebGL not supported, cannot generate waves.");
            return;
        }

        this.webGLCtx.getExtension('OES_texture_float');
        this.webGLCtx.getExtension('OES_texture_float_linear');

        const globalViewPort = window;
        globalViewPort.addEventListener('resize', () => {
            if (this.hostElement.clientWidth !== this.renderCanvas.width || this.hostElement.clientHeight !== this.renderCanvas.height) {
                this.renderCanvas.width = this.hostElement.clientWidth;
                this.renderCanvas.height = this.hostElement.clientHeight;
            }
        });

        this.hostElement.addEventListener('mousemove', (evt) => {
            if (this.isDisplaying && this.isAnimating) this.dropEffect(evt, this.splashRadius, 0.01);
        });
        this.hostElement.addEventListener('mousedown', (evt) => {
            if (this.isDisplaying && this.isAnimating) this.dropEffect(evt, this.splashRadius * 1.5, 0.14);
        });

        this.waveBuffers = [];
        this.frameTargets = [];

        for (let i = 0; i < 2; i++) {
            const waveTexture = this.webGLCtx.createTexture();
            const frameTarget = this.webGLCtx.createFramebuffer();

            this.webGLCtx.bindFramebuffer(this.webGLCtx.FRAMEBUFFER, frameTarget);
            frameTarget.width = this.simulationResolution;
            frameTarget.height = this.simulationResolution;

            this.webGLCtx.bindTexture(this.webGLCtx.TEXTURE_2D, waveTexture);
            this.webGLCtx.texParameteri(this.webGLCtx.TEXTURE_2D, this.webGLCtx.TEXTURE_MIN_FILTER, this.webGLCtx.LINEAR);
            this.webGLCtx.texParameteri(this.webGLCtx.TEXTURE_2D, this.webGLCtx.TEXTURE_MAG_FILTER, this.webGLCtx.LINEAR);
            this.webGLCtx.texParameteri(this.webGLCtx.TEXTURE_2D, this.webGLCtx.TEXTURE_WRAP_S, this.webGLCtx.CLAMP_TO_EDGE);
            this.webGLCtx.texParameteri(this.webGLCtx.TEXTURE_2D, this.webGLCtx.TEXTURE_WRAP_T, this.webGLCtx.CLAMP_TO_EDGE);
            this.webGLCtx.texImage2D(this.webGLCtx.TEXTURE_2D, 0, this.webGLCtx.RGBA, this.simulationResolution, this.simulationResolution, 0, this.webGLCtx.RGBA, this.webGLCtx.FLOAT, null);

            this.webGLCtx.framebufferTexture2D(this.webGLCtx.FRAMEBUFFER, this.webGLCtx.COLOR_ATTACHMENT0, this.webGLCtx.TEXTURE_2D, waveTexture, 0);
            if (this.webGLCtx.checkFramebufferStatus(this.webGLCtx.FRAMEBUFFER) !== this.webGLCtx.FRAMEBUFFER_COMPLETE) {
                throw new Error('Incomplete framebuffer: rendering to texture not supported.');
            }

            this.webGLCtx.bindTexture(this.webGLCtx.TEXTURE_2D, null);
            this.webGLCtx.bindFramebuffer(this.webGLCtx.FRAMEBUFFER, null);

            this.waveBuffers.push(waveTexture);
            this.frameTargets.push(frameTarget);
        }

        this.isAnimating = true;

        this.screenQuadBuffer = this.webGLCtx.createBuffer();
        this.webGLCtx.bindBuffer(this.webGLCtx.ARRAY_BUFFER, this.screenQuadBuffer);
        this.webGLCtx.bufferData(this.webGLCtx.ARRAY_BUFFER, new Float32Array([-1, -1, +1, -1, +1, +1, -1, +1]), this.webGLCtx.STATIC_DRAW);
        this.webGLCtx.enableVertexAttribArray(0);

        this.initShaderPrograms();

        const imgAsset = new Image();
        imgAsset.crossOrigin = '';
        imgAsset.onload = () => {
            this.webGLCtx.pixelStorei(this.webGLCtx.UNPACK_FLIP_Y_WEBGL, 1);
            const isPowerOfTwo = (dim) => (dim & (dim - 1)) === 0;
            const textureWrapping = (isPowerOfTwo(imgAsset.width) && isPowerOfTwo(imgAsset.height)) ? this.webGLCtx.REPEAT : this.webGLCtx.CLAMP_TO_EDGE;

            this.srcImgW = imgAsset.width;
            this.srcImgH = imgAsset.height;

            const baseTexture = this.webGLCtx.createTexture();
            this.webGLCtx.bindTexture(this.webGLCtx.TEXTURE_2D, baseTexture);
            this.webGLCtx.texParameteri(this.webGLCtx.TEXTURE_2D, this.webGLCtx.TEXTURE_MAG_FILTER, this.webGLCtx.LINEAR);
            this.webGLCtx.texParameteri(this.webGLCtx.TEXTURE_2D, this.webGLCtx.TEXTURE_MIN_FILTER, this.webGLCtx.LINEAR);
            this.webGLCtx.texParameteri(this.webGLCtx.TEXTURE_2D, this.webGLCtx.TEXTURE_WRAP_S, textureWrapping);
            this.webGLCtx.texParameteri(this.webGLCtx.TEXTURE_2D, this.webGLCtx.TEXTURE_WRAP_T, textureWrapping);
            this.webGLCtx.texImage2D(this.webGLCtx.TEXTURE_2D, 0, this.webGLCtx.RGBA, this.webGLCtx.RGBA, this.webGLCtx.UNSIGNED_BYTE, imgAsset);

            this.sourceImageTexture = baseTexture;
            this.hostElement.style.backgroundImage = 'none';
        };
        imgAsset.src = imageUrlMatch[1];

        this.isDisplaying = true;

        const cycleFrame = () => {
            this.frameUpdate();
            requestAnimationFrame(cycleFrame);
        };
        requestAnimationFrame(cycleFrame);
    }

    frameUpdate() {
        if (!this.isDisplaying || !this.sourceImageTexture) return;

        this.adjustBackgroundMapping();

        if (this.isAnimating) {
            this.updateWaveState();
        }

        this.renderDisplay();
    }

    drawScreenQuad() {
        this.webGLCtx.bindBuffer(this.webGLCtx.ARRAY_BUFFER, this.screenQuadBuffer);
        this.webGLCtx.vertexAttribPointer(0, 2, this.webGLCtx.FLOAT, false, 0, 0);
        this.webGLCtx.drawArrays(this.webGLCtx.TRIANGLE_FAN, 0, 4);
    }

    renderDisplay() {
        this.webGLCtx.viewport(0, 0, this.renderCanvas.width, this.renderCanvas.height);
        this.webGLCtx.clear(this.webGLCtx.COLOR_BUFFER_BIT | this.webGLCtx.DEPTH_BUFFER_BIT);

        this.webGLCtx.useProgram(this.displayShader.programHandle);

        activateTextureUnit(this.webGLCtx, this.sourceImageTexture, 0);
        activateTextureUnit(this.webGLCtx, this.waveBuffers[0], 1);

        this.webGLCtx.uniform2fv(this.displayShader.uniformMap.uvStart, this.displayShader.dynamicUniforms.uvStart);
        this.webGLCtx.uniform2fv(this.displayShader.uniformMap.uvEnd, this.displayShader.dynamicUniforms.uvEnd);
        this.webGLCtx.uniform2fv(this.displayShader.uniformMap.aspectCorrection, this.displayShader.dynamicUniforms.aspectCorrection);
        this.webGLCtx.uniform1i(this.displayShader.uniformMap.baseImageSampler, 0);
        this.webGLCtx.uniform1i(this.displayShader.uniformMap.rippleMapSampler, 1);
        this.webGLCtx.uniform1f(this.displayShader.uniformMap.distortionFactor, this.distortionFactor);

        this.drawScreenQuad();
    }

    updateWaveState() {
        this.webGLCtx.viewport(0, 0, this.simulationResolution, this.simulationResolution);

        for (let i = 0; i < 2; i++) {
            this.webGLCtx.bindFramebuffer(this.webGLCtx.FRAMEBUFFER, this.frameTargets[i]);
            activateTextureUnit(this.webGLCtx, this.waveBuffers[1 - i]);
            this.webGLCtx.useProgram(this.propagationShaders[i].programHandle);
            this.webGLCtx.uniform2fv(this.propagationShaders[i].uniformMap.pixelOffset, this.pixelStep);

            this.drawScreenQuad();
        }

        this.webGLCtx.bindFramebuffer(this.webGLCtx.FRAMEBUFFER, null);
        [this.waveBuffers[0], this.waveBuffers[1]] = [this.waveBuffers[1], this.waveBuffers[0]];
    }

    adjustBackgroundMapping() {
        const bgSize = window.getComputedStyle(this.hostElement).backgroundSize;
        const bgAttachment = window.getComputedStyle(this.hostElement).backgroundAttachment;
        const bgPosition = window.getComputedStyle(this.hostElement).backgroundPosition.split(' ');

        const referenceElement = (bgAttachment === 'fixed') ? window : this.hostElement;
        const referenceRect = (bgAttachment === 'fixed') ? { left: window.scrollX, top: window.scrollY } : this.hostElement.getBoundingClientRect();
        const referenceWidth = (bgAttachment === 'fixed') ? window.innerWidth : this.hostElement.clientWidth;
        const referenceHeight = (bgAttachment === 'fixed') ? window.innerHeight : this.hostElement.clientHeight;

        let calculatedBgWidth;
        let calculatedBgHeight;

        if (bgSize === 'cover') {
            const scale = Math.max(referenceWidth / this.srcImgW, referenceHeight / this.srcImgH);
            calculatedBgWidth = this.srcImgW * scale;
            calculatedBgHeight = this.srcImgH * scale;
        } else if (bgSize === 'contain') {
            const scale = Math.min(referenceWidth / this.srcImgW, referenceHeight / this.srcImgH);
            calculatedBgWidth = this.srcImgW * scale;
            calculatedBgHeight = this.srcImgH * scale;
        } else {
            let tempBgWidth = bgSize[0] || '';
            let tempBgHeight = bgSize[1] || tempBgWidth;

            if (isPercentValue(tempBgWidth)) tempBgWidth = referenceWidth * parseFloat(tempBgWidth) / 100;
            else if (tempBgWidth !== 'auto') tempBgWidth = parseFloat(tempBgWidth);

            if (isPercentValue(tempBgHeight)) tempBgHeight = referenceHeight * parseFloat(tempBgHeight) / 100;
            else if (tempBgHeight !== 'auto') tempBgHeight = parseFloat(tempBgHeight);

            if (tempBgWidth === 'auto' && tempBgHeight === 'auto') {
                calculatedBgWidth = this.srcImgW;
                calculatedBgHeight = this.srcImgH;
            } else {
                if (tempBgWidth === 'auto') calculatedBgWidth = this.srcImgW * (tempBgHeight / this.srcImgH);
                if (tempBgHeight === 'auto') calculatedBgHeight = this.srcImgH * (tempBgWidth / this.srcImgW);
                if (tempBgWidth !== 'auto' && tempBgHeight !== 'auto') {
                    calculatedBgWidth = tempBgWidth;
                    calculatedBgHeight = tempBgHeight;
                }
            }
        }

        let bgX = bgPosition[0] || '';
        let bgY = bgPosition[1] || bgX;

        let finalBgX;
        if (bgX === 'left') finalBgX = referenceRect.left;
        else if (bgX === 'center') finalBgX = referenceRect.left + referenceWidth / 2 - calculatedBgWidth / 2;
        else if (bgX === 'right') finalBgX = referenceRect.left + referenceWidth - calculatedBgWidth;
        else if (isPercentValue(bgX)) finalBgX = referenceRect.left + (referenceWidth - calculatedBgWidth) * parseFloat(bgX) / 100;
        else finalBgX = parseFloat(bgX);

        let finalBgY;
        if (bgY === 'top') finalBgY = referenceRect.top;
        else if (bgY === 'center') finalBgY = referenceRect.top + referenceHeight / 2 - calculatedBgHeight / 2;
        else if (bgY === 'bottom') finalBgY = referenceRect.top + referenceHeight - calculatedBgHeight;
        else if (isPercentValue(bgY)) finalBgY = referenceRect.top + (referenceHeight - calculatedBgHeight) * parseFloat(bgY) / 100;
        else finalBgY = parseFloat(bgY);

        const elementRect = this.hostElement.getBoundingClientRect();

        const uvStart = new Float32Array([
            (elementRect.left - finalBgX) / calculatedBgWidth,
            (elementRect.top - finalBgY) / calculatedBgHeight
        ]);
        const uvEnd = new Float32Array([
            uvStart[0] + this.hostElement.clientWidth / calculatedBgWidth,
            uvStart[1] + this.hostElement.clientHeight / calculatedBgHeight
        ]);

        const maxDimension = Math.max(this.renderCanvas.width, this.renderCanvas.height);
        const aspectCorrection = new Float32Array([
            this.renderCanvas.width / maxDimension,
            this.renderCanvas.height / maxDimension
        ]);

        this.displayShader.dynamicUniforms = { uvStart, uvEnd, aspectCorrection };
    }

    initShaderPrograms() {
        const standardVertexShader = `
            attribute vec2 positionVertex;
            varying vec2 textureCoordinate;
            void main() {
                textureCoordinate = positionVertex * 0.5 + 0.5;
                gl_Position = vec4(positionVertex, 0.0, 1.0);
            }
        `;

        this.impactShader = assembleShaderModule(this.webGLCtx, standardVertexShader, `
            precision highp float;
            const float PI_CONST = 3.141592653589793;
            uniform sampler2D currentMap;
            uniform vec2 impactCenter;
            uniform float impactExtent;
            uniform float impactForce;
            varying vec2 textureCoordinate;
            void main() {
                vec4 currentInfo = texture2D(currentMap, textureCoordinate);
                float dropStrength = max(0.0, 1.0 - length(impactCenter * 0.5 + 0.5 - textureCoordinate) / impactExtent);
                dropStrength = 0.5 - cos(dropStrength * PI_CONST) * 0.5;
                currentInfo.r += dropStrength * impactForce;
                gl_FragColor = currentInfo;
            }
        `);

        this.propagationShaders = [null, null];
        this.propagationShaders[0] = assembleShaderModule(this.webGLCtx, standardVertexShader, `
            precision highp float;
            uniform sampler2D currentMap;
            uniform vec2 pixelOffset;
            varying vec2 textureCoordinate;
            void main() {
                vec4 waveData = texture2D(currentMap, textureCoordinate);
                vec2 offsetX = vec2(pixelOffset.x, 0.0);
                vec2 offsetY = vec2(0.0, pixelOffset.y);
                float avgNeighbor = (
                    texture2D(currentMap, textureCoordinate - offsetX).r +
                    texture2D(currentMap, textureCoordinate + offsetX).r +
                    texture2D(currentMap, textureCoordinate - offsetY).r +
                    texture2D(currentMap, textureCoordinate + offsetY).r
                ) * 0.25;
                waveData.g += (avgNeighbor - waveData.r) * 2.0;
                waveData.g *= 0.995;
                waveData.r += waveData.g;
                gl_FragColor = waveData;
            }
        `);

        this.propagationShaders[1] = assembleShaderModule(this.webGLCtx, standardVertexShader, `
            precision highp float;
            uniform sampler2D currentMap;
            uniform vec2 pixelOffset;
            varying vec2 textureCoordinate;
            void main() {
                vec4 waveData = texture2D(currentMap, textureCoordinate);
                vec3 gradientX = vec3(pixelOffset.x, texture2D(currentMap, vec2(textureCoordinate.x + pixelOffset.x, textureCoordinate.y)).r - waveData.r, 0.0);
                vec3 gradientY = vec3(0.0, texture2D(currentMap, vec2(textureCoordinate.x, textureCoordinate.y + pixelOffset.y)).r - waveData.r, pixelOffset.y);
                waveData.ba = normalize(cross(gradientY, gradientX)).xz;
                gl_FragColor = waveData;
            }
        `);

        this.displayShader = assembleShaderModule(this.webGLCtx, `
            precision highp float;
            attribute vec2 positionVertex;
            uniform vec2 uvStart;
            uniform vec2 uvEnd;
            uniform vec2 aspectCorrection;
            varying vec2 rippleCoord;
            varying vec2 backgroundCoord;
            void main() {
                backgroundCoord = mix(uvStart, uvEnd, positionVertex * 0.5 + 0.5);
                backgroundCoord.y = 1.0 - backgroundCoord.y;
                rippleCoord = vec2(positionVertex.x, -positionVertex.y) * aspectCorrection * 0.5 + 0.5;
                gl_Position = vec4(positionVertex.x, -positionVertex.y, 0.0, 1.0);
            }
        `, `
            precision highp float;
            uniform sampler2D baseImageSampler;
            uniform sampler2D rippleMapSampler;
            uniform float distortionFactor;
            varying vec2 rippleCoord;
            varying vec2 backgroundCoord;
            void main() {
                vec2 offsetVector = -texture2D(rippleMapSampler, rippleCoord).ba;
                float highlight = pow(max(0.0, dot(offsetVector, normalize(vec2(-0.6, 1.0)))), 4.0);
                gl_FragColor = texture2D(baseImageSampler, backgroundCoord + offsetVector * distortionFactor) + highlight;
            }
        `);
        this.displayShader.dynamicUniforms = {};
    }

    dropEffect(event, radiusValue, strengthValue) {
        const elementOffset = this.hostElement.getBoundingClientRect();
        const xCoord = event.clientX - elementOffset.left;
        const yCoord = event.clientY - elementOffset.top;

        this.applyRipple(xCoord, yCoord, radiusValue, strengthValue);
    }

    applyRipple(x, y, radius, strength) {
        const currentContext = this.webGLCtx;
        const elementWidth = this.hostElement.offsetWidth;
        const elementHeight = this.hostElement.offsetHeight;
        const maxSideLength = Math.max(elementWidth, elementHeight);

        const normalizedRadius = radius / maxSideLength;

        const impactPoint = new Float32Array([
            (2 * x - elementWidth) / maxSideLength,
            (elementHeight - 2 * y) / maxSideLength
        ]);
        
        currentContext.viewport(0, 0, this.simulationResolution, this.simulationResolution);
        currentContext.bindFramebuffer(currentContext.FRAMEBUFFER, this.frameTargets[0]);
        currentContext.useProgram(this.impactShader.programHandle);

        activateTextureUnit(currentContext, this.waveBuffers[0], 0);

        currentContext.uniform2fv(this.impactShader.uniformMap.impactCenter, impactPoint);
        currentContext.uniform1f(this.impactShader.uniformMap.impactExtent, normalizedRadius);
        currentContext.uniform1f(this.impactShader.uniformMap.impactForce, strength);
        currentContext.uniform1i(this.impactShader.uniformMap.currentMap, 0);

        this.drawScreenQuad();
        currentContext.bindFramebuffer(currentContext.FRAMEBUFFER, null);
    }
}

WaveGen.DEFAULT_SETTINGS = {
    simulationResolution: 256,
    splashRadius: 20,
    distortionFactor: 0.03
};