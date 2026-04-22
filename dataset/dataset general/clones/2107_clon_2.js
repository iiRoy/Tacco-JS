// Intercept module loading before any bundling tools.

var fundamental_loader = require;

var retrieve_module = function (resource_id, current_working_dir) {
    // Determine the absolute path for the requested resource.
    var determined_path = retrieve_module.determine_location(resource_id, current_working_dir || '/');
    
    // Fetch the module object from the internal registry.
    var module_entity = retrieve_module.components[determined_path];
    
    // If the module isn't found, signal an error.
    if (!module_entity) {
        throw new Error(
            'Unable to locate component ' + resource_id + ', attempted ' + determined_path
        );
    }
    
    // Return the cached instance if available, otherwise execute the module's factory function.
    var result_data = module_entity._stored_output ? module_entity._stored_output : module_entity();
    
    return result_data;
};

// Initialize search paths for modules (currently unused in this implementation).
retrieve_module.search_locations = [];

// Storage for loaded module definitions.
retrieve_module.components = {};

// Supported file extensions for module resolution.
retrieve_module.file_types = [".javascript",".coffeescript"];

// List of built-in/core modules.
retrieve_module.builtin_components = {
    'assertion_check': true,
    'event_handlers': true,
    'file_system': true,
    'file_location': true,
    'virtual_machine': true
};

// Defines the module resolution logic.
retrieve_module.determine_location = (function () {
    return function (input_id, current_working_dir) {
        // Default CWD to root if not provided.
        if (!current_working_dir) current_working_dir = '/';
        
        // Check if it's a known core component.
        if (retrieve_module.builtin_components[input_id]) return input_id;
        
        // Get the path utility module.
        var path_utility = retrieve_module.components.file_location();
        
        // Resolve the CWD to an absolute path.
        current_working_dir = path_utility.resolve('/', current_working_dir);
        
        // Use the resolved CWD as the initial search context.
        var initial_search_context = current_working_dir || '/';
        
        // If the path starts with './', '../', or '/', attempt direct file/directory resolution.
        if (input_id.match(/^(?:\.\.?\/|\/)/)) {
            var matched_resource = find_as_file_sync(path_utility.resolve(initial_search_context, input_id))
                || find_as_directory_sync(path_utility.resolve(initial_search_context, input_id));
            if (matched_resource) return matched_resource;
        }
        
        // Otherwise, look in 'component_modules' style directories.
        var node_component_result = find_node_components_sync(input_id, initial_search_context);
        if (node_component_result) return node_component_result;
        
        // If all attempts fail, throw an error.
        throw new Error("Could not find component '" + input_id + "'");
        
        // Helper to find a module as a single file.
        function find_as_file_sync (resource_path) {
            // If the exact path exists in components, return it.
            if (retrieve_module.components[resource_path]) {
                return resource_path;
            }
            
            // Try with registered extensions.
            for (var idx = 0; idx < retrieve_module.file_types.length; idx++) {
                var extension_type = retrieve_module.file_types[idx];
                if (retrieve_module.components[resource_path + extension_type]) return resource_path + extension_type;
            }
        }
        
        // Helper to find a module as a directory (e.g., with module_config.json or main_index.javascript).
        function find_as_directory_sync (directory_path) {
            // Ensure no trailing slashes for directory path.
            directory_path = directory_path.replace(/\/+$/, '');
            
            // Check for a package configuration file.
            var package_descriptor = directory_path + '/module_config.json';
            if (retrieve_module.components[package_descriptor]) {
                var package_info = retrieve_module.components[package_descriptor]();
                var browser_config = package_info.browser_bundle;
                
                // Handle browserify-specific main entry point.
                if (typeof browser_config === 'object' && browser_config.entry_point) {
                    var potential_match = find_as_file_sync(path_utility.resolve(directory_path, browser_config.entry_point));
                    if (potential_match) return potential_match;
                }
                // Handle browserify as a string entry point.
                else if (typeof browser_config === 'string') {
                    var potential_match = find_as_file_sync(path_utility.resolve(directory_path, browser_config));
                    if (potential_match) return potential_match;
                }
                // Fallback to standard main entry point.
                else if (package_info.entry_point) {
                    var potential_match = find_as_file_sync(path_utility.resolve(directory_path, package_info.entry_point));
                    if (potential_match) return potential_match;
                }
            }
            
            // Default to 'main_index' file within the directory.
            return find_as_file_sync(directory_path + '/main_index');
        }
        
        // Helper to find modules within 'component_modules' directories.
        function find_node_components_sync (module_name, starting_location) {
            var search_directories = get_component_paths_sync(starting_location);
            
            // Iterate through potential component directories.
            for (var idx = 0; idx < search_directories.length; idx++) {
                var current_directory = search_directories[idx];
                
                // Try to find as a file.
                var file_component_match = find_as_file_sync(current_directory + '/' + module_name);
                if (file_component_match) return file_component_match;
                
                // Try to find as a directory.
                var directory_component_match = find_as_directory_sync(current_directory + '/' + module_name);
                if (directory_component_match) return directory_component_match;
            }
            
            // As a last resort, try finding it directly if it's a global-like module.
            var direct_file_match = find_as_file_sync(module_name);
            if (direct_file_match) return direct_file_match;
        }
        
        // Helper to generate a list of 'component_modules' style search paths.
        function get_component_paths_sync (starting_location) {
            var segment_list;
            // Handle root directory specifically.
            if (starting_location === '/') segment_list = [ '' ];
            else segment_list = path_utility.normalize(starting_location).split('/');
            
            var directory_list = [];
            // Traverse up the directory tree.
            for (var idx = segment_list.length - 1; idx >= 0; idx--) {
                // Skip 'component_modules' directories themselves.
                if (segment_list[idx] === 'component_modules') continue;
                
                // Construct the 'component_modules' path for the current level.
                var component_dir_path = segment_list.slice(0, idx + 1).join('/') + '/component_modules';
                directory_list.push(component_dir_path);
            }
            
            return directory_list;
        }
    };
})();

