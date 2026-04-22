// This file contains a Type I clone of the original JavaScript source.
// The code's logic and structure are identical, but whitespace and
// comments have been extensively modified to create a visually distinct version.

/*
 * This entire file is part of the Openstreetbugs project.
 *
 * Copyright information for the original developers:
 * (C) 2008, 2009 Xavier Le Bourdon, Christoph Böhme, Mitja Kleider
 *
 * Openstreetbugs is free software, distributed under the terms of
 * the GNU General Public License (GPL) version 3 or any later version.
 * You are free to redistribute and/or modify it.
 *
 * This software is provided WITHOUT ANY WARRANTY; this includes, but is not
 * limited to, the implied warranties of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. For full details, please refer to the GNU General
 * Public License.
 *
 * A copy of the GNU GPL should have been included with Openstreetbugs.
 * If not, you can find it at <http://www.gnu.org/licenses/>.
 */


/*
 * This module provides the client-side functionality for Openstreetbugs.
 * To integrate it into your application, include this file and then
 * invoke the `init_openstreetmap` function. This function requires
 * a map object and the server-side scripts' path.
 *
 * For a practical example of integrating Openstreetbugs into a webpage,
 * please consult the `osb-example.html` file.
 */


/*
 * A collection of small, helpful utility functions for string manipulation
 * and cookie handling.
 */

/*
 * Removes any leading or trailing whitespace characters from the input string.
 *
 * @param {string} str The string to be trimmed.
 * @returns {string} The trimmed string.
 */
function strip(str) {
  // Uses a regular expression to match one or more whitespace characters
  // at the beginning (^) or end ($) of the string globally (g).
  return str.replace(/^\s+|\s+$/g, "");
}

/*
 * Converts HTML special characters within a string into their corresponding
 * HTML entities to prevent rendering issues or script injection.
 *
 * @param {string} str The string potentially containing HTML special characters.
 * @returns {string} The string with HTML special characters escaped.
 */
function escape_html(str) {
  // Ensure the input is treated as a string for safety.
  if (!(str instanceof String)) {
    str = str.toString();
  }

  // Replace common HTML special characters with their entities.
  str = str.replace(/&/g, "&amp;");
  str = str.replace(/"/g, "&quot;");
  str = str.replace(/</g, "&lt;");
  str = str.replace(/>/g, "&gt;");
  str = str.replace(/'/g, "&#146;"); // Apostrophe/single quote
  return str;
}

/*
 * Stores a given value in a session cookie. The cookie will expire
 * approximately one week from the moment it's set.
 *
 * @param {string} name The name of the cookie.
 * @param {string} value The value to be stored in the cookie.
 */
function set_cookie(name, value) {
  // Calculate expiry date: one week from now.
  var expires = (new Date((new Date()).getTime() + 604800000)).toGMTString();
  // Set the cookie with name, escaped value, and expiry date.
  document.cookie = name + "=" + escape(value) + ";expires=" + expires + ";";
}

/*
 * Retrieves the value associated with a specific cookie name.
 *
 * @param {string} name The name of the cookie to retrieve.
 * @returns {string|null} The cookie's value if found, otherwise null.
 */
function get_cookie(name) {
  // Check if cookies exist on the document.
  if (document.cookie) {
    // Split all cookies into an array.
    var cookies = document.cookie.split(";");
    // Iterate through each cookie.
    for (var i in cookies) {
      var c = cookies[i].split("="); // Split cookie into name and value.
      // Compare the trimmed cookie name with the target name.
      if (strip(c[0]) == name) {
        return unescape(strip(c[1])); // Return unescaped, trimmed value.
      }
    }
  }
  return null; // Return null if the cookie is not found.
}

/*
 * These functions are responsible for converting geographical coordinates
 * (longitude/latitude) to and from Mercator projection coordinates (x/y).
 * They are crucial for displaying points on a map using OpenLayers.
 */
function plusfacteur(a) {
  return a * (20037508.34 / 180);
} // Converts degrees to Mercator units.
function moinsfacteur(a) {
  return a / (20037508.34 / 180);
} // Converts Mercator units to degrees.
function y2lat(a) {
  return 180 / Math.PI * (2 * Math.atan(Math.exp(moinsfacteur(a) * Math.PI / 180)) - Math.PI / 2);
} // Converts Mercator Y to latitude.
function lat2y(a) {
  return plusfacteur(180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + a * (Math.PI / 180) / 2)));
} // Converts latitude to Mercator Y.
function x2lon(a) {
  return moinsfacteur(a);
} // Converts Mercator X to longitude.
function lon2x(a) {
  return plusfacteur(a);
} // Converts longitude to Mercator X.
function lonLatToMercator(ll) {
  return new OpenLayers.LonLat(lon2x(ll.lon), lat2y(ll.lat));
} // Converts OpenLayers.LonLat to Mercator.


