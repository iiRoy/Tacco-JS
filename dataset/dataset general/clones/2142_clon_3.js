+function (jQuery) {

	let webglContext; // Global WebGL rendering context
	const cachedWindowObj = jQuery(window); // Reference to the window, wrapped by jQuery
	
	// Helper to determine if a string represents a percentage value
	const checkIsPercentString = (inputStr) => {
		return typeof inputStr === 'string' && inputStr.length > 0 && inputStr[inputStr.length - 1] === '%';
	};
	
	// Verifies if the browser supports WebGL with required extensions
	const queryWebGLCapabilities = () => {
		try {
			const tempCanvas = document.createElement('canvas');
			const potentialCtx = tempCanvas.getContext('webgl') || tempCanvas.getContext('experimental-webgl');
			if (!potentialCtx) {
				console.warn("WebGL context could not be obtained.");
				return false;
			}
			const floatTextureExt = potentialCtx.getExtension('OES_texture_float');
			const floatLinearExt = potentialCtx.getExtension('OES_texture_float_linear');
			
			if (floatTextureExt && floatLinearExt) {
				console.info("WebGL with OES_texture_float and OES_texture_float_linear extensions supported.");
				return true;
			} else {
				console.warn("Required WebGL extensions (OES_texture_float, OES_texture_float_linear) not available.");
				return false;
			}
		} catch (e) {
			console.error("Error during WebGL capability check:", e);
			return false;
		}
	};
	
	const webglAvailable = queryWebGLCapabilities(); // Cache WebGL support status

	// Compiles a single shader source and returns the compiled shader object
	const compileShaderSource = (shaderType, sourceCode) => {
		const shaderObj = webglContext.createShader(shaderType);
		webglContext.shaderSource(shaderObj, sourceCode);
		webglContext.compileShader(shaderObj);
		if (!webglContext.getShaderParameter(shaderObj, webglContext.COMPILE_STATUS)) {
			const compileError = webglContext.getShaderInfoLog(shaderObj);
			webglContext.deleteShader(shaderObj);
			throw new Error(`Shader compilation failure: ${compileError}`);
		}
		return shaderObj;
	};

	// Creates and links a WebGL shader program from vertex and fragment sources
	const buildShaderProgram = (vertexSource, fragmentSource) => 
	{
		const newProgram = {};
		
		newProgram.id = webglContext.createProgram();
		
		const vertShader = compileShaderSource(webglContext.VERTEX_SHADER, vertexSource);
		const fragShader = compileShaderSource(webglContext.FRAGMENT_SHADER, fragmentSource);

		webglContext.attachShader(newProgram.id, vertShader);
		webglContext.attachShader(newProgram.id, fragShader);
		webglContext.linkProgram(newProgram.id);

		if (!webglContext.getProgramParameter(newProgram.id, webglContext.LINK_STATUS)) {
			const linkError = webglContext.getProgramInfoLog(newProgram.id);
			webglContext.deleteProgram(newProgram.id);
			webglContext.deleteShader(vertShader);
			webglContext.deleteShader(fragShader);
			throw new Error(`Program linking failure: ${linkError}`);
		}

		// Clean up individual shaders after linking
		webglContext.detachShader(newProgram.id, vertShader);
		webglContext.detachShader(newProgram.id, fragShader);
		webglContext.deleteShader(vertShader);
		webglContext.deleteShader(fragShader);

		// Discover and store uniform locations
		newProgram.uniforms = {}; // For caching uniform values
		newProgram.locations = {}; // For storing uniform location references
		
		webglContext.useProgram(newProgram.id);
		webglContext.enableVertexAttribArray(0); // Assuming vertex attribute is always at location 0

		// Extract uniform names from shader sources using regex
		const combinedShaderCode = vertexSource + fragmentSource;
		const uniformRegex = /uniform\s+(\w+)\s+(\w+);/g; // Matches "uniform type name;"
		let matchResult;
		while ((matchResult = uniformRegex.exec(combinedShaderCode)) !== null) {
			const uniformName = matchResult[2];
			newProgram.locations[uniformName] = webglContext.getUniformLocation(newProgram.id, uniformName);
		}
		
		return newProgram;
	};
	
	// Activates a texture unit and binds a texture to it
	const activateAndBindTexture = (textureObject, unitIndex = 0) => {
		webglContext.activeTexture(webglContext.TEXTURE0 + unitIndex);
		webglContext.bindTexture(webglContext.TEXTURE_2D, textureObject);
	};
	
	// Inject base styling for the ripple container
	jQuery('head').prepend('<style type="text/css">.wave-container { position: relative; z-index: 0; overflow: hidden; }</style>');

	// SURFACE ANIMATOR CLASS DEFINITION
	// ==================================

	const SurfaceAnimator = function (element, configOptions) {
		const self = this;
		
		this.hostElement = jQuery(element);
		this.hostElement.addClass('wave-container');
		
		// If no background image, then no ripple effect
		const cssBgImage = this.hostElement.css('background-image');
		const bgUrlMatch = /url\(['"]?([^'"]*)['"]?\)/.exec(cssBgImage);
		if (!bgUrlMatch || bgUrlMatch.length < 2) {
			console.warn("No background image found for element, skipping ripple effect.");
			return; // Exit early if no background image
		}
		const imageUrl = bgUrlMatch[1];
		
		// Merge provided options with defaults
		this.options = jQuery.extend({}, SurfaceAnimator.DEFAULT_EFFECT_PARAMS, configOptions);

		this.renderResolution = this.options.renderResolution;
		this.texelStep = new Float32Array([1 / this.renderResolution, 1 / this.renderResolution]);
		
		this.wavePerturbationFactor = this.options.wavePerturbationFactor;
		this.impactRadius = this.options.impactRadius;
		
		// Create a canvas for WebGL rendering
		this.effectCanvas = document.createElement('canvas');
		this.effectCanvas.width = this.hostElement.innerWidth();
		this.effectCanvas.height = this.hostElement.innerHeight();
		this.jQCanvas = jQuery(this.effectCanvas);
		this.jQCanvas.css({
			position: 'absolute',
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			zIndex: -1, // Ensures canvas is behind content
			pointerEvents: 'none' // Prevent canvas from blocking mouse events
		});
		
		this.hostElement.append(this.effectCanvas);
		this.glCtx = webglContext = this.effectCanvas.getContext('webgl', {alpha: true, premultipliedAlpha: false}) || this.effectCanvas.getContext('experimental-webgl', {alpha: true, premultipliedAlpha: false});
		
		if (!this.glCtx) {
			console.error("Failed to get WebGL context for effect canvas.");
			this.hostElement.removeClass('wave-container');
			this.jQCanvas.remove();
			return;
		}

		// Confirm extensions are available (redundant if webglAvailable is true, but good for local context check)
		this.glCtx.getExtension('OES_texture_float');
		this.glCtx.getExtension('OES_texture_float_linear');
		
		// Handle window/element resize events
		cachedWindowObj.on('resize.surfaceanimator', () => {
			const currentWidth = self.hostElement.innerWidth();
			const currentHeight = self.hostElement.innerHeight();
			if (currentWidth !== self.effectCanvas.width || currentHeight !== self.effectCanvas.height) {
				self.effectCanvas.width = currentWidth;
				self.effectCanvas.height = currentHeight;
				// Re-calculate background mapping on resize
				self.calculateBackgroundMapping();
			}
		});

		// Mouse interaction for dropping ripples
		this.hostElement.on('mousemove.surfaceanimator', (e) => {
			if (self.isEffectVisible && self.isAnimationActive) {
				self.initiateMouseDrop(e, self.impactRadius, 0.01);
			}
		}).on('mousedown.surfaceanimator', (e) => {
			if (self.isEffectVisible && self.isAnimationActive) {
				self.initiateMouseDrop(e, self.impactRadius * 1.5, 0.14);
			}
		});
		
		this.frameTextures = []; // Stores ping-pong textures for simulation
		this.frameBuffers = []; // Stores framebuffers associated with textures

		// Initialize two textures and framebuffers for the ripple simulation (ping-pong rendering)
		for (let i = 0; i < 2; i++) {
			const texture = this.glCtx.createTexture();
			const framebuffer = this.glCtx.createFramebuffer();
			
			this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, framebuffer);
			framebuffer.width = this.renderResolution;
			framebuffer.height = this.renderResolution;

			this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, texture);
			this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MIN_FILTER, this.glCtx.LINEAR);
			this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MAG_FILTER, this.glCtx.LINEAR);
			this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_WRAP_S, this.glCtx.CLAMP_TO_EDGE); 
			this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_WRAP_T, this.glCtx.CLAMP_TO_EDGE);
			
			// Use gl.FLOAT for texture data type for ripple simulation
			this.glCtx.texImage2D(this.glCtx.TEXTURE_2D, 0, this.glCtx.RGBA, this.renderResolution, this.renderResolution, 0, this.glCtx.RGBA, this.glCtx.FLOAT, null);

			this.glCtx.framebufferTexture2D(this.glCtx.FRAMEBUFFER, this.glCtx.COLOR_ATTACHMENT0, this.glCtx.TEXTURE_2D, texture, 0);
			if (this.glCtx.checkFramebufferStatus(this.glCtx.FRAMEBUFFER) !== this.glCtx.FRAMEBUFFER_COMPLETE) {
				throw new Error('Framebuffer configuration for ripple texture is incomplete or unsupported.');
			}
			
			this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, null);
			this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, null);
			
			this.frameTextures.push(texture);
			this.frameBuffers.push(framebuffer);
		}

		this.isAnimationActive = true; // Flag to control animation updates

		// Create a square buffer for rendering (a simple quad)
		this.renderQuadBuffer = this.glCtx.createBuffer();
		this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.renderQuadBuffer);
		this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array([
			-1.0, -1.0, // Bottom-left
			+1.0, -1.0, // Bottom-right
			+1.0, +1.0, // Top-right
			-1.0, +1.0  // Top-left
		]), this.glCtx.STATIC_DRAW);
		
		this.initializeShaderPrograms(); // Setup all WebGL shader programs
		
		// Load the background image and create its texture
		const bgImage = new Image();
		bgImage.crossOrigin = 'anonymous'; // Necessary for images from different origins
		bgImage.onload = () => {
			webglContext = self.glCtx; // Ensure the global webglContext points to the instance's context

			// Helper to check if a number is a power of two
			const isPowerOfTwo = (val) => (val & (val - 1)) === 0;
			
			const textureWrappingMode = (isPowerOfTwo(bgImage.width) && isPowerOfTwo(bgImage.height)) ? webglContext.REPEAT : webglContext.CLAMP_TO_EDGE;
			
			self.bgImgWidth = bgImage.width;
			self.bgImgHeight = bgImage.height;
			
			const newTexture = webglContext.createTexture();
			
			webglContext.bindTexture(webglContext.TEXTURE_2D, newTexture);
			webglContext.pixelStorei(webglContext.UNPACK_FLIP_Y_WEBGL, 1); // Flip image vertically
			webglContext.texParameteri(webglContext.TEXTURE_2D, webglContext.TEXTURE_MAG_FILTER, webglContext.LINEAR);
			webglContext.texParameteri(webglContext.TEXTURE_2D, webglContext.TEXTURE_MIN_FILTER, webglContext.LINEAR);
			webglContext.texParameteri(webglContext.TEXTURE_2D, webglContext.TEXTURE_WRAP_S, textureWrappingMode);
			webglContext.texParameteri(webglContext.TEXTURE_2D, webglContext.TEXTURE_WRAP_T, textureWrappingMode);
			webglContext.texImage2D(webglContext.TEXTURE_2D, 0, webglContext.RGBA, webglContext.RGBA, webglContext.UNSIGNED_BYTE, bgImage);
			
			self.sourceImageTexture = newTexture;
			
			// All assets loaded, hide the original CSS background image
			self.hostElement.css('backgroundImage', 'none');
		};
		bgImage.onerror = (e) => {
			console.error("Failed to load background image:", imageUrl, e);
			// Fallback: disable ripples if image fails to load
			self.isEffectVisible = false;
			self.isAnimationActive = false;
			self.hostElement.css('backgroundImage', cssBgImage); // Restore original background
		};
		bgImage.src = imageUrl;
		
		this.isEffectVisible = true; // Controls overall visibility of the effect
		
		// Start the animation loop
		const animationLoop = () => {
			self.animationFrameStep();
			requestAnimationFrame(animationLoop);
		};
		
		requestAnimationFrame(animationLoop);
	};

	SurfaceAnimator.DEFAULT_EFFECT_PARAMS = {
		renderResolution: 256,
		impactRadius: 20,
		wavePerturbationFactor: 0.03
	};
	
	SurfaceAnimator.prototype = {

		// Main animation step, called every frame
		animationFrameStep: function() {
			webglContext = this.glCtx;
			
			if (!this.isEffectVisible || !this.sourceImageTexture || !webglAvailable) {
				return; // Skip if not visible, texture not loaded, or WebGL not available
			}
			
			this.calculateBackgroundMapping(); // Update background positioning for rendering

			if (this.isAnimationActive) {
				this.advanceWaveSimulation(); // Update ripple state
			}

			this.drawEffectToScreen(); // Render the final scene
		},
		
		// Renders a simple quad (two triangles) filling the viewport
		renderUnitQuad: function() {
			webglContext.bindBuffer(webglContext.ARRAY_BUFFER, this.renderQuadBuffer);
			webglContext.vertexAttribPointer(0, 2, webglContext.FLOAT, false, 0, 0);
			webglContext.drawArrays(webglContext.TRIANGLE_FAN, 0, 4);
		},
		
		// Renders the combined background image and ripple effect to the canvas
		drawEffectToScreen: function() {
			webglContext.viewport(0, 0, this.effectCanvas.width, this.effectCanvas.height);
			webglContext.clear(webglContext.COLOR_BUFFER_BIT | webglContext.DEPTH_BUFFER_BIT);

			webglContext.useProgram(this.finalRenderProgram.id);
			
			activateAndBindTexture(this.sourceImageTexture, 0); // Background image on unit 0
			activateAndBindTexture(this.frameTextures[0], 1); // Ripple texture on unit 1 (current state)
			
			// Set uniforms for the final rendering program
			webglContext.uniform2fv(this.finalRenderProgram.locations.topLeft, this.finalRenderProgram.uniforms.topLeft);
			webglContext.uniform2fv(this.finalRenderProgram.locations.bottomRight, this.finalRenderProgram.uniforms.bottomRight);
			webglContext.uniform2fv(this.finalRenderProgram.locations.containerRatio, this.finalRenderProgram.uniforms.containerRatio);
			webglContext.uniform1i(this.finalRenderProgram.locations.samplerBackground, 0); // Texture unit for background
			webglContext.uniform1i(this.finalRenderProgram.locations.samplerRipples, 1); // Texture unit for ripples
			
			this.renderUnitQuad(); // Draw the quad with the combined effect
		},

		// Advances the ripple simulation using ping-pong rendering
		advanceWaveSimulation: function() {
			webglContext.viewport(0, 0, this.renderResolution, this.renderResolution);
			
			// Ping-pong between two framebuffers/textures
			for (let programIndex = 0; programIndex < 2; programIndex++) {
				const currentFramebuffer = this.frameBuffers[programIndex];
				const sourceTexture = this.frameTextures[1 - programIndex]; // Read from the other texture
				const updateShader = this.waveUpdatePrograms[programIndex];

				webglContext.bindFramebuffer(webglContext.FRAMEBUFFER, currentFramebuffer);
				activateAndBindTexture(sourceTexture, 0); // Bind source texture to unit 0
				webglContext.useProgram(updateShader.id);
				
				this.renderUnitQuad(); // Apply update shader
			}

			webglContext.bindFramebuffer(webglContext.FRAMEBUFFER, null); // Unbind framebuffer
		},
		
		// Calculates texture coordinates for the background image based on CSS properties
		calculateBackgroundMapping: function() {
			const bgSize = this.hostElement.css('background-size');
			const bgAttachment = this.hostElement.css('background-attachment');
			const bgPosition = this.hostElement.css('background-position').split(' ');

			// Determine the reference element for background positioning (window or host element)
			const parentElementForBg = (bgAttachment === 'fixed') ? cachedWindowObj : this.hostElement;
			const parentOffset = parentElementForBg.offset() || {left: window.pageXOffset, top: window.pageYOffset};
			const parentWidth = parentElementForBg.innerWidth();
			const parentHeight = parentElementForBg.innerHeight();

			let actualBgWidth = this.bgImgWidth;
			let actualBgHeight = this.bgImgHeight;

			// Handle background-size property
			if (bgSize === 'cover') {
				const scaleFactor = Math.max(parentWidth / this.bgImgWidth, parentHeight / this.bgImgHeight);
				actualBgWidth = this.bgImgWidth * scaleFactor;
				actualBgHeight = this.bgImgHeight * scaleFactor;
			}
			else if (bgSize === 'contain') {
				const scaleFactor = Math.min(parentWidth / this.bgImgWidth, parentHeight / this.bgImgHeight);
				actualBgWidth = this.bgImgWidth * scaleFactor;
				actualBgHeight = this.bgImgHeight * scaleFactor;
			}
			else {
				const sizeX = bgSize[0] || 'auto';
				const sizeY = bgSize[1] || sizeX; // If only one value, Y is same as X
				
				let tempWidth = sizeX;
				let tempHeight = sizeY;

				if (checkIsPercentString(tempWidth)) {
					tempWidth = parentWidth * parseFloat(tempWidth) / 100;
				} else if (tempWidth !== 'auto') {
					tempWidth = parseFloat(tempWidth);
				}
				
				if (checkIsPercentString(tempHeight)) {
					tempHeight = parentHeight * parseFloat(tempHeight) / 100;
				} else if (tempHeight !== 'auto') {
					tempHeight = parseFloat(tempHeight);
				}
				
				if (tempWidth === 'auto' && tempHeight === 'auto') {
					// Both auto, use original image dimensions
				} else if (tempWidth === 'auto') {
					actualBgWidth = this.bgImgWidth * (tempHeight / this.bgImgHeight);
					actualBgHeight = tempHeight;
				} else if (tempHeight === 'auto') {
					actualBgHeight = this.bgImgHeight * (tempWidth / this.bgImgWidth);
					actualBgWidth = tempWidth;
				} else {
					actualBgWidth = tempWidth;
					actualBgHeight = tempHeight;
				}
			}
			
			// Compute backgroundX and backgroundY in page coordinates
			const posX = bgPosition[0] || 'left';
			const posY = bgPosition[1] || 'top';
			
			let backgroundX;
			if (posX === 'left') backgroundX = parentOffset.left;
			else if (posX === 'center') backgroundX = parentOffset.left + (parentWidth - actualBgWidth) / 2;
			else if (posX === 'right') backgroundX = parentOffset.left + parentWidth - actualBgWidth;
			else if (checkIsPercentString(posX)) {
				backgroundX = parentOffset.left + (parentWidth - actualBgWidth) * parseFloat(posX) / 100;
			}
			else {
				backgroundX = parseFloat(posX);
			}
			
			let backgroundY;
			if (posY === 'top') backgroundY = parentOffset.top;
			else if (posY === 'center') backgroundY = parentOffset.top + (parentHeight - actualBgHeight) / 2;
			else if (posY === 'bottom') backgroundY = parentOffset.top + parentHeight - actualBgHeight;
			else if (checkIsPercentString(posY)) {
				backgroundY = parentOffset.top + (parentHeight - actualBgHeight) * parseFloat(posY) / 100;
			}
			else {
				backgroundY = parseFloat(posY);
			}

			const hostElementOffset = this.hostElement.offset();
			
			// Calculate texture coordinates for the top-left and bottom-right corners of the host element
			const textureTopLeftX = (hostElementOffset.left - backgroundX) / actualBgWidth;
			const textureTopLeftY = (hostElementOffset.top - backgroundY) / actualBgHeight;

			const textureBottomRightX = textureTopLeftX + this.hostElement.innerWidth() / actualBgWidth;
			const textureBottomRightY = textureTopLeftY + this.hostElement.innerHeight() / actualBgHeight;

			this.finalRenderProgram.uniforms.topLeft = new Float32Array([textureTopLeftX, textureTopLeftY]);
			this.finalRenderProgram.uniforms.bottomRight = new Float32Array([textureBottomRightX, textureBottomRightY]);
			
			const maxDimension = Math.max(this.effectCanvas.width, this.effectCanvas.height);
			
			this.finalRenderProgram.uniforms.containerRatio = new Float32Array([
				this.effectCanvas.width / maxDimension,
				this.effectCanvas.height / maxDimension
			]);
		},
		
		// Initializes all WebGL shader programs used by the ripple effect
		initializeShaderPrograms: function() {
			const commonVertexShader = `
				attribute vec2 vertexPosition;
				varying vec2 textureCoordinate;
				void main() {
					textureCoordinate = vertexPosition * 0.5 + 0.5;
					gl_Position = vec4(vertexPosition, 0.0, 1.0);
				}
			`;
			
			this.rippleDropProgram = buildShaderProgram(commonVertexShader, `
				precision highp float;
				const float PI_VAL = 3.141592653589793;
				uniform sampler2D simulationTexture;
				uniform vec2 dropCenter;
				uniform float dropRadius;
				uniform float dropStrength;
				varying vec2 textureCoordinate;
				void main() {
					vec4 currentInfo = texture2D(simulationTexture, textureCoordinate);
					float distToCenter = length(dropCenter * 0.5 + 0.5 - textureCoordinate);
					float dropEffect = max(0.0, 1.0 - distToCenter / dropRadius);
					dropEffect = 0.5 - cos(dropEffect * PI_VAL) * 0.5;
					currentInfo.r += dropEffect * dropStrength; // Add to wave height
					gl_FragColor = currentInfo;
				}
			`);
			
			this.waveUpdatePrograms = [null, null]; // Array to hold two update programs

			// Program 1: Propagate waves
			this.waveUpdatePrograms[0] = buildShaderProgram(commonVertexShader, `
				precision highp float;
				uniform sampler2D simulationTexture;
				uniform vec2 pixelDelta;
				varying vec2 textureCoordinate;
				void main() {
					vec4 currentPixel = texture2D(simulationTexture, textureCoordinate);
					vec2 deltaX = vec2(pixelDelta.x, 0.0);
					vec2 deltaY = vec2(0.0, pixelDelta.y);
					
					float avgNeighbor = (
						texture2D(simulationTexture, textureCoordinate - deltaX).r +
						texture2D(simulationTexture, textureCoordinate + deltaX).r +
						texture2D(simulationTexture, textureCoordinate - deltaY).r +
						texture2D(simulationTexture, textureCoordinate + deltaY).r
					) * 0.25;
					
					currentPixel.g += (avgNeighbor - currentPixel.r) * 2.0; // Update velocity
					currentPixel.g *= 0.995; // Apply damping
					currentPixel.r += currentPixel.g; // Update height
					
					gl_FragColor = currentPixel;
				}
			`);
			webglContext.useProgram(this.waveUpdatePrograms[0].id);
			webglContext.uniform2fv(this.waveUpdatePrograms[0].locations.pixelDelta, this.texelStep);
			
			// Program 2: Compute normals for perturbation
			this.waveUpdatePrograms[1] = buildShaderProgram(commonVertexShader, `
				precision highp float;
				uniform sampler2D simulationTexture;
				uniform vec2 pixelDelta;
				varying vec2 textureCoordinate;
				void main() {
					vec4 currentPixel = texture2D(simulationTexture, textureCoordinate);
					
					// Calculate gradients to determine normals
					float height_center = currentPixel.r;
					float height_dx = texture2D(simulationTexture, vec2(textureCoordinate.x + pixelDelta.x, textureCoordinate.y)).r;
					float height_dy = texture2D(simulationTexture, vec2(textureCoordinate.x, textureCoordinate.y + pixelDelta.y)).r;

					vec3 tangentX = vec3(pixelDelta.x, height_dx - height_center, 0.0);
					vec3 tangentY = vec3(0.0, height_dy - height_center, pixelDelta.y);
					
					// Store normalized normal's XZ components in .ba (blue, alpha) channels
					currentPixel.ba = normalize(cross(tangentY, tangentX)).xz;
					
					gl_FragColor = currentPixel;
				}
			`);
			webglContext.useProgram(this.waveUpdatePrograms[1].id);
			webglContext.uniform2fv(this.waveUpdatePrograms[1].locations.pixelDelta, this.texelStep);
			
			// Final rendering program
			this.finalRenderProgram = buildShaderProgram(`
				precision highp float;
				attribute vec2 vertexPosition;
				uniform vec2 bgTopLeft;
				uniform vec2 bgBottomRight;
				uniform vec2 canvasRatio;
				varying vec2 rippleTextureCoord;
				varying vec2 backgroundTextureCoord;
				void main() {
					backgroundTextureCoord = mix(bgTopLeft, bgBottomRight, vertexPosition * 0.5 + 0.5);
					backgroundTextureCoord.y = 1.0 - backgroundTextureCoord.y; // Flip Y for background
					rippleTextureCoord = vec2(vertexPosition.x, -vertexPosition.y) * canvasRatio * 0.5 + 0.5; // Flip Y for ripples
					gl_Position = vec4(vertexPosition.x, -vertexPosition.y, 0.0, 1.0); // Flip Y for screen
				}
			`, `
				precision highp float;
				uniform sampler2D samplerBackground;
				uniform sampler2D samplerRipples;
				uniform float perturbationIntensity;
				varying vec2 rippleTextureCoord;
				varying vec2 backgroundTextureCoord;
				void main() {
					vec2 waveNormalOffset = -texture2D(samplerRipples, rippleTextureCoord).ba; // Extract normal (XZ components)
					float specularHighlight = pow(max(0.0, dot(waveNormalOffset, normalize(vec2(-0.6, 1.0)))), 4.0); // Simple specular
					gl_FragColor = texture2D(samplerBackground, backgroundTextureCoord + waveNormalOffset * perturbationIntensity) + specularHighlight;
				}
			`);
			webglContext.useProgram(this.finalRenderProgram.id);
			webglContext.uniform1f(this.finalRenderProgram.locations.perturbationIntensity, this.wavePerturbationFactor);

			console.log("All shader programs initialized successfully.");
		},
		
		// Initiates a ripple drop based on mouse event coordinates
		initiateMouseDrop: function(event, rad, str) {
			if (!this.glCtx) return; // Ensure context exists
			const elementOffset = this.hostElement.offset();
			this.applyWaveImpulse(
				event.pageX - elementOffset.left,
				event.pageY - elementOffset.top,
				rad, 
				str
			);
		},
		
		// Applies a ripple impulse at specific coordinates on the ripple texture
		applyWaveImpulse: function(xCoord, yCoord, dropRadiusPx, dropStrengthVal) {
			webglContext = this.glCtx; // Ensure webglContext is set for this instance

			if (!webglContext) {
				console.error("WebGL context not available for applying drop.");
				return;
			}

			const hostWidth = this.hostElement.outerWidth();
			const hostHeight = this.hostElement.outerHeight();
			const maxHostDimension = Math.max(hostWidth, hostHeight);
			
			// Normalize radius relative to the larger dimension
			const normalizedRadius = dropRadiusPx / maxHostDimension;
			
			// Normalize drop position to GL coordinates (-1 to 1, with Y flipped)
			const normalizedDropPosition = new Float32Array([
				(2 * xCoord - hostWidth) / maxHostDimension, 
				(hostHeight - 2 * yCoord) / maxHostDimension
			]);

			// Perform the drop calculation on the ripple texture
			webglContext.viewport(0, 0, this.renderResolution, this.renderResolution);
			webglContext.bindFramebuffer(webglContext.FRAMEBUFFER, this.frameBuffers[0]); // Target the first framebuffer
			activateAndBindTexture(this.frameTextures[0], 0); // Bind its texture as source
			webglContext.useProgram(this.rippleDropProgram.id);
			
			// Set uniforms for the drop program
			webglContext.uniform2fv(this.rippleDropProgram.locations.dropCenter, normalizedDropPosition);
			webglContext.uniform1f(this.rippleDropProgram.locations.dropRadius, normalizedRadius);
			webglContext.uniform1f(this.rippleDropProgram.locations.dropStrength, dropStrengthVal);
			webglContext.uniform1i(this.rippleDropProgram.locations.simulationTexture, 0); // Input texture unit

			this.renderUnitQuad(); // Apply the drop
			
			webglContext.bindFramebuffer(webglContext.FRAMEBUFFER, null); // Unbind framebuffer
		}
	};

	// JQUERY PLUGIN DEFINITION
	// ========================

	function Plugin(option) {
		return this.each(function () {
			let $this = jQuery(this);
			let data = $this.data('ripples.effect');
			let options = typeof option === 'object' && option;

			if (!data && webglAvailable) { // Only initialize if WebGL is available
				$this.data('ripples.effect', (data = new SurfaceAnimator(this, options)));
			}
			// Future expansion: Add method calls here if needed
			// if (typeof option === 'string' && data) {
			// 	data[option]();
			// }
		});
	}

	jQuery.fn.ripples = Plugin;
	jQuery.fn.ripples.Constructor = SurfaceAnimator;

	// DEFAULT INITIALIZATION
	// ======================

	jQuery(window).on('load', function () {
		jQuery('[data-toggle="ripples"]').each(function () {
			let $ripples = jQuery(this);
			let data = $ripples.data();
			Plugin.call($ripples, data);
		});
	});

}(jQuery);