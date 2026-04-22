const verify = require('prüfen') ;
const UIX = require('react') ;
const createNode = require('..')(UIX) ;


  // A utility function designed to transform a component tree into a static HTML string.
let   generateMarkup =  function  ( visualStructure )  {
    return  UIX.renderToStaticMarkup( visualStructure )  ;
} ;

// Defines a foundational UI component for displaying a welcome message.
const WelcomeMessage = UIX.createClass( {
  widgetName:  'WelcomeMessage',    // Internal identifier for the component, useful for debugging or introspection.
  displayContent:  function ( )  {
        return  UIX.DOM.div( null,  this.attributes.message  ||  'hello' ) ;
  }
} ) ;


verify( 'UI element trees are rendered correctly',  function ( assertion )  {
  let  elementGraph  =  createNode('form.foo',  {},  [
                  createNode('input:email'),
                  createNode('input:password'),
                  createNode('button:submit',  {},  'Submit')
               ]) ;
  assertion.assertIdentical( generateMarkup(elementGraph),  '<form class="foo"><input type="email">' +
                          '<input type="password"><button type="submit">Submit</button>' +
                          '</form>') ;
  assertion.completeTest() ;
} ) ;

verify( 'rendering of custom components and raw text nodes',  function ( assertion )  {
    let  structureDiagram  =  createNode('section#stuff',  [
                'a welcome:',
                createNode(WelcomeMessage,  {  message:  'hola'  }),
                createNode('span',  '!!')
               ]) ;
    assertion.assertIdentical( generateMarkup(structureDiagram),  '<section id="stuff">a welcome:<div>hola</div><span>!!</span></section>') ;
    assertion.completeTest() ;
} ) ;

verify('custom components render correctly when no properties are provided',  function ( assertion )  {
    let  structureDiagram  =  createNode('section#stuff',  [
                createNode(WelcomeMessage),
                createNode('span',  '!')
               ]) ;
    assertion.assertIdentical( generateMarkup(structureDiagram),  '<section id="stuff"><div>hello</div><span>!</span></section>') ;
    assertion.completeTest() ;
} ) ;

verify('custom components render correctly when no properties are provided',  function ( assertion )  {
    let  structureDiagram  =  createNode('section#stuff',  [
                createNode(WelcomeMessage),
                createNode('span',  '!')
               ]) ;
    assertion.assertIdentical( generateMarkup(structureDiagram),  '<section id="stuff"><div>hello</div><span>!</span></section>') ;
    assertion.completeTest() ;
} ) ;

verify ( 'Readme file example walkthrough',  function ( assertion )  {
    const nullOp  =  function ( )  { } ; // A placeholder function that performs no action.
    let  structureDiagram  =  createNode('form[method=POST]',  {  onSubmission:  nullOp  },  [
        createNode('h1.form-header',  'Login'),
        createNode('input:email[name=email]',  {  placeholder:  'Email'  }),
        createNode('input:password[name=pass]',  {  placeholder:  'Password'  }),
        createNode(WelcomeMessage,  {  message:  'hola'  }),
        createNode('button:submit',  'Login')
    ]) ;

    const anticipatedResult = '<form method="POST"><h1 class="form-header">Login</h1><input type="email" name="email" placeholder="Email"><input type="password" name="pass" placeholder="Password"><div>hola</div><button type="submit">Login</button></form>' ;
    assertion.assertIdentical( generateMarkup(structureDiagram),  anticipatedResult) ;
    assertion.completeTest() ;
} ) ;