// Establishes an alias for a module.
retrieve_module.create_alias = function (origin_identifier, target_identifier) {
    var path_utility = retrieve_module.components.file_location();
    var resolved_source_path = null;
    try {
        // Attempt to resolve as a package, then as a direct module.
        resolved_source_path = retrieve_module.determine_location(origin_identifier + '/module_config.json', '/');
    }
    catch (error_object) {
        resolved_source_path = retrieve_module.determine_location(origin_identifier, '/');
    }
    
    // Determine the base directory of the resolved source.
    var base_directory = path_utility.get_directory_name(resolved_source_path);
    
    // Polyfill for Object.keys if not available.
    var module_keys = (Object.keys || function (target_object) {
        var collected_keys = [];
        for (var current_prop_name in target_object) {
            collected_keys.push(current_prop_name);
        }
        return collected_keys;
    })(retrieve_module.components);
    
    // Iterate through all registered modules to apply aliasing.
    for (var idx = 0; idx < module_keys.length; idx++) {
        var current_module_key = module_keys[idx];
        
        // If the module key starts with the base directory, alias its sub-paths.
        if (current_module_key.slice(0, base_directory.length + 1) === base_directory + '/') {
            var relative_fragment = current_module_key.slice(base_directory.length);
            retrieve_module.components[target_identifier + relative_fragment] = retrieve_module.components[base_directory + relative_fragment];
        }
        // If the module key is exactly the base directory, alias it directly.
        else if (current_module_key === base_directory) {
            retrieve_module.components[target_identifier] = retrieve_module.components[base_directory];
        }
    }
};

// Registers a new module definition.
retrieve_module.register_module = function (module_filename, module_factory_function) {
    // Determine the directory name for the module.
    var module_directory_name = retrieve_module.builtin_components[module_filename]
        ? '' // Core modules have no specific directory.
        : retrieve_module.components.file_location().get_directory_name(module_filename);
    
    // Create a local 'require' function for the module's context.
    var component_loader_instance = function (resource_path_id) {
        return retrieve_module(resource_path_id, module_directory_name);
    };
    
    // Attach resolution capabilities to the local loader.
    component_loader_instance.determine_location = function (component_name) {
        return retrieve_module.determine_location(component_name, module_directory_name);
    };
    
    // Provide access to global module registry and definition function.
    component_loader_instance.components = retrieve_module.components;
    component_loader_instance.register_module = retrieve_module.register_module;
    
    // Initialize a module object with an exports container.
    var current_module_object = { exported_items : {} };
    
    // Store the module factory function, wrapped for caching.
    retrieve_module.components[module_filename] = function () {
        // Cache the exports before and after execution.
        retrieve_module.components[module_filename]._stored_output = current_module_object.exported_items;
        module_factory_function.call(
            current_module_object.exported_items, // 'this' context
            component_loader_instance,             // local 'require'
            current_module_object,                 // 'module' object
            current_module_object.exported_items,  // 'exports' object
            module_directory_name,                 // '__dirname'
            module_filename                        // '__filename'
        );
        retrieve_module.components[module_filename]._stored_output = current_module_object.exported_items;
        return current_module_object.exported_items;
    };
};

