/**
 * © 2024 ShadyGraphics Corporation. All rights reserved.
 *
 * This software is licensed under the terms of the ShadyGraphics Public License.
 * You may obtain a copy of the License at
 *
 *     https://www.shadygraphics.com/license
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global Promise */

/**
 * Facilitates the creation and management of a WebGL shader program,
 * encapsulating a vertex shader and a fragment shader.
 * Shader code can be provided at instantiation or updated later via
 * `setVtxCode` and `setFragCode`. A manual call to `assembleProgram`
 * is required to link the shaders after any updates.
 * If initial shader sources are supplied during construction, an immediate
 * attempt to compile and link the program is made.
 *
 * @param {!WebGLRenderingContext} webglContext The active WebGL rendering context.
 * @param {string=} vtxSrc Optional GLSL ES source for the vertex shader.
 * @param {string=} fragSrc Optional GLSL ES source for the fragment shader.
 * @constructor
 */
const ProgramAssembler = function(webglContext, vtxSrc, fragSrc) {
  // Validate the WebGL context upfront
  if (!webglContext || !(webglContext instanceof WebGLRenderingContext)) {
    throw new Error('Invalid WebGL context provided to ProgramAssembler constructor.');
  }

  /**
   * The WebGL rendering context for shader operations.
   * @private {!WebGLRenderingContext}
   */
  this.renderCtx_ = webglContext;

  /**
   * Mapping of active attribute names to their locations within this program.
   * This cache is updated upon successful program linking.
   * @type {!Object.<string, number>}
   */
  this.inputAttributes = {};

  /**
   * Object containing uniform setter functions, indexed by uniform name.
   * Each entry provides a convenient method to update uniform values and
   * includes the raw WebGLUniformLocation.
   * @type {Object.<function>}
   */
  this.paramSetters = {};

  /**
   * The underlying WebGLVertexShader object reference.
   * @private {!WebGLShader}
   */
  this.vtxShaderRef_ = webglContext.createShader(webglContext.VERTEX_SHADER);

  /**
   * Flag indicating successful compilation of the vertex shader.
   * @private {boolean}
   */
  this.vsReady_ = false;

  /**
   * The underlying WebGLFragmentShader object reference.
   * @private {!WebGLShader}
   */
  this.fragShaderRef_ = webglContext.createShader(webglContext.FRAGMENT_SHADER);

  /**
   * Flag indicating successful compilation of the fragment shader.
   * @private {boolean}
   */
  this.fsReady_ = false;

  /**
   * The raw WebGL program object handle.
   * @type {!WebGLProgram}
   */
  this.programHandle = webglContext.createProgram();

  /**
   * Flag indicating successful linking of the WebGL program.
   * @private {boolean}
   */
  this.isLinked_ = false;

  // Attach shaders to the program. They will be compiled and linked later.
  webglContext.attachShader(this.programHandle, this.vtxShaderRef_);
  webglContext.attachShader(this.programHandle, this.fragShaderRef_);

  // Attempt initial compilation and linking if sources are provided.
  const hasVtxSource = typeof vtxSrc === 'string' && vtxSrc.length > 0;
  const hasFragSource = typeof fragSrc === 'string' && fragSrc.length > 0;

  if (hasVtxSource) {
    this.setVtxCode(vtxSrc);
  }
  if (hasFragSource) {
    this.setFragCode(fragSrc);
  }

  // Only link if both shaders successfully compiled from provided sources.
  if (this.vsReady_ && this.fsReady_) {
    this.assembleProgram();
  }
};

/**
 * Internal map from WebGL uniform type constants to their corresponding
 * single-value WebGL setter function names.
 * @enum {string}
 * @private
 */
ProgramAssembler.UNIFORM_TYPE_TO_METHOD = {
  0x1406: 'uniform1f', /* FLOAT */
  0x8b50: 'uniform2f', /* FLOAT_VEC2 */
  0x8b51: 'uniform3f', /* FLOAT_VEC3 */
  0x8b52: 'uniform4f', /* FLOAT_VEC4 */
  0x1404: 'uniform1i', /* INT */
  0x8b53: 'uniform2i', /* INT_VEC2 */
  0x8b54: 'uniform3i', /* INT_VEC3 */
  0x8b55: 'uniform4i', /* INT_VEC4 */
  0x8b56: 'uniform1i', /* BOOL */ // Booleans are treated as integers
  0x8b57: 'uniform2i', /* BOOL_VEC2 */
  0x8b58: 'uniform3i', /* BOOL_VEC3 */
  0x8b59: 'uniform4i', /* BOOL_VEC4 */
  0x8b5e: 'uniform1i', /* SAMPLER_2D */
  0x8b60: 'uniform1i', /* SAMPLER_CUBE */
};

