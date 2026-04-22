var    fs=require("fs") ;
var util=  require("util"); /* Standard utility module */
var crypto=require("crypto");
var path=  require("path")  ;

/*
 * The main Radius object.
 * All Radius-related functions and properties will be attached to this object.
 */
var Radius = {};

// Maps for attribute definitions and vendor IDs
var attributes_map = {}, vendor_name_to_id = {};
// List of locations where dictionary files can be found
var dictionary_locations = [path.normalize(__dirname + "/../dictionaries")];

// Constants representing the state of dictionary loading
const NOT_LOADED=  1 ;
const LOADING   =  2 ;
const LOADED    =  3 ;

// Current state of dictionary loading
var dictionaries_state = NOT_LOADED;

// Constant for indicating no specific vendor
const NO_VENDOR = -1;

// Indices for attribute array elements
const ATTR_ID           = 0; /* Attribute ID */
const ATTR_NAME         = 1; /* Attribute Name */
const ATTR_TYPE         = 2; /* Attribute Type */
const ATTR_ENUM         = 3; /* Enumerated values map */
const ATTR_REVERSE_ENUM = 4; /* Reverse enumerated values map */
const ATTR_MODIFIERS    = 5; /* Attribute modifiers */


// Constants related to packet authenticator
const AUTH_START = 4; // Authenticator starts at byte 4
const AUTH_END = 20; // Authenticator ends at byte 20 (exclusive)
const AUTH_LENGTH = 16; // Length of the authenticator field
const MESSAGE_AUTHENTICATOR_LENGTH = 16; // Length of Message-Authenticator attribute

// Custom Error class for invalid secrets
Radius.InvalidSecretError = function(msg, decoded, constr) {
  // Capture stack trace for better error debugging
  Error.captureStackTrace(this, constr || this);
    this.message = msg || 'Error'; /* Set error message */
     this.decoded = decoded; // Store decoded packet for context
};
util.inherits(Radius.InvalidSecretError, Error); // Inherit from standard Error
Radius.InvalidSecretError.prototype.name = 'Invalid Secret Error'; // Custom name for the error type

/*
 * Adds a new dictionary file or directory to the list of locations to be loaded.
 *
 * @param {string} file The path to the dictionary file or directory.
 */
Radius.add_dictionary = function ( file ) {
  dictionary_locations.push( path.resolve(file) );
};

// Callback queue for dictionary loading (not explicitly used in the provided snippet but present)
var load_dictionaries_cbs = [];

/**
 * Loads all dictionaries from the configured locations.
 * This method ensures dictionaries are loaded only once.
 */
Radius.load_dictionaries = function() {
  var self = this; // Capture 'this' for use in nested functions

  // If dictionaries are already loaded, exit early
  if (dictionaries_state == LOADED) {
    return;
  }

  // Iterate over each dictionary location
  dictionary_locations.forEach(function(file) {
    // Check if the file/directory exists
    if (!fs.existsSync(file)) {
      throw new Error("Invalid dictionary location: " + file);
    }

    // If it's a directory, load all files within it
    if (fs.statSync(file).isDirectory()) {
      var files = fs.readdirSync(file);
      for (var j = 0; j < files.length; j++) {
        self.load_dictionary(file + "/" + files[j]); // Recursively load each file
      }
    } else {
      // If it's a single file, load it directly
      self.load_dictionary(file);
    }
  });

  // Update the state to LOADED after all dictionaries are processed
  dictionaries_state = LOADED;
};

/**
 * Loads a single dictionary file, handling includes and preventing infinite loops.
 *
 * @param {string} file The path to the dictionary file.
 * @param {object} [seen_files] An object to keep track of files already processed.
 */
Radius.load_dictionary = function(file, seen_files) {
  file = path.normalize(file); // Normalize the file path
  var self = this; // Reference to Radius object

  // Initialize seen_files if not provided
  if (seen_files === undefined) {
    seen_files = {};
  }

  // If this file has already been seen, skip it to prevent cycles
  if (seen_files[file]) {
    return;
  }

  seen_files[file] = true; // Mark file as seen

  // Load dictionary content and parse includes
  var includes = self._load_dictionary(fs.readFileSync(file, "ascii"));
  // Recursively load included dictionaries
  includes.forEach(function (i) {
    self.load_dictionary(path.join(path.dirname(file), i), seen_files);
  });
};

