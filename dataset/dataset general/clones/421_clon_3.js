// Copyright (c) 2015 - 2024, Project Genesis. All rights reserved.
// This software is provided under the terms of the GNU General Public License, version 3 or later.
// For full license details, please refer to the accompanying LICENSE.md file or visit <http://www.gnu.org/licenses/>.

// This module handles core scene object management, persistence, and UI state.
// It's designed to be integrated into a larger 3D environment framework.

import { LogManager } from './utils/logger'; // Conceptual import for logging
import { AssetLoader } from './utils/assetLoader'; // Conceptual import for asset loading

// --- Configuration and Global State ---
const applicationSettings = {
    version: "Alpha 4.0.0",
    appName: "Project Genesis Engine",
    developerInfo: "Usmar A. Padow (amigojapan) - usmpadow@gmail.com",
    helpContributors: ["Gregory Cox", "Patrick Robotham"],
    musicAttribution: "NathanWillsMusic.com",
    baseAssetDirectory: "data/assets/", // Default path
    debugMode: false,
    initialJumpCoords: { x: 0, y: 1, z: -10 }
};

// --- UI State Management Flags ---
let displayPrimaryView = true;
let displayInfoOverlay = false;
let displayCreationTools = false;
let displayDownloadPrompt = false;
let displayDetailedDownload = false;
let displayAuthForm = false;
let displayStatusBox = false;
let displayPromptBox = false;
let displayFileSelection = false;
let largeEditorActive = false;
let debugOutputEnabled = false;
let assetBuilderMode = false;
let mapEditInterfaceVisible = false;
let scriptingEnvActive = false;

// --- UI Content and Input Variables ---
let infoPanelText = `3D Genesis Engine - ${applicationSettings.appName}.\nVersion ${applicationSettings.version}.\nDeveloped by ${applicationSettings.developerInfo}\nSpecial thanks to: ${applicationSettings.helpContributors.join(', ')}\nMusic by: ${applicationSettings.musicAttribution}`;
let webClient = null; // Represents a conceptual web client or WWW object
let statusMessage = "";
let userEmailInput = "";
let userPassInput = "";
let authSuccessful = false;
let collectedInput = "";
let pendingAction = "";

// --- UI Scroll Positions (Conceptual) ---
let mainScrollPos = { x: 0, y: 0 };
let fileDialogScrollPos = { x: 0, y: 0 };
let resourceMonitorScroll = { x: 0, y: 0 };

// --- Debugging and Path Variables ---
let logBuffer = "Engine Log:";
let resourcePath = "No path configured"; // Actual path will be set dynamically
let baseDataDir = "No data path configured";

// --- Object Building and Editing State ---
let jumpCoordX = applicationSettings.initialJumpCoords.x.toString();
let jumpCoordY = applicationSettings.initialJumpCoords.y.toString();
let jumpCoordZ = applicationSettings.initialJumpCoords.z.toString();
let activeShapeId = "UnnamedEntity";
let textureSourceType = "File";
let activeTextureName = "";
let shapeOpacity = "1.0";
let colorRVal = "255";
let colorGVal = "255";
let colorBVal = "255";
let textureRepeatFactor = "1";
let guideLightStatus = "Off";
let currentAssetFile = "";

// --- Scene Management Collections (Conceptual) ---
let sceneElements = []; // Renamed from 'cubes' to be more general
let activeEntityInstances = []; // Renamed from 'MapLoadedObjectsList'

// --- Material and Texture Management ---
let defaultSurfaceMaterial = null; // Represents a default material object
let imageCache = []; // Renamed from 'LoadedTextureList'
let audioCache = []; // Renamed from 'LoadedSoundList'

// --- Core Data Structures ---

/**
 * Represents properties for a basic geometric shape.
 * @class
 */
class ShapeProperties {
    /** @type {string} */
    shapeIdentifier = "";
    /** @type {number} */
    coordX = 0;
    /** @type {number} */
    coordY = 0;
    /** @type {number} */
    coordZ = 0;
    /** @type {number} */
    redComp = 255;
    /** @type {number} */
    greenComp = 255;
    /** @type {number} */
    blueComp = 255;
    /** @type {string} */
    appliedTexture = "";
    /** @type {string} */
    textureOrigin = "File";
    /** @type {number} */
    visualAlpha = 1.0;
    /** @type {number} */
    tilingFactor = 1;

