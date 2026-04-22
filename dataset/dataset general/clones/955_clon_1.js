!function ( e ) {
  if ( "object" == typeof exports && "undefined" != typeof module ) {
    module.exports = e();
  }
  else if ( "function" == typeof define && define.amd ) {
    define( [ ], e );
  }
  else {
    var f ;
    /* Check for global object availability */
    "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && ( f = self ) ;
    /* Attach to d3 object, creating it if necessary */
    ( f.d3 || ( f.d3 = { } ) ).carto = e() ;
  }
} ( function ( ) {
  var define, module, exports ;
  /* Browserify's UMD wrapper to handle module loading */
  return ( function e ( t, n, r ) {
    function s ( o, u ) {
      if ( ! n [ o ] ) {
        if ( ! t [ o ] ) {
          var a = typeof require == "function" && require ;
          if ( ! u && a ) return a( o, ! 0 ) ;
          if ( i ) return i( o, ! 0 ) ;
          throw new Error( "Cannot find module '" + o + "'" ) ;
        }
        var f = n [ o ] = { exports: { } } ;
        t [ o ] [ 0 ] .call( f.exports, function ( e ) {
          var n = t [ o ] [ 1 ] [ e ] ;
          return s( n ? n : e ) ;
        }, f, f.exports, e, t, n, r ) ;
      }
      return n [ o ] .exports ;
    }
    var i = typeof require == "function" && require ;
    for ( var o = 0 ; o < r.length ; o ++ ) s( r [ o ] ) ;
    return s ;
  } ) ( {
    1:[ function ( _dereq_, module, exports ) {
      /* package.json contents */
      module.exports = {
        "name": "d3-carto-map",
        "version": "0.4.0",
        "description": "easy layer-based maps for d3",
        "main": "d3.carto.map.js",
        "directories": {
          "example": "examples"
        },
        "scripts": {
          "test": "make test"
        },
        "repository": {
          "type": "git",
          "url": "https://github.com/emeeks/d3-carto-map"
        },
        "keywords": [
          "d3",
          "map",
          "cartography",
          "topojson",
          "geojson",
          "csv",
          "svg",
          "canvas"
        ],
        "dependencies": {
          "d3": "^3.4.10"
        },
        "browserify": {
          "transform": [
            "browserify-shim"
          ]
        },
        "browserify-shim": {
          "d3": "global:d3"
        },
        "author": "Elijah Meeks",
        "license": "Unlicense",
        "bugs": {
          "url": "https://github.com/emeeks/d3-carto-map/issues"
        },
        "homepage": "https://github.com/emeeks/d3-carto-map",
        "devDependencies": {
          "browserify": "^4.2.0",
          "browserify-shim": "^3.6.0",
          "casper-chai": "^0.2.1",
          "casperjs": "^1.1.0-beta3",
          "chai": "^1.9.1",
          "glob": "^4.0.4",
          "jshint": "^2.5.2",
          "mocha": "^1.20.1",
          "mocha-casperjs": "^0.5.0",
          "uglify-js": "^2.4.15",
          "watchify": "^0.10.2"
        }
      }

    }, { } ], 2:[ function ( _dereq_, module, exports ) {
      "use strict" ;

      /* Main entry point for the d3-carto-map library */
      module.exports = {
        map: _dereq_( "./map" ),
        layer: _dereq_( "./layer" ),
        minimap: _dereq_( "./minimap" ),
        modal: _dereq_( "./modal" ),
        version: _dereq_( "../package.json" ) .version
      } ;

    }, { "../package.json":1, "./layer":3, "./map":4, "./minimap":5, "./modal":6 } ], 3:[ function ( _dereq_, module, exports ) {
      ( function ( global ) {
        "use strict" ;

        /* D3 library dependency, checking for global or window scope */
        var d3 = ( typeof window !== "undefined" ? window.d3 : typeof global !== "undefined" ? global.d3 : null ) ;

        /* Layer constructor function */
        var Layer = module.exports = function ( ) {
          var layerPath = "" ;
          var layerType = "" ;
          var layerVisibility = true ;
          var layerActive = true ;
          var layerRenderMode = "canvas" ;
          var layerClass = "default" ;
          var layerLabel = "unlabeled" ;
          var layerXCoord = function ( d ) { return d [ "x" ] } ;
          var layerYCoord = function ( d ) { return d [ "y" ] } ;
          var layerG ;
          var layerObject ;
          var layerFeatures ;
          var layerTileType = "mapbox" ;
          var layerSpecific = "all" ;
          var layerMarkerSize = function ( ) { return 5 } ;
          var layerMarkerColor ;
          var layerStrokeColor ;
          var layerStrokeWidth ;
          var layerCluster = false ;
          var clickableFeatures = false ;
          var d3Modal ;
          var layerDataset ;

          /* Event dispatcher for layer-specific events */
          var layerDispatch = d3.dispatch( 'load', 'recluster', 'newmodal' ) ;

          /* The main layer function, currently empty */
          var layer = function ( ) {

          } ;

          /* Getter/setter for layer path */
          layer.path = function ( newPath ) {
            if ( ! arguments.length ) return layerPath ;
            layerPath = newPath ;
            return this ;
          } ;

          /* Getter/setter for layer type */
          layer.type = function ( newType ) {
            if ( ! arguments.length ) return layerType ;
            layerType = newType ;
            return this ;

          } ;

          /* Getter/setter for layer visibility */
          layer.visibility = function ( newVisibility ) {
            if ( ! arguments.length ) return layerVisibility ;
            layerVisibility = newVisibility ;
            return this ;
          } ;

          /* Getter/setter for layer render mode (e.g., "canvas" or "svg") */
          layer.renderMode = function ( newMode ) {
            if ( ! arguments.length ) return layerRenderMode ;
            layerRenderMode = newMode ;
            return this ;
          } ;

          /* Getter/setter to enable/disable clickable features */
          layer.clickableFeatures = function ( newState ) {
            if ( ! arguments.length ) return clickableFeatures ;
            clickableFeatures = newState ;
            return this ;
          } ;

          /* Getter/setter for the modal instance associated with the layer */
          layer.modal = function ( newModal ) {
            if ( ! arguments.length ) return d3Modal ;
            d3Modal = newModal ;
            layerDispatch.newmodal( ) ; /* Dispatch event when a new modal is set */
            return this ;
          } ;

          /* Getter/setter for the X coordinate accessor function */
          layer.x = function ( newX ) {
            if ( ! arguments.length ) return layerXCoord ;
            if ( typeof newX == "function" ) {
              layerXCoord = newX ;
            }
            // If a number is provided, return a function that always returns that number
            else if ( typeof newX == "number" ) {
              layerXCoord = function ( d ) { return newX } ;
            }
            // Otherwise, assume it's a string representing a top-level attribute name
            else {
              layerXCoord = function ( d ) { return d [ newX ] } ;
            }
            return this ;
          } ;

          /* Getter/setter for the Y coordinate accessor function */
          layer.y = function ( newY ) {
            if ( ! arguments.length ) return layerYCoord ;
            if ( typeof newY == "function" ) {
              layerYCoord = newY ;
            }
            // If a number is provided, return a function that always returns that number
            else if ( typeof newY == "number" ) {
              layerYCoord = function ( d ) { return newY } ;
            }
            // Otherwise, assume it's a string representing a top-level attribute name
            else {
              layerYCoord = function ( d ) { return d [ newY ] } ;
            }
            return this ;
          } ;

          /* Getter/setter for marker size accessor function */
          layer.markerSize = function ( newSize ) {
            if ( ! arguments.length ) return layerMarkerSize ;
            if ( typeof newSize == "function" ) {
              layerMarkerSize = newSize ;
            }
            // If a number, return a function that always returns that number
            else if ( typeof newSize == "number" ) {
              layerMarkerSize = function ( d ) { return newSize } ;
            }
            // Otherwise, assume it's a string attribute name
            else {
              layerMarkerSize = function ( d ) { return d [ newSize ] } ;
            }
            return this ;
          } ;

          /* Getter/setter for marker color accessor function */
          layer.markerColor = function ( newColor ) {
            if ( ! arguments.length ) return layerMarkerColor ;
            if ( typeof newColor == "function" ) {
              layerMarkerColor = newColor ;
            }
            // Else, treat as a static color value
            else {
              layerMarkerColor = function ( d ) { return newColor } ;
            }
            return this ;
          } ;

          /* Getter/setter for stroke color accessor function */
          layer.strokeColor = function ( newColor ) {
            if ( ! arguments.length ) return layerStrokeColor ;
            if ( typeof newColor == "function" ) {
              layerStrokeColor = newColor ;
            }
            // Else, treat as a static color value
            else {
              layerStrokeColor = function ( d ) { return newColor } ;
            }
            return this ;
          } ;

          /* Getter/setter for stroke width accessor function */
          layer.strokeWidth = function ( newWidth ) {
            if ( ! arguments.length ) return layerStrokeWidth ;
            if ( typeof newColor == "function" ) { // Typo here: should be newWidth, not newColor
              layerStrokeWidth = newWidth ;
            }
            // Else, treat as a static width value
            else {
              layerStrokeWidth = function ( d ) { return newWidth } ;
            }
            return this ;
          } ;

          /* Getter/setter for the CSS class of the layer */
          layer.cssClass = function ( newClass ) {
            if ( ! arguments.length ) return layerClass ;
            layerClass = newClass ;
            return this ;
          } ;

          /* Getter/setter for the D3 group element associated with the layer */
          layer.g = function ( newG ) {
            if ( ! arguments.length ) return layerG ;
            layerG = newG ;
            return this ;
          } ;

          /* Getter/setter for the raw data object of the layer */
          layer.object = function ( newObject ) {
            if ( ! arguments.length ) return layerObject ;
            layerObject = newObject ;
            layerDispatch.load( ) ; /* Dispatch load event */
            return this ;
          } ;

          /* Getter/setter for the processed features of the layer */
          layer.features = function ( newFeatures ) {
            if ( ! arguments.length ) return layerFeatures ;
            layerFeatures = newFeatures ;
            return this ;
          } ;

          /* Getter/setter for the tile type (e.g., "mapbox", "stamen") */
          layer.tileType = function ( newType ) {
            if ( ! arguments.length ) return layerTileType ;
            layerTileType = newType ;
            return this ;
          } ;

          /* Getter/setter for the layer label */
          layer.label = function ( newLabel ) {
            if ( ! arguments.length ) return layerLabel ;
            layerLabel = newLabel ;
            return this ;
          } ;

          /* Getter/setter for specific feature selection */
          layer.specificFeature = function ( newSpecific ) {
            if ( ! arguments.length ) return layerSpecific ;
            layerSpecific = newSpecific ;
            return this ;
          } ;

          /* Getter/setter for the dataset associated with the layer */
          layer.dataset = function ( newDataset ) {
            if ( ! arguments.length ) return layerDataset ;
            layerDataset = newDataset ;
            return this ;
          } ;

          /* Getter/setter for clustering setting */
          layer.cluster = function ( newClusterSetting ) {
            if ( ! arguments.length ) return layerCluster ;
            layerCluster = newClusterSetting ;
            return this ;
          } ;

          /* Triggers a recluster event */
          layer.recluster = function ( ) {
            layerDispatch.recluster( ) ;
          } ;

          /* Returns the quadtree layer object if clustering is enabled */
          layer.clusterLayer = function ( ) {
            return layerObject.qtreeLayer ;
          } ;

          /* Rebinds 'on' method from the dispatcher to the layer object */
          d3.rebind( layer, layerDispatch, "on" ) ;
          return layer ;
        } ;

        /* Convenience constructors for different layer types */

        /* TopoJSON layer factory */
        Layer.topojson = function ( ) {
          return Layer( ) .type( "topojson" ) ;
        } ;

        /* GeoJSON layer factory */
        Layer.geojson = function ( ) {
          return Layer( ) .type( "geojson" ) ;
        } ;

        /* CSV layer factory */
        Layer.csv = function ( ) {
          return Layer( ) .type( "csv" ) ;
        } ;

        /* XY Array layer factory */
        Layer.xyArray = function ( ) {
          return Layer( ) .type( "xyarray" ) ;
        } ;

        /* Feature Array layer factory */
        Layer.featureArray = function ( ) {
          return Layer( ) .type( "featurearray" ) ;
        } ;

        /* Tile layer factory */
        Layer.tile = function ( ) {
          return Layer( ) .type( "tile" ) ;
        } ;

      } ) .call( this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : { } )
    }, { } ], 4:[ function ( _dereq_, module, exports ) {
      ( function ( global ) {
        "use strict" ;

        /* D3 library dependency */
        var d3 = ( typeof window !== "undefined" ? window.d3 : typeof global !== "undefined" ? global.d3 : null ) ,
            Layer = _dereq_( "./layer" ) , /* Layer module */
            Modal = _dereq_( "./modal" ) ; /* Modal module */

        /* Map constructor function */
        var Map = module.exports = function ( ) {
          var mapSVG ;
          var reprojectDiv ;
          var tileSVG ;
          var mapDiv ;
          var canvasCanvas ;
          var layerBox ;
          var zoomBox ;
          var panBox ;
          var mapProjection ;
          var mapZoom ;
          var mapCenter = [ 12, 42 ] ;
          var mapHeight = 10 ;
          var mapWidth = 10 ;
          var rasterReprojecting = false ;
          var workingDistance = 100 ;
          var mouseOrigin ;
          var rotateOrigin ;
          var touchInitialD ;
          var touchInitialRotate ;
          var touchInitialLength ;
          var touchInitialScale ;
          var quadClusterScale = .1 ;
          var newPointsLayer ;
          var newFeaturesLayer ;

          var d3MapZoomed ;
          var d3MapZoomInitialize ;
          var d3MapZoomComplete ;
          var renderCanvas ;
          var renderTiles ;

          var d3MapMode = "transform" ;

          var d3MapCanvasG ;
          var d3MapCanvasImage ;

          var d3MapAllLayers = [ ] ;

          var d3MapTileG = [ ] ;
          var d3MapTileLayer = [ ] ;

          var d3MapCanvasPointsData = [ ] ;

          var d3MapSVGPointsG = [ ] ;
          var d3MapSVGPointsLayer = [ ] ;

          var d3MapRasterPointsLayer = [ ] ;

          var d3MapRasterFeatureLayer = [ ] ;

          var d3MapSVGFeatureG = [ ] ;
          var d3MapSVGFeatureLayer = [ ] ;

          /* D3 geo tile functionality */
          var d3MapTile = function ( ) { } ;
          d3MapTile.size = function ( ) { } ;
          if ( d3.geo.tile ) {
            var d3MapTile = d3.geo.tile( )
              .size( [ 10, 10 ] ) ;
          }

          var d3MapProjection ;

          var d3MapPath = d3.geo.path( ) ;

          var d3MapZoom = d3.behavior.zoom( ) ;

          var tandemMapArray = [ ] ;

          /* Configuration for different tile providers */
          var tileTypes = {
            stamen: { flatPath: "tile.stamen.com", flatType: "jpg", reprojectPathPrefix: "http://{subdomain}.tile.stamen.com/", reprojectPathSuffix: "/{z}/{x}/{y}.jpg" },
            mapbox: { flatPath: "tiles.mapbox.com/v3", flatType: "png", reprojectPathPrefix: "http://{subdomain}.tiles.mapbox.com/v3/", reprojectPathSuffix: "/{z}/{x}/{y}.png" },
            cartodb: { flatPath: "basemaps.cartocdn.com", flatType: "png", reprojectPathPrefix: "http://{subdomain}.basemaps.cartocdn.com/", reprojectPathSuffix: "/{z}/{x}/{y}.png" }
          } ;

          /* The main map function that initializes the map in the selected div */
          function map ( selectedDiv ) {

            mapDiv = selectedDiv ;

            /* Reprojection div for handling raster tiles */
            reprojectDiv = selectedDiv.append( "div" ) .attr( "id", "reprojectDiv" ) .style( "overflow", "hidden" ) .style( "height", "100%" ) .style( "width", "100%" ) .style( "position", "absolute" ) ;
            /* Multiple SVGs are used: one for tiles, one for canvas, one for interactive SVG layers */
            tileSVG = selectedDiv.append( "svg" ) .style( "height", "100%" ) .style( "width", "100%" ) .style( "position", "absolute" ) .style( "z-index", - 1 ) .append( "g" ) .attr( "class", "rotateG" ) .attr( "id", "d3TileSVG" ) ;
            /* Canvas for rendering points/features that might be too numerous for SVG */
            canvasCanvas = selectedDiv.append( "canvas" ) .attr( "id", "d3MapCanvas" ) .style( "height", "100%" ) .style( "width", "100%" ) .style( "pointer-events", "none" )
              .attr( "height", 5 ) .attr( "width", 5 ) .style( "position", "absolute" ) .style( "z-index", 0 ) ;
            /* Main SVG for interactive elements and features */
            mapSVG = selectedDiv.append( "svg" ) .attr( "id", "d3MapSVG" ) .style( "height", "100%" ) .style( "width", "100%" )
              .style( "position", "absolute" ) .style( "z-index", 1 )
              .call( d3MapZoom )
              .on( "touchstart", touchBegin ) .on( "touchmove", touchUpdate )
              .append( "g" ) .attr( "class", "rotateG" ) ;

            d3MapCanvasImage = mapSVG.append( "g" ) .attr( "id", "d3MapCanvasG" ) .append( "image" ) ;

            /* Layer control box */
            layerBox = selectedDiv.insert( "div", "svg" ) .attr( "id", "d3MapLayerBox" ) ;
            layerBox.append( "div" ) .attr( "id", "layerBoxContent" ) ;

            /* Zoom controls */
            zoomBox = selectedDiv.insert( "div", "svg" ) .attr( "id", "d3MapZoomBox" ) .attr( "class", "d3MapControlsBox" ) ;
            panBox = selectedDiv.insert( "div", "svg" ) .attr( "id", "d3MapPanBox" ) .attr( "class", "d3MapControlsBox" ) ;

            /* Add zoom in/out buttons */
            zoomBox.selectAll( "button.zoomcontrol" ) .data( [ "in", "out" ] ) .enter( ) .append( "button" ) .attr( "class", "zoomcontrol" ) .attr( "id", function ( d ) { return d } )
              .on( "click", manualZoom ) .html( function ( d ) { return d == "in" ? "+" : "-" } ) ;

            /* Pan control symbols */
            var panSymbols = { "up": "&#8593;", "down": "&#8595;", "left": "&#8592;", "right": "&#8594;" } ;
            /* Add pan buttons */
            panBox.selectAll( "button.pancontrol" ) .data( [ "up", "down", "left", "right" ] ) .enter( ) .append( "button" ) .attr( "class", "pancontrol" )
              .attr( "id", function ( d ) { return d } )
              .on( "click", function ( d ) { return manualPan( d, .5 ) } ) .html( function ( d ) { return panSymbols [ d ] } ) ;

            map.mode( "transform" ) ;

            updateLayers( ) ;

            // TO DO: Change this so that it appends the functionality and doesn't overwrite it
            // Or find a viable solution that recognizes <div> resizing
            var existingOnResize = d3.functor( window.onresize ) ;
            window.onresize = function ( event ) {
              map.refresh( ) ;
              existingOnResize( ) ;
            } ;
            map.refresh( ) ;
            map.centerOn( mapCenter, "latlong", 0 ) ;

            return this ;
          } ;

          // Internal Functions

          /* Updates the layer list in the layer control box */
          function updateLayers ( ) {
            layerBox.select( "#layerBoxContent" ) .selectAll( "*" ) .remove( ) ;

            var newLines = layerBox.select( "#layerBoxContent" ) .append( "ul" ) ;

            /* Add tile layers to the list */
            newLines.selectAll( "li.nothing" ) .data( d3MapTileLayer ) .enter( ) .append( "li" )
              .on( "click", showHideLayer ) .attr( "id", function ( d ) { return d.object( ) .id } ) ;

            /* Add SVG point layers to the list */
            newLines.selectAll( "li.nothing" ) .data( d3MapSVGPointsLayer ) .enter( ) .append( "li" )
              .on( "click", showHideLayer ) .attr( "id", function ( d ) { return d.object( ) .id } ) ;

            /* Add raster point layers to the list (excluding mixed layers) */
            newLines.selectAll( "li.nothing" ) .data( d3MapRasterPointsLayer.filter( function ( d ) { return ! d.object( ) .mixed } ) ) .enter( ) .append( "li" )
              .on( "click", showHideLayer ) .attr( "id", function ( d ) { return d.object( ) .id } ) ;

            /* Add SVG feature layers to the list */
            newLines.selectAll( "li.nothing" ) .data( d3MapSVGFeatureLayer ) .enter( ) .append( "li" )
              .on( "click", showHideLayer ) .attr( "id", function ( d ) { return d.object( ) .id } ) ;

            /* Add raster feature layers to the list */
            newLines.selectAll( "li.nothing" ) .data( d3MapRasterFeatureLayer ) .enter( ) .append( "li" )
              .on( "click", showHideLayer ) .attr( "id", function ( d ) { return d.object( ) .id } ) ;

            /* Add checkbox and label for each layer */
            newLines.selectAll( "li" ) .append( "input" ) .attr( "type", "checkbox" ) .property( "checked", function ( d ) { return d.visibility( ) } ) ;
            newLines.selectAll( "li" ) .append( "span" ) .html( function ( d ) { return d.object( ) .name } ) ;

            /* Remove clustered layers from the visible list, as they are handled differently */
            newLines.selectAll( "li" ) .filter( function ( d ) { return d.cluster( ) } ) .remove( ) ;
          } ;

          /* Toggles visibility of a map layer */
          function showHideLayer ( d, i, sentNode ) {
            var n = sentNode || this ;

            var imgUrl = canvasCanvas.node( ) .toDataURL( "image/png" ) ;
            d3MapCanvasImage.attr( "xlink:href", imgUrl ) .style( "opacity", 1 ) ;

            // TO DO: Put transitions back in by adding a transition Canvas Image
            if ( ! d.visibility( ) ) {
              d.visibility( true ) ;
              if ( d.object( ) .mixed ) {
                d3MapRasterPointsLayer.forEach( function ( p ) {
                  if ( p.object( ) .id == d.object( ) .mixedupDup ) {
                    p.visibility( true ) ;
                  }
                } ) ;
              }
              renderTiles( ) ;
              mapDiv.select( "g#" + d.object( ) .id ) .style( "opacity", 0 ) .transition( ) .duration( 1000 ) .style( "opacity", 1 ) ;
              d3.select( n ) .select( "input" ) .property( "checked", true ) ;
            }
            else {
              mapDiv.select( "g#" + d.object( ) .id ) .transition( ) .duration( 1000 ) .style( "opacity", 0 ) ;
              d3.select( n ) .select( "input" ) .property( "checked", false ) ;
              d.visibility( false ) ;
              if ( d.mixed ) { // This 'd.mixed' might be a typo, should probably be d.object().mixed
                d3MapRasterPointsLayer.forEach( function ( p ) {