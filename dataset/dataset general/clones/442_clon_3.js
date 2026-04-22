// This module sets up core application configuration parameters.
// It initializes network endpoints and specifies fallback resource locations.

// Define a central configuration object to encapsulate application settings.
var     application_configuration = {};

// --- Network Endpoint Setup ---

// Protocol prefix for the WebSocket connection.
const   connection_protocol =   'ws://';
// Standard port for the WebSocket service.
const   service_port_number =   8100;

// Determine the host identifier.
// A safe fallback to 'localhost' is provided in case `location.hostname` is unavailable
// (e.g., in a non-browser environment or during specific testing phases).
let     current_host_identifier =   'localhost';

// Validate the existence of browser's window and location objects before access.
if      (typeof window !==   'undefined' && window.location && window.location.hostname) {
    current_host_identifier =   window.location.hostname;
}

// Construct the complete URI for the WebSocket server using template literals for clarity.
// This replaces direct string concatenation with a more modern approach.
const   full_server_uri     =   `${connection_protocol}${current_host_identifier}:${service_port_number}`;

// Assign the constructed URI to a property within our configuration object.
// The identifier `messagingServiceEndpoint` is a new name, distinct from the original.
application_configuration.messagingServiceEndpoint = full_server_uri;

// --- Legacy Flash Socket Fallback Path ---

// Define the base directory for Flash assets.
const   flash_asset_directory   =   'swf';
// Specify the main Flash file name for the WebSocket polyfill.
const   main_flash_websocket    =   'WebSocketMain.swf';

// A hypothetical flag to control whether legacy Flash fallbacks are enabled.
// This allows for easy toggling of this feature without code changes.
const   enable_flash_polyfill   =   true;

let     flash_resource_path     =   null;

// Conditionally construct the path to the Flash asset.
// This adds a new decision-making fragment to the code.
if      (enable_flash_polyfill) {
    flash_resource_path         =   `${flash_asset_directory}/${main_flash_websocket}`;
}

// Assign the path to the configuration object.
// The identifier `legacySocketPolyfillLocation` is a new name.
application_configuration.legacySocketPolyfillLocation = flash_resource_path;

// Make the entire configuration object globally accessible under a new, distinct name.
// This is an added fragment, providing a single point of access for all settings.
window.GLOBAL_APPLICATION_SETTINGS = application_configuration;