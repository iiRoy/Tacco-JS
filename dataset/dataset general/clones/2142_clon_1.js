/*
 * jQuery Ripples plugin v0.2.0
 * Project URI: http://github.com/sirxemic/jquery.ripples
 * License: MIT License (https://opensource.org/licenses/MIT)
 * @author sirxemic / http://sirxemic.com/
 * This is a Type I clone, focusing on extensive whitespace and comment variations.
 */

+ function ( $ ) {

	// Declare a global WebGL rendering context variable.
	var gl;

	// Cache the jQuery-wrapped window object for efficiency, as it's a singleton.
	var $window = $( window );
	
	/**
	 * Checks if a given string represents a percentage value.
	 * @param {string} str The string to check.
	 * @returns {boolean} True if the string ends with '%', false otherwise.
	 */
	function isPercentage ( str ) {
		// Access the last character of the string to determine if it's a percentage.
		return str[ str.length - 1 ] == '%';
	}
	
	/*
	 * Function to determine WebGL support and required extensions.
	 * Creates a temporary canvas and tries to get WebGL context.
	 */
	function hasWebGLSupport ( ) {
		var canvas = document.createElement( 'canvas' ); // Create a new canvas element.
		var context = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ); // Attempt to get context.
		// Check for context existence and required float texture extensions.
		var result = context && context.getExtension( 'OES_texture_float' ) && context.getExtension( 'OES_texture_float_linear' );
		return result; // Return the boolean result.
	}
	
	// Pre-calculate WebGL support status once.
	var supportsWebGL = hasWebGLSupport();

	// Function to create, compile, and link a WebGL shader program.
	function createProgram ( vertexSource, fragmentSource, uniformValues )
	{
		// Inner helper function to compile a single shader.
		function compileSource ( type, source ) {
			var shader = gl.createShader( type ); // Create shader object.
			gl.shaderSource( shader, source ); // Set shader source.
			gl.compileShader( shader ); // Compile the shader.
			// Error checking for shader compilation.
			if ( ! gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
				throw new Error( 'compile error: ' + gl.getShaderInfoLog( shader ) );
			}
			return shader; // Return compiled shader.
		}
		
		var program = {}; // Object to hold program details.
		
		program.id = gl.createProgram(); // Create the main program.
		gl.attachShader( program.id, compileSource( gl.VERTEX_SHADER, vertexSource ) ); // Attach vertex shader.
		gl.attachShader( program.id, compileSource( gl.FRAGMENT_SHADER, fragmentSource ) ); // Attach fragment shader.
		gl.linkProgram( program.id ); // Link the program.
		// Error checking for program linking.
		if ( ! gl.getProgramParameter( program.id, gl.LINK_STATUS ) ) {
			throw new Error( 'link error: ' + gl.getProgramInfoLog( program.id ) );
		}

		// Discover and store uniform and attribute locations.
		program.uniforms = {}; // Placeholder for uniform values.
		program.locations = {}; // Map uniform names to their GL locations.
		gl.useProgram( program.id ); // Activate this program to query locations.
		gl.enableVertexAttribArray( 0 ); // Enable the first vertex attribute.

		var name, type, match; // Variables for regex matching.
		var regex = /uniform (\w+) (\w+)/g; // Regular expression to find uniform declarations.
		var shaderCode = vertexSource + fragmentSource; // Combine sources to find all uniforms.

		// Loop through all matches to extract uniform names and get their locations.
		while ( ( match = regex.exec( shaderCode ) ) != null ) {
			name = match[ 2 ]; // The uniform name is the second capturing group.
			program.locations[ name ] = gl.getUniformLocation( program.id, name ); // Store location.
		}
		
		return program; // Return the constructed program object.
	}
	
	// Binds a WebGL texture to a specified texture unit.
	function bindTexture ( texture, unit ) {
		gl.activeTexture( gl.TEXTURE0 + ( unit || 0 ) ); // Activate the texture unit.
		gl.bindTexture( gl.TEXTURE_2D, texture ); // Bind the texture.
	}
	
	// Inject essential CSS styles into the document head for ripple elements.
	$( 'head' ).prepend( '<style>.jquery-ripples { position: relative; z-index: 0; }</style>' );

	// RIPPLES CLASS DEFINITION
	// ==============================================================================================

	/**
	 * The main Ripples class constructor.
	 * @param {HTMLElement} el The DOM element to apply ripples to.
	 * @param {Object} options Configuration options for the ripples.
	 */
	var Ripples = function ( el, options ) {
		var that = this; // Store reference to 'this' for use in nested functions.
		
		this.$el = $(el); // Wrap the target element with jQuery.
		this.$el.addClass('jquery-ripples'); // Add the necessary class for styling.
		
		// Attempt to extract the background image URL from the element's CSS.
		var backgroundUrl = (/url\(["']?([^"']*)["']?\)/.exec(this.$el.css('background-image')));
		// If no background image is found, the effect cannot be applied.
		if ( backgroundUrl == null ) {
			return; // Exit the constructor early.
		}
		backgroundUrl = backgroundUrl[1]; // Get the actual URL string.
		
		// Initialize ripple properties from the provided options or defaults.
		this.resolution = options.resolution || 256; // Defines the resolution of the ripple simulation grid.
		// Pre-calculate the delta for texture coordinates, used in shaders.
		this.textureDelta = new Float32Array([1 / this.resolution, 1 / this.resolution]);
		
		this.perturbance = options.perturbance; // The maximum displacement strength of the ripples.
		this.dropRadius = options.dropRadius; // The default radius for a ripple drop.
		
		// Create a new canvas element for WebGL rendering.
		var canvas = document.createElement('canvas');
		canvas.width = this.$el.innerWidth(); // Set initial canvas width to match element.
		canvas.height = this.$el.innerHeight(); // Set initial canvas height to match element.
		this.canvas = canvas; // Store the raw canvas element.
		this.$canvas = $(canvas); // Store the jQuery-wrapped canvas element.
		
		// Apply inline styles to position the canvas absolutely behind the target element.
		this.$canvas.css({
			position: 'absolute', // Absolute positioning within its parent.
			left: 0,              // Align to the left edge.
			top: 0,               // Align to the top edge.
			right: 0,             // Extend to the right edge.
			bottom: 0,            // Extend to the bottom edge.
			zIndex: -1            // Place behind the content of the target element.
		});
		
		this.$el.append(canvas); // Append the canvas to the target element.
		// Get the WebGL rendering context from the canvas. Assign to both 'this.context' and global 'gl'.
		this.context = gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
		
		// Request and enable necessary WebGL extensions for float textures.
		gl.getExtension('OES_texture_float');
		gl.getExtension('OES_texture_float_linear');
		
		// Set up event listeners for dynamic behavior.
		$(window).on('resize', function() {
			// Check if the element's dimensions have changed.
			if (that.$el.innerWidth() != that.canvas.width || that.$el.innerHeight() != that.canvas.height) {
				// Update canvas dimensions to match the element.
				canvas.width = that.$el.innerWidth();
				canvas.height = that.$el.innerHeight();
			}
		});

		// Attach mouse events to the target element for ripple interaction.
		this.$el.on('mousemove.ripples', function(e) {
			// Only trigger ripples if the effect is visible and running.
			if (that.visible && that.running) {
				that.dropAtMouse(e, that.dropRadius, 0.01); // Small, continuous ripples on mouse move.
			}
		}).on('mousedown.ripples', function(e) {
			// Trigger a larger, stronger ripple on mouse click.
			if (that.visible && that.running) {
				that.dropAtMouse(e, that.dropRadius * 1.5, 0.14); // Larger radius and strength for clicks.
			}
		});
		
		this.textures = []; // Array to store the two ripple textures for ping-pong rendering.
		this.framebuffers = []; // Array to store the two framebuffers.

		// Initialize two textures and their corresponding framebuffers.
		for ( var i = 0; i < 2; i++ ) {
			var texture = gl.createTexture(); // Create a new WebGL texture.
			var framebuffer = gl.createFramebuffer(); // Create a new WebGL framebuffer.
			
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); // Bind the framebuffer for configuration.
			framebuffer.width = this.resolution; // Set the framebuffer's logical width.
			framebuffer.height = this.resolution; // Set the framebuffer's logical height.

			gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture for configuration.
			// Set texture parameters for filtering (linear) and wrapping (clamp to edge).
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			// Allocate storage for a float texture (RGBA, float type, null data initially).
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.resolution, this.resolution, 0, gl.RGBA, gl.FLOAT, null);

			// Attach the texture to the framebuffer's color attachment point.
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
			// Check for framebuffer completeness, which is crucial for rendering to textures.
			if ( gl.checkFramebufferStatus( gl.FRAMEBUFFER ) != gl.FRAMEBUFFER_COMPLETE ) {
				throw new Error('Rendering to this texture is not supported (incomplete framebuffer)');
			}
			
			gl.bindTexture(gl.TEXTURE_2D, null); // Unbind the texture to avoid accidental modifications.
			gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Unbind the framebuffer.
			
			this.textures.push(texture); // Add the created texture to the array.
			this.framebuffers.push(framebuffer); // Add the created framebuffer to the array.
		}

		this.running = true; // Set the ripple animation state to 'running'.

		// Initialize a buffer for drawing a full-screen quad.
		this.quad = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quad); // Bind the buffer as the current ARRAY_BUFFER.
		// Populate the buffer with vertex data for a quad (-1 to +1 in X and Y).
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1, -1, // Bottom-left corner.
			+1, -1, // Bottom-right corner.
			+1, +1, // Top-right corner.
			-1, +1  // Top-left corner.
		]), gl.STATIC_DRAW); // Indicate that the data will not change frequently.
		
		this.initShaders(); // Compile and link all necessary GLSL shader programs.
		
		// Create and load the background image texture.
		var image = new Image; // Instantiate a new Image object.
		image.crossOrigin = ''; // Enable cross-origin loading for images from other domains.

		// Define the callback function to execute once the image has loaded.
		image.onload = function() {
			gl = that.context; // Re-assign the global 'gl' context, important for async operations.
			
			// Helper function to check if a number is a power of two.
			function isPowerOfTwo(x) {
				return (x & (x - 1)) == 0;
			}
			
			// Determine the texture wrapping mode based on whether dimensions are powers of two.
			var wrapping = (isPowerOfTwo(image.width) && isPowerOfTwo(image.height)) ? gl.REPEAT : gl.CLAMP_TO_EDGE;
			
			that.backgroundWidth = image.width; // Store the original width of the background image.
			that.backgroundHeight = image.height; // Store the original height of the background image.
			
			var texture = gl.createTexture(); // Create a new texture object for the background.
			
			gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the background texture.
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the Y-axis during texture upload.
			// Set texture parameters for linear filtering and appropriate wrapping.
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapping);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapping);
			// Upload the image data to the texture.
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			
			that.backgroundTexture = texture; // Store the created background texture.
			
			// Hide the original CSS background image to prevent visual conflicts.
			that.$el.css('backgroundImage', 'none');
		};
		image.src = backgroundUrl; // Set the image source, initiating the download.
		
		this.visible = true; // Set the visibility flag to true.
		
		// Start the animation loop using requestAnimationFrame.
		function step() {
			that.step(); // Execute a single animation step.
			requestAnimationFrame(step); // Request the next frame.
		}
		
		requestAnimationFrame(step); // Initiate the first animation frame.
	};

	// Default configuration options for the Ripples plugin.
	Ripples.DEFAULTS = {
		resolution: 256,   // Default resolution of the ripple simulation grid.
		dropRadius: 20,    // Default radius of a ripple drop in pixels.
		perturbance: 0.03  // Default strength of the displacement effect.
	};
	
	// Define methods for the Ripples prototype.
	Ripples.prototype = {

		// Executes one full animation step: updates the simulation and renders.
		step: function() {
			gl = this.context; // Ensure the global GL context points to this instance's context.
			
			// Skip step if the ripples are not visible or the background texture hasn't loaded yet.
			if ( ! this.visible || ! this.backgroundTexture ) {
				return;
			}
			
			this.computeTextureBoundaries(); // Re-calculate background image mapping coordinates.

			if ( this.running ) {
				this.update(); // If animation is active, perform the ripple simulation update.
			}

			this.render(); // Render the final scene with the updated ripples.
		},
		
		// Helper method to draw a full-screen quad.
		drawQuad: function() {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.quad); // Bind the vertex buffer containing the quad data.
			gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); // Configure the vertex attribute pointer.
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // Draw the quad using a triangle fan primitive.
		},
		
		// Renders the background image with the ripple effect applied.
		render: function() {
			gl.viewport(0, 0, this.canvas.width, this.canvas.height); // Set the viewport to the canvas dimensions.
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear both color and depth buffers.

			gl.useProgram(this.renderProgram.id); // Activate the shader program for final rendering.
			
			bindTexture(this.backgroundTexture, 0); // Bind the background image to texture unit 0.
			bindTexture(this.textures[0], 1); // Bind the current ripple state texture to unit 1.
			
			// Pass uniform values to the render shader for background mapping and ripple sampling.
			gl.uniform2fv(this.renderProgram.locations.topLeft, this.renderProgram.uniforms.topLeft);
			gl.uniform2fv(this.renderProgram.locations.bottomRight, this.renderProgram.uniforms.bottomRight);
			gl.uniform2fv(this.renderProgram.locations.containerRatio, this.renderProgram.uniforms.containerRatio);
			gl.uniform1i(this.renderProgram.locations.samplerBackground, 0); // Tell shader samplerBackground is on unit 0.
			gl.uniform1i(this.renderProgram.locations.samplerRipples, 1); // Tell shader samplerRipples is on unit 1.
			
			this.drawQuad(); // Draw the quad to perform the rendering.
		},

		// Updates the ripple simulation state using ping-pong rendering technique.
		update: function() {
			gl.viewport(0, 0, this.resolution, this.resolution); // Set viewport to the ripple texture resolution.
			
			// Loop twice to update the ripple state, alternating between textures.
			for ( var i = 0; i < 2; i++ ) {
				gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[i]); // Bind the target framebuffer for this pass.
				bindTexture(this.textures[1-i]); // Bind the *other* texture as the input for this pass.
				gl.useProgram(this.updateProgram[i].id); // Use the appropriate update shader for the pass.
				
				this.drawQuad(); // Draw the quad to execute the shader and update the texture.
			}

			gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Unbind the framebuffer after the update cycle.
		},
		
		// Calculates and sets the texture coordinates for mapping the background image correctly.
		computeTextureBoundaries: function() {
			var backgroundSize = this.$el.css('background-size'); // Retrieve the 'background-size' CSS property.
			var backgroundAttachment = this.$el.css('background-attachment'); // Retrieve 'background-attachment'.
			var backgroundPosition = this.$el.css('background-position').split(' '); // Split 'background-position' into components.

			// Determine the reference element for background calculations (window for 'fixed', element for 'scroll').
			var parElement = backgroundAttachment == 'fixed' ? $window : this.$el;
			var winOffset = parElement.offset() || {left: pageXOffset, top: pageYOffset}; // Get offset of reference element.
			var winWidth = parElement.innerWidth(); // Get inner width.
			var winHeight = parElement.innerHeight(); // Get inner height.

			// Process 'background-size' property.
			if ( backgroundSize == 'cover' ) {
				// Calculate scale factor for 'cover' behavior.
				var scale = Math.max(winWidth / this.backgroundWidth, winHeight / this.backgroundHeight);
				
				var backgroundWidth = this.backgroundWidth * scale; // Scaled width.
				var backgroundHeight = this.backgroundHeight * scale; // Scaled height.
			}
			else if ( backgroundSize == 'contain' ) {
				// Calculate scale factor for 'contain' behavior.
				var scale = Math.min(winWidth / this.backgroundWidth, winHeight / this.backgroundHeight);
				
				var backgroundWidth = this.backgroundWidth * scale; // Scaled width.
				var backgroundHeight = this.backgroundHeight * scale; // Scaled height.
			}
			else {
				backgroundSize = backgroundSize.split(' '); // Split custom size values.
				var backgroundWidth = backgroundSize[0] || ''; // Get width part.
				var backgroundHeight = backgroundSize[1] || backgroundWidth; // Get height part, default to width.
				
				// Convert percentage values for width.
				if ( isPercentage(backgroundWidth) ) {
					backgroundWidth = winWidth * parseFloat(backgroundWidth) / 100;
				}
				// Convert explicit pixel values for width.
				else if ( backgroundWidth != 'auto' ) {
					backgroundWidth = parseFloat(backgroundWidth);
				}
				
				// Convert percentage values for height.
				if ( isPercentage(backgroundHeight) ) {
					backgroundHeight = winHeight * parseFloat(backgroundHeight) / 100;
				}
				// Convert explicit pixel values for height.
				else if ( backgroundHeight != 'auto' ) {
					backgroundHeight = parseFloat(backgroundHeight);
				}
				
				// Handle 'auto' dimensions, maintaining aspect ratio.
				if ( backgroundWidth == 'auto' && backgroundHeight == 'auto' ) {
					backgroundWidth = this.backgroundWidth; // Use original image width.
					backgroundHeight = this.backgroundHeight; // Use original image height.
				}
				else {
					if ( backgroundWidth == 'auto' ) {
						backgroundWidth = this.backgroundWidth * (backgroundHeight / this.backgroundHeight); // Calculate width from height.
					}
					if ( backgroundHeight == 'auto' ) {
						backgroundHeight = this.backgroundHeight * (backgroundWidth / this.backgroundWidth); // Calculate height from width.
					}
				}
			}
			
			// Compute backgroundX and backgroundY positions in page coordinates.
			var backgroundX = backgroundPosition[0] || ''; // Get X position part.
			var backgroundY = backgroundPosition[1] || backgroundX; // Get Y position part, default to X.
			
			// Convert X position keywords or percentages to pixel values.
			if ( backgroundX == 'left' ) {
				backgroundX = winOffset.left;
			}
			else if ( backgroundX == 'center' ) {
				backgroundX = winOffset.left + winWidth / 2 - backgroundWidth / 2;
			}
			else if ( backgroundX == 'right' ) {
				backgroundX = winOffset.left + winWidth - backgroundWidth;
			}
			else if ( isPercentage(backgroundX) ) {
				backgroundX = winOffset.left + (winWidth - backgroundWidth) * parseFloat(backgroundX) / 100;
			}
			else {
				backgroundX = parseFloat(backgroundX); // Parse as pixel value.
			}
			
			// Convert Y position keywords or percentages to pixel values.
			if ( backgroundY == 'top' ) {
				backgroundY = winOffset.top;
			}
			else if ( backgroundY == 'center' ) {
				backgroundY = winOffset.top + winHeight / 2 - backgroundHeight / 2;
			}
			else if ( backgroundY == 'bottom' ) {
				backgroundY = winOffset.top + winHeight - backgroundHeight;
			}
			else if ( isPercentage(backgroundY) ) {
				backgroundY = winOffset.top + (winHeight - backgroundHeight) * parseFloat(backgroundY) / 100;
			}
			else {
				backgroundY = parseFloat(backgroundY); // Parse as pixel value.
			}

			var elementOffset = this.$el.offset(); // Get the offset of the ripple element itself.
			
			// Calculate the top-left texture coordinate for the background mapping.
			this.renderProgram.uniforms.topLeft = new Float32Array([
				(elementOffset.left - backgroundX) / backgroundWidth,
				(elementOffset.top - backgroundY) / backgroundHeight
			]);
			// Calculate the bottom-right texture coordinate for the background mapping.
			this.renderProgram.uniforms.bottomRight = new Float32Array([
				this.renderProgram.uniforms.topLeft[0] + this.$el.innerWidth() / backgroundWidth,
				this.renderProgram.uniforms.topLeft[1] + this.$el.innerHeight() / backgroundHeight
			]);
			
			// Determine the aspect ratio of the container for ripple coordinate scaling.
			var maxSide = Math.max(this.canvas.width, this.canvas.height);
			
			this.renderProgram.uniforms.containerRatio = new Float32Array([
				this.canvas.width / maxSide,  // X ratio.
				this.canvas.height / maxSide  // Y ratio.
			]);
		},
		
		// Initializes and compiles all GLSL shader programs required for the ripple effect.
		initShaders: function() {
			// Vertex shader common to all rendering passes (draws a full-screen quad).
			var vertexShader = [
				'attribute vec2 vertex;',     // Input vertex position.
				'varying vec2 coord;',        // Output texture coordinate.
				'void main() {',
					'coord = vertex * 0.5 + 0.5;', // Map vertex from [-1,1] to [0,1] for texture lookup.
					'gl_Position = vec4(vertex, 0.0, 1.0);', // Final clip-space position.
				'}'
			].join('\n'); // Join array elements into a single string, separated by newlines.
			
			// Shader program for adding a new "drop" (perturbation) to the ripple texture.
			this.dropProgram = createProgram(vertexShader, [
				'precision highp float;', // Use high precision for floating-point calculations.
				
				'const float PI = 3.141592653589793;', // Define the mathematical constant PI.
				'uniform sampler2D texture;',         // Input texture containing current ripple state.
				'uniform vec2 center;',               // Center coordinates of the new drop.
				'uniform float radius;',              // Radius of the drop.
				'uniform float strength;',            // Strength (magnitude) of the drop.
				
				'varying vec2 coord;',                // Interpolated texture coordinate from vertex shader.
				
				'void main() {',
					'vec4 info = texture2D(texture, coord);', // Sample the current ripple information.
					
					// Calculate drop intensity based on distance from the center, normalized by radius.
					'float drop = max(0.0, 1.0 - length(center * 0.5 + 0.5 - coord) / radius);',
					'drop = 0.5 - cos(drop * PI) * 0.5;', // Apply a cosine curve for a smooth, bell-shaped drop.
					
					'info.r += drop * strength;', // Add the calculated drop to the red channel (representing height).
					
					'gl_FragColor = info;', // Output the modified ripple information.
				'}'
			].join('\n'));
			
			this.updateProgram = [0,0]; // Array to hold two update programs for ping-pong rendering.

			// First update program: propagates the ripple wave and applies damping.
			this.updateProgram[0] = createProgram(vertexShader, [
				'precision highp float;',
				
				'uniform sampler2D texture;', // Input texture (previous ripple state).
				'uniform vec2 delta;',        // Texture coordinate step size (1/resolution).
				
				'varying vec2 coord;',        // Interpolated texture coordinate.
				
				'void main() {',
					'vec4 info = texture2D(texture, coord);', // Get current pixel's ripple info.
					
					'vec2 dx = vec2(delta.x, 0.0);', // Delta for horizontal neighbor.
					'vec2 dy = vec2(0.0, delta.y);', // Delta for vertical neighbor.
					
					// Calculate the average height of the four direct neighbors.
					'float average = (',
						'texture2D(texture, coord - dx).r +', // Left neighbor.
						'texture2D(texture, coord - dy).r +', // Bottom neighbor.
						'texture2D(texture, coord + dx).r +', // Right neighbor.
						'texture2D(texture, coord + dy).r',   // Top neighbor.
					') * 0.25;', // Average them.
					
					'info.g += (average - info.r) * 2.0;', // Update velocity (green channel) based on height difference.
					'info.g *= 0.995;', // Apply slight damping to the velocity.
					'info.r += info.g;', // Update height (red channel) based on the new velocity.
					
					'gl_FragColor = info;', // Output the updated ripple state.
				'}'
			].join('\n'));
			gl.uniform2fv(this.updateProgram[0].locations.delta, this.textureDelta); // Set the delta uniform.
			
			// Second update program: calculates surface normals from the ripple height map.
			this.updateProgram[1] = createProgram(vertexShader, [
				'precision highp float;',
				
				'uniform sampler2D texture;', // Input texture (ripple height).
				'uniform vec2 delta;',        // Texture coordinate step size.
				
				'varying vec2 coord;',        // Interpolated texture coordinate.
				
				'void main() {',
					'vec4 info = texture2D(texture, coord);', // Get current pixel's ripple info.
					
					// Calculate tangent vectors (dx, dy) for normal computation.
					// The Y component of dx and X component of dy represent the height difference.
					'vec3 dx = vec3(delta.x, texture2D(texture, vec2(coord.x + delta.x, coord.y)).r - info.r, 0.0);',
					'vec3 dy = vec3(0.0, texture2D(texture, vec2(coord.x, coord.y + delta.y)).r - info.r, delta.y);',
					'info.ba = normalize(cross(dy, dx)).xz;', // Compute cross product to get normal, store XZ components in BA.
					
					'gl_FragColor = info;', // Output the updated ripple state, now with normal information.
				'}'
			].join('\n'));
			gl.uniform2fv(this.updateProgram[1].locations.delta, this.textureDelta); // Set the delta uniform.
			
			// Render program: combines the background image with the ripple displacement and specular highlights.
			this.renderProgram = createProgram([
				'precision highp float;',
				
				'attribute vec2 vertex;',      // Input vertex position.
				'uniform vec2 topLeft;',       // Top-left corner of the background image in texture coordinates.
				'uniform vec2 bottomRight;',    // Bottom-right corner of the background image in texture coordinates.
				'uniform vec2 containerRatio;', // Aspect ratio of the container for ripple texture mapping.
				'varying vec2 ripplesCoord;',   // Output texture coordinate for ripple lookup.
				'varying vec2 backgroundCoord;',// Output texture coordinate for background lookup.
				'void main() {',
					// Interpolate vertex position to get background texture coordinates.
					'backgroundCoord = mix(topLeft, bottomRight, vertex * 0.5 + 0.5);',
					'backgroundCoord.y = 1.0 - backgroundCoord.y;', // Flip Y-coordinate for standard image texture.
					// Calculate ripple texture coordinates, adjusting for container aspect ratio.
					'ripplesCoord = vec2(vertex.x, -vertex.y) * containerRatio * 0.5 + 0.5;',
					'gl_Position = vec4(vertex.x, -vertex.y, 0.0, 1.0);', // Final clip-space position (Y flipped).
				'}'
			].join('\n'), [
				'precision highp float;',
				
				'uniform sampler2D samplerBackground;', // Background image texture.
				'uniform sampler2D samplerRipples;',    // Ripple effect texture (contains normals).
				'uniform float perturbance;',           // Strength of the ripple displacement.
				'varying vec2 ripplesCoord;',           // Interpolated ripple texture coordinate.
				'varying vec2 backgroundCoord;',        // Interpolated background texture coordinate.
				
				'void main() {',
					'vec2 offset = -texture2D(samplerRipples, ripplesCoord).ba;', // Get normal (offset) from ripple texture.
					// Calculate a simple specular highlight based on the normal and a fixed light direction.
					'float specular = pow(max(0.0, dot(offset, normalize(vec2(-0.6, 1.0)))), 4.0);',
					// Sample the background texture, displacing it by the ripple offset, and add specular.
					'gl_FragColor = texture2D(samplerBackground, backgroundCoord + offset * perturbance) + specular;',
				'}'
			].join('\n'));
			gl.uniform1f(this.renderProgram.locations.perturbance, this.perturbance); // Set the perturbance uniform.
		},
		
		// Initiates a ripple drop at the mouse cursor's position relative to the element.
		dropAtMouse: function(e, radius, strength) {
			var that = this; // Capture 'this' context for consistency.

			gl = this.context; // Ensure the active GL context is the one for this ripple instance.

			var elWidth = this.$el.outerWidth(); // Get the outer width of the ripple element.
			var elHeight = this.$el.outerHeight(); // Get the outer height of the ripple element.
			var longestSide = Math.max(elWidth, elHeight); // Determine the longest dimension of the element.
			
			radius = radius / longestSide; // Normalize the drop radius relative to the element's longest side.
			
			// Calculate the drop position in normalized device coordinates, relative to the element.
			var dropPosition = new Float32Array([
				(2 * e.pageX - elWidth - 2 * this.$el.offset().left) / longestSide, // X-coordinate.
				(elHeight - 2 * e.pageY + 2 * this.$el.offset().top) / longestSide  // Y-coordinate (flipped for WebGL).
			]);
			// Call the core 'drop' method with adjusted coordinates and parameters.
			this.drop(
				e.pageX - this.$el.offset().left, // X-coordinate relative to the element's top-left.
				e.pageY - this.$el.offset().top,  // Y-coordinate relative to the element's top-left.
				radius,                           // Normalized radius.
				strength                          // Drop strength.
			);
		},
		
		// Adds a ripple drop at a specified (x, y) coordinate within the element.
		drop: function(x, y, radius, strength) {
			var that = this; // Store 'this' context.

			gl = this.context; // Ensure the correct WebGL context is active.

			var elWidth = this.$el.outerWidth(); // Get the outer width of the element.
			var elHeight = this.$el.outerHeight(); // Get the outer height of the element.
			var longestSide = Math.max(elWidth, elHeight); // Determine the longest dimension.
			
			radius = radius / longestSide; // Normalize the radius based on the longest side.
			
			var dropPosition = new Float32Array([
				(2 * x - elWidth) / longestSide,  // Calculate normalized X-coordinate.
				(elHeight - 2 * y) / longestSide  // Calculate normalized Y-coordinate (flipped).
			]);