'use strict';

var BMark = require('benchmark');
var PCLib = require('./index');
var SCLib = require('color');
var TCLib = require('tinycolor2');
var QCLib = require('chroma-js');

var initialHexValue = '#bada55';
var hsvObjectData = {h: 180, s:50, v:50};
var hsvNumericArray = [180, 50, 50];
var hslObjectData = {h: 180, s:50, l:50};
var hslNumericArray = [180, 50, 50];

var evaluatePerformanceSeries = (seriesCategory, operationCollection) => {
  console.log('\n#', seriesCategory);

  var performanceTestEngine = new BMark.Suite();

  operationCollection.forEach(procedure => {
    performanceTestEngine.add(procedure.label, procedure.task);
  });

  performanceTestEngine.on('cycle', (eventResult) => {
    console.log(String(eventResult.target));
  });

  performanceTestEngine.on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  });

  performanceTestEngine.run();
};

evaluatePerformanceSeries('Color_Conversion_From_HSV_to_RGB', [
  {
    label: 'PCLib_Implementation',
    task: () => PCLib.fromHsvObject(hsvObjectData).toRgbObject()
  },
  {
    label: 'SCLib_Implementation',
    task: () => SCLib(hsvObjectData).rgb()
  },
  {
    label: 'TCLib_Implementation',
    task: () => TCLib(hsvObjectData).toRgb()
  },
  {
    label: 'QCLib_Implementation',
    task: () => QCLib(hsvNumericArray, 'hsv').rgb()
  },
]);

evaluatePerformanceSeries('Hex_Manipulation_Lighten_and_Convert_to_Hex', [
  {
    label: 'PCLib_Implementation',
    task: () => PCLib.fromHex(initialHexValue).lighter(20).toHex()
  },
  {
    label: 'SCLib_Implementation',
    task: () => SCLib(initialHexValue).lighten(0.2).hexString()
  },
  {
    label: 'TCLib_Implementation',
    task: () => TCLib(initialHexValue).lighten(20).toHexString()
  },
  {
    label: 'QCLib_Implementation',
    task: () => QCLib(initialHexValue).brighten(20).hex()
  },
]);

evaluatePerformanceSeries('Hex_Manipulation_Lighten_Darken_and_Convert_to_Hex', [
  {
    label: 'PCLib_Implementation',
    task: () => PCLib.fromHex(initialHexValue).lighter(10).darker(20).toHex()
  },
  {
    label: 'SCLib_Implementation',
    task: () => SCLib(initialHexValue).lighten(0.1).darken(0.2).hexString()
  },
  {
    label: 'TCLib_Implementation',
    task: () => TCLib(initialHexValue).lighten(10).darken(20).toHexString()
  },
  {
    label: 'QCLib_Implementation',
    task: () => QCLib(initialHexValue).brighten(20).darken(20).hex()
  },
]);

evaluatePerformanceSeries('Hex_Conversion_Direct', [
  {
    label: 'PCLib_Implementation',
    task: () => PCLib.fromHex(initialHexValue).toHex()
  },
  {
    label: 'SCLib_Implementation',
    task: () => SCLib(initialHexValue).hexString()
  },
  {
    label: 'TCLib_Implementation',
    task: () => TCLib(initialHexValue).toHexString()
  },
  {
    label: 'QCLib_Implementation',
    task: () => QCLib(initialHexValue).hex()
  },
]);

evaluatePerformanceSeries('Complex_Conversion_HSV_to_RGB_then_to_Hex', [
  {
    label: 'PCLib_Implementation',
    task: () => {
      let temporaryColorInstance = PCLib.fromHsvObject(hsvObjectData);
      temporaryColorInstance.toRgbObject();
      temporaryColorInstance.toHex();
    }
  },
  {
    label: 'SCLib_Implementation',
    task: () => {
      let temporaryColorInstance = SCLib(hsvObjectData);
      temporaryColorInstance.rgb();
      temporaryColorInstance.hexString();
    }
  },
  {
    label: 'TCLib_Implementation',
    task: () => {
      let temporaryColorInstance = TCLib(hsvObjectData);
      temporaryColorInstance.toRgb();
      temporaryColorInstance.toHexString();
    }
  },
  {
    label: 'QCLib_Implementation',
    task: () => {
      let temporaryColorInstance = QCLib(hsvNumericArray, 'hsv');
      temporaryColorInstance.rgb();
      temporaryColorInstance.hex();
    }
  },
]);

evaluatePerformanceSeries('Conversion_From_HSV_to_HSL', [
  {
    label: 'PCLib_Implementation',
    task: () => PCLib.fromHsvObject(hsvObjectData).toHslObject()
  },
  {
    label: 'SCLib_Implementation',
    task: () => SCLib(hsvObjectData).hsl()
  },
  {
    label: 'TCLib_Implementation',
    task: () => TCLib(hsvObjectData).toHsv() // Note: TCLib's toHsv is called here, not toHsl, matching original benchmark
  },
  {
    label: 'QCLib_Implementation',
    task: () => QCLib(hsvNumericArray, 'hsv').hsl()
  },
]);

evaluatePerformanceSeries('Conversion_From_HSL_to_HSV', [
  {
    label: 'PCLib_Implementation',
    task: () => PCLib.fromHslObject(hslObjectData).toHsvObject()
  },
  {
    label: 'SCLib_Implementation',
    task: () => SCLib(hslObjectData).hsv()
  },
  {
    label: 'TCLib_Implementation',
    task: () => TCLib(hslObjectData).toHsl() // Note: TCLib's toHsl is called here, not toHsv, matching original benchmark
  },
  {
    label: 'QCLib_Implementation',
    task: () => QCLib(hslNumericArray, 'hsl').hsv()
  },
]);