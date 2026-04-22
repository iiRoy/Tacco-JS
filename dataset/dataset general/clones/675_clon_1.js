var gSelectedIndex = -1; /* Global variable to track the currently selected index in the autocomplete results. Initialized to -1, indicating no selection. */

var gSelectedID = -1; /* Global variable to store the ID of the currently selected item. Also initialized to -1. */

var gMatches = new Array(); /* Array to hold the current set of search matches. It will be populated as the user types. */

var gLastText = ""; /* Stores the last search query text processed. Used to avoid redundant searches. */

var ROW_COUNT = 20; // Maximum number of rows to display in the autocomplete dropdown.

var gInitialized = false; /* Flag to ensure the autocomplete table structure is initialized only once. */

var DEFAULT_TEXT = "search developer docs"; /* Placeholder text for the search input field. */

var HAS_SEARCH_PAGE = false; // Indicates whether a dedicated search results page exists.

/*
 * Function: set_row_selected
 * --------------------------
 * Applies or removes a 'selected' CSS class to a given table row.
 *
 * @param row The table row (TR DOM object) to modify.
 * @param selected A boolean; true to select the row, false to deselect.
 */
function set_row_selected(row, selected)
{
  var c1 = row.cells[0]; /* Get the first cell of the row. */

  //  var c2 = row.cells[1]; // This line is commented out, likely for a single-column layout.

  if (selected)
  {
    c1.className = "jd-autocomplete jd-selected"; /* Apply the selected class. */
    //      c2.className = "jd-autocomplete jd-selected jd-linktype"; // Also commented out.
  }
  else
  {
    c1.className = "jd-autocomplete"; /* Revert to the default autocomplete class. */
    //      c2.className = "jd-autocomplete jd-linktype"; // And this one.
  }
}

/*
 * Function: set_row_values
 * ------------------------
 * Populates a table row with data from a match object.
 *
 * @param toroot The base URL path to prepend to links.
 * @param row The table row (TR DOM object) to populate.
 * @param match The match object containing label, link, and type information.
 */
function set_row_values(toroot, row, match)
{
  var link = row.cells[0].childNodes[0]; // Access the anchor tag within the first cell.

  link.innerHTML = match.__hilabel || match.label; // Set inner HTML, prioritizing highlighted label.

  link.href = toroot + match.link // Construct the full link URL.

  //  row.cells[1].innerHTML = match.type; // This line is commented out, as with set_row_selected.
}

/*
 * Function: sync_selection_table
 * ------------------------------
 * Synchronizes the autocomplete suggestion table based on current matches
 * and selected index. Handles initialization and display logic.
 *
 * @param toroot The base URL path for links.
 */
