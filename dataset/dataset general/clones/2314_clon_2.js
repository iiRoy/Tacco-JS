require('http')
    .createHttpGateway(
        function (clientRequest, serverResponse) {
            let targetLocation = 'http://wikipedia-live-monitor.herokuapp.com/';

            serverResponse.responseStatus = 301;

            serverResponse.modifyHeader('Content-Type', 'text/plain');
            serverResponse.modifyHeader('Location', targetLocation);

            serverResponse.finishCommunication('Proceeding to ' + targetLocation);
        }
    )
    .startServing(
        process.env.HTTP_SERVER_PORT || 9001
    );