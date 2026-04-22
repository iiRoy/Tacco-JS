// Chronos Engine: Core Utilities and Game State Management
// This software is a derivative work, reimagined for enhanced functionality and maintainability.
// Concepts inspired by original works (2013).

// =====================================================================================
// GENERAL UTILITY FUNCTIONS
// =====================================================================================

// Cached DOM element selector for efficiency
const domElementCache = new Map();
const queryNodeById = (elementIdentifier) => {
    if (domElementCache.has(elementIdentifier)) {
        return domElementCache.get(elementIdentifier);
    }
    const targetElement = document.getElementById(elementIdentifier);
    if (targetElement) {
        domElementCache.set(elementIdentifier, targetElement);
    }
    return targetElement;
};

// Randomly selects an item from an array
const selectRandomItem = (sourceArray) => {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
        console.warn('selectRandomItem invoked with an empty or non-array source.');
        return undefined;
    }
    const randomIndex = Math.trunc(Math.random() * sourceArray.length);
    return sourceArray[randomIndex];
};

// Implements the Fisher-Yates (Knuth) shuffle algorithm
const scrambleArray = (originalArray) => {
    const mutableArray = [...originalArray]; // Operate on a shallow copy
    let remainingElements = mutableArray.length;
    let temporaryHolder, chosenIndex;

    // While elements still need shuffling
    while (remainingElements !== 0) {
        // Pick a random element from the unshuffled portion
        chosenIndex = Math.trunc(Math.random() * remainingElements);
        remainingElements -= 1;

        // Swap it with the current last unshuffled element
        temporaryHolder = mutableArray[remainingElements];
        mutableArray[remainingElements] = mutableArray[chosenIndex];
        mutableArray[chosenIndex] = temporaryHolder;
    }
    return mutableArray;
};

// Formats a numerical value into a localized string with specified decimal precision
const formatNumericalDisplay = (inputNumber, decimalPrecision = 0) => {
    // Correct for potential floating point inaccuracies before formatting
    let processedValue = Number(inputNumber.toFixed(5));
    let formattedResult = '';

    if (decimalPrecision > 0) {
        const integerPart = Math.trunc(processedValue);
        const fractionalPart = processedValue - integerPart;
        // Generate fractional string with required precision
        const fractionalString = (fractionalPart.toFixed(decimalPrecision)).slice(2);
        const hasFractionalComponent = fractionalPart > 0 || decimalPrecision > 0;
        formattedResult = `${formatNumericalDisplay(integerPart)}${hasFractionalComponent ? `.${fractionalString}` : ''}`;
    } else {
        processedValue = Math.trunc(processedValue);
        const numberCharacters = String(processedValue).split('').reverse();
        for (let i = 0; i < numberCharacters.length; i++) {
            if (i % 3 === 0 && i > 0) {
                formattedResult = `,${formattedResult}`;
            }
            formattedResult = numberCharacters[i] + formattedResult;
        }
    }
    return formattedResult;
};

// Encodes a UTF-8 string to Base64 using native browser functions
const convertUtf8ToBase64 = (sourceString) => {
    try {
        return window.btoa(unescape(encodeURIComponent(sourceString)));
    } catch (error) {
        console.error(`Base64 encoding failed: ${error.message}`);
        return '';
    }
};

// Decodes a Base64 string back to UTF-8
const convertBase64ToUtf8 = (encodedString) => {
    try {
        return decodeURIComponent(escape(window.atob(encodedString)));
    } catch (error) {
        console.error(`Base64 decoding failed: ${error.message}`);
        return '';
    }
};

// Compresses an array of binary flags (0s and 1s) into a single integer
const compressBinaryFlags = (flagArray) => {
    // Add start/end markers for robust decompression
    const paddedFlags = [1, ...flagArray, 1];
    paddedFlags.reverse(); // For correct binary string construction
    const binaryString = paddedFlags.join('');
    return Number.parseInt(binaryString, 2);
};

// Decompresses an integer back into its original array of binary flags
const decompressBinaryFlags = (packedInteger) => {
    let binaryRepresentation = packedInteger.toString(2);
    const flagsArray = binaryRepresentation.split('').reverse();
    // Remove the start/end markers
    flagsArray.shift(); // First '1'
    flagsArray.pop();   // Last '1'
    return flagsArray.map(Number); // Convert string '0'/'1' to actual numbers
};

