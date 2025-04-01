    
	$(document).ready(function() { 
        const incomeContainer = document.getElementById('income-container');
        const addIncomeButton = document.querySelector('.add-income');

        //populateSelectBox();
        // Function to create a new income item
        let nowIncome= document.querySelector('.income-item')
        //let parkedIncome = nowIncome.cloneNode(true);
        nowIncome.remove();
        //document.getElementById('elementId').style.visibility = 'hidden'; // to hide
        //document.getElementById('elementId').style.visibility = 'visible'; // to show
        function createIncomeItem() {
            let newIncome = nowIncome.cloneNode(true);
            let fundsel = newIncome.querySelector('.fundSelect-inc-dep');
            puttingFundsIntoSel(fundsel)
            // turn on the first
            // event.target.closest('.income-item').remove();

            // Remove additional growth details if any
            let growth = newIncome.querySelectorAll('.growth-item');
            if (growth.length > 1) {
                growth.forEach((detail, index) => {
                    if (index > 0) detail.remove(); // Keep only the first growth detail
                });
            }
            newIncome.querySelector('.delete-income').classList.remove('icon-placeholder');
            newIncome.querySelector('.delete-income').addEventListener('click', deleteIncome);
            newIncome.querySelector('.add-growth').addEventListener('click', addGrowthDetail);
            newIncome.querySelectorAll('input').forEach(input => input.value = '');
            let firstGrowthDetail = newIncome.querySelector('.growth-item');
            elmGrowthStarting=firstGrowthDetail.querySelector('.inc-growth-starting-age')
            elmGrowthStarting.value = window.convertToInt(document.getElementById('curr-age').value)
            elmGrowthStarting.min=elmGrowthStarting.value
            elmGrowthUntil=firstGrowthDetail.querySelector('.inc-growth-until-age')  
            elmGrowthUntil.value = 100;          
            elmGrowthUntil.disabled=false
            elmGrowthUntil.classList.remove('is-normal');
            elmGrowthUntil.classList.add('is-info');
            
            elmGrowthUntil.value = window.convertToInt(document.getElementById('retire-age').value)

            firstGrowthDetail.querySelector('.inc-growth-until-age').addEventListener('change', function(event) {
                let nextGrowth = firstGrowthDetail.nextElementSibling;
                if (nextGrowth && nextGrowth.classList.contains('income-item')) {
                    nextGrowth.querySelector('.exp-amt-starting-age').value = parseInt(this.value) + 1;
                }
                isValid=window.gblChecOptionalYear(event.target)
                if (isValid)
                    window.gblCheckGreaterEqual(firstGrowthDetail.querySelector('.inc-growth-starting-age'),event.target,'Start Age',' Until Age')
            });
            firstGrowthDetail.querySelector('.inc-growth-starting-age').addEventListener('change', function(event) {
                //isValid=window.gblChecYear(event.target)
                validateStartingYear(firstGrowthDetail,event.target)
            });
            newIncome.querySelectorAll('input').forEach(function(input) {
                input.classList.remove('is-danger');
                var errorMessage = input.nextElementSibling;
                if (errorMessage && errorMessage.classList.contains('help') && errorMessage.classList.contains('is-danger')) {
                    errorMessage.remove();
                }
            });
            return newIncome;
        }
        // Function to add a new income
        function addIncome() {
            let newIncome = createIncomeItem();
            incomeContainer.appendChild(newIncome);
            // Scroll to the new income element
            newIncome.scrollIntoView({ behavior: 'smooth' });
        }
        // Function to delete an Income
        function deleteIncome(event) {
            event.target.closest('.income-item').remove();
            validateIncomeNameDuplicatedFull()
        }

        // Function to add a new amount detail
        function addGrowthDetail(event) {
            let growthsContainer = event.target.closest('.income-item').querySelector('.growths-container');
            let lastGrowth = growthsContainer.querySelector('.growth-item:last-child');
            let newGrowth = document.createElement('div');
            newGrowth.className = 'columns is-multiline growth-item';
            let untilYearValue = parseInt(lastGrowth.querySelector('.inc-growth-until-age').value) || 0;
            startmin=window.convertToInt(document.getElementById('curr-age').value)
            newGrowth.innerHTML = `
                <div class="column">
                    <input class="input inc-growth-rate is-primary has-text-right" min=1 name="inc-growth-rate" type="number"  step='0.01'  placeholder="e.g. 3%" onchange="window.addValidationIfNeeded(this)">
                </div>
                <div class="column">
                    <input class="input inc-growth-starting-age is-primary has-text-right" min=${startmin} name="inc-growth-starting-age"  type="number" placeholder="Starting Age">
                </div>
                <div class="column">
                    <div class="field has-addons">
                        <div class="control is-expanded">
                            <input class="input inc-growth-until-age is-info has-text-right" name="inc-growth-until-age" type="number" placeholder="Last Age income" value="50" onchange="validateFirstUntilYear(this)">
                        </div>
                        <div class="control">
                            <button class="icon-button add-growth " aria-label="Add Growth"  title="Add a different growth rate for another period">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="control">
                            <button class="icon-button delete-growth" aria-label="Delete Growth" title="Remove this growth rate">
                                <i class="fas fa-minus"></i>
                            </button>
                        </div>
                    </div> 
                </div>
            `;
            // Add event listener for the delete button in the new amount detail
            lastGrowth.querySelector('.add-growth').classList.add('icon-placeholder');
            newGrowth.querySelectorAll('.add-growth').forEach(button => {
                button.addEventListener('click', addGrowthDetail);
            });
            newGrowth.querySelector('.delete-growth').addEventListener('click', deleteGrowthDetail);
            // Add event listener for changes in the starting year
            newGrowth.querySelector('.inc-growth-starting-age').addEventListener('change', function(event) {
                validateStartingYear(newGrowth,event.target)
                //isValid=window.gblChecYear(event.target)
                //if (isValid)
                    //window.gblCheckGreater(previousGrowth.querySelector('.inc-growth-starting-year'),event.target,'previous','Start Year')
           
            });
            // Add event listener for changes in the until year
            newGrowth.querySelector('.inc-growth-until-age').addEventListener('change', function(event) {
                let nextGrowth = newGrowth.nextElementSibling;
                if (nextGrowth && nextGrowth.classList.contains('growth-item')) {
                    nextGrowth.querySelector('.inc-growth-starting-age').value = parseInt(this.value) + 1;
                }
                isValid=window.gblChecOptionalYear(event.target)
                if (isValid)
                    window.gblCheckGreaterEqual(newGrowth.querySelector('.inc-growth-starting-age'),event.target,'Start Age',' Until Age')
            });
            growthsContainer.appendChild(newGrowth);
            setTimeout(() => {
                newGrowth.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 0);

            //make the previous until year disabled
            let previousGrowth = newGrowth.previousElementSibling;
            prev_until = previousGrowth.querySelector('.inc-growth-until-age')
            curr_until = newGrowth.querySelector('.inc-growth-until-age')
            prev_until.disabled=true
            prev_until.classList.remove('is-info');
            prev_until.classList.add('is-normal');            
            window.removeErrorComponent(prev_until)
            curr_until.value=prev_until.value
            event.preventDefault();
        }

        // Function to delete an amount detail
        function deleteGrowthDetail(event) {
            incomeItem=event.target.closest('.columns.growth-item')
            lastincome = incomeItem.closest('.income-item');
            //console.log(lastincome)
            event.target.closest('.columns.growth-item').remove();
            //turn on prevous growth until year to enable
           //let lastincome = lastgrowth.querySelector('.income-item:last-child')
            //let growthItemElm = lastincome.querySelectorAll('.growth-item')[0];
            let lastGrowth = lastincome.querySelector('.growth-item:last-child');
            //console.log(lastGrowth)
            lastGrowth.querySelector('.add-growth').classList.remove('icon-placeholder');//handle the + add amount icon
            
            curr_until = lastGrowth.querySelector('.inc-growth-until-age')
            curr_until.disabled=false
            curr_until.classList.remove('is-normal');
            curr_until.classList.add('is-info');            
            window.removeErrorComponent(curr_until)
            window.gblCheckGreaterEqual(lastGrowth.querySelector('.inc-growth-starting-age'),curr_until,'Start Age',' Until Age')
            curr_until.focus()
        }

        // Add event listeners
        //addIncomeButton.addEventListener('click', addIncome);
        addIncomeButton.addEventListener('click', (event) => {
            event.preventDefault(); // This will prevent the default form submission
            addIncome()
        });
        document.querySelectorAll('.add-growth').forEach(button => {
            button.addEventListener('click', addGrowthDetail);
        });
        document.querySelectorAll('.delete-income').forEach(button => {
            button.addEventListener('click', deleteIncome);
        });
        document.querySelectorAll('.delete-growth').forEach(button => {
            button.addEventListener('click', deleteGrowthDetail);
        });
        
    });

    function getCurrentIncomeItem(inputElement){       
        //console.log(inputElement)     
        let elmIncomeItem =inputElement.closest('.income-item')
        //console.log(elmExpItem)
        return elmIncomeItem
    }

    function validateFirstUntilYear(inputElement){
        let lastincome = document.querySelector('.income-item:last-child')
        let growthItemElm = lastincome.querySelectorAll('.growth-item')[0];
        
        growthItemElm.querySelector('.inc-growth-until-age').addEventListener('change', function(event) {
            window.removeErrorComponent(inputElement)
            isValid=window.gblChecOptionalYear(event.target)
            if (isValid)
                window.gblCheckGreaterEqual(growthItemElm.querySelector('.inc-growth-starting-age'),event.target,'Start Age',' Until Age')
        });
    }
    
    function validateStartingYear(growthItemElm, inputElement){
        isValidStart=window.gblChecYear(inputElement)
        if (! isValidStart)
            return false
        let previousGrowth = growthItemElm.previousElementSibling;
        if (previousGrowth) {
            elmGwothStarPrev= previousGrowth.querySelector('.inc-growth-starting-age')
            //window.removeErrorComponent(elmGwothStartNext)
            isValidStart=window.gblCheckGreater(elmGwothStarPrev,inputElement,'previous',' Start Age')

            if (window.checkIfNotEmpty(inputElement.value) && inputElement.value>0)
                previousGrowth.querySelector('.inc-growth-until-age').value = inputElement.value - 1;
        }else{     
            let current_age = document.getElementById('curr-age') 
            isValidTemp=window.gblCheckGreaterEqual(current_age,inputElement,'Current Age ('+current_age.value+')',' Start Age')
            if (! isValidTemp)
                isValidStart=false
        }
        elmGwothUntil = growthItemElm.querySelector('.inc-growth-until-age')
        
        window.removeErrorComponent(elmGwothUntil)
        let nextGrowth = growthItemElm.nextElementSibling;
        if (isValidStart){         
            
            if(nextGrowth){
                elmGwothStartNext= nextGrowth.querySelector('.inc-growth-starting-age')
                window.removeErrorComponent(elmGwothStartNext)
                isValidTmp=window.gblCheckGreaterEqual(inputElement,elmGwothStartNext,'previous',' Start Age')
                if (! isValidTmp)
                    isValidStart=false
            }else{
                window.removeErrorComponent(elmGwothUntil)
                isValidTmp=window.gblCheckGreaterEqual(inputElement,elmGwothUntil,'Start Age',' Until Age')
                if (! isValidTmp)
                    isValidStart=false
            }
        }
        return isValidStart
    }
    window.validateIncomeTabsExtra = function() {
        isIncValid=true
        let firstIncome = document.querySelector('.income-item:first-child'); 
        preNames=[]
        while (firstIncome) {
            elmName= firstIncome.querySelector('.inc-name')
            currentName=window.trimVal(elmName.value) 
            window.removeErrorComponent(elmName)
            is_temp_Valid = window.gblCheckEmpty(elmName)
            if (! is_temp_Valid)
                isIncValid=false              
            else if (preNames.includes(currentName)){
                isIncValid=false
                window.addErrorComponent(elmName, `This name is existed`)
            }            
            preNames.push(currentName);
                
                //check fund depost:            
                let found=false
                let elmFundSelect=firstIncome.querySelector('.fundSelect-inc-dep')
                window.removeWarningComponent(elmFundSelect)
                let depositFund=elmFundSelect.value
                if(window.checkIfNotEmpty(depositFund)){
                    fundnames=window.gettingFundsName()
                    fundnames.forEach((item, index) => {
                        if(index!=0){
                            if(depositFund==item)
                                found=true
                        }
                    });
                }
                else{
                    window.removeWarningComponent(elmFundSelect)
                    //isIncValid=true
                    found=true
                }
                if(! found){
                    window.addWarningComponent(elmFundSelect, 'Fund '+depositFund+' is removed')
                    isIncValid=false
                }






            let growthItemElms = firstIncome.querySelectorAll('.growth-item');
            growthItemElms.forEach((item, index) => {
                elmGwothStart= item.querySelector('.inc-growth-starting-age')
                isValidTemp = validateStartingYear(item,elmGwothStart)
                if (! isValidTemp)
                    isIncValid=false
            });

            firstIncome = firstIncome.nextElementSibling;
        }  
        return isIncValid
    }
    function validateIncomeNameDuplicatedFull(){
        validateIncomeNameDuplicatedFullOpt(false)
    }
    function validateIncomeNameDuplicatedFullOpt(isCheckEmpty){
        let firstIncome = document.querySelector('.income-item:first-child'); 
        preNames=[]
        while (firstIncome) {

            elmName= firstIncome.querySelector('.inc-name')
            currentName=window.trimVal(elmName.value) 
            window.removeErrorComponent(elmName)
            if (currentName !='' && preNames.includes(currentName)){
                window.addErrorComponent(elmName, `This name is existed`)
            }
            preNames.push(currentName);
            firstIncome = firstIncome.nextElementSibling;
        }  
    }

    function validateIncomeNameDuplicated(nameElem){
        let firstIncome = document.querySelector('.income-item:first-child'); 
        //console.log(firstIncome)
        window.removeErrorComponent(nameElem)
        preNames=[]
        while (firstIncome) {
            elmName= firstIncome.querySelector('.inc-name')
            currentName=window.trimVal(elmName.value) 
            if (elmName === nameElem){
                firstIncome = firstIncome.nextElementSibling;
                continue;
            }
            window.removeErrorComponent(elmName)
            if (preNames.includes(currentName)){
                window.addErrorComponent(elmName, `This name is existed`)
            }
            preNames.push(currentName);
            firstIncome = firstIncome.nextElementSibling;
        }  
        if (preNames.includes(nameElem.value)){
            window.addErrorComponent(nameElem, `This name is existed`)
        }
    }

    function validateStartingYearFromPage(inputElement){        
        //let lastincome = document.querySelector('.income-item:last-child')     
        let lastincome = getCurrentIncomeItem(inputElement)   
        let growthItemElm = lastincome.querySelectorAll('.growth-item')[0];
        validateStartingYear(growthItemElm,inputElement)
    }


      function getValueFromOtherTab(inputId) {
        // Use jQuery to select the input field by its ID and get its value
        var inputVal = $('#' + inputId).val();
        
        // Check if the input element exists and has a value
        if (inputVal !== undefined) {
          return inputVal;
        } else {
          // If the input element does not exist or has no value, handle the error
          console.error('Input element not found or value is undefined');
          return ''; // or handle the error as needed
        }
      }

      

      window.puttingIncomeFunds = function() {
        let firstIncome = document.querySelector('.income-item:first-child'); 
        //console.log(firstIncome)
        while (firstIncome) {                 
            let fundsels = firstIncome.querySelectorAll('.fundSelect-inc-dep'); 
            //console.log(fundsels)
            fundsels.forEach((item, index) => {
                puttingFundsIntoSel(item)
            });
            firstIncome = firstIncome.nextElementSibling;
        }  
    }

    
    window.puttingFundsIntoSel = function(selectElement) {
        fundnames = window.gettingFundsName()
        //var selectElement = document.getElementById(selectId);
        var currentValue = selectElement.value;
        var isSelectedValuePresent = fundnames.includes(currentValue);
    
        // Clear all existing options
        while (selectElement.options.length > 0) {
            selectElement.remove(0);
        }
    
        // Add new options
        fundnames.forEach(optionText => {
            var opt = document.createElement('option');
            opt.value = optionText;
            opt.text = optionText;
            selectElement.appendChild(opt);
        });
    
        // Restore the previously selected value if it's present in the new options
        if (isSelectedValuePresent) {
            selectElement.value = currentValue;
        }
    }

        

    window.onIncomeTabLoad = function() {
        puttingIncomeFunds()
    }
    function callKeyUpAmountFunction(inputElement){
        const inputValue = inputElement.value;
        const numericValue = inputValue.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Add commas
        inputElement.value = formattedValue;
    }

    function changeFundSelectIncDep(inputElement){
        window.removeWarningComponent(inputElement)
    }