function sync_selection_table(toroot)
{
  var filtered = document.getElementById("search_filtered"); /* Reference to the autocomplete results table. */

  var r; // Variable to hold a TR DOM object during iteration.

  var i; // Loop iterator variable.

  gSelectedID = -1; // Reset the selected ID every time the table is synced.

  /*
   * Event handler for mouseover on the filtered table.
   * If an item was previously selected (e.g., via keyboard navigation),
   * this deselects it when the mouse re-enters the table area.
   */
  filtered.onmouseover = function()
  {
    if(gSelectedIndex >= 0)
    {
      set_row_selected(this.rows[gSelectedIndex], false); // Deselect the currently highlighted row.
      gSelectedIndex = -1; // Clear the selected index.
    }
  }

  // Initialize the table structure if it hasn't been done yet.
  // This draws the rows and cells but keeps them invisible initially.
  if (!gInitialized)
  {
    for (i=0; i<ROW_COUNT; i++)
    {
      var r = filtered.insertRow(-1); // Insert a new row at the end.
      var c1 = r.insertCell(-1); // Insert the first cell.
      //    var c2 = r.insertCell(-1); // Insert the second cell (commented out).
      c1.className = "jd-autocomplete"; // Set initial class for the first cell.
      //   c2.className = "jd-autocomplete jd-linktype"; // Set initial class for the second cell (commented out).
      var link = document.createElement("a"); // Create an anchor element.

      // Event handler for clicking on a result row.
      c1.onmousedown = function()
      {
        window.location = this.firstChild.getAttribute("href"); // Navigate to the link.
      }

      // Event handler for mouseover on a result cell.
      c1.onmouseover = function()
      {
        this.className = this.className + " jd-selected"; // Add selected class on hover.
      }

      // Event handler for mouseout on a result cell.
      c1.onmouseout = function()
      {
        this.className = "jd-autocomplete"; // Remove selected class on mouse out.
      }

      c1.appendChild(link); // Append the anchor to the cell.
    }
    /* The following block is completely commented out. It might have been for a "more results" row.
    var r = filtered.insertRow(-1);
    var c1 = r.insertCell(-1);
    c1.className = "jd-autocomplete jd-linktype";
    c1.colSpan = 2; */
    gInitialized = true; // Mark the table as initialized.
  }

  // If there are search results, make the table visible and populate it.
  if (gMatches.length > 0)
  {
    document.getElementById("search_filtered_div").className = "showing"; // Display the container div.

    // Determine how many rows to display, up to ROW_COUNT.
    var N = gMatches.length < ROW_COUNT ? gMatches.length : ROW_COUNT;

    for (i=0; i<N; i++)
    {
      r = filtered.rows[i]; // Get the current row.
      r.className = "show-row"; // Make the row visible.
      set_row_values(toroot, r, gMatches[i]); // Populate the row with match data.
      set_row_selected(r, i == gSelectedIndex); // Highlight if it's the selected row.
      if (i == gSelectedIndex)
      {
        gSelectedID = gMatches[i].id; // Store the ID of the selected match.
      }
    }

    // Hide any remaining rows that are not used by current matches.
    for (; i<ROW_COUNT; i++)
    {
      r = filtered.rows[i]; // Get the row.
      r.className = "no-display"; // Hide it.
    }

    // This block is commented out, it would have shown a "plus N more" message.
    /*
    if (gMatches.length > ROW_COUNT) {
          r = filtered.rows[ROW_COUNT];
          r.className = "show-row";
          c1 = r.cells[0];
          c1.innerHTML = "plus " + (gMatches.length-ROW_COUNT) + " more";
      } else {
          filtered.rows[ROW_COUNT].className = "hide-row";
      }
    */
  }
  // If there are no results, hide the table entirely.
  else
  {
    document.getElementById("search_filtered_div").className = "no-display"; // Hide the container div.
  }
}

/*
 * Function: search_changed
 * ------------------------
 * Handles input changes and key events in the search box.
 * Triggers search logic, navigation, and selection updates.
 *
 * @param e The event object.
 * @param kd Boolean indicating if it's a keydown event (true) or keyup (false).
 * @param toroot The base URL path.
 * @returns Boolean indicating if the event should bubble up (true) or be consumed (false).
 */
