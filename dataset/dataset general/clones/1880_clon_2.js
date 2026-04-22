// Test harness for animation utilities
// This file validates the functionality of our animation library components.

'use strict';

var adjustStyleTransform = require('../src/normalize-transform-value')
  , standardizeTimeCurve = require('../src/normalize-timing-function')
  , Animato = require('..')
  , PromiseLib = require('q')
  , vendorPrefixer = require('vendor-prefix')
  , assert = require('expect.js')
  , testContainerEl = document.getElementById('test'); // Main test display area

PromiseLib.longStackSupport = true; // Enable extended stack traces for promises

/**
 * Creates a new square DOM element for testing.
 * @param {string} elementId - The ID to assign to the new element.
 * @returns {HTMLElement} The newly created div element.
 */
function makeBoxElement(elementId) {
    var domElem = document.createElement("div"); // Create a new div element
    domElem.id = elementId;
    domElem.style.width = "100px";
    domElem.style.height = "100px";
    domElem.style.backgroundColor = "red"; // Default color
    testContainerEl.appendChild(domElem); // Add to the test container
    return domElem;
};

/*
 * Removes a square DOM element by its ID from the test container.
 * @param {string} elementId - The ID of the element to remove.
 */
function deleteBoxElement(elementId) {
    testContainerEl.removeChild(document.getElementById(elementId));
};

// Helper functions for test setup and teardown
function prepareBoxOne() { return makeBoxElement("test-one"); }
function cleanupBoxOne(returnValue) { deleteBoxElement("test-one"); return returnValue; }

function prepareBoxTwo() { return makeBoxElement("test-two"); }
function cleanupBoxTwo(returnValue) { deleteBoxElement("test-two"); return returnValue; }


describe('adjustStyleTransform', function () {
    it('should convert `translate3d(0px ,0, 0  )` to `translate3d(0,0,0)`', function () {
        assert(adjustStyleTransform('translate3d(0px ,0, 0  )')).to.eql('translate3d(0,0,0)');
    });

    it('should normalize complex transform strings', function () {
        assert(adjustStyleTransform('translate3d(0px ,200px, 0  )  rotateY(280deg)        translate3d( 0 , 0,30px)')).to.eql('translate3d(0,200px,0) rotateY(280deg) translate3d(0,0,30px)');
    });

    it('should return an empty string for no arguments', function () {
        assert(adjustStyleTransform()).to.eql('');
    });

    it('should pass through simple color names', function () {
        assert(adjustStyleTransform('red')).to.eql('red');
    });

    it('should pass through hex color codes', function () {
        assert(adjustStyleTransform('#1ABC9C')).to.eql('#1ABC9C');
    });

    it('should normalize rgba color values', function () {
        assert(adjustStyleTransform('rgba(25, 25, 25, .5)')).to.eql('rgba(25,25,25,0.5)');
    });

    it('should convert hsl to rgb color values', function () {
        assert(adjustStyleTransform('hsl(125, 25%, 10%)')).to.eql('rgb(19,32,20)');
    });

    it('should convert hsla to rgba color values', function () {
        assert(adjustStyleTransform('hsla(200, 35%, 90%, .5)')).to.eql('rgba(221,232,238,0.5)');
    });
});


describe('standardizeTimeCurve', function () {
    it('should return "linear" when given "linear"', function () {
        assert(standardizeTimeCurve('linear')).to.eql('linear');
    });

    it('should normalize cubic-bezier values with mixed spacing', function () {
        assert(standardizeTimeCurve('cubic-bezier(0.17, .67, .83, .67)')).to.eql('cubic-bezier(0.17,0.67,0.83,0.67)');
    });

    it('should normalize cubic-bezier values with leading decimals', function () {
        assert(standardizeTimeCurve('cubic-bezier(.17, .67 , .83, .67 )')).to.eql('cubic-bezier(0.17,0.67,0.83,0.67)');
    });
});


