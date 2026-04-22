let RemoteBinaryDataReader = function (resourceUri, onReadyHandler, onErrorCallback) {
    // --- Internal Constants for XHR Operations ---
    const XHR_READY_STATE_DONE = 4;
    const XHR_STATUS_OK = 200;
    const XHR_STATUS_PARTIAL_CONTENT = 206;
    const XHR_MIME_TYPE_BINARY = 'text/plain; charset=x-user-defined';
    const XHR_NO_MODIFICATION_DATE = 'Sat, 01 Jan 1970 00:00:00 GMT';

    // --- Utility for handling request failures ---
    const reportFailure = (issueDetails) => {
        if (onErrorCallback && typeof onErrorCallback === 'function') {
            onErrorCallback(issueDetails);
        } else {
            // Fallback for cases where no error handler is provided
            console.error("RemoteBinaryDataReader encountered an error:", issueDetails);
        }
    };

    // --- Creates an XMLHttpRequest object, trying various methods for compatibility ---
    function forgeXhrInstance() {
        let activeXhr = null;
        if (typeof window.XMLHttpRequest !== 'undefined') {
            activeXhr = new XMLHttpRequest();
        } else if (typeof window.ActiveXObject !== 'undefined') {
            try {
                activeXhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    activeXhr = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e2) {
                    // No ActiveX support
                }
            }
        }
        return activeXhr;
    }

    // --- Dispatches a network request to fetch a resource or part of it ---
    function dispatchResourceFetch(targetUrl, requestComplete, requestFailed, byteRange, supportsRanges, initialFileSize, isAsynchronous) {
        const xhrClient = forgeXhrInstance();
        if (!xhrClient) {
            return reportFailure({ error: "XHR_UNAVAILABLE", message: "Unable to create XMLHttpRequest object." });
        }

        // Default to asynchronous behavior if not explicitly specified
        const currentAsyncFlag = (isAsynchronous === false) ? false : true;

        // Set up event listeners for request completion
        if (typeof xhrClient.onload !== 'undefined') { // Modern browsers
            xhrClient.onload = function () {
                if (xhrClient.status === XHR_STATUS_OK || xhrClient.status === XHR_STATUS_PARTIAL_CONTENT) {
                    const reportedSize = Number.parseInt(xhrClient.getResponseHeader("Content-Length"), 10);
                    xhrClient.retrievedSize = initialFileSize || (Number.isNaN(reportedSize) ? 0 : reportedSize);
                    requestComplete(xhrClient);
                } else {
                    reportFailure({ error: "HTTP_STATUS_ERROR", status: xhrClient.status, xhr: xhrClient });
                }
                // Release reference to prevent memory leaks in some older browsers
                xhrClient = null;
            };
            xhrClient.onerror = function () {
                reportFailure({ error: "NETWORK_ERROR", xhr: xhrClient });
                xhrClient = null;
            };
        } else { // Older browsers (IE, etc.)
            xhrClient.onreadystatechange = function () {
                if (xhrClient.readyState === XHR_READY_STATE_DONE) {
                    if (xhrClient.status === XHR_STATUS_OK || xhrClient.status === XHR_STATUS_PARTIAL_CONTENT) {
                        const reportedSize = Number.parseInt(xhrClient.getResponseHeader("Content-Length"), 10);
                        xhrClient.retrievedSize = initialFileSize || (Number.isNaN(reportedSize) ? 0 : reportedSize);
                        requestComplete(xhrClient);
                    } else {
                        reportFailure({ error: "HTTP_STATUS_ERROR", status: xhrClient.status, xhr: xhrClient });
                    }
                    xhrClient = null;
                }
            };
        }

        xhrClient.open("GET", targetUrl, currentAsyncFlag);

        // Ensure proper binary data handling
        if (xhrClient.overrideMimeType) {
            xhrClient.overrideMimeType(XHR_MIME_TYPE_BINARY);
        }

        // Apply byte range header if supported and requested
        if (byteRange && supportsRanges) {
            xhrClient.setRequestHeader("Range", `bytes=${byteRange[0]}-${byteRange[1]}`);
        }

        // Prevent caching by setting a past modification date
        xhrClient.setRequestHeader("If-Modified-Since", XHR_NO_MODIFICATION_DATE);

        xhrClient.send(null);
    }

    // --- Sends a HEAD request to retrieve resource metadata like file size ---
    function probeResourceHeader(targetUrl, successHandler, failureHandler) {
        const xhrClient = forgeXhrInstance();
        if (!xhrClient) {
            return reportFailure({ error: "XHR_UNAVAILABLE", message: "Unable to create XMLHttpRequest object." });
        }

        if (typeof xhrClient.onload !== 'undefined') { // Modern browsers
            xhrClient.onload = function () {
                if (xhrClient.status === XHR_STATUS_OK || xhrClient.status === XHR_STATUS_PARTIAL_CONTENT) {
                    successHandler(this);
                } else {
                    reportFailure({ error: "HTTP_STATUS_ERROR", status: xhrClient.status, xhr: xhrClient });
                }
                xhrClient = null;
            };
            xhrClient.onerror = function () {
                reportFailure({ error: "NETWORK_ERROR", xhr: xhrClient });
                xhrClient = null;
            };
        } else { // Older browsers
            xhrClient.onreadystatechange = function () {
                if (xhrClient.readyState === XHR_READY_STATE_DONE) {
                    if (xhrClient.status === XHR_STATUS_OK || xhrClient.status === XHR_STATUS_PARTIAL_CONTENT) {
                        successHandler(this);
                    } else {
                        reportFailure({ error: "HTTP_STATUS_ERROR", status: xhrClient.status, xhr: xhrClient });
                    }
                    xhrClient = null;
                }
            };
        }
        xhrClient.open("HEAD", targetUrl, true); // Always async for HEAD requests
        xhrClient.send(null);
    }

    /**
     * @class SegmentedFileAccessor
     * Provides buffered access to a remote binary file, downloading segments on demand.
     *
     * @param {string} sourceUrl The URL of the binary file.
     * @param {number} fileTotalLength The total size of the file in bytes.
     * @param {number} [segmentSize=2048] The size of each data segment to fetch (in bytes).
     * @param {number} [prefetchRadius=0] The number of adjacent segments to prefetch.
     * @constructor
     */
    function SegmentedFileAccessor(sourceUrl, fileTotalLength, segmentSize, prefetchRadius) {
        let cumulativeFetchedBytes = 0;
        let dataSegments = []; // Stores fetched data chunks
        let baseFileHandle = { // Mocking a base BinaryFile interface, methods would be mixed in
            getLength: () => fileTotalLength,
            getByteAt: (idx) => { /* placeholder */ },
            getBytesAt: (idx, len) => { /* placeholder */ }
        };

        // Ensure segmentSize and prefetchRadius have valid defaults
        const currentSegmentSize = segmentSize || 2048; // Default to 2KB
        const currentPrefetchRadius = (typeof prefetchRadius === 'number' && prefetchRadius >= 0) ? prefetchRadius : 0;

        // Calculate total number of segments required for the file
        const totalSegments = Math.ceil(fileTotalLength / currentSegmentSize);
        if (totalSegments === 0 && fileTotalLength > 0) { // Edge case for very small files
             totalSegments = 1;
        }

        /**
         * Determines the range of segments that cover a given byte interval.
         * Applies the prefetch radius.
         * @param {Array<number>} byteInterval - [start_byte, end_byte]
         * @returns {Array<number>} [start_segment_index, end_segment_index]
         */
        function determineSegmentSpan(byteInterval) {
            let segmentStartIdx = Math.floor(byteInterval[0] / currentSegmentSize) - currentPrefetchRadius;
            let segmentEndIdx = Math.floor(byteInterval[1] / currentSegmentSize) + currentPrefetchRadius;

            // Clamp segment indices within valid bounds
            segmentStartIdx = Math.max(0, segmentStartIdx);
            segmentEndIdx = Math.min(totalSegments - 1, segmentEndIdx);

            return [segmentStartIdx, segmentEndIdx];
        }

        /**
         * Retrieves the data segment containing the specified byte offset.
         * Ensures necessary segments are loaded.
         * @param {number} targetByteOffset The byte offset within the file.
         * @returns {object|null} The segment object or null if invalid.
         */
        function retrieveSegmentAtOffset(targetByteOffset) {
            if (targetByteOffset < 0 || targetByteOffset >= fileTotalLength) {
                console.warn(`Attempted to retrieve segment for out-of-bounds offset: ${targetByteOffset}`);
                return null;
            }
            const segmentIndex = Math.floor(targetByteOffset / currentSegmentSize);
            // Ensure the required segment (and potentially neighbors) are loaded
            ensureSegmentsLoaded(determineSegmentSpan([targetByteOffset, targetByteOffset]));
            return dataSegments[segmentIndex];
        }

        /**
         * Ensures that a specified range of segments is loaded into memory.
         * @param {Array<number>} segmentIndexRange - [start_segment_index, end_segment_index]
         * @param {?function()} loadCompletionHandler - Callback for asynchronous loading.
         */
        function ensureSegmentsLoaded(segmentIndexRange, loadCompletionHandler) {
            let [currentStartIdx, currentEndIdx] = segmentIndexRange;

            // Filter out segments already present
            while (currentStartIdx <= currentEndIdx && dataSegments[currentStartIdx]) {
                currentStartIdx++;
            }
            while (currentEndIdx >= currentStartIdx && dataSegments[currentEndIdx]) {
                currentEndIdx--;
            }

            // If all segments in the range are already loaded, just return or call callback
            if (currentStartIdx > currentEndIdx) {
                if (loadCompletionHandler) loadCompletionHandler();
                return;
            }

            // Calculate the byte range for the segments to fetch
            const fetchByteStart = currentStartIdx * currentSegmentSize;
            const fetchByteEnd = Math.min(fileTotalLength - 1, (currentEndIdx + 1) * currentSegmentSize - 1);
            const fetchByteRange = [fetchByteStart, fetchByteEnd];

            // Request the missing byte range
            dispatchResourceFetch(
                sourceUrl,
                function (xhrResponse) {
                    const serverReportedLength = Number.parseInt(xhrResponse.getResponseHeader("Content-Length"), 10);
                    // If the server didn't respect range request or returned full file
                    if (!Number.isNaN(serverReportedLength) && serverReportedLength === fileTotalLength) {
                        // Mark all segments as loaded with the full response
                        for (let i = 0; i < totalSegments; i++) {
                            dataSegments[i] = {
                                data: xhrResponse.responseBody || xhrResponse.responseText,
                                offset: 0 // Full file starts at offset 0
                            };
                        }
                        cumulativeFetchedBytes = fileTotalLength;
                    } else {
                        // Store the fetched segment data
                        const fetchedSegmentData = {
                            data: xhrResponse.responseBody || xhrResponse.responseText,
                            offset: fetchByteStart
                        };
                        for (let i = currentStartIdx; i <= currentEndIdx; i++) {
                            dataSegments[i] = fetchedSegmentData;
                        }
                        cumulativeFetchedBytes += (fetchByteEnd - fetchByteStart + 1);
                    }

                    if (loadCompletionHandler) loadCompletionHandler();
                },
                reportFailure, // Use the shared error reporting function
                fetchByteRange,
                true, // Assume range requests are supported by default for this internal fetch
                fileTotalLength,
                !!loadCompletionHandler // Async if callback provided, sync otherwise
            );
        }

        // Mixin methods from the conceptual baseFileHandle.
        // This assumes baseFileHandle has methods like getLength, getByteAt, getBytesAt, etc.
        // For a Type III clone, we can simplify this or make it more explicit.
        // Here, we'll explicitly define the most critical ones and use Object.assign for others.
        Object.assign(this, baseFileHandle);

        /**
         * @override
         * Reads a single byte at the specified index.
         * @param {number} byteIndex The index of the byte to read.
         * @returns {number|null} The byte value (0-255) or null if out of bounds/unavailable.
         */
        this.readByteAtIndex = function (byteIndex) {
            const currentSegment = retrieveSegmentAtOffset(byteIndex);
            if (currentSegment && typeof currentSegment.data === "string") {
                // For text/plain; charset=x-user-defined, charCodeAt works
                return currentSegment.data.charCodeAt(byteIndex - currentSegment.offset) & 0xFF;
            } else if (currentSegment && typeof currentSegment.data === "unknown") {
                // Specific handling for IE's proprietary binary data type
                return IEBinary_getByteAt(currentSegment.data, byteIndex - currentSegment.offset);
            } else {
                // Data not available or segment missing
                console.warn(`Failed to read byte at index ${byteIndex}: segment data not found.`);
                return null;
            }
        };

        /**
         * @override
         * Gets the total number of bytes that have been downloaded so far.
         * @returns {number} The cumulative count of fetched bytes.
         */
        this.getCurrentFetchedByteCount = function () {
            return cumulativeFetchedBytes;
        };

        /**
         * Preloads data for a specific byte range.
         * @param {Array<number>} rangeToPreload - [start_byte, end_byte]
         * @param {?function()} completionCallback - Function to call when preloading finishes.
         */
        this.preloadByteRange = function (rangeToPreload, completionCallback) {
            const segmentSpan = determineSegmentSpan(rangeToPreload);
            ensureSegmentsLoaded(segmentSpan, completionCallback);
        };
    }

    // --- Main initialization logic for RemoteBinaryDataReader ---
    const initializeReader = () => {
        // Basic input validation
        if (typeof resourceUri !== 'string' || resourceUri.trim() === '') {
            return reportFailure({ error: "INVALID_URI", message: "Resource URI must be a non-empty string." });
        }
        if (typeof onReadyHandler !== 'function') {
            return reportFailure({ error: "MISSING_CALLBACK", message: "A 'ready' callback function is required." });
        }

        probeResourceHeader(
            resourceUri,
            function (xhrHeadResponse) {
                const totalContentLength = Number.parseInt(xhrHeadResponse.getResponseHeader("Content-Length"), 10);
                if (Number.isNaN(totalContentLength) || totalContentLength < 0) {
                    return reportFailure({ error: "INVALID_LENGTH", message: "Could not determine file size from Content-Length header." });
                }
                onReadyHandler(new SegmentedFileAccessor(resourceUri, totalContentLength));
            },
            reportFailure // Pass the shared error reporting function
        );
    };

    initializeReader();
};