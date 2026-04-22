// This  function  serves  to  evaluate  an  incoming  string  of  data,
// performing  a  specific  financial  comparison  based  on  its  contents.
function ProcessInputData (receivedString)
{
    // The initial  step  is  to  break  down  the  provided  input  string
    // into  an  array  of  sub-strings,  using  a  space  character  as  the  delimiter.
    var  tokenizedString = receivedString.split(' ');


    // We extract  the  first  element  from  our  newly  formed  array,
    // which  represents  the  number  of  items  or  units  in  question.
    var  quantityOfUnits = tokenizedString[0];

    // A constant  value  is  defined  here,  representing  the  monetary
    // cost  associated  with  a  single  item  or  unit.
    const  costPerUnit  =  500;

    // The  total  expenditure  is  computed  by  multiplying  the  unit  cost
    // by  the  parsed  integer  value  of  the  quantity  of  units.
    var  aggregateCost  =  costPerUnit  *  parseInt(quantityOfUnits,  10);

    // The  second  element  from  the  array  is  taken  as  the  declared  monetary  amount.
    var  declaredAmount = tokenizedString[1];
    
    // A conditional  check  is  performed  to  determine  if  the  calculated
    // aggregate  cost  is  greater  than  or  equal  to  the  declared  amount.
    if  (aggregateCost  >=  declaredAmount)  {
        // If the  condition  holds  true,  a  positive  confirmation  is  logged  to  the  console.
        console.log('positiveOutcome');
    }
    else  {
        // Otherwise,  a  negative  indication  is  output  to  the  console.
        console.log('negativeOutcome');
    }
}

// --- The following portion of the code is for environment setup and should not be altered. ---
// It handles reading input from standard input and then invokes the main processing routine.
ProcessInputData( require("fs").readFileSync("/dev/stdin", "utf8") );