describe('Animato', function () {

    it('should reject if no valid DOM element is provided', function () {
        return Animato('Invalid Input')
            .fail(function (errorObject) {
                assert(errorObject).to.be.a(Error);
            });
    });

    it('should succeed with a direct DOM element', function () {
        var domElem = prepareBoxOne();

        return Animato(domElem)
            .then(function (resultElem) {
                assert(resultElem).to.be.a(window.Element);
                cleanupBoxOne();
            });
    });

    it('should succeed with a promise resolving to a DOM element', function () {
        var domElem = prepareBoxOne()
          , deferredObject = PromiseLib.defer();

        setTimeout(function () {
            deferredObject.resolve(domElem);
        }, 200); // Simulate an async operation

        return Animato(deferredObject.promise)
            .then(function (resolvedValue) {
                assert(resolvedValue).to.eql(domElem);
                cleanupBoxOne();
            });
    });

    it('should fail if promise resolves to a non-DOM element (e.g., a number)', function () {
        return Animato(PromiseLib(1))
            .fail(function (errorObject) {
                return assert(errorObject).to.be.a(Error);
            });
    });

    it('should successfully apply a style property to an element', function () {
        var domElem = prepareBoxOne();

        return Animato(domElem).then(Animato.f('opacity', 0)).then(function (resultElem) {
            assert(resultElem.style.opacity).to.eql("0");
            cleanupBoxOne();
        });
    });

    it('should successfully apply a style to an element wrapped in a resolved promise', function () {
        var domElem = prepareBoxOne();

        return Animato(PromiseLib.resolve(domElem), 'opacity', 0).then(function (resultElem) {
            assert(resultElem.style.opacity).to.eql("0");
            cleanupBoxOne();
        });
    });

    it('should handle transitioning element width from 100px to 300px over 400ms with ease-in-out', function() {
        var domElem = prepareBoxOne();

        return PromiseLib.delay(200).then(function () { // Introduce a small delay before starting transition

            assert(domElem.style.width).to.eql('100px');

            return Animato(domElem, "width", "300px", 400, "ease-in-out")
                .then(function (finishedElem) {
                    assert(finishedElem.style.width).to.eql('300px');
                    cleanupBoxOne();
                });
        });
    });

    it('should handle concurrent transitions for width and height of an element', function() {
        var domElem = prepareBoxOne();

        assert(domElem.style.width).to.eql('100px');
        assert(domElem.style.height).to.eql('100px');

        return  PromiseLib.allSettled([
                Animato(domElem, "width", "300px", 400, "ease-in-out"),
                Animato(domElem, "height", "300px", 400, "ease-in-out")
            ])
            .then(function (elementsResult) {
                assert(elementsResult[0].value.style.width).to.eql('300px');
                assert(elementsResult[0].value.style.height).to.eql('300px');
                cleanupBoxOne();
            });
    });

    it('should succeed with chained transitions across two distinct elements', function () {
        var elemA = prepareBoxOne()
          , elemB = prepareBoxTwo()
          , tearDown = function (finalResult) {
                cleanupBoxOne();
                return cleanupBoxTwo(finalResult);
            };

       return Animato(elemA, "transform", "translate(200px, 0)", 300)
            .then(function () {
                assert(adjustStyleTransform(elemA.style[vendorPrefixer('transform')])).to.be.eql('translate(200px,0)');
                return Animato(elemB, "transform", "translate(0, 200px)", 100);
            })
            .then(function (resultElem) {
                assert(adjustStyleTransform(resultElem.style[vendorPrefixer('transform')])).to.be.eql('translate(0,200px)');
                tearDown();
            });
    });

    it('should fail when invoked with a non-DOM element for a transition', function () {
        return Animato("Not a DOM element", "opacity", 1, 100)
            .fail(function (errorObject) {
                return assert(errorObject).to.be.a(Error);
            });
    });

    it('should fail if an invalid transition property is used', function () {
        var domElem = prepareBoxOne();

        return Animato(domElem, "invalidProperty", "test", 100)
            .fail(function (errorObject) {
                cleanupBoxOne();
                return assert(errorObject).to.be.a(Error);
            });
    });

    it('should fail if an incorrect time value is supplied', function () {
        var domElem = prepareBoxOne();

        return Animato(domElem, "opacity", 0.5, "bogusTime", "linear")
            .fail(function (errorObject) {
                cleanupBoxOne();
                return assert(errorObject).to.be.a(Error);
            });
    });

    it('should successfully set the transform CSS property to `translate(200px, 0)`', function () {
        var domElem = prepareBoxOne();
        return Animato(domElem, "transform", "translate(200px, 0)").then(cleanupBoxOne);
    });

    it('should successfully transition background color to hsla(200, 35%, 90%, .5)', function () {
        var domElem = prepareBoxOne();
        return Animato(domElem, "background-color", "hsla(200, 35%, 90%, .5)", 200, 'ease-in-out').then(cleanupBoxOne);
    });

    it('should successfully transition background color to rgba(19, 32, 20, 0.5)', function () {
        var domElem = prepareBoxOne();
        return Animato(domElem, "background-color", "rgba(19, 32, 20, 0.5)", 200, 'ease-in-out').then(cleanupBoxOne);
    });
});