function search_changed(e, kd, toroot)
{
  var search = document.getElementById("search_autocomplete"); // Get the search input field.
  var text = search.value.replace(/(^ +)|( +$)/g, ''); // Get and trim the search text.

  // Handle 'Enter' key press (keyCode 13).
  if (e.keyCode == 13)
  {
    document.getElementById("search_filtered_div").className = "no-display"; // Hide results.
    if (kd && gSelectedIndex >= 0)
    {
      // If a result is selected, navigate to its link.
      window.location = toroot + gMatches[gSelectedIndex].link;
      return false; // Consume the event.
    }
    else if (gSelectedIndex < 0)
    {
      // If no result is selected, either go to a dedicated search page or resync the table.
      if (HAS_SEARCH_PAGE)
      {
        return true; // Allow form submission to search page.
      }
      else
      {
        sync_selection_table(toroot); // Just resync the display.
        return false; // Consume the event.
      }
    }
  }
  // Handle 'Arrow Up' key press (keyCode 38) during keydown.
  else if (kd && (e.keyCode == 38))
  {
    if (gSelectedIndex >= 0)
    {
      gSelectedIndex--; // Move selection up.
    }
    sync_selection_table(toroot); // Update table display.
    return false; // Consume the event.
  }
  // Handle 'Arrow Down' key press (keyCode 40) during keydown.
  else if (kd && (e.keyCode == 40))
  {
    if (gSelectedIndex < gMatches.length-1
      && gSelectedIndex < ROW_COUNT-1)
    {
      gSelectedIndex++; // Move selection down, respecting display limits.
    }
    sync_selection_table(toroot); // Update table display.
    return false; // Consume the event.
  }
  // Handle keyup events (not keydown) for general text input.
  else if (!kd)
  {
    gMatches = new Array(); // Clear previous matches.
    matchedCount = 0; // Reset match count.
    gSelectedIndex = -1; // Reset selection.

    // Iterate through all available data to find matches.
    for (var i=0; i<DATA.length; i++)
    {
      var s = DATA[i]; // Current data item.
      // Check if text is not empty and matches (case-insensitive substring).
      if (text.length != 0 &&
        s.label.toLowerCase().indexOf(text.toLowerCase()) != -1)
      {
        gMatches[matchedCount] = s; // Add to matches.
        matchedCount++; // Increment count.
      }
    }
    rank_autocomplete_results(text); // Rank the found matches.

    // Re-establish selection if the previously selected item is still in matches.
    for (var i=0; i<gMatches.length; i++)
    {
      var s = gMatches[i];
      if (gSelectedID == s.id)
      {
        gSelectedIndex = i; // Restore selected index.
      }
    }
    highlight_autocomplete_result_labels(text); // Apply highlighting to labels.
    sync_selection_table(toroot); // Update the table display.
    return true; // Allow the event to bubble up (e.g., to the search API).
  }
}

/*
 * Function: rank_autocomplete_results
 * -----------------------------------
 * Ranks the current `gMatches` based on the search query.
 * Modifies `gMatches` in place by adding a `__resultScore` property
 * and then sorting the array.
 *
 * @param query The search query string.
 */
function rank_autocomplete_results(query)
{
  query = query || ''; // Ensure query is a string, default to empty.

  if (!gMatches || !gMatches.length)
    return; // No matches to rank.

  // Helper function: Finds the last occurrence index of a regex in a string.
  // Returns -1 if not found.
  var _lastSearch = function(s, re)
  {
    if (s == '')
      return -1; // Empty string, no search.

    var l = -1; // Last found index.
    var tmp; // Temporary index.

    while ((tmp = s.search(re)) >= 0)
    {
      if (l < 0) l = 0; // Initialize if first match.
      l += tmp; // Accumulate index.
      s = s.substr(tmp + 1); // Search in the remainder of the string.
    }
    return l; // Return the last index.
  };

  // Helper function: Counts occurrences of a character in a string.
  var _countChar = function(s, c)
  {
    var n = 0; // Counter.
    for (var i=0; i<s.length; i++)
      if (s.charAt(i) == c) ++n; // Increment if character matches.
    return n; // Return total count.
  };

  var queryLower = query.toLowerCase(); // Lowercase version of the query.

  // Extract alphanumeric part of the query for word boundary matching.
  var queryAlnum = (queryLower.match(/\w+/) || [''])[0];

  // Regex for alphanumeric prefix match at a word boundary.
  var partPrefixAlnumRE = new RegExp('\\b' + queryAlnum);

  // Regex for exact alphanumeric word match at boundaries.
  var partExactAlnumRE = new RegExp('\\b' + queryAlnum + '\\b');

  // Function to calculate a score for a single result.
  var _resultScoreFn = function(result)
  {
    // Scores are based on exact/prefix matches and path depth (dots).
    var score = 1.0;
    var labelLower = result.label.toLowerCase(); // Lowercase label for comparison.
    var t; // Temporary variable for search index.

    t = _lastSearch(labelLower, partExactAlnumRE);
    if (t >= 0)
    {
      // Exact part match found.
      var partsAfter = _countChar(labelLower.substr(t + 1), '.'); // Count dots after match.
      score *= 200 / (partsAfter + 1); // Higher score for exact matches, penalized by depth.
    }
    else
    {
      t = _lastSearch(labelLower, partPrefixAlnumRE);
      if (t >= 0)
      {
        // Part prefix match found.
        var partsAfter = _countChar(labelLower.substr(t + 1), '.'); // Count dots after match.
        score *= 20 / (partsAfter + 1); // Lower score than exact, penalized by depth.
      }
    }

    return score; // Return the calculated score.
  };

  // Calculate and assign a score to each match.
  for (var i=0; i<gMatches.length; i++)
  {
    gMatches[i].__resultScore = _resultScoreFn(gMatches[i]);
  }

  // Sort the matches array based on the calculated scores.
  gMatches.sort(function(a,b){
    var n = b.__resultScore - a.__resultScore; // Primary sort by score (descending).
    if (n == 0) // If scores are equal, perform a lexicographical sort.
      n = (a.label < b.label) ? -1 : 1; // Secondary sort by label (ascending).
    return n; // Return sort result.
  });
}

