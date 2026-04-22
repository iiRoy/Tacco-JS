// Represents a six-sided object with distinct faces
function Cube(markings) {
  this.upper = markings[0]; // The top face's value
  this.rear = markings[1];  // The back face's value
  this.starboard = markings[2]; // The right face's value
  this.port = markings[3];  // The left face's value
  this.fore = markings[4];  // The front face's value
  this.lower = markings[5]; // The bottom face's value
}

// Method to reorient the cube based on a given direction
Cube.prototype.rotate = function(orientation) {
 switch (orientation) {
  case 'W': // Rotate towards West
   let tempVal1 = this.port;
   this.port = this.upper;
   this.upper = this.starboard;
   this.starboard = this.lower;
   this.lower = tempVal1;
   break;
  case 'N': // Rotate towards North
   let tempVal2 = this.fore;
   this.fore = this.upper;
   this.upper = this.rear;
   this.rear = this.lower;
   this.lower = tempVal2;
   break;
  case 'E': // Rotate towards East
   let tempVal3 = this.starboard;
   this.starboard = this.upper;
   this.upper = this.port;
   this.port = this.lower;
   this.lower = tempVal3;
   break;
  case 'S': // Rotate towards South
   let tempVal4 = this.rear;
   this.rear = this.upper;
   this.upper = this.fore;
   this.fore = this.lower;
   this.lower = tempVal4;
   break;
  case 'R': // Rotate clockwise around the vertical axis
   let tempVal5 = this.starboard;
   this.starboard = this.fore;
   this.fore = this.port;
   this.port = this.rear;
   this.rear = tempVal5;
   break;
  case 'L': // Rotate counter-clockwise around the vertical axis
   let tempVal6 = this.port;
   this.port = this.fore;
   this.fore = this.starboard;
   this.starboard = this.rear;
   this.rear = tempVal6;
   break;
 }
};

// Creates an exact copy of the current cube object
Cube.prototype.duplicate = function() {
 return new Cube([
  this.upper,
  this.rear,
  this.starboard,
  this.port,
  this.fore,
  this.lower
 ]);
};

// Compares this cube's face values with another cube's face values
Cube.prototype.areIdentical = function(anotherObject) {
 return (
  this.upper == anotherObject.upper &&
  this.rear == anotherObject.rear &&
  this.starboard == anotherObject.starboard &&
  this.port == anotherObject.port &&
  this.fore == anotherObject.fore &&
  this.lower == anotherObject.lower
 );
};

// Checks if this cube can be rotated to match another cube's markings
Cube.prototype.matchMarkings = function(anotherObject) {
 let currentCube = this.duplicate(); // Create a working copy
 const rotations = 'NEEEN'.split(''); // Sequence of major rotations
 let idx1 = 0;
 do {
  let idx2 = 0;
  do {
   if (currentCube.areIdentical(anotherObject)) {
    return true; // Found a match
   }
   currentCube.rotate('R'); // Rotate around the vertical axis
  } while (idx2++ < 3); // Perform 4 vertical rotations
  currentCube.rotate(rotations[idx1]); // Apply the next major rotation
 } while (idx1++ < rotations.length); // Iterate through all major rotation sequences
 return false; // No matching orientation found
};

// Determines the value of the starboard face given specific upper and rear face values
Cube.prototype.getStarboardByUpperAndRear = function(upperSide, rearSide) {
 let currentCube = this.duplicate(); // Make a copy to manipulate
 const rotations = 'NEEEN'.split(''); // Predefined sequence of rotations
 let idx1 = 0;
 do {
  let idx2 = 0;
  do {
   if (currentCube.upper === upperSide && currentCube.rear === rearSide) {
    return currentCube.starboard; // Found the desired orientation
   }
   currentCube.rotate('R'); // Rotate vertically
  } while (idx2++ < 3); // Try all 4 vertical orientations
  currentCube.rotate(rotations[idx1]); // Apply next primary rotation
 } while (idx1++ < rotations.length); // Iterate through all primary rotations
 return null; // No orientation found that matches the criteria
};

// Main execution block: Reads input, processes cubes, and checks for duplicates
(function(rawData) {
 const lines = rawData.split('\n'); // Split input into individual lines
 const numCubes = Number(lines.shift()); // Get the number of cubes from the first line
 let cubeCollection = []; // Array to store all created cube objects

 // Populate the collection with cube instances
 for (let idx1 = 0; idx1 < numCubes; idx1++) {
  const faceMarks = lines.shift().split(' ').map(Number); // Parse face markings
  const newCube = new Cube(faceMarks); // Create a new cube instance
  cubeCollection.push(newCube); // Add to the collection
 }

 // Compare each cube with every other cube for rotational equivalence
 for (let idx1 = 0; idx1 < numCubes; idx1++) {
  for (let idx2 = idx1 + 1; idx2 < numCubes; idx2++) {
   if (cubeCollection[idx1].matchMarkings(cubeCollection[idx2])) {
    console.log('No'); // If any two cubes are rotationally identical, output 'No'
    return; // Exit early
   }
  }
 }
 console.log('Yes'); // If no identical cubes are found, output 'Yes'

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input synchronously from stdin