    constructor(id = "", x = 0, y = 0, z = 0) {
        this.shapeIdentifier = id;
        this.coordX = x;
        this.coordY = y;
        this.coordZ = z;
    }
}

/**
 * Manages serialization and deserialization of application data.
 * @class
 */
class PersistenceManager {
    /**
     * Stores an object to a conceptual file.
     * @param {string} filename - The name of the file.
     * @param {object} dataObject - The object to store.
     */
    static storeData(filename, dataObject) {
        try {
            LogManager.log(`Attempting to save data to: ${filename}`);
            // Conceptual serialization (e.g., to JSON string)
            const serializedData = JSON.stringify(dataObject, null, 2);
            // In a real environment, this would write to a file system.
            LogManager.log(`Data saved conceptually to ${filename}. Size: ${serializedData.length} bytes.`);
        } catch (error) {
            LogManager.error(`PersistenceManager.storeData(): Failed to save object to ${filename}. Reason: ${error.message}`);
        }
    }

    /**
     * Retrieves an object from a conceptual file.
     * @param {string} filename - The name of the file.
     * @returns {object|null} The deserialized object or null if retrieval fails.
     */
    static retrieveData(filename) {
        try {
            LogManager.log(`Attempting to load data from: ${filename}`);
            // Conceptual deserialization (e.g., from JSON string)
            // In a real environment, this would read from a file system.
            const rawData = AssetLoader.loadTextAsset(filename); // Conceptual asset loader
            if (!rawData) {
                LogManager.warn(`No data found for ${filename}.`);
                return null;
            }
            const deserializedObject = JSON.parse(rawData);
            LogManager.log(`Data successfully loaded from ${filename}.`);
            return deserializedObject;
        } catch (error) {
            LogManager.error(`PersistenceManager.retrieveData(): Failed to load data from ${filename}. Reason: ${error.message}`);
            return null;
        }
    }
}

/**
 * Represents a single entity within a spatial layout (e.g., a map).
 * @class
 */
class SpatialEntity {
    /** @type {string} */
    assetFileIdentifier = "";
    /** @type {string} */
    entityInstanceId = "";
    /** @type {number} */
    posX = 0;
    /** @type {number} */
    posY = 0;
    /** @type {number} */
    posZ = 0;
    /** @type {number} */
    rotX = 0;
    /** @type {number} */
    rotY = 0;
    /** @type {number} */
    rotZ = 0;
}

/** @type {Array<SpatialEntity>} */
let entityBlueprintList = [];

/**
 * Stores information about a cached image resource.
 * @class
 */
class CachedImageResource {
    /** @type {string|null} */
    resourceLabel = null;
    /** @type {object|null} */ // Conceptual Texture object
    imageObject = null;
}

/**
 * Stores information about a cached audio resource.
 * @class
 */
class CachedAudioResource {
    /** @type {string|null} */
    audioLabel = null;
    /** @type {object|null} */ // Conceptual AudioClip object
    audioObject = null;
}

/** @type {Array<ShapeProperties>} */
let shapeDefinitionList = [];

/**
 * Represents a cached 3D model entry.
 * @class
 */
class AssetModelCacheEntry {
    /** @type {string|null} */
    modelIdentifier = null;
    /** @type {object|null} */ // Conceptual GameObject reference
    modelReference = null;
}

/** @type {Array<AssetModelCacheEntry>} */
let modelRegistry = [];

// --- Global object for scene elements, replacing 'cubes' array ---
const sceneContext = {
    elements: [], // All active objects in the scene
    instanceNames: [] // Track names of instantiated objects
};

/**
 * Initializes the application environment and loads initial resources.
 * This function is conceptually called once at startup.
 */
