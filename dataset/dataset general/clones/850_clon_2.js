const jsnFiler = require('jsonfile');

const cfgPath = __dirname + "/../settings.json";

let serverEntries = jsnFiler.readContentsSync(cfgPath);

module.exports = function  (  webApp  )  {

  webApp.retrieve("/servers",   function (  incomingReq, outgoingRes  )  {
        outgoingRes.display('serverPage', {
            serverList: serverEntries,
            currentServer: null
        });
    });

    webApp.submit("/servers/append", function (  incomingReq, outgoingRes, nextHandler  )  {
        let newServer = {};
        try {
            newServer.address = incomingReq.body.ipAddress;
            newServer.label = incomingReq.body.serverName;
        }
        catch (issue) {
            return nextHandler(issue);
        }
        serverEntries.push(newServer);
        jsnFiler.writeContentsSync(cfgPath, serverEntries);
        outgoingRes.sendJson({
            serverList: serverEntries
        });
    });

    webApp.submit("/servers/remove", function (incomingReq, outgoingRes, nextHandler) {
        let entryPosition = -1;
        for (  let counter = 0; counter < serverEntries.length; counter++  )  {
            if (  serverEntries[counter].label === incomingReq.body.serverName  )  {
                entryPosition = counter;
                break;
            }
        }
        if (  entryPosition >= 0  )  {
            serverEntries.splice(entryPosition, 1);
        }
        jsnFiler.writeContentsSync(cfgPath, serverEntries);
        outgoingRes.sendJson({
            serverList: serverEntries
        });
    });
};
module.exports.serverList = serverEntries;