(function underscore(undefined) {
	'use strict';
	var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	var push = ArrayProto.push,
	slice = ArrayProto.slice,
	concat = ArrayProto.concat,
	toString = ObjProto.toString,
	hasOwnProperty = ObjProto.hasOwnProperty;

	var nativeForEach = ArrayProto.forEach,
	nativeMap = ArrayProto.map,
	nativeReduce = ArrayProto.reduce,
	nativeReduceRight = ArrayProto.reduceRight,
	nativeFilter = ArrayProto.filter,
	nativeEvery = ArrayProto.every,
	nativeSome = ArrayProto.some,
	nativeIndexOf = ArrayProto.indexOf,
	nativeLastIndexOf = ArrayProto.lastIndexOf,
	nativeIsArray = Array.isArray,
	nativeKeys = Object.keys,
	nativeBind = FuncProto.bind;

	this._ = {};
	var each = _.each = _.forEach = function(obj, iterator, context) {
		if (obj == null) return;
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, l = obj.length; i < l; i++) {
				if (iterator.call(context, obj[i], i, obj) === breaker) return;
			}
		} else {
			for (var key in obj) {
				if (_.has(obj, key)) {
					if (iterator.call(context, obj[key], key, obj) === breaker) return;
				}
			}
		}
	};

	_.extend = function(obj) {
		each(slice.call(arguments, 1), function(source) {
			if (source) {
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			}
		});
		return obj;
	};
}).call(global);

(function utils(undefined){
	'use strict';
	this.print_float = function print_float(val, base, pad, prec) {
		var p10=Math.pow(10,prec);
		var ival=""+Math.round(val*p10);
		if ( ival === '0' )
			return '0.000';
		var ilen=ival.length-prec;
		if(ilen===0)
			return "0."+ival.substr(ilen,prec);
		return ival.substr(0,ilen)+"."+ival.substr(ilen,prec);
	};
}).call(global);

(function math(namespace, undefined) {
	var Math = {
		gcd: function gcd( a, b ) {
			return !b ? a : gcd( b, a % b );
		},
		lcm: function lcm( a, b ) {
			return a / gcd( a, b ) * b;
		},
		sq: function sq(x) {
			return x * x;
		}
	};
	_.extend( this.Math, Math );
}).call(global, 'Math');

(function(undefined){
	'use strict';

	var INPUT_TYPE = 'float';

	var Solver = {
		fire: function() {
			setTimeout( Solver.solve, 0, this );
		},
		solve: function solve(context) {
			var n = input_number();
			function func() {
				var names = ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'];
				names.forEach(function(name){
					this[name] = input_float();
				}, context);

				var a = x1 - x2;
				var b = y1 - y2;
				var c = -1 * ( Math.sq(x1) - Math.sq( x2 ) + Math.sq( y1 ) - Math.sq( y2 ) );
				var d = x1 - x3;
				var e = y1 - y3;
				var f = -1 * ( Math.sq(x1) - Math.sq( x3 ) + Math.sq( y1 ) - Math.sq( y3 ) );

				var l = ( c * e - b * f ) / ( e * a - b * d );
				var m = ( d * c - a * f ) / ( d * b - e * a );
				
				var x = -1 * ( Math.sq(x1) + Math.sq(y1) + l * x1 + m * y1 );
				output( print_float(l/-2.0,10,3,3),print_float(m/-2.0,10,3,3),print_float(Math.sqrt(Math.sq(l)+Math.sq(m)+4*n)/2.0,10,3,3) );
			}
			while ( n -- )
				func();
			if ( ! has_next() )
				setTimeout( Solver.solve, 0, context );
		}
	};

	(function init() {
		_.extend( this, {
			output: function() {
				console.log.apply( console, arguments );
			},
			stdin: process.openStdin(),
			input_list: [],
			input_number: function() {
				return parseInt( input_list.splice(0,1)[0] );
			},
			input_float: function() {
				return parseFloat( input_list.splice(0,1)[0] );
			},
			input_text: function() {
				return input_list.splice(0,1)[0];
			},
			has_next: function() {
				return ! input_list.length;
			}
		} );

		var INPUT_REGEXP_LIST = {};
		INPUT_REGEXP_LIST['string'] = /\w*/g;
		INPUT_REGEXP_LIST['number'] = /[-]?\d+/g;
		INPUT_REGEXP_LIST['float'] = /[-]?\d+(\.\d+)?/g;
		var INPUT_REGEXP = INPUT_REGEXP_LIST[INPUT_TYPE];

		var context = this;
		stdin.setEncoding('utf8');
		stdin.on('data', function(chunk){
			var result = chunk.match(INPUT_REGEXP);
			input_list = input_list.concat(result.filter(function(line){
				return line.length;
			}));
		});
		stdin.on('end', function(){
			Solver.fire.call(context);
		});
	}).call( this );

}).call(global);