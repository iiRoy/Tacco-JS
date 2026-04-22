const appResources = Object.freeze({
  localCacheFilename: 'device_map_cache.mbtiles', // Renamed from 'localFileName'
  remoteDownloadUrl: 'https://dl.dropboxusercontent.com/s/some_unique_id/OSMBrightSLValley.mbtiles?dl=1', // Renamed from 'remoteFile', example URL updated
  mapConfig: {
    initialCenter: { lat: 40.6681, lng: -111.9364 }, // Central coordinates for the map view
    initialZoomLevel: 11,
    maximumTileZoom: 14,
    tileSchemeType: 'tms' // Tile Map Service scheme
  },
  statusElementId: 'message' // ID of the DOM element to display application status
});

// Reference to the DOM element used for displaying real-time application status.
// Declared with 'let' as its value is assigned dynamically after the DOM is ready.
let appStatusDisplayElement; // Renamed from 'msg'

// A simple logging utility for consistent console output.
const appLogger = {
  log: (context, message, ...args) => console.log(`[APP-INFO] [${context}] ${message}`, ...args),
  error: (context, message, ...args) => console.error(`[APP-ERROR] [${context}] ${message}`, ...args),
  warn: (context, message, ...args) => console.warn(`[APP-WARNING] [${context}] ${message}`, ...args)
};

/**
 * Initializes the application by setting up the 'deviceready' event listener.
 * This function should be called once the DOM is fully loaded.
 */
function initializeApplicationLifecycle() { // Renamed from 'onBodyLoad'
  const context = 'InitLifecycle';

  // Basic validation to ensure document and event listeners are available.
  if (typeof document === 'undefined' || typeof document.addEventListener === 'undefined') {
    appLogger.error(context, "Document object or event listener API not available. Aborting initialization.");
    return;
  }

  // Attaches an event listener for the Cordova 'deviceready' event.
  // Once the device is ready, the core resource management logic will be triggered.
  document.addEventListener("deviceready", orchestrateResourceHandling, false); // Renamed 'go'
  appLogger.log(context, "Device readiness listener successfully registered.");
}

/**
 * Main application entry point once the device is ready.
 * Manages the lifecycle of map data resources: checking local cache or downloading.
 */
function orchestrateResourceHandling() { // Renamed from 'go'
  const context = 'ResourceOrchestration';

  // Retrieve the DOM element for displaying status messages.
  appStatusDisplayElement = document.getElementById(appResources.statusElementId);
  if (!appStatusDisplayElement) {
    appLogger.error(context, `Status display element with ID '${appResources.statusElementId}' not found. Cannot proceed with user feedback.`);
    return; // Critical UI component missing.
  }

  appLogger.log(context, "Requesting access to the persistent file system for map data.");

  // Validate the availability of the Cordova File System API.
  if (typeof window.requestFileSystem === 'undefined' || typeof LocalFileSystem === 'undefined') {
    appStatusDisplayElement.innerHTML = "Error: File system APIs (window.requestFileSystem or LocalFileSystem) are not available on this device.";
    appLogger.error(context, "Required File System APIs are undefined. Is Cordova loaded correctly?");
    return;
  }

  // Request persistent storage for application data.
  window.requestFileSystem(
    LocalFileSystem.PERSISTENT, // Request persistent storage type
    0, // Request 0 bytes (unlimited quota on most mobile devices for persistent storage)
    handleFileSystemAccessSuccess, // Callback for successful file system access
    handleFileSystemAccessError // Callback for file system access failure
  );
}

/**
 * Callback function executed upon successful access to the file system.
 * @param {FileSystem} accessedFileSystem - The FileSystem object providing access to the device's file storage.
 */
function handleFileSystemAccessSuccess(accessedFileSystem) { // Renamed 'fileSystem'
  const context = 'FS_AccessSuccess';
  appLogger.log(context, "Persistent file system access granted. Proceeding to check map data.");
  checkAndManageMapData(accessedFileSystem);
}

/**
 * Callback function executed if file system access fails.
 * @param {FileError} fileSystemError - The error object describing the file system access failure.
 */
function handleFileSystemAccessError(fileSystemError) {
  const context = 'FS_AccessError';
  appStatusDisplayElement.innerHTML = `Failed to access device storage: Error code ${fileSystemError.code}.`;
  appLogger.error(context, "Error encountered while requesting persistent file system:", fileSystemError);
}

/**
 * Checks for the existence of the local map data file and initiates download if not found.
 * @param {FileSystem} primaryFileSystem - The FileSystem object for operations.
 */
function checkAndManageMapData(primaryFileSystem) { // Renamed 'fs'
  const context = 'MapDataManagement';

  // Attempt to retrieve the local MBTiles file. 'create: false' ensures it won't be created if it doesn't exist.
  primaryFileSystem.root.getFile(appResources.localCacheFilename, { create: false, exclusive: false },
    () => { // Success callback: File exists locally.
      appLogger.log(context, `Local map data '${appResources.localCacheFilename}' found on device.`);
      appStatusDisplayElement.innerHTML = 'Cached map data detected. Preparing map for display...';
      renderMapView(); // Renamed 'buildMap'
    },
    (fileLookupError) => { // Error callback: File does not exist or other lookup issue.
      if (fileLookupError.code === FileError.NOT_FOUND_ERR) {
        appLogger.log(context, `Local map data '${appResources.localCacheFilename}' not found. Initiating download.`);
        appStatusDisplayElement.innerHTML = `Downloading map data (~14MBs)...`;
        beginRemoteMapDataDownload(primaryFileSystem);
      } else {
        appStatusDisplayElement.innerHTML = `Error checking local map file: Code ${fileLookupError.code}.`;
        appLogger.error(context, "Error during local map data file lookup:", fileLookupError);
      }
    }
  );
}

