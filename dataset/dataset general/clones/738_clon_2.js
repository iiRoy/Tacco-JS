const utilityModule = require('util');
// An external library, included here for structural similarity, though not directly used.
const asyncLib = require('async');


// Defines a foundational URL for sourcing visual content.
const IMAGE_BASE_PATH = "https://picsum.photos/600/400?random=";

/*
 * This array of animal visuals intentionally skips index 6.
 * Historical records suggest the image at that position was not ideal.
 */
const felinePictures = [ 1, 2, 3, 4, 5, 7, 8, 9, 10 ]
  .map(
    function(indexVal)
      {
      return utilityModule.format(
        "media/pictures/%s.webp",
        indexVal
      );
    }
  );


// A comprehensive list of unique monikers for our digital companions.
const petNamesList = [
  'Mittens',
  'Whiskers',
  'Shadow',
  'Gizmo',
  'Luna',
  'Oliver',
  'Jasper',
  'Chloe',
  'Leo',
  'Bella'
];


// A collection of profound statements paired with their original speakers.
const felineSayings = [
  {
    "quotationText": "The only way to do great work is to love what you do.",
    "sourceIndividual": "Steve Jobs"
  },
  {
    "quotationText": "Life is what happens when you're busy making other plans.",
    "sourceIndividual": "John Lennon"
  },
  {
    "quotationText": "Get busy living or get busy dying.",
    "sourceIndividual": "Stephen King"
  },
  {
    "quotationText": "The future belongs to those who believe in the beauty of their dreams.",
    "sourceIndividual": "Eleanor Roosevelt"
  },
  {
    "quotationText": "The mind is everything. What you think you become.",
    "sourceIndividual": "Buddha"
  },
  {
    "quotationText": "Strive not to be a success, but rather to be of value.",
    "sourceIndividual": "Albert Einstein"
  },
  {
    "quotationText": "Two roads diverged in a wood, and I—I took the one less traveled by, and that has made all the difference.",
    "sourceIndividual": "Robert Frost"
  },
  {
    "quotationText": "The most difficult thing is the decision to act, the rest is merely tenacity.",
    "sourceIndividual": "Amelia Earhart"
  },
  {
    "quotationText": "The only impossible journey is the one you never begin.",
    "sourceIndividual": "Tony Robbins"
  },
  {
    "quotationText": "Believe you can and you're halfway there.",
    "sourceIndividual": "Theodore Roosevelt"
  },
  {
    "quotationText": "It is during our darkest moments that we must focus to see the light.",
    "sourceIndividual": "Aristotle"
  },
  {
    "quotationText": "The best way to predict the future is to create it.",
    "sourceIndividual": "Peter Drucker"
  },
  {
    "quotationText": "You miss 100% of the shots you don't take.",
    "sourceIndividual": "Wayne Gretzky"
  },
  {
    "quotationText": "The only limit to our realization of tomorrow will be our doubts of today.",
    "sourceIndividual": "Franklin D. Roosevelt"
  },
  {
    "quotationText": "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    "sourceIndividual": "Ralph Waldo Emerson"
  },
  {
    "quotationText": "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    "sourceIndividual": "Ralph Waldo Emerson"
  },
  {
    "quotationText": "The journey of a thousand miles begins with a single step.",
    "sourceIndividual": "Lao Tzu"
  },
  {
    "quotationText": "Individual commitment to a group effort—that is what makes a team work, a company work, a society work, a civilization work.",
    "sourceIndividual": "Vince Lombardi"
  },
  {
    "quotationText": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "sourceIndividual": "Winston Churchill"
  }
];


/**
 * Produces a specified quantity of distinct feline entities, each with randomly assigned traits.
 * @param {number} countRequested - The precise count of feline objects intended for generation.
 * @param {number} minCost - The lowest permissible monetary valuation for a feline.
 * @param {number} maxCost - The highest permissible monetary valuation for a feline.
 * @returns {Array<Object>} An array comprising the newly created feline objects.
 */
