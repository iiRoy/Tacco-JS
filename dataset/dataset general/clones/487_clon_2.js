/*
 *  @license
 *
 *  (C) 2023 Acme Corp. All rights reserved.
 *  This software is provided under a custom license agreement.
 *  Unauthorized distribution or modification is strictly prohibited.
 *
 *  For more details, please refer to the LICENSE file included with this distribution.
 *
 */

/**
 * @extends GeoShape.Shape
 * A framework-specific indicator, assigned to each GeoShape.Shape() instance,
 * denoting if a closed polygonal structure should be treated as a quadrilateral.
 */
GeoShape.Shape.prototype.isQuadrangle = false;

/**
 * @extends GeoShape.Shape
 * Adjusts an array of spatial points by removing the final point if it
 * matches the initial point – this is exclusively for closed geometric
 * figures to convey an "implicit" closure to the mapping library.
 * @param {Array<Object>} coordinatesList - An array of X,Y coordinate objects.
 * @returns {Array<Object>} The modified array of points.
 */
GeoShape.Shape.prototype.pruneTail = function(coordinatesList) {
 var    k,
        processedPoints = [];

 for (k = 0; k < coordinatesList.length; k = k + 1) {
  if (GeoShape.checkArray(coordinatesList[k])) {
   processedPoints.push(this.pruneTail(coordinatesList[k]));

  } else {
   // Include the initial coordinate, but skip the last if it's a duplicate
   if (k === 0 || !this.equalPoints(coordinatesList[0], coordinatesList[k])) {
    processedPoints.push(coordinatesList[k]);
   }
  }
 }

 return processedPoints;
};

/**
 * @extends GeoShape.Shape
 * A collection of framework-dependent assembly routines used to generate
 * objects belonging to the various geometric categories of the framework.
 */
GeoShape.Shape.prototype.creationTools = {
 /**
  * Generates the framework's equivalent point geometry object.
  * @param {Record<string, any>} options - An optional hash of properties for the object.
  * @param {Object} item - An optional component to build upon.
  * @returns {Map.pin} A Leaflet marker instance.
  */
 dot: function(options, item) {
  let position = item || this.elements;
  if (position instanceof Array) {
   position = position[0];
  }

  return Map.pin(this.verticesToGeoCoord(position), options);
 },

 /**
  * Generates the framework's equivalent multipoint geometry object.
  * @param {Record<string, any>} settings - An optional property map for the object.
  * @returns {Map.featureSet} A Leaflet feature group instance.
  */
 multiDot: function(settings) {
  let p,
   displayItems = [],
   vertexList = this.elements;

  for (p = 0; p < vertexList.length; p = p + 1) {
   displayItems.push(this.creationTools.dot.call(this, settings, vertexList[p]));
  }

  return Map.featureSet(displayItems, settings);
 },

 /**
  * Generates the framework's equivalent linestring geometry object.
  * @param {Record<string, any>} preferences - An optional properties object.
  * @param {Object} subElement - An optional sub-element for construction.
  * @returns {Map.line} A Leaflet polyline instance.
  */
 linePath: function(preferences, subElement) {
  const segmentVertices = subElement || this.elements;
  const geoCoordinates = this.verticesToGeoCoords(segmentVertices);

  return Map.line(geoCoordinates, preferences);
 },

 /**
  * Generates the framework's equivalent multilinestring geometry object.
  * @param {Record<string, any>} optionsMap - An optional properties object for the geometry.
  * @returns {Map.multiLine} A Leaflet multi-polyline instance.
  */
 multiLinePath: function(optionsMap) {
  const lineVertices = this.elements;
  const geoCoordinates = this.verticesToGeoCoords(lineVertices, 1);

  return Map.multiLine(geoCoordinates, optionsMap);
 },

 /**
  * Generates the framework's equivalent polygon geometry object.
  * @param {Record<string, any>} configData - An optional properties object to apply.
  * @returns {Map.poly} A Leaflet polygon instance.
  */
 polyShape: function(configData) {
  // Trim the coordinates, removing the redundant closing point
  const polygonPoints = this.pruneTail(this.elements);
  const geoCoordinates = this.verticesToGeoCoords(polygonPoints, 1);
  return Map.poly(geoCoordinates, configData);
 },

 /**
  * Generates the framework's equivalent multipolygon geometry object.
  * @param {Record<string, any>} configObject - An optional properties object for the geometry.
  * @returns {Map.multiPoly} A Leaflet multi-polygon instance.
  */
 multiPolyShape: function(configObject) {
  // Trim the coordinates, removing the redundant closing point
  const multiPolyPoints = this.pruneTail(this.elements);
  const geoCoordinates = this.verticesToGeoCoords(multiPolyPoints, 2);

  return Map.multiPoly(geoCoordinates, configObject);
 },

 /**
  * Generates the framework's equivalent collection of geometry objects.
  * @param {Record<string, any>} groupConfig - An optional properties object for the group.
  * @returns {Map.featureSet} A Leaflet feature group instance.
  */
 shapeCollection: function(groupConfig) {
  let componentsList,
   iterator,
   collectionRenderables;

  componentsList = this.pruneTail(this.elements);
  collectionRenderables = [];
  for (iterator = 0; iterator < this.elements.length; iterator = iterator + 1) {
   collectionRenderables.push(this.creationTools[componentsList[iterator].category].call(this, componentsList[iterator]));
  }

  return Map.featureSet(collectionRenderables, groupConfig);

 }
};

