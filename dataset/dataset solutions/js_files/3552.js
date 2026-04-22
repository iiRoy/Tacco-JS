'use strict';

const main = (input) => {
    const t = input.split('\n').slice(1);
    let last = null;
    const dict = {};
    let r = true;
    t.forEach(word => {
        if (typeof dict[word] !== 'undefined') {
            r = false;
        }
        const new_first = word.substr(0, 1);
        const new_last = word.substr(-1);
        if (last != null && last != new_first) {
            r = false;
        }
        last = new_last;
        dict[word] = true;
    });
    console.log (r ? 'Yes' : 'No');
};

const isTest = false;

if (isTest) {
    main('4\nhoge\nenglish\nhoge\nenigma');
    main('9\nbasic\nc\ncpp\nphp\npython\nnadesico\nocaml\nlua\nassembly');
} else {
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
}