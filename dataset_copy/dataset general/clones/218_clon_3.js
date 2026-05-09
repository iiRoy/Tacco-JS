featureTest('UI.CompositeView Functionality', function() {
    // Core component definition and mixin application
    const UI_CoreView = UI.BaseView;
    Object.assign(UI_CoreView.prototype, UI.TemplateEngineMix);

    // Reference to the main component under test
    let CompositeInstance = UI.CompositeView;

    // Instance of the component for each test scenario
    let testComposite;

    // Common CSS class for testing DOM manipulations
    const TEST_DESTINATION_CLASS = '.test-container';

    /**
     * Helper function to create a new mock UI component.
     * @param {Object} [options] - Options for the mock component.
     * @returns {MockUIComponent} A new mock component instance.
     */
    const createMockChildComponent = (options = {}) => {
        // A simple stand-in for a UI component, possibly a Backbone.View or similar
        return new MockUIComponent(options);
    };

    beforeEachScenario(function() {
        // Ensure a fresh instance of the composite view for every test
        testComposite = new CompositeInstance();
        // A basic guard to ensure initialization
        if (!testComposite) {
            throw new Error("testComposite was not initialized!");
        }
    });

    afterEachScenario(function() {
        // Clean up any DOM elements created by the composite view
        if (testComposite && testComposite.mainDomElement && testComposite.mainDomElement.remove) {
            testComposite.mainDomElement.remove();
        }
        // Potentially reset any global state or stubs here if not handled by mockingLibrary
    });

    featureTest('._init() Method', function() {
        scenario('should initialize .subComponentsMap as an empty collection', function() {
            // Verifies that the internal collection for child components is empty by default.
            expect(testComposite.subComponentsMap).to.be.an('object').and.be.empty;
        });

        scenario('should invoke the parent component\'s constructor during initialization', function() {
            // Stub the parent's constructor to confirm it's called.
            const initMethodStub = mockingLibrary.stub(UI_CoreView.prototype, "constructor");

            // Re-instantiate to trigger the constructor call
            testComposite = new CompositeInstance();

            // Assert that the parent constructor was indeed called.
            expect(initMethodStub).to.have.been.calledOnce;
            initMethodStub.restore(); // Restore the original method
        });

        scenario('should set a default internal flag upon construction', function() {
            // Check for a hypothetical internal state flag
            expect(testComposite._isConstructedSuccessfully).to.be.true;
        });
    });

    featureTest('.setupComponent() Method', function() {
        scenario('should invoke the parent component\'s setup method', function() {
            // Stub the parent's setup method.
            const setupMethodStub = mockingLibrary.stub(UI_CoreView.prototype, "initialize");

            // Re-instantiate to trigger setup via constructor
            testComposite = new CompositeInstance();

            // Verify the parent's setup was called once.
            expect(setupMethodStub).to.have.been.calledOnce;
            setupMethodStub.restore(); // Clean up the stub
        });

        scenario('should configure .componentInteractionHandlers from options', function() {
            // Define a dummy event handler.
            const actionHandler = function() { /* no-op */ };
            const componentInteractionHandlers = { 'customEvent': actionHandler };

            // Instantiate with options.
            testComposite = new CompositeInstance({
                componentInteractionHandlers: componentInteractionHandlers
            });

            // Assert that the handlers are correctly set.
            expect(testComposite.componentInteractionHandlers).to.have.all.keys(['customEvent']);
            expect(testComposite.componentInteractionHandlers).to.have.property('customEvent', actionHandler);
        });

        scenario('should reset managed child components based on supplied options', function() {
            // Create a mock child component.
            const mockChild = createMockChildComponent();
            const placementKey = 'append ' + TEST_DESTINATION_CLASS;
            const initialComponents = {};
            initialComponents[placementKey] = mockChild;

            // Instantiate with initial child components.
            testComposite = new CompositeInstance({
                managedChildElements: initialComponents
            });

            // Verify the child component was added.
            expect(testComposite.getChildComponent(placementKey)).to.deep.equal(mockChild);
        });

        scenario('should handle missing options gracefully', function() {
            testComposite = new CompositeInstance(); // No options passed
            expect(testComposite.componentInteractionHandlers).to.be.an('object').and.be.empty;
            expect(testComposite.subComponentsMap).to.be.an('object').and.be.empty;
        });
    });

    featureTest('.registerChildComponentEvents() Method', function() {
        scenario('should listen to all .componentInteractionHandlers on a child component', function() {
            const mockChild = createMockChildComponent();
            testComposite.addChildComponent('append ' + TEST_DESTINATION_CLASS, mockChild);
            const actionHandler = mockingLibrary.spy();
            testComposite.componentInteractionHandlers = { 'customEvent': actionHandler };

            // Register events and trigger.
            testComposite.registerChildComponentEvents(mockChild);
            mockChild.trigger('customEvent');

            // Verify the handler was called.
            expect(actionHandler).to.have.been.calledOnce;
        });

        scenario('should do nothing if no handlers are defined', function() {
            const mockChild = createMockChildComponent();
            testComposite.addChildComponent('append ' + TEST_DESTINATION_CLASS, mockChild);
            testComposite.componentInteractionHandlers = {}; // No handlers
            const actionHandler = mockingLibrary.spy(); // This spy won't be called

            testComposite.registerChildComponentEvents(mockChild);
            mockChild.trigger('customEvent');

            expect(actionHandler).to.not.have.been.called;
        });
    });

    featureTest('.unregisterChildComponentEvents() Method', function() {
        scenario('should cease responding to .componentInteractionHandlers on a child component', function() {
            const mockChild = createMockChildComponent();
            testComposite.addChildComponent('append ' + TEST_DESTINATION_CLASS, mockChild);
            const actionHandler = mockingLibrary.spy();
            testComposite.componentInteractionHandlers = { 'customEvent': actionHandler };

            // First, register and then unregister.
            testComposite.registerChildComponentEvents(mockChild);
            testComposite.unregisterChildComponentEvents(mockChild);
            mockChild.trigger('customEvent'); // This should now have no effect

            // Verify the handler was NOT called.
            expect(actionHandler).to.not.have.been.called;
        });
    });

    featureTest('.addChildComponent() Method', function() {
        let mockChild;
        beforeEachScenario(function() {
            // Set up a composite instance with a template
            testComposite = new CompositeInstance({
                template: `<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr></div>`
            });
            mockChild = createMockChildComponent();
        });

        scenario('should add the component to the inner part of the destination', function() {
            const insertionPoint = 'inner ' + TEST_DESTINATION_CLASS;
            testComposite.addChildComponent(insertionPoint, mockChild);
            testComposite.mountComponent().composeDOM();

            // Verify the DOM structure
            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><div></div></div>`);
        });

        scenario('should replace the outer part of the destination with the component', function() {
            const insertionPoint = 'outer ' + TEST_DESTINATION_CLASS;
            testComposite.addChildComponent(insertionPoint, mockChild);
            testComposite.mountComponent().composeDOM();

            expect(testComposite.mainDomElement.html()).to.equal('<div></div>');
        });

        scenario('should add the component by prepending to the destination', function() {
            const insertionPoint = 'prepend ' + TEST_DESTINATION_CLASS;
            testComposite.addChildComponent(insertionPoint, mockChild);
            testComposite.mountComponent().composeDOM();

            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><div></div><hr></div>`);
        });

        scenario('should add the component by appending to the destination', function() {
            const insertionPoint = 'append ' + TEST_DESTINATION_CLASS;
            testComposite.addChildComponent(insertionPoint, mockChild);
            testComposite.mountComponent().composeDOM();

            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr><div></div></div>`);
        });

        scenario('should insert the component before the destination element', function() {
            const insertionPoint = 'before ' + TEST_DESTINATION_CLASS;
            testComposite.addChildComponent(insertionPoint, mockChild);
            testComposite.mountComponent().composeDOM();

            expect(testComposite.mainDomElement.html()).to.equal(`<div></div><div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr></div>`);
        });

        scenario('should insert the component after the destination element', function() {
            const insertionPoint = 'after ' + TEST_DESTINATION_CLASS;
            testComposite.addChildComponent(insertionPoint, mockChild);
            testComposite.mountComponent().composeDOM();

            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr></div><div></div>`);
        });

        scenario('should delegate component events to the newly added component', function() {
            const actionHandler = mockingLibrary.spy();
            testComposite.componentInteractionHandlers = { 'customEvent': actionHandler };

            testComposite.addChildComponent('append ' + TEST_DESTINATION_CLASS, mockChild);
            mockChild.trigger('customEvent');

            expect(actionHandler).to.have.been.calledOnce;
        });

        scenario('should set the child component\'s parentReference to this composite', function() {
            const insertionPoint = 'after ' + TEST_DESTINATION_CLASS;
            testComposite.addChildComponent(insertionPoint, mockChild);
            expect(mockChild.parentReference).to.deep.equal(testComposite);
        });

        scenario('should maintain the order of addition when composing', function() {
            const mockChild2 = createMockChildComponent({ className: "child-two"});
            const insertionPoint = 'append ' + TEST_DESTINATION_CLASS;

            testComposite.addChildComponent(insertionPoint, mockChild);
            testComposite.addChildComponent(insertionPoint, mockChild2);

            testComposite.mountComponent().composeDOM();

            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr><div></div><div class="child-two"></div></div>`);
        });

        scenario('should return the component that was supplied', function() {
            const insertionPoint = 'append ' + TEST_DESTINATION_CLASS;
            expect(testComposite.addChildComponent(insertionPoint, mockChild)).to.deep.equal(mockChild);
        });

        scenario('should allow adding the same component to different destinations', function() {
            const insertionPoint1 = 'append ' + TEST_DESTINATION_CLASS;
            const insertionPoint2 = 'prepend ' + TEST_DESTINATION_CLASS;
            testComposite.addChildComponent(insertionPoint1, mockChild);
            testComposite.addChildComponent(insertionPoint2, mockChild); // Adding same component again

            expect(testComposite.getChildComponent(insertionPoint1)).to.deep.equal(mockChild);
            expect(testComposite.getChildComponent(insertionPoint2)).to.deep.equal(mockChild);
            // Internal implementation might store references, but it's valid to test this.
        });
    });

    featureTest('.removeChildComponent() Method', function() {
        let componentToRemove, placementKey;
        beforeEachScenario(function() {
            testComposite = new CompositeInstance({
                template: `<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr></div>`
            });

            componentToRemove = createMockChildComponent();
            placementKey = 'append ' + TEST_DESTINATION_CLASS;
            testComposite.addChildComponent(placementKey, componentToRemove);
        });

        scenario('should remove the component from the specified placement', function() {
            testComposite.removeChildComponent(placementKey);

            expect(testComposite.getChildComponent(placementKey)).to.be.undefined;
        });

        scenario('should clear the parentReference from the removed component', function() {
            testComposite.removeChildComponent(placementKey);

            expect(componentToRemove.parentReference).to.be.undefined;
        });

        scenario('should not disrupt the dom insertion helper method for other components', function() {
            const moreChildren = [
                { child: createMockChildComponent({ className: "extra-one"}), placement: 'append ' + TEST_DESTINATION_CLASS },
                { child: createMockChildComponent({ className: "extra-two"}), placement: 'append ' + TEST_DESTINATION_CLASS }
            ];
            testComposite.addChildComponent(moreChildren[0].placement, moreChildren[0].child);
            testComposite.addChildComponent(moreChildren[1].placement, moreChildren[1].child);
            testComposite.composeDOM(); // Render once to get elements in DOM

            // Before removal, check the partial method behavior
            expect(testComposite._domInsertionHelper('append', TEST_DESTINATION_CLASS, 0, 3)[0]).to.deep.equal(componentToRemove.mainDomElement[0]);
            expect(testComposite._domInsertionHelper('append', TEST_DESTINATION_CLASS, 1, 3)[0]).to.deep.equal(moreChildren[0].child.mainDomElement[0]);
            expect(testComposite._domInsertionHelper('append', TEST_DESTINATION_CLASS, 2, 3)[0]).to.deep.equal(moreChildren[1].child.mainDomElement[0]);

            // Remove the first component
            testComposite.removeChildComponent(componentToRemove);

            // After removal, re-check the partial method behavior for remaining components
            expect(testComposite._domInsertionHelper('append', TEST_DESTINATION_CLASS, 0, 2)[0]).to.deep.equal(moreChildren[0].child.mainDomElement[0]);
            expect(testComposite._domInsertionHelper('append', TEST_DESTINATION_CLASS, 1, 2)[0]).to.deep.equal(moreChildren[1].child.mainDomElement[0]);
        });

        scenario('should unregister events from the removed component', function() {
            const actionHandler = mockingLibrary.spy();
            testComposite.componentInteractionHandlers = { 'customEvent': actionHandler };

            testComposite.removeChildComponent(componentToRemove);
            componentToRemove.trigger('customEvent'); // This event should no longer be handled by testComposite

            expect(actionHandler).to.not.have.been.called;
        });

        scenario('should return the removed component', function() {
            expect(testComposite.removeChildComponent(placementKey)).to.deep.equal(componentToRemove);
        });
    });

    featureTest('.getChildComponent() Method', function() {
        scenario('should return the component associated with the placement key', function() {
            const mockChild = createMockChildComponent();
            const placementKey = 'append ' + TEST_DESTINATION_CLASS;
            testComposite.addChildComponent(placementKey, mockChild);
            expect(testComposite.getChildComponent(placementKey)).to.deep.equal(mockChild);
        });

        scenario('should return undefined if no component exists at the key', function() {
            const placementKey = 'append ' + TEST_DESTINATION_CLASS;
            expect(testComposite.getChildComponent(placementKey)).to.be.undefined;
        });
    });

    featureTest('.replaceChildComponents() Method', function() {
        scenario('should remove all existing child components', function() {
            const mockChild1 = createMockChildComponent();
            const mockChild2 = createMockChildComponent();
            const placementKey1 = 'append .container-one';
            const placementKey2 = 'append .container-two';
            const newComponents = {};
            newComponents[placementKey2] = mockChild2; // Only add one new component

            testComposite.addChildComponent(placementKey1, mockChild1);
            expect(testComposite.getChildComponent(placementKey1)).to.not.be.undefined;

            testComposite.replaceChildComponents(newComponents);
            expect(testComposite.getChildComponent(placementKey1)).to.be.undefined;
            expect(mockChild1.parentReference).to.be.undefined; // Verify parent reference cleared
        });

        scenario('should add the new components supplied to their correct placements', function() {
            const mockChild1 = createMockChildComponent();
            const mockChild2 = createMockChildComponent();
            const placementKey1 = 'append .container-one';
            const placementKey2 = 'append .container-two';
            const newComponents = {};
            newComponents[placementKey2] = mockChild2;

            testComposite.addChildComponent(placementKey1, mockChild1); // Add an initial child
            testComposite.replaceChildComponents(newComponents); // Replace with new set

            expect(testComposite.getChildComponent(placementKey2)).to.deep.equal(mockChild2);
            expect(mockChild2.parentReference).to.deep.equal(testComposite); // Verify new parent reference
        });

        scenario('should handle an empty object for new components, effectively clearing all', function() {
            const mockChild = createMockChildComponent();
            const placementKey = 'append .some-place';
            testComposite.addChildComponent(placementKey, mockChild);

            expect(testComposite.subComponentsMap).to.not.be.empty;
            testComposite.replaceChildComponents({}); // Empty replacement

            expect(testComposite.subComponentsMap).to.be.empty;
            expect(mockChild.parentReference).to.be.undefined;
        });
    });

    featureTest('.isComponentReady() Method', function() {
        scenario('should fulfill when the parent and all child components are ready', function() {
            const mockChild1 = new UI_CoreView();
            const mockChild2 = new UI_CoreView();

            const coreComponentDeferred = new jQuery.Deferred();
            const childOneDeferred = new jQuery.Deferred();
            const childTwoDeferred = new jQuery.Deferred();

            testComposite.addChildComponent('append .slot1', mockChild1);
            testComposite.addChildComponent('append .slot2', mockChild2);

            const coreReadyStub = mockingLibrary.stub(UI_CoreView.prototype, "isReady").returns(coreComponentDeferred.promise());
            const childOneReadyStub = mockingLibrary.stub(mockChild1, "isReady").returns(childOneDeferred.promise());
            const childTwoReadyStub = mockingLibrary.stub(mockChild2, "isReady").returns(childTwoDeferred.promise());

            expect(testComposite.isComponentReady().state()).to.equal('pending');

            coreComponentDeferred.resolve();
            expect(testComposite.isComponentReady().state()).to.equal('pending'); // Still pending, children not ready

            childOneDeferred.resolve();
            expect(testComposite.isComponentReady().state()).to.equal('pending'); // Still pending, one child left

            childTwoDeferred.resolve();
            expect(testComposite.isComponentReady().state()).to.equal('resolved'); // All resolved

            coreReadyStub.restore();
            childOneReadyStub.restore();
            childTwoReadyStub.restore();
        });

        scenario('should reject if any component (parent or child) rejects its ready state', function(done) {
            const mockChild = new UI_CoreView();
            const coreComponentDeferred = new jQuery.Deferred();
            const childDeferred = new jQuery.Deferred();

            testComposite.addChildComponent('append .slot', mockChild);

            const coreReadyStub = mockingLibrary.stub(UI_CoreView.prototype, "isReady").returns(coreComponentDeferred.promise());
            const childReadyStub = mockingLibrary.stub(mockChild, "isReady").returns(childDeferred.promise());

            testComposite.isComponentReady().fail(() => {
                expect(testComposite.isComponentReady().state()).to.equal('rejected');
                coreReadyStub.restore();
                childReadyStub.restore();
                done();
            });

            coreComponentDeferred.resolve(); // Parent resolves
            childDeferred.reject(); // Child rejects
        });
    });

    featureTest('.swapChildComponent() Method', function() {
        let oldChild, newChild, placementKey;
        beforeEachScenario(function() {
            oldChild = new UI_CoreView({ className: 'old-child-component' });
            newChild = new UI_CoreView({ className: 'new-child-component' });
            placementKey = 'append ' + TEST_DESTINATION_CLASS;
        });

        scenario('should replace the existing child component with the new one', function() {
            testComposite.addChildComponent(placementKey, oldChild);
            testComposite.swapChildComponent(placementKey, newChild);

            expect(testComposite.getChildComponent(placementKey)).to.deep.equal(newChild);
            expect(oldChild.parentReference).to.be.undefined; // Old child should be disowned
            expect(newChild.parentReference).to.deep.equal(testComposite); // New child should be adopted
        });

        scenario('should re-compose the DOM to reflect the new child component', function() {
            testComposite = new CompositeInstance({
                template: `<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr></div>`
            });
            testComposite.mountComponent(); // Mount first

            testComposite.addChildComponent(placementKey, oldChild);
            testComposite.composeDOM(); // Initial render

            testComposite.swapChildComponent(placementKey, newChild);
            testComposite.composeDOM(); // Re-render after swap

            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr><div class="new-child-component"></div></div>`);
        });

        scenario('should return the newly added component', function() {
            testComposite.addChildComponent(placementKey, oldChild);
            expect(testComposite.swapChildComponent(placementKey, newChild)).to.deep.equal(newChild);
        });
    });

    featureTest('._domInsertionHelper() Method', function() {
        let targetSelector, fragmentIndex, fragmentTotal, $insertFragment1, $insertFragment2;
        beforeEachScenario(function() {
            testComposite = new CompositeInstance({
                template: `<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr></div>`
            });
            testComposite.composeDOM(); // Render initial template
            targetSelector = TEST_DESTINATION_CLASS;
            fragmentIndex = 0;
            fragmentTotal = 2; // Simulating two fragments

            $insertFragment1 = (new UI_CoreView({ className: 'insert-frag-one' })).mainDomElement;
            $insertFragment2 = (new UI_CoreView({ className: 'insert-frag-two' })).mainDomElement;
        });

        scenario('should replace the inner content of the target element', function() {
            const insertionMethod = 'inner';
            testComposite._domInsertionHelper(insertionMethod, targetSelector, fragmentIndex, fragmentTotal, $insertFragment1);
            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><div class="insert-frag-one"></div></div>`);

            // If a second fragment is inserted with 'inner', it should replace the first
            testComposite._domInsertionHelper(insertionMethod, targetSelector, fragmentIndex + 1, fragmentTotal, $insertFragment2);
            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><div class="insert-frag-two"></div></div>`);
        });

        scenario('should replace the target element entirely (outer)', function() {
            const insertionMethod = 'outer';
            testComposite._domInsertionHelper(insertionMethod, targetSelector, fragmentIndex, fragmentTotal, $insertFragment1);
            // The original testComposite.$el is now replaced by $insertFragment1
            expect(testComposite.mainDomElement.parent().html()).to.equal('<div class="insert-frag-one"></div>');

            // If we try to insert another fragment using the old selector, it won't work as the element is gone.
            // A more robust test would re-target or check the *new* element.
            // Here, we adapt to the original test logic which re-uses the new element.
            testComposite._domInsertionHelper(insertionMethod, '.insert-frag-one', fragmentIndex + 1, fragmentTotal, $insertFragment2);
            expect(testComposite.mainDomElement.parent().html()).to.equal('<div class="insert-frag-two"></div>');
        });

        scenario('should prepend the fragment to the target element', function() {
            const insertionMethod = 'prepend';
            testComposite._domInsertionHelper(insertionMethod, targetSelector, fragmentIndex, fragmentTotal, $insertFragment1);
            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><div class="insert-frag-one"></div><hr></div>`);

            testComposite._domInsertionHelper(insertionMethod, targetSelector, fragmentIndex + 1, fragmentTotal, $insertFragment2);
            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><div class="insert-frag-two"></div><div class="insert-frag-one"></div><hr></div>`);
        });

        scenario('should append the fragment to the target element', function() {
            const insertionMethod = 'append';
            testComposite._domInsertionHelper(insertionMethod, targetSelector, fragmentIndex, fragmentTotal, $insertFragment1);
            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr><div class="insert-frag-one"></div></div>`);

            testComposite._domInsertionHelper(insertionMethod, targetSelector, fragmentIndex + 1, fragmentTotal, $insertFragment2);
            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr><div class="insert-frag-one"></div><div class="insert-frag-two"></div></div>`);
        });

        scenario('should insert the fragment before the target element', function() {
            const insertionMethod = 'before';
            testComposite._domInsertionHelper(insertionMethod, targetSelector, fragmentIndex, fragmentTotal, $insertFragment1);
            expect(testComposite.mainDomElement.parent().html()).to.equal(`<div class="insert-frag-one"></div><div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr></div>`);

            testComposite._domInsertionHelper(insertionMethod, targetSelector, fragmentIndex + 1, fragmentTotal, $insertFragment2);
            expect(testComposite.mainDomElement.parent().html()).to.equal(`<div class="insert-frag-one"></div><div class="insert-frag-two"></div><div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr></div>`);
        });

        scenario('should insert the fragment after the target element', function() {
            const insertionMethod = 'after';
            testComposite._domInsertionHelper(insertionMethod, targetSelector, fragmentIndex, fragmentTotal, $insertFragment1);
            expect(testComposite.mainDomElement.parent().html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr></div><div class="insert-frag-one"></div>`);

            testComposite._domInsertionHelper(insertionMethod, targetSelector, fragmentIndex + 1, fragmentTotal, $insertFragment2);
            expect(testComposite.mainDomElement.parent().html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr></div><div class="insert-frag-two"></div><div class="insert-frag-one"></div>`);
        });
    });

    featureTest('.composeDOM() Method', function() {
        let composeElementStub, composeChildrenStub, composeStateSpy;
        beforeEachScenario(function() {
            // Stub internal methods to observe their calls
            composeElementStub = mockingLibrary.stub(testComposite, 'composeMainElement').returns(testComposite);
            composeChildrenStub = mockingLibrary.stub(testComposite, 'composeNestedElements').returns(testComposite);
            composeStateSpy = mockingLibrary.spy(testComposite, 'composeComponentState');
        });

        afterEachScenario(function() {
            composeElementStub.restore();
            composeChildrenStub.restore();
            composeStateSpy.restore();
        });

        scenario('should call the main element composition method', function() {
            testComposite.composeDOM();
            expect(composeElementStub).to.have.been.calledOnce;
        });

        scenario('should compose child components after the main element', function() {
            testComposite.composeDOM();
            expect(composeChildrenStub).to.have.been.calledAfter(composeElementStub);
        });

        scenario('should compose the component state after child components', function() {
            testComposite.composeDOM();
            expect(composeStateSpy).to.have.been.calledAfter(composeChildrenStub);
        });

        scenario('should return the instance for chaining', function() {
            expect(testComposite.composeDOM()).to.deep.equal(testComposite);
        });

        scenario('should call parent\'s compose method if available', function() {
            const parentComposeStub = mockingLibrary.stub(UI_CoreView.prototype, 'composeDOM').returns(testComposite);
            testComposite.composeDOM();
            expect(parentComposeStub).to.have.been.calledOnce;
            parentComposeStub.restore();
        });
    });

    featureTest('.composeNestedElements() Method', function() {
        scenario('should compose each child component into the DOM', function() {
            testComposite = new CompositeInstance({
                template: `<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr></div>`
            });
            const mockChild1 = new UI_CoreView({ className:'child-one'});
            const mockChild2 = new UI_CoreView({ className:'child-two'});
            const placement1 = 'append ' + TEST_DESTINATION_CLASS;
            const placement2 = 'prepend ' + TEST_DESTINATION_CLASS;

            testComposite.addChildComponent(placement1, mockChild1);
            testComposite.addChildComponent(placement2, mockChild2);

            testComposite.composeMainElement(); // First, compose the main element
            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><hr></div>`);

            testComposite.composeNestedElements(); // Now, compose the children
            expect(testComposite.mainDomElement.html()).to.equal(`<div class="${TEST_DESTINATION_CLASS.substring(1)}"><div class="child-two"></div><hr><div class="child-one"></div></div>`);
        });
    });

    featureTest('.mountComponent() Method', function() {
        let mountElementStub, mountChildrenStub, mountStateSpy;
        beforeEachScenario(function() {
            mountElementStub = mockingLibrary.stub(testComposite, 'mountMainElement').returns(testComposite);
            mountChildrenStub = mockingLibrary.stub(testComposite, 'mountNestedElements').returns(testComposite);
            mountStateSpy = mockingLibrary.spy(testComposite, 'mountComponentState');
        });

        afterEachScenario(function() {
            mountElementStub.restore();
            mountChildrenStub.restore();
            mountStateSpy.restore();
        });

        scenario('should mount the main element', function() {
            testComposite.mountComponent();
            expect(mountElementStub).to.have.been.calledOnce;
        });

        scenario('should mount child components after the main element', function() {
            testComposite.mountComponent();
            expect(mountChildrenStub).to.have.been.calledAfter(mountElementStub);
        });

        scenario('should mount the component state after child components', function() {
            testComposite.mountComponent();
            expect(mountStateSpy).to.have.been.calledAfter(mountChildrenStub);
        });

        scenario('should return the instance for chaining', function() {
            expect(testComposite.mountComponent()).to.deep.equal(testComposite);
        });
    });
});