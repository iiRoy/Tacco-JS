THREELIB.GeoOps = {

	// Transforms a Three.js model into a CSG object.
	convertThreeToCsg: function( inputShape, shiftVec, rotAngle ) {
		var idx;
		var meshData;
		var currentShift;
		var geoFaces;
		var pointSet;
		var rotMatrix;
		
		if ( !CSG ) {
			throw 'CSG library is not loaded. Ensure csg.js is available from https://github.com/evanw/csg.js';
		}
		
		if ( inputShape instanceof THREE.Mesh ) {
			meshData = inputShape.geometry;
			currentShift = shiftVec || inputShape.position;
			rotAngle = rotAngle || inputShape.rotation;
		} 
		else if ( inputShape instanceof THREE.Geometry ) {
			meshData = inputShape;
			currentShift = shiftVec || new THREE.Vector3( 0, 0, 0 );
			rotAngle = rotAngle || new THREE.Vector3( 0, 0, 0 );
		} 
		else {
			throw 'The provided model type is not supported for conversion.';
		}
		
		rotMatrix = new THREE.Matrix4( ).setRotationFromEuler( rotAngle );
		
		var geoFaces = [];
		for ( idx = 0; idx < meshData.faces.length; idx++ ) {
			if ( meshData.faces[idx] instanceof THREE.Face3 ) {
				
				
				pointSet = [];
				pointSet.push( new CSG.Vertex( rotMatrix.multiplyVector3( meshData.vertices[meshData.faces[idx].a].clone( ).addSelf( currentShift ) ), [ meshData.faces[idx].normal.x, meshData.faces[idx].normal.y, meshData.faces[idx].normal.z ] ) );
				pointSet.push( new CSG.Vertex( rotMatrix.multiplyVector3( meshData.vertices[meshData.faces[idx].b].clone( ).addSelf( currentShift ) ), [ meshData.faces[idx].normal.x, meshData.faces[idx].normal.y, meshData.faces[idx].normal.z ] ) );
				pointSet.push( new CSG.Vertex( rotMatrix.multiplyVector3( meshData.vertices[meshData.faces[idx].c].clone( ).addSelf( currentShift ) ), [ meshData.faces[idx].normal.x, meshData.faces[idx].normal.y, meshData.faces[idx].normal.z ] ) );
				geoFaces.push( new CSG.Polygon( pointSet ) );
				
			} else if ( meshData.faces[idx] instanceof THREE.Face4 ) {
				
				pointSet = [];
				pointSet.push( new CSG.Vertex( rotMatrix.multiplyVector3( meshData.vertices[meshData.faces[idx].a].clone( ).addSelf( currentShift ) ), [ meshData.faces[idx].normal.x, meshData.faces[idx].normal.y, meshData.faces[idx].normal.z ] ) );
				pointSet.push( new CSG.Vertex( rotMatrix.multiplyVector3( meshData.vertices[meshData.faces[idx].b].clone( ).addSelf( currentShift ) ), [ meshData.faces[idx].normal.x, meshData.faces[idx].normal.y, meshData.faces[idx].normal.z ] ) );
				pointSet.push( new CSG.Vertex( rotMatrix.multiplyVector3( meshData.vertices[meshData.faces[idx].d].clone( ).addSelf( currentShift ) ), [ meshData.faces[idx].normal.x, meshData.faces[idx].normal.y, meshData.faces[idx].normal.z ] ) );
				geoFaces.push( new CSG.Polygon( pointSet ) );
				
				pointSet = [];
				pointSet.push( new CSG.Vertex( rotMatrix.multiplyVector3( meshData.vertices[meshData.faces[idx].b].clone( ).addSelf( currentShift ) ), [ meshData.faces[idx].normal.x, meshData.faces[idx].normal.y, meshData.faces[idx].normal.z ] ) );
				pointSet.push( new CSG.Vertex( rotMatrix.multiplyVector3( meshData.vertices[meshData.faces[idx].c].clone( ).addSelf( currentShift ) ), [ meshData.faces[idx].normal.x, meshData.faces[idx].normal.y, meshData.faces[idx].normal.z ] ) );
				pointSet.push( new CSG.Vertex( rotMatrix.multiplyVector3( meshData.vertices[meshData.faces[idx].d].clone( ).addSelf( currentShift ) ), [ meshData.faces[idx].normal.x, meshData.faces[idx].normal.y, meshData.faces[idx].normal.z ] ) );
				geoFaces.push( new CSG.Polygon( pointSet ) );
				
			} else {
				throw 'The model contains an unsupported face type.';
			}
		}
		
		return CSG.fromPolygons( geoFaces );
	},
	
	// Converts a CSG object back into a Three.js Geometry.
	convertCsgToThree: function( csgObject ) {
		var idx, k, pointSet, polyFace,
			outputGeo = new THREE.Geometry( ),
			allPolygons = csgObject.toPolygons( );
		
		if ( !CSG ) {
			throw 'CSG library missing. Obtain it from https://github.com/evanw/csg.js';
		}
		
		for ( idx = 0; idx < allPolygons.length; idx++ ) {
			
			// Process vertices for each polygon
			pointSet = [];
			for ( k = 0; k < allPolygons[idx].vertices.length; k++ ) {
				pointSet.push( this.retrieveOrAddVertex( outputGeo, allPolygons[idx].vertices[k].pos ) );
			}
			if ( pointSet[0] === pointSet[pointSet.length - 1] ) {
				pointSet.pop( );
			}
			
			for (var k = 2; k < pointSet.length; k++) {
				polyFace = new THREE.Face3( pointSet[0], pointSet[k-1], pointSet[k], new THREE.Vector3( ).copy( allPolygons[idx].plane.normal ) );
				outputGeo.faces.push( polyFace );
				outputGeo.faceVertexUvs[0].push( new THREE.UV( ) );
			}
		}
		
		outputGeo.computeBoundingBox();
		
		return outputGeo;
	},
	
	// Utility function to get an existing vertex index or add a new one.
	retrieveOrAddVertex: function ( outputGeo, vertexCoord ) {
		var idx;
		for ( idx = 0; idx < outputGeo.vertices.length; idx++ ) {
			if ( outputGeo.vertices[idx].x === vertexCoord.x && outputGeo.vertices[idx].y === vertexCoord.y && outputGeo.vertices[idx].z === vertexCoord.z ) {
				// Vertex already present
				return idx;
			}
		};
		
		outputGeo.vertices.push( new THREE.Vector3( vertexCoord.x, vertexCoord.y, vertexCoord.z ) );
		return outputGeo.vertices.length - 1;
	}
};