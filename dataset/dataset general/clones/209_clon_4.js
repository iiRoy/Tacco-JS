var UniversalLocator = (function() {
	"use strict";

	// Renamed default ports for standard protocols
	const standardNetworkPorts = {
		"ftp"    : 21,
		"gopher" : 70,
		"http"   : 80,
		"https"  : 443,
		"ws"     : 80,
		"wss"    : 443
	};

	// Renamed the custom decode function for query parameters
	const customDecoderForArgs = function(inputStr) {
		let currentText = inputStr.replace(/\+/g, ' ');

		currentText = currentText.replace( /%([ef][0-9a-f])%([89ab][0-9a-f])%([89ab][0-9a-f])/gi,
			function( fullMatch, h1, h2, h3) {
				const n1 = parseInt( h1, 16) - 0xE0;
				const n2 = parseInt( h2, 16) - 0x80;
	
				if (n1 === 0 && n2 < 32) {
					return fullMatch;
				}
	
				const n3 = parseInt( h3, 16) - 0x80;
				const n = (n1 << 12) + (n2 << 6) + n3;
	
				if (n > 0xFFFF) {
					return fullMatch;
				}
	
				return String.fromCharCode( n);
			}
		);

		currentText = currentText.replace( /%([cd][0-9a-f])%([89ab][0-9a-f])/gi,
			function( fullMatch, h1, h2) {
				const n1 = parseInt(h1, 16) - 0xC0;
	
				if (n1 < 2) {
					return fullMatch;
				}
	
				const n2 = parseInt(h2, 16) - 0x80;
	
				return String.fromCharCode( (n1 << 6) + n2);
			}
		);

		currentText = currentText.replace( /%([0-7][0-9a-f])/gi,
			function( fullMatch, hex) {
				return String.fromCharCode( parseInt(hex, 16));
			}
		);

		return currentText;
	};

	// Renamed the query string processing logic into a separate constructor
	const QueryArgumentProcessor = function(inputString) {
		const regexForArgs = /([^=&]+)(=([^&]*))?/g;
		let currentMatchResult;

		while ((currentMatchResult = regexForArgs.exec(inputString))) {
			const keyDecoded = customDecoderForArgs(currentMatchResult[1]); // + to space handled in customDecoder
			const valueDecoded = currentMatchResult[3] ? customDecoderForArgs(currentMatchResult[3]) : '';

			if (Object.prototype.hasOwnProperty.call(this, keyDecoded)) {
				if (!Array.isArray(this[keyDecoded])) {
					this[keyDecoded] = [this[keyDecoded]];
				}
				this[keyDecoded].push(valueDecoded);
			} else {
				this[keyDecoded] = valueDecoded;
			}
		}
	};

	QueryArgumentProcessor.prototype.clear = function() {
		for (const propName in this) {
			if (Object.prototype.hasOwnProperty.call(this, propName) && typeof this[propName] !== 'function') {
				delete this[propName];
			}
		}
	};

	QueryArgumentProcessor.prototype.assemble = function() {
		let outputString = '';
		const uriEncodeFn = encodeURIComponent;

		for (const propName in this) {
			if (Object.prototype.hasOwnProperty.call(this, propName) && typeof this[propName] !== 'function') {
				if (Array.isArray(this[propName])) {
					const currentValues = this[propName];
					if (currentValues.length) {
						for (let i = 0; i < currentValues.length; i++) {
							outputString += outputString ? '&' : '';
							outputString += uriEncodeFn(propName) + '=' + uriEncodeFn(currentValues[i]);
						}
					} else { // Parameter is an empty array, so treat as an empty argument
						outputString += (outputString ? '&' : '') + uriEncodeFn(propName) + '=';
					}
				} else {
					outputString += outputString ? '&' : '';
					outputString += uriEncodeFn(propName) + '=' + uriEncodeFn(this[propName]);
				}
			}
		}
		return outputString;
	};
	// Ensure implicit string conversion calls assemble
	QueryArgumentProcessor.prototype.toString = QueryArgumentProcessor.prototype.assemble;

	// Renamed the main parsing function, using pure regex instead of `<a>` element for initial parse
	const processLocator = function(targetInstance, addressString) {
		const currentDocument = document;
		const effectiveAddress = addressString || currentDocument.location.href;

		// Comprehensive regex to break down a URL
		// Group 1: protocol (e.g., http)
		// Group 2: user (e.g., user)
		// Group 3: pass (e.g., pass)
		// Group 4: host (e.g., example.com)
		// Group 5: port (e.g., 8080)
		// Group 6: path (e.g., /path/to/file.html)
		// Group 7: query (e.g., key=val)
		// Group 8: hash (e.g., section)
		const fullUrlPattern = /^(?:([a-z][a-z0-9+.-]*):)?(?:\/\/)?(?:([^:@]+)?(?::([^@]+))?@)?([^:/?#]+)?(?::(\d+))?([^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i;
		const match = effectiveAddress.match(fullUrlPattern);

		let parsedProtocol = '';
		let parsedUser = '';
		let parsedPass = '';
		let parsedHost = '';
		let parsedPort = '';
		let parsedPath = '';
		let parsedQuery = '';
		let parsedHash = '';

		if (match) {
			parsedProtocol = match[1] || '';
			parsedUser = match[2] || '';
			parsedPass = match[3] || '';
			parsedHost = match[4] || '';
			parsedPort = match[5] || '';
			parsedPath = match[6] || '';
			parsedQuery = match[7] || '';
			parsedHash = match[8] || '';
		}

		// Assign components to the target instance
		targetInstance.protocolPart = parsedProtocol;
		targetInstance.userAccount = parsedUser;
		targetInstance.passCode = parsedPass;
		targetInstance.hostNamePart = parsedHost;
		targetInstance.portNumberPart = parsedPort;
		targetInstance.pathRoutePart = parsedPath;
		targetInstance.queryStringPart = parsedQuery;
		targetInstance.fragmentIdPart = parsedHash;

		// Port fix-up: remove port if it's a standard default port or 0
		targetInstance.portNumberPart = (standardNetworkPorts[targetInstance.protocolPart] == parseInt(targetInstance.portNumberPart, 10) || parseInt(targetInstance.portNumberPart, 10) === 0) ? '' : targetInstance.portNumberPart;

		// Relative path handling (mimicking original's IE fix)
		if (!targetInstance.protocolPart && !/^([a-z]+:)?\/\//.test(effectiveAddress)) {
			const currentDocHref = currentDocument.location.href;
			const baseUrlPrefixMatch = currentDocHref.match(/(.*\/)/);
			const baseUrlPrefix = baseUrlPrefixMatch ? baseUrlPrefixMatch[0] : currentDocHref;

			// Parse the base URL prefix using the same regex
			const baseMatch = baseUrlPrefix.match(fullUrlPattern);
			let baseProtocol = baseMatch ? baseMatch[1] || '' : '';
			let baseHost = baseMatch ? baseMatch[4] || '' : '';
			let basePath = baseMatch ? baseMatch[6] || '' : '';
			let basePort = baseMatch ? baseMatch[5] || '' : '';
			let baseUser = baseMatch ? baseMatch[2] || '' : '';
			let basePass = baseMatch ? baseMatch[3] || '' : '';

			// Copy properties from the resolved base URL
			targetInstance.protocolPart = baseProtocol;
			targetInstance.userAccount = baseUser;
			targetInstance.passCode = basePass;
			targetInstance.hostNamePart = baseHost;
			targetInstance.portNumberPart = (standardNetworkPorts[baseProtocol] == parseInt(basePort, 10) || parseInt(basePort, 10) === 0) ? '' : basePort;

			let baseSegments = basePath.split('/');
			let currentSegments = targetInstance.pathRoutePart.split('/');

			baseSegments.pop(); // Remove the last segment (file or empty) from the base path

			while (currentSegments[0] === '..') { // Handle '..' segments
				baseSegments.pop();
				currentSegments.shift();
			}

			// Reconstruct the path
			targetInstance.pathRoutePart = (effectiveAddress.substring(0, 1) !== '/' ? baseSegments.join('/') : '') + '/' + currentSegments.join('/');
		}

		// Ensure path starts with '/' or is just '/' if host/protocol exists and path is empty
		if (targetInstance.pathRoutePart && targetInstance.pathRoutePart[0] !== '/') {
			targetInstance.pathRoutePart = '/' + targetInstance.pathRoutePart;
		} else if (!targetInstance.pathRoutePart && (targetInstance.hostNamePart || targetInstance.protocolPart)) {
			targetInstance.pathRoutePart = '/'; // Mimic `<a>` element pathname behavior for root paths
		}

		// Process query string using the new QueryArgumentProcessor constructor
		targetInstance.queryComponents = new QueryArgumentProcessor(targetInstance.queryStringPart);
	};

	// The main constructor function returned by the IIFE
	return function(initialAddress) {
		this.assemble = function() {
			return (
				(this.protocolPart && (this.protocolPart + '://')) +
				(this.userAccount && (this.userAccount + (this.passCode && (':' + this.passCode)) + '@')) +
				(this.hostNamePart && this.hostNamePart) +
				(this.portNumberPart && (':' + this.portNumberPart)) +
				(this.pathRoutePart && this.pathRoutePart) +
				(this.queryComponents.assemble() && ('?' + this.queryComponents)) +
				(this.fragmentIdPart && ('#' + this.fragmentIdPart))
			);
		};
		// Map toString to assemble for implicit string conversion
		this.toString = this.assemble;

		processLocator(this, initialAddress);
	};
}());