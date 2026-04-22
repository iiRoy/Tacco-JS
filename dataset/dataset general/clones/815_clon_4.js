const diskIO = require('fs');
const conduit = require('net');
const webHost = require('http');
const commLink = require('socket.io');
const displayEngine = require('ejs');
const pathUtil = require('path');
const urlParser = require('url');

const phraseModule = require('./lib/alias');
const eventModule = require('./lib/trigger');
const dataTransformer = require('./lib/formatter');

let globalSettings;
let primaryServerInstance;
let webSocketFacility;

const makeStructuredReply = (directive, payload) => ({
  directive: directive,
  payload: payload
});

const outputActivity = (message) => {
  console.log(`\x1b[35m[ access_log ]\x1b[0m => ${message}`);
};

const acquireSystemConfiguration = async (filePath) => {
  try {
    const rawData = await diskIO.promises.readFile(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    outputActivity(`Configuration acquisition failed: ${error.message}`);
    process.exit(1);
  }
};

const serveStaticAsset = async (responseStream, assetPath, rootDirectory) => {
  const fullPath = pathUtil.join(rootDirectory, assetPath);
  const mimeTypes = {
    '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
    '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.gif': 'image/gif', '.json': 'application/json', '.svg': 'image/svg+xml'
  };
  const extension = pathUtil.extname(fullPath).toLowerCase();
  const contentType = mimeTypes[extension] || 'application/octet-stream';

  try {
    const dataContent = await diskIO.promises.readFile(fullPath);
    responseStream.writeHead(200, { 'Content-Type': contentType });
    responseStream.end(dataContent);
  } catch (err) {
    if (err.code === 'ENOENT') {
      outputActivity(`Asset not found: ${fullPath}`);
      responseStream.writeHead(404, { 'Content-Type': 'text/plain' });
      responseStream.end('404 Not Found');
    } else {
      outputActivity(`Error serving asset ${fullPath}: ${err.message}`);
      responseStream.writeHead(500, { 'Content-Type': 'text/plain' });
      responseStream.end('500 Internal Server Error');
    }
  }
};

const processIncomingRequest = async (request, response) => {
  const parsedUrl = urlParser.parse(request.url, true);
  const requestPath = parsedUrl.pathname;

  if (requestPath === '/') {
    try {
      const templatePath = pathUtil.join(__dirname, 'views', 'index.ejs');
      const renderedOutput = await displayEngine.renderFile(templatePath, {
        layout: false,
        environmentData: { realmName: globalSettings.name }
      });
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(renderedOutput);
    } catch (err) {
      outputActivity(`Error rendering root page: ${err.message}`);
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.end('Internal Server Error');
    }
  } else {
    await serveStaticAsset(response, requestPath, pathUtil.join(__dirname, 'public'));
  }
};

const clientCommandHandlers = new Map([
  [/^;phrase add/i, (input, clientSock, gameConn) => phraseModule.create(input)],
  [/^;phrase view/i, (input, clientSock, gameConn) => clientSock.send(makeStructuredReply('listPhrases', phraseModule.list()))],
  [/^;phrase delete/i, (input, clientSock, gameConn) => phraseModule.remove(input)],
  [/^;event add/i, (input, clientSock, gameConn) => eventModule.create(input)],
  [/^;event view/i, (input, clientSock, gameConn) => clientSock.send(makeStructuredReply('listEvents', eventModule.list()))],
  [/^;event delete/i, (input, clientSock, gameConn) => eventModule.remove(input)],
]);

const initializeSystem = async () => {
  globalSettings = await acquireSystemConfiguration(pathUtil.join(__dirname, 'config', 'config.json'));

  primaryServerInstance = webHost.createServer(processIncomingRequest);
  webSocketFacility = commLink.listen(primaryServerInstance);

  webSocketFacility.on('connection', (clientSocket) => {
    const gameConduit = conduit.createConnection(globalSettings.port, globalSettings.host);
    gameConduit.setEncoding('utf8');

    outputActivity(`Client ${clientSocket.id} established link with ${globalSettings.host}:${globalSettings.port}`);

    gameConduit.on('data', (incomingData) => {
      const detectedEventCommands = eventModule.scan(incomingData);
      const refinedContent = dataTransformer.go(incomingData);

      clientSocket.emit('message', makeStructuredReply('updateWorldDisplay', refinedContent));

      if (detectedEventCommands && detectedEventCommands.length > 0) {
        detectedEventCommands.forEach(cmd => gameConduit.write(cmd));
      }
    });

    clientSocket.on('message', (clientInput) => {
      let handled = false;
      for (const [pattern, handler] of clientCommandHandlers) {
        if (clientInput.match(pattern)) {
          handler(clientInput, clientSocket, gameConduit);
          handled = true;
          break;
        }
      }

      if (!handled) {
        gameConduit.write(phraseModule.format(clientInput));
      }
    });

    gameConduit.on('end', () => outputActivity(`MUD connection for ${clientSocket.id} terminated.`));
    gameConduit.on('error', (err) => outputActivity(`MUD connection error for ${clientSocket.id}: ${err.message}`));
    clientSocket.on('disconnect', () => outputActivity(`Client ${clientSocket.id} disconnected.`));
  });

  primaryServerInstance.listen(6660, () => {
    outputActivity(`Primary server operational on port 6660`);
  });
};

initializeSystem().catch(err => {
  outputActivity(`System startup failure: ${err.message}`);
  process.exit(1);
});