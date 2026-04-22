describe( 'RoundObjects', function()
{
  // Test if the primary drawing component is properly defined
  it( 'is properly established', function() {
    expect(typeof RoundObjects).toEqual('function');
  });

  // Declare variables for the host DOM element and the graphic instance
  var hostContainer, drawnOrb;

  /**
   * Fetches the text display component within the host container.
   * @returns {HTMLElement} The text element.
   */
  function retrieveLabelNode()
  {
    return hostContainer.firstChild.children[1];
  }

  /*
   * Obtains the main SVG graphics element from the container.
   * @returns {SVGSVGElement} The SVG element.
   */
  function obtainVectorNode()
  {
    return hostContainer.firstChild.getElementsByTagName('svg')[0];
  }

  // Setup routine before each test case
  beforeEach(function()
  {
    hostContainer = document.createElement('div');
    hostContainer.id = 'graphic-container-1';
    document.body.appendChild(hostContainer); // Attach to the document body
  });

  // Teardown routine after each test case
  afterEach(function()
  {
    hostContainer.parentNode.removeChild(hostContainer);
  });

  describe( 'Instantiation', function() {

    it('produces a RoundObjects instance', function() {
      // Construct a new instance without specific parameters
      var graphicShapes = RoundObjects.construct({});
      expect(graphicShapes instanceof RoundObjects).toBeTruthy();
    });

    it('yields an instance with 0 as its current value', function()
    {
      var graphicShapes = RoundObjects.construct({uniqueId: hostContainer.id});
      expect(graphicShapes.retrieveNumericValue()).toEqual(0);
    });

    it('yields an instance with 100 as its maximum value', function() {
      var graphicShapes = RoundObjects.construct({uniqueId: hostContainer.id});
      expect(graphicShapes.obtainMaximumValue()).toEqual(100);
    });

    describe( 'RenderedStructure', function() {

      beforeEach(function()
      {
        drawnOrb = RoundObjects.construct({
          uniqueId: hostContainer.id,
          displayValue: 40,
          orbitalSize: 60,
          animationDuration: null
        });
      });

      it( 'includes an enclosure with a default style class', function() {

        // Create another instance to test wrapper class
        RoundObjects.construct({
          uniqueId: hostContainer.id,
          displayValue: 40,
          orbitalSize: 60,
          animationDuration: null,
          wrapperCssClass: 'mainWrapperBox'
        });

        expect(hostContainer.firstChild.className).toEqual('mainWrapperBox');
      });

      it( 'includes an enclosure with a custom style class', function() {
        expect(hostContainer.firstChild.className).toEqual('round-container');
      });

      it( 'contains an SVG tag', function() {
        expect(obtainVectorNode() instanceof SVGSVGElement).toBeTruthy();
      });

      it( 'contains two PATH elements within the SVG', function() {
        expect(obtainVectorNode().getElementsByTagName('path').length).toEqual(2);
      });

      it( 'ensures the SVG without motion', function() {
        var drawInstruction = obtainVectorNode().getElementsByTagName('path')[1].getAttribute('d');
        expect(drawInstruction).toEqual('M 59.988797973796764 5.000001140776291 A 55 55 0 0 1 92.3939094694214 104.44811165040569 ');
      });

      it( "ensures the SVG with motion", function()
      {
        drawnOrb	=	RoundObjects.construct({
          uniqueId: hostContainer.id,
          displayValue: 40,
          orbitalSize: 60
        });

        // Get the path data from the animated SVG
        var drawInstruction = hostContainer.firstChild.getElementsByTagName('svg')[0].getElementsByTagName('path')[1].getAttribute('d');
        expect(drawInstruction).toEqual('M 59.988797973796764 5.000001140776291 A 55 55 0 0 1 63.396635173034774 5.1049831997356705 ');
      });

      it( 'has default inline styles', function() {
        drawnOrb = RoundObjects.construct({
          uniqueId: hostContainer.id,
          displayValue: 40,
          orbitalSize: 60,
          captionString: '%',
          animationDuration: null
        });

        expect(hostContainer.firstChild.style[0]).toBeTruthy();
      });

      it( 'allows its inline styles to be overridden', function() {
        drawnOrb = RoundObjects.construct({
          uniqueId: hostContainer.id,
          displayValue: 40,
          orbitalSize: 60,
          animationDuration: null,
          captionString: '%',
          applyWrapperStyles: false
        });

        expect(hostContainer.firstChild.style[0]).toBeFalsy();
      });

    });

    describe('Captions', function()
    {

      it('possesses a container element', function() {
        drawnOrb = RoundObjects.construct({
          uniqueId: hostContainer.id,
          displayValue: 40,
          orbitalSize: 60,
          animationDuration: null
        });
        expect(retrieveLabelNode() instanceof HTMLDivElement).toBeTruthy();
      });

      it('has a container with a default style class', function() {
        drawnOrb = RoundObjects.construct({
          uniqueId: hostContainer.id,
          displayValue: 40,
          orbitalSize: 60,
          animationDuration: null
        });

        expect(retrieveLabelNode().className).toEqual('orb-label');
      });

      it('has a container with a specified style class', function() {
        drawnOrb = RoundObjects.construct({
          uniqueId: hostContainer.id,
          displayValue: 40,
          orbitalSize: 60,
          animationDuration: null,
          labelCssClass: 'captionBox'
        });

        expect(retrieveLabelNode().className).toEqual('captionBox');
      });

      it('displays the provided text content', function() {
        drawnOrb = RoundObjects.construct({
          uniqueId: hostContainer.id,
          displayValue: 40,
          orbitalSize: 60,
          captionString: '%',
          animationDuration: null
        });

        expect(retrieveLabelNode().innerHTML).toEqual('%');
      });

      it('can be managed by a custom function', function() {
        drawnOrb = RoundObjects.construct({
          uniqueId: hostContainer.id,
          displayValue: 40,
          orbitalSize: 60,
          captionString: function(inputVal)
          {
            return inputVal + '%';
          },
          animationDuration: null
        });

        expect(retrieveLabelNode().innerHTML).toEqual('40%');
      });

      it('can be empty', function() {
        drawnOrb = RoundObjects.construct({
          uniqueId: hostContainer.id,
          displayValue: 40,
          orbitalSize: 60,
          captionString: null,
          animationDuration: null
        });

        expect(retrieveLabelNode().innerHTML).toBeFalsy();
      });

      it('has default inline styles', function()
      {
        drawnOrb = RoundObjects.construct({
          uniqueId: hostContainer.id,
          displayValue: 40,
          orbitalSize: 60,
          captionString: '%',
          animationDuration: null
        });

        expect(retrieveLabelNode().style[0]).toBeTruthy();
      });

      it('allows its inline styles to be overridden', function() {
        drawnOrb = RoundObjects.construct({
          uniqueId: hostContainer.id,
          displayValue: 40,
          orbitalSize: 60,
          animationDuration: null,
          captionString: '%',
          applyTextStyles: false
        });

        expect(retrieveLabelNode().style[0]).toBeFalsy();
      });

    });
  });

  describe('Methods', function() {

    beforeEach(function() {
      drawnOrb = RoundObjects.construct({
        uniqueId: hostContainer.id,
        displayValue: 40,
        orbitalSize: 60,
        animationDuration: null
      });
    });

    it('can adjust the orbital size', function() {
      drawnOrb.adjustRadius(30);

      expect(obtainVectorNode().getAttribute('width') == 60).toBeTruthy();
    });

    it('can modify the stroke thickness', function() {
      drawnOrb.adjustStrokeWidth(20);

      expect(obtainVectorNode().getElementsByTagName('path')[1].getAttribute('stroke-width') == 20).toBeTruthy();
    });

    it('can set the graphic hues', function() {
      drawnOrb.changeRenderColors(['#000', '#fff']);

      var vectorPaths = obtainVectorNode().getElementsByTagName('path');

      expect(vectorPaths[0].getAttribute('stroke') === '#000' && vectorPaths[1].getAttribute('stroke') === '#fff').toBeTruthy();
    });

    it('can retrieve the correct percentage', function() {
      expect(drawnOrb.getPercentageValue()).toEqual(40);
    });

    it('can set a new amount', function() {
      drawnOrb.setNewAmount(50);
      expect(drawnOrb.getPercentageValue()).toEqual(50);
    });

    it('can calculate value from percentage', function() {

      drawnOrb = RoundObjects.construct({
        uniqueId: hostContainer.id,
        maximumPossibleValue: 1000,
        animationDuration: null
      });

      expect(drawnOrb.calculateValueFromPercentage(25)).toEqual(250);
    });

    it('can represent a numeric value as HTML', function() {
      expect(drawnOrb.formatNumberAsHtml(12.43, 'wholePart', 'decimalPart')).toEqual('<span class="wholePart">12</span>.<span class="decimalPart">43</span>');
    });
  });

});