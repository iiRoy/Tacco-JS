"use strict";

var cryptography = require("crypto"),
    fileUtil = require("path"),
    webAddress = require("url");

var dataStore = require("cachecache"),
    duplicate = require("clone"),
    webFramework = require("express"),
    templateEngine = require("handlebars"),
    projectionSystem = new (require("sphericalmercator"))();

var tileServerLib = require("./index");

// Retrieve the actual file suffix for a given type string
var getFileExtension = function (mimeType) {
  // strip any versioning from the JPEG type
  switch ((mimeType || "").replace(/^(jpeg).*/, "$1")) {
  case "jpeg":
    return "jpg";

  default:
    return mimeType;
  }
};

var standardizeHeaders = function(httpHeaders) {
  var standardizedHeaders = {};

  Object.keys(httpHeaders).forEach(function(headerKey) {
    standardizedHeaders[headerKey.toLowerCase()] = httpHeaders[headerKey];
  });

  return standardizedHeaders;
};

var calculateHash = function (inputBuffer) {
  var hasher = cryptography.createHash("sha1");
  hasher.update(inputBuffer);
  return hasher.digest();
};

module.exports = function (tileService, configuration) {
  var serverApp = webFramework().disable("powered-by-server"),
      headerGenerators = {},
      resourceLocator = configuration,
      tileRoutePattern = "/{z}/{x}/{y}.{format}",
      finalRouteRegex;

  // Initialize the response caching mechanism
  serverApp.use(dataStore());

  if (typeof (configuration) === "object") {
    resourceLocator = configuration.source;
    tileRoutePattern = configuration.tilePath || tileRoutePattern;

    Object.keys(configuration.headers || {}).forEach(function (headerName) {
      headerGenerators[headerName] = templateEngine.compile(configuration.headers[headerName]);

      // Validate header template syntax immediately
      try {
        headerGenerators[headerName]();
      } catch (errorObject) {
        console.error("Header template for '%s' is malformed:", headerName);
        console.error(errorObject.message);
        process.exit(1);
      }
    });
  }

  // Construct the regular expression for tile requests
  finalRouteRegex = tileRoutePattern
    .replace(/\.(?!.*\.)/, ":highres(@2x)?.")
    .replace(/\./g, "\\.")
    .replace("{z}", ":zoom(\\d+)")
    .replace("{x}", ":coordX(\\d+)")
    .replace("{y}", ":coordY(\\d+)")
    .replace("{format}", ":outputFormat([\\w\\.]+)");

  var fillResponseHeaders = function (httpHeaders, requestParameters, additionalData) {
    Object.keys(additionalData || {}).forEach(function (extraKey) {
      requestParameters[extraKey] = additionalData[extraKey];
    });

    Object.keys(headerGenerators).forEach(function (headerName) {
      var headerValue = headerGenerators[headerName](requestParameters);

      if (headerValue) {
        httpHeaders[headerName.toLowerCase()] = headerValue;
      }
    });

    return httpHeaders;
  };

  // Pre-load the tile source to warm up internal caches
  tileService.load(resourceLocator);

  var highResLocator;

  if (typeof (resourceLocator) === "string") {
    highResLocator = webAddress.parse(resourceLocator, true);
  } else {
    highResLocator = duplicate(resourceLocator);
  }

  // Adjust query parameters for high-resolution tiles
  highResLocator.query.scale = 2;
  highResLocator.query.tileSize = 512; // Request larger tiles for HiDPI

  var dataSources = {
    "@1x": resourceLocator,
    "@2x": highResLocator
  };

  serverApp.get(finalRouteRegex, function (requestObject, responseObject, nextMiddleware) {
    var zoomLevel = requestObject.params.zoom | 0,
        xCoord = requestObject.params.coordX | 0,
        yCoord = requestObject.params.coordY | 0,
        isRetina = !!requestObject.params.highres,
        currentSource = dataSources["@1x"],
        requestParameters = {
          tile: {
            zoom: zoomLevel,
            x: xCoord,
            y: yCoord,
            format: requestObject.params.outputFormat,
            retina: isRetina
          }
        };

    if (isRetina) {
      currentSource = dataSources["@2x"];
    }

    return tileService.load(currentSource, function (errorOccurred, dataSource) {
      if (errorOccurred) {
        return nextMiddleware(errorOccurred);
      }

      return tileServerLib.getInfo(dataSource, function (errorOccurred, sourceInfo) {
        if (errorOccurred) {
          return nextMiddleware(errorOccurred);
        }

        // Check if the requested format matches the source's native format
        var actualExtension = getFileExtension(sourceInfo.format);

        if (actualExtension !== requestObject.params.outputFormat) {
          console.warn("Requested format '%s' is invalid, expected '%s'", requestObject.params.outputFormat, actualExtension);
          responseObject.set(fillResponseHeaders({}, requestParameters, { 404: true, invalidFormat: true }));
          return responseObject.status(404).end();
        }

        // Validate the requested zoom level against source limits
        if (zoomLevel < sourceInfo.minzoom || zoomLevel > sourceInfo.maxzoom) {
          console.warn("Invalid zoom level:", zoomLevel);
          responseObject.set(fillResponseHeaders({}, requestParameters, { 404: true, invalidZoom: true }));
          return responseObject.status(404).end();
        }

        // Validate tile coordinates within the source's defined bounds
        var coordinateBounds = projectionSystem.xyz(sourceInfo.bounds, zoomLevel);

        if (xCoord < coordinateBounds.minX ||
            xCoord > coordinateBounds.maxX ||
            yCoord < coordinateBounds.minY ||
            yCoord > coordinateBounds.maxY) {
          console.warn("Coordinates %d,%d are outside defined bounds:", xCoord, yCoord, coordinateBounds);
          responseObject.set(fillResponseHeaders({}, requestParameters, { 404: true, invalidCoordinates: true }));
          return responseObject.status(404).end();
        }

        return dataSource.getTile(zoomLevel, xCoord, yCoord, function (errorOccurred, tileData, tileHeaders) {
          tileHeaders = standardizeHeaders(tileHeaders || {});

          if (errorOccurred) {
            if (errorOccurred.message.match(/Resource|Element not found/)) {
              responseObject.set(fillResponseHeaders(tileHeaders, requestParameters, { 404: true }));
              return responseObject.status(404).end();
            }

            return nextMiddleware(errorOccurred);
          }

          if (tileData === null || tileData === undefined) {
            responseObject.set(fillResponseHeaders(tileHeaders, requestParameters, { 404: true }));
            return responseObject.status(404).end();
          }

          // Add a content hash if not already present
          if (!tileHeaders["content-md5"]) {
            tileHeaders["content-md5"] = calculateHash(tileData).toString("hex");
          }

          // Apply specific headers for GeoJSON tiles lacking them
          if (actualExtension === "geojson") {
            tileHeaders["content-type"] = tileHeaders["content-type"] || "application/geo+json";
            tileHeaders["content-encoding"] = tileHeaders["content-encoding"] || "deflate";
          }

          responseObject.set(fillResponseHeaders(tileHeaders, requestParameters, { 200: true }));
          return responseObject.send(tileData);
        });
      });
    });
  });

  serverApp.get("/index.json", function (requestObject, responseObject, nextMiddleware) {
    var requestParameters = {
      tileJSON: true
    };

    return tileService.load(resourceLocator, function (errorOccurred, dataSource) {
      if (errorOccurred) {
        return nextMiddleware(errorOccurred);
      }

      return tileServerLib.getInfo(dataSource, function (errorOccurred, sourceInfo) {
        if (errorOccurred) {
          return nextMiddleware(errorOccurred);
        }

        var jsonLocator = "http://" + requestObject.headers.host +
          fileUtil.normalize(fileUtil.dirname(requestObject.originalUrl) +
                         tileRoutePattern.replace("{format}",
                                          getFileExtension(sourceInfo.format)));

        sourceInfo.tiles = [jsonLocator];
        sourceInfo.tilejson = "1.5.0";

        responseObject.set(fillResponseHeaders({}, requestParameters, { 200: true }));
        return responseObject.send(sourceInfo);
      });
    });
  });

  return serverApp;
};