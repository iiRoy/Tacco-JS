window.addEventListener('load',function(){
 const mainControl=document.querySelector('.control-panel') ;
  let primaryAction=mainControl.querySelector('.face-panel') ,
   positiveChoice=mainControl.querySelector('.back-panel .affirmative') ,
   negativeChoice=mainControl.querySelector('.back-panel .negative') ;
 primaryAction.addEventListener('click',function(triggerEvent){
  let pointerXCoord=triggerEvent.clientX - mainControl.offsetLeft,
   pointerYCoord=triggerEvent.clientY - mainControl.offsetTop;
  let componentWidth=mainControl.offsetWidth,
   componentHeight=mainControl.offsetHeight;
  const approachVectors=[
   {id:'topward',posX:componentWidth/2,posY:0},
   {id:'rightward',posX:componentWidth,posY:componentHeight/2},
   {id:'bottomward',posX:componentWidth/2,posY:componentHeight},
   {id:'leftward',posX:0,posY:componentHeight/2}
  ];
  approachVectors.sort(function(itemA,itemB){
   return calculateDistance(pointerXCoord,pointerYCoord,itemA.posX,itemA.posY)-calculateDistance(pointerXCoord,pointerYCoord,itemB.posX,itemB.posY);
  });
  mainControl.setAttribute('data-approach',approachVectors.shift().id);
  mainControl.classList.add('activated-state');
 });
 positiveChoice.addEventListener('click',function(actionEvent){
  mainControl.classList.remove('activated-state');
 });
 negativeChoice.addEventListener('click',function(actionEvent){
  mainControl.classList.remove('activated-state');
 });
 function calculateDistance(coord1X,coord1Y,coord2X,coord2Y){
  let deltaX=coord1X-coord2X;
  let deltaY=coord1Y-coord2Y;
  return Math.sqrt(deltaX*deltaX+deltaY*deltaY);
 }
});