// main.js

$(document).ready(function() {
    var content = {}; // Object to store the content for each tab
    var loadingStatus = {
        funds: false,
        expenses: false,
        income: false,
        strategic: false
    };

    // Function to show loading indicator
    function showLoadingIndicator(tabName) {
        $('#' + tabName + '-content').html('<div class="is-flex is-justify-content-center is-align-items-center" style="height: 200px;"><div class="button is-loading is-large">Loading</div></div>');
    }

    // Function to load content for a tab with Promise
    function loadTabContent(tabName) {
        return new Promise((resolve, reject) => {
            if (!content[tabName]) {
                showLoadingIndicator(tabName);
                $.get('/' + tabName )
                    .done(function(data) {
                        content[tabName] = data;
                        loadingStatus[tabName] = true;
                        $('#' + tabName + '-content').html(data);
                        resolve();
                    })
                    .fail(function(error) {
                        console.error('Error loading ' + tabName + ':', error);
                        reject(error);
                    });
            } else {
                resolve();
            }
        });
    }

    // Load funds content first, then load others in background
    loadTabContent('funds').then(() => {
        // Show funds content immediately
        $('#funds-content').show();
        
        // Load other content in background
        Promise.all([
            loadTabContent('expenses'),
            loadTabContent('income'),
            loadTabContent('strategic')
        ]).catch(error => {
            console.error('Error loading background content:', error);
        });
    });

    // Handle clicking on tabs
    $('#steps-plan .steps-segment a').click(function(e) {
        e.preventDefault();
        
        var activeStep = $('.steps .steps-segment.is-active');
        var activeStepContent = $('.content-tab').eq(activeStep.index());
        if (!isTabValid(activeStepContent)) {
            return;
        }

        updateSuccessStepIcon(activeStep.attr('id'));
        removeErrorMessageIfAllTabsCorrect();
        $('#steps-plan .steps-segment').removeClass('is-active');
        $('#tab-content .content-tab').hide();

        $(this).parent().addClass('is-active');
        var target = $(this).parent().data('target');

        // Check if content is loaded
        if (!loadingStatus[target]) {
            showLoadingIndicator(target);
            loadTabContent(target).then(() => {
                $('#' + target + '-content').show();
                updateStepButtons();
                triggerTabLoadEvents(target);
            }).catch(() => {
                $('#' + target + '-content').html('<div class="notification is-danger">Error loading content. Please try again.</div>');
            });
        } else {
            $('#' + target + '-content').show();
            updateStepButtons();
            triggerTabLoadEvents(target);
        }
    });

    // Function to trigger tab-specific load events
    function triggerTabLoadEvents(target) {
        if (target === 'expenses') {
            window.onExpTabLoad();
        } else if (target === 'income') {
            window.onIncomeTabLoad();
        } else if (target === 'strategic') {
            window.onStgTabLoad();
        }
    }
  
/** CONTROL PREV and NEXT button start */
    $('#prev-btn').click(function(e) {
      e.preventDefault();
      var activeStep = $('#steps-plan .steps-segment.is-active');
      var prevStep = activeStep.prev('.steps-segment');
      if (prevStep.length) {
        prevStep.find('a')[0].click(); 
      }
    });
  
    $('#next-btn').click(function(e) {
      e.preventDefault();
      var activeStep = $('#steps-plan .steps-segment.is-active');
      var nextStep = activeStep.next('.steps-segment');
      if (nextStep.length) {
        nextStep.find('a')[0].click(); 
      }
    });

/** CONTROL PREV and NEXT button end */
    
    $('#submit-btn').click(function(e) {
            e.preventDefault(); // Prevent form submission
            plan_data = new Plan_Data(
                window.convertToInt(document.getElementById('curr-age').value),
                window.convertToInt(document.getElementById('retire-age').value)
            )

            var activeStep = $('.steps .steps-segment.is-active');
            var activeStepContent = $('.content-tab').eq(activeStep.index());
            
            if (! isTabValid(activeStepContent)) {
                return
            }
            
            updateSuccessStepIcon(activeStep.attr('id'))
            removeErrorMessageIfAllTabsCorrect()
            let msgs=[]
            let msg=null
            let currId=null
            let tabname=null
            for (let i = 0; i <= 3; i++) {
                if(i==activeStep.index())
                    continue
                var content = $('.content-tab').eq(i);

                switch(i){                        
                    case 0:tabname='Nest Egg';currId='funds';break; 
                    case 1:tabname='Spend Well Allocation';currId='expenses';break; 
                    case 2:tabname='Pleasure Income';currId='income';break; 
                    case 3:tabname='Resilient Saving Playgound';currId='strategic';break; 
                }
                if(! isTabValid(content)){
                    msg='An error occurred in the '+tabname+' step. Please revisit the step for necessary corrections.'
                    msgs.push(msg)
                    populateMessage('Error', 'is-danger', msg)
                    updateErrorStepIcon(currId)
                    return
                }else{
                    if(! isStepInfo(currId))
                        updateSuccessStepIcon(currId)
                }
            }

            elmSubmitBtn = document.getElementById('submit-btn')
            elmSubmitBtn.classList.add('is-loading')
            populateMessage('Info', 'is-info', 'Submitting data... Please wait')
            to_load_submit_data_funds(plan_data,e )
            const prettyJSON = JSON.stringify(plan_data, null, 2);
            console.log(prettyJSON);

            fetch('/planSubmit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ jsonData: prettyJSON })
            })
            .then(response => {
                const message = response.headers.get('Message');
                console.log(message); // Log the message from the server
            
                // Check if the content type is a file
                if (response.headers.get('Content-Type') === 'application/octet-stream') {
                    return response.blob();
                } else {
                    throw new Error('No file in response');
                }
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'dynaRetire.xlsx'; // Provide the filename and extension
                a.click(); // This will download the file
            })
            .then(result => {
                console.log('Success','Data saved successfully:', result);
                //populateMessage('Info', 'is-success', 'Testing')
                populateMessage('Success','is-success', 'Your simulation has been processed successfully and `dynaRetire.xlsx` is now ready for download. Please check your download folder')             
                elmSubmitBtn.classList.remove('is-loading')
            })
            .catch(error => {
                console.error('Error saving data:', error);
                populateMessage('Error', 'is-danger', 'System Error')                
                elmSubmitBtn.classList.remove('is-loading')
            });
    });

    function isTabValid(tabContent) {
        //var inputs = tabContent.find('input');
        //console.log(tabContent)  
        var activeTabContentId = tabContent.attr('id');
        
        //if ((activeTabContentId != 'funds-content'))
        //    return true
        isValid=window.onTabAllInputValidation(activeTabContentId, tabContent)

        return isValid;
    }
    
    function to_load_submit_data_funds(plan_data,event){        
        row_num=0
        const tabfund = document.getElementById('funds-content');   
        if (tabfund) {  
            tabfund.querySelectorAll('.fund-item').forEach(function(currentFundItem) {
                let fname = currentFundItem.querySelector('.fundname').value
                let fdesc = currentFundItem.querySelector('.funddesc').value
                let famount = window.convertToFloat(currentFundItem.querySelector('.fundamount').value)
                let fwithdrawage = window.convertToInt(currentFundItem.querySelector('.fundwithdrawage').value)
        
                freturnType=currentFundItem.querySelector('.funds-return-type').value
                freturnRate=null
                if(freturnType==='Flat'){
                    freturnRate=currentFundItem.querySelector('.funds-return-rate').value
               }else{
                freturnRate=currentFundItem.querySelector('.funds-index-ref').value
                }            
                //console.log(fname+'-------------------------'+freturnRate)
                freturnDefaultRate=window.convertToFloat(currentFundItem.querySelector('.funds-default-return').value)
                fmimicYear=window.convertToInt(currentFundItem.querySelector('.funds-mimic-year').value)
                freturnIndex=currentFundItem.querySelector('.funds-index-ref').value
                //if(freturnType==='Flat'){
                //    plan_data.add_fund (new Fund(fname,fdesc, famount,freturnRate,fwithdrawage));
               // }else{
                 //   plan_data.add_fund (new Fund(fname,fdesc, famount,freturnIndex,fwithdrawage));
                //}                
                plan_data.add_fund (new Fund(fname,fdesc, famount,freturnType, freturnRate,freturnDefaultRate,fmimicYear,fwithdrawage));
            });
        }        

/** 
        $('input[name="fundname"]').each(function() {
            fname= $(this).val()
            fdesc=$('input[name="funddesc"]:eq(' + row_num + ')').val()
            famount=$('input[name="fundamount"]:eq(' + row_num + ')').val()
            fwithdrawyr=$('input[name="fundwithdrawyr"]:eq(' + row_num + ')').val()
            
            
            freturnType=$('input[name="funds-return-type"]:eq(' + row_num + ')').val()
            freturnRate=$('input[name="funds-return-rate"]:eq(' + row_num + ')').val()
            freturnIndex=$('input[name="funds-index-ref"]:eq(' + row_num + ')').val()
            freturn = (freturnType==='Flat')?freturnRate:freturnIndex
            console.log(freturnType+'.'+freturnRate+'.'+freturnIndex+'.'+freturn)

            plan_data.add_fund (new Fund(fname, famount,freturn,fwithdrawyr));
            row_num=row_num+1
        });                
         */
        var apply_min_spend = $('#stg-min_spend').is(':checked')
        var apply_bucket = $('#stg-apply-bucket').is(':checked')
        //var retire_year =  $('#stg-retire-year').val();
        var risk_fund = $('#stg-risky-fund-sel').val();
        var safer_fund = $('#stg-safer-fund-sel').val();
        var rebal_pause_opt = $('#fundSelect-stg-pause-opt').val();
        //var stg_default_rate = $('#stg-default_rate').val();
        var exp_return_rate = $('#stg-min_rate').val();
        //stg=new Strategic(apply_min_spend,apply_bucket,risk_fund,safer_fund,rebal_pause_opt,retire_year,stg_default_rate,exp_return_rate); 
        stg=new Strategic(apply_min_spend,apply_bucket,risk_fund,safer_fund,rebal_pause_opt,exp_return_rate); 
        plan_data.set_strategic(stg);
        const tab = document.getElementById('strategic-content');   
        if (tab) {  
            let currentRebal = tab.querySelector('.rebal-item:last-child');
            while (currentRebal) {
                let element_occur_year = currentRebal.querySelector('.stg-every-few-years') 
                if (element_occur_year === null){
                        break;
                }   
                let risk_ratio = currentRebal.querySelector('.risk-ratio').value;  
                let stg_ratio_second = currentRebal.querySelector('.stg-ratio-second').value; 
                let stg_starting_year = currentRebal.querySelector('.stg-starting-age').value; 
                let stg_until_year = currentRebal.querySelector('.stg-until-age').value;
                let occur_year = element_occur_year.value;       
                stg.addRebalsFirstPos(new StrategicDetail(risk_ratio,stg_ratio_second,
                    stg_starting_year,stg_until_year,occur_year))
                currentRebal = currentRebal.previousElementSibling;
            }
        }        
        plan_data.set_strategic(stg);

        //************************EXPENSES********************* */
        const exptab = document.getElementById('expenses-content');   
        if (exptab) {  
            let currentExp = exptab.querySelector('.expense-item:last-child');
            while (currentExp) {
                let element_name = currentExp.querySelector('.exp-name') 
                if (element_name === null){
                        break;
                }   
                let name = element_name.value; 
                let inflation = currentExp.querySelector('.exp-inflation').value; 
                let minspend = currentExp.querySelector('.exp-minspend').value; 
                expense = new Expense(name,minspend,inflation);
                plan_data.addExpenseFirstPos(expense)

                //nested amount period
                let currentAmount = currentExp.querySelector('.amount-item:last-child');
                while (currentAmount) {                    
                    let element_amt = currentAmount.querySelector('.exp-amt-amt') 
                    if (element_amt === null){
                            break;
                    }   
                    let amt = window.convertToFloat(element_amt.value); 
                    let starting_age = currentAmount.querySelector('.exp-amt-starting-age').value; 
                    let until_age = currentAmount.querySelector('.exp-amt-until-age').value; 
                    let every_few_years = currentAmount.querySelector('.exp-amt-every-few-years').value; 
                    let tied_to_age = false // currentAmount.querySelector('.exp-tied-to-age').checked
                    expense.addAmountsFirstPos(new ExpenseDetail(amt,starting_age,until_age,every_few_years,tied_to_age))

                    currentAmount = currentAmount.previousElementSibling;
                }

                currentExp = currentExp.previousElementSibling;
            }
        }
        
        
        //************************INCOMES********************* */

        const incometab = document.getElementById('income-content');   
        if (incometab) {  
            let currentInc = incometab.querySelector('.income-item:last-child');
            while (currentInc) {
                let element_name = currentInc.querySelector('.inc-name') 
                if (element_name === null){
                        break;
                }   
                let name = element_name.value; 
                let amount = window.convertToFloat(currentInc.querySelector('.inc-amount').value); 
                let dep = currentInc.querySelector('.fundSelect-inc-dep').value; 
                income= new Income(name,amount,dep);
                plan_data.addIncomeFirstPos(income)

                //nested amount period
                let currentGrowth = currentInc.querySelector('.growth-item:last-child');                
                while (currentGrowth) {                    
                    let element_growth = currentGrowth.querySelector('.inc-growth-rate') 
                    if (element_growth === null){
                            break;
                    }   
                    let growth_rate = element_growth.value; 
                    let starting_age = currentGrowth.querySelector('.inc-growth-starting-age').value; 
                    let until_age = currentGrowth.querySelector('.inc-growth-until-age').value; 
                    income.addGrowthsFirstPos(new IncomeDetail(growth_rate, starting_age,until_age));

                    currentGrowth = currentGrowth.previousElementSibling;
                }

                currentInc = currentInc.previousElementSibling;
            }
        }

    }


});




