"use strict";

// Core Node.js modules for system operations and network utilities
const cryptographic = require("crypto"),
      file_path_util = require("path"),
      web_url_parser = require("url");

// External dependencies for caching, object manipulation, web server, templating, and spatial calculations
const data_cache_manager = require("cachecache"),
      object_cloner = require("clone"),
      http_server_framework = require("express"),
      template_engine = require("handlebars"),
      spherical_projection_engine = new (require("sphericalmercator"))();

// Internal module for tile source interaction
const tile_source_helper = require("./index");

// A utility object for various string and data manipulations
const UtilityBelt = {
  /**
   * Determines the canonical file extension for a given tile format string.
   * Handles common variations like 'png32' or 'png8'.
   * @param {string} inputFormat - The raw format string (e.g., "png", "png32", "jpeg").
   * @returns {string} The normalized file extension.
   */
  getTileFileExtension: function(inputFormat) {
    if (!inputFormat || typeof inputFormat !== "string") {
      return "bin"; // Default to a generic binary extension for unknown formats
    }
    const formatLookup = {
      "png": "png",
      "jpeg": "jpg",
      "jpg": "jpg",
      "webp": "webp",
      "pbf": "pbf",
      "geojson": "json",
      "json": "json"
    };
    // Check for variations like 'png32', 'png8', 'webp-lossy'
    const baseFormat = inputFormat.toLowerCase().split(/[^\w]/)[0];
    return formatLookup[baseFormat] || baseFormat;
  },

  /**
   * Converts an object of HTTP headers to a new object where all keys are lowercase.
   * @param {object} originalHeaders - The input headers object.
   * @returns {object} A new object with all header names in lowercase.
   */
  standardizeHeaders: function(originalHeaders) {
    if (!originalHeaders || typeof originalHeaders !== "object") {
      return {}; // Return an empty object if input is invalid
    }
    return Object.keys(originalHeaders).reduce((acc, key) => {
      acc[key.toLowerCase()] = originalHeaders[key];
      return acc;
    }, {});
  },

  /**
   * Computes the MD5 hash of provided binary data.
   * @param {Buffer} binaryData - The data buffer to hash.
   * @returns {Buffer} The MD5 hash digest.
   */
  calculateDataHash: function(binaryData) {
    const hash_generator = cryptographic.createHash("md5");
    hash_generator.update(binaryData);
    return hash_generator.digest();
  },

  /**
   * Sends a standardized error response.
   * @param {object} responseObj - Express response object.
   * @param {number} statusCode - HTTP status code.
   * @param {object} contextParams - Parameters for header population.
   * @param {object} additionalHeaders - Extra headers to merge.
   * @param {string} [message] - Optional error message to log.
   */
  dispatchErrorResponse: function(responseObj, statusCode, contextParams, additionalHeaders = {}, message = "") {
    if (message) {
      console.error(`HTTP ${statusCode} Error: ${message}`);
    }
    const finalHeaders = module_config.populateResponseHeaders({}, contextParams, { [statusCode]: true, ...additionalHeaders });
    responseObj.set(finalHeaders);
    responseObj.status(statusCode).end();
  }
};

