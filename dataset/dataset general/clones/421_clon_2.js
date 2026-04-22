// This software is provided under open-source licensing. Please review the LICENSE file for full details.
/*
 * This application is open-source software; you may redistribute it and/or modify it
 * under the terms of the GNU General Public License, version 3 or any subsequent version,
 * as published by the Free Software Foundation.
 *
 * This software is distributed with the expectation that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. Refer to the
 * GNU General Public License for comprehensive details.
 *
 * A copy of the GNU General Public License should have been included with this application.
 * If not, it can be found at <http://www.gnu.org/licenses/>.
 */




// Consideration: Refactor object referencing to avoid string literals, perhaps using a GetComponent-like pattern.
/*
 * Future enhancement: Enable visual programming, where object manipulation directly generates code.
 *
 * Illustrative code snippets:
 *
 * // How to instantiate a basic block (lines starting with // are ignored by the parser).
 * makeBlock("myShape", 0, 0, 0);
 *
 * // Adjust the position of 'myShape' to observe movement, e.g., change a coordinate.
 * makeBlock("myShape", 2, 0, 1);
 *
 * // Colored blocks: 'azure' rotates, 'emerald' translates.
 * // Setup:
 * makeBlock("azure", 0, 0, 0); assignColor("azure", Color.blue);
 * makeBlock("emerald", 2, 0, 0); assignColor("emerald", Color.green);
 * // Runtime actions:
 * rotateObject("azure", 10, 10, 10); moveObject("emerald", -1, 0, 0);
 *
 * // Three distinct blocks:
 * // Initialization:
 * makeBlock("alpha", 0, 0, 0);
 * assignColor("alpha", Color.blue);
 * makeBlock("beta", 2, 1, 1);
 * assignColor("beta", Color.green);
 * makeBlock("gamma", -2, -1, -1);
 * assignColor("gamma", Color.red);
 * // Continuous updates:
 * rotateObject("alpha", 10, 10, 10);
 * rotateObject("beta", -10, -10, -10);
 * rotateObject("gamma", 10, 10, 10);
 *
 * // Vehicle construction example:
 * // Component definitions:
 * createRectangle("vehicleBody", 4, 8); assignColor("vehicleBody", Color.green);
 *
 * createRectangle("vehicleRoof", 4, 4); assignColor("vehicleRoof", Color.red);
 * setAngle("vehicleBody", 90, 90, 0);
 * setAngle("vehicleRoof", 90, 90, 0);
 * setParent("vehicleBody", 0, -1, 0);
 * makeBlock("wheelOne", -4, -2, -2); assignColor("wheelOne", Color.black);
 * makeBlock("wheelTwo", 4, -2, -2); assignColor("wheelTwo", Color.black);
 * setAngle("wheelOne", 90, 90, 0);
 * setAngle("wheelTwo", 90, 90, 0);
 * // Dynamic behavior:
 * // rotateObject("wheelOne", 0, 0, 50);
 * // rotateObject("wheelTwo", 0, 0, 50);
 * moveObject("vehicleBody", 0, 1, 0);
 * moveObject("vehicleRoof", 0, 1, 0);
 * moveObject("wheelOne", 0, 1, 0);
 * moveObject("wheelTwo", 0, 1, 0);
 * rotateObject("wheelOne", 0, 0, 50);
 * rotateObject("wheelTwo", 0, 0, 50);
 *
 * // Live script evaluation demo:
 * // Initial setup (enter this code manually):
 * makeBlock("boxA", 0, 0, 0);
 * makeBlock("boxB", 3, 0, 0);
 * makeBlock("boxA", -2, 0, 0);
 * assignColor("boxA", Color.green);
 * scaleObject("boxB", 2, 1, 1);
 * setAngle("boxB", 0, 0, 45);
 * // Update loop (press 'BEGIN' after input):
 * rotateObject("boxA", 20, 20, 20);
 * moveObject("boxB", 1, 0, 0);
 *
 * // Example utilizing a custom function:
 * // Definition section:
 * function applyAzure(entityLabel) {
 *   assignColor(entityLabel, Color.blue);
 * }
 * makeBlock("objectAlpha", 2, 2, 2); makeBlock("objectAlpha", -5, 2, 10);
 * applyAzure("objectAlpha");
 * makeBlock("objectBeta", 5, 2, 2);
 * scaleObject("objectBeta", 3, 2, 2);
 * var counterX = 0;
 * while (counterX < 5) { counterX++; makeBlock("loopShapeX", counterX, counterX, counterX); }
 * for (var counterY = 0; counterY < 6; counterY--) { makeBlock("loopShapeY", counterY, counterY, counterY); }
 * // Animation loop:
 * rotateObject("objectAlpha", 50, 50, 50);
 * moveObject("objectBeta", 20, 20, 20);
 * rotateObject("loopShapeX", 90, 90, 90);
 * rotateObject("loopShapeY", -90, -90, -90);
 */

