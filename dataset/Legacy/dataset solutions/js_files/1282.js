'use strict';
(function(stdin) {
  //declare function
  function publicBuilding(b, f, r) {
    var building = [];
    for (var i = 0; i < b; i++) {
      var floor = [];
      for (var j = 0; j < f; j++) {
        var room = [];
        for (var k = 0; k < r; k++) {
          room.push(0);
        }
        floor.push(room);
      }
      building.push(floor);
    }
    building.unshift(Array(r * 2).fill('#').join(''));
    return building;
  }

  function inRoomData(before, data) {
    var inLine = before.shift();
    data.map(function(v) {
      var val = before[v[0] - 1][v[1] - 1];
      val.splice(v[2] - 1, 1, v[3]);
    });
    return before.map(function(v) {
      return v.map(function(w) {
        return ' ' + w.join(' ');
      }).join('\n');
    }).join('\n' + inLine + '\n');
  }
  //declare variable
  var inputs = stdin.toString().trim().split('\n');
  var roomData = inputs.map(function(v) {
    return v.split(' ').map(Number);
  });
  roomData.shift();
  //main

  //display
  console.log(inRoomData(publicBuilding(4, 3, 10), roomData));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));