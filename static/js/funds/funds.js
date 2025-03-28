    
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
                //console.log(input.name+'  has change event? '+(input.hasOwnProperty('onchange')))
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

    function validateFundFlatReturnRate(inputElement){  
        elmFundItem = inputElement.closest('.fund-item'); 
        elmRType = elmFundItem.querySelector('.funds-return-type');
        if (elmRType.selectedIndex==0){
            window.removeErrorComponent(inputElement)
            if (!window.gblCheckEmpty(inputElement)){
                return false
            }
            if (! window.gblCheckNumberRange(inputElement,'Rate',1,100)){
                return false
            }
        }
        return true
    }
    function validateFundDefaultReturnRate(inputElement){  
        elmFundItem = inputElement.closest('.fund-item'); 
        elmRType = elmFundItem.querySelector('.funds-return-type');
        if (elmRType.selectedIndex==1){
            window.removeErrorComponent(inputElement)
            if (!window.gblCheckEmpty(inputElement)){
                return false
            }
            if (! window.gblCheckNumberRange(inputElement,'Rate',1,100)){
                return false
            }
        }
        return true
    }
    function validateFundMimicYear(inputElement){  
        elmFundItem = inputElement.closest('.fund-item'); 
        elmRType = elmFundItem.querySelector('.funds-return-type');
        if (elmRType.selectedIndex==1){
            window.removeErrorComponent(inputElement)
            if (!window.gblCheckEmpty(inputElement)){
                return false
            }
            if (! window.gblCheckNumberRange(inputElement,'Year',1981,2024)){
                return false
            }
        }
        //to update all the index fund use the same matched year
        populateFirstRetiredYearWithYear(inputElement.value)
        return true
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

            if (elmRType.selectedIndex==0 && ! validateFundFlatReturnRate(elmRRate))
                isFundsTbValid=false


            if (! elmDefRRateWrap.classList.contains('is-hidden')){
                isTempFValid = validateFundDefaultReturnRate(elmDefRRate)
                if (! isTempFValid)
                    isFundsTbValid=false
            }

            if (! elmMimicYearWrap.classList.contains('is-hidden')){
                isTempFValid = validateFundMimicYear(elmMimicYear)
                if (! isTempFValid)
                    isFundsTbValid=false
            }


            window.removeErrorComponent(elmWith)
            if (! isRetiredAgeValid)
                isWithrawableAfterRetiredAgePlus=true
            else if(window.convertToInt(elmWith.value)<=retire+1){
                isWithrawableAfterRetiredAgePlus=true
            }else{
                elmMarkWithdrawProblem=elmWith
            }
        });   

        if(! isWithrawableAfterRetiredAgePlus){
            window.addErrorComponent(elmMarkWithdrawProblem, `At least one Fund is withdrawable at age ${retire+1}`)
            isFundsTbValid=false
        }
        return isFundsTbValid
    }

    function changeReturnType(inputElement){
        
        elmFundItem = inputElement.closest('.fund-item'); 
        elmReturnRateWrap=elmFundItem.querySelector('.funds-return-rate-wrap')
        elmIndexWrap=elmFundItem.querySelector('.funds-index-ref-wrap')
        elmIMimicYearWrap=elmFundItem.querySelector('.funds-mimic-year-wrap')
        elmIDefRetrWrap=elmFundItem.querySelector('.funds-default-return-wrap')
        if(inputElement.value=='Flat'){            
            elmReturnRateWrap.classList.remove('is-hidden');
            elmIMimicYearWrap.classList.add('is-hidden');
            elmIndexWrap.classList.add('is-hidden');
            elmIDefRetrWrap.classList.add('is-hidden');

        }
        else{
            elmReturnRateWrap.classList.add('is-hidden');
            elmIndexWrap.classList.remove('is-hidden');
            elmIMimicYearWrap.classList.remove('is-hidden');
            elmIDefRetrWrap.classList.remove('is-hidden');
        }
    }

 
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
        isYrValid= window.gblChecYear(inputElement);
        if (isYrValid){
            if (window.convertToInt(inputElement.value)<15){
                isYrValid = false
                addErrorComponent(inputElement, `Current Age Must Be At Least 15`)
            } 
            else if (window.convertToInt(inputElement.value)>80){
                isYrValid = false
                addErrorComponent(inputElement, `Current Age Must not over 80`)
            }else {                                  
                if (window.checkIfNotEmpty(document.getElementById('retire-age').value)){
                    isYrValid=validateRetireAge(document.getElementById('retire-age'))
                }
            }
        }
        return isYrValid
      }

      
    function validateRetireAge(inputElement){
        window.removeErrorComponent(inputElement)
        isYrValid= window.gblChecYear(inputElement);
        if (isYrValid){
            if (isYrValid){ 
                let current_age = document.getElementById('curr-age') 
                isValidTemp=window.gblCheckGreaterEqual(current_age,inputElement,'Current Age','Retirement Age')
                if(! isValidTemp)
                    isYrValid=false                
                else if (window.convertToInt(inputElement.value)>80){
                    isYrValid = false
                     addErrorComponent(inputElement, `Retirement Age Must not over 80`)
                }
            }
        }
        if(isYrValid)
            populateFirstRetiredYear()
        return isYrValid
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
    
    