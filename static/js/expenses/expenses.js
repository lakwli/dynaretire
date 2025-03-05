    
	$(document).ready(function() { 
        const expenseContainer = document.getElementById('expense-container');
        const addExpenseButton = document.querySelector('.add-expense');

        // Function to create a new expense item
        function createExpenseItem() {
            let newExpense = document.querySelector('.expense-item').cloneNode(true);
            // Remove additional amount details if any
            let amountDetails = newExpense.querySelectorAll('.amount-item');
            if (amountDetails.length > 1) {
                amountDetails.forEach((detail, index) => {
                    if (index > 0) detail.remove(); // Keep only the first amount detail
                });
            }
            newExpense.querySelector('.delete-expense').classList.remove('is-hidden');
            newExpense.querySelector('.delete-expense').addEventListener('click', deleteExpense);
            newExpense.querySelector('.add-amount').classList.remove('icon-placeholder');
            newExpense.querySelector('.add-amount').addEventListener('click', addAmountDetail);
            // Reset input fields
            newExpense.querySelectorAll('input').forEach(input => input.value = '');

            //Handle until year to make it remove error, editable/non-ediable
            elmAmountUntil=newExpense.querySelector('.exp-amt-until-age')            
            elmAmountUntil.disabled=false
            elmAmountUntil.classList.remove('is-normal');
            elmAmountUntil.classList.add('is-info');


            // Set default values for the first amount detail
            let firstAmountDetail = newExpense.querySelector('.amount-item');
            firstAmountDetail.querySelector('.exp-amt-until-age').value = 100;
            firstAmountDetail.querySelector('.exp-amt-every-few-years').value = 1;
            // Add event listener for changes in the until year for the first amount detail

            /** Doesn't work as until age always the last. Previous one always change to disabled */
            /**
            firstAmountDetail.querySelector('.exp-amt-until-age').addEventListener('change', function(event) {
                let nextAmount = firstAmountDetail.nextElementSibling;
                if (nextAmount && nextAmount.classList.contains('amount-item')) {
                    nextAmount.querySelector('.exp-amt-starting-age').value = parseInt(this.value) + firstAmountDetail.querySelector('.exp-amt-every-few-years').value;
                }
                isValid=window.gblChecOptionalYear(event.target)
                if (isValid)
                    isValid=window.gblCheckGreaterEqual(firstAmountDetail.querySelector('.exp-amt-starting-age'),event.target,'Start Age',' Until Age')
                else if (!isValid && ! window.gblCheckNumberRange(event.target,'Starting Age',1,80)){
                    isValidExpStYr=false
                }
            });
             */
            firstAmountDetail.querySelector('.exp-amt-starting-age').addEventListener('change', function(event) {
                //isValid=window.gblChecYear(event.target)
                validateExpStartingYear(firstAmountDetail,event.target)
            });
            newExpense.querySelectorAll('input').forEach(function(input) {
                input.classList.remove('is-danger');
                var errorMessage = input.nextElementSibling;
                if (errorMessage && errorMessage.classList.contains('help') && errorMessage.classList.contains('is-danger')) {
                    errorMessage.remove();
                }
                //window.addValidationIfNeeded(input);
            });

            elmExpStarting=firstAmountDetail.querySelector('.exp-amt-starting-age')
            elmExpStarting.value = window.convertToInt(document.getElementById('retire-age').value)+1
            elmExpStarting.min=window.convertToInt(document.getElementById('curr-age').value)+1
            return newExpense;
        }

        // Function to add a new expense
        function addExpense() {
            let newExpense = createExpenseItem();
            expenseContainer.appendChild(newExpense);
            // Scroll to the new expense element
            newExpense.scrollIntoView({ behavior: 'smooth' });
        }

        // Function to delete an expense
        function deleteExpense(event) {
            event.target.closest('.expense-item').remove();
            
            validateExpNameDuplicatedFull()
        }
        // Function to add a new amount detail
        function addAmountDetail(event) {
            let amountsContainer = event.target.closest('.expense-item').querySelector('.amounts-container');
            let lastAmount = amountsContainer.querySelector('.amount-item:last-child');
            let newAmount = document.createElement('div');
            newAmount.className = 'columns is-multiline amount-item';
            let everyFewYearsValue = lastAmount.querySelector('.exp-amt-every-few-years').value;
            let untilYearValue = parseInt(lastAmount.querySelector('.exp-amt-until-age').value) || 0;
            
            startmin=window.convertToInt(document.getElementById('curr-age').value)+1
            newAmount.innerHTML = `
                <div class="column">
                    <input class="input exp-amt-amt is-primary" name="exp-amt-amt" type="text" placeholder="Amount" onchange="window.addValidationIfNeeded(this)" onkeyup="callKeyUpAmountFunction(this)">
                </div>
                <div class="column">
                    <input class="input exp-amt-starting-age is-primary" name="exp-amt-starting-age"  type="number" min="${startmin}" placeholder="Starting Age" >
                </div>
                <div class="column">
                    <input class="input exp-amt-until-age is-info" type="number" placeholder="Until Age">
                </div>
                <div class="column">
                            <div class="field has-addons">
                                <div class="control">
                                    <input class="input exp-amt-every-few-years is-primary" name="exp-amt-every-few-years" type="number" placeholder="(Optional)Occur once for few years e.g 10 " value="${everyFewYearsValue}" onchange="window.addValidationIfNeeded(this)">
                                </div>
                                <div class="control">
                                    <button class="icon-button add-amount " aria-label="Add Amount" title="Add different amount for another period">
                                        <i class="fas fa-plus"></i>
                                      </button>
                                </div>
                                <div class="control">
                                    <button class="icon-button delete-amount" aria-label="Delete Amount" title="Delete this amount period">
                                      <i class="fas fa-minus"></i>
                                    </button>
                                  </div>
                            </div>
                </div>
            `;
            lastAmount.querySelector('.add-amount').classList.add('icon-placeholder');
            //console.log(newAmount)
            newAmount.querySelectorAll('.add-amount').forEach(button => {
                button.addEventListener('click', addAmountDetail);
            });
            // Add event listener for the delete button in the new amount detail
            newAmount.querySelector('.delete-amount').addEventListener('click', deleteAmountDetail);
            // Add event listener for changes in the starting year
            newAmount.querySelector('.exp-amt-starting-age').addEventListener('change', function(event) {
                validateExpStartingYear(newAmount,event.target)
            });
            // Add event listener for changes in the until year
            newAmount.querySelector('.exp-amt-until-age').addEventListener('change', function(event) {
                let nextAmount = newAmount.nextElementSibling;
                if (nextAmount && nextAmount.classList.contains('amount-item')) {
                    nextAmount.querySelector('.exp-amt-starting-age').value = parseInt(this.value) + 1;
                }
                isValid=window.gblChecOptionalYear(event.target)
                if (isValid)
                    window.gblCheckGreaterEqual(newAmount.querySelector('.exp-amt-starting-age'),event.target,'Start Age',' Until Age')
            
            });
            newAmount.querySelector('.exp-amt-every-few-years').addEventListener('change', function(event) {
                //console.log
                window.gblChecOptionalYear(event.target)
                let nextAmount = newAmount.nextElementSibling;
                if (nextAmount && nextAmount.classList.contains('amount-item')) {
                    //nextAmount.querySelector('.exp-amt-starting-age').value = parseInt(this.value) + 1;
                    validateExpStartingYear(nextAmount, nextAmount.querySelector('.exp-amt-starting-age'))
                }
            });
            amountsContainer.appendChild(newAmount);
            setTimeout(() => {
                newAmount.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 0);

            //make the previous until year disabled
            let previousAmount = newAmount.previousElementSibling;
            prev_until = previousAmount.querySelector('.exp-amt-until-age')
            curr_until = newAmount.querySelector('.exp-amt-until-age')
            prev_until.disabled=true
            prev_until.classList.remove('is-info');
            prev_until.classList.add('is-normal');        
            window.removeErrorComponent(prev_until)
            curr_until.value=prev_until.value
            event.preventDefault();
            
        }

        // Function to delete an amount detail
        function deleteAmountDetail(event) {
            amtItem=event.target.closest('.columns.amount-item')
            lastexp = amtItem.closest('.expense-item');

            event.target.closest('.columns.amount-item').remove();
            let lastAmt = lastexp.querySelector('.amount-item:last-child');            
            lastAmt.querySelector('.add-amount').classList.remove('icon-placeholder');//handle the + add amount icon
            curr_until = lastAmt.querySelector('.exp-amt-until-age')
            curr_until.disabled=false
            curr_until.classList.remove('is-normal');
            curr_until.classList.add('is-info');            
            window.removeErrorComponent(curr_until)
            window.gblCheckGreaterEqual(lastAmt.querySelector('.exp-amt-starting-age'),curr_until,'Start Age',' Until Age')
            curr_until.focus()            
        }

        // Add event listeners
        //addExpenseButton.addEventListener('click', addExpense);
        addExpenseButton.addEventListener('click', (event) => {
            event.preventDefault(); // This will prevent the default form submission
            addExpense()
        });
        document.querySelectorAll('.add-amount').forEach(button => {
            button.addEventListener('click', addAmountDetail);
        });
        document.querySelectorAll('.delete-expense').forEach(button => {
            button.addEventListener('click', deleteExpense);
        });
        document.querySelectorAll('.delete-amount').forEach(button => {
            button.addEventListener('click', deleteAmountDetail);
        });
        
    });

    function getCurrentExpenseItem(inputElement){       
        //console.log(inputElement)     
        let elmExpItem =inputElement.closest('.expense-item')
        //console.log(elmExpItem)
        return elmExpItem
    }
    function validateExpFirstUntilYear(inputElement){
        //window.gblChecOptionalYear(inputElement)
        let lastExp = document.querySelector('.expense-item:last-child')
        let amtItemElm = lastExp.querySelectorAll('.amount-item')[0];
        window.removeErrorComponent(inputElement)
        isValid=window.gblChecYear(inputElement)
        if (isValid)
            window.gblCheckGreaterEqual(amtItemElm.querySelector('.exp-amt-starting-age'),inputElement,'Start Age',' Until Age')

        //console.log(amtItemElm)
        amtItemElm.querySelector('.exp-amt-until-age').addEventListener('change', function(event) {
            window.removeErrorComponent(inputElement)
            isValid=window.gblChecOptionalYear(event.target)
            if (isValid)
                window.gblCheckGreaterEqual(amtItemElm.querySelector('.exp-amt-starting-age'),event.target,'Start Age',' Until Age')
        });
    }


/** 
    
    function validateExpFirstUntilYear(inputElement){
        let lastexp = document.querySelector('.expense-item:last-child')
        let amtItemElm = lastexp.querySelectorAll('.amount-item')[0];
        //console.log(lastexp)
        //console.log(amtItemElm.querySelector('.exp-amt-until-year'))
        elmUntilYr=amtItemElm.querySelector('.exp-amt-until-age')
        window.removeErrorComponent(elmUntilYr)
        isValid=window.gblChecOptionalYear(elmUntilYr)
        if (isValid)
            isValid=window.gblCheckGreaterEqual(amtItemElm.querySelector('.exp-amt-starting-age'),elmUntilYr,'Start Age',' Until Age')
        
       // console.log('**************'+isValid)
        return isValid
        //amtItemElm.querySelector('.exp-amt-until-year').addEventListener('change', function(event) {
        //    console.log('dddddddddddddd')
        //    window.removeErrorComponent(inputElement)
        //    isValid=window.gblChecOptionalYear(event.target)
        //    if (isValid)
        //        window.gblCheckGreaterEqual(amtItemElm.querySelector('.exp-amt-starting-year'),event.target,'Start Year',' Until Year')
        //});
    }
    */
   function validateInterval(elmInterval){    
                //console.log
                window.gblChecOptionalYear(elmInterval)
                let nextAmount = newAmount.nextElementSibling;
                if (nextAmount && nextAmount.classList.contains('amount-item')) {
                    //nextAmount.querySelector('.exp-amt-starting-age').value = parseInt(this.value) + 1;
                    validateExpStartingYear(nextAmount, nextAmount.querySelector('.exp-amt-starting-age'))
                }
   }
    function validateExpStartingYear(amountItemElm, inputElement){
        //console.log('----------------'+inputElement.value, amountItemElm)
        isValidExpStYr=window.gblChecYear(inputElement)
        if (! isValidExpStYr)
            return false
        let previousAmt = amountItemElm.previousElementSibling;
        if (previousAmt) {
            elmAmtStarPrevAge= previousAmt.querySelector('.exp-amt-starting-age')
            elmAmtStarPrevInterval= previousAmt.querySelector('.exp-amt-every-few-years')
            //window.removeErrorComponent(elmAmtStartNext)
            //console.log(elmAmtStarPrev)
            //console.log(inputElement)
            isValidTemp=window.gblCheckGreaterEqualAddOn(elmAmtStarPrevAge,elmAmtStarPrevInterval,inputElement,'previous','occurance','Start Age')
            if (! isValidTemp)
                isValidExpStYr=false
            if (isValidExpStYr && ! window.gblCheckNumberRange(inputElement,'Starting Age',1,80))
                isValidExpStYr=false
            if (isValidExpStYr && window.checkIfNotEmpty(inputElement.value) && inputElement.value>0)
                previousAmt.querySelector('.exp-amt-until-age').value = inputElement.value - 1;
            
        } else{     //first one
            let current_age = document.getElementById('curr-age') 
            isValidTemp=window.gblCheckGreater(current_age,inputElement,'Current Age ('+current_age.value+')',' Start Age')
            if (! isValidTemp)
                isValidExpStYr=false
            else if (! window.gblCheckNumberRange(inputElement,'Starting Age',1,80)){
                isValidExpStYr=false
            }
        }
        elmAmtUntil = amountItemElm.querySelector('.exp-amt-until-age')
        //window.removeErrorComponent(elmAmtUntil)
        let nextAmt = amountItemElm.nextElementSibling;
        if (isValidExpStYr){         
            if(nextAmt){
                elmAmtStartNext= nextAmt.querySelector('.exp-amt-starting-age')
                window.removeErrorComponent(elmAmtStartNext)
                isValidTemp=window.gblCheckGreaterEqual(inputElement,elmAmtStartNext,'previous',' Start age')
                if (! isValidTemp)
                    isValidExpStYr=false
                else if (isValidTemp && ! window.gblCheckNumberRange(elmAmtStartNext,'Starting Age',1,80)){
                    isValidTemp=false
                    if (! isValidTemp)
                        isValidExpStYr=false
                }            
            }else{
                //console.log('++++++++++++++++')
                //console.log(inputElement)
                //console.log(elmAmtUntil)
                //window.removeErrorComponent(elmAmtUntil)

                //elmUntilYr=amtItemElm.querySelector('.exp-amt-until-age')
                
                window.removeErrorComponent(elmAmtUntil)
                isValidTemp=window.gblChecOptionalYear(elmAmtUntil)
                //console.log(isValidTemp+'bbbbb'+isValidExpStYr)
                if (! isValidTemp)
                    isValidExpStYr=false
                //console.log('ccccc'+isValidExpStYr)
                //console.log(elmAmtUntil)
                //console.log(amountItemElm.querySelector('.exp-amt-starting-age'))
                if (isValidTemp)
                    isValidTemp=window.gblCheckGreaterEqual(amountItemElm.querySelector('.exp-amt-starting-age'),elmAmtUntil,'Start Age',' Until Age')
                if (! isValidTemp)
                    isValidExpStYr=false
                else if (isValidTemp && ! window.gblCheckNumberRange(amountItemElm.querySelector('.exp-amt-starting-age'),'Starting Age',1,80)){
                    isValidTemp=false
                    if (! isValidTemp)
                        isValidExpStYr=false
                }            
                //isValid=window.gblCheckGreaterEqual(inputElement,elmAmtUntil,'Start Year',' Until Year')
                //console.log('00000000'+isValid)
            }
        }
        return isValidExpStYr
    }
    window.validateExpTabsExtra = function() {
        isExpTabValid=true
        let firstExp = document.querySelector('.expense-item:first-child'); 
        preNames=[]
        while (firstExp) {
            elmName= firstExp.querySelector('.exp-name')
            currentName=window.trimVal(elmName.value) 
            window.removeErrorComponent(elmName)
            is_temp_Valid = window.gblCheckEmpty(elmName)
            if (! is_temp_Valid)
                isExpTabValid=false              
            else if (preNames.includes(currentName)){
                isExpTabValid=false
                window.addErrorComponent(elmName, `This name is existed`)
            }
            //console.log('============1====='+isExpTabValid)
            preNames.push(currentName);

            let amountItemElms = firstExp.querySelectorAll('.amount-item');
            amountItemElms.forEach((item, index) => {
                //console.log(item)
                elmAmtStart= item.querySelector('.exp-amt-starting-age')
                isValidTemp = validateExpStartingYear(item,elmAmtStart)
                //console.log(isValidTemp+'=8==============='+isExpTabValid)                
                if (! isValidTemp)
                    isExpTabValid=false
                //console.log('=2================'+isExpTabValid)
            });
            firstExp = firstExp.nextElementSibling;
            //console.log('==========3======='+isExpTabValid)
        }  
        //console.log('================='+isExpTabValid)
        return isExpTabValid
    }
    function validateExpStartingYearFromPage(inputElement){
        //let lastamount = document.querySelector('.expense-item:last-child')  
        let elmExpItem = getCurrentExpenseItem(inputElement)      
        let amountItemElm = elmExpItem.querySelectorAll('.amount-item')[0];
        //console.log(inputElement)
        validateExpStartingYear(amountItemElm,inputElement)
    }

    function validateExpIntervalFromPage(inputElement){        
                //console.log
        let elmExpItem = getCurrentExpenseItem(inputElement)   
        let elmFirstInterval = elmExpItem.querySelectorAll('.amount-item')[0];   
        window.gblChecOptionalYear(inputElement)
        let nextAmount = elmFirstInterval.nextElementSibling;
        if (nextAmount && nextAmount.classList.contains('amount-item')) {
            validateExpStartingYear(nextAmount, nextAmount.querySelector('.exp-amt-starting-age'))
        }
    }

      function getExpValueFromOtherTab(inputId) {
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


    function validateExpNameDuplicatedFull(){
        return validateExpNameDuplicatedFullOpt(false)
    }
    function validateExpNameDuplicatedFullOpt(isCheckEmpty){
        isValidExpNmDpFO=true
        let firstIncome = document.querySelector('.expense-item:first-child'); 
        preNames=[]
        while (firstIncome) {
            elmName= firstIncome.querySelector('.exp-name')
            currentName=window.trimVal(elmName.value) 
            window.removeErrorComponent(elmName)

            if (isCheckEmpty){
                is_temp_Valid = window.gblCheckEmpty(nameElem)
                if (! is_temp_Valid)
                    isValidExpNmDpFO=false     
            }
            preNames=[]
            if (currentName != '' && preNames.includes(currentName)){
                isValidExpNmDpFO
                window.addErrorComponent(elmName, `This name is existed`)
            }
            preNames.push(currentName);
            firstIncome = firstIncome.nextElementSibling;
        }  
        return isValidExpNmDpFO
    }

    function validateExpNameDuplicated(nameElem){
        isValidExpDupNmA=false
        let firstIncome = document.querySelector('.expense-item:first-child'); 
       
        window.removeErrorComponent(nameElem)
        is_temp_Valid = window.gblCheckEmpty(nameElem)
        if (! is_temp_Valid)
            isValidExpDupNmA=false     
        preNames=[]
        while (firstIncome) {
            elmName= firstIncome.querySelector('.exp-name')
            currentName=window.trimVal(elmName.value) 
            if (elmName === nameElem){
                firstIncome = firstIncome.nextElementSibling;
                continue;
            }
            window.removeErrorComponent(elmName)
            if (preNames.includes(currentName)){
                isValidExpDupNmA=false
                window.addErrorComponent(elmName, `This name is existed`)
            }
            preNames.push(currentName);
            firstIncome = firstIncome.nextElementSibling;
        }  
        if (preNames.includes(nameElem.value)){
            isValidExpDupNmA=false
            window.addErrorComponent(nameElem, `This name is existed`)
        }
        return isValidExpDupNmA
    }

    window.onExpTabLoad = function() {
        let firstExp = document.querySelector('.expense-item:first-child'); 
        if (firstExp) {
            elmStart= firstExp.querySelector('.exp-amt-starting-age')
            elmStart.min=window.convertToInt(document.getElementById('curr-age').value)+1
            if(! window.checkIfNotEmpty(elmStart.value))
                elmStart.value=window.convertToInt(document.getElementById('retire-age').value)+1
        }
    }

    function callKeyUpAmountFunction(inputElement){
        const inputValue = inputElement.value;
        const numericValue = inputValue.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Add commas
        inputElement.value = formattedValue;
    }
    