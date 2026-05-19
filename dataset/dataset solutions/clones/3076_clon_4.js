'use strict';
var obj = init();
Main();

function nextInt() { return myconv(next(), 1); }
function nextStrArray() { return myconv(next(), 2); }
function nextIntArray() { return myconv(next(), 4); }
function nextCharArray() { return myconv(next(), 6); }
function next() { return obj.next(); }
function hasNext() { return obj.hasNext(); }

function myin() { return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"); }

function init() {
  const sourceDataLines = myin();
  let currentLinePointer = 0;

  const baseInputObject = {
    list: sourceDataLines,
    max: sourceDataLines.length,
  };

  const inputProxyHandler = {
    get(target, propertyKey, receiver) {
      if (propertyKey === 'index') {
        return currentLinePointer;
      }
      if (propertyKey === 'hasNext') {
        return () => currentLinePointer < target.max;
      }
      if (propertyKey === 'next') {
        return () => {
          if (!receiver.hasNext()) {
            return "";
          }
          const lineContent = target.list[currentLinePointer];
          currentLinePointer++;
          return lineContent;
        };
      }
      return Reflect.get(target, propertyKey, receiver);
    },
    set(target, propertyKey, value, receiver) {
      if (propertyKey === 'index') {
        currentLinePointer = value;
        return true;
      }
      return Reflect.set(target, propertyKey, value, receiver);
    }
  };

  return new Proxy(baseInputObject, inputProxyHandler);
}

function myout(outputValue) { console.log(outputValue); }
function myerr(errorValue) { console.error(errorValue); }

function myconv(inputValue, conversionCode) {
  const operationDispatch = new Map([
    [1, (val) => Number.parseInt(val)],
    [2, (val) => val.split(" ")],
    [4, (val) => val.split(" ").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
    [8, (val) => val.join(" ")],
    [9, (val) => val.join("\n")],
    [0, (val) => val.join("")]
  ]);

  try {
    const converterFunction = operationDispatch.get(conversionCode);
    if (converterFunction) {
      return converterFunction(inputValue);
    }
    return inputValue;
  } catch (conversionError) {
    return inputValue;
  }
}

function Main() {
  const firstLineData = nextIntArray();
  const X = firstLineData[0];
  const Y = firstLineData[1];
  const Z = firstLineData[2];
  const K = firstLineData[3];

  const xValues = nextIntArray();
  const yValues = nextIntArray();
  const zValues = nextIntArray();

  const xyCombinations = xValues.flatMap(xComponent =>
    yValues.map(yComponent => xComponent + yComponent)
  );

  xyCombinations.sort((valA, valB) => valB - valA);

  const xyzCombinations = xyCombinations.flatMap(sumXY =>
    zValues.map(zComponent => sumXY + zComponent)
  );

  xyzCombinations.sort((valA, valB) => valB - valA);

  myout(myconv(xyzCombinations, 9));
}