function initApplication() {
    LogManager.log("Application initialization sequence started.");

    // Simulate path determination (e.g., from environment variables or config)
    resourcePath = applicationSettings.baseAssetDirectory;
    baseDataDir = resourcePath;
    infoPanelText += `\n\nData Folder: ${baseDataDir}`;

    // Initialize default material (conceptual)
    defaultSurfaceMaterial = {
        shader: "Transparent/Diffuse",
        color: { r: 1, g: 1, b: 1, a: 1 } // White
    };

    // Simulate UI element positioning for a crosshair (conceptual)
    const crosshairTexture = { width: 32, height: 32 }; // Placeholder
    const screenWidth = 1920; // Conceptual screen width
    const screenHeight = 1080; // Conceptual screen height
    const crosshairPosition = {
        x: (screenWidth - crosshairTexture.width) / 2,
        y: (screenHeight - crosshairTexture.height) / 2,
        width: crosshairTexture.width,
        height: crosshairTexture.height
    };
    LogManager.log(`Crosshair positioned at: (${crosshairPosition.x}, ${crosshairPosition.y})`);

    LogManager.log("Application initialization complete.");
}

/**
 * Creates a basic geometric object and adds it to the scene.
 * @param {string} objectId - A unique identifier for the object.
 * @param {number} xPos - X-coordinate.
 * @param {number} yPos - Y-coordinate.
 * @param {number} zPos - Z-coordinate.
 * @returns {object} A conceptual representation of the created object.
 */
function createGeometricObject(objectId, xPos, yPos, zPos) {
    if (!objectId || typeof objectId !== 'string') {
        LogManager.warn("Invalid object ID provided for createGeometricObject. Using default.");
        objectId = "default_object_" + Date.now();
    }

    const newObject = {
        id: objectId,
        type: 'Cube', // All primitives are cubes in this conceptual model
        transform: {
            position: { x: xPos, y: yPos, z: zPos },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 }
        },
        renderer: {
            material: { ...defaultSurfaceMaterial } // Clone default material
        },
        parent: null,
        children: []
    };

    sceneContext.elements.push(newObject);
    LogManager.log(`Created object '${objectId}' at (${xPos}, ${yPos}, ${zPos}). Total scene elements: ${sceneContext.elements.length}`);
    return newObject;
}

/**
 * Spawns an auxiliary object not typically managed by the main scene collection.
 * This is useful for temporary or unlisted entities.
 * @param {string} label - A label for the auxiliary object.
 * @param {number} x - X-coordinate.
 * @param {number} y - Y-coordinate.
 * @param {number} z - Z-coordinate.
 * @returns {object} A conceptual representation of the spawned object.
 */
function spawnAuxiliaryObject(label, x, y, z) {
    if (!label) {
        LogManager.error("Label for auxiliary object is undefined. Cannot spawn.");
        return null;
    }
    const auxiliaryObject = {
        identifier: label,
        kind: 'AuxiliaryPrimitive',
        location: { x, y, z },
        appearance: { color: { r: 1, g: 1, b: 1, a: 1 } }
    };
    LogManager.debug(`Spawned auxiliary object '${label}' at (${x}, ${y}, ${z}).`);
    // This object is not added to sceneContext.elements
    return auxiliaryObject;
}

/**
 * Assembles a complex object from a list of shape properties.
 * @param {string} modelName - The name of the complex model.
 * @param {Array<ShapeProperties>} shapePropsList - List of properties for constituent shapes.
 * @param {number} globalX - Global X position for the assembled object.
 * @param {number} globalY - Global Y position for the assembled object.
 * @param {number} globalZ - Global Z position for the assembled object.
 * @returns {object} The conceptual "AxisPoint" (root) object for the assembled model.
 */