/*
 * This section defines the HTML content structures used for various popups
 * displayed within the Openstreetbugs application. These popups provide
 * user interaction and information display for bug reports.
 */

/*
 * Adjusts the markup within a string, specifically converting `<hr />` tags
 * into paragraph structures with a "Comment" class, enhancing readability
 * and semantic correctness for comments.
 *
 * @param {string} str The input string containing markup.
 * @returns {string} The string with adjusted markup for comments.
 */
function fix_markup(str) {
  return str.replace(/<hr \/>/g, '</p><p class="Comment"><b>' + _('Comment:') + '</b> ');
}

/*
 * Generates the HTML markup for a popup that displays information about
 * an unresolved bug, including actions like adding comments, editing,
 * or marking as fixed.
 *
 * @param {object|number} bug_or_id Either a bug object or its ID.
 * @returns {string} The HTML string for the open bug popup.
 */
function popup_open_bug(bug_or_id) {
  // Retrieve the bug object if an ID was passed.
  bug = bug_or_id instanceof Object ? bug_or_id : get_bug(bug_or_id);

  // Construct the description part of the popup.
  var description = '<h1>' + _('Unresolved Error') + '</h1><p><b>' + _('Description:') + '</b> ' + fix_markup(bug.text) + '</p>';

  // Define action links for commenting, editing in Potlatch, and JOSM.
  var action_comment = '<ul><li><a href="#" onclick="add_comment(' + bug.id + '); return false;">' + _('Add comment') + '</a></li>';
  var action_edit = '<li><a href="http://www.openstreetmap.org/edit?lat=' + bug.lat + '&amp;lon=' + bug.lon + '&amp;zoom=17" target="_blank">' + _('Edit in Potlatch') + '</a></li>';

  // Calculate bounding box for JOSM link.
  var top = parseFloat(bug.lat) + 0.002;
  var bottom = top - 0.004;
  var left = parseFloat(bug.lon - 0.003);
  var right = left + 0.006;
  action_edit += '<li><a href="http://localhost:8111/load_and_zoom?top=' + top + '&amp;bottom=' + bottom + '&amp;left=' + left + '&amp;right=' + right + '" target="_blank">' + _('JOSM') + '</a></li>';

  // Define the action link for closing the bug.
  var action_close = '<li><a href="#" onclick="close_bug(' + bug.id + '); return false;">' + _('Mark as Fixed') + '</div></li></ul>';

  // Combine all parts to form the complete popup HTML.
  return description + action_comment + action_edit + action_close;
}

/*
 * Creates the HTML content for a popup that displays information about
 * a bug that has already been marked as fixed.
 *
 * @param {object|number} bug_or_id Either a bug object or its ID.
 * @returns {string} The HTML string for the closed bug popup.
 */
function popup_closed_bug(bug_or_id) {
  bug = bug_or_id instanceof Object ? bug_or_id : get_bug(bug_or_id);

  var description = '<h1>' + _('Fixed Error') + '</h1><p><b>' + _('Description:') + '</b> ' + fix_markup(bug.text) + '</p>';
  var note = '<p class="Note">' + _('This error has been fixed already. However, it might take a couple of days before the map image is updated.') + '</p>';

  return description + note;
}

/*
 * Generates the HTML markup for a popup that allows users to submit a
 * new bug report. It includes fields for description and an optional nickname.
 *
 * @param {number} x The x-coordinate (Mercator) where the bug is located.
 * @param {number} y The y-coordinate (Mercator) where the bug is located.
 * @param {string} nickname The user's optional nickname.
 * @returns {string} The HTML string for the new bug report form popup.
 */
