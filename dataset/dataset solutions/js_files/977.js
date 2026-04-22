//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

const assert = require('assert');

line = require('fs').readFileSync(config.input, 'ascii')
  .split(config.newline);
line[0] = line[0].split(' ').map(Number);
H = line[0][0];
W = line[0][1];
field = line.slice(1, 1+H);
line[1+H] = line[1+H].split(' ').map(Number);
R = line[1+H][0];
C = line[1+H][1];
pat = line.slice(1+H+1, 1+H+1+R);
line = null; // dispose

if (H < R || W < C) process.exit();

// changes a string into the segments of a number

const SEGMENT_NUMBER_LENGTH = 31;

function makeSegment(str) {
  var ary, i;
  ary = [];
  for (i = 0; i < str.length; i += SEGMENT_NUMBER_LENGTH)
    ary.push(str.substr(i, SEGMENT_NUMBER_LENGTH));
  ary = ary.map(function (str) {
    return parseInt(str.split('').reverse().join(''), 2); });
  return {'length': str.length, 'offset': 0, 'body': ary};
}

function isHead(longSegment, shortSegment) {
  var llen, slen, lofst, sofst, l, s;
  assert(longSegment.length >= shortSegment.length);
  llen = longSegment.length;
  slen = shortSegment.length;
  lofst = longSegment.offset;
  sofst = shortSegment.offset;
  l = longSegment.body;
  s = shortSegment.body;
  while (slen > SEGMENT_NUMBER_LENGTH) {
    if (s[sofst] !== l[lofst]) return false;
    sofst++;
    lofst++;
    slen -= SEGMENT_NUMBER_LENGTH;
    llen -= SEGMENT_NUMBER_LENGTH;
  }
  return ((l[lofst] % Math.pow(2, slen)) === s[sofst]);
}

function shiftSegment(seg) {
  seg.length -= SEGMENT_NUMBER_LENGTH;
  seg.offset++;
  if (seg.length <= 0) return null;
  return seg;
}

function makeSegmentSeries(str) {
  var res, i;
  res = new Array(SEGMENT_NUMBER_LENGTH);
  for (i = 0; i < SEGMENT_NUMBER_LENGTH; i++) res[i] = null;
  for (i = 0; i < SEGMENT_NUMBER_LENGTH && i < str.length; i++)
    res[i] = makeSegment(str.slice(i));
  return res;
}

function copySegmentSeries(dst, src) {
  var i, dst_i, src_i;
  for (i in src) {
    if (!src[i]) {
      dst[i] = null;
      continue;
    }
    if (!dst[i]) {
      dst[i] = Object.assign({}, src[i]);
    } else {
      Object.assign(dst[i], src[i]);
    }
  }
}

segmentSeriesInSegmentMatch = new Array(SEGMENT_NUMBER_LENGTH);

function segmentMatch(segmentSeries, segment) {
  var series, res, i;
  series = segmentSeriesInSegmentMatch;
  copySegmentSeries(series, segmentSeries);
  res = [];
  i = 0;
  while (series[i] && series[i].length >= segment.length) {
    res.push(isHead(series[i], segment));
    series[i] = shiftSegment(series[i]);
    i++;
    if (i === SEGMENT_NUMBER_LENGTH) i = 0;
  }
  return res;
}

field = field.map(makeSegmentSeries);
pat = pat.map(makeSegment);

// pattern matching

mem = new Array(H-R+1);
for (i = 0; i <= H-R; i++) {
  mem[i] = new Array(W-C+1);
  for (j = 0; j <= W-C; j++) mem[i][j] = 0;
}

for (i = 0; i < H; i++) {
  for (j = Math.max(0, i-H+R); j < R && j <= i; j++) {
    match = segmentMatch(field[i], pat[j]);
    for (k in match) {
      if (!match[k]) continue;
      mem[i-j][k]++;
    }
  }
}

for (i in mem)
  for (j in mem[i])
    if (mem[i][j] === R) console.log('%s %s', i, j);