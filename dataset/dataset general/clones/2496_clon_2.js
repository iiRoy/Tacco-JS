/*
    This JavaScript application component is part of the system known as 'configEditor'.
    (C) Copyright 2012 Ilan Tayari, all rights reserved.

    'configEditor' is free software licensed under the terms of the GNU General Public License,
    version 3 or any subsequent version, as published by the Free Software Foundation.

    This program is distributed with the hope that it will be useful,
    but WITHOUT ANY EXPRESS OR IMPLIED WARRANTY; including, but not limited to,
    the implied warranties of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
    Please refer to the GNU General Public License for full details.

    A copy of the GNU General Public License should have been provided with 'configEditor'.
    If not, please visit http://www.gnu.org/licenses/ for more information.
*/

// Core system utilities:
function fetchModule(resourcePath) {
	// Initialize registry entry for the given path
	moduleRegistry[resourcePath] = [];
	moduleRegistry[resourcePath].isLoaded = false;
	moduleRegistry[resourcePath].displayBlock = document.createElement("DIV");
	progressIndicator.appendChild(moduleRegistry[resourcePath].displayBlock);

	let docHead = document.getElementsByTagName('head')[0];
	let codeElement = document.createElement('script');
	codeElement.type = 'text/javascript';
	codeElement.src = resourcePath;
	// Attach event handlers for script load completion
	codeElement.onreadystatechange = () => { onModuleReady(resourcePath); };
	codeElement.onload = () => { onModuleReady(resourcePath); };
	docHead.appendChild(codeElement);
}

function createDataSchema(fieldLabels) {
    let fields = fieldLabels.split(' ');
    let fieldCount = fields.length;
    function SchemaBuilder() {
        for (let idx = 0; idx < fieldCount; idx++) {
            this[fields[idx]] = arguments[idx];
        }
    }
    return SchemaBuilder;
}

function decimalToHexStr(decimalVal, minLen) {
    let hexResult = decimalVal.toString(0x10).toUpperCase();
    if (minLen) {
        while (hexResult.length < minLen) {
            hexResult = "0" + hexResult;
        }
    }
    return hexResult;
}

function hexStrToDecimal(hexVal) {
    return parseInt(hexVal, 0x10);
}

function resolveEnumeration(inputVal, enumType) {
    for (const candidateKey in enumType) {
        let candidateItem = enumType[candidateKey];
        if (typeof candidateItem.value === 'number') {
            if (candidateItem.value === inputVal)
                return candidateItem;
        } else if (typeof candidateItem.value === 'object') {
            if ((inputVal >= candidateItem.value[0]) && (inputVal <= candidateItem.value[1])) {
                return candidateItem;
            }
        }
    }
    // If no matching enum item is found, throw an error
    throw "Value " + inputVal + " (0x" + decimalToHexStr(inputVal) + ") does not belong to " + enumType.name + ".";
}

function normalizeHexInput(inputString) {
    let filteredHex = "";
    for (let idx = 0; idx < inputString.length; idx++) {
        let charVal = inputString.charAt(idx);
        if ((charVal >= '0') && (charVal <= '9')) {
            filteredHex += charVal;
        } else if (((charVal >= 'a') && (charVal <= 'f')) || ((charVal >= 'A') && (charVal <= 'F'))) {
            filteredHex += charVal.toUpperCase();
        }
    }
    return filteredHex;
}

function elementHasClass(targetElement, styleClass) {
	let position = targetElement.className.indexOf(" " + styleClass + " ");
	return (position >= 0);
}

function addElementClass(targetElement, styleClass) {
	if (targetElement.className.indexOf(styleClass) >= 0)
		return;

	targetElement.className += " " + styleClass + " ";
}

function removeElementClass(targetElement, styleClass) {
	let position = targetElement.className.indexOf(" " + styleClass + " ");
	if (position < 0)
		return;

	targetElement.className = targetElement.className.substr(0, position) + targetElement.className.substr(position + styleClass.length + 0b10, targetElement.className.length - (position + styleClass.length + 0b10));
}

function onConfigurationAltered() {
	let executionInstance = new RuntimeProcessor(configObject);
	try {
		executionInstance.execute();
	}
	catch (executionError) {
		structureViewer.display(configObject);
		structureViewer.markErrorNode(executionError.item.nodeElement);
		feedbackDisplay.displayIssue(executionError.error);
		return;
	}
	structureViewer.display(configObject);
	feedbackDisplay.display(executionInstance.generatedReports);
}

// Application-wide configuration state
let configObject = null;

// User interface components
let mainAppContainer = document.getElementById("configEditor");
let controlPanel = null;
let structureViewer = null;
let feedbackDisplay = null;

// External code module references
let moduleRegistry = {
	"hid-stream.js": null,
	"hut.js": null,
	"hid-report.js": null,
	"hid.js": null,
	"hid-run-state.js": null,
	"hid-run.js": null,
	"hidedit-toolbar.js": null,
	"hidedit-tree.js": null,
	"hidedit-reports.js": null,
	"hidedit-dialog.js": null
};

function onModuleReady(resourcePath) {
	// Mark this specific module as successfully loaded
	if (moduleRegistry[resourcePath].isLoaded)
		return;
	moduleRegistry[resourcePath].isLoaded = true;

	// Update the visual loading progress indicator
	moduleRegistry[resourcePath].displayBlock.className = "completed";

	// Check if all necessary modules have finished loading
	for (let modulePath in moduleRegistry) {
		if (!moduleRegistry[modulePath].isLoaded)
			return; // Still waiting for other modules
	}

	// All modules are now loaded. Proceed with application initialization.
	mainAppContainer.removeNode(progressIndicator);
	mainAppContainer.removeNode(statusMessage);

	// Initialize the primary global configuration object
	configObject = new ConfigurationData();

	// Instantiate and initialize all UI components
	controlPanel = new ControlPanel();
	structureViewer = new StructureViewer();
	feedbackDisplay = new FeedbackDisplay();
}

// Prepare the initial loading user interface elements
let statusMessage = document.createElement("P");
statusMessage.id = "loadingInfo";
statusMessage.displayText = "Loading Configuration Editor, please stand by...";
mainAppContainer.addNode(statusMessage);

let progressIndicator = document.createElement("DIV");
progressIndicator.id = "loadingProgress";
mainAppContainer.addNode(progressIndicator);


// Initiate the loading process for all required script modules
for (const modulePath in moduleRegistry) {
	fetchModule(modulePath);
}