function popup_add_bug(x, y, nickname) {
  var intro_text = '<h1>' + _('Create an Error Report') + '</h1><p>' + _('Please provide a short description of what\'s wrong here. You can also enter your nickname to show that you found the error.') + '</p>';
  var form_header = '<form><div><input type="hidden" name="lon" value="' + x2lon(x) + '"><input type="hidden" name="lat" value="' + y2lat(y) + '"></div>';
  var description = '<div><span class="InputLabel">' + _('Description:') + '</span><input type="text" id="description" name="text"></div>';
  var nickname = '<div><span class="InputLabel">' + _('Your Nickname:') + '</span><input type="text" id="nickname" value="' + (nickname ? nickname : 'NoName') + '"></div>';
  var form_footer = '<div class="FormFooter"><input type="button" value="' + _('OK') + '" onclick="add_bug_submit(this.form);"><input type="button" value="' + _('Cancel') + '" onclick="add_bug_cancel();"></div></form>';

  return intro_text + form_header + description + nickname + form_footer;
}

/*
 * Provides a simple HTML message indicating that a new bug report
 * is currently being submitted to the server.
 *
 * @returns {string} The HTML string for the submission wait message.
 */
function popup_add_bug_wait() {
  return '<h1>' + _('Create an Error Report') + '</h1><p>' + _('Please wait while your error is submitted ...') + '</p>';
}

/*
 * Generates the HTML for a popup containing a form to add a new comment
 * to an existing bug report.
 *
 * @param {object|number} bug_or_id Either a bug object or its ID.
 * @param {string} nickname The user's optional nickname.
 * @returns {string} The HTML string for the add comment form popup.
 */
function popup_add_comment(bug_or_id, nickname) {
  bug = bug_or_id instanceof Object ? bug_or_id : get_bug(bug_or_id);

  var description = '<h1>' + _('Add a Comment') + '</h1><p><b>' + _('Description:') + '</b> ' + fix_markup(bug.text) + '</p>';
  var form_header = '<form class="NewComment"><div><input type="hidden" name="id" value="' + bug.id + '"></div>';
  var comment = '<div><span class="InputLabel">' + _('Your Comment:') + '</span><input type="text" id="comment" name="text"></div>';
  var nickname = '<div><span class="InputLabel">' + _('Your Nickname:') + '</span><input type="text" id="nickname" value="' + (nickname ? nickname : 'NoName') + '"></div>';
  var form_footer = '<div class="FormFooter"><input type="button" value="' + _('OK') + '" onclick="add_comment_submit(' + bug.id + ', this.form);"><input type="button" value="' + _('Cancel') + '" onclick="reset_popup(' + bug.id + ');"></div></form>';

  return description + form_header + comment + nickname + form_footer;
}

/*
 * Creates the HTML markup for a confirmation dialog when a user attempts
 * to mark a bug as fixed. It includes a warning and a comment/nickname form.
 *
 * @param {object|number} bug_or_id Either a bug object or its ID.
 * @param {string} nickname The user's optional nickname.
 * @returns {string} The HTML string for the close bug confirmation popup.
 */
function popup_close_bug(bug_or_id, nickname) {
  bug = bug_or_id instanceof Object ? bug_or_id : get_bug(bug_or_id);

  var warning = '<h1>' + _('Mark Error as Fixed') + '</h1><p>' + _('Do you really want to mark this error as fixed? The error will be deleted after a week.') + '</p>';
  var form_header = '<form><div><input type="hidden" name="id" value="' + bug.id + '"></div>';
  var comment = '<div><span class="InputLabel">' + _('Your Comment:') + '</span><input type="text" id="comment" name="text"></div>';
  var nickname = '<div><span class="InputLabel">' + _('Your Nickname:') + '</span><input type="text" id="nickname" value="' + (nickname ? nickname : 'NoName') + '"></div>';
  var form_footer = '<div class="FormFooter"><input type="button" value="' + _('Yes') + '" onclick="close_bug_submit(' + bug.id + ', this.form);"><input type="button" value="' + _('No') + '" onclick="reset_popup(' + bug.id + ');"></div></form>';
  var description = '<p><b>' + _('Description:') + '</b> ' + fix_markup(bug.text) + '</p>';

  return warning + form_header + comment + nickname + form_footer + description;
}


