class SceneObjectProcessor {
    constructor() {
        this.vertexPositionsStore = null;
        this.indexElementsStore = null;
        this.vertexNormalStore = null;
        this.vertexTextureCoordStore = null;
        this.materialRenderers = [];
        this.completionNotification = null;
        this.outstandingShaderTasks = 0;
    }

    static retrieveShaderAssetLocations(shaderUnit, locationSchema) {
        return Object.fromEntries(
            Object.entries(locationSchema).map(([designation, identifier]) => [
                designation,
                identifier.startsWith('a') ? gl.getAttribLocation(shaderUnit, identifier) : gl.getUniformLocation(shaderUnit, identifier)
            ])
        );
    }

    notifyShaderReady(shaderUnit) {
        const attributeMap = {
            positionAttributeLocation: 'aVertexPosition',
            normalAttributeLocation: 'aVertexNormal',
            textureCoordAttributeLocation: 'aVertexTextureCoord'
        };
        const uniformMap = {
            modelMatrixUniformLocation: 'uMMatrix',
            projectionMatrixUniformLocation: 'uPMatrix',
            viewMatrixUniformLocation: 'uVMatrix',
            diffuseSamplerUniformLocation: 'uDiffuseSampler',
            emissiveSamplerUniformLocation: 'uEmissiveSampler'
        };

        Object.assign(shaderUnit, SceneObjectProcessor.retrieveShaderAssetLocations(shaderUnit, attributeMap));
        Object.assign(shaderUnit, SceneObjectProcessor.retrieveShaderAssetLocations(shaderUnit, uniformMap));

        this.outstandingShaderTasks--;
        if (this.outstandingShaderTasks === 0 && this.completionNotification) {
            this.completionNotification();
        }
    }

    async fetchTextureResource(sourcePath) {
        return new Promise((resolve, reject) => {
            const textureContainer = gl.createTexture();
            const mediaObject = new Image();
            mediaObject.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, textureContainer);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mediaObject);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.bindTexture(gl.TEXTURE_2D, null);
                resolve(textureContainer);
            };
            mediaObject.onerror = (e) => reject(new Error(`Texture acquisition failed for: ${sourcePath}. Reason: ${e}`));
            mediaObject.src = sourcePath;
        });
    }

    createDataBuffer(arrayType, dataValues, bufferBindingTarget = gl.ARRAY_BUFFER) {
        const newBuffer = gl.createBuffer();
        gl.bindBuffer(bufferBindingTarget, newBuffer);
        gl.bufferData(bufferBindingTarget, new arrayType(dataValues), gl.STATIC_DRAW);
        return newBuffer;
    }

    async parseModelDescriptor(modelJsonString) {
        const modelData = JSON.parse(modelJsonString);

        this.vertexPositionsStore = this.createDataBuffer(Float32Array, modelData.vertexPositions);
        this.indexElementsStore = this.createDataBuffer(Uint16Array, modelData.indices, gl.ELEMENT_ARRAY_BUFFER);

        if (modelData.vertexNormals) {
            this.vertexNormalStore = this.createDataBuffer(Float32Array, modelData.vertexNormals);
        }
        if (modelData.vertexTextureCoords) {
            this.vertexTextureCoordStore = this.createDataBuffer(Float32Array, modelData.vertexTextureCoords);
        }

        this.outstandingShaderTasks = modelData.materials.length;
        const materialProcessingPipeline = modelData.materials.map(async (materialSpecification) => {
            const compiledShader = await new Promise(resolve => {
                loadProgram(materialSpecification.vertexshader, materialSpecification.fragmentshader, (programResult) => {
                    this.notifyShaderReady(programResult);
                    resolve(programResult);
                });
            });

            const materialRenderingUnit = {
                activeShaderProgram: compiledShader,
                primitiveCount: materialSpecification.numindices,
                diffuseTextureObject: null,
                emissiveTextureObject: null
            };

            if (materialSpecification.diffuse) {
                materialRenderingUnit.diffuseTextureObject = await this.fetchTextureResource(materialSpecification.diffuse);
            }
            if (materialSpecification.emissive) {
                materialRenderingUnit.emissiveTextureObject = await this.fetchTextureResource(materialSpecification.emissive);
            }
            return materialRenderingUnit;
        });

        this.materialRenderers = await Promise.all(materialProcessingPipeline);
    }

    async retrieveAndPrepare(sourcePath, onReadyCallback) {
        this.completionNotification = onReadyCallback;
        loadFile(sourcePath, async (fileContent) => {
            await this.parseModelDescriptor(fileContent);
            if (this.outstandingShaderTasks === 0 && this.completionNotification) {
                this.completionNotification();
            }
        }, false, true);
    }

    transferMatricesToShader(shaderTarget) {
        gl.uniformMatrix4fv(shaderTarget.modelMatrixUniformLocation, false, modelMatrix().d);
        gl.uniformMatrix4fv(shaderTarget.projectionMatrixUniformLocation, false, projectionMatrix().d);
        gl.uniformMatrix4fv(shaderTarget.viewMatrixUniformLocation, false, viewMatrix().d);
    }

    renderModelGeometry() {
        let currentElementOffset = 0;
        this.materialRenderers.forEach(renderer => {
            gl.useProgram(renderer.activeShaderProgram);

            gl.enableVertexAttribArray(renderer.activeShaderProgram.positionAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionsStore);
            gl.vertexAttribPointer(renderer.activeShaderProgram.positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexElementsStore);

            if (renderer.activeShaderProgram.normalAttributeLocation !== -1 && this.vertexNormalStore) {
                gl.enableVertexAttribArray(renderer.activeShaderProgram.normalAttributeLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalStore);
                gl.vertexAttribPointer(renderer.activeShaderProgram.normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
            } else if (renderer.activeShaderProgram.normalAttributeLocation !== -1) {
                gl.disableVertexAttribArray(renderer.activeShaderProgram.normalAttributeLocation);
            }

            if (renderer.activeShaderProgram.textureCoordAttributeLocation !== -1 && this.vertexTextureCoordStore) {
                gl.enableVertexAttribArray(renderer.activeShaderProgram.textureCoordAttributeLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordStore);
                gl.vertexAttribPointer(renderer.activeShaderProgram.textureCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
            } else if (renderer.activeShaderProgram.textureCoordAttributeLocation !== -1) {
                gl.disableVertexAttribArray(renderer.activeShaderProgram.textureCoordAttributeLocation);
            }

            if (renderer.diffuseTextureObject) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, renderer.diffuseTextureObject);
                gl.uniform1i(renderer.activeShaderProgram.diffuseSamplerUniformLocation, 0);
            }

            if (renderer.emissiveTextureObject) {
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, renderer.emissiveTextureObject);
                gl.uniform1i(renderer.activeShaderProgram.emissiveSamplerUniformLocation, 1);
            }

            this.transferMatricesToShader(renderer.activeShaderProgram);

            gl.drawElements(gl.TRIANGLES, renderer.primitiveCount, gl.UNSIGNED_SHORT, currentElementOffset * 2);
            currentElementOffset += renderer.primitiveCount;
        });
    }
}