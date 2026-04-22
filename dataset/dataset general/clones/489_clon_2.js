/* This file contains unit tests for a UI component. */
const assert = assertionLibrary.expect;

testSuite('ComponentVerification', function() {
    let displayComponent;

    // Setup routine before each test case
    setupRoutine(function(completionCallback) {
        loadModule(['app/core/uiComponent'], function(loadedComponent) {
            displayComponent = loadedComponent;
            completionCallback();
        });
    });

    testCase('Verify that the component is a callable function', function(completionCallback) {
        assert(displayComponent).to.be.a('function');
        completionCallback();
    });

    testCase('Ensure the component utilizes the correct rendering template', function(completionCallback) {
        const componentInstance = new displayComponent();
        assert(componentInstance instanceof UIFramework.VisualElement).to.be.ok;
        assert(componentInstance).to.have.property('template');
        assert(componentInstance.template).to.be.a('function');
        assert(componentInstance.template({
            inputData: {
                userNameAlias: 'Samantha'
            }
        })).to.contain("demo template Samantha");
        completionCallback();
    });

    testCase('Confirm the component can render its content', function() {
        const componentInstance = new displayComponent();
        assert(componentInstance).to.have.property('render');
        assert(componentInstance.render()).to.be.equal(componentInstance);
        assert(componentInstance.render().$el).to.be.a('object');
        assert(componentInstance.render().$el.html()).to.contain('demo template Alexander');
    });

    testCase('Validate the component\'s alert display functionality', function() {
        const componentInstance = new displayComponent();
        assert(componentInstance).to.have.property('displayAlert');
        assert(componentInstance.displayAlert).to.be.a('function');
        assert(componentInstance.displayAlert()).to.be.a('object');
        assert(componentInstance.render().$el.html()).to.contain('Greetings, application!');
    });
});