/*
 * Function: highlight_autocomplete_result_labels
 * ----------------------------------------------
 * Adds HTML bold tags around parts of the result labels that match the query.
 * Stores the highlighted label in a `__hilabel` property of each match object.
 *
 * @param query The search query string.
 */
function highlight_autocomplete_result_labels(query)
{
  query = query || ''; // Ensure query is a string.

  if (!gMatches || !gMatches.length)
    return; // No matches to highlight.

  var queryLower = query.toLowerCase(); // Lowercase query.

  // Extract alphanumeric and dot characters from the query for regex.
  var queryAlnumDot = (queryLower.match(/[\w\.]+/) || [''])[0];

  // Create a global, case-insensitive regex to find query parts.
  // Dots are escaped to match literally.
  var queryRE = new RegExp(
    '(' + queryAlnumDot.replace(/\./g, '\\.') + ')', 'ig');

  // Iterate through matches and apply highlighting.
  for (var i=0; i<gMatches.length; i++)
  {
    gMatches[i].__hilabel = gMatches[i].label.replace(
      queryRE, '<b>$1</b>'); // Replace matched parts with bolded version.
  }
}

/*
 * Function: search_focus_changed
 * ------------------------------
 * Handles focus and blur events for the search input field.
 * Manages placeholder text and hides the autocomplete results when focus is lost.
 *
 * @param obj The search input DOM object.
 * @param focused Boolean; true if focused, false if blurred.
 */
function search_focus_changed(obj, focused)
{
  if (focused)
  {
    if(obj.value == DEFAULT_TEXT)
    {
      obj.value = ""; // Clear placeholder text.
      obj.style.color="#000000"; // Set text color to black.
    }
  }
  else
  {
    if(obj.value == "")
    {
      obj.value = DEFAULT_TEXT; // Restore placeholder text.
      obj.style.color="#aaaaaa"; // Set text color to light gray.
    }
    // Hide the autocomplete results when the search input loses focus.
    document.getElementById("search_filtered_div").className = "no-display";
  }
}

/*
 * Function: submit_search
 * -----------------------
 * Handles the submission of the search form.
 * If HAS_SEARCH_PAGE is true, it redirects to a dedicated search page.
 *
 * @returns Boolean; true to allow default form submission, false to prevent.
 */
function submit_search()
{
  if (HAS_SEARCH_PAGE)
  {
    var query = document.getElementById('search_autocomplete').value; // Get current search query.
    document.location = toRoot + 'search.html#q=' + query + '&t=0'; // Redirect to search page with query.
  }
  return false; // Prevent default form submission if HAS_SEARCH_PAGE is false or handled.
}