const scalarVectorRegistry = {
  [0x1406]: { method: 'uniform1f', arrayMethod: 'uniform1fv' },
  [0x8b50]: { method: 'uniform2f', arrayMethod: 'uniform2fv' },
  [0x8b51]: { method: 'uniform3f', arrayMethod: 'uniform3fv' },
  [0x8b52]: { method: 'uniform4f', arrayMethod: 'uniform4fv' },
  [0x1404]: { method: 'uniform1i', arrayMethod: 'uniform1iv' },
  [0x8b53]: { method: 'uniform2i', arrayMethod: 'uniform2iv' },
  [0x8b54]: { method: 'uniform3i', arrayMethod: 'uniform3iv' },
  [0x8b55]: { method: 'uniform4i', arrayMethod: 'uniform4iv' },
  [0x8b56]: { method: 'uniform1i', arrayMethod: 'uniform1iv' },
  [0x8b57]: { method: 'uniform2i', arrayMethod: 'uniform2iv' },
  [0x8b58]: { method: 'uniform3i', arrayMethod: 'uniform3iv' },
  [0x8b59]: { method: 'uniform4i', arrayMethod: 'uniform4iv' },
  [0x8b5e]: { method: 'uniform1i', arrayMethod: 'uniform1iv' },
  [0x8b60]: { method: 'uniform1i', arrayMethod: 'uniform1iv' },
};

const matrixRegistry = {
  [0x8b5a]: 'uniformMatrix2fv',
  [0x8b5b]: 'uniformMatrix3fv',
  [0x8b5c]: 'uniformMatrix4fv',
};

class RenderAssembly {
  constructor(webGLCtx, initialVertexCode, initialFragmentCode) {
    this._webGLCtx = webGLCtx;
    this._vShaderUnit = webGLCtx.createShader(webGLCtx.VERTEX_SHADER);
    this._fShaderUnit = webGLCtx.createShader(webGLCtx.FRAGMENT_SHADER);
    this._execKernel = webGLCtx.createProgram();

    this._vUnitCompiled = false;
    this._fUnitCompiled = false;
    this._isReady = false;

    webGLCtx.attachShader(this._execKernel, this._vShaderUnit);
    webGLCtx.attachShader(this._execKernel, this._fShaderUnit);

    this.inputStreams = {};
    this.configParams = {};

    if (initialVertexCode) {
      this.supplyVertexCode(initialVertexCode);
    }
    if (initialFragmentCode) {
      this.supplyFragmentCode(initialFragmentCode);
    }
    if (this._vUnitCompiled && this._fUnitCompiled) {
      this.assemble();
    }
  }

  _transpileShaderUnit(sourceCode, shaderObject) {
    this._webGLCtx.shaderSource(shaderObject, sourceCode);
    this._webGLCtx.compileShader(shaderObject);
    const compileStatus = this._webGLCtx.getShaderParameter(shaderObject, this._webGLCtx.COMPILE_STATUS);
    this._isReady = false;
    return compileStatus;
  }

  supplyVertexCode(sourceCode) {
    this._vUnitCompiled = this._transpileShaderUnit(sourceCode, this._vShaderUnit);
    if (!this._vUnitCompiled) {
      throw new Error('Vertex shader compilation failure. Log: ' + this.getVertexLog());
    }
  }

  supplyFragmentCode(sourceCode) {
    this._fUnitCompiled = this._transpileShaderUnit(sourceCode, this._fShaderUnit);
    if (!this._fUnitCompiled) {
      throw new Error('Fragment shader compilation failure. Log: ' + this.getFragmentLog());
    }
  }

  getVertexLog() {
    return this._webGLCtx.getShaderInfoLog(this._vShaderUnit);
  }

  getFragmentLog() {
    return this._webGLCtx.getShaderInfoLog(this._fShaderUnit);
  }

  getProgramLog() {
    return this._webGLCtx.getProgramInfoLog(this._execKernel);
  }

  _mapInputLocations() {
    this.inputStreams = {};
    const count = this._webGLCtx.getProgramParameter(this._execKernel, this._webGLCtx.ACTIVE_ATTRIBUTES);
    this.inputStreams = Array.from({ length: count }).reduce((acc, _, i) => {
      const info = this._webGLCtx.getActiveAttrib(this._execKernel, i);
      const loc = this._webGLCtx.getAttribLocation(this._execKernel, info.name);
      acc[info.name] = loc;
      return acc;
    }, {});
  }

  _generateConfigSetter(location, type) {
    const context = this._webGLCtx;

    if (scalarVectorRegistry[type]) {
      const { method, arrayMethod } = scalarVectorRegistry[type];
      const singleValueSetter = context[method].bind(context, location);
      const arrayValueSetter = context[arrayMethod].bind(context, location);

      const combinedSetter = function() {
        if (Array.isArray(arguments[0]) || (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(arguments[0]))) {
          arrayValueSetter(arguments[0]);
        } else {
          singleValueSetter.apply(null, arguments);
        }
      };
      combinedSetter.single = singleValueSetter;
      combinedSetter.array = arrayValueSetter;
      combinedSetter.loc = location;
      return combinedSetter;
    } else if (matrixRegistry[type]) {
      const matrixMethod = matrixRegistry[type];
      const matrixSetter = context[matrixMethod].bind(context, location, false);
      matrixSetter.loc = location;
      return matrixSetter;
    } else {
      throw new Error('Unknown uniform type encountered: ' + type);
    }
  }

  _mapConfigurables() {
    this.configParams = {};
    const count = this._webGLCtx.getProgramParameter(this._execKernel, this._webGLCtx.ACTIVE_UNIFORMS);
    Array.from({ length: count }).forEach((_, i) => {
      const info = this._webGLCtx.getActiveUniform(this._execKernel, i);
      const name = info.name;
      const location = this._webGLCtx.getUniformLocation(this._execKernel, name);
      this.configParams[name] = this._generateConfigSetter(location, info.type);
    });
  }

  assemble() {
    if (!this._vUnitCompiled) {
      throw new Error('Vertex shader not compiled for assembly.');
    }
    if (!this._fUnitCompiled) {
      throw new Error('Fragment shader not compiled for assembly.');
    }

    this._webGLCtx.linkProgram(this._execKernel);
    this._isReady = this._webGLCtx.getProgramParameter(this._execKernel, this._webGLCtx.LINK_STATUS);

    if (!this._isReady) {
      throw new Error('Program assembly failed. Log: ' + this.getProgramLog());
    } else {
      this._mapInputLocations();
      this._mapConfigurables();
    }
  }

  isOperational() {
    return this._isReady;
  }

  activate() {
    this._webGLCtx.useProgram(this._execKernel);
  }

  validate() {
    this._webGLCtx.validateProgram(this._execKernel);
    return this._webGLCtx.getProgramParameter(this._execKernel, this._webGLCtx.VALIDATE_STATUS);
  }

  static async constructFromRemote(webGLCtx, vertexLink, fragmentLink) {
    const pipeline = new RenderAssembly(webGLCtx);

    const retrieveSource = async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to retrieve resource from ${url}: ${response.statusText}`);
      }
      return response.text();
    };

    const [vSource, fSource] = await Promise.all([
      retrieveSource(vertexLink),
      retrieveSource(fragmentLink)
    ]);

    pipeline.supplyVertexCode(vSource);
    pipeline.supplyFragmentCode(fSource);
    pipeline.assemble();

    return pipeline;
  }
}