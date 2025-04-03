    
	$(document).ready(function() { 
        const fundContainer = document.getElementById('fund-container');
        const addFundButton = document.querySelector('.add-fund');

        let currentDate = new Date();
        let currentYear = currentDate. getFullYear()
        document.getElementById('curr-cal-yr').value=currentYear

        // Function to create a new fund item
        function createFundItem() {
            let newFund = document.querySelector('.fund-item').cloneNode(true);
            newFund.querySelector('.delete-fund').classList.remove('is-hidden');
            newFund.querySelector('.delete-fund').addEventListener('click', deleteFund);
            // Reset input fields
            newFund.querySelectorAll('input').forEach(input => input.value = '');
            //For validation and error messages
            newFund.querySelectorAll('input').forEach(function(input) {
                input.classList.remove('is-danger');
                var errorMessage = input.nextElementSibling;
                if (errorMessage && errorMessage.classList.contains('help') && errorMessage.classList.contains('is-danger')) {
                    errorMessage.remove();
                }
                if (input.name == 'fundname') {
                    //input.addEventListener('change', validateFundNameDuplicated(input));
                } else {
                    window.addValidationIfNeeded(input);
                }
            });
           // newFund.querySelectorAll('.label').forEach((el) => {
           //     el.remove();
           // });
            newFund.querySelector('.fundwithdrawage').value = window.convertToInt(document.getElementById('curr-age').value)+1;

            newFund.querySelector('.funds-return-type').selectedIndex=0
            newFund.querySelector('.funds-return-rate-wrap').classList.remove('is-hidden')
            newFund.querySelector('.funds-index-ref-wrap').classList.add('is-hidden')
            newFund.querySelector('.funds-default-return-wrap').classList.add('is-hidden')
            newFund.querySelector('.funds-mimic-year-wrap').classList.add('is-hidden')
            newFund.querySelector('.funds-return-rate').value=''

            return newFund;
        }

        // Function to add a new fund
        function addFund() {
            let newFund = createFundItem();
            fundContainer.appendChild(newFund);
            // Scroll to the new fund element
            newFund.scrollIntoView({ behavior: 'smooth' });
        }

        // Function to delete an fund
        function deleteFund(event) {
            event.target.closest('.fund-item').remove();
            validateFundNameDuplicatedFull()
        }
                // Add event listeners
        //addFundButton.addEventListener('click', addFund);
        addFundButton.addEventListener('click', (event) => {
            event.preventDefault(); // This will prevent the default form submission
            addFund()
        });
        document.querySelectorAll('.delete-fund').forEach(button => {
            button.addEventListener('click', deleteFund);
        });
                
    });


    //***************REPOSITION THE FUNS************************* */
    var dragged;

    /* events fired on the draggable target */
    document.addEventListener("drag", function(event) {
    }, false);

    document.addEventListener("dragstart", function(event) {
    // store a ref. on the dragged elem
    dragged = event.target;
    // make it half transparent
    event.target.style.opacity = .5;
    }, false);

    document.addEventListener("dragend", function(event) {
    // reset the transparency
    event.target.style.opacity = "";
    }, false);

    /* events fired on the drop targets */
    document.addEventListener("dragover", function(event) {
    // prevent default to allow drop
    event.preventDefault();
    }, false);

    document.addEventListener("dragenter", function(event) {
    // highlight potential drop target when the draggable element enters it
    if (event.target.className == "box fund-item draggable") {
        event.target.style.background = "green";
    }

    }, false);

    document.addEventListener("dragleave", function(event) {
    // reset background of potential drop target when the draggable element leaves it
    if (event.target.className == "box fund-item draggable") {
        event.target.style.background = "";
    }

    }, false);

    document.addEventListener("drop", function(event) {
    // prevent default action (open as link for some elements)
        event.preventDefault();
        // move dragged elem to the selected drop target
        if (event.target.className == "box fund-item draggable") {
            event.target.style.background = "";
            dragged.parentNode.removeChild( dragged );
            event.target.parentNode.insertBefore( dragged, event.target );
        }
    }, false);


    function validateFundNameDuplicated(nameElem){
        //let firstFund = document.querySelector('.fund-item:first-child');    
        //let newFund = document.querySelector('.fund-item').cloneNode(true);
        window.removeErrorComponent(nameElem)
        isValid = window.gblCheckEmpty(nameElem)
        if (! isValid)
            return
        preNames=[]  
        let fundsItems = document.querySelectorAll('.fund-item');
        fundsItems.forEach(item => {
            nmElm = item.querySelector('.fundname');  
            if (nmElm === nameElem)
                return;
            currentName=window.trimVal(nmElm.value) 
            window.removeErrorComponent(nmElm)
            if (preNames.includes(currentName)){
                window.addErrorComponent(nmElm, `This name is existed`)
            }

            preNames.push(currentName);
        });
        
        if (preNames.includes(nameElem.value)){
            window.addErrorComponent(nameElem, `This name is existed`)
        }

    }

    function validateFundNameDuplicatedFull(){
        return validateFundNameDuplicatedFullOpt(false)
    }
    //upon delete
    function validateFundNameDuplicatedFullOpt(isCheckEmpty){  
            isValid=true  
            preNames=[]  
            let fundsItems = document.querySelectorAll('.fund-item');
            fundsItems.forEach((item,index) => {
                nmElm = item.querySelector('.fundname');  
                currentName=window.trimVal(nmElm.value) 
                window.removeErrorComponent(nmElm)
                is_temp_Valid=true
                if (isCheckEmpty){
                    is_temp_Valid = window.gblCheckEmpty(nmElm)
                }
                if (! is_temp_Valid)
                    isValid=false                
                else if (currentName !='' && preNames.includes(currentName)){//avoid error when all fields r E
                    isValid=false
                    window.addErrorComponent(nmElm, `This name is existed`)
                }
                preNames.push(currentName);
            });   
            return isValid
    }

    function handleMimicYearInput(inputElement) {
        // Allow only numbers and limit to 4 digits
        let value = inputElement.value.replace(/[^\d]/g, '').slice(0, 4);
        
        // If first digit entered, validate it's 1 or 2
        if (value.length === 1 && !['1', '2'].includes(value)) {
            value = '';
        }
        
        inputElement.value = value;

        // Validate on input if we have 4 digits
        if (value.length === 4) {
            validateFundMimicYear(inputElement);
        } else {
            window.removeErrorComponent(inputElement);
        }
    }

    function validateFundMimicYear(inputElement) {
        const elmFundItem = inputElement.closest('.fund-item'); 
        const elmRType = elmFundItem.querySelector('.funds-return-type');
        const currentYear = new Date().getFullYear();
        const maxYear = currentYear - 1;

        if (elmRType.selectedIndex === 1) {
            window.removeErrorComponent(inputElement);
            
            // Basic empty check
            if (!window.gblCheckEmpty(inputElement)) {
                return false;
            }

            const value = inputElement.value;
            
            // Validate format (4 digits, starting with 1 or 2)
            if (!/^[12]\d{3}$/.test(value)) {
                window.addErrorComponent(inputElement, 'Year must be 4 digits starting with 1 or 2');
                return false;
            }

            // Validate range
            const year = parseInt(value);
            if (year < 1981 || year > maxYear) {
                window.addErrorComponent(inputElement, `Year must be between 1981 and ${maxYear}`);
                return false;
            }

            // Update all index funds to use the same year
            populateFirstRetiredYearWithYear(inputElement.value);
            return true;
        }
        return true;
    }
    window.validateFundsTabsExtra = function() {        
        isFundsTbValid= validateFundNameDuplicatedFullOpt(true)        
        let fundsItems = document.querySelectorAll('.fund-item');
        isWithrawableAfterRetiredAgePlus=false 
        elmMarkWithdrawProblem = null 
        let current_age = window.convertToInt(document.getElementById('curr-age').value)
        let retire = window.convertToInt(document.getElementById('retire-age').value)

        
        isTempFValid = validateCurrentAge(document.getElementById('curr-age'))
        if (! isTempFValid)
            isFundsTbValid=false

        isRetiredAgeValid = validateCurrentAge(document.getElementById('retire-age'))
        if (! isRetiredAgeValid)
            isFundsTbValid=false

        isTempFValid = validateCurrentYear(document.getElementById('curr-cal-yr'))
        if (! isTempFValid)
            isFundsTbValid=false

        fundsItems.forEach((item,index) => {
            elmFName = item.querySelector('.fundname');  
            elmRRate = item.querySelector('.funds-return-rate');  
            elmRType = item.querySelector('.funds-return-type'); 
            elmDefRRateWrap =item.querySelector('.funds-default-return-wrap');
            elmDefRRate =item.querySelector('.funds-default-return');
            elmMimicYearWrap =item.querySelector('.funds-mimic-year-wrap');
            elmMimicYear =item.querySelector('.funds-mimic-year');
            elmWith =item.querySelector('.fundwithdrawage')

            //window.removeErrorComponent(elmFName)
            //if (! window.gblCheckEmpty(elmFName))
                //isFundsTbValid=false

            // Validate return rates based on type
            if (elmRType.selectedIndex==0) {
                // For Flat rate type
                isTempValid = window.validateRateUponChange(elmRRate, {
                    min: 0,
                    max: 20,
                    fieldName: 'Return rate',
                    isRequired: true
                });
                if (!isTempValid)
                    isFundsTbValid = false;
            } else {
                // For Index type
                if (!elmDefRRateWrap.classList.contains('is-hidden')) {
                    isTempValid = window.validateRateUponChange(elmDefRRate, {
                        min: 0,
                        max: 20,
                        fieldName: 'Default return rate',
                        isRequired: true
                    });
                    if (!isTempValid)
                        isFundsTbValid = false;
                }
            }

            if (! elmMimicYearWrap.classList.contains('is-hidden')){
                isTempFValid = validateFundMimicYear(elmMimicYear)
                if (! isTempFValid)
                    isFundsTbValid=false
            }

            // Validate Withdraw Age (Optional) - Moved inside the loop
            isTempFValid = validateWithdrawAge(elmWith);
            if (!isTempFValid) {
                isFundsTbValid = false;
            }

        }); // End of fundsItems.forEach loop

        // Removed the isWithrawableAfterRetiredAgePlus check entirely

        return isFundsTbValid; // Return the overall validity status
    } // End of validateFundsTabsExtra function

    function validateWithdrawAge(inputElement) {
        window.removeErrorComponent(inputElement);

        // Remove non-numeric characters and limit to 2 digits
        let value = inputElement.value.replace(/[^\d]/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2);
        }
        inputElement.value = value;

        // If the value is empty, it's valid (optional field)
        if (value === '') {
            return true;
        }

        // During oninput event, only validate fully if we have 2 digits or on blur/submit
        let isInputEvent = this.event && this.event.type === 'input';
        if (isInputEvent && value.length < 2 && value.length > 0) { // Don't validate range yet if only 1 digit entered
             return true; // Still valid at this point
        }

        // Validate range (similar to current age)
        let isValid = true;
        const age = window.convertToInt(value);
        if (age < 15) {
            isValid = false;
            addErrorComponent(inputElement, `Withdraw Age Must Be At Least 15`);
        } else if (age > 80) { // Assuming same upper limit as current/retire age
            isValid = false;
            addErrorComponent(inputElement, `Withdraw Age Must not over 80`);
        }
        // Add any other necessary cross-field validation if needed (e.g., compare with current/retire age)
        // For now, just the basic range check.

        return isValid;
    }


    function changeReturnType(inputElement){
        elmFundItem = inputElement.closest('.fund-item');
        elmReturnRateWrap=elmFundItem.querySelector('.funds-return-rate-wrap')
        elmReturnRate=elmFundItem.querySelector('.funds-return-rate')
        elmIndexWrap=elmFundItem.querySelector('.funds-index-ref-wrap')
        elmIMimicYearWrap=elmFundItem.querySelector('.funds-mimic-year-wrap')
        elmIDefRetrWrap=elmFundItem.querySelector('.funds-default-return-wrap')
        elmDefReturn=elmFundItem.querySelector('.funds-default-return')

        if(inputElement.value=='Flat'){
            elmReturnRateWrap.classList.remove('is-hidden');
            elmIMimicYearWrap.classList.add('is-hidden');
            elmIndexWrap.classList.add('is-hidden');
            elmIDefRetrWrap.classList.add('is-hidden');

            // Just clear the fields
            elmDefReturn.value = '';
            // Also clear mimic year if switching back to Flat
            const elmMimicYear = elmFundItem.querySelector('.funds-mimic-year');
            if (elmMimicYear) elmMimicYear.value = '';
            window.removeErrorComponent(elmReturnRate); // Clear potential errors from Index mode
        }
        else{ // Index selected
            elmReturnRateWrap.classList.add('is-hidden');
            elmIndexWrap.classList.remove('is-hidden');
            elmIMimicYearWrap.classList.remove('is-hidden');
            elmIDefRetrWrap.classList.remove('is-hidden');

            // Just clear the fields
            elmReturnRate.value = '';
            // Optionally populate mimic year if empty and others exist
            populateFirstRetiredYearWithYear(null); // Check and potentially populate mimic year
            window.removeErrorComponent(elmDefReturn); // Clear potential errors from Flat mode
        }
    } // End of changeReturnType function


    window.getRisksFundName = function() {
        riskFundNames=[]
        let fundsItems = document.querySelectorAll('.fund-item');
        //nm=null
        fundsItems.forEach((item,index) => {
            elmRType = item.querySelector('.funds-return-type');
            if (elmRType.selectedIndex!=0){
                elmNm = item.querySelector('.fundname');
                nm=elmNm.value
                riskFundNames.push(nm);
            }
        });
        return riskFundNames
    }

    function validateCurrentYear(inputElement){
        window.removeErrorComponent(inputElement)
        isYrValid= window.gblChecYear(inputElement);
        if (isYrValid){
            if (window.convertToInt(inputElement.value)<1900){
                isYrValid = false
                addErrorComponent(inputElement, `Calendar Year Must Be At Least 1900`)
            }
        }
        return isYrValid
    }
    
    function changeCurrentAge(inputElement){
        if(validateCurrentAge(inputElement)){           
            if (! window.checkIfNotEmpty(document.getElementById('retire-age').value)){
                window.removeErrorComponent(document.getElementById('retire-age'))
                document.getElementById('retire-age').value = window.convertToInt(inputElement.value)
                populateFirstRetiredYear()
            }             

            
            let fundsItems = document.querySelectorAll('.fund-item');
            elmFirstWithAge=fundsItems[0].querySelector('.fundwithdrawage')
            if (elmFirstWithAge.value === "1"){
                elmFirstWithAge.value = window.convertToInt(document.getElementById('curr-age').value)+1;
            }   
        }         
    }
    function validateCurrentAge(inputElement){
        window.removeErrorComponent(inputElement)

        // Remove non-numeric characters and limit to 2 digits
        let value = inputElement.value.replace(/[^\d]/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2);
        }
        inputElement.value = value;

        // During oninput event, only validate if we have 2 digits
        let isInputEvent = this.event && this.event.type === 'input';
        if (isInputEvent && value.length < 2) {
            return true;
        }

        // Set up validation
        isYrValid = true;
        if (isYrValid){
            if (window.convertToInt(value) < 15){
                isYrValid = false;
                addErrorComponent(inputElement, `Current Age Must Be At Least 15`);
            } 
            else if (window.convertToInt(value) > 80){
                isYrValid = false;
                addErrorComponent(inputElement, `Current Age Must not over 80`);
            } else {                                  
                if (window.checkIfNotEmpty(document.getElementById('retire-age').value)){
                    isYrValid = validateRetireAge(document.getElementById('retire-age'));
                }
            }
        }
        return isYrValid;
    }

      
    function validateRetireAge(inputElement){
        window.removeErrorComponent(inputElement)

        // Remove non-numeric characters and limit to 2 digits
        let value = inputElement.value.replace(/[^\d]/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2);
        }
        inputElement.value = value;

        // During oninput event, only validate if we have 2 digits
        let isInputEvent = this.event && this.event.type === 'input';
        if (isInputEvent && value.length < 2) {
            return true;
        }

        // Set up validation
        isYrValid = true;
        if (isYrValid){
            let current_age = document.getElementById('curr-age');
            isValidTemp = window.gblCheckGreaterEqual(current_age, inputElement, 'Current Age', 'Retirement Age');
            if (!isValidTemp) {
                isYrValid = false;
            } else if (window.convertToInt(value) > 80) {
                isYrValid = false;
                addErrorComponent(inputElement, `Retirement Age Must not over 80`);
            }
        }
        if(isYrValid) {
            populateFirstRetiredYear();
        }
        return isYrValid;
    }

    function populateFirstRetiredYear(){
        populateFirstRetiredYearWithYear(null)
    }
    //if user change a mimic year of an index fund, then all other index fund follow the same mimic year
    function populateFirstRetiredYearWithYear(mimic_year){     
        //console.log('mimic_year '+mimic_year)    
        var retirementYear = mimic_year
        //console.log('retirementYear '+retirementYear)    
        let fundsItems = document.querySelectorAll('.fund-item');
        fundsItems.forEach((item,index) => {
            elmRType = item.querySelector('.funds-return-type'); 
            if (elmRType.selectedIndex!=0){                
                elmNm = item.querySelector('.funds-mimic-year');  
                if(retirementYear==null)
                    retirementYear=elmNm.value
                else
                    elmNm.value= retirementYear
            }
        });  
        if(retirementYear==null){
            var retire_age = document.getElementById('retire-age').value 
            var current_age = document.getElementById('curr-age').value
            var retirementYear = new Date().getFullYear() + (retire_age - current_age)+1;
        }
        var elmRetired_cal_year = document.getElementById("retired-Calendar-Year");
        elmRetired_cal_year.innerHTML = retirementYear;
    }

    function callKeyUpAmountFunction(inputElement){
        const inputValue = inputElement.value;
        const numericValue = inputValue.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Add commas
        inputElement.value = formattedValue;
    }