window.populateFunds = function() {

    //to populate funds - start
    var fundnames = [''];
    $('input[name="fundname"]').each(function() {
    // Add the value of each input to the array
        fundnames.push($(this).val());
    });
    
    // Find all select elements with IDs starting with 'fund'
    $('select[id^="fund"]').each(function() {
    // Clear the select field before populating
    $(this).empty();
    
    // Populate the select field with the values
    $.each(fundnames, function(index, fundname) {
        $(this).append($('<option>', {
        value: fundname,
        text: fundname
        }));
    }.bind(this)); // Use .bind(this) to maintain the correct context inside the $.each callback
    });
}

window.gettingFundsName = function() {

    //to populate funds - start
    var fundnames = [''];
    $('input[name="fundname"]').each(function() {
    // Add the value of each input to the array
        fundnames.push($(this).val());
    });
    return fundnames
}

function updateSuccessStepIcon(stepSelector){
    updateStepIcon(stepSelector, 'is-success','fa-check')
}
function updateErrorStepIcon(stepSelector){
    updateStepIcon(stepSelector, 'is-danger','fa-exclamation-circle')
}
function isStepInfo(stepSelector){
    var stepElement = document.getElementById(stepSelector);
    const stepsMarker = stepElement.querySelector('.steps-marker');
    return stepsMarker.classList.contains('is-info')
}
function updateStepIcon(stepSelector, classnm, iconName) {
    // Select the step element
    var stepElement = document.getElementById(stepSelector);
    // Remove the existing number or icon
    const stepsMarker = stepElement.querySelector('.steps-marker');
    while (stepsMarker.firstChild) {
      stepsMarker.removeChild(stepsMarker.lastChild);
    }

    stepsMarker.classList.remove('is-primary')
    stepsMarker.classList.remove('is-danger')
    stepsMarker.classList.remove('is-success')
    stepsMarker.classList.remove('is-info')
    stepsMarker.classList.add(classnm)
    // Create the new icon element
    var iconElement = document.createElement('i');
    iconElement.className = 'fas ' + iconName; // e.g., 'fas fa-check'
  
    // Append the new icon element to the step marker
    stepElement.querySelector('.steps-marker').appendChild(iconElement);
  }
  //isReadyToSubmit: if user has entered fund with no index chosen, 
  function updateStepButtons() {
    var stepsCount = $('#steps-plan .steps-segment').length;
    var activeStepIndex = $('#steps-plan .steps-segment.is-active').index();
    if (activeStepIndex === 0) {
      $('#prev-btn').prop('disabled', true);
    } else {
      $('#prev-btn').prop('disabled', false);
    }
  
    // Disable 'next' button if on the last step
    if (activeStepIndex === stepsCount - 1) {
        //$('#next-btn').prop('disabled', true);
        $('#next-btn').addClass('is-hidden');
        $('#submit-btn').removeClass('is-hidden');
    } else {
        //$('#next-btn').prop('disabled', false);
        $('#submit-btn').addClass('is-hidden');
        $('#next-btn').removeClass('is-hidden');
    }
    toggleSubmitButton()
  }

  function toggleSubmitButton(currentStepId) {
    if (areAllStepsCompleted(currentStepId)) {
      $('#submit-btn').removeClass('is-hidden');
    } else {
      $('#submit-btn').addClass('is-hidden');
    }
  }

