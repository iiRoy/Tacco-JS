const PerfTracker = require('benchmark').Benchmark;
const PathFormulator = require('../');
const PathProcessor = require('path-to-regexp');

const PerformanceSuite = new PerfTracker.Suite();

let finalResults = {
    processorOutput: null,
    formulatorOutput: null
};

const routeDefinitions = [
    { tag: 'processor-basic', pattern: '/foo/:bar', method: 'processor' },
    { tag: 'processor-multi', pattern: ':year(\\d+)-:month(\\d+)-:day(\\d+)', method: 'processor' },
    { tag: 'processor-extended', pattern: '/:controller/:action/posts/:id/:year-:month-:day/:title/:author.:format', method: 'processor' },
    { tag: 'processor-super-extended', pattern: '/:controller/:action/posts/:id/:year-:month-:day/:title/:author.:format/:controller/:action/posts/:id/:year-:month-:day/:title/:author.:format', method: 'processor' },
    { tag: 'processor-escapes', pattern: '.=&;?#', method: 'processor' },

    { tag: 'formulator-basic', pattern: '/foo/{bar}', method: 'formulator' },
    { tag: 'formulator-multi', pattern: '{year:\\d+}-{month:\\d+}-{day:\\d+}', method: 'formulator' },
    { tag: 'formulator-extended', pattern: '/{controller}/{action}/posts/{id}/{year:\\d+}-{month:\\d+}-{day:\\d+}/{title}/{author}.{format}', method: 'formulator' },
    { tag: 'formulator-super-extended', pattern: '/{controller}/{action}/posts/{id}/{year:\\d+}-{month:\\d+}-{day:\\d+}/{title}/{author}.{format}/{controller}/{action}/posts/{id}/{year:\\d+}-{month:\\d+}-{day:\\d+}/{title}/{author}.{format}', method: 'formulator' },
    { tag: 'formulator-escapes', pattern: '.=&;?#', method: 'formulator' },
];

const libraryExecutors = {
    processor: (pattern, outputStore) => {
        let tempContainer = [];
        PathProcessor(pattern, tempContainer);
        outputStore.processorOutput = tempContainer;
    },
    formulator: (pattern, outputStore) => {
        outputStore.formulatorOutput = PathFormulator(pattern);
    }
};

routeDefinitions.forEach(spec => {
    PerformanceSuite.add(spec.tag, function() {
        libraryExecutors[spec.method](spec.pattern, finalResults);
    });
});

PerformanceSuite.on('cycle', function(evt) {
  console.log(String(evt.target));
})
.on('complete', function() {
  console.log('Highest performer: ' + this.filter('fastest').pluck('name') + '.');
  console.dir(finalResults.processorOutput);
  console.dir(finalResults.formulatorOutput);
})
.run();