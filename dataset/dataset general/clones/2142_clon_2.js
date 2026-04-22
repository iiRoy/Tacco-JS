+function (jq) {

	// Global rendering context for WebGL operations
	var gfxCtx;
	// Cached jQuery-wrapped window object for efficiency
	var $viewportElem = jq(window);
	
	/**
	 * Determines if a given string represents a percentage value.
	 * @param {string} inputString - The string to check.
	 * @returns {boolean} True if the string ends with '%', false otherwise.
	 */
	function checkPercentSuffix(inputString) {
		return inputString[inputString.length - 1] === '%';
	}
	
	/**
	 * Verifies if the browser supports WebGL with necessary extensions.
	 * @returns {boolean} True if WebGL is supported with OES_texture_float and OES_texture_float_linear, false otherwise.
	 */
	function detectWebGLEnabled() {
		// Create a temporary canvas element to check context
		var tempCanvas = document.createElement('canvas');
		var renderCtx = tempCanvas.getContext('webgl') || tempCanvas.getContext('experimental-webgl');
		// Check for required extensions for floating point textures
		var capability = renderCtx && renderCtx.getExtension('OES_texture_float') && renderCtx.getExtension('OES_texture_float_linear');
		return capability;
	}
	
	// Pre-calculate WebGL support status once
	var graphicsHardwareSupported = detectWebGLEnabled();

	/**
	 * Compiles and links WebGL shader programs.
	 * @param {string} vertSource - The source code for the vertex shader.
	 * @param {string} fragSource - The source code for the fragment shader.
	 * @returns {object} An object containing the linked program ID, uniform locations, and uniform values.
	 */
	function constructShaderProgram(vertSource, fragSource) 
	{
		/**
		 * Compiles a single shader source.
		 * @param {number} shaderType - The type of shader (e.g., gfxCtx.VERTEX_SHADER).
		 * @param {string} sourceCode - The GLSL source code.
		 * @returns {WebGLShader} The compiled shader.
		 * @throws {Error} If shader compilation fails.
		 */
		function compileShaderComponent(shaderType, sourceCode) {
			var shaderRef = gfxCtx.createShader(shaderType);
			gfxCtx.shaderSource(shaderRef, sourceCode);
			gfxCtx.compileShader(shaderRef);
			// Check for compilation errors
			if (!gfxCtx.getShaderParameter(shaderRef, gfxCtx.COMPILE_STATUS)) {
				throw new Error('Shader compilation error: ' + gfxCtx.getShaderInfoLog(shaderRef));
			}
			return shaderRef;
		}
		
		var programObject = {};
		
		programObject.id = gfxCtx.createProgram();
		gfxCtx.attachShader(programObject.id, compileShaderComponent(gfxCtx.VERTEX_SHADER, vertSource));
		gfxCtx.attachShader(programObject.id, compileShaderComponent(gfxCtx.FRAGMENT_SHADER, fragSource));
		gfxCtx.linkProgram(programObject.id);
		// Check for linking errors
		if (!gfxCtx.getProgramParameter(programObject.id, gfxCtx.LINK_STATUS)) {
			throw new Error('Program linking error: ' + gfxCtx.getProgramInfoLog(programObject.id));
		}

		// Discover and store uniform locations
		programObject.uniforms = {};
		programObject.locations = {};
		gfxCtx.useProgram(programObject.id);
		gfxCtx.enableVertexAttribArray(0); // Enable vertex attribute at location 0
		var uniformName, uniformType, uniformRegex = /uniform (\w+) (\w+)/g, fullShaderCode = vertSource + fragSource;
		var matchResult;
		while ((matchResult = uniformRegex.exec(fullShaderCode)) != null) {
			uniformName = matchResult[2];
			programObject.locations[uniformName] = gfxCtx.getUniformLocation(programObject.id, uniformName);
		}
		
		return programObject;
	}
	
	/**
	 * Activates a texture unit and binds a WebGL texture.
	 * @param {WebGLTexture} textureRef - The texture to bind.
	 * @param {number} [unitIndex=0] - The texture unit to activate.
	 */
	function activateTextureUnit(textureRef, unitIndex) {
		gfxCtx.activeTexture(gfxCtx.TEXTURE0 + (unitIndex || 0));
		gfxCtx.bindTexture(gfxCtx.TEXTURE_2D, textureRef);
	}
	
	// Insert CSS for ripple container into the document head
	jq('head').prepend('<style>.ripple-container { position: relative; z-index: 0; }</style>');

	// SURFACE DISTORTION CLASS DEFINITION
	// ==================================

	var SurfaceDistortion = function (targetElement, configurationSettings) {
		var instanceRef = this; // Store reference to 'this' for callbacks
		
		this.$containerElement = jq(targetElement);
		this.$containerElement.addClass('ripple-container');
		
		// If the element lacks a background image, skip applying the effect
		var bgImgSource = (/url\(["']?([^"']*)["']?\)/.exec(this.$containerElement.css('background-image')));
		if (bgImgSource == null) return;
		bgImgSource = bgImgSource[1];
		
		this.detailLevel = configurationSettings.resolution || 256; // Grid resolution for simulation
		this.coordIncrement = new Float32Array([1 / this.detailLevel, 1 / this.detailLevel]); // Step size for texture coordinates
		
		this.rippleMagnitude = configurationSettings.perturbance; // Strength of visual distortion
		this.impactArea = configurationSettings.dropRadius; // Size of the initial ripple
		
		var renderCanvas = document.createElement('canvas');
		renderCanvas.width = this.$containerElement.innerWidth();
		renderCanvas.height = this.$containerElement.innerHeight();
		this.renderCanvas = renderCanvas;
		this.$renderCanvas = jq(renderCanvas);
		this.$renderCanvas.css({
			position: 'absolute',
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			zIndex: -1 // Place canvas behind the content
		});
		
		this.$containerElement.append(renderCanvas);
		this.glRenderer = gfxCtx = renderCanvas.getContext('webgl') || renderCanvas.getContext('experimental-webgl'); // Assign context globally
		
		// Load necessary WebGL extensions
		gfxCtx.getExtension('OES_texture_float');
		gfxCtx.getExtension('OES_texture_float_linear');
		
		// Initialize event listeners
		jq(window).on('resize', function() {
			// Adjust canvas size if container dimensions change
			if (instanceRef.$containerElement.innerWidth() !== instanceRef.renderCanvas.width || instanceRef.$containerElement.innerHeight() !== instanceRef.renderCanvas.height) {
				renderCanvas.width = instanceRef.$containerElement.innerWidth();
				renderCanvas.height = instanceRef.$containerElement.innerHeight();
			}
		});

		// Mouse interaction for ripple generation
		this.$containerElement.on('mousemove.surfaceeffect', function(e) {
			if (instanceRef.isCurrentlyVisible && instanceRef.animationActive) instanceRef.createDropAtCursor(e, instanceRef.impactArea, 0.01);
		}).on('mousedown.surfaceeffect', function(e) {
			if (instanceRef.isCurrentlyVisible && instanceRef.animationActive) instanceRef.createDropAtCursor(e, instanceRef.impactArea * 1.5, 0.14);
		});
		
		this.glTextures = []; // Array to hold WebGL textures
		this.glFramebuffers = []; // Array to hold WebGL framebuffers

		// Create two textures and framebuffers for ping-pong rendering
		for (var idx = 0; idx < 2; idx++) {
			var currentTexture = gfxCtx.createTexture();
			var currentFramebuffer = gfxCtx.createFramebuffer();
			
			gfxCtx.bindFramebuffer(gfxCtx.FRAMEBUFFER, currentFramebuffer);
			currentFramebuffer.width = this.detailLevel;
			currentFramebuffer.height = this.detailLevel;

			gfxCtx.bindTexture(gfxCtx.TEXTURE_2D, currentTexture);
			gfxCtx.texParameteri(gfxCtx.TEXTURE_2D, gfxCtx.TEXTURE_MIN_FILTER, gfxCtx.LINEAR);
			gfxCtx.texParameteri(gfxCtx.TEXTURE_2D, gfxCtx.TEXTURE_MAG_FILTER, gfxCtx.LINEAR);
			gfxCtx.texParameteri(gfxCtx.TEXTURE_2D, gfxCtx.TEXTURE_WRAP_S, gfxCtx.CLAMP_TO_EDGE); 
			gfxCtx.texParameteri(gfxCtx.TEXTURE_2D, gfxCtx.TEXTURE_WRAP_T, gfxCtx.CLAMP_TO_EDGE);
			gfxCtx.texImage2D(gfxCtx.TEXTURE_2D, 0, gfxCtx.RGBA, this.detailLevel, this.detailLevel, 0, gfxCtx.RGBA, gfxCtx.FLOAT, null);

			gfxCtx.framebufferTexture2D(gfxCtx.FRAMEBUFFER, gfxCtx.COLOR_ATTACHMENT0, gfxCtx.TEXTURE_2D, currentTexture, 0);
			// Verify framebuffer completeness
			if (gfxCtx.checkFramebufferStatus(gfxCtx.FRAMEBUFFER) !== gfxCtx.FRAMEBUFFER_COMPLETE) {
				throw new Error('Framebuffer incomplete: Cannot render to this texture.');
			}
			
			gfxCtx.bindTexture(gfxCtx.TEXTURE_2D, null); // Unbind texture
			gfxCtx.bindFramebuffer(gfxCtx.FRAMEBUFFER, null); // Unbind framebuffer
			
			this.glTextures.push(currentTexture);
			this.glFramebuffers.push(currentFramebuffer);
		}

		this.animationActive = true; // Start the ripple simulation

		// Initialize WebGL buffer for a full-screen quad
		this.vertexSquareBuffer = gfxCtx.createBuffer();
		gfxCtx.bindBuffer(gfxCtx.ARRAY_BUFFER, this.vertexSquareBuffer);
		gfxCtx.bufferData(gfxCtx.ARRAY_BUFFER, new Float32Array([
			-1, -1,
			+1, -1,
			+1, +1,
			-1, +1
		]), gfxCtx.STATIC_DRAW);
		
		this.setupGraphicsShaders(); // Compile and link all shader programs
		
		// Load the background image texture
		var sourcePicture = new Image;
		sourcePicture.crossOrigin = ''; // Enable cross-origin loading for images
		sourcePicture.onload = function() {
			gfxCtx = instanceRef.glRenderer; // Re-assign global context within callback
			
			/**
			 * Checks if a number is a power of two.
			 * @param {number} numValue - The number to check.
			 * @returns {boolean} True if power of two, false otherwise.
			 */
			function isBinaryPower(numValue) {
				return (numValue & (numValue - 1)) === 0;
			}
			
			// Determine texture wrapping mode based on power-of-two dimensions
			var textureWrapMode = (isBinaryPower(sourcePicture.width) && isBinaryPower(sourcePicture.height)) ? gfxCtx.REPEAT : gfxCtx.CLAMP_TO_EDGE;
			
			instanceRef.imgActualWidth = sourcePicture.width;
			instanceRef.imgActualHeight = sourcePicture.height;
			
			var bgTexture = gfxCtx.createTexture();
			
			gfxCtx.bindTexture(gfxCtx.TEXTURE_2D, bgTexture);
			gfxCtx.pixelStorei(gfxCtx.UNPACK_FLIP_Y_WEBGL, 1); // Flip Y-axis for image loading
			gfxCtx.texParameteri(gfxCtx.TEXTURE_2D, gfxCtx.TEXTURE_MAG_FILTER, gfxCtx.LINEAR);
			gfxCtx.texParameteri(gfxCtx.TEXTURE_2D, gfxCtx.TEXTURE_MIN_FILTER, gfxCtx.LINEAR);
			gfxCtx.texParameteri(gfxCtx.TEXTURE_2D, gfxCtx.TEXTURE_WRAP_S, textureWrapMode);
			gfxCtx.texParameteri(gfxCtx.TEXTURE_2D, gfxCtx.TEXTURE_WRAP_T, textureWrapMode);
			gfxCtx.texImage2D(gfxCtx.TEXTURE_2D, 0, gfxCtx.RGBA, gfxCtx.RGBA, gfxCtx.UNSIGNED_BYTE, sourcePicture);
			
			instanceRef.mainBackgroundTexture = bgTexture; // Store the background texture
			
			// Background image loaded, hide the CSS background
			instanceRef.$containerElement.css('background-image', 'none');
		};
		sourcePicture.src = bgImgSource; // Start loading the image
		
		this.isCurrentlyVisible = true; // Mark the effect as visible
		
		// Start the animation loop
		function animationFrameStep() {
			instanceRef.advanceAnimation();
			requestAnimationFrame(animationFrameStep);
		}
		
		requestAnimationFrame(animationFrameStep);
	};

	// Default configuration options for the ripple effect
	SurfaceDistortion.DEFAULT_CONFIG = {
		resolution: 256, // Resolution of the ripple simulation grid
		dropRadius: 20,  // Default radius of a simulated drop
		perturbance: 0.03 // Default visual displacement strength
	};
	
	// Prototype methods for the SurfaceDistortion class
	SurfaceDistortion.prototype = {

		/**
		 * Advances the ripple animation by one frame.
		 * Updates simulation and renders the output.
		 */
		advanceAnimation: function() {
			gfxCtx = this.glRenderer; // Ensure global context is set
			
			// Skip if not visible or background texture not loaded
			if (!this.isCurrentlyVisible || !this.mainBackgroundTexture) return;
			
			this.calculateTextureCoordinates(); // Recalculate background texture mapping

			if (this.animationActive) {
				this.updateWaveState(); // Update the ripple simulation state
			}

			this.performRendering(); // Render the final scene
		},
		
		/**
		 * Draws a full-screen quad using the current WebGL buffer.
		 */
		renderGeometryQuad: function() {
			gfxCtx.bindBuffer(gfxCtx.ARRAY_BUFFER, this.vertexSquareBuffer);
			gfxCtx.vertexAttribPointer(0, 2, gfxCtx.FLOAT, false, 0, 0); // Point attribute 0 to position data
			gfxCtx.drawArrays(gfxCtx.TRIANGLE_FAN, 0, 4); // Draw the quad
		},
		
		/**
		 * Renders the final ripple effect to the canvas.
		 */
		performRendering: function() {
			gfxCtx.viewport(0, 0, this.renderCanvas.width, this.renderCanvas.height); // Set viewport to canvas size
			gfxCtx.clear(gfxCtx.COLOR_BUFFER_BIT | gfxCtx.DEPTH_BUFFER_BIT); // Clear buffers

			gfxCtx.useProgram(this.displayProgram.id); // Use the final rendering shader
			
			activateTextureUnit(this.mainBackgroundTexture, 0); // Bind background image
			activateTextureUnit(this.glTextures[0], 1); // Bind ripple texture
			
			// Set uniforms for the rendering program
			gfxCtx.uniform2fv(this.displayProgram.locations.topLeft, this.displayProgram.uniforms.topLeft);
			gfxCtx.uniform2fv(this.displayProgram.locations.bottomRight, this.displayProgram.uniforms.bottomRight);
			gfxCtx.uniform2fv(this.displayProgram.locations.containerRatio, this.displayProgram.uniforms.containerRatio);
			gfxCtx.uniform1i(this.displayProgram.locations.samplerBackground, 0); // Set texture unit for background
			gfxCtx.uniform1i(this.displayProgram.locations.samplerRipples, 1); // Set texture unit for ripples
			
			this.renderGeometryQuad(); // Draw the quad to display the scene
		},

		/**
		 * Updates the ripple simulation state using ping-pong rendering.
		 */
		updateWaveState: function() {
			gfxCtx.viewport(0, 0, this.detailLevel, this.detailLevel); // Set viewport to simulation texture size
			
			// Perform two passes of the update shader
			for (var passIdx = 0; passIdx < 2; passIdx++) {
				gfxCtx.bindFramebuffer(gfxCtx.FRAMEBUFFER, this.glFramebuffers[passIdx]); // Bind target framebuffer
				activateTextureUnit(this.glTextures[1 - passIdx]); // Bind source texture (ping-pong)
				gfxCtx.useProgram(this.waveSimulationPrograms[passIdx].id); // Use the appropriate update shader
				
				this.renderGeometryQuad(); // Draw to update the texture
			}

			gfxCtx.bindFramebuffer(gfxCtx.FRAMEBUFFER, null); // Unbind framebuffer, render to screen next
		},
		
		/**
		 * Calculates and updates the background texture coordinates based on CSS properties.
		 */
		calculateTextureCoordinates: function() {
			var bgSize = this.$containerElement.css('background-size');
			var bgAttachment = this.$containerElement.css('background-attachment');
			var bgPosition = this.$containerElement.css('background-position').split(' ');

			// Determine the reference element for background positioning (window or container)
			var referenceElement = bgAttachment === 'fixed' ? $viewportElem : this.$containerElement;
			var viewportOffset = referenceElement.offset() || {left: pageXOffset, top: pageYOffset};
			var viewportWidth = referenceElement.innerWidth();
			var viewportHeight = referenceElement.innerHeight();

			// Calculate effective background width and height based on 'background-size'
			if (bgSize === 'cover') {
				var scalingFactor = Math.max(viewportWidth / this.imgActualWidth, viewportHeight / this.imgActualHeight);
				
				var computedBgWidth = this.imgActualWidth * scalingFactor;
				var computedBgHeight = this.imgActualHeight * scalingFactor;
			}
			else if (bgSize === 'contain') {
				var scalingFactor = Math.min(viewportWidth / this.imgActualWidth, viewportHeight / this.imgActualHeight);
				
				var computedBgWidth = this.imgActualWidth * scalingFactor;
				var computedBgHeight = this.imgActualHeight * scalingFactor;
			}
			else { // Custom or auto size
				bgSize = bgSize.split(' ');
				var computedBgWidth = bgSize[0] || '';
				var computedBgHeight = bgSize[1] || computedBgWidth;
				
				if (checkPercentSuffix(computedBgWidth)) computedBgWidth = viewportWidth * parseFloat(computedBgWidth) / 100;
				else if (computedBgWidth !== 'auto') computedBgWidth = parseFloat(computedBgWidth);
				
				if (checkPercentSuffix(computedBgHeight)) computedBgHeight = viewportHeight * parseFloat(computedBgHeight) / 100;
				else if (computedBgHeight !== 'auto') computedBgHeight = parseFloat(computedBgHeight);
				
				if (computedBgWidth === 'auto' && computedBgHeight === 'auto') {
					computedBgWidth = this.imgActualWidth;
					computedBgHeight = this.imgActualHeight;
				}
				else {
					if (computedBgWidth === 'auto') computedBgWidth = this.imgActualWidth * (computedBgHeight / this.imgActualHeight);
					if (computedBgHeight === 'auto') computedBgHeight = this.imgActualHeight * (computedBgWidth / this.imgActualWidth);
				}
			}
			
			// Compute background X and Y positions in page coordinates
			var bgPosX = bgPosition[0] || '';
			var bgPosY = bgPosition[1] || bgPosX;
			
			if (bgPosX === 'left') bgPosX = viewportOffset.left;
			else if (bgPosX === 'center') bgPosX = viewportOffset.left + viewportWidth / 2 - computedBgWidth / 2;
			else if (bgPosX === 'right') bgPosX = viewportOffset.left + viewportWidth - computedBgWidth;
			else if (checkPercentSuffix(bgPosX)) {
				bgPosX = viewportOffset.left + (viewportWidth - computedBgWidth) * parseFloat(bgPosX) / 100;
			}
			else {
				bgPosX = parseFloat(bgPosX);
			}
			
			if (bgPosY === 'top') bgPosY = viewportOffset.top;
			else if (bgPosY === 'center') bgPosY = viewportOffset.top + viewportHeight / 2 - computedBgHeight / 2;
			else if (bgPosY === 'bottom') bgPosY = viewportOffset.top + viewportHeight - computedBgHeight;
			else if (checkPercentSuffix(bgPosY)) {
				bgPosY = viewportOffset.top + (viewportHeight - computedBgHeight) * parseFloat(bgPosY) / 100;
			}
			else {
				bgPosY = parseFloat(bgPosY);
			}

			var containerOffset = this.$containerElement.offset();
			
			// Set uniform values for background texture mapping
			this.displayProgram.uniforms.topLeft = new Float32Array([
				(containerOffset.left - bgPosX) / computedBgWidth,
				(containerOffset.top - bgPosY) / computedBgHeight
			]);
			this.displayProgram.uniforms.bottomRight = new Float32Array([
				this.displayProgram.uniforms.topLeft[0] + this.$containerElement.innerWidth() / computedBgWidth,
				this.displayProgram.uniforms.topLeft[1] + this.$containerElement.innerHeight() / computedBgHeight
			]);
			
			var maxDimension = Math.max(this.renderCanvas.width, this.renderCanvas.height);
			
			this.displayProgram.uniforms.containerRatio = new Float32Array([
				this.renderCanvas.width / maxDimension,
				this.renderCanvas.height / maxDimension
			]);
		},
		
		/**
		 * Initializes all WebGL shader programs used for the ripple effect.
		 */
		setupGraphicsShaders: function() {
			var baseVertexShaderCode = [
				'attribute vec2 vertex;',
				'varying vec2 coord;',
				'void main() {',
					'coord = vertex * 0.5 + 0.5;', // Map vertex coordinates to [0,1] range
					'gl_Position = vec4(vertex, 0.0, 1.0);',
				'}'
			].join('\n');
			
			// Shader for creating a new ripple drop
			this.impactProgram = constructShaderProgram(baseVertexShaderCode, [
				'precision highp float;',
				
				'const float PI = 3.141592653589793;',
				'uniform sampler2D texture;',
				'uniform vec2 center;',
				'uniform float radius;',
				'uniform float strength;',
				
				'varying vec2 coord;',
				
				'void main() {',
					'vec4 info = texture2D(texture, coord);', // Get current ripple info
					
					'float dropEffect = max(0.0, 1.0 - length(center * 0.5 + 0.5 - coord) / radius);',
					'dropEffect = 0.5 - cos(dropEffect * PI) * 0.5;', // Smooth drop falloff
					
					'info.r += dropEffect * strength;', // Add drop strength to red channel (height)
					
					'gl_FragColor = info;',
				'}'
			].join('\n'));
			
			this.waveSimulationPrograms = [0,0]; // Array for two update shaders
			
			// First update shader: propagates wave and applies damping
			this.waveSimulationPrograms[0] = constructShaderProgram(baseVertexShaderCode, [
				'precision highp float;',
				
				'uniform sampler2D texture;',
				'uniform vec2 delta;', // Pixel step size
				
				'varying vec2 coord;',
				
				'void main() {',
					'vec4 info = texture2D(texture, coord);',
					
					'vec2 dxOffset = vec2(delta.x, 0.0);',
					'vec2 dyOffset = vec2(0.0, delta.y);',
					
					// Calculate average height of neighbors
					'float averageHeight = (',
						'texture2D(texture, coord - dxOffset).r +',
						'texture2D(texture, coord - dyOffset).r +',
						'texture2D(texture, coord + dxOffset).r +',
						'texture2D(texture, coord + dyOffset).r',
					') * 0.25;',
					
					'info.g += (averageHeight - info.r) * 2.0;', // Update velocity (green channel)
					'info.g *= 0.995;', // Apply damping
					'info.r += info.g;', // Update height (red channel) based on velocity
					
					'gl_FragColor = info;',
				'}'
			].join('\n'));
			gfxCtx.uniform2fv(this.waveSimulationPrograms[0].locations.delta, this.coordIncrement);
			
			// Second update shader: computes normals for visual distortion
			this.waveSimulationPrograms[1] = constructShaderProgram(baseVertexShaderCode, [
				'precision highp float;',
				
				'uniform sampler2D texture;',
				'uniform vec2 delta;', // Pixel step size
				
				'varying vec2 coord;',
				
				'void main() {',
					'vec4 info = texture2D(texture, coord);',
					
					// Calculate height differences for normal vector components
					'vec3 dxVector = vec3(delta.x, texture2D(texture, vec2(coord.x + delta.x, coord.y)).r - info.r, 0.0);',
					'vec3 dyVector = vec3(0.0, texture2D(texture, vec2(coord.x, coord.y + delta.y)).r - info.r, delta.y);',
					'info.ba = normalize(cross(dyVector, dxVector)).xz;', // Store normal's xz components in blue/alpha
					
					'gl_FragColor = info;',
				'}'
			].join('\n'));
			gfxCtx.uniform2fv(this.waveSimulationPrograms[1].locations.delta, this.coordIncrement);
			
			// Final rendering shader: combines background, ripples, and specular highlights
			this.displayProgram = constructShaderProgram([
				'precision highp float;',
				
				'attribute vec2 vertex;',
				'uniform vec2 topLeft;', // Top-left UV for background image
				'uniform vec2 bottomRight;', // Bottom-right UV for background image
				'uniform vec2 containerRatio;', // Aspect ratio of the container
				'varying vec2 ripplesCoord;',
				'varying vec2 backgroundCoord;',
				'void main() {',
					// Map vertex to background UVs
					'backgroundCoord = mix(topLeft, bottomRight, vertex * 0.5 + 0.5);',
					'backgroundCoord.y = 1.0 - backgroundCoord.y;', // Flip Y for background
					// Map vertex to ripple texture UVs, adjusting for aspect ratio
					'ripplesCoord = vec2(vertex.x, -vertex.y) * containerRatio * 0.5 + 0.5;',
					'gl_Position = vec4(vertex.x, -vertex.y, 0.0, 1.0);', // Output vertex position
				'}'
			].join('\n'), [
				'precision highp float;',
				
				'uniform sampler2D samplerBackground;',
				'uniform sampler2D samplerRipples;',
				'uniform float perturbance;',
				'varying vec2 ripplesCoord;',
				'varying vec2 backgroundCoord;',
				
				'void main() {',
					'vec2 normalOffset = -texture2D(samplerRipples, ripplesCoord).ba;', // Get normal from ripple texture
					// Calculate specular highlight based on normal and light direction
					'float specularHighlight = pow(max(0.0, dot(normalOffset, normalize(vec2(-0.6, 1.0)))), 4.0);',
					// Sample background with perturbed UVs and add specular
					'gl_FragColor = texture2D(samplerBackground, backgroundCoord + normalOffset * perturbance) + specularHighlight;',
				'}'
			].join('\n'));
			gfxCtx.uniform1f(this.displayProgram.locations.perturbance, this.rippleMagnitude); // Set perturbance uniform
		},
		
		/**
		 * Initiates a ripple effect at the mouse cursor's position.
		 * @param {MouseEvent} eventObj - The mouse event object.
		 * @param {number} impactSize - The radius of the ripple.
		 * @param {number} impactForce - The strength of the ripple.
		 */
		createDropAtCursor: function(eventObj, impactSize, impactForce) {
			this.applyWaveEffect(
				eventObj.pageX - this.$containerElement.offset().left,
				eventObj.pageY - this.$containerElement.offset().top,
				impactSize, 
				impactForce
			);
		},
		
		/**
		 * Applies a ripple effect at a specific coordinate within the element.
		 * @param {number} coordX - X-coordinate relative to the element.
		 * @param {number} coordY - Y-coordinate relative to the element.
		 * @param {number} effectRadius - The radius of the ripple.
		 * @param {number} effectStrength - The strength of the ripple.
		 */
		applyWaveEffect: function(coordX, coordY, effectRadius, effectStrength) {
			var instanceRef = this; // Self-reference for clarity

			gfxCtx = this.glRenderer; // Ensure global context is set

			var elementCurrentWidth = this.$containerElement.outerWidth();
			var elementCurrentHeight = this.$containerElement.outerHeight();
			var maxSideLength = Math.max(elementCurrentWidth, elementCurrentHeight);
			
			effectRadius = effectRadius / maxSideLength; // Normalize radius
			
			// Calculate drop position in normalized device coordinates
			var impactCoordinates = new Float32Array([
				(2 * coordX - elementCurrentWidth) / maxSideLength, 
				(elementCurrentHeight - 2 * coordY) / maxSideLength
			]);
		}

	};

}(jQuery);