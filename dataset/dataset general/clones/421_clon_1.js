// This file contains JavaScript code for the 3D Programming Language (3dpl).
// Copyright (C) 2012-2015 Usmar A Padow (amigojapan) usmpadow@gmail.com
// Released under the GNU General Public License (GPL) and GNU Lesser General Public License (LGPL) in 2015.
// For full license details, please refer to the COPYING.TXT file.

/*
 * This program is free software; you are permitted to redistribute it
 * and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your discretion) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY whatsoever; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * Please refer to the GNU General Public License for more comprehensive details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, please visit <http://www.gnu.org/licenses/>.
 */


// Future considerations:
// It might be beneficial to change the implementation to avoid using string-based
// lookups like `GetComponent("MyCamera")`.
// For instance, a direct reference `theCamera = GetComponent(MyCameraComponent);`
// would be more robust.

/*
 * // This section contains examples of planned future functionalities
 * // or conceptual code snippets for the 3dpl environment.
 * // These are not active code but illustrative comments.
 */

/*
 * // A potential feature: directly manipulating objects in the 3D environment
 * // could generate corresponding code snippets.
 * // Example scenarios:
 *
 * // How to create a cube (lines starting with // are comments and are ignored by the interpreter)
 * qb("mycube", 0, 0, 0);
 *
 * // Now, let's adjust the coordinates of "mycube" to observe its movement.
 * // For instance, change one of the '0's to a '1' or '2'.
 * qb("mycube", 2, 0, 1);
 *
 * // Example with multiple colored cubes, one rotating, one translating.
 * // Declarations of objects:
 * qb("lynn", 0, 0, 0);
 * cl("lynn", Color.blue);
 * qb("usmar", 2, 0, 0);
 * cl("usmar", Color.green);
 * // Update function logic (executed every frame):
 * rt("lynn", 10, 10, 10);
 * mv("usmar", -1, 0, 0);
 *
 * // Another example: three cubes with different properties.
 * // Object Declarations:
 * qb("a*", 0, 0, 0); // Note: "a*" might be a placeholder or special naming.
 * cl("a", Color.blue);
 * qb("b", 2, 1, 1);
 * cl("b", Color.green);
 * qb("c", -2, -1, -1);
 * cl("c", Color.red);
 * // Update logic:
 * rt("a", 10, 10, 10);
 * rt("b", -10, -10, -10);
 * rt("c", 10, 10, 10);
 *
 * // A more complex object: a car assembly.
 * // Declarations for car components:
 * ra("carbody", 4, 8);
 * cl("carbody", Color.green);
 *
 * ra("carroof", 4, 4);
 * cl("carroof", Color.red);
 * an("carbody", 90, 90, 0);
 * an("carroof", 90, 90, 0);
 * cp("carbody", 0, -1, 0);
 * qb("tire1", -4, -2, -2);
 * cl("tire1", Color.black);
 * qb("tire2", 4, -2, -2);
 * cl("tire2", Color.black);
 * an("tire1", 90, 90, 0);
 * an("tire2", 90, 90, 0);
 * // Update function (movement and rotation):
 * // rt("tire1", 0, 0, 50); // Example of commented-out code
 * // rt("tire2", 0, 0, 50);
 * mv("carbody", 0, 1, 0);
 * mv("carroof", 0, 1, 0);
 * mv("tire1", 0, 1, 0);
 * mv("tire2", 0, 1, 0);
 * rt("tire1", 0, 0, 50);
 * rt("tire2", 0, 0, 50);
 *
 * // Example demonstrating real-time code evaluation.
 * // Declarations (type these line by line):
 * qb("cube1", 0, 0, 0);
 * qb("cube2", 3, 0, 0);
 * qb("cube1", -2, 0, 0); // This will re-position "cube1"
 * cl("cube1", Color.green);
 * sc("cube2", 2, 1, 1);
 * an("cube2", 0, 0, 45);
 * // Update function (click 'START' after typing this section):
 * rt("cube1", 20, 20, 20);
 * mv("cube2", 1, 0, 0);
 *
 * // Example illustrating the use of a custom function.
 * // Declarations section:
 * function blue(name) {
 *   cl(name, Color.blue);
 * }
 * qb("ino", 2, 2, 2);
 * qb("ino", -5, 2, 10); // Repositions "ino"
 * blue("ino");
 * qb("ino2", 5, 2, 2);
 * sc("ino2", 3, 2, 2);
 * var a = 0;
 * while (a < 5) {
 *   a++;
 *   qb("a", a, a, a);
 * }
 * for (b = 0; b < 6; b--) { // Note: b-- will create an infinite loop here unless 'b' is initialized differently or the condition changes.
 *   qb("b", b, b, b);
 * }
 * // Update function:
 * rt("ino", 50, 50, 50);
 * mv("ino2", 20, 20, 20);
 * rt("a", 90, 90, 90);
 * rt("b", -90, -90, -90);
 */

