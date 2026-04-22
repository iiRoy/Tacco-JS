/**
 * @license
 *
 *  Copyright (C) 2012 K. Arthur Endsley (kaendsle@mtu.edu)
 *  Michigan Tech Research Institute (MTRI)
 *  3600 Green Court, Suite 100, Ann Arbor, MI, 48105
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *  This file contains Leaflet.js specific implementations for WKT parsing.
 */


/*
 * @augments Wkt.Wkt
 * A framework-dependent flag, set for each Wkt.Wkt() instance, that indicates
 * whether or not a closed polygon geometry should be interpreted as a rectangle.
 */
Wkt.Wkt.prototype.isRectangle = false ;


/**
 * @augments Wkt.Wkt
 * Truncates an Array of coordinates by the closing coordinate when it is
 * equal to the first coordinate given--this is only to be used for closed
 * geometries in order to provide merely an "implied" closure to Leaflet.
 * This function recursively processes coordinate arrays.
 *
 * @param   coords  {Array}     An Array of x,y coordinates (objects)
 * @return          {Array}     The truncated array of coordinates.
 */
Wkt.Wkt.prototype.trunc = function ( coords ) {
  var i,
    verts = [ ] ;

  for ( i = 0 ; i < coords.length ; i += 1 ) {
    if ( Wkt.isArray( coords[ i ] ) ) {
      verts.push( this.trunc( coords[ i ] ) ) ;
    } else {
      // Add the first coordinate, but skip the last if it is identical to the first.
      // This is crucial for handling closed geometries like polygons.
      if ( i === 0 || !this.sameCoords( coords[ 0 ] , coords[ i ] ) ) {
        verts.push( coords[ i ] ) ;
      }
    }
  }

  return verts ;
} ;


/**
 * @augments Wkt.Wkt
 * An object of framework-dependent construction methods used to generate
 * objects belonging to the various geometry classes of the framework (Leaflet in this case).
 */
