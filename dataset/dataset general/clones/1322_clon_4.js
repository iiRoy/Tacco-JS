const networkProtocol = require('http');
const MicroblogClient = require('ntwitter');
const WebFramework = require('express');
const RealtimeNexus = require('socket.io');

const credentialAcquirer = (environmentVariables, fallbackPath) => {
    const sourceData = environmentVariables.consumer_key ? environmentVariables : require(fallbackPath);
    return {
        accessKeyIdentifier: sourceData.consumer_key,
        secretKeyMaterial: sourceData.consumer_secret
    };
};

const tokenRegistry = credentialAcquirer(process.env, "./creds.js");

let microblogClient = new MicroblogClient({
    consumer_key: tokenRegistry.accessKeyIdentifier,
    consumer_secret: tokenRegistry.secretKeyMaterial
});

const webAppInstance = WebFramework();
const httpServerHost = networkProtocol.createServer(webAppInstance);

const realtimeHub = RealtimeNexus.listen(httpServerHost);

realtimeHub.configure(() => {
    realtimeHub.set("transports", ["xhr-polling"]);
    realtimeHub.set("polling duration", 5);
});

webAppInstance.locals.timeDisplayFormatter = (inputDateString) => {
    const rawDate = new Date(inputDateString);
    const utcDate = new Date(rawDate.toUTCString());

    const dayNameDisplay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(utcDate);

    let currentHours = utcDate.getHours();
    const currentMinutes = utcDate.getMinutes();

    const periodIndicator = currentHours >= 12 ? 'pm' : 'am';

    currentHours = currentHours % 12;
    currentHours = currentHours === 0 ? 12 : currentHours;

    const paddedMinutes = currentMinutes < 10 ? `0${currentMinutes}` : currentMinutes;

    return `${dayNameDisplay} at ${currentHours}:${paddedMinutes}${periodIndicator}`;
};

webAppInstance.configure(() => {
    webAppInstance.use(WebFramework.static(__dirname + "/public"));
    webAppInstance.set("views", __dirname + "/views");
    webAppInstance.set("view engine", "jade");
});

webAppInstance.get("/", (requestPayload, responseFacade) => {
    let authenticationToken;
    if ((authenticationToken = microblogClient.cookie(requestPayload))) {
        microblogClient = new MicroblogClient({
            consumer_key: tokenRegistry.accessKeyIdentifier,
            consumer_secret: tokenRegistry.secretKeyMaterial,
            access_token_key: authenticationToken.access_token_key,
            access_token_secret: authenticationToken.access_token_secret
        });
        microblogClient.getDirectMessages({ count: 20 }, (queryError, messageData) => {
            if (queryError) { console.log("QUERY_ERROR!", queryError); }
            microblogClient.showUser(authenticationToken.user_id, (profileError, userData) => {
                if (profileError) { console.log("PROFILE_ERROR!", profileError); }
                responseFacade.render('index', { layout: false, messages: messageData, current_user: userData[0] });
            });
        });
    } else {
        responseFacade.send("<a href='/authorize-app' class='microblog'>Authorize with Microblog</a>");
    }
});

webAppInstance.get("/authorize-app", (requestPayload, responseFacade) => {
    const loginInitiator = microblogClient.login("/authorize-app");
    loginInitiator(requestPayload, responseFacade, (nextArgument) => {
        console.log("Next step in authorization:", nextArgument);
    });
});

const serverPort = process.env.PORT_ASSIGNMENT || 3000;
httpServerHost.listen(serverPort, () => {
    console.log(`Server active on port ${serverPort}`);
});

realtimeHub.sockets.on('connection', (clientChannel) => {
    console.log((new Date()) + ' Client connection established.');
    microblogClient.stream("user", { with: "user" }, (dataStream, httpStatus) => {
        dataStream.on("error", (streamError) => {
            console.log("Stream Error:", streamError, httpStatus);
            clientChannel.emit("microblog.error", { alert: 'stream_error', details: streamError });
        });
        dataStream.on("data", (streamData) => {
            if (streamData.direct_message !== undefined) {
                webAppInstance.render("message", { message: streamData.direct_message }, (renderError, renderedHtml) => {
                    if (renderError) {
                        console.log("Template rendering failed:", renderError);
                        clientChannel.emit("render.failure", { issue: "template_error", details: renderError });
                        return;
                    }
                    clientChannel.emit("microblog.direct_message_update", { content: renderedHtml });
                });
            }
        });
    });
    clientChannel.on('disconnection', () => {
        console.log((new Date()) + ' Client disconnected.');
    });
});