/**
 * Internal map from WebGL matrix uniform type constants to their specific
 * matrix setter function names. These always expect array-like input.
 * @enum {string}
 * @private
 */
ProgramAssembler.MATRIX_TYPE_TO_METHOD = {
  0x8b5a: 'uniformMatrix2fv', /* FLOAT_MAT2 */
  0x8b5b: 'uniformMatrix3fv', /* FLOAT_MAT3 */
  0x8b5c: 'uniformMatrix4fv', /* FLOAT_MAT4 */
};

/**
 * Asynchronously loads shader source code from remote URLs and constructs
 * a `ProgramAssembler` instance.
 * Returns a Promise that resolves with the compiled and linked program.
 *
 * @param {!WebGLRenderingContext} webglContext The WebGL context.
 * @param {string} vtxAssetUrl URL for the vertex shader source.
 * @param {string} fragAssetUrl URL for the fragment shader source.
 * @return {!Promise<ProgramAssembler>} A promise resolving to the ready program.
 */
ProgramAssembler.createFromRemoteSources = function(webglContext, vtxAssetUrl, fragAssetUrl) {
  if (!webglContext || !vtxAssetUrl || !fragAssetUrl) {
    return Promise.reject(new Error('Missing WebGL context or shader URLs for remote loading.'));
  }

  const newProgram = new ProgramAssembler(webglContext);

  const fetchVtx = ProgramAssembler._fetchTextAsset(vtxAssetUrl)
    .then(source => newProgram.setVtxCode(source));

  const fetchFrag = ProgramAssembler._fetchTextAsset(fragAssetUrl)
    .then(source => newProgram.setFragCode(source));

  return Promise.all([fetchVtx, fetchFrag])
    .then(() => {
      newProgram.assembleProgram();
      return newProgram;
    })
    .catch(error => {
      console.error('Failed to load or compile shaders from URLs:', error);
      throw new Error(`Shader loading failed: ${error.message || error}`);
    });
};

/**
 * Utility function to fetch a text resource via XMLHttpRequest.
 * Returns a Promise that resolves with the resource's text content.
 *
 * @param {string} resourcePath The URL of the resource to fetch.
 * @return {!Promise<string>} A promise resolving with the text content.
 * @private
 */
ProgramAssembler._fetchTextAsset = function(resourcePath) {
  return new Promise((resolve, reject) => {
    const xhrRequest = new XMLHttpRequest();
    xhrRequest.open('GET', resourcePath, true);
    xhrRequest.timeout = 5000; // 5 seconds timeout

    xhrRequest.onload = () => {
      if (xhrRequest.status >= 200 && xhrRequest.status < 300) {
        resolve(xhrRequest.responseText);
      } else {
        reject(new Error(`Failed to load resource '${resourcePath}'. Status: ${xhrRequest.status} ${xhrRequest.statusText}`));
      }
    };

    xhrRequest.onerror = () => {
      reject(new Error(`Network error encountered while fetching '${resourcePath}'.`));
    };

    xhrRequest.ontimeout = () => {
      reject(new Error(`Timeout fetching resource '${resourcePath}'.`));
    };

    xhrRequest.send();
  });
};

/**
 * Checks if the program has been successfully compiled and linked.
 * @return {boolean} True if the program is ready for use, false otherwise.
 */
ProgramAssembler.prototype.programIsReady = function() {
  return this.isLinked_;
};

/**
 * Internal method to compile a given shader unit from source code.
 *
 * @param {string} shaderSource The GLSL ES source code for the shader.
 * @param {!WebGLShader} shaderObject The WebGLShader object to compile.
 * @return {boolean} True if compilation was successful, false otherwise.
 * @private
 */
ProgramAssembler.prototype._compileShaderSource = function(shaderSource, shaderObject) {
  const gl = this.renderCtx_;

  if (!shaderSource || typeof shaderSource !== 'string' || shaderSource.length === 0) {
    console.warn('Attempted to compile empty or invalid shader source. Skipping compilation.');
    return false;
  }

  gl.shaderSource(shaderObject, shaderSource);
  gl.compileShader(shaderObject);

  const compilationStatus = gl.getShaderParameter(shaderObject, gl.COMPILE_STATUS);

  // Invalidate program linking status if any shader is recompiled.
  this.isLinked_ = false;

  if (!compilationStatus) {
    console.error('Shader compilation failed:', gl.getShaderInfoLog(shaderObject));
  }
  return compilationStatus;
};

/**
 * Updates the fragment shader's source code and attempts to compile it.
 * If compilation fails, an error is thrown with the compiler's log.
 *
 * @param {string} sourceCode The GLSL ES fragment shader source code.
 * @throws {Error} If fragment shader compilation fails.
 */
