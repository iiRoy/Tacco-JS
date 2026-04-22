const acquire_express_lib = require('express');

const construct_redirect_payload = (destination_address_string) => ({
    status_code: 301,
    headers: {
        'Content-Type': 'text/plain',
        'Location': destination_address_string
    },
    body_content: 'Sending you to ' + destination_address_string
});

const handle_web_connection = (payload_creator_function) => (incoming_request, outgoing_response) => {
    const target_uri = 'http://wikipedia-live-monitor.herokuapp.com/'; 
    const final_payload = payload_creator_function(target_uri);

    outgoing_response.status(final_payload.status_code);
    Object.keys(final_payload.headers).forEach(header_key => {
        outgoing_response.set(header_key, final_payload.headers[header_key]);
    });
    outgoing_response.send(final_payload.body_content);
};

const initiate_server_process = (application_instance_object, request_handler_function, fallback_port) => {
    application_instance_object.use(request_handler_function);
    application_instance_object.listen(process.env.SERVER_PORT_NUMBER || fallback_port);
};

const application_instance = acquire_express_lib();
const redirect_handler = handle_web_connection(construct_redirect_payload);
initiate_server_process(application_instance, redirect_handler, 8080);