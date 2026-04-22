function initializeApplication() {
  // This function sets up the initial event listener when the document body is fully loaded.
  document.addEventListener("deviceready", executeSetup, false);
}

var cachedTileStoreName; // Stores the local name of the MBTiles file.
var externalTileSourceURL; // The web address for the tile data to be fetched.
var statusDisplayElement; // Reference to the HTML element for showing progress and messages.

cachedTileStoreName = 'atlas.mbtiles';
externalTileSourceURL = 'http://dl.dropbox.com/u/14814828/OSMBrightSLValley.mbtiles'; // A remote source for map data.

function executeSetup() {
	var fileSystemInstance; // Represents the device's file system.
	var dataTransferHandler; // Utility for handling file downloads.

	statusDisplayElement = document.getElementById('statusOutput'); // Grab the output element.
	
	console.log('Initiating file system access request...');
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (storageAccessObject) {
		console.log('File system access granted.');
		fileSystemInstance = storageAccessObject; // Assign the obtained file system object.

		// Verify if the required map data file already exists on the device.
		var targetFileEntry = fileSystemInstance.root.getFile(cachedTileStoreName, { create: false }, function () {
			// Local file is present.
			console.log('Target file already present.');

			statusDisplayElement.innerHTML = 'Map data found on device. Preparing display...';

			constructMapView(); // Proceed to render the map.
		}, function () {
			// Local file is missing.
			console.log('Target file not found.');

			statusDisplayElement.innerHTML = 'Downloading map data (~14 MB)...';

			console.log('Commencing download of spatial database file...');
			dataTransferHandler = new FileTransfer();
			dataTransferHandler.download(externalTileSourceURL, fileSystemInstance.root.fullPath + '/' + cachedTileStoreName, function (downloadResult) {
				console.log('Download finished successfully: ' + downloadResult.fullPath);

				constructMapView(); // Render the map after successful download.

			}, function (issue) {
				console.log('An error occurred during download:', issue);
			});
		});
} );
}

function constructMapView() {
	var sqliteDatabase = new SQLitePlugin(cachedTileStoreName); // Initialize the SQLite plugin with the local file.

	// Remove the status message element from the document body as it's no longer needed.
	document.body.removeChild(statusDisplayElement);

	var leafletMapInstance = new L.Map('viewContainer', { // Create a new Leaflet map instance.
		center: new L.LatLng(40.6681, -111.9364), // Set initial geographic coordinates.
		zoom: 11 // Set initial zoom level.
	});

	var tileLayerObject = new L.TileLayer.MBTiles('', { maxZoom: 14, scheme: 'tms' }, sqliteDatabase); // Create a new MBTiles layer.

	leafletMapInstance.addLayer(tileLayerObject); // Add the tile layer to the map.
}