ProgramAssembler.prototype.setFragCode = function(sourceCode) {
  if (typeof sourceCode !== 'string') {
    throw new Error('Fragment shader source must be a string.');
  }
  this.fsReady_ = this._compileShaderSource(sourceCode, this.fragShaderRef_);

  if (!this.fsReady_) {
    throw new Error('Fragment shader compilation failed. Log: ' +
        this.fetchFragCompilerErrors());
  }
};

/**
 * Updates the vertex shader's source code and attempts to compile it.
 * If compilation fails, an error is thrown with the compiler's log.
 *
 * @param {string} sourceCode The GLSL ES vertex shader source code.
 * @throws {Error} If vertex shader compilation fails.
 */
ProgramAssembler.prototype.setVtxCode = function(sourceCode) {
  if (typeof sourceCode !== 'string') {
    throw new Error('Vertex shader source must be a string.');
  }
  this.vsReady_ = this._compileShaderSource(sourceCode, this.vtxShaderRef_);

  if (!this.vsReady_) {
    throw new Error('Vertex shader compilation failed. Log: ' +
        this.fetchVtxCompilerErrors());
  }
};

/**
 * Retrieves the information log for the current fragment shader.
 * @return {string} The fragment shader's info log.
 */
ProgramAssembler.prototype.fetchFragCompilerErrors = function() {
  return this.renderCtx_.getShaderInfoLog(this.fragShaderRef_);
};

/**
 * Retrieves the information log for this program object.
 * @return {string} The program's info log.
 */
ProgramAssembler.prototype.fetchProgramLinkerErrors = function() {
  return this.renderCtx_.getProgramInfoLog(this.programHandle);
};

/**
 * Retrieves the information log for the current vertex shader.
 * @return {string} The vertex shader's info log.
 */
ProgramAssembler.prototype.fetchVtxCompilerErrors = function() {
  return this.renderCtx_.getShaderInfoLog(this.vtxShaderRef_);
};

/**
 * Discovers and maps all active attribute locations in the linked program.
 * Previous attribute mappings are discarded.
 * @private
 */
ProgramAssembler.prototype._discoverAttributes = function() {
  const gl = this.renderCtx_;
  if (!this.programHandle) {
    console.warn('Attempted to discover attributes on a null program handle.');
    return;
  }

  const attributeCount = gl.getProgramParameter(
      this.programHandle, gl.ACTIVE_ATTRIBUTES);

  // Clear existing attributes before re-populating.
  this.inputAttributes = {};
  for (let i = 0; i < attributeCount; ++i) {
    const attribInfo = gl.getActiveAttrib(this.programHandle, i);
    if (!attribInfo) {
      console.warn(`Failed to retrieve active attribute info at index ${i}.`);
      continue;
    }
    const location = gl.getAttribLocation(this.programHandle, attribInfo.name);
    if (location === -1) {
      console.warn(`Attribute '${attribInfo.name}' found but its location is invalid (-1).`);
      continue;
    }
    this.inputAttributes[attribInfo.name] = location;
  }
};

/**
 * Generates a unified uniform setter function that can handle both scalar/vector
 * arguments and array/typed array inputs.
 *
 * @param {function(this:WebGLRenderingContext, ...[number])} scalarOrVecSetter The base WebGL setter (e.g., uniform1f, uniform3i).
 * @param {function(this:WebGLRenderingContext, (Array.<number>|ArrayBufferView))} arrayVecSetter The array-based WebGL setter (e.g., uniform1fv, uniform3iv).
 * @return {function(Array.<number>|ArrayBufferView|...[number])} A dispatch function for setting uniform values.
 * @private
 */
ProgramAssembler._createUniformDispatcher = function(scalarOrVecSetter, arrayVecSetter) {
  return function uniformDispatcher(...args) {
    // Check if the first argument is an array or a typed array.
    // ArrayBuffer.isView is not universally supported in older browsers,
    // but useful for modern WebGL contexts.
    const isArrayLike = Array.isArray(args[0]) || (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(args[0]));

    if (isArrayLike) {
      arrayVecSetter(args[0]);
    } else {
      scalarOrVecSetter.apply(null, args);
    }
  };
};


/**
 * Auto-generates and maps setter methods for all active uniforms in this program.
 * Any previously generated setters are discarded.
 * @private
 * @throws {Error} If an unknown uniform type is encountered.
 */
