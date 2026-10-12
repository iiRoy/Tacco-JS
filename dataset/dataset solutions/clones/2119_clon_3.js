(function(modules) {
	var installedModules = {};

	function __webpack_require__(moduleId) {
		var cached = installedModules[moduleId];

		if(cached) {
			return cached.exports;
		}

		var module = installedModules[moduleId] = {
			i: moduleId,
			l: false,
			exports: {},
			loadedAt: 0
		};

		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

		module.l = true;
		module.loadedAt = 1;

		return module.exports;
	}

	__webpack_require__.m = modules;
	__webpack_require__.c = installedModules;

	__webpack_require__.d = function(exports, name, getter) {
		if(!__webpack_require__.o(exports, name)) {
			Object.defineProperty(exports, name, {
				enumerable: true,
				get: getter
			});
		}
	};

	__webpack_require__.r = function(exports) {
		if(typeof Symbol !== "undefined" && Symbol.toStringTag) {
			Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		}
		Object.defineProperty(exports, "__esModule", { value: true });
	};

	__webpack_require__.t = function(value, mode) {
		if(mode & 1) {
			value = __webpack_require__(value);
		}
		if(mode & 8) {
			return value;
		}
		if((mode & 4) && typeof value === "object" && value && value.__esModule) {
			return value;
		}

		var ns = Object.create(null);
		__webpack_require__.r(ns);
		Object.defineProperty(ns, "default", {
			enumerable: true,
			value: value
		});

		if(mode & 2 && typeof value != "string") {
			for(var key in value) {
				__webpack_require__.d(ns, key, function(key) {
					return value[key];
				}.bind(null, key));
			}
		}

		return ns;
	};

	__webpack_require__.n = function(module) {
		var getter;
		if(module && module.__esModule) {
			getter = function getDefault() {
				return module["default"];
			};
		} else {
			getter = function getModuleExports() {
				return module;
			};
		}
		__webpack_require__.d(getter, "a", getter);
		return getter;
	};

	__webpack_require__.o = function(object, property) {
		return Object.prototype.hasOwnProperty.call(object, property);
	};

	__webpack_require__.p = "";

	return __webpack_require__(__webpack_require__.s = "./src/ABC157/C_clone.js");
})
({
	"./src/ABC157/C_clone.js": (function(module, exports, __webpack_require__) {
		eval("function _slicedToArray(arr, i) { var r = _arrayWithHoles(arr); if (r) return r; r = _iterableToArrayLimit(arr, i); if (r) return r; return _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === \"[object Arguments]\")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr[_arr.length] = _s.value; if (i && _arr.length >= i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) { return arr; } }\n\nvar fs = __webpack_require__(/*! fs */ \"fs\");\n\nvar INCORRECT = -1;\n\nvar main = function main(input) {\n  var lines = input.trim().split('\\n');\n\n  var _first = lines.shift().split(' ').map(function (i) {\n    return Number(i);\n  }),\n      _first2 = _slicedToArray(_first, 2),\n      N = _first2[0],\n      M = _first2[1];\n\n  var p = new Array(N);\n\n  for (var i = 0; i < N; i++) {\n    p[i] = -1;\n  }\n\n  var invalid = false;\n\n  for (var _i2 = 0; _i2 < M; _i2++) {\n    var _pair = lines.shift().split(' ').map(function (i) {\n      return i - 0;\n    }),\n        _pair2 = _slicedToArray(_pair, 2),\n        s = _pair2[0],\n        c = _pair2[1];\n\n    var column = s - 1;\n\n    if (p[column] !== -1 && p[column] !== c) {\n      invalid = true;\n      break;\n    }\n\n    p[column] = c;\n  }\n\n  if (invalid) {\n    console.log(INCORRECT);\n    return;\n  }\n\n  if (p[0] === 0 || p[0] === -1) {\n    console.log(INCORRECT);\n    return;\n  }\n\n  for (var _i3 = 0; _i3 < N; _i3++) {\n    if (p[_i3] < 0) {\n      p[_i3] = 0;\n    }\n  }\n\n  var answer = p.join('');\n  console.log(answer);\n};\n\nmain(fs.readFileSync('/dev/stdin', 'utf8'));\n");
	}),

	"fs": (function(module, exports) {
		eval("module.exports = require(\"fs\");\n");
	})
});