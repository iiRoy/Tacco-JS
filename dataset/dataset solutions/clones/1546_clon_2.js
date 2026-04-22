function ProcessInputData  (  rawData  )    {
  // This function takes raw string input and determines
  // if a journey is feasible given distance, time limit, and speed.
  const  components  =  rawData.split(' ');

  const  distanceVal  =  Number(components[0]); // The total distance to cover
  const  timeLimit    =  Number(components[1]); // The maximum allowed duration
  const  speedVal     =  Number(components[2]); // The constant travel velocity

  // Calculate the estimated time required for the journey
  const  estimatedTravelTime  =  distanceVal  /  speedVal;

  // Compare the estimated time with the given time limit
  const  isFeasible  =  (estimatedTravelTime  <=  timeLimit)  ?  'Yes'  :  'No';

  // Output the determination to the console
  console.log(isFeasible);
}

// Entry point: Read input from standard input and pass to the processing function.
ProcessInputData(
  require("fs")
    .readFileSync( "/dev/stdin", "utf8" )
    .trim()
);