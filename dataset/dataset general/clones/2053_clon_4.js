(function () {
    const globalContext = window;

    // Test framework global setup
    globalContext.scrollMonitor = globalContext.scrollMonitor; // Keep SUT name
    globalContext.assertionLib = globalContext.chai;
    globalContext.assertExpected = globalContext.chai.expect;
    globalContext.assertionStrict = globalContext.chai.assert;
    globalContext.assertionFluent = globalContext.chai.should();
    globalContext.noAutoTracking = true;

    globalContext.mocha.setup({
        ui: 'bdd'
    });

    // Event type constants, encapsulated in an object
    const EventIdentifiers = {
        VISIBILITY_ALTERATION: 'visibilityChange',
        ENTRANCE_IN_VIEWPORT: 'enterViewport',
        FULL_ENTRANCE_IN_VIEWPORT: 'fullyEnterViewport',
        EXIT_FROM_VIEWPORT: 'exitViewport',
        PARTIAL_EXIT_FROM_VIEWPORT: 'partiallyExitViewport',
        POSITION_CHANGE: 'locationChange',
        VIEW_STATE_CHANGE: 'stateChange'
    };

    const allEventKeys = Object.values(EventIdentifiers);

    // Alternative requestAnimationFrame implementation
    const frameProcessor = (() => {
        const standardRAF = globalContext.requestAnimationFrame;
        const mozillaRAF = globalContext.mozRequestAnimationFrame;
        const webkitRAF = globalContext.webkitRequestAnimationFrame;
        const microsoftRAF = globalContext.msRequestAnimationFrame;

        return standardRAF || mozillaRAF || webkitRAF || microsoftRAF || ((callback) => setTimeout(callback, 20));
    })();

    const fetchClientAreaHeight = () => {
        return globalContext.innerHeight || document.documentElement.clientHeight;
    };

    const scheduleNextFrame = (task) => {
        setTimeout(() => {
            frameProcessor(task);
        }, 4);
    };

    let testElementContainer = document.getElementById('test-area');
    if (!testElementContainer) {
        testElementContainer = document.createElement('section');
        testElementContainer.id = 'test-area';
        document.body.appendChild(testElementContainer);
    }

    let dynamicItem;
    const prepareTestConditions = (completionCallback) => {
        dynamicItem = document.createElement('article');
        Object.assign(dynamicItem.style, {
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '10px',
            backgroundColor: 'silver',
            height: `${fetchClientAreaHeight() * 2}px`
        });
        testElementContainer.appendChild(dynamicItem);
        globalContext.scrollTo(0, 0);
        scheduleNextFrame(() => { completionCallback(); });
    };

    const clearTestConditions = (completionCallback) => {
        testElementContainer.innerHTML = '';
        globalContext.scrollTo(0, 0);
        scheduleNextFrame(() => { completionCallback(); });
    };

    describe('Application Programming Interface', function () {

        it('core module should expose expected methods and properties.', function () {
            assertExpected(scrollMonitor).to.respondTo('create');
            assertExpected(scrollMonitor).to.respondTo('update');
            assertExpected(scrollMonitor).to.respondTo('recalculateLocations');

            assertExpected(scrollMonitor.viewportTop).to.be.a('number');
            assertExpected(scrollMonitor.viewportBottom).to.be.a('number');
            assertExpected(scrollMonitor.viewportHeight).to.be.a('number');
            assertExpected(scrollMonitor.documentHeight).to.be.a('number');
        });

        it('observer instance should expose expected methods and properties.', function () {
            const observerInstance = scrollMonitor.create(10);

            assertExpected(observerInstance).to.respondTo('on');
            assertExpected(observerInstance).to.respondTo('off');
            assertExpected(observerInstance).to.respondTo('one');
            assertExpected(observerInstance).to.respondTo('lock');
            assertExpected(observerInstance).to.respondTo('unlock');
            assertExpected(observerInstance).to.respondTo('destroy');
            assertExpected(observerInstance).to.respondTo('update');
            assertExpected(observerInstance).to.respondTo('triggerCallbacks');

            for (const key of allEventKeys) {
                assertExpected(observerInstance).to.respondTo(key);
            }

            assertExpected(observerInstance.isInViewport).to.be.a('boolean');
            assertExpected(observerInstance.isFullyInViewport).to.be.a('boolean');
            assertExpected(observerInstance.isAboveViewport).to.be.a('boolean');
            assertExpected(observerInstance.isBelowViewport).to.be.a('boolean');
            assertExpected(observerInstance.top).to.be.a('number');
            assertExpected(observerInstance.bottom).to.be.a('number');
            assertExpected(observerInstance.height).to.be.a('number');
            assertExpected(observerInstance.watchItem).to.be.a('number');
            assertExpected(observerInstance.offsets).to.be.an('object');

            observerInstance.destroy();
        });
    });

    describe('positional calculations', function () {

        it('should correctly determine numeric positions', function () {
            const firstObserver = scrollMonitor.create(10);
            const secondObserver = scrollMonitor.create(15);

            assertExpected(firstObserver.top).to.equal(10);
            assertExpected(secondObserver.top).to.equal(15);

            assertExpected(firstObserver.bottom).to.equal(10);
            assertExpected(secondObserver.bottom).to.equal(15);

            assertExpected(firstObserver.height).to.equal(0);
            assertExpected(secondObserver.height).to.equal(0);

            assertExpected(firstObserver.offsets).to.eql({
                top: 0,
                bottom: 0
            });
            assertExpected(secondObserver.offsets).to.eql({
                top: 0,
                bottom: 0
            });

            firstObserver.destroy();
            secondObserver.destroy();
        });

        it('should correctly determine object-defined positions', function () {
            const observerInstance = scrollMonitor.create({
                top: 100,
                bottom: 102
            });

            assertExpected(observerInstance.top).to.equal(100);
            assertExpected(observerInstance.bottom).to.equal(102);
            assertExpected(observerInstance.height).to.equal(2);

            observerInstance.destroy();
        });

        it('should correctly determine array-like positions (with zero property)', function () {
            const observerInstance = scrollMonitor.create([10]);

            assertExpected(observerInstance.top).to.equal(10);
            assertExpected(observerInstance.bottom).to.equal(10);
            assertExpected(observerInstance.height).to.equal(0);

            observerInstance.destroy();
        });

        it('should correctly determine DOM element positions', function () {
            const tempDiv = document.createElement('div');

            Object.assign(tempDiv.style, {
                position: 'relative',
                top: '10px',
                width: '100px',
                height: '15px',
                backgroundColor: 'gray'
            });

            testElementContainer.appendChild(tempDiv);
            const observerInstance = scrollMonitor.create(tempDiv);

            const containerOffset = testElementContainer.offsetTop;
            assertExpected(observerInstance.top).to.equal(containerOffset + 10);
            assertExpected(observerInstance.bottom).to.equal(containerOffset + 25);
            assertExpected(observerInstance.height).to.equal(15);

            observerInstance.destroy();
            testElementContainer.innerHTML = '';
        });
    });

    describe('location status flags', function () {
        beforeEach(prepareTestConditions);
        afterEach(clearTestConditions);

        it('should correctly identify fully within viewport', function () {
            const observerInstance = scrollMonitor.create(10);

            assertExpected(observerInstance.isInViewport).to.equal(true);
            assertExpected(observerInstance.isFullyInViewport).to.equal(true);
            assertExpected(observerInstance.isAboveViewport).to.equal(false);
            assertExpected(observerInstance.isBelowViewport).to.equal(false);

            observerInstance.destroy();
        });

        it('should correctly identify partially below viewport', function () {
            const currentDisplayHeight = fetchClientAreaHeight();
            const observerInstance = scrollMonitor.create({
                top: currentDisplayHeight - 10,
                bottom: currentDisplayHeight + 10
            });

            assertExpected(observerInstance.isInViewport).to.equal(true);
            assertExpected(observerInstance.isFullyInViewport).to.equal(false);
            assertExpected(observerInstance.isAboveViewport).to.equal(false);
            assertExpected(observerInstance.isBelowViewport).to.equal(true);

            observerInstance.destroy();
        });

        it('should correctly identify partially above viewport', function (completionCallback) {
            globalContext.scrollTo(0, 100);
            scheduleNextFrame(() => {
                const observerInstance = scrollMonitor.create({
                    top: 0,
                    bottom: 200
                });

                assertExpected(observerInstance.isInViewport).to.equal(true);
                assertExpected(observerInstance.isFullyInViewport).to.equal(false);
                assertExpected(observerInstance.isAboveViewport).to.equal(true);
                assertExpected(observerInstance.isBelowViewport).to.equal(false);

                observerInstance.destroy();
                completionCallback();
            });
        });

        it('should correctly identify entirely below viewport', function () {
            const currentDisplayHeight = fetchClientAreaHeight();
            const observerInstance = scrollMonitor.create({
                top: currentDisplayHeight + 10,
                bottom: currentDisplayHeight + 20
            });

            assertExpected(observerInstance.isInViewport).to.equal(false);
            assertExpected(observerInstance.isFullyInViewport).to.equal(false);
            assertExpected(observerInstance.isAboveViewport).to.equal(false);
            assertExpected(observerInstance.isBelowViewport).to.equal(true);

            observerInstance.destroy();
        });

        it('should correctly identify entirely above viewport', function (completionCallback) {
            globalContext.scrollTo(0, 100);
            scheduleNextFrame(() => {
                const observerInstance = scrollMonitor.create({
                    top: 0,
                    bottom: 20
                });

                assertExpected(observerInstance.isInViewport).to.equal(false);
                assertExpected(observerInstance.isFullyInViewport).to.equal(false);
                assertExpected(observerInstance.isAboveViewport).to.equal(true);
                assertExpected(observerInstance.isBelowViewport).to.equal(false);

                observerInstance.destroy();
                completionCallback();
            });
        });

        it('should correctly identify larger than and fully in viewport', function (completionCallback) {
            globalContext.scrollTo(0, 100);
            scheduleNextFrame(() => {
                const currentDisplayHeight = fetchClientAreaHeight();
                const observerInstance = scrollMonitor.create({
                    top: 0,
                    bottom: currentDisplayHeight + 200
                });

                assertExpected(observerInstance.isInViewport).to.equal(true);
                assertExpected(observerInstance.isFullyInViewport).to.equal(true);
                assertExpected(observerInstance.isAboveViewport).to.equal(true);
                assertExpected(observerInstance.isBelowViewport).to.equal(true);

                observerInstance.destroy();
                completionCallback();
            });
        });
    });

    describe('offset configuration', function () {
        it('should default to no offsets', function () {
            const observerInstance = scrollMonitor.create(10);
            assertExpected(observerInstance.offsets).to.eql({
                top: 0,
                bottom: 0
            });
            observerInstance.destroy();
        });
        it('should accept a single number for offsets', function () {
            const observerInstance = scrollMonitor.create(10, 10);
            assertExpected(observerInstance.offsets).to.eql({
                top: 10,
                bottom: 10
            });
            observerInstance.destroy();
        });
        it('should accept an object with only top offset', function () {
            const observerInstance = scrollMonitor.create(10, {
                top: 10
            });
            assertExpected(observerInstance.offsets).to.eql({
                top: 10,
                bottom: 0
            });
            observerInstance.destroy();
        });
        it('should accept an object with only bottom offset', function () {
            const observerInstance = scrollMonitor.create(10, {
                bottom: 10
            });
            assertExpected(observerInstance.offsets).to.eql({
                top: 0,
                bottom: 10
            });
            observerInstance.destroy();
        });
        it('should accept an object with both top and bottom offsets', function () {
            const observerInstance = scrollMonitor.create(10, {
                top: 5,
                bottom: 10
            });
            assertExpected(observerInstance.offsets).to.eql({
                top: 5,
                bottom: 10
            });
            observerInstance.destroy();
        });
    });

    describe('callback management', function () {
        function emptyOperation() {}
        it('should initialize callback arrays for each event type', function () {
            const observerInstance = scrollMonitor.create(10);
            for (const key of allEventKeys) {
                assertExpected(observerInstance.callbacks[key]).to.be.an('array');
                assertExpected(observerInstance.callbacks[key].length).to.equal(0);
            }
            observerInstance.destroy();
        });
        it('should register event listeners', function () {
            const observerInstance = scrollMonitor.create(10);
            for (const key of allEventKeys) {
                observerInstance.on(key, emptyOperation);
                assertExpected(observerInstance.callbacks[key].length).to.equal(1);
                assertExpected(observerInstance.callbacks[key][0].callback).to.equal(emptyOperation);
                assertExpected(observerInstance.callbacks[key][0].isOne).to.equal(false);
            }
            observerInstance.destroy();
        });
        it('should deregister event listeners', function () {
            const observerInstance = scrollMonitor.create(10);
            for (const key of allEventKeys) {
                observerInstance.on(key, emptyOperation);
                observerInstance.off(key, emptyOperation);
                assertExpected(observerInstance.callbacks[key].length).to.equal(0);
            }
            observerInstance.destroy();
        });
        it('should correctly handle "one" shot event listeners', function () {
            const observerInstance = scrollMonitor.create(10);
            for (const key of allEventKeys) {
                const actionMonitor = sinon.spy();
                observerInstance.one(key, actionMonitor);

                switch (key) {
                    case EventIdentifiers.ENTRANCE_IN_VIEWPORT:
                    case EventIdentifiers.FULL_ENTRANCE_IN_VIEWPORT:
                        assertExpected(observerInstance.callbacks[key].length).to.equal(0);
                        assertExpected(actionMonitor.called).to.equal(true);
                        break;
                    default:
                        assertExpected(observerInstance.callbacks[key].length).to.equal(1);
                        assertExpected(actionMonitor.called).to.equal(false);
                        assertExpected(observerInstance.callbacks[key][0].callback).to.equal(actionMonitor);
                        assertExpected(observerInstance.callbacks[key][0].isOne).to.equal(true);
                        break;
                }
            }
            observerInstance.destroy();
        });
        it('should auto-invoke listeners if already in condition', function () {
            const observerInstance = scrollMonitor.create(10);
            for (const key of allEventKeys) {
                const actionMonitor = sinon.spy();
                observerInstance.on(key, actionMonitor);

                switch (key) {
                    case EventIdentifiers.ENTRANCE_IN_VIEWPORT:
                    case EventIdentifiers.FULL_ENTRANCE_IN_VIEWPORT:
                        assertExpected(actionMonitor.called).to.equal(true);
                        break;
                    default:
                        assertExpected(actionMonitor.called).to.equal(false);
                        break;
                }
            }
            observerInstance.destroy();
        });
    });

    describe('event triggering upon user scrolling', function () {
        beforeEach(prepareTestConditions);
        afterEach(clearTestConditions);

        it('should trigger enterViewport immediately if element is already visible', function () {
            const observerInstance = scrollMonitor.create(dynamicItem);
            const actionMonitor = sinon.spy();

            observerInstance.enterViewport(actionMonitor);
            assertExpected(actionMonitor.called).to.equal(true);
            observerInstance.destroy();
        });

        it('should trigger enterViewport and fullyEnterViewport immediately if element is fully visible', function () {
            dynamicItem.style.top = '0px';

            const observerInstance = scrollMonitor.create(10);
            const actionMonitor1 = sinon.spy();
            const actionMonitor2 = sinon.spy();

            observerInstance.enterViewport(actionMonitor1);
            observerInstance.fullyEnterViewport(actionMonitor2);
            assertExpected(actionMonitor1.called).to.equal(true);
            assertExpected(actionMonitor2.called).to.equal(true);

            observerInstance.destroy();
        });

        it('should trigger exitViewport immediately if element is already above the viewport', function (completionCallback) {
            globalContext.scrollTo(0, 100);
            scheduleNextFrame(() => {
                const observerInstance = scrollMonitor.create(10);
                const actionMonitor = sinon.spy();

                observerInstance.exitViewport(actionMonitor);
                assertExpected(actionMonitor.called).to.equal(true);
                observerInstance.destroy();
                completionCallback();
            });
        });

        it('should trigger partiallyExitViewport immediately if element is already above the viewport', function (completionCallback) {
            globalContext.scrollTo(0, 100);
            scheduleNextFrame(() => {
                const observerInstance = scrollMonitor.create(10);
                const actionMonitor = sinon.spy();

                observerInstance.partiallyExitViewport(actionMonitor);
                assertExpected(actionMonitor.called).to.equal(true);
                observerInstance.destroy();
                completionCallback();
            });
        });

        it('should trigger exitViewport and partiallyExitViewport when element leaves viewport', function (completionCallback) {
            const observerInstance = scrollMonitor.create(10);
            const actionMonitor1 = sinon.spy();
            const actionMonitor2 = sinon.spy();

            observerInstance.exitViewport(actionMonitor1);
            observerInstance.partiallyExitViewport(actionMonitor2);
            assertExpected(actionMonitor1.called).to.equal(false);
            assertExpected(actionMonitor2.called).to.equal(false);

            globalContext.scrollTo(0, 100);
            scheduleNextFrame(() => {
                assertExpected(actionMonitor1.called).to.equal(true);
                assertExpected(actionMonitor2.called).to.equal(true);
                observerInstance.destroy();
                completionCallback();
            });
        });

        it('should trigger enterViewport and fullyEnterViewport when element enters viewport', function (completionCallback) {
            const observerInstance = scrollMonitor.create(fetchClientAreaHeight() + 10);
            const actionMonitor1 = sinon.spy();
            const actionMonitor2 = sinon.spy();

            observerInstance.enterViewport(actionMonitor1);
            observerInstance.fullyEnterViewport(actionMonitor2);
            assertExpected(actionMonitor1.called).to.equal(false);
            assertExpected(actionMonitor2.called).to.equal(false);

            globalContext.scrollTo(0, 100);
            scheduleNextFrame(() => {
                assertExpected(actionMonitor1.called).to.equal(true);
                assertExpected(actionMonitor2.called).to.equal(true);
                observerInstance.destroy();
                completionCallback();
            });
        });

        it('should only trigger partiallyExitViewport when element partially leaves viewport', function (completionCallback) {
            const observerInstance = scrollMonitor.create({
                top: 10,
                bottom: 200
            });
            const actionMonitor1 = sinon.spy();
            const actionMonitor2 = sinon.spy();

            observerInstance.exitViewport(actionMonitor1);
            observerInstance.partiallyExitViewport(actionMonitor2);
            assertExpected(actionMonitor1.called).to.equal(false);
            assertExpected(actionMonitor2.called).to.equal(false);

            globalContext.scrollTo(0, 100);
            scheduleNextFrame(() => {
                assertExpected(actionMonitor1.called).to.equal(false);
                assertExpected(actionMonitor2.called).to.equal(true);
                observerInstance.destroy();
                completionCallback();
            });
        });

        it('should only trigger enterViewport when element partially enters viewport', function (completionCallback) {
            const currentDisplayHeight = fetchClientAreaHeight();
            const observerInstance = scrollMonitor.create({
                top: currentDisplayHeight + 10,
                bottom: (currentDisplayHeight * 2) + 100
            });
            const actionMonitor1 = sinon.spy();
            const actionMonitor2 = sinon.spy();

            observerInstance.enterViewport(actionMonitor1);
            observerInstance.fullyEnterViewport(actionMonitor2);
            assertExpected(actionMonitor1.called).to.equal(false);
            assertExpected(actionMonitor2.called).to.equal(false);

            globalContext.scrollTo(0, currentDisplayHeight + 20);
            scheduleNextFrame(() => {
                assertExpected(actionMonitor1.called).to.equal(true);
                assertExpected(actionMonitor2.called).to.equal(false);
                observerInstance.destroy();
                completionCallback();
            });
        });
    });
})();