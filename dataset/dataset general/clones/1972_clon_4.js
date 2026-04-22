const socketio_core = require('ws');
const file_monitor = require('chokidar');

function get_extension_from_path(source_path_string) {
    const last_slash_index = source_path_string.lastIndexOf('/');
    const file_segment = last_slash_index === -1 ? source_path_string : source_path_string.substring(last_slash_index + 1);
    const last_dot_position = file_segment.lastIndexOf('.');
    return last_dot_position === -1 ? '' : file_segment.substring(last_dot_position);
}

function create_throttled_action(operation_function, interval_duration_ms) {
    let last_execution_timestamp = 0;
    let pending_call_timer = null;

    return function(...arguments_list) {
        const current_moment = Date.now();
        const elapsed_since_last = current_moment - last_execution_timestamp;

        if (elapsed_since_last >= interval_duration_ms) {
            operation_function.apply(this, arguments_list);
            last_execution_timestamp = current_moment;
        } else {
            if (pending_call_timer) {
                clearTimeout(pending_call_timer);
            }
            pending_call_timer = setTimeout(() => {
                operation_function.apply(this, arguments_list);
                last_execution_timestamp = Date.now();
                pending_call_timer = null;
            }, interval_duration_ms - elapsed_since_last);
        }
    };
}

module.exports.initiate_live_sync = function (config_params) {
    const http_gateway = config_params.http_gateway;
    const web_application = config_params.web_application;
    const resource_paths = config_params.resource_paths;

    const client_hub = new socketio_core.Server({ server: http_gateway });
    let connection_id_generator = 0;
    const active_connections_map = new Map();

    client_hub.on('connection', function(incoming_connection) {
        const unique_session_id = `client_${++connection_id_generator}`;
        active_connections_map.set(unique_session_id, incoming_connection);
        incoming_connection.on('close', function() {
            active_connections_map.delete(unique_session_id);
        });
        incoming_connection.on('error', (err) => {
            console.error('Socket communication error:', err.message);
            active_connections_map.delete(unique_session_id);
        });
    });

    const message_emitter = create_throttled_action(function (payload_content) {
        console.log("Distributing update notification");
        for (const connected_client of active_connections_map.values()) {
            if (connected_client.readyState === socketio_core.OPEN) {
                connected_client.send(payload_content);
            }
        }
    }, 300);

    web_application.get("/dynamic-sync-agent.js", function (request_obj, response_obj) {
        response_obj.writeHead(200, {'Content-Type': 'application/javascript'});
        response_obj.end(`
            const live_channel = new WebSocket('ws://' + window.location.host + '/');
            live_channel.addEventListener('message', (incoming_event) => {
                const payload_data = String(incoming_event.data);
                if (['.css', '.less'].includes(payload_data)) {
                    console.info('Applying style updates');
                    const update_timestamp = '?fresh=' + new Date().getTime();
                    document.querySelectorAll('link[rel="stylesheet"]').forEach((style_link_element) => {
                        if (!style_link_element.href.includes("typekit")) {
                            try {
                                const current_link_url = new URL(style_link_element.href);
                                current_link_url.search = update_timestamp;
                                style_link_element.href = current_link_url.toString();
                            } catch (error_parsing_url) {
                                style_link_element.href = style_link_element.href.split('?')[0] + update_timestamp;
                            }
                        }
                    });
                } else {
                    window.location.assign(window.location.href);
                }
            });
        `);
    });

    const filesystem_observer = file_monitor.watch(resource_paths, {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });

    filesystem_observer.on('all', function(change_type, file_location) {
        console.log("Resource alteration detected:", get_extension_from_path(file_location));
        message_emitter(get_extension_from_path(file_location));
    });

    filesystem_observer.on('error', (err) => {
        console.error('Filesystem observer error:', err.message);
    });
};