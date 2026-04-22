'use strict';
var CalendarWidget=function(targetElement){
 var inst=this;
 var jWindow=$(window['addEventListener']?window:document.body);
 var jInputBox=this.jInputBox=$(targetElement).children('input:first-child');
 var inputBoxElem=this.inputBoxElem=jInputBox.get(0);
 var jTriggerLabel=this.jTriggerLabel=jInputBox.siblings('label.add-on');
 var triggerLabelElem=this.triggerLabelElem=jTriggerLabel.get(0);
 var jCalendarPanel=this.jCalendarPanel=jTriggerLabel.children('div.calendar');
 var calendarPanelElem=this.calendarPanelElem=jCalendarPanel.get(0);
 var currentDate=this.currentDate=this.parseStringToDate(jInputBox.val())||new Date();
 var displayFormat=jInputBox.data('format');
 var currentYear=currentDate.getFullYear();
 var currentMonth=currentDate.getMonth();
 var isYearAdjusting=false;
 var isMonthAdjusting=false;
 var initialDragYear=null;
 var initialDragMonth=null;
 var dragStartX=-1;
 var dragStartY=-1;

 this.configureCalendar(currentYear,currentMonth);

 jInputBox.bind('keydown keyup keypress',function(eventObject){
  return false;
 });

 jCalendarPanel.bind("webkitTransitionEnd transitionend oTransitionEnd transitionEnd",function(eventObject){
  if(!jInputBox.is(':focus')) return;

  var updatedDate=inst.currentDate=inst.parseStringToDate(jInputBox.val());

  if(!updatedDate) return;

  var updatedYear=updatedDate.getFullYear();
  var updatedMonth=updatedDate.getMonth();
  inst.configureCalendar(updatedYear,updatedMonth);
 });

 jTriggerLabel.bind('mousedown',function(eventObject){
  if(jInputBox.is(':focus')){
   jInputBox.blur();
  } else {
   jInputBox.focus();
  }
  return false;
 });

 jCalendarPanel.delegate('td','mousedown',function(eventObject){
  var jCurrentTarget=$(this);

  currentDate=inst.currentDate=new Date(jCurrentTarget.data('year'),jCurrentTarget.data('month'),jCurrentTarget.data('date'));

  jCalendarPanel.find('td.selected').removeClass('selected');
  jCurrentTarget.addClass('selected');

  var chosenYearNum=currentDate.getFullYear()+'';
  var chosenMonthNum=currentDate.getMonth()+1+'';
  var chosenDayNum=currentDate.getDate()+'';
  var formattedDateString=new String(displayFormat);

  formattedDateString=formattedDateString
   .replace('yyyy',chosenYearNum)
   .replace('yy',chosenYearNum.substring(2))
   .replace('mm',chosenMonthNum<10?'0'+chosenMonthNum:chosenMonthNum)
   .replace('m',chosenMonthNum)
   .replace('dd',chosenDayNum<10?'0'+chosenDayNum:chosenDayNum)
   .replace('d',chosenDayNum);

  jInputBox.val(formattedDateString);

  setTimeout(function(){
   jInputBox.blur();
  },200);

  return false;
 });

 jCalendarPanel.delegate('th','mousedown',function(eventObject){
  var jCurrentTarget=$(this);
  var buttonAction=jCurrentTarget.data('value');

  if(!buttonAction) return;

  var currentYearVal=inst.currentYear;
  var currentMonthVal=inst.currentMonth;

  if(buttonAction==='year'){
   isYearAdjusting=true;
  } else if(buttonAction==='month'){
   isMonthAdjusting=true;
  }

  if(isYearAdjusting||isMonthAdjusting){
   initialDragYear=currentYearVal;
   initialDragMonth=currentMonthVal;
   dragStartX=eventObject.pageX;
   dragStartY=eventObject.pageY;
  }
  else {
   currentMonthVal+=parseInt(buttonAction,10);

   if(currentMonthVal<0){
    currentMonthVal=11;
    currentYearVal--;
   } else if(currentMonthVal>11){
    currentMonthVal=0;
    currentYearVal++;
   }

   inst.configureCalendar(currentYearVal,currentMonthVal);
  }
  return false;
 });

 jWindow.bind('mousemove',function(eventObject){
  if(!isYearAdjusting&&!isMonthAdjusting) return;

  var currentXpos=eventObject.pageX;
  var currentYpos=eventObject.pageY;
  var diffX=currentXpos-dragStartX;
  var diffY=currentYpos-dragStartY;
  var adjustedYear=initialDragYear;
  var adjustedMonth=initialDragMonth;

  if(isYearAdjusting){
   adjustedYear+=Math.floor((diffX+diffY)/16);
  } else {
   adjustedMonth+=Math.floor((diffX+diffY)/16);
   adjustedYear+=Math.floor(adjustedMonth/12);
   adjustedMonth=adjustedMonth%12;
   adjustedMonth+=(adjustedMonth<0)?12:0;
  }

  inst.configureCalendar(adjustedYear,adjustedMonth);
 });

 jWindow.bind('mouseup',function(eventObject){
  if(!isYearAdjusting&&!isMonthAdjusting) return;

  isYearAdjusting=isMonthAdjusting=false;
  initialDragYear=initialDragMonth=null;
  dragStartX=dragStartY=-1;
 });

 jInputBox.data('calendarwidget',this);
};

