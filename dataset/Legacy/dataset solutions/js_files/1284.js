(function(stdin) {
  function makeArray(n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push(0);
    }
    return arr;
  }

  function inRoomData(room, data) {
    data.map(function(v) {
      room[v[0] - 1][v[1] - 1][v[2] - 1] += v[3];
      return v;
    });
    return room;
  }
  var inputs = stdin.toString().trim().split('\n');
  var manData = inputs.map(function(v) {
    return v.split(' ').map(Number);
  });
  var allRoom = makeArray(4).map(function() {
    return makeArray(3).map(function() {
      return makeArray(10);
    });
  });
  manData.shift();
  console.log(inRoomData(allRoom, manData));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));