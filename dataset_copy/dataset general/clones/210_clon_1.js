var                 currentSlug        =     '';
var currentId = '';

/*
 * This function is responsible for making an asynchronous HTTP GET request
 * to a specified URL and then invoking a callback with the response.
 * It utilizes the XMLHttpRequest object, a standard browser API for network requests.
 */
function getURL(url, callback)
{
  var xmlhttp = new XMLHttpRequest(); // Create a new XMLHttpRequest object.

  // Define the event handler for state changes of the request.
  xmlhttp.onreadystatechange = function (  )
  {
    // Check if the request is complete (readyState 4) and successful (status 200).
    if ( ( xmlhttp.readyState == 4 ) && ( xmlhttp.status == 200 ) )
    {
      callback(xmlhttp.responseText); // Execute the provided callback with the response text.
    }
  }

  // Open the request: "GET" method, the specified URL, and asynchronous (true).
  xmlhttp.open(  "GET",   url,   true  );
  xmlhttp.send(); // Send the request.
}

// function hide_glance(){
//     document.getElementById("glance_spacer").style.display = "none";
//     document.getElementById("glance_container").style.display = "none";
//     document.getElementById("glance_holder").style.display = "none";
// }

// Attach an event listener to the "change" event of the 'glance_selector' element.
document.getElementById("glance_selector").addEventListener(  "change",   function(e)
{
  // Clear any existing timeouts to prevent multiple reading sessions.
  clearTimeouts();
  // Store the selected Words Per Minute (WPM) value in local storage.
  localStorage.setItem('WPM', document.getElementById("glance_selector").value);
  // Initiate the glance reading process.
  glance();
});

// Entry point to the beef.
// Gets the WPM and the selected text, if any.
function glance()
{

  // Retrieve the Words Per Minute (WPM) setting from the selector and parse it as an integer.
  var wpm = parseInt(document.getElementById("glance_selector").value, 10);
  // If WPM is less than 1, it's an invalid setting, so exit.
  if (wpm < 1)
  {
    return;
  }

  // Proceed to glanceify the content from the current URL.
  glanceifyURL();
}

