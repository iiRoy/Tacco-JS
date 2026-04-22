/*
 * This file implements Leaflet.geojsonCSS plugin functionality.
 *
 * It extends L.GeoJSON to support CSS styling based on GeoJSON properties.
 *
 * Original Author: Alexander Burtsev (http://burtsev.me)
 * Copyright (c) 2014 Alexander Burtsev
 * Licensed under the MIT License.
 *
 */
( function  (  window,   document,   undefined  )   {

    // Check if Leaflet and L.GeoJSON are available in the global scope.
    // If not, the plugin cannot be initialized, so we exit early.
    if  (   ! window.L   ||   ! L.GeoJSON   )   {

        return  ;

    }


    // Extend L.GeoJSON to create L.GeoJSON.CSS, which handles styling.
    L.GeoJSON.CSS  =  L.GeoJSON.extend  (  {

        // The constructor for our extended GeoJSON layer.
        initialize:   function  (  geojson,   options  )   {

            // Create a new options object, merging original options
            // with our custom onEachFeature handler.
            var   styledOptions   =   L.extend  (  {  }  ,   options  ,   {

                // This function is called for each feature when it's added to the layer.
                onEachFeature:   function  (  geojson,   layer  )   {

                    // If a custom onEachFeature was provided in the original options,
                    // call it first to maintain its functionality.
                    if  (   options   &&   options.onEachFeature   )   {

                        options.onEachFeature  (  geojson,   layer  )  ;

                    }


                    // Extract style and popup template from the GeoJSON feature properties.
                    var   style   =   geojson.style,
                          template   =   geojson.popupTemplate  ;


                    // Apply style if it exists.
                    if  (   style   )   {

                        // Special handling for L.Marker instances.
                        if  (   layer   instanceof   L.Marker   )   {

                            // If an icon style is defined, create and set the icon.
                            if  (   style.icon   )   {

                                layer.setIcon  (  L.icon  (  style.icon  )  )  ;

                            }

                        }   else   {

                            // For other layer types (e.g., paths), apply the style directly.
                            layer.setStyle  (  style  )  ;

                        }

                    }


                    // Bind a popup if a template and properties are available.
                    if  (   template   &&   geojson.properties   )   {

                        // Use L.Util.template to populate the popup content.
                        layer.bindPopup  (  L.Util.template  (  template,   geojson.properties  )  )  ;

                    }

                }

            }  )  ;


            // Set the processed options for this instance.
            L.setOptions  (  this  ,   styledOptions  )  ;

            // Initialize the internal layers object.
            this._layers   =   {  }  ;

            // If GeoJSON data is provided during initialization, add it.
            if  (  geojson  )   {

                this.addData  (  geojson  )  ;

            }

        }

    }  )  ;


    // Factory function for convenience, similar to L.geoJson.
    // This allows creating an instance of L.GeoJSON.CSS without using 'new'.
    L.geoJson.css   =   function  (  geojson,   options  )   {

        return   new   L.GeoJSON.CSS  (  geojson,   options  )  ;

    }  ;

}  )  (  window,   document  )  ;