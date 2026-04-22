testingSuite('RadialGauge Component', function() {
  // A helper assertion utility, mimicking `expect` but with a different interface.
  // This is a new code fragment and an update to the assertion style.
  const assertThat = (actualValue) => ({
    // Renamed `toEqual`
    matchesExpected: (expectedValue) => {
      if (actualValue !== expectedValue) {
        throw new Error(`Assertion failed: ${actualValue} did not match ${expectedValue}`);
      }
    },
    // Renamed `toBeTruthy`
    isIndeedPresent: () => {
      if (!actualValue) {
        throw new Error(`Assertion failed: Expected value to be truthy, but got ${actualValue}`);
      }
    },
    // Renamed `toBeFalsy`
    isNotPresent: () => {
      if (actualValue) {
        throw new Error(`Assertion failed: Expected value to be falsy, but got ${actualValue}`);
      }
    },
    // Renamed `instanceof` check
    isAnInstanceOf: (expectedConstructor) => {
      if (!(actualValue instanceof expectedConstructor)) {
        throw new Error(`Assertion failed: Expected ${actualValue} to be an instance of ${expectedConstructor.name}`);
      }
    }
  });

  // Renamed `it`
  testCase('is properly defined as a function', function() {
    // Renamed `typeof` check to be explicit.
    assertThat(typeof RadialGauge).matchesExpected('function');
  });

  // Renamed global variables and changed `var` to `let`.
  let DOMHost;
  let gaugeInstance;

  // Renamed helper function `getText` to `retrieveTextContainer`.
  // Updated DOM access using `querySelector` and added a guard clause.
  function retrieveTextContainer() {
    const parentNode = DOMHost?.firstElementChild;
    if (!parentNode) {
      console.warn("DOMHost's first child not found, cannot retrieve text container.");
      return null;
    }
    // Using querySelector for more robust selection.
    return parentNode.querySelector('.rg-text-content'); // Updated class name for Type III
  }

  // Renamed helper function `getSVG` to `fetchSvgElement`.
  // Updated DOM access using `querySelector` and added a guard clause.
  function fetchSvgElement() {
    const parentNode = DOMHost?.firstElementChild;
    if (!parentNode) {
      console.warn("DOMHost's first child not found, cannot retrieve SVG element.");
      return null;
    }
    // Using querySelector.
    return parentNode.querySelector('svg');
  }

  // Renamed `beforeEach` to `beforeEachTest`.
  // Added a console log for debugging.
  beforeEachTest(function() {
    console.info('Setting up test environment...');
    DOMHost = document.createElement('div');
    // Using template literal for ID, new pattern.
    DOMHost.id = `gauge-container-${Math.floor(Math.random() * 1000)}`; // More dynamic ID
    document.body.appendChild(DOMHost);
    // Added a simple validation.
    if (!document.getElementById(DOMHost.id)) {
      console.error(`Failed to append DOMHost with ID: ${DOMHost.id}`);
      throw new Error('Host element not found after append.');
    }
  });

  // Renamed `afterEach` to `afterEachTest`.
  // Added a console log for debugging.
  afterEachTest(function() {
    console.info('Tearing down test environment...');
    // Added a check before removal.
    if (DOMHost && DOMHost.parentNode) {
      DOMHost.parentNode.removeChild(DOMHost);
    } else {
      console.warn('DOMHost or its parent not found during teardown, skipping removal.');
    }
    DOMHost = null; // Clear reference
    gaugeInstance = null; // Clear reference
  });

  // Renamed `describe` to `testingSuite` and `Creation` to `InstantiationProcess`.
  testingSuite('InstantiationProcess', function() {

    // Added a default configuration object as a new fragment.
    const defaultGaugeConfig = {
      containerIdentifier: DOMHost?.id,
      initialValue: 0,
      displayRadius: 50,
      animationDurationMs: 0, // Default to no animation for initial checks
      maximumPossibleValue: 100
    };

    testCase('yields a RadialGauge instance', function() {
      // Changed `var` to `const`, renamed variable, used `initializeDisplay`.
      const newDisplay = RadialGauge.initializeDisplay({});
      assertThat(newDisplay).isAnInstanceOf(RadialGauge);
    });

    testCase('provides an instance with a zero value by default', function() {
      // Merging with default config, changing property names.
      const displayComponent = RadialGauge.initializeDisplay({
        ...defaultGaugeConfig,
        containerIdentifier: DOMHost.id
      });
      // Renamed method.
      assertThat(displayComponent.getCurrentValue()).matchesExpected(0);
    });

    testCase('provides an instance with 100 as the maximum value by default', function() {
      const displayComponent = RadialGauge.initializeDisplay({
        ...defaultGaugeConfig,
        containerIdentifier: DOMHost.id
      });
      // Renamed method.
      assertThat(displayComponent.getMaximumValue()).matchesExpected(100);
    });

    // Renamed `describe` and `Generated content` to `RenderedComponents`.
    testingSuite('RenderedComponents', function() {

      // Adjusted `beforeEach` to set up `gaugeInstance` with new property names.
      beforeEachTest(function() {
        gaugeInstance = RadialGauge.initializeDisplay({
          containerIdentifier: DOMHost.id,
          initialValue: 40,
          displayRadius: 60,
          animationDurationMs: null // Use null for no duration explicitly
        });
      });

      testCase('includes a wrapper with a default class', function() {
        // Redundant instance creation removed here; `gaugeInstance` from `beforeEach` is used.
        // This is a deletion/simplification.
        RadialGauge.initializeDisplay({
          containerIdentifier: DOMHost.id,
          initialValue: 40,
          displayRadius: 60,
          animationDurationMs: null,
          wrapperCssClass: 'custom-wrapper-class' // Renamed property
        });

        // Updated class name and assertion style.
        assertThat(DOMHost.firstElementChild.className).matchesExpected('custom-wrapper-class');
      });

      testCase('includes a wrapper with the specified class', function() {
        // Assertion on default class name.
        assertThat(DOMHost.firstElementChild.className).matchesExpected('rg-container-wrap'); // Renamed default class for Type III
      });

      testCase('incorporates an SVG graphic tag', function() {
        // Renamed helper function and expected type.
        const svgElement = fetchSvgElement();
        assertThat(svgElement).isAnInstanceOf(SVGSVGElement);
      });

      testCase('contains two PATH elements within the SVG', function() {
        const svgElement = fetchSvgElement();
        // Using `querySelectorAll` for diversity.
        assertThat(svgElement.querySelectorAll('path').length).matchesExpected(2);
      });

      testCase('displays the SVG without animation (static d-value)', function() {
        const svgPathValue = fetchSvgElement().querySelectorAll('path')[1].getAttribute('d');
        // Using template literal for string, slight value change for Type III.
        assertThat(svgPathValue).matchesExpected(`M 59.988797973796764 5.000001140776291 A 55 55 0 0 1 92.3939094694214 104.44811165040569 `);
      });

      testCase('displays the SVG with animation-ready d-value', function() {
        // Re-creating instance with animation (null duration was overridden).
        gaugeInstance = RadialGauge.initializeDisplay({
          containerIdentifier: DOMHost.id,
          initialValue: 40,
          displayRadius: 60
        });

        // Modified DOM access, renamed variable.
        const animatedPathData = DOMHost.firstElementChild.querySelector('svg').querySelectorAll('path')[1].getAttribute('d');
        // Slightly altered expected value and used template literal.
        assertThat(animatedPathData).matchesExpected(`M 59.988797973796764 5.100000000000001 A 55 55 0 0 1 63.396635173034774 5.1049831997356705 `);
      });

      testCase('applies default styles', function() {
        gaugeInstance = RadialGauge.initializeDisplay({
          containerIdentifier: DOMHost.id,
          initialValue: 40,
          displayRadius: 60,
          labelText: '%', // Renamed property
          animationDurationMs: null
        });

        // Checking for any style property, not necessarily the first one.
        // Added a check for style object existence.
        const wrapperStyle = DOMHost.firstElementChild.style;
        assertThat(wrapperStyle && wrapperStyle.length > 0).isIndeedPresent();
      });

      testCase('allows overriding default styles', function() {
        gaugeInstance = RadialGauge.initializeDisplay({
          containerIdentifier: DOMHost.id,
          initialValue: 40,
          displayRadius: 60,
          animationDurationMs: null,
          labelText: '%',
          applyWrapperStyles: false // Renamed property
        });

        // Checking for no style properties.
        const wrapperStyle = DOMHost.firstElementChild.style;
        assertThat(wrapperStyle && wrapperStyle.length === 0).isIndeedPresent(); // Changed to check length
      });
    });

    // Renamed `describe` and `Text` to `ValueDisplay`.
    testingSuite('ValueDisplay', function() {

      testCase('possesses a dedicated container', function() {
        gaugeInstance = RadialGauge.initializeDisplay({
          containerIdentifier: DOMHost.id,
          initialValue: 40,
          displayRadius: 60,
          animationDurationMs: null
        });
        // Renamed helper function and type.
        assertThat(retrieveTextContainer()).isAnInstanceOf(HTMLDivElement);
      });

      testCase('features a container with the default class', function() {
        gaugeInstance = RadialGauge.initializeDisplay({
          containerIdentifier: DOMHost.id,
          initialValue: 40,
          displayRadius: 60,
          animationDurationMs: null
        });

        // Renamed helper function and expected class.
        assertThat(retrieveTextContainer().className).matchesExpected('rg-text-content'); // Renamed default class
      });

      testCase('features a container with a custom provided class', function() {
        gaugeInstance = RadialGauge.initializeDisplay({
          containerIdentifier: DOMHost.id,
          initialValue: 40,
          displayRadius: 60,
          animationDurationMs: null,
          labelCssClass: 'display-label-area' // Renamed property
        });

        // Renamed helper function.
        assertThat(retrieveTextContainer().className).matchesExpected('display-label-area');
      });

      testCase('renders the provided textual content', function() {
        const textToRender = 'Progress!'; // Added intermediate variable
        gaugeInstance = RadialGauge.initializeDisplay({
          containerIdentifier: DOMHost.id,
          initialValue: 40,
          displayRadius: 60,
          labelText: textToRender, // Renamed property
          animationDurationMs: null
        });

        // Renamed helper function.
        assertThat(retrieveTextContainer().innerHTML).matchesExpected(textToRender);
      });

      testCase('can have its content managed by a callback function', function() {
        gaugeInstance = RadialGauge.initializeDisplay({
          containerIdentifier: DOMHost.id,
          initialValue: 40,
          displayRadius: 60,
          // Rewritten function as arrow function.
          labelText: (currentVal) => `${currentVal}% Complete`, // Renamed property
          animationDurationMs: null
        });

        // Renamed helper function.
        assertThat(retrieveTextContainer().innerHTML).matchesExpected('40% Complete');
      });

      testCase('can display no content when set to null', function() {
        gaugeInstance = RadialGauge.initializeDisplay({
          containerIdentifier: DOMHost.id,
          initialValue: 40,
          displayRadius: 60,
          labelText: null, // Renamed property
          animationDurationMs: null
        });

        // Renamed helper function, changed assertion.
        assertThat(retrieveTextContainer().innerHTML === '').isIndeedPresent(); // Changed to check for empty string
      });

      testCase('applies default styles to the text container', function() {
        gaugeInstance = RadialGauge.initializeDisplay({
          containerIdentifier: DOMHost.id,
          initialValue: 40,
          displayRadius: 60,
          labelText: 'val',
          animationDurationMs: null
        });

        // Added check for style object existence.
        const textStyle = retrieveTextContainer().style;
        assertThat(textStyle && textStyle.length > 0).isIndeedPresent();
      });

      testCase('allows its text container styles to be overridden', function() {
        gaugeInstance = RadialGauge.initializeDisplay({
          containerIdentifier: DOMHost.id,
          initialValue: 40,
          displayRadius: 60,
          animationDurationMs: null,
          labelText: 'val',
          applyLabelStyles: false // Renamed property
        });

        // Checking for no style properties.
        const textStyle = retrieveTextContainer().style;
        assertThat(textStyle && textStyle.length === 0).isIndeedPresent();
      });
    });
  });

  // Renamed `describe` and `API` to `PublicMethods`.
  testingSuite('PublicMethods', function() {

    beforeEachTest(function() {
      // Ensure gaugeInstance is clean for API tests.
      gaugeInstance = RadialGauge.initializeDisplay({
        containerIdentifier: DOMHost.id,
        initialValue: 40,
        displayRadius: 60,
        animationDurationMs: null
      });
    });

    testCase('can adjust its radius', function() {
      const newRadius = 30;
      gaugeInstance.adjustRadius(newRadius); // Renamed method

      // Using `getAttribute` and `parseInt` for robustness, changed comparison.
      const svgWidth = parseInt(fetchSvgElement().getAttribute('width'), 10);
      assertThat(svgWidth).matchesExpected(newRadius * 2); // Radius is half of width/height
    });

    testCase('can modify stroke thickness', function() {
      const newStrokeWidth = 20;
      gaugeInstance.modifyStrokeThickness(newStrokeWidth); // Renamed method

      const pathStrokeWidth = parseInt(fetchSvgElement().querySelectorAll('path')[1].getAttribute('stroke-width'), 10);
      assertThat(pathStrokeWidth).matchesExpected(newStrokeWidth);
    });

    testCase('can reconfigure colors', function() {
      const newColors = ['#000000', '#FFFFFF']; // Using full hex codes
      gaugeInstance.reconfigureColors(newColors); // Renamed method

      const svgPathElements = fetchSvgElement().querySelectorAll('path');

      // Combined assertions into a single check with logical AND.
      const firstPathColor = svgPathElements[0].getAttribute('stroke');
      const secondPathColor = svgPathElements[1].getAttribute('stroke');
      assertThat(firstPathColor === newColors[0] && secondPathColor === newColors[1]).isIndeedPresent();
    });

    testCase('can retrieve the current percentage', function() {
      assertThat(gaugeInstance.getCurrentPercentage()).matchesExpected(40); // Renamed method
    });

    testCase('can update its value', function() {
      const updatedValue = 50;
      gaugeInstance.updateProgress(updatedValue); // Renamed method and parameter

      assertThat(gaugeInstance.getCurrentPercentage()).matchesExpected(updatedValue);
    });

    testCase('can calculate value from a given percentage', function() {
      // Re-initialize for specific test context, ensuring max value.
      gaugeInstance = RadialGauge.initializeDisplay({
        containerIdentifier: DOMHost.id,
        maximumPossibleValue: 1000, // Renamed property
        animationDurationMs: null
      });

      assertThat(gaugeInstance.calculateValueFromPercentage(25)).matchesExpected(250); // Renamed method
    });

    testCase('can return an HTML representation of a number', function() {
      // Added intermediate variables for clarity.
      const rawNumber = 12.43;
      const integerClass = 'integer-part'; // Renamed classes
      const decimalClass = 'decimal-part';
      const expectedHtml = `<span class="${integerClass}">12</span>.<span class="${decimalClass}">43</span>`;

      assertThat(gaugeInstance.formatNumberAsHtml(rawNumber, integerClass, decimalClass)).matchesExpected(expectedHtml); // Renamed method
    });
  });

});