/*
 * Core functions and global variables for the Openstreetbugs application.
 * These manage the map integration, bug data, and user interface state.
 */

// Base URL for images used by Openstreetbugs markers and icons.
var osb_img_path = "/client/";

// Reference to the OpenLayers map object where Openstreetbugs is active.
var osb_map = null;

// The URL path on the server where the Openstreetbugs server-side scripts reside.
var osb_server_path = null;

// The OpenLayers vector layer dedicated to displaying Openstreetbugs markers.
var osb_layer = null;

// An array holding all currently downloaded bug objects.
var osb_bugs = new Array();

// Tracks the current state of the user interface, particularly for popup management.
// 0: No popup open.
// 1: A bug information popup is open.
// 2: Adding a new bug / comment.
var osb_state = 0;
// Stores the OpenLayers feature object for the currently active popup.
var osb_current_feature = null;

// Controls the cursor style when hovering over the map.
// "default": standard cursor.
// "crosshair": active for adding new bugs.
var map_cursor = "default"

/*
 * Initializes the Openstreetbugs client on a given OpenLayers map object.
 * This function sets up the necessary layers, controls, and event listeners.
 *
 * @param {OpenLayers.Map} map The OpenLayers map instance to integrate with.
 * @param {string} server_path The base URL path to the Openstreetbugs server scripts.
 */
function init_openstreetbugs(map, server_path) {
  // Store references to the map object and server path.
  osb_map = map;
  osb_server_path = server_path;

  // Ensure the server path ends with a slash.
  if (osb_server_path.charAt(osb_server_path.length - 1) != "/") {
    osb_server_path += "/";
  }

  // Set the initial cursor style for the map element.
  document.getElementById("map").style.cursor = map_cursor;

  // Create a new OpenLayers Markers layer for bug display.
  osb_layer = new OpenLayers.Layer.Markers("OpenStreetBugs");
  // Set the layer's opacity for visual effect.
  osb_layer.setOpacity(0.7);

  // Add the bug layer to the map.
  osb_map.addLayer(osb_layer);

  // Register an event listener to refresh bugs when the map finishes moving.
  osb_map.events.register('moveend', osb_map, refresh_osb);

  // Create and activate a custom Click control for handling map clicks.
  var click = new OpenLayers.Control.Click();
  osb_map.addControl(click);
  click.activate();

  // Perform an initial refresh of bugs and sidebar content.
  refresh_osb();
  translate_sidebar();
}


/*
 * Functions for handling Asynchronous JavaScript and XML (AJAX) communications
 * with the Openstreetbugs server.
 */

/*
 * Constructs and executes an AJAX request to the server by dynamically
 * inserting a script tag into the document. This is typically used for
 * JSONP-style requests to fetch bug data.
 *
 * @param {string} url The relative URL endpoint for the request.
 * @param {object} params An object containing key-value pairs for URL parameters.
 */
function make_request(url, params) {
  // Prepend the server path to the relative URL.
  url = osb_server_path + url;

  // Append all parameters to the URL.
  for (var name in params) {
    url += (url.indexOf("?") > -1) ? "&" : "?"; // Determine if to use '?' or '&'.
    url += encodeURIComponent(name) + "=" + encodeURIComponent(params[name]); // Encode and append.
  }

  // Create a new script element and set its attributes.
  var script = document.createElement("script");
  script.src = url;
  script.type = "text/javascript";
  // Append the script to the document body to initiate the request.
  document.body.appendChild(script);
}

/*
 * This callback function is invoked by the dynamically loaded scripts
 * (from `make_request`) to add new bug markers to the map. It ensures
 * that duplicate bugs are not added.
 *
 * @param {number} id The unique identifier of the bug.
 * @param {number} lon The longitude of the bug.
 * @param {number} lat The latitude of the bug.
 * @param {string} text The description text of the bug.
 * @param {number} type The type of bug (0 for open, 1 for closed).
 */
