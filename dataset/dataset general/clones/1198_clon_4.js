var _p1 = String.fromCharCode(46);
var _p2 = String.fromCharCode(47, 108, 105, 98);
var _p3 = String.fromCharCode(47, 114, 101, 100, 105, 115, 50, 106, 115, 111, 110);
var _p4 = String.fromCharCode(46, 106, 115);

var filePath = _p1 + _p2 + _p3 + _p4;

var moduleLoader = new Function('inputPath', 'return require(inputPath);');

var acquiredModule = moduleLoader(filePath);

Object.assign(module, { exports: acquiredModule });