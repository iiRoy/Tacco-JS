var testSuiteLib = require("chai"),
    domApi = require("jQuery");

var assert = testSuiteLib.expect;

var _dom = globalScope.domApi = domApi;


function constructRatingDropdown() {
    // Create the primary select element for ratings
    _dom('<select />', { 'id': 'score_input', 'name': 'score_input' })
        .appendTo('body');

    // Populate the select element with options from 1 to 10
    for (var loopIndex = 1; loopIndex <= 10; loopIndex++) {
        var optionProps = (loopIndex === 5) ?
            optionProps = { 'value': loopIndex, 'selected': 'selected' } :
            optionProps = { 'value': loopIndex };

        // Append each option with its value and text
        _dom('<option />', optionProps)
            .appendTo('#score_input')
            .html('score-label-' + loopIndex);
    }
}

function dismantleRatingDropdown() {
    // Remove the dynamically created select element
    _dom('#score_input').remove();
}


require("../jq_star_rating"); // Load the custom star rating plugin


describe('star rating plugin initialization with various configurations', function () {

    it('should update default options correctly', function () {
        var RatingWidgetCore;
        RatingWidgetCore = new globalScope.BarRating(); // Instantiate the rating core
        RatingWidgetCore.initialize({
            showValues: false // Override default to hide values
        });
        assert(RatingWidgetCore.configuration).to.be.a('object');
        assert(RatingWidgetCore.configuration.initialRating).to.equal(null);
        assert(RatingWidgetCore.configuration.showValues).to.equal(false);
        assert(RatingWidgetCore.configuration.showSelectedRating).to.equal(true);
        assert(RatingWidgetCore.configuration.reverse).to.equal(false);
        assert(RatingWidgetCore.configuration.readonly).to.equal(false);
    });

});


describe('star rating plugin display functionality', function () {

    before(function () {
        constructRatingDropdown(); // Set up the HTML select element
        _dom('#score_input').barrating('show'); // Activate the rating widget
    });

    after(function () {
        _dom('#score_input').barrating('destroy'); // Deactivate and clean up the widget
        dismantleRatingDropdown(); // Remove the HTML select element
    });

    it('should have associated widget data', function () {
        assert(_dom('#score_input').data('barrating')).to.be.a('object');
    });

    it('should transform the select field into a visible rating widget', function () {
        assert(_dom('.br-widget a')).to.have.length(10);
    });

    it('should store rating values within data attributes', function () {
        assert(_dom('.br-widget a:first').attr('data-rating-value')).to.equal('1');
        assert(_dom('.br-widget a:nth-child(8)').attr('data-rating-value')).to.equal('8');
        assert(_dom('.br-widget a:first').attr('data-rating-text')).to.equal('score-label-1');
        assert(_dom('.br-widget a:nth-child(8)').attr('data-rating-text')).to.equal('score-label-8');
    });

    it('should read the initially selected rating from the select field', function () {
        assert(_dom('#score_input').data('barrating').currentRatingValue).to.equal('5');
        assert(_dom('#score_input').data('barrating').currentRatingText).to.equal('score-label-5');
    });

    it('should apply the correct CSS classes to rating elements', function () {
        assert(_dom('.br-widget a:nth-child(4)').hasClass('br-selected')).to.equal(true);
        assert(_dom('.br-widget a:nth-child(5)').hasClass('br-selected br-current')).to.equal(true);
        assert(_dom('.br-widget a:nth-child(6)').hasClass('br-selected')).to.equal(false);
    });

    it('should append a display division for the current rating', function () {
        assert(_dom('div.br-current-rating')).to.have.length(1);
    });

    it('should display the correct rating text', function () {
        assert(_dom('div.br-current-rating').html()).to.equal(
            _dom('#score_input').data('barrating').currentRatingText
        );
    });

    it('should hide the original select field from view', function () {
        assert(_dom('#score_input').is(":visible")).to.equal(false);
    });

});


