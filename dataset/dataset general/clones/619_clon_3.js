const mocha = window.mocha; // Ensure mocha is globally accessible in some environments
let verify; // Renamed from 'assert'

// Test utility for making frame animations synchronous; simplifies testing scenarios.
const setupSyncFrameExecution = () => {
  let initialFrameTask = null; // Renamed variable, changed to 'let'

  beforeEach(() => {
    // Store the original frame animation handler to restore it later.
    initialFrameTask = FastForEach.animateFrame;
    // Override the animation frame to execute immediately, bypassing browser's event loop.
    FastForEach.animateFrame = (taskFunction) => {
      // console.log("Synchronous frame execution initiated."); // Added new fragment for debugging
      taskFunction();
    };
  });

  afterEach(() => {
    // Restore the original frame animation handler after each test.
    FastForEach.animateFrame = initialFrameTask;
    // console.log("Original frame execution routine restored."); // Added new fragment for debugging
  });
};

// Initialize Chai's assertion library, using 'expect' style for variety.
verify = chai.expect;

// Main test suite for verifying binding application behavior.
describe("element binding applications", () => {
  setupSyncFrameExecution(); // Execute the synchronous frame setup

  it("functions correctly with a static collection", () => {
    const displayContainer = $("<div data-bind='rapidLoop: $data'><p data-bind='text: $data'></p></div>"); // Renamed element, binding, and tags
    const itemCollection = [10, 20, 30]; // Renamed variable, changed data values
    ko.applyBindings(itemCollection, displayContainer[0]);
    verify(displayContainer.find("p").length).to.equal(3); // Changed assertion style
  });

  it("functions with an observable array source", () => {
    const displayContainer = $(`
      <section data-bind='rapidLoop: $data'>
        <article data-bind='text: $data'></article>
      </section>
    `); // Renamed elements, binding, and tags, used template literal
    const itemCollection = [4, 5, 6]; // Renamed variable, changed data values
    ko.applyBindings(ko.observableArray(itemCollection), displayContainer[0]);
    verify(displayContainer.find("article").length).to.be.at.least(3); // Changed assertion, added a new fragment for robustness
    verify(displayContainer.find("article").length).to.equal(3);
  });

  it("functions with a plain observable containing an array", () => {
    const displayContainer = $("<section data-bind='rapidLoop: $data'><div data-bind='text: $data'></div></section>"); // Renamed elements, binding, and tags
    const itemCollection = ['alpha', 'beta', 'gamma']; // Renamed variable, changed data types
    ko.applyBindings(ko.observable(itemCollection), displayContainer[0]);
    verify(displayContainer.find("div").length).to.equal(3);
  });

  it("functions with a computed observable as data source", () => {
    const displayContainer = $("<ul data-bind='rapidLoop: $data'><li data-bind='text: $data'></li></ul>"); // Renamed element, binding
    const itemCollection = [7, 8, 9]; // Renamed variable, changed data values
    const sourceComputation = ko.computed({
      read: () => itemCollection // Arrow function
    });
    ko.applyBindings(sourceComputation, displayContainer[0]);
    verify(displayContainer.find("li").length).to.equal(3);
  });

  it("applies internal bindings to direct children", () => {
    const displayContainer = $("<ol data-bind='rapidLoop: $data'><li data-bind='text: $data'></li></ol>"); // Renamed elements, binding
    const itemCollection = ['x', 'y', 'z']; // Renamed variable, changed data values
    ko.applyBindings(itemCollection, displayContainer[0]);
    verify(displayContainer.find("li").text()).to.equal("xyz"); // Changed assertion style
  });

  it("applies internal bindings to nested children", () => {
    const displayContainer = $("<div data-bind='rapidLoop: $data'><p><span data-bind='text: $data'></span></p></div>"); // Renamed elements, binding
    const itemCollection = ['A', 'B', 'C']; // Renamed variable, changed data values
    ko.applyBindings(itemCollection, displayContainer[0]);
    const expectedHtml = `<p><span data-bind="text: $data">A</span></p>` +
                         `<p><span data-bind="text: $data">B</span></p>` +
                         `<p><span data-bind="text: $data">C</span></p>`; // Adjusted whitespace and tags
    verify(displayContainer.html()).to.equal(expectedHtml);
  });

  it("handles virtual elements correctly", () => {
    const virtualHost = $("<div><!-- ko rapidLoop: $data --><small data-bind='text: $data'></small><!-- /ko --></div>"); // Renamed variable, binding, and tag
    const sourceData = ['P', 'Q']; // Renamed variable, changed data values
    ko.applyBindings(sourceData, virtualHost[0]);
    const expectedVirtualHtml = '<!-- ko rapidLoop: $data -->' +
                                '<small data-bind="text: $data">P</small>' +
                                '<small data-bind="text: $data">Q</small>' +
                                '<!-- /ko -->';
    verify(virtualHost.html()).to.equal(expectedVirtualHtml);
  });

  it("binds only the inner (virtual) element content", () => {
    const displayContainer = $("<ol data-bind='rapidLoop: $data'><!-- ko text: $data -->Default<!-- /ko --></ol>"); // Renamed element, binding, default text
    const itemCollection = ['Item1', 'Item2']; // Renamed variable, changed data values
    ko.applyBindings(itemCollection, displayContainer[0]);
    const expectedContent = '<!-- ko text: $data -->Item1<!-- /ko -->' +
                            '<!-- ko text: $data -->Item2<!-- /ko -->';
    verify(displayContainer.html()).to.equal(expectedContent);
  });

  it("binds mixed inner virtual elements with static parts", () => {
    const displayContainer = $("<p data-bind='rapidLoop: $data'>Prefix <!-- ko text: $data -->Placeholder<!-- /ko --> Suffix</p>"); // Renamed element, binding, static text
    const itemCollection = ['Val1', 'Val2']; // Renamed variable, changed data values
    ko.applyBindings(itemCollection, displayContainer[0]);
    const expectedContent = 'Prefix <!-- ko text: $data -->Val1<!-- /ko --> Suffix' +
                            'Prefix <!-- ko text: $data -->Val2<!-- /ko --> Suffix';
    verify(displayContainer.html()).to.equal(expectedContent);
  });

  it("uses a named <template> element for rendering", () => {
    const displayContainer = $("<section data-bind='rapidLoop: {name: \"tpl_alpha\", data: $data}'>Fallback Content</section>"); // Renamed element, binding, template ID, fallback
    const itemCollection = ['F_one', 'F_two']; // Renamed variable, changed data values
    const templateContent = "Pre<!-- ko text: $data--><!--/ko-->"; // Changed template content
    const $templateRef = $("<template id='tpl_alpha'>").text(templateContent).appendTo(document.body); // Renamed template ID, appended to body
    ko.applyBindings(itemCollection, displayContainer[0]);
    const expectedOutput = "Pre<!-- ko text: $data-->F_one<!--/ko-->" +
                           "Pre<!-- ko text: $data-->F_two<!--/ko-->";
    verify(displayContainer.html()).to.equal(expectedOutput);
    $templateRef.remove(); // Clean up
  });

  it("uses a named <script> element for rendering", () => {
    const displayContainer = $("<main data-bind='rapidLoop: {name: \"tpl_beta\", data: $data}'></main>"); // Renamed element, binding, template ID
    const itemCollection = ['G_one', 'G_two']; // Renamed variable, changed data values
    const templateContent = "Mid<!-- ko text: $data--><!--/ko-->"; // Changed template content
    const $templateRef = $("<script type='text/ko-template' id='tpl_beta'>").text(templateContent).appendTo($('body')); // Renamed template ID, appended via jQuery
    ko.applyBindings(itemCollection, displayContainer[0]);
    const expectedOutput = "Mid<!-- ko text: $data-->G_one<!--/ko-->" +
                           "Mid<!-- ko text: $data-->G_two<!--/ko-->";
    verify(displayContainer.html()).to.equal(expectedOutput);
    $templateRef.remove(); // Clean up
  });

  it("uses a named <div> element as a template source", () => {
    const displayContainer = $("<article data-bind='rapidLoop: {name: \"tpl_gamma\", data: $data}'></article>"); // Renamed element, binding, template ID
    const itemCollection = ['H_one', 'H_two']; // Renamed variable, changed data values
    const templateContent = "Post<!-- ko text: $data--><!--/ko-->"; // Changed template content
    const $templateRef = $("<div id='tpl_gamma'>").html(templateContent).appendTo(document.body); // Renamed template ID, used .html()
    ko.applyBindings(itemCollection, displayContainer[0]);
    const expectedOutput = "Post<!-- ko text: $data-->H_one<!--/ko-->" +
                           "Post<!-- ko text: $data-->H_two<!--/ko-->";
    verify(displayContainer.html()).to.equal(expectedOutput);
    $templateRef.remove(); // Clean up
  });
});