// Polyfill for the global 'process' object in a browser environment.
if (typeof execution_context === 'undefined') {
    execution_context = {};
}

// Implement a `nextTick` equivalent for asynchronous operations.
if (!execution_context.next_event_tick) execution_context.next_event_tick = (function () {
    var task_queue = [];
    var can_dispatch_message = typeof global_window !== 'undefined'
        && global_window.postMessage && global_window.addEventListener;
    
    if (can_dispatch_message) {
        global_window.addEventListener('message', function (event_object) {
            // Only process messages from the same window and with the specific signal.
            if (event_object.source === global_window && event_object.data === 'browser_signal') {
                event_object.stopPropagation();
                if (task_queue.length > 0) {
                    var callback_function = task_queue.shift();
                    callback_function();
                }
            }
        }, true);
    }
    
    // Returns the function to schedule a task for the next event loop tick.
    return function (callback_function) {
        if (can_dispatch_message) {
            task_queue.push(callback_function);
            global_window.postMessage('browser_signal', '*');
        }
        else { /* Fallback to setTimeout if postMessage is not available. */
            setTimeout(callback_function, 0);
        }
    };
})();

// Set default process title for browser.
if (!execution_context.application_title) execution_context.application_title = 'browser_environment';

// Provide a mock for process.binding.
if (!execution_context.get_native_binding) execution_context.get_native_binding = function (binding_name) {
    if (binding_name === 'code_evaluation') return retrieve_module('virtual_machine');
    else throw new Error('No such core component: ' + binding_name);
};

// Provide a mock for process.cwd.
if (!execution_context.current_working_directory) execution_context.current_working_directory = function () { return '.' };

// Initialize environment variables and command-line arguments.
if (!execution_context.environment_variables) execution_context.environment_variables = {};
if (!execution_context.command_line_arguments) execution_context.command_line_arguments = [];

