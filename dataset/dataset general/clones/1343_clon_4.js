const node_http = require('http');
const file_system = require('fs');
const path_utilities = require('path');
const form_data_handler = require('formidable');
const image_processor = require('sharp');

const artifact_storage_location = path_utilities.join(__dirname, 'content', 'artifacts');
const content_delivery_root = path_utilities.join(__dirname, 'content');

// Ensure the storage directory exists
if (!file_system.existsSync(artifact_storage_location)) {
    file_system.mkdirSync(artifact_storage_location, { recursive: true });
}

// Collection of acceptable media extensions for processing
const permitted_media_extensions = new Set(['png', 'jpg', 'jpeg', 'gif', 'bmp']);

// Function to generate a new file path with an inserted tag
function formulate_modified_path(original_full_path, insertion_identifier) {
    const parsed_data = path_utilities.parse(original_full_path);
    const updated_base_name = `${parsed_data.name}_${insertion_identifier}`;
    return path_utilities.format({
        dir: parsed_data.dir,
        name: updated_base_name,
        ext: parsed_data.ext
    });
}

// Function to clean up file names
function cleanse_file_label(input_label) {
    return input_label.replace(/\W+/g, '-').toLowerCase();
}

const custom_server_instance = node_http.createServer((incoming_transaction, outgoing_transmission) => {
    outgoing_transmission.setHeader('Access-Control-Allow-Origin', '*');
    outgoing_transmission.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    outgoing_transmission.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

    if (incoming_transaction.method === 'OPTIONS') {
        outgoing_transmission.writeHead(204);
        outgoing_transmission.end();
        return;
    }

    // Handle incoming data uploads
    if (incoming_transaction.url === '/data/send' && incoming_transaction.method === 'POST') {
        const data_parser = form_data_handler({
            uploadDir: artifact_storage_location,
            keepExtensions: true,
            filename: (field_id, extension_segment, part_details, form_context) => {
                const original_client_name = part_details.originalFilename;
                const cleansed_core_name = cleanse_file_label(path_utilities.parse(original_client_name).name);
                const file_dot_extension = path_utilities.extname(original_client_name);
                return `${cleansed_core_name}${file_dot_extension}`;
            }
        });

        data_parser.parse(incoming_transaction, async (parsing_err, form_fields, received_payloads) => {
            if (parsing_err) {
                outgoing_transmission.writeHead(500, { 'Content-Type': 'application/json' });
                outgoing_transmission.end(JSON.stringify({ processing_status: 'upload_failure', diagnostic: parsing_err.message }));
                return;
            }

            const primary_payload = received_payloads.file_data_bundle; // Assuming input field name 'file_data_bundle'
            if (!primary_payload) {
                outgoing_transmission.writeHead(400, { 'Content-Type': 'application/json' });
                outgoing_transmission.end(JSON.stringify({ processing_status: 'no_file_received' }));
                return;
            }

            const initial_client_label = primary_payload.originalFilename;
            const temporary_file_path = primary_payload.filepath;
            const permanent_storage_label = path_utilities.basename(temporary_file_path);

            const detected_extension = path_utilities.extname(initial_client_label).slice(1); // Remove leading dot

            let output_envelope = {
                is_visual_content: false,
                initial_label: initial_client_label,
                final_label: permanent_storage_label
            };

            if (permitted_media_extensions.has(detected_extension.toLowerCase())) {
                try {
                    const miniature_version_path = formulate_modified_path(temporary_file_path, 'mini');

                    await image_processor(temporary_file_path)
                        .resize(50, 50, { fit: 'cover' })
                        .toFile(miniature_version_path);

                    output_envelope.is_visual_content = true;
                    output_envelope.miniature_representation = path_utilities.basename(miniature_version_path);
                    outgoing_transmission.writeHead(200, { 'Content-Type': 'application/json' });
                    outgoing_transmission.end(JSON.stringify(output_envelope));
                } catch (transformation_error) {
                    console.error('Visual content processing issue:', transformation_error);
                    outgoing_transmission.writeHead(500, { 'Content-Type': 'application/json' });
                    outgoing_transmission.end(JSON.stringify({ processing_status: 'image_conversion_error', diagnostic: transformation_error.message }));
                }
            } else {
                outgoing_transmission.writeHead(200, { 'Content-Type': 'application/json' });
                outgoing_transmission.end(JSON.stringify(output_envelope));
            }
        });
    } else {
        // Serve static files for other GET requests
        let requested_resource_path = incoming_transaction.url === '/' ? '/index.html' : incoming_transaction.url;
        let local_file_system_path = path_utilities.join(content_delivery_root, requested_resource_path);

        file_system.access(local_file_system_path, file_system.constants.R_OK, (access_issue) => {
            if (access_issue) {
                outgoing_transmission.writeHead(404, { 'Content-Type': 'text/plain' });
                outgoing_transmission.end('Requested Resource Unavailable');
                return;
            }

            const mime_type_mapping = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon'
            };
            const current_file_extension = path_utilities.extname(local_file_system_path);
            const content_classification = mime_type_mapping[current_file_extension] || 'application/octet-stream';

            outgoing_transmission.writeHead(200, { 'Content-Type': content_classification });
            file_system.createReadStream(local_file_system_path).pipe(outgoing_transmission);
        });
    }
});

const operational_port = 8080;
custom_server_instance.listen(operational_port, () => {
    console.log(`Server function active on port ${operational_port}`);
});