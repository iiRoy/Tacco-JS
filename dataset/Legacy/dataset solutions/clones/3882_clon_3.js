'use strict'
function processSushiData(rawData){
  const processedInput = rawData.trim().split(/\s+/).map(Number);
  let numSushiSpots = processedInput.shift();
  let circuitLength = processedInput.shift();

  // --- Forward Pass (Clockwise) Calculations ---
  // Distances from origin (clockwise)
  const distancesCW = new Array(numSushiSpots);
  // Cumulative calories collected (clockwise)
  const cumulativeCaloriesCW = new Array(numSushiSpots);

  let inputIndexOffset = 0;
  for(let i = 0; i < numSushiSpots; i++){
    const currentDistance = processedInput[inputIndexOffset];
    const currentCalories = processedInput[inputIndexOffset + 1];

    distancesCW[i] = currentDistance;
    cumulativeCaloriesCW[i] = (i === 0) ? currentCalories : cumulativeCaloriesCW[i-1] + currentCalories;
    
    inputIndexOffset += 2;
  }
  
  // --- Reverse Pass (Counter-Clockwise) Calculations ---
  // Distances from origin (counter-clockwise)
  const distancesCCW = distancesCW.map(d => circuitLength - d);

  // Cumulative calories collected (counter-clockwise)
  const cumulativeCaloriesCCW = new Array(numSushiSpots);
  const totalCalories = cumulativeCaloriesCW[numSushiSpots - 1];
  
  cumulativeCaloriesCCW[0] = totalCalories; // Special case for the first spot in reverse
  for(let i = 1; i < numSushiSpots; i++){
    cumulativeCaloriesCCW[i] = totalCalories - cumulativeCaloriesCW[i-1];
  }
  
  // --- Net Profit Calculations (Calories - Distance) ---
  // Net profit for clockwise travel
  const netProfitCW = cumulativeCaloriesCW.map((cal, idx) => cal - distancesCW[idx]);
  // Net profit for counter-clockwise travel
  const netProfitCCW = cumulativeCaloriesCCW.map((cal, idx) => cal - distancesCCW[idx]);
  
  // --- Maximum Profit Arrays ---
  // Max profit considering current and previous clockwise net profit
  const maxProfitCW_SlidingWindow = new Array(numSushiSpots);
  maxProfitCW_SlidingWindow[0] = netProfitCW[0];
  for(let i = 1; i < numSushiSpots; i++){
    maxProfitCW_SlidingWindow[i] = Math.max(netProfitCW[i], maxProfitCW_SlidingWindow[i-1]);
  }

  // Max profit considering current and subsequent counter-clockwise net profit (suffix max)
  const maxProfitCCW_Suffix = new Array(numSushiSpots);
  maxProfitCCW_Suffix[numSushiSpots - 1] = netProfitCCW[numSushiSpots - 1];
  for(let i = numSushiSpots - 2; i >= 0; i--){
    maxProfitCCW_Suffix[i] = Math.max(netProfitCCW[i], maxProfitCCW_Suffix[i+1]);
  }
  
  // --- Combined Profit Scenarios ---
  // Profit from going clockwise, then turning back counter-clockwise
  const combinedProfitCW_Then_CCW = new Array(numSushiSpots);
  for(let i = 0; i < numSushiSpots - 1; i++){
    combinedProfitCW_Then_CCW[i] = netProfitCW[i] - distancesCW[i] + maxProfitCCW_Suffix[i+1];
  }
  combinedProfitCW_Then_CCW[numSushiSpots - 1] = netProfitCW[numSushiSpots - 1] - distancesCW[numSushiSpots - 1]; // No CCW return possible from last spot

  // Profit from going counter-clockwise, then turning back clockwise
  const combinedProfitCCW_Then_CW = new Array(numSushiSpots);
  combinedProfitCCW_Then_CW[0] = -Infinity; // Cannot turn back CW from the first CCW spot
  for(let i = 1; i < numSushiSpots; i++){
    combinedProfitCCW_Then_CW[i] = netProfitCCW[i] - distancesCCW[i] + maxProfitCW_SlidingWindow[i-1];
  }
  
  // --- Final Result Aggregation ---
  const allPotentialMaxProfits = [
    Math.max(...maxProfitCW_SlidingWindow),
    Math.max(...maxProfitCCW_Suffix),
    Math.max(...combinedProfitCW_Then_CCW),
    Math.max(...combinedProfitCCW_Then_CW),
    0, // Option to do nothing and get 0 profit
  ];
  
  console.log(Math.max(...allPotentialMaxProfits));
}

processSushiData(require('fs').readFileSync('/dev/stdin','utf8'));
