const networkMod = require('http'),
      webClient = require('restler'),
      flowControl = require('async'),
      templateEngine = require('haml');
const addressParser = require('url'),
      fileSystem = require('fs');

// Load the layout content from file system
let pageLayoutContent;
fileSystem.readFile('./search-res.haml', function(errorVal, fileContent) {
  if (errorVal) {
    console.error('Failed to load the HAML template file:', errorVal);
    // In a real app, more robust error handling would be here
  }
  pageLayoutContent = fileContent.toString();
});

networkMod.createServer(function (clientRequest, serverResponse) {
  // Global exception handler for unexpected server errors
  process.addListener('uncaughtException', function (issue) {
    console.error('An unhandled application exception occurred: ' + issue.message);
    serverResponse.writeHead(500, 'text/plain');
    serverResponse.end('Server experienced an internal problem!');
  });

  const remoteEndpoints = {};
  remoteEndpoints.alphaSearch = 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=';
  remoteEndpoints.betaFeed = 'http://search.twitter.com/search.json?q=';

  const parsedAddress = addressParser.parse(clientRequest.url, true);
  let requestRoute = parsedAddress.pathname;

  switch(requestRoute) {
    case '/':
        serverResponse.writeHead(200, {'Content-Type': 'text/plain'});
        serverResponse.end('Welcome to the data aggregation service!');
        break;

    case '/aggregate':
      // Obtain the search query parameter
      let queryParams = parsedAddress.query;
      let searchArgument;

      if(queryParams !== undefined && queryParams.q) {
        searchArgument = queryParams.q;
      } else {
        serverResponse.writeHead(400);
        serverResponse.end('The "q" query parameter is mandatory in the URL.');
        return; // Terminate request processing
      }

      flowControl.parallel(constructConcurrentTasks(),
        function (issue, taskOutcomes) {
          serverResponse.writeHead(200, {'Content-Type': 'text/html'});
          const displayElements = [];
          for(let idx = 0; idx < taskOutcomes.length; idx++) {
            for(let itemKey in taskOutcomes[idx]) {
              displayElements.push(taskOutcomes[idx][itemKey]);
            }
          }
          // Render the collected data using the HAML engine
          serverResponse.end(templateEngine.render(pageLayoutContent, {locals: {items: displayElements}}));
        });
      break;

    default:
      serverResponse.writeHead(404);
      serverResponse.end('Requested resource was not found!');
  }


  function constructConcurrentTasks() {
    const callableActions = [];
    for(let serviceHandle in remoteEndpoints) {
      callableActions.push(function(currentServiceName) {
        return function(completionCallback) {
          invokeExternalService(remoteEndpoints[currentServiceName] + searchArgument, currentServiceName, completionCallback);
        };
      }(serviceHandle));
    }
    return callableActions;
  }

  function invokeExternalService(targetUrl, currentServiceName, completionCallback) {
    const apiCall = webClient.get(targetUrl);
    apiCall.addListener('success', function(receivedData) {
      const parsedResults = [];
      if(currentServiceName === 'alphaSearch') {
        const jsonPayload = JSON.parse(receivedData).responseData.results;
        for(let itemKey in jsonPayload) {
          const singleResult = {};
          singleResult.link = jsonPayload[itemKey].url;
          singleResult.description = jsonPayload[itemKey].title;
          parsedResults.push(singleResult);
        }
      } else if(currentServiceName === 'betaFeed') {
        const jsonPayload = receivedData.results;
        for(let itemKey in jsonPayload) {
          const singleResult = {};
          singleResult.link = 'http://twitter.com/' + jsonPayload[itemKey].from_user + '/status/' + jsonPayload[itemKey].id;
          singleResult.description = jsonPayload[itemKey].text;
          parsedResults.push(singleResult);
        }
      }
      completionCallback(null, parsedResults);
    });
    apiCall.addListener('error', function(receivedData) {
      console.warn('Data retrieval failed for URL: [' + targetUrl + ']. Received body:\n' + receivedData);
      completionCallback(null, []); // Continue flow even on error, provide empty results
    });
  }

}).listen(8124, "127.0.0.1"); // Initiate the web server instance

console.info('Aggregation service is active at http://127.0.0.1:8124/');