// Serializes a long sequence of binary flags into a string of compressed chunks
const serializeLongBinarySequence = (largeFlagArray) => {
    const processedChunks = [];
    let currentProcessingChunk = [];
    const maximumChunkBitLength = 48; // To prevent issues with JavaScript's number precision in parseInt

    for (const flagBit of largeFlagArray) {
        currentProcessingChunk.push(flagBit);
        if (currentProcessingChunk.length >= maximumChunkBitLength) {
            processedChunks.push(compressBinaryFlags(currentProcessingChunk));
            currentProcessingChunk = [];
        }
    }
    if (currentProcessingChunk.length > 0) {
        processedChunks.push(compressBinaryFlags(currentProcessingChunk));
    }
    return processedChunks.join(';');
};

// Deserializes a string of compressed binary chunks back into a full binary flag array
const deserializeLongBinarySequence = (serializedDataString) => {
    if (!serializedDataString) return [];
    const compressedChunks = serializedDataString.split(';');
    const reconstructedFlags = [];
    for (const chunkEntry of compressedChunks) {
        if (chunkEntry) { // Ensure chunk isn't empty
            const bitsFromChunk = decompressBinaryFlags(Number.parseInt(chunkEntry));
            reconstructedFlags.push(...bitsFromChunk);
        }
    }
    return reconstructedFlags;
};

// Seeded random number generator. Based on original source by David Bau.
// Internal variable names modified for Type II compliance.
((globalContext, initialEntropy, mathUtility, baseValue, exponentA, exponentB) => {
    function PsuedoRandomGenerator(seedData) {
        let internalIndex,
            dataLength = seedData.length,
            generatorInstance = this;
        generatorInstance.stateI = generatorInstance.stateJ = 0;
        generatorInstance.stateArray = []; // Internal state array

        for (let k = 0; k < baseValue; k++) generatorInstance.stateArray[k] = k;

        let scramblePointer = 0;
        for (let k = 0; k < baseValue; k++) {
            scramblePointer = (scramblePointer + seedData[k % dataLength] + generatorInstance.stateArray[k]) & (baseValue - 1);
            let tempSwap = generatorInstance.stateArray[k];
            generatorInstance.stateArray[k] = generatorInstance.stateArray[scramblePointer];
            generatorInstance.stateArray[scramblePointer] = tempSwap;
        }

        generatorInstance.produceValue = (count) => {
            let producedResult = 0,
                currentI = generatorInstance.stateI,
                currentJ = generatorInstance.stateJ,
                currentState = generatorInstance.stateArray;

            while (count--) {
                currentI = (currentI + 1) & (baseValue - 1);
                currentJ = (currentJ + currentState[currentI]) & (baseValue - 1);
                let tempSwap = currentState[currentI];
                currentState[currentI] = currentState[currentJ];
                currentState[currentJ] = tempSwap;
                producedResult = producedResult * baseValue + currentState[(currentState[currentI] + currentState[currentJ]) & (baseValue - 1)];
            }
            generatorInstance.stateI = currentI;
            generatorInstance.stateJ = currentJ;
            return producedResult;
        };
    }

    function gatherSeedInput(sourceItem, recursionDepth) {
        let collectedData = [],
            itemType = (typeof sourceItem)[0];
        if (recursionDepth && itemType === "o") {
            for (let propKey in sourceItem) {
                try { collectedData.push(gatherSeedInput(sourceItem[propKey], recursionDepth - 1)); } catch (error) { }
            }
        }
        return collectedData.length ? collectedData : itemType === "s" ? sourceItem : `${sourceItem}\0`;
    }

    function integrateSeed(inputString, targetArray) {
        let processedString = `${inputString}`,
            charIterator = 0,
            currentXor = 0;
        while (charIterator < processedString.length) {
            targetArray[(currentXor & (baseValue - 1))] = (currentXor ^ (19 * targetArray[(currentXor & (baseValue - 1))])) + processedString.charCodeAt(charIterator++);
            currentXor = targetArray[(currentXor & (baseValue - 1))];
        }
        return convertByteArrayToString(targetArray);
    }

    function obtainCryptoEntropy(buffer) {
        try {
            globalContext.crypto.getRandomValues(buffer = new Uint8Array(baseValue));
            return convertByteArrayToString(buffer);
        } catch (error) {
            return [+new Date(), globalContext, globalContext.navigator.plugins, globalContext.screen, convertByteArrayToString(initialEntropy)];
        }
    }

    function convertByteArrayToString(byteArray) {
        return String.fromCharCode.apply(0, byteArray);
    }

    const maxPowerA = mathUtility.pow(baseValue, exponentA);
    const maxPowerB = mathUtility.pow(2, exponentB);
    const doubleMaxPowerB = 2 * maxPowerB;

    mathUtility.seedrandom = (userProvidedSeed, useLegacySeed) => {
        let seedBuffer = [],
            finalSeedResult = integrateSeed(gatherSeedInput(useLegacySeed ? [userProvidedSeed, convertByteArrayToString(initialEntropy)] : (0 in arguments ? userProvidedSeed : obtainCryptoEntropy()), 3), seedBuffer),
            rngCore = new PsuedoRandomGenerator(seedBuffer);

        integrateSeed(convertByteArrayToString(rngCore.stateArray), initialEntropy);
        mathUtility.random = () => {
            let generatedVal = rngCore.produceValue(exponentA),
                denominator = maxPowerA,
                carryOver = 0;
            while (maxPowerB > generatedVal) {
                generatedVal = (generatedVal + carryOver) * baseValue;
                denominator *= baseValue;
                carryOver = rngCore.produceValue(1);
            }
            while (generatedVal >= doubleMaxPowerB) {
                generatedVal /= 2;
                denominator /= 2;
                carryOver >>>= 1;
            }
            return (generatedVal + carryOver) / denominator;
        };
        return finalSeedResult;
    };
    integrateSeed(mathUtility.random(), initialEntropy);
})(this, [], Math, 256, 6, 52);