// The meat! This is the core function for displaying rapid serial visual presentation (RSVP).
function glanceify(input, url)
{

  // Get the WPM from the selector again.
  var wpm = parseInt(document.getElementById("glance_selector").value, 10);
  // Calculate milliseconds per word based on WPM.
  var ms_per_word = 60000 / wpm;

  // Split the input text into an array of words, using any whitespace as a delimiter.
  var all_words = input.split(/\s+/);

  // The reader won't stop if the selection starts or ends with spaces
  // Check if the first element is an empty string (due to leading whitespace).
  if (all_words[0] == "")
  {
    all_words = all_words.slice(1, all_words.length); // Remove the leading empty string.
  }

  // Check if the last element is an empty string (due to trailing whitespace).
  if (all_words[all_words.length - 1] == "")
  {
    all_words = all_words.slice(0, all_words.length - 1); // Remove the trailing empty string.
  }

  var word = ''; // Placeholder for individual word processing (not used here directly).
  var result = ''; // Placeholder for the final HTML result (not used here directly).

  // Preprocess words to adjust timing and display.
  var temp_words = all_words.slice(0); // Create a shallow copy of the all_words array.
  var t = 0; // Index for the temp_words array.

  for (var i = 0; i < all_words.length; i++)
  {

    // Replace periods with a specific HTML entity for visual consistency if needed.
    if (all_words[i].indexOf('.') != -1)
    {
      temp_words[t] = all_words[i].replace('.', '&#8226;');
    }

    // Double up on long words and words with commas, colons, or hyphens to slow reading.
    if ( ( ( ( ( all_words[i].indexOf(',') != -1 || all_words[i].indexOf(':') != -1 ) || all_words[i].indexOf('-') != -1 ) || all_words[i].indexOf('(') != -1 ) || all_words[i].length > 8 ) && all_words[i].indexOf('.') == -1 )
    {
      temp_words.splice(t + 1, 0, all_words[i]); // Insert the word again.
      temp_words.splice(t + 1, 0, all_words[i]); // Insert the word a third time.
      t++; // Increment temp_words index.
      t++; // Increment temp_words index again.
    }

    // Add additional "space" words after punctuation to create a pause.
    if ( ( ( ( ( all_words[i].indexOf('.') != -1 || all_words[i].indexOf('!') != -1 ) || all_words[i].indexOf('?') != -1 ) || all_words[i].indexOf(':') != -1 ) || all_words[i].indexOf(';') != -1 ) || all_words[i].indexOf(')') != -1 )
    {
      temp_words.splice(t + 1, 0, " "); // Insert a space.
      temp_words.splice(t + 1, 0, " "); // Insert another space.
      temp_words.splice(t + 1, 0, " "); // Insert a third space.
      t++; // Increment temp_words index.
      t++; // Increment temp_words index.
      t++; // Increment temp_words index.
    }
    t++; // Move to the next position in temp_words.
  }

  all_words = temp_words.slice(0); // Update all_words with the preprocessed words.

  var currentWord = 0; // Index of the word currently being displayed.
  var running = true; // Flag to indicate if the reading is active.
  var glance_timers = new Array(); // Array to store interval IDs for clearing.

  // Add a click listener to the display area to toggle pause/play.
  document.getElementById('glance_result-' + currentId).addEventListener("click", function()
  {
    pausePlay(); // Call the pause/play toggle function.
  });

  // Toggles the reading state between paused and playing.
  function pausePlay()
  {
    if (running)
    {
      stopglance(); // If running, stop it.
    }
    else
    {
      startglance(); // If paused, start it.
    }
  }

  // Updates the displayed word on the screen.
  function updateValues(i)
  {

    var p = pivot(all_words[i]); // Get the HTML formatted word with a pivot character.
    document.getElementById("glance_result-" + currentId).innerHTML = p; // Update the display element.
    currentWord = i; // Update the current word index.

  }

  // Starts the glance reading process.
  function startglance()
  {

    document.getElementById("glance_toggle").style.display = "block"; // Show the toggle button.
    document.getElementById("glance_toggle").textContent = "Pause"; // Set button text to "Pause".

    running = true; // Set running flag to true.

    // Set an interval to update words at the calculated ms_per_word rate.
    glance_timers.push(setInterval(function()
    {
      updateValues(currentWord); // Display the current word.
      currentWord++; // Move to the next word.
      if (currentWord >= all_words.length)
      { // If all words have been displayed.
        currentWord = 0; // Reset to the beginning.
        stopglance(); // Stop the reading.
      }
    }, ms_per_word));
  }

  // Stops the glance reading process.
  function stopglance()
  {
    // Iterate through all stored timers and clear them.
    for (var i = 0; i < glance_timers.length; i++)
    {
      clearTimeout(glance_timers[i]);
    }

    document.getElementById("glance_toggle").textContent = "Play"; // Set button text to "Play".
    running = false; // Set running flag to false.
  }

  startglance(); // Immediately start the reading when glanceify is called.
}

// Find the red-character (pivot) of the current word for RSVP display.
function pivot(word)
{
  var length = word.length; // Get the length of the word.

  var bestLetter = 1; // Default pivot position.
  switch (length)
  {
    case 1:
      bestLetter = 1; // For 1-letter words, pivot is the first letter.
      break;
    case 2:
    case 3:
    case 4:
    case 5:
      bestLetter = 2; // For 2-5 letter words, pivot is the second letter.
      break;
    case 6:
    case 7:
    case 8:
    case 9:
      bestLetter = 3; // For 6-9 letter words, pivot is the third letter.
      break;
    case 10:
    case 11:
    case 12:
    case 13:
      bestLetter = 4; // For 10-13 letter words, pivot is the fourth letter.
      break;
    default:
      bestLetter = 4; // For longer words, pivot is the fourth letter.
  };

  word = decodeEntities(word); // Decode HTML entities in the word.
  // Generate the beginning part of the word, padded with invisible dots.
  var start = '.'.repeat((4 - bestLetter)) + word.slice(0, bestLetter - 1).replace('.', '&#8226;');
  // Get the pivot character.
  var middle = word.slice(bestLetter - 1, bestLetter).replace('.', '&#8226;');
  // Get the end part of the word, padded with invisible dots.
  var end = word.slice(bestLetter, length).replace('.', '&#8226;') + '.'.repeat((4 - (word.length - bestLetter)));

  var result;
  result = "<span class='glance_start'>" + start; // Wrap the start part in a span.
  result = result + "</span><span class='glance_pivot'>"; // Close start, open pivot span.
  result = result + middle; // Add the pivot character.
  result = result + "</span><span class='glance_end'>"; // Close pivot, open end span.
  result = result + end; // Add the end part.
  result = result + "</span>"; // Close the end span.

  // Replace all placeholder dots with invisible spans for consistent spacing.
  result = result.replace(/\./g, "<span class='invisible'>.</span>");

  return result; // Return the HTML-formatted word.
}