/*
 * // List of features and improvements to be implemented in the future:
 * // - Add functionalities for loading and saving scripts.
 * // - Implement warnings when program evaluation fails, providing specific reasons.
 * // - Create a function to make blocks transparent or completely invisible.
 * // - Develop collision detection capabilities between objects.
 * // - Add methods to control camera movement, possibly reusing existing object movement functions.
 */

// Declaration of global public variables, accessible from the Unity Editor.
import System;
import System.IO;
import System.Xml.Serialization;
import System.IO.Stream;
import System.Runtime.Serialization;
import System.Runtime.Serialization.Formatters.Binary;
import System.Collections.Generic;

var ShowMainMenu = true;
var ShowAboutScreen = false;
var ShowCreativeModeMenu = false;

// Content for the "About" box, providing version and copyright information.
private var AboutBoxContent = "3dpl - The 3d programming language.\nVersion Beta 3.1.1.\nCopyright 2012 by Usmar A. Padow (amigojapan) usmpadow@gmail.com\nHelp by Gregory Cox.\nPatrick Robotham.\nMusic from NathanWillsMusic.com";

var www; // Used for web-related operations, e.g., downloading assets.

var ShowDownloadMenu = false;
var ShowDescriptionAndDownloadMenu = false;
var ShowloginMenu = false;

var Message = ""; // General message display area.
var ShowMessageBox = false;

var InputEmail = "";
var InputPassword = "";
var LoginSuccesful = false;

var ShowInputBox = false;
var ShowFileDialog = false;

var UserInput = "";
var InputAction = "";

var EditBig = false; // Flag for a larger editing area.
var ShowDebug = false; // Controls visibility of debug information.

// Variables to manage scrolling within GUI elements.
var scrollPosition: Vector2;
var scrollPositionFileDialog: Vector2;
var MemoryLeakScoll: Vector2;

// String to accumulate and display debug information.
var debugString = "Debug info:";

var path: String = "No path set"; // Base path for application data.
var ObjectEditorMode = false;

// Teleport coordinates for quick camera/player relocation.
var TeleportX: String = "0";
var TeleportY: String = "1";
var TeleportZ: String = "-10";

// Object Builder related variables.
var CurrentCubesName: String = "FailedToGiveACubeName";
var CurrentTextureWebOrFile: String = "File";
var CurrentTextureName: String = "";
var Currentalpha: String = "1.0";
var CurrentRedValue: String = "255";
var CurrentGreenValue: String = "255";
var CurrentBlueValue: String = "255";
var CurrentWrapOnSides: String = "1";
var GiudingGreenLight: String = "Off"; // A guiding visual aid status.

// Map Editor specific variables.
var ShowMapEditor: boolean = false;
var ShowProgrammingMode = false;
var CurrentObjFilename = "";
var dataPath: String = "No data path set"; // Path specifically for data files.

// var scrollPositionMapObjects:Vector2; // Commented out scroll position for map objects.

// Definition of the MapObject class, used for map serialization.
class MapObject {
  // @XmlAttribute("objfilename") // XML serialization attribute hints.
  public var objfilename = "";
  // @XmlAttribute("instancename")
  public var instancename = "";
  // @XmlAttribute("x")
  public var x: int;
  // @XmlAttribute("y")
  public var y: int;
  // @XmlAttribute("z")
  public var z: int;

  public var rotx: int; // Rotation around X-axis.

  public var roty: int; // Rotation around Y-axis.