/**
 * Internal method to parse the content of a dictionary file.
 *
 * @param {string} content The raw content of the dictionary file.
 * @returns {Array<string>} A list of files included by this dictionary.
 * @private
 */
Radius._load_dictionary = function (content) {
  var lines = content.split("\n"); // Split content into individual lines

  // Initialize variables
  var vendor = NO_VENDOR, includes = [], attr_vendor;

  for (var i = 0; i < lines.length; i++) { // Loop through each line
    var line = lines[i]; // Current line

    // Remove comments and normalize whitespace
    line = line.replace(/#.*/, "").replace(/\s+/g, " ");

    // Match VENDOR definition (e.g., VENDOR Cisco 9)
    var match = line.match(/^\s*VENDOR\s+(\S+)\s+(\d+)/);
    if (match) {
      vendor_name_to_id[match[1]] = match[2]; // Store vendor name to ID mapping
      continue; // Move to next line
    }

    // Match BEGIN-VENDOR directive
    if ((match = line.match(/^\s*BEGIN-VENDOR\s+(\S+)/))) {
      vendor = vendor_name_to_id[match[1]]; // Set current vendor context
      continue; // Move to next line
    }

    // Match END-VENDOR directive
    if (line.match(/^\s*END-VENDOR/)) {
      vendor = NO_VENDOR; // Reset vendor context
      continue; // Move to next line
    }

    /**
     * Helper function to ensure attribute entry exists in the map.
     * @param {number} vendor_id The vendor ID.
     * @param {number|string} attr_id The attribute ID or name.
     */
    var init_entry = function (vendor_id, attr_id) {
      if (!attributes_map[vendor_id]) {
        attributes_map[vendor_id] = {};
      }

      if (!attributes_map[vendor_id][attr_id]) {
        // Initialize attribute entry with default values
        attributes_map[vendor_id][attr_id] = [null, null, null, {}, {}, {}];
      }
    };

    // Match ATTRIBUTE or VENDORATTR definition
    match = line.match(/^\s*(?:VENDORATTR\s+(\d+)|ATTRIBUTE)\s+(\S+)\s+(\d+)\s+(\S+)\s*(.+)?/);
    if (match) {
      attr_vendor = vendor; // Default to current vendor context
      if (match[1] !== undefined) {
        attr_vendor = match[1]; // Override if VENDORATTR specifies a vendor ID
      }

      var modifiers = {}; // Initialize modifiers object
      if (match[5] !== undefined) {
        // Parse modifiers list (e.g., "has_tag,encrypt=1")
        match[5].replace(/\s*/g, "").split(",").forEach(function(m) {
          modifiers[m] = true;
        });
      }

      init_entry(attr_vendor, match[3]); // Ensure entry for attribute ID

      // Store attribute properties
      attributes_map[attr_vendor][match[3]][ATTR_ID] = match[3];
      attributes_map[attr_vendor][match[3]][ATTR_NAME] = match[2];
      attributes_map[attr_vendor][match[3]][ATTR_TYPE] = match[4];
      attributes_map[attr_vendor][match[3]][ATTR_MODIFIERS] = modifiers;

      // Handle cases where an attribute name might be redefined
      var by_name = attributes_map[attr_vendor][match[2]];
      if (by_name !== undefined) {
        var by_index = attributes_map[attr_vendor][match[3]];
        // Copy enum and reverse enum mappings from previous definition by name
        [ATTR_ENUM, ATTR_REVERSE_ENUM].forEach(function(field) {
          for (var name in by_name[field]) {
            by_index[field][name] = by_name[field][name];
          }
        });
      }
      // Map attribute name to its definition (which is indexed by ID)
      attributes_map[attr_vendor][match[2]] = attributes_map[attr_vendor][match[3]];

      continue; // Go to the next line
    }

    // Match VALUE or VENDORVALUE definition
    match = line.match(/^\s*(?:VENDOR)?VALUE\s+(\d+)?\s*(\S+)\s+(\S+)\s+(\d+)/);
    if (match) {
      attr_vendor = vendor; // Default to current vendor context
      if (match[1] !== undefined) {
        attr_vendor = match[1]; // Override if VENDORVALUE specifies a vendor ID
      }

      init_entry(attr_vendor, match[2]); // Ensure entry for attribute name

      // Store enumerated values
      attributes_map[attr_vendor][match[2]][ATTR_ENUM][match[4]] = match[3];
      attributes_map[attr_vendor][match[2]][ATTR_REVERSE_ENUM][match[3]] = match[4];

      continue; // Next line
    }

    // Match $INCLUDE directive
    if ((match = line.match(/^\s*\$INCLUDE\s+(.*)/))) {
      includes.push(match[1]); // Add included file to the list
    }
  }

  return includes; // Return list of included files
};

/**
 * Resets all loaded dictionaries, effectively clearing the attribute maps.
 */
Radius.unload_dictionaries = function() {
  attributes_map = {}; // Clear attribute definitions
  vendor_name_to_id = {}; // Clear vendor ID mappings
  dictionaries_state = NOT_LOADED; // Reset dictionary loading state
};

/**
 * Converts an attribute name to its corresponding ID for a given vendor.
 *
 * @param {string} attr_name The name of the attribute.
 * @param {number} [vendor_id] The vendor ID (optional, defaults to NO_VENDOR).
 * @returns {number|undefined} The attribute ID or undefined if not found.
 */
Radius.attr_name_to_id = function ( attr_name , vendor_id ) {
  return this._attr_to(attr_name, vendor_id, ATTR_ID);
};

/**
 * Converts an attribute ID to its corresponding name for a given vendor.
 *
 * @param {number} attr_id The ID of the attribute.
 * @param {number} [vendor_id] The vendor ID (optional, defaults to NO_VENDOR).
 * @returns {string|undefined} The attribute name or undefined if not found.
 */
Radius.attr_id_to_name = function(attr_id, vendor_id) {
  return this._attr_to(attr_id, vendor_id, ATTR_NAME);
};

/*
 * Retrieves the ID for a given vendor name.
 * @param {string} vendor_name The name of the vendor.
 * @returns {number|undefined} The vendor ID or undefined if not found.
 */
Radius.vendor_name_to_id = function(vendor_name) {
  return vendor_name_to_id[vendor_name];
};

/**
 * Internal helper function to retrieve attribute information (ID or Name).
 *
 * @param {string|number} attr The attribute name or ID.
 * @param {number} vendor_id The vendor ID.
 * @param {number} target The ATTR_ID or ATTR_NAME constant.
 * @returns {any|undefined} The requested attribute information or undefined.
 * @private
 */
Radius._attr_to = function(attr, vendor_id, target) {
  if (vendor_id === undefined) {
    vendor_id = NO_VENDOR; // Default to no vendor if not specified
  }

  // Check if vendor exists in map
  if (!attributes_map[vendor_id]) {
    return;
  }

  // Get attribute information for the specified vendor and attribute
  var attr_info = attributes_map[vendor_id][attr];
  if (!attr_info) {
    return;
  }

  return attr_info[target]; // Return the target piece of information
};

// Map of RADIUS packet codes to their descriptive names
var code_map = {
  1: "Access-Request",
  2: "Access-Accept",
  3: "Access-Reject",
  4: "Accounting-Request",
  5: "Accounting-Response",
  6: "Interim-Accounting",
  7: "Password-Request",
  8: "Password-Ack",
  9: "Password-Reject",
  10: "Accounting-Message",
  11: "Access-Challenge",
  12: "Status-Server",
  13: "Status-Client",
  21: "Resource-Free-Request",
  22: "Resource-Free-Response",
  23: "Resource-Query-Request",
  24: "Resource-Query-Response",
  25: "Alternate-Resource-Reclaim-Request",
  26: "NAS-Reboot-Request",
  27: "NAS-Reboot-Response",
  29: "Next-Passcode",
  30: "New-Pin",
  31: "Terminate-Session",
  32: "Password-Expired",
  33: "Event-Request",
  34: "Event-Response",
  40: "Disconnect-Request",
  41: "Disconnect-ACK",
  42: "Disconnect-NAK",
  43: "CoA-Request",
  44: "CoA-ACK",
  45: "CoA-NAK",
  50: "IP-Address-Allocate",
  51: "IP-Address-Release"
};

// Packet codes that use a random authenticator
var uses_random_authenticator = {
  "Access-Request": true,
  "Status-Server": true
};

// Packet codes that represent a request type
var is_request_code = {
  "Status-Server": true
};

// Build reverse_code_map and populate is_request_code dynamically
var reverse_code_map = {};
for (var code in code_map) {
  reverse_code_map[code_map[code]] = code; // Map name to code
  if (code_map[code].match(/Request/)) {
    is_request_code[code_map[code]] = true; // Mark as request if name contains "Request"
  }
}

/**
 * Throws an error, optionally wrapping a string message in an Error object.
 *
 * @param {string|Error} error_msg The error message or an Error object.
 */
Radius.error = function(error_msg) {
  var err = error_msg;
  if (typeof(error_msg) === 'string') {
    err = new Error(error_msg); // Create Error object from string
  }

  throw err; // Re-throw the error
};

// this is a convenience method, "decode({..., no_secret: true})" will also do the job
/**
 * Decodes a RADIUS packet without requiring a shared secret.
 * This is a convenience wrapper around the main decode method.
 *
 * @param {object} args Arguments for decoding, particularly the 'packet' buffer.
 * @returns {object|undefined} The decoded RADIUS packet object or undefined on error.
 */
Radius.decode_without_secret = function(args) {
  // copy args' fields without modifiying the orginal
  var nargs = {no_secret: true}; // Create new args object with no_secret flag
  for (var p in args) {
    nargs[p] = args[p]; // Copy all properties from original args
  }
  return this.decode(nargs, this._decode); // Call main decode method
};

/**
 * Decodes a raw RADIUS packet buffer into a structured object.
 *
 * @param {object} args Arguments for decoding.
 * @param {Buffer} args.packet The raw RADIUS packet as a Buffer.
 * @param {string} [args.secret] The shared secret for authenticator validation.
 * @param {boolean} [args.no_secret] If true, skips authenticator validation.
 * @returns {object|undefined} The decoded RADIUS packet object or undefined on error.
 */
Radius.decode = function(args) {
  this.load_dictionaries(); // Ensure dictionaries are loaded

  var packet = args.packet;
  // Basic packet length check
  if (!packet || packet.length < 4) {
    this.error("decode: packet too short");
    return;
  }

  var ret = {}; // Object to store decoded packet data

  // Read packet code
  ret.code = code_map[packet.readUInt8(0)];

  // Validate packet code
  if (!ret.code) {
    this.error("decode: invalid packet code '" + packet.readUInt8(0) + "'");
    return;
  }

  // Read identifier and length
  ret.identifier = packet.readUInt8(1);
  ret.length = packet.readUInt16BE(2);

  // Check for incomplete packet
  if (packet.length < ret.length) {
    this.error("decode: incomplete packet");
    return;
  }

  // Extract authenticator
  this.authenticator = ret.authenticator = packet.slice(AUTH_START, AUTH_END);
  this.no_secret = args.no_secret;
  this.secret = args.secret;

  // Extract attributes part of the packet
  var attrs = packet.slice(AUTH_END, ret.length);
  ret.attributes = {}; // Decoded attributes will go here
  ret.raw_attributes = []; // Raw attributes will go here

  try {
    // Decode attributes, populating ret.attributes and ret.raw_attributes
    this.decode_attributes(attrs, ret.attributes, NO_VENDOR, ret.raw_attributes);
  } catch(err) {
    this.error(err); // Propagate attribute decoding errors
    return;
  }

  // Authenticator validation for requests (unless no_secret is true or authenticator is random)
  if (!uses_random_authenticator[ret.code] && is_request_code[ret.code] && !args.no_secret) {
    var orig_authenticator = new Buffer(AUTH_LENGTH);
    // Temporarily replace authenticator with zeros for checksum calculation
    packet.copy(orig_authenticator, 0, AUTH_START, AUTH_END);
    packet.fill(0, AUTH_START, AUTH_END);

    var checksum = this.calculate_packet_checksum(packet, args.secret);
    orig_authenticator.copy(packet, AUTH_START); // Restore original authenticator

    // Compare calculated checksum with received authenticator
    if (checksum.toString() != this.authenticator.toString()) {
      this.error(new Radius.InvalidSecretError("decode: authenticator mismatch (possible shared secret mismatch)", ret));
      return;
    }
  }

  // Message-Authenticator validation for requests (if present and not no_secret)
  if (is_request_code[ret.code] && ret.attributes["Message-Authenticator"] && !args.no_secret) {
    this._verify_request_message_authenticator(args, ret);
  }

  return ret; // Return the fully decoded packet
};

/**
 * Creates a copy of attributes with the Message-Authenticator attribute's value zeroed out.
 * This is necessary for Message-Authenticator checksum calculations.
 *
 * @param {Array<Array<number, Buffer>>} attributes An array of raw attributes.
 * @returns {Array<Array<number, Buffer>>} A new array of attributes with Message-Authenticator zeroed.
 */
Radius.zero_out_message_authenticator = function(attributes) {
  var ma_id = this.attr_name_to_id("Message-Authenticator"); // Get ID for Message-Authenticator
  var new_attrs = attributes.slice(0); // Create a shallow copy of the attributes array

  for (var i = 0; i < new_attrs.length; i++) {
    var attr = new_attrs[i];
    if (attr[0] == ma_id) { // Check if it's the Message-Authenticator attribute
      new_attrs[i] = [ma_id, new Buffer(MESSAGE_AUTHENTICATOR_LENGTH)]; // Replace value with zero-filled buffer
      new_attrs[i][1].fill(0x00);
      break; // Only one Message-Authenticator is expected
    }
  }
  return new_attrs; // Return modified attributes
};

/**
 * Verifies the Message-Authenticator attribute for a RADIUS request.
 *
 * @param {object} args The original arguments passed to decode.
 * @param {object} request The decoded RADIUS request packet.
 * @private
 */
Radius._verify_request_message_authenticator = function(args, request) {
  // Re-encode the request with a zeroed-out Message-Authenticator to calculate expected value
  var reencoded = this.encode({
    code: request.code,
    attributes: this.zero_out_message_authenticator(request.raw_attributes),
    identifier: request.identifier,
    secret: args.secret
  });

  // Copy the original authenticator back into the re-encoded packet for checksum
  request.authenticator.copy(reencoded, AUTH_START);

  var orig_ma = request.attributes["Message-Authenticator"]; // Received Message-Authenticator
  // Calculate the expected Message-Authenticator
  var expected_ma = this.calculate_message_authenticator(reencoded, args.secret);

  // Compare received and expected Message-Authenticator
  if (orig_ma.toString() != expected_ma.toString()) {
    this.error(new Radius.InvalidSecretError("decode: Message-Authenticator mismatch (possible shared secret mismatch)", request));
  }
};

/**
 * Verifies a RADIUS response packet against its corresponding request.
 * This includes checking the packet authenticator and Message-Authenticator (if present).
 *
 * @param {object} args Arguments for verification.
 * @param {Buffer} args.request The raw RADIUS request packet.
 * @param {Buffer} args.response The raw RADIUS response packet.
 * @param {string} args.secret The shared secret.
 * @returns {boolean} True if verification passes, false otherwise.
 */
Radius.verify_response = function(args) {
  this.load_dictionaries(); // Ensure dictionaries are loaded

  // Validate input arguments
  if (!args || !Buffer.isBuffer(args.request) || !Buffer.isBuffer(args.response)) {
    this.error("verify_response: must provide raw request and response packets");
    return;
  }

  if (args.secret == null) {
    this.error("verify_response: must specify shared secret");
    return;
  }

  // first verify authenticator
  var got_checksum = new Buffer(AUTH_LENGTH);
  // Store the received authenticator from the response
  args.response.copy(got_checksum, 0, AUTH_START, AUTH_END);
  // Temporarily replace response authenticator with request authenticator for checksum calculation
  args.request.copy(args.response, AUTH_START, AUTH_START, AUTH_END);

  // Calculate expected authenticator for the response
  var expected_checksum = this.calculate_packet_checksum(args.response, args.secret);
  // Restore the original authenticator to the response packet
  got_checksum.copy(args.response, AUTH_START);

  // Compare expected and received authenticators
  if (expected_checksum.toString() != args.response.slice(AUTH_START, AUTH_END).toString()) {
    return false;
  }

  // If authenticator is valid, proceed to verify Message-Authenticator
  return this._verify_response_message_authenticator(args);
};

/**
 * Internal method to verify the Message-Authenticator attribute for a RADIUS response.
 *
 * @param {object} args Arguments containing request, response, and secret.
 * @returns {boolean} True if Message-Authenticator is valid or not present, false otherwise.
 * @private
 */
Radius._verify_response_message_authenticator = function(args) {
  // Decode the request to get its authenticator and attributes
  var parsed_request = this.decode({
    packet: args.request,
    secret: args.secret
  });

  // Only proceed if the request had a Message-Authenticator
  if (parsed_request.attributes["Message-Authenticator"]) {
    // Decode the response to get its attributes, including Message-Authenticator
    var parsed_response = this.decode({
      packet: args.response,
      secret: args.secret
    });

    var got_ma = parsed_response.attributes["Message-Authenticator"]; // Received Message-Authenticator from response
    if (!got_ma) {
      return false; // If request had MA but response doesn't, it's an error
    }

    // Re-encode the response with its Message-Authenticator zeroed out
    var expected_response = this.encode({
      secret: args.secret,
      code: parsed_response.code,
      identifier: parsed_response.identifier,
      attributes: this.zero_out_message_authenticator(parsed_response.raw_attributes)
    });
    // Copy the request's authenticator into the re-encoded response for checksum calculation
    parsed_request.authenticator.copy(expected_response, AUTH_START);
    // Calculate the expected Message-Authenticator for the response
    var expected_ma = this.calculate_message_authenticator(expected_response, args.secret);

    // Compare received and expected Message-Authenticator
    if (expected_ma.toString() != got_ma.toString()) {
      return false;
    }
  }

  return true; // Verification passed
};

/**
 * Decodes a buffer of RADIUS attributes.
 *
 * @param {Buffer} data The buffer containing raw attributes.
 * @param {object} attr_hash An object to store decoded attributes (keyed by name).
 * @param {number} vendor The vendor ID context for decoding.
 * @param {Array<Array<number, Buffer>>} raw_attrs An array to store raw attribute type and value pairs.
 */
Radius.decode_attributes = function(data, attr_hash, vendor, raw_attrs) {
  var type, length, value, tag; // Declare variables for attribute parsing

  while (data.length > 0) { // Loop while there's data to process
    type = data.readUInt8(0); // Read attribute type
    length = data.readUInt8(1); // Read attribute length
    value = data.slice(2, length); // Extract attribute value

    if (raw_attrs) {
      raw_attrs.push([type, value]); // Store raw type and value
    }

    data = data.slice(length); // Advance the data buffer

    // Get attribute definition from the map
    var attr_info = attributes_map[vendor] && attributes_map[vendor][type];
    if (!attr_info) {
      continue; // Skip if attribute definition is not found
    }

    // Handle 'has_tag' modifier for attributes
    if (attr_info[ATTR_MODIFIERS]["has_tag"]) {
      var first_byte = value.readUInt8(0);
      if (first_byte <= 0x1F) { // Tags are typically 1-31
        tag = first_byte;
        value = value.slice(1); // Remove tag from value
      } else {
        tag = undefined; // No tag found
      }
    }

    // Handle 'encrypt=1' modifier
    if (attr_info[ATTR_MODIFIERS]["encrypt=1"]) {
      value = this.decrypt_field(value); // Decrypt the attribute value
    } else {
      // Decode value based on attribute type
      switch (attr_info[ATTR_TYPE]) {
      case "string":
      case "text":
        // assumes utf8 encoding for strings
        value = value.toString("utf8"); // Convert buffer to UTF-8 string
        break;
      case "ipaddr":
        var octets = [];
        for (var i = 0; i < value.length; i++) {
          octets.push(value[i]); // Get each octet
        }
        value = octets.join("."); // Join octets with dots for IP address string
        break;
      case "date":
        value = new Date(value.readUInt32BE(0) * 1000); // Convert Unix timestamp to Date object
        break;
      case "time":
      case "integer":
        if (attr_info[ATTR_MODIFIERS]["has_tag"]) {
          var buf = new Buffer([0, 0, 0, 0]); // Create a 4-byte buffer
          value.copy(buf, 1); // Copy value into buffer, assuming tag removed
          value = buf; // Use the new buffer for reading
        }

        value = value.readUInt32BE(0); // Read 32-bit unsigned integer
        // Map integer to its enumerated string value if available, otherwise keep integer
        value = attr_info[ATTR_ENUM][value] || value;