/**
 * Handles the download process of the MBTiles file from the remote URL to local storage.
 * @param {FileSystem} targetFileSystem - The FileSystem object where the file will be saved.
 */
function beginRemoteMapDataDownload(targetFileSystem) { // Renamed 'fs'
  const context = 'DownloadManager';

  // Validate the availability of the Cordova FileTransfer plugin.
  if (typeof FileTransfer === 'undefined') {
    appStatusDisplayElement.innerHTML = "Error: Cordova FileTransfer plugin is not available. Cannot download map data.";
    appLogger.error(context, "FileTransfer global object is undefined. Is the plugin installed and loaded?");
    return;
  }

  const fileTransferInstance = new FileTransfer(); // Renamed 'ft'
  // Construct the full local path where the file will be saved.
  const destinationPath = targetFileSystem.root.fullPath + '/' + appResources.localCacheFilename; // Intermediate variable

  // Attach a progress listener to update the UI during the download.
  fileTransferInstance.onprogress = (progressEvent) => {
    if (progressEvent.lengthComputable) {
      const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      appStatusDisplayElement.innerHTML = `Downloading map data: ${percentage}% complete.`;
    } else {
      appStatusDisplayElement.innerHTML = "Downloading map data (progress unknown)...";
    }
  };

  appLogger.log(context, `Starting download from '${appResources.remoteDownloadUrl}' to '${destinationPath}'`);

  fileTransferInstance.download(
    appResources.remoteDownloadUrl,
    destinationPath,
    (downloadedFileEntry) => { // Renamed 'entry'
      appLogger.log(context, `Map data download completed successfully: ${downloadedFileEntry.fullPath}`);
      appStatusDisplayElement.innerHTML = 'Download finished. Initializing map display...';
      renderMapView(); // Renamed 'buildMap'
    },
    (downloadError) => { // Renamed 'error'
      appStatusDisplayElement.innerHTML = `Map data download failed: Error code ${downloadError.code}.`;
      appLogger.error(context, "An error occurred during the map data download:", downloadError);
      // Further error handling could be implemented here based on downloadError.code
    },
    false, // trustAllHosts - set to false for security in production
    {} // options - can be used for headers, etc.
  );
}

/**
 * Renders the interactive Leaflet map using the locally stored MBTiles data.
 */
function renderMapView() { // Renamed from 'buildMap'
  const context = 'MapViewRenderer';

  // Validate the availability of Leaflet and SQLitePlugin libraries.
  if (typeof L === 'undefined' || typeof SQLitePlugin === 'undefined') {
    appLogger.error(context, "Leaflet (L) or SQLitePlugin library not detected. Cannot render map.");
    if (appStatusDisplayElement) {
      appStatusDisplayElement.innerHTML = "Error: Core mapping libraries missing. Ensure Leaflet and SQLitePlugin are loaded.";
    }
    return;
  }

  // Initialize the SQLite database connection using the local MBTiles file.
  const tileDataSource = new SQLitePlugin(appResources.localCacheFilename); // Renamed 'db'

  // Remove the status display element from the DOM as it's no longer needed after map rendering.
  // Add a defensive check to prevent errors if the element is already removed or non-existent.
  if (appStatusDisplayElement && appStatusDisplayElement.parentNode) {
    appStatusDisplayElement.parentNode.removeChild(appStatusDisplayElement);
    // Clear the global reference to the element to prevent memory leaks and ensure it's not reused.
    appStatusDisplayElement = null;
    appLogger.log(context, "Status display element removed from DOM.");
  } else {
    appLogger.warn(context, "Attempted to remove status display element, but it was not found or already removed.");
  }

  // Define comprehensive options for the Leaflet map instance.
  const leafletMapOptions = {
    center: new L.LatLng(appResources.mapConfig.initialCenter.lat, appResources.mapConfig.initialCenter.lng),
    zoom: appResources.mapConfig.initialZoomLevel,
    zoomControl: true, // Explicitly enable zoom controls
    attributionControl: false, // Disable default Leaflet attribution for custom control
    minZoom: 1, // Example: setting a minimum zoom level
    maxZoom: appResources.mapConfig.maximumTileZoom + 2 // Allow zooming beyond max tile zoom for better UX
  };

  // Create the main Leaflet map instance, attaching it to the 'map' div.
  const primaryLeafletMap = new L.Map('map', leafletMapOptions); // Renamed 'map'

  // Define options specific to the MBTiles tile layer.
  const mbtilesLayerOptions = {
    maxZoom: appResources.mapConfig.maximumTileZoom,
    scheme: appResources.mapConfig.tileSchemeType,
    tms: true, // Explicitly indicate TMS scheme
    // Custom attribution for the MBTiles data source.
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, MBTiles by Local App'
  };

  // Create the MBTiles tile layer, linking it to the SQLite database.
  const mbtilesOverlayLayer = new L.TileLayer.MBTiles('', mbtilesLayerOptions, tileDataSource); // Renamed 'lyr'

  // Add the custom MBTiles layer to the Leaflet map.
  primaryLeafletMap.addLayer(mbtilesOverlayLayer);

  // Optional: Invalidate map size after adding to ensure correct rendering, especially if map div was hidden.
  primaryLeafletMap.invalidateSize();

  appLogger.log(context, "Interactive map successfully initialized and displayed with MBTiles data.");
}

// Ensure the application's initialization sequence begins once the DOM is fully loaded.
// This is crucial for setting up event listeners before Cordova's 'deviceready' event might fire.
document.addEventListener('DOMContentLoaded', initializeApplicationLifecycle);