  public var rotz: int; // Rotation around Z-axis.
}

// @XmlArray("MapObjectList") // XML array serialization hints.
// @XmlArrayItem("MapObject")
var MapObjectBuilderList: System.Collections.Generic.List.<MapObject>;
MapObjectBuilderList = new System.Collections.Generic.List.<MapObject>(); // Initialize the list.

var MapLoadedObjectsList = new System.Collections.Generic.List.<String>(); // List of names of objects loaded in the map.

// Object Builder declarations (commented out initializations).
// ObjectBuilderDeclarations+="var a : System.Collections.Generic.List.<Object> = new System.Collections.Generic.List.<Object>();\n";
// ObjectBuilderDeclarations+="vars[\"cubesarray\"]= a;\n";

// Definition of the LoadedTexture class.
// @XmlAttribute("Coordinates") // This attribute seems misplaced here.
class LoadedTexture {
  public var TextureName: String = null;
  public var Texture_: Texture; // The actual Texture object.
}
var LoadedTextureList = new System.Collections.Generic.List.<LoadedTexture>(); // List of loaded textures.

// Definition of the LoadedSound class.
class LoadedSound {
  public var FileName: String = null;
  public var AudioClip_: AudioClip; // The actual AudioClip object.
}
var LoadedSoundList = new System.Collections.Generic.List.<LoadedSound>(); // List of loaded sounds.

// Definition of the Coordinates class, used for object serialization.
class Coordinates {
  @XmlAttribute("cubename")
  public var cubename = "";
  @XmlAttribute("x")
  public var x: int;
  @XmlAttribute("y")
  public var y: int;
  @XmlAttribute("z")
  public var z: int;
  @XmlAttribute("r")
  public var r: int = 255;
  @XmlAttribute("g")
  public var g: int = 255;
  @XmlAttribute("b")
  public var b: int = 255;
  @XmlAttribute("TextureName")
  public var TextureName = "";
  @XmlAttribute("TextureWebOrFile")
  public var TextureWebOrFile = "File";
  @XmlAttribute("alpha")
  var alpha: float = 1.0;
  @XmlAttribute("WrapOnSides")
  var WrapOnSides: int = 1;
  // Further development notes:
  // - Consider adding a 'parent' property to point to the name of an AxisPoint.
  // - An AxisPoint would not have a parent, but its name should reflect the object's identity.
  // - Perhaps an additional field like 'ObjectName' is needed.
  // - Also, a unique ID could be generated (e.g., using System.GUID.newGUID())
  //   and stored in the 'cubename' property.
}

@XmlArray("ObjectList") // XML serialization for a list of objects.
@XmlArrayItem("Object")
var ObjectBuilderList: System.Collections.Generic.List.<Coordinates>;
ObjectBuilderList = new System.Collections.Generic.List.<Coordinates>(); // Initialize the object list for building.

// Class for saving and loading binary files using BinaryFormatter.
class SaveLoad {
  public static function SaveFile(filename: String, obj: Object): void {
    try {
      // Debug.Log("Writing Stream to Disk.", SaveLoad); // Debugging line.
      var fileStream: Stream = File.Open(filename, FileMode.Create);
      var formatter: BinaryFormatter = new BinaryFormatter();
      formatter.Serialize(fileStream, obj);
      fileStream.Close();
    } catch (e: Exception) {
      Debug.LogWarning("Save.SaveFile(): Failed to serialize object to a file " + filename + " (Reason: " + e.ToString() + ")");
    }
  }

  public static function LoadFile(filename: String): Object {
    try {
      // Debug.Log("Reading Stream from Disk.", SaveLoad); // Debugging line.
      var fileStream: Stream = File.Open(filename, FileMode.Open, FileAccess.Read);
      var formatter: BinaryFormatter = new BinaryFormatter();
      var obj: Object = formatter.Deserialize(fileStream);
      fileStream.Close();
      return obj;
    } catch (e: Exception) {
      Debug.LogWarning("SaveLoad.LoadFile(): Failed to deserialize a file " + filename + " (Reason: " + e.ToString() + ")");
      return null;
    }
  }
}

