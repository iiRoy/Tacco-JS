const fileSystemPromises = require('fs').promises;
const fileSystemStream = require('fs');
const network = require('http');
const filePaths = require('path');
const webAddress = require('url');
const { pipeline } = require('stream/promises');

const serviceVariant = [0, 5, 7];
const serviceIdentifier = `static-content-provider/${serviceVariant.join('.')}`;

const mediaTypeRegistry = new Map([
    ['html', 'text/html'], ['css', 'text/css'], ['js', 'application/javascript'],
    ['json', 'application/json'], ['png', 'image/png'], ['jpg', 'image/jpeg'],
    ['jpeg', 'image/jpeg'], ['gif', 'image/gif'], ['svg', 'image/svg+xml'],
    ['ico', 'image/x-icon'], ['txt', 'text/plain'], ['pdf', 'application/pdf'],
    ['xml', 'application/xml'], ['mp4', 'video/mp4'], ['webm', 'video/webm'],
    ['ogg', 'audio/ogg'], ['mpv', 'video/mp4'], ['mov', 'video/quicktime'],
    ['wmv', 'video/x-ms-wmv'], ['flv', 'video/x-flv'], ['avi', 'video/x-msvideo'],
    ['mkv', 'video/x-matroska'], ['webp', 'image/webp'], ['tif', 'image/tiff'],
    ['tiff', 'image/tiff'], ['bmp', 'image/bmp'], ['zip', 'application/zip'],
    ['tar', 'application/x-tar'], ['gz', 'application/gzip'], ['rar', 'application/x-rar-compressed'],
    ['7z', 'application/x-7z-compressed'], ['exe', 'application/x-msdownload'],
    ['msi', 'application/x-msdownload'], ['bin', 'application/octet-stream'],
    ['iso', 'application/octet-stream'], ['swf', 'application/x-shockwave-flash'],
    ['rtf', 'application/rtf'], ['odt', 'application/vnd.oasis.opendocument.text'],
    ['ods', 'application/vnd.oasis.opendocument.spreadsheet'],
    ['odp', 'application/vnd.oasis.opendocument.presentation'],
    ['doc', 'application/msword'], ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['xls', 'application/vnd.ms-excel'], ['xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['ppt', 'application/vnd.ms-powerpoint'], ['pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    ['mp3', 'audio/mpeg'], ['wav', 'audio/wav'], ['aac', 'audio/aac'], ['opus', 'audio/opus'],
    ['woff', 'font/woff'], ['woff2', 'font/woff2'], ['ttf', 'font/ttf'], ['otf', 'font/otf'],
    ['eot', 'application/vnd.ms-fontobject']
]);

function deriveMediaType(resourcePath) {
    const extension = filePaths.extname(resourcePath).slice(1).toLowerCase();
    return mediaTypeRegistry.get(extension) || 'application/octet-stream';
}

async function collectMultipleAssetStats(baseLocation, assetList) {
    const statsPromises = assetList.map(async (item) => {
        const fullPath = item[0] === '/' ? item : filePaths.join(baseLocation, item);
        return await fileSystemPromises.stat(fullPath);
    });
    return Promise.all(statsPromises);
}

class ContentServingError extends Error {
    constructor(status, message, headers = {}) {
        super(message);
        this.status = status;
        this.headers = headers;
        this.name = 'ContentServingError';
    }
}

class ContentDeliverer {
    constructor(baseDirectory, deliveryOptions) {
        if (baseDirectory && (typeof (baseDirectory) === 'object')) {
            deliveryOptions = baseDirectory;
            baseDirectory = null;
        }

        this.contentRoot = filePaths.resolve(baseDirectory || '.');
        this.configuration = deliveryOptions || {};
        this.cacheDuration = 3600;

        this.baseResponseHeaders = {};
        this.configuration.headers = this.configuration.headers || {};

        if ('cache' in this.configuration) {
            if (typeof (this.configuration.cache) === 'number') {
                this.cacheDuration = this.configuration.cache;
            } else if (!this.configuration.cache) {
                this.cacheDuration = false;
            }
        }

        if (this.cacheDuration !== false) {
            this.baseResponseHeaders['Cache-Control'] = `max-age=${this.cacheDuration}`;
        }
        this.baseResponseHeaders['Server'] = serviceIdentifier;

        for (const headerKey in this.baseResponseHeaders) {
            this.configuration.headers[headerKey] = this.configuration.headers[headerKey] ||
                this.baseResponseHeaders[headerKey];
        }

        this.assetCache = {};
        this.directoryIndexCache = {};
    }

    async resolveContentPath(requestPath) {
        const fullPath = filePaths.join(this.contentRoot, requestPath);
        const normalizedPath = filePaths.normalize(fullPath);

        const relativePath = filePaths.relative(this.contentRoot, normalizedPath);
        if (relativePath.startsWith('..') || filePaths.isAbsolute(relativePath)) {
            throw new ContentServingError(403, 'Forbidden: Access denied to path outside content root.');
        }

        return normalizedPath;
    }

    async streamContentToClient(resourceLocation, assetPaths, outputStream, shouldCache) {
        let accumulatedBuffer = null;
        let currentOffset = 0;

        if (shouldCache) {
            const totalSize = assetPaths.reduce((sum, p) => sum + p.size, 0);
            accumulatedBuffer = Buffer.alloc(totalSize);
        }

        for (const asset of assetPaths) {
            const filePath = asset.path;
            const readStream = fileSystemStream.createReadStream(filePath, {
                flags: 'r',
                mode: 0o666
            });

            if (shouldCache) {
                for await (const chunk of readStream) {
                    chunk.copy(accumulatedBuffer, currentOffset);
                    currentOffset += chunk.length;
                    outputStream.write(chunk);
                }
            } else {
                await pipeline(readStream, outputStream, { end: false });
            }
        }
        outputStream.end();

        return accumulatedBuffer;
    }

    async prepareAndSendResponse(resourceLocation, statusCode, customHeaders, assetDetails, httpRequest, httpResponse) {
        const primaryAssetPath = assetDetails[0].path;
        const fileStat = assetDetails[0].stats;
        const totalContentSize = assetDetails.reduce((sum, ad) => sum + ad.stats.size, 0);

        const responseHeaders = { ...this.configuration.headers, ...customHeaders };

        const mtime = Date.parse(fileStat.mtime);
        const etag = JSON.stringify([fileStat.ino, fileStat.size, mtime].join('-'));
        const currentDate = new Date().toUTCString();
        const lastModifiedDate = new Date(fileStat.mtime).toUTCString();

        responseHeaders['Etag'] = etag;
        responseHeaders['Date'] = currentDate;
        responseHeaders['Last-Modified'] = lastModifiedDate;

        const ifNoneMatch = httpRequest.headers['if-none-match'];
        const ifModifiedSince = httpRequest.headers['if-modified-since'];

        if (ifNoneMatch === etag || (ifModifiedSince && Date.parse(ifModifiedSince) >= mtime)) {
            httpResponse.writeHead(304, responseHeaders);
            httpResponse.end();
            return;
        }

        if (httpRequest.method === 'HEAD') {
            responseHeaders['Content-Length'] = totalContentSize;
            responseHeaders['Content-Type'] = deriveMediaType(primaryAssetPath);
            httpResponse.writeHead(200, responseHeaders);
            httpResponse.end();
            return;
        }

        responseHeaders['Content-Length'] = totalContentSize;
        responseHeaders['Content-Type'] = deriveMediaType(primaryAssetPath);

        const cacheKey = resourceLocation || primaryAssetPath;
        const shouldCache = this.cacheDuration !== false;

        if (shouldCache && this.assetCache[cacheKey] &&
            this.assetCache[cacheKey].stats.mtime >= fileStat.mtime) {
            httpResponse.writeHead(statusCode, responseHeaders);
            httpResponse.end(this.assetCache[cacheKey].contentBuffer);
        } else {
            httpResponse.writeHead(statusCode, responseHeaders);
            const contentBuffer = await this.streamContentToClient(
                resourceLocation,
                assetDetails.map(ad => ({ path: ad.path, size: ad.stats.size })),
                httpResponse,
                shouldCache
            );

            if (shouldCache && contentBuffer) {
                this.assetCache[cacheKey] = {
                    stats: fileStat,
                    contentBuffer: contentBuffer,
                    timestamp: Date.now()
                };
            }
        }
    }

    async processDirectoryContent(dirPath, httpRequest, httpResponse) {
        const htmlIndexPath = filePaths.join(dirPath, 'index.html');

        try {
            const htmlStat = await fileSystemPromises.stat(htmlIndexPath);
            await this.prepareAndSendResponse(
                null,
                200,
                {},
                [{ path: htmlIndexPath, stats: htmlStat }],
                httpRequest,
                httpResponse
            );
        } catch (error) {
            let indexData;
            if (this.directoryIndexCache[dirPath]) {
                indexData = this.directoryIndexCache[dirPath];
            } else {
                const jsonIndexPath = filePaths.join(dirPath, 'index.json');
                try {
                    const jsonContent = await fileSystemPromises.readFile(jsonIndexPath, 'utf8');
                    indexData = JSON.parse(jsonContent);
                    this.directoryIndexCache[dirPath] = indexData;
                } catch (jsonError) {
                    throw new ContentServingError(404, 'Not Found: No index.html or index.json in directory.');
                }
            }

            const filePathsInIndex = indexData.files.map(f => filePaths.join(dirPath, f));
            const fileStats = await collectMultipleAssetStats(dirPath, indexData.files);
            const assetDetails = filePathsInIndex.map((p, i) => ({ path: p, stats: fileStats[i] }));

            await this.prepareAndSendResponse(
                dirPath,
                200,
                {},
                assetDetails,
                httpRequest,
                httpResponse
            );
        }
    }

    async handleContentRequest(requestPath, initialStatus, initialHeaders, httpRequest, httpResponse) {
        if (httpRequest.method !== 'GET' && httpRequest.method !== 'HEAD') {
            throw new ContentServingError(405, 'Method Not Allowed', { 'Allow': 'GET, HEAD' });
        }

        const resolvedPath = await this.resolveContentPath(requestPath);

        let fileStat;
        try {
            fileStat = await fileSystemPromises.stat(resolvedPath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new ContentServingError(404, 'Not Found: Resource does not exist.');
            }
            throw new ContentServingError(500, `Internal Server Error: ${error.message}`);
        }

        if (fileStat.isFile()) {
            await this.prepareAndSendResponse(
                null,
                initialStatus,
                initialHeaders,
                [{ path: resolvedPath, stats: fileStat }],
                httpRequest,
                httpResponse
            );
        } else if (fileStat.isDirectory()) {
            await this.processDirectoryContent(resolvedPath, httpRequest, httpResponse);
        } else {
            throw new ContentServingError(400, 'Bad Request: Resource is neither file nor directory.');
        }
    }

    async finalizeResponse(status, headers, httpRequest, httpResponse, externalCompletion) {
        const responseOutcome = {
            status: status,
            headers: headers,
            message: network.STATUS_CODES[status]
        };

        if (status >= 400) {
            if (externalCompletion) {
                externalCompletion(responseOutcome);
            } else {
                if (!httpResponse.headersSent) {
                    httpResponse.writeHead(status, headers);
                }
                if (!httpResponse.writableEnded) {
                    httpResponse.end(responseOutcome.message);
                }
            }
            throw new ContentServingError(status, responseOutcome.message, headers);
        } else {
            if (externalCompletion) {
                externalCompletion(null, responseOutcome);
            }
        }
        return responseOutcome;
    }

    async initiateService(httpRequest, httpResponse, completionHandler) {
        const parsedUrl = webAddress.parse(httpRequest.url);
        const resourcePath = parsedUrl.pathname;

        try {
            await this.handleContentRequest(resourcePath, 200, {}, httpRequest, httpResponse);
            await this.finalizeResponse(200, httpResponse.getHeaders(), httpRequest, httpResponse, completionHandler);
            return Promise.resolve({ status: 200, message: 'Success' });
        } catch (error) {
            const status = error.status || 500;
            const headers = error.headers || {};
            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'text/plain';
            }
            try {
                await this.finalizeResponse(status, headers, httpRequest, httpResponse, completionHandler);
            } catch (finalizationError) {
                if (!httpResponse.headersSent) {
                    httpResponse.writeHead(status, headers);
                }
                if (!httpResponse.writableEnded) {
                    httpResponse.end(finalizationError.message || network.STATUS_CODES[status]);
                }
            }
            return Promise.reject({ status: status, message: error.message, headers: headers });
        }
    }
}

module.exports = {
    serviceVersion: serviceVariant,
    ContentDeliverer: ContentDeliverer
};