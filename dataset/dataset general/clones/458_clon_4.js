const assertionLibrary = require("chai");
const domLibrary = require("jQuery");

const assertThat = assertionLibrary.expect;

// Ensure global jQuery is set for the plugin, and use a distinct local alias
const domElementSelector = global.jQuery = domLibrary;

const buildSelectionComponent = () => {
    const selectionRoot = domElementSelector('<select />', { 'id': 'scoreComponent', 'name': 'scoreComponent' });
    selectionRoot.appendTo('body');

    // Functional approach to create options
    Array.from({ length: 10 }, (_, index) => index + 1)
        .map(currentValue => {
            const optionSettings = { 'value': currentValue };
            if (currentValue === 5) {
                optionSettings['selected'] = 'selected';
            }
            return domElementSelector('<option />', optionSettings).html(`score-descriptor-${currentValue}`);
        })
        .forEach(optionElement => optionElement.appendTo('#scoreComponent'));
};

const dismantleSelectionComponent = () => {
    domElementSelector('#scoreComponent').remove();
};

require("../jquery.barrating");

describe('bar rating plugin on init with custom options', function () {

    it('should update defaults', function () {
        let RatingSystemInstance;
        RatingSystemInstance = new global.BarRating();
        RatingSystemInstance.init({
            showValues: false
        });
        assertThat(RatingSystemInstance.options).to.be.a('object');
        assertThat(RatingSystemInstance.options.initialRating).to.equal(null);
        assertThat(RatingSystemInstance.options.showValues).to.equal(false);
        assertThat(RatingSystemInstance.options.showSelectedRating).to.equal(true);
        assertThat(RatingSystemInstance.options.reverse).to.equal(false);
        assertThat(RatingSystemInstance.options.readonly).to.equal(false);
    });

});

describe('bar rating plugin on show', function () {

    before(function () {
        buildSelectionComponent();
        domElementSelector('#scoreComponent').barrating('show');
    });

    after(function () {
        domElementSelector('#scoreComponent').barrating('destroy');
        dismantleSelectionComponent();
    });

    it('should have data', function () {
        assertThat(domElementSelector('#scoreComponent').data('barrating')).to.be.a('object');
    });

    it('should transform the select field into a rating widget', function () {
        assertThat(domElementSelector('.br-widget a')).to.have.length(10);
    });

    it('should store rating values in data attributes', function () {
        assertThat(domElementSelector('.br-widget a:first').attr('data-rating-value')).to.equal('1');
        assertThat(domElementSelector('.br-widget a:nth-child(8)').attr('data-rating-value')).to.equal('8');
        assertThat(domElementSelector('.br-widget a:first').attr('data-rating-text')).to.equal('score-descriptor-1');
        assertThat(domElementSelector('.br-widget a:nth-child(8)').attr('data-rating-text')).to.equal('score-descriptor-8');
    });

    it('should read the selected rating from the select field', function () {
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingValue).to.equal('5');
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingText).to.equal('score-descriptor-5');
    });

    it('should set correct class', function () {
        assertThat(domElementSelector('.br-widget a:nth-child(4)').hasClass('br-selected')).to.equal(true);
        assertThat(domElementSelector('.br-widget a:nth-child(5)').hasClass('br-selected br-current')).to.equal(true);
        assertThat(domElementSelector('.br-widget a:nth-child(6)').hasClass('br-selected')).to.equal(false);
    });

    it('should append a rating div', function () {
        assertThat(domElementSelector('div.br-current-rating')).to.have.length(1);
    });

    it('should display a correct rating', function () {
        assertThat(domElementSelector('div.br-current-rating').html()).to.equal(
            domElementSelector('#scoreComponent').data('barrating').currentRatingText
        );
    });

    it('should hide the select field', function () {
        assertThat(domElementSelector('#scoreComponent').is(":visible")).to.equal(false);
    });

});

describe('bar rating plugin on show and rating selected', function () {

    let callbackEventData = [];

    before(function () {
        buildSelectionComponent();

        domElementSelector('#scoreComponent').barrating('show', {
            onSelect:function (value, text) {
                callbackEventData.push(value, text);
            }
        });

        domElementSelector('.br-widget a:nth-child(2)').trigger('click');
    });

    after(function () {
        domElementSelector('#scoreComponent').barrating('destroy');
        dismantleSelectionComponent();
    });

    it('should update data', function () {
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingValue).to.equal('2');
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingText).to.equal('score-descriptor-2');
    });

    it('should set correct class', function () {
        assertThat(domElementSelector('.br-widget a:nth-child(1)').hasClass('br-selected')).to.equal(true);
        assertThat(domElementSelector('.br-widget a:nth-child(2)').hasClass('br-selected br-current')).to.equal(true);
        assertThat(domElementSelector('.br-widget a:nth-child(3)').hasClass('br-selected')).to.equal(false);
    });

    it('should display a correct rating', function () {
        assertThat(domElementSelector('div.br-current-rating').html()).to.equal(
            domElementSelector('#scoreComponent').data('barrating').currentRatingText
        );
    });

    it('should pass correct values to a callback', function () {
        assertThat(callbackEventData[0]).to.equal('2');
        assertThat(callbackEventData[1]).to.equal('score-descriptor-2');
    });

});

