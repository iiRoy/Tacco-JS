/* This file contains a Type I clone of the original CSG.js library code.
 *
 * All original identifiers, variable names, function names, operators, and
 * expressions are preserved exactly as they were in the source.
 *
 * Extensive changes have been made to whitespace (indentation, spacing,
 * blank lines) and comments (addition, removal, modification) to create
 * a visually distinct but functionally identical clone.
 *
 * This version is intended for demonstration of Type I code cloning.
 *
 * ## License Information (Retained from Original)
 *
 * Copyright (c) 2013 Eduard Bespalov (edwbes@gmail.com): .solidFromSlices()
 * Copyright (c) 2013 Rene K. Mueller (http://OpenJSCAD.org): AMF export added, CSG.center([flag,flag,flag]);
 * Copyright (c) 2012 Joost Nieuwenhuijse (joost@newhouse.nl)
 * Copyright (c) 2012 Alexandre Girard (https://github.com/alx)
 * Copyright (c) 2011 Evan Wallace (http://evanw.github.com/csg.js/) -- original csg.js
 *
 * All code released under MIT license
 *
 * ## Overview (Modified for Brevity)
 * This section provides a brief overview of CSG concepts.
 *
 * The initial `csg.js` suffered from polygon fragmentation.
 * This version addresses it through:
 *
 * 1.  `CSG.PolygonTreeNode`: A separate tree to record polygon splits,
 *     allowing retrieval of original polygons if fragments are eventually
 *     retained. This helps reduce unnecessary polygon count.
 *
 * 2.  `CSG.reTesselated()`: A retesselation step that merges coplanar
 *     fragments using a linear sweep algorithm, creating larger, convex
 *     polygons.
 *
 * 3.  `CSG.canonicalized()`: A canonicalization algorithm that unifies
 *     approximately identical vertices and polygon planes, mitigating
 *     floating-point imprecision issues.
 *
 * Performance enhancements include:
 * -   `flipped()` and `inverted()` instead of `flip()` and `invert()`
 *     to avoid unnecessary cloning.
 * -   Optimized `union()` operations.
 * -   Bounding sphere checks for plane-polygon intersection tests.
 *
 * Other additions:
 * -   `CSG.Vector3D` (renamed from `CSG.Vector`).
 * -   Classes for 3D lines, 2D vectors, 2D lines, and intersection methods.
 * -   Transformations: `CSG.transform()`, `CSG.translate()`, `CSG.rotate()`, `CSG.scale()`.
 * -   `CSG.expand()` and `CSG.contract()` for solid expansion/contraction.
 * -   Removed vertex normal for simpler retesselation.
 *
 */