describe('star rating plugin display and user selection interaction', function () {

    var callbackValuesStorage = []; // Array to store values passed to the callback

    before(function () {
        constructRatingDropdown();

        _dom('#score_input').barrating('show', {
            onSelect: function (itemValue, itemText) {
                callbackValuesStorage.push(itemValue, itemText);
            }
        });

        _dom('.br-widget a:nth-child(2)').trigger('click'); // Simulate a user clicking the second rating
    });

    after(function () {
        _dom('#score_input').barrating('destroy');
        dismantleRatingDropdown();
    });

    it('should update widget data after selection', function () {
        assert(_dom('#score_input').data('barrating').currentRatingValue).to.equal('2');
        assert(_dom('#score_input').data('barrating').currentRatingText).to.equal('score-label-2');
    });

    it('should set appropriate CSS classes based on selection', function () {
        assert(_dom('.br-widget a:nth-child(1)').hasClass('br-selected')).to.equal(true);
        assert(_dom('.br-widget a:nth-child(2)').hasClass('br-selected br-current')).to.equal(true);
        assert(_dom('.br-widget a:nth-child(3)').hasClass('br-selected')).to.equal(false);
    });

    it('should display the correct rating value', function () {
        assert(_dom('div.br-current-rating').html()).to.equal(
            _dom('#score_input').data('barrating').currentRatingText
        );
    });

    it('should pass accurate values to the selection callback', function () {
        assert(callbackValuesStorage[0]).to.equal('2');
        assert(callbackValuesStorage[1]).to.equal('score-label-2');
    });

});


describe('star rating plugin with reversed order option', function () {

    before(function () {
        constructRatingDropdown();

        _dom('#score_input').barrating('show', {
            reverse: true // Enable reversed rating order
        });
    });

    after(function () {
        _dom('#score_input').barrating('destroy');
        dismantleRatingDropdown();
    });

    it('should set correct classes for reversed display mode', function () {
        assert(_dom('.br-widget a:nth-child(4)').hasClass('br-selected')).to.equal(false);
        assert(_dom('.br-widget a:nth-child(5)').hasClass('br-selected br-current')).to.equal(true);
        assert(_dom('.br-widget a:nth-child(6)').hasClass('br-selected')).to.equal(true);
    });

});


describe('star rating plugin in read-only state', function () {

    before(function () {
        constructRatingDropdown();

        _dom('#score_input').barrating('show', {
            readonly: true // Activate read-only mode
        });

        _dom('.br-widget a:nth-child(6)').trigger('click'); // Attempt to change rating while read-only
    });

    after(function () {
        _dom('#score_input').barrating('destroy');
        dismantleRatingDropdown();
    });

    it('should maintain correct classes when in read-only mode', function () {
        assert(_dom('.br-widget a:nth-child(4)').hasClass('br-selected')).to.equal(true);
        assert(_dom('.br-widget a:nth-child(5)').hasClass('br-selected br-current')).to.equal(true);
        assert(_dom('.br-widget a:nth-child(6)').hasClass('br-selected')).to.equal(false);
    });

    it('should ignore any user input attempts', function () {
        assert(_dom('#score_input').data('barrating').currentRatingValue).to.equal('5');
        assert(_dom('#score_input').data('barrating').currentRatingText).to.equal('score-label-5');
    });

});


describe('star rating plugin on deselect operation', function () {

    before(function () {
        constructRatingDropdown();

        // Prepend an empty option to allow deselection functionality
        _dom('#score_input').prepend(_dom('<option />', { 'value': '' }));
        _dom('#score_input').barrating('show');

        // Execute deselecting the current rating
        _dom('.br-widget a:nth-child(5)').trigger('click');
    });

    after(function () {
        _dom('#score_input').barrating('destroy');
        dismantleRatingDropdown();
    });

    it('should update data indicating deselection is possible', function () {
        assert(_dom('#score_input').data('barrating').deselectable).to.equal(true);
    });

    it('should successfully clear the current rating selection', function () {
        assert(_dom('#score_input').data('barrating').currentRatingValue).to.equal('');
        assert(_dom('#score_input').data('barrating').currentRatingText).to.equal('');
    });

});