/* Pending functionalities:
 * Implement script loading and saving capabilities.
 * Display evaluation warnings, detailing potential issues.
 * Introduce methods for rendering objects with variable visibility or complete invisibility.
 * Integrate collision detection logic.
 * Provide camera manipulation functions, consistent with object transformation methods.
 */
// Global configuration flags and data storage
import System;
import System.IO;
import System.Xml.Serialization;
import System.IO.Stream;
import System.Runtime.Serialization;
import System.Runtime.Serialization.Formatters.Binary;
import System.Collections.Generic;

var displayPrimaryMenu = true;
var displayInfoPanel = false;
var displayCreationInterface = false;
private var infoDialogText = "3D Project Language - The 3D programming environment.\nVersion Beta 3.1.1.\nDeveloped 2012 by Usmar A. Padow (amigojapan) usmpadow@gmail.com\nAssistance from Gregory Cox.\nPatrick Robotham.\nSoundtracks by NathanWillsMusic.com";
var webRequest;
var displayFetchOptions = false;
var displayDetailsAndFetch = false;
var displayAuthForm = false;
var statusMessage = "";
var displayStatusBox = false;
var userEmailInput = "";
var userPassEntry = "";
var authSuccessful = false;
var displayEntryField = false;
var displayFileSelector = false;
var collectedInput = "";
var pendingAction = "";
var largeEditMode = false;
var displayDiagnosticInfo = false;

// UI scroll positions
var viewScrollOffset : Vector2;
var filePickerScroll : Vector2;
var leakMonitorScroll : Vector2;

// Diagnostic output buffer
var diagnosticLog = "System diagnostics:";
var systemPath : String = "Path not configured";
var entityDesignerMode = false;

// Teleportation coordinates
var jumpCoordX : String = "0";
var jumpCoordY : String = "1";
var jumpCoordZ : String = "-10";

// Object construction parameters
var activeBlockLabel : String = "UnnamedBlock";
var textureSourceType : String = "File";
var activeTextureName : String = "";
var activeTransparency : String = "1.0";
var activeRedComp : String = "255";
var activeGreenComp : String = "255";
var activeBlueComp : String = "255";
var activeWrapSetting : String = "1";
var guidanceIndicator : String = "Off";

// Scene editor variables
var displaySceneEditor : boolean = false;
var displayScriptingMode = false;
var activeModelFileName = "";
var resourcePath : String = "No resource path defined";

// The collection of all game objects currently managed by the system.
var activeObjects = new System.Collections.Generic.List.<GameObject>();
// Texture asset used for the crosshair display.
var targetReticle : Texture;

// Class for scene elements managed by the editor
class SceneElement {
  // @XmlAttribute("modelFilePath")
  public var modelFilePath = "";
  // @XmlAttribute("elementLabel")
  public var elementLabel = "";
  // @XmlAttribute("posX")
  public var posX : float;
  // @XmlAttribute("posY")
  public var posY : float;
  // @XmlAttribute("posZ")
  public var posZ : float;

  public var rotX : float;
  public var rotY : float;
  public var rotZ : float;
}

