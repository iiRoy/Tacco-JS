const webFramework = require("express");
const webSockets = require("socket.io");
const dbInterface = require("mongoose");
const filePaths = require("path");
const httpModule = require("http");

const dataConnectionString = process.env.DB_CONNECTION_STRING || "mongodb://localhost/testdatabase";
const servicePort = process.env.APP_PORT || 2000;

const applicationHost = webFramework();
const webServer = httpModule.createServer(applicationHost);
const socketHub = new webSockets.Server(webServer);

applicationHost.get("/", (requestPayload, responseSender) => {
    responseSender.sendFile(filePaths.join(__dirname, "index.html"), (errorOccurred) => {
        if (errorOccurred) {
            console.error("Failed to deliver main page:", errorOccurred);
            responseSender.status(500).send("Problem fetching main page.");
        }
    });
});

webServer.listen(servicePort, () => {
    console.log(`Web service operating on port: ${servicePort}`);
});

const MessageSchema = new dbInterface.Schema({
    messagetype: String,
    timestamp: { type: Date, default: Date.now },
    payload: dbInterface.Schema.Types.Mixed 
}, {
    capped: { size: 1024 * 1024 * 10, max: 100000, autoIndexId: true }
});

const DataRecord = dbInterface.model("Message", MessageSchema);

dbInterface.connect(dataConnectionString)
    .then(() => {
        console.log(`Attempting connection to MongoDB (details suppressed).`);
        return dbInterface.connection.db.listCollections({ name: DataRecord.collection.name }).next();
    })
    .then(collectionInfo => {
        if (!collectionInfo || !collectionInfo.options || !collectionInfo.options.capped) {
            console.error(`${DataRecord.collection.name} is not a capped collection. Aborting. Please use a capped collection for real-time streaming.`);
            process.exit(2);
        }
        console.log(`Successfully connected to MongoDB and verified ${DataRecord.collection.name} is capped.`);
        initializeStreaming(socketHub, DataRecord);
    })
    .catch(connectionError => {
        console.error("Error connecting to MongoDB or verifying collection:", connectionError.message);
        if (connectionError.message.includes("capped collection")) {
             process.exit(1);
        } else {
             process.exit(3);
        }
    });

async function streamWithInterval(targetCursor, delayDuration, clientChannel, updateEventName) {
    try {
        let currentDatum;
        while ((currentDatum = await targetCursor.next()) !== null) {
            clientChannel.emit(updateEventName, currentDatum);
            await new Promise(waiter => setTimeout(waiter, delayDuration));
        }
    } catch (streamingError) {
        console.error(`Error during data streaming for event ${updateEventName}:`, streamingError);
    }
}

function initializeStreaming(mainSocketHub, messageModel) {
    console.log("Commencing real-time updates...");

    mainSocketHub.on("connection", (clientConnection) => {
        console.log("Client connected for real-time updates.");

        const allMessagesCursor = messageModel.find({}, null, {
            tailable: true,
            awaitdata: true,
            sort: { $natural: 1 }
        }).cursor();
        streamWithInterval(allMessagesCursor, 300, clientConnection, "universalFeed");

        const complexMessagesCursor = messageModel.find({ messagetype: "complex" }, null, {
            tailable: true,
            awaitdata: true,
            sort: { $natural: 1 }
        }).cursor();
        streamWithInterval(complexMessagesCursor, 900, clientConnection, "intricateFeed");

        clientConnection.on("disconnect", () => {
            console.log("Client disconnected.");
        });
    });
}