// The Start function is called once when the script instance is being loaded.
function Start() {
  /*
   * var test2 = new Coordinates();
   * test2.cubename="Test456";
   */
  // var test = new MapObject();
  // test.objfilename="testing 123";
  // Debug.Log(test.objfilename);
  // AboutBoxContent+="here1"; // Debugging content for AboutBox.

  #if UNITY_STANDALONE_OSX // Platform-specific code for macOS.
    // import System.IO; // System.IO is already imported at the top.
    var Dir: DirectoryInfo = new DirectoryInfo(Application.dataPath);
    path = Dir.Parent.Parent.ToString() + "/Assets";
    // path = "/Users/amigojapan/Desktop/3dpl GPL/Assets/"; // Example absolute path.
    AboutBoxContent += "\n\nMac Data Folder:" + path;
  #endif

  dataPath = path; // Initialize dataPath with the determined path.

  CubeMaterial = new Material(Shader.Find("Transparent/Diffuse")); // Initialize the default cube material.
  // AboutBoxContent+="here3"; // Debugging content.
  CubeMaterial.color = Color.white; // Set default color to white.
  // AboutBoxContent+="here2"; // Debugging content.

  // Handle data path for Windows and Linux players.
  if (Application.platform == RuntimePlatform.WindowsPlayer || Application.platform == RuntimePlatform.LinuxPlayer) {
    dataPath = path;
    AboutBoxContent += "\n\nData Folder:" + dataPath;
  }

  // Position the crosshair texture in the center of the screen.
  position = Rect((Screen.width - crosshairTexture.width) / 2, (Screen.height -
    crosshairTexture.height) / 2, crosshairTexture.width, crosshairTexture.height);
}

var CubeMaterial: Material; // Declared here, assigned in Start() function.

// Function to create a basic cube object.
function qb(name: String, x, y, z) {
  // Purpose: Create a cube with a given name and coordinates.
  // Example usage: qb("mytag", 1, 1, 1);
  var cube: GameObject = GameObject.CreatePrimitive(PrimitiveType.Cube);
  cube.transform.position = Vector3(x, y, z);
  cube.transform.name = name; // Assign the provided name to the cube's GameObject.

  // Assign the shared CubeMaterial to the new cube.
  cube.renderer.material = CubeMaterial;

  cubes.push(cube); // Add the newly created cube to the global 'cubes' array.

  // Example of commented-out material settings:
  // var material = new Material (Shader.Find ("Transparent/Diffuse"));
  // material.color = Color.white;
  // cube.renderer.material = material;
  // cube.renderer.material.shader = Shader.Find("Diffuse");
  // cube.renderer.material.color = Color.green;

  return cube; // Return the created GameObject.
  // Example of commented-out movement:
  // cube.transform.Translate(0,10*Time.deltaTime,0);
}

// Function to create a cube that is NOT added to the main 'cubes' list.
function Unlisted_qb(name: String, x, y, z) {
  // Purpose: Create a cube for internal use, not tracked in 'cubes' array.
  // Example usage: Unlisted_qb("temporary_cube", 0, 0, 0);
  var cube: GameObject = GameObject.CreatePrimitive(PrimitiveType.Cube);
  cube.transform.position = Vector3(x, y, z);
  cube.transform.name = name;

  // Create a new material specifically for this unlisted cube.
  var material = new Material(Shader.Find("Transparent/Diffuse"));
  material.color = Color.white;
  // Assign the new material to the renderer.
  cube.renderer.material = material;

  // cubes.push(cube); // This line is intentionally commented out, making it "unlisted".

  return cube; // Return the created GameObject.
  // Example of commented-out movement:
  // cube.transform.Translate(0,10*Time.deltaTime,0);
}

