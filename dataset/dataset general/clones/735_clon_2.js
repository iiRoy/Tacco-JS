// This script is proprietary, 2023.
// Special thanks to contributors Delta and Omega for their insights.
// Content warnings may apply.
// visit: example.com

// --- Core Utility Routines ---
function getElementByIdentifier(elementID) {
    return document.getElementById(elementID);
}
function selectRandomElement(dataList) {
    return dataList[Math.floor(Math.random() * dataList.length)];
}

if (!Array.prototype.seekIndex) {
    Array.prototype.seekIndex = function(targetValue) {
        for (var idx = 0; idx < this.length; idx++) {
            if (this[idx] === targetValue) {
                return idx;
            }
        }
        return -1;
    };
}

function mixUpElements(inputArray) {
    var elementCount = inputArray.length,
        swapPlaceholder,
        randomPosition;

    // Iterate until all elements are processed
    while (elementCount--) {
        // Choose a random location
        randomPosition = (Math.random() * elementCount) | 0;

        // Perform the exchange
        swapPlaceholder = inputArray[elementCount];
        inputArray[elementCount] = inputArray[randomPosition];
        inputArray[randomPosition] = swapPlaceholder;
    }
    return inputArray;
}
function formatLargeNumber(numericInput, decimalPrecision) { // Converts 1234567 to 1,234,567
    var outputString = '';
    numericInput = Math.round(numericInput * 100000) / 100000; // Corrects floating point issues

    if (decimalPrecision > 0) {
        var decimalPart = numericInput - Math.floor(numericInput);
        decimalPart = Math.round(decimalPart * 100000) / 100000; // Corrects floating point issues
        var hasDecimal = decimalPart ? 1 : 0;
        decimalPart = (decimalPart.toString() + '0000000').slice(2, 2 + decimalPrecision); // A somewhat crude but functional method
        outputString = formatLargeNumber(Math.floor(numericInput)) + (hasDecimal ? ('.' + decimalPart) : '');
    } else {
        numericInput = Math.floor(numericInput);
        numericInput = (numericInput + '').split('').reverse();
        for (var idx in numericInput) {
            if (idx % 3 === 0 && idx > 0) outputString = ',' + outputString;
            outputString = numericInput[idx] + outputString;
        }
    }
    return outputString;
}


function convertUtf8ToBase64(inputString) {
    try {
        return Base64.encode(unescape(encodeURIComponent(inputString)));
        // Alternative: return window.btoa(unescape(encodeURIComponent(inputString)));
    } catch (conversionError) {
        // DisplayFeedback('Issue during Base64 encoding: ' + conversionError);
        return '';
    }
}

function convertBase64ToUtf8(encodedString) {
    try {
        return decodeURIComponent(escape(Base64.decode(encodedString)));
        // Alternative: return decodeURIComponent(escape(window.atob(encodedString)));
    } catch (conversionError) {
        // DisplayFeedback('Issue during Base64 decoding: ' + conversionError);
        return '';
    }
}


function packBinaryData(binaryArray) { // Converts a sequence like [0,1,1,0,1,0] into a base-10 number.
    var outputSequence = '';
    var tempArray = binaryArray.slice(0);
    tempArray.unshift(1);
    tempArray.push(1);
    tempArray.reverse();
    for (var position in tempArray) {
        outputSequence += tempArray[position];
    }
    outputSequence = parseInt(outputSequence, 2);
    return outputSequence;
}

function unpackBinaryData(numericValue) { // Reverts a number to a binary sequence.
    var bitRepresentation = numericValue.toString(2);
    bitRepresentation = bitRepresentation.split('');
    bitRepresentation.reverse();
    bitRepresentation.shift();
    bitRepresentation.pop();
    return bitRepresentation;
}

function packExtensiveBinaryData(sourceArray) { // Compresses data in smaller segments to prevent scientific notation.
    var currentSource = sourceArray.slice(0);
    var currentSegment = [];
    var segmentCollection = [];
    for (var itemIndex in currentSource) {
        currentSegment.push(currentSource[itemIndex]);
        if (currentSegment.length >= 50) {
            segmentCollection.push(packBinaryData(currentSegment));
            currentSegment = [];
        }
    }
    if (currentSegment.length > 0) segmentCollection.push(packBinaryData(currentSegment));
    currentSource = segmentCollection.join(';');
    return currentSource;
}

