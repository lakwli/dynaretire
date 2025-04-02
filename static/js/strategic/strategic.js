    
	$(document).ready(function() { 
        const StrategicContainer = document.getElementById('strategic-container');

        // Function to add a new amount detail
        function addRebalDetail(event) {
            event.preventDefault();
            let rebalsContainer = event.target.closest('.strategic-item').querySelector('.rebals-container');
            let lastRebal = rebalsContainer.querySelector('.rebal-item:last-child');
            let newRebal = document.createElement('div');
            newRebal.className = 'columns is-multiline rebal-item';
            let everyFewYearsValue = lastRebal.querySelector('.stg-every-few-years').value;
            let untilYearValue = parseInt(lastRebal.querySelector('.stg-until-age').value) || 0;
            startmin=window.convertToInt(document.getElementById('retire-age').value)+1
            var fundnames = [];
            $('input[name="fundname"]').each(function() {
                fundnames.push($(this).val());
            });
            //const optionsAsString = fundnames.map((option) => `<option>${option}</option>`).join('');
            row_num=1
            newRebal.innerHTML = `
                <div class="column">
                    <input class="input is-primary risk-ratio has-text-right" 
                           type="text"
                           pattern="[0-9.]*"
                           inputmode="decimal"
                           placeholder="e.g. 60"
                           oninput="validateRateUponInput(this, {min: 0, max: 99, decimalPlaces: 0}); validateFirstRatio(this)"
                           onchange="validateFirstRatio(this)">
                </div>
                <div class="column">
                    <input disabled class="input stg-ratio-second has-text-right" min=1 type="number" >
                </div>
                <div class="column">
                    <input class="input is-primary stg-starting-age has-text-right" type="text" pattern="\\d{1,2}" maxlength="2" min=${startmin} placeholder="When the rebalancing started?" onchange="onChangeStgStartYear(this)" oninput="onChangeStgStartYear(this)">
                </div>
                <div class="column">
                    <input class="input is-info stg-until-age has-text-right" type="text" pattern="\\d{1,2}" maxlength="2" placeholder="When the rebalancing ended?" value="100" onchange="validateStgUntilYear(this)" oninput="validateStgUntilYear(this)">
                </div>
                <div class="column">                          
                    <div class="field has-addons">
                        <div class="control is-expanded" >
                            <input class="input is-primary stg-every-few-years has-text-right" name="stg-every-few-years" type="number" min="1" placeholder="Is this rebalancing occurrance years"  value="${everyFewYearsValue}" onChange="validateStgFewYear(this)">
                        </div>
                        <div class="control" >
                            <button class="icon-button add-rebal " aria-label="Add Rebalance Ratio"  title="Add a different rebalance ratio for another period">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="control" >
                            <button class="icon-button delete-rebal icon-placeholder" aria-label="Delete Rebalance Ratio" title="Remove this rebalance ratio">
                                <i class="fas fa-minus"></i>
                            </button>
                        </div>
                    </div>      
                </div>
            `;
            newRebal.querySelector('.delete-rebal').classList.remove('icon-placeholder');
            newRebal.querySelector('.delete-rebal').addEventListener('click', deleteRebalDetail);
            lastRebal.querySelector('.add-rebal').classList.add('icon-placeholder');
            newRebal.querySelector('.add-rebal').addEventListener('click', addRebalDetail);
            // Add event listener for changes in the starting year
            newRebal.querySelector('.stg-starting-age').addEventListener('change', function() {
                let previousRebal = newRebal.previousElementSibling;
                if (previousRebal) {
                    previousRebal.querySelector('.stg-until-age').value = this.value - 1;
                }
            });
            // Add event listener for changes in the until year
            newRebal.querySelector('.stg-until-age').addEventListener('change', function() {
                let nextRebal = newRebal.nextElementSibling;
                if (nextRebal && nextRebal.classList.contains('rebal-item')) {
                    nextRebal.querySelector('.stg-starting-age').value = parseInt(this.value) + 1;
                }
            });

            
            //make the previous until year disabled
            //let previousRebal = newRebal.previousElementSibling;
            prev_until = lastRebal.querySelector('.stg-until-age')
            curr_until = newRebal.querySelector('.stg-until-age')
            prev_until.disabled=true
            prev_until.classList.remove('is-info');
            prev_until.classList.add('is-normal');            
            window.removeErrorComponent(prev_until)
            curr_until.value=prev_until.value
            rebalsContainer.appendChild(newRebal);
            setTimeout(() => {
                newRebal.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 0);
        }

        // Function to delete an rebal detail
        function deleteRebalDetail(event) {
            stgItem=event.target.closest('.columns.rebal-item')
            laststg = stgItem.closest('.strategic-item');
            
            event.target.closest('.columns.rebal-item').remove();

            let lastRebal = laststg.querySelector('.rebal-item:last-child')
            lastRebal.querySelector('.add-rebal').classList.remove('icon-placeholder');//handle the + add amount icon
            curr_until = lastRebal.querySelector('.stg-until-age')
            curr_until.disabled=false
            curr_until.classList.remove('is-normal');
            curr_until.classList.add('is-info');            
            window.removeErrorComponent(curr_until)
            window.gblCheckGreaterEqual(lastRebal.querySelector('.stg-starting-age'),curr_until,'Start Age',' Until Age')
            curr_until.focus()
        }

        // Add event listeners
        document.querySelectorAll('.add-rebal').forEach(button => {
            button.addEventListener('click', addRebalDetail);
        });
        document.querySelectorAll('.delete-rebal').forEach(button => {
            button.addEventListener('click', deleteRebalDetail);
        });

        
    });


    function onClickApplyMin(checkboxElem) {
        
        if(checkboxElem.checked) {
            //document.getElementById('stg-retire-yr').classList.remove('is-hidden');
            document.getElementById('stg-exp-return-rate').classList.remove('is-hidden');
            //document.getElementById('stg-default-return-rate').classList.remove('is-hidden');
        } else {
            elmApplyBuck= document.getElementById('stg-apply-bucket')
            if(! elmApplyBuck.checked){
                //document.getElementById('stg-retire-yr').classList.add('is-hidden');
                document.getElementById('stg-exp-return-rate').classList.add('is-hidden');
                //document.getElementById('stg-default-return-rate').classList.add('is-hidden');
            }
        }
      }

      
    function onClickApplyBucket(checkboxElem) {     
        if(checkboxElem.checked) {
            //document.getElementById('stg-retire-yr').classList.remove('is-hidden');
            document.getElementById('stg-exp-return-rate').classList.remove('is-hidden');
            //document.getElementById('stg-default-return-rate').classList.remove('is-hidden');
            document.getElementById('stg-risky-fund').classList.remove('is-hidden');
            document.getElementById('stg-safer-fund').classList.remove('is-hidden');
            document.getElementById('stg-rebal-opt').classList.remove('is-hidden');
            document.getElementById('rebals-container').classList.remove('is-hidden');
            document.getElementById('stg-add-rebal').classList.remove('is-hidden');
        } else {
            elmApplyMin= document.getElementById('stg-min_spend')
            if(! elmApplyMin.checked){
                //document.getElementById('stg-retire-yr').classList.add('is-hidden');
                document.getElementById('stg-exp-return-rate').classList.add('is-hidden');
                //document.getElementById('stg-default-return-rate').classList.add('is-hidden');
            }
            document.getElementById('stg-risky-fund').classList.add('is-hidden');
            document.getElementById('stg-safer-fund').classList.add('is-hidden');
            document.getElementById('stg-rebal-opt').classList.add('is-hidden');
            document.getElementById('rebals-container').classList.add('is-hidden');
            document.getElementById('stg-add-rebal').classList.add('is-hidden');
        }
      }

      function validateStgRetireYear(inputElement){
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
      function validateStgReturnRate(inputElement){
        return window.gblChecRate(inputElement, 'Rate')
      }
      function validateStgDefaultReturnRate(inputElement){
        return window.gblChecRate(inputElement, 'Rate')
      }
      function validateStgFewYear(inputElement){
        return window.gblChecYear(inputElement)
      }

      function validateFirstRatio(inputElement){
        window.removeErrorComponent(inputElement)        
        isRValid = window.gblCheckEmpty(inputElement)
        if (isRValid){
            isRValid = window.gblCheckNumberRange(inputElement,'Ratio',0,99)
        }    
        if (isRValid){
            elmRebal = inputElement.closest('.rebal-item'); 
            elmNext = elmRebal.querySelector('.stg-ratio-second')
            elmNext.value = 100 - inputElement.value
        }
        return isRValid
      }

      
      function validateStgUntilYear(inputElement){
        // Remove non-numeric characters and limit to 2 digits
        let value = inputElement.value.replace(/[^\d]/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2);
        }
        inputElement.value = value;

        // During oninput event, only validate if we have 2 digits
        let isInputEvent = this.event && this.event.type === 'input';
        if (isInputEvent && value.length < 2) {
            window.removeErrorComponent(inputElement);
            return true;
        }

        isValidStgUnYr = true;
        elmRebal = inputElement.closest('.rebal-item');
        elmRebalStarting = elmRebal.querySelector('.stg-starting-age')
        window.removeErrorComponent(inputElement)
        isValidTemp = window.gblChecOptionalYear(inputElement)
        if (!isValidTemp)
            isValidStgUnYr = false
        if (isValidTemp)
            isValidTemp = window.gblCheckGreaterEqual(elmRebalStarting, inputElement, 'Start Age', ' Until Age')
        if (!isValidTemp)
            isValidStgUnYr = false
        return isValidStgUnYr
      }


      function onChangeStgStartYear(inputElement){
        validateStgStartYear(inputElement)
      }

      function validateStgStartYear(inputElement){
        // Remove non-numeric characters and limit to 2 digits
        let value = inputElement.value.replace(/[^\d]/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2);
        }
        inputElement.value = value;

        // During oninput event, only validate if we have 2 digits
        let isInputEvent = this.event && this.event.type === 'input';
        if (isInputEvent && value.length < 2) {
            window.removeErrorComponent(inputElement);
            return true;
        }

        isValidStgStYr = window.gblChecYear(inputElement)
        if (!isValidStgStYr)
            return false;
        elmRebal = inputElement.closest('.rebal-item');

        let previousRebal = elmRebal.previousElementSibling;  
        if (previousRebal) {
            elmRebalStarPrev= previousRebal.querySelector('.stg-starting-age')
            isValidTemp=window.gblCheckGreater(elmRebalStarPrev,inputElement,'previous',' Start Age')
                     
            if (! isValidTemp)
                isValidStgStYr=false
            if (isValidStgStYr && window.checkIfNotEmpty(inputElement.value) && inputElement.value>0)
                previousRebal.querySelector('.stg-until-age').value = inputElement.value - 1;
        }else{
            let retire_age = document.getElementById('retire-age') 
            isValidTemp=window.gblCheckGreater(retire_age,inputElement,'Retirement Age ('+retire_age.value+')',' Start Age')
            if (! isValidTemp)
                isValidStgStYr=false
        }
        
        let nextRebal = elmRebal.nextElementSibling;
        if (isValidStgStYr){         
            if(nextRebal){
                elmRebalStartNext= nextRebal.querySelector('.stg-starting-age')
                window.removeErrorComponent(elmRebalStartNext)
                isValidTemp=window.gblCheckGreaterEqual(inputElement,elmRebalStartNext,'previous',' Start Age')
                if (! isValidTemp)
                    isValidStgStYr=false
            }else{
                elmRebalUntil = elmRebal.querySelector('.stg-until-age')
                window.removeErrorComponent(elmRebalUntil)
                isValidTemp=window.gblChecOptionalYear(elmRebalUntil)
                if (! isValidTemp)
                    isValidStgStYr=false
                if (isValidTemp)
                    isValidTemp=window.gblCheckGreaterEqual(inputElement,elmRebalUntil,'Start Age',' Until Age')
                if (! isValidTemp)
                    isValidStgStYr=false
            }
        }
        return isValidStgStYr
      }
    
    function changeRiskyFund(){
        fundnames = window.gettingFundsName()
        //if user select the same risky fund later as the safer fund,
        //system is now switch next safer fund option diff from risk fund
        //should it be empty for selection? or force user to select
        /** 
        let riskyFund = document.getElementById('stg-risky-fund-sel'); 
        selrVal = riskyFund.value
        let saferFund = document.getElementById('stg-safer-fund-sel'); 
        selsVal = saferFund.value

        if (saferFund.options[0]=='')
            saferFund.removeChild(saferFund.firstChild)        
        if (selsVal!='' && selrVal == selsVal && saferFund.options.length>1){
            console.log('dddddddddddddddddddd ->'+selsVal)
            var opt = document.createElement('option');
            opt.value = '';
            opt.text = '';
            saferFund.insertBefore(opt,saferFund.firstChild);
            saferFund.selectedIndex=0
            return
        }*/
        puttingStgFunds(false,null)
    }
    window.onStgTabLoad = function() {
        elmApplyBucket = document.getElementById('stg-apply-bucket')
        elmMinRate = document.getElementById('stg-min_spend')
        curchecked=elmApplyBucket.checked
        curcheckedMin=elmMinRate.checked
        fundnames = window.gettingFundsName()
        riskFundNm=window.getRisksFundName()
        if (riskFundNm.length==0 || fundnames.length<=2){//first 1 is "", 2nd one is compulsory 
            elmApplyBucket.checked=false
            elmApplyBucket.disabled=true
        }else{
            elmApplyBucket.checked=curchecked
            elmApplyBucket.disabled=false
        }
        onClickApplyBucket(elmApplyBucket)

        if(riskFundNm.length==0){
            elmMinRate.checked=false
            elmMinRate.disabled=true
        }
        else{
            elmMinRate.checked=curcheckedMin
            elmMinRate.disabled=false
        }
        onClickApplyMin(elmMinRate)

        if (riskFundNm.length==1)
            puttingStgFunds(true,riskFundNm[0])
        else
            puttingStgFunds(true,null)

        
        let firstStg = document.querySelector('.strategic-item:first-child'); 
        //console.log(firstStg)
        if (firstStg) {
            elmStart= firstStg.querySelector('.stg-starting-age')
            //console.log(elmStart)
            elmStart.min=window.convertToInt(document.getElementById('retire-age').value)+1
            if(! window.checkIfNotEmpty(elmStart.value))
                elmStart.value=window.convertToInt(document.getElementById('retire-age').value)+1
        }
    }

    //TODO: if user change safer fund, then back to risky fund chose the same (always keep risky fund free to chose), make the safer fund empty and force user to select with error
    //when risky fund is empty, always make the safer fund disabled. this happen when remove fund, end up the risky fund empty, but the safer fund still remain existing.....
    function puttingStgFunds(isPopRiskFund, preferSelValue) {
        fundnames = window.gettingFundsName()
        riskFundNm=window.getRisksFundName()
        let riskyFund = document.getElementById('stg-risky-fund-sel'); 
        if (isPopRiskFund)
            selVal = puttingStgFundsIntoSel(riskyFund,riskFundNm,preferSelValue)
        else
            selVal = riskyFund.value
        if (riskyFund.options.length == 1) {
            riskyFund.disabled=true
        }else{
            riskyFund.disabled=false
        }

        let saferFund = document.getElementById('stg-safer-fund-sel'); 
        if (selVal==''){      
            while (saferFund.options.length > 0) 
                saferFund.remove(0);
            saferFund.disabled=true
            return
        }

        if (selVal != null && selVal!='')
            fundnames = fundnames.filter(item => item !== selVal);
        fundnames = fundnames.filter(item => item !== '');//default ''
        
        if (fundnames.length==1){            
            while (saferFund.options.length > 0) 
                saferFund.remove(0);
            var opt = document.createElement('option');
            opt.value = fundnames[0];
            opt.text = fundnames[0];
            saferFund.appendChild(opt);
            saferFund.disabled=true
        }
        else{
            saferFund.disabled=false
            puttingStgFundsIntoSel(saferFund,fundnames,null)
        }
    }

    
    function puttingStgFundsIntoSel (selectElement, fundnames, preferSelValue) {
        var currentValue = selectElement.value;
        if (currentValue=='' || currentValue==null){
            if (preferSelValue != null && preferSelValue != undefined){
                currentValue=preferSelValue
            }
        }
        var isSelectedValuePresent = fundnames.includes(currentValue);
    
        // Clear all existing options
        //console.log(selectElement)
        //console.log(selectElement.options)
        while (selectElement.options.length > 0) {
            selectElement.remove(0);
        }
        if (isSelectedValuePresent) 
            fundnames = fundnames.filter(item => item !== '');//default ''
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
            //return currentValue
        }
        return selectElement.value
    }
    function getElm(id){
        return document.getElementById(id)
    }
    window.validateStrategyTabsExtra = function() {
        isRebTbValid=true

        applymin=getElm('stg-min_spend')
        applybuck=getElm('stg-apply-bucket')
        //console.log(applybuck.checked+','+applymin.checked+'='+(! applybuck.checked && ! applymin.checked))
        if (! applybuck.checked && ! applymin.checked){
            return isRebTbValid
        }
        //console.log('dddddbbbbbbbbbbbdd: '+isRebTbValid)
        if(applymin.checked || applybuck.checked){
            //if (! validateStgRetireYear(getElm('stg-retire-year')))
                //isRebTbValid=false
            tempValid=validateStgReturnRate(getElm('stg-min_rate'))
            if(! tempValid)
                isRebTbValid=false
            //tempValid=validateStgDefaultReturnRate(getElm('stg-default_rate'))
            //if(! tempValid)
                //isRebTbValid=false
        }
        if(applymin.checked && ! applybuck.checked){
            return isRebTbValid
        }

        //console.log('ddddcccccccccccccccdddddddddd: '+isRebTbValid)
        //proceed to buck check
        elmRiskFund=getElm('stg-risky-fund-sel')
        window.removeErrorComponent(elmRiskFund)
        tempValid=window.gblCheckEmpty(elmRiskFund)
        if(! tempValid)
            isRebTbValid=false      
        else{
            isTempFValid = validateFundsSelection(elmRiskFund)
            if (! isTempFValid)
                isRebTbValid=false
        }

        //console.log('ddddddkkkkkkkkkkkkkkkddddddddd: '+isRebTbValid)
        elmSaferFund=getElm('stg-safer-fund-sel')
        window.removeErrorComponent(elmSaferFund)
        //if(! elmSaferFund.disabled){
        //    tempValid=window.gblCheckEmpty(elmSaferFund)
        //    if(! tempValid)
        //        isRebTbValid=false
        //}
        if(applybuck.checked){
            tempValid=window.gblCheckEmpty(elmSaferFund)
            if(! tempValid)
                isRebTbValid=false
            else{
                isTempFValid = validateFundsSelection(elmSaferFund)
                if (! isTempFValid)
                    isRebTbValid=false
            }
        }

        //console.log('dddddddddddd22222222222222dddddd: '+isRebTbValid)

        let firstRebal = document.querySelector('.rebal-item:first-child'); 
        while (firstRebal) {
            elmRiskRatio = firstRebal.querySelector('.risk-ratio')
            window.removeErrorComponent(elmRiskRatio)
            is_temp_Valid = validateFirstRatio(elmRiskRatio)
            if (!is_temp_Valid) {
                isRebTbValid = false;
            }

            //console.log('dddccccccccccccccddddddddddd: '+isRebTbValid)
            elmStartYear= firstRebal.querySelector('.stg-starting-age')
            window.removeErrorComponent(elmStartYear)
            is_temp_Valid = validateStgStartYear(elmStartYear)
            if (! is_temp_Valid)
                isRebTbValid=false            

            
            //console.log('ddddddddddbbbbbbbbbbbbbbbbbddddddddddddddd: '+isRebTbValid)
            elmUntilYear= firstRebal.querySelector('.stg-until-age')
            window.removeErrorComponent(elmUntilYear)
            if (! elmUntilYear.disabled){
                is_temp_Valid = validateStgUntilYear(elmUntilYear)
                if (! is_temp_Valid)
                    isRebTbValid=false   
            }         

            //console.log('ddddddddddddddddddddddddd: '+isRebTbValid)
            elmFewYear= firstRebal.querySelector('.stg-every-few-years')
            window.removeErrorComponent(elmFewYear)
            is_temp_Valid = validateStgFewYear(elmFewYear)
            if (! is_temp_Valid)
                isRebTbValid=false            

            firstRebal = firstRebal.nextElementSibling;
        }  
        return isRebTbValid
    }

    function validateFundsSelection(elmFundSelect){
        let found=false
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
            found=true
        }
        if(! found){
            window.addWarningComponent(elmFundSelect, 'Fund '+depositFund+' is removed')
           return false
        }
        return true
    }
