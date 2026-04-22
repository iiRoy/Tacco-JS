/*
 * Copyright (C) 2023 Acme Corp. All Rights Reserved.
 *
 * Licensed under the Acme License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.acme.com/licenses/LICENSE-1.1
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global Promise */

/**
 * Builds a WebGL rendering pipeline, comprising a vertex stage and a fragment stage.
 * Source code for these stages can be supplied or updated at any point using
 * updateVertexSource or updateFragmentSource. Following such updates, the stages
 * must be explicitly re-connected for the GraphicsAssembler to use the new logic.
 * If initial source for both stages is given during construction,
 * the compilation and connection process is initiated immediately.
 * @param {!WebGLRenderingContext} gfxCtx The graphic rendering context.
 * @param {string=} initialVertCode The GLSL ES source for the vertex stage.
 * @param {string=} initialFragCode The GLSL ES source for the fragment stage.
 * @constructor
 */
var GraphicsAssembler = function(gfxCtx, initialVertCode, initialFragCode) {
  // CONSIDER: Implement direct setting methods for global values. This could enable
  // graceful failures for non-existent settings, or strict failures via Object.seal.

  /**
   * The underlying WebGL rendering context.
   * @private {!WebGLRenderingContext}
   */
  this._gfxCtx = gfxCtx;

  /**
   * A mapping of active vertex input locations within this program.
   * These locations are indexed by their respective names.
   * It's recommended to use these cached values rather than re-querying,
   * unless the program's stages are re-connected and inputs might shift.
   * @type {!Object.<string, number>}
   */
  this.vertexInputs = {};

  /**
   * A collection of global value locations and their associated update functions,
   * organized by the global value's name. The raw WebGLUniformLocation is found at
   * currentAssembler.globalSettings.settingName.location, while
   * currentAssembler.globalSettings.settingName itself acts as a function
   * for assigning scalar, vector, or matrix data as required.
   *
   * TODO(dev): Define a clear interface for these objects to improve documentation.
   * @type {Object.<function>}
   */
  this.globalSettings = {};

  /**
   * The internal vertex shader handler.
   * @private {!WebGLShader}
   */
  this._vertProcessor = gfxCtx.createShader(gfxCtx.VERTEX_SHADER);

  /**
   * Indicates if the vertex shader has undergone a successful compilation.
   * @private {boolean}
   */
  this._vertReady = false;

  /**
   * The internal fragment shader handler.
   * @private {!WebGLShader}
   */
  this._fragProcessor = gfxCtx.createShader(gfxCtx.FRAGMENT_SHADER);

  /**
   * Indicates if the fragment shader has undergone a successful compilation.
   * @private {boolean}
   */
  this._fragReady = false;

  /**
   * The underlying WebGL executable program.
   * @type {!WebGLProgram}
   */
  this.execProgram = gfxCtx.createProgram();

  /**
   * Denotes whether the program has been successfully connected.
   * @private {boolean}
   */
  this._execReady = false;

  gfxCtx.attachShader(this.execProgram, this._vertProcessor);
  gfxCtx.attachShader(this.execProgram, this._fragProcessor);

  // Should source code be supplied, compile immediately and attempt connection.
  if (initialVertCode) {
    this.updateVertexSource(initialVertCode);
  }
  if (initialFragCode) {
    this.updateFragmentSource(initialFragCode);
  }
  if (this._vertReady && this._fragReady) {
    this.connect();
  }
};

/**
 * Maps global variable types (from OpenGL/WebGL specification) to their
 * corresponding basic setter function names.
 * @enum {string}
 * @private
 */
