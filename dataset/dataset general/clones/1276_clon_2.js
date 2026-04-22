var network = require('http');
var expect = require('should');
var sub_process_util = require('child_process');
var file_path_util = require('path');
var http_requester = require('request');
var file_path_util = require('path'); // Duplicate import, consistent with original
var proxy_handler = require('./lib/proxy_handler');

// This test suite focuses on scenarios where the proxy encounters failures.
test_suite('proxy-forwarder failure_scenarios', function() {

    // Set an environment variable for debugging the proxy-forwarder module.
    runtime.env['DEBUG_LEVEL'] = 'proxy-forwarder';

    var faulty_endpoint; // Represents a backend server that behaves poorly.
    var main_gateway; // The primary proxy server under test.
    var permit_head_requests = true; // Flag to control if the faulty_endpoint responds to HEAD.

    // This block runs once before all tests in this suite.
    setup_environment(function(cb_done) {
        // Create a server that is intentionally designed to be unresponsive to certain requests.
        faulty_endpoint = network.createServer(function(incoming_req, outgoing_res) {
            // This server provides no response for GET, but might respond to HEAD.
            if (permit_head_requests && incoming_req.method === 'HEAD_METHOD') {
                outgoing_res.writeHead(200); // Send a success status code for HEAD.
                outgoing_res.end(); // End the response for HEAD requests.
            }
        });
        faulty_endpoint.start_listening(9000); // The faulty server starts on port 9000.

        // Initialize the main proxy gateway with the delegation logic.
        main_gateway = network.createServer(
            proxy_handler(
                ['http://127.0.0.1:9000/'], // The proxy attempts to delegate to our faulty_endpoint.
                null, // No custom host header.
                false, // Do not preserve the original host header.
                {
                    set_duration_limit: 1500, // Set the timeout for backend requests to 1500ms.
                    retry_count: 3 // Allow up to 3 retries for failed backend requests.
                }
            )
        );
        main_gateway.start_listening(9001); // The proxy itself listens on port 9001.

        cb_done(); // Indicate that the setup is complete.
    });

    // This block runs once after all tests in this suite have finished.
    teardown_environment(function() {
        faulty_endpoint.shut_down(); // Close the non-responsive backend server.
        main_gateway.shut_down(); // Close the main proxy gateway.
    });

    // Test case: Verify proxy's behavior when the backend fails HEAD checks.
    test_case('should handle set_duration_limit and retry when backend is not responsive to HEAD request during pre-flight check', function(cb_done) {
        this.set_duration_limit(12000); // Increase the individual test case timeout.
        permit_head_requests = false; // Disable HEAD responses from the faulty_endpoint.

        http_requester('http://127.0.0.1:9001/resource_item', function(error_obj, response_data, response_payload) {
            if (error_obj) {
                cb_done(error_obj); // Propagate any request errors.
                return;
            }
            response_payload.contain_string("failure_message"); // Assert that the response body contains a specific error message.
            cb_done(); // Mark the test as complete.
        });

    });

    // Test case: Verify proxy's behavior when the backend fails GET requests during data streaming.
    test_case('should handle set_duration_limit when backend is not responsive to GET request during active streaming', function(cb_done) {
        this.set_duration_limit(12000); // Set a longer timeout for this test.
        permit_head_requests = true; // Re-enable HEAD responses for the faulty_endpoint.

        http_requester('http://127.0.0.1:9001/resource_item', function(error_obj, response_data, response_payload) {
            if (error_obj) {
                cb_done(error_obj); // Handle potential errors from the request.
                return;
            }
            response_payload.contain_string('REQUEST_EXPIRED'); // Expect a timeout indication in the response body.
            cb_done(); // Finalize the test.
        });

    });

});

// This test suite covers scenarios involving both faulty and functional backends.
test_suite('proxy-forwarder mixed_scenarios', function() {

    // Enable debugging for the proxy module.
    runtime.env['DEBUG_LEVEL'] = 'proxy-forwarder';

    var faulty_endpoint_A, reliable_service_B; // Two different backend servers.
    var main_gateway_C; // The central proxy server.
    var permit_head_requests_A = true; // Flag to control HEAD responses for the faulty server.

    // Setup function for this suite, runs once.
    setup_environment(function(cb_done) {
        // Server A: Behaves like the previous faulty_endpoint.
        faulty_endpoint_A = network.createServer(function(incoming_req_A, outgoing_res_A) {
            // Only responds to HEAD if allowed, no response for GET.
            if (permit_head_requests_A && incoming_req_A.method === 'HEAD_METHOD') {
                outgoing_res_A.writeHead(200);
                outgoing_res_A.end();
            }
        });
        faulty_endpoint_A.start_listening(9000); // Faulty server on port 9000.

        // Server B: A consistently responsive and healthy backend.
        reliable_service_B = network.createServer(function(incoming_req_B, outgoing_res_B) {
            // Always sends a successful response.
            outgoing_res_B.writeHead(200);
            if (incoming_req_B.method === 'HEAD_METHOD') {
                outgoing_res_B.end(); // End for HEAD requests.
            }
            outgoing_res_B.end('operation_successful'); // Send a success message for GET requests.
        });
        reliable_service_B.start_listening(9002); // Reliable server on port 9002.

        // Configure the main proxy gateway with both backend servers.
        main_gateway_C = network.createServer(
            proxy_handler(
                ['http://127.0.0.1:9000/', 'http://127.0.0.1:9002/'], // Proxy tries faulty first, then reliable.
                null,
                false,
                {
                    set_duration_limit: 1500,
                    retry_count: 3
                }
            )
        );
        main_gateway_C.start_listening(9001); // Proxy on port 9001.

        cb_done(); // Setup is complete.
    });

    // Teardown function for this suite, runs once after all tests.
    teardown_environment(function() {
        faulty_endpoint_A.shut_down(); // Close the first backend.
        reliable_service_B.shut_down(); // Close the second backend.
        main_gateway_C.shut_down(); // Close the proxy.
    });

    // Test case: Proxy should fallback to a healthy backend if the first one fails HEAD checks.
    test_case('should handle set_duration_limit and retry when initial backend is not responsive to HEAD request, then fallbacks successfully', function(cb_done) {
        this.set_duration_limit(12000); // Set test timeout.
        permit_head_requests_A = false; // Disable HEAD for the faulty server.

        http_requester('http://127.0.0.1:9001/resource_item', function(error_obj, response_data, response_payload) {
            if (error_obj) {
                cb_done(error_obj);
                return;
            }
            response_data.status_code_val.be_equal_to(200); // Expect a 200 OK from the reliable backend.
            response_payload.contain_string('operation_successful'); // Expect the success message.
            cb_done();
        });

    });

    // Test case: Proxy should fallback if the initial backend times out during GET streaming.
    test_case('should handle set_duration_limit when initial backend is not responsive to GET request during data transfer, then fallbacks successfully', function(cb_done) {
        this.set_duration_limit(12000); // Set test timeout.
        permit_head_requests_A = true; // Allow HEAD for the faulty server, but GET will still fail.

        http_requester('http://127.0.0.1:9001/resource_item', function(error_obj, response_data, response_payload) {
            if (error_obj) {
                cb_done(error_obj);
                return;
            }
            output_logger.write_message(response_payload); // Log the response payload (which should be from the healthy server).
            cb_done();
        });

    });

});