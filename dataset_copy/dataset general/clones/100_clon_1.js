/*
 * THREE.CSG.js - A utility for performing Constructive Solid Geometry (CSG)
 * operations on Three.js objects. This code is a direct integration of
 * Evan Wallace's excellent csg.js library, tailored for Three.js environments.
 *
 * This file is part of a larger project and is provided under the MIT License.
 *
 * Original author: Chandler Prall
 * Contact: chandler.prall@gmail.com
 * Website: http://chandler.prallfamily.com
 *
 * Please ensure the 'csg.js' library is loaded before this script.
 * For more details on csg.js, visit: https://github.com/evanw/csg.js/
 */


THREE.CSG =
{
	// Converts a Three.js model (Mesh or Geometry) into a CSG object.
	// This allows for boolean operations (union, subtract, intersect) using the CSG library.
	toCSG : function( three_model, offset, rotation )
	{
		// First, a critical check: is the underlying CSG library available?
		if ( ! CSG )
		{
			// If not, we cannot proceed and must inform the user about the missing dependency.
			throw 'CSG library not loaded. Please get a copy from https://github.com/evanw/csg.js';
		}
		
		// Declare necessary local variables for processing.
		var i, geometry, polygons, vertices, rotation_matrix;
		
		
		// Determine the type of the input Three.js model.
		// We handle both THREE.Mesh and raw THREE.Geometry instances.
		if ( three_model instanceof THREE.Mesh )
		{
			// If it's a Mesh, extract its geometry directly.
			geometry = three_model.geometry;
			// Use the mesh's position and rotation if not explicitly provided.
			offset   = offset   || three_model.position;
			rotation = rotation || three_model.rotation;
		}
		else if ( three_model instanceof THREE.Geometry )
		{
			// If it's a raw Geometry, use it directly.
			geometry = three_model;
			// Provide default zero vectors for offset and rotation if not specified.
			offset   = offset   || new THREE.Vector3( 0, 0, 0 );
			rotation = rotation || new THREE.Vector3( 0, 0, 0 );
		}
		else
		{
			// If the model type is not recognized, throw an error.
			throw 'Model type not supported.';
		}
		
		// Create a rotation matrix from the provided Euler rotation.
		// This matrix will be applied to all vertices to orient the object correctly.
		rotation_matrix = new THREE.Matrix4( ).setRotationFromEuler( rotation );
		
		
		// Initialize an array to hold the CSG polygons.
		polygons = [ ];
		
		// Iterate through each face in the Three.js geometry.
		for ( i = 0; i < geometry.faces.length; i++ )
		{
			// Process faces based on their type: Face3 (triangles) or Face4 (quads).
			if ( geometry.faces[i] instanceof THREE.Face3 )
			{
				// For a triangular face (Face3):
				
				vertices = [ ]; // Reset vertices array for the current face.
				
				// Push the first vertex, transformed by rotation and offset.
				// The normal vector is also included for CSG operations.
				vertices.push
				(
					new CSG.Vertex
					(
						rotation_matrix.multiplyVector3( geometry.vertices[geometry.faces[i].a].clone( ).addSelf( offset ) ),
						[ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ]
					)
				);
				
				// Push the second vertex, with similar transformations.
				vertices.push
				(
					new CSG.Vertex
					(
						rotation_matrix.multiplyVector3( geometry.vertices[geometry.faces[i].b].clone( ).addSelf( offset ) ),
						[ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ]
					)
				);
				
				// Push the third vertex, completing the triangle.
				vertices.push
				(
					new CSG.Vertex
					(
						rotation_matrix.multiplyVector3( geometry.vertices[geometry.faces[i].c].clone( ).addSelf( offset ) ),
						[ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ]
					)
				);
				
				// Create a new CSG.Polygon from the collected vertices and add it to our list.
				polygons.push( new CSG.Polygon( vertices ) );
			}
			else if ( geometry.faces[i] instanceof THREE.Face4 )
			{
				// For a quadrilateral face (Face4), we split it into two triangles.
				
				vertices = [ ]; // Reset vertices for the first triangle.
				
				// First triangle: a, b, d
				vertices.push
				(
					new CSG.Vertex
					(
						rotation_matrix.multiplyVector3( geometry.vertices[geometry.faces[i].a].clone( ).addSelf( offset ) ),
						[ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ]
					)
				);
				vertices.push
				(
					new CSG.Vertex
					(
						rotation_matrix.multiplyVector3( geometry.vertices[geometry.faces[i].b].clone( ).addSelf( offset ) ),
						[ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ]
					)
				);
				vertices.push
				(
					new CSG.Vertex
					(
						rotation_matrix.multiplyVector3( geometry.vertices[geometry.faces[i].d].clone( ).addSelf( offset ) ),
						[ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ]
					)
				);
				polygons.push( new CSG.Polygon( vertices ) );
				
				
				vertices = [ ]; // Reset vertices for the second triangle.
				
				// Second triangle: b, c, d
				vertices.push
				(
					new CSG.Vertex
					(
						rotation_matrix.multiplyVector3( geometry.vertices[geometry.faces[i].b].clone( ).addSelf( offset ) ),
						[ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ]
					)
				);
				vertices.push
				(
					new CSG.Vertex
					(
						rotation_matrix.multiplyVector3( geometry.vertices[geometry.faces[i].c].clone( ).addSelf( offset ) ),
						[ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ]
					)
				);
				vertices.push
				(
					new CSG.Vertex
					(
						rotation_matrix.multiplyVector3( geometry.vertices[geometry.faces[i].d].clone( ).addSelf( offset ) ),
						[ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ]
					)
				);
				polygons.push( new CSG.Polygon( vertices ) );
				
			}
			else
			{
				// If a face type is neither Face3 nor Face4, it's unsupported.
				throw 'Model contains unsupported face.';
			}
		}
		
		// Finally, create and return a CSG object from the generated polygons.
		return CSG.fromPolygons( polygons );
	},
	
	// Converts a CSG object back into a Three.js Geometry.
	// This is typically done after performing CSG operations to visualize the result.
	fromCSG : function( csg_model )
	{
		// Initial check for the CSG library, similar to toCSG method.
		if ( ! CSG )
		{
			throw 'CSG library not loaded. Please get a copy from https://github.com/evanw/csg.js';
		}
		
		// Declare variables for iteration and geometry construction.
		var i, j, vertices, face,
			three_geometry = new THREE.Geometry( ), // Create a new empty Three.js Geometry.
			polygons       = csg_model.toPolygons( ); // Get the polygons from the CSG model.
		
		
		// Iterate through each polygon obtained from the CSG model.
		for ( i = 0; i < polygons.length; i++ )
		{
			// Prepare an array to hold indices of vertices for the current face.
			vertices = [ ];
			
			// For each vertex in the current CSG polygon:
			for ( j = 0; j < polygons[i].vertices.length; j++ )
			{
				// Get or create a Three.js vertex for the CSG vertex position.
				// This prevents duplicate vertices in the Three.js geometry.
				vertices.push( this.getGeometryVertice( three_geometry, polygons[i].vertices[j].pos ) );
			}
			
			// CSG polygons might have the first and last vertex identical. Remove the duplicate if so.
			if ( vertices[0] === vertices[vertices.length - 1] )
			{
				vertices.pop( );
			}
			
			// Triangulate the polygon. CSG polygons can have more than 3 vertices.
			// We create a fan triangulation from the first vertex.
			for ( var j = 2; j < vertices.length; j++ )
			{
				// Create a new Face3 (triangle) using the current vertices.
				// The normal is copied from the CSG polygon's plane normal.
				face = new THREE.Face3
				(
					vertices[0],
					vertices[j-1],
					vertices[j],
					new THREE.Vector3( ).copy( polygons[i].plane.normal )
				);
				
				// Add the newly created face to the Three.js geometry.
				three_geometry.faces.push( face );
				
				// Also add an empty UV object for texture mapping compatibility.
				three_geometry.faceVertexUvs[0].push( new THREE.UV( ) );
			}
		}
		
		// Compute the bounding box for the new geometry.
		// This is important for rendering and other Three.js operations.
		three_geometry.computeBoundingBox( );
		
		// Return the fully constructed Three.js Geometry object.
		return three_geometry;
	},
	
	// Helper function to manage vertices in a Three.js Geometry.
	// It checks if a vertex at a given position already exists and returns its index;
	// otherwise, it adds a new vertex and returns its index.
	getGeometryVertice : function( geometry, vertice_position )
	{
		var i;
		
		// Iterate through existing vertices in the geometry.
		for ( i = 0; i < geometry.vertices.length; i++ )
		{
			// Check if the current vertex matches the target position.
			if
			(
				geometry.vertices[i].x === vertice_position.x &&
				geometry.vertices[i].y === vertice_position.y &&
				geometry.vertices[i].z === vertice_position.z
			)
			{
				// If a match is found, return the index of the existing vertex.
				return i;
			}
		}
		
		// If no existing vertex matches, create a new THREE.Vector3 and add it.
		geometry.vertices.push( new THREE.Vector3( vertice_position.x, vertice_position.y, vertice_position.z ) );
		
		// Return the index of the newly added vertex.
		return geometry.vertices.length - 1;
	}
};