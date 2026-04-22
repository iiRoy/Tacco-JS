var    RippleEffect    =    require (  "/lib/Ti.RippleEffect"  )  ;  //  This  line  imports  the  custom  RippleEffect  module.

//  Initialize  the  main  application  window.
//  This  window  will  contain  all  the  interactive  elements.
var  win  =  Ti.UI.createWindow (  {
  backgroundColor  :  "#000"  //  Set  the  background  color  to  black  for  a  dark  theme.
}  )  ;

//  Now,  we'll  define  several  UI  views.
//  Each  view  is  configured  to  trigger  a  ripple  animation  upon  user  interaction.

//  Define  the  red-colored  view.
var  redView  =  Ti.UI.createView (  {
  width  :  320  ,
  height  :  150  ,
  backgroundColor  :  "red"  ,
  top  :  0  ,
  left  :  0  ,
  rippleEffect  :  true  //  Enable  the  ripple  effect  for  this  specific  view.
}  )  ;

//  Define  the  blue-colored  view.
var  blueView  =  Ti.UI.createView (  {
  width  :  160  ,
  height  :  150  ,
  backgroundColor  :  "blue"  ,
  top  :  150  ,
  left  :  0  ,
  rippleEffect  :  true  //  The  ripple  effect  is  also  enabled  for  the  blue  view.
}  )  ;

//  Define  the  green-colored  view.
var  greenView  =  Ti.UI.createView (  {
  width  :  160  ,
  height  :  150  ,
  backgroundColor  :  "green"  ,
  top  :  150  ,
  right  :  0  ,
  rippleEffect  :  true  //  This  green  view  will  also  show  a  ripple  on  click.
}  )  ;

//  Define  the  purple-colored  view.
var  purpleView  =  Ti.UI.createView (  {
  width  :  320  ,
  height  :  150  ,
  backgroundColor  :  "purple"  ,
  top  :  300  ,
  left  :  0  ,
  rippleEffect  :  true  //  The  ripple  effect  is  active  on  the  purple  view  as  well.
}  )  ;


//  Add  all  the  previously  defined  views  to  the  main  window.
win.add (  redView  )  ;
win.add (  blueView  )  ;
win.add (  greenView  )  ;
win.add (  purpleView  )  ;

//  Attach  an  event  listener  to  the  window  for  handling  'click'  events.
win.addEventListener (  "click"  ,  function (  e  )  {
  //  Check  if  the  clicked  UI  element  (e.source)  has  the  'rippleEffect'  property  set  to  true.
  if  (  e.source.rippleEffect  )  {
    //  If  the  ripple  effect  is  enabled,  initiate  the  animation.
    RippleEffect.create (  e  )  ;  //  Pass  the  event  object  to  the  RippleEffect  module.
  }
}  )  ;

//  Finally,  open  the  window  to  make  it  visible  to  the  user.
win.open (  )  ;