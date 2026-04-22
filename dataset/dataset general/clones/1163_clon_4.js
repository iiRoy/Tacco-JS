const _netModule = require('http');
const _fileSystemHandler = require('fs');
const _pathResolver = require('path');

const _accessPoint = 3000;
const _baseDirectory = _pathResolver.join(process.cwd(), 'public');

function fabricateSessionHost() {
    const _underlyingHttpServer = _netModule.createServer((_incomingRequest, _outgoingResponse) => {
        let _requestedPath = _incomingRequest.url === '/' ? '/index.html' : _incomingRequest.url;
        const _absoluteFilePath = _pathResolver.join(_baseDirectory, _requestedPath);

        _fileSystemHandler.exists(_absoluteFilePath, (_exists) => {
            if (!_exists) {
                _outgoingResponse.writeHead(404, { 'Content-Type': 'text/plain' });
                _outgoingResponse.end('404 Not Found');
                return;
            }

            _fileSystemHandler.readFile(_absoluteFilePath, (_err, _data) => {
                if (_err) {
                    _outgoingResponse.writeHead(500, { 'Content-Type': 'text/plain' });
                    _outgoingResponse.end('500 Internal Server Error');
                    return;
                }

                let _contentType = 'application/octet-stream';
                const _extension = _pathResolver.extname(_absoluteFilePath).toLowerCase();
                switch (_extension) {
                    case '.html': _contentType = 'text/html'; break;
                    case '.css': _contentType = 'text/css'; break;
                    case '.js': _contentType = 'application/javascript'; break;
                    case '.json': _contentType = 'application/json'; break;
                    case '.png': _contentType = 'image/png'; break;
                    case '.jpg': _contentType = 'image/jpeg'; break;
                    case '.gif': _contentType = 'image/gif'; break;
                    case '.svg': _contentType = 'image/svg+xml'; break;
                    case '.txt': _contentType = 'text/plain'; break;
                }

                _outgoingResponse.writeHead(200, { 'Content-Type': _contentType });
                _outgoingResponse.end(_data);
            });
        });
    });

    return {
        initiateCommencement: (targetPort) => {
            _underlyingHttpServer.listen(targetPort);
        }
    };
}

const networkPortal = fabricateSessionHost();

networkPortal.initiateCommencement(_accessPoint);

const outputChannel = process.stdout;
outputChannel.write(`service_hub operational at http://localhost:${_accessPoint}/\n`);