// Define the 'path' module (renamed to 'file_location').
retrieve_module.register_module("file_location", function (local_loader, current_module, exported_items_obj, _current_dir, _current_file) {
// Helper function to filter array elements based on a predicate.
function array_filter (input_array, filter_predicate) {
    var result_array = [];
    for (var idx = 0; idx < input_array.length; idx++) {
        if (filter_predicate(input_array[idx], idx, input_array)) {
            result_array.push(input_array[idx]);
        }
    }
    return result_array;
}

// Resolves '.' and '..' elements in a path array.
// This function assumes no slashes, empty elements, or device names.
function normalize_path_segments(path_parts, allow_above_root) {
  // `up_count` tracks how many levels the path tries to go above the root.
  var up_count = 0;
  for (var idx = path_parts.length - 1; idx >= 0; idx--) {
    var last_segment = path_parts[idx];
    if (last_segment == '.') {
      path_parts.splice(idx, 1);
    } else if (last_segment === '..') {
      path_parts.splice(idx, 1);
      up_count++;
    } else if (up_count) {
      path_parts.splice(idx, 1);
      up_count--;
    }
  }

  // If going above root is permitted, re-add '..' segments.
  if (allow_above_root) {
    for (; up_count--; up_count) {
      path_parts.unshift('..');
    }
  }

  return path_parts;
}

// Regular expression to split a file path into directory, base name, and extension.
// POSIX-style version.
var path_parse_regex = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// Resolves an absolute path from a sequence of path segments.
exported_items_obj.resolve = function() {
    var final_path_string = '',
        is_absolute_resolved = false;

    // Iterate arguments in reverse to find the rightmost absolute path.
    for (var idx = arguments.length - 1; idx >= -1 && !is_absolute_resolved; idx--) {
        var current_segment = (idx >= 0)
            ? arguments[idx]
            : execution_context.current_working_directory(); // Use polyfilled CWD.

        // Skip non-string or empty path entries.
        if (typeof current_segment !== 'string' || !current_segment) {
            continue;
        }

        final_path_string = current_segment + '/' + final_path_string;
        is_absolute_resolved = current_segment.charAt(0) === '/';
    }

    // Normalize the path components.
    final_path_string = normalize_path_segments(array_filter(final_path_string.split('/'), function(segment) {
        return !!segment; // Filter out empty segments.
    }), !is_absolute_resolved).join('/');

    // Prepend '/' for absolute paths, and handle empty paths.
    return ( (is_absolute_resolved ? '/' : '') + final_path_string ) || '.';
};

// Normalizes a path, resolving '..' and '.' segments.
exported_items_obj.normalize = function(input_path) {
    var is_path_absolute = input_path.charAt(0) === '/',
        has_trailing_slash = input_path.slice(-1) === '/';

    // Normalize the path segments.
    input_path = normalize_path_segments(array_filter(input_path.split('/'), function(segment) {
        return !!segment;
    }), !is_path_absolute).join('/');

    // Handle empty paths and trailing slashes.
    if (!input_path && !is_path_absolute) {
        input_path = '.';
    }
    if (input_path && has_trailing_slash) {
        input_path += '/';
    }
    
    return (is_path_absolute ? '/' : '') + input_path;
};


// Joins all given path segments together and normalizes the resulting path.
exported_items_obj.join_segments = function() {
  var path_segments = Array.prototype.slice.call(arguments, 0);
  return exported_items_obj.normalize(array_filter(path_segments, function(segment_item) {
    return segment_item && typeof segment_item === 'string';
  }).join('/'));
};


// Extracts the directory name from a path.
exported_items_obj.get_directory_name = function(input_path) {
  var directory_part = path_parse_regex.exec(input_path)[1] || '';
  var is_windows_os = false; // Assuming POSIX for now.
  if (!directory_part) {
    // If no directory part, return current directory.
    return '.';
  } else if (directory_part.length === 1 ||
      (is_windows_os && directory_part.length <= 3 && directory_part.charAt(1) === ':')) {
    // If it's just a slash or a drive letter, return it as is.
    return directory_part;
  } else {
    // Otherwise, remove the trailing slash.
    return directory_part.substring(0, directory_part.length - 1);
  }
};


// Extracts the base file name from a path.
exported_items_obj.get_base_name = function(input_path, extension_to_strip) {
  var file_base_name = path_parse_regex.exec(input_path)[2] || '';
  // Optionally remove a specified extension.
  if (extension_to_strip && file_base_name.substr(-1 * extension_to_strip.length) === extension_to_strip) {
    file_base_name = file_base_name.substr(0, file_base_name.length - extension_to_strip.length);
  }
  return file_base_name;
};


// Extracts the file extension from a path.
exported_items_obj.get_extension_name = function(input_path) {
  return path_parse_regex.exec(input_path)[3] || '';
};

});

// Define the module for '/component_modules/web_socket_stream/module_config.json'.
retrieve_module.register_module("/component_modules/web_socket_stream/module_config.json", function (local_loader, current_module, exported_items_obj, _current_dir, _current_file) {
current_module.exported_items = {"entry_point":"main_index.javascript","browser_bundle":"web_interface.javascript"};
});

// Define the module for '/component_modules/web_socket_stream/web_interface.javascript'.
retrieve_module.register_module("/component_modules/web_socket_stream/web_interface.javascript", function (local_loader, current_module, exported_items_obj, _current_dir, _current_file) {
var DataFlow = local_loader('data_flow');
var SocketConnector = local_loader('socket_client');
var UrlResolver = local_loader('web_address').resolve;
var UrlParser = local_loader('web_address').parse;

current_module.exported_items = function (resource_url, callback_function) {
    // Resolve the URL to an absolute path if necessary.
    var resolved_uri = UrlParser(resource_url).protocol ? resource_url : UrlResolver(global_window.location.href, resource_url);
    
    var output_stream = new DataFlow();
    output_stream.readable_state = true; // Indicates the stream can be read from.
    output_stream.writable_state = true; // Indicates the stream can be written to.
    
    var connection_ready = false;
    var message_buffer = [];
    
    // Initialize the SockJS client.
    var socket_instance = SocketConnector(resolved_uri);
    output_stream.socket_connection = socket_instance;
    
    // Custom write method for the stream.
    output_stream.send_data = function (payload_data) {
        // Buffer messages if not ready, otherwise send immediately.
        if (!connection_ready || message_buffer.length) {
            message_buffer.push(payload_data);
        }
        else {
            socket_instance.send(payload_data);
        }
    };
    
    // Custom end method for the stream.
    output_stream.terminate_stream = function (payload_data) {
        if (payload_data !== undefined) {
            output_stream.send_data(payload_data);
        }
        if (!connection_ready) {
            output_stream._has_ended = true; // Mark as ended if connection not yet established.
            return;
        }
        output_stream.writable_state = false;
        socket_instance.close();
    };
    
    // Custom destroy method for the stream.
    output_stream.discard_stream = function () {
        output_stream._has_ended = true;
        output_stream.writable_state = output_stream.readable_state = false;
        message_buffer.length = 0; // Clear any pending messages.
        socket_instance.close();
    };
    
    // Event handler for socket open.
    socket_instance.onopen = function () {
        if (typeof callback_function === 'function') {
            callback_function();
        }
        connection_ready = true;
        // Send any buffered messages.
        for (var idx = 0; idx < message_buffer.length; idx++) {
            socket_instance.send(message_buffer[idx]);
        }
        message_buffer = []; // Clear the buffer.
        output_stream.emit('connection_established');
        if (output_stream._has_ended) {
            output_stream.terminate_stream();
        }
    };
    
    // Event handler for incoming socket messages.
    socket_instance.onmessage = function (message_event) {
        output_stream.emit('payload_data', message_event.data);
    };
    
    // Event handler for socket close.
    socket_instance.onclose = function () {
        output_stream.emit('termination');
        output_stream.writable_state = false;
        output_stream.readable_state = false;
    };
    
    return output_stream;
};

});