CalendarWidget.prototype={
 inputBoxElem:null,
 jInputBox:null,
 triggerLabelElem:null,
 jTriggerLabel:null,
 calendarPanelElem:null,
 jCalendarPanel:null,
 currentDate:null,
 displayFormat:'yyyy-mm-dd',
 currentYear:0,
 currentMonth:0,
 retrieveDaysInMonth:function(yearVal,monthVal){
  return 32-new Date(yearVal,monthVal,32).getDate();
 },
 fetchMonthName:function(monthVal){
  switch(monthVal){
   case 0: return 'January';
   case 1: return 'February';
   case 2: return 'March';
   case 3: return 'April';
   case 4: return 'May';
   case 5: return 'June';
   case 6: return 'July';
   case 7: return 'August';
   case 8: return 'September';
   case 9: return 'October';
   case 10: return 'November';
   case 11: return 'December';
  }
 },
 configureCalendar:function(yearVal,monthVal){
  var firstDayOfPeriod=new Date(yearVal,monthVal,1);
  var startDayOfWeek=firstDayOfPeriod.getDay();
  var totalDaysInMonth=this.retrieveDaysInMonth(yearVal,monthVal);

  var todayFullDatum=new Date();
  var todayYearNum=todayFullDatum.getFullYear();
  var todayMonthNum=todayFullDatum.getMonth();
  var todayDayNum=todayFullDatum.getDate();

  var chosenFullDatum=this.currentDate;
  var chosenYearNum=chosenFullDatum.getFullYear();
  var chosenMonthNum=chosenFullDatum.getMonth();
  var chosenDayNum=chosenFullDatum.getDate();

  var dayCounter=0;

  var tableHeaderContent='<thead>'+
   '<tr>'+
    '<th data-value="-1">&lt;</th>'+
    '<th data-value="month" colspan="3" style="border-right: none;">'+this.fetchMonthName(monthVal)+'</th>'+
    '<th data-value="year" colspan="2">'+yearVal+'</th>'+
    '<th data-value="1">&gt;</th>'+
   '</tr>'+
   '<tr>'+
    '<th>S</th><th>M</th><th>T</th><th>W</th><th>H</th><th>F</th><th>S</th>'+
   '</tr>'+
  '</thead>';

  var tableBodyContent='<tbody>';

  for(var weekIndex=0;weekIndex<6;weekIndex++){
   tableBodyContent+='<tr>';

   for(var dayIndex=0;dayIndex<7;dayIndex++){
    if(dayCounter>0||dayIndex===startDayOfWeek){
     dayCounter++;

     if(dayCounter<=totalDaysInMonth){
      tableBodyContent+='<td class="';

      if(todayYearNum===yearVal&&todayMonthNum===monthVal&&todayDayNum===dayCounter){
       tableBodyContent+='today ';
      }

      if(chosenYearNum===yearVal&&chosenMonthNum===monthVal&&chosenDayNum===dayCounter){
       tableBodyContent+='selected ';
      }

      tableBodyContent+='" data-year="'+yearVal+'" data-month="'+monthVal+'" data-date="'+dayCounter+'">'+dayCounter+'</td>';
     } else {
      tableBodyContent+='<td>&nbsp;</td>';
     }
    } else {
     tableBodyContent+='<td>&nbsp;</td>';
    }
   }
   tableBodyContent+='</tr>';
  }
  tableBodyContent+='</tbody>';

  this.jCalendarPanel.html('<table>'+tableHeaderContent+tableBodyContent+'</table>');
  this.currentYear=yearVal;
  this.currentMonth=monthVal;
 },
 formatDateToString:function(dateObj){
  var yearStr=dateObj.getFullYear();
  yearStr=''+yearStr;
  var monthStr=dateObj.getMonth()+1;
  monthStr=((monthStr<10)?'0':'')+monthStr;
  var dayStr=dateObj.getDate();
  dayStr=((dayStr<10)?'0':'')+dayStr;
  return yearStr+'-'+monthStr+'-'+dayStr;
 },
 parseStringToDate:function(dateStringVal){
  var dateComponents=dateStringVal.split('-');
  if(dateComponents.length!==3) return null;
  var yearNum=parseInt(dateComponents[0],10);
  var monthNum=parseInt(dateComponents[1],10)-1;
  var dayNum=parseInt(dateComponents[2],10);
  return new Date(yearNum,monthNum,dayNum);
 },
};

$(function(){

 var jCalWidgets=$('.datepicker');
 jCalWidgets.each(function(idx,domElement){new CalendarWidget(domElement);});

});