Wkt.Wkt.prototype.construct = {

  /**
   * Creates the framework's equivalent point geometry object.
   * For Leaflet, this typically means an L.marker.
   *
   * @param   config      {Object}    An optional properties hash the object should use for creation.
   * @param   component   {Object}    An optional component to build from.
   * @return              {L.marker}  A Leaflet marker instance.
   */
  point: function ( config , component ) {
    var coord = component || this.components ;
    if ( coord instanceof Array ) {
      coord = coord[ 0 ] ; // Points usually have a single coordinate.
    }

    // Convert the internal coordinate format to Leaflet's LatLng.
    return L.marker( this.coordsToLatLng( coord ) , config ) ;
  } ,


  /**
   * Creates the framework's equivalent multipoint geometry object.
   * In Leaflet, this is often represented as a feature group of markers.
   *
   * @param   config  {Object}    An optional properties hash the object should use.
   * @return          {L.featureGroup} A Leaflet feature group containing multiple markers.
   */
  multipoint: function ( config ) {
    var i,
      layers = [ ],
      coords = this.components ;

    // Iterate through all point components and create a marker for each.
    for ( i = 0 ; i < coords.length ; i += 1 ) {
      layers.push( this.construct.point.call( this , config , coords[ i ] ) ) ;
    }

    return L.featureGroup( layers , config ) ;
  } ,


  /**
   * Creates the framework's equivalent linestring geometry object.
   * This corresponds to an L.polyline in Leaflet.
   *
   * @param   config      {Object}    An optional properties hash the object should use.
   * @param   component   {Object}    An optional component to build from.
   * @return              {L.polyline} A Leaflet polyline instance.
   */
  linestring: function ( config , component ) {
    var coords = component || this.components,
      latlngs = this.coordsToLatLngs( coords ) ; // Convert internal coordinates to Leaflet LatLngs.

    return L.polyline( latlngs , config ) ;
  } ,


  /**
   * Creates the framework's equivalent multilinestring geometry object.
   * This is represented by L.multiPolyline in Leaflet.
   *
   * @param   config  {Object}    An optional properties hash the object should use.
   * @return          {L.multiPolyline} A Leaflet multi-polyline instance.
   */
  multilinestring: function ( config ) {
    var coords = this.components,
      latlngs = this.coordsToLatLngs( coords , 1 ) ; // Level 1 for multi-linestrings.

    return L.multiPolyline( latlngs , config ) ;
  } ,


  /**
   * Creates the framework's equivalent polygon geometry object.
   * This corresponds to an L.polygon in Leaflet.
   *
   * @param   config      {Object}    An optional properties hash the object should use.
   * @return              {L.multiPolygon} A Leaflet polygon instance.
   */
  polygon: function ( config ) {
    // Truncate the coordinates to remove the closing coordinate,
    // as Leaflet handles closure automatically.
    var coords = this.trunc( this.components ),
      latlngs = this.coordsToLatLngs( coords , 1 ) ; // Level 1 for polygons.

    return L.polygon( latlngs , config ) ;
  } ,


  /**
   * Creates the framework's equivalent multipolygon geometry object.
   * This is represented by L.multiPolygon in Leaflet.
   *
   * @param   config  {Object}    An optional properties hash the object should use.
   * @return          {L.multiPolygon} A Leaflet multi-polygon instance.
   */
  multipolygon: function ( config ) {
    // Truncate the coordinates to remove redundant closing points.
    var coords = this.trunc( this.components ),
      latlngs = this.coordsToLatLngs( coords , 2 ) ; // Level 2 for multi-polygons.

    return L.multiPolygon( latlngs , config ) ;
  } ,


  /**
   * Creates the framework's equivalent collection of geometry objects.
   * For Leaflet, this is typically an L.featureGroup.
   *
   * @param   config  {Object}    An optional properties hash the object should use.
   * @return          {L.featureGroup} A Leaflet feature group containing various geometry types.
   */
  geometrycollection: function ( config ) {
    var comps,
      i,
      layers ;

    comps = this.trunc( this.components ) ; // Truncate components if they are closed geometries.
    layers = [ ] ;

    // Iterate through each component and construct its corresponding Leaflet object.
    for ( i = 0 ; i < this.components.length ; i += 1 ) {
      layers.push( this.construct[ comps[ i ].type ].call( this , comps[ i ] ) ) ;
    }

    return L.featureGroup( layers , config ) ;
  }

} ;


// Extend the Wkt.Wkt.prototype with Leaflet's coordinate conversion utilities.
L.Util.extend( Wkt.Wkt.prototype , {

  coordsToLatLngs: L.GeoJSON.coordsToLatLngs ,

  // TODO Why doesn't the coordsToLatLng function in L.GeoJSON already suffice?
  // Custom implementation for single coordinate conversion.
  coordsToLatLng: function ( coords , reverse ) {
    var lat = reverse ? coords.x : coords.y ,
      lng = reverse ? coords.y : coords.x ;

    return L.latLng( lat , lng , true ) ; // The 'true' indicates raw coordinates without projection.
  }

} ) ;


/**
 * @augments Wkt.Wkt
 * A framework-dependent deconstruction method used to generate internal
 * geometric representations from instances of framework geometry. This method
 * uses object detection to attempt to classify members of framework geometry
 * classes into the standard WKT types.
 *
 * @param   obj {Object}    An instance of one of the framework's geometry classes (e.g., L.Marker, L.Polyline).
 * @return      {Object}    A hash of the 'type' and 'components' thus derived, suitable for WKT parsing.
 */