GraphicsAssembler.SETTING_MAP_BASE = {
  0x1406: 'uniform1f',      // FLOATING_POINT
  0x8b50: 'uniform2f',      // FLOAT_VECTOR_2
  0x8b51: 'uniform3f',      // FLOAT_VECTOR_3
  0x8b52: 'uniform4f',      // FLOAT_VECTOR_4
  0x1404: 'uniform1i',      // INTEGER
  0x8b53: 'uniform2i',      // INT_VECTOR_2
  0x8b54: 'uniform3i',      // INT_VECTOR_3
  0x8b55: 'uniform4i',      // INT_VECTOR_4
  0x8b56: 'uniform1i',      // BOOLEAN
  0x8b57: 'uniform2i',      // BOOL_VECTOR_2
  0x8b58: 'uniform3i',      // BOOL_VECTOR_3
  0x8b59: 'uniform4i',      // BOOL_VECTOR_4
  0x8b5e: 'uniform1i',      // TEXTURE_SAMPLER_2D
  0x8b60: 'uniform1i'       // TEXTURE_SAMPLER_CUBE
};

/**
 * Maps matrix-specific global variable types to their respective setter function names.
 * Matrix inputs are distinct as they typically only accept array-based 'v' suffix setters.
 * Keys are derived from the OpenGL/WebGL specifications.
 * @enum {string}
 * @private
 */
GraphicsAssembler.SETTING_MAP_MATRIX = {
  0x8b5a: 'uniformMatrix2fv', // FLOAT_MATRIX_2
  0x8b5b: 'uniformMatrix3fv', // FLOAT_MATRIX_3
  0x8b5c: 'uniformMatrix4fv'  // FLOAT_MATRIX_4
};

/**
 * Constructs a GraphicsAssembler by fetching shader sources from remote URLs.
 * This method yields a Promise that resolves with the fully compiled and
 * connected GraphicsAssembler instance.
 * @param {!WebGLRenderingContext} gfxCtx The graphic rendering context.
 * @param {string} vertPath Remote path for the vertex stage source.
 * @param {string} fragPath Remote path for the fragment stage source.
 * @return {!Promise<GraphicsAssembler>} A promise that resolves with the ready assembler.
 */
GraphicsAssembler.buildFromRemote = function(gfxCtx, vertPath, fragPath) {
  var pipeline = new GraphicsAssembler(gfxCtx);

  return Promise.all([
    GraphicsAssembler._fetchRemoteContent(vertPath)
        .then(pipeline.updateVertexSource.bind(pipeline)),
    GraphicsAssembler._fetchRemoteContent(fragPath)
        .then(pipeline.updateFragmentSource.bind(pipeline))
  ]).then(function() {
    pipeline.connect();
    return pipeline;
  });
};

/**
 * Retrieves a resource using an XMLHttpRequest and returns a Promise
 * that is fulfilled with the resource's content.
 * @param {string} resourcePath The URL of the resource to fetch.
 * @return {!Promise<string>} A promise resolving to the resource content.
 * @private
 */
GraphicsAssembler._fetchRemoteContent = function(resourcePath) {
  return new Promise(function(fulfill, decline) {
    var requestObj = new XMLHttpRequest();
    requestObj.open('GET', resourcePath);
    requestObj.onload = function(eventObj) {
      if (this.status === 200) {
        fulfill(this.responseText);
      } else {
        decline(this.statusText);
      }
    };
    requestObj.onerror = function(eventObj) {
      decline(this.statusText);
    };
    requestObj.send();
  });
};

/**
 * Determines if both shader stages have successfully compiled and the program
 * has been connected.
 * @return {boolean} True if the program is ready for use, false otherwise.
 */
GraphicsAssembler.prototype.isOperational = function() {
  return this._execReady;
};

/**
 * Processes and compiles either a vertex or fragment shader using the provided source.
 * @param {string} sourceCode The GLSL source code for the shader.
 * @param {!WebGLShader} shaderObject The WebGLShader object to compile.
 * @return {boolean} True if compilation was successful, false otherwise.
 * @private
 */
GraphicsAssembler.prototype._processShader = function(sourceCode, shaderObject) {
  this._gfxCtx.shaderSource(shaderObject, sourceCode);
  this._gfxCtx.compileShader(shaderObject);

  var compilationSuccess = this._gfxCtx.getShaderParameter(shaderObject,
      this._gfxCtx.COMPILE_STATUS);

  // Mark the current program as needing re-connection.
  this._execReady = false;

  return compilationSuccess;
};