// Function to render an object from a list of coordinates.
function RenderObject(UserDefinedObjectName: String, objlist: System.Collections.Generic.List.<Coordinates>, x: float, y: float, z: float): GameObject {
  // This function iterates through a list of 'Coordinates' to construct a complex object.
  // It handles axis points, colliders, colors, alpha, and textures.
  var AxisPoint: GameObject; // Declare AxisPoint here.

  for (cords in objlist) {
    if (cords.cubename == "AxisPoint") {
      AxisPoint = qb(UserDefinedObjectName, 0, 0, 0); // Create the main axis point for the object.
      alpha(UserDefinedObjectName, 0.0); // Make the AxisPoint invisible.
      cubes.RemoveAt(cubes.length - 1); // Remove it from 'cubes' list so it's unlisted.
      continue; // Move to the next coordinate.
    }

    /*
     * // Old collider handling (commented out).
     * if(cords.cubename.Substring(0,"collider".Length) =="collider") {
     *   qb(UserDefinedObjectName,0,0,0);
     *   alpha(UserDefinedObjectName,0.0);
     *   continue;
     * }
     */

    var ChildCube: GameObject = qb(cords.cubename, cords.x, cords.y, cords.z); // Create a child cube.

    // Apply color if specified and not default white.
    if (cords.r != 255 || cords.g != 255 || cords.b != 255) cl(cords.cubename, Color32(cords.r, cords.g, cords.b, 255));

    // Apply alpha (transparency) if specified and not default opaque.
    if (cords.alpha != 1.0) alpha(cords.cubename, cords.alpha);

    // Apply texture if a texture name is provided.
    if (cords.TextureName != "") tx(cords.cubename, cords.TextureName, cords.TextureWebOrFile, cords.WrapOnSides);

    ChildCube.transform.parent = AxisPoint.transform; // Parent the child cube to the AxisPoint.

    // If the child cube is a "collider", make it invisible.
    if (cords.cubename.Substring(0, "collider".Length) == "collider") {
      alpha(cords.cubename, 0.0);
    }
    cubes.RemoveAt(cubes.length - 1); // Remove child cube from 'cubes' list.
  }
  // Position the entire object (AxisPoint and its children) at the specified coordinates.
  AxisPoint.transform.position.x = x;
  AxisPoint.transform.position.y = y;
  AxisPoint.transform.position.z = z;

  return AxisPoint; // Return the root GameObject of the rendered object.
}

var MapParent: GameObject; // The parent GameObject for all map objects.
var MapName: String; // The name of the currently loaded map.

// Function to load and render a map created in the Map Editor.
function Map(FileName: String, InstanceName: String, x: float, y: float, z: float) { // Consider returning GameObject (TODO).
  // Goal: Render a map from a file, optionally preserving original names.
  MapName = InstanceName; // Store the instance name.

  // Load the map data from the specified file.
  MapObjectBuilderList = SaveLoad.LoadFile(dataPath + "/Maps/" + FileName);

  // Render objects within the map.
  var myObj: GameObject;

  MapName = InstanceName; // Re-assigning MapName.

  // Create a parent object for the entire map, placed far away initially.
  MapParent = qb("MapParent", 0, 0, 10000000);
  alpha("MapParent", 0.0); // Make the map parent invisible.

  for (cords in MapObjectBuilderList) {
    if (InstanceName == "Original Names") {
      // Use original instance names from the map data.
      myObj = Obj(cords.objfilename, cords.instancename, cords.x, cords.y, cords.z);
    } else {
      // Use the provided InstanceName for all objects in the map.
      myObj = Obj(cords.objfilename, InstanceName, cords.x, cords.y, cords.z);
    }
    myObj.transform.parent = MapParent.transform; // Parent the object to MapParent.
    // Apply rotation from map data.
    myObj.transform.rotation = Quaternion.Euler(cords.rotx, cords.roty, cords.rotz);
  }
}

// Class to hold references to loaded objects.
class LoadedObject {
  public var ObjectName: String = null;
  // public var Object : System.Collections.Generic.List.<Coordinates>; // Original thought: store coordinates list.
  public var Object: GameObject; // Actual implementation: store the GameObject itself.
}
var LoadedObjectList = new System.Collections.Generic.List.<LoadedObject>(); // List of all loaded object definitions.

/*
 * // Class to track instances of objects (commented out).
 * class ObjectInstances {
 *   public var InstanceName:String=null;
 *   public var ChildrenNames = new System.Collections.Generic.List.<String>();
 * }
 * var InstantiatedObjects= new System.Collections.Generic.List.<ObjectInstances>();
 */

var InstanceNameList = new System.Collections.Generic.List.<String>(); // List of names of instantiated objects.

