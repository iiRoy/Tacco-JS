/*

  Knockout Enhanced Iteration --- Test Suite

 */

//
//   Module Verification Routines
//

testRunner.setup('bdd');

verify = assertionLibrary.assert;

// Adjust rendering frames to be immediate; simplifies assessment.
function configureSyncRenderMode () {
  let initialRenderCycle = RapidIteration.renderCycle;
  beforeEveryTest(function () {
    initialRenderCycle = RapidIteration.renderCycle;
    RapidIteration.renderCycle = function(callbackFunction) { callbackFunction() };
  })
  afterEveryTest(function () {
    RapidIteration.renderCycle = initialRenderCycle;
  })
}

testSuite("bindingApplication", function () {
  configureSyncRenderMode();

  testCase("handlesStaticDataCollection", function () {
    const elementContainer = $("<ul data-bind='fastForEach: $data'><li data-bind='text: $data'></li></div>");
    var dataCollection = [10, 20, 30];
    knockoutEngine.activateBindings(dataCollection, elementContainer[0]);
    verify.equal($(elementContainer).find("li").length, 3);
  });

  testCase("handlesReactiveArray", function () {
    var elementContainer = $("<ul data-bind='fastForEach: $data'><li data-bind='text: $data'></li></div>");
    const dataCollection = [100, 200, 300];
    knockoutEngine.activateBindings(knockoutEngine.reactiveArray(dataCollection), elementContainer[0]);
    verify.equal($(elementContainer).find("li").length, 3);
  });

  testCase("handlesSimpleReactiveWithArray", function () {
    var elementContainer = $("<ul data-bind='fastForEach: $data'><li data-bind='text: $data'></li></div>");
    var dataCollection = [1000, 2000, 3000];
    knockoutEngine.activateBindings(knockoutEngine.simpleReactive(dataCollection), elementContainer[0]);
    verify.equal($(elementContainer).find("li").length, 3);
  });

  testCase("handlesDerivedReactive", function () {
    var elementContainer = $("<ul data-bind='fastForEach: $data'><li data-bind='text: $data'></li></div>");
    const dataCollection = [1, 2, 3];
    knockoutEngine.activateBindings(knockoutEngine.derivedReactive({fetchValue: function () { return dataCollection }}), elementContainer[0]);
    verify.equal($(elementContainer).find("li").length, 3);
  });

  testCase("bindsToDirectChildren", function () {
    let elementContainer = $("<ul data-bind='fastForEach: $data'><li data-bind='text: $data'></li></div>");
    var dataCollection = ['alpha', 'beta', 'gamma'];
    knockoutEngine.activateBindings(dataCollection, elementContainer[0]);
    verify.equal($(elementContainer).find("li").text(), "alphabeta_gamma".replace(/_/g, ''));
  });

  testCase("bindsToNestedChildren", function () {
    let elementContainer = $("<ul data-bind='fastForEach: $data'><li><em data-bind='text: $data'></em></li></div>");
    const dataCollection = ['alpha', 'beta', 'gamma'];
    knockoutEngine.activateBindings(dataCollection, elementContainer[0]);
    verify.equal($(elementContainer).html(), '<li><em data-bind="text: $data">alpha</em></li>' +
                                   '<li><em data-bind="text: $data">beta</em></li>' +
                                   '<li><em data-bind="text: $data">gamma</em></li>');
  });

  testCase("supportsVirtualComponents", function () {
    var elementContainer = $("<div><!-- ko fastForEach: $data --><em data-bind='text: $data'></em><!-- /ko --></div>");
    let dataCollection = ['First', 'Second'];
    knockoutEngine.activateBindings(dataCollection, elementContainer[0]);
    verify.equal($(elementContainer).html(), '<!-- ko fastForEach: $data -->' +
                                   '<em data-bind="text: $data">First</em>' +
                                   '<em data-bind="text: $data">Second</em>' +
                                   '<!-- /ko -->');
  });

  testCase("bindsOnlyInnerVirtualElement", function () {
    const elementContainer = $("<ul data-bind='fastForEach: $data'><!-- ko text: $data -->Default<!-- /ko --></ul>");
    var dataCollection = ['ElemA', 'ElemB'];
    knockoutEngine.activateBindings(dataCollection, elementContainer[0]);
    verify.equal(elementContainer.html(), '<!-- ko text: $data -->ElemA<!-- /ko -->' +
                                '<!-- ko text: $data -->ElemB<!-- /ko -->');
  });

  testCase("bindsMixedInnerVirtualElements", function () {
    const elementContainer = $("<ul data-bind='fastForEach: $data'>Prefix<!-- ko text: $data -->Fallback<!-- /ko -->Suffix</ul>");
    var dataCollection = ['Item1', 'Item2'];
    knockoutEngine.activateBindings(dataCollection, elementContainer[0]);
    verify.equal(elementContainer.html(), 'Prefix<!-- ko text: $data -->Item1<!-- /ko -->Suffix' +
                                'Prefix<!-- ko text: $data -->Item2<!-- /ko -->Suffix');
  });

  testCase("utilizesTemplateElementNameOrId", function () {
    let elementContainer = $("<ul data-bind='fastForEach: {name: \"tempID\", data: $data}'>Placeholder</ul>");
    var dataCollection = ['Foo', 'Bar'];
    var templateElementRef = $("<template id='tempID'>X<!-- ko text: $data--><!--/ko--></template>")
      .attachTo(document.body);
    knockoutEngine.activateBindings(dataCollection, elementContainer[0]);
    verify.equal(elementContainer.html(), "X<!-- ko text: $data-->Foo<!--/ko-->" +
                                "X<!-- ko text: $data-->Bar<!--/ko-->");
    templateElementRef.deleteElement();
  });

  testCase("utilizesScriptElementNameOrId", function () {
    var elementContainer = $("<ul data-bind='fastForEach: {name: \"scriptID\", data: $data}'>Placeholder</ul>");
    const dataCollection = ['One', 'Two'];
    const templateElementRef = $("<script type='text/ko-template' id='scriptID'></script>")
      .attachTo(document.body);
    templateElementRef.content("Y<!-- ko text: $data--><!--/ko-->");
    knockoutEngine.activateBindings(dataCollection, elementContainer[0]);
    verify.equal(elementContainer.html(), "Y<!-- ko text: $data-->One<!--/ko-->" +
                                "Y<!-- ko text: $data-->Two<!--/ko-->");
    templateElementRef.deleteElement();
  });

  testCase("utilizesDivElementNameOrId", function () {
    const elementContainer = $("<ul data-bind='fastForEach: {name: \"divID\", data: $data}'>Placeholder</ul>");
    var dataCollection = ['FirstItem', 'SecondItem'];
    var templateElementRef = $("<div id='divID'>Z<!-- ko text: $data--><!--/ko--></div>")
      .attachTo(document.body);
    knockoutEngine.activateBindings(dataCollection, elementContainer[0]);
    verify.equal(elementContainer.html(), "Z<!-- ko text: $data-->FirstItem<!--/ko-->" +
                                "Z<!-- ko text: $data-->SecondItem<!--/ko-->");
    templateElementRef.deleteElement();
  });
});