( function ( module ) {

  // A global debug flag, useful for development or specific logging.
  var _CSGDEBUG = false ;

  // Helper function for numeric sorting.
  function fnNumberSort ( a , b ) {

    return a - b ;

  }

  // # class CSG
  // Represents a 3D solid using a binary space partition (BSP) tree.
  // Solids can be combined using boolean operations: `union()`, `subtract()`, and `intersect()`.
  var CSG = function ( ) {

    this . polygons = [ ] ; // Array to hold the polygons defining the solid.
    this . properties = new CSG . Properties ( ) ; // Stores properties associated with the CSG object.
    this . isCanonicalized = true ; // Flag indicating if the CSG is in a canonical state.
    this . isRetesselated = true ; // Flag indicating if the CSG has been retesselated.

  } ; // End of CSG constructor.

  // Default resolution for 2D operations.
  CSG . defaultResolution2D = 32 ;
  // Default resolution for 3D operations.
  CSG . defaultResolution3D = 12 ;


  // Factory method: Constructs a CSG solid from an array of `CSG.Polygon` instances.
  CSG . fromPolygons = function ( polygons ) {

    var csg = new CSG ( ) ; // Create a new CSG object.
    csg . polygons = polygons ; // Assign the provided polygons.
    csg . isCanonicalized = false ; // Mark as not canonicalized initially.
    csg . isRetesselated = false ; // Mark as not retesselated initially.
    return csg ; // Return the new CSG object.

  } ; // End of fromPolygons.


  // Factory method: Constructs a CSG solid from generated slices.
  // Refer to `CSG.Polygon.prototype.solidFromSlices` for detailed usage.
  CSG . fromSlices = function ( options ) {

    // Creates a base polygon to initiate the slicing process.
    return ( new CSG . Polygon . createFromPoints ( [
      [ 0 , 0 , 0 ] ,
      [ 1 , 0 , 0 ] ,
      [ 1 , 1 , 0 ] ,
      [ 0 , 1 , 0 ]
    ] ) ) . solidFromSlices ( options ) ; // Call solidFromSlices on the created polygon.

  } ; // End of fromSlices.


  // Factory method: Creates a CSG object from a plain JavaScript object
  // with properties matching the CSG structure (e.g., from JSON serialization).
  CSG . fromObject = function ( obj ) {

    var polygons = obj . polygons . map ( function ( p ) { // Map raw polygon objects to CSG.Polygon instances.

      return CSG . Polygon . fromObject ( p ) ;

    } ) ;
    var csg = CSG . fromPolygons ( polygons ) ; // Create a CSG from the processed polygons.
    csg = csg . canonicalized ( ) ; // Ensure the resulting CSG is canonicalized.
    return csg ; // Return the reconstructed CSG object.

  } ; // End of fromObject.


  // Factory method: Reconstructs a CSG object from a compact binary representation.
  CSG . fromCompactBinary = function ( bin ) {

    // Check if the input binary data is indeed for a CSG object.
    if ( bin [ 'class' ] != "CSG" ) {
      throw new Error ( "Not a CSG" ) ;
    }

    var planes = [ ] , // Array to store reconstructed planes.
      planeData = bin . planeData , // Raw plane data from binary.
      numplanes = planeData . length / 4 , // Number of planes (each plane has 4 components: x, y, z, w).
      arrayindex = 0 , // Current index in the planeData array.
      x , y , z , w , normal , plane ; // Variables for plane components and objects.

    // Loop through plane data to reconstruct each plane.
    for ( var planeindex = 0 ; planeindex < numplanes ; planeindex ++ ) {
      x = planeData [ arrayindex ++ ] ;
      y = planeData [ arrayindex ++ ] ;
      z = planeData [ arrayindex ++ ] ;
      w = planeData [ arrayindex ++ ] ;
      normal = new CSG . Vector3D ( x , y , z ) ; // Create a Vector3D for the normal.
      plane = new CSG . Plane ( normal , w ) ; // Create a Plane object.
      planes . push ( plane ) ; // Add the reconstructed plane to the list.
    }

    var vertices = [ ] , // Array to store reconstructed vertices.
      vertexData = bin . vertexData , // Raw vertex data from binary.
      numvertices = vertexData . length / 3 , // Number of vertices (each vertex has 3 components: x, y, z).
      pos , vertex ; // Variables for vertex position and object.

    arrayindex = 0 ; // Reset array index for vertex data.

    // Loop through vertex data to reconstruct each vertex.
    for ( var vertexindex = 0 ; vertexindex < numvertices ; vertexindex ++ ) {
      x = vertexData [ arrayindex ++ ] ;
      y = vertexData [ arrayindex ++ ] ;
      z = vertexData [ arrayindex ++ ] ;
      pos = new CSG . Vector3D ( x , y , z ) ; // Create a Vector3D for the position.
      vertex = new CSG . Vertex ( pos ) ; // Create a Vertex object.
      vertices . push ( vertex ) ; // Add the reconstructed vertex to the list.
    }

    // Reconstruct shared properties for polygons.
    var shareds = bin . shared . map ( function ( shared ) {

      return CSG . Polygon . Shared . fromObject ( shared ) ;

    } ) ;

    var polygons = [ ] , // Array to store reconstructed polygons.
      numpolygons = bin . numPolygons , // Total number of polygons.
      numVerticesPerPolygon = bin . numVerticesPerPolygon , // Array indicating vertex count for each polygon.
      polygonVertices = bin . polygonVertices , // Flat array of vertex indices for all polygons.
      polygonPlaneIndexes = bin . polygonPlaneIndexes , // Array of plane indices for each polygon.
      polygonSharedIndexes = bin . polygonSharedIndexes , // Array of shared property indices for each polygon.
      numpolygonvertices , polygonvertices , shared , polygon ; // Local variables for polygon construction.

    // Note: 'plane' was already declared above, but it's re-used here.

    arrayindex = 0 ; // Reset array index for polygon vertex indices.

    // Loop through polygon data to reconstruct each polygon.
    for ( var polygonindex = 0 ; polygonindex < numpolygons ; polygonindex ++ ) {
      numpolygonvertices = numVerticesPerPolygon [ polygonindex ] ; // Get the number of vertices for the current polygon.
      polygonvertices = [ ] ; // Initialize an empty array for the current polygon's vertices.

      // Collect vertices for the current polygon using indices.
      for ( var i = 0 ; i < numpolygonvertices ; i ++ ) {
        polygonvertices . push ( vertices [ polygonVertices [ arrayindex ++ ] ] ) ;
      }

      plane = planes [ polygonPlaneIndexes [ polygonindex ] ] ; // Get the plane for the current polygon.
      shared = shareds [ polygonSharedIndexes [ polygonindex ] ] ; // Get the shared properties for the current polygon.
      polygon = new CSG . Polygon ( polygonvertices , shared , plane ) ; // Create the Polygon object.
      polygons . push ( polygon ) ; // Add the reconstructed polygon to the list.
    }

    var csg = CSG . fromPolygons ( polygons ) ; // Create the final CSG object from the reconstructed polygons.
    csg . isCanonicalized = true ; // Mark as canonicalized.
    csg . isRetesselated = true ; // Mark as retesselated.
    return csg ; // Return the fully reconstructed CSG.

  } ; // End of fromCompactBinary.


  CSG . prototype = { // CSG prototype methods definition.

    // Retrieves the array of polygons that define this CSG object.
    toPolygons : function ( ) {

      return this . polygons ;

    } , // End of toPolygons.


    // Performs a boolean union operation with another CSG solid.
    // Returns a new CSG solid representing the combined space of this solid and `csg`.
    // Neither this solid nor the input `csg` are modified.
    //
    // Visual representation:
    //
    //     A.union(B)
    //
    //     +-------+            +-------+
    //     |       |            |       |
    //     |   A   |            |       |
    //     |    +--+----+   =   |       +----+
    //     +----+--+    |       +----+       |
    //          |   B   |            |       |
    //          |       |            |       |
    //          +-------+            +-------+
    //
    union : function ( csg ) {

      var csgs ; // Variable to hold an array of CSG objects.

      // If the input `csg` is already an array, use it directly.
      if ( csg instanceof Array ) {

        csgs = csg ;

      } else { // Otherwise, wrap the single CSG object in an array.

        csgs = [ csg ] ;

      }

      var result = this ; // Initialize result with the current CSG object.

      // Iterate through each CSG object in the array to perform sequential unions.
      for ( var i = 0 ; i < csgs . length ; i ++ ) {

        // Determine if this is the last operation in the sequence.
        var islast = ( i == ( csgs . length - 1 ) ) ;
        // Perform the union sub-operation.
        result = result . unionSub ( csgs [ i ] , islast , islast ) ;

      }

      return result ; // Return the final union result.

    } , // End of union.


    // Internal helper for union operation.
    // `retesselate` and `canonicalize` flags control post-operation processing.
    unionSub : function ( csg , retesselate , canonicalize ) {

      // Optimization: If solids definitely don't overlap, use a simpler union.
      if ( ! this . mayOverlap ( csg ) ) {

        return this . unionForNonIntersecting ( csg ) ;

      } else { // Full BSP tree union is required.

        var a = new CSG . Tree ( this . polygons ) ; // Create BSP tree for 'this' solid.
        var b = new CSG . Tree ( csg . polygons ) ; // Create BSP tree for 'csg' solid.

        // Clip polygons of 'a' against 'b' (keep parts inside 'b' if `false` is passed).
        a . clipTo ( b , false ) ;

        // The following commented line was a known issue in older versions.
        // b.clipTo(a, true); // ERROR: this doesn't work

        // Correct clipping sequence for union:
        // Clip 'b' against 'a'.
        b . clipTo ( a ) ;
        // Invert 'b' (flip polygons).
        b . invert ( ) ;
        // Clip the inverted 'b' against 'a'.
        b . clipTo ( a ) ;
        // Invert 'b' back to its original orientation.
        b . invert ( ) ;

        // Combine all remaining polygons from both trees.
        var newpolygons = a . allPolygons ( ) . concat ( b . allPolygons ( ) ) ;
        var result = CSG . fromPolygons ( newpolygons ) ; // Create a new CSG object.
        result . properties = this . properties . _merge ( csg . properties ) ; // Merge properties.

        // Apply post-processing if requested.
        if ( retesselate ) {
          result = result . reTesselated ( ) ;
        }
        if ( canonicalize ) {
          result = result . canonicalized ( ) ;
        }

        return result ; // Return the union result.

      }

    } , // End of unionSub.


    // Optimized union operation for cases where it's guaranteed that the two solids
    // do not intersect. This avoids the overhead of BSP tree operations.
    // **Warning**: Only use if absolutely certain of non-intersection!
    unionForNonIntersecting : function ( csg ) {

      var newpolygons = this . polygons . concat ( csg . polygons ) ; // Simply combine polygon lists.
      var result = CSG . fromPolygons ( newpolygons ) ; // Create a new CSG object.
      result . properties = this . properties . _merge ( csg . properties ) ; // Merge properties.
      // If both inputs were canonicalized/retesselated, the result remains so.
      result . isCanonicalized = this . isCanonicalized && csg . isCanonicalized ;
      result . isRetesselated = this . isRetesselated && csg . isRetesselated ;
      return result ; // Return the combined CSG.

    } , // End of unionForNonIntersecting.


    // Performs a boolean subtract operation.
    // Returns a new CSG solid representing the space in this solid but not in `csg`.
    // Neither this solid nor the input `csg` are modified.
    //
    // Visual representation:
    //
    //     A.subtract(B)
    //
    //     +-------+            +-------+
    //     |       |            |       |
    //     |   A   |            |       |
    //     |    +--+----+   =   |    +--+
    //     +----+--+    |       +----+
    //          |   B   |
    //          |       |
    //          +-------+
    //
    subtract : function ( csg ) {

      var csgs ; // Variable to hold an array of CSG objects.

      // Handle single CSG object or an array of CSG objects.
      if ( csg instanceof Array ) {

        csgs = csg ;

      } else {

        csgs = [ csg ] ;

      }

      var result = this ; // Initialize result with the current CSG object.

      // Iterate through each CSG object for sequential subtractions.
      for ( var i = 0 ; i < csgs . length ; i ++ ) {

        var islast = ( i == ( csgs . length - 1 ) ) ; // Check if it's the last operation.
        result = result . subtractSub ( csgs [ i ] , islast , islast ) ; // Perform subtraction.

      }

      return result ; // Return the final subtraction result.

    } , // End of subtract.


    // Internal helper for subtract operation.
    // `retesselate` and `canonicalize` flags control post-operation processing.
    subtractSub : function ( csg , retesselate , canonicalize ) {

      var a = new CSG . Tree ( this . polygons ) ; // BSP tree for 'this' solid.
      var b = new CSG . Tree ( csg . polygons ) ; // BSP tree for 'csg' solid.

      a . invert ( ) ; // Invert 'a' (effectively making it empty space).
      a . clipTo ( b ) ; // Clip 'a' against 'b' (keep parts of 'a' that are inside 'b').
      b . clipTo ( a , true ) ; // Clip 'b' against 'a' (keep parts of 'b' that are outside 'a').
      a . addPolygons ( b . allPolygons ( ) ) ; // Add the clipped 'b' polygons to 'a'.
      a . invert ( ) ; // Invert 'a' back to restore its solid parts.

      var result = CSG . fromPolygons ( a . allPolygons ( ) ) ; // Create new CSG from 'a's polygons.
      result . properties = this . properties . _merge ( csg . properties ) ; // Merge properties.

      // Apply post-processing if requested.
      if ( retesselate ) {
        result = result . reTesselated ( ) ;
      }
      if ( canonicalize ) {
        result = result . canonicalized ( ) ;
      }

      return result ; // Return the subtraction result.

    } , // End of subtractSub.


    // Performs a boolean intersect operation.
    // Returns a new CSG solid representing the common space shared by this solid and `csg`.
    // Neither this solid nor the input `csg` are modified.
    //
    // Visual representation:
    //
    //     A.intersect(B)
    //
    //     +-------+
    //     |       |
    //     |   A   |
    //     |    +--+----+   =   +--+
    //     +----+--+    |       +--+
    //          |   B   |
    //          |       |
    //          +-------+
    //
    intersect : function ( csg ) {

      var csgs ; // Variable to hold an array of CSG objects.

      // Handle single CSG object or an array of CSG objects.
      if ( csg instanceof Array ) {

        csgs = csg ;

      } else {

        csgs = [ csg ] ;

      }

      var result = this ; // Initialize result with the current CSG object.

      // Iterate through each CSG object for sequential intersections.
      for ( var i = 0 ; i < csgs . length ; i ++ ) {

        var islast = ( i == ( csgs . length - 1 ) ) ; // Check if it's the last operation.
        result = result . intersectSub ( csgs [ i ] , islast , islast ) ; // Perform intersection.

      }

      return result ; // Return the final intersection result.

    } , // End of intersect.


    // Internal helper for intersect operation.
    // `retesselate` and `canonicalize` flags control post-operation processing.
    intersectSub : function ( csg , retesselate , canonicalize ) {

      var a = new CSG . Tree ( this . polygons ) ; // BSP tree for 'this' solid.
      var b = new CSG . Tree ( csg . polygons ) ; // BSP tree for 'csg' solid.

      a . invert ( ) ; // Invert 'a'.
      b . clipTo ( a ) ; // Clip 'b' against 'a'.
      b . invert ( ) ; // Invert 'b' back.
      a . clipTo ( b ) ; // Clip 'a' against 'b'.
      b . clipTo ( a ) ; // Clip 'b' against 'a'.
      a . addPolygons ( b . allPolygons ( ) ) ; // Add 'b's polygons to 'a'.
      a . invert ( ) ; // Invert 'a' back.

      var result = CSG . fromPolygons ( a . allPolygons ( ) ) ; // Create new CSG.
      result . properties = this . properties . _merge ( csg . properties ) ; // Merge properties.

      // Apply post-processing if requested.
      if ( retesselate ) {
        result = result . reTesselated ( ) ;
      }
      if ( canonicalize ) {
        result = result . canonicalized ( ) ;
      }

      return result ; // Return the intersection result.

    } , // End of intersectSub.


    // Returns a new CSG solid with its solid and empty space switched (inverted).
    // The original solid is not modified.
    inverse : function ( ) {

      // Map each polygon to its flipped version.
      var flippedpolygons = this . polygons . map ( function ( p ) {

        return p . flipped ( ) ;

      } ) ;

      // Create a new CSG from the flipped polygons.
      var invertedCSG = CSG . fromPolygons ( flippedpolygons ) ;

      // TODO: Consider how to properly flip or adjust properties for an inverse solid.
      // This comment points to a potential area for future enhancement.

      return invertedCSG ; // Return the inverse solid.

    } , // End of inverse.


    // Applies an affine transformation to the CSG object.
    // Returns a new CSG object, leaving the original unchanged.
    transform1 : function ( matrix4x4 ) {

      // Transform each polygon using the provided matrix.
      var newpolygons = this . polygons . map ( function ( p ) {

        return p . transform ( matrix4x4 ) ;

      } ) ;

      var result = CSG . fromPolygons ( newpolygons ) ; // Create a new CSG from transformed polygons.
      result . properties = this . properties . _transform ( matrix4x4 ) ; // Transform properties as well.
      result . isRetesselated = this . isRetesselated ; // Retesselation status is preserved.
      return result ; // Return the transformed CSG.

    } , // End of transform1.


    // Applies an affine transformation to the CSG object, optimizing for common vertices/planes.
    // Returns a new CSG object, leaving the original unchanged.
    transform : function ( matrix4x4 ) {

      var ismirror = matrix4x4 . isMirroring ( ) ; // Check if the transformation involves mirroring.
      var transformedvertices = { } ; // Cache for already transformed vertices.
      var transformedplanes = { } ; // Cache for already transformed planes.

      // Map each polygon to its transformed version.
      var newpolygons = this . polygons . map ( function ( p ) {

        var newplane ; // Variable for the transformed plane.
        var plane = p . plane ; // Get the original plane.
        var planetag = plane . getTag ( ) ; // Get a unique tag for the plane.

        // Check if this plane has already been transformed to avoid redundant calculations.
        if ( planetag in transformedplanes ) {

          newplane = transformedplanes [ planetag ] ;

        } else { // If not, transform it and store in cache.

          newplane = plane . transform ( matrix4x4 ) ;
          transformedplanes [ planetag ] = newplane ;

        }

        // Transform each vertex of the polygon.
        var newvertices = p . vertices . map ( function ( v ) {

          var newvertex ; // Variable for the transformed vertex.
          var vertextag = v . getTag ( ) ; // Get a unique tag for the vertex.

          // Check if this vertex has already been transformed.
          if ( vertextag in transformedvertices ) {

            newvertex = transformedvertices [ vertextag ] ;

          } else { // If not, transform it and store in cache.

            newvertex = v . transform ( matrix4x4 ) ;
            transformedvertices [ vertextag ] = newvertex ;

          }

          return newvertex ; // Return the transformed vertex.

        } ) ;

        // If the transformation includes mirroring, reverse the vertex order to maintain polygon orientation.
        if ( ismirror ) {
          newvertices . reverse ( ) ;
        }

        // Create and return the new transformed polygon.
        return new CSG . Polygon ( newvertices , p . shared , newplane ) ;

      } ) ;

      var result = CSG . fromPolygons ( newpolygons ) ; // Create a new CSG from the transformed polygons.
      result . properties = this . properties . _transform ( matrix4x4 ) ; // Transform properties.
      result . isRetesselated = this . isRetesselated ; // Preserve retesselation status.
      result . isCanonicalized = this . isCanonicalized ; // Preserve canonicalization status.
      return result ; // Return the transformed CSG.

    } , // End of transform.


    // Generates an STL (Stereolithography) string representation of the CSG object.
    toStlString : function ( ) {

      var result = "solid csg.js\n" ; // Start with the STL header.

      // Iterate through each polygon and append its STL representation.
      this . polygons . map ( function ( p ) {

        result += p . toStlString ( ) ;

      } ) ;

      result += "endsolid csg.js\n" ; // End with the STL footer.
      return result ; // Return the complete STL string.

    } , // End of toStlString.


    // Generates an AMF (Additive Manufacturing File) string representation of the CSG object.
    // 'm' is an optional object for metadata, e.g., { unit: "mm" }.
    toAMFString : function ( m ) {

      // Start the AMF XML structure. Include unit metadata if provided.
      var result = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<amf" + ( m && m . unit ? " unit=\"" + m . unit + "\"" : "" ) + ">\n" ;

      // Add any custom metadata provided in 'm'.
      for ( var k in m ) {

        result += "<metadata type=\"" + k + "\">" + m [ k ] + "</metadata>\n" ;

      }

      // Start object, mesh, and vertices sections.
      result += "<object id=\"0\">\n<mesh>\n<vertices>\n" ;

      // First pass: dump all unique vertices from all polygons.
      // This uses `map` for iteration, but the side effect is building the `result` string.
      this . polygons . map ( function ( p ) {

        // For each polygon, iterate through its vertices.
        for ( var i = 0 ; i < p . vertices . length ; i ++ ) {

          result += p . vertices [ i ] . toAMFString ( ) ; // Append vertex AMF representation.

        }

      } ) ;

      result += "</vertices>\n" ; // Close the vertices section.

      var n = 0 ; // Counter for vertex indices in the AMF output.

      // Second pass: dump all polygons, ensuring they are triangulated.
      this . polygons . map ( function ( p ) {

        result += "<volume>\n" ; // Start a new volume for the polygon.

        // If a polygon has fewer than 3 vertices, it cannot form a valid face.
        if ( p . vertices . length < 3 ) {
          return ; // Skip this polygon.
        }

        // Default color is blue.
        var r = 1 , g = 0.4 , b = 1 , a = 1 , colorSet = false ;

        // Check for shared color property.
        if ( p . shared && p . shared . color ) {

          r = p . shared . color [ 0 ] ;
          g = p . shared . color [ 1 ] ;
          b = p . shared . color [ 2 ] ;
          a = p . shared . color [ 3 ] ;
          colorSet = true ;

        } else if ( p . color ) { // Check for direct polygon color property.

          r = p . color [ 0 ] ;
          g = p . color [ 1 ] ;
          b = p . color [ 2 ] ;
          // If alpha component exists, use it.
          if ( p . color . length > 3 ) {
            a = p . color [ 3 ] ;
          }
          colorSet = true ;

        }

        // Append color information to the volume.
        result += "<color><r>" + r + "</r><g>" + g + "</g><b>" + b + "</b>" + ( a !== undefined ? "<a>" + a + "</a>" : "" ) + "</color>" ;

        // Triangulate the polygon and append triangle definitions.
        for ( var i = 0 ; i < p . vertices . length - 2 ; i ++ ) {

          result += "<triangle>" ;
          // Vertex indices are relative to the current position 'n'.
          result += "<v1>" + ( n ) + "</v1>" ;
          result += "<v2>" + ( n + i + 1 ) + "</v2>" ;
          result += "<v3>" + ( n + i + 2 ) + "</v3>" ;
          result += "</triangle>\n" ;

        }

        n += p . vertices . length ; // Advance vertex index counter for the next polygon.
        result += "</volume>\n" ; // Close the volume section.

      } ) ;

      result += "</mesh>\n</object>\n" ; // Close mesh and object sections.
      result += "</amf>\n" ; // Close the AMF root element.
      return result ; // Return the complete AMF string.

    } , // End of toAMFString.


    // Generates an X3D string representation of the CSG object.
    toX3D : function ( ) {

      // materialPolygonLists:
      //  key: a color string (e.g. "0 1 1" for yellow)
      //  value: an array of strings specifying polygons of this color
      //         (as space-separated indices into vertexCoords)
      var materialPolygonLists = { } ,

        // list of coordinates (as "x y z" strings)
        vertexCoords = [ ] ,

        // map to look up the index in vertexCoords of a given vertex
        vertexTagToCoordIndexMap = { } ;


      // Process each polygon to extract vertex coordinates and group by material/color.
      this . polygons . map ( function ( p ) {

        var red = 0 , // Default red component.
          green = 0 , // Default green component.
          blue = 1 ; // Default blue component (blue).

        // If the polygon has shared properties with a color, use that color.
        if ( p . shared && p . shared . color ) {

          red = p . shared . color [ 0 ] ;
          green = p . shared . color [ 1 ] ;
          blue = p . shared . color [ 2 ] ;

        }

        var polygonVertexIndices = [ ] , // Array to store indices of vertices for the current polygon.
          numvertices = p . vertices . length , // Number of vertices in the current polygon.
          vertex ; // Current vertex object.

        // Iterate through each vertex of the polygon.
        for ( var i = 0 ; i < numvertices ; i ++ ) {

          vertex = p . vertices [ i ] ; // Get the current vertex.

          // If this vertex's tag is not yet in the map (meaning it's a new unique vertex).
          if ( ! ( vertex . getTag ( ) in vertexTagToCoordIndexMap ) ) {

            // Add its coordinates to the vertexCoords array.
            vertexCoords . push ( vertex . pos . _x . toString ( ) + " " +
              vertex . pos . _y . toString ( ) + " " +
              vertex . pos . _z . toString ( )
            ) ;

            // Store the index of this new vertex in the map.
            vertexTagToCoordIndexMap [ vertex . getTag ( ) ] = vertexCoords . length - 1 ;

          } // End of if (unique vertex check).