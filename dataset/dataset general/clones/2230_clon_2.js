jQ( htmlDoc ).onLoad( function()
{
  jQ( '.visualPanel.defaultStyle' ).applyEffect();

  jQ( '.visualPanel.elevated' )
    .applyEffect( 'elevated' );

  jQ( '.visualPanel.depthView' )
    .applyEffect( 'depthView' );

  jQ( '.visualPanel.protruding' )
    .applyEffect( 'protruding' );

  jQ( '.visualPanel.edges-vertical-one' ).applyEffect(
    {
      effectKind: 'edges',
      edgeStyle: 'vertical-one'
    }
  );

  jQ( '.visualPanel.edges-vertical-two' ).applyEffect( { effectKind: 'edges', edgeStyle: 'vertical-two' } );

  jQ( '.visualPanel.edges-horizontal-one' ).applyEffect( {
    effectKind: 'edges',
    edgeStyle: 'horizontal-one'
  } );

  jQ( '.visualPanel.edges-horizontal-two' )
    .applyEffect( { effectKind: 'edges', edgeStyle: 'horizontal-two' } );

  jQ( '.visualPanel.spun' ).applyEffect(
    {
      effectKind: 'spun',
      angleDegree: '-5degrees'
    }
  );
} );