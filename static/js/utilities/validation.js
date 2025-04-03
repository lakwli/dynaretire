
var gbl_err_required= 'This field is required';

// Generic rate validation functions
window.validateRateUponInput = function(inputElement, options = {}) {
    const {
        min = 0,           // Minimum allowed value
        max = 100,         // Maximum allowed value
        decimalPlaces = 2, // Maximum decimal places
        autoDecimal = true // Auto add decimal after single digit
    } = options;

    let value = inputElement.value;
    
    // Clear error message when user starts typing or has valid content
    const parsedValue = parseFloat(value.replace(/[^\d.]/g, ''));
    if (value && !isNaN(parsedValue)) {
        removeErrorComponent(inputElement);
    }

    // Handle rotating digits for whole numbers when decimalPlaces is 0
    if (decimalPlaces === 0) {
        // Only allow digits
        value = value.replace(/[^\d]/g, '');

        // Handle leading zeros and minimum value
        if (value === '0' || value.startsWith('0')) {
            // If min >= 1, don't allow zero
            if (min >= 1) {
                value = '';
            } else {
                value = '0';
            }
        } else {
            // Get max number of digits based on max value
            const maxDigits = max.toString().length;

            // Limit input length to max value's length
            if (value.length > maxDigits) {
                value = value.slice(-maxDigits);
            }

            // After length is limited, check both min and max
            const numValue = parseInt(value);
            if (numValue > max) {
                value = value.slice(-1);
            } else if (numValue < min && value !== '') {
                // If value is less than min but not empty, take last digit
                value = value.slice(-1);
                // If still less than min, clear it
                if (parseInt(value) < min) {
                    value = '';
                }
            }
        }

        inputElement.value = value;
        // Skip further processing for decimalPlaces === 0 as it's handled here
        return;
    }

    // For decimal numbers, continue with normal validation...
    const filteredValue = value.replace(/[^\d.]/g, '');
    
    // If the value changed due to invalid character, reject the input
    if (value !== filteredValue) {
        value = value.slice(0, -1);
        inputElement.value = value;
    }
    
    // If already has max decimal places, prevent further input
    if (value.includes('.') && value.split('.')[1].length === decimalPlaces) {
        value = inputElement.value;
    }
    
    // Special handling for maximum value - no further input allowed
    if (value === max.toString()) {
        value = max.toString();
        inputElement.value = value;
    }
    
    let processed = '';
    let hasDecimal = false;
    
    for (let i = 0; i < value.length; i++) {
        const char = value[i];
        
        // Only allow digits and decimal point
        if (char !== '.' && !/\d/.test(char)) {
            continue;
        }
        
        if (char === '.') {
            if (!hasDecimal) {
                hasDecimal = true;
                processed += char;
            }
            continue;
        }
        
        if (/\d/.test(char)) {
            // For digits before decimal
            if (!hasDecimal) {
                // For digits before decimal, check what number would be formed
                const wouldBeNum = parseInt(processed + char);
                
                if (processed.length === 1) {
                    if (wouldBeNum === max) {
                        // If we hit max exactly, set to max
                        processed = max.toString();
                        inputElement.value = processed;
                    } else if (wouldBeNum > max) {
                        // If we would exceed max, handle based on decimal places
                        if (decimalPlaces > 0) {
                            processed += '.';
                            hasDecimal = true;
                        } else {
                            processed = max.toString();
                            inputElement.value = processed;
                        }
                    }
                    // If less than max, just add the digit normally
                } else if (processed.length === 2 && decimalPlaces > 0) {
                    // Two digits already, next digit must be decimal (only if decimals are allowed)
                    processed += '.';
                    hasDecimal = true;
                }
            }
            
            // Stop after max decimal places
            if (hasDecimal && processed.split('.')[1].length === decimalPlaces) {
                break;
            }
            
            processed += char;
        }
    }
    
    inputElement.value = processed;
    
    // Place cursor at end
    const newPosition = processed.length;
    inputElement.setSelectionRange(newPosition, newPosition);
};

window.validateRateUponChange = function(inputElement, options = {}) {
    const {
        min = 0,           // Minimum allowed value
        max = 100,         // Maximum allowed value
        fieldName = 'Rate', // Field name for error messages
        isRequired = false // Whether the field is required
    } = options;
    
    removeErrorComponent(inputElement);
    
    const currentValue = inputElement.value;
    // Only skip validation if there's a value and it's a valid but incomplete number
    if (currentValue && (
        currentValue.endsWith('.') || // Typing decimal
        (currentValue.includes('.') && /^\d+\.\d*$/.test(currentValue)) || // Valid decimal number
        /^\d+$/.test(currentValue)) // Valid whole number
    ) {
        return true;
    }

    // Empty field validation
    const trimmedValue = trimVal(inputElement.value);
    if (trimmedValue === '') {
        if (isRequired) {
            addErrorComponent(inputElement, `${fieldName} is required`);
            return false;
        }
        return true;
    }

    const value = parseFloat(trimmedValue);
    if (isNaN(value)) {
        addErrorComponent(inputElement, `${fieldName} must be a valid number`);
        return false;
    }
    
    if (value < min || value > max) {
        addErrorComponent(inputElement, `${fieldName} must be between ${min} and ${max}`);
        return false;
    }
    
    return true;
};



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

var field_name = ['fundname']//'exp-name','inc-name','stg-retire-year'
var field_amount = ['fundamount','exp-amt-amt','inc-amount']
var field_rate = ['fundreturn']//,'stg-min_rate'
var field_rate_allow0 = ['inc-growth-rate']//,'stg-min_rate'
var field_rate_optional = ['stg-min_rate']
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