function assembleComplexObject(modelName, shapePropsList, globalX, globalY, globalZ) {
    if (!shapePropsList || shapePropsList.length === 0) {
        LogManager.warn(`No shape properties provided for model '${modelName}'. Returning null.`);
        return null;
    }

    let rootAxisPoint = null;
    let initialRootFound = false;

    for (const shapeDef of shapePropsList) {
        if (shapeDef.shapeIdentifier === "AxisPoint" && !initialRootFound) {
            // Create the primary axis point for the complex object
            rootAxisPoint = createGeometricObject(modelName, 0, 0, 0); // Temporary position
            adjustTransparency(modelName, 0.0); // Make it invisible
            // Remove the last added object from the main scene list, as it's a structural helper
            if (sceneContext.elements.length > 0) {
                sceneContext.elements.pop(); // Remove the 'AxisPoint' cube
            }
            initialRootFound = true;
            LogManager.debug(`Root AxisPoint created for model '${modelName}'.`);
            continue;
        }

        if (!rootAxisPoint) { // Ensure root exists before adding children
            rootAxisPoint = createGeometricObject(modelName + "_root", 0, 0, 0);
            adjustTransparency(rootAxisPoint.id, 0.0);
            if (sceneContext.elements.length > 0) sceneContext.elements.pop();
            LogManager.warn(`Missing explicit 'AxisPoint' in definition for '${modelName}'. Created a default root.`);
        }

        const childShape = createGeometricObject(shapeDef.shapeIdentifier, shapeDef.coordX, shapeDef.coordY, shapeDef.coordZ);

        // Apply color if not default white
        if (shapeDef.redComp !== 255 || shapeDef.greenComp !== 255 || shapeDef.blueComp !== 255) {
            // Conceptual color application
            childShape.renderer.material.color = {
                r: shapeDef.redComp / 255,
                g: shapeDef.greenComp / 255,
                b: shapeDef.blueComp / 255,
                a: childShape.renderer.material.color.a // Preserve existing alpha
            };
        }

        // Apply alpha if not default
        if (shapeDef.visualAlpha !== 1.0) {
            adjustTransparency(childShape.id, shapeDef.visualAlpha);
        }

        // Apply texture if specified (conceptual)
        if (shapeDef.appliedTexture !== "") {
            LogManager.debug(`Applying texture '${shapeDef.appliedTexture}' (source: ${shapeDef.textureOrigin}, tiling: ${shapeDef.tilingFactor}) to '${childShape.id}'.`);
            childShape.renderer.material.texture = AssetLoader.loadTexture(shapeDef.appliedTexture); // Conceptual texture loading
        }

        // Establish parent-child relationship (conceptual)
        childShape.parent = rootAxisPoint;
        rootAxisPoint.children.push(childShape);

        // Make colliders invisible if tagged as such
        if (shapeDef.shapeIdentifier.startsWith("collider")) {
            adjustTransparency(childShape.id, 0.0);
        }

        // Remove the child from the main scene list as it's part of a composite object
        if (sceneContext.elements.length > 0 && sceneContext.elements[sceneContext.elements.length - 1].id === childShape.id) {
            sceneContext.elements.pop();
        }
    }

    if (rootAxisPoint) {
        rootAxisPoint.transform.position = { x: globalX, y: globalY, z: globalZ };
        LogManager.log(`Assembled complex object '${modelName}' at global position (${globalX}, ${globalY}, ${globalZ}).`);
    } else {
        LogManager.error(`Failed to assemble complex object '${modelName}'. No root AxisPoint found or created.`);
    }

    return rootAxisPoint;
}

let mapContainer = null;
let activeMapName = "";

/**
 * Loads and renders a level layout from a specified file.
 * @param {string} layoutFile - The filename of the map layout.
 * @param {string} instanceLabel - A label for this specific instance of the map.
 * @param {number} xOffset - X-offset for the entire map.
 * @param {number} yOffset - Y-offset for the entire map.
 * @param {number} zOffset - Z-offset for the entire map.
 */
