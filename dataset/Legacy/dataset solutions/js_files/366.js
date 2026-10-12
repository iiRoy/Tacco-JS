'use strict';
var AOJ = {};
(function(ns) {
    var isBrowser = function() {
        return typeof window !== 'undefined';
    }
    ns.isBrowser = isBrowser;
    
    var isNodejs = function() {
        return ! isBrowser();
    }
    ns.isNodejs = isNodejs;
    
    if (isBrowser()) {
        var getHtmlEncoded = function(string0) {
            return String(string0)
                    .replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
        }
        ns.getHtmlEncoded = getHtmlEncoded;
        
        var outputCode = function(function0) {
            document.getElementById('code').innerHTML = '<pre><code>' + getHtmlEncoded(function0) + '</code></pre>';
        }
        ns.outputCode = outputCode;
    }
    
    var getInput = function() {
        var inputLines = [];
        if (isBrowser()) {
            var html = document.getElementById('input').innerHTML;
            inputLines = html.split('<br>');
            for (var i = 0; i < inputLines.length; i++) {
                inputLines[i] = inputLines[i].trim();
            }
        }
        if (isNodejs()) {
            inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
        }
        return inputLines;
    }
    
    var setLineReader = function(callback) {
        if (isBrowser()) {
            var lines = getInput();
            for (var i = 0; i < lines.length; i++) {
                callback(lines[i]);
            }
        }
        if (isNodejs()) {
            var readStream = require('fs').ReadStream('/dev/stdin');
            var readlineInterface = require('readline').createInterface({'input': readStream, 'output': {}});
            readlineInterface.on('line', function(line) {
                callback(line);
            });
        }
    }
    ns.setLineReader = setLineReader;
    
    var doOutput = function(outputLines) {
        if (isBrowser()) {
            document.getElementById('output').innerHTML = outputLines.map(getHtmlEncoded).join('<br>\n');
        }
        if (isNodejs()) {
            for (var i = 0; i < outputLines.length; i++) {
                console.log(outputLines[i]);
            }
        }
    }
    ns.doOutput = doOutput;
    
    var outputLines = []
    var doOutputLine = function(outputLine) {
        if (isBrowser()) {
            outputLines.push(outputLine);
            document.getElementById('output').innerHTML = outputLines.map(getHtmlEncoded).join('<br>\n');
        }
        if (isNodejs()) {
            console.log(outputLine);
        }
    }
    ns.doOutputLine = doOutputLine;
    
    var doMain = function(main) {
        if (isBrowser()) {
            window.onload = function() {
                outputCode(main);
                main();
            }
        }
        if (isNodejs()) {
            main();
        }
    }
    ns.doMain = doMain;
})(AOJ);

var main = function() {
    var fieldX = 0;
    var fieldY = 0;
    var fieldWidth = 10;
    var fieldHeight = 10;
    var phyonkichiMoves = [
        [-1, -2], [0, -2], [1, -2],
        [-2, -1], [2, -1],
        [-2, 0], [2, 0],
        [-2, 1], [2, 1],
        [-1, 2], [0, 2], [1, 2]
    ];
    var splinklerMoves = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [0, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];
    var dataTypes = {};
    dataTypes.phyonkichiLocation = 0;
    dataTypes.numSprinklers = 1;
    dataTypes.splinklerLocations = 2;
    var input;
    var lineCount = 0;
    var isLocationInField = function(x, y) {
        if (fieldX <= x && x < fieldWidth) {
            if (fieldY <= y && y < fieldHeight) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    var getMovedLocations = function(location, moves) {
        var movedLocations = [];
        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            var x = location[0] + move[0];
            var y = location[1] + move[1];
            if (isLocationInField(x, y)) {
                movedLocations.push([x, y]);
            }
        }
        return movedLocations;
    }
    var getNextPhyonkichiLocations = function(phyonkichiLocation) {
        return getMovedLocations(phyonkichiLocation, phyonkichiMoves);
    }
    var getWetLocations = function(splinklerLocation) {
        return getMovedLocations(splinklerLocation, splinklerMoves);
    }
    var cache;
    var stack;
    var callCount;
    var canSurvive = function(phyonkichiLocation, splinklerLocations) {
        callCount++;
        var cacheKey = splinklerLocations.length + ', ' + phyonkichiLocation[0] + ', ' + phyonkichiLocation[1];
        if (cacheKey in cache) {
            return cache[cacheKey];
        }
        stack.push(phyonkichiLocation);
        if (splinklerLocations.length <= 0) {
//            console.log('Stack: ' + JSON.stringify(stack));
            return true;
        }
        var splinklerLocation = splinklerLocations[0];
        var nextPhyonkichiLocations = getNextPhyonkichiLocations(phyonkichiLocation);
        var wetLocations = getWetLocations(splinklerLocation);
        for (var i = 0; i < nextPhyonkichiLocations.length; i++) {
            var nextPhyonkichiLocation = nextPhyonkichiLocations[i];
            for (var j = 0; j < wetLocations.length; j++) {
                var wetLocation = wetLocations[j];
                if (nextPhyonkichiLocation[0] === wetLocation[0] &&
                    nextPhyonkichiLocation[1] === wetLocation[1]) {
                    var nextSplinklerLocations = splinklerLocations.slice(1);
                    var can = canSurvive(nextPhyonkichiLocation, nextSplinklerLocations);
                    if (can) {
                        return true;
                    }
                }
            }
        }
        stack.splice(stack.length - 1, 1);
        cache[cacheKey] = false;
        return false;
    }
    var handleLine = function(line) {
        var args = line.split(' ');
        for (var i = 0; i < args.length; i++) {
            args[i] = parseFloat(args[i]);
        }
        var dataType = lineCount % Object.keys(dataTypes).length;
        if (dataType === dataTypes.phyonkichiLocation) {
            input = {};
            input.phyonkichi = {};
            input.splinklerLocations = [];
            input.phyonkichi.x = args[0];
            input.phyonkichi.y = args[1];
            if (input.phyonkichi.x === 0 && input.phyonkichi.y === 0) {
//                console.log('end');
            }
        } else if (dataType === dataTypes.numSprinklers) {
            input.numSprinklers = args[0];
        } else if (dataType === dataTypes.splinklerLocations) {
            for (var i = 0; i < args.length; i += 2) {
                input.splinklerLocations.push([args[i], args[i + 1]]);
            }
//            console.log(JSON.stringify(input));
            callCount = 0;
            cache = {};
            stack = [];
            if (canSurvive([input.phyonkichi.x, input.phyonkichi.y], input.splinklerLocations)) {
                AOJ.doOutputLine('OK');
            } else {
                AOJ.doOutputLine('NA');
            }
//            console.log('callCount: ' + callCount);
        } else {
            
        }
        lineCount++;
    }
    AOJ.setLineReader(handleLine);
}

AOJ.doMain(main);