testSuite("reactiveCollectionModifications", function () {
  configureSyncRenderMode();
  var containerElement, reactiveCollection, viewModel;

  beforeEveryTest(function () {
    containerElement = $("<div data-bind='fastForEach: reactiveCollection'><i data-bind='text: $data'></i></div>");
    reactiveCollection = knockoutEngine.reactiveArray();
    viewModel = {reactiveCollection: reactiveCollection};
  });

  testCase("insertsItemIntoEmptyCollection", function () {
    knockoutEngine.activateBindings(viewModel, containerElement[0]);
    reactiveCollection(['a_val']);
    verify.equal(containerElement.text(), 'a_val');
  });

  testCase("appendsItemToEndOfExistingCollection", function () {
    reactiveCollection(['a_val']);
    knockoutEngine.activateBindings(viewModel, containerElement[0]);
    reactiveCollection.appendItem('b_val');
    verify.equal(containerElement.text(), 'a_valb_val');
  });

  testCase("prependsItemToBeginningOfExistingCollection", function () {
    reactiveCollection(['a_val']);
    knockoutEngine.activateBindings(viewModel, containerElement[0]);
    reactiveCollection.prependItem('b_val');
    verify.equal(containerElement.text(), 'b_vala_val');
  });

  testCase("insertsItemIntoMiddleOfExistingCollection", function () {
    reactiveCollection(['a_val', 'b_val']);
    knockoutEngine.activateBindings(viewModel, containerElement[0]);
    reactiveCollection.modifyItems(1, 0, 'c_val');
    verify.equal(containerElement.text(), 'a_valc_valb_val');
  });

  testCase("removesFinalItem", function () {
    reactiveCollection(['a_val']);
    knockoutEngine.activateBindings(viewModel, containerElement[0]);
    reactiveCollection([]);
    verify.equal(containerElement.text(), '');
  });

  testCase("removesTextNodes", function () {
    containerElement = $("<div data-bind='fastForEach: reactiveCollection'>X<i data-bind='text: $data'></i>Y</div>");
    knockoutEngine.activateBindings(viewModel, containerElement[0]);
    reactiveCollection(['a_val', 'b_val', 'c_val']);
    verify.equal(containerElement.text(), 'Xa_valY Xb_valY Xc_valY'.replace(/\s/g, ''));
    reactiveCollection(['a_val', 'c_val']);
    verify.equal(containerElement.text(), 'Xa_valY Xc_valY'.replace(/\s/g, ''));
    reactiveCollection(['a_val']);
    verify.equal(containerElement.text(), 'Xa_valY');
    reactiveCollection([]);
    verify.equal(containerElement.text(), '');
  });

  testCase("removesFromVirtualComponents", function () {
    containerElement = $("<div>");
    containerElement.append(document.createMarkupComment("ko fastForEach: reactiveCollection"));
    containerElement.append($("<i data-bind='text: $data'></i>")[0]);
    containerElement.append(document.createMarkupComment("/ko"));
    knockoutEngine.activateBindings(viewModel, containerElement[0]);
    reactiveCollection(['a', 'b', 'c']);
    verify.equal(containerElement.text(), 'abc');
    reactiveCollection(['a', 'c']);
    verify.equal(containerElement.text(), 'ac');
    reactiveCollection(['a']);
    verify.equal(containerElement.text(), 'a');
    reactiveCollection([]);
    verify.equal(containerElement.text(), '');
    reactiveCollection(['a', 'b']);
    verify.equal(containerElement.text(), 'ab');
    reactiveCollection([]);
    verify.equal(containerElement.text(), '');
    reactiveCollection(['a', 'b', 'c']);
    verify.equal(containerElement.text(), 'abc');
    reactiveCollection(['a']);
    verify.equal(containerElement.text(), 'a');
    reactiveCollection(['a', 'b', 'c']);
    verify.equal(containerElement.text(), 'abc');
    reactiveCollection(['c']);
    verify.equal(containerElement.text(), 'c');
  });

  testCase("removesFromStart", function () {
    reactiveCollection(['a_val', 'b_val', 'c_val']);
    knockoutEngine.activateBindings(viewModel, containerElement[0]);
    reactiveCollection.extractFirst();
    verify.equal(containerElement.text(), 'b_valc_val');
  });

  testCase("removesFromEnd", function () {
    reactiveCollection(['a_val', 'b_val', 'c_val']);
    knockoutEngine.activateBindings(viewModel, containerElement[0]);
    reactiveCollection.extractLast();
    verify.equal(containerElement.text(), 'a_valb_val');
  });

  testCase("handlesCombinedAddDeleteOperations", function () {
    reactiveCollection(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta']);
    knockoutEngine.activateBindings(viewModel, containerElement[0]);
    reactiveCollection(['newX', 'Beta', 'Gamma', 'Delta', 'newZ', 'Zeta']);
    verify.equal(containerElement.text(), 'newXBetaGammaDeltanewZZeta');
  });

  testCase("managesMultipleRemovals", function () {
    // According to issue number six
    knockoutEngine.activateBindings(viewModel, containerElement[0]);
    reactiveCollection([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    verify.equal(containerElement.text(), '0123456789');
    reactiveCollection([1, 2, 3, 4, 5, 6, 7, 8]);
    verify.equal(containerElement.text(), '12345678');
    reactiveCollection([2, 3, 4, 5, 6, 7, 8, 9]);
    verify.equal(containerElement.text(), '23456789');
    reactiveCollection([3, 4, 5, 6, 7, 8, 9]);
    verify.equal(containerElement.text(), '3456789');
    reactiveCollection([2, 3, 4, 5, 6, 7, 8, 9]);
    verify.equal(containerElement.text(), '23456789');
    reactiveCollection([6, 7, 8, 9]);
    verify.equal(containerElement.text(), '6789');
    reactiveCollection([1, 2, 3, 6, 7, 8]);
    verify.equal(containerElement.text(), '123678');
    reactiveCollection([0, 1, 2, 3, 4]);
    verify.equal(containerElement.text(), '01234');
    reactiveCollection([1, 2, 3, 4]);
    verify.equal(containerElement.text(), '1234');
    reactiveCollection([3, 4]);
    verify.equal(containerElement.text(), '34');
    reactiveCollection([3]);
    verify.equal(containerElement.text(), '3');
    reactiveCollection([]);
    verify.equal(containerElement.text(), '');
  });

  testCase("processesExtensiveModifications", function () {
    knockoutEngine.activateBindings(viewModel, containerElement[0]);
    reactiveCollection([5, 6, 7, 8, 9]);
    verify.equal(containerElement.text(), '56789');
    reactiveCollection([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    verify.equal(containerElement.text(), '0123456789');
    reactiveCollection(['alpha', 'beta', 'gamma']);
    verify.equal(containerElement.text(), 'alphabeta_gamma'.replace(/_/g, ''));
  });

  testCase("acceptsModificationsViaDerivedReactive", function() {
    var elementContainer = $("<ul data-bind='fastForEach: $data'><li data-bind='text: $data'></li></div>");
    let stateSwitch = knockoutEngine.simpleReactive(true);
    const firstDataSet = [11, 22, 33];
    var secondDataSet = [11, 22, 33, 44, 55, 66];
    knockoutEngine.activateBindings(knockoutEngine.derivedReactive({
      fetchValue: function() { return stateSwitch() ? firstDataSet : secondDataSet; }
    }), elementContainer[0]);
    verify.equal(elementContainer.text(), "112233");
    stateSwitch(false);
    verify.equal(elementContainer.text(), "112233445566");
  });

});

testRunner.run();