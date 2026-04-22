const COMM_PORT = process.env.OPENSHIFT_INTERNAL_PORT_VAL || process.env.OPENSHIFT_NODEJS_PORT_VAL || 8080;
const HOST_ADDR = process.env.OPENSHIFT_INTERNAL_IP_ADDR || process.env.OPENSHIFT_NODEJS_IP_ADDR || '127.0.0.1';

const webFramework = require('express');
let httpListener;
let socketManager;
let webApp;

/* Bring in essential helper components. */
const TemplateEngine = require('./common/handlebars').Handlebars;
const ChatNote = require('./common/models').Message;
const Participant = require('./common/models').User;

// Retrieve any command-line options provided.
const cmdOptions = require('optimist').argv;



// Configure a basic web application instance.
webApp = webFramework();

/* Enable requests from different origins. */
webApp.use(function(inboundReq, outboundRes, continueFlow) {
    let sourceDomain = '*';
    try {
        const urlSegments = inboundReq.headers.referer.split('/').filter(function(segment){return segment;});
        if (urlSegments.length >= 2) {
            sourceDomain = urlSegments[0] + '//' + urlSegments[1];
        }
    } catch (errVal) {
        // No referring URL was found.
    }

    outboundRes.setHeader('Access-Control-Allow-Origin', sourceDomain);
    outboundRes.setHeader('Access-Control-Allow-Credentials', 'true');

    continueFlow();
});

// Endpoint to provide the WebSocket address to clients.
webApp.use('/getWsAddr.js', function(inboundReq, outboundRes) {
    const connPort = cmdOptions['websocket-port-setting'];
    // Adjust the WebSocket address only if a custom port is supplied.
    const wsAddress = connPort ? ':' + connPort + '/' : '/';
    outboundRes.set('Content-Type', 'application/javascript');
    outboundRes.send('const wsAddress = window.location.hostname + "' + wsAddress + '";');
});

// The client-assets path serves files specific to the client-side.
webApp.use('/client-assets', webFramework.static(__dirname + '/client'));

// The shared-assets path is for code used by both client and server.
webApp.use('/shared-assets', webFramework.static(__dirname + '/common'));

// The base path should deliver the primary client HTML page.
webApp.get('/', function(inboundReq, outboundRes) {
    outboundRes.sendFile(__dirname + '/client/index.html');
});



/* Our web application serves as the primary listener for HTTP requests
 * in this demonstration, hence we do not directly invoke listen on the
 * webApp object. */
httpListener = require('http').createServer(webApp);
httpListener.listen(COMM_PORT, HOST_ADDR);



// The active pool of participants.
const onlineParticipants = {
    // The current collection of active chatters.
    currentRoster: [],

    // Enrolls a new participant into the group. Duplicates are not prevented.
    enroll: function(person) {
        this.currentRoster.push(person);
        socketManager.sockets.emit('online-roster', {
            'participants': this.currentRoster
        });
    },

    // Deregisters a participant from the active group.
    // Returns true if the participant was successfully removed, false otherwise.
    deregister: function(person) {
        const entryIndex = this.currentRoster.indexOf(person);
        if (entryIndex !== -1) {
            // Take out the participant's handle and inform all others.
            this.currentRoster.splice(entryIndex, 1);
            socketManager.sockets.emit('online-roster', {
                'participants': this.currentRoster
            });
            return true;
        }
        // No participant was deregistered.
        return false;
    }
};



// Collection of message templates, compiled as TemplateEngine functions.
// All system messages are TemplateEngine functions, even those without substitutions.
const systemPrompts = {
    /* These prompts do not require a data object. */
    "greetingMsg": TemplateEngine.compile('Welcome to the interactive communication platform. To enter the main discussion area, please provide a unique handle and press enter. Please avoid spaces or unusual symbols. Alphanumeric characters and underscores are permitted.'),
    "nameNeededPrompt": TemplateEngine.compile('Apologies, but you must first identify yourself.'),
    "nameChangeWarning": TemplateEngine.compile('An unexpected action occurred; please refrain from altering your handle during a session.'),

    /* These prompts require a data object for substitution. */
    "departedRoomMsg": TemplateEngine.compile("{{name}} has exited the discussion."),
    "enjoyChatMsg": TemplateEngine.compile('Enjoy your time, {{name}}.'),
    "enteredRoomMsg": TemplateEngine.compile('{{name}} has joined the discussion.'),
    "badNameAlert": TemplateEngine.compile('Regrettably, {{name}} is an unacceptable handle. Ensure your handle contains no spaces or odd symbols (underscores are fine). Terminating connection.'),
};



// socket.io extends our existing HTTP listener instance.
socketManager = require('socket.io').listen(httpListener);
socketManager.configure(function() {
    // Verbosity level: 3 (default) for detailed debugging, 1 for warnings only.
    const debugLevel = (cmdOptions["log-level-setting"] === undefined) ? 3 : cmdOptions["log-level-setting"];
    socketManager.set("log level", debugLevel);
});

/* Triggered upon a new client connection. The clientSocket object serves
 * as the specific communication channel for this client. */
socketManager.sockets.on('connection', function (clientSocket) {

    // The identity associated with this specific connection.
    const person = Participant();

    /* Manages disconnection and associated cleanup tasks. */
    const cleanupConnection = function() {
        const participantRemoved = onlineParticipants.deregister(person);
        if (person.name && participantRemoved) {
            socketManager.sockets.emit('dialog', ChatNote(systemPrompts.departedRoomMsg(person)));
        }
        // Allow the client to handle the ultimate disconnection feedback.
        clientSocket.disconnect();
    };



    // Send initial greeting to the newly connected client.
    clientSocket.emit('dialog', ChatNote(systemPrompts.greetingMsg()));



    // Establish event handlers on the server for this client.
    clientSocket.once('disconnect', function() {
        // React to a client-initiated disconnection, but only once.
        // Multiple disconnect signals might occur from either side,
        // so ensure the response is a single event per client.
        cleanupConnection();
    });


    clientSocket.on('set-handle', function(payloadInfo) {
        // Allows a participant to establish their chosen identifier.
        // Handles are kept simple: alphanumeric characters, no spaces.
        person.name = payloadInfo.chosenHandle;
        if (person.isHandleValid()) {
            onlineParticipants.enroll(person);
            // Broadcast updates to the discussion room.
            clientSocket.emit('dialog', ChatNote(systemPrompts.enjoyChatMsg(person)));
            socketManager.sockets.emit('dialog', ChatNote(systemPrompts.enteredRoomMsg(person)));
        }
        else {
            clientSocket.emit('dialog', ChatNote(systemPrompts.badNameAlert(person), Participant('system'), 'alert'));
            cleanupConnection();
        }
    });



    clientSocket.on('dialog', function (payloadInfo) {
        // A message submitted by a client to be broadcast throughout the chat.
        if (payloadInfo.participant && payloadInfo.participant.name === person.name) {
            socketManager.sockets.emit('dialog', ChatNote(payloadInfo.chatContent, person, "dialog"));
        }
        else if (!person.name) {
            // Prevent communication from users without an established handle.
            clientSocket.emit('dialog', ChatNote(systemPrompts.nameNeededPrompt(), Participant('system'), 'alert'));
            cleanupConnection();
        }
        else {
            // Disallow attempts to modify one's handle within a single request
            // on this connection (a basic security measure).
            clientSocket.emit('dialog', ChatNote(systemPrompts.nameChangeWarning(), Participant('system'), 'alert'));
            cleanupConnection();
        }
    });
});