describe('bar rating plugin reversed', function () {

    before(function () {
        buildSelectionComponent();

        domElementSelector('#scoreComponent').barrating('show', {
            reverse:true
        });
    });

    after(function () {
        domElementSelector('#scoreComponent').barrating('destroy');
        dismantleSelectionComponent();
    });

    it('should set correct class', function () {
        assertThat(domElementSelector('.br-widget a:nth-child(4)').hasClass('br-selected')).to.equal(false);
        assertThat(domElementSelector('.br-widget a:nth-child(5)').hasClass('br-selected br-current')).to.equal(true);
        assertThat(domElementSelector('.br-widget a:nth-child(6)').hasClass('br-selected')).to.equal(true);
    });

});

describe('bar rating plugin read-only', function () {

    before(function () {
        buildSelectionComponent();

        domElementSelector('#scoreComponent').barrating('show', {
            readonly:true
        });

        domElementSelector('.br-widget a:nth-child(6)').trigger('click');
    });

    after(function () {
        domElementSelector('#scoreComponent').barrating('destroy');
        dismantleSelectionComponent();
    });

    it('should set correct class', function () {
        assertThat(domElementSelector('.br-widget a:nth-child(4)').hasClass('br-selected')).to.equal(true);
        assertThat(domElementSelector('.br-widget a:nth-child(5)').hasClass('br-selected br-current')).to.equal(true);
        assertThat(domElementSelector('.br-widget a:nth-child(6)').hasClass('br-selected')).to.equal(false);
    });

    it('should ignore user input', function () {
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingValue).to.equal('5');
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingText).to.equal('score-descriptor-5');
    });

});

describe('bar rating plugin on deselect', function () {

    before(function () {
        buildSelectionComponent();

        // prepend empty OPTION to test deselectable ratings
        domElementSelector('#scoreComponent').prepend(domElementSelector('<option />', { 'value':'' }));
        domElementSelector('#scoreComponent').barrating('show');

        // deselect rating
        domElementSelector('.br-widget a:nth-child(5)').trigger('click');
    });

    after(function () {
        domElementSelector('#scoreComponent').barrating('destroy');
        dismantleSelectionComponent();
    });

    it('should update data', function () {
        assertThat(domElementSelector('#scoreComponent').data('barrating').deselectable).to.equal(true);
    });

    it('should successfully deselect rating', function () {
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingValue).to.equal('');
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingText).to.equal('');
    });

});

describe('bar rating plugin on clear', function () {

    let callbackEventData = [];

    before(function () {
        buildSelectionComponent();

        domElementSelector('#scoreComponent').barrating('show', {
            onClear:function (value, text) {
                callbackEventData.push(value, text);
            }
        });
        domElementSelector('.br-widget a:nth-child(6)').trigger('click');
        domElementSelector('#scoreComponent').barrating('clear');
    });

    after(function () {
        domElementSelector('#scoreComponent').barrating('destroy');
        dismantleSelectionComponent();
    });

    it('should restore original rating', function () {
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingValue).to.equal('5');
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingText).to.equal('score-descriptor-5');
    });

    it('should set correct class', function () {
        assertThat(domElementSelector('.br-widget a:nth-child(4)').hasClass('br-selected')).to.equal(true);
        assertThat(domElementSelector('.br-widget a:nth-child(5)').hasClass('br-selected br-current')).to.equal(true);
        assertThat(domElementSelector('.br-widget a:nth-child(6)').hasClass('br-selected')).to.equal(false);
    });

    it('should pass correct values to a callback', function () {
        assertThat(callbackEventData[0]).to.equal('5');
        assertThat(callbackEventData[1]).to.equal('score-descriptor-5');
    });

});

describe('bar rating plugin on destroy', function () {

    let callbackEventData = [];

    before(function () {
        buildSelectionComponent();

        domElementSelector('#scoreComponent').barrating('show', {
            onDestroy:function (value, text) {
                callbackEventData.push(value, text);
            }
        });

        domElementSelector('#scoreComponent').barrating('destroy');

    });

    after(function () {
        dismantleSelectionComponent();
    });

    it('should remove data', function () {
        assertThat(domElementSelector('#scoreComponent').data('barrating')).to.equal('');
    });

    it('should show the select field back again', function () {
        assertThat(domElementSelector('#scoreComponent').is(":visible")).to.equal(true);
    });

    it('should pass correct values to a callback', function () {
        assertThat(callbackEventData[0]).to.equal('5');
        assertThat(callbackEventData[1]).to.equal('score-descriptor-5');
    });

});

describe('bar rating plugin on set value', function () {

    before(function () {
        buildSelectionComponent();
        domElementSelector('#scoreComponent')
            .barrating()
            .barrating('set', 3);
    });

    after(function () {
        dismantleSelectionComponent();
    });

    it('should set correct value', function () {
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingValue).to.equal(3);
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingText).to.equal('score-descriptor-3');
    });

    it('should set correct class', function () {
        assertThat(domElementSelector('.br-widget a:nth-child(3)').hasClass('br-selected')).to.equal(true);
        assertThat(domElementSelector('.br-widget a:nth-child(3)').hasClass('br-current')).to.equal(true);
    });

});

describe('bar rating plugin on set non-existing value', function () {

    before(function () {
        buildSelectionComponent();
        domElementSelector('#scoreComponent')
            .barrating('show', { initialRating: 5 })
            .barrating('set', 9999);
    });

    after(function () {
        dismantleSelectionComponent();
    });

    it('should do nothing', function () {
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingValue).to.equal('5');
        assertThat(domElementSelector('#scoreComponent').data('barrating').currentRatingText).to.equal('score-descriptor-5');
    });

});