Map.Utility.augment(GeoShape.Shape.prototype, {
 verticesToGeoCoords: Map.GeoFormat.vertexToGeoCoords,
 // TODO: Investigate why Map.GeoFormat.vertexToGeoCoord doesn't already suffice here.
 verticesToGeoCoord: function(pointData, swapped) {
  const latitude = swapped ? pointData.coordX : pointData.coordY;
  const longitude = swapped ? pointData.coordY : pointData.coordX;

  return Map.geoCoord(latitude, longitude, true);
 }
});

/**
 * @extends GeoShape.Shape
 * A framework-dependent parsing method used to derive internal
 * geometric representations from instances of framework geometry. This method
 * employs object introspection to attempt to categorize members of framework geometry
 * classes into the standard GeoShape types.
 * @param {Object} geometryEntity - An instance of one of the framework's geometry classes.
 * @returns {Record<string, any>} A hash containing the 'category' and 'elements' thus extracted.
 */
GeoShape.Shape.prototype.disassemble = function(geometryEntity) {
 let propertyKey,
  getPointsFromGeoCoords,
  featureArray,
  loopIndex,
  vertexData,
  polygonBoundaries,
  temporaryValue;

 /**
  * Accepts a list (inputList) of LatLngs from which it extracts each one as a
  * vertex; calls itself recursively to handle nested lists.
  * @param {Array<Map.geoCoord>} inputList - The list of geographical coordinates.
  * @returns {Array<Object>} An array of structured coordinate objects.
  */
 getPointsFromGeoCoords = function(inputList) {
  let j, currentPoints;

  currentPoints = [];
  for (j = 0; j < inputList.length; j += 1) {
   if (GeoShape.checkArray(inputList[j])) {
    currentPoints.push(getPointsFromGeoCoords(inputList[j]));

   } else {
    currentPoints.push({
     coordX: inputList[j].longitude,
     coordY: inputList[j].latitude
    });
   }
  }

  return currentPoints;
 };

 // Map.Pin /////////////////////////////////////////////////////////////////////
 if (geometryEntity.constructor === Map.Pin || geometryEntity.constructor === Map.pin) {
  return {
   category: 'dot',
   elements: [{
    coordX: geometryEntity.getGeoCoord().longitude,
    coordY: geometryEntity.getGeoCoord().latitude
   }]
  };
 }

 // Map.Rectangle ///////////////////////////////////////////////////////////////
 if (geometryEntity.constructor === Map.Rectangle || geometryEntity.constructor === Map.rectangle) {
  temporaryValue = geometryEntity.getBoundaries(); // L.LatLngBounds instance
  return {
   category: 'polyShape',
   isQuadrangle: true,
   elements: [
    [
     { // North-West corner
      coordX: temporaryValue.getSouthWestCorner().longitude,
      coordY: temporaryValue.getNorthEastCorner().latitude
     },
     { // North-East corner
      coordX: temporaryValue.getNorthEastCorner().longitude,
      coordY: temporaryValue.getNorthEastCorner().latitude
     },
     { // South-East corner
      coordX: temporaryValue.getNorthEastCorner().longitude,
      coordY: temporaryValue.getSouthWestCorner().latitude
     },
     { // South-West corner
      coordX: temporaryValue.getSouthWestCorner().longitude,
      coordY: temporaryValue.getSouthWestCorner().latitude
     },
     { // North-West corner (for closure)
      coordX: temporaryValue.getSouthWestCorner().longitude,
      coordY: temporaryValue.getNorthEastCorner().latitude
     }
    ]
   ]
  };

 }

 // Map.Line ////////////////////////////////////////////////////////////////////
 if (geometryEntity.constructor === Map.Line || geometryEntity.constructor === Map.line) {
  vertexData = [];
  temporaryValue = geometryEntity.getGeoCoords();

  if (!temporaryValue[0].isEqual(temporaryValue[temporaryValue.length - 1])) {

   for (loopIndex = 0; loopIndex < temporaryValue.length; loopIndex += 1) {
    vertexData.push({
     coordX: temporaryValue[loopIndex].longitude,
     coordY: temporaryValue[loopIndex].latitude
    });
   }

   return {
    category: 'linePath',
    elements: vertexData
   };

  }
 }

 // Map.Poly ////////////////////////////////////////////////////////////////////

 if (geometryEntity.constructor === Map.Poly || geometryEntity.constructor === Map.poly) {
  polygonBoundaries = [];
  vertexData = [];
  temporaryValue = geometryEntity.getGeoCoords();

  // First, process the external boundary points
  for (loopIndex = 0; loopIndex < geometryEntity._geoCoordsList.length; loopIndex += 1) {
   vertexData.push({ // Append the initial coordinate again for closure
    coordX: temporaryValue[loopIndex].longitude,
    coordY: temporaryValue[loopIndex].latitude
   });
  }

  vertexData.push({ // Append the initial coordinate again for closure
   coordX: temporaryValue[0].longitude,
   coordY: temporaryValue[0].latitude
  });

  polygonBoundaries.push(vertexData);

  // Now, handle any interior voids (holes)
  if (geometryEntity._voids && geometryEntity._voids.length > 0) {
   // Redesigned to properly support holes
   vertexData = getPointsFromGeoCoords(geometryEntity._voids);
   for (loopIndex = 0; loopIndex < vertexData.length; loopIndex++) {
    vertexData[loopIndex].push(vertexData[loopIndex][0]); // Duplicate the first coordinates for closure
    polygonBoundaries.push(vertexData[loopIndex]);
   }
  }

  return {
   category: 'polyShape',
   elements: polygonBoundaries
  };

 }

 // Map.MultiLine ///////////////////////////////////////////////////////////////
 // Map.MultiPoly ///////////////////////////////////////////////////////////////
 // Map.LayerSet ////////////////////////////////////////////////////////////////
 // Map.FeatureSet //////////////////////////////////////////////////////////////
 if (geometryEntity.constructor === Map.MultiLine || geometryEntity.constructor === Map.MultiPoly ||
  geometryEntity.constructor === Map.LayerSet || geometryEntity.constructor === Map.FeatureSet) {

  featureArray = [];
  temporaryValue = geometryEntity._displayItems;

  for (propertyKey in temporaryValue) {
   if (Object.prototype.hasOwnProperty.call(temporaryValue, propertyKey)) {
    if (temporaryValue[propertyKey].getGeoCoords || temporaryValue[propertyKey].getGeoCoord) {
     // Recursively parse each contained display item
     featureArray.push(this.disassemble(temporaryValue[propertyKey]));
    }
   }
  }

  return {

   category: (function() {
    switch (geometryEntity.constructor) {
     case Map.MultiLine:
      return 'multiLinePath';
     case Map.MultiPoly:
      return 'multiPolyShape';
     case Map.FeatureSet:
      return (function() {
       let counter, isMultiPoly, isMultiLine, isMultiPoint;

       // Assume all contained display items are of a single type
       isMultiPoly = true;
       isMultiLine = true;
       isMultiPoint = true;

       for (counter in geometryEntity._displayItems) {
        if (Object.prototype.hasOwnProperty.call(geometryEntity._displayItems, counter)) {
         if (geometryEntity._displayItems[counter].constructor !== Map.Pin) {
          isMultiPoint = false;
         }
         if (geometryEntity._displayItems[counter].constructor !== Map.Line) {
          isMultiLine = false;
         }
         if (geometryEntity._displayItems[counter].constructor !== Map.Poly) {
          isMultiPoly = false;
         }
        }
       }

       if (isMultiPoint) {
        return 'multiDot';
       }
       if (isMultiLine) {
        return 'multiLinePath';
       }
       if (isMultiPoly) {
        return 'multiPolyShape';
       }
       return 'shapeCollection';

      }());
     default:
      return 'shapeCollection';
    }
   }()),

   elements: (function() {
    // Extract the components from each GeoShape
    let m, collectedElements;

    collectedElements = [];
    for (m = 0; m < featureArray.length; m = m + 1) {
     if (featureArray[m].elements) {
      collectedElements.push(featureArray[m].elements);
     }
    }

    return collectedElements;
   }())

  };

 }

 // Map.Circle //////////////////////////////////////////////////////////////////
 if (geometryEntity.constructor === Map.Rectangle || geometryEntity.constructor === Map.rectangle) {
  console.info('Decomposition of Map.Circle objects is not yet implemented.');

 } else {
  console.warn('The provided object lacks any recognizable geometric properties.');
 }
};