// =====================================================================================
// CHRONOS ENGINE CORE
// =====================================================================================

const ChronosEngine = {}; // Central game state and logic container

ChronosEngine.startSystem = () => {
    ChronosEngine.isSystemInitialized = false;
    // Direct call to core initialization
    ChronosEngine.initializeCoreLogic();
};

ChronosEngine.initializeCoreLogic = () => {
    ChronosEngine.isSystemInitialized = true;
    const loadingMessageElement = queryNodeById('javascriptError');
    if (loadingMessageElement) {
        loadingMessageElement.innerHTML = `
            <div style="padding: 64px 128px;">
                <div class="title">Initializing Temporal Dynamics...</div>
            </div>`;
    }

    // =====================================================================================
    // CORE GAME STATE VARIABLES
    // =====================================================================================
    ChronosEngine.gameTickCount = 0;
    ChronosEngine.targetFramesPerSecond = 30; // Desired rendering/logic update rate

    ChronosEngine.softwareVersion = 1.036;

    const versionInfoDisplay = queryNodeById('versionNumber');
    if (versionInfoDisplay) {
        versionInfoDisplay.textContent = `v.${ChronosEngine.softwareVersion.toFixed(3)}`;
    }

    const navigationLinks = queryNodeById('links');
    if (navigationLinks) {
        navigationLinks.innerHTML = '<a href="http://orteil.dashnet.org/experiments/cookie/" target="_blank" rel="noopener noreferrer">Original Cookie Clicker Classic</a>';
    }

    // Timing and synchronization
    ChronosEngine.currentSystemTime = Date.now();
    ChronosEngine.lastFpsSampleTime = Date.now();
    ChronosEngine.accumulatedTimeLag = 0;
    ChronosEngine.synchronizationLogic = 0; // Mechanism for catching up on missed frames

    // Resource tracking and economy
    ChronosEngine.totalLifetimeResources = 0; // All resources ever generated
    ChronosEngine.currentResources = 0;      // Resources currently available
    ChronosEngine.displayedResources = 0;      // Resources shown on UI
    ChronosEngine.resourcesPerSecond = 1;    // Rate of resource generation
    ChronosEngine.resourcesSacrificed = 0;   // Resources lost from resets
    ChronosEngine.resourceBurstDuration = 0;      // Special production boost timer
    ChronosEngine.resourceBurstMultiplier = 1;    // Multiplier during resource burst
    ChronosEngine.clickBoostTimer = 0; // Mouse click multiplier timer
    ChronosEngine.mainButtonClickCount = 0;  // Clicks on the primary interaction element
    ChronosEngine.luckyEventClickCount = 0;   // Clicks on special, rare events
    ChronosEngine.missedLuckyEvents = 0;  // Count of special events not clicked
    ChronosEngine.manualResourceProduction = 0; // Resources from direct user clicks
    ChronosEngine.aestheticProgress = 0;      // Progression for visual elements (e.g., milk, 0-1: type A, 1-2: type B)
    ChronosEngine.aestheticLevel = 0;         // Calculated visual height (0-0.5)
    ChronosEngine.displayedAestheticLevel = 0;   // Displayed visual height
    ChronosEngine.aestheticVariantIndex = -1;  // Custom visual type index
    ChronosEngine.backdropVisualIndex = -1; // Custom background theme index
    ChronosEngine.legacySystemBenefits = [];       // Persistent bonuses across game resets

    // Ancient power mechanics
    ChronosEngine.ancientPowerLevel = 0;
    ChronosEngine.displayedAncientPower = 0;
    ChronosEngine.solemnPledgeCount = 0;
    ChronosEngine.solemnPledgeTimer = 0;
    ChronosEngine.researchCycleTime = 0;
    ChronosEngine.nextResearchId = 0;

    // Environmental visuals
    ChronosEngine.currentBackgroundVisual = '';
    ChronosEngine.backgroundTransitionState = '';
    ChronosEngine.backgroundTransitionRatio = 0;
    ChronosEngine.displayedTransitionRatio = 0;

    ChronosEngine.gameSessionStartTime = Date.now();
    ChronosEngine.lastSaveOperationTime = Date.now(); // Tracks last save activity

    ChronosEngine.developmentMode = false; // Toggle for debugging functionalities

    ChronosEngine.playerConfiguration = {};
    ChronosEngine.applyDefaultConfiguration = () => {
        ChronosEngine.playerConfiguration.enableParticles = 1;
        ChronosEngine.playerConfiguration.showNumbers = 1;
        ChronosEngine.playerConfiguration.autoSaveEnabled = 1;
        ChronosEngine.playerConfiguration.autoUpdateEnabled = 1;
        ChronosEngine.playerConfiguration.showAesthetics = 1;
        ChronosEngine.playerConfiguration.enhancedVisuals = 1; // Renamed from 'fancy'
    };
    ChronosEngine.applyDefaultConfiguration();

    // Utility for managing visual classes on the body or other main container
    ChronosEngine.updateVisualModeClass = (isEnhanced) => {
        const primaryContainer = document.body;
        if (primaryContainer) {
            if (isEnhanced) {
                primaryContainer.classList.remove('minimal-visuals'); // New class name
            } else {
                primaryContainer.classList.add('minimal-visuals');
            }
        }
    };

    // =====================================================================================
    // SOFTWARE UPDATE CHECK MECHANISM
    // =====================================================================================
    ChronosEngine.initiateSoftwareUpdateCheck = () => {
        fetch('server.php?q=checkupdate')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.text();
            })
            .then(ChronosEngine.handleUpdateCheckResponse)
            .catch(error => console.error('Error during software update check:', error));
    };

    ChronosEngine.handleUpdateCheckResponse = (apiResponseText) => {
        const responseSegments = apiResponseText.split('|');
        const availableSoftwareVersion = Number(responseSegments[0]);
        const releaseNotes = responseSegments[1];
        const notificationArea = queryNodeById('alert');

        if (availableSoftwareVersion > ChronosEngine.softwareVersion && notificationArea) {
            let updateMessage = `<b>A new software version is available: v.${availableSoftwareVersion.toFixed(3)}!</b>`;
            if (releaseNotes) updateMessage += `<br>Release notes: "${releaseNotes}"`;
            updateMessage += '<br><b>Please refresh your browser to get the latest version!</b>';
            notificationArea.innerHTML = updateMessage;
            notificationArea.style.display = 'block';
        }
    };

    // =====================================================================================
    // GAME STATE PERSISTENCE (SAVE)
    // =====================================================================================

    ChronosEngine.displayTemporaryMessage = (messageContent) => {
        const messageContainer = queryNodeById('gameNotificationArea'); // Assuming a new ID for notifications
        if (messageContainer) {
            messageContainer.innerHTML = messageContent;
            messageContainer.style.display = 'block';
            setTimeout(() => messageContainer.style.display = 'none', 3000); // Hide after 3 seconds
        } else {
            console.info(`Game Message: ${messageContent}`);
        }
    };

    ChronosEngine.exportCurrentState = () => {
        const savedDataString = ChronosEngine.serializeGameState(true);
        prompt('Copy this encrypted data to save your progress!', savedDataString);
    };

    ChronosEngine.importExistingState = () => {
        const inputData = prompt('Paste your saved data here:', '');
        if (inputData && inputData.trim() !== '') {
            ChronosEngine.deserializeGameState(inputData);
            ChronosEngine.serializeGameState(); // Auto-save after successful import
        }
    };

    // Generates a basic checksum for data integrity validation
    const computeDataChecksum = (payloadString) => {
        let hashValue = 0;
        for (let i = 0; i < payloadString.length; i++) {
            const charCode = payloadString.charCodeAt(i);
            hashValue = ((hashValue << 5) - hashValue) + charCode;
            hashValue |= 0; // Convert to 32-bit integer
        }
        return Math.abs(hashValue).toString(16); // Return hex string
    };

    ChronosEngine.serializeGameState = (isForExport = false) => {
        const stateSegments = [];

        // Segment 1: Version and core metadata
        stateSegments.push(
            ChronosEngine.softwareVersion.toFixed(3),
            '', // Reserved for future expansion
            ChronosEngine.gameSessionStartTime.toString()
        );

        // Segment 2: Player configuration flags
        const configFlags = [
            ChronosEngine.playerConfiguration.enableParticles,
            ChronosEngine.playerConfiguration.showNumbers,
            ChronosEngine.playerConfiguration.autoSaveEnabled,
            ChronosEngine.playerConfiguration.autoUpdateEnabled,
            ChronosEngine.playerConfiguration.showAesthetics,
            ChronosEngine.playerConfiguration.enhancedVisuals
        ].map(setting => setting ? '1' : '0').join('');
        stateSegments.push(configFlags);

        // Segment 3: Primary game statistics
        const mainStats = [
            Math.trunc(ChronosEngine.currentResources),
            Math.trunc(ChronosEngine.totalLifetimeResources),
            Math.trunc(ChronosEngine.mainButtonClickCount),
            Math.trunc(ChronosEngine.luckyEventClickCount),
            Math.trunc(ChronosEngine.manualResourceProduction),
            Math.trunc(ChronosEngine.missedLuckyEvents),
            Math.trunc(ChronosEngine.backdropVisualIndex),
            Math.trunc(ChronosEngine.aestheticVariantIndex),
            Math.trunc(ChronosEngine.resourcesSacrificed),
            Math.trunc(ChronosEngine.ancientPowerLevel),
            Math.trunc(ChronosEngine.solemnPledgeCount),
            Math.trunc(ChronosEngine.solemnPledgeTimer),
            Math.trunc(ChronosEngine.nextResearchId),
            Math.trunc(ChronosEngine.researchCycleTime)
        ].join(';');
        stateSegments.push(mainStats);

        // Segment 4: Building/Structure data
        const structureData = [];
        for (const structureKey in ChronosEngine.StructureRegistry) {
            const structure = ChronosEngine.StructureRegistry[structureKey];
            structureData.push([
                structure.quantity, // Renamed 'amount' to 'quantity'
                structure.purchasedCount, // Renamed 'bought' to 'purchasedCount'
                Math.trunc(structure.accumulatedResources), // Renamed 'totalCookies' to 'accumulatedResources'
                structure.specialFeatureUnlocked // Renamed 'specialUnlocked'
            ].join(','));
        }
        stateSegments.push(structureData.join(';'));

        // Segment 5: Enhancements (Upgrades) - Binary compressed
        const enhancementFlags = [];
        for (const upgradeKey in ChronosEngine.EnhancementRegistry) {
            const upgrade = ChronosEngine.EnhancementRegistry[upgradeKey];
            enhancementFlags.push(Number(upgrade.isUnlocked), Number(upgrade.isPurchased)); // Renamed 'unlocked'/'bought'
        }
        stateSegments.push(serializeLongBinarySequence(enhancementFlags));

        // Segment 6: Milestones (Achievements) - Binary compressed
        const milestoneFlags = [];
        for (const achievementKey in ChronosEngine.MilestoneRegistry) {
            const achievement = ChronosEngine.MilestoneRegistry[achievementKey];
            milestoneFlags.push(Number(achievement.isAchieved)); // Renamed 'won'
        }
        stateSegments.push(serializeLongBinarySequence(milestoneFlags));

        let compositeSaveString = stateSegments.join('|');
        const generatedChecksum = computeDataChecksum(compositeSaveString);
        compositeSaveString += `|${generatedChecksum}`; // Append checksum for validation

        if (isForExport) {
            return convertUtf8ToBase64(compositeSaveString + '!CHRONOS_SAVE_END!');
        } else {
            const expirationDate = new Date();
            expirationDate.setFullYear(expirationDate.getFullYear() + 5);
            const cookieContent = convertUtf8ToBase64(compositeSaveString + '!CHRONOS_SAVE_END!');
            document.cookie = `ChronosGameState=${cookieContent}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax;`;
            ChronosEngine.lastSaveOperationTime = Date.now();
            if (document.cookie.indexOf('ChronosGameState') < 0) {
                ChronosEngine.displayTemporaryMessage('Save failed: Browser cookies might be full or disabled. Please use the export option!');
            } else {
                ChronosEngine.displayTemporaryMessage('Game progress successfully recorded.');
            }
        }
    };

    // =====================================================================================
    // GAME STATE PERSISTENCE (LOAD)
    // =====================================================================================
    ChronosEngine.deserializeGameState = (incomingData) => {
        let rawEncodedData = '';
        if (incomingData) {
            rawEncodedData = incomingData;
        } else {
            const cookieMatch = document.cookie.match(/ChronosGameState=([^;]+)/);
            if (cookieMatch && cookieMatch[1]) {
                rawEncodedData = cookieMatch[1];
            }
        }

        if (rawEncodedData === '') {
            console.log('No game state found to load.');
            return;
        }

        let decodedPayload = '';
        try {
            decodedPayload = convertBase64ToUtf8(rawEncodedData.split('!CHRONOS_SAVE_END!')[0]);
        } catch (e) {
            ChronosEngine.displayTemporaryMessage('Error: Corrupted save data detected during decoding.');
            console.error('Save data decoding failure:', e);
            return;
        }

        if (!decodedPayload) {
            ChronosEngine.displayTemporaryMessage('Decoded save data is empty. Load operation aborted.');
            return;
        }

        const dataSegments = decodedPayload.split('|');
        const receivedChecksum = dataSegments.pop(); // Checksum is the last segment
        const dataWithoutChecksum = dataSegments.join('|');
        const calculatedChecksum = computeDataChecksum(dataWithoutChecksum);

        if (receivedChecksum !== calculatedChecksum) {
            ChronosEngine.displayTemporaryMessage('Warning: Save data checksum mismatch! Data might be corrupted. Loading anyway.');
            console.warn('Checksum discrepancy detected:', { received: receivedChecksum, calculated: calculatedChecksum });
            // Proceed to load, but with a warning, as per Type III definition
        }

        const saveFileVersion = Number(dataSegments[0]);
        if (saveFileVersion > ChronosEngine.softwareVersion) {
            alert(`Load Error: This save file (v.${saveFileVersion.toFixed(3)}) is from a newer software version than yours (v.${ChronosEngine.softwareVersion.toFixed(3)}). Please update your software.`);
            return;
        }

        try {
            // Parse Segment 1: Metadata
            ChronosEngine.gameSessionStartTime = Number(dataSegments[2]);

            // Parse Segment 2: Player Configuration
            const configString = dataSegments[3];
            ChronosEngine.playerConfiguration.enableParticles = Number(configString[0]);
            ChronosEngine.playerConfiguration.showNumbers = Number(configString[1]);
            ChronosEngine.playerConfiguration.autoSaveEnabled = Number(configString[2]);
            ChronosEngine.playerConfiguration.autoUpdateEnabled = configString[3] ? Number(configString[3]) : 1;
            ChronosEngine.playerConfiguration.showAesthetics = configString[4] ? Number(configString[4]) : 1;
            ChronosEngine.playerConfiguration.enhancedVisuals = configString[5] ? Number(configString[5]) : 1;
            ChronosEngine.updateVisualModeClass(ChronosEngine.playerConfiguration.enhancedVisuals);

            // Parse Segment 3: Primary Game Statistics
            const mainStatsArray = dataSegments[4].split(';');
            ChronosEngine.currentResources = Number(mainStatsArray[0]);
            ChronosEngine.totalLifetimeResources = Number(mainStatsArray[1]);
            ChronosEngine.mainButtonClickCount = Number(mainStatsArray[2] || 0);
            ChronosEngine.luckyEventClickCount = Number(mainStatsArray[3] || 0);
            ChronosEngine.manualResourceProduction = Number(mainStatsArray[4] || 0);
            ChronosEngine.missedLuckyEvents = Number(mainStatsArray[5] || 0);
            ChronosEngine.backdropVisualIndex = Number(mainStatsArray[6] || 0);
            ChronosEngine.aestheticVariantIndex = Number(mainStatsArray[7] || 0);
            ChronosEngine.resourcesSacrificed = Number(mainStatsArray[8] || 0);
            ChronosEngine.ancientPowerLevel = Number(mainStatsArray[9] || 0);
            ChronosEngine.solemnPledgeCount = Number(mainStatsArray[10] || 0);
            ChronosEngine.solemnPledgeTimer = Number(mainStatsArray[11] || 0);
            ChronosEngine.nextResearchId = Number(mainStatsArray[12] || 0);
            ChronosEngine.researchCycleTime = Number(mainStatsArray[13] || 0);

            // Parse Segment 4: Building/Structure Data
            const loadedStructureParts = dataSegments[5].split(';');
            ChronosEngine.totalStructuresOwned = 0;
            for (const key in ChronosEngine.StructureRegistry) {
                const structure = ChronosEngine.StructureRegistry[key];
                const structureIndex = structure.id; // Assume structures have an 'id' property matching save index
                if (loadedStructureParts[structureIndex]) {
                    const [quantity, purchasedCount, accumulatedResources, specialFeatureUnlocked] = loadedStructureParts[structureIndex].split(',').map(Number);
                    structure.quantity = quantity;
                    structure.purchasedCount = purchasedCount;
                    structure.accumulatedResources = accumulatedResources;
                    structure.specialFeatureUnlocked = specialFeatureUnlocked;
                    ChronosEngine.totalStructuresOwned += quantity;
                } else {
                    Object.assign(structure, { quantity: 0, purchasedCount: 0, accumulatedResources: 0, specialFeatureUnlocked: 0 });
                }
            }

            // Parse Segment 5 & 6: Enhancements and Milestones (handling legacy save formats)
            if (saveFileVersion < 1.035) {
                // Older non-binary compression format
                const legacyEnhancements = dataSegments[6].split(';');
                ChronosEngine.activeEnhancementsCount = 0;
                for (const key in ChronosEngine.EnhancementRegistry) {
                    const upgrade = ChronosEngine.EnhancementRegistry[key];
                    const upgradeIndex = upgrade.id;
                    if (legacyEnhancements[upgradeIndex]) {
                        const [isUnlocked, isPurchased] = legacyEnhancements[upgradeIndex].split(',').map(Number);
                        upgrade.isUnlocked = isUnlocked;
                        upgrade.isPurchased = isPurchased;
                        if (isPurchased) ChronosEngine.activeEnhancementsCount++;
                    } else {
                        Object.assign(upgrade, { isUnlocked: 0, isPurchased: 0 });
                    }
                }

                const legacyMilestones = dataSegments[7] ? dataSegments[7].split(';') : [];
                ChronosEngine.completedMilestonesCount = 0;
                for (const key in ChronosEngine.MilestoneRegistry) {
                    const achievement = ChronosEngine.MilestoneRegistry[key];
                    const achievementIndex = achievement.id;
                    if (legacyMilestones[achievementIndex]) {
                        achievement.isAchieved = Number(legacyMilestones[achievementIndex].split(',')[0]);
                    } else {
                        achievement.isAchieved = 0;
                    }
                    if (achievement.isAchieved && achievement.visibility !== 3) ChronosEngine.completedMilestonesCount++; // Renamed 'hide' to 'visibility'
                }
            } else {
                // Modern binary compressed format
                const compressedEnhancements = deserializeLongBinarySequence(dataSegments[6]);
                ChronosEngine.activeEnhancementsCount = 0;
                for (const key in ChronosEngine.EnhancementRegistry) {
                    const upgrade = ChronosEngine.EnhancementRegistry[key];
                    const upgradeIndex = upgrade.id;
                    if (compressedEnhancements[upgradeIndex * 2] !== undefined) {
                        upgrade.isUnlocked = compressedEnhancements[upgradeIndex * 2];
                        upgrade.isPurchased = compressedEnhancements[upgradeIndex * 2 + 1];
                        if (upgrade.isPurchased) ChronosEngine.activeEnhancementsCount++;
                    } else {
                        Object.assign(upgrade, { isUnlocked: 0, isPurchased: 0 });
                    }
                }

                const compressedMilestones = deserializeLongBinarySequence(dataSegments[7]);
                ChronosEngine.completedMilestonesCount = 0;
                for (const key in ChronosEngine.MilestoneRegistry) {
                    const achievement = ChronosEngine.MilestoneRegistry[key];
                    const achievementIndex = achievement.id;
                    if (compressedMilestones[achievementIndex] !== undefined) {
                        achievement.isAchieved = compressedMilestones[achievementIndex];
                    } else {
                        achievement.isAchieved = 0;
                    }
                    if (achievement.isAchieved && achievement.visibility !== 3) ChronosEngine.completedMilestonesCount++;
                }
            }

            // Post-load processing for structures
            for (const key in ChronosEngine.StructureRegistry) {
                const structure = ChronosEngine.StructureRegistry[key];
                if (structure.onPurchaseEffect) structure.onPurchaseEffect(); // Renamed from buyFunction/buyEffect
                structure.activateSpecialFeature(0); // Renamed from setSpecial/activateSpecial
                if (structure.hasUniqueAbility) structure.hasUniqueAbility(); // Renamed from special/specialAbility
                structure.refreshVisuals(); // Renamed from refresh/updateDisplay
            }

            ChronosEngine.displayTemporaryMessage('Game state successfully restored.');
            console.log('Game state loaded and initialized.');
        } catch (e) {
            ChronosEngine.displayTemporaryMessage('A critical error occurred while parsing save data. The save file might be severely malformed.');
            console.error('Failure during save data parsing:', e);
        }
    };
};

