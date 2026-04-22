/*
 * This software is licensed under an open-source license,
 * similar to the GNU General Public License version 3 or any later version.
 * For more details, consult the accompanying license file or visit
 * <http://www.gnu.org/licenses/>.
 */


/*
 * This module provides client-side functionality for a mapping application's
 * bug reporting system. To integrate, include this file and invoke
 * 'initializeIssueTracker' with a map object and the server endpoint path.
 *
 * Refer to 'osb-example.html' for a practical implementation example.
 */


/*
 * General-purpose helper routines
 */

/* Removes any leading or trailing whitespace characters from a string.
 */
function trimText( inputString )
{
  return inputString.replace( /^\s+|\s+$/g, "" );
}

/* Converts special HTML characters within a string into their entity equivalents.
 */
function sanitizeHTML( inputString )
{
  if ( typeof inputString !== 'string' )
    inputString = inputString.toString();

  inputString = inputString.replace( /&/g, "&amp;" );
  inputString = inputString.replace( /"/g, "&quot;" );
  inputString = inputString.replace( /</g, "&lt;" );
  inputString = inputString.replace( />/g, "&gt;" );
  inputString = inputString.replace( /'/g, "&#146;" );
  return inputString;
}

/* Persists a given value into a session cookie identified by 'cookieName'.
 */
function storeCookieValue( cookieName, cookieValue )
{
  var expirationDate = ( new Date( ( new Date() ).getTime() + 604800000 ) ).toGMTString(); // One week validity
  document.cookie = cookieName + "=" + escape( cookieValue ) + ";expires=" + expirationDate + ";";
}

/* Retrieves the value associated with a specific cookie 'cookieName'.
 */
function retrieveCookieValue( cookieName )
{
  if ( document.cookie )
  {
    var cookieParts = document.cookie.split( ";" );
    for ( var idx in cookieParts )
    {
      var part = cookieParts[idx].split( "=" );
      if ( trimText( part[0] ) == cookieName ) return unescape( trimText( part[1] ) );
    }
  }
  return null;
}

/* These routines perform geographic coordinate transformations.
 */
function scaleUp( coordInput ) { return coordInput * ( 20037508.34 / 180 ); }
function scaleDown( coordInput ) { return coordInput / ( 20037508.34 / 180 ); }
function mercYToLat( coordInput ) { return 180 / Math.PI * ( 2 * Math.atan( Math.exp( scaleDown( coordInput ) * Math.PI / 180 ) ) - Math.PI / 2 ); }
function latToMercY( coordInput ) { return scaleUp( 180 / Math.PI * Math.log( Math.tan( Math.PI / 4 + coordInput * ( Math.PI / 180 ) / 2 ) ) ); }
function mercXToLon( coordInput ) { return scaleDown( coordInput ); }
function lonToMercX( coordInput ) { return scaleUp( coordInput ); }
function geoPointToMercator( geographicPoint ) { return new OpenLayers.LonLat( lonToMercX( geographicPoint.lon ), latToMercY( geographicPoint.lat ) ); }


/*
 * HTML content for various issue popups displayed by the system.
 */

/* Replaces specific markup tags with paragraph and comment styling for better presentation.
 */
function adjustCommentMarkup( inputString )
{
  return inputString.replace( /<hr \/>/g, '</p><p class="Comment"><b>' + getLocalizedString( 'Comment:' ) + '</b> ' );
}

/* Generates HTML for popups related to unresolved issues.
 */
function renderOpenIssuePopup( issueOrIdentifier )
{
  var currentIssue = ( issueOrIdentifier instanceof Object ) ? issueOrIdentifier : retrieveIssueDetails( issueOrIdentifier );

  var issueDescription = '<h1>' + getLocalizedString( 'Unresolved Error' ) + '</h1><p><b>' + getLocalizedString( 'Description:' ) + '</b> ' + adjustCommentMarkup( currentIssue.text ) + '</p>';
  var commentActionLink = '<ul><li><a href="#" onclick="appendIssueComment(' + currentIssue.id + '); return false;">' + getLocalizedString( 'Add comment' ) + '</a></li>';
  var editActionLink = '<li><a href="http://www.openstreetmap.org/edit?lat=' + currentIssue.lat + '&amp;lon=' + currentIssue.lon + '&amp;zoom=17" target="_blank">' + getLocalizedString( 'Edit in Potlatch' ) + '</a></li>';
  var boundaryTop = parseFloat( currentIssue.lat ) + 0.002;
  var boundaryBottom = boundaryTop - 0.004;
  var boundaryLeft = parseFloat( currentIssue.lon - 0.003 );
  var boundaryRight = boundaryLeft + 0.006;
  editActionLink += '<li><a href="http://localhost:8111/load_and_zoom?top=' + boundaryTop + '&amp;bottom=' + boundaryBottom + '&amp;left=' + boundaryLeft + '&amp;right=' + boundaryRight + '" target="_blank">' + getLocalizedString( 'JOSM' ) + '</a></li>';
  var closeActionLink = '<li><a href="#" onclick="initiateIssueClosure(' + currentIssue.id + '); return false;">' + getLocalizedString( 'Mark as Fixed' ) + '</a></div></li></ul>';

  return issueDescription + commentActionLink + editActionLink + closeActionLink;
}

/* Generates HTML for popups displaying information about resolved issues.
 */
function renderClosedIssuePopup( issueOrIdentifier )
{
  var currentIssue = ( issueOrIdentifier instanceof Object ) ? issueOrIdentifier : retrieveIssueDetails( issueOrIdentifier );

  var issueDescription = '<h1>' + getLocalizedString( 'Fixed Error' ) + '</h1><p><b>' + getLocalizedString( 'Description:' ) + '</b> ' + adjustCommentMarkup( currentIssue.text ) + '</p>';
  var resolutionNote = '<p class="Note">' + getLocalizedString( 'This error has been fixed already. However, it might take a couple of days before the map image is updated.' ) + '</p>';

  return issueDescription + resolutionNote;
}

/* Generates HTML for the form used to report a new issue.
 */
function renderNewIssueForm( mercX, mercY, userAlias )
{
  var formIntroText = '<h1>' + getLocalizedString( 'Create an Error Report' ) + '</h1><p>' + getLocalizedString( 'Please provide a short description of what\'s wrong here. You can also enter your nickname to show that you found the error.' ) + '</p>';
  var formStartSection = '<form><div><input type="hidden" name="lon" value="' + mercXToLon( mercX ) + '"><input type="hidden" name="lat" value="' + mercYToLat( mercY ) + '"></div>';
  var issueDescription = '<div><span class="InputLabel">' + getLocalizedString( 'Description:' ) + '</span><input type="text" id="description" name="text"></div>';
  var nicknameInput = '<div><span class="InputLabel">' + getLocalizedString( 'Your Nickname:' ) + '</span><input type="text" id="nickname" value="' + ( userAlias ? userAlias : 'NoName' ) + '"></div>';
  var formEndSection = '<div class="FormFooter"><input type="button" value="' + getLocalizedString( 'OK' ) + '" onclick="submitNewIssueReport(this.form);"><input type="button" value="' + getLocalizedString( 'Cancel' ) + '" onclick="cancelNewIssueReport();"></div></form>';

  return formIntroText + formStartSection + issueDescription + nicknameInput + formEndSection;
}

/* Generates HTML for a popup indicating that a new issue report is being submitted.
 */
function renderIssueSubmissionWait()
{
  return '<h1>' + getLocalizedString( 'Create an Error Report' ) + '</h1><p>' + getLocalizedString( 'Please wait while your error is submitted ...' ) + '</p>';
}

/* Generates HTML for a popup containing a form to add a comment to an existing issue.
 */
function renderAddCommentForm( issueOrIdentifier, userAlias )
{
  var currentIssue = ( issueOrIdentifier instanceof Object ) ? issueOrIdentifier : retrieveIssueDetails( issueOrIdentifier );

  var issueDescription = '<h1>' + getLocalizedString( 'Add a Comment' ) + '</h1><p><b>' + getLocalizedString( 'Description:' ) + '</b> ' + adjustCommentMarkup( currentIssue.text ) + '</p>';
  var formStartSection = '<form class="NewComment"><div><input type="hidden" name="id" value="' + currentIssue.id + '"></div>';
  var commentInput = '<div><span class="InputLabel">' + getLocalizedString( 'Your Comment:' ) + '</span><input type="text" id="comment" name="text"></div>';
  var nicknameInput = '<div><span class="InputLabel">' + getLocalizedString( 'Your Nickname:' ) + '</span><input type="text" id="nickname" value="' + ( userAlias ? userAlias : 'NoName' ) + '"></div>';
  var formEndSection = '<div class="FormFooter"><input type="button" value="' + getLocalizedString( 'OK' ) + '" onclick="submitCommentForIssue(' + currentIssue.id + ', this.form);"><input type="button" value="' + getLocalizedString( 'Cancel' ) + '" onclick="resetFeaturePopup(' + currentIssue.id + ');"></div></form>';

  return issueDescription + formStartSection + commentInput + nicknameInput + formEndSection;
}

/* Generates HTML for a popup requesting confirmation to mark an issue as fixed.
 */
function renderConfirmCloseIssue( issueOrIdentifier, userAlias )
{
  var currentIssue = ( issueOrIdentifier instanceof Object ) ? issueOrIdentifier : retrieveIssueDetails( issueOrIdentifier );

  var closureWarning = '<h1>' + getLocalizedString( 'Mark Error as Fixed' ) + '</h1><p>' + getLocalizedString( 'Do you really want to mark this error as fixed? The error will be deleted after a week.' ) + '</p>';
  var formStartSection = '<form><div><input type="hidden" name="id" value="' + currentIssue.id + '"></div>';
  var commentInput = '<div><span class="InputLabel">' + getLocalizedString( 'Your Comment:' ) + '</span><input type="text" id="comment" name="text"></div>';
  var nicknameInput = '<div><span class="InputLabel">' + getLocalizedString( 'Your Nickname:' ) + '</span><input type="text" id="nickname" value="' + ( userAlias ? userAlias : 'NoName' ) + '"></div>';
  var formEndSection = '<div class="FormFooter"><input type="button" value="' + getLocalizedString( 'Yes' ) + '" onclick="confirmIssueClosure(' + currentIssue.id + ', this.form);"><input type="button" value="' + getLocalizedString( 'No' ) + '" onclick="resetFeaturePopup(' + currentIssue.id + ');"></div></form>';
  var issueDescription = '<p><b>' + getLocalizedString( 'Description:' ) + '</b> ' + adjustCommentMarkup( currentIssue.text ) + '</p>';

  return closureWarning + formStartSection + commentInput + nicknameInput + formEndSection + issueDescription;
}


/*
 * Core functionality for the issue tracking system.
 */

/* Base path for marker icons used by the issue tracker:
 */
var issueIconDirectory = "/client/";

/* The OpenLayers map object where issues are displayed:
 */
var displayMapObject = null;

/* The URL endpoint on the server for issue-related scripts:
 */
var backendServiceURL = null;

/* OpenLayers layer dedicated to displaying issue markers:
 */
var issueMarkerLayer = null;

/* Collection of issues currently loaded and cached:
 */
var cachedIssues = [];

/* Current operational state of the user interface. This helps manage popup displays.
 */
var interfaceStatus = 0;
var activeMapFeature = null;

/* Cursor appearance when hovering over the map.
 * "default" for normal, "crosshair" for active drawing.
 */
var currentMapCursor = "default";

/* Initiates the issue tracking system on the provided map.
 * The 'map' argument should be an OpenLayers.Map instance.
 * 'serviceEndpoint' specifies the server-side script location.
 */
function initializeIssueTracker( map, serviceEndpoint )
{
  displayMapObject = map;
  backendServiceURL = serviceEndpoint;
  if ( backendServiceURL.charAt( backendServiceURL.length - 1 ) != "/" )
    backendServiceURL += "/";

  document.getElementById( "map" ).style.cursor = currentMapCursor;

  issueMarkerLayer = new OpenLayers.Layer.Markers( "OpenStreetBugs" );
  issueMarkerLayer.setOpacity( 0.7 );

  displayMapObject.addLayer( issueMarkerLayer );

  displayMapObject.events.register( 'moveend', displayMapObject, reloadIssueMarkers );

  var mapClickListener = new OpenLayers.Control.Click();
  displayMapObject.addControl( mapClickListener );
  mapClickListener.activate();

  reloadIssueMarkers();
  updateSidebarLinks();
}


/*
 * Asynchronous JavaScript and XML (AJAX) operations.
 */

/* Sends a request for issue data to the server.
 */
function dispatchServerRequest( resourcePath, requestParameters )
{
  resourcePath = backendServiceURL + resourcePath;
  for ( var paramName in requestParameters )
  {
    resourcePath += ( resourcePath.indexOf( "?" ) > -1 ) ? "&" : "?";
    resourcePath += encodeURIComponent( paramName ) + "=" + encodeURIComponent( requestParameters[paramName] );
  }

  var dynamicScriptElement = document.createElement( "script" );
  dynamicScriptElement.src = resourcePath;
  dynamicScriptElement.type = "text/javascript";
  document.body.appendChild( dynamicScriptElement );
}

/* This method is invoked by scripts returned from 'dispatchServerRequest' calls.
 */
function placeIssueMarker( issueID, longitude, latitude, issueText, issueType )
{
  if ( !issueAlreadyExists( issueID ) )
  {
    var currentIssue = { id: issueID, text: issueText, lat: latitude, lon: longitude, type: issueType, feature: null };

    if ( currentIssue.type == 0 )
      currentIssue.feature = generateMapFeature( lonToMercX( longitude ), latToMercY( latitude ), renderOpenIssuePopup( currentIssue ), issueType );
    else
      currentIssue.feature = generateMapFeature( lonToMercX( longitude ), latToMercY( latitude ), renderClosedIssuePopup( currentIssue ), issueType );

    cachedIssues.push( currentIssue );
  }
}

/* Extracts form input values into a URL-encoded string.
 */
function extractFormPayload( formObject )
{
  var serializedData = "";
  var elementValue = "";
  for ( var elemIndex = 0; elemIndex < formObject.elements.length; elemIndex++ )
  {
    switch ( formObject.elements[elemIndex].type )
    {
      case "text":
      case "textarea":
      case "hidden":
        serializedData += formObject.elements[elemIndex].name + "=" + encodeURIComponent( formObject.elements[elemIndex].value ) + "&";
        break;
      case "select-one":
        serializedData += formObject.elements[elemIndex].name + "=" + formObject.elements[elemIndex].options[formObject.elements[elemIndex].selectedIndex].value + "&";
        break;
    }
  }
  serializedData = serializedData.substr( 0, ( serializedData.length - 1 ) );
  return serializedData;
}

/* Submits form data to a specified URL using an AJAX POST request.
 */
function submitFormData( submissionForm, resourcePath, onSubmissionStart, onSubmissionComplete )
{
  resourcePath = backendServiceURL + resourcePath;
  var serializedData = extractFormPayload( submissionForm );
  if ( onSubmissionStart )
    onSubmissionStart();
  executeXmlHttpRequest( resourcePath, serializedData, onSubmissionComplete );
}

/* Executes an XMLHttpRequest (AJAX) to send data to the server.
 */
function executeXmlHttpRequest( resourcePath, serializedData, onSubmissionComplete )
{
  var xmlHttpReq;
  try { xmlHttpReq = new ActiveXObject( 'Msxml2.XMLHTTP' ); }
  catch ( e )
  {
    try { xmlHttpReq = new ActiveXObject( 'Microsoft.XMLHTTP' ); }
    catch ( e2 )
    {
      try { xmlHttpReq = new XMLHttpRequest(); }
      catch ( e3 ) { xmlHttpReq = false; }
    }
  }

  xmlHttpReq.onreadystatechange = function()
  {
    if ( xmlHttpReq.readyState == 4 )
    {
      if ( onSubmissionComplete )
        onSubmissionComplete( xmlHttpReq.status );
    }
  };

  xmlHttpReq.open( 'POST', resourcePath, true );
  xmlHttpReq.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded; charset=UTF-8" );
  xmlHttpReq.send( serializedData );
}


/*
 * Issue management functions.
 */

/* Requests and downloads new issue markers from the server based on the current map view.
 */
function reloadIssueMarkers()
{
  if ( reloadIssueMarkers.requestCounter == undefined )
    reloadIssueMarkers.requestCounter = 0;
  else
    ++reloadIssueMarkers.requestCounter;

  var mapBoundaries = displayMapObject.getExtent().toArray();
  var southBound = trimCoordinatePrecision( mercYToLat( mapBoundaries[1] ) );
  var northBound = trimCoordinatePrecision( mercYToLat( mapBoundaries[3] ) );
  var westBound = trimCoordinatePrecision( mercXToLon( mapBoundaries[0] ) );
  var eastBound = trimCoordinatePrecision( mercXToLon( mapBoundaries[2] ) );

  updateSidebarLinks();

  var requestParameters = { "b": southBound, "t": northBound, "l": westBound, "r": eastBound, "ucid": reloadIssueMarkers.requestCounter };
  dispatchServerRequest( "getBugs", requestParameters );
}

/* Rounds a coordinate value to 5 decimal places for precision.
 */
function trimCoordinatePrecision( coordinateValue )
{
  return Math.round( coordinateValue * 100000 ) / 100000;
}

/* Updates the dynamic links in the sidebar based on the current map state.
 */
function updateSidebarLinks()
{
  var linkParameters = permanentLinkGenerator.createParams();
  var currentZoomLevel = linkParameters.zoom;
  var currentLongitude = linkParameters.lon;
  var currentLatitude = linkParameters.lat;
  var activeLayers = linkParameters.layers;

  if ( currentZoomLevel > 10 ) {
    document.getElementById( "rsslink" ).style.display = "list-item";
    document.getElementById( "rsslink" ).innerHTML = "<a href='" + backendServiceURL + "getRSSfeed?b=" + southBound + "&t=" + northBound + "&l=" + westBound + "&r=" + eastBound + "'>" + getLocalizedString( "RSS feed" ) + "</a>";
    document.getElementById( "gpxlink" ).style.display = "list-item";
    document.getElementById( "gpxlink" ).innerHTML = "<a href='" + backendServiceURL + "getGPX?b=" + southBound + "&t=" + northBound + "&l=" + westBound + "&r=" + eastBound + "'>" + getLocalizedString( "GPX export" ) + "</a>";
    document.getElementById( "gpxlink2" ).style.display = "list-item";
    document.getElementById( "gpxlink2" ).innerHTML = "<a href='" + backendServiceURL + "getGPX?b=" + southBound + "&t=" + northBound + "&l=" + westBound + "&r=" + eastBound + "&open=yes'>" + getLocalizedString( "GPX export" ) + "</a>" + getLocalizedString( " (open bugs)" );
  } else {
    document.getElementById( "gpxlink" ).style.display = "none";
    document.getElementById( "gpxlink2" ).style.display = "none";
    document.getElementById( "rsslink" ).style.display = "none";
  }
  document.getElementById( "permalink" ).innerHTML = "<a href='?lon=" + currentLongitude + "&lat=" + currentLatitude + "&zoom=" + currentZoomLevel + "&layers=" + activeLayers + "'>" + getLocalizedString( "Permalink" ) + "</a>";
  document.getElementById( "geofabrik" ).innerHTML = "<a href='http://tools.geofabrik.de/map/?lon=" + currentLongitude + "&lat=" + currentLatitude + "&zoom=" + currentZoomLevel + "'>" + getLocalizedString( "Geofabrik Map" ) + "</a>";
  document.getElementById( "osmdotorg" ).innerHTML = "<a href='http://www.openstreetmap.org/?lon=" + currentLongitude + "&lat=" + currentLatitude + "&zoom=" + currentZoomLevel + "'>" + getLocalizedString( "OpenStreetMap.org" ) + "</a>";
}

/* Determines if an issue with the given ID has already been loaded.
 */
function issueAlreadyExists( issueID )
{
  for ( var idx in cachedIssues )
  {
    if ( cachedIssues[idx].id == issueID )
      return true;
  }
  return false;
}

/* Retrieves an issue's details from the cached list by its ID.
 */
function retrieveIssueDetails( issueID )
{
  for ( var idx in cachedIssues )
  {
    if ( cachedIssues[idx].id == issueID )
      return cachedIssues[idx];
  }
  return '';
}

/* Constructs a map feature and places a corresponding marker on the map.
 */
function generateMapFeature( xCoord, yCoord, popupDisplayContent, issueType )
{
  if ( !generateMapFeature.unresolvedIcon )
  {
    var markerIconDimensions = new OpenLayers.Size( 22, 22 );
    var markerIconOffset = new OpenLayers.Pixel( -markerIconDimensions.w / 2, -markerIconDimensions.h / 2 );
    generateMapFeature.unresolvedIcon = new OpenLayers.Icon( issueIconDirectory + 'open_bug_marker.png', markerIconDimensions, markerIconOffset );
    generateMapFeature.resolvedIcon = new OpenLayers.Icon( issueIconDirectory + 'closed_bug_marker.png', markerIconDimensions, markerIconOffset );
  }

  var currentMarkerIcon = !issueType ? generateMapFeature.unresolvedIcon.clone() : generateMapFeature.resolvedIcon.clone();
  var mapFeature = new OpenLayers.Feature( issueMarkerLayer, new OpenLayers.LonLat( xCoord, yCoord ), { icon: currentMarkerIcon } );
  // Note: closeBox should ideally be true, but it can lead to erratic behavior with marker clicks.
  mapFeature.closeBox = false;
  mapFeature.popupClass = OpenLayers.Class( OpenLayers.Popup.FramedCloud );
  mapFeature.data.popupContentHTML = popupDisplayContent;

  instantiateMarker( mapFeature );

  return mapFeature;
}

/* Creates an OpenLayers marker from a feature and attaches event handlers.
 */
function instantiateMarker( mapFeature )
{
  var mapMarker = mapFeature.createMarker();
  var markerClickHandler = function ( eventObject )
  {
    if ( interfaceStatus == 0 )
    {
      this.createPopup( this.closeBox );
      displayMapObject.addPopup( this.popup );
      interfaceStatus = 1;
      activeMapFeature = this;
    }
    else if ( interfaceStatus == 1 && activeMapFeature == this )
    {
      displayMapObject.removePopup( this.popup );
      interfaceStatus = 0;
      activeMapFeature = null;
    }
    OpenLayers.Event.stop( eventObject );
  };
  var markerMouseOverHandler = function ( eventObject )
  {
    if ( interfaceStatus == 0 )
    {
      document.getElementById( "map" ).style.cursor = "pointer";
      this.createPopup( this.closeBox );
      displayMapObject.addPopup( this.popup );
    }
    else if ( interfaceStatus != 2 && this == activeMapFeature ) /* If not adding a new issue, show pointer over the current feature */
      document.getElementById( "map" ).style.cursor = "pointer";

    OpenLayers.Event.stop( eventObject );
  };
  var markerMouseOutHandler = function ( eventObject )
  {
    if ( interfaceStatus == 0 )
    {
      document.getElementById( "map" ).style.cursor = currentMapCursor;
      displayMapObject.removePopup( this.popup );
    }
    else
      document.getElementById( "map" ).style.cursor = "default";
    OpenLayers.Event.stop( eventObject );
  };
  /* The marker click event must be registered as a 'click' event, not 'mousedown',
   * to prevent event propagation conflicts with the map click control.
   */
  mapMarker.events.register( 'click', mapFeature, markerClickHandler );
  mapMarker.events.register( 'mousedown', mapFeature, markerClickHandler );
  mapMarker.events.register( 'mouseover', mapFeature, markerMouseOverHandler );
  mapMarker.events.register( 'mouseout', mapFeature, markerMouseOutHandler );
  issueMarkerLayer.addMarker( mapMarker );
}

/* Placeholder for internationalization function, returning the input string for now.
 * In a real application, this would fetch translated strings.
 */
function getLocalizedString( textKey ) { return textKey; }

/* Initiates the process to add a comment to a specific issue.
 */
function appendIssueComment( issueIdentifier )
{
  // Implementation of adding comment
}

/* Submits a new issue report form to the server.
 */
function submitNewIssueReport( submissionForm )
{
  // Implementation for submitting new issue
}

/* Cancels the new issue report process, closing the form.
 */
function cancelNewIssueReport()
{
  // Implementation for canceling new issue
}

/* Submits a comment for a specific issue to the server.
 */
function submitCommentForIssue( issueIdentifier, submissionForm )
{
  // Implementation for submitting comment
}

/* Resets the popup display for a given map feature.
 */
function resetFeaturePopup( featureIdentifier )
{
  // Implementation for resetting popup
}

/* Initiates the closure process for a specific issue.
 */
function initiateIssueClosure( issueIdentifier )
{
  // Implementation for initiating closure
}

/* Confirms and submits the closure of an issue to the server.
 */
function confirmIssueClosure( issueIdentifier, submissionForm )
{
  // Implementation for confirming closure
}

/* Placeholder for a permalink generator object.
 * In a real application, this would be part of a larger OpenLayers utility.
 */
var permanentLinkGenerator = {
  createParams: function() {
    // Mock implementation for demonstration
    return { zoom: 12, lon: 13.4, lat: 52.5, layers: 'OSM' };
  }
};