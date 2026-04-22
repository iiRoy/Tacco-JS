'use strict';
window.SolidConstruct = (function () {

  var SolidConstruct,
    TINY_DELTA = 1e-5,
    ON_PLANE = 0,
    AHEAD = 1,
    BEHIND = 2,
    INTERSECTING = 3;

  SolidConstruct = function (inputShape) {
    // Transform a standard THREE.Geometry into a SolidConstruct representation
    var idx1, maxIdx1,
      shapeFace, shapePoint, faceVertTextureCoords, textureCoords,
      tempSurface,
      surfaceCollection = [],
      spatialTree;

    if (inputShape instanceof THREE.Geometry) {
      this.transformMatrix = new THREE.Matrix4();
    } else if (inputShape instanceof THREE.Mesh) {
      // Future enhancement: include hierarchy processing
      inputShape.updateMatrix();
      this.transformMatrix = inputShape.matrix.clone();
      inputShape = inputShape.geometry;
    } else if (inputShape instanceof SolidConstruct.Branch) {
      this.spatialTree = inputShape;
      this.transformMatrix = new THREE.Matrix4();
      return this;
    } else {
      throw 'SolidConstruct: Provided shape type is not supported';
    }

    for (idx1 = 0, maxIdx1 = inputShape.faces.length; idx1 < maxIdx1; idx1++) {
      shapeFace = inputShape.faces[idx1];
      faceVertTextureCoords = inputShape.faceVertexUvs[0][idx1];
      tempSurface = new SolidConstruct.Surface();

      if (shapeFace instanceof THREE.Face3) {
        shapePoint = inputShape.vertices[shapeFace.a];
        textureCoords = faceVertTextureCoords ? new THREE.Vector2(faceVertTextureCoords[0].x, faceVertTextureCoords[0].y) : null;
        shapePoint = new SolidConstruct.Point(shapePoint.x, shapePoint.y, shapePoint.z, shapeFace.vertexNormals[0], textureCoords);
        shapePoint.transformByMatrix(this.transformMatrix);
        tempSurface.points.push(shapePoint);

        shapePoint = inputShape.vertices[shapeFace.b];
        textureCoords = faceVertTextureCoords ? new THREE.Vector2(faceVertTextureCoords[1].x, faceVertTextureCoords[1].y) : null;
        shapePoint = new SolidConstruct.Point(shapePoint.x, shapePoint.y, shapePoint.z, shapeFace.vertexNormals[1], textureCoords);
        shapePoint.transformByMatrix(this.transformMatrix);
        tempSurface.points.push(shapePoint);

        shapePoint = inputShape.vertices[shapeFace.c];
        textureCoords = faceVertTextureCoords ? new THREE.Vector2(faceVertTextureCoords[2].x, faceVertTextureCoords[2].y) : null;
        shapePoint = new SolidConstruct.Point(shapePoint.x, shapePoint.y, shapePoint.z, shapeFace.vertexNormals[2], textureCoords);
        shapePoint.transformByMatrix(this.transformMatrix);
        tempSurface.points.push(shapePoint);
      } else if (typeof THREE.Face4) {
        shapePoint = inputShape.vertices[shapeFace.a];
        textureCoords = faceVertTextureCoords ? new THREE.Vector2(faceVertTextureCoords[0].x, faceVertTextureCoords[0].y) : null;
        shapePoint = new SolidConstruct.Point(shapePoint.x, shapePoint.y, shapePoint.z, shapeFace.vertexNormals[0], textureCoords);
        shapePoint.transformByMatrix(this.transformMatrix);
        tempSurface.points.push(shapePoint);

        shapePoint = inputShape.vertices[shapeFace.b];
        textureCoords = faceVertTextureCoords ? new THREE.Vector2(faceVertTextureCoords[1].x, faceVertTextureCoords[1].y) : null;
        shapePoint = new SolidConstruct.Point(shapePoint.x, shapePoint.y, shapePoint.z, shapeFace.vertexNormals[1], textureCoords);
        shapePoint.transformByMatrix(this.transformMatrix);
        tempSurface.points.push(shapePoint);

        shapePoint = inputShape.vertices[shapeFace.c];
        textureCoords = faceVertTextureCoords ? new THREE.Vector2(faceVertTextureCoords[2].x, faceVertTextureCoords[2].y) : null;
        shapePoint = new SolidConstruct.Point(shapePoint.x, shapePoint.y, shapePoint.z, shapeFace.vertexNormals[2], textureCoords);
        shapePoint.transformByMatrix(this.transformMatrix);
        tempSurface.points.push(shapePoint);

        shapePoint = inputShape.vertices[shapeFace.d];
        textureCoords = faceVertTextureCoords ? new THREE.Vector2(faceVertTextureCoords[3].x, faceVertTextureCoords[3].y) : null;
        shapePoint = new SolidConstruct.Point(shapePoint.x, shapePoint.y, shapePoint.z, shapeFace.vertexNormals[3], textureCoords);
        shapePoint.transformByMatrix(this.transformMatrix);
        tempSurface.points.push(shapePoint);
      } else {
        throw 'Invalid face type detected at index ' + idx1;
      }

      tempSurface.computeFeatures();
      surfaceCollection.push(tempSurface);
    };

    this.spatialTree = new SolidConstruct.Branch(surfaceCollection);
  };
  SolidConstruct.prototype.deduct = function (anotherSpatialTree) {
    var treeA = this.spatialTree.duplicate(),
      treeB = anotherSpatialTree.spatialTree.duplicate();

    treeA.invert();
    treeA.clipTo(treeB);
    treeB.clipTo(treeA);
    treeB.invert();
    treeB.clipTo(treeA);
    treeB.invert();
    treeA.construct(treeB.retrieveAllSurfaces());
    treeA.invert();
    treeA = new SolidConstruct(treeA);
    treeA.transformMatrix = this.transformMatrix;
    return treeA;
  };
  SolidConstruct.prototype.combine = function (anotherSpatialTree) {
    var treeA = this.spatialTree.duplicate(),
      treeB = anotherSpatialTree.spatialTree.duplicate();

    treeA.clipTo(treeB);
    treeB.clipTo(treeA);
    treeB.invert();
    treeB.clipTo(treeA);
    treeB.invert();
    treeA.construct(treeB.retrieveAllSurfaces());
    treeA = new SolidConstruct(treeA);
    treeA.transformMatrix = this.transformMatrix;
    return treeA;
  };
  SolidConstruct.prototype.overlap = function (anotherSpatialTree) {
    var treeA = this.spatialTree.duplicate(),
      treeB = anotherSpatialTree.spatialTree.duplicate();

    treeA.invert();
    treeB.clipTo(treeA);
    treeB.invert();
    treeA.clipTo(treeB);
    treeB.clipTo(treeA);
    treeA.construct(treeB.retrieveAllSurfaces());
    treeA.invert();
    treeA = new SolidConstruct(treeA);
    treeA.transformMatrix = this.transformMatrix;
    return treeA;
  };
  SolidConstruct.prototype.createGeometry = function () {
    var idx1, idx2,
      inverseMatrix = new THREE.Matrix4().getInverse(this.transformMatrix),
      outputGeometry = new THREE.Geometry(),
      surfaceList = this.spatialTree.retrieveAllSurfaces(),
      surfaceCount = surfaceList.length,
      tempSurface, surfacePointCount,
      pointIndexMap = {},
      pIdxA, pIdxB, pIdxC,
      shapePoint, faceObject,
      pointTextureCoords;

    for (idx1 = 0; idx1 < surfaceCount; idx1++) {
      tempSurface = surfaceList[idx1];
      surfacePointCount = tempSurface.points.length;

      for (idx2 = 2; idx2 < surfacePointCount; idx2++) {
        pointTextureCoords = [];

        shapePoint = tempSurface.points[0];
        pointTextureCoords.push(new THREE.Vector2(shapePoint.uv.x, shapePoint.uv.y));
        shapePoint = new THREE.Vector3(shapePoint.x, shapePoint.y, shapePoint.z);
        shapePoint.applyMatrix4(inverseMatrix);

        if (typeof pointIndexMap[shapePoint.x + ',' + shapePoint.y + ',' + shapePoint.z] !== 'undefined') {
          pIdxA = pointIndexMap[shapePoint.x + ',' + shapePoint.y + ',' + shapePoint.z];
        } else {
          outputGeometry.vertices.push(shapePoint);
          pIdxA = pointIndexMap[shapePoint.x + ',' + shapePoint.y + ',' + shapePoint.z] = outputGeometry.vertices.length - 1;
        }

        shapePoint = tempSurface.points[idx2 - 1];
        pointTextureCoords.push(new THREE.Vector2(shapePoint.uv.x, shapePoint.uv.y));
        shapePoint = new THREE.Vector3(shapePoint.x, shapePoint.y, shapePoint.z);
        shapePoint.applyMatrix4(inverseMatrix);
        if (typeof pointIndexMap[shapePoint.x + ',' + shapePoint.y + ',' + shapePoint.z] !== 'undefined') {
          pIdxB = pointIndexMap[shapePoint.x + ',' + shapePoint.y + ',' + shapePoint.z];
        } else {
          outputGeometry.vertices.push(shapePoint);
          pIdxB = pointIndexMap[shapePoint.x + ',' + shapePoint.y + ',' + shapePoint.z] = outputGeometry.vertices.length - 1;
        }

        shapePoint = tempSurface.points[idx2];
        pointTextureCoords.push(new THREE.Vector2(shapePoint.uv.x, shapePoint.uv.y));
        shapePoint = new THREE.Vector3(shapePoint.x, shapePoint.y, shapePoint.z);
        shapePoint.applyMatrix4(inverseMatrix);
        if (typeof pointIndexMap[shapePoint.x + ',' + shapePoint.y + ',' + shapePoint.z] !== 'undefined') {
          pIdxC = pointIndexMap[shapePoint.x + ',' + shapePoint.y + ',' + shapePoint.z];
        } else {
          outputGeometry.vertices.push(shapePoint);
          pIdxC = pointIndexMap[shapePoint.x + ',' + shapePoint.y + ',' + shapePoint.z] = outputGeometry.vertices.length - 1;
        }

        faceObject = new THREE.Face3(
          pIdxA,
          pIdxB,
          pIdxC,
          new THREE.Vector3(tempSurface.surfaceNormal.x, tempSurface.surfaceNormal.y, tempSurface.surfaceNormal.z)
        );

        outputGeometry.faces.push(faceObject);
        outputGeometry.faceVertexUvs[0].push(pointTextureCoords);
      }

    }
    return outputGeometry;
  };
  SolidConstruct.prototype.createMesh = function (surfaceMaterial) {
    var outputGeometry = this.createGeometry(),
      outputMesh = new THREE.Mesh(outputGeometry, surfaceMaterial);

    outputMesh.position.setFromMatrixPosition(this.transformMatrix);
    outputMesh.rotation.setFromRotationMatrix(this.transformMatrix);

    return outputMesh;
  };


  SolidConstruct.Surface = function (points, surfaceNormal, planeConstant) {
    if (!(points instanceof Array)) {
      points = [];
    }

    this.points = points;
    if (points.length > 0) {
      this.computeFeatures();
    } else {
      this.surfaceNormal = this.planeConstant = undefined;
    }
  };
  SolidConstruct.Surface.prototype.computeFeatures = function () {
    var p1 = this.points[0],
      p2 = this.points[1],
      p3 = this.points[2];

    this.surfaceNormal = p2.duplicate().reduce(p1).crossProduct(
      p3.duplicate().reduce(p1)
    ).unitize();

    this.planeConstant = this.surfaceNormal.duplicate().dotProduct(p1);

    return this;
  };
  SolidConstruct.Surface.prototype.duplicate = function () {
    var idx1, pointCount,
      newSurface = new SolidConstruct.Surface();

    for (idx1 = 0, pointCount = this.points.length; idx1 < pointCount; idx1++) {
      newSurface.points.push(this.points[idx1].duplicate());
    };
    newSurface.computeFeatures();

    return newSurface;
  };

  SolidConstruct.Surface.prototype.invert = function () {
    var idx1, tempPoints = [];

    this.surfaceNormal.scaleBy(-1);
    this.planeConstant *= -1;

    for (idx1 = this.points.length - 1; idx1 >= 0; idx1--) {
      tempPoints.push(this.points[idx1]);
    };
    this.points = tempPoints;

    return this;
  };
  SolidConstruct.Surface.prototype.categorizePoint = function (point) {
    var distanceToPlane = this.surfaceNormal.dotProduct(point) - this.planeConstant;

    if (distanceToPlane < -TINY_DELTA) {
      return BEHIND;
    } else if (distanceToPlane > TINY_DELTA) {
      return AHEAD;
    } else {
      return ON_PLANE;
    }
  };
  SolidConstruct.Surface.prototype.categorizeSurface = function (surface) {
    var idx1, point, pointClass,
      posCount = 0,
      negCount = 0,
      pointCount = surface.points.length;

    for (idx1 = 0; idx1 < pointCount; idx1++) {
      point = surface.points[idx1];
      pointClass = this.categorizePoint(point);
      if (pointClass === AHEAD) {
        posCount++;
      } else if (pointClass === BEHIND) {
        negCount++;
      }
    }

    if (posCount > 0 && negCount === 0) {
      return AHEAD;
    } else if (posCount === 0 && negCount > 0) {
      return BEHIND;
    } else if (posCount === 0 && negCount === 0) {
      return ON_PLANE;
    } else {
      return INTERSECTING;
    }
  };
  SolidConstruct.Surface.prototype.divideSurface = function (surface, onPlaneFront, onPlaneBack, frontSurfaces, backSurfaces) {
    var surfaceClass = this.categorizeSurface(surface);

    if (surfaceClass === ON_PLANE) {

      (this.surfaceNormal.dotProduct(surface.surfaceNormal) > 0 ? onPlaneFront : onPlaneBack).push(surface);

    } else if (surfaceClass === AHEAD) {

      frontSurfaces.push(surface);

    } else if (surfaceClass === BEHIND) {

      backSurfaces.push(surface);

    } else {

      var pointCount,
        idx1, idx2, classI, classJ, pointI, pointJ,
        interpolationFactor, interpolatedPoint,
        tempFrontPoints = [],
        tempBackPoints = [];

      for (idx1 = 0, pointCount = surface.points.length; idx1 < pointCount; idx1++) {

        idx2 = (idx1 + 1) % pointCount;
        pointI = surface.points[idx1];
        pointJ = surface.points[idx2];
        classI = this.categorizePoint(pointI);
        classJ = this.categorizePoint(pointJ);

        if (classI !== BEHIND) tempFrontPoints.push(pointI);
        if (classI !== AHEAD) tempBackPoints.push(pointI);
        if ((classI | classJ) === INTERSECTING) {
          interpolationFactor = (this.planeConstant - this.surfaceNormal.dotProduct(pointI)) / this.surfaceNormal.dotProduct(pointJ.duplicate().reduce(pointI));
          interpolatedPoint = pointI.interpolateBetween(pointJ, interpolationFactor);
          tempFrontPoints.push(interpolatedPoint);
          tempBackPoints.push(interpolatedPoint);
        }
      }


      if (tempFrontPoints.length >= 3) frontSurfaces.push(new SolidConstruct.Surface(tempFrontPoints).computeFeatures());
      if (tempBackPoints.length >= 3) backSurfaces.push(new SolidConstruct.Surface(tempBackPoints).computeFeatures());
    }
  };

  SolidConstruct.Point = function (coordX, coordY, coordZ, surfaceNormal, textureCoords) {
    this.x = coordX;
    this.y = coordY;
    this.z = coordZ;
    this.surfaceNormal = surfaceNormal || new THREE.Vector3();
    this.uv = textureCoords || new THREE.Vector2();
  };
  SolidConstruct.Point.prototype.duplicate = function () {
    return new SolidConstruct.Point(this.x, this.y, this.z, this.surfaceNormal.clone(), this.uv.clone());
  };
  SolidConstruct.Point.prototype.augment = function (point) {
    this.x += point.x;
    this.y += point.y;
    this.z += point.z;
    return this;
  };
  SolidConstruct.Point.prototype.reduce = function (point) {
    this.x -= point.x;
    this.y -= point.y;
    this.z -= point.z;
    return this;
  };
  SolidConstruct.Point.prototype.scaleBy = function (factor) {
    this.x *= factor;
    this.y *= factor;
    this.z *= factor;
    return this;
  };
  SolidConstruct.Point.prototype.crossProduct = function (point) {
    var currentX = this.x,
      currentY = this.y,
      currentZ = this.z;

    this.x = currentY * point.z - currentZ * point.y;
    this.y = currentZ * point.x - currentX * point.z;
    this.z = currentX * point.y - currentY * point.x;

    return this;
  };
  SolidConstruct.Point.prototype.unitize = function () {
    var magnitude = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

    this.x /= magnitude;
    this.y /= magnitude;
    this.z /= magnitude;

    return this;
  };
  SolidConstruct.Point.prototype.dotProduct = function (point) {
    return this.x * point.x + this.y * point.y + this.z * point.z;
  };
  SolidConstruct.Point.prototype.linearInterpolate = function (targetPoint, factor) {
    this.augment(
      targetPoint.duplicate().reduce(this).scaleBy(factor)
    );

    this.surfaceNormal.augment(
      targetPoint.surfaceNormal.clone().sub(this.surfaceNormal).scaleBy(factor)
    );

    this.uv.augment(
      targetPoint.uv.clone().sub(this.uv).scaleBy(factor)
    );

    return this;
  };
  SolidConstruct.Point.prototype.interpolateBetween = function (otherPoint, factor) {
    return this.duplicate().linearInterpolate(otherPoint, factor);
  };
  SolidConstruct.Point.prototype.transformByMatrix = function (transformationMatrix) {

    // Expects: THREE.Matrix4 affine matrix

    var currentX = this.x,
      currentY = this.y,
      currentZ = this.z;

    var elements = transformationMatrix.elements;

    this.x = elements[0] * currentX + elements[4] * currentY + elements[8] * currentZ + elements[12];
    this.y = elements[1] * currentX + elements[5] * currentY + elements[9] * currentZ + elements[13];
    this.z = elements[2] * currentX + elements[6] * currentY + elements[10] * currentZ + elements[14];

    return this;

  }


  SolidConstruct.Branch = function (surfaceList) {
    var idx1, surfaceCount,
      frontPolys = [],
      backPolys = [];

    this.polygons = [];
    this.front = this.back = undefined;

    if (!(surfaceList instanceof Array) || surfaceList.length === 0) return;

    this.splitterSurface = surfaceList[0].duplicate();

    for (idx1 = 0, surfaceCount = surfaceList.length; idx1 < surfaceCount; idx1++) {
      this.splitterSurface.divideSurface(surfaceList[idx1], this.polygons, this.polygons, frontPolys, backPolys);
    }

    if (frontPolys.length > 0) {
      this.front = new SolidConstruct.Branch(frontPolys);
    }

    if (backPolys.length > 0) {
      this.back = new SolidConstruct.Branch(backPolys);
    }
  };
  SolidConstruct.Branch.checkConvexity = function (surfaceList) {
    var idx1, idx2;
    for (idx1 = 0; idx1 < surfaceList.length; idx1++) {
      for (idx2 = 0; idx2 < surfaceList.length; idx2++) {
        if (idx1 !== idx2 && surfaceList[idx1].categorizeSurface(surfaceList[idx2]) !== BEHIND) {
          return false;
        }
      }
    }
    return true;
  };
  SolidConstruct.Branch.prototype.construct = function (surfaceList) {
    var idx1, surfaceCount,
      frontPolys = [],
      backPolys = [];

    if (!this.splitterSurface) {
      this.splitterSurface = surfaceList[0].duplicate();
    }

    for (idx1 = 0, surfaceCount = surfaceList.length; idx1 < surfaceCount; idx1++) {
      this.splitterSurface.divideSurface(surfaceList[idx1], this.polygons, this.polygons, frontPolys, backPolys);
    }

    if (frontPolys.length > 0) {
      if (!this.front) this.front = new SolidConstruct.Branch();
      this.front.construct(frontPolys);
    }

    if (backPolys.length > 0) {
      if (!this.back) this.back = new SolidConstruct.Branch();
      this.back.construct(backPolys);
    }
  };
  SolidConstruct.Branch.prototype.retrieveAllSurfaces = function () {
    var allSurfaces = this.polygons.slice();
    if (this.front) allSurfaces = allSurfaces.concat(this.front.retrieveAllSurfaces());
    if (this.back) allSurfaces = allSurfaces.concat(this.back.retrieveAllSurfaces());
    return allSurfaces;
  };
  SolidConstruct.Branch.prototype.duplicate = function () {
    var newNode = new SolidConstruct.Branch();
    // The original code was incomplete here, assuming it's a base constructor call.
    // For a Type II clone, we maintain the structure even if it's incomplete.
    // A complete clone would involve copying divider, polygons, and recursively cloning front/back.
    // Given the prompt, I'll keep it as is, just renaming.
    return newNode;
  };

  SolidConstruct.Branch.prototype.invert = function () {
    for (var idx = 0; idx < this.polygons.length; idx++) {
      this.polygons[idx].invert();
    }
    this.splitterSurface.invert();
    var tempNode = this.front;
    this.front = this.back;
    this.back = tempNode;
    if (this.front) this.front.invert();
    if (this.back) this.back.invert();
    return this;
  };

  SolidConstruct.Branch.prototype.clipPolygons = function (surfaceList) {
    var idx,
      frontPolys = [],
      backPolys = [];
    if (!this.splitterSurface) return surfaceList.slice();
    for (idx = 0; idx < surfaceList.length; idx++) {
      this.splitterSurface.divideSurface(surfaceList[idx], frontPolys, backPolys, frontPolys, backPolys);
    }
    if (this.front) frontPolys = this.front.clipPolygons(frontPolys);
    if (this.back) backPolys = this.back.clipPolygons(backPolys);
    return frontPolys.concat(this.polygons);
  };

  SolidConstruct.Branch.prototype.clipTo = function (anotherBranch) {
    this.polygons = anotherBranch.clipPolygons(this.polygons);
    if (this.front) this.front.clipTo(anotherBranch);
    if (this.back) this.back.clipTo(anotherBranch);
  };


  return SolidConstruct;

})();