describe('Animato.f', function () {

    it('should successfully transition element opacity from 1 to 0 over 200ms', function () {
        var domElem = prepareBoxOne();

        return Animato(domElem)
            .then(Animato.f("opacity", 0, 200))
            .then(cleanupBoxOne);
    });

    it('should fail when attempting a transition on the "display" CSS property', function () {
        var domElem = prepareBoxOne();

        return Animato(domElem)
            .then(Animato.f("display", 1, 100))
            .fail(function (errorObject) {
                cleanupBoxOne();
                return assert(errorObject).to.be.a(Error);
            });
    });

    it('should successfully transition element transform from nothing to `translate(200px, 0)` over 200ms', function () {
        var domElem = prepareBoxOne();

        return Animato(domElem)
            .then(Animato.f("transform", "translate(200px, 0)", 200))
            .then(cleanupBoxOne);
    });

    it('should successfully transition background-color from red to blue over 200ms', function () {
        var domElem = prepareBoxOne();

        return Animato(domElem)
            .then(Animato.f('background-color', 'blue', 200))
            .then(cleanupBoxOne);
    });

    it('should fail the first call if two transitions for the same property are initiated too close', function () {
        var domElem = prepareBoxOne()
          , animationOne = Animato.f("transform", "translate(200px, 0)", 400)
          , animationTwo = Animato.f("transform", "translate(100px, 300px)", 100);

        Animato(domElem).delay(100).then(animationTwo).fail(function () { /* expected failure */ });

        return Animato(domElem)
            .then(animationOne)
            .fail(function (errorObject) {
                cleanupBoxOne();
                return assert(errorObject).to.be.a(Error);
            });
    });

    it('should succeed when a new transition is called on an element already animating with the same property', function () {
        var domElem = prepareBoxOne()
          , animationOne = Animato.f("transform", "translate(200px, 0)", 400)
          , animationTwo = Animato.f("transform", "translate(100px, 300px)", 100);

        Animato(domElem).then(animationOne).fail(function () { /* expected failure */ });

        return Animato(domElem)
            .delay(100)
            .then(animationTwo)
            .then(cleanupBoxOne);
    });

    it('should apply a direct CSS transform to an element currently in an Animato transition', function () {
        var domElem = prepareBoxOne();

        Animato(domElem).then(Animato.f("transform", "translate(200px, 0)", 400)).fail(function () { /* expected failure */ });

        return Animato(domElem, "transform", "translate(00px, 200px)")
            .then(cleanupBoxOne);
    });

    it('should fail a transition if a direct transform with the same property occurs during its animation', function () {
        var domElem = prepareBoxOne();

        Animato(domElem).delay(300).then(Animato.f("transform", "translate(00px, 200px)")).fail(function () { /* expected failure */ });

        return Animato(domElem)
            .then(Animato.f("transform", "translate(200px, 0)", 400))
            .fail(function (errorObject) {
                cleanupBoxOne();
                return assert(errorObject).to.be.a(Error);
            });
    });

    it('should successfully apply four sequential opacity transitions on the same element', function () {
        this.timeout(5000); // Increase timeout for sequential animations

        var domElem = prepareBoxOne()
          , animationStep = Animato.f("opacity", 0, 200)
          , resetOpacity = function (elemParam) {
                elemParam.style.opacity = 1;
                return elemParam;
            };

        return Animato(domElem)
            .then(animationStep)
            .then(resetOpacity)
            .then(animationStep)
            .then(resetOpacity)
            .then(animationStep)
            .then(resetOpacity)
            .then(animationStep)
            .then(cleanupBoxOne);
    });

    it('should successfully apply four sequential transform transitions on the same element', function () {

        this.timeout(5000); // Increase timeout for sequential animations

        var domElem = prepareBoxOne()
          , moveForward = Animato.f("transform", "translate(200px, 0)", 500)
          , moveBack = Animato.f("transform", "translate(0,0)");

        return Animato(domElem)
            .then(moveForward)
            .then(moveBack)
            .then(moveForward)
            .then(moveBack)
            .then(moveForward)
            .then(moveBack)
            .then(moveForward)
            .then(cleanupBoxOne);
    });

});


// Global test reporting setup for Mocha
window.onload = function () {
    var testRunner = mocha.run();
    var failedOutcomes = []; // Array to store details of failed tests

    testRunner.on('end', function(){
        window.mochaResults = testRunner.stats;
        window.mochaResults.reports = failedOutcomes;
    });

    testRunner.on('fail', recordFailure);

    /**
     * Records details of a failed test.
     * @param {object} currentTest - The test object from Mocha.
     * @param {Error} errorObject - The error associated with the failure.
     */
    function recordFailure(currentTest, errorObject){

        var extractTitles = function(testItem){
            var titlePath = [];
            while (testItem.parent && testItem.parent.title){ // Ensure parent and its title exist
                titlePath.push(testItem.parent.title);
                testItem = testItem.parent;
            }
            return titlePath.reverse();
        };

        failedOutcomes.push({
            name: currentTest.title,
            result: false,
            message: errorObject.message,
            stack: errorObject.stack,
            titles: extractTitles(currentTest)
        });
    }
};