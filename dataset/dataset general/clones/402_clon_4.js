const node_http_module = require('http');
const file_system_module = require('fs');
const path_resolve_module = require('path');

const network_interface_port = 10080;

const current_script_location = __dirname;
const html_content_directory_name = 'html';
const static_assets_base_path = path_resolve_module.join(current_script_location, html_content_directory_name);

const mime_type_registry = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

const web_app_instance = node_http_module.createServer((incoming_request, outgoing_response) => {
    let requested_resource_path = incoming_request.url;

    if (requested_resource_path === '/') {
        requested_resource_path = '/index.html';
    }

    const full_file_system_path = path_resolve_module.join(static_assets_base_path, requested_resource_path);

    file_system_module.readFile(full_file_system_path, (data_retrieval_error, file_data) => {
        if (data_retrieval_error) {
            if (data_retrieval_error.code === 'ENOENT') {
                outgoing_response.writeHead(404, { 'Content-Type': 'text/html' });
                outgoing_response.end('<!DOCTYPE html><html><head><title>Resource Not Found</title></head><body><h1>404 - Resource Not Found</h1><p>The requested item does not exist.</p></body></html>');
            } else {
                outgoing_response.writeHead(500, { 'Content-Type': 'text/html' });
                outgoing_response.end('<!DOCTYPE html><html><head><title>Server Error</title></head><body><h1>500 - Internal Server Malfunction</h1><p>An unexpected condition was encountered.</p></body></html>');
            }
        } else {
            const file_extension = path_resolve_module.extname(full_file_system_path).toLowerCase();
            const content_classification = mime_type_registry[file_extension] || 'application/octet-stream';

            outgoing_response.writeHead(200, { 'Content-Type': content_classification });
            outgoing_response.end(file_data);
        }
    });
});

web_app_instance.listen(network_interface_port, () => {
    console.log('Server process active on port ' + network_interface_port);
});