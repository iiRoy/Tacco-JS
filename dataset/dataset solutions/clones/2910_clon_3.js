/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Integrantes: Tiago Fernandes, Sofia Almeida, Afonso Santos           │
 * └──────────────────────────────────────────────────────────────────────┘
 */

"use strict";

function splitNum(line) {
  return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
    return parseInt(n);
  });
}

function readInputLines(rawInput) {
  return rawInput.split("\n");
}

function parseHeader(line) {
  var values = splitNum(line);

  return {
    N: values[0],
    M: values[1]
  };
}

function parseLightLine(line, lightIndex) {
  var values = splitNum(line);

  var k = values[0];
  var s = values.slice(1);

  return {
    k: k,
    s: s,
    li: lightIndex
  };
}

function parseLights(lines, numberOfLights) {
  var lightLines = lines.slice(1, numberOfLights + 1);

  return lightLines.map(function (line, index) {
    return parseLightLine(line, index);
  });
}

function parseParityLine(lines, numberOfLights) {
  return splitNum(lines[numberOfLights + 1]);
}

function isSwitchOn(combination, switchId) {
  return combination & (1 << switchId - 1);
}

function countOnSwitchesForLight(combination, connectedSwitches) {
  var switchCount = 0;

  for (var i = 0; i < connectedSwitches.length; i++) {
    var switchId = connectedSwitches[i];

    if (isSwitchOn(combination, switchId)) {
      switchCount++;
    }
  }

  return switchCount;
}

function satisfiesLight(combination, lightConfig, parityValues) {
  var connectedSwitches = lightConfig.s;
  var lightIndex = lightConfig.li;

  var activeSwitchCount = countOnSwitchesForLight(
    combination,
    connectedSwitches
  );

  return activeSwitchCount % 2 !== parityValues[lightIndex] ? false : true;
}

function satisfiesAllLights(combination, lights, parityValues) {
  for (var lightIndex = 0; lightIndex < lights.length; lightIndex++) {
    if (!satisfiesLight(combination, lights[lightIndex], parityValues)) {
      return false;
    }
  }

  return true;
}

function countValidSwitchPatterns(numberOfSwitches, lights, parityValues) {
  var count = 0;
  var totalPatterns = Math.pow(2, numberOfSwitches);

  for (var pattern = 0; pattern < totalPatterns; pattern++) {
    if (satisfiesAllLights(pattern, lights, parityValues)) {
      count++;
    }
  }

  return count;
}

function main(rawInput) {
  var lines = readInputLines(rawInput);

  var header = parseHeader(lines);
  var N = header.N;
  var M = header.M;

  var lights = parseLights(lines, M);
  var ps = parseParityLine(lines, M);

  var answer = countValidSwitchPatterns(N, lights, ps);

  console.log(answer);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));