// @XmlArray("SceneElementCollection")
// @XmlArrayItem("SceneElement")
var sceneElementCollection : System.Collections.Generic.List.<SceneElement>;
sceneElementCollection = new System.Collections.Generic.List.<SceneElement>();
var loadedSceneElements = new System.Collections.Generic.List.<String>();

// Caching mechanism for loaded textures
class CachedImage {
	public var imageIdentifier : String = null;
	public var imageAsset : Texture;
}
var cachedImageList = new System.Collections.Generic.List.<CachedImage>();

// Caching mechanism for loaded audio clips
class CachedAudio {
	public var audioIdentifier : String = null;
	public var audioAsset : AudioClip;
}
var cachedAudioList = new System.Collections.Generic.List.<CachedAudio>();

// Class for defining geometric data of an object
class GeometricData {
  // @XmlAttribute("shapeIdentifier")
  public var shapeIdentifier = "";
  // @XmlAttribute("coordX")
  public var coordX : float;
  // @XmlAttribute("coordY")
  public var coordY : float;
  // @XmlAttribute("coordZ")
  public var coordZ : float;
  // @XmlAttribute("colorR")
  public var colorR : int = 255;
  // @XmlAttribute("colorG")
  public var colorG : int = 255;
  // @XmlAttribute("colorB")
  public var colorB : int = 255;
  // @XmlAttribute("imageLabel")
  public var imageLabel = "";
  // @XmlAttribute("imageOrigin")
  public var imageOrigin = "File";
  // @XmlAttribute("transparencyLevel")
  var transparencyLevel : float = 1.0;
  // @XmlAttribute("surfaceWrapMode")
  var surfaceWrapMode : int = 1;

  // Notes on object hierarchy:
  // Consider adding a parent property pointing to an AxisPoint's name.
  // The AxisPoint itself would lack a parent but carry the object's overall name.
  // This implies AxisPoint names should be unique for each object instance.
  // Potentially, add an 'objectCategory' field.
  // Also, implement unique IDs (e.g., store a GUID in 'shapeIdentifier').
  // Example: System.GUID.newGUID()
}

// @XmlArray("EntityDefinitions")
// @XmlArrayItem("GeometricData")
var geometricDataCollection : System.Collections.Generic.List.<GeometricData>;
geometricDataCollection = new System.Collections.Generic.List.<GeometricData>();


// Utility for binary file operations
class DataPersister {
        public static function storeData(filePath : String, dataObject : Object) : void {
                try {
                        // Log message for data storage operation
                        var dataStream : Stream = File.Open(filePath, FileMode.Create);
                        var binaryFormatter : BinaryFormatter = new BinaryFormatter();
                        binaryFormatter.Serialize(dataStream, dataObject);
                        dataStream.Close();
                } catch (exceptionDetails : Exception) {
                        Debug.LogWarning("DataPersister.storeData(): Unable to serialize object to file " + filePath + " (Cause: " + exceptionDetails.ToString() + ")");
                }
        }

        public static function retrieveData(filePath : String) : Object {
                try {
                        // Log message for data retrieval operation
                        var dataStream : Stream = File.Open(filePath, FileMode.Open, FileAccess.Read);
                        var binaryFormatter : BinaryFormatter = new BinaryFormatter();
                        var retrievedObject : Object = binaryFormatter.Deserialize(dataStream);
                        dataStream.Close();
                        return retrievedObject;
                } catch (exceptionDetails : Exception) {
                        Debug.LogWarning("DataPersister.retrieveData(): Failed to deserialize file " + filePath + " (Cause: " + exceptionDetails.ToString() + ")");
                        return null;
                }
        }
}