Wkt.Wkt.prototype.deconstruct = function ( obj ) {
  var attr,
    coordsFromLatLngs,
    features,
    i,
    verts,
    rings,
    tmp ;

  /**
   * Accepts an Array (arr) of Leaflet LatLngs from which it extracts each one as a
   *  vertex; calls itself recursively to deal with nested Arrays (e.g., for polygons with holes).
   * @param   arr {Array} An array of Leaflet LatLng objects.
   * @returns {Array} An array of internal {x, y} coordinate objects.
   */
  coordsFromLatLngs = function ( arr ) {
    var i,
      coords ;

    coords = [ ] ;
    for ( i = 0 ; i < arr.length ; i += 1 ) {
      if ( Wkt.isArray( arr[ i ] ) ) {
        coords.push( coordsFromLatLngs( arr[ i ] ) ) ; // Recurse for nested arrays.
      } else {
        // Convert Leaflet LatLng to internal {x, y} format.
        coords.push( {
          x: arr[ i ].lng,
          y: arr[ i ].lat
        } ) ;
      }
    }

    return coords ;
  } ;


  // Handle L.Marker objects /////////////////////////////////////////////////////////////////
  if ( obj.constructor === L.Marker || obj.constructor === L.marker ) {
    return {
      type: 'point',
      components: [ {
        x: obj.getLatLng( ).lng,
        y: obj.getLatLng( ).lat
      } ]
    } ;
  }


  // Handle L.Rectangle objects //////////////////////////////////////////////////////////////
  // Note: L.Rectangle is a special case of L.Polygon.
  if ( obj.constructor === L.Rectangle || obj.constructor === L.rectangle ) {
    tmp = obj.getBounds( ) ; // Get the bounding box (L.LatLngBounds instance).
    return {
      type: 'polygon',
      isRectangle: true, // Flag indicating it was originally a rectangle.
      components: [
        [
          { // NW corner
            x: tmp.getSouthWest( ).lng,
            y: tmp.getNorthEast( ).lat
          },
          { // NE corner
            x: tmp.getNorthEast( ).lng,
            y: tmp.getNorthEast( ).lat
          },
          { // SE corner
            x: tmp.getNorthEast( ).lng,
            y: tmp.getSouthWest( ).lat
          },
          { // SW corner
            x: tmp.getSouthWest( ).lng,
            y: tmp.getSouthWest( ).lat
          },
          { // NW corner (again, for closure, WKT requires explicit closure)
            x: tmp.getSouthWest( ).lng,
            y: tmp.getNorthEast( ).lat
          }
        ]
      ]
    } ;
  }


  // Handle L.Polyline objects ///////////////////////////////////////////////////////////////
  if ( obj.constructor === L.Polyline || obj.constructor === L.polyline ) {
    verts = [ ] ;
    tmp = obj.getLatLngs( ) ; // Get the array of LatLngs for the polyline.

    // Check if the polyline is already closed. If not, it's a linestring.
    if ( !tmp[ 0 ].equals( tmp[ tmp.length - 1 ] ) ) {

      for ( i = 0 ; i < tmp.length ; i += 1 ) {
        verts.push( {
          x: tmp[ i ].lng,
          y: tmp[ i ].lat
        } ) ;
      }

      return {
        type: 'linestring',
        components: verts
      } ;
    }
  }


  // Handle L.Polygon objects ////////////////////////////////////////////////////////////////
  if ( obj.constructor === L.Polygon || obj.constructor === L.polygon ) {
    rings = [ ] ;
    verts = [ ] ;
    tmp = obj.getLatLngs( ) ; // Get the outer boundary LatLngs.

    // First, process the outer boundary (the main ring).
    for ( i = 0 ; i < obj._latlngs.length ; i += 1 ) {
      verts.push( {
        x: tmp[ i ].lng,
        y: tmp[ i ].lat
      } ) ;
    }

    // Explicitly add the first coordinate again for WKT closure.
    verts.push( {
      x: tmp[ 0 ].lng,
      y: tmp[ 0 ].lat
    } ) ;

    rings.push( verts ) ;

    // Now, handle any holes (inner rings) if they exist.
    if ( obj._holes && obj._holes.length > 0 ) {
      // Reworked to support holes properly.
      // Leaflet's _holes is an array of arrays of LatLngs.
      verts = coordsFromLatLngs( obj._holes ) ;
      for ( i = 0 ; i < verts.length ; i++ ) {
        // Each hole also needs to be explicitly closed.
        verts[ i ].push( verts[ i ][ 0 ] ) ;
        rings.push( verts[ i ] ) ;
      }
    }

    return {
      type: 'polygon',
      components: rings
    } ;
  }


  // Handle L.MultiPolyline, L.MultiPolygon, L.LayerGroup, L.FeatureGroup ////////////////////
  if ( obj.constructor === L.MultiPolyline || obj.constructor === L.MultiPolygon ||
    obj.constructor === L.LayerGroup || obj.constructor === L.FeatureGroup ) {

    features = [ ] ;
    tmp = obj._layers ; // Access the internal layers object of the group.

    for ( attr in tmp ) {
      if ( tmp.hasOwnProperty( attr ) ) {
        // Only deconstruct layers that are actual geometries (have getLatLngs or getLatLng).
        if ( tmp[ attr ].getLatLngs || tmp[ attr ].getLatLng ) {
          // Recursively deconstruct each layer within the group.
          features.push( this.deconstruct( tmp[ attr ] ) ) ;
        }
      }
    }

    return {

      type: ( function ( ) { // Immediately invoked function to determine the type.
        switch ( obj.constructor ) {
        case L.MultiPolyline:
          return 'multilinestring' ;
        case L.MultiPolygon:
          return 'multipolygon' ;
        case L.FeatureGroup:
          return ( function ( ) { // Determine specific type for FeatureGroup.
            var i,
              mpgon,
              mpline,
              mpoint ;

            // Assume that all layers within the feature group are of one type (any one type).
            mpgon = true ;
            mpline = true ;
            mpoint = true ;

            for ( i in obj._layers ) {
              if ( obj._layers.hasOwnProperty( i ) ) {
                if ( obj._layers[ i ].constructor !== L.Marker ) {
                  mpoint = false ; // If any layer is not a Marker, it's not a MultiPoint.
                }
                if ( obj._layers[ i ].constructor !== L.Polyline ) {
                  mpline = false ; // If any layer is not a Polyline, it's not a MultiLineString.
                }
                if ( obj._layers[ i ].constructor !== L.Polygon ) {
                  mpgon = false ; // If any layer is not a Polygon, it's not a MultiPolygon.
                }
              }
            }

            if ( mpoint ) {
              return 'multipoint' ;
            }
            if ( mpline ) {
              return 'multilinestring' ;
            }
            if ( mpgon ) {
              return 'multipolygon' ;
            }
            // If mixed types, or none of the above, it's a GeometryCollection.
            return 'geometrycollection' ;

          }( ) ) ;
        default:
          return 'geometrycollection' ; // Default for L.LayerGroup or unknown types.
        }
      }( ) ) ,

      components: ( function ( ) { // Immediately invoked function to pluck components.
        // Extract the 'components' array from each deconstructed feature.
        var i,
          comps ;

        comps = [ ] ;
        for ( i = 0 ; i < features.length ; i += 1 ) {
          if ( features[ i ].components ) {
            comps.push( features[ i ].components ) ;
          }
        }

        return comps ;
      }( ) )

    } ;
  }


  // Handle L.Circle objects /////////////////////////////////////////////////////////////////
  // Note: This block seems to be a copy-paste error from L.Rectangle in the original.
  // It should likely check for L.Circle. The original code has a logical flaw here.
  if ( obj.constructor === L.Rectangle || obj.constructor === L.rectangle ) {
    console.log( 'Deconstruction of L.Circle objects is not yet supported' ) ;

  } else {
    // If none of the recognized Leaflet geometry types match.
    console.log( 'The passed object does not have any recognizable properties.' ) ;
  }

} ;