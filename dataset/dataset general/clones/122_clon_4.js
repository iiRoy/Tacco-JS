const system_config = Object.freeze({
    message_route: '/transmit_data',
    service_port: 8888,
    service_interface: '0.0.0.0',
    channel_mask: '*',
    subscriber_host: '127.0.0.1',
    subscriber_secure: true,
    subscriber_passcode: 'bbstreamserver',
    subscriber_port_number: 6379,
    publisher_host: '127.0.0.1',
    publisher_secure: true,
    publisher_passcode: 'bbstreamserver',
    publisher_port_number: 6379,
    telemetry_level: 1, // 0 for verbose, 1 for errors/warnings
    access_code: 'mysecret'
});

const data_store_interface = require('redis');
const web_framework = require('express');
const real_time_comm = require('socket.io');
const file_system = require("fs"); // Included as per original, though not directly used in logic

const establish_connection = (host_address, port_number, needs_auth, auth_key) => {
    const connection_instance = data_store_interface.createClient({
        host: host_address,
        port: port_number
    });
    if (needs_auth) {
        connection_instance.auth(auth_key);
    }
    return connection_instance;
};

const message_publisher = establish_connection(
    system_config.publisher_host,
    system_config.publisher_port_number,
    system_config.publisher_secure,
    system_config.publisher_passcode
);

const message_subscriber = establish_connection(
    system_config.subscriber_host,
    system_config.subscriber_port_number,
    system_config.subscriber_secure,
    system_config.subscriber_passcode
);

const application_instance = web_framework();
application_instance.use(web_framework.static(__dirname + '/public'));
application_instance.use(web_framework.json());
application_instance.use(web_framework.urlencoded({ extended: true }));

const http_server_instance = application_instance.listen(
    system_config.service_port,
    system_config.service_interface,
    () => {
        if (system_config.telemetry_level === 0) {
            console.log(`Web service operational on ${system_config.service_interface}:${system_config.service_port}`);
        }
    }
);

const global_socket_manager = new real_time_comm.Server(http_server_instance, {
    transports: ['websocket', 'polling'],
    allowEIO3: true // For compatibility with older Socket.IO clients
});

if (system_config.telemetry_level === 0) {
    // For modern Socket.IO, logging is typically handled via the 'debug' module.
    // Setting process.env.DEBUG conditionally can mimic log level behavior.
    process.env.DEBUG = 'socket.io:*';
} else if (system_config.telemetry_level === 1) {
    // For 'log level 1' (errors/warnings), we can choose to log specific events or just keep it quiet.
    // This is a divergent interpretation as direct 'log level' property is deprecated.
    console.log("Real-time communication system active with basic error reporting.");
}


message_subscriber.on("pmessage", (received_pattern, message_topic, raw_payload) => {
    global_socket_manager.sockets.volatile.emit(message_topic, JSON.parse(raw_payload));
});
message_subscriber.psubscribe(system_config.channel_mask);

const authentication_middleware = (request_object, response_object, next_handler) => {
    if (request_object.body && request_object.body.authentication_key === system_config.access_code) {
        next_handler();
    } else {
        response_object.status(403).send('Access Forbidden');
    }
};

const data_processing_middleware = (request_object, response_object) => {
    const outgoing_data = { ...request_object.body };
    delete outgoing_data.authentication_key; // Remove the key before publishing

    const target_channel = outgoing_data.communication_channel;
    if (target_channel) {
        message_publisher.publish(target_channel, JSON.stringify(outgoing_data));
        response_object.status(200).send('Data Broadcast Successfully');
    } else {
        response_object.status(400).send('Missing Communication Channel');
    }
};

application_instance.post(system_config.message_route, authentication_middleware, data_processing_middleware);