function initializeSystem() {
    /*
        var testShape = new GeometricData();
        testShape.shapeIdentifier = "TestBlock99";
    */
    // var sceneItem = new SceneElement();
    // sceneItem.modelFilePath = "sample_model.dat";
    // Debug.Log(sceneItem.modelFilePath);
    // infoDialogText += "initialized_step1";

    #if UNITY_STANDALONE_OSX
        // import System.IO;
        var directoryInfo : DirectoryInfo = new DirectoryInfo(Application.dataPath);
        systemPath = directoryInfo.Parent.Parent.ToString() + "/Assets";
        // systemPath = "/Users/developer/3dpl_gpl/Assets/";
        infoDialogText += "\n\nMacintosh Resource Directory: " + systemPath;
    #endif

    resourcePath = systemPath;

    blockMaterial = new Material(Shader.Find("Transparent/Diffuse"));
    // infoDialogText += "initialized_step3";
    blockMaterial.color = Color.white;
    // infoDialogText += "initialized_step2";

    if (Application.platform == RuntimePlatform.WindowsPlayer || Application.platform == RuntimePlatform.LinuxPlayer) {
        resourcePath = systemPath;
        infoDialogText += "\n\nOperating System Resource Path: " + resourcePath;
    }

    crosshairPosition = Rect((Screen.width - targetReticle.width) / 2, (Screen.height -
        targetReticle.height) / 2, targetReticle.width, targetReticle.height);
}

var blockMaterial : Material; // Material object initialized during system startup

function createBlock(blockName : String, posX : float, posY : float, posZ : float) {
    // Generates a basic cube primitive
    // Usage: createBlock("myObject", 1.0, 1.0, 1.0);
    var newBlock : GameObject = GameObject.CreatePrimitive(PrimitiveType.Cube);
    newBlock.transform.position = Vector3(posX, posY, posZ);
    newBlock.transform.name = blockName;

    // A material instance is assigned to the new block
    newBlock.renderer.material = blockMaterial;

    activeObjects.push(newBlock); // Add to global list of active game objects
    return newBlock; // Return the newly created game object
}

function createTemporaryBlock(blockName : String, posX : float, posY : float, posZ : float) {
    // Constructs a cube primitive that is not added to the main object list
    // This is useful for internal operations that don't require tracking
    var newBlock : GameObject = GameObject.CreatePrimitive(PrimitiveType.Cube);
    newBlock.transform.position = Vector3(posX, posY, posZ);
    newBlock.transform.name = blockName;

    var temporaryMaterial = new Material(Shader.Find("Transparent/Diffuse"));
    temporaryMaterial.color = Color.white;
    // Assign the custom material to the renderer
    newBlock.renderer.material = temporaryMaterial;

    // This block is intentionally NOT added to 'activeObjects'
    return newBlock;
}

// Placeholder for color assignment function
function assignColor(objectName : String, targetColor : Color32) {
    // Implementation for changing object color would go here.
}

// Placeholder for texture application function
function applyTexture(objectName : String, textureIdentifier : String, sourceMethod : String, wrapSetting : int) {
    // Implementation for applying textures would go here.
}

function displayComplexObject(modelInstanceName : String, geometricDefinitions : System.Collections.Generic.List.<GeometricData>, xPos : float, yPos : float, zPos : float) : GameObject {
    // Renders a composite object from a list of geometric definitions.
    var originPoint : GameObject; // Declare originPoint here to ensure scope.

    for (var definitionEntry in geometricDefinitions) {
        if (definitionEntry.shapeIdentifier == "AxisPoint") {
            // The AxisPoint acts as the central pivot for the entire object.
            // It's created as a block initially, then made invisible and unlisted.
            originPoint = createBlock(modelInstanceName, 0, 0, 0);
            setTransparency(modelInstanceName, 0.0); // Render the pivot invisible.
            activeObjects.RemoveAt(activeObjects.length - 1); // Remove from general tracking list.
            continue;
        }

        /*
        // Code for handling collider definitions.
        // If an entry is a collider, it might be made invisible.
        if (definitionEntry.shapeIdentifier.Substring(0, "collider".Length) == "collider") {
            createBlock(modelInstanceName, 0, 0, 0);
            setTransparency(modelInstanceName, 0.0);
            continue;
        }
        */

        var childElement : GameObject = createBlock(definitionEntry.shapeIdentifier, definitionEntry.coordX, definitionEntry.coordY, definitionEntry.coordZ);
        if (definitionEntry.colorR != 255 || definitionEntry.colorG != 255 || definitionEntry.colorB != 255) {
            assignColor(definitionEntry.shapeIdentifier, Color32(definitionEntry.colorR, definitionEntry.colorG, definitionEntry.colorB, 255));
        }
        if (definitionEntry.transparencyLevel != 1.0) {
            setTransparency(definitionEntry.shapeIdentifier, definitionEntry.transparencyLevel);
        }
        if (definitionEntry.imageLabel != "") {
            applyTexture(definitionEntry.shapeIdentifier, definitionEntry.imageLabel, definitionEntry.imageOrigin, definitionEntry.surfaceWrapMode);
        }

        childElement.transform.parent = originPoint.transform; // Establish parent-child relationship.

        if (definitionEntry.shapeIdentifier.Substring(0, "collider".Length) == "collider") {
            setTransparency(definitionEntry.shapeIdentifier, 0.0); // Make collider components invisible.
        }
        activeObjects.RemoveAt(activeObjects.length - 1); // Remove child from general tracking list.
    }

    // Position the entire composite object.
    originPoint.transform.position.x = xPos;
    originPoint.transform.position.y = yPos;
    originPoint.transform.position.z = zPos;

    return originPoint; // Return the root game object for the composite.
}

