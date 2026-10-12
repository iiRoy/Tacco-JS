var inputSource = (function() {
    function createParser(sourceText) {
        return new InputHandler(sourceText);
    }

    function InputHandler(textData) {
        this.lineSegments = textData.trim().split("\n");
        this.currentLineIndex = 0;
        this.activeLineTokens = [];
    }

    InputHandler.prototype.extractNext = function(asString) {
        if (this.activeLineTokens.length === 0) {
            if (this.currentLineIndex >= this.lineSegments.length) {
                return undefined;
            }
            this.activeLineTokens = this.lineSegments[this.currentLineIndex].split(" ");
            this.currentLineIndex++;
        }
        var token = this.activeLineTokens.pop();
        return asString ? token : Number(token);
    };

    InputHandler.prototype.fetchLine = function(asString) {
        if (this.currentLineIndex >= this.lineSegments.length) {
            return undefined;
        }
        var line = this.lineSegments[this.currentLineIndex++];
        this.activeLineTokens = [];
        var tokens = line.split(" ");
        return asString ? tokens : tokens.map(Number);
    };

    InputHandler.prototype.fetchBlock = function(count, asString) {
        var resultBlock = [];
        for (var i = 0; i < count; i++) {
            resultBlock.push(this.fetchLine(asString));
        }
        return resultBlock;
    };

    InputHandler.prototype.fetchRawLines = function(count, asString) {
        var start = this.currentLineIndex;
        var end = this.currentLineIndex + count;
        var lines = this.lineSegments.slice(start, end);
        this.currentLineIndex = end;
        this.activeLineTokens = [];
        return asString ? lines : lines.map(Number);
    };

    return createParser;
})();

var dataParser = inputSource(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(evaluateTravelPlan());

function evaluateTravelPlan() {
  var totalPoints = dataParser.extractNext();
  var journeyPoints = dataParser.fetchBlock(totalPoints);

  var currentTravelState = {
    currentTime: 0,
    currentX: 0,
    currentY: 0
  };

  var possiblePath = journeyPoints.every(function(destinationPoint) {
    var targetTime = destinationPoint[0];
    var targetX = destinationPoint[1];
    var targetY = destinationPoint[2];

    var timeDifference = targetTime - currentTravelState.currentTime;
    var distanceX = Math.abs(currentTravelState.currentX - targetX);
    var distanceY = Math.abs(currentTravelState.currentY - targetY);
    var totalDistance = distanceX + distanceY;

    if (totalDistance > timeDifference || (totalDistance % 2 !== timeDifference % 2)) {
      return false;
    }

    currentTravelState.currentTime = targetTime;
    currentTravelState.currentX = targetX;
    currentTravelState.currentY = targetY;
    return true;
  });

  return possiblePath ? "Yes" : "No";
}
