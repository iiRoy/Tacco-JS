const RemoteDataStreamer = function(resourceLocator, completionHandler, faultHandler) {
    const dataFetcher = async (url, method, headers = {}, byteRange = null) => {
        let requestHeaders = { ...headers };
        if (byteRange) {
            requestHeaders['Range'] = `bytes=${byteRange[0]}-${byteRange[1]}`;
        }
        requestHeaders['If-Modified-Since'] = 'Sat, 01 Jan 1970 00:00:00 GMT';

        const networkResponse = await fetch(url, {
            method: method,
            headers: requestHeaders,
        });

        if (!networkResponse.ok && networkResponse.status !== 206) {
            throw new Error(`Network operation failed: ${networkResponse.status} ${networkResponse.statusText}`);
        }

        return networkResponse;
    };

    function SegmentedDataLoader(sourceUrl, totalLength, segmentSize = 2048, bufferMargin = 0) {
        const _source = sourceUrl;
        let _overallSize = totalLength;
        const _segmentSize = segmentSize;
        const _bufferMargin = bufferMargin;
        const _segmentCache = new Map();
        let _bytesTransferred = 0;
        let _totalSegments = _overallSize > 0 ? Math.ceil(_overallSize / _segmentSize) : undefined;

        const _pendingSegmentFetches = new Map();
        let _initialFullFetchPromise = null;

        const determineSegmentInterval = (byteOffset, byteQuantity = 1) => {
            if (_overallSize === -1) {
                return [0, 0];
            }

            let initialSegment = Math.floor(byteOffset / _segmentSize) - _bufferMargin;
            let finalSegment = Math.floor((byteOffset + byteQuantity - 1) / _segmentSize) + _bufferMargin;

            if (initialSegment < 0) initialSegment = 0;
            if (finalSegment >= _totalSegments) finalSegment = _totalSegments - 1;

            return [initialSegment, finalSegment];
        };

        const awaitSegmentAvailability = async (requestedSegmentRange) => {
            if (_overallSize === -1) {
                if (!_initialFullFetchPromise) {
                    _initialFullFetchPromise = (async () => {
                        try {
                            const response = await dataFetcher(_source, 'GET');
                            const fullBuffer = await response.arrayBuffer();
                            _overallSize = fullBuffer.byteLength;
                            _totalSegments = Math.ceil(_overallSize / _segmentSize);
                            _bytesTransferred = _overallSize;

                            for (let i = 0; i < _totalSegments; i++) {
                                const start = i * _segmentSize;
                                const end = Math.min(start + _segmentSize, _overallSize);
                                const segment = fullBuffer.slice(start, end);
                                _segmentCache.set(i, segment);
                            }
                        } catch (err) {
                            console.error("Error retrieving entire resource (size unknown):", err);
                            throw err;
                        } finally {
                            _initialFullFetchPromise = null;
                        }
                    })();
                }
                await _initialFullFetchPromise;
                return;
            }

            const [startSegment, endSegment] = requestedSegmentRange;
            const promisesToAwait = [];

            for (let currentSegment = startSegment; currentSegment <= endSegment; currentSegment++) {
                if (_segmentCache.has(currentSegment)) {
                    continue;
                }

                const segmentStartByte = currentSegment * _segmentSize;
                const segmentEndByte = Math.min((currentSegment + 1) * _segmentSize - 1, _overallSize - 1);
                const byteRangeIdentifier = `${segmentStartByte}-${segmentEndByte}`;

                if (_pendingSegmentFetches.has(byteRangeIdentifier)) {
                    promisesToAwait.push(_pendingSegmentFetches.get(byteRangeIdentifier));
                    continue;
                }

                const fetchPromise = (async () => {
                    try {
                        const response = await dataFetcher(
                            _source,
                            'GET',
                            {},
                            [segmentStartByte, segmentEndByte]
                        );
                        const buffer = await response.arrayBuffer();
                        const receivedContentLength = parseInt(response.headers.get('Content-Length'), 10);

                        if (receivedContentLength && receivedContentLength === _overallSize && buffer.byteLength === _overallSize) {
                            for (let i = 0; i < _totalSegments; i++) {
                                const start = i * _segmentSize;
                                const end = Math.min(start + _segmentSize, _overallSize);
                                const segment = buffer.slice(start, end);
                                _segmentCache.set(i, segment);
                            }
                            _bytesTransferred = _overallSize;
                        } else {
                            _segmentCache.set(currentSegment, buffer);
                            _bytesTransferred += buffer.byteLength;
                        }
                    } catch (err) {
                        console.error(`Error retrieving segment ${currentSegment}:`, err);
                        throw err;
                    } finally {
                        _pendingSegmentFetches.delete(byteRangeIdentifier);
                    }
                })();
                _pendingSegmentFetches.set(byteRangeIdentifier, fetchPromise);
                promisesToAwait.push(fetchPromise);
            }
            await Promise.all(promisesToAwait);
        };

        this.readSingleByte = async (position) => {
            if (position < 0 || position >= _overallSize) {
                throw new Error("Specified position is out of resource bounds.");
            }

            const [targetSegmentIndex] = determineSegmentInterval(position, 1);
            
            await awaitSegmentAvailability([targetSegmentIndex, targetSegmentIndex]);

            const segmentBuffer = _segmentCache.get(targetSegmentIndex);
            if (!segmentBuffer) {
                throw new Error(`Segment ${targetSegmentIndex} not found for position ${position}`);
            }

            const localOffset = position % _segmentSize;
            const dataView = new DataView(segmentBuffer);
            return dataView.getUint8(localOffset);
        };

        this.primeDataRange = async (startPosition, endPosition) => {
            if (startPosition < 0 || endPosition >= _overallSize || startPosition > endPosition) {
                throw new Error("Invalid range for data priming.");
            }
            const [firstSegment, lastSegment] = determineSegmentInterval(startPosition, endPosition - startPosition + 1);
            await awaitSegmentAvailability([firstSegment, lastSegment]);
        };

        this.getTransferProgress = () => _bytesTransferred;
        this.getOverallSize = () => _overallSize;
        this.getSourceUrl = () => _source;
    }

    const initializeStream = async () => {
        try {
            const headResponse = await dataFetcher(resourceLocator, 'HEAD');
            const contentSizeHeader = headResponse.headers.get('Content-Length');
            const totalSize = parseInt(contentSizeHeader, 10);
            
            const fileLength = (totalSize > 0 && !isNaN(totalSize)) ? totalSize : -1;

            const loaderInstance = new SegmentedDataLoader(resourceLocator, fileLength);
            completionHandler(loaderInstance);
        } catch (error) {
            faultHandler({ error: "resource_initialization_failure", details: error.message });
        }
    };

    initializeStream();
};