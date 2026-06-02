var input = require("fs").readFileSync("/dev/stdin", "utf8");
var data = input.split(/ |\n/);
var at = 0;
function readNumber() {
    return +data[at++];
}

function makeNetwork(limit) {
    var links = new Map();
    var regular = new Set();

    for (var i = 0; i < limit; i++) {
        var k = "v:" + i;
        regular.add(k);
        links.set(k, new Set());
    }

    function keyOf(value) {
        var k = "v:" + value;
        return regular.has(k) ? k : "outside";
    }

    function ensure(k) {
        if (!links.has(k)) {
            links.set(k, new Set());
        }
        return links.get(k);
    }

    function join(a, b) {
        var ka = keyOf(a);
        var kb = keyOf(b);
        if (ka === kb) {
            return;
        }
        ensure(ka).add(kb);
        ensure(kb).add(ka);
    }

    function connected(a, b) {
        var start = keyOf(a);
        var goal = keyOf(b);
        if (start === goal) {
            return true;
        }
        if (!links.has(start) || !links.has(goal)) {
            return false;
        }

        var seen = new Set([start]);
        var queue = [start];
        for (var head = 0; head < queue.length; head++) {
            var cur = queue[head];
            var adj = links.get(cur);
            if (!adj) {
                continue;
            }
            for (var nxt of adj) {
                if (nxt === goal) {
                    return true;
                }
                if (!seen.has(nxt)) {
                    seen.add(nxt);
                    queue.push(nxt);
                }
            }
        }
        return false;
    }

    return { join: join, connected: connected };
}

function main() {
    var n = readNumber();
    var q = readNumber();
    var network = makeNetwork(n);

    while (q--) {
        var kind = readNumber();
        var a = readNumber();
        var b = readNumber();

        if (kind === 0) {
            network.join(a, b);
        }
        else {
            console.log(network.connected(a, b) ? 1 : 0);
        }
    }
}

main();
