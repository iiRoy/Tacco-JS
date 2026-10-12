var stream = '';
var cursor = 0;

function nextNumber() {
    return +stream[cursor++];
}

function nextToken() {
    return stream[cursor++];
}

function profileOf(token) {
    var balance = 0;
    var lowest = 0;

    for (var i = 0; i < token.length; ++i) {
        balance += token.charAt(i) === '(' ? 1 : -1;
        if (balance < lowest) {
            lowest = balance;
        }
    }

    var missingLeft = -lowest;
    return [missingLeft, balance + missingLeft];
}

function MinIndexTree(values) {
    this.size = 1;
    while (this.size < values.length) {
        this.size <<= 1;
    }

    this.data = new Array(this.size * 2);
    for (var i = 0; i < this.data.length; ++i) {
        this.data[i] = Infinity;
    }
    for (var j = 0; j < values.length; ++j) {
        this.data[this.size + j] = values[j][0];
    }
    for (var k = this.size - 1; k > 0; --k) {
        this.data[k] = Math.min(this.data[k << 1], this.data[(k << 1) | 1]);
    }
}

MinIndexTree.prototype.firstAtMost = function(limit) {
    if (this.data[1] > limit) {
        return -1;
    }

    var node = 1;
    while (node < this.size) {
        var left = node << 1;
        if (this.data[left] <= limit) {
            node = left;
        } else {
            node = left | 1;
        }
    }
    return node - this.size;
};

MinIndexTree.prototype.erase = function(index) {
    var node = this.size + index;
    this.data[node] = Infinity;
    node >>= 1;
    while (node > 0) {
        this.data[node] = Math.min(this.data[node << 1], this.data[(node << 1) | 1]);
        node >>= 1;
    }
};

function solve() {
    var n = nextNumber();
    var words = [];

    for (var i = 0; i < n; ++i) {
        words[i] = nextToken();
    }

    var blocks = [];
    for (var j = 0; j < n; ++j) {
        blocks[j] = profileOf(words[j]);
    }

    var tree = new MinIndexTree(blocks);
    var balance = 0;
    var possible = true;

    for (var step = 0; step < n; ++step) {
        var chosen = tree.firstAtMost(balance);
        if (chosen < 0) {
            possible = false;
            break;
        }

        balance += blocks[chosen][1] - blocks[chosen][0];
        tree.erase(chosen);
    }

    console.log(possible && balance === 0 ? 'Yes' : 'No');
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    stream += chunk;
});

process.stdin.on('end', function() {
    stream = stream.trim().split(/\s+/);
    solve();
});