/**
 * Updates the source code for the fragment stage and attempts compilation.
 * If successful, the rendering pipeline will continue operating with its
 * previous configuration until connect() is invoked and completes successfully.
 * Should compilation fail, an error is raised containing the compiler's output log.
 * @param {string} sourceCode The new GLSL source for the fragment stage.
 * @throws {Error} If fragment shader compilation fails.
 */
GraphicsAssembler.prototype.updateFragmentSource = function(sourceCode) {
  this._fragReady = this._processShader(sourceCode, this._fragProcessor);

  if (!this._fragReady) {
    throw new Error('Fragment stage compilation failed. Details: ' +
        this.getFragmentLog());
  }
};

/**
 * Updates the source code for the vertex stage and attempts compilation.
 * If successful, the rendering pipeline will continue operating with its
 * previous configuration until connect() is invoked and completes successfully.
 * Should compilation fail, an error is raised containing the compiler's output log.
 * @param {string} sourceCode The new GLSL source for the vertex stage.
 * @throws {Error} If vertex shader compilation fails.
 */
GraphicsAssembler.prototype.updateVertexSource = function(sourceCode) {
  this._vertReady = this._processShader(sourceCode, this._vertProcessor);

  if (!this._vertReady) {
    throw new Error('Vertex stage compilation failed. Details: ' +
        this.getVertexLog());
  }
};

/**
 * Retrieves the information log for the currently linked fragment stage, if available.
 * @return {string} The fragment stage's info log.
 */
GraphicsAssembler.prototype.getFragmentLog = function() {
  return this._gfxCtx.getShaderInfoLog(this._fragProcessor);
};

/**
 * Retrieves the information log for this entire executable program, if available.
 * @return {string} The program's info log.
 */
GraphicsAssembler.prototype.getProgramLog = function() {
  return this._gfxCtx.getProgramInfoLog(this.execProgram);
};

/**
 * Retrieves the information log for the currently linked vertex stage, if available.
 * @return {string} The vertex stage's info log.
 */
GraphicsAssembler.prototype.getVertexLog = function() {
  return this._gfxCtx.getShaderInfoLog(this._vertProcessor);
};

/**
 * Discovers and records all active vertex input locations within this program.
 * Any previously stored input locations are cleared before this re-enumeration.
 * @private
 */
GraphicsAssembler.prototype._initializeInputs = function() {
  var itemCount = this._gfxCtx.getProgramParameter(
      this.execProgram, this._gfxCtx.ACTIVE_ATTRIBUTES);

  // Reset and populate vertex input locations from the newly connected program.
  this.vertexInputs = {};
  for (var idx = 0; idx < itemCount; idx++) {
    var itemDetails = this._gfxCtx.getActiveAttrib(this.execProgram, idx);
    var inputLocation = this._gfxCtx.getAttribLocation(this.execProgram, itemDetails.name);
    this.vertexInputs[itemDetails.name] = inputLocation;
  }
};

/**
 * Generates a unified global variable update function capable of dispatching
 * to either an array-based setter or a variadic argument setter depending on input.
 * @param {function(this:WebGLRenderingContext, ...[number])} scalarSetter Function for setting individual values.
 * @param {function(this:WebGLRenderingContext, (Array.<number>|ArrayBufferView))} vectorSetter Function for setting array/vector values.
 * @return {function(Array.<number>|ArrayBufferView|...[number])} A composite function to handle both scalar and vector inputs.
 */
GraphicsAssembler.generateSettingFunction = function(scalarSetter, vectorSetter) {
  return function applyGlobalValue() {
    // Note: ArrayBuffer.isView is not supported in older browsers like Safari 7,
    // but works well in modern environments.
    if (Array.isArray(arguments[0]) || ArrayBuffer.isView(arguments[0])) {
      vectorSetter(arguments[0]);
    } else {
      scalarSetter.apply(null, arguments);
    }
  };
};

