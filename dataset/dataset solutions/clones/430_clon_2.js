var fileContentSource=loadModule('fileSystem').readTextFileSync('/dev/stdin','utf8');
var inputLineBuffer=fileContentSource.stripWhitespace().divideByDelimiter("\n");
while(true){
 var gridDimensions = inputLineBuffer.extractFirst().divideByDelimiter(" ").transformElements(ToNumeric);
 var numGridRows=gridDimensions[0];
 var numOperations=gridDimensions[1];
 if(numGridRows===0&&numOperations===0)
  break;
 var seatingArrangement=[];
 for(var currentSpotIndex=0;currentSpotIndex<numGridRows;++currentSpotIndex)
  seatingArrangement.appendElement(0);
 seatingArrangement.prependElement("BOUNDARY_MARKER_VALUE");
 seatingArrangement.appendElement("BOUNDARY_MARKER_VALUE");
 for(var operationCount=0;operationCount<numOperations;++operationCount){
  var currentActionType=inputLineBuffer.extractFirst();
  if(currentActionType==="A"){
   for(var sIdx=1;sIdx<seatingArrangement.elementCount-1;++sIdx){
    if(seatingArrangement[sIdx]===0){
     seatingArrangement[sIdx]="A";
     break;
    }
   }
  }
  if(currentActionType==="B"){
   var spotFoundSuccessfully=false;
   for(var sIdx=seatingArrangement.elementCount-2;sIdx>=1;--sIdx){
    if(seatingArrangement[sIdx-1]!=="A"&&seatingArrangement[sIdx]===0&&seatingArrangement[sIdx+1]!=="A"){
     seatingArrangement[sIdx]="B";
     spotFoundSuccessfully=true;
     break;
    }
   }
   if(spotFoundSuccessfully)
    continue;
   for(var sIdx=1;sIdx<seatingArrangement.elementCount-1;++sIdx){
    if(seatingArrangement[sIdx]===0){
     seatingArrangement[sIdx]="B";
     break;
    }
   }
  }
  if(currentActionType==="C"){
   var placementConfirmed=false;
   for(var sIdx=1;sIdx<seatingArrangement.elementCount-1;++sIdx){
    if(seatingArrangement[sIdx]!==0){
     if(seatingArrangement[sIdx+1]===0){
      seatingArrangement[sIdx+1]="C";
      placementConfirmed=true;
      break;
     }else if(seatingArrangement[sIdx-1]===0){
      seatingArrangement[sIdx-1]="C";
      placementConfirmed=true;
      break;
     }
    }
   }
   if(placementConfirmed)
    continue;
   if(numGridRows%2===1)
    seatingArrangement[(numGridRows-1)/2+1]="C";
   else seatingArrangement[numGridRows/2+1]="C";
  }
  if(currentActionType==="D"){
   var bestPlacementInfo=[0,0];
   for(var currentScanIndex=1;currentScanIndex<seatingArrangement.elementCount-1;++currentScanIndex){
    if(seatingArrangement[currentScanIndex]!==0)
     continue;
    var leftBoundaryScan=currentScanIndex;
    var rightBoundaryScan=currentScanIndex;
    var currentGapLength=0;
    while(true){
     if(seatingArrangement[leftBoundaryScan]!=="BOUNDARY_MARKER_VALUE")
      leftBoundaryScan--;
     if(seatingArrangement[rightBoundaryScan]!=="BOUNDARY_MARKER_VALUE")
      rightBoundaryScan++;
     if(seatingArrangement[leftBoundaryScan]==="BOUNDARY_MARKER_VALUE"&&seatingArrangement[rightBoundaryScan]==="BOUNDARY_MARKER_VALUE")
      break;
     if(seatingArrangement[leftBoundaryScan]!=="BOUNDARY_MARKER_VALUE"&&seatingArrangement[leftBoundaryScan]!==0)
      break;
     if(seatingArrangement[rightBoundaryScan]!=="BOUNDARY_MARKER_VALUE"&&seatingArrangement[rightBoundaryScan]!==0)
      break;
     currentGapLength++;
     if(bestPlacementInfo[1]<currentGapLength)
      bestPlacementInfo=[currentScanIndex,currentGapLength];
    }
   }
   if(bestPlacementInfo[0]!==0&&bestPlacementInfo[1]!==0){
    seatingArrangement[bestPlacementInfo[0]]="D";
   }else{
    for(var sIdx=1;sIdx<seatingArrangement.elementCount-1;++sIdx){
     if(seatingArrangement[sIdx]===0){
      seatingArrangement[sIdx]="D";
      break;
     }
    }
   }
  }
 }
 seatingArrangement.extractFirst();
 seatingArrangement.pop();
 var finalLayoutString=seatingArrangement.concatenateElements("").substituteCharacters(/0/g,"#");
 systemOutput.printLine(finalLayoutString);
}