/*
 * This file contains a suite of tests for the Primus.io library,
 * demonstrating its core functionalities such as channel management,
 * message sending, acknowledgements, room joining/leaving, and broadcasting.
 *
 * It uses `expect.js` for assertions and `http` for creating test servers.
 */

// Import the main PrimusIO module, assuming it's in the parent directory.
var PrimusIO = require('../');

// Import the HTTP server module from Node.js, specifically the `Server` constructor.
var http = require('http').Server;

// Import the expectation library for making assertions in tests.
var expect = require('expect.js');

// Define options for Primus, specifying 'websockets' as the transformer
// and 'JSON' as the parser.
var opts = {
    transformer : 'websockets',
    parser      : 'JSON'
};


/**
 * Helper function to create a Primus.io client instance.
 *
 * @param {Object} srv    The HTTP server instance.
 * @param {Object} primus The Primus server instance.
 * @param {Number} port   The port number (optional, defaults to server's port).
 * @returns {Primus.Socket} A new Primus socket client.
 */
function client (srv, primus, port) {
    // Get the address information from the server.
    var addr = srv.address();

    // Construct the URL for the client to connect to.
    var url = 'http://' + addr.address + ':' + (port || addr.port);

    // Return a new Primus socket connected to the constructed URL.
    return new primus.Socket(url);
}


/**
 * Helper function to create a Primus.io server instance.
 *
 * @param {Object} srv  The HTTP server instance to attach Primus to.
 * @param {Object} opts Configuration options for Primus.
 * @returns {Primus} A new Primus server instance.
 */
function server (srv, opts) {
    // Initialize and return PrimusIO with the given HTTP server and options.
    return PrimusIO(srv, opts);
}


