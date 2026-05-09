context ( 'Component.StructureDisplay functionality' , function ( ) {
  // Establish the fundamental display element for testing
  PrimaryComponent = Component.Display;

  // Augment the core component prototype with templating capabilities
  _.extend( PrimaryComponent.basePrototype , Component.TemplateExtension ) ;

  // Reference the specific component under scrutiny
  var StructureDisplay = Component.StructureDisplay ;

  // Declare an instance variable for the component
  var arrangementVisualObject ;

  // Setup routine executed before each test scenario
  setupBeforeEach ( function ( ) {
    arrangementVisualObject = new StructureDisplay ( ) ;
  } ) ;

  context ( ' .initializer ( ) ' , function ( ) {
    // Verifies that the internal component list starts empty
    test ( ' should initialize .elements to an empty collection ' , function ( ) {
      arrangementVisualObject.elements.size.should.eql ( 0 ) ;
    } ) ;

    // Asserts that the parent component's initializer is invoked
    test ( ' should invoke parent.initializer ( ) ' , function ( ) {
      var builderMock = spyglass.createStub ( PrimaryComponent.basePrototype , "initializer" ) ;

      arrangementVisualObject = new StructureDisplay ( ) ;

      builderMock.should.have.been.called.once ;
      builderMock.reset ( ) ;
    } ) ;
  } ) ;

  context ( ' .startup ( ) ' , function ( ) {
    // Confirms the invocation of the superclass's startup method
    test ( ' should invoke parent.startup ( ) ' , function ( ) {
      var initMock = spyglass.createStub ( PrimaryComponent.basePrototype , "startup" ) ;

      arrangementVisualObject = new StructureDisplay ( ) ;

      initMock.should.have.been.called.once ;
      initMock.reset ( ) ;
    } ) ;

    // Checks if event handlers are correctly set from configuration
    test ( ' should configure .componentEvents from settings ' , function ( ) {
      var eventHandlerFunction = function ( ) { } ;
      var componentEvents = { 'action' : eventHandlerFunction } ;

      arrangementVisualObject = new StructureDisplay ( {
        componentEvents : componentEvents
      } ) ;

      arrangementVisualObject.componentEvents.should.have.keys ( [ 'action' ] ) ;
      arrangementVisualObject.componentEvents.should.have.property ( 'action' , eventHandlerFunction ) ;
    } ) ;

    // Ensures components are replaced with the provided ones
    test ( ' should reconfigure elements to those provided ' , function ( ) {
      var sampleComponent = new Backbone.VisualComponent ( ) ;
      var insertionPoint = 'suffix .targetArea' ;
      var elementMap = { } ;
      elementMap [ insertionPoint ] = sampleComponent ;

      arrangementVisualObject = new StructureDisplay ( {
        elements : elementMap
      } ) ;

      arrangementVisualObject.fetchElement ( insertionPoint ).should.eql ( sampleComponent ) ;
    } ) ;
  } ) ;

  context ( ' .assignComponentHandlers ( ) ' , function ( ) {
    // Verifies that all registered component events are listened for
    test ( ' should monitor all .componentEvents on element ' , function ( ) {
      var sampleComponent = new Backbone.VisualComponent ( ) ;
      arrangementVisualObject.insertComponent ( 'suffix .targetArea' , sampleComponent ) ;
      var verificationCallback = spyglass.spy ( ) ;
      arrangementVisualObject.componentEvents = { 'action' : verificationCallback } ;

      arrangementVisualObject.assignComponentHandlers ( sampleComponent ) ;
      sampleComponent.emit ( 'action' ) ;

      verificationCallback.should.have.been.calledOnce ;
    } ) ;
  } ) ;

  context ( ' .unbindElementEvents ( ) ' , function ( ) {
    // Confirms that the component no longer responds to its assigned events
    test ( ' should ignore all .componentEvents on element ' , function ( ) {
      var sampleComponent = new Backbone.VisualComponent ( ) ;
      arrangementVisualObject.insertComponent ( 'suffix .targetArea' , sampleComponent ) ;
      var verificationCallback = spyglass.spy ( ) ;
      arrangementVisualObject.componentEvents = { 'action' : verificationCallback } ;

      arrangementVisualObject.unbindElementEvents ( sampleComponent ) ;
      sampleComponent.emit ( 'action' ) ;

      verificationCallback.should.not.have.been.called ;
    } ) ;
  } ) ;

  context ( ' .insertComponent ( ) ' , function ( ) {
    var dummyElement ;
    // Initial setup for component insertion tests
    setupBeforeEach ( function ( ) {
      arrangementVisualObject = new StructureDisplay ( {
        layoutMarkup : '<div class="targetArea"><br></div>'
      } ) ;
      dummyElement = new Backbone.VisualComponent ( ) ;

    } ) ;

    // Test case for adding a component to the inner part
    test ( ' should add the element to inside ' , function ( ) {
      var insertionPoint = 'inside .targetArea' ;

      arrangementVisualObject.insertComponent ( insertionPoint , dummyElement ) ;
      arrangementVisualObject.connect ( ).display ( ) ;

      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><div></div></div>' ) ;
    } ) ;

    // Test case for adding a component to the outer part
    test ( ' should add the element to outside ' , function ( ) {
      var insertionPoint = 'outside .targetArea' ;

      arrangementVisualObject.insertComponent ( insertionPoint , dummyElement ) ;
      arrangementVisualObject.connect ( ).display ( ) ;

      arrangementVisualObject.$el.html ( ).should.eql ( '<div></div>' ) ;
    } ) ;

    // Test case for prepending a component
    test ( ' should add the element by prefix ' , function ( ) {
      var insertionPoint = 'prefix .targetArea' ;

      arrangementVisualObject.insertComponent ( insertionPoint , dummyElement ) ;
      arrangementVisualObject.connect ( ).display ( ) ;

      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><div></div><br></div>' ) ;
    } ) ;

    // Test case for appending a component
    test ( ' should add the element by suffix ' , function ( ) {
      var insertionPoint = 'suffix .targetArea' ;

      arrangementVisualObject.insertComponent ( insertionPoint , dummyElement ) ;
      arrangementVisualObject.connect ( ).display ( ) ;

      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><br><div></div></div>' ) ;
    } ) ;

    // Test case for inserting a component before
    test ( ' should add the element priorTo ' , function ( ) {
      var insertionPoint = 'priorTo .targetArea' ;

      arrangementVisualObject.insertComponent ( insertionPoint , dummyElement ) ;
      arrangementVisualObject.connect ( ).display ( ) ;

      arrangementVisualObject.$el.html ( ).should.eql ( '<div></div><div class="targetArea"><br></div>' ) ;
    } ) ;

    // Test case for inserting a component after
    test ( ' should add the element following ' , function ( ) {
      var insertionPoint = 'following .targetArea' ;

      arrangementVisualObject.insertComponent ( insertionPoint , dummyElement ) ;
      arrangementVisualObject.connect ( ).display ( ) ;

      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><br></div><div></div>' ) ;
    } ) ;

    // Verifies that event delegation occurs upon adding a component
    test ( ' should assign the element events to the component ' , function ( ) {
      var verificationCallback = spyglass.spy ( ) ;
      arrangementVisualObject.componentEvents = { 'action' : verificationCallback } ;

      arrangementVisualObject.insertComponent ( 'suffix .targetArea' , dummyElement ) ;

      dummyElement.emit ( 'action' ) ;

      verificationCallback.should.have.been.calledOnce ;
    } ) ;

    // Checks if the parent reference is correctly set
    test ( ' should set the elements ownerComponent to this ' , function ( ) {
      var insertionPoint = 'following .targetArea' ;

      arrangementVisualObject.insertComponent ( insertionPoint , dummyElement ) ;
      dummyElement.ownerComponent.should.eql ( arrangementVisualObject ) ;
    } ) ;

    // Ensures rendering order is preserved
    test ( ' should maintain the order they are added when displaying ' , function ( ) {
      var anotherComponent = new Backbone.VisualComponent ( { styleClass : "another" } ) ;
      var insertionPoint = 'suffix .targetArea' ;

      arrangementVisualObject.insertComponent ( insertionPoint , dummyElement ) ;
      arrangementVisualObject.insertComponent ( insertionPoint , anotherComponent ) ;

      arrangementVisualObject.connect ( ).display ( ) ;

      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><br><div></div><div class="another"></div></div>' ) ;
    } ) ;

    // Confirms that the inserted component is returned
    test ( ' should yield the provided element ' , function ( ) {
      var insertionPoint = 'suffix .targetArea' ;

      arrangementVisualObject.insertComponent ( insertionPoint , dummyElement ).should.eql ( dummyElement ) ;
    } ) ;
  } ) ;

  context ( ' .eraseElement ( ) ' , function ( ) {
    var componentForRemoval , insertionPoint ;
    // Setup for component removal tests
    setupBeforeEach ( function ( ) {
      arrangementVisualObject = new StructureDisplay ( {
        layoutMarkup : '<div class="targetArea"><br></div>'
      } ) ;

      componentForRemoval = new Backbone.VisualComponent ( ) ;
      insertionPoint = 'suffix .targetArea' ;
      arrangementVisualObject.insertComponent ( insertionPoint , componentForRemoval ) ;
    } ) ;

    // Verifies that the component is removed from its location
    test ( ' should remove the element from the insertionPoint ' , function ( ) {
      arrangementVisualObject.eraseElement ( insertionPoint ) ;

      expect.toBeUndefined ( arrangementVisualObject.fetchElement ( insertionPoint ) ) ;
    } ) ;

    // Checks if the parent reference is unset
    test ( ' should unset the ownerComponent from the element ' , function ( ) {
      arrangementVisualObject.eraseElement ( insertionPoint ) ;

      expect.toBeUndefined ( componentForRemoval.ownerComponent ) ;
    } ) ;

    // Ensures partial insertion method still works after removal
    test ( ' should not break the fragment insertion method ' , function ( ) {
      var additionalComponents = [
        { element : new Backbone.VisualComponent ( { styleClass : "more1" } ) , insertionPoint : 'suffix .targetArea' } ,
        { element : new Backbone.VisualComponent ( { styleClass : "more2" } ) , insertionPoint : 'suffix .targetArea' }
      ] ;
      arrangementVisualObject.insertComponent ( additionalComponents [ 0 ].insertionPoint , additionalComponents [ 0 ].element ) ;
      arrangementVisualObject.insertComponent ( additionalComponents [ 1 ].insertionPoint , additionalComponents [ 1 ].element ) ;
      arrangementVisualObject.display ( ) ;

      arrangementVisualObject._insertFragment ( 'suffix' , '.targetArea' , 0 , 3 ) [ 0 ].should.eql ( componentForRemoval.$el [ 0 ] ) ;
      arrangementVisualObject._insertFragment ( 'suffix' , '.targetArea' , 1 , 3 ) [ 0 ].should.eql ( additionalComponents [ 0 ].element.$el [ 0 ] ) ;
      arrangementVisualObject._insertFragment ( 'suffix' , '.targetArea' , 2 , 3 ) [ 0 ].should.eql ( additionalComponents [ 1 ].element.$el [ 0 ] ) ;

      arrangementVisualObject.eraseElement ( componentForRemoval ) ;

      arrangementVisualObject._insertFragment ( 'suffix' , '.targetArea' , 0 , 2 ) [ 0 ].should.eql ( additionalComponents [ 0 ].element.$el [ 0 ] ) ;
      arrangementVisualObject._insertFragment ( 'suffix' , '.targetArea' , 1 , 2 ) [ 0 ].should.eql ( additionalComponents [ 1 ].element.$el [ 0 ] ) ;
    } ) ;

    // Verifies that events are undelegated upon removal
    test ( ' should unbind handlers from the element ' , function ( ) {
      var verificationCallback = spyglass.spy ( ) ;
      arrangementVisualObject.componentEvents = { 'action' : verificationCallback } ;

      arrangementVisualObject.eraseElement ( componentForRemoval ) ;
      componentForRemoval.emit ( 'action' ) ;

      verificationCallback.should.not.have.been.called ;
    } ) ;
  } ) ;

  context ( ' .fetchComponent ( ) ' , function ( ) {
    // Returns the component from the specified location
    test ( ' should yield the element from the insertionPoint ' , function ( ) {
      var sampleComponent = new Backbone.VisualComponent ( ) ;
      var insertionPoint = 'suffix .targetArea' ;
      arrangementVisualObject.insertComponent ( insertionPoint , sampleComponent ) ;
      arrangementVisualObject.fetchComponent ( insertionPoint ).should.eql ( sampleComponent ) ;
    } ) ;

    // Returns undefined if no component exists at the location
    test ( ' should yield undefined if the element was absent ' , function ( ) {
      var insertionPoint = 'suffix .targetArea' ;
      expect.toBeUndefined ( arrangementVisualObject.fetchComponent ( insertionPoint ) ) ;
    } ) ;
  } ) ;

  context ( ' .resetComponents ( ) ' , function ( ) {
    // Confirms all components are removed
    test ( ' should remove all elements ' , function ( ) {
      var firstComponent = new Backbone.VisualComponent ( ) ;
      var secondComponent = new Backbone.VisualComponent ( ) ;
      var locationOne = 'suffix .locationOne' ;
      var locationTwo = 'suffix .locationTwo' ;
      var newComponentMap = { } ;
      newComponentMap [ locationTwo ] = secondComponent ;

      arrangementVisualObject.insertComponent ( locationOne , firstComponent ) ;
      arrangementVisualObject.fetchComponent ( locationOne ).should.not.be.empty ;
      arrangementVisualObject.resetComponents ( newComponentMap ) ;
      expect.toBeUndefined ( arrangementVisualObject.fetchComponent ( locationOne ) ) ;
    } ) ;

    // Verifies that new components are added to their correct locations
    test ( ' should re-add the elements supplied to the correct insertionPoint ' , function ( ) {
      var firstComponent = new Backbone.VisualComponent ( ) ;
      var secondComponent = new Backbone.VisualComponent ( ) ;
      var locationOne = 'suffix .locationOne' ;
      var locationTwo = 'suffix .locationTwo' ;
      var newComponentMap = { } ;
      newComponentMap [ locationTwo ] = secondComponent ;

      arrangementVisualObject.insertComponent ( locationOne , firstComponent ) ;
      arrangementVisualObject.resetComponents ( newComponentMap ) ;
      arrangementVisualObject.fetchComponent ( locationTwo ).should.eql ( secondComponent ) ;
    } ) ;
  } ) ;

  context ( ' .prepared ( ) ' , function ( ) {
    // Tests that the promise resolves only when all components and parent are ready
    test ( ' should be fulfilled when parent and all elements are prepared ( ) ' , function ( ) {
      var firstComponent = new PrimaryComponent ( ) ;
      var secondComponent = new PrimaryComponent ( ) ;

      var coreDisplayPromise = new $.Deferred ( ) ;
      var firstComponentPromise = new $.Deferred ( ) ;
      var secondComponentPromise = new $.Deferred ( ) ;

      arrangementVisualObject.insertComponent ( 'suffix .locationOne' , firstComponent ) ;
      arrangementVisualObject.insertComponent ( 'suffix .locationTwo' , secondComponent ) ;

      var readyMock1 = spyglass.createStub ( PrimaryComponent.basePrototype , "prepared" ).andReturns ( coreDisplayPromise ) ,
        readyMock2 = firstComponent.prepared.andReturns ( firstComponentPromise ) ,
        readyMock3 = secondComponent.prepared.andReturns ( secondComponentPromise ) ;

      arrangementVisualObject.prepared ( ).status ( ).should.eql ( 'awaiting' ) ;

      coreDisplayPromise.fulfill ( ) ;
      arrangementVisualObject.prepared ( ).status ( ).should.eql ( 'awaiting' ) ;

      firstComponentPromise.fulfill ( ) ;
      arrangementVisualObject.prepared ( ).status ( ).should.eql ( 'awaiting' ) ;

      secondComponentPromise.fulfill ( ) ;
      arrangementVisualObject.prepared ( ).status ( ).should.eql ( 'fulfilled' ) ;

      readyMock1.reset ( ) ;
      readyMock2.reset ( ) ;
      readyMock3.reset ( ) ;
    } ) ;
  } ) ;

  context ( ' .exchangeComponent ( ) ' , function ( ) {
    var firstComponent , secondComponent , insertionPoint ;
    // Setup for component swapping tests
    setupBeforeEach ( function ( ) {
      firstComponent = new PrimaryComponent ( { styleClass : 'first' } ) ;
      secondComponent = new PrimaryComponent ( { styleClass : 'second' } ) ;
      insertionPoint = 'suffix .targetArea' ;
    } ) ;

    // Verifies that an old component is replaced by a new one
    test ( ' should replace the previous element with the new element ' , function ( ) {
      arrangementVisualObject.insertComponent ( insertionPoint , firstComponent ) ;
      arrangementVisualObject.exchangeComponent ( insertionPoint , secondComponent ) ;

      arrangementVisualObject.fetchComponent ( insertionPoint ).should.eql ( secondComponent ) ;
    } ) ;

    // Ensures the new component is rendered correctly
    test ( ' should display the updated element ' , function ( ) {
      arrangementVisualObject = new StructureDisplay ( {
        layoutMarkup : '<div class="targetArea"><br></div>'
      } ) ;

      arrangementVisualObject.insertComponent ( insertionPoint , firstComponent ) ;
      arrangementVisualObject.display ( ) ;

      arrangementVisualObject.exchangeComponent ( insertionPoint , secondComponent ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><br><div class="second"></div></div>' ) ;
    } ) ;
  } ) ;

  context ( ' ._placePartial ( ) ' , function ( ) {
    var targetSelector , positionIndex , overallCount , insertedElementOne , insertedElementTwo ;
    // Setup for partial fragment insertion tests
    setupBeforeEach ( function ( ) {
      arrangementVisualObject = new StructureDisplay ( {
        layoutMarkup : '<div class="targetArea"><br></div>'
      } ) ;
      arrangementVisualObject.display ( ) ;
      targetSelector = ".targetArea" ;
      positionIndex = 0 ;
      overallCount = 2 ;

      insertedElementOne = ( new PrimaryComponent ( { styleClass : 'first' } ) ).$el ;
      insertedElementTwo = ( new PrimaryComponent ( { styleClass : 'second' } ) ).$el ;

    } ) ;

    // Test case for inner replacement
    test ( ' should replace the content of $el ' , function ( ) {
      var placementMethod = 'inside' ;
      arrangementVisualObject._placePartial ( placementMethod , targetSelector , positionIndex , overallCount , insertedElementOne ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><div class="first"></div></div>' ) ;

      arrangementVisualObject._placePartial ( placementMethod , targetSelector , positionIndex + 1 , overallCount , insertedElementTwo ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><div class="second"></div></div>' ) ;
    } ) ;

    // Test case for outer replacement
    test ( ' should add the element to outside ' , function ( ) {
      var placementMethod = 'outside' ;

      arrangementVisualObject._placePartial ( placementMethod , targetSelector , positionIndex , overallCount , insertedElementOne ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="first"></div>' ) ;

      arrangementVisualObject._placePartial ( placementMethod , targetSelector , positionIndex + 1 , overallCount , insertedElementTwo ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="first"></div>' ) ;

      arrangementVisualObject._placePartial ( placementMethod , '.first' , positionIndex + 1 , overallCount , insertedElementTwo ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="second"></div>' ) ;
    } ) ;

    // Test case for prepending
    test ( ' should add the element by prefix ' , function ( ) {
      var placementMethod = 'prefix' ;

      arrangementVisualObject._placePartial ( placementMethod , targetSelector , positionIndex , overallCount , insertedElementOne ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><div class="first"></div><br></div>' ) ;

      arrangementVisualObject._placePartial ( placementMethod , targetSelector , positionIndex + 1 , overallCount , insertedElementTwo ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><div class="second"></div><div class="first"></div><br></div>' ) ;
    } ) ;

    // Test case for appending
    test ( ' should add the element by suffix ' , function ( ) {
      var placementMethod = 'suffix' ;

      arrangementVisualObject._placePartial ( placementMethod , targetSelector , positionIndex , overallCount , insertedElementOne ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><br><div class="first"></div></div>' ) ;

      arrangementVisualObject._placePartial ( placementMethod , targetSelector , positionIndex + 1 , overallCount , insertedElementTwo ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><br><div class="first"></div><div class="second"></div></div>' ) ;
    } ) ;

    // Test case for inserting before
    test ( ' should add the element priorTo ' , function ( ) {
      var placementMethod = 'priorTo' ;

      arrangementVisualObject._placePartial ( placementMethod , targetSelector , positionIndex , overallCount , insertedElementOne ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="first"></div><div class="targetArea"><br></div>' ) ;

      arrangementVisualObject._placePartial ( placementMethod , targetSelector , positionIndex + 1 , overallCount , insertedElementTwo ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="first"></div><div class="second"></div><div class="targetArea"><br></div>' ) ;
    } ) ;

    // Test case for inserting after
    test ( ' should add the element following ' , function ( ) {
      var placementMethod = 'following' ;

      arrangementVisualObject._placePartial ( placementMethod , targetSelector , positionIndex , overallCount , insertedElementOne ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><br></div><div class="first"></div>' ) ;

      arrangementVisualObject._placePartial ( placementMethod , targetSelector , positionIndex + 1 , overallCount , insertedElementTwo ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><br></div><div class="second"></div><div class="first"></div>' ) ;
    } ) ;
  } ) ;

  context ( ' .display ( ) ' , function ( ) {
    var displayMainElement , displayChildComponents , displayStatus ;
    // Setup for rendering tests
    setupBeforeEach ( function ( ) {
      displayMainElement = spyglass.createStub ( arrangementVisualObject , 'displayElement' ).andReturns ( arrangementVisualObject ) ;
      displayChildComponents = spyglass.createStub ( arrangementVisualObject , 'displayComponents' ).andReturns ( arrangementVisualObject ) ;
      displayStatus = spyglass.spy ( arrangementVisualObject , 'displayStatus' ) ;
    } ) ;

    // Verifies the main element is rendered
    test ( ' should display the main element ' , function ( ) {
      arrangementVisualObject.display ( ) ;
      arrangementVisualObject.displayElement.should.be.calledOnce ;
    } ) ;

    // Confirms child components are rendered after the main element
    test ( ' should display child components after main element ' , function ( ) {
      arrangementVisualObject.display ( ) ;

      displayChildComponents.should.be.calledAfter ( displayMainElement ) ;
    } ) ;

    // Checks that the status is rendered after child components
    test ( ' should display status after child components ' , function ( ) {
      arrangementVisualObject.display ( ) ;

      displayStatus.should.be.calledAfter ( displayChildComponents ) ;
    } ) ;
    // Ensures method chaining is supported
    test ( ' should yield current object for method chaining ' , function ( ) {
      arrangementVisualObject.display ( ).should.eql ( arrangementVisualObject ) ;
    } ) ;
  } ) ;

  context ( ' .displayComponents ( ) ' , function ( ) {
    // Tests that all child components are rendered
    test ( ' display each child element ' , function ( ) {
      arrangementVisualObject = new StructureDisplay ( {
        layoutMarkup : '<div class="targetArea"><br></div>'
      } ) ;
      var firstComponent = new PrimaryComponent ( { styleClass : 'first' } ) ;
      var secondComponent = new PrimaryComponent ( { styleClass : 'second' } ) ;
      var locationOne = 'suffix .targetArea' ;
      var locationTwo = 'prefix .targetArea' ;
      arrangementVisualObject.insertComponent ( locationOne , firstComponent ) ;
      arrangementVisualObject.insertComponent ( locationTwo , secondComponent ) ;


      arrangementVisualObject.displayElement ( ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><br></div>' ) ;

      arrangementVisualObject.displayComponents ( ) ;
      arrangementVisualObject.$el.html ( ).should.eql ( '<div class="targetArea"><div class="second"></div><br><div class="first"></div></div>' ) ;


    } ) ;
  } ) ;

  context ( ' .connect ( ) ' , function ( ) {
    var connectMainElement , connectChildComponents , connectStatus ;
    // Setup for attachment tests
    setupBeforeEach ( function ( ) {
      connectMainElement = spyglass.createStub ( arrangementVisualObject , 'connectMainElement' ).andReturns ( arrangementVisualObject ) ;
      connectChildComponents = spyglass.createStub ( arrangementVisualObject , 'connectChildComponents' ).andReturns ( arrangementVisualObject ) ;
      connectStatus = spyglass.spy ( arrangementVisualObject , 'connectStatus' ) ;
    } ) ;

    // Verifies the main element is attached
    test ( ' should link the main element ' , function ( ) {
      arrangementVisualObject.connect ( ) ;
      arrangementVisualObject.connectMainElement.should.be.calledOnce ;
    } ) ;

    // Confirms child components are attached after the main element
    test ( ' should link child components after main element ' , function ( ) {
      arrangementVisualObject.connect ( ) ;

      connectChildComponents.should.be.calledAfter ( connectMainElement ) ;
    } ) ;