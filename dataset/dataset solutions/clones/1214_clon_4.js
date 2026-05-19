const { Transform: StreamTransform } = require('stream');

class LineEmitter extends StreamTransform {
  _transform(inputData, dataEncoding, completionCallback) {
    this.push(inputData);
    this.push('\n');
    completionCallback();
  }
}

process.stdin.setEncoding('utf8');
process.stdin
  .pipe(new LineEmitter())
  .pipe(process.stdout);
