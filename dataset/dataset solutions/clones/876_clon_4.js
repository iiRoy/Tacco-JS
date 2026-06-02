var fs = require('fs'),
    totalBytes = fs.fstatSync(process.stdin.fd).size,
    rawBuffer = new Buffer(totalBytes),
    readBytes = fs.readSync(process.stdin.fd, rawBuffer, 0, totalBytes, 0),
    rows = rawBuffer.toString('utf8', 0, readBytes).split('\n');

runAll();

function takeLine() {
  return rows.shift();
}

function buildComponents(n, active, openedNow, hadSingleBlock, oldActiveCount) {
  var comp = [], i, count = 0;

  for (i = 0; i < n; i++) {
    comp[i] = -1;
  }

  if (hadSingleBlock && oldActiveCount > 0) {
    for (i = 0; i < n; i++) {
      if (active[i] && !openedNow[i]) {
        comp[i] = 0;
      }
    }
    count = 1;
    for (i = 0; i < n; i++) {
      if (openedNow[i]) {
        comp[i] = count++;
      }
    }
  } else {
    for (i = 0; i < n; i++) {
      if (active[i]) {
        comp[i] = count++;
      }
    }
  }

  return { label: comp, size: count };
}

function minimumJoinCost(componentInfo, edges) {
  var labels = componentInfo.label,
      amount = componentInfo.size,
      used = [],
      best = [],
      i, step, chosen, e, a, b, w,
      total = 0;

  if (amount <= 1) {
    return 0;
  }

  for (i = 0; i < amount; i++) {
    used[i] = false;
    best[i] = Infinity;
  }
  best[0] = 0;

  for (step = 0; step < amount; step++) {
    chosen = -1;
    for (i = 0; i < amount; i++) {
      if (!used[i] && (chosen < 0 || best[i] < best[chosen])) {
        chosen = i;
      }
    }

    if (chosen < 0 || best[chosen] === Infinity) {
      return null;
    }

    used[chosen] = true;
    total += best[chosen];

    for (i = 0; i < edges.length; i++) {
      e = edges[i];
      a = labels[e[0]];
      b = labels[e[1]];
      w = e[2];
      if (a >= 0 && b >= 0 && a !== b) {
        if (a === chosen && !used[b] && w < best[b]) {
          best[b] = w;
        } else if (b === chosen && !used[a] && w < best[a]) {
          best[a] = w;
        }
      }
    }
  }

  return total;
}

function runAll() {
  var temp, n, m,
      i, currentDay,
      people, edges,
      active, opened,
      cursor,
      previousActive,
      activeCount,
      stateIsOneBlock,
      added,
      componentInfo,
      answer;

  while (true) {
    temp = takeLine().split(' ');
    n = +temp[0];
    m = +temp[1];

    if (n === 0 && m === 0) {
      break;
    }

    people = [];
    active = [];
    for (i = 0; i < n; i++) {
      people[i] = {
        node: i,
        days: +takeLine()
      };
      active[i] = false;
    }

    edges = [];
    for (i = 0; i < m; i++) {
      temp = takeLine().split(' ');
      edges[i] = [temp[0] - 1, temp[1] - 1, temp[2] - 0];
    }

    people.sort(function (a, b) {
      return a.days - b.days;
    });

    cursor = n - 1;
    answer = 0;
    activeCount = 0;
    stateIsOneBlock = false;

    while (cursor >= 0) {
      opened = [];
      for (i = 0; i < n; i++) {
        opened[i] = false;
      }

      previousActive = activeCount;
      currentDay = people[cursor].days;
      while (cursor >= 0 && people[cursor].days === currentDay) {
        if (!active[people[cursor].node]) {
          activeCount++;
        }
        active[people[cursor].node] = true;
        opened[people[cursor].node] = true;
        cursor--;
      }

      componentInfo = buildComponents(n, active, opened, stateIsOneBlock, previousActive);
      added = minimumJoinCost(componentInfo, edges);

      if (added === null) {
        answer = 0;
        stateIsOneBlock = false;
      } else {
        answer += added;
        stateIsOneBlock = true;
      }
    }

    console.log(answer);
  }
}
