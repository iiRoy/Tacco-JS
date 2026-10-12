var source = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(part) {
    source += part;
});
process.stdin.on('end', function() {
    solve(source);
});

function solve(source) {
    var rows = source.trim().split('\n');
    var cursor = 0;

    while (true) {
        var size = toNumbers(rows[cursor++]);
        if (finished(size)) {
            break;
        }

        var field = makeField(size[0], size[1]);
        var start = toNumbers(rows[cursor++]);
        var goal = toNumbers(rows[cursor++]);
        var blocks = parseInt(rows[cursor++]);

        for (var n = 0; n < blocks; n += 1) {
            paint(field, toNumbers(rows[cursor++]));
        }

        var ok = sameRegion(field, start[0] - 1, start[1] - 1, goal[0] - 1, goal[1] - 1);
        console.log(ok ? 'OK' : 'NO');
    }
}

function makeField(width, height) {
    var field = [];
    for (var x = 0; x < width; x += 1) {
        var line = [];
        for (var y = 0; y < height; y += 1) {
            line.push(0);
        }
        field.push(line);
    }
    return field;
}

function paint(field, spec) {
    var horizontal = !spec[1];
    var spanX = horizontal ? 4 : 2;
    var spanY = horizontal ? 2 : 4;
    var left = spec[2] - 1;
    var top = spec[3] - 1;

    for (var x = left; x < left + spanX; x += 1) {
        for (var y = top; y < top + spanY; y += 1) {
            field[x][y] = spec[0];
        }
    }
}

function sameRegion(field, sx, sy, gx, gy) {
    if (sx === gx && sy === gy) {
        return true;
    }

    var initial = field[sx][sy];
    var target = field[gx][gy];
    if (initial !== target) {
        return false;
    }

    var cells = collectCells(field);
    var parent = Object.create(null);
    var rank = Object.create(null);

    for (var i = 0; i < cells.length; i += 1) {
        var key = cells[i][0] + ':' + cells[i][1];
        parent[key] = key;
        rank[key] = 0;
    }

    var around = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];

    for (var c = 0; c < cells.length; c += 1) {
        var x = cells[c][0];
        var y = cells[c][1];
        var value = field[x][y];
        var here = x + ':' + y;

        for (var d = 0; d < around.length; d += 1) {
            var nx = x + around[d][0];
            var ny = y + around[d][1];
            var there = nx + ':' + ny;
            if (parent[there] !== undefined && field[nx] && field[nx][ny] === value) {
                join(parent, rank, here, there);
            }
        }
    }

    var a = sx + ':' + sy;
    var b = gx + ':' + gy;
    return parent[a] !== undefined && parent[b] !== undefined && root(parent, a) === root(parent, b);
}

function collectCells(field) {
    var list = [];
    for (var x = 0; x < field.length; x += 1) {
        var seen = Object.create(null);
        for (var y = 0; y < field[x].length; y += 1) {
            seen[y] = true;
            list.push([x, y]);
        }
        Object.keys(field[x]).forEach(function(name) {
            if (/^-?\d+$/.test(name) && !seen[name]) {
                list.push([x, Number(name)]);
            }
        });
    }
    return list;
}

function root(parent, node) {
    var trail = [];
    while (parent[node] !== node) {
        trail.push(node);
        node = parent[node];
    }
    for (var i = 0; i < trail.length; i += 1) {
        parent[trail[i]] = node;
    }
    return node;
}

function join(parent, rank, left, right) {
    var a = root(parent, left);
    var b = root(parent, right);
    if (a === b) {
        return;
    }
    if (rank[a] < rank[b]) {
        parent[a] = b;
    } else if (rank[a] > rank[b]) {
        parent[b] = a;
    } else {
        parent[b] = a;
        rank[a] += 1;
    }
}

function toNumbers(line) {
    return line.split(' ').map(Number);
}

function finished(pair) {
    return pair[0] === 0 && pair[1] === 0;
}
