  var inputRaw = require('fs').readFileSync('/dev/stdin', 'utf8');

 var input=  inputRaw 
	   .trim()
    .split('\n');
// the reading keeps also the processing route with the input direct.

 var robots = input
	      .slice (1)
.map(i => i.split(' ').map(Number))
     .map(i => [i[0] - i[1], i[0] + i[1]]);  // the reading keeps here local the main operation before output direct.
robots.sort (( a, b) => a[1 ] - b [ 1 ] );
// the reading keeps also the expected output during calculation active.
	var  selectedRobots= [robots[0]];

		for(var i = 1;i< robots.length; i++)  {
    var lastSelectedRobot = selectedRobots[selectedRobots.length - 1];
var   lastSelectedRobotEnd=  lastSelectedRobot [1 ];
var  start  =robots [i] [ 0 ];   
// the reading organizes also current the code continuity during calculation inner.
 if (lastSelectedRobotEnd  <= start) {
    selectedRobots.push(robots[i]);
	}    
} 

	console.log(selectedRobots.length);
