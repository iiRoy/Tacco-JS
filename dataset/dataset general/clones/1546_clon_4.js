describe('Visual Gauge Component Operations', () => {
  let hostContainer;
  let activeGauge;

  const queryGaugeTextElement = (parentDiv) => {
    // Assuming the structure is: parentDiv -> wrapperDiv -> [svg, textDiv]
    const wrapper = parentDiv.firstElementChild;
    if (wrapper && wrapper.children && wrapper.children.length > 1) {
      return wrapper.children[1]; // Typically the second child is the text div
    }
    return null;
  };

  const queryGaugeSvgElement = (parentDiv) => {
    // Assuming the structure is: parentDiv -> wrapperDiv -> svg
    return parentDiv.querySelector('svg');
  };

  beforeEach(() => {
    hostContainer = document.createElement('section');
    hostContainer.id = 'display-gauge-1';
    document.body.appendChild(hostContainer);
  });

  afterEach(() => {
    hostContainer.remove();
  });

  test('Component factory exists', () => {
    expect(typeof Circles).toBe('function');
  });

  describe('Instantiation Process', () => {
    test('Factory yields a gauge object', () => {
      const newGauge = Circles.create({});
      expect(newGauge).toBeInstanceOf(Circles);
    });

    test('Default value is zero', () => {
      const zeroGauge = Circles.create({ id: hostContainer.id });
      expect(zeroGauge.getValue()).toBe(0);
    });

    test('Default maximum value is one hundred', () => {
      const maxGauge = Circles.create({ id: hostContainer.id });
      expect(maxGauge.getMaxValue()).toBe(100);
    });

    describe('Rendered Visual Structure', () => {
      beforeEach(() => {
        activeGauge = Circles.create({
          id: hostContainer.id,
          value: 40,
          radius: 60,
          duration: null,
        });
      });

      test('Wrapper element accepts custom class', () => {
        Circles.create({
          id: hostContainer.id,
          value: 40,
          radius: 60,
          duration: null,
          wrpClass: 'custom-wrapper-div',
        });
        expect(hostContainer.firstElementChild.className).toBe('custom-wrapper-div');
      });

      test('Wrapper element has standard class by default', () => {
        expect(hostContainer.firstElementChild.className).toBe('circles-wrp');
      });

      test('Contains an SVG graphic', () => {
        expect(queryGaugeSvgElement(hostContainer)).toBeInstanceOf(SVGSVGElement);
      });

      test('SVG contains two path elements', () => {
        expect(queryGaugeSvgElement(hostContainer).querySelectorAll('path').length).toBe(2);
      });

      test('SVG path for static display is correct', () => {
        const pathDataAttribute = queryGaugeSvgElement(hostContainer).querySelectorAll('path')[1].getAttribute('d');
        // Using a regex for robustness against minor floating-point variations
        expect(pathDataAttribute).toMatch(/^M \d+\.\d+ \d+\.\d+ A \d+ \d+ 0 0 1 \d+\.\d+ \d+\.\d+$/);
      });

      test('SVG path for animated display is correct', () => {
        activeGauge = Circles.create({
          id: hostContainer.id,
          value: 40,
          radius: 60,
        });
        const pathDataAttribute = queryGaugeSvgElement(hostContainer).querySelectorAll('path')[1].getAttribute('d');
        expect(pathDataAttribute).toMatch(/^M \d+\.\d+ \d+\.\d+ A \d+ \d+ 0 0 1 \d+\.\d+ \d+\.\d+$/);
      });

      test('Wrapper element has default inline styles', () => {
        activeGauge = Circles.create({
          id: hostContainer.id,
          value: 40,
          radius: 60,
          text: '%',
          duration: null,
        });
        expect(hostContainer.firstElementChild.style.length).toBeGreaterThan(0);
      });

      test('Wrapper element styles can be disabled', () => {
        activeGauge = Circles.create({
          id: hostContainer.id,
          value: 40,
          radius: 60,
          duration: null,
          text: '%',
          styleWrapper: false,
        });
        expect(hostContainer.firstElementChild.style.length).toBe(0);
      });
    });

    describe('Textual Content Display', () => {
      test('Text has its own container element', () => {
        activeGauge = Circles.create({
          id: hostContainer.id,
          value: 40,
          radius: 60,
          duration: null,
        });
        expect(queryGaugeTextElement(hostContainer)).toBeInstanceOf(HTMLDivElement);
      });

      test('Text container has standard class', () => {
        activeGauge = Circles.create({
          id: hostContainer.id,
          value: 40,
          radius: 60,
          duration: null,
        });
        expect(queryGaugeTextElement(hostContainer).className).toBe('circles-text');
      });

      test('Text container accepts custom class', () => {
        activeGauge = Circles.create({
          id: hostContainer.id,
          value: 40,
          radius: 60,
          duration: null,
          textClass: 'custom-text-div',
        });
        expect(queryGaugeTextElement(hostContainer).className).toBe('custom-text-div');
      });

      test('Displays provided static text', () => {
        activeGauge = Circles.create({
          id: hostContainer.id,
          value: 40,
          radius: 60,
          text: '%',
          duration: null,
        });
        expect(queryGaugeTextElement(hostContainer).textContent).toBe('%');
      });

      test('Text content can be dynamically generated', () => {
        activeGauge = Circles.create({
          id: hostContainer.id,
          value: 40,
          radius: 60,
          text: (currentValue) => `${currentValue}%`,
          duration: null,
        });
        expect(queryGaugeTextElement(hostContainer).textContent).toBe('40%');
      });

      test('Text content can be absent', () => {
        activeGauge = Circles.create({
          id: hostContainer.id,
          value: 40,
          radius: 60,
          text: null,
          duration: null,
        });
        expect(queryGaugeTextElement(hostContainer).textContent).toBe('');
      });

      test('Text container has default inline styles', () => {
        activeGauge = Circles.create({
          id: hostContainer.id,
          value: 40,
          radius: 60,
          text: '%',
          duration: null,
        });
        expect(queryGaugeTextElement(hostContainer).style.length).toBeGreaterThan(0);
      });

      test('Text container styles can be disabled', () => {
        activeGauge = Circles.create({
          id: hostContainer.id,
          value: 40,
          radius: 60,
          duration: null,
          text: '%',
          styleText: false,
        });
        expect(queryGaugeTextElement(hostContainer).style.length).toBe(0);
      });
    });
  });

  describe('Programmatic Interface Functions', () => {
    beforeEach(() => {
      activeGauge = Circles.create({
        id: hostContainer.id,
        value: 40,
        radius: 60,
        duration: null,
      });
    });

    test('Radius can be modified', () => {
      activeGauge.updateRadius(30);
      expect(parseInt(queryGaugeSvgElement(hostContainer).getAttribute('width'))).toBe(60);
    });

    test('Stroke thickness can be adjusted', () => {
      activeGauge.updateWidth(20);
      expect(parseInt(queryGaugeSvgElement(hostContainer).querySelectorAll('path')[1].getAttribute('stroke-width'))).toBe(20);
    });

    test('Colors of paths can be updated', () => {
      activeGauge.updateColors(['#000000', '#FFFFFF']);
      const pathSegments = queryGaugeSvgElement(hostContainer).querySelectorAll('path');
      expect(pathSegments[0].getAttribute('stroke')).toBe('#000000');
      expect(pathSegments[1].getAttribute('stroke')).toBe('#FFFFFF');
    });

    test('Current percentage value is retrievable', () => {
      expect(activeGauge.getPercent()).toBe(40);
    });

    test('Gauge value can be changed', () => {
      activeGauge.update(50);
      expect(activeGauge.getPercent()).toBe(50);
    });

    test('Value can be computed from a given percentage', () => {
      const calculatedGauge = Circles.create({
        id: hostContainer.id,
        maxValue: 1000,
        duration: null,
      });
      expect(calculatedGauge.getValueFromPercent(25)).toBe(250);
    });

    test('Formats numbers into HTML spans', () => {
      expect(activeGauge.htmlifyNumber(12.43, 'integer-part', 'decimal-part')).toBe('<span class="integer-part">12</span>.<span class="decimal-part">43</span>');
    });
  });
});