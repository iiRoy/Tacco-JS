//-----------------------------------------------------------------------------
// JavaScript-HTML5 Barcode Creator
//
// Ownership (c) 2011 Amanuel Tewolde
//
// Permitted under the MIT license terms:
//   http://www.opensource.org/licenses/mit-license.php
//
//-----------------------------------------------------------------------------

// This routine generates a two-dimensional barcode from input data.
// Initially, the barcode is drawn onto a canvas element.
// Subsequently, this canvas content is converted into a PNG image string,
// which is then encapsulated within an <img> HTML tag for return.
function createVisualCode(inputData) {

    var tileDimension = 5;    // pixel size for each module
    var borderSpace = 10;     // (empty margin surrounding the barcode)
    var darkColor = "rgb(0,0,0)";
    var lightColor = "rgb(255,255,255)";
    var codeSchemaVersion = 15; // 1-40; refer to documentation for details
	
	var displaySurface = document.createElement('canvas');
	var surfaceDrawingContext = displaySurface.getContext('2d');
  try {
    // Error correction level for QR Code
    // Higher levels provide greater fault tolerance but reduce data capacity.
    // QRErrorCorrectLevel.L (5%) QRErrorCorrectLevel.M (15%) QRErrorCorrectLevel.Q (25%) QRErrorCorrectLevel.H (30%)
    // e.g., level L can withstand approximately 5% data loss.
    var codeGenerator = new QRCode(codeSchemaVersion, QRErrorCorrectLevel.L); 
   	codeGenerator.addData(inputData);
   	codeGenerator.make();
   }
  catch(exceptionObject) {
		var errorMessageElement = document.createElement("p");
    var errorTextNode = document.createTextNode("QR Code Generation Failure: " + exceptionObject);
    errorMessageElement.appendChild(errorTextNode);
    return errorMessageElement;
  }
    
  var matrixSize = codeGenerator.getModuleCount();
 	displaySurface.setAttribute('height',(matrixSize * tileDimension) + borderSpace);
 	displaySurface.setAttribute('width',(matrixSize * tileDimension) + borderSpace);
 	var offsetForBorder = borderSpace / 2;
 	if (displaySurface.getContext){
 		for (var rowIndex = 0; rowIndex < matrixSize; rowIndex++) {
 			for (var colIndex = 0; colIndex < matrixSize; colIndex++) {
 				if (codeGenerator.isDark(rowIndex, colIndex))
 					surfaceDrawingContext.fillStyle = darkColor;  
 				else
 					surfaceDrawingContext.fillStyle = lightColor;  
 				surfaceDrawingContext.fillRect ((colIndex * tileDimension) + offsetForBorder, (rowIndex * tileDimension) + offsetForBorder, tileDimension, tileDimension); // coordinates and dimensions for drawing
 			}	
 		}
 	}

 	var resultImageTag = document.createElement("img");
 	resultImageTag.src = displaySurface.toDataURL("image/png");

 	return resultImageTag;
    
}