// Main module export function, acting as a factory for the Express application
module.exports = function(tile_data_loader, processing_options) {
  // Initialize the web server application and disable default header for security
  const web_application = http_server_framework().disable("x-powered-by");
  
  // Storage for pre-compiled Handlebars header templates
  const header_template_cache = {};
  
  // Default configuration values
  let tile_source_identifier = processing_options;
  let tile_url_pattern_template = "/{z}/{x}/{y}.{format}";

  // Constants for retina scaling
  const RETINA_SCALE_FACTOR = 2;
  const TILE_SIZE_FOR_RETINA = 512;

  // Apply cache middleware to all requests
  web_application.use(data_cache_manager());

  // Process configuration options if provided as an object
  if (typeof(processing_options) === "object" && processing_options !== null) {
    tile_source_identifier = processing_options.source;
    tile_url_pattern_template = processing_options.tilePath || tile_url_pattern_template;

    // Compile and validate custom headers from options
    const custom_headers_config = processing_options.headers || {};
    for (const header_name of Object.keys(custom_headers_config)) {
      try {
        const compiled_template = template_engine.compile(custom_headers_config[header_name], { noEscape: true });
        // Attempt to render with empty context to catch basic syntax errors
        compiled_template({});
        header_template_cache[header_name] = compiled_template;
      } catch (template_error) {
        console.error(`Error compiling header template for '${header_name}':`, template_error.message);
        process.exit(1); // Exit if a critical configuration error occurs
      }
    }
  }

  /**
   * Populates a headers object using compiled templates and dynamic parameters.
   * @param {object} currentHeaders - The initial headers object to populate.
   * @param {object} dynamicParams - Parameters to use for template rendering.
   * @param {object} additionalContext - Extra context variables for templates (e.g., status codes).
   * @returns {object} The updated headers object.
   */
  const module_config = {
    populateResponseHeaders: function(currentHeaders, dynamicParams, additionalContext = {}) {
      const mergedParams = { ...dynamicParams, ...additionalContext };
      const finalHeaders = { ...currentHeaders };

      for (const tpl_name of Object.keys(header_template_cache)) {
        try {
          const rendered_value = header_template_cache[tpl_name](mergedParams);
          if (rendered_value) {
            finalHeaders[tpl_name.toLowerCase()] = rendered_value;
          }
        } catch (template_render_error) {
          console.warn(`Failed to render header '${tpl_name}': ${template_render_error.message}`);
          // Continue processing other headers
        }
      }
      return finalHeaders;
    }
  };

  // Construct the regular expression pattern for matching tile requests
  const dynamic_tile_route_regex = tile_url_pattern_template
    .replace(/\.(?!.*\.)/, ":retina(@2x)?:") // Match optional retina suffix before the last dot
    .replace(/\./g, "\\.") // Escape all dots
    .replace("{z}", ":z(\\d+)") // Capture zoom level as digits
    .replace("{x}", ":x(\\d+)") // Capture X coordinate as digits
    .replace("{y}", ":y(\\d+)") // Capture Y coordinate as digits
    .replace("{format}", ":format([\\w\\.-]+)"); // Capture format as word characters, dots, or hyphens

  // Pre-load the tile source for initial cache warming
  tile_data_loader.load(tile_source_identifier, (warm_err) => {
    if (warm_err) {
      console.error("Initial tile source warm-up failed:", warm_err.message);
      // Decide if this should be a fatal error or just a warning
    } else {
      console.info("Tile source warmed up successfully.");
    }
  });

  // Prepare URIs for standard and retina tile sources
  let primary_tile_source_uri;
  let retina_tile_source_uri;

  if (typeof(tile_source_identifier) === "string") {
    primary_tile_source_uri = web_url_parser.parse(tile_source_identifier, true);
    retina_tile_source_uri = web_url_parser.parse(tile_source_identifier, true);
  } else {
    // If identifier is an object, clone it for retina version
    primary_tile_source_uri = tile_source_identifier;
    retina_tile_source_uri = object_cloner(tile_source_identifier);
  }

  // Modify the retina URI's query parameters
  if (!retina_tile_source_uri.query) {
      retina_tile_source_uri.query = {};
  }
  retina_tile_source_uri.query.scale = RETINA_SCALE_FACTOR;
  retina_tile_source_uri.query.tileSize = TILE_SIZE_FOR_RETINA; // Inform tilelive-mapnik for larger tiles

  const configured_source_map = new Map([
    ["standard", primary_tile_source_uri],
    ["retina", retina_tile_source_uri]
  ]);

  // Route for serving individual tile images
  web_application.get(dynamic_tile_route_regex, function(request_ctx, response_ctx, next_middleware) {
    const z_coord = parseInt(request_ctx.params.z, 10);
    const x_coord = parseInt(request_ctx.params.x, 10);
    const y_coord = parseInt(request_ctx.params.y, 10);
    const is_retina_request = !!request_ctx.params.retina;
    const requested_format = request_ctx.params.format;

    // Basic validation for coordinates
    if (isNaN(z_coord) || isNaN(x_coord) || isNaN(y_coord) || z_coord < 0 || x_coord < 0 || y_coord < 0) {
      return UtilityBelt.dispatchErrorResponse(response_ctx, 400, {}, { message: "Invalid tile coordinates." }, "Invalid tile coordinates received.");
    }

    const request_parameters = {
      tile: {
        zoom: z_coord,
        x: x_coord,
        y: y_coord,
        format: requested_format,
        retina: is_retina_request
      }
    };

    // Select the appropriate source URI based on retina flag
    const current_source_uri = is_retina_request ? configured_source_map.get("retina") : configured_source_map.get("standard");

    // Load the tile source asynchronously
    tile_data_loader.load(current_source_uri, function(source_load_error, active_source) {
      if (source_load_error) {
        console.error("Failed to load tile source:", source_load_error.message);
        return next_middleware(source_load_error); // Pass error to Express error handler
      }

      // Retrieve metadata about the loaded source
      tile_source_helper.getInfo(active_source, function(info_fetch_error, source_metadata) {
        if (info_fetch_error) {
          console.error("Failed to retrieve source info:", info_fetch_error.message);
          return next_middleware(info_fetch_error);
        }

        // Validate requested format against source's native format
        const canonical_extension = UtilityBelt.getTileFileExtension(source_metadata.format);
        if (canonical_extension !== requested_format) {
          return UtilityBelt.dispatchErrorResponse(response_ctx, 404, request_parameters, { invalidFormat: true },
            `Requested format '${requested_format}' does not match source format '${canonical_extension}'.`);
        }

        // Validate zoom level
        if (z_coord < source_metadata.minzoom || z_coord > source_metadata.maxzoom) {
          return UtilityBelt.dispatchErrorResponse(response_ctx, 404, request_parameters, { invalidZoom: true },
            `Zoom level ${z_coord} is outside source's valid range [${source_metadata.minzoom}, ${source_metadata.maxzoom}].`);
        }

        // Validate tile coordinates against source bounds
        const bounds_xyz = spherical_projection_engine.xyz(source_metadata.bounds, z_coord);
        if (x_coord < bounds_xyz.minX || x_coord > bounds_xyz.maxX ||
            y_coord < bounds_xyz.minY || y_coord > bounds_xyz.maxY) {
          return UtilityBelt.dispatchErrorResponse(response_ctx, 404, request_parameters, { invalidCoordinates: true },
            `Coordinates ${x_coord},${y_coord} are outside source bounds for zoom ${z_coord}.`);
        }

        // Fetch the actual tile data
        active_source.getTile(z_coord, x_coord, y_coord, function(tile_fetch_error, tile_data, tile_headers) {
          // Standardize header keys to lowercase
          let processed_headers = UtilityBelt.standardizeHeaders(tile_headers || {});

          if (tile_fetch_error) {
            // Check for common "tile not found" errors
            if (tile_fetch_error.message.match(/(Tile|Grid) does not exist/i)) {
              return UtilityBelt.dispatchErrorResponse(response_ctx, 404, request_parameters, {}, "Tile not found for requested coordinates.");
            }
            console.error(`Error fetching tile ${z_coord}/${x_coord}/${y_coord}:`, tile_fetch_error.message);
            return next_middleware(tile_fetch_error);
          }

          // If data is null or undefined, treat as not found
          if (tile_data === null || tile_data === undefined) {
            return UtilityBelt.dispatchErrorResponse(response_ctx, 404, request_parameters, {}, "Tile data is empty.");
          }

          // Add Content-MD5 header if not already present
          if (!processed_headers["content-md5"]) {
            processed_headers["content-md5"] = UtilityBelt.calculateDataHash(tile_data).toString("base64");
          }

          // Special handling for PBF (Protocol Buffer) tiles
          if (canonical_extension === "pbf") {
            processed_headers["content-type"] = processed_headers["content-type"] || "application/x-protobuf";
            processed_headers["content-encoding"] = processed_headers["content-encoding"] || "gzip";
          }

          // Set all response headers and send the tile data
          response_ctx.set(module_config.populateResponseHeaders(processed_headers, request_parameters, { "200": true }));
          return response_ctx.send(tile_data);
        });
      });
    });
  });

  // Route for serving TileJSON metadata
  web_application.get("/index.json", function(request_ctx, response_ctx, next_middleware) {
    const metadata_request_params = {
      isTileJSON: true
    };

    // Load the primary tile source
    tile_data_loader.load(primary_tile_source_uri, function(source_load_error, active_source) {
      if (source_load_error) {
        console.error("Failed to load source for TileJSON:", source_load_error.message);
        return next_middleware(source_load_error);
      }

      // Get source information
      tile_source_helper.getInfo(active_source, function(info_fetch_error, source_metadata) {
        if (info_fetch_error) {
          console.error("Failed to retrieve source info for TileJSON:", info_fetch_error.message);
          return next_middleware(info_fetch_error);
        }

        // Construct the tile URL for TileJSON's 'tiles' array
        const host_url = `http://${request_ctx.headers.host}`;
        const base_path = file_path_util.dirname(request_ctx.originalUrl);
        const tile_url_format_placeholder = tile_url_pattern_template.replace("{format}", UtilityBelt.getTileFileExtension(source_metadata.format));
        
        // Use URL constructor for robust path joining
        const tile_url_builder = new URL(base_path, host_url);
        tile_url_builder.pathname = file_path_util.join(tile_url_builder.pathname, tile_url_format_placeholder);
        
        source_metadata.tiles = [tile_url_builder.toString()];
        source_metadata.tilejson = "2.0.0"; // Adhere to TileJSON spec version

        // Set headers and send the metadata
        response_ctx.set(module_config.populateResponseHeaders({}, metadata_request_params, { "200": true }));
        return response_ctx.json(source_metadata); // Use .json() for automatic content-type
      });
    });
  });

  return web_application; // Return the configured Express application
};