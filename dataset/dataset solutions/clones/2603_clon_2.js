"use strict";

let largeNum=function(undefVal){
    var CHUNK_SIZE=1e7,
        SEGMENT_BITS=7,
        JS_SAFE_LIMIT=9007199254740992,
        MAX_SAFE_JS_INT_DIGITS=compactToDigits(JS_SAFE_LIMIT),
        MATH_LOG_SAFE_LIMIT=Math.log(JS_SAFE_LIMIT);

    function NumericalEntity(valInput, numBase){
        if(typeof valInput==="undefined")
            return NumericalEntity[0];
        if(typeof numBase!=="undefined")
            return+numBase===10?interpretInput(valInput):interpretBaseString(valInput,numBase);
        return interpretInput(valInput)
    }

    function HugeNumber(valContent, isNegativeFlag){
        this.valData=valContent;
        this.polarity=isNegativeFlag;
        this.isCompact=false
    }
    HugeNumber.prototype=Object.create(NumericalEntity.prototype);

    function TinyNumber(valContent){
        this.valData=valContent;
        this.polarity=valContent<0;
        this.isCompact=true
    }
    TinyNumber.prototype=Object.create(NumericalEntity.prototype);

    function isWithinJsLimit(num){
        return-JS_SAFE_LIMIT<num&&num<JS_SAFE_LIMIT
    }

    function compactToDigits(num){
        if(num<1e7)
            return[num];
        if(num<1e14)
            return[num%1e7,Math.floor(num/1e7)];
        return[num%1e7,Math.floor(num/1e7)%1e7,Math.floor(num/1e14)]
    }

    function digitsToCompact(digitArray){
        normalizeDigits(digitArray);
        var arrayLength=digitArray.length;
        if(arrayLength<4&&compareVectorMagnitudes(digitArray,MAX_SAFE_JS_INT_DIGITS)<0){
            switch(arrayLength){
                case 0: return 0;
                case 1: return digitArray[0];
                case 2: return digitArray[0]+digitArray[1]*CHUNK_SIZE;
                default: return digitArray[0]+(digitArray[1]+digitArray[2]*CHUNK_SIZE)*CHUNK_SIZE
            }
        }
        return digitArray
    }

    function normalizeDigits(vector){
        var idx=vector.length;
        while(vector[--idx]===0);
        vector.length=idx+1
    }

    function makeZeroArray(size){
        var zeroArr=new Array(size);
        var counter=-1;
        while(++counter<size){
            zeroArr[counter]=0
        }
        return zeroArr
    }

    function chopDecimal(num){
        if(num>0)
            return Math.floor(num);
        return Math.ceil(num)
    }

    function sumDigits(firstArr, secondArr){
        var lenA=firstArr.length,
            lenB=secondArr.length,
            resultArr=new Array(lenA),
            carryOver=0,
            baseVal=CHUNK_SIZE,
            currentSum,
            loopIdx;
        for(loopIdx=0;loopIdx<lenB;loopIdx++){
            currentSum=firstArr[loopIdx]+secondArr[loopIdx]+carryOver;
            carryOver=currentSum>=baseVal?1:0;
            resultArr[loopIdx]=currentSum-carryOver*baseVal
        }
        while(loopIdx<lenA){
            currentSum=firstArr[loopIdx]+carryOver;
            carryOver=currentSum===baseVal?1:0;
            resultArr[loopIdx++]=currentSum-carryOver*baseVal
        }
        if(carryOver>0)
            resultArr.push(carryOver);
        return resultArr
    }

    function sumAnyDigits(firstArr, secondArr){
        if(firstArr.length>=secondArr.length)
            return sumDigits(firstArr,secondArr);
        return sumDigits(secondArr,firstArr)
    }

    function sumWithScalar(digitArray, scalarCarry){
        var arrLen=digitArray.length,
            resArr=new Array(arrLen),
            baseVal=CHUNK_SIZE,
            tempSum,
            idx;
        for(idx=0;idx<arrLen;idx++){
            tempSum=digitArray[idx]-baseVal+scalarCarry;
            scalarCarry=Math.floor(tempSum/baseVal);
            resArr[idx]=tempSum-scalarCarry*baseVal;
            scalarCarry+=1
        }
        while(scalarCarry>0){
            resArr[idx++]=scalarCarry%baseVal;
            scalarCarry=Math.floor(scalarCarry/baseVal)
        }
        return resArr
    }

    HugeNumber.prototype.unite=function(otherVal){
        var parsedOther=interpretInput(otherVal);
        if(this.polarity!==parsedOther.polarity){
            return this.deduct(parsedOther.invertSign())
        }
        var arrA=this.valData,
            arrB=parsedOther.valData;
        if(parsedOther.isCompact){
            return new HugeNumber(sumWithScalar(arrA,Math.abs(arrB)),this.polarity)
        }
        return new HugeNumber(sumAnyDigits(arrA,arrB),this.polarity)
    };
    HugeNumber.prototype.sum=HugeNumber.prototype.unite;

    TinyNumber.prototype.unite=function(otherVal){
        var parsedOther=interpretInput(otherVal);
        var numA=this.valData;
        if(numA<0!==parsedOther.polarity){
            return this.deduct(parsedOther.invertSign())
        }
        var numB=parsedOther.valData;
        if(parsedOther.isCompact){
            if(isWithinJsLimit(numA+numB))
                return new TinyNumber(numA+numB);
            numB=compactToDigits(Math.abs(numB))
        }
        return new HugeNumber(sumWithScalar(numB,Math.abs(numA)),numA<0)
    };
    TinyNumber.prototype.sum=TinyNumber.prototype.unite;

    function deductDigits(minuendArr, subtrahendArr){
        var lenMin=minuendArr.length,
            lenSub=subtrahendArr.length,
            resArr=new Array(lenMin),
            borrowVal=0,
            baseVal=CHUNK_SIZE,
            diffVal;
        for(var idx=0;idx<lenSub;idx++){
            diffVal=minuendArr[idx]-borrowVal-subtrahendArr[idx];
            if(diffVal<0){
                diffVal+=baseVal;
                borrowVal=1
            } else borrowVal=0;
            resArr[idx]=diffVal
        }
        for(idx=lenSub;idx<lenMin;idx++){
            diffVal=minuendArr[idx]-borrowVal;
            if(diffVal<0)
                diffVal+=baseVal;
            else{
                resArr[idx++]=diffVal;
                break
            }
            resArr[idx]=diffVal
        }
        for(;idx<lenMin;idx++){
            resArr[idx]=minuendArr[idx]
        }
        normalizeDigits(resArr);
        return resArr
    }

    function deductAnyDigits(arrA, arrB, signResult){
        var finalValue;
        if(compareVectorMagnitudes(arrA,arrB)>=0){
            finalValue=deductDigits(arrA,arrB)
        } else {
            finalValue=deductDigits(arrB,arrA);
            signResult=!signResult
        }
        finalValue=digitsToCompact(finalValue);
        if(typeof finalValue==="number"){
            if(signResult)
                finalValue=-finalValue;
            return new TinyNumber(finalValue)
        }
        return new HugeNumber(finalValue,signResult)
    }

    function deductScalar(digitArr, scalarVal, signResult){
        var arrLen=digitArr.length,
            resArr=new Array(arrLen),
            carryVal=-scalarVal,
            baseVal=CHUNK_SIZE,
            idx,
            diffVal;
        for(idx=0;idx<arrLen;idx++){
            diffVal=digitArr[idx]+carryVal;
            carryVal=Math.floor(diffVal/baseVal);
            diffVal%=baseVal;
            resArr[idx]=diffVal<0?diffVal+baseVal:diffVal
        }
        resArr=digitsToCompact(resArr);
        if(typeof resArr==="number"){
            if(signResult)
                resArr=-resArr;
            return new TinyNumber(resArr)
        }
        return new HugeNumber(resArr,signResult)
    }

    HugeNumber.prototype.deduct=function(otherVal){
        var parsedOther=interpretInput(otherVal);
        if(this.polarity!==parsedOther.polarity){
            return this.unite(parsedOther.invertSign())
        }
        var arrA=this.valData,
            arrB=parsedOther.valData;
        if(parsedOther.isCompact)
            return deductScalar(arrA,Math.abs(arrB),this.polarity);
        return deductAnyDigits(arrA,arrB,this.polarity)
    };
    HugeNumber.prototype.take=HugeNumber.prototype.deduct;

    TinyNumber.prototype.deduct=function(otherVal){
        var parsedOther=interpretInput(otherVal);
        var numA=this.valData;
        if(numA<0!==parsedOther.polarity){
            return this.unite(parsedOther.invertSign())
        }
        var numB=parsedOther.valData;
        if(parsedOther.isCompact){
            return new TinyNumber(numA-numB)
        }
        return deductScalar(numB,Math.abs(numA),numA>=0)
    };
    TinyNumber.prototype.take=TinyNumber.prototype.deduct;

    HugeNumber.prototype.invertSign=function(){
        return new HugeNumber(this.valData,!this.polarity)
    };

    TinyNumber.prototype.invertSign=function(){
        var currentSign=this.polarity;
        var compactVal=new TinyNumber(-this.valData);
        compactVal.polarity=!currentSign;
        return compactVal
    };

    HugeNumber.prototype.absoluteValue=function(){
        return new HugeNumber(this.valData,false)
    };

    TinyNumber.prototype.absoluteValue=function(){
        return new TinyNumber(Math.abs(this.valData))
    };

    function longMultiplication(arrA, arrB){
        var lenA=arrA.length,
            lenB=arrB.length,
            totalLen=lenA+lenB,
            resArr=makeZeroArray(totalLen),
            baseVal=CHUNK_SIZE,
            productVal,
            carryVal,
            idxA,
            digitA,
            digitB;
        for(idxA=0;idxA<lenA;++idxA){
            digitA=arrA[idxA];
            for(var idxB=0;idxB<lenB;++idxB){
                digitB=arrB[idxB];
                productVal=digitA*digitB+resArr[idxA+idxB];
                carryVal=Math.floor(productVal/baseVal);
                resArr[idxA+idxB]=productVal-carryVal*baseVal;
                resArr[idxA+idxB+1]+=carryVal
            }
        }
        normalizeDigits(resArr);
        return resArr
    }

    function scalarMultiplication(digitArr, scalarVal){
        var arrLen=digitArr.length,
            resArr=new Array(arrLen),
            baseVal=CHUNK_SIZE,
            carryVal=0,
            productVal,
            idx;
        for(idx=0;idx<arrLen;idx++){
            productVal=digitArr[idx]*scalarVal+carryVal;
            carryVal=Math.floor(productVal/baseVal);
            resArr[idx]=productVal-carryVal*baseVal
        }
        while(carryVal>0){
            resArr[idx++]=carryVal%baseVal;
            carryVal=Math.floor(carryVal/baseVal)
        }
        return resArr
    }

    function prependZeros(digitArr, numZeros){
        var newArr=[];
        while(numZeros-- >0)
            newArr.push(0);
        return newArr.concat(digitArr)
    }

    function karatsubaProduct(xArr, yArr){
        var nLen=Math.max(xArr.length,yArr.length);
        if(nLen<=30)
            return longMultiplication(xArr,yArr);
        nLen=Math.ceil(nLen/2);
        var xHigh=xArr.slice(nLen),
            xLow=xArr.slice(0,nLen),
            yHigh=yArr.slice(nLen),
            yLow=yArr.slice(0,nLen);
        var p1=karatsubaProduct(xLow,yLow),
            p2=karatsubaProduct(xHigh,yHigh),
            p3=karatsubaProduct(sumAnyDigits(xLow,xHigh),sumAnyDigits(yLow,yHigh));
        var finalProduct=sumAnyDigits(sumAnyDigits(p1,prependZeros(deductDigits(deductDigits(p3,p1),p2),nLen)),prependZeros(p2,2*nLen));
        normalizeDigits(finalProduct);
        return finalProduct
    }

    function isKaratsubaEfficient(len1, len2){
        return-.012*len1-.012*len2+15e-6*len1*len2>0
    }

    HugeNumber.prototype.times=function(otherVal){
        var parsedOther=interpretInput(otherVal),
            arrA=this.valData,
            arrB=parsedOther.valData,
            resultSign=this.polarity!==parsedOther.polarity,
            absValue;
        if(parsedOther.isCompact){
            if(arrB===0) return NumericalEntity[0];
            if(arrB===1) return this;
            if(arrB===-1) return this.invertSign();
            absValue=Math.abs(arrB);
            if(absValue<CHUNK_SIZE){
                return new HugeNumber(scalarMultiplication(arrA,absValue),resultSign)
            }
            arrB=compactToDigits(absValue)
        }
        if(isKaratsubaEfficient(arrA.length,arrB.length))
            return new HugeNumber(karatsubaProduct(arrA,arrB),resultSign);
        return new HugeNumber(longMultiplication(arrA,arrB),resultSign)
    };
    HugeNumber.prototype.by=HugeNumber.prototype.times;

    function scalarVectorProduct(scalarVal, digitArr, resultSign){
        if(scalarVal<CHUNK_SIZE){
            return new HugeNumber(scalarMultiplication(digitArr,scalarVal),resultSign)
        }
        return new HugeNumber(longMultiplication(digitArr,compactToDigits(scalarVal)),resultSign)
    }

    TinyNumber.prototype._multiplyBySmall=function(smallVal){
        if(isWithinJsLimit(smallVal.valData*this.valData)){
            return new TinyNumber(smallVal.valData*this.valData)
        }
        return scalarVectorProduct(Math.abs(smallVal.valData),compactToDigits(Math.abs(this.valData)),this.polarity!==smallVal.polarity)
    };

    HugeNumber.prototype._multiplyBySmall=function(smallVal){
        if(smallVal.valData===0) return NumericalEntity[0];
        if(smallVal.valData===1) return this;
        if(smallVal.valData===-1) return this.invertSign();
        return scalarVectorProduct(Math.abs(smallVal.valData),this.valData,this.polarity!==smallVal.polarity)
    };

    TinyNumber.prototype.times=function(otherVal){
        return interpretInput(otherVal)._multiplyBySmall(this)
    };
    TinyNumber.prototype.by=TinyNumber.prototype.times;

    function squareDigits(digitArr){
        var arrLen=digitArr.length,
            resArr=makeZeroArray(arrLen+arrLen),
            baseVal=CHUNK_SIZE,
            productVal,
            carryVal,
            idxI,
            digitI,
            digitJ;
        for(idxI=0;idxI<arrLen;idxI++){
            digitI=digitArr[idxI];
            carryVal=0-digitI*digitI;
            for(var idxJ=idxI;idxJ<arrLen;idxJ++){
                digitJ=digitArr[idxJ];
                productVal=2*(digitI*digitJ)+resArr[idxI+idxJ]+carryVal;
                carryVal=Math.floor(productVal/baseVal);
                resArr[idxI+idxJ]=productVal-carryVal*baseVal
            }
            resArr[idxI+arrLen]=carryVal
        }
        normalizeDigits(resArr);
        return resArr
    }

    HugeNumber.prototype.raiseToPowerTwo=function(){
        return new HugeNumber(squareDigits(this.valData),false)
    };

    TinyNumber.prototype.raiseToPowerTwo=function(){
        var squaredVal=this.valData*this.valData;
        if(isWithinJsLimit(squaredVal))
            return new TinyNumber(squaredVal);
        return new HugeNumber(squareDigits(compactToDigits(Math.abs(this.valData))),false)
    };

    function longDivisionAlgorithm(dividendArr, divisorArr){
        var lenDivd=dividendArr.length,
            lenDivs=divisorArr.length,
            baseVal=CHUNK_SIZE,
            quotientResult=makeZeroArray(divisorArr.length),
            divisorMostSig=divisorArr[lenDivs-1],
            lambdaFactor=Math.ceil(baseVal/(2*divisorMostSig)),
            tempRemainder=scalarMultiplication(dividendArr,lambdaFactor),
            tempDivisor=scalarMultiplication(divisorArr,lambdaFactor),
            currentQuotientDigit,
            shiftCount,
            currentCarry,
            currentBorrow,
            idx,
            loopLimit,
            qDigit;
        if(tempRemainder.length<=lenDivd)
            tempRemainder.push(0);
        tempDivisor.push(0);
        divisorMostSig=tempDivisor[lenDivs-1];

        for(shiftCount=lenDivd-lenDivs;shiftCount>=0;shiftCount--){
            currentQuotientDigit=baseVal-1;
            if(tempRemainder[shiftCount+lenDivs]!==divisorMostSig){
                currentQuotientDigit=Math.floor((tempRemainder[shiftCount+lenDivs]*baseVal+tempRemainder[shiftCount+lenDivs-1])/divisorMostSig)
            }
            currentCarry=0;
            currentBorrow=0;
            loopLimit=tempDivisor.length;
            for(idx=0;idx<loopLimit;idx++){
                currentCarry+=currentQuotientDigit*tempDivisor[idx];
                qDigit=Math.floor(currentCarry/baseVal);
                currentBorrow+=tempRemainder[shiftCount+idx]-(currentCarry-qDigit*baseVal);
                currentCarry=qDigit;
                if(currentBorrow<0){
                    tempRemainder[shiftCount+idx]=currentBorrow+baseVal;
                    currentBorrow=-1
                } else {
                    tempRemainder[shiftCount+idx]=currentBorrow;
                    currentBorrow=0
                }
            }
            while(currentBorrow!==0){
                currentQuotientDigit-=1;
                currentCarry=0;
                for(idx=0;idx<loopLimit;idx++){
                    currentCarry+=tempRemainder[shiftCount+idx]-baseVal+tempDivisor[idx];
                    if(currentCarry<0){
                        tempRemainder[shiftCount+idx]=currentCarry+baseVal;
                        currentCarry=0
                    } else {
                        tempRemainder[shiftCount+idx]=currentCarry;
                        currentCarry=1
                    }
                }
                currentBorrow+=currentCarry
            }
            quotientResult[shiftCount]=currentQuotientDigit
        }
        tempRemainder=scalarDivMod(tempRemainder,lambdaFactor)[0];
        return[digitsToCompact(quotientResult),digitsToCompact(tempRemainder)]
    }

    function iterativeDivMod(dividendArr, divisorArr){
        var lenDivd=dividendArr.length,
            lenDivs=divisorArr.length,
            resultQuotients=[],
            currentPart=[],
            baseVal=CHUNK_SIZE,
            estimate,
            xPartLen,
            highX,
            highY,
            checkResult;
        while(lenDivd){
            currentPart.unshift(dividendArr[--lenDivd]);
            normalizeDigits(currentPart);
            if(compareVectorMagnitudes(currentPart,divisorArr)<0){
                resultQuotients.push(0);
                continue
            }
            xPartLen=currentPart.length;
            highX=currentPart[xPartLen-1]*baseVal+currentPart[xPartLen-2];
            highY=divisorArr[lenDivs-1]*baseVal+divisorArr[lenDivs-2];
            if(xPartLen>lenDivs){
                highX=(highX+1)*baseVal
            }
            estimate=Math.ceil(highX/highY);
            do{
                checkResult=scalarMultiplication(divisorArr,estimate);
                if(compareVectorMagnitudes(checkResult,currentPart)<=0)
                    break;
                estimate--
            } while(estimate);
            resultQuotients.push(estimate);
            currentPart=deductDigits(currentPart,checkResult)
        }
        resultQuotients.reverse();
        return[digitsToCompact(resultQuotients),digitsToCompact(currentPart)]
    }

    function scalarDivMod(digitArr, scalarDivisor){
        var arrLen=digitArr.length,
            quotientArr=makeZeroArray(arrLen),
            baseVal=CHUNK_SIZE,
            idx,
            qVal,
            remainderVal,
            currentDivisor;
        remainderVal=0;
        for(idx=arrLen-1;idx>=0;--idx){
            currentDivisor=remainderVal*baseVal+digitArr[idx];
            qVal=chopDecimal(currentDivisor/scalarDivisor);
            remainderVal=currentDivisor-qVal*scalarDivisor;
            quotientArr[idx]=qVal|0
        }
        return[quotientArr,remainderVal|0]
    }

    function flexibleDivMod(selfRef, otherVal){
        var resultContent,
            parsedOther=interpretInput(otherVal);
        var arrA=selfRef.valData,
            arrB=parsedOther.valData;
        var quotientPart;
        if(arrB===0)
            throw new Error("Cannot divide by zero");
        if(selfRef.isCompact){
            if(parsedOther.isCompact){
                return[new TinyNumber(chopDecimal(arrA/arrB)),new TinyNumber(arrA%arrB)]
            }
            return[NumericalEntity[0],selfRef]
        }
        if(parsedOther.isCompact){
            if(arrB===1) return[selfRef,NumericalEntity[0]];
            if(arrB===-1) return[selfRef.invertSign(),NumericalEntity[0]];
            var absB=Math.abs(arrB);
            if(absB<CHUNK_SIZE){
                resultContent=scalarDivMod(arrA,absB);
                quotientPart=digitsToCompact(resultContent[0]);
                var remainderPart=resultContent[1];
                if(selfRef.polarity)
                    remainderPart=-remainderPart;
                if(typeof quotientPart==="number"){
                    if(selfRef.polarity!==parsedOther.polarity)
                        quotientPart=-quotientPart;
                    return[new TinyNumber(quotientPart),new TinyNumber(remainderPart)]
                }
                return[new HugeNumber(quotientPart,selfRef.polarity!==parsedOther.polarity),new TinyNumber(remainderPart)]
            }
            arrB=compactToDigits(absB)
        }
        var comparisonResult=compareVectorMagnitudes(arrA,arrB);
        if(comparisonResult===-1)
            return[NumericalEntity[0],selfRef];
        if(comparisonResult===0)
            return[NumericalEntity[selfRef.polarity===parsedOther.polarity?1:-1],NumericalEntity[0]];
        if(arrA.length+arrB.length<=200)
            resultContent=longDivisionAlgorithm(arrA,arrB);
        else
            resultContent=iterativeDivMod(arrA,arrB);
        quotientPart=resultContent[0];
        var qSign=selfRef.polarity!==parsedOther.polarity,
            modPart=resultContent[1],
            mSign=selfRef.polarity;
        if(typeof quotientPart==="number"){
            if(qSign)
                quotientPart=-quotientPart;
            quotientPart=new TinyNumber(quotientPart)
        } else quotientPart=new HugeNumber(quotientPart,qSign);
        if(typeof modPart==="number"){
            if(mSign)
                modPart=-modPart;
            modPart=new TinyNumber(modPart)
        } else modPart=new HugeNumber(modPart,mSign);
        return[quotientPart,modPart]
    }

    HugeNumber.prototype.divideAndRemainder=function(otherVal){
        var divisionResult=flexibleDivMod(this,otherVal);
        return{quotient:divisionResult[0],remainder:divisionResult[1]}
    };
    TinyNumber.prototype.divideAndRemainder=HugeNumber.prototype.divideAndRemainder;

    HugeNumber.prototype.portion=function(otherVal){
        return flexibleDivMod(this,otherVal)[0]
    };
    TinyNumber.prototype.dividedBy=TinyNumber.prototype.portion=HugeNumber.prototype.dividedBy=HugeNumber.prototype.portion;

    HugeNumber.prototype.modulo=function(otherVal){
        return flexibleDivMod(this,otherVal)[1]
    };
    TinyNumber.prototype.leftover=TinyNumber.prototype.modulo=HugeNumber.prototype.leftover=HugeNumber.prototype.modulo;

    HugeNumber.prototype.exponentiate=function(expVal){
        var parsedExp=interpretInput(expVal),
            baseVal=this.valData,
            expValue=parsedExp.valData,
            outputVal,
            iterBase,
            iterResult;
        if(expValue===0)
            return NumericalEntity[1];
        if(baseVal===0)
            return NumericalEntity[0];
        if(baseVal===1)
            return NumericalEntity[1];
        if(baseVal===-1)
            return parsedExp.isEvenlyDivisible()?NumericalEntity[1]:NumericalEntity[-1];
        if(parsedExp.polarity){
            return NumericalEntity[0]
        }
        if(!parsedExp.isCompact)
            throw new Error("The exponent "+parsedExp.toText()+" is too large.");
        if(this.isCompact){
            if(isWithinJsLimit(outputVal=Math.pow(baseVal,expValue)))
                return new TinyNumber(chopDecimal(outputVal))
        }
        iterBase=this;
        iterResult=NumericalEntity[1];
        while(true){
            if(expValue&1===1){
                iterResult=iterResult.times(iterBase);
                --expValue
            }
            if(expValue===0)
                break;
            expValue/=2;
            iterBase=iterBase.raiseToPowerTwo()
        }
        return iterResult
    };
    TinyNumber.prototype.exponentiate=HugeNumber.prototype.exponentiate;

    HugeNumber.prototype.modularExponentiation=function(exp, mod){
        exp=interpretInput(exp);
        mod=interpretInput(mod);
        if(mod.isNil())
            throw new Error("Cannot take modPow with modulus 0");
        var res=NumericalEntity[1],
            base=this.modulo(mod);
        while(exp.isPlus()){
            if(base.isNil())
                return NumericalEntity[0];
            if(exp.isUnevenlyDivisible())
                res=res.times(base).modulo(mod);
            exp=exp.portion(2);
            base=base.raiseToPowerTwo().modulo(mod)
        }
        return res
    };
    TinyNumber.prototype.modularExponentiation=HugeNumber.prototype.modularExponentiation;

    function compareVectorMagnitudes(arrA, arrB){
        if(arrA.length!==arrB.length){
            return arrA.length>arrB.length?1:-1
        }
        for(var idx=arrA.length-1;idx>=0;idx--){
            if(arrA[idx]!==arrB[idx])
                return arrA[idx]>arrB[idx]?1:-1
        }
        return 0
    }

    HugeNumber.prototype.compareMagnitude=function(otherVal){
        var parsedOther=interpretInput(otherVal),
            arrA=this.valData,
            arrB=parsedOther.valData;
        if(parsedOther.isCompact)
            return 1;
        return compareVectorMagnitudes(arrA,arrB)
    };

    TinyNumber.prototype.compareMagnitude=function(otherVal){
        var parsedOther=interpretInput(otherVal),
            numA=Math.abs(this.valData),
            arrB=parsedOther.valData;
        if(parsedOther.isCompact){
            arrB=Math.abs(arrB);
            return numA===arrB?0:numA>arrB?1:-1
        }
        return-1
    };

    HugeNumber.prototype.evaluate=function(otherVal){
        if(otherVal===Infinity){
            return-1
        }
        if(otherVal===-Infinity){
            return 1
        }
        var parsedOther=interpretInput(otherVal),
            arrA=this.valData,
            arrB=parsedOther.valData;
        if(this.polarity!==parsedOther.polarity){
            return parsedOther.polarity?1:-1
        }
        if(parsedOther.isCompact){
            return this.polarity?-1:1
        }
        return compareVectorMagnitudes(arrA,arrB)*(this.polarity?-1:1)
    };
    HugeNumber.prototype.evaluateAgainst=HugeNumber.prototype.evaluate;

    TinyNumber.prototype.evaluate=function(otherVal){
        if(otherVal===Infinity){
            return-1
        }
        if(otherVal===-Infinity){
            return 1
        }
        var parsedOther=interpretInput(otherVal),
            numA=this.valData,
            numB=parsedOther.valData;
        if(parsedOther.isCompact){
            return numA==numB?0:numA>numB?1:-1
        }
        if(numA<0!==parsedOther.polarity){
            return numA<0?-1:1
        }
        return numA<0?1:-1
    };
    TinyNumber.prototype.evaluateAgainst=TinyNumber.prototype.evaluate;

    HugeNumber.prototype.isEqualTo=function(otherVal){
        return this.evaluate(otherVal)===0
    };
    TinyNumber.prototype.same=TinyNumber.prototype.isEqualTo=HugeNumber.prototype.same=HugeNumber.prototype.isEqualTo;

    HugeNumber.prototype.isNotEqualTo=function(otherVal){
        return this.evaluate(otherVal)!==0
    };
    TinyNumber.prototype.notSame=TinyNumber.prototype.isNotEqualTo=HugeNumber.prototype.notSame=HugeNumber.prototype.isNotEqualTo;

    HugeNumber.prototype.isLargerThan=function(otherVal){
        return this.evaluate(otherVal)>0
    };
    TinyNumber.prototype.larger=TinyNumber.prototype.isLargerThan=HugeNumber.prototype.larger=HugeNumber.prototype.isLargerThan;

    HugeNumber.prototype.isSmallerThan=function(otherVal){
        return this.evaluate(otherVal)<0
    };
    TinyNumber.prototype.smaller=TinyNumber.prototype.isSmallerThan=HugeNumber.prototype.smaller=HugeNumber.prototype.isSmallerThan;

    HugeNumber.prototype.isLargerOrEqualTo=function(otherVal){
        return this.evaluate(otherVal)>=0
    };
    TinyNumber.prototype.atLeastVal=TinyNumber.prototype.isLargerOrEqualTo=HugeNumber.prototype.atLeastVal=HugeNumber.prototype.isLargerOrEqualTo;

    HugeNumber.prototype.isSmallerOrEqualTo=function(otherVal){
        return this.evaluate(otherVal)<=0
    };
    TinyNumber.prototype.atMostVal=TinyNumber.prototype.isSmallerOrEqualTo=HugeNumber.prototype.atMostVal=HugeNumber.prototype.isSmallerOrEqualTo;

    HugeNumber.prototype.isEvenlyDivisible=function(){
        return(this.valData[0]&1)===0
    };
    TinyNumber.prototype.isEvenlyDivisible=function(){
        return(this.valData&1)===0
    };

    HugeNumber.prototype.isUnevenlyDivisible=function(){
        return(this.valData[0]&1)===1
    };
    TinyNumber.prototype.isUnevenlyDivisible=function(){
        return(this.valData&1)===1
    };

    HugeNumber.prototype.isPlus=function(){
        return!this.polarity
    };
    TinyNumber.prototype.isPlus=function(){
        return this.valData>0
    };

    HugeNumber.prototype.isMinus=function(){
        return this.polarity
    };
    TinyNumber.prototype.isMinus=function(){
        return this.valData<0
    };

    HugeNumber.prototype.isOneOrMinusOne=function(){
        return false
    };
    TinyNumber.prototype.isOneOrMinusOne=function(){
        return Math.abs(this.valData)===1
    };

    HugeNumber.prototype.isNil=function(){
        return false
    };
    TinyNumber.prototype.isNil=function(){
        return this.valData===0
    };

    HugeNumber.prototype.canBeDividedBy=function(otherVal){
        var parsedOther=interpretInput(otherVal);
        var otherValue=parsedOther.valData;
        if(otherValue===0) return false;
        if(otherValue===1) return true;
        if(otherValue===2) return this.isEvenlyDivisible();
        return this.modulo(parsedOther).isEqualTo(NumericalEntity[0])
    };
    TinyNumber.prototype.canBeDividedBy=HugeNumber.prototype.canBeDividedBy;

    function isSimplePrimary(num){
        var absNum=num.absoluteValue();
        if(absNum.isOneOrMinusOne())
            return false;
        if(absNum.isEqualTo(2)||absNum.isEqualTo(3)||absNum.isEqualTo(5))
            return true;
        if(absNum.isEvenlyDivisible()||absNum.canBeDividedBy(3)||absNum.canBeDividedBy(5))
            return false;
        if(absNum.isSmallerThan(25))
            return true
    }

    HugeNumber.prototype.isPrimary=function(){
        var primaryCheck=isSimplePrimary(this);
        if(primaryCheck!==undefVal)
            return primaryCheck;
        var num=this.absoluteValue(),
            numPredecessor=num.predecessor();
        var testPrimes=[2,3,5,7,11,13,17,19],
            tempB=numPredecessor,
            tempD,
            isTrue,
            idx,
            tempX;
        while(tempB.isEvenlyDivisible())
            tempB=tempB.portion(2);
        for(idx=0;idx<testPrimes.length;idx++){
            tempX=largeNum(testPrimes[idx]).modularExponentiation(tempB,num);
            if(tempX.isEqualTo(NumericalEntity[1])||tempX.isEqualTo(numPredecessor))
                continue;
            for(isTrue=true,tempD=tempB;isTrue&&tempD.isSmallerThan(numPredecessor);tempD=tempD.times(2)){
                tempX=tempX.raiseToPowerTwo().modulo(num);
                if(tempX.isEqualTo(numPredecessor))
                    isTrue=false
            }
            if(isTrue)
                return false
        }
        return true
    };
    TinyNumber.prototype.isPrimary=HugeNumber.prototype.isPrimary;

    HugeNumber.prototype.isLikelyPrimary=function(numIterations){
        var primaryCheck=isSimplePrimary(this);
        if(primaryCheck!==undefVal)
            return primaryCheck;
        var num=this.absoluteValue();
        var iterCount=numIterations===undefVal?5:numIterations;
        for(var idx=0;idx<iterCount;idx++){
            var randA=largeNum.randomBetweenRange(2,num.take(2));
            if(!randA.modularExponentiation(num.predecessor(),num).isOneOrMinusOne())
                return false
        }
        return true
    };
    TinyNumber.prototype.isLikelyPrimary=HugeNumber.prototype.isLikelyPrimary;

    HugeNumber.prototype.modularInverse=function(modulus){
        var currentT=largeNum.zero,
            nextT=largeNum.one,
            currentR=interpretInput(modulus),
            nextR=this.absoluteValue(),
            qVal,
            lastTVal,
            lastRVal;
        while(!nextR.isEqualTo(largeNum.zero)){
            qVal=currentR.portion(nextR);
            lastTVal=currentT;
            lastRVal=currentR;
            currentT=nextT;
            currentR=nextR;
            nextT=lastTVal.deduct(qVal.times(nextT));
            nextR=lastRVal.deduct(qVal.times(nextR))
        }
        if(!currentR.isEqualTo(1))
            throw new Error(this.toText()+" and "+modulus.toText()+" are not co-prime");
        if(currentT.evaluate(0)===-1){
            currentT=currentT.unite(modulus)
        }
        if(this.isMinus()){
            return currentT.invertSign()
        }
        return currentT
    };
    TinyNumber.prototype.modularInverse=HugeNumber.prototype.modularInverse;

    HugeNumber.prototype.successor=function(){
        var numContent=this.valData;
        if(this.polarity){
            return deductScalar(numContent,1,this.polarity)
        }
        return new HugeNumber(sumWithScalar(numContent,1),this.polarity)
    };

    TinyNumber.prototype.successor=function(){
        var numContent=this.valData;
        if(numContent+1<JS_SAFE_LIMIT)
            return new TinyNumber(numContent+1);
        return new HugeNumber(MAX_SAFE_JS_INT_DIGITS,false)
    };

    HugeNumber.prototype.predecessor=function(){
        var numContent=this.valData;
        if(this.polarity){
            return new HugeNumber(sumWithScalar(numContent,1),true)
        }
        return deductScalar(numContent,1,this.polarity)
    };

    TinyNumber.prototype.predecessor=function(){
        var numContent=this.valData;
        if(numContent-1>-JS_SAFE_LIMIT)
            return new TinyNumber(numContent-1);
        return new HugeNumber(MAX_SAFE_JS_INT_DIGITS,true)
    };

    var twoPowers=[1];
    while(2*twoPowers[twoPowers.length-1]<=CHUNK_SIZE)
        twoPowers.push(2*twoPowers[twoPowers.length-1]);
    var twoPowersCount=twoPowers.length,
        largestBinaryFactor=twoPowers[twoPowersCount-1];

    function isShiftAmountCompact(shiftVal){
        return(typeof shiftVal==="number"||typeof shiftVal==="string")&&+Math.abs(shiftVal)<=CHUNK_SIZE||shiftVal instanceof HugeNumber&&shiftVal.valData.length<=1
    }

    HugeNumber.prototype.bitShiftLeft=function(shiftAmount){
        if(!isShiftAmountCompact(shiftAmount)){
            throw new Error(String(shiftAmount)+" is too large for shifting.")
        }
        shiftAmount=+shiftAmount;
        if(shiftAmount<0)
            return this.bitShiftRight(-shiftAmount);
        var currentResult=this;
        if(currentResult.isNil())
            return currentResult;
        while(shiftAmount>=twoPowersCount){
            currentResult=currentResult.times(largestBinaryFactor);
            shiftAmount-=twoPowersCount-1
        }
        return currentResult.times(twoPowers[shiftAmount])
    };
    TinyNumber.prototype.bitShiftLeft=HugeNumber.prototype.bitShiftLeft;

    HugeNumber.prototype.bitShiftRight=function(shiftAmount){
        var remAndQuo;
        if(!isShiftAmountCompact(shiftAmount)){
            throw new Error(String(shiftAmount)+" is too large for shifting.")
        }
        shiftAmount=+shiftAmount;
        if(shiftAmount<0)
            return this.bitShiftLeft(-shiftAmount);
        var currentResult=this;
        while(shiftAmount>=twoPowersCount){
            if(currentResult.isNil()||currentResult.isMinus()&&currentResult.isOneOrMinusOne())
                return currentResult;
            remAndQuo=flexibleDivMod(currentResult,largestBinaryFactor);
            currentResult=remAndQuo[1].isMinus()?remAndQuo[0].predecessor():remAndQuo[0];
            shiftAmount-=twoPowersCount-1
        }
        remAndQuo=flexibleDivMod(currentResult,twoPowers[shiftAmount]);
        return remAndQuo[1].isMinus()?remAndQuo[0].predecessor():remAndQuo[0]
    };
    TinyNumber.prototype.bitShiftRight=HugeNumber.prototype.bitShiftRight;

    function performBitwiseOperation(valX, valY, operationFn){
        valY=interpretInput(valY);
        var xSignFlag=valX.isMinus(),
            ySignFlag=valY.isMinus();
        var xRemaining=xSignFlag?valX.bitwiseNot():valX,
            yRemaining=ySignFlag?valY.bitwiseNot():valY;
        var xCurrentDigit=0,
            yCurrentDigit=0;
        var xDivModResult=null,
            yDivModResult=null;
        var resultDigits=[];
        while(!xRemaining.isNil()||!yRemaining.isNil()){
            xDivModResult=flexibleDivMod(xRemaining,largestBinaryFactor);
            xCurrentDigit=xDivModResult[1].toPrimitiveNumber();
            if(xSignFlag){
                xCurrentDigit=largestBinaryFactor-1-xCurrentDigit
            }
            yDivModResult=flexibleDivMod(yRemaining,largestBinaryFactor);
            yCurrentDigit=yDivModResult[1].toPrimitiveNumber();
            if(ySignFlag){
                yCurrentDigit=largestBinaryFactor-1-yCurrentDigit
            }
            xRemaining=xDivModResult[0];
            yRemaining=yDivModResult[0];
            resultDigits.push(operationFn(xCurrentDigit,yCurrentDigit))
        }
        var totalSum=operationFn(xSignFlag?1:0,ySignFlag?1:0)!==0?largeNum(-1):largeNum(0);
        for(var idx=resultDigits.length-1;idx>=0;idx-=1){
            totalSum=totalSum.times(largestBinaryFactor).unite(largeNum(resultDigits[idx]))
        }
        return totalSum
    }

    HugeNumber.prototype.bitwiseNot=function(){
        return this.invertSign().predecessor()
    };
    TinyNumber.prototype.bitwiseNot=HugeNumber.prototype.bitwiseNot;

    HugeNumber.prototype.bitwiseAnd=function(otherNum){
        return performBitwiseOperation(this,otherNum,function(a,b){return a&b})
    };
    TinyNumber.prototype.bitwiseAnd=HugeNumber.prototype.bitwiseAnd;

    HugeNumber.prototype.bitwiseOr=function(otherNum){
        return performBitwiseOperation(this,otherNum,function(a,b){return a|b})
    };
    TinyNumber.prototype.bitwiseOr=HugeNumber.prototype.bitwiseOr;

    HugeNumber.prototype.bitwiseXor=function(otherNum){
        return performBitwiseOperation(this,otherNum,function(a,b){return a^b})
    };
    TinyNumber.prototype.bitwiseXor=HugeNumber.prototype.bitwiseXor;

    var LOW_ORDER_BITS_INT_MASK=1<<30,
        LOW_ORDER_BITS_BIGINT_MASK=(CHUNK_SIZE&-CHUNK_SIZE)*(CHUNK_SIZE&-CHUNK_SIZE)|LOW_ORDER_BITS_INT_MASK;

    function approxLowOrderBits(num){
        var content=num.valData,
            xValue=typeof content==="number"?content|LOW_ORDER_BITS_INT_MASK:content[0]+content[1]*CHUNK_SIZE|LOW_ORDER_BITS_BIGINT_MASK;
        return xValue&-xValue
    }

    function calcIntegerLogarithm(val, base){
        if(base.evaluateAgainst(val)<=0){
            var tempRes=calcIntegerLogarithm(val,base.raiseToPowerTwo());
            var currentP=tempRes.p;
            var currentE=tempRes.e;
            var testT=currentP.times(base);
            return testT.evaluateAgainst(val)<=0?{p:testT,e:currentE*2+1}:{p:currentP,e:currentE*2}
        }
        return{p:largeNum(1),e:0}
    }

    HugeNumber.prototype.lengthInBits=function(){
        var numRef=this;
        if(numRef.evaluateAgainst(largeNum(0))<0){
            numRef=numRef.invertSign().deduct(largeNum(1))
        }
        if(numRef.evaluateAgainst(largeNum(0))===0){
            return largeNum(0)
        }
        return largeNum(calcIntegerLogarithm(numRef,largeNum(2)).e).unite(largeNum(1))
    };
    TinyNumber.prototype.lengthInBits=HugeNumber.prototype.lengthInBits;

    function getMaximum(valA, valB){
        valA=interpretInput(valA);
        valB=interpretInput(valB);
        return valA.isLargerThan(valB)?valA:valB
    }

    function getMinimum(valA, valB){
        valA=interpretInput(valA);
        valB=interpretInput(valB);
        return valA.isSmallerThan(valB)?valA:valB
    }

    function greatestCommonDivisor(valA, valB){
        valA=interpretInput(valA).absoluteValue();
        valB=interpretInput(valB).absoluteValue();
        if(valA.isEqualTo(valB)) return valA;
        if(valA.isNil()) return valB;
        if(valB.isNil()) return valA;
        var commonFactor=NumericalEntity[1],
            divisorBits,
            tempSwap;
        while(valA.isEvenlyDivisible()&&valB.isEvenlyDivisible()){
            divisorBits=Math.min(approxLowOrderBits(valA),approxLowOrderBits(valB));
            valA=valA.portion(divisorBits);
            valB=valB.portion(divisorBits);
            commonFactor=commonFactor.times(divisorBits)
        }
        while(valA.isEvenlyDivisible()){
            valA=valA.portion(approxLowOrderBits(valA))
        }
        do{
            while(valB.isEvenlyDivisible()){
                valB=valB.portion(approxLowOrderBits(valB))
            }
            if(valA.isLargerThan(valB)){
                tempSwap=valB;
                valB=valA;
                valA=tempSwap
            }
            valB=valB.deduct(valA)
        }while(!valB.isNil());
        return commonFactor.isOneOrMinusOne()?valA:valA.times(commonFactor)
    }

    function leastCommonMultiple(valA, valB){
        valA=interpretInput(valA).absoluteValue();
        valB=interpretInput(valB).absoluteValue();
        return valA.portion(greatestCommonDivisor(valA,valB)).times(valB)
    }

    function randomBetweenRange(lowerBound, upperBound){
        lowerBound=interpretInput(lowerBound);
        upperBound=interpretInput(upperBound);
        var lowVal=getMinimum(lowerBound,upperBound),
            highVal=getMaximum(lowerBound,upperBound);
        var rangeSpan=highVal.deduct(lowVal).unite(1);
        if(rangeSpan.isCompact)
            return lowVal.unite(Math.floor(Math.random()*rangeSpan));
        var digitLength=rangeSpan.valData.length-1;
        var digitResult=[],
            isRestricted=true;
        for(var idx=digitLength;idx>=0;idx--){
            var topLimit=isRestricted?rangeSpan.valData[idx]:CHUNK_SIZE;
            var currentDigit=chopDecimal(Math.random()*topLimit);
            digitResult.unshift(currentDigit);
            if(currentDigit<topLimit)
                isRestricted=false
        }
        digitResult=digitsToCompact(digitResult);
        return lowVal.unite(typeof digitResult==="number"?new TinyNumber(digitResult):new HugeNumber(digitResult,false))
    }

    var interpretBaseString=function(textInput, baseVal){
        var strLength=textInput.length;
        var loopIdx;
        var absBase=Math.abs(baseVal);
        for(loopIdx=0;loopIdx<strLength;loopIdx++){
            var char=textInput[loopIdx].toLowerCase();
            if(char==="-")
                continue;
            if(/[a-z0-9]/.test(char)){
                if(/[0-9]/.test(char)&&+char>=absBase){
                    if(char==="1"&&absBase===1)
                        continue;
                    throw new Error(char+" is not a valid digit in base "+baseVal+".")
                } else if(char.charCodeAt(0)-87>=absBase){
                    throw new Error(char+" is not a valid digit in base "+baseVal+".")
                }
            }
        }
        if(2<=baseVal&&baseVal<=36){
            if(strLength<=MATH_LOG_SAFE_LIMIT/Math.log(baseVal)){
                var parseResult=parseInt(textInput,baseVal);
                if(isNaN(parseResult)){
                    throw new Error(char+" is not a valid digit in base "+baseVal+".")
                }
                return new TinyNumber(parseInt(textInput,baseVal))
            }
        }
        baseVal=interpretInput(baseVal);
        var digitList=[];
        var isNegativeSign=textInput[0]==="-";
        for(loopIdx=isNegativeSign?1:0;loopIdx<textInput.length;loopIdx++){
            var char=textInput[loopIdx].toLowerCase(),
                charAscii=char.charCodeAt(0);
            if(48<=charAscii&&charAscii<=57)
                digitList.push(interpretInput(char));
            else if(97<=charAscii&&charAscii<=122)
                digitList.push(interpretInput(char.charCodeAt(0)-87));
            else if(char==="<"){
                var startPos=loopIdx;
                do{
                    loopIdx++
                }while(textInput[loopIdx]!==">");
                digitList.push(interpretInput(textInput.slice(startPos+1,loopIdx)))
            } else throw new Error(char+" is not a valid character")
        }
        return interpretBaseDigits(digitList,baseVal,isNegativeSign)
    };

    function interpretBaseDigits(digitArray, baseVal, isNegativeSign){
        var accumVal=NumericalEntity[0],
            currentPower=NumericalEntity[1],
            idx;
        for(idx=digitArray.length-1;idx>=0;idx--){
            accumVal=accumVal.unite(digitArray[idx].by(currentPower));
            currentPower=currentPower.by(baseVal)
        }
        return isNegativeSign?accumVal.invertSign():accumVal
    }

    function convertDigitToString(digit){
        if(digit<=35){
            return"0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit)
        }
        return"<"+digit+">"
    }

    function convertToBaseRepresentation(num, baseVal){
        baseVal=largeNum(baseVal);
        if(baseVal.isNil()){
            if(num.isNil())
                return{valData:[0],isNegativeFlag:false};
            throw new Error("Cannot convert nonzero numbers to base 0.")
        }
        if(baseVal.isEqualTo(-1)){
            if(num.isNil())
                return{valData:[0],isNegativeFlag:false};
            if(num.isMinus())
                return{valData:[].concat.apply([],Array.apply(null,Array(-num)).map(Array.prototype.valueOf,[1,0])),isNegativeFlag:false};
            var arrElements=Array.apply(null,Array(+num-1)).map(Array.prototype.valueOf,[0,1]);
            arrElements.unshift([1]);
            return{valData:[].concat.apply([],arrElements),isNegativeFlag:false}
        }
        var negFlag=false;
        if(num.isMinus()&&baseVal.isPlus()){
            negFlag=true;
            num=num.absoluteValue()
        }
        if(baseVal.isEqualTo(1)){
            if(num.isNil())
                return{valData:[0],isNegativeFlag:false};
            return{valData:Array.apply(null,Array(+num)).map(Number.prototype.valueOf,1),isNegativeFlag:negFlag}
        }
        var outputList=[];
        var remainingNum=num,
            divModResult;
        while(remainingNum.isMinus()||remainingNum.compareMagnitude(baseVal)>=0){
            divModResult=remainingNum.divideAndRemainder(baseVal);
            remainingNum=divModResult.quotient;
            var currentDigit=divModResult.remainder;
            if(currentDigit.isMinus()){
                currentDigit=baseVal.take(currentDigit).absoluteValue();
                remainingNum=remainingNum.successor()
            }
            outputList.push(currentDigit.toPrimitiveNumber())
        }
        outputList.push(remainingNum.toPrimitiveNumber());
        return{valData:outputList.reverse(),isNegativeFlag:negFlag}
    }

    function convertToBaseStringRepresentation(num, baseVal){
        var repArray=convertToBaseRepresentation(num,baseVal);
        return(repArray.isNegativeFlag?"-":"")+repArray.valData.map(convertDigitToString).join("")
    }

    HugeNumber.prototype.toNumeralArray=function(radixValue){
        return convertToBaseRepresentation(this,radixValue)
    };
    TinyNumber.prototype.toNumeralArray=function(radixValue){
        return convertToBaseRepresentation(this,radixValue)
    };

    HugeNumber.prototype.toText=function(radixValue){
        if(radixValue===undefVal)
            radixValue=10;
        if(radixValue!==10)
            return convertToBaseStringRepresentation(this,radixValue);
        var digitVector=this.valData,
            vecLen=digitVector.length,
            strOutput=String(digitVector[--vecLen]),
            zeroPad="0000000",
            currentDigit;
        while(--vecLen>=0){
            currentDigit=String(digitVector[vecLen]);
            strOutput+=zeroPad.slice(currentDigit.length)+currentDigit
        }
        var signChar=this.polarity?"-":"";
        return signChar+strOutput
    };
    TinyNumber.prototype.toText=function(radixValue){
        if(radixValue===undefVal)
            radixValue=10;
        if(radixValue!=10)
            return convertToBaseStringRepresentation(this,radixValue);
        return String(this.valData)
    };

    HugeNumber.prototype.toJsObjectNotation=TinyNumber.prototype.toJsObjectNotation=function(){
        return this.toText()
    };

    HugeNumber.prototype.valueOfPrimitive=function(){
        return parseInt(this.toText(),10)
    };
    HugeNumber.prototype.toPrimitiveNumber=HugeNumber.prototype.valueOfPrimitive;

    TinyNumber.prototype.valueOfPrimitive=function(){
        return this.valData
    };
    TinyNumber.prototype.toPrimitiveNumber=TinyNumber.prototype.valueOfPrimitive;

    function interpretStringValue(strVal){
        if(isWithinJsLimit(+strVal)){
            var numX=+strVal;
            if(numX===chopDecimal(numX))
                return new TinyNumber(numX);
            throw new Error("Invalid integer: "+strVal)
        }
        var hasSign=strVal[0]==="-";
        if(hasSign)
            strVal=strVal.slice(1);
        var parts=strVal.split(/e/i);
        if(parts.length>2)
            throw new Error("Invalid integer: "+parts.join("e"));
        if(parts.length===2){
            var exponentPart=parts[1];
            if(exponentPart[0]==="+")
                exponentPart=exponentPart.slice(1);
            exponentPart=+exponentPart;
            if(exponentPart!==chopDecimal(exponentPart)||!isWithinJsLimit(exponentPart))
                throw new Error("Invalid integer: "+exponentPart+" is not a valid exponent.");
            var baseText=parts[0];
            var dotPosition=baseText.indexOf(".");
            if(dotPosition>=0){
                exponentPart-=baseText.length-dotPosition-1;
                baseText=baseText.slice(0,dotPosition)+baseText.slice(dotPosition+1)
            }
            if(exponentPart<0)
                throw new Error("Cannot include negative exponent part for integers");
            baseText+=new Array(exponentPart+1).join("0");
            strVal=baseText
        }
        var isValidNumber=/^([0-9][0-9]*)$/.test(strVal);
        if(!isValidNumber)
            throw new Error("Invalid integer: "+strVal);
        var digitArray=[],
            maxLength=strVal.length,
            chunkSizeLog=SEGMENT_BITS,
            currentMin=maxLength-chunkSizeLog;
        while(maxLength>0){
            digitArray.push(+strVal.slice(currentMin,maxLength));
            currentMin-=chunkSizeLog;
            if(currentMin<0)
                currentMin=0;
            maxLength-=chunkSizeLog
        }
        normalizeDigits(digitArray);
        return new HugeNumber(digitArray,hasSign)
    }

    function interpretNumberValue(numVal){
        if(isWithinJsLimit(numVal)){
            if(numVal!==chopDecimal(numVal))
                throw new Error(numVal+" is not an integer.");
            return new TinyNumber(numVal)
        }
        return interpretStringValue(numVal.toString())
    }

    function interpretInput(input){
        if(typeof input==="number"){
            return interpretNumberValue(input)
        }
        if(typeof input==="string"){
            return interpretStringValue(input)
        }
        return input
    }

    for(var idx=0;idx<1e3;idx++){
        NumericalEntity[idx]=new TinyNumber(idx);
        if(idx>0)
            NumericalEntity[-idx]=new TinyNumber(-idx)
    }
    NumericalEntity.one=NumericalEntity[1];
    NumericalEntity.zero=NumericalEntity[0];
    NumericalEntity.minusOne=NumericalEntity[-1];
    NumericalEntity.max=getMaximum;
    NumericalEntity.min=getMinimum;
    NumericalEntity.gcd=greatestCommonDivisor;
    NumericalEntity.lcm=leastCommonMultiple;
    NumericalEntity.isInstance=function(x){
        return x instanceof HugeNumber||x instanceof TinyNumber
    };
    NumericalEntity.randBetween=randomBetweenRange;
    NumericalEntity.fromArray=function(digits,base,isNegative){
        return interpretBaseDigits(digits.map(interpretInput),interpretInput(base||10),isNegative)
    };
    return NumericalEntity
}();

const processInput = inputData => {
    inputData = inputData.trim().split("\n");
    const quantity = parseInt(inputData[0]);
    
    let total = parseInt(largeNum((largeNum(quantity).times(quantity + 1))).portion(2).toText());
    
    console.log(parseInt(total) - quantity);
};
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));