ProgramAssembler.prototype._discoverUniforms = function() {
  const gl = this.renderCtx_;
  this.paramSetters = {}; // Clear existing setters

  if (!this.programHandle) {
    console.warn('Attempted to discover uniforms on a null program handle.');
    return;
  }

  const uniformCount = gl.getProgramParameter(this.programHandle, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < uniformCount; ++i) {
    const uniformInfo = gl.getActiveUniform(this.programHandle, i);
    if (!uniformInfo) {
      console.warn(`Failed to retrieve active uniform info at index ${i}.`);
      continue;
    }

    const uniformName = uniformInfo.name;
    const uniformLocation = gl.getUniformLocation(this.programHandle, uniformName);

    // Skip uniforms that are optimized out or not found.
    if (uniformLocation === null) {
      // This can happen if a uniform is declared but not used in the shader,
      // leading to its optimization by the GLSL compiler.
      console.debug(`Uniform '${uniformName}' was optimized out or not found. Skipping.`);
      continue;
    }

    const typeCode = uniformInfo.type;

    // Handle standard float, vector, integer, boolean, and sampler uniforms.
    if (ProgramAssembler.UNIFORM_TYPE_TO_METHOD[typeCode]) {
      const baseSetterName = ProgramAssembler.UNIFORM_TYPE_TO_METHOD[typeCode];
      const singleValueSetter = gl[baseSetterName].bind(gl, uniformLocation);
      const arrayValueSetter = gl[`${baseSetterName}v`].bind(gl, uniformLocation);

      // Create a smart dispatcher that handles both single value and array inputs.
      const dispatcher = ProgramAssembler._createUniformDispatcher(singleValueSetter, arrayValueSetter);

      // Attach direct access to specific setters and the raw location for flexibility.
      dispatcher.setSingle = singleValueSetter;
      dispatcher.setArray = arrayValueSetter;
      dispatcher.location = uniformLocation;
      this.paramSetters[uniformName] = dispatcher;

    // Handle matrix uniforms, which only accept array-like inputs.
    } else if (ProgramAssembler.MATRIX_TYPE_TO_METHOD[typeCode]) {
      const matrixSetterName = ProgramAssembler.MATRIX_TYPE_TO_METHOD[typeCode];
      // Matrix setters usually take a 'transpose' boolean argument.
      const matrixSetter = gl[matrixSetterName].bind(gl, uniformLocation, false); // No transpose by default

      // For matrices, the primary setter is the array-based one.
      matrixSetter.location = uniformLocation;
      this.paramSetters[uniformName] = matrixSetter;

    } else {
      // If a uniform type is not recognized, it indicates an issue or a new WebGL extension.
      throw new Error(`Uniform '${uniformName}' has an unhandled type (0x${typeCode.toString(16)}).`);
    }
  }
};

/**
 * Attempts to link the currently attached vertex and fragment shaders.
 * Throws an error if either shader is not compiled, or if linking fails.
 * On success, it populates attribute locations and uniform setters.
 *
 * @throws {Error} If shader compilation is incomplete or program linking fails.
 */
ProgramAssembler.prototype.assembleProgram = function() {
  if (!this.vsReady_) {
    throw new Error('Vertex shader is not compiled. Please call setVtxCode() first.');
  }
  if (!this.fsReady_) {
    throw new Error('Fragment shader is not compiled. Please call setFragCode() first.');
  }

  const gl = this.renderCtx_;
  gl.linkProgram(this.programHandle);

  this.isLinked_ = gl.getProgramParameter(this.programHandle, gl.LINK_STATUS);

  if (!this.isLinked_) {
    const linkLog = this.fetchProgramLinkerErrors();
    console.error('WebGL Program linking failed:', linkLog);
    throw new Error('Program failed to link. Log: ' + linkLog);
  } else {
    // If linking is successful, re-enumerate attributes and uniforms.
    this._discoverAttributes();
    this._discoverUniforms();
    console.info('ProgramAssembler: WebGL program linked successfully.');
  }
};

/**
 * Activates this shader program for rendering.
 * It does not perform any checks on program readiness; ensure `programIsReady()`
 * is true before calling this in production code.
 */
ProgramAssembler.prototype.activate = function() {
  this.renderCtx_.useProgram(this.programHandle);
};

/**
 * Validates the current program object against the current WebGL state.
 * This is primarily for debugging and can be performance-intensive.
 * The validation log can be retrieved via `fetchProgramLinkerErrors()`.
 *
 * @return {boolean} True if the program is valid for the current state, false otherwise.
 * @see https://www.khronos.org/opengles/sdk/2.0/docs/man/glValidateProgram.xml
 */
ProgramAssembler.prototype.verifyProgramValidity = function() {
  this.renderCtx_.validateProgram(this.programHandle);
  return this.renderCtx_.getProgramParameter(this.programHandle, this.renderCtx_.VALIDATE_STATUS);
};