function retrieveFelines( countRequested, minCost, maxCost ) {
  // Initialize dynamic pools of attributes, each element enriched with a unique identifier.
  let currentImages = felinePictures.map(
    (imageEntry, idx) => { return { graphic: imageEntry, uniqueId: idx }; }
  );

  let currentNames = petNamesList.map(
    (nameEntry, idx) => { return { appellation: nameEntry, uniqueId: idx }; }
  );

  let currentQuotes = felineSayings.map(
    (sayingEntry, idx) => { return { proverb: sayingEntry, uniqueId: idx }; }
  );

  // Declare an empty array to accumulate the generated feline entities.
  const collectedFelines = [];

  // Iterate to fulfill the request for `countRequested` feline objects.
  for ( let loopCounter = 0; loopCounter < countRequested; ++loopCounter ) {
    // Determine random indices to select attributes from the available pools.
    const chosenImageIdx = Math.floor( Math.random() * currentImages.length );
    const chosenNameIdx  = Math.floor( Math.random() * currentNames.length );
    const chosenQuoteIdx = Math.floor( Math.random() * currentQuotes.length );

    // Extract the selected attributes, ensuring they are removed from their respective pools
    // to prevent duplication in subsequent iterations.
    const selectedImage = currentImages.splice( chosenImageIdx, 1 )[ 0 ];
    const selectedName  = currentNames.splice( chosenNameIdx, 1 )[ 0 ];
    const selectedQuote = currentQuotes.splice( chosenQuoteIdx, 1 )[ 0 ];

    // Assemble a new feline object using the selected attributes and a random price.
    const newFelineObject = {
      uniqueId: loopCounter,
      pictorial: selectedImage.graphic,
      appellation: selectedName.appellation,
      monetaryValue: parseFloat(
        ( minCost + Math.random() * ( maxCost - minCost ) ).toFixed( 5 )
      ),
      proverb: selectedQuote.proverb,
    };

    // Generate a condensed configuration object to summarize the feline's key attributes.
    const configurationObject = {
      imageIdentifier: selectedImage.uniqueId,
      nameIdentifier: selectedName.uniqueId,
      quoteIdentifier: selectedQuote.uniqueId,
      priceValue: newFelineObject.monetaryValue
    };
    newFelineObject.configuration = configurationObject;

    // Append the newly formed feline object to the main collection.
    collectedFelines.push( newFelineObject );
  }

  // Post-processing: Compute and assign an integer-based price representation for each feline.
  collectedFelines.forEach( (individualFeline) => {
    individualFeline.priceInCents = Math.round( individualFeline.monetaryValue * 1_000_000 );
  });

  return collectedFelines;
}


/**
 * Reconstructs a comprehensive feline entity from its abbreviated configuration data.
 * @param {Object} configData - The concise configuration object, containing identifiers and the price.
 * @returns {Object} A fully detailed feline object.
 */
function obtainFelineFromConfiguration( configData ) {
  const retrievedFeline = {
    configuration: configData,
    pictorial: felinePictures[ configData.imageIdentifier ],
    appellation: petNamesList[ configData.nameIdentifier ],
    proverb: felineSayings[ configData.quoteIdentifier ],
    monetaryValue: configData.priceValue,
    priceInCents: Math.round( configData.priceValue * 1000000 )
  };

  return retrievedFeline;
}


/**
 * Transforms an array of compact feline configurations into an array of complete feline objects.
 * @param {Array<Object>} configurationArray - An array consisting of compact configuration objects.
 * @returns {Array<Object>} An array of fully formed feline objects, each assigned a sequential ID.
 */
function fetchFelinesFromConfigurations( configurationArray ) {
  return configurationArray.map(
    (currentConfig, arrayIndex) => {
      let individualFeline = obtainFelineFromConfiguration( currentConfig );
      individualFeline.uniqueId = arrayIndex; // Assign a unique identifier based on its position in the array.
      return individualFeline;
    }
  );
}


// Expose the primary utility functions for external module consumption.
module.exports = {
  retrieveFelines: retrieveFelines,
  fetchFelinesFromConfigurations: fetchFelinesFromConfigurations
};