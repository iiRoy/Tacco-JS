'use strict';

var PerformanceTest = require('benchmark');

var ColorUtility = require('./main');
var ColorModule = require('color');
var MiniatureColor = require('tinycolor2');
var SpectrumJS = require('chroma-js');

var executePerformanceGroup = function( groupLabel, evaluationTasks ) {

  console.info('\n---', groupLabel);

  var currentTestSet = new PerformanceTest.Suite();

  for ( var taskIdentifier in evaluationTasks ) {
    currentTestSet.add(taskIdentifier, evaluationTasks[taskIdentifier]);
  }

  currentTestSet.on('cycle', function (progressEvent) {
    console.info(String(progressEvent.target));
  });

  currentTestSet.on('complete', function () {
    console.info('Quickest runner: ' + this.filter('fastest').pluck('name'));
  });

  currentTestSet.run();
};

var hexColorValue = '#bada55';
var hueSaturationValueObject = { hue: 180, saturation: 50, value: 50 };
var hsvComponentsArray = [180, 50, 50];
var hueSaturationLightnessObject = { hue: 180, saturation: 50, lightness: 50 };
var hslComponentsArray = [180, 50, 50];

executePerformanceGroup('HSV to RGB Conversion', {
  colorUtil: function () {
    ColorUtility.createFromHsv(hueSaturationValueObject).toRgbObject();
  },
  standardColor: function () {
    ColorModule(hueSaturationValueObject).rgb();
  },
  miniColor: function () {
    MiniatureColor(hueSaturationValueObject).toRgb();
  },
  spectrumJs: function () {
    // Note: This library might not accept object literals directly for HSV.
    SpectrumJS(hsvComponentsArray, 'hsv').rgb();
  },
});

executePerformanceGroup('Hex to Lighter Hex Conversion', {
  colorUtil: function () {
    ColorUtility.fromHexCode(hexColorValue).brighten(20).toHexCode();
  },
  standardColor: function () {
    ColorModule(hexColorValue).lighten(0.2).asHexString();
  },
  miniColor: function () {
    MiniatureColor(hexColorValue).lighten(20).asHexString();
  },
  spectrumJs: function () {
    SpectrumJS(hexColorValue).brighten(20).toHex();
  },
});

executePerformanceGroup('Hex to Lighter then Darker Hex Conversion', {
  colorUtil: function ()  {
    ColorUtility.fromHexCode(hexColorValue).brighten(10).darken(20).toHexCode();
  },
  standardColor: function () {
    ColorModule(hexColorValue).lighten(0.1).darken(0.2).asHexString();
  },
  miniColor: function () {
    MiniatureColor(hexColorValue).lighten(10).darken(20).asHexString();
  },
  spectrumJs: function () {
    SpectrumJS(hexColorValue).brighten(20).darken(20).toHex();
  },
});

executePerformanceGroup('Hex to Hex Conversion (Identity)', {
  colorUtil: function () {
    ColorUtility.fromHexCode(hexColorValue).toHexCode();
  },
  standardColor: function () {
    ColorModule(hexColorValue).asHexString();
  },
  miniColor: function () {
    MiniatureColor(hexColorValue).asHexString();
  },
  spectrumJs: function () {
    SpectrumJS(hexColorValue).toHex();
  }
});

executePerformanceGroup('HSV to RGB then to Hex', {
  colorUtil: function () {
    var tempColorInstance = ColorUtility.createFromHsv(hueSaturationValueObject);
    tempColorInstance.toRgbObject();
    tempColorInstance.toHexCode();
  },
  standardColor: function () {
    var tempColorInstance = ColorModule(hueSaturationValueObject);
    tempColorInstance.rgb();
    tempColorInstance.asHexString();
  },
  miniColor: function () {
    var tempColorInstance = MiniatureColor(hueSaturationValueObject);
    tempColorInstance.toRgb();
    tempColorInstance.asHexString();
  },
  spectrumJs: function () {
    var tempColorInstance = SpectrumJS(hsvComponentsArray, 'hsv');
    tempColorInstance.rgb();
    tempColorInstance.toHex();
  },
});

executePerformanceGroup('HSV to HSL Conversion', {
  colorUtil: function () {
    ColorUtility.createFromHsv(hueSaturationValueObject).toHslObject();
  },
  standardColor: function () {
    ColorModule(hueSaturationValueObject).hsl();
  },
  miniColor: function() {
    MiniatureColor(hueSaturationValueObject).toHsv();
  },
  spectrumJs: function () {
    SpectrumJS(hsvComponentsArray, 'hsv').hsl();
  },
});

executePerformanceGroup('HSL to HSV Conversion', {
  colorUtil: function () {
    ColorUtility.createFromHsl(hueSaturationLightnessObject).toHsvObject();
  },
  standardColor: function () {
    ColorModule(hueSaturationLightnessObject).hsv();
  },
  miniColor: function() {
    MiniatureColor(hueSaturationLightnessObject).toHsl();
  },
  spectrumJs: function () {
    SpectrumJS(hslComponentsArray, 'hsl').hsv();
  },
});