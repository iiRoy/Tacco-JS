function BattleSimulation(inputContent) {

 inputContent = inputContent
  .split('\n')
  .map( lineStr => lineStr
   .split(' ')
   .map( numStr => parseInt(numStr, 10) )
  );

 let [ , , worldX, worldY ] = inputContent[0];
 let armyXPositions = inputContent[1] , armyYPositions = inputContent[2];

 armyXPositions.push(worldX);
 armyYPositions.push(worldY);

 if ( armyXPositions
  .reduce( (currentMax, nextVal) => Math.max(currentMax, nextVal) )
  < armyYPositions
  .reduce( (currentMin, nextVal) => Math.min(currentMin, nextVal) )
 )
  console.log('No War');
 else
  console.log('War');
}

BattleSimulation(
 require('fs')
  .readFileSync('/dev/stdin', 'utf8')
);