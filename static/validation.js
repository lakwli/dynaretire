
var gbl_err_required= 'This field is required';


window.gblCheckName = function(inputElement) {
    removeErrorComponent(inputElement)
    isValidNm = gblCheckEmpty(inputElement)
    //console.log(isValid+'--------------dddddd checkName',inputElement)
    if (isValidNm){
        removeErrorComponent(inputElement)
    }
    return isValidNm
};
window.gblChecAmount = function(inputElement) {
    removeErrorComponent(inputElement)
    isValidAmt = gblCheckEmpty(inputElement)
    if (isValidAmt){
        isValidAmt=gblCheckNumberRange(inputElement,'Amount',1,1000000000000000)
    }
    if (isValidAmt){
        removeErrorComponent(inputElement)
    }
    return isValidAmt
};
window.gblChecRate = function(inputElement) {
    return gblChecRateMin(inputElement,1)
};
window.gblChecRateMin = function(inputElement, minimum_rate) {
    removeErrorComponent(inputElement)
    isValidRate = gblCheckEmpty(inputElement)
    if (isValidRate){
        isValidRate=gblCheckNumberRange(inputElement,'Rate%',minimum_rate,100)
    }
    if (isValidRate){
        removeErrorComponent(inputElement)
    }
    return isValidRate
};
window.gblChecOptionalRate = function(inputElement) {
    removeErrorComponent(inputElement)
    isValidORate=gblCheckNumberRange(inputElement,'Rate%',1,100)
    if (isValidORate){
        removeErrorComponent(inputElement)
    }
    return isValidORate
};
window.gblChecYear = function(inputElement) {
    removeErrorComponent(inputElement)
    isValidChecYear = gblCheckEmpty(inputElement)
    if (isValidChecYear){
        isValidChecYear=gblCheckNumberRange(inputElement,'Year',1,100000)
    }
    if (isValidChecYear){
        removeErrorComponent(inputElement)
    }
    return isValidChecYear
};

window.gblChecOptionalYear = function(inputElement) {
    removeErrorComponent(inputElement)
    isValidOYear=gblCheckNumberRange(inputElement,'Year',1,100000)
    if (isValidOYear){
        removeErrorComponent(inputElement)
    }
    return isValidOYear
};

window.gblCheckEmpty = function(inputElement) {
    isValidEmpty=true
    var inputValue = inputElement.value;
    // Trim the input safely, providing an empty string as a fallback
    var trimmedInput = trimVal(inputValue);

    if (trimmedInput === '') {
        isValidEmpty=false
        addErrorComponent(inputElement, `This field is required`)
    } else { 
        isValidEmpty=true
        removeErrorComponent(inputElement)
    }
    
    return isValidEmpty
};

window.gblCheckEmptyValue = function(value) {
    isValidEmpty=true
    var trimmedInput = trimVal(value);

    if (trimmedInput === '') {
        isValidEmpty=false
    } else { 
        isValidEmpty=true
    }    
    return isValidEmpty
};

window.trimVal = function(val){
    var trimmedInput = (val || '').trim();
    return trimmedInput
}


window.gblCheckGreaterEqualAddOn = function(inputElementFirst, inputElementAddOn, inputElementNext, prevLabel, prevLabelAddOn, nextLabel) {
    isValidGreEqu=true
    var inputValue = inputElementFirst.value
    var inputValueAddOn= inputElementAddOn.value;
    var nextinputValue = inputElementNext.value;
    //console.log(nextinputValue+'------------------'+inputValue+'{{{{{{{{'+(convertToInt(nextinputValue)<convertToInt(inputValue)))

    if (inputValue !== null && inputValue !== undefined && inputValue !== '') {        
        if (inputValueAddOn !== null && inputValueAddOn !== undefined && inputValueAddOn !== '') {
            if (nextinputValue !== null && nextinputValue !== undefined && nextinputValue !== ''){
                total = convertToInt(inputValue)+convertToInt(inputValueAddOn)
                if (convertToInt(nextinputValue)<total){
                    isValidGreEqu=false
                    addErrorComponent(inputElementNext, `${nextLabel} must be at least ${total}`)
                    //console.log(' add error',inputElementNext )
                }
            }
        }
    }
    return isValidGreEqu
}


