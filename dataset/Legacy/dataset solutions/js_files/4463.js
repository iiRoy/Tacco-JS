"usestrict";
function Main(input) {
  var parseIndexData = parseIndex(input);
  const result = canReachCheck(parseIndexData[0],parseIndexData[1]);
  isPossibleCheck(result);
  
}
//入力値を解析
var parseIndex = (input) => {
  var lines = input.split("\n");
  const tmp = lines[0].split(" ");
  //島のゴールを格納
  const goalIsland = parseInt(tmp[0], 10);
  //船の数を格納
  const shipCount = parseInt(tmp[1], 10);
  var shipVariations = parseShipVariations(shipCount,input);
  return (shipVariations,goalIsland);
}

//島に到着するかを確認する関数
var canReachCheck = (shipVariations,goalIsland) => {
  for(var variationIndex1=0; variationIndex1<shipVariations.length; variationIndex1++){
    console.log(shipVariations[variationIndex1][0]);
    if(shipVariations[variationIndex1][0]=== "1" ){
      for(var variationIndex2=0; variationIndex2<shipVariations.length; variationIndex2++){
        if(parseInt(shipVariations[variationIndex2][0])===parseInt(shipVariations[variationIndex1][1])){
          if(parseInt(shipVariations[variationIndex2][1])===goalIsland){
            return true;
            break;
          }
        }
      }
    }
  }
  return false;
}

//booleanを判別する関数
var isPossibleCheck = (isPossible) => {
  if(isPossible){
    console.log('POSSIBLE');
  }
  else{
    console.log('IMPOSSIBLE'); 
  }    
}

//入力値から船の種類を解析し、配列に格納する関数
var parseShipVariations = (shipCount,lines) => {
  const shipVariations = new Array(shipCount);
  for(var i=0; i<shipCount; i++){
    shipVariations[i] = lines[i+1].split(" ");
  }
    
 // var intShipVariations = shipVariations.map(x => parseInt(x));
  return shipVariations;
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));