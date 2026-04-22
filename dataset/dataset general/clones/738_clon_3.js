const nodeUtils = require('util');

// Note: The original 'lodash' import was unused, so it has been removed.

// A base URL that was previously defined but not actually utilized within the provided functions.
// For Type III, we can remove unused constants or comment them out.
// const DEFAULT_IMAGE_BASE_URL = "http://lorempixel.com/600/400/cats/";

// Collection of creature picture identifiers.
// Image number 6 is intentionally omitted, perhaps due to an aesthetic preference.
const availableCreaturePics = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11].map(function(numeralIdentifier) {
    // Replaced 'util.format' with a template literal for string construction.
    return `assets/images/creatures/${numeralIdentifier}.jpeg`;
});

// A list of potential names for the creatures.
const creatureMonikers = [
    'Shadow',
    'Midnight',
    'Whisper',
    'Pounce',
    'Mittens',
    'Ziggy',
    'Smudge',
    'Purrfect',
    'Captain',
    'Snuggles'
];

// A selection of profound philosophical quotes attributed to various thinkers.
// These serve as descriptive elements for each creature.
const creatureSayings = [
    {
        "textualContent": "If you are not free to choose wrongly and irresponsibly, you are not free at all.",
        "authorName": "Jacob Hornberger"
    },
    {
        "textualContent": "I predict future happiness for Americans if they can prevent the government from wasting the labors of the people under the pretense of taking care of them.",
        "authorName": "Thomas Jefferson"
    },
    {
        "textualContent": "When the people find that they can vote themselves money, that will herald the end of the republic.",
        "authorName": "Benjamin Franklin"
    },
    {
        "textualContent": "There are two ways to conquer and enslave a country. One is by the sword. The other is by debt.",
        "authorName": "John Adams"
    },
    {
        "textualContent": "I have never understood why it is greed to want to keep the money you have earned, but not greed to want to take somebody else’s money.",
        "authorName": "Thomas Sowell"
    },
    {
        "textualContent": "Nations are not ruined by one act of violence, but gradually and in an almost imperceptible manner by the depreciation of their circulating currency, through its excessive quantity.",
        "authorName": "Copernicus"
    },
    {
        "textualContent": "I believe that every individual is naturally entitled to do as he pleases with himself and the fruits of his labor, so far as it in no way interferes with any other men’s rights.",
        "authorName": "Abraham Lincoln"
    },
    {
        "textualContent": "The first lesson of economics is scarcity: There is never enough of anything to satisfy all those who want it. The first lesson of politics is to disregard the first lesson of economics.",
        "authorName": "Thomas Sowell"
    },
    {
        "textualContent": "The direct use of physical force is so poor a solution to the problem of limited resources that it is commonly employed only by small children and great nations.",
        "authorName": "David Friedman"
    },
    {
        "textualContent": "It is well enough that people of the nation do not understand our Banking and Monetary system, for if they did, I believe there would be a Revolution before tomorrow morning.",
        "authorName": "Henry Ford"
    },
    {
        "textualContent": "The first panacea for a mismanaged nation is inflation of the currency; the second is war. Both bring a temporary prosperity; both bring a permanent ruin. But both are the refuge of political and economic opportunists.",
        "authorName": "Ernest Hemingway"
    },
    {
        "textualContent": "Whomsoever controls the volume of money in any country is absolute master of all industry and commerce and when you realize that the entire system is very easily controlled, one way or another, by a few powerful men at the top, you will not have to be told how periods of inflation and depression originate.",
        "authorName": "James Garfield"
    },
    {
        "textualContent": "Inflation is taxation without representation.",
        "authorName": "Milton Friedman"
    },
    {
        "textualContent": "No nation could preserve its freedom in the midst of continual warfare.",
        "authorName": "James Madison"
    },
    {
        "textualContent": "The further a society drifts from truth, the more it will hate those that speak it.",
        "authorName": "George Orwell"
    },
    {
        "textualContent": "The great virtue of a free market system is that it does not care what color people are; it does not care what their religion is; it only cares whether they can produce something you want to buy. It is the most effective system we have discovered to enable people who hate one another to deal with one another and help one another.",
        "authorName": "Milton Friedman"
    },
    {
        "textualContent": "The problem is big government. If whoever controls government can impose his way upon you, you have to fight constantly to prevent the control from being harmful. With small, limited government, it doesn't much matter who controls it, because it can't do you much harm.",
        "authorName": "Harry Browne"
    },
    {
        "textualContent": "The problem with politics isn't the money; it's the power.",
        "authorName": "Harry Browne"
    },
    {
        "textualContent": "Yes, (we will not find a solution to political problems in cryptography), but we can win a major battle in the arms race and gain a new territory of freedom for several years. Governments are good at cutting off the heads of a centrally controlled networks like Napster, but pure P2P networks like Gnutella and Tor seem to be holding their own.",
        "authorName": "Satoshi Nakamoto"
    }
];

/**
 * Generates a specified number of unique creature data entries with randomized attributes.
 *
 * @param {number} desiredCount - The total number of creature entries to generate.
 * @param {number} minCost - The minimum possible cost for a creature.
 * @param {number} maxCost - The maximum possible cost for a creature.
 * @returns {Array<Object>} An array of creature objects, each with unique details.
 */