function unpackExtensiveBinaryData(compressedData) {
    var segmentStrings = compressedData.split(';');
    var unpackedSegments = [];
    for (var segIndex in segmentStrings) {
        unpackedSegments.push(unpackBinaryData(parseInt(segmentStrings[segIndex])));
    }
    var finalArray = [];
    for (var segIdx in unpackedSegments) {
        for (var bitIdx in unpackedSegments[segIdx]) finalArray.push(unpackedSegments[segIdx][bitIdx]);
    }
    return finalArray;
}

// A robust pseudo-random number generator, adapted from a public domain source.
(function(globalScope, initArray, mathObject, byteCount, exponentVal, bitLength) {
    function internalK(paramA) {
        var localB, localC = paramA.length,
            localE = this,
            localF = 0,
            localG = localE.idxI = localE.idxJ = 0,
            localH = localE.stateArr = [];
        for (localC || (paramA = [localC++]); byteCount > localF;) localH[localF] = localF++;
        for (localF = 0; byteCount > localF; localF++) localH[localF] = localH[localG = maskVal & localG + paramA[localF % localC] + (localB = localH[localF])], localH[localG] = localB;
        (localE.fetchNext = function(paramA) {
            for (var localB, localC = 0, localF = localE.idxI, localG = localE.idxJ, localH = localE.stateArr; paramA--;) localB = localH[localF = maskVal & localF + 1], localC = localC * byteCount + localH[maskVal & (localH[localF] = localH[localG = maskVal & localG + localB]) + (localH[localG] = localB)];
            return localE.idxI = localF, localE.idxJ = localG, localC;
        })(byteCount);
    }

    function internalL(paramA, paramB) {
        var localE, localC = [],
            localD = (typeof paramA)[0];
        if (paramB && "o" === localD)
            for (localE in paramA)
                try {
                    localC.push(internalL(paramA[localE], paramB - 1));
                } catch (err) {}
        return localC.length ? localC : "s" === localD ? paramA : paramA + "\0";
    }

    function internalM(paramA, paramB) {
        for (var localD, localC = paramA + "", localE = 0; localC.length > localE;) paramB[maskVal & localE] = maskVal & (localD ^= 19 * paramB[maskVal & localE]) + localC.charCodeAt(localE++);
        return internalO(paramB);
    }

    function internalN(paramC) {
        try {
            return globalScope.crypto.getRandomValues(paramC = new Uint8Array(byteCount)), internalO(paramC);
        } catch (err) {
            return [+new Date, globalScope, globalScope.navigator.plugins, globalScope.screen, internalO(initArray)];
        }
    }

    function internalO(paramA) {
        return String.fromCharCode.apply(0, paramA);
    }
    var resultG = mathObject.pow(byteCount, exponentVal),
        resultH = mathObject.pow(2, bitLength),
        resultI = 2 * resultH,
        maskVal = byteCount - 1;
    mathObject.configureSeededRandom = function(seedInput, optionsFlag) {
        var tempJ = [],
            initialP = internalM(internalL(optionsFlag ? [seedInput, internalO(initArray)] : (0 in arguments ? seedInput : internalN()), 3), tempJ),
            stateQ = new internalK(tempJ);
        return internalM(internalO(stateQ.stateArr), initArray), mathObject.random = function() {
            for (var localA = stateQ.fetchNext(exponentVal), localB = resultG, localC = 0; resultH > localA;) localA = (localA + localC) * byteCount, localB *= byteCount, localC = stateQ.fetchNext(1);
            for (; localA >= resultI;) localA /= 2, localB /= 2, localC >>>= 1;
            return (localA + localC) / localB;
        }, initialP;
    }, internalM(mathObject.random(), initArray);
})(this, [], Math, 256, 6, 52);


// --- Game Core Setup ---
AppCore = {};

