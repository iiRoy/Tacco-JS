/*
 * This is a Type I clone of the original Mesh class implementation.
 * All functional logic, variable names, and operators are preserved exactly.
 * Only whitespace and comments have been altered to create a visually distinct but functionally identical version.
 */

function Mesh()
{

// Defines the callback for when a program has finished loading its GLSL attributes and uniforms.
 this.programLoaded = function(program)
 {
  program.vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition');
  program.vertexNormalAttribute = gl.getAttribLocation(program, 'aVertexNormal');
  program.vertexTextureCoordAttribute = gl.getAttribLocation(program, 'aVertexTextureCoord');

  program.mMatrixUniform = gl.getUniformLocation(program, 'uMMatrix');
  program.pMatrixUniform = gl.getUniformLocation(program, 'uPMatrix');
  program.vMatrixUniform = gl.getUniformLocation(program, 'uVMatrix');

  program.uDiffuseSampler = gl.getUniformLocation(program, 'uDiffuseSampler');
  program.uEmissiveSampler = gl.getUniformLocation(program, 'uEmissiveSampler');

  // Decrement the counter for materials still loading.
  if (--this.materialsToLoad == 0)
  {
   // All materials loaded, execute the final callback.
   this.callback();
  }
 };


 // Function to load a texture from a given filename.
 this.loadTex = function(filename)
 {
  var tex = gl.createTexture();
  var img = new Image();

  img.onload = function() {
   gl.bindTexture(gl.TEXTURE_2D, tex);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   gl.generateMipmap(gl.TEXTURE_2D);
   gl.bindTexture(gl.TEXTURE0, null); // Unbind texture from TEXTURE0 slot
  };

  img.src = filename;
  return tex;
 };


 // Initializes the mesh object from a JSON string.
 this.init = function(jsonstring)
 {
  var mesh = JSON.parse(jsonstring);

  // Initialize vertex position buffer
  this.vertexPosBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexPositions), gl.STATIC_DRAW);

  // Initialize index buffer
  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);

  // Check and initialize vertex normal buffer if normals are present
  if (mesh.vertexNormals)
  {
   this.vertexNormalBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexNormals), gl.STATIC_DRAW);
  }

  // Check and initialize vertex texture coordinate buffer if texture coords are present
  if (mesh.vertexTextureCoords)
  {
   this.vertexTextureCoordBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexTextureCoords), gl.STATIC_DRAW);
  }

  // Prepare for loading materials and their associated programs
  this.materialsToLoad = mesh.materials.length;
  this.programs = [];
  var that = this; // Capture 'this' for use in callbacks

  // Iterate through each material to load its shaders and textures
  for (var m in mesh.materials)
  {
   var material = mesh.materials[m];
   var prog = loadProgram(material.vertexshader, material.fragmentshader, function(prog) { that.programLoaded(prog); });
   prog.numindices = material.numindices;

   // Load diffuse texture if specified
   if (material.diffuse)
   {
    prog.diffuseTexture = this.loadTex(material.diffuse);
   }

   // Load emissive texture if specified
   if (material.emissive)
   {
    prog.emissiveTexture = this.loadTex(material.emissive);
   }
   this.programs.push(prog);
  }
 };


 this.load = function(file, callback)
 {
  this.callback = callback;
  var that = this;
  // Use a helper function to load the file, then initialize the mesh with its content
  loadFile(file, function(x) { that.init(x); }, false, true);
 };


 this.setMatrixUniforms = function(program)
 {
  // Set model, projection, and view matrix uniforms for the given program
  gl.uniformMatrix4fv(program.mMatrixUniform, false, modelMatrix().d);
  gl.uniformMatrix4fv(program.pMatrixUniform, false, projectionMatrix().d);
  gl.uniformMatrix4fv(program.vMatrixUniform, false, viewMatrix().d);
 };


 this.draw = function()
 {
  var start = 0; // Offset for drawing elements from the index buffer

  // Iterate through each program (material) to draw its part of the mesh
  for (var p in this.programs)
  {
   var program = this.programs[p];
   gl.useProgram(program);

   // Enable and bind vertex position attribute
   gl.enableVertexAttribArray(program.vertexPositionAttribute);
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
   gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer);
   gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

   // If normals are present, enable and bind vertex normal attribute
   if (program.vertexNormalAttribute !== -1)
   {
    gl.enableVertexAttribArray(program.vertexNormalAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    gl.vertexAttribPointer(program.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
   }

   // If texture coordinates are present, enable and bind vertex texture coordinate attribute
   if (program.vertexTextureCoordAttribute !== -1)
   {
    gl.enableVertexAttribArray(program.vertexTextureCoordAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
    gl.vertexAttribPointer(program.vertexTextureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
   }

   // If diffuse texture is present, activate and bind it to TEXTURE0
   if (program.diffuseTexture)
   {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, program.diffuseTexture);
    gl.uniform1i(program.uDiffuseSampler, 0);
   }

   // If emissive texture is present, activate and bind it to TEXTURE1
   if (program.emissiveTexture)
   {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, program.emissiveTexture);
    gl.uniform1i(program.uEmissiveSampler, 1);
   }

   // Set the current model, projection, and view matrices
   this.setMatrixUniforms(program);

   // Draw the elements for the current material
   gl.drawElements(gl.TRIANGLES, program.numindices, gl.UNSIGNED_SHORT, start * 2);

   // Increment the start offset for the next material's indices
   start += program.numindices;
  }
 };
}