var sceneRootObject : GameObject; // The parent object for all elements in the current scene.
var currentSceneLabel : String;   // Label for the currently loaded scene.

function loadScene(sceneFile : String, sceneInstanceLabel : String, xOffset : float, yOffset : float, zOffset : float) : GameObject {
    // Renders a scene constructed using the scene editor.
    // Use "RetainOriginalNames" as sceneInstanceLabel to preserve names from the editor.
    currentSceneLabel = sceneInstanceLabel;
    sceneElementCollection = DataPersister.retrieveData(resourcePath + "/Maps/" + sceneFile);

    // Instantiate scene objects.
    var renderedObject : GameObject;

    currentSceneLabel = sceneInstanceLabel;
    sceneRootObject = createBlock("SceneRoot", 0, 0, 10000000); // Create a hidden root for the scene.
    setTransparency("SceneRoot", 0.0); // Make the root object invisible.

    for (var elementEntry in sceneElementCollection) {
        if (sceneInstanceLabel == "RetainOriginalNames") {
            renderedObject = instantiateModel(elementEntry.modelFilePath, elementEntry.elementLabel, elementEntry.posX, elementEntry.posY, elementEntry.posZ);
        } else {
            renderedObject = instantiateModel(elementEntry.modelFilePath, sceneInstanceLabel, elementEntry.posX, elementEntry.posY, elementEntry.posZ);
        }
        renderedObject.transform.parent = sceneRootObject.transform; // Attach to the scene root.
        renderedObject.transform.rotation = Quaternion.Euler(elementEntry.rotX, elementEntry.rotY, elementEntry.rotZ);
    }
    return sceneRootObject; // Return the parent object for the entire scene.
}

class CachedModel {
	public var modelIdentifier : String = null;
	// public var modelData : System.Collections.Generic.List.<GeometricData>;
	public var modelAsset : GameObject;
}
var cachedModelList = new System.Collections.Generic.List.<CachedModel>();

/*
 * Class for tracking instances of complex objects.
 * class ObjectInstances {
 *     public var instanceLabel : String = null;
 *     public var childComponentLabels = new System.Collections.Generic.List.<String>();
 * }
 * var instantiatedEntities = new System.Collections.Generic.List.<ObjectInstances>();
 */

var instanceLabels = new System.Collections.Generic.List.<String>(); // List of all instantiated object labels.

function replicateModel(sourceModel : GameObject, replicaLabel : String, xPos : float, yPos : float, zPos : float) : GameObject {
    // Creates a new instance of an existing GameObject model.
    // Handles cases where the original object might have been temporarily removed or its reference lost.
    var clonedInstance : GameObject = Instantiate(sourceModel, Vector3(xPos, yPos, zPos), Quaternion.identity);
    clonedInstance.name = replicaLabel;
    activeObjects.push(clonedInstance); // Add the new instance to the collection of active objects.
    instanceLabels.Add(replicaLabel); // Keep track of the instance name.
    return clonedInstance;
}