//as long as the funds and expenses tab is completed, it is consider as ready to submit
function areAllStepsCompleted() {
    
    var activeStep = $('.steps .steps-segment.is-active');
    excludeStepId= activeStep.attr('id')
    var allCompleted = false;
    
    var isFundsComplete=false
    var isExpensesComplete=false
    var isIncomeComplete=false
    var isStrategicComplete=false
    $('.steps-marker').each(function() {
        id = $(this).closest('.steps-segment').attr('id')

        if ($(this).find('.fa-check').length) {
            switch (id){
                case 'funds': isFundsComplete=true;break;
                case 'expenses': isExpensesComplete=true;break;
                case 'income': isIncomeComplete=true;break;
                case 'strategic': isStrategicComplete=true;break;
            }
        }
    });
    if((excludeStepId=='expenses' || isExpensesComplete )&& isFundsComplete)
        return true
    return allCompleted;
  }
  function removeErrorMessageIfAllTabsCorrect(){
    if (! areAllStepsCompleted())
        return
    const messageContainer = document.getElementById('message-container');
    const existingMessage = messageContainer.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
  }
  function populateMessage(title, messageType, msgContent) {
    // Get the message container
    const messageContainer = document.getElementById('message-container');

    // Remove existing message (if any)
    const existingMessage = messageContainer.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create a new message div
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', messageType);

    // Create message header
    const messageHeader = document.createElement('div');
    messageHeader.classList.add('message-header');
    messageHeader.innerHTML = `
        <p>${title}</p>
        <button class="delete" aria-label="delete"></button>
    `;

    // Create message body
    const messageBody = document.createElement('div');
    messageBody.classList.add('message-body');
    messageBody.classList.add('has-background-white');
    messageBody.textContent = msgContent;

    // Append header and body to the message div
    messageDiv.appendChild(messageHeader);
    messageDiv.appendChild(messageBody);

    // Append the new message div to the container
    messageContainer.appendChild(messageDiv);

    // Add event listener to handle message deletion
    const deleteButton = messageDiv.querySelector('.delete');
    deleteButton.addEventListener('click', () => {
        messageDiv.remove(); // Remove the message when delete button is clicked
    });
}
