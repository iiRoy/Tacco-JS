const cryptology = require("crypto");
const way_finder = require("path");
const web_address = require("url");
const deep_cloner = require("clone");
const web_server = require("http");
const geo_calculator = new (require("sphericalmercator"))();
const tile_helper = require("./index");

const retrieveContentFormat = (inputFormat) => {
  if (!inputFormat) return inputFormat;
  const cleaned = String(inputFormat).toLowerCase();
  if (cleaned.startsWith("png")) return "png";
  return cleaned;
};

const adjustHeaderCase = (incomingHeaders) => {
  return Object.keys(incomingHeaders || {}).reduce((accumulator, key) => {
    accumulator[key.toLowerCase()] = incomingHeaders[key];
    return accumulator;
  }, {});
};

const generateChecksum = (data_buffer) => {
  const hasher = cryptology.createHash("md5");
  hasher.update(data_buffer);
  return hasher.digest();
};

const simpleTextReplacer = (templateString, dataObject) => {
  let processedString = templateString;
  for (const key in dataObject) {
    const escapedKey = String(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'g');
    processedString = processedString.replace(regex, String(dataObject[key]));
  }
  return processedString;
};

module.exports = function(map_data_provider, server_config) {
  const custom_http_server = web_server.createServer();
  const template_processors = new Map();
  let data_source_id = server_config;
  let resource_path_template = "/{z}/{x}/{y}.{format}";
  let path_match_regex;

  if (typeof server_config === "object") {
    data_source_id = server_config.source;
    resource_path_template = server_config.tilePath || resource_path_template;

    for (const headerName in server_config.headers || {}) {
      const headerValue = server_config.headers[headerName];
      template_processors.set(headerName, headerValue);
    }
  }

  let dynamic_path_regex_string = resource_path_template;
  dynamic_path_regex_string = dynamic_path_regex_string.replace(/\.(?!.*\.)/, "(?<retina>@2x)?\\.");
  dynamic_path_regex_string = dynamic_path_regex_string.replace(/\./g, "\\.");
  dynamic_path_regex_string = dynamic_path_regex_string.replace("{z}", "(?<z>\\d+)");
  dynamic_path_regex_string = dynamic_path_regex_string.replace("{x}", "(?<x>\\d+)");
  dynamic_path_regex_string = dynamic_path_regex_string.replace("{y}", "(?<y>\\d+)");
  dynamic_path_regex_string = dynamic_path_regex_string.replace("{format}", "(?<format>[\\w\\.]+)");

  path_match_regex = new RegExp(`^${dynamic_path_regex_string}$`);

  const createResponseHeaders = (initial_headers, context_params, extra_flags) => {
    const final_headers = { ...initial_headers };
    const combined_context = { ...context_params };

    for (const key in extra_flags || {}) {
      combined_context[key] = extra_flags[key];
    }

    template_processors.forEach((template_str, header_name) => {
      const processed_value = simpleTextReplacer(template_str, combined_context);
      if (processed_value) {
        final_headers[header_name.toLowerCase()] = processed_value;
      }
    });
    return final_headers;
  };

  map_data_provider.load(data_source_id);

  let retina_source_identifier;

  if (typeof data_source_id === "string") {
    retina_source_identifier = web_address.parse(data_source_id, true);
  } else {
    retina_source_identifier = deep_cloner(data_source_id);
  }

  retina_source_identifier.query = retina_source_identifier.query || {};
  retina_source_identifier.query.scale = 2;
  retina_source_identifier.query.tileSize = 512;

  const data_source_map = new Map();
  data_source_map.set("standard_res", data_source_id);
  data_source_map.set("high_res", retina_source_identifier);

  custom_http_server.on("request", async (income, outcome) => {
    const current_url = web_address.parse(income.url, true);
    const url_path = current_url.pathname;

    if (url_path === "/index.json") {
      const request_context = {
        tileJSON: true
      };

      try {
        const source_instance = await new Promise((resolve, reject) => {
          map_data_provider.load(data_source_id, (err, src) => err ? reject(err) : resolve(src));
        });

        const source_metadata = await new Promise((resolve, reject) => {
          tile_helper.getInfo(source_instance, (err, info) => err ? reject(err) : resolve(info));
        });

        const base_tile_uri_segment = way_finder.normalize(
          way_finder.dirname(income.url) +
          resource_path_template.replace("{format}", retrieveContentFormat(source_metadata.format))
        );

        source_metadata.tiles = [`http://${income.headers.host}${base_tile_uri_segment}`];
        source_metadata.tilejson = "2.0.0";

        outcome.writeHead(200, createResponseHeaders({}, request_context, { success: true }));
        outcome.end(JSON.stringify(source_metadata));

      } catch (err) {
        console.error("Error serving TileJSON:", err);
        outcome.writeHead(500, createResponseHeaders({}, request_context, { error: true }));
        outcome.end("Internal Server Error");
      }
    } else {
      const match_result = url_path.match(path_match_regex);

      if (!match_result) {
        outcome.writeHead(404);
        return outcome.end("Not Found");
      }

      const path_segments = match_result.groups;
      const zoom_level = parseInt(path_segments.z, 10);
      const x_coord = parseInt(path_segments.x, 10);
      const y_coord = parseInt(path_segments.y, 10);
      const is_high_res = !!path_segments.retina;
      const image_format = path_segments.format;

      const current_source_identifier = is_high_res ? data_source_map.get("high_res") : data_source_map.get("standard_res");

      const request_context = {
        tile: {
          zoom: zoom_level,
          x: x_coord,
          y: y_coord,
          format: image_format,
          retina: is_high_res
        }
      };

      try {
        const source_asset = await new Promise((resolve, reject) => {
          map_data_provider.load(current_source_identifier, (err, src) => err ? reject(err) : resolve(src));
        });

        const asset_details = await new Promise((resolve, reject) => {
          tile_helper.getInfo(source_asset, (err, info) => err ? reject(err) : resolve(info));
        });

        const expected_format_extension = retrieveContentFormat(asset_details.format);
        if (expected_format_extension !== image_format) {
          console.warn(`Mismatched format: requested '${image_format}', expected '${expected_format_extension}'`);
          outcome.writeHead(404, createResponseHeaders({}, request_context, { notFound: true, invalidFormat: true }));
          return outcome.end();
        }

        if (zoom_level < asset_details.minzoom || zoom_level > asset_details.maxzoom) {
          console.warn(`Invalid zoom level: ${zoom_level}`);
          outcome.writeHead(404, createResponseHeaders({}, request_context, { notFound: true, invalidZoom: true }));
          return outcome.end();
        }

        const bounds_info = geo_calculator.xyz(asset_details.bounds, zoom_level);
        if (x_coord < bounds_info.minX || x_coord > bounds_info.maxX ||
            y_coord < bounds_info.minY || y_coord > bounds_info.maxY) {
          console.warn(`Coordinates out of bounds: ${x_coord},${y_coord} for zoom ${zoom_level}`);
          outcome.writeHead(404, createResponseHeaders({}, request_context, { notFound: true, invalidCoordinates: true }));
          return outcome.end();
        }

        const [tile_data, tile_headers] = await new Promise((resolve, reject) => {
          source_asset.getTile(zoom_level, x_coord, y_coord, (err, data, headers) => {
            if (err) return reject(err);
            resolve([data, headers]);
          });
        });

        let processed_headers = adjustHeaderCase(tile_headers || {});

        if (tile_data === null || tile_data === undefined) {
          outcome.writeHead(404, createResponseHeaders(processed_headers, request_context, { notFound: true }));
          return outcome.end();
        }

        if (!processed_headers["content-md5"]) {
          processed_headers["content-md5"] = generateChecksum(tile_data).toString("base64");
        }

        if (expected_format_extension === "pbf") {
          processed_headers["content-type"] = processed_headers["content-type"] || "application/x-protobuf";
          processed_headers["content-encoding"] = processed_headers["content-encoding"] || "gzip";
        }

        outcome.writeHead(200, createResponseHeaders(processed_headers, request_context, { success: true }));
        outcome.end(tile_data);

      } catch (err) {
        if (err.message && err.message.match(/Tile|Grid does not exist/)) {
          outcome.writeHead(404, createResponseHeaders({}, request_context, { notFound: true }));
          return outcome.end();
        }
        console.error("Error serving tile:", err);
        outcome.writeHead(500, createResponseHeaders({}, request_context, { error: true }));
        outcome.end("Internal Server Error");
      }
    }
  });

  return custom_http_server;
};