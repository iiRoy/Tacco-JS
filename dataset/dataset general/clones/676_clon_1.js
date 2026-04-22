'use strict';
window.ThreeBSP = ( function ( ) {

    // Define core ThreeBSP object and enumeration-like constants.
    var ThreeBSP ,

        EPSILON  =  1e-5  , // A small floating-point tolerance for comparisons.
        COPLANAR = 0      , // Polygon is on the plane.
        FRONT    = 1      , // Polygon is in front of the plane.
        BACK     = 2      , // Polygon is behind the plane.
        SPANNING = 3      ; // Polygon intersects and spans the plane.


    ThreeBSP = function (  geometry  )
    {
        /*
         * Constructor for ThreeBSP. It takes a THREE.Geometry, THREE.Mesh,
         * or an existing ThreeBSP.Node and converts it into a BSP tree.
         */
        var i , _length_i ;

        var face        , vertex    , faceVertexUvs , uvs ; // Variables for geometry processing.
        var polygon                                       ; // Current polygon being processed.
        var polygons    = [ ]                             ; // Accumulator for all generated polygons.
        var tree                                          ; // Placeholder, not used directly here.


        // Determine the type of input geometry and handle accordingly.
        if ( geometry  instanceof  THREE.Geometry )
        {
            this.matrix = new THREE.Matrix4 ( ) ; // Initialize with an identity matrix.
        }
        else if ( geometry  instanceof  THREE.Mesh )
        {
            // TODO: Enhance this section to properly support object hierarchies.
            geometry.updateMatrix ( ) ; // Ensure the mesh's matrix is up-to-date.
            this.matrix = geometry.matrix.clone ( ) ; // Clone the mesh's transformation matrix.
            geometry = geometry.geometry ; // Extract the underlying THREE.Geometry.
        }
        else if ( geometry  instanceof  ThreeBSP.Node )
        {
            this.tree = geometry ; // If it's already a BSP node, just assign it.
            this.matrix = new THREE.Matrix4 ( ) ; // An identity matrix for a pre-existing node.
            return this ; // Exit early as the tree is already formed.
        }
        else
        {
            // If the input type is neither supported, throw an error.
            throw 'ThreeBSP: Given geometry is unsupported' ;
        }


        // Iterate over each face in the THREE.Geometry to create ThreeBSP.Polygon objects.
        for ( i = 0 , _length_i = geometry.faces.length ; i < _length_i ; i ++ )
        {
            face          = geometry.faces[ i ] ;
            faceVertexUvs = geometry.faceVertexUvs[ 0 ][ i ] ; // Retrieve UVs for the current face.
            polygon       = new ThreeBSP.Polygon ( ) ; // Create a new polygon instance.

            // Handle triangular faces (THREE.Face3).
            if ( face  instanceof  THREE.Face3 )
            {
                vertex = geometry.vertices[ face.a ] ;
                uvs = faceVertexUvs ? new THREE.Vector2 ( faceVertexUvs[ 0 ].x , faceVertexUvs[ 0 ].y ) : null ;
                vertex = new ThreeBSP.Vertex ( vertex.x , vertex.y , vertex.z , face.vertexNormals[ 0 ] , uvs ) ;
                vertex.applyMatrix4 ( this.matrix ) ; // Apply the mesh's transformation matrix to the vertex.
                polygon.vertices.push ( vertex ) ;

                vertex = geometry.vertices[ face.b ] ;
                uvs = faceVertexUvs ? new THREE.Vector2 ( faceVertexUvs[ 1 ].x , faceVertexUvs[ 1 ].y ) : null ;
                vertex = new ThreeBSP.Vertex ( vertex.x , vertex.y , vertex.z , face.vertexNormals[ 2 ] , uvs ) ;
                vertex.applyMatrix4 ( this.matrix ) ;
                polygon.vertices.push ( vertex ) ;

                vertex = geometry.vertices[ face.c ] ;
                uvs = faceVertexUvs ? new THREE.Vector2 ( faceVertexUvs[ 2 ].x , faceVertexUvs[ 2 ].y ) : null ;
                vertex = new ThreeBSP.Vertex ( vertex.x , vertex.y , vertex.z , face.vertexNormals[ 2 ] , uvs ) ;
                vertex.applyMatrix4 ( this.matrix ) ;
                polygon.vertices.push ( vertex ) ;
            }
            // Handle quadrilateral faces (THREE.Face4).
            else if ( typeof THREE.Face4 ) // This condition technically checks if `THREE.Face4` is defined, not if `face` is an instance of it. Retaining for Type I.
            {
                vertex = geometry.vertices[ face.a ] ;
                uvs = faceVertexUvs ? new THREE.Vector2 ( faceVertexUvs[ 0 ].x , faceVertexUvs[ 0 ].y ) : null ;
                vertex = new ThreeBSP.Vertex ( vertex.x , vertex.y , vertex.z , face.vertexNormals[ 0 ] , uvs ) ;
                vertex.applyMatrix4 ( this.matrix ) ;
                polygon.vertices.push ( vertex ) ;

                vertex = geometry.vertices[ face.b ] ;
                uvs = faceVertexUvs ? new THREE.Vector2 ( faceVertexUvs[ 1 ].x , faceVertexUvs[ 1 ].y ) : null ;
                vertex = new ThreeBSP.Vertex ( vertex.x , vertex.y , vertex.z , face.vertexNormals[ 1 ] , uvs ) ;
                vertex.applyMatrix4 ( this.matrix ) ;
                polygon.vertices.push ( vertex ) ;

                vertex = geometry.vertices[ face.c ] ;
                uvs = faceVertexUvs ? new THREE.Vector2 ( faceVertexUvs[ 2 ].x , faceVertexUvs[ 2 ].y ) : null ;
                vertex = new ThreeBSP.Vertex ( vertex.x , vertex.y , vertex.z , face.vertexNormals[ 2 ] , uvs ) ;
                vertex.applyMatrix4 ( this.matrix ) ;
                polygon.vertices.push ( vertex ) ;

                vertex = geometry.vertices[ face.d ] ;
                uvs = faceVertexUvs ? new THREE.Vector2 ( faceVertexUvs[ 3 ].x , faceVertexUvs[ 3 ].y ) : null ;
                vertex = new ThreeBSP.Vertex ( vertex.x , vertex.y , vertex.z , face.vertexNormals[ 3 ] , uvs ) ;
                vertex.applyMatrix4 ( this.matrix ) ;
                polygon.vertices.push ( vertex ) ;
            }
            else
            {
                // Catch-all for unsupported face types.
                throw 'Invalid face type at index ' + i ;
            }

            polygon.calculateProperties ( ) ; // Compute the normal and 'w' for the polygon.
            polygons.push ( polygon ) ; // Add the newly created polygon to our list.
        } ;

        // Construct the BSP tree from the collection of polygons.
        this.tree = new ThreeBSP.Node ( polygons ) ;
    } ;


    ThreeBSP.prototype.subtract = function ( other_tree )
    {
        // Performs a boolean subtraction operation: `this` - `other_tree`.
        var a = this.tree.clone ( ) ,
            b = other_tree.tree.clone ( ) ;

        a.invert ( ) ;
        a.clipTo ( b ) ;
        b.clipTo ( a ) ;
        b.invert ( ) ;
        b.clipTo ( a ) ;
        b.invert ( ) ;
        a.build ( b.allPolygons ( ) ) ;
        a.invert ( ) ;
        a = new ThreeBSP ( a ) ;
        a.matrix = this.matrix ; // Preserve the original transformation matrix.
        return a ;
    } ;


    ThreeBSP.prototype.union = function ( other_tree )
    {
        // Performs a boolean union operation: `this` + `other_tree`.
        var a = this.tree.clone ( ) ,
            b = other_tree.tree.clone ( ) ;

        a.clipTo ( b ) ;
        b.clipTo ( a ) ;
        b.invert ( ) ;
        b.clipTo ( a ) ;
        b.invert ( ) ;
        a.build ( b.allPolygons ( ) ) ;
        a = new ThreeBSP ( a ) ;
        a.matrix = this.matrix ;
        return a ;
    } ;


    ThreeBSP.prototype.intersect = function ( other_tree )
    {
        // Performs a boolean intersection operation: `this` AND `other_tree`.
        var a = this.tree.clone ( ) ,
            b = other_tree.tree.clone ( ) ;

        a.invert ( ) ;
        b.clipTo ( a ) ;
        b.invert ( ) ;
        a.clipTo ( b ) ;
        b.clipTo ( a ) ;
        a.build ( b.allPolygons ( ) ) ;
        a.invert ( ) ;
        a = new ThreeBSP ( a ) ;
        a.matrix = this.matrix ;
        return a ;
    } ;


    ThreeBSP.prototype.toGeometry = function ( )
    {
        // Converts the internal BSP tree back into a standard THREE.Geometry object.
        var i , j ;
        var matrix = new THREE.Matrix4 ( ).getInverse ( this.matrix ) ; // Inverse matrix to revert transformations.
        var geometry = new THREE.Geometry ( ) ; // New THREE.Geometry to populate.
        var polygons = this.tree.allPolygons ( ) ; // Retrieve all polygons from the BSP tree.
        var polygon_count = polygons.length ;

        var polygon , polygon_vertice_count ;
        var vertice_dict = { } ; // Dictionary for deduplicating vertices.
        var vertex_idx_a , vertex_idx_b , vertex_idx_c ; // Indices for the face vertices.
        var vertex , face ;
        var verticeUvs ;

        for ( i = 0 ; i < polygon_count ; i ++ )
        {
            polygon = polygons[ i ] ;
            polygon_vertice_count = polygon.vertices.length ;

            // Triangulate the polygon (assuming it's convex).
            // Creates triangles (0, j-1, j) for j starting from 2.
            for ( j = 2 ; j < polygon_vertice_count ; j ++ )
            {
                verticeUvs = [ ] ; // Array to hold UVs for the current face.

                // Process first vertex of the triangle.
                vertex = polygon.vertices[ 0 ] ;
                verticeUvs.push ( new THREE.Vector2 ( vertex.uv.x , vertex.uv.y ) ) ;
                vertex = new THREE.Vector3 ( vertex.x , vertex.y , vertex.z ) ;
                vertex.applyMatrix4 ( matrix ) ; // Apply inverse transformation.

                if ( typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] !== 'undefined' )
                {
                    vertex_idx_a = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] ;
                }
                else
                {
                    geometry.vertices.push ( vertex ) ;
                    vertex_idx_a = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1 ;
                }

                // Process second vertex of the triangle.
                vertex = polygon.vertices[ j - 1 ] ;
                verticeUvs.push ( new THREE.Vector2 ( vertex.uv.x , vertex.uv.y ) ) ;
                vertex = new THREE.Vector3 ( vertex.x , vertex.y , vertex.z ) ;
                vertex.applyMatrix4 ( matrix ) ;
                if ( typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] !== 'undefined' )
                {
                    vertex_idx_b = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] ;
                }
                else
                {
                    geometry.vertices.push ( vertex ) ;
                    vertex_idx_b = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1 ;
                }

                // Process third vertex of the triangle.
                vertex = polygon.vertices[ j ] ;
                verticeUvs.push ( new THREE.Vector2 ( vertex.uv.x , vertex.uv.y ) ) ;
                vertex = new THREE.Vector3 ( vertex.x , vertex.y , vertex.z ) ;
                vertex.applyMatrix4 ( matrix ) ;
                if ( typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] !== 'undefined' )
                {
                    vertex_idx_c = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] ;
                }
                else
                {
                    geometry.vertices.push ( vertex ) ;
                    vertex_idx_c = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1 ;
                }

                // Create a new THREE.Face3 with computed vertex indices and normal.
                face = new THREE.Face3 (
                    vertex_idx_a ,
                    vertex_idx_b ,
                    vertex_idx_c ,
                    new THREE.Vector3 ( polygon.normal.x , polygon.normal.y , polygon.normal.z )
                ) ;

                geometry.faces.push ( face ) ; // Add the face to the geometry.
                geometry.faceVertexUvs[ 0 ].push ( verticeUvs ) ; // Add the corresponding UVs.
            }

        }
        return geometry ; // Return the generated THREE.Geometry.
    } ;


    ThreeBSP.prototype.toMesh = function ( material )
    {
        // Converts the ThreeBSP object into a renderable THREE.Mesh.
        var geometry = this.toGeometry ( ) ,
            mesh = new THREE.Mesh ( geometry , material ) ;

        // Apply the original position and rotation from the matrix to the mesh.
        mesh.position.setFromMatrixPosition ( this.matrix ) ;
        mesh.rotation.setFromRotationMatrix ( this.matrix ) ;

        return mesh ;
    } ;


    /*
     * ThreeBSP.Polygon: Represents a convex polygon used within the BSP tree.
     * It stores its vertices, a normal vector, and the 'w' component of its plane equation.
     */
    ThreeBSP.Polygon = function ( vertices , normal , w )
    {
        // Ensure 'vertices' is an array; if not, initialize it as an empty one.
        if ( ! ( vertices  instanceof  Array ) )
        {
            vertices = [ ] ;
        }

        this.vertices = vertices ;
        if ( vertices.length > 0 )
        {
            this.calculateProperties ( ) ; // Calculate normal and 'w' if vertices are present.
        }
        else
        {
            this.normal = this.w = undefined ; // Otherwise, these properties are undefined.
        }
    } ;


    ThreeBSP.Polygon.prototype.calculateProperties = function ( )
    {
        // Computes the plane's normal vector and 'w' value from the first three vertices.
        var a = this.vertices[ 0 ] ,
            b = this.vertices[ 1 ] ,
            c = this.vertices[ 2 ] ;

        // Normal is calculated as the cross product of two edges (b-a) and (c-a), then normalized.
        this.normal = b.clone ( ).subtract ( a ).cross (
            c.clone ( ).subtract ( a )
        ).normalize ( ) ;

        // 'w' is the distance from the origin to the plane along the normal.
        this.w = this.normal.clone ( ).dot ( a ) ;

        return this ; // Allow method chaining.
    } ;


    ThreeBSP.Polygon.prototype.clone = function ( )
    {
        // Creates a deep copy of the polygon, cloning all its vertices.
        var i , vertice_count ;
        var polygon = new ThreeBSP.Polygon ; // Create a new empty polygon.

        for ( i = 0 , vertice_count = this.vertices.length ; i < vertice_count ; i ++ )
        {
            polygon.vertices.push ( this.vertices[ i ].clone ( ) ) ; // Clone each vertex.
        } ;
        polygon.calculateProperties ( ) ; // Recalculate properties for the new polygon.

        return polygon ;
    } ;


    ThreeBSP.Polygon.prototype.flip = function ( )
    {
        // Reverses the polygon's orientation by flipping its normal and reversing its vertex order.
        var i , vertices = [ ] ;

        this.normal.multiplyScalar ( -1 ) ; // Invert the normal vector.
        this.w *= -1 ; // Invert the 'w' value.

        for ( i = this.vertices.length - 1 ; i >= 0 ; i -- )
        {
            vertices.push ( this.vertices[ i ] ) ; // Reverse the order of vertices.
        } ;
        this.vertices = vertices ; // Update the polygon's vertices.

        return this ;
    } ;


    ThreeBSP.Polygon.prototype.classifyVertex = function ( vertex )
    {
        // Classifies a single vertex relative to the plane of this polygon.
        // Returns COPLANAR, FRONT, or BACK.
        var side_value = this.normal.dot ( vertex ) - this.w ;

        if ( side_value < -EPSILON )
        {
            return BACK ;
        }
        else if ( side_value > EPSILON )
        {
            return FRONT ;
        }
        else
        {
            return COPLANAR ;
        }
    } ;


    ThreeBSP.Polygon.prototype.classifySide = function ( polygon )
    {
        // Classifies an entire polygon relative to the plane of this polygon.
        // Returns COPLANAR, FRONT, BACK, or SPANNING.
        var i , vertex , classification ;
        var num_positive = 0 ;
        var num_negative = 0 ;
        var vertice_count = polygon.vertices.length ;

        for ( i = 0 ; i < vertice_count ; i ++ )
        {
            vertex = polygon.vertices[ i ] ;
            classification = this.classifyVertex ( vertex ) ;
            if ( classification === FRONT )
            {
                num_positive ++ ;
            }
            else if ( classification === BACK )
            {
                num_negative ++ ;
            }
        }

        if ( num_positive > 0  &&  num_negative === 0 )
        {
            return FRONT ;
        }
        else if ( num_positive === 0  &&  num_negative > 0 )
        {
            return BACK ;
        }
        else if ( num_positive === 0  &&  num_negative === 0 )
        {
            return COPLANAR ;
        }
        else
        {
            return SPANNING ; // Some vertices are in front, some are behind.
        }
    } ;


    ThreeBSP.Polygon.prototype.splitPolygon = function ( polygon , coplanar_front , coplanar_back , front , back )
    {
        // Splits a given polygon by the plane of this polygon, distributing resulting parts into arrays.
        var classification = this.classifySide ( polygon ) ;

        if ( classification === COPLANAR )
        {
            // If the polygon is coplanar, decide if it's facing the same way or opposite.
            ( this.normal.dot ( polygon.normal ) > 0  ?  coplanar_front  :  coplanar_back ).push ( polygon ) ;
        }
        else if ( classification === FRONT )
        {
            front.push ( polygon ) ; // Polygon is entirely in front.
        }
        else if ( classification === BACK )
        {
            back.push ( polygon ) ; // Polygon is entirely behind.
        }
        else // classification === SPANNING
        {
            // The polygon spans the plane, so it must be split.
            var vertice_count ;
            var i , j , ti , tj , vi , vj ;
            var t , v ;
            var f = [ ] ; // Vertices for the front part.
            var b = [ ] ; // Vertices for the back part.

            for ( i = 0 , vertice_count = polygon.vertices.length ; i < vertice_count ; i ++ )
            {
                j = ( i + 1 ) % vertice_count ; // Get the next vertex index (circularly).
                vi = polygon.vertices[ i ] ;
                vj = polygon.vertices[ j ] ;
                ti = this.classifyVertex ( vi ) ; // Classify current vertex.
                tj = this.classifyVertex ( vj ) ; // Classify next vertex.

                if ( ti != BACK ) f.push ( vi ) ; // Add to front if not behind.
                if ( ti != FRONT ) b.push ( vi ) ; // Add to back if not in front.

                // If the edge (vi, vj) crosses the plane, calculate the intersection point.
                if ( ( ti | tj ) === SPANNING )
                {
                    t = ( this.w - this.normal.dot ( vi ) ) / this.normal.dot ( vj.clone ( ).subtract ( vi ) ) ;
                    v = vi.interpolate ( vj , t ) ; // Interpolate to find the new vertex at the intersection.
                    f.push ( v ) ; // Add intersection vertex to both lists.
                    b.push ( v ) ;
                }
            }


            // If the split parts form valid polygons (3 or more vertices), add them.
            if ( f.length >= 3 ) front.push ( new ThreeBSP.Polygon ( f ).calculateProperties ( ) ) ;
            if ( b.length >= 3 ) back.push ( new ThreeBSP.Polygon ( b ).calculateProperties ( ) ) ;
        }
    } ;


    /*
     * ThreeBSP.Vertex: Represents a single vertex with position (x,y,z), normal, and UV coordinates.
     */
    ThreeBSP.Vertex = function ( x , y , z , normal , uv )
    {
        this.x = x ;
        this.y = y ;
        this.z = z ;
        this.normal = normal || new THREE.Vector3 ( ) ; // Default normal to a new Vector3 if none provided.
        this.uv = uv || new THREE.Vector2 ( ) ;       // Default UV to a new Vector2 if none provided.
    } ;


    ThreeBSP.Vertex.prototype.clone = function ( )
    {
        // Creates a deep clone of the vertex, including its normal and UVs.
        return new ThreeBSP.Vertex ( this.x , this.y , this.z , this.normal.clone ( ) , this.uv.clone ( ) ) ;
    } ;


    ThreeBSP.Vertex.prototype.add = function ( vertex )
    {
        // Adds the components of another vertex to this one.
        this.x += vertex.x ;
        this.y += vertex.y ;
        this.z += vertex.z ;
        return this ;
    } ;


    ThreeBSP.Vertex.prototype.subtract = function ( vertex )
    {
        // Subtracts the components of another vertex from this one.
        this.x -= vertex.x ;
        this.y -= vertex.y ;
        this.z -= vertex.z ;
        return this ;
    } ;


    ThreeBSP.Vertex.prototype.multiplyScalar = function ( scalar )
    {
        // Multiplies all components of the vertex by a scalar value.
        this.x *= scalar ;
        this.y *= scalar ;
        this.z *= scalar ;
        return this ;
    } ;


    ThreeBSP.Vertex.prototype.cross = function ( vertex )
    {
        // Computes the cross product of this vertex (as a vector) with another vertex.
        var x = this.x ,
            y = this.y ,
            z = this.z ;

        this.x = y * vertex.z - z * vertex.y ;
        this.y = z * vertex.x - x * vertex.z ;
        this.z = x * vertex.y - y * vertex.x ;

        return this ;
    } ;


    ThreeBSP.Vertex.prototype.normalize = function ( )
    {
        // Normalizes this vertex (treated as a vector) to have a unit length.
        var length = Math.sqrt ( this.x * this.x + this.y * this.y + this.z * this.z ) ;

        this.x /= length ;
        this.y /= length ;
        this.z /= length ;

        return this ;
    } ;


    ThreeBSP.Vertex.prototype.dot = function ( vertex )
    {
        // Computes the dot product of this vertex (as a vector) with another vertex.
        return this.x * vertex.x + this.y * vertex.y + this.z * vertex.z ;
    } ;


    ThreeBSP.Vertex.prototype.lerp = function ( a , t )
    {
        // Linearly interpolates this vertex towards vertex 'a' by a factor 't'.
        // Also interpolates normals and UVs.
        this.add (
            a.clone ( ).subtract ( this ).multiplyScalar ( t )
        ) ;

        this.normal.add (
            a.normal.clone ( ).sub ( this.normal ).multiplyScalar ( t )
        ) ;

        this.uv.add (
            a.uv.clone ( ).sub ( this.uv ).multiplyScalar ( t )
        ) ;

        return this ;
    } ;


    ThreeBSP.Vertex.prototype.interpolate = function ( other , t )
    {
        // Returns a new vertex that is the linear interpolation between this and 'other'.
        return this.clone ( ).lerp ( other , t ) ;
    } ;


    ThreeBSP.Vertex.prototype.applyMatrix4 = function ( m )
    {
        /*
         * Applies a THREE.Matrix4 affine transformation matrix to the vertex's position.
         * This method only transforms the vertex's spatial coordinates (x, y, z).
         */
        var x = this.x , y = this.y , z = this.z ;

        var e = m.elements ; // Get the matrix elements for direct access.

        // Perform the matrix multiplication for the position vector.
        this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ;
        this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ;
        this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ;

        return this ; // Return 'this' for method chaining.
    } ;


    /*
     * ThreeBSP.Node: Represents a node within the Binary Space Partitioning tree.
     * Each node acts as a plane (defined by its 'divider' polygon) and holds
     * references to polygons coplanar with itself, and child nodes for polygons
     * in front and behind its plane.
     */
    ThreeBSP.Node = function ( polygons )
    {
        var i , polygon_count ;
        var front = [ ] ,
            back = [ ] ;

        this.polygons = [ ] ; // Polygons that are coplanar with this node's divider.
        this.front = this.back = undefined ; // References to front and back child nodes.

        // If no polygons are provided or the array is empty, this node remains uninitialized.
        if ( ! ( polygons  instanceof  Array )  ||  polygons.length === 0 ) return ;

        this.divider = polygons[ 0 ].clone ( ) ; // The first polygon defines the plane for this node.

        // Split all other polygons by this node's divider.
        for ( i = 0 , polygon_count = polygons.length ; i < polygon_count ; i ++ )
        {
            this.divider.splitPolygon ( polygons[ i ] , this.polygons , this.polygons , front , back ) ;
        }

        // Recursively build the front and back child nodes.
        if ( front.length > 0 )
        {
            this.front = new ThreeBSP.Node ( front ) ;
        }

        if ( back.length > 0 )
        {
            this.back = new ThreeBSP.Node ( back ) ;
        }
    } ;


    ThreeBSP.Node.isConvex = function ( polygons )
    {
        // Determines if a collection of polygons forms a convex shape.
        // This is typically used internally for validation or optimization.
        var i , j ;
        for ( i = 0 ; i < polygons.length ; i ++ )
        {
            for ( j = 0 ; j < polygons.length ; j ++ )
            {
                if ( i !== j  &&  polygons[ i ].classifySide ( polygons[ j ] ) !== BACK )
                {
                    return false ; // If any polygon is not entirely behind another, the set is not convex.
                }
            }
        }
        return true ; // All polygons are either behind or coplanar to each other.
    } ;


    ThreeBSP.Node.prototype.build = function ( polygons )
    {
        // Builds or rebuilds the BSP tree node using a new set of polygons.
        var i , polygon_count ;
        var front = [ ] ,
            back = [ ] ;

        // If this node doesn't have a divider yet, use the first incoming polygon.
        if ( ! this.divider )
        {
            this.divider = polygons[ 0 ].clone ( ) ;
        }

        // Split all incoming polygons against this node's divider.
        for ( i = 0 , polygon_count = polygons.length ; i < polygon_count ; i ++ )
        {
            this.divider.splitPolygon ( polygons[ i ] , this.polygons , this.polygons , front , back ) ;
        }

        // Recursively build or update the front child node.
        if ( front.length > 0 )
        {
            if ( ! this.front ) this.front = new ThreeBSP.Node ( ) ; // Create a new node if it doesn't exist.
            this.front.build ( front ) ;
        }

        // Recursively build or update the back child node.
        if ( back.length > 0 )
        {
            if ( ! this.back ) this.back = new ThreeBSP.Node ( ) ;
            this.back.build ( back ) ;
        }
    } ;


    ThreeBSP.Node.prototype.allPolygons = function ( )
    {
        // Collects and returns all polygons from this node and all its descendants.
        var polygons = this.polygons.slice ( ) ; // Start with polygons coplanar to this node.
        if ( this.front ) polygons = polygons.concat ( this.front.allPolygons ( ) ) ; // Add polygons from the front child.
        if ( this.back ) polygons = polygons.concat ( this.back.allPolygons ( ) ) ;   // Add polygons from the back child.
        return polygons ; // Return the combined list of polygons.
    } ;


    ThreeBSP.Node.prototype.clone = function ( )
    {
        // Creates a deep clone of this BSP node and its entire subtree.
        var node = new ThreeBSP.Node ( ) ; // Start with an empty, new node.

        // Clone the divider polygon if it exists.
        if ( this.divider )
        {
            node.divider = this.divider.clone ( ) ;
        }

        // Clone all polygons coplanar with this node's divider.
        node.polygons = this.polygons.map ( function ( p ) { return p.clone ( ) ; } ) ;

        // Recursively clone the front and back child nodes.
        if ( this.front )
        {
            node.front = this.front.clone ( ) ;
        }
        if ( this.back )
        {
            node.back = this.back.clone ( ) ;
        }

        return node ; // Return the fully cloned node.
    } ;


    ThreeBSP.Node.prototype.invert = function ( )
    {
        // Inverts the BSP tree node: flips its divider, all coplanar polygons,
        // and recursively inverts and swaps its front and back children.
        var i , polygon_count ;

        for ( i = 0 , polygon_count = this.polygons.length ; i < polygon_count ; i ++ )
        {
            this.polygons[ i ].flip ( ) ; // Flip each coplanar polygon.
        }

        this.divider.flip ( ) ; // Flip the divider polygon.

        // Recursively invert child nodes if they exist.
        if ( this.front ) this.front.invert ( ) ;
        if ( this.back ) this.back.invert ( ) ;

        // Swap the front and back child references.
        var temp = this.front ;
        this.front = this.back ;
        this.back = temp ;

        return this ; // Allow method chaining.
    } ;


    ThreeBSP.Node.prototype.clipPolygons = function ( polygons )
    {
        // Clips a given list of polygons against this BSP tree node.
        // It returns only the portions of polygons that are "in front" of or coplanar with the tree.
        var i , polygon_count ;
        var front = [ ] ,
            back = [ ] ;

        // If this node has no divider, there's nothing to clip against, so return all polygons.
        if ( ! this.divider ) return polygons ;

        // Split each polygon from the input list by this node's divider.
        for ( i = 0 , polygon_count = polygons.length ; i < polygon_count ; i ++ )
        {
            this.divider.splitPolygon ( polygons[ i ] , front , back , front , back ) ;
        }

        // Recursively clip the 'front' polygons against the front child node.
        if ( this.front ) front = this.front.clipPolygons ( front ) ;
        // Polygons classified as 'back' are discarded at this level.
        if ( this.back ) back = this.back.clipPolygons ( back ) ; // Note: `back` polygons are usually discarded in typical BSP clipping, but this function structure keeps `back` processing symmetric. However, the return only includes `front` and `this.polygons`.

        // Combine the clipped 'front' polygons and the polygons coplanar to this node.
        return front.concat ( this.polygons ) ;
    } ;


    ThreeBSP.Node.prototype.clipTo = function ( bsp )
    {
        // Clips this BSP tree against another BSP tree (`bsp`).
        // This operation effectively removes any part of `this` tree that lies inside `bsp`.
        this.polygons = bsp.clipPolygons ( this.polygons ) ; // Clip this node's coplanar polygons.
        if ( this.front ) this.front.clipTo ( bsp ) ; // Recursively clip the front child.
        if ( this.back ) this.back.clipTo ( bsp ) ;   // Recursively clip the back child.
    } ;


    return ThreeBSP ; // Expose the main ThreeBSP constructor.

} ) ( ) ; // Immediately-invoked function expression (IIFE) to create a private scope.