// Uses a content extraction API (Diffbot) to get the main content of a given URL.
function glanceifyURL(url, id)
{

  clearTimeouts(); // Clear any previous reading timers.
  currentSlug = convertToSlug(url); // Convert the URL to a slug (not shown in provided code).
  currentId = id; // Set the current ID.

  // Display loading indicators.
  $('#glance_result-' + currentId + '-holder').show();
  $('#' + currentId).html('Loading..');
  $('#' + currentId).hide();

  var diffbot_token = '2efef432c72b5a923408e04353c39a7c'; // Diffbot API token.

  // Call the Diffbot API to parse the article content.
  getURL("https://api.diffbot.com/v2/article?url=" + encodeURIComponent(url) + "&token=" + diffbot_token, // +"&callback=?",
    function(data)
    {

      data = JSON.parse(data); // Parse the JSON response from the API.

      if (data.error)
      { // Check if the API returned an error.
        document.getElementById("glance_result").innerText = "Article extraction failed. Try selecting text instead.";
        return; // Exit if there's an error.
      }

      createOrUpdate(url, data.title); // Function to create or update an entry (not shown).

      var title = ''; // Initialize title.
      if (data.title !== "")
      {
        title = data.title + ". "; // Add title if available.
      }

      var author = ''; // Initialize author.
      if (data.author !== undefined)
      {
        author = "By " + data.author + ". "; // Add author if available.
      }

      var body = data.text; // Get the main body text.
      body = body.trim(); // Trim leading and trailing whitespace.
      body = body.replace(/\s+/g, ' '); // Shrink multiple whitespaces to single spaces.

      var intro = "Article starting in Five. Four. Three. Two. One. "; // Introductory text.
      var text_content = intro + title + author + body; // Combine all parts.
      text_content = text_content.replace(/\./g, '. '); // Ensure periods are followed by a space.
      text_content = text_content.replace(/\?/g, '? '); // Ensure question marks are followed by a space.
      text_content = text_content.replace(/\!/g, '! '); // Ensure exclamation marks are followed by a space.
      glanceify(text_content, url); // Start reading the extracted and formatted text.
    });
}

//////
// Helpers
//////

// This is a hack using the fact that browers sequentially id the timers.
// Clears all active timeouts, effectively stopping any running RSVP.
function clearTimeouts()
{
  var id = window.setTimeout(function() {}, 0); // Get the ID of the next available timer.

  while (id--)
  { // Loop backwards from that ID to 0.
    window.clearTimeout(id); // Clear each timeout.
  }
}

// Let strings repeat themselves,
// because JavaScript isn't as awesome as Python.
// Extends String.prototype with a repeat method.
String.prototype.repeat = function(num)
{
  if (num < 1)
  {
    return new Array(Math.abs(num) + 1).join(this); // Handle negative or zero repetitions.
  }
  return new Array(num + 1).join(this); // Create an array and join its elements to repeat the string.
};

// Decodes HTML entities within a string using a temporary DOM element.
function decodeEntities(s)
{
  var str, temp = document.createElement('p'); // Create a temporary paragraph element.
  temp.innerHTML = s; // Set its innerHTML to the encoded string.
  str = temp.textContent || temp.innerText; // Get the decoded text content.
  temp = null; // Clean up the temporary element.
  return str; // Return the decoded string.
}