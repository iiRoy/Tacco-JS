let _ = '';
process.stdin.on('data', (d) => { _ += d; });
process.stdin.on('end', () => {
    const _f = (v) => (v / 3) | 0;
    const _g = _.trim().split('\n').map( (e) => {
        const _h = e.split(' ').reduce( (acc, val) => acc + Number(val), 0 );
        return _f(_h);
    });
    console.log(_g.join('\n'));
});