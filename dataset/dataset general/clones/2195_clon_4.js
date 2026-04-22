const coreConfiguration = {
    resourceIdentifier: 'test.mbtiles',
    downloadSourcePath: 'http://dl.dropbox.com/u/14814828/OSMBrightSLValley.mbtiles',
    statusPanelId: 'message',
    centralCoordinates: { latitude: 40.6681, longitude: -111.9364 },
    initialViewZoom: 11,
    maximumTileZoomLevel: 14
};

class UserInterfaceNotifier {
    constructor(panelIdentifier) {
        this.statusPanel = document.getElementById(panelIdentifier);
    }

    displayNotification(text) {
        if (this.statusPanel) {
            this.statusPanel.innerHTML = text;
            console.info(text);
        }
    }

    removeNotificationPanel() {
        if (this.statusPanel && this.statusPanel.parentNode) {
            this.statusPanel.parentNode.removeChild(this.statusPanel);
        }
    }
}

const deviceReadySignal = new Promise(resolve => {
    document.addEventListener('deviceready', resolve, false);
});

class DeviceFileHandler {
    constructor() {
        this.rootDirectoryReference = null;
    }

    async acquireRootAccess() {
        if (this.rootDirectoryReference) {
            return this.rootDirectoryReference;
        }
        return new Promise((resolve, reject) => {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                fileSystem => {
                    this.rootDirectoryReference = fileSystem.root;
                    resolve(this.rootDirectoryReference);
                },
                error => reject(new Error(`Failed to get file system access: ${error.code}`))
            );
        });
    }

    async verifyResourceExistence(resourceName) {
        const directory = await this.acquireRootAccess();
        return new Promise(resolve => {
            directory.getFile(resourceName, { create: false },
                () => resolve(true),
                () => resolve(false)
            );
        });
    }

    async downloadRemoteResource(sourceUrl, targetName, notifier) {
        const directory = await this.acquireRootAccess();
        return new Promise((resolve, reject) => {
            const transferUtility = new FileTransfer();
            const destinationPath = directory.fullPath + '/' + targetName;

            notifier.displayNotification('Commencing data acquisition...');
            transferUtility.download(sourceUrl, destinationPath,
                entry => {
                    notifier.displayNotification(`Data acquisition complete: ${entry.fullPath}`);
                    resolve(entry);
                },
                error => {
                    notifier.displayNotification('Data acquisition failed!');
                    reject(new Error(`Resource download issue: ${error.code}`));
                }
            );
        });
    }
}

class SpatialDataStoreAccessor {
    constructor(databaseFileName) {
        this.databaseInstance = new SQLitePlugin(databaseFileName);
    }

    getDatabaseAccessor() {
        return this.databaseInstance;
    }
}

class GeographicMapRenderer {
    static constructMap(containerDomId, centerPoint, currentZoom, tileConfiguration, dataStoreAccessor) {
        const mappingComponent = new L.Map(containerDomId, {
            center: new L.LatLng(centerPoint.latitude, centerPoint.longitude),
            zoom: currentZoom
        });

        const tileLayerComponent = new L.TileLayer.MBTiles('', tileConfiguration, dataStoreAccessor);
        mappingComponent.addLayer(tileLayerComponent);
        return mappingComponent;
    }
}

async function executeApplicationFlow() {
    const notifier = new UserInterfaceNotifier(coreConfiguration.statusPanelId);
    const fileHandler = new DeviceFileHandler();

    try {
        notifier.displayNotification('Awaiting device operational status...');
        await deviceReadySignal;
        notifier.displayNotification('Device operational. Initiating storage access...');

        await fileHandler.acquireRootAccess();
        const resourceFound = await fileHandler.verifyResourceExistence(coreConfiguration.resourceIdentifier);

        if (resourceFound) {
            notifier.displayNotification('Local data archive detected. Preparing visualizer...');
        } else {
            notifier.displayNotification('Local data archive not found. Downloading data (~14mbs)...');
            await fileHandler.downloadRemoteResource(
                coreConfiguration.downloadSourcePath,
                coreConfiguration.resourceIdentifier,
                notifier
            );
        }

        notifier.displayNotification('Data preparation complete. Constructing geographic display...');
        const dataStore = new SpatialDataStoreAccessor(coreConfiguration.resourceIdentifier);
        const tileLayerSettings = {
            maxZoom: coreConfiguration.maximumTileZoomLevel,
            scheme: 'tms'
        };

        GeographicMapRenderer.constructMap(
            'map',
            coreConfiguration.centralCoordinates,
            coreConfiguration.initialViewZoom,
            tileLayerSettings,
            dataStore.getDatabaseAccessor()
        );

        notifier.removeNotificationPanel();
    } catch (error) {
        console.error('Application core process error:', error);
        notifier.displayNotification(`Critical error during operation: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', executeApplicationFlow, false);