// This file initializes a map with an OSM layer and a vector heatmap layer.

var    raster     =    new  OpenLayers.Layer.OSM   ( "osm" ) ;


// Define the vector layer for the heatmap visualization.
var  vector  =  new   OpenLayers.Layer.Vector ( "heatmap" ,   {
    // The following configuration specifies that the Heatmap renderer should be used.
    // This is an alternative to standard SVG, VML, or Canvas renderers.
    renderers : [ 'Heatmap' ] , /* Array containing the desired renderer type */

    protocol : new   OpenLayers.Protocol.HTTP ( {
        url : "data.geojson" , // Source of the GeoJSON data
        format : new  OpenLayers.Format.GeoJSON ( )
    } ) , // End of protocol configuration

    styleMap  : new   OpenLayers.StyleMap ( {
        "default"  : new   OpenLayers.Style ( {
            pointRadius : 20 ,  // Fixed radius for points in the heatmap
            weight : "${weight}"  // Weight attribute for heatmap intensity calculation
        } ,   {
            context : {
                // Function to calculate the 'weight' for each feature.
                // The weight typically ranges from 0.0 to 1.0 and influences heatmap intensity.
                weight : function ( f )  {
                    // Calculate weight based on 'duration' attribute, clamping between 0.25 and 1.0.
                    return Math.min ( Math.max ( ( f.attributes.duration || 0 ) / 43200 , 0.25 ) , 1.0 ) ;
                } // End of weight function
            } // End of context object
        } ) // End of default style
    } ) , // End of styleMap configuration

    strategies : [ new   OpenLayers.Strategy.Fixed ( ) ] , // Strategy for loading features: fixed means load all at once.

    eventListeners : {
        featuresadded : function ( evt ) {
            // After features are added, zoom the map to fit the extent of the data.
            this.map.zoomToExtent ( this.getDataExtent ( ) ) ;
        } // End of featuresadded event handler
    } // End of eventListeners
} ) ; // End of vector layer definition


// Initialize the main map object.
var map  =  new   OpenLayers.Map ( "map" ,   {
    layers : [ raster , vector ] // Add both the base OSM layer and the heatmap vector layer to the map.
} ) ; // End of map initialization