describe('star rating plugin on clear action', function () {

    var callbackValuesStorage = [];

    before(function () {
        constructRatingDropdown();

        _dom('#score_input').barrating('show', {
            onClear: function (itemValue, itemText) {
                callbackValuesStorage.push(itemValue, itemText);
            }
        });
        _dom('.br-widget a:nth-child(6)').trigger('click'); // Select a new rating
        _dom('#score_input').barrating('clear'); // Then clear it
    });

    after(function () {
        _dom('#score_input').barrating('destroy');
        dismantleRatingDropdown();
    });

    it('should restore the original rating state', function () {
        assert(_dom('#score_input').data('barrating').currentRatingValue).to.equal('5');
        assert(_dom('#score_input').data('barrating').currentRatingText).to.equal('score-label-5');
    });

    it('should set appropriate CSS classes after clearing', function () {
        assert(_dom('.br-widget a:nth-child(4)').hasClass('br-selected')).to.equal(true);
        assert(_dom('.br-widget a:nth-child(5)').hasClass('br-selected br-current')).to.equal(true);
        assert(_dom('.br-widget a:nth-child(6)').hasClass('br-selected')).to.equal(false);
    });

    it('should pass correct values to the clear callback', function () {
        assert(callbackValuesStorage[0]).to.equal('5');
        assert(callbackValuesStorage[1]).to.equal('score-label-5');
    });

});


describe('star rating plugin on widget destruction', function () {

    var callbackValuesStorage = [];

    before(function () {
        constructRatingDropdown();

        _dom('#score_input').barrating('show', {
            onDestroy: function (itemValue, itemText) {
                callbackValuesStorage.push(itemValue, itemText);
            }
        });

        _dom('#score_input').barrating('destroy'); // Call the destroy method
    });

    after(function () {
        dismantleRatingDropdown(); // Ensure HTML is cleaned up
    });

    it('should remove all associated widget data', function () {
        assert(_dom('#score_input').data('barrating')).to.equal('');
    });

    it('should make the original select field visible again', function () {
        assert(_dom('#score_input').is(":visible")).to.equal(true);
    });

    it('should pass correct values to the destroy callback', function () {
        assert(callbackValuesStorage[0]).to.equal('5');
        assert(callbackValuesStorage[1]).to.equal('score-label-5');
    });

});


describe('star rating plugin on assigning a specific value', function () {

    before(function () {
        constructRatingDropdown();
        _dom('#score_input')
            .barrating() // Initialize the widget
            .barrating('set', 3); // Programmatically set rating to 3
    });

    after(function () {
        dismantleRatingDropdown();
    });

    it('should set the correct internal value', function () {
        assert(_dom('#score_input').data('barrating').currentRatingValue).to.equal(3);
        assert(_dom('#score_input').data('barrating').currentRatingText).to.equal('score-label-3');
    });

    it('should apply the correct CSS class for the assigned value', function () {
        assert(_dom('.br-widget a:nth-child(3)').hasClass('br-selected')).to.equal(true);
        assert(_dom('.br-widget a:nth-child(3)').hasClass('br-current')).to.equal(true);
    });

});


describe('star rating plugin on attempting to set a non-existent value', function () {

    before(function () {
        constructRatingDropdown();
        _dom('#score_input')
            .barrating('show', { initialRating: 5 }) // Display with an initial rating
            .barrating('set', 9999); // Attempt to set an invalid rating
    });

    after(function () {
        dismantleRatingDropdown();
    });

    it('should not alter the current rating', function () {
        assert(_dom('#score_input').data('barrating').currentRatingValue).to.equal('5');
        assert(_dom('#score_input').data('barrating').currentRatingText).to.equal('score-label-5');
    });

});