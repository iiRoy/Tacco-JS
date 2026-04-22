/**
 *
 * JQuery plugin to lay out and render a word cloud using the Canvas HTML5 element.
 * See http://github.com/petewarden/openwordcloud for details.
 *
 * Copyright (C) 2010 Pete Warden <pete@petewarden.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * All functional code remains precisely the same.
 */

(function($) {

 $.fn.OpenWordCloud = function(targetSelector)
 {
  // Constructor for the OpenWordCloud instance.
  // Initializes core properties and checks for Canvas support.
  this.__construct__ = function(targetSelector) {

   // Get the dimensions of the target element.
   this.width = $(targetSelector).width();
   this.height = $(targetSelector).height();

   // Check for HTML5 Canvas support.
   // See http://diveintohtml5.org/detect.html#canvas for details on this check.
   var hasCanvas = !!document.createElement('canvas').getContext;
   
   // If Canvas is not supported, display an error message and exit.
   if (!hasCanvas)
   {
    $(targetSelector).html('<br><br><center>This site requires HTML5/Canvas support, available in Firefox, Safari and Chrome</center>');
    return;
   }
  
   // Create the main canvas element for drawing.
   this.canvas = this.createCanvas(this.width, this.height);
   
   // Clear the target selector and append the newly created canvas.
   $(targetSelector)
    .empty() // Remove existing content.
    .append(this.canvas); // Add the canvas.

   // Store a reference to 'this' for use in callbacks.
   var myThis = this;

   // Set up a heartbeat timer to trigger drawing updates.
   this.timer = setInterval(function() { myThis.heartbeat(); }, 500);
   
   // Default settings for the word cloud generation and display.
   this.settings = {
    'backgroundColor': '#ffffff', // Background color of the canvas.
    'textColor': '#000000', // Default text color.
    'font': 'Baskerville, Times New Roman, Serif', // Font stack for words.
    'smallestTextSize': 16, // Minimum font size for words.
    'largestTextSize': 64, // Maximum font size for words.
    'spacing': 1, // Spacing between words (not directly used here, but in other functions).
    'rotationType': 'random', // Type of word rotation ('random', 'horizontal', etc.).
    'shapeImage': 'none', // Image to use as a mask for the word cloud shape.
    'maxIterations': 1500, // Maximum attempts to place a word.
    'minDistance': 2, // Minimum distance for 'outwards' search walk.
    'maxDistance': 4, // Maximum distance for 'outwards' search walk.
    'sortBySize': true, // Whether to sort words by size before placing.
    'shapeText': "SHAPE\nTEXT", // Text to use if shapeImage is 'text'.
    'searchWalk': 'spiral', // Strategy for searching for word placement ('random', 'outwards', 'spiral').
    'angleChange': (Math.PI / 40), // Angle increment for spiral search.
    'isPaused': false, // Flag to pause the drawing process.
    'isStopped': false, // Flag to stop the drawing process permanently.
    'failedTimeBeforeStopping': 2 * 60 * 1000, // Time in ms after which generation stops if no words are placed.
    'hdScale': 2 // High-definition scaling factor for internal canvases.
   };
                
   // Arrays and canvases for internal state and rendering.
   this.words = []; // Array to hold word data.
   // Canvas to store already placed words.
   this.existingWords = this.createCanvas(this.width, this.height);
   // High-definition canvas for more precise collision detection.
   this.existingWordsHD = this.createCanvas((this.width * this.settings.hdScale), (this.height * this.settings.hdScale));
   // Mask canvas for shape detection.
   this.existingWordsMask = this.createCanvas(this.width, this.height);
   this.newWordMask = this.createCanvas(this.width, this.height); // Mask for the current word being placed.
   this.testMask = this.createCanvas(this.width, this.height); // Temporary mask for collision testing.
   this.existingWordsPixels = null; // Pixel data from existingWordsMask.
   this.wasPausedLastRender = false; // Tracks if the cloud was paused in the previous render cycle.
   this.timeSinceLastSuccess = 0; // Time elapsed since a word was successfully placed.
   this.infiniteWords = false; // Flag for continuous word generation.
  };

  /**
   * Creates a jQuery-wrapped HTML5 canvas element with specified dimensions.
   * @param {number} width The desired width of the canvas.
   * @param {number} height The desired height of the canvas.
   * @returns {jQuery} A jQuery object containing the new canvas element.
   */
  this.createCanvas = function(width, height) {
   return $(
    '<canvas '
    + 'width="' + width + '" '
    + 'height="' + height + '"'
    + '"></canvas>'
   );
  };

  /**
   * Prepares a 2D rendering context for drawing on a given canvas.
   * @param {jQuery} canvas The jQuery-wrapped canvas element.
   * @returns {CanvasRenderingContext2D} The 2D rendering context.
   */
  this.beginDrawing = function(canvas) {
   var context = canvas.get(0).getContext('2d');
   // Safari has a looong beachball sometimes on window close, and gdb indicates it's
   // related to fonts and context saving, so removing this to see if it helps. It does
   // mean taking a little more care with the context state, but shouldn't be a problem.
   // context.save(); // Original code commented this out.
   return context;
  };

  /**
   * Finalizes drawing operations for a given context.
   * Currently, this method does nothing, as context.restore() was removed.
   * @param {CanvasRenderingContext2D} context The 2D rendering context.
   */
  this.endDrawing = function(context) {
   // context.restore(); // Original code commented this out.
  };

  /**
   * Converts a numeric color value (e.g., 0xFF0000) into an RGBA CSS string.
   * @param {number} colorNumber The color as an integer.
   * @param {number} [alpha=1.0] The alpha transparency value (0.0 to 1.0).
   * @returns {string} The RGBA color string.
   */
  this.colorStringFromNumber = function(colorNumber, alpha) {
   // Extract red, green, and blue components from the integer.
   var red = (colorNumber >> 16) & 0xff;
   var green = (colorNumber >> 8) & 0xff;
   var blue = (colorNumber >> 0) & 0xff;

   // Default alpha to 1.0 if not provided.
   if (typeof alpha === 'undefined')
    alpha = 1.0;
    
   // Construct the RGBA string.
   var result = 'rgba(';
   result += red;
   result += ',';
   result += green;
   result += ',';
   result += blue;
   result += ',';
   result += alpha;
   result += ')';
   
   return result;
  };

  /**
   * The heartbeat function, called periodically by the timer.
   * Triggers the main draw cycle.
   */
  this.heartbeat = function() {
   this.draw();
  };

  /**
   * Main drawing function. Renders the word cloud, handles paused states,
   * and attempts to place new words.
   */
  this.draw = function() {
  
   // Check if the cloud is paused or stopped.
   var isPaused = ((this.settings.isPaused) || (this.settings.isStopped));
   var wasPausedLastRender = this.wasPausedLastRender;
   this.wasPausedLastRender = isPaused; // Update the paused state tracker.

   if (isPaused) {
    // If paused, and it wasn't paused last render, redraw the existing words once.
    if (!wasPausedLastRender) {
     context = this.beginDrawing(this.canvas);
     
     this.update(context); // Update (though no words will be placed).
     
     context.clearRect(0, 0, this.width, this.height); // Clear main canvas.
     context.drawImage(this.existingWords.get(0), 0, 0, this.width, this.height); // Draw existing words.

     this.endDrawing(context);
    }
    return; // Do nothing further if paused.
   }

   // Prevent re-entry if already drawing.
   if (this.insideDrawing) {
    return;
   }
   this.insideDrawing = true; // Set flag to indicate drawing is in progress.
  
   context = this.beginDrawing(this.canvas);
 
   this.update(context); // Attempt to place new words.
 
   context.clearRect(0, 0, this.width, this.height); // Clear the main display canvas.
   // Draw the words that have already been successfully placed.
   context.drawImage(this.existingWords.get(0), 0, 0, this.width, this.height);

   // Get the current word being processed for placement.
   var word = this.getCurrentWord();
   if (word) {
    // Determine the text color for the current word.
    var textColor = this.settings.textColor;
    if (textColor == 'rainbow') {
     textColor = this.rainbowColor(); // Placeholder for a rainbow color function.
    }

    context.fillStyle = textColor; // Set fill style.
    context.globalCompositeOperation = 'source-over'; // Standard blending mode.

    this.drawWord(context, word); // Draw the word (tentatively, before final placement).
   }
   
   this.endDrawing(context); // Finalize drawing.
   
   this.insideDrawing = false; // Reset drawing flag.
  };
  
  /**
   * Starts the word cloud generation from a raw text string.
   * @param {string} text The input text.
   */
  this.startFromText = function(text) {
  
   // First, calculate word frequencies from the text.
   var wordFrequencies = this.wordFrequenciesFromText(text);
  
   // Then, proceed with the word frequencies.
   this.startFromWordFrequencies(wordFrequencies);
  };
  
  /**
   * Calculates word frequencies from a given text string,
   * filtering out common stop words.
   * @param {string} text The input text.
   * @returns {Object.<string, number>} An object mapping words to their frequencies.
   */
  this.wordFrequenciesFromText = function(text) {
  
   // List of common English stop words to filter out.
   var stopWords = ["a", "about", "above", "accordingly", "after",
    "again", "against", "ah", "all", "also", "although", "always", "am", "among", "amongst", "an",
    "and", "any", "anymore", "anyone", "are", "as", "at", "away", "be", "been",
    "begin", "beginning", "beginnings", "begins", "begone", "begun", "being",
    "below", "between", "but", "by", "ca", "can", "cannot", "come", "could",
    "did", "do", "doing", "during", "each", "either", "else", "end", "et",
    "etc", "even", "ever", "far", "ff", "following", "for", "from", "further", "furthermore",
    "get", "go", "goes", "going", "got", "had", "has", "have", "he", "her",
    "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into",
    "is", "it", "its", "itself", "last", "lastly", "less", "many", "may", "me",
    "might", "more", "must", "my", "myself", "near", "nearly", "never", "new",
    "next", "no", "not", "now", "o", "of", "off", "often", "oh", "on", "only",
    "or", "other", "otherwise", "our", "ourselves", "out", "over", "perhaps",
    "put", "puts", "quite", "s", "said", "saw", "say", "see", "seen", "shall",
    "she", "should", "since", "so", "some", "such", "t", "than", "that", "the",
    "their", "them", "themselves", "then", "there", "therefore", "these", "they",
    "this", "those", "though", "throughout", "thus", "to", "too",
    "toward", "unless", "until", "up", "upon", "us", "ve", "very", "was", "we",
    "were", "what", "whatever", "when", "where", "which", "while", "who",
    "whom", "whomever", "whose", "why", "with", "within", "without", "would",
    "yes", "your", "yours", "yourself", "yourselves", "rt", "http", "www", "com", "you", "de",
    "re", "ll", "ex", "didn", "mr", "mrs"
   ];
   
   // Regular expressions for cleaning the text.
   var stopWordsRE = new RegExp('\\s((' + stopWords.join('|') + ')\\s)+', 'gi'); // Match and remove stop words.
   var lettersRE = /[^a-z0-9]/gi; // Match non-alphanumeric characters.
   var multipleSpacesRE = / +/gi; // Match multiple spaces.
   var singleLetterRE = / [a-z0-9] /gi; // Match single letter words.
   
   // Clean the input text: replace non-alphanumeric with spaces, remove stop words,
   // collapse multiple spaces, and remove single-letter words.
   var wordString = text.replace(lettersRE, ' ').replace(stopWordsRE, ' ').replace(multipleSpacesRE, ' ').replace(singleLetterRE, ' ');
   var words = wordString.split(' '); // Split into individual words.
   
   var wordFrequencies = {}; // Initialize frequency map.
   // Iterate through the cleaned words to count frequencies.
   for (var wordIndex in words) {
    var word = words[wordIndex];
    
    // Initialize frequency if word is encountered for the first time.
    if (typeof wordFrequencies[word] === 'undefined') {
     wordFrequencies[word] = 0;
    }
    
    wordFrequencies[word] += 1; // Increment count.
   }
  
   return wordFrequencies; // Return the frequency map.
  };
  
  /**
   * Starts the word cloud generation from a map of word frequencies.
   * Calculates word sizes based on frequency.
   * @param {Object.<string, number>} wordFrequencies A map of words to their frequencies.
   */
  this.startFromWordFrequencies = function(wordFrequencies) {
   var maxFrequency = 2; // Initialize max frequency, assuming at least 1.
   
   // Find the maximum frequency among all words.
   for (var word in wordFrequencies) {
    var wordFrequency = wordFrequencies[word];
    if (wordFrequency > maxFrequency) {
     maxFrequency = wordFrequency;
    }
   }
   
   // Retrieve font size settings.
   var smallestTextSize = parseInt(this.settings.smallestTextSize);
   var largestTextSize = parseInt(this.settings.largestTextSize);
   var textSizeDelta = (largestTextSize - smallestTextSize); // Range of font sizes.
   
   var wordSizes = []; // Array to store words with calculated sizes.
   // Calculate size for each word based on its relative frequency.
   for (var word in wordFrequencies) {
    var wordFrequency = wordFrequencies[word];
    // Normalize frequency to a 0-1 range.
    var wordRelativeFrequency = ((wordFrequency - 1) / (maxFrequency - 1));
    
    // Scale the relative frequency to the desired text size range.
    var wordSize = smallestTextSize + (wordRelativeFrequency * textSizeDelta);
    wordSizes.push({'text': word, 'size': wordSize}); // Store word and its size.
   }
   
   // Begin the word cloud generation with the calculated word sizes.
   this.startFromWordSizes(wordSizes, false);
  };

  /**
   * Starts the word cloud generation from a small text input, assigning
   * random sizes to words. Used for demonstration or small inputs.
   * @param {string} words The input text.
   */
  this.startFromSmallText = function(words) {

   // Calculate word frequencies from the input text.
   var wordFrequencies = this.wordFrequenciesFromText(words);

   // Retrieve font size settings.
   var smallestTextSize = parseInt(this.settings.smallestTextSize);
   var largestTextSize = parseInt(this.settings.largestTextSize);
   var textSizeDelta = (largestTextSize - smallestTextSize);
   
   var wordSizes = []; // Array to store words with random sizes.
   // Assign a random size to each word.
   for (var word in wordFrequencies) {
    // Generate a random relative frequency, biased towards smaller sizes.
    var wordRelativeFrequency = Math.random();
    wordRelativeFrequency *= wordRelativeFrequency;
    wordRelativeFrequency *= wordRelativeFrequency;
    
    // Scale the random frequency to the desired text size range.
    var wordSize = smallestTextSize + (wordRelativeFrequency * textSizeDelta);
    wordSizes.push({'text': word, 'size': wordSize});
   }
   
   // Begin the word cloud generation with the randomly sized words,
   // indicating that it's for infinite word generation.
   this.startFromWordSizes(wordSizes, true);
  };

  /**
   * Attempts to place words onto the canvas. This is the core layout algorithm.
   */
  this.update = function() {

   // Calculate half dimensions for centering.
   var halfWidth = (this.width / 2);
   var halfHeight = (this.height / 2);
   var spacing = this.settings.spacing; // Word spacing (currently not used directly here).
   var searchWalk = this.settings.searchWalk; // Current search strategy.
   
   // Loop to attempt placing words until no more words are available or time runs out.
   while (true) {

    var word = this.getCurrentWord(); // Get the next word to place.
    if (!word) {
     break; // No more words, exit loop.
    }
    
    // Retrieve min/max distance settings for 'outwards' search.
    var minDistance = this.settings.minDistance * 1;
    var maxDistance = this.settings.maxDistance * 1;

    // Initialize word position and rotation if it's the first iteration for this word.
    if (word.iterations == 0) {
    
     if (searchWalk == 'outwards') { // 'outwards' strategy: start from center, move radially.
     
      var angle = (Math.random() * Math.PI * 2) - Math.PI; // Random initial angle.
      var distance = Math.randomRange(minDistance, maxDistance, 0.01); // Random initial distance.
      
      word.deltaX = Math.cos(angle) * distance; // X component of movement.
      word.deltaY = Math.sin(angle) * distance; // Y component of movement.

      word.x = (halfWidth + word.deltaX); // Initial X position.
      word.y = (halfHeight + word.deltaY); // Initial Y position.
     
     } else if (searchWalk == 'spiral') { // 'spiral' strategy: move in an expanding spiral.

      word.angle = (Math.random() * Math.PI * 2) - Math.PI; // Random initial angle.
      word.angleDelta = (Math.random() < 0.5) ? (Math.PI / 20) : (-Math.PI / 20); // Random angle increment direction.
      word.distanceDelta = 0.3; // How much the spiral expands per step.
      word.distance = word.distanceDelta; // Initial distance from center.
      
      var deltaX = word.distance * Math.cos(word.angle); // X offset.
      var deltaY = word.distance * Math.sin(word.angle); // Y offset.
      
      word.x = (halfWidth + deltaX); // Initial X position.
      word.y = (halfHeight + deltaY); // Initial Y position.
      
     } else { // 'random' strategy: just pick a random spot.

      word.x = Math.randomRange(0, this.width - 1); // Random X.
      word.y = Math.randomRange(0, this.height - 1); // Random Y.
     }
     
     word.rotation = this.getWordRotation(); // Get initial word rotation.
    }
    
    var startTime = new Date().getTime(); // Record start time for iteration limit.
    var successTime = startTime; // Not used currently.
    
    // Attempt to find a suitable position for the word.
    while (word.iterations < this.settings.maxIterations) {
     
     if (this.doesWordFit(word)) {
      break; // Word fits, exit inner loop.
     }

     // Update word position based on the chosen search strategy.
     if (searchWalk == 'random') {
                     
      word.x = Math.randomRange(0, this.width - 1); // New random X.
      word.y = Math.randomRange(0, this.height - 1); // New random Y.
      word.rotation = this.getWordRotation(); // New random rotation.
     
     } else {
     
      if (searchWalk == 'outwards') {
      
       word.x += word.deltaX; // Move outwards along deltaX.
       word.y += word.deltaY; // Move outwards along deltaY.
      
      } else { // searchWalk == 'spiral'
      
       word.angle += word.angleDelta; // Increment angle.
       word.distance += word.distanceDelta; // Expand spiral.
      
       var deltaX = word.distance * Math.cos(word.angle); // New X offset.
       var deltaY = word.distance * Math.sin(word.angle); // New Y offset.
       
       word.x = (halfWidth + deltaX); // New X position.
       word.y = (halfHeight + deltaY); // New Y position.
       word.rotation = this.getWordRotation(); // Update rotation (could be fixed or random based on settings).
      }

      // If word moves out of bounds for 'outwards' or 'spiral', reset its position.
      if (searchWalk == 'outwards') {
      
       if ((word.x < 0) ||
        (word.x > this.width) ||
        (word.y < 0) ||
        (word.y > this.height)) {
        var angle = (Math.random() * Math.PI * 2) - Math.PI;
        var distance = Math.randomRange(minDistance, maxDistance, 0.01);
        
        word.deltaX = Math.cos(angle) * distance;
        word.deltaY = Math.sin(angle) * distance;

        word.x = (halfWidth + word.deltaX);
        word.y = (halfHeight + word.deltaY);
       }
       
      } else if (searchWalk == 'spiral') {

       if (word.distance > Math.max((this.width / 2), (this.height / 2))) { // If spiral expands beyond canvas limits.

        word.angle = (Math.random() * Math.PI * 2) - Math.PI; // Reset angle.
        word.angleDelta = (Math.random() < 0.5) ? (Math.PI / 20) : (-Math.PI / 20); // Reset angle direction.
        word.distanceDelta = 0.3; // Reset distance increment.
        word.distance = word.distanceDelta; // Reset distance.
        
        var deltaX = word.distance * Math.cos(word.angle);
        var deltaY = word.distance * Math.sin(word.angle);
        
        word.x = (halfWidth + deltaX);
        word.y = (halfHeight + deltaY);
        
        word.rotation = this.getWordRotation(); // Reset rotation.
       }
      
      }
     }

     word.iterations += 1; // Increment iteration count.

     var currentTime = new Date().getTime();
     var sinceStart = (currentTime - startTime);
     // If an iteration takes too long, break and accumulate failed time.
     if (sinceStart > 250) {
      this.timeSinceLastSuccess += sinceStart;
      if (this.timeSinceLastSuccess > this.settings.failedTimeBeforeStopping) {
       this.settings.isStopped = true; // Stop if too much time passes without success.
      }
      return; // Exit update cycle temporarily.
     }
    }
    
    // If a place was found within the max iterations.
    if (word.iterations < this.settings.maxIterations) {
     this.addWordToLayout(word); // Add the word to the permanent layout.
     this.timeSinceLastSuccess = 0; // Reset failed time counter.
    }
                    
    word.isPositioned = true; // Mark word as positioned.
   }
  };

  /**
   * Initializes the word cloud generation process with a list of word sizes.
   * Handles loading a shape image if specified.
   * @param {Array<Object>} wordSizes An array of objects, each with 'text' and 'size' properties.
   * @param {boolean} infiniteWords If true, the word list will be re-used indefinitely.
   */
  this.startFromWordSizes = function(wordSizes, infiniteWords) {

   this.inputWordSizes = wordSizes; // Store the initial word sizes.
   this.words = []; // Clear existing words.
   this.settings.isPaused = false; // Ensure not paused.
   this.settings.isStopped = false; // Ensure not stopped.
   this.infiniteWords = infiniteWords; // Set infinite words flag.

   var shapeImage = this.settings.shapeImage;
   // Check if a shape image is specified.
   if ((shapeImage == 'none') || (shapeImage == 'text')) {

    this.shapeImage = null; // No image to load.
    this.startAfterImageLoad(); // Proceed directly.

   } else {
    this.shapeImage = new Image(); // Create a new image object.
    
    var instance = this; // Store 'this' for the callback.
    this.shapeImage.onload = function() { instance.startAfterImageLoad(); }; // Set onload handler.
    this.shapeImage.src = this.settings.shapeImage; // Set image source to trigger loading.
   }
  };
  
  /**
   * Continues the word cloud generation process after a shape image (if any) has loaded.
   * Prepares canvases and sorts words.
   */
  this.startAfterImageLoad = function() {

   this.insideDrawing = false; // Ensure drawing flag is reset.

   var wordSizes = this.inputWordSizes;
   // Populate the 'words' array with initial data and status.
   for (var wordIndex in wordSizes) {
    var wordData = wordSizes[wordIndex];
    wordData.isPositioned = false; // Mark as not yet positioned.
    wordData.iterations = 0; // Reset iteration count for placement attempts.
    this.words.push(wordData);
   }

   // Sort words by size if enabled in settings.
   if (this.settings.sortBySize) {
    this.words.sort(function(a, b) {
     if (a.size > b.size) return -1; // Larger words first.
     else if (a.size < b.size) return 1;
     else return 0;
    });
   }
   
   // Initialize the existingWords canvas (where placed words are drawn) with the background color.
   var context = this.beginDrawing(this.existingWords);
   context.fillStyle = this.settings.backgroundColor;
   context.fillRect(0, 0, this.width, this.height);
   this.endDrawing(context);

   // Initialize the high-definition existingWordsHD canvas.
   var context = this.beginDrawing(this.existingWordsHD);
   context.fillStyle = this.settings.backgroundColor;
   context.fillRect(0, 0, (this.width * this.settings.hdScale), (this.height * this.settings.hdScale));
   this.endDrawing(context);

   // Initialize the existingWordsMask canvas.
   var context = this.beginDrawing(this.existingWordsMask);
   context.clearRect(0, 0, this.width, this.height); // Clear it initially.
   // If a shape image or text shape is used, draw it onto the mask.
   if ((this.shapeImage != null) || (this.settings.shapeImage == 'text')) {
    context.fillStyle = 'rgba(255, 255, 255, 1.0)'; // Fill with white.
    context.fillRect(0, 0, this.width, this.height); // Fill entire mask.
    context.fillStyle = '#000000'; // Set fill style to black for the shape.
    
    var shapeImage; // Variable to hold the shape image/canvas.
    var originalImageWidth;
    var originalImageHeight;
    if (this.settings.shapeImage == 'text') { // If shaping by text.
    
     var lines = this.settings.shapeText.split("\n"); // Split text into lines.
     
     var fontSize = 64; // Base font size for the shape text.
     var lineHeight = (fontSize * 1.2); // Line height for multi-line text.