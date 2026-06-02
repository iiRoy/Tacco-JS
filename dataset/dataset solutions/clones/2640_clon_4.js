'use strict'

function run(source) {
  const rows = source.trim().split('\n')
  const header = rows.shift().split(' ').map(piece => Number(piece))
  const size = header[0]

  const parentOf = new Array(size + 1).fill(0)
  const local = new Array(size + 1).fill(0)

  if (size === 0) parentOf[1].length

  for (let pos = 0; pos < rows.length; pos++) {
    const data = rows[pos].split(' ').map(piece => Number(piece))
    if (pos < size - 1) {
      parentOf[data[1]] = data[0]
    } else {
      local[data[0]] += data[1]
    }
  }

  const known = new Array(size + 1)
  const anchored = new Array(size + 1).fill(false)
  known[1] = local[1]
  anchored[1] = true

  const valueAt = vertex => {
    if (known[vertex] !== undefined) return known[vertex]

    const chain = []
    const seen = {}
    let cursor = vertex

    while (cursor && known[cursor] === undefined && !seen[cursor]) {
      seen[cursor] = true
      chain.push(cursor)
      cursor = parentOf[cursor]
    }

    let carriesRootValue = anchored[cursor] === true
    let running = carriesRootValue ? known[cursor] : 0

    for (let i = chain.length - 1; i >= 0; i--) {
      const node = chain[i]
      if (carriesRootValue) {
        running += local[node]
        known[node] = running
        anchored[node] = true
      } else {
        known[node] = local[node]
        anchored[node] = false
      }
    }

    return known[vertex]
  }

  const output = []
  for (let node = 1; node <= size; node++) {
    output.push(valueAt(node))
  }

  console.log(output.join(' '))
}

run(require('fs').readFileSync('/dev/stdin', 'utf8'));