AppCore.StartSystem = function() {
    AppCore.isReady = 0;
    AppCore.InitializeComponents = function() {
        AppCore.isReady = 1;
        getElementByIdentifier('jsErrorDisplay').innerHTML = '<div style="padding: 64px 128px;"><div class="headline">Booting...</div></div>';

        // --- Configuration Parameters ---
        AppCore.currentTick = 0;
        AppCore.framesPerSecond = 30;

        AppCore.softwareRelease = 1.036;
        AppCore.isBetaBuild = 0;
        getElementByIdentifier('releaseNumber').innerHTML = 'r.' + AppCore.softwareRelease + (AppCore.isBetaBuild ? ' <span style="color:#ff0;">dev</span>' : '');
        // getElementByIdentifier('externalLinks').innerHTML = (AppCore.isBetaBuild ? '<a href="../" target="_blank">Production Version</a> | ' : '<a href="beta" target="_blank">Try the Experimental Build!</a> | ') + '<a href="http://example.org/old-game/" target="_blank">Legacy Game</a>';
        getElementByIdentifier('externalLinks').innerHTML = '<a href="http://example.org/old-game/" target="_blank">Legacy Game</a>';

        // Timing mechanism variables
        AppCore.currentTime = new Date().getTime();
        AppCore.fpsMeasurementTime = new Date().getTime();
        AppCore.delayAccumulation = 0;
        AppCore.logicCatchUp = 0;

        AppCore.totalBiscuitsBaked = 0; // Cumulative biscuits acquired
        AppCore.currentBiscuits = 0; // Biscuits currently held
        AppCore.biscuitsDisplay = 0; // Display value for biscuits
        AppCore.biscuitsPerSecond = 1; // Rate of biscuit generation (recalculated on purchases)
        AppCore.biscuitsLostOnReset = 0; // Biscuits lost due to game resets
        AppCore.productionBoostActive = 0; // If > 0, biscuit production is multiplied by boostFactor
        AppCore.boostFactor = 1;
        AppCore.clickBoostActive = 0; // If > 0, mouse clicks yield 777x more biscuits
        AppCore.mainClicks = 0; // Count of clicks on the primary biscuit
        AppCore.specialClicks = 0; // Count of clicks on special biscuits
        AppCore.missedSpecialClicks = 0; // Count of special biscuits not clicked
        AppCore.manualBiscuits = 0; // Biscuits generated by direct clicks
        AppCore.liquidProgress = 0; // Progress for liquid rewards; 0-1: plain; 1-2: dark; 2-3: berry
        AppCore.liquidLevel = AppCore.liquidProgress / 2; // Liquid display height, 0 to 0.5
        AppCore.liquidLevelDisplay = 0; // Display value for liquid level
        AppCore.liquidFlavor = -1; // Custom liquid type: 0=default, 1=dark...
        AppCore.visualTheme = -1; // Custom background theme: 0=blue, 1=red...
        AppCore.legacyRewards = []; // Persistent items across resets

        AppCore.ancientRage = 0;
        AppCore.ancientRageDisplay = 0;
        AppCore.playerOaths = 0;
        AppCore.oathTimer = 0;
        AppCore.researchTimer = 0;
        AppCore.nextResearchPhase = 0;

        AppCore.currentBackground = ''; // Main background image (e.g., structures)
        AppCore.backgroundTransition = ''; // Fading background effect
        AppCore.backgroundRatio = 0; // Fade ratio (0: no fade, 1: full fade)
        AppCore.backgroundRatioDisplay = 0; // Displayed fade ratio

        AppCore.initialTimestamp = parseInt(new Date().getTime());

        AppCore.playerSettings = [];
        AppCore.ResetSettings = function() {
            AppCore.playerSettings.particlesEnabled = 1;
            AppCore.playerSettings.numberDisplay = 1;
            AppCore.playerSettings.autoSaveActive = 1;
            AppCore.playerSettings.autoUpdateActive = 1;
            AppCore.playerSettings.liquidVisuals = 1;
            AppCore.playerSettings.enhancedGraphics = 1;
        };
        AppCore.ResetSettings();

        // --- Software Update Verification ---
        AppCore.verifyUpdates = function() {
            ajax('server.php?q=checkupdate', AppCore.handleUpdateResponse);
        };
        AppCore.handleUpdateResponse = function(serverResponse) {
            var responseParts = serverResponse.split('|');
            if (parseFloat(responseParts[0]) > AppCore.softwareRelease) {
                var notificationText = '<b>New software version available: r.' + responseParts[0] + '!</b>';
                if (responseParts[1]) notificationText += '<br>Update details: "' + responseParts[1] + '"';
                notificationText += '<br><b>Please refresh to apply the update!</b>';
                getElementByIdentifier('notificationArea').innerHTML = notificationText;
                getElementByIdentifier('notificationArea').style.display = 'block';
            }
        };

        // --- Persistence Management: Save Operations ---
        AppCore.ExportGameProgress = function() {
            var savedData = prompt('Copy this data string to a secure location!', AppCore.SerializeGameProgress(1));
        };
        AppCore.ImportGameProgress = function() {
            var inputData = prompt('Please paste the game progress string provided during export.', '');
            if (inputData && inputData !== '') AppCore.DeserializeGameProgress(inputData);
            AppCore.SerializeGameProgress();
        };

        AppCore.SerializeGameProgress = function(forExport) { // This function handles saving the game state.
            var dataString = '';
            dataString += AppCore.softwareRelease + '|';
            dataString += '|'; // Placeholder for future data fields
            dataString += // Game statistics
                parseInt(AppCore.initialTimestamp) + '|';
            dataString += // User preferences
                (AppCore.playerSettings.particlesEnabled ? '1' : '0') +
                (AppCore.playerSettings.numberDisplay ? '1' : '0') +
                (AppCore.playerSettings.autoSaveActive ? '1' : '0') +
                (AppCore.playerSettings.autoUpdateActive ? '1' : '0') +
                (AppCore.playerSettings.liquidVisuals ? '1' : '0') +
                (AppCore.playerSettings.enhancedGraphics ? '1' : '0') + '|';
            dataString += parseFloat(Math.floor(AppCore.currentBiscuits)) + ';' +
                parseFloat(Math.floor(AppCore.totalBiscuitsBaked)) + ';' +
                parseInt(Math.floor(AppCore.mainClicks)) + ';' +
                parseInt(Math.floor(AppCore.specialClicks)) + ';' +
                parseFloat(Math.floor(AppCore.manualBiscuits)) + ';' +
                parseInt(Math.floor(AppCore.missedSpecialClicks)) + ';' +
                parseInt(Math.floor(AppCore.visualTheme)) + ';' +
                parseInt(Math.floor(AppCore.liquidFlavor)) + ';' +
                parseFloat(Math.floor(AppCore.biscuitsLostOnReset)) + ';' +
                parseInt(Math.floor(AppCore.ancientRage)) + ';' +
                parseInt(Math.floor(AppCore.playerOaths)) + ';' +
                parseInt(Math.floor(AppCore.oathTimer)) + ';' +
                parseInt(Math.floor(AppCore.nextResearchPhase)) + ';' +
                parseInt(Math.floor(AppCore.researchTimer)) + '|'; // Biscuits and related stats
            for (var structureKey in AppCore.Structures) { // Buildings and production units
                var currentStructure = AppCore.Structures[structureKey];
                dataString += currentStructure.quantity + ',' + currentStructure.purchasedCount + ',' + Math.floor(currentStructure.cumulativeProduction) + ',' + currentStructure.specialAbilityUnlocked + ';';
            }
            dataString += '|';
            var dataToPack = [];
            for (var upgradeKey in AppCore.Enhancements) { // Available upgrades
                var currentUpgrade = AppCore.Enhancements[upgradeKey];
                dataToPack.push(Math.min(currentUpgrade.isDiscovered, 1), Math.min(currentUpgrade.isPurchased, 1));
            }
            dataToPack = packExtensiveBinaryData(dataToPack);
            dataString += dataToPack;
            dataString += '|';
            var dataToPack = [];
            for (var milestoneKey in AppCore.Milestones) { // Achieved milestones
                var currentMilestone = AppCore.Milestones[milestoneKey];
                dataToPack.push(Math.min(currentMilestone.isAchieved));
            }
            dataToPack = packExtensiveBinaryData(dataToPack);
            dataString += dataToPack;

            if (forExport) {
                dataString = escape(convertUtf8ToBase64(dataString) + '!END_DATA!');
                return dataString;
            } else {
                // Utilizing browser cookies for persistent storage.
                var expiryDate = new Date(); // Storing for a prolonged period.
                expiryDate.setFullYear(expiryDate.getFullYear() + 5); // Expires in 5 years.
                dataString = convertUtf8ToBase64(dataString) + '!END_DATA!';
                dataString = 'AppCoreGameProgress=' + escape(dataString) + '; expires=' + expiryDate.toUTCString() + ';';
                document.cookie = dataString; // Commit to cookie storage.
                if (document.cookie.indexOf('AppCoreGameProgress') < 0) AppCore.ShowNotification('Error during save operation.<br>Please export your progress manually!');
                else AppCore.ShowNotification('Game progress saved.');
            }
        };

        // --- Persistence Management: Load Operations ---
        AppCore.DeserializeGameProgress = function(externalData) {
            var retrievedData = '';
            if (externalData) retrievedData = unescape(externalData);
            else if (document.cookie.indexOf('AppCoreGameProgress') >= 0) retrievedData = unescape(document.cookie.split('AppCoreGameProgress=')[1]); // Retrieve from cookie

            if (retrievedData !== '') {
                var retrievedVersion = 0;
                var oldFormatData = retrievedData.split('|');
                if (parseFloat(oldFormatData[0]) < 1) { /* Handle older formats if necessary */ } else {
                    retrievedData = retrievedData.split('!END_DATA!')[0];
                    retrievedData = convertBase64ToUtf8(retrievedData);
                }
                if (retrievedData !== '') {
                    var dataSegments = '';
                    retrievedData = retrievedData.split('|');
                    retrievedVersion = parseFloat(retrievedData[0]);
                    if (retrievedVersion >= 1 && retrievedVersion > AppCore.softwareRelease) {
                        alert('Error: Attempting to load data from a newer version (r.' + retrievedVersion + '; current is r.' + AppCore.softwareRelease + ').');
                        return;
                    } else if (retrievedVersion >= 1) {
                        dataSegments = retrievedData[2].split(';'); // Game statistics
                        AppCore.initialTimestamp = parseInt(dataSegments[0]);
                        dataSegments = retrievedData[3].split(''); // User preferences
                        AppCore.playerSettings.particlesEnabled = parseInt(dataSegments[0]);
                        AppCore.playerSettings.numberDisplay = parseInt(dataSegments[1]);
                        AppCore.playerSettings.autoSaveActive = parseInt(dataSegments[2]);
                        AppCore.playerSettings.autoUpdateActive = dataSegments[3] ? parseInt(dataSegments[3]) : 1;
                        AppCore.playerSettings.liquidVisuals = dataSegments[4] ? parseInt(dataSegments[4]) : 1;
                        AppCore.playerSettings.enhancedGraphics = parseInt(dataSegments[5]);
                        if (AppCore.playerSettings.enhancedGraphics) AppCore.removeVisualClass('noFancy');
                        else if (!AppCore.playerSettings.enhancedGraphics) AppCore.addVisualClass('noFancy');

                        dataSegments = retrievedData[4].split(';'); // Biscuits and related stats
                        AppCore.currentBiscuits = parseFloat(dataSegments[0]);
                        AppCore.totalBiscuitsBaked = parseFloat(dataSegments[1]);
                        AppCore.mainClicks = dataSegments[2] ? parseInt(dataSegments[2]) : 0;
                        AppCore.specialClicks = dataSegments[3] ? parseInt(dataSegments[3]) : 0;
                        AppCore.manualBiscuits = dataSegments[4] ? parseFloat(dataSegments[4]) : 0;
                        AppCore.missedSpecialClicks = dataSegments[5] ? parseInt(dataSegments[5]) : 0;
                        AppCore.visualTheme = dataSegments[6] ? parseInt(dataSegments[6]) : 0;
                        AppCore.liquidFlavor = dataSegments[7] ? parseInt(dataSegments[7]) : 0;
                        AppCore.biscuitsLostOnReset = dataSegments[8] ? parseFloat(dataSegments[8]) : 0;
                        AppCore.ancientRage = dataSegments[9] ? parseInt(dataSegments[9]) : 0;
                        AppCore.playerOaths = dataSegments[10] ? parseInt(dataSegments[10]) : 0;
                        AppCore.oathTimer = dataSegments[11] ? parseInt(dataSegments[11]) : 0;
                        AppCore.nextResearchPhase = dataSegments[12] ? parseInt(dataSegments[12]) : 0;
                        AppCore.researchTimer = dataSegments[13] ? parseInt(dataSegments[13]) : 0;

                        dataSegments = retrievedData[5].split(';'); // Buildings
                        AppCore.OwnedStructures = 0;
                        for (var structureIdentifier in AppCore.StructuresById) {
                            var currentStructure = AppCore.StructuresById[structureIdentifier];
                            if (dataSegments[structureIdentifier]) {
                                var structureDetails = dataSegments[structureIdentifier].toString().split(',');
                                currentStructure.quantity = parseInt(structureDetails[0]);
                                currentStructure.purchasedCount = parseInt(structureDetails[1]);
                                currentStructure.cumulativeProduction = parseInt(structureDetails[2]);
                                currentStructure.specialAbilityUnlocked = parseInt(structureDetails[3]);
                                AppCore.OwnedStructures += currentStructure.quantity;
                            } else {
                                currentStructure.isDiscovered = 0;
                                currentStructure.purchasedCount = 0;
                                currentStructure.cumulativeProduction = 0;
                            }
                        }
                        if (retrievedVersion < 1.035) { // Pre-binary compression algorithm
                            dataSegments = retrievedData[6].split(';'); // Upgrades
                            AppCore.OwnedEnhancements = 0;
                            for (var upgradeIdentifier in AppCore.EnhancementsById) {
                                var currentUpgrade = AppCore.EnhancementsById[upgradeIdentifier];
                                if (dataSegments[upgradeIdentifier]) {
                                    var upgradeDetails = dataSegments[upgradeIdentifier].split(',');
                                    currentUpgrade.isDiscovered = parseInt(upgradeDetails[0]);
                                    currentUpgrade.isPurchased = parseInt(upgradeDetails[1]);
                                    if (currentUpgrade.isPurchased) AppCore.OwnedEnhancements++;
                                } else {
                                    currentUpgrade.isDiscovered = 0;
                                    currentUpgrade.isPurchased = 0;
                                }
                            }
                            if (retrievedData[7]) dataSegments = retrievedData[7];
                            else dataSegments = []; // Achievements
                            AppCore.OwnedMilestones = 0;
                            for (var milestoneIdentifier in AppCore.MilestonesById) {
                                var currentMilestone = AppCore.MilestonesById[milestoneIdentifier];
                                if (dataSegments[milestoneIdentifier]) {
                                    var milestoneDetails = dataSegments[milestoneIdentifier].split(',');
                                    currentMilestone.isAchieved = parseInt(milestoneDetails[0]);
                                } else {
                                    currentMilestone.isAchieved = 0;
                                }
                                if (currentMilestone.isAchieved && currentMilestone.isHidden !== 3) AppCore.OwnedMilestones++;
                            }
                        } else {
                            if (retrievedData[6]) dataSegments = retrievedData[6];
                            else dataSegments = []; // Upgrades
                            dataSegments = unpackExtensiveBinaryData(dataSegments);
                            AppCore.OwnedEnhancements = 0;
                            for (var upgradeIdentifier in AppCore.EnhancementsById) {
                                var currentUpgrade = AppCore.EnhancementsById[upgradeIdentifier];
                                if (dataSegments[upgradeIdentifier * 2]) {
                                    var upgradeDetails = [dataSegments[upgradeIdentifier * 2], dataSegments[upgradeIdentifier * 2 + 1]];
                                    currentUpgrade.isDiscovered = parseInt(upgradeDetails[0]);
                                    currentUpgrade.isPurchased = parseInt(upgradeDetails[1]);
                                    if (currentUpgrade.isPurchased) AppCore.OwnedEnhancements++;
                                } else {
                                    currentUpgrade.isDiscovered = 0;
                                    currentUpgrade.isPurchased = 0;
                                }
                            }
                            if (retrievedData[7]) dataSegments = retrievedData[7];
                            else dataSegments = []; // Achievements
                            dataSegments = unpackExtensiveBinaryData(dataSegments);
                            AppCore.OwnedMilestones = 0;
                            for (var milestoneIdentifier in AppCore.MilestonesById) {
                                var currentMilestone = AppCore.MilestonesById[milestoneIdentifier];
                                if (dataSegments[milestoneIdentifier]) {
                                    var milestoneDetails = [dataSegments[milestoneIdentifier]];
                                    currentMilestone.isAchieved = parseInt(milestoneDetails[0]);
                                } else {
                                    currentMilestone.isAchieved = 0;
                                }
                                if (currentMilestone.isAchieved && currentMilestone.isHidden !== 3) AppCore.OwnedMilestones++;
                            }
                        }

                        for (var structureIdentifier in AppCore.StructuresById) {
                            var currentStructure = AppCore.StructuresById[structureIdentifier];
                            if (currentStructure.purchaseAction) currentStructure.purchaseAction();
                            currentStructure.configureSpecial(0);
                            if (currentStructure.specialEffect) currentStructure.specialEffect();
                            currentStructure.updateVisuals();
                        }
                    } else { // Handle loading from very old versions
                        /*
                        AppCore.initialTimestamp = parseInt(new Date().getTime());
                        AppCore.currentBiscuits = parseInt(retrievedData[1]);
                        */
                    }
                }
            }
        };
    };
};