window.gblCheckGreaterEqual = function(inputElement, inputElementNext, prevLabel, nextLabel) {
    isValidGreEqu=true
    var inputValue = inputElement.value;
    var nextinputValue = inputElementNext.value;
    //console.log(nextinputValue+'------------------'+inputValue+'{{{{{{{{'+(convertToInt(nextinputValue)<convertToInt(inputValue)))

    if (inputValue !== null && inputValue !== undefined && inputValue !== '') {
        if (nextinputValue !== null && nextinputValue !== undefined && nextinputValue !== ''){
            if (convertToInt(nextinputValue)<convertToInt(inputValue)){
                isValidGreEqu=false
                addErrorComponent(inputElementNext, `${nextLabel} must be higher or same as ${prevLabel}`)
                //console.log(' add error',inputElementNext )
            }
        }
    }
    return isValidGreEqu
}

window.gblCheckGreater = function(inputElement, inputElementNext, prevLabel, nextLabel) {
    isValidGre=true
    var inputValue = inputElement.value;
    var nextinputValue = inputElementNext.value;
    if (inputValue !== null && inputValue !== undefined && inputValue !== '') {
        if (nextinputValue !== null && nextinputValue !== undefined && nextinputValue !== ''){
            if (convertToInt(nextinputValue)<=convertToInt(inputValue)){
                isValidGre=false
                addErrorComponent(inputElementNext, `${nextLabel} must be higher than ${prevLabel}`)
            }
        }
    }
    return isValidGre
}
window.isNotNumeric = function (str) {
    if (typeof str !== "string") return true; // We only process strings!
    return isNaN(str) || isNaN(parseFloat(str)); // Ensure strings of whitespace fail
}

window.gblCheckNumberRange = function(inputElement, labelname, min, max) {
    isValidNumberR=true
    var inputValue = inputElement.value;
    if (inputValue !== null && inputValue !== undefined && inputValue !== '') {
        /**
        if(isNotNumeric(inputValue)){
            addErrorComponent(inputElement, `${labelname}: must be at number.`)
            return false
        } */
        if (convertToInt(inputValue) <min){
            isValidNumberR=false
            addErrorComponent(inputElement, `${labelname}: must be at least ${min}.`)
        }
        if (convertToInt(inputValue) > max){
            isValidNumberR = false;
            addErrorComponent(inputElement, `${labelname}: must be lower or equal to ${max}.`)         
        }
    }
    return isValidNumberR
};

function addWarningComponent(inputElement, msg){    
    addMsgComponent(inputElement,msg,'is-warning')
}

function removeWarningComponent(inputElement){
    removeMsgComponent(inputElement,'is-warning')
}
function addErrorComponent(inputElement, msg){    
    addMsgComponent(inputElement,msg,'is-danger')
}

function removeErrorComponent(inputElement){
    removeMsgComponent(inputElement,'is-danger')
}
function addMsgComponent(inputElement, msg, classnm){    
    if(! inputElement)
        return
    inputElement.classList.add(classnm);
    var errorMessage = document.createElement('p');
    errorMessage.className = 'help '+classnm;
    errorMessage.textContent =msg
    inputElement.parentNode.appendChild(errorMessage);  
}
function removeMsgComponent(inputElement,classnm){
    if(! inputElement)
        return
    inputElement.classList.remove(classnm);
    var errorMessage = inputElement.parentNode.querySelector('.help.'+classnm);
    if (errorMessage) {
        errorMessage.remove();
    }

}



window.checkIfNotEmpty = function(inputValue) {
    return  (inputValue !== null && inputValue !== undefined && inputValue !== '')
}


window.convertToInt = function(inputValue) {
    if(! checkIfNotEmpty(inputValue))
        return 0
    str = inputValue.replace(/\s+/g, ''); // remove spaces
    let num = parseInt(str); // convert to integer
    return num
}

window.convertToFloat = function(inputValue) {
    if(! checkIfNotEmpty(inputValue))
        return 0
    
    const v = inputValue.replace(/,/g, ''); // Remove commas
    str = v.replace(/\s+/g, ''); // remove spaces
    let num = parseFloat(str); // convert to integer
    //console.log(inputValue+'------------------------'+str)
    return num
}

