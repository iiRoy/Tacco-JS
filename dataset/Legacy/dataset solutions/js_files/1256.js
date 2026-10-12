(function() {
    'use strict';

    var fs = require('fs');
    var contents = fs.readFileSync('/dev/stdin', 'utf-8');

    var minMaxSum = function(contents) {
        var lines = contents.trim().split("\n");
        var n = parseInt(lines[0].trim());

        var chars = lines[1].trim().split(" ");
        var min = 1000000;
        var max = -1000000;
        var sum = 0;
        for (var i = 0; i < chars.length; i++) {
            var a = parseInt(chars[i]);
            if (a > max) {
                max = a;
            }
            if (a < min) {
                min = a;
            }
            sum += a;
        }
        console.log(min + " " + max + " " + sum);
    }

    minMaxSum(contents);
})();