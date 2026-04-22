(function() {
    const Performer = require('benchmark');
    const BitVector = require('./../lib/Bits.js').Bits;

    const dataStore = new BitVector();

    const configurePrecondition = (sizeDimension, fillFlag) => {
        return () => {
            if (sizeDimension !== undefined) {
                dataStore.reset(sizeDimension, fillFlag);
            } else {
                dataStore.reset();
            }
        };
    };

    const evaluationSpecs = [
        {
            label: 'Sparse BitVector#register',
            operation: () => {
                dataStore.register(1200);
                dataStore.register(1500);
                dataStore.register(8000);
            },
            precondition: configurePrecondition()
        },
        {
            label: 'Sparse BitVector#check',
            operation: () => {
                dataStore.check(1000);
                dataStore.check(1500);
                dataStore.check(9000);
            },
            precondition: configurePrecondition()
        },
        {
            label: 'Fixed non-filled BitVector#register',
            operation: () => {
                dataStore.register(1200);
                dataStore.register(1500);
                dataStore.register(8000);
            },
            precondition: configurePrecondition(10000)
        },
        {
            label: 'Fixed non-filled BitVector#check',
            operation: () => {
                dataStore.check(1000);
                dataStore.check(1500);
                dataStore.check(9000);
            },
            precondition: configurePrecondition(10000)
        },
        {
            label: 'Fixed filled BitVector#register(fill)',
            operation: () => {
                dataStore.register(1200);
                dataStore.register(1500);
                dataStore.register(8000);
            },
            precondition: configurePrecondition(10000, 0)
        },
        {
            label: 'Fixed filled BitVector#check(fill)',
            operation: () => {
                dataStore.check(1000);
                dataStore.check(1500);
                dataStore.check(9000);
            },
            precondition: configurePrecondition(10000, 0)
        }
    ];

    const testCollection = new Performer.Suite();

    evaluationSpecs.forEach(specDefinition => {
        testCollection.add(specDefinition.label, specDefinition.operation, { onStart: specDefinition.precondition });
    });

    testCollection.on('cycle', (cycleEvent, currentBench) => {
        console.log(String(currentBench));
    });

    testCollection.run();

})();