var field_name = []//'fundname','exp-name','inc-name','stg-retire-year'
var field_amount = ['fundamount','exp-amt-amt','inc-amount']
var field_rate = ['fundreturn']//,'stg-min_rate'
var field_rate_allow0 = ['exp-inflation','inc-growth-rate']//,'stg-min_rate'
var field_rate_optional = ['exp-minspend','stg-min_rate']
var field_year = ['fundwithdrawyr','exp-amt-starting-year','inc-growth-starting-year']//'stg-retire-year',
var field_year_optional = ['exp-amt-until-year','inc-growth-until-year', 'exp-amt-every-few-years']
function addValidationIfNeeded(inputElement) {
    // Get the input name
    var inputName = inputElement.name;
    // Check if the input name is in the array
    if (field_name.indexOf(inputName) !== -1) {
        inputElement.addEventListener('change', function() {
            gblCheckName(this);
        });
    }
    // Check if the input name is in the array
    if (field_amount.indexOf(inputName) !== -1) {
        inputElement.addEventListener('change', function() {
            gblChecAmount(this);
        });
    }

    // Check if the input name is in the array
    if (field_rate.indexOf(inputName) !== -1) {
        //console.log('------------------------')
        inputElement.addEventListener('change', function() {
            gblChecRate(this);
        });
    }
    // Check if the input name is in the array
    if (field_rate_allow0.indexOf(inputName) !== -1) {
        inputElement.addEventListener('change', function() {
            gblChecRateMin(this,0);
        });
    }
    // Check if the input name is in the array
    if (field_rate_optional.indexOf(inputName) !== -1) {
        console.log('--------------------------------------')
        inputElement.addEventListener('change', function() {
            gblChecOptionalRate(this);
        });
    }
    // Check if the input name is in the array
    if (field_year.indexOf(inputName) !== -1) {
        //console.log(inputName+'-------------yr-----------')
        inputElement.addEventListener('change', function() {
            gblChecYear(this);
        });
    }
    // Check if the input name is in the array
    if (field_year_optional.indexOf(inputName) !== -1) {
        inputElement.addEventListener('change', function() {
            gblChecOptionalYear(this);
        });
    }
}

function ValidationIfNeeded(inputElement) {
    // Get the input name
    isValid=true
    var inputName = inputElement.name;
        // Check if the input name is in the array
    if (field_name.indexOf(inputName) !== -1) {
        is_temp_valid=gblCheckName(inputElement);
        if (! is_temp_valid)
            isValid=false
    }
    // Check if the input name is in the array
    if (field_amount.indexOf(inputName) !== -1) {
        is_temp_valid=gblChecAmount(inputElement);
        if (! is_temp_valid)
            isValid=false
    }
    
    // Check if the input name is in the array
    if (field_rate.indexOf(inputName) !== -1) {
        is_temp_valid=gblChecRate(inputElement);
        if (! is_temp_valid)
            isValid=false
    }
    // Check if the input name is in the array
    if (field_rate_optional.indexOf(inputName) !== -1) {
        is_temp_valid=gblChecOptionalRate(inputElement);
        if (! is_temp_valid)
            isValid=false
    }
    
    // Check if the input name is in the array
    if (field_year.indexOf(inputName) !== -1) {
        is_temp_valid=gblChecYear(inputElement);
        if (! is_temp_valid)
            isValid=false
    }
    // Check if the input name is in the array
    if (field_year_optional.indexOf(inputName) !== -1) {
        is_temp_valid=gblChecOptionalYear(inputElement);
        if (! is_temp_valid)
            isValid=false
    }
    return isValid
}

function onTabAllInputValidation(activeTabContentId,tabContent){
    //return true
        // Iterate over each input
        var isValid = true;
        //is_temp_valid=true
        var inputs = tabContent.find('input');
        //console.log(inputs)   
        inputs.each(function() {
            //console.log(this.name+'--fff-'+isValid)    
            is_temp_valid=ValidationIfNeeded(this)
            //console.log(is_temp_valid)      
            if (! is_temp_valid)
                isValid=false
            //console.log('---'+isValid)    
            addValidationIfNeeded(this)//somehow the eventlisner is lost when tab is clicked, add it back
            //console.log(this.name+'--vvvv-'+isValid)   
        });

        //console.log(isValid)      
        //console.log('validate all tabs')
        if (activeTabContentId == 'funds-content'){
            is_temp_valid = window.validateFundsTabsExtra()           
        }
        else if (activeTabContentId == 'income-content'){
            is_temp_valid = window.validateIncomeTabsExtra()     
        }
        else if (activeTabContentId == 'expenses-content'){
            is_temp_valid = window.validateExpTabsExtra()           
        }
        else if (activeTabContentId == 'strategic-content'){
            is_temp_valid = window.validateStrategyTabsExtra()     
            //console.log(is_temp_valid)      
        }
        if (! is_temp_valid)
            isValid=false
        //console.log(is_temp_valid+'...'+isValid)
        return isValid
}