function putAJAXMarker(id, lon, lat, text, type) {
  // Only add the bug if it doesn't already exist in the local list.
  if (!bug_exist(id)) {
    // Create a bug object.
    var bug = {
      id: id,
      text: text,
      lat: lat,
      lon: lon,
      type: type,
      feature: null
    };

    // Create an OpenLayers feature (marker) based on the bug type.
    if (bug.type == 0) { // Open bug
      bug.feature = create_feature(lon2x(lon), lat2y(lat), popup_open_bug(bug), type);
    } else { // Closed bug
      bug.feature = create_feature(lon2x(lon), lat2y(lat), popup_closed_bug(bug), type);
    }

    // Add the new bug to the global list of bugs.
    osb_bugs.push(bug);
  }
}

/*
 * Extracts all relevant form field values from a given form object
 * and formats them into a URL-encoded string suitable for submission.
 *
 * @param {HTMLFormElement} fobj The form element to process.
 * @returns {string} A URL-encoded string of form data.
 */
function get_form_values(fobj) {
  var str = "";
  var valueArr = null;
  var val = "";
  var cmd = "";

  // Iterate through each element in the form.
  for (var i = 0; i < fobj.elements.length; i++) {
    // Process elements based on their type.
    switch (fobj.elements[i].type) {
      case "text":
      case "textarea":
      case "hidden":
        str += fobj.elements[i].name + "=" + encodeURIComponent(fobj.elements[i].value) + "&";
        break;
      case "select-one":
        str += fobj.elements[i].name + "=" + fobj.elements[i].options[fobj.elements[i].selectedIndex].value + "&";
        break;
    }
  }
  // Remove the trailing '&' character.
  str = str.substr(0, (str.length - 1));
  return str;
}

/*
 * Submits a form's data to a specified URL using an AJAX POST request.
 * It allows for optional callback functions before and after submission.
 *
 * @param {HTMLFormElement} f The form element to submit.
 * @param {string} url The relative URL endpoint for submission.
 * @param {function} on_submitted Callback function executed before submission.
 * @param {function} on_finished Callback function executed after the request completes.
 */
function submit_form(f, url, on_submitted, on_finished) {
  url = osb_server_path + url; // Prepend server path.
  var str = get_form_values(f); // Get form data as a URL-encoded string.

  if (on_submitted) {
    on_submitted(); // Execute pre-submission callback.
  }
  get_xml(url, str, on_finished); // Send the AJAX request.
}

/*
 * Performs an AJAX POST request to the specified URL with the provided data string.
 * It uses XMLHttpRequest and supports a callback for when the request finishes.
 *
 * @param {string} url The target URL for the POST request.
 * @param {string} str The data string to send in the request body.
 * @param {function} on_finished Callback function executed upon request completion.
 */
function get_xml(url, str, on_finished) {
  var xhr; // XMLHttpRequest object.

  // Attempt to create XMLHttpRequest object for various browser environments.
  try {
    xhr = new ActiveXObject('Msxml2.XMLHTTP');
  } catch (e) {
    try {
      xhr = new ActiveXObject('Microsoft.XMLHTTP');
    } catch (e2) {
      try {
        xhr = new XMLHttpRequest();
      } catch (e3) {
        xhr = false; // If no XHR object can be created, set to false.
      }
    }
  }

  // Define the callback for when the readyState changes.
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) { // Request is complete.
      if (on_finished) {
        on_finished(xhr.status); // Execute callback with HTTP status.
      }
    }
  };

  xhr.open('POST', url, true); // Initialize the request (method, URL, async).
  // Set the content type header for POST requests.
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
  xhr.send(str); // Send the request with the data string.
}

/*
 * Functions dedicated to the management and display of Openstreetbugs
 * on the map. This includes downloading, filtering, and rendering bugs.
 */

/*
 * Refreshes the bug markers displayed on the map by requesting new data
 * from the server based on the current map view (bounds).
 */