function instantiateModel(modelFilePath : String, instanceLabel : String, xCoord : float, yCoord : float, zCoord : float) : GameObject {
    // Instantiates a model, loading it from a file if not already cached.
    // Example: instantiateModel("MyModel.bin", "InstanceOne", 0, 0, 0);

    var modelAlreadyCached = false;
    var cachedEntry : CachedModel;
    var freshInstance : GameObject;

    // Check if the model is already in the cache.
    for (cachedEntry in cachedModelList) {
        if (cachedEntry.modelIdentifier == modelFilePath) {
            freshInstance = replicateModel(cachedEntry.modelAsset, instanceLabel, xCoord, yCoord, zCoord);
            modelAlreadyCached = true;
            return freshInstance;
        }
    }

    // If not cached, load it from disk.
    if (!modelAlreadyCached) {
        var resourceDirectory = resourcePath + "/Objects/";
        var deserializedData = DataPersister.retrieveData(resourceDirectory + modelFilePath);

        // Render the base object for caching purposes.
        // It's rendered far off-screen initially to serve as a template.
        var baseModelObject : GameObject = displayComplexObject(modelFilePath, deserializedData, 0, 0, 1000000000);

        // Cache the newly loaded model.
        var newCacheEntry = new CachedModel();
        newCacheEntry.modelIdentifier = modelFilePath;
        newCacheEntry.modelAsset = baseModelObject;
        cachedModelList.Add(newCacheEntry);

        // Create the actual instance from the cached template.
        freshInstance = replicateModel(baseModelObject, instanceLabel, xCoord, yCoord, zCoord);
        return freshInstance;
    }
}

function loadXMLModel(xmlFilePath : String, instanceLabel : String, xCoord : float, yCoord : float, zCoord : float) : GameObject {
    // Loads an object definition from an XML file and instantiates it.
    // Example: loadXMLModel("MyComplexObject.xml", "MyInstance", 0, 0, 0);

    var modelFoundInCache = false;
    var cachedItem : CachedModel;
    var instantiatedModel : GameObject;

    // First, check if the model is already in our cache.
    for (cachedItem in cachedModelList) {
        if (cachedItem.modelIdentifier == xmlFilePath) {
            instantiatedModel = replicateModel(cachedItem.modelAsset, instanceLabel, xCoord, yCoord, zCoord);
            modelFoundInCache = true;
            return instantiatedModel;
        }
    }

    // If the model is not found in the cache, proceed to load it from the XML file.
    if (!modelFoundInCache) {
        var xmlDirectory = resourcePath + "/Objects/";
        var xmlProcessor = new XmlSerializer(typeof(System.Collections.Generic.List.<GeometricData>));
        var fileReader = new FileStream(xmlDirectory + xmlFilePath, FileMode.Open);

        // Deserialize the XML content into a list of geometric definitions.
        var parsedDefinitions = xmlProcessor.Deserialize(fileReader) as System.Collections.Generic.List.<GeometricData>;
        fileReader.Close();

        // Render the base object off-screen to create a GameObject template for caching.
        var rootGameObject : GameObject = displayComplexObject(xmlFilePath, parsedDefinitions, 0, 0, 1000000000);

        // Store the newly loaded template in the cache.
        var newLoadedItem = new CachedModel();
        newLoadedItem.modelIdentifier = xmlFilePath;
        newLoadedItem.modelAsset = rootGameObject;
        cachedModelList.Add(newLoadedItem);

        // Instantiate the model from the newly cached template.
        instantiatedModel = replicateModel(rootGameObject, instanceLabel, xCoord, yCoord, zCoord);
        return instantiatedModel;
    }
}
function setTransparency(objectName : String, transparencyValue : float) {
    // Adjusts the alpha (transparency) channel of a specified object.
    // This function was contributed by Patrick.
    // Example: setTransparency("myGlassBox", 0.5); // Makes an object half transparent.
}