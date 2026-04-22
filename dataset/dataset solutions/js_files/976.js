//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

const workers = 1;

//console.log(process.argv);

if (!process.env.hasOwnProperty('child')) main();
else child();


function main() {
  var line, tlen, partition, worker, cmd, args, env, i, finished;

  line = require('fs').readFileSync(config.input, 'ascii');

  tlen = line.indexOf(config.newline);
  partition = [0];
  for (i = 1; i < workers; i++)
    partition.push(Math.floor(tlen * i / workers));
  partition.push(tlen);

  cmd = process.argv[0];
  args = process.argv.slice(1);
  
  worker = [];
  res = [];
  for (i = 0; i < workers; i++) {
    //env = Object.assign({}, process.env);
    env = {};
    env['child'] = true;
    env['index'] = i;
    env['start'] = partition[i];
    env['end'] = partition[i+1];
    worker.push(require('child_process').spawn(cmd, args, {
      'env': env,
      'stdio': ['pipe', 'pipe', null]
    }));
    res.push('');
  }

  for (i in worker) {
    worker[i].stdout.setEncoding('ascii');
    worker[i].stdout.on('data',
      (function () {
        var idx = i;
        return function (chunk) {
          res[idx] = res[idx] + chunk;
        }
      })()
    );
    worker[i].stdout.resume();
  }
  
  finished = 0;
  for (i in worker)
    worker[i].on('exit',
      (function () {
        var idx = i;
        return function () {
          var i;
          //console.log("Exit: ", idx);
          finished++;
          if (finished === workers) {
            for (i in res)
              if (res[i].length !== 0) console.log(res[i]);
          }
        }
      })());

  for (i in worker) {
    worker[i].stdin.write(line, 'ascii');
    worker[i].stdin.end();
  }
}

function child() {
  var str;
  str = '';
  process.stdin.setEncoding('ascii');
  process.stdin.on('data', function (chunk) { str = str + chunk; });
  process.stdin.on('end', child_main);
  process.stdin.resume();

  function child_main() {
    var line, T, P, start, end, res, idx;
    line = str.split(config.newline, 2);
    T = line[0];
    P = line[1];
    start = process.env.start;
    end = process.env.end;
    res = [];
    idx = start;
    while ((idx = T.indexOf(P, idx)) !== -1 && idx < end) {
      res.push(idx);
      idx++;
    }
    process.stdout.write(res.join('\n'), 'ascii');
    //console.log('');
    process.stdout.end();
    process.exit();
  }
}