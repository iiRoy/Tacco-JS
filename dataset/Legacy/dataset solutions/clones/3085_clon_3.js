function processGolemQueries(rawData) {
  var initialGolemTypes = [];

  var lines = rawData.split('\n');

  var configLine = lines[0].split(' ').map(Number);
  var boardSize = configLine[0];
  var numQueries = configLine[1];

  var golemStateTracker = lines[1].split('').map(function(charType) {
    initialGolemTypes.push(charType);
    var stateObject = { num: 1 };
    stateObject[charType] = true;
    return stateObject;
  });

  var activeGolemCount = boardSize;

  const LEFT_MOVE_DELTA = -1;
  const RIGHT_MOVE_DELTA = 1;
  const FIRST_QUERY_LINE_INDEX = 2;

  for (var queryIdx = FIRST_QUERY_LINE_INDEX; queryIdx < numQueries + FIRST_QUERY_LINE_INDEX; queryIdx++) {
    var currentQuery = lines[queryIdx].split(' ');
    var targetGolemType = currentQuery[0];
    var moveDirection = currentQuery[1];

    var movementDelta = (moveDirection === 'L') ? LEFT_MOVE_DELTA : RIGHT_MOVE_DELTA;

    for (let initialPosIdx = 0; initialPosIdx < initialGolemTypes.length; initialPosIdx++) {
      if (golemStateTracker[initialPosIdx][targetGolemType]) {
        golemStateTracker[initialPosIdx][targetGolemType] = false;

        var newPosition = initialPosIdx + movementDelta;

        if (newPosition < 0 || newPosition >= boardSize) {
          activeGolemCount -= golemStateTracker[initialPosIdx].num;
        } else {
          golemStateTracker[newPosition][initialGolemTypes[newPosition]] = true;
          golemStateTracker[newPosition].num += golemStateTracker[initialPosIdx].num;
        }
        golemStateTracker[initialPosIdx].num = 0;
      }
    }
  }
  console.log(activeGolemCount);
}

processGolemQueries(require("fs").readFileSync("/dev/stdin", "utf8"));