// Start a test suite for 'primus.io' features.
describe('primus.io', function() {

    // Test case: Ensure Primus.io has its middleware layer installed.
    it('should have a primus.io.js middleware layer', function() {
        // Create a new HTTP server.
        var srv = http();

        // Create a Primus.io server instance attached to the HTTP server.
        var primus = server(srv, opts);

        // Assert that the 'primus.io.js' layer is found within Primus's middleware stack.
        expect(~primus.indexOfLayer('primus.io.js')).to.be.ok();
    });


    // Test case: Verify compatibility with emitter functionality.
    it('should play nice with emitter', function(done) {
        var srv = http(); // Initialize HTTP server.
        var primus = server(srv, opts); // Initialize Primus.io server.
        var a = primus.channel('a'); // Create channel 'a' on the server.

        // Start listening on the HTTP server.
        srv.listen(function() {
            // When a connection is established on channel 'a', call `done`.
            a.on('connection', function (spark) {
                done();
            });
        });

        // Create a client instance.
        var cl = client(srv, primus);

        // Create channel 'a' on the client.
        var cla = cl.channel('a');
    });


    // Test case: Server sending messages to client.
    it('should allow sending message from server to client', function(done) {
        var srv = http(); // Setup HTTP server.
        var primus = server(srv, opts); // Setup Primus.io server.
        var a = primus.channel('a'); // Get channel 'a'.

        // Listen for connections.
        srv.listen(function() {
            // On a new connection, send a message to the spark.
            a.on('connection', function (spark) {
                spark.send('msg', { hi: 'hello' });
            });
        });

        var cl = client(srv, primus); // Create client.
        var cla = cl.channel('a'); // Get client channel 'a'.

        // Client listens for 'msg' and asserts content.
        cla.on('msg', function (msg) {
            expect(msg).to.be.eql({ hi: 'hello' });
            done(); // Complete test.
        });
    });


    // Test case: `createSocket` method for channel functionality.
    it('should have channel method when using createSocket', function(done) {
        var srv = http(); // New HTTP server.
        var primus = server(srv, opts); // Primus.io server.
        var a = primus.channel('a'); // Server-side channel.

        srv.listen(function() {
            // On connection, trigger `done`.
            a.on('connection', function (spark) {
                done();
            });
        });

        var addr = srv.address(); // Server address.
        var Socket = PrimusIO.createSocket(opts); // Create a Primus.io Socket constructor.

        // Instantiate a new client socket.
        var cl = new Socket('http://' + addr.address + ':' + addr.port);

        // Verify that the client socket has a `channel` method.
        var cla = cl.channel('a');
    });


    // Test case: Client sending messages to server.
    it('should allow sending message from client to server', function(done) {
        var srv = http(); // HTTP server.
        var primus = server(srv, opts); // Primus.io server.
        var a = primus.channel('a'); // Server channel.

        srv.listen(function() {
            a.on('connection', function (spark) {
                // Server listens for 'msg' from client.
                spark.on('msg', function (msg) {
                    expect(msg).to.be.eql({ hi: 'hello' });
                    done(); // Test complete.
                });
            });
        });

        var cl = client(srv, primus); // Client instance.
        var cla = cl.channel('a'); // Client channel.

        // Client sends message to server.
        cla.send('msg', { hi: 'hello' });
    });


    // Test case: Client-side acknowledgements.
    it('should support ack on the client', function(done) {
        var srv = http();
        var primus = server(srv, opts);
        var a = primus.channel('a');

        srv.listen(function() {
            a.on('connection', function (spark) {
                // Server receives message and sends acknowledgement.
                spark.on('msg', function (msg, fn) {
                    expect(msg).to.be.eql({ hi: 'hello' });
                    fn('thanks'); // Acknowledge with 'thanks'.
                });
            });
        });

        var cl = client(srv, primus);
        var cla = cl.channel('a');

        // Client sends message with an acknowledgement callback.
        cla.send('msg', { hi: 'hello' }, function (msg) {
            expect(msg).to.be('thanks'); // Expect the acknowledgement message.
            done();
        });
    });


    // Test case: Server-side acknowledgements.
    it('should support ack on the server', function(done) {
        var srv = http();
        var primus = server(srv, opts);
        var a = primus.channel('a');

        srv.listen(function() {
            a.on('connection', function (spark) {
                // Server sends message with an acknowledgement callback.
                spark.send('msg', { hi: 'hello' }, function (msg) {
                    expect(msg).to.be('thanks'); // Expect the acknowledgement.
                    done();
                });
            });
        });

        var cl = client(srv, primus);
        var cla = cl.channel('a');

        // Client receives message and sends acknowledgement.
        cla.on('msg', function (msg, fn) {
            expect(msg).to.be.eql({ hi: 'hello' });
            fn('thanks'); // Acknowledge with 'thanks'.
        });
    });


    // Test case: Joining a room.
    it('should allow joining a room', function(done) {
        var srv = http();
        var primus = server(srv, opts);
        var a = primus.channel('a');

        srv.listen(function() {
            a.on('connection', function (spark) {
                // Spark joins room 'a' and then calls done.
                spark.join('a', function () {
                    done();
                });
            });
        });

        var cl = client(srv, primus);
        var cla = cl.channel('a');
    });


    // Test case: Leaving a room.
    it('should allow leaving a room', function(done) {
        var srv = http();
        var primus = server(srv, opts);
        var a = primus.channel('a');

        srv.listen(function() {
            a.on('connection', function (spark) {
                spark.join('a'); // Join room 'a' first.
                // Then leave room 'a' and call done.
                spark.leave('a', function () {
                    done();
                });
            });
        });

        var cl = client(srv, primus);
        var cla = cl.channel('a');
    });


    // Test case: Broadcasting a message to a single client in a room.
    it('should allow broadcasting a message to a client', function(done) {
        var srv = http();
        var primus = server(srv, opts);
        var a = primus.channel('a');

        srv.listen(function() {
            a.on('connection', function (spark) {
                spark.on('data', function (room) {
                    if ('me' === room) {
                        // If 'me' is received, broadcast 'hi' to room 'r1'.
                        spark.room('r1').write('hi');
                    } else {
                        // Otherwise, join the specified room.
                        spark.join(room);
                    }
                });
            });
        });

        var cl = client(srv, primus);
        var c1a = cl.channel('a');

        c1a.on('data', function (msg) {
            expect(msg).to.be('hi'); // Expect 'hi' broadcast.
            done();
        });

        c1a.write('r1'); // Client 1 joins room 'r1'.

        // After a short delay, client sends 'me' to trigger broadcast.
        setTimeout(function () {
            var me = cl.channel('a');
            me.write('me');
        }, 0);
    });


    // Test case: Broadcasting a message to multiple clients in different rooms.
    it('should allow broadcasting a message to multiple clients', function(done) {
        var srv = http();
        var primus = server(srv, opts);
        var a = primus.channel('a');
        var count = 3; // Expecting 3 messages.

        srv.listen(function() {
            a.on('connection', function (spark) {
                spark.on('data', function (room) {
                    if ('me' === room) {
                        // If 'me' is received, broadcast 'hi' to rooms 'r1', 'r2', 'r3'.
                        spark.room('r1 r2 r3').write('hi');
                    } else {
                        // Otherwise, join the specified room.
                        spark.join(room);
                    }
                });
            });
        });


        var cl = client(srv, primus);
        var c1a = cl.channel('a');
        var c2a = cl.channel('a');
        var c3a = cl.channel('a');

        // Clients join their respective rooms.
        c1a.write('r1');
        c2a.write('r2');
        c3a.write('r3');

        // Each client listens for the broadcast message.
        c1a.on('data', function (msg) {
            expect(msg).to.be('hi');
            if (!--count) done(); // Decrement count and call done if all received.
        });

        c2a.on('data', function (msg) {
            expect(msg).to.be('hi');
            if (!--count) done();
        });

        c3a.on('data', function (msg) {
            expect(msg).to.be('hi');
            if (!--count) done();
        });

        // After a delay, trigger the broadcast.
        setTimeout(function () {
            var me = cl.channel('a');
            me.write('me');
        }, 0);
    });


    // Test case: Broadcasting a message to a client using emitter syntax.
    it('should allow broadcasting a message to a client with emitter', function(done) {
        var srv = http();
        var primus = server(srv, opts);
        var a = primus.channel('a');

        srv.listen(function() {
            a.on('connection', function (spark) {
                spark.on('join', function (room) {
                    spark.join(room); // Spark joins a room.
                });

                spark.on('msg', function (msg) {
                    if ('broadcast' === msg) {
                        // If 'broadcast' received, send 'hi' to room 'r1'.
                        spark.room('r1').send('msg', 'hi');
                    }
                });
            });
        });

        var cl = client(srv, primus);
        var c1a = cl.channel('a');

        c1a.on('msg', function (msg) {
            expect(msg).to.be('hi'); // Expect 'hi' message.
            done();
        });

        c1a.send('join', 'r1'); // Client tells server to join room 'r1'.

        // After a delay, client triggers broadcast.
        setTimeout(function () {
            var me = cl.channel('a');
            me.send('msg', 'broadcast');
        }, 0);
    });


    // Test case: Sending messages to multiple rooms from the server.
    it('should allow sending to multiple rooms from server', function(done) {
        this.timeout(0); // Disable timeout for this test.
        var srv = http();
        var primus = server(srv, opts);
        var total = 2; // Expected messages to finish.
        var count = 0; // Counter for joined sparks.

        srv.listen(function() {

            // Create multiple client instances.
            var c1 = client(srv, primus);
            var c2 = client(srv, primus);
            var c3 = client(srv, primus);
            var c4 = client(srv, primus);

            primus.on('connection', function(spark) {
                spark.on('join', function (room) {
                    spark.join(room, function () {
                        // Once 3 sparks have joined, broadcast 'news' to specific rooms.
                        if (3 === count++) {
                            primus.room('room1 room2 room3').send('news');
                        }
                    });
                });
            });

            // Clients listen for 'news'.
            c1.on('news', function (data) {
                --total || finish(); // Decrement total, call finish if 0.
            });

            c2.on('news', function (data) {
                --total || finish();
            });

            c3.on('news', function (data) {
                --total || finish();
            });

            c4.on('news', function (data) {
                finish(new Error('not')); // This client should not receive 'news'.
            });

            function finish (data) {
                srv.close(); // Close the server.
                done(data); // Complete the test.
            }

            // Clients send 'join' messages to their respective rooms.
            c1.send('join','room1');
            c2.send('join','room2');
            c3.send('join','room3');
            c4.send('join','room4');
        });
    });


    // Test case: Broadcasting a message to multiple clients using emitter from a channel.
    it('should allow broadcasting a message to multiple clients with emitter from channel;', function(done) {
        var srv = http();
        var primus = server(srv, opts);
        var a = primus.channel('a'); // Get channel 'a'.
        var count = 3; // Expected messages to finish.

        srv.listen(function() {
            a.on('connection', function (spark) {
                spark.on('join', function (room) {
                    spark.join(room); // Spark joins room.
                });

                spark.on('msg', function (msg) {
                    if ('broadcast' === msg) {
                        // If 'broadcast' received, channel 'a' broadcasts 'hi' to specific rooms.
                        a.room('r1 r2 r3').send('msg', 'hi');
                    }
                });
            });
        });

        var cl = client(srv, primus);
        var c1a = cl.channel('a');
        var c2a = cl.channel('a');
        var c3a = cl.channel('a');

        // Clients join their rooms.
        c1a.send('join', 'r1');
        c2a.send('join', 'r2');
        c3a.send('join', 'r3');

        // Clients listen for broadcast messages.
        c1a.on('msg', function (msg) {
            expect(msg).to.be('hi');
            if (!--count) done();
        });

        c2a.on('msg', function (msg) {
            expect(msg).to.be('hi');
            if (!--count) done();
        });

        c3a.on('msg', function (msg) {
            expect(msg).to.be('hi');
            if (!--count) done();
        });

        // After a delay, client triggers broadcast.
        setTimeout(function () {
            var me = cl.channel('a');
            me.send('msg', 'broadcast');
        }, 0);
    });


    // Test case: Broadcasting a message to multiple clients using emitter from spark.
    it('should allow broadcasting a message to multiple clients with emitter', function(done) {
        var srv = http();
        var primus = server(srv, opts);
        var a = primus.channel('a');
        var count = 3;

        srv.listen(function() {
            a.on('connection', function (spark) {
                spark.on('join', function (room) {
                    spark.join(room);
                });

                spark.on('msg', function (msg) {
                    if ('broadcast' === msg) {
                        // If 'broadcast' received, spark broadcasts 'hi' to specific rooms.
                        spark.room('r1 r2 r3').send('msg', 'hi');
                    }
                });
            });
        });

        var cl = client(srv, primus);
        var c1a = cl.channel('a');
        var c2a = cl.channel('a');
        var c3a = cl.channel('a');

        // Clients join their rooms.
        c1a.send('join', 'r1');
        c2a.send('join', 'r2');
        c3a.send('join', 'r3');

        // Clients listen for broadcast messages.
        c1a.on('msg', function (msg) {
            expect(msg).to.be('hi');
            if (!--count) done();
        });

        c2a.on('msg', function (msg) {
            expect(msg).to.be('hi');
            if (!--count) done();
        });

        c3a.on('msg', function (msg) {
            expect(msg).to.be('hi');
            if (!--count) done();
        });

        // After a delay, client triggers broadcast.
        setTimeout(function () {
            var me = cl.channel('a');
            me.send('msg', 'broadcast');
        }, 0);
    });

});