// Test suite for dynamic observable array changes.
describe("dynamic collection modifications", () => {
  setupSyncFrameExecution(); // Setup synchronous frame execution
  let hostElement; // Renamed 'div'
  let dataCollection; // Renamed 'obs'
  let viewModel; // Renamed 'view'

  beforeEach(() => {
    hostElement = $("<section data-bind='rapidLoop: boundData'><em data-bind='text: $data'></em></section>"); // Renamed element, binding, child tag
    dataCollection = new ko.observableArray(); // Explicitly used 'new' keyword
    viewModel = { boundData: dataCollection }; // Renamed property in view model
  });

  it("appends an item to an initially empty collection", () => {
    ko.applyBindings(viewModel, hostElement[0]);
    dataCollection(['item_A']); // Changed data value
    verify(hostElement.text()).to.equal('item_A');
  });

  it("appends an item to the end of an existing collection", () => {
    dataCollection(['item_A']);
    ko.applyBindings(viewModel, hostElement[0]);
    dataCollection.push('item_B'); // Changed data value
    verify(hostElement.text()).to.equal('item_Aitem_B');
  });

  it("prepends an item to the start of an existing collection", () => {
    dataCollection(['item_A']);
    ko.applyBindings(viewModel, hostElement[0]);
    dataCollection.unshift('item_B'); // Changed data value
    verify(hostElement.text()).to.equal('item_Bitem_A');
  });

  it("inserts an item into the middle of an existing collection", () => {
    dataCollection(['item_A', 'item_B_orig']); // Changed data values
    ko.applyBindings(viewModel, hostElement[0]);
    dataCollection.splice(1, 0, 'item_C_inserted'); // Changed data value
    verify(hostElement.text()).to.equal('item_Aitem_C_inserteditem_B_orig');
  });

  it("removes the last item, resulting in an empty display", () => {
    dataCollection(['item_A_only']); // Changed data value
    ko.applyBindings(viewModel, hostElement[0]);
    dataCollection([]); // Clear the array
    verify(hostElement.text()).to.equal('');
  });

  it("handles deletion of elements with surrounding text nodes", () => {
    hostElement = $("<div data-bind='rapidLoop: boundData'>Pre<span data-bind='text: $data'></span>Post</div>"); // Renamed element, binding, and tags, added static text
    ko.applyBindings(viewModel, hostElement[0]);
    dataCollection(['1', '2', '3']);
    verify(hostElement.text()).to.equal('Pre1PostPre2PostPre3Post');
    dataCollection(['1', '3']); // Delete '2'
    verify(hostElement.text()).to.equal('Pre1PostPre3Post');
    dataCollection(['1']); // Delete '3'
    verify(hostElement.text()).to.equal('Pre1Post');
    dataCollection([]); // Delete '1'
    verify(hostElement.text()).to.equal('');
  });

  it("handles deletions within virtual elements", () => {
    hostElement = $("<div>");
    hostElement.append(document.createComment("ko rapidLoop: boundData")); // Renamed binding
    hostElement.append($("<strong data-bind='text: $data'></strong>")[0]); // Changed tag
    hostElement.append(document.createComment("/ko"));

    ko.applyBindings(viewModel, hostElement[0]);
    dataCollection(['x', 'y', 'z']);
    verify(hostElement.text()).to.equal('xyz');
    dataCollection(['x', 'z']); // Remove 'y'
    verify(hostElement.text()).to.equal('xz');
    dataCollection(['x']); // Remove 'z'
    verify(hostElement.text()).to.equal('x');
    dataCollection([]); // Remove 'x'
    verify(hostElement.text()).to.equal('');
    dataCollection(['x', 'y']);
    verify(hostElement.text()).to.equal('xy');
    dataCollection([]);
    verify(hostElement.text()).to.equal('');
    dataCollection(['x', 'y', 'z']);
    verify(hostElement.text()).to.equal('xyz');
    dataCollection(['x']);
    verify(hostElement.text()).to.equal('x');
    dataCollection(['x', 'y', 'z']);
    verify(hostElement.text()).to.equal('xyz');
    dataCollection(['z']);
    verify(hostElement.text()).to.equal('z');
  });

  it("removes an item from the beginning of the list", () => {
    dataCollection(['first', 'second', 'third']); // Changed data values
    ko.applyBindings(viewModel, hostElement[0]);
    dataCollection.shift();
    verify(hostElement.text()).to.equal('secondthird');
  });

  it("removes an item from the end of the list", () => {
    dataCollection(['first', 'second', 'third']); // Changed data values
    ko.applyBindings(viewModel, hostElement[0]);
    dataCollection.pop();
    verify(hostElement.text()).to.equal('firstsecond');
  });

  it("processes a combination of additions and deletions", () => {
    dataCollection(['ItemA', 'ItemB', 'ItemC', 'ItemD', 'ItemE', 'ItemF']); // Changed data values
    ko.applyBindings(viewModel, hostElement[0]);
    dataCollection(['newX', 'ItemB', 'ItemC', 'ItemD', 'newZ', 'ItemF']); // Changed data values
    verify(hostElement.text()).to.equal('newXItemBItemCItemDnewZItemF');
  });

  it("handles sequential multiple deletions", () => {
    // Addresses a known edge case for multiple removals.
    ko.applyBindings(viewModel, hostElement[0]);
    dataCollection([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    verify(hostElement.text()).to.equal('0123456789');
    dataCollection([1, 2, 3, 4, 5, 6, 7, 8]);
    verify(hostElement.text()).to.equal('12345678');
    dataCollection([2, 3, 4, 5, 6, 7, 8, 9]);
    verify(hostElement.text()).to.equal('23456789');
    dataCollection([3, 4, 5, 6, 7, 8, 9]);
    verify(hostElement.text()).to.equal('3456789');
    dataCollection([2, 3, 4, 5, 6, 7, 8, 9]);
    verify(hostElement.text()).to.equal('23456789');
    dataCollection([6, 7, 8, 9]);
    verify(hostElement.text()).to.equal('6789');
    dataCollection([1, 2, 3, 6, 7, 8]);
    verify(hostElement.text()).to.equal('123678');
    dataCollection([0, 1, 2, 3, 4]);
    verify(hostElement.text()).to.equal('01234');
    dataCollection([1, 2, 3, 4]);
    verify(hostElement.text()).to.equal('1234');
    dataCollection([3, 4]);
    verify(hostElement.text()).to.equal('34');
    dataCollection([3]);
    verify(hostElement.text()).to.equal('3');
    dataCollection([]);
    verify(hostElement.text()).to.equal('');
  });

  it("executes numerous and varied changes", () => {
    ko.applyBindings(viewModel, hostElement[0]);
    dataCollection(['f', 'g', 'h', 'i', 'j']); // Changed data values
    verify(hostElement.text()).to.equal('fghij');
    dataCollection(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']); // Changed data values
    verify(hostElement.text()).to.equal('abcdefghij');
    dataCollection(['one', 'two', 'three']); // Changed data values
    verify(hostElement.text()).to.equal('onetwothree');
  });

  it("responds to changes propagated through a computed observable", () => {
    const displayArea = $("<div data-bind='rapidLoop: sourceData'><p data-bind='text: $data'></p></div>"); // Renamed elements, binding
    const switchToggle = ko.observable(true); // Renamed variable
    const initialList = ['one', 'two', 'three']; // Renamed variable, changed data values
    const extendedList = ['one', 'two', 'three', 'four', 'five', 'six']; // Renamed variable, changed data values

    const dynamicSource = ko.computed(() => { // Renamed variable, used arrow function
      return switchToggle() ? initialList : extendedList;
    });

    ko.applyBindings({ sourceData: dynamicSource }, displayArea[0]); // Changed binding context property
    verify(displayArea.text()).to.equal("onetwothree");
    switchToggle(false); // Flip the switch
    verify(displayArea.text()).to.equal("onetwothreefourfivesix");
  });
});

mocha.run(); // Start the test runner