// Function to clone an existing GameObject and place it at new coordinates.
function CloneObject(obj: GameObject, InstanceName: String, x: float, y: float, z: float): GameObject {
  // var tmp:GameObject=GameObject.Find(FileName); // This line is commented out; error analysis.
  // Issue: The original object might have been deleted if it was a child of a temporary parent.
  var newobj: GameObject = Instantiate(obj, Vector3(x, y, z), Quaternion.identity); // Create a new instance.
  newobj.name = InstanceName; // Assign the new instance name.
  cubes.push(newobj); // Add the new object to the 'cubes' array (TODO: rename 'cubes' to 'objects').
  // cubes.push(newobj); // Redundant push?

  InstanceNameList.Add(InstanceName); // Track the instance name.
  return newobj; // Return the cloned GameObject.
}

// Function to load and instantiate an object from a binary file.
function Obj(FileName: String, InstanceName: String, x: float, y: float, z: float): GameObject {
  // Example usage: Obj("MyObject.bin", "InstanceName", x, y, z);
  var objectFound = false;
  var obj: LoadedObject;
  var newobj: GameObject;

  // Check if the object definition is already loaded.
  for (obj in LoadedObjectList) {
    if (obj.ObjectName == FileName) {
      // If found, clone the existing GameObject.
      newobj = CloneObject(obj.Object, InstanceName, x, y, z);
      objectFound = true;
      return newobj;
    }
  }

  // If the object definition is not yet loaded.
  if (!objectFound) {
    var path = dataPath + "/Objects/";
    var obj2 = SaveLoad.LoadFile(path + FileName); // Load object data from binary file.

    // Render a temporary instance of the object far away to get its GameObject structure.
    var go: GameObject = RenderObject(FileName, obj2, 0, 0, 1000000000); // Hack: render off-screen.
    var lo = new LoadedObject();
    lo.ObjectName = FileName;
    lo.Object = go;
    LoadedObjectList.Add(lo); // Add the loaded object definition to the list.

    // Clone this newly rendered (and stored) object for the actual instance.
    newobj = CloneObject(go, InstanceName, x, y, z);
    return newobj;
  }
}

// Function to load and instantiate an object from an XML file.
function XMLObj(FileName: String, InstanceName: String, x: float, y: float, z: float): GameObject {
  // Example usage: XMLObj("MyObject.xml", "InstanceName", x, y, z);
  var objectFound = false;
  var obj: LoadedObject;
  var newobj: GameObject;

  // Check if the object definition is already loaded.
  for (obj in LoadedObjectList) {
    if (obj.ObjectName == FileName) {
      // If found, clone the existing GameObject.
      newobj = CloneObject(obj.Object, InstanceName, x, y, z);
      objectFound = true;
      return newobj;
    }
  }

  // If the object definition is not yet loaded.
  if (!objectFound) {
    var path = dataPath + "/Objects/";
    var serializer = new XmlSerializer(typeof(System.Collections.Generic.List.<Coordinates>)); // XML serializer.
    var reader = new FileStream(path + FileName, FileMode.Open); // Open the XML file.
    // serializer.Serialize(writer, ObjectBuilderList); // Example of serialization (commented out).
    var obj2 = serializer.Deserialize(reader) as System.Collections.Generic.List.<Coordinates>; // Deserialize XML data.
    reader.Close(); // Close the file stream.

    // Render a temporary instance of the object far away to get its GameObject structure.
    var go: GameObject = RenderObject(FileName, obj2, 0, 0, 1000000000); // Hack: render off-screen.
    var lo = new LoadedObject();
    lo.ObjectName = FileName;
    lo.Object = go;
    LoadedObjectList.Add(lo); // Add the loaded object definition to the list.

    // Clone this newly rendered (and stored) object for the actual instance.
    newobj = CloneObject(go, InstanceName, x, y, z);
    return newobj;
  }
}

// Function to adjust the alpha (transparency) of a cube.
// (This function was contributed by Patrick Robotham.)
function alpha(name: String, alpha_: float) {
  // Example usage: To make a cube half transparent: alpha("myCube", 0.5);
  // Implementation details would follow here, e.g., finding the cube by name and modifying its material's alpha.
}