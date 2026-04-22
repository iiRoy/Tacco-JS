const fareTable = {};
fareTable["1to2"] = 300;
fareTable["1to3"] = 500;
fareTable["1to4"] = 600;
fareTable["1to5"] = 700;
fareTable["1to6"] = 1350;
fareTable["1to7"] = 1650;

fareTable["2to1"] = 6;
fareTable["2to3"] = 350;
fareTable["2to4"] = 450;
fareTable["2to5"] = 600;
fareTable["2to6"] = 1150;
fareTable["2to7"] = 1500;

fareTable["3to1"] = 13;
fareTable["3to2"] = 7;
fareTable["3to4"] = 250;
fareTable["3to5"] = 400;
fareTable["3to6"] = 1000;
fareTable["3to7"] = 1350;

fareTable["4to1"] = 18;
fareTable["4to2"] = 12;
fareTable["4to3"] = 5;
fareTable["4to5"] = 250;
fareTable["4to6"] = 850;
fareTable["4to7"] = 1300;

fareTable["5to1"] = 23;
fareTable["5to2"] = 17;
fareTable["5to3"] = 10;
fareTable["5to4"] = 5;
fareTable["5to6"] = 600;
fareTable["5to7"] = 1150;

fareTable["6to1"] = 43;
fareTable["6to2"] = 37;
fareTable["6to3"] = 30;
fareTable["6to4"] = 25;
fareTable["6to5"] = 20;
fareTable["6to7"] = 500;

fareTable["7to1"] = 58;
fareTable["7to2"] = 52;
fareTable["7to3"] = 45;
fareTable["7to4"] = 40;
fareTable["7to5"] = 35;
fareTable["7to6"] = 15;

const rawInputText = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLineArray = (rawInputText.replace(/\n$/, "")).split("\n");

while (true) {
    let originIdentifier = Number(inputLineArray.shift());
    if (originIdentifier === 0) break;

    let departureTimeComponents = (inputLineArray.shift()).split(" ").map(Number);
    let destinationIdentifier = Number(inputLineArray.shift());
    let arrivalTimeComponents = (inputLineArray.shift()).split(" ").map(Number);

    let totalDepartureMinutes = (Number.parseInt(departureTimeComponents[0], 10) * 60) + Number.parseInt(departureTimeComponents[1], 10);
    let totalArrivalMinutes = (Number.parseInt(arrivalTimeComponents[0], 10) * 60) + Number.parseInt(arrivalTimeComponents[1], 10);

    let discountConditionCounter = 0;

    if ((totalDepartureMinutes >= 1050 && totalDepartureMinutes <= 1170) || (totalArrivalMinutes >= 1050 && totalArrivalMinutes <= 1170)) {
        discountConditionCounter++;
    }

    if (fareTable[destinationIdentifier + "to" + originIdentifier] <= 40) {
        discountConditionCounter++;
    }

    let finalFareAmount = fareTable[originIdentifier + "to" + destinationIdentifier];

    if (discountConditionCounter === 2) {
        finalFareAmount = Math.floor(finalFareAmount / 2);
        while (finalFareAmount % 50 !== 0) {
            finalFareAmount++;
        }
    }

    console.log(finalFareAmount);
}