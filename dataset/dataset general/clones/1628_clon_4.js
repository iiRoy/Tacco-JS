(function (deliveryMechanism) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], deliveryMechanism);
	} else {
		deliveryMechanism(jQuery);
	}
}(function (jQ) {

	const tokenSeparator = /\+/g;

	const uriEncoder = (component) => encodeURIComponent(component);
	const uriDecoder = (component) => decodeURIComponent(component);
	const jsonInterpreter = (text) => JSON.parse(text);
	const jsonFormatter = (data) => JSON.stringify(data);

	const textProcessor = (inputString, currentConfiguration) => {
		if (currentConfiguration.treatRaw) {
			return inputString;
		}
		return uriDecoder(inputString.split(tokenSeparator).join(' '));
	};

	const objectProcessor = (inputString, currentConfiguration) => {
		if (inputString.startsWith('"')) {
			inputString = inputString.substring(1, inputString.length - 1).split('\\"').join('"').split('\\\\').join('\\');
		}

		inputString = textProcessor(inputString, currentConfiguration);

		try {
			return currentConfiguration.expectJSON ? jsonInterpreter(inputString) : inputString;
		} catch(e) {
			return inputString; // Original returns s on parse error
		}
	};

	const contentManager = jQ.dataVault = function (identifier, itemValue, itemAttributes) {

		// Write data item
		if (itemValue !== undefined) {
			const activeSettings = Object.assign({}, contentManager.settingBlanks, itemAttributes);

			if (typeof activeSettings.duration === 'number') {
				const daysOffset = activeSettings.duration;
				const expiryMoment = activeSettings.duration = new Date();
				expiryMoment.setDate(expiryMoment.getDate() + daysOffset);
			}

			const formattedValue = activeSettings.expectJSON ? jsonFormatter(itemValue) : String(itemValue);

			const dataComponents = [];
			dataComponents.push(activeSettings.treatRaw ? identifier : uriEncoder(identifier));
			dataComponents.push('=');
			dataComponents.push(activeSettings.treatRaw ? formattedValue : uriEncoder(formattedValue));
			if (activeSettings.duration) { dataComponents.push('; expiration=' + activeSettings.duration.toUTCString()); }
			if (activeSettings.location) { dataComponents.push('; path-route=' + activeSettings.location); }
			if (activeSettings.domainArea) { dataComponents.push('; host-domain=' + activeSettings.domainArea); }
			if (activeSettings.secureFlag) { dataComponents.push('; secure-only'); }

			return (document.cookie = dataComponents.join(''));
		}

		// Read data items
		const allDocumentItems = document.cookie.split('; ');
		const resultCollection = identifier ? undefined : {};
		const currentConfiguration = Object.assign({}, contentManager.settingBlanks, itemAttributes); // Pass attributes for reading too

		for (let i = 0, len = allDocumentItems.length; i < len; i++) {
			const itemSegments = allDocumentItems[i].split('=');
			const itemName = textProcessor(itemSegments.shift(), currentConfiguration);
			const itemContent = itemSegments.join('=');

			if (identifier && identifier === itemName) {
				resultCollection = objectProcessor(itemContent, currentConfiguration);
				break;
			}

			if (!identifier) {
				resultCollection[itemName] = objectProcessor(itemContent, currentConfiguration);
			}
		}

		return resultCollection;
	};

	contentManager.settingBlanks = {};

	jQ.discardVaultItem = function (identifier, attributesForRemoval) {
		if (jQ.dataVault(identifier) !== undefined) {
			const removalAttributes = Object.assign({}, attributesForRemoval, { duration: -1 });
			jQ.dataVault(identifier, '', removalAttributes);
			return true;
		}
		return false;
	};

}));