// --- DUMMY REGISTRIES (These would be populated by actual game content) ---
// These are included to ensure the save/load logic has valid objects to iterate over.

ChronosEngine.StructureRegistry = {
    'TemporalManipulator': { id: 0, quantity: 0, purchasedCount: 0, accumulatedResources: 0, specialFeatureUnlocked: 0, onPurchaseEffect: () => {}, activateSpecialFeature: () => {}, hasUniqueAbility: () => {}, refreshVisuals: () => {} },
    'QuantumConveyor': { id: 1, quantity: 0, purchasedCount: 0, accumulatedResources: 0, specialFeatureUnlocked: 0, onPurchaseEffect: () => {}, activateSpecialFeature: () => {}, hasUniqueAbility: () => {}, refreshVisuals: () => {} }
};
ChronosEngine.StructureById = Object.values(ChronosEngine.StructureRegistry);

ChronosEngine.EnhancementRegistry = {
    'FluxCapacitor': { id: 0, isUnlocked: 0, isPurchased: 0 },
    'ChronitonBooster': { id: 1, isUnlocked: 0, isPurchased: 0 }
};
ChronosEngine.EnhancementById = Object.values(ChronosEngine.EnhancementRegistry);

ChronosEngine.MilestoneRegistry = {
    'TemporalArchitect': { id: 0, isAchieved: 0, visibility: 0 },
    'CosmicHarvest': { id: 1, isAchieved: 0, visibility: 0 }
};
ChronosEngine.MilestoneById = Object.values(ChronosEngine.MilestoneRegistry);

// Example of how the system would be launched (e.g., on page load)
// window.addEventListener('load', ChronosEngine.startSystem);