function refresh_osb() {
  // Initialize or increment a call counter for unique request IDs.
  if (refresh_osb.call_count == undefined) {
    refresh_osb.call_count = 0;
  } else {
    ++refresh_osb.call_count;
  }

  // Get the current map extent (bounding box).
  bounds = osb_map.getExtent().toArray();
  // Convert Mercator bounds to geographical coordinates (lat/lon) and shorten them.
  b = shorter_coord(y2lat(bounds[1])); // Bottom latitude
  t = shorter_coord(y2lat(bounds[3])); // Top latitude
  l = shorter_coord(x2lon(bounds[0])); // Left longitude
  r = shorter_coord(x2lon(bounds[2])); // Right longitude

  // Update the sidebar content.
  refresh_sidebar();

  // Prepare parameters for the server request.
  var params = {
    "b": b,
    "t": t,
    "l": l,
    "r": r,
    "ucid": refresh_osb.call_count
  };
  // Make the AJAX request to fetch bugs.
  make_request("getBugs", params);
}

/*
 * Rounds a coordinate value to 5 decimal places to shorten its representation.
 * This is useful for URL parameters and display.
 *
 * @param {number} coord The coordinate value to shorten.
 * @returns {number} The shortened coordinate.
 */
function shorter_coord(coord) {
  return Math.round(coord * 100000) / 100000;
}

/*
 * Updates the content of the sidebar elements, such as permalinks,
 * RSS feeds, and GPX exports, based on the current map view.
 */
function refresh_sidebar() {
  // Retrieve current map parameters from the permalink object.
  var params = permalink.createParams();
  var zoom = params.zoom;
  var lon = params.lon;
  var lat = params.lat;
  var layers = params.layers;

  // Show/hide RSS and GPX links based on zoom level.
  if (zoom > 10) {
    document.getElementById("rsslink").style.display = "list-item";
    document.getElementById("rsslink").innerHTML = "<a href='" + osb_server_path + "getRSSfeed?b=" + b + "&t=" + t + "&l=" + l + "&r=" + r + "'>" + _("RSS feed") + "</a>";
    document.getElementById("gpxlink").style.display = "list-item";
    document.getElementById("gpxlink").innerHTML = "<a href='" + osb_server_path + "getGPX?b=" + b + "&t=" + t + "&l=" + l + "&r=" + r + "'>" + _("GPX export") + "</a>";
    document.getElementById("gpxlink2").style.display = "list-item";
    document.getElementById("gpxlink2").innerHTML = "<a href='" + osb_server_path + "getGPX?b=" + b + "&t=" + t + "&l=" + l + "&r=" + r + "&open=yes'>" + _("GPX export") + "</a>" + _(" (open bugs)");
  } else {
    document.getElementById("gpxlink").style.display = "none";
    document.getElementById("gpxlink2").style.display = "none";
    document.getElementById("rsslink").style.display = "none";
  }
  // Update permalink and other map service links.
  document.getElementById("permalink").innerHTML = "<a href='?lon=" + lon + "&lat=" + lat + "&zoom=" + zoom + "&layers=" + layers + "'>" + _("Permalink") + "</a>";
  document.getElementById("geofabrik").innerHTML = "<a href='http://tools.geofabrik.de/map/?lon=" + lon + "&lat=" + lat + "&zoom=" + zoom + "'>" + _("Geofabrik Map") + "</a>";
  document.getElementById("osmdotorg").innerHTML = "<a href='http://www.openstreetmap.org/?lon=" + lon + "&lat=" + lat + "&zoom=" + zoom + "'>" + _("OpenStreetMap.org") + "</a>";
}

/*
 * Checks if a bug with the given ID already exists in the locally
 * stored list of bugs.
 *
 * @param {number} id The ID of the bug to check.
 * @returns {boolean} True if the bug exists, false otherwise.
 */
function bug_exist(id) {
  for (var i in osb_bugs) {
    if (osb_bugs[i].id == id) {
      return true;
    }
  }
  return false;
}

/*
 * Retrieves a bug object from the local list using its unique ID.
 *
 * @param {number} id The ID of the bug to retrieve.
 * @returns {object|string} The bug object if found, otherwise an empty string.
 */
function get_bug(id) {
  for (var i in osb_bugs) {
    if (osb_bugs[i].id == id) {
      return osb_bugs[i];
    }
  }
  return '';
}

