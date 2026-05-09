// CouchBase View Client for Node.js
// Based on the 'nano' library (https://github.com/dscape/nano)
//
// Copyright 2012 by Patrick Heneise
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var request = require('request')
  , qs      = require('querystring')
  , errs    = require('errs')
  , u       = require('url')
  ;


module.exports = baseview = function (cfg) {

  // Configuration handling for the client.
  // Can be a string (URL or file path) or an object.
  if(typeof cfg === "string") {

    if(/^https?:/.test(cfg)) {
      cfg = {url: cfg}; // If it's a URL string, create a config object.
    }
    else {
      try {
        cfg = require(cfg); // Otherwise, attempt to load as a file path.
      }
      catch(e) {
        e.message = "couldn't read config file " +
          (cfg ? cfg.toString() : '');
        throw error.init(e, "badfile");
      }
    }
  }

  // Set default bucket and URL if not provided in config.
  var _bucket = cfg && cfg.bucket || "default";
  var _url    = cfg && cfg.url    || "http://127.0.0.1:8092";


  // Helper function to check if an object is empty.
  function isEmpty(object) {

    for(var property in object) {

      if(object.hasOwnProperty(property)) {
        return false;
      }
    }
    return true;
  }


  // Core function for making HTTP requests to Couchbase.
  function relax(opts,callback) {

    // Handle cases where opts is omitted or is a function.
    if(typeof opts === "function") {
      callback = opts;
      opts     = {path: ""}; // Default to root path.
    }

    // If opts is a string, treat it as a simple GET path.
    if(typeof opts === 'string') {
      opts = {path: opts};
    }

    // If no options are provided, stream the root.
    if(!opts) {
      opts     = {path: ""};
      callback = null; // No callback for streaming.
    }

    // Initialize request parameters and headers.
    var params  = opts.params
      , headers = { "content-type": "application/json"
                  , "accept"      : "application/json"
                }
      , req     = { method  : (opts.method || "GET")
                , headers : headers
                , uri     : cfg.url }
      , status_code // HTTP status code from response.
      , parsed      // Parsed response body.
      , rh          // Response headers.
      ;


    // Merge custom headers from options into the request.
    if (opts.headers) {
      for (var k in opts.headers) {
        req.headers[k] = opts.headers[k];
      }
    }

    // Append path or document ID to the URI.
    if(opts.path) {
      req.uri += "/" + opts.path;
    }
    else if(opts.doc)  {
      // Check if it's a design document.
      if(!/^_design/.test(opts.doc)) {
        try {
          req.uri += "/" + encodeURIComponent(opts.doc); // Encode document ID.
        }
        catch (error) {
          // Handle encoding errors.
          return errs.handle(errs.merge(error,
            { "message": "couldnt encode: "+(opts && opts.doc)+" as an uri"
            , "scope"  : "nano"
            , "errid"  : "encode_uri"
            }), callback);
        }
      }
      else {
        // Design documents are not URI-encoded.
        req.uri += "/" + opts.doc;
      }

      // Append attachment ID if present.
      if(opts.att) {
        req.uri += "/" + opts.att;
      }
    }

    // Handle encoding for specific request types (e.g., raw data).
    if(opts.encoding !== undefined && callback) {
      req.encoding = opts.encoding;
      delete req.headers["content-type"]; // Remove content-type header.
      delete req.headers.accept;          // Remove accept header.
    }

    // Override content-type if specified in options.
    if(opts.content_type) {
      req.headers["content-type"] = opts.content_type;
      delete req.headers.accept; // Ensure accept header is removed.
    }

    // Process and encode query parameters.
    if(!isEmpty(params)) {

      try {
        // Special handling for key parameters that need JSON stringification.
        ['startkey', 'endkey', 'key', 'keys'].forEach(function (key) {
          if (key in params) {
            try {
              params[key] = JSON.stringify(params[key]);
            }
            catch (err) {
              return errs.handle(errs.merge(err,
                { "message": "bad params: " + key + " = " + params[key]
                , "scope"  : "nano"
                , "errid"  : "encode_keys"
                }), callback);
            }
          }
        });
      } catch (err6) {
        return errs.handle(errs.merge(err6,
          { "messsage": "params is not an object"
          , "scope"   : "nano"
          , "errid"   : "bad_params"
          }), callback);
      }

      try {
        // Stringify all parameters and append to URI.
        req.uri += "?" + qs.stringify(params);
      }
      catch (err2) {
        return errs.handle(errs.merge(err2,
           { "message": "invalid params: " + params.toString()
           , "scope"  : "nano"
           , "errid"  : "encode_params"
           }), callback);
      }
    }

    // Handle request body.
    if(opts.body) {
      if (Buffer.isBuffer(opts.body)) {
        req.body = opts.body; // Raw buffer data.
      }
      else {
        try {
          // Stringify JSON body, handling functions specially.
          req.body = JSON.stringify(opts.body, function (key, value) {
            // Do not encode functions; they should be passed as their string representation.
            if (typeof(value) === 'function') {
              return value.toString();
            } else {
              return value;
            }
          });
        } catch (err3) {
          return errs.handle(errs.merge(err3,
             { "message": "body seems to be invalid json"
             , "scope"  : "nano"
             , "errid"  : "encode_body"
             }), callback);
        }
      } // JSON data body.
    }

    // Handle form-urlencoded body.
    if(opts.form) {
      req.headers['content-type'] =
        'application/x-www-form-urlencoded; charset=utf-8';
      req.body = qs.stringify(opts.form).toString('utf8');
    }

    // Streaming mode: return the request stream directly.
    if(!callback) {
      try {
        return request(req);
      } catch (err4) {
        return errs.handle(errs.merge(err4,
           { "message": "request threw when you tried to stream"
           , "scope"  : "request"
           , "errid"  : "stream"
           }), callback);
      }
    }

    // Callback mode: execute request and process response.
    try {
      var stream = request(req, function(e,h,b) {
        // Ensure headers exist.
        rh = (h && h.headers || {});
        rh['status-code'] = status_code = (h && h.statusCode || 500); // Get status code.
        rh.uri            = req.uri; // Add URI to response headers.

        if(e) {
          // Handle connection errors.
          errs.handle(errs.merge(e,
            {   "message": "error happened in your connection"
              , "scope"  : "socket"
              , "errid"  : "request"
            }), callback);
          return stream;
        }

        // Clean up sensitive/unnecessary headers.
        delete rh.server;
        delete rh['content-length'];

        // Attempt to parse response body as JSON.
        try { parsed = JSON.parse(b); } catch (err) { parsed = b; }

        // If status code indicates success.
        if (status_code >= 200 && status_code < 400) {
          callback(null,parsed,rh); // Call callback with no error.
          return stream;
        }
        else { // Proxy errors directly from CouchDB.
          if (!parsed) { parsed = {}; }
          if (!parsed.message && (parsed.reason || parsed.error)) {
            parsed.message = (parsed.reason || parsed.error);
          }
          errs.handle(errs.merge(errs.create(parsed),
             { "scope"       : "couch"
             , "status_code" : status_code
             , "status-code" : status_code
             , "request"     : req
             , "headers"     : rh
             , "errid"       : "non_200"
             , "message"     : parsed.reason || "couch returned "+status_code
             }), callback);
          return stream;
        }
      });
      return stream;
    } catch(err5) {
      // Handle errors during request object creation.
      return errs.merge(err5,
         { "message": "request threw when you tried to create the object"
         , "scope"  : "request"
         , "errid"  : "callback"
         });
    }
  }


  // Fetches documents from a CouchDB view.
  function view_docs(design_name,view_name,params,callback) {
    if(typeof params === "function") {
      callback = params;
      params   = {};
    }
    var view_path = _bucket + '/_design/' + design_name + '/_view/'  + view_name;
    if (params.keys) {
      // If 'keys' are provided, use POST request.
      var body = {keys: params.keys};
      delete params.keys;
      return relax({ path: view_path, method: "POST", params: params, body: body}, callback);
    }
    else {
      // Otherwise, use GET request.
      return relax({path: view_path, method: "GET", params: params}, callback);
    }
  }


  // Fetches documents from a CouchDB spatial view.
  function view_spatial(design_name, view_name, params, callback) {
    if(typeof params === "function") {
      callback = params;
      params   = {};
    }
    var view_path = _bucket + '/_design/' + design_name + '/_spatial/'  + view_name;
    if (params.keys) {
      // Spatial views with 'keys' also use POST.
      var body = {keys: params.keys};
      delete params.keys;
      return relax({ path: view_path, method: "POST", params: params, body: body}, callback);
    }
    else {
      // Default to GET for spatial views.
      return relax({path: view_path, method: "GET", params: params}, callback);
      }
  }


  // Sets (creates or updates) a design document with views.
  function set_design(design_name, views, callback) {
    var view_path = _bucket + '/_design/' + design_name;
    // PUT request with views in the body.
    return relax({ path: view_path, method: "PUT", body: {views: views}}, callback);
  }


  // Sets (creates or updates) a design document with a spatial view.
  function set_spatial(design_name, geoview, callback) {
    var view_path = _bucket + '/_design/' + design_name;
    // PUT request with spatial view in the body.
    return relax({ path: view_path, method: "PUT", body: {views: {}, spatial: geoview}}, callback);
  }


  // Retrieves a design document.
  function get_design(design_name, callback) {
    var view_path = _bucket + '/_design/' + design_name;
    // GET request for the design document path.
    return relax({ path: view_path, method: "GET"}, callback);
  }


  // Deletes a design document.
  function delete_design(design_name, callback) {
    var view_path = _bucket + '/_design/' + design_name;
    // DELETE request for the design document path.
    return relax({ path: view_path, method: "DELETE"}, callback);
  }


  // Public API exposed by the baseview client.
  return {
    view: view_docs,             // Access regular views.
    spatial: view_spatial,       // Access spatial views.
    setSpatialDesign: set_spatial, // Create/update design doc with spatial view.
    setDesign: set_design,         // Create/update design doc with regular views.
    getDesign: get_design,         // Retrieve a design document.
    deleteDesign: delete_design    // Delete a design document.
  }
};