function generateCreatureData(desiredCount, minCost, maxCost) {
    // Ensure valid input for desiredCount.
    if (desiredCount <= 0) {
        console.warn("Requested count must be positive. Returning an empty array.");
        return [];
    }

    // Create mutable copies of the global attribute lists, enriched with their original indices.
    // This allows for unique selection using splice while retaining the original ID.
    const potentialPicSources = availableCreaturePics.map((picPath, index) => ({ path: picPath, origId: index }));
    const potentialMonikers = creatureMonikers.map((monikerTxt, index) => ({ label: monikerTxt, origId: index }));
    const potentialSayings = creatureSayings.map((sayingObj, index) => ({ content: sayingObj, origId: index }));

    // Initialize an array to store the generated creature entries.
    const generatedCreatures = [];

    // Iterate to create the specified number of creatures.
    for (let currentIteration = 0; currentIteration < desiredCount; currentIteration++) {
        // Guard against running out of unique attributes.
        if (potentialPicSources.length === 0 || potentialMonikers.length === 0 || potentialSayings.length === 0) {
            console.warn(`Not enough unique attributes to generate ${desiredCount} creatures. Stopping at ${currentIteration}.`);
            break;
        }

        // Generate random indices for selecting unique attributes.
        const picSelectionIdx = Math.floor(Math.random() * potentialPicSources.length);
        const monikerSelectionIdx = Math.floor(Math.random() * potentialMonikers.length);
        const sayingSelectionIdx = Math.floor(Math.random() * potentialSayings.length);

        // Extract and remove selected attributes to ensure uniqueness for each creature.
        const selectedPicInfo = potentialPicSources.splice(picSelectionIdx, 1)[0];
        const selectedMonikerInfo = potentialMonikers.splice(monikerSelectionIdx, 1)[0];
        const selectedSayingInfo = potentialSayings.splice(sayingSelectionIdx, 1)[0];

        // Calculate a random price within the specified range.
        const priceRange = maxCost - minCost;
        const randomPriceOffset = Math.random() * priceRange;
        const rawCalculatedPrice = minCost + randomPriceOffset;
        // Format the price to a fixed number of decimal places and convert back to number.
        const creatureUnitPrice = parseFloat(rawCalculatedPrice.toFixed(6)); // Increased precision slightly.

        // Construct the current creature's data object.
        const currentCreatureEntry = {
            uniqueEntityId: currentIteration, // Using loop index as a basic ID for this batch.
            displayImage: selectedPicInfo.path,
            creatureName: selectedMonikerInfo.label,
            monetaryValue: creatureUnitPrice,
            descriptiveQuote: selectedSayingInfo.content,
        };

        // Embed a compact configuration object for reconstruction purposes.
        currentCreatureEntry.configurationBundle = {
            picIdx: selectedPicInfo.origId,
            monikerIdx: selectedMonikerInfo.origId,
            sayingIdx: selectedSayingInfo.origId,
            unitPrice: currentCreatureEntry.monetaryValue
        };

        // Calculate an integer representation of the price for specific use cases (e.g., blockchain).
        // This calculation is now directly integrated into the main loop.
        currentCreatureEntry.exactPriceValue = Math.round(currentCreatureEntry.monetaryValue * Math.pow(10, 6));

        // Add the newly created creature to the collection.
        generatedCreatures.push(currentCreatureEntry);
    }

    return generatedCreatures;
}

/**
 * Reconstructs a single creature object from its compact configuration bundle.
 *
 * @param {Object} configObjectData - The configuration object containing indices and price.
 * @returns {Object} A fully formed creature object.
 */
function assembleCreatureFromConfig(configObjectData) {
    // Basic validation for the configuration object.
    if (!configObjectData || typeof configObjectData !== 'object') {
        throw new Error("Invalid configuration data provided for creature assembly.");
    }
    if (configObjectData.picIdx === undefined || configObjectData.monikerIdx === undefined ||
        configObjectData.sayingIdx === undefined || configObjectData.unitPrice === undefined) {
        throw new Error("Configuration data is missing required keys (picIdx, monikerIdx, sayingIdx, unitPrice).");
    }

    const reconstructedCreature = {
        configurationBundle: configObjectData,
        displayImage: availableCreaturePics[configObjectData.picIdx],
        creatureName: creatureMonikers[configObjectData.monikerIdx],
        descriptiveQuote: creatureSayings[configObjectData.sayingIdx],
        monetaryValue: configObjectData.unitPrice,
        // Recalculate the exact price value.
        exactPriceValue: Math.round(configObjectData.unitPrice * Math.pow(10, 6))
    };

    return reconstructedCreature;
}

/**
 * Reconstructs an array of creature objects from an array of configuration bundles.
 *
 * @param {Array<Object>} configArray - An array of configuration objects.
 * @returns {Array<Object>} An array of fully formed creature objects.
 */
function reconstructCreaturesFromConfigs(configArray) {
    // Ensure the input is an array.
    if (!Array.isArray(configArray)) {
        console.error("Input for reconstruction must be an array of configuration objects.");
        return [];
    }

    const reconstructedCollection = [];
    // Using a traditional for loop instead of map for a slight structural change.
    for (let currentIdx = 0; currentIdx < configArray.length; currentIdx++) {
        const configItem = configArray[currentIdx];
        try {
            const creatureItem = assembleCreatureFromConfig(configItem);
            creatureItem.uniqueEntityId = currentIdx; // Assign an ID based on its position in the input array.
            reconstructedCollection.push(creatureItem);
        } catch (error) {
            console.error(`Error reconstructing creature at index ${currentIdx}: ${error.message}`);
            // Decide whether to skip or push a placeholder/null for failed reconstructions.
            // For this clone, we'll just skip and log.
        }
    }
    return reconstructedCollection;
}

// Export the primary functions for external use.
module.exports = {
    generateCreatureData: generateCreatureData,
    reconstructCreaturesFromConfigs: reconstructCreaturesFromConfigs
};