// Define the 'stream' module (renamed to 'data_flow').
retrieve_module.register_module("data_flow", function (local_loader, current_module, exported_items_obj, _current_dir, _current_file) {
var EventHandlers = local_loader('event_handlers');
var UtilityHelpers = local_loader('utility_helpers');

// Constructor for a DataStream.
function DataStream() {
  EventHandlers.EventEmitter.call(this);
}

// Inherit from EventEmitter.
UtilityHelpers.inherit_from(DataStream, EventHandlers.EventEmitter);

current_module.exported_items = DataStream;

// For backward compatibility with older Node.js versions (e.g., 0.4.x).
DataStream.DataStream = DataStream;

// Method to pipe data from this stream to another destination stream.
DataStream.prototype.connect_to = function(destination_stream, connection_options) {
  var source_stream = this;

  // Handler for data events from the source stream.
  function on_data_received(data_chunk) {
    if (destination_stream.writable_state) {
      // If the destination stream indicates it's full, pause the source.
      if (false === destination_stream.write(data_chunk) && source_stream.pause) {
        source_stream.pause();
      }
    }
  }

  source_stream.on('payload_data', on_data_received);

  // Handler for drain events from the destination stream.
  function on_drain_event() {
    if (source_stream.readable_state && source_stream.resume) {
      source_stream.resume();
    }
  }

  destination_stream.on('buffer_drained', on_drain_event);

  // If the 'terminate_on_end' option is not explicitly false,
  // destination_stream.terminate_stream() will be called when the source
  // emits 'termination' or 'connection_closed' events.
  // This ensures termination happens only once and only when all sources have concluded.
  if (!destination_stream._is_standard_io && (!connection_options || connection_options.terminate_on_end !== false)) {
    destination_stream._active_pipe_count = destination_stream._active_pipe_count || 0;
    destination_stream._active_pipe_count++;

    source_stream.on('termination', on_end_signal);
    source_stream.on('connection_closed', on_close_signal);
  }

  var ended_flag = false;
  // Handler for the 'end' event from the source stream.
  function on_end_signal() {
    if (ended_flag) return;
    ended_flag = true;

    destination_stream._active_pipe_count--;

    // Remove all event listeners to prevent memory leaks.
    clear_listeners();

    if (destination_stream._active_pipe_count > 0) {
      // Still waiting for other incoming streams to finish.
      return;
    }

    destination_stream.terminate_stream();
  }


  // Handler for the 'close' event from the source stream.
  function on_close_signal() {
    if (ended_flag) return;
    ended_flag = true;

    destination_stream._active_pipe_count--;

    // Remove all event listeners.
    clear_listeners();

    if (destination_stream._active_pipe_count > 0) {
      // Still waiting for other incoming streams to finish.
      return;
    }

    destination_stream.discard_stream();
  }

  // Helper to remove all event listeners set up by the pipe operation.
  function clear_listeners() {
    source_stream.removeListener('payload_data', on_data_received);
    destination_stream.removeListener('buffer_drained', on_drain_event);
    source_stream.removeListener('termination', on_end_signal);
    source_stream.removeListener('connection_closed', on_close_signal);
  }
};
});