/*
 * Creates an OpenLayers feature (marker) at the specified coordinates,
 * associating it with popup content and a specific icon based on bug type.
 *
 * @param {number} x The Mercator x-coordinate for the feature.
 * @param {number} y The Mercator y-coordinate for the feature.
 * @param {string} popup_content The HTML content to display in the feature's popup.
 * @param {number} type The type of bug (0 for open, 1 for closed) to determine the icon.
 * @returns {OpenLayers.Feature} The newly created OpenLayers feature object.
 */
function create_feature(x, y, popup_content, type) {
  // Initialize icon objects only once to avoid re-creating them.
  if (!create_feature.open_bug_icon) {
    icon_size = new OpenLayers.Size(22, 22);
    icon_offset = new OpenLayers.Pixel(-icon_size.w / 2, -icon_size.h / 2);
    create_feature.open_bug_icon = new OpenLayers.Icon(osb_img_path + 'open_bug_marker.png', icon_size, icon_offset);
    create_feature.closed_bug_icon = new OpenLayers.Icon(osb_img_path + 'closed_bug_marker.png', icon_size, icon_offset);
  }

  // Select the appropriate icon based on bug type.
  var icon = !type ? create_feature.open_bug_icon.clone() : create_feature.closed_bug_icon.clone();
  // Create the OpenLayers feature.
  var feature = new OpenLayers.Feature(osb_layer, new OpenLayers.LonLat(x, y), {
    icon: icon
  });
  // Set popup properties.
  // Note: closeBox should ideally be true, but current implementation requires it to be false
  // to avoid conflicts with marker click behavior.
  feature.closeBox = false;
  feature.popupClass = OpenLayers.Class(OpenLayers.Popup.FramedCloud);
  feature.data.popupContentHTML = popup_content;

  // Add the marker associated with this feature to the map layer.
  create_marker(feature);

  return feature;
}

/*
 * Attaches event listeners (click, mouseover, mouseout) to an OpenLayers
 * marker associated with a feature, managing popup display and cursor changes.
 *
 * @param {OpenLayers.Feature} feature The OpenLayers feature whose marker needs event listeners.
 */
function create_marker(feature) {
  var marker = feature.createMarker(); // Get the marker object from the feature.

  // Define the click event handler for the marker.
  var marker_click = function(ev) {
    if (osb_state == 0) { // If no popup is currently open.
      this.createPopup(this.closeBox); // Create the popup.
      osb_map.addPopup(this.popup); // Add it to the map.
      osb_state = 1; // Update UI state to indicate a popup is open.
      osb_current_feature = this; // Store reference to the current feature.
    } else if (osb_state == 1 && osb_current_feature == this) { // If the same popup is clicked again.
      osb_map.removePopup(this.popup) // Close the popup.
      osb_state = 0; // Reset UI state.
      osb_current_feature = null; // Clear current feature.
    }
    OpenLayers.Event.stop(ev); // Stop event propagation.
  };

  // Define the mouseover event handler for the marker.
  var marker_mouseover = function(ev) {
    if (osb_state == 0) { // If no popup is open, show a temporary popup and change cursor.
      document.getElementById("map").style.cursor = "pointer";
      this.createPopup(this.closeBox);
      osb_map.addPopup(this.popup)
    } else if (osb_state != 2 && this == osb_current_feature) { // If adding a new bug, show pointer over current feature.
      document.getElementById("map").style.cursor = "pointer";
    }
    OpenLayers.Event.stop(ev);
  };

  // Define the mouseout event handler for the marker.
  var marker_mouseout = function(ev) {
    if (osb_state == 0) { // If no popup was open, remove the temporary popup and reset cursor.
      document.getElementById("map").style.cursor = map_cursor;
      osb_map.removePopup(this.popup);
    } else { // Otherwise, reset cursor to default.
      document.getElementById("map").style.cursor = "default";
    }
    OpenLayers.Event.stop(ev);
  };

  // Register event listeners for the marker.
  // Important: marker_click must be registered as 'click' and not 'mousedown' to avoid
  // interfering with the map's click control.
  marker.events.register('click', feature, marker_click);
  marker.events.register('mouseover', feature, marker_mouseover);
  marker.events.register('mouseout', feature, marker_mouseout);

  // Add the configured marker to the OpenLayers bug layer.
  osb_layer.addMarker(marker);
}