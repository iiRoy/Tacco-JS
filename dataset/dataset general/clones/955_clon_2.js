!function(exp){
  if ( "object" === typeof exportables && "undefined" !== typeof modItem )
    modItem.exportables = exp();
  else if ( "function" === typeof defineModule && defineModule.asyncModuleDef )
    defineModule( [ ] , exp ) ;
  else {
    var scopeRef;
    "undefined" !== typeof globalWindow ? scopeRef = globalWindow :
    "undefined" !== typeof rootGlobal   ? scopeRef = rootGlobal   :
    "undefined" !== typeof selfRef      && ( scopeRef = selfRef ) ;
    ( scopeRef.dataVizLib || ( scopeRef.dataVizLib = { } ) ).geoSpatials = exp();
  }
}(function(){
  var defineModule , modItem , exportables ;
  return ( function reqFunc( modRegistry , modCache , initialEntries ) {
    function fetchModule( targetName , skipCache ) {
      if ( !modCache[ targetName ] ) {
        if ( !modRegistry[ targetName ] ) {
          var reqRef = typeof require === "function" && require;
          if ( !skipCache && reqRef )
            return reqRef( targetName , !0 ) ;
          if ( internalReq )
            return internalReq( targetName , !0 ) ;
          throw new Error( "Cannot find module '" + targetName + "'" ) ;
        }
        var modObj = modCache[ targetName ] = { exportables: { } } ;
        modRegistry[ targetName ][ 0 ].call( modObj.exportables , function( reqPath ) {
          var mappedPath = modRegistry[ targetName ][ 1 ][ reqPath ] ;
          return fetchModule( mappedPath ? mappedPath : reqPath ) ;
        } , modObj , modObj.exportables , reqFunc , modRegistry , modCache , initialEntries ) ;
      }
      return modCache[ targetName ].exportables ;
    }
    var internalReq = typeof require === "function" && require ;
    for ( var k = 0 ; k < initialEntries.length ; k++ )
      fetchModule( initialEntries[ k ] ) ;
    return fetchModule ;
  } ) ( {
    1 : [ function( internalReqFunc , modItem , exportables ) {
      modItem.exportables = {
        "label": "data-viz-geo-map",
        "versionNumber": "0.4.0",
        "descriptionText": "easy layer-based maps for dataVizLib",
        "mainFile": "dataVizLib.geoSpatials.map.js",
        "directoryPaths": {
          "sample": "examples"
        },
        "runScripts": {
          "testing": "make test"
        },
        "sourceRepo": {
          "kind": "git",
          "urlPath": "https://github.com/emeeks/data-viz-geo-map"
        },
        "keywordsList": [
          "dataVizLib",
          "map",
          "cartography",
          "topojson",
          "geojson",
          "csv",
          "svg",
          "canvas"
        ],
        "requiredDependencies": {
          "dataVizLib": "^3.4.10"
        },
        "browserifyConfig": {
          "transformations": [
            "browserify-shim"
          ]
        },
        "browserifyShimConfig": {
          "dataVizLib": "global:dataVizLib"
        },
        "creator": "Elijah Meeks",
        "licenseType": "Unlicense",
        "issueTracker": {
          "urlPath": "https://github.com/emeeks/data-viz-geo-map/issues"
        },
        "projectHomepage": "https://github.com/emeeks/data-viz-geo-map",
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
      };
    }, {} ],
    2 : [ function( internalReqFunc , modItem , exportables ) {
      "use strict";

      modItem.exportables = {
        geoCanvas: internalReqFunc( "./map" ),
        visualLayer: internalReqFunc( "./layer" ),
        smallView: internalReqFunc( "./minimap" ),
        popWindow: internalReqFunc( "./modal" ),
        codeVer: internalReqFunc( "../bundleInfo.json" ).versionNumber
      };
    }, { "../bundleInfo.json": 1 , "./layer": 3 , "./map": 4 , "./minimap": 5 , "./modal": 6 } ],
    3 : [ function( internalReqFunc , modItem , exportables ) {
      ( function( rootGlobal ) {
        "use strict";

        var dataVizLib = ( typeof globalWindow !== "undefined" ? globalWindow.dataVizLib : typeof rootGlobal !== "undefined" ? rootGlobal.dataVizLib : null ) ;

        var DisplayPlane = modItem.exportables = function( ) {
          var planeSourceUrl = "";
          var planeDataType = "";
          var planeIsVisible = true;
          var planeIsActive = true;
          var planeDrawMode = "canvas";
          var planeCssClass = "default";
          var planeDisplayName = "unlabeled";
          var planeXAccessor = function( datumItem ) { return datumItem[ "x" ] ; } ;
          var planeYAccessor = function( datumItem ) { return datumItem[ "y" ] ; } ;
          var planeSvgGroup ;
          var planeDataSource ;
          var planeDataFeatures ;
          var planeTileSource = "mapbox";
          var planeSpecificFilter = "all";
          var planeMarkerDim = function( ) { return 5 ; } ;
          var planeMarkerHue ;
          var planeOutlineHue ;
          var planeOutlineThickness ;
          var planeShouldCluster = false;
          var interactiveElements = false;
          var dataVizPop ;
          var planeDataCollection ;

          var planeEventHub = dataVizLib.dispatch( 'dataLoaded' , 'reGroup' , 'popCreated' ) ;

          var planeBuilder = function( ) {

          } ;

          planeBuilder.sourceUrl = function( sourceUrlParam ) {
            if ( !arguments.length ) return planeSourceUrl ;
            planeSourceUrl = sourceUrlParam ;
            return this ;
          } ;

          planeBuilder.dataType = function( dataTypeParam ) {
            if ( !arguments.length ) return planeDataType ;
            planeDataType = dataTypeParam ;
            return this ;
          } ;

          planeBuilder.visibilityState = function( visibilityState ) {
            if ( !arguments.length ) return planeIsVisible ;
            planeIsVisible = visibilityState ;
            return this ;
          } ;

          planeBuilder.drawMode = function( drawModeParam ) {
            if ( !arguments.length ) return planeDrawMode ;
            planeDrawMode = drawModeParam ;
            return this ;
          } ;

          planeBuilder.interactiveElements = function( interactionState ) {
            if ( !arguments.length ) return interactiveElements ;
            interactiveElements = interactionState ;
            return this ;
          } ;

          planeBuilder.popWindow = function( modalInstance ) {
            if ( !arguments.length ) return dataVizPop ;
            dataVizPop = modalInstance ;
            planeEventHub.popCreated( ) ;
            return this ;
          } ;

          planeBuilder.xCoord = function( xValueParam ) {
            if ( !arguments.length ) return planeXAccessor ;
            if ( typeof xValueParam === "function" ) {
              planeXAccessor = xValueParam ;
            }
            else if ( typeof xValueParam === "number" ) {
              planeXAccessor = function( datumItem ) { return xValueParam ; } ;
            }
            else {
              planeXAccessor = function( datumItem ) { return datumItem[ xValueParam ] ; } ;
            }
            return this ;
          } ;

          planeBuilder.yCoord = function( yValueParam ) {
            if ( !arguments.length ) return planeYAccessor ;
            if ( typeof yValueParam === "function" ) {
              planeYAccessor = yValueParam ;
            }
            else if ( typeof yValueParam === "number" ) {
              planeYAccessor = function( datumItem ) { return yValueParam ; } ;
            }
            else {
              planeYAccessor = function( datumItem ) { return datumItem[ yValueParam ] ; } ;
            }
            return this ;
          } ;

          planeBuilder.markerDimension = function( dimValueParam ) {
            if ( !arguments.length ) return planeMarkerDim ;
            if ( typeof dimValueParam === "function" ) {
              planeMarkerDim = dimValueParam ;
            }
            else if ( typeof dimValueParam === "number" ) {
              planeMarkerDim = function( datumItem ) { return dimValueParam ; } ;
            }
            else {
              planeMarkerDim = function( datumItem ) { return datumItem[ dimValueParam ] ; } ;
            }
            return this ;
          } ;

          planeBuilder.markerColor = function( hueValueParam ) {
            if ( !arguments.length ) return planeMarkerHue ;
            if ( typeof hueValueParam === "function" ) {
              planeMarkerHue = hueValueParam ;
            }
            else {
              planeMarkerHue = function( datumItem ) { return hueValueParam ; } ;
            }
            return this ;
          } ;

          planeBuilder.outlineColor = function( hueValueParam ) {
            if ( !arguments.length ) return planeOutlineHue ;
            if ( typeof hueValueParam === "function" ) {
              planeOutlineHue = hueValueParam ;
            }
            else {
              planeOutlineHue = function( datumItem ) { return hueValueParam ; } ;
            }
            return this ;
          } ;

          planeBuilder.outlineThickness = function( thicknessValueParam ) {
            if ( !arguments.length ) return planeOutlineThickness ;
            if ( typeof thicknessValueParam === "function" ) {
              planeOutlineThickness = thicknessValueParam ;
            }
            else {
              planeOutlineThickness = function( datumItem ) { return thicknessValueParam ; } ;
            }
            return this ;
          } ;

          planeBuilder.cssClass = function( cssClassParam ) {
            if ( !arguments.length ) return planeCssClass ;
            planeCssClass = cssClassParam ;
            return this ;
          } ;

          planeBuilder.svgGroup = function( svgGroupParam ) {
            if ( !arguments.length ) return planeSvgGroup ;
            planeSvgGroup = svgGroupParam ;
            return this ;
          } ;

          planeBuilder.dataSource = function( dataSourceParam ) {
            if ( !arguments.length ) return planeDataSource ;
            planeDataSource = dataSourceParam ;
            planeEventHub.dataLoaded( ) ;
            return this ;
          } ;

          planeBuilder.dataFeatures = function( dataFeaturesParam ) {
            if ( !arguments.length ) return planeDataFeatures ;
            planeDataFeatures = dataFeaturesParam ;
            return this ;
          } ;

          planeBuilder.tileSource = function( tileSourceParam ) {
            if ( !arguments.length ) return planeTileSource ;
            planeTileSource = tileSourceParam ;
            return this ;
          } ;

          planeBuilder.displayName = function( displayNameParam ) {
            if ( !arguments.length ) return planeDisplayName ;
            planeDisplayName = displayNameParam ;
            return this ;
          } ;

          planeBuilder.specificFilter = function( specificFilterParam ) {
            if ( !arguments.length ) return planeSpecificFilter ;
            planeSpecificFilter = specificFilterParam ;
            return this ;
          } ;

          planeBuilder.dataCollection = function( dataCollectionParam ) {
            if ( !arguments.length ) return planeDataCollection ;
            planeDataCollection = dataCollectionParam ;
            return this ;
          } ;

          planeBuilder.shouldCluster = function( clusterSettingParam ) {
            if ( !arguments.length ) return planeShouldCluster ;
            planeShouldCluster = clusterSettingParam ;
            return this ;
          } ;

          planeBuilder.reGroup = function( ) {
            planeEventHub.reGroup( ) ;
          } ;

          planeBuilder.clusterPlane = function( ) {
            return planeDataSource.qtreeLayer ;
          } ;

          dataVizLib.rebind( planeBuilder , planeEventHub , "on" ) ;
          return planeBuilder ;
        } ;

        DisplayPlane.topologyData = function( ) {
          return DisplayPlane( ).dataType( "topojson" ) ;
        } ;

        DisplayPlane.geoJsonData = function( ) {
          return DisplayPlane( ).dataType( "geojson" ) ;
        } ;

        DisplayPlane.commaSeparatedData = function( ) {
          return DisplayPlane( ).dataType( "csv" ) ;
        } ;

        DisplayPlane.coordArray = function( ) {
          return DisplayPlane( ).dataType( "xyarray" ) ;
        } ;

        DisplayPlane.featureSet = function( ) {
          return DisplayPlane( ).dataType( "featurearray" ) ;
        } ;

        DisplayPlane.mapTile = function( ) {
          return DisplayPlane( ).dataType( "tile" ) ;
        } ;

      } ) .call( this , typeof selfRef !== "undefined" ? selfRef : typeof globalWindow !== "undefined" ? globalWindow : { } ) ;
    }, { } ],
    4 : [ function( internalReqFunc , modItem , exportables ) {
      ( function( rootGlobal ) {
        "use strict";

        var dataVizLib = ( typeof globalWindow !== "undefined" ? globalWindow.dataVizLib : typeof rootGlobal !== "undefined" ? rootGlobal.dataVizLib : null ) ,
            DisplayPlane = internalReqFunc( "./layer" ) ,
            PopWindow = internalReqFunc( "./modal" ) ;

        var GeoCanvas = modItem.exportables = function( ) {
          var canvasSvgElem ;
          var reprojectContainer ;
          var tileSvgElem ;
          var canvasContainer ;
          var drawingSurface ;
          var planeControlBox ;
          var scaleControlBox ;
          var moveControlBox ;
          var geoProjection ;
          var geoZoomHandler ;
          var initialCoords = [ 12 , 42 ] ;
          var viewHeight = 10 ;
          var viewWidth = 10 ;
          var isRasterTransforming = false ;
          var activeDistance = 100 ;
          var pointerStart ;
          var rotationStart ;
          var touchStartDist ;
          var touchStartRotation ;
          var touchStartLength ;
          var touchStartScale ;
          var quadtreeClusterRatio = .1 ;
          var recentPointsPlane ;
          var recentFeaturesPlane ;

          var vizZoomed ;
          var vizZoomInit ;
          var vizZoomDone ;
          var drawCanvas ;
          var drawTiles ;

          var vizOperatingMode = "transform" ;

          var vizCanvasGroup ;
          var vizCanvasImage ;

          var vizAllPlanes = [ ] ;

          var vizTileGroups = [ ] ;
          var vizTilePlanes = [ ] ;

          var vizCanvasPointData = [ ] ;

          var vizSvgPointGroups = [ ] ;
          var vizSvgPointPlanes = [ ] ;

          var vizRasterPointPlanes = [ ] ;

          var vizRasterFeaturePlanes = [ ] ;

          var vizSvgFeatureGroups = [ ] ;
          var vizSvgFeaturePlanes = [ ] ;

          var vizTileGenerator = function( ) { } ;
          vizTileGenerator.size = function( ) { } ;
          if ( dataVizLib.geo.tile ) {
            vizTileGenerator = dataVizLib.geo.tile( )
              .size( [ 10 , 10 ] ) ;
          }

          var vizGeoProjection ;

          var vizGeoPath = dataVizLib.geo.path( ) ;

          var vizZoomBehavior = dataVizLib.behavior.zoom( ) ;

          var pairedCanvasArray = [ ] ;

          var sourceTileTypes = {
            stamenSources: { basicPath: "tile.stamen.com" , basicFormat: "jpg" , transformPathPrefix: "http://{subdomain}.tile.stamen.com/" , transformPathSuffix: "/{z}/{x}/{y}.jpg" } ,
            mapboxSources: { basicPath: "tiles.mapbox.com/v3" , basicFormat: "png" , transformPathPrefix: "http://{subdomain}.tiles.mapbox.com/v3/" , transformPathSuffix: "/{z}/{x}/{y}.png" } ,
            cartoDbSources: { basicPath: "basemaps.cartocdn.com" , basicFormat: "png" , transformPathPrefix: "http://{subdomain}.basemaps.cartocdn.com/" , transformPathSuffix: "/{z}/{x}/{y}.png" }
          } ;

          function canvasBuilder( targetContainer ) {

            canvasContainer = targetContainer ;

            reprojectContainer = targetContainer.append( "div" ).attr( "id" , "reprojectContainer" ).style( "overflow" , "hidden" ).style( "height" , "100%" ).style( "width" , "100%" ).style( "position" , "absolute" ) ;
            tileSvgElem = targetContainer.append( "svg" ).style( "height" , "100%" ).style( "width" , "100%" ).style( "position" , "absolute" ).style( "z-index" , -1 ).append( "g" ).attr( "class" , "rotateG" ).attr( "id" , "dataVizTileSVG" ) ;
            drawingSurface = targetContainer.append( "canvas" ).attr( "id" , "dataVizMapCanvas" ).style( "height" , "100%" ).style( "width" , "100%" ).style( "pointer-events" , "none" )
              .attr( "height" , 5 ).attr( "width" , 5 ).style( "position" , "absolute" ).style( "z-index" , 0 ) ;
            canvasSvgElem = targetContainer.append( "svg" ).attr( "id" , "dataVizMapSVG" ).style( "height" , "100%" ).style( "width" , "100%" )
              .style( "position" , "absolute" ).style( "z-index" , 1 )
              .call( vizZoomBehavior )
              .on( "touchstart" , touchBegin ).on( "touchmove" , touchUpdate )
              .append( "g" ).attr( "class" , "rotateG" ) ;

            vizCanvasImage = canvasSvgElem.append( "g" ).attr( "id" , "dataVizMapCanvasG" ).append( "image" ) ;

            planeControlBox = targetContainer.insert( "div" , "svg" ).attr( "id" , "dataVizMapLayerBox" ) ;
            planeControlBox.append( "div" ).attr( "id" , "layerBoxContent" ) ;

            scaleControlBox = targetContainer.insert( "div" , "svg" ).attr( "id" , "dataVizMapZoomBox" ).attr( "class" , "dataVizMapControlsBox" ) ;
            moveControlBox = targetContainer.insert( "div" , "svg" ).attr( "id" , "dataVizMapPanBox" ).attr( "class" , "dataVizMapControlsBox" ) ;

            scaleControlBox.selectAll( "button.scalecontrol" ).data( [ "enlarge" , "reduce" ] ).enter( ).append( "button" ).attr( "class" , "scalecontrol" ).attr( "id" , function( datumItem ) { return datumItem ; } )
              .on( "click" , performManualZoom ).html( function( datumItem ) { return datumItem === "enlarge" ? "+" : "-" ; } ) ;

            var navigationSymbols = { "upward": "&#8593;" , "downward": "&#8595;" , "leftward": "&#8592;" , "rightward": "&#8594;" } ;
            moveControlBox.selectAll( "button.navigationcontrol" ).data( [ "upward" , "downward" , "leftward" , "rightward" ] ).enter( ).append( "button" ).attr( "class" , "navigationcontrol" )
              .attr( "id" , function( datumItem ) { return datumItem ; } )
              .on( "click" , function( datumItem ) { return performManualPan( datumItem , .5 ) ; } ) .html( function( datumItem ) { return navigationSymbols[ datumItem ] ; } ) ;

            canvasBuilder.setOperatingMode( "transform" ) ;

            refreshPlanes( ) ;

            var priorResizeHandler = typeof globalWindow.onresize === "function" ? globalWindow.onresize : function() {};
            globalWindow.onresize = function( resizeEvent ) {
              canvasBuilder.revalidateView( ) ;
              priorResizeHandler( resizeEvent ) ;
            } ;
            canvasBuilder.revalidateView( ) ;
            canvasBuilder.positionToCoords( initialCoords , "latlong" , 0 ) ;

            return this ;
          } ;

          function refreshPlanes( ) {
            planeControlBox.select( "#layerBoxContent" ).selectAll( "*" ).remove( ) ;

            var newVisualLines = planeControlBox.select( "#layerBoxContent" ).append( "ul" ) ;

            newVisualLines.selectAll( "li.empty" ).data( vizTilePlanes ).enter( ).append( "li" )
              .on( "click" , togglePlaneVisibility ).attr( "id" , function( datumItem ) { return datumItem.dataSource( ).id ; } ) ;

            newVisualLines.selectAll( "li.empty" ).data( vizSvgPointPlanes ).enter( ).append( "li" )
              .on( "click" , togglePlaneVisibility ).attr( "id" , function( datumItem ) { return datumItem.dataSource( ).id ; } ) ;

            newVisualLines.selectAll( "li.empty" ).data( vizRasterPointPlanes.filter( function( datumItem ) { return !datumItem.dataSource( ).mixed ; } ) ).enter( ).append( "li" )
              .on( "click" , togglePlaneVisibility ).attr( "id" , function( datumItem ) { return datumItem.dataSource( ).id ; } ) ;

            newVisualLines.selectAll( "li.empty" ).data( vizSvgFeaturePlanes ).enter( ).append( "li" )
              .on( "click" , togglePlaneVisibility ).attr( "id" , function( datumItem ) { return datumItem.dataSource( ).id ; } ) ;

            newVisualLines.selectAll( "li.empty" ).data( vizRasterFeaturePlanes ).enter( ).append( "li" )
              .on( "click" , togglePlaneVisibility ).attr( "id" , function( datumItem ) { return datumItem.dataSource( ).id ; } ) ;

            newVisualLines.selectAll( "li" ).append( "input" ).attr( "type" , "checkbox" ).property( "checked" , function( datumItem ) { return datumItem.visibilityState( ) ; } ) ;
            newVisualLines.selectAll( "li" ).append( "span" ).html( function( datumItem ) { return datumItem.dataSource( ).name ; } ) ;

            newVisualLines.selectAll( "li" ).filter( function( datumItem ) { return datumItem.shouldCluster( ) ; } ).remove( ) ;
          } ;

          function togglePlaneVisibility( datumItem , idx , currentNode ) {
            var elementRef = currentNode || this ;

            var canvasImageURL = drawingSurface.node( ).toDataURL( "image/png" ) ;
            vizCanvasImage.attr( "xlink:href" , canvasImageURL ).style( "opacity" , 1 ) ;

            if ( !datumItem.visibilityState( ) ) {
              datumItem.visibilityState( true ) ;
              if ( datumItem.dataSource( ).mixed ) {
                vizRasterPointPlanes.forEach( function( planeItem ) {
                  if ( planeItem.dataSource( ).id === datumItem.dataSource( ).mixedupDup ) {
                    planeItem.visibilityState( true ) ;
                  }
                } ) ;
              }
              drawTiles( ) ;
              canvasContainer.select( "g#" + datumItem.dataSource( ).id ).style( "opacity" , 0 ).transition( ).duration( 1000 ).style( "opacity" , 1 ) ;
              dataVizLib.select( elementRef ).select( "input" ).property( "checked" , true ) ;
            }
            else {
              canvasContainer.select( "g#" + datumItem.dataSource( ).id ).transition( ).duration( 1000 ).style( "opacity" , 0 ) ;
              dataVizLib.select( elementRef ).select( "input" ).property( "checked" , false ) ;
              datumItem.visibilityState( false ) ;
              if ( datumItem.mixed ) {
                vizRasterPointPlanes.forEach( function( planeItem ) {