/**
 * Automatically creates and assigns update methods for all active global variables
 * within this executable program. Any previously generated update methods are
 * discarded upon calling this function.
 * @private
 * @throws {Error} If an active global variable of an unrecognized type is encountered.
 */
GraphicsAssembler.prototype._initializeSettings = function() {
  var gfx = this._gfxCtx;
  this.globalSettings = {};

  // Iterate through active global variables and construct their update functions.
  var itemCount = gfx.getProgramParameter(this.execProgram, gfx.ACTIVE_UNIFORMS);
  for (var idx = 0; idx < itemCount; idx++) {
    var itemDetails = gfx.getActiveUniform(this.execProgram, idx);
    var itemName = itemDetails.name;
    var settingLocation = gfx.getUniformLocation(this.execProgram, itemName);

    // For float, vector, or sampler global variables.
    if (GraphicsAssembler.SETTING_MAP_BASE[itemDetails.type]) {
      var baseSetterName = GraphicsAssembler.SETTING_MAP_BASE[itemDetails.type];
      var scalarSetter = gfx[baseSetterName].bind(gfx, settingLocation);
      var vectorSetter = gfx[baseSetterName + 'v'].bind(gfx, settingLocation);

      // The primary function handles input type dispatch.
      // Specialized direct setters are accessible via .set and .setVec.
      // The raw WebGLUniformLocation is found at .location.
      this.globalSettings[itemName] = GraphicsAssembler.generateSettingFunction(scalarSetter, vectorSetter);
      this.globalSettings[itemName].set = scalarSetter;
      this.globalSettings[itemName].setVec = vectorSetter;
      this.globalSettings[itemName].location = settingLocation;

    // For matrix global variables - these only accept array inputs.
    } else if (GraphicsAssembler.SETTING_MAP_MATRIX[itemDetails.type]) {
      var matrixSetterName = GraphicsAssembler.SETTING_MAP_MATRIX[itemDetails.type];

      this.globalSettings[itemName] = gfx[matrixSetterName].bind(gfx, settingLocation, false);
      this.globalSettings[itemName].location = settingLocation;

    } else {
      // This situation should not occur unless the WebGL specification is extended.
      throw new Error('Global variable "' + itemName + '" possesses an unknown type: ' + itemDetails.type);
    }
  }
};

/**
 * Attempts to connect the currently compiled vertex and fragment stages into an executable program.
 * An error is thrown if either stage is not compiled, or if the connection process itself fails.
 * @throws {Error} If connection fails due to uncompiled stages or linking errors.
 */
GraphicsAssembler.prototype.connect = function() {
  if (!this._vertReady) {
    throw new Error('The current vertex stage has not been compiled.');
  }
  if (!this._fragReady) {
    throw new Error('The current fragment stage has not been compiled.');
  }

  this._gfxCtx.linkProgram(this.execProgram);

  this._execReady = this._gfxCtx.getProgramParameter(this.execProgram,
      this._gfxCtx.LINK_STATUS);

  if (!this._execReady) {
    throw new Error('Execution program failed to connect. Log: ' +
        this.getProgramLog());
  } else {
    this._initializeInputs();
    this._initializeSettings();
  }
};

/**
 * Activates this executable program as the current rendering pipeline.
 * This method does not pre-validate the program's status; for safety,
 * use isOperational() beforehand to confirm successful compilation and connection.
 */
GraphicsAssembler.prototype.activate = function() {
  this._gfxCtx.useProgram(this.execProgram);
};

/**
 * Verifies if the compiled stages within this program are compatible with
 * the current OpenGL state for execution. The validation report can be
 * retrieved using currentAssembler.getProgramLog().
 * This operation is generally resource-intensive and best reserved for
 * development and debugging.
 * @return {boolean} The outcome of the integrity check.
 * @see http://www.khronos.org/opengles/sdk/2.0/docs/man/glValidateProgram.xml
 */
GraphicsAssembler.prototype.verifyIntegrity = function() {
  this._gfxCtx.validateProgram(this.execProgram);
  return this._gfxCtx.getProgramParameter(this.execProgram, this._gfxCtx.VALIDATE_STATUS);
};