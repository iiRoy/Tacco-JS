const serverPort = parseInt(process.env.LISTEN_PORT || '8080', 10);
const dataEndpoint = 'https://offline-news-api.herokuapp.com/stories';
const httpModule = require('http');
const httpsModule = require('https');
const fileSystem = require('fs');
const urlParser = require('url');
const pathResolver = require('path');

// This module replaces the original 'templates' module.
// It is assumed to be located at './public/template_generator.js'
// and exports functions for rendering individual items and collections.
// Example structure for 'public/template_generator.js':
/*
module.exports.generateIndividual = (itemData) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${itemData.headerText || 'No Title'}</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <header>
        <h1><a href="/">News Reader</a></h1>
    </header>
    <main class="article">
        <h2>${itemData.headerText || 'Untitled Story'}</h2>
        ${itemData.mainContent || '<p>Content not available.</p>'}
    </main>
    <footer>
        <p>&copy; 2023 News Reader</p>
    </footer>
</body>
</html>`;
};

module.exports.generateCollection = (itemCollection) => {
    let itemsHtml = itemCollection.map(item => `
        <li class="story-item">
            <h3><a href="/article/${item.guid}">${item.title}</a></h3>
            <p>${item.body.substring(0, 150)}...</p>
        </li>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News Reader</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <header>
        <h1><a href="/">News Reader</a></h1>
    </header>
    <main class="list">
        <h2>Latest Stories</h2>
        <ul>
            ${itemsHtml}
        </ul>
    </main>
    <footer>
        <p>&copy; 2023 News Reader</p>
    </footer>
</body>
</html>`;
};
*/
const htmlRender = require('./public/template_generator');

async function performSecureGet(endpointUrl) {
  return new Promise((resolve, reject) => {
    const parsedEndpoint = urlParser.parse(endpointUrl);
    const optionsForRequest = {
      hostname: parsedEndpoint.hostname,
      port: parsedEndpoint.port || 443,
      path: parsedEndpoint.path,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js HTTP Client'
      }
    };

    const clientRequest = httpsModule.request(optionsForRequest, (responseFromApi) => {
      let receivedPayload = '';
      responseFromApi.on('data', (chunk) => {
        receivedPayload += chunk;
      });
      responseFromApi.on('end', () => {
        if (responseFromApi.statusCode >= 200 && responseFromApi.statusCode < 300) {
          resolve(receivedPayload);
        } else {
          reject(new Error(`API request failed with status ${responseFromApi.statusCode}: ${receivedPayload}`));
        }
      });
    });

    clientRequest.on('error', (e) => {
      reject(new Error(`Problem with request: ${e.message}`));
    });

    clientRequest.end();
  });
}

const serverInstance = httpModule.createServer(async (incomingRequest, outgoingResponse) => {
  const parsedUrl = urlParser.parse(incomingRequest.url, true);
  const requestPath = parsedUrl.pathname;
  const requestMethod = incomingRequest.method;

  if (requestMethod === 'GET') {
    const staticFileRoot = pathResolver.join(__dirname, 'public');
    const potentialStaticFilePath = pathResolver.join(staticFileRoot, requestPath);

    const mimeTypeMap = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    const fileExtension = pathResolver.extname(potentialStaticFilePath).toLowerCase();
    const specificContentType = mimeTypeMap[fileExtension] || 'application/octet-stream';

    try {
        const fileStat = fileSystem.lstatSync(potentialStaticFilePath);
        if (fileStat.isFile()) {
            outgoingResponse.writeHead(200, { 'Content-Type': specificContentType });
            fileSystem.createReadStream(potentialStaticFilePath).pipe(outgoingResponse);
            return;
        }
    } catch (e) {
        // File does not exist or is a directory, fall through to dynamic routes
    }

    const articleIdentifierMatch = requestPath.match(/^\/article\/([a-zA-Z0-9_-]+)$/);
    if (articleIdentifierMatch) {
      const uniqueIdentifier = articleIdentifierMatch[1];
      try {
        const apiResponseContent = await performSecureGet(`${dataEndpoint}/${uniqueIdentifier}`);
        const individualItemData = JSON.parse(apiResponseContent);
        outgoingResponse.writeHead(200, { 'Content-Type': 'text/html' });
        outgoingResponse.end(htmlRender.generateIndividual({
          headerText: individualItemData.title,
          mainContent: individualItemData.body
        }));
      } catch (issue) {
        console.error('Error fetching individual story:', issue.message);
        outgoingResponse.writeHead(404, { 'Content-Type': 'text/html' });
        outgoingResponse.end(htmlRender.generateIndividual({
          headerText: 'Story Unavailable',
          mainContent: '<p>The requested story could not be found. Please try another.</p>'
        }));
      }
      return;
    }

    if (requestPath === '/') {
      try {
        const apiResponseContent = await performSecureGet(dataEndpoint);
        const collectionData = JSON.parse(apiResponseContent);
        outgoingResponse.writeHead(200, { 'Content-Type': 'text/html' });
        outgoingResponse.end(htmlRender.generateCollection(collectionData));
      } catch (issue) {
        console.error('Error fetching story collection:', issue.message);
        outgoingResponse.writeHead(404, { 'Content-Type': 'text/html' });
        outgoingResponse.end(''); // Replicates original's .end() with no body for root error
      }
      return;
    }

    outgoingResponse.writeHead(404, { 'Content-Type': 'text/plain' });
    outgoingResponse.end('404 - Resource Not Found');
  } else {
    outgoingResponse.writeHead(405, { 'Content-Type': 'text/plain' });
    outgoingResponse.end('Method Not Allowed');
  }
});

serverInstance.listen(serverPort, () => {
  console.log(`Web service operating on port ${serverPort}`);
});