function loadLevelLayout(layoutFile, instanceLabel, xOffset, yOffset, zOffset) {
    activeMapName = instanceLabel;
    const mapDataPath = `${baseDataDir}Maps/${layoutFile}`;

    entityBlueprintList = PersistenceManager.retrieveData(mapDataPath);
    if (!entityBlueprintList) {
        LogManager.error(`Could not load map layout from ${mapDataPath}.`);
        return;
    }

    mapContainer = createGeometricObject("MapRootContainer_" + instanceLabel, 0, 0, 10000000); // Create an invisible root
    adjustTransparency(mapContainer.id, 0.0);
    // Remove from sceneContext.elements as it's purely a structural parent
    if (sceneContext.elements.length > 0 && sceneContext.elements[sceneContext.elements.length - 1].id === mapContainer.id) {
        sceneContext.elements.pop();
    }

    LogManager.log(`Loading level layout '${layoutFile}' with instance label '${instanceLabel}'.`);
    for (const entityDef of entityBlueprintList) {
        let currentInstance = null;
        const targetInstanceId = (instanceLabel === "Original Names") ? entityDef.entityInstanceId : instanceLabel;

        currentInstance = instantiateAssetModel(entityDef.assetFileIdentifier, targetInstanceId, entityDef.posX, entityDef.posY, entityDef.posZ);

        if (currentInstance) {
            // Conceptual parent setting
            currentInstance.parent = mapContainer;
            mapContainer.children.push(currentInstance);

            // Conceptual rotation application
            currentInstance.transform.rotation = {
                x: entityDef.rotX,
                y: entityDef.rotY,
                z: entityDef.rotZ
            };
            LogManager.debug(`Instantiated entity '${targetInstanceId}' from '${entityDef.assetFileIdentifier}' at (${entityDef.posX}, ${entityDef.posY}, ${entityDef.posZ}).`);
        } else {
            LogManager.warn(`Failed to instantiate entity for '${entityDef.assetFileIdentifier}'.`);
        }
    }
    // Apply map-wide offset
    if (mapContainer) {
        mapContainer.transform.position.x += xOffset;
        mapContainer.transform.position.y += yOffset;
        mapContainer.transform.position.z += zOffset;
        LogManager.log(`Applied map offset to '${mapContainer.id}': (${xOffset}, ${yOffset}, ${zOffset}).`);
    }
}

/**
 * Duplicates an existing asset instance in the scene.
 * @param {object} sourceObject - The conceptual GameObject to clone.
 * @param {string} newInstanceName - The name for the new cloned instance.
 * @param {number} x - X-coordinate for the clone.
 * @param {number} y - Y-coordinate for the clone.
 * @param {number} z - Z-coordinate for the clone.
 * @returns {object|null} The new conceptual GameObject instance.
 */
function duplicateAssetInstance(sourceObject, newInstanceName, x, y, z) {
    if (!sourceObject) {
        LogManager.error("Cannot duplicate a null source object.");
        return null;
    }
    if (sceneContext.instanceNames.includes(newInstanceName)) {
        LogManager.warn(`Instance name '${newInstanceName}' already exists. Generating unique ID.`);
        newInstanceName += "_" + Date.now();
    }

    // Deep clone the source object conceptually
    const clonedObject = JSON.parse(JSON.stringify(sourceObject));
    clonedObject.id = newInstanceName;
    clonedObject.transform.position = { x, y, z };
    clonedObject.parent = null; // New instance, no parent by default

    sceneContext.elements.push(clonedObject);
    sceneContext.instanceNames.push(newInstanceName);
    LogManager.log(`Cloned object '${sourceObject.id}' to new instance '${newInstanceName}' at (${x}, ${y}, ${z}).`);
    return clonedObject;
}

/**
 * Instantiates a 3D asset model from a binary file.
 * @param {string} modelFile - The filename of the model (e.g., "MyObject.bin").
 * @param {string} instanceLabel - The desired instance name for the model.
 * @param {number} x - X-coordinate for placement.
 * @param {number} y - Y-coordinate for placement.
 * @param {number} z - Z-coordinate for placement.
 * @returns {object|null} The conceptual GameObject representing the instantiated model.
 */
function instantiateAssetModel(modelFile, instanceLabel, x, y, z) {
    let cachedEntry = modelRegistry.find(entry => entry.modelIdentifier === modelFile);
    let newInstance = null;

    if (cachedEntry) {
        // Model found in cache, duplicate it
        newInstance = duplicateAssetInstance(cachedEntry.modelReference, instanceLabel, x, y, z);
        LogManager.debug(`Instantiated '${instanceLabel}' from cached model '${modelFile}'.`);
    } else {
        // Model not in cache, load and then cache
        const modelFilePath = `${baseDataDir}Objects/${modelFile}`;
        const loadedShapeDefs = PersistenceManager.retrieveData(modelFilePath);

        if (!loadedShapeDefs) {
            LogManager.error(`Failed to load model definitions for '${modelFile}' from ${modelFilePath}.`);
            return null;
        }

        // Render the object at an invisible, distant location for initial caching
        const baseModelReference = assembleComplexObject(modelFile, loadedShapeDefs, 0, 0, 1000000000);
        if (!baseModelReference) {
            LogManager.error(`Failed to create base model reference for '${modelFile}'.`);
            return null;
        }

        // Add to cache
        const newCacheEntry = new AssetModelCacheEntry();
        newCacheEntry.modelIdentifier = modelFile;
        newCacheEntry.modelReference = baseModelReference;
        modelRegistry.push(newCacheEntry);
        LogManager.log(`Model '${modelFile}' loaded and cached. Total cached models: ${modelRegistry.length}.`);

        // Now duplicate from the newly cached reference
        newInstance = duplicateAssetInstance(baseModelReference, instanceLabel, x, y, z);
    }
    return newInstance;
}

/**
 * Loads a 3D asset model from an XML file using a conceptual XML parser.
 * This function is similar to instantiateAssetModel but specifically for XML.
 * @param {string} xmlModelFile - The filename of the XML model (e.g., "MyObject.xml").
 * @param {string} instanceLabel - The desired instance name for the model.
 * @param {number} x - X-coordinate for placement.
 * @param {number} y - Y-coordinate for placement.
 * @param {number} z - Z-coordinate for placement.
 * @returns {object|null} The conceptual GameObject representing the instantiated model.
 */
function loadAssetFromXML(xmlModelFile, instanceLabel, x, y, z) {
    let cachedEntry = modelRegistry.find(entry => entry.modelIdentifier === xmlModelFile);
    let newInstance = null;

    if (cachedEntry) {
        newInstance = duplicateAssetInstance(cachedEntry.modelReference, instanceLabel, x, y, z);
        LogManager.debug(`Instantiated '${instanceLabel}' from cached XML model '${xmlModelFile}'.`);
    } else {
        const xmlFilePath = `${baseDataDir}Objects/${xmlModelFile}`;
        // Conceptual XML deserialization - AssetLoader handles this
        const loadedShapeDefs = AssetLoader.loadXMLAsset(xmlFilePath);

        if (!loadedShapeDefs || !Array.isArray(loadedShapeDefs)) {
            LogManager.error(`Failed to parse XML model definitions for '${xmlModelFile}' from ${xmlFilePath}.`);
            return null;
        }

        const baseModelReference = assembleComplexObject(xmlModelFile, loadedShapeDefs, 0, 0, 1000000000);
        if (!baseModelReference) {
            LogManager.error(`Failed to create base model reference for XML model '${xmlModelFile}'.`);
            return null;
        }

        const newCacheEntry = new AssetModelCacheEntry();
        newCacheEntry.modelIdentifier = xmlModelFile;
        newCacheEntry.modelReference = baseModelReference;
        modelRegistry.push(newCacheEntry);
        LogManager.log(`XML model '${xmlModelFile}' loaded and cached.`);

        newInstance = duplicateAssetInstance(baseModelReference, instanceLabel, x, y, z);
    }
    return newInstance;
}

/**
 * Adjusts the transparency (alpha channel) of a specified object.
 * @param {string} objectId - The ID of the object to modify.
 * @param {number} newAlpha - The new alpha value (0.0 for fully transparent, 1.0 for fully opaque).
 */
function adjustTransparency(objectId, newAlpha) {
    if (typeof newAlpha !== 'number' || newAlpha < 0 || newAlpha > 1) {
        LogManager.warn(`Invalid alpha value (${newAlpha}) provided for object '${objectId}'. Must be between 0 and 1.`);
        return;
    }

    const targetObject = sceneContext.elements.find(obj => obj.id === objectId);
    if (targetObject && targetObject.renderer && targetObject.renderer.material && targetObject.renderer.material.color) {
        targetObject.renderer.material.color.a = newAlpha;
        LogManager.debug(`Adjusted transparency for '${objectId}' to ${newAlpha}.`);
    } else {
        LogManager.warn(`Object '${objectId}' not found or does not have a modifiable material to adjust transparency.`);
    }
}

// Initial application setup (conceptual call)
initApplication();