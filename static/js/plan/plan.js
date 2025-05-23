// main.js

function downloadJsonData(jsonString, filename) {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename || 'data.json';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

$(document).ready(function() {
    // Add event listener for load button with mobile handling
    $('#load-btn').click(function(e) {
        e.preventDefault();
        // Force file selection mode on mobile
        const fileInput = $('#file-input')[0];
        fileInput.setAttribute('accept', '.json');  // Reinforce JSON only
        fileInput.setAttribute('data-role', 'none'); // Prevent mobile UI enhancement
        fileInput.click();
    });

    // Ensure mobile handles file selection properly
    $('#file-input').on('touchstart click', function(e) {
        e.stopPropagation(); // Prevent bubbling that might trigger unwanted mobile actions
    });
    
    // Function to reset steps to initial state
    function resetSteps() {
        // Reset all segments
        $('#steps-plan .steps-segment').removeClass('is-active');
        $('#steps-plan .steps-segment:first').addClass('is-active');
        
        // Reset markers to initial state
        $('#funds .steps-marker').removeClass().addClass('steps-marker is-primary').html('1');
        $('#expenses .steps-marker').removeClass().addClass('steps-marker is-primary').html('2');
        $('#income .steps-marker').removeClass().addClass('steps-marker is-info').html('?');
        $('#strategic .steps-marker').removeClass().addClass('steps-marker is-info').html('?');
        
        // Reset content tabs
        $('#tab-content .content-tab').hide();
        $('#funds-content').show();
    }

    // Handle file selection
    $('#file-input').change(function(e) {
        const file = e.target.files[0];
        
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async function(e) {
            
            isLoadingContent = true;  // Set loading state
            
            // Reset steps to initial state
            resetSteps();
            
            // Reset tab contents
            content = {}; // Clear cached content
            loadingStatus = {
                funds: false,
                expenses: false,
                income: false,
                strategic: false
            };
            
            // Load fresh content for all tabs
            await Promise.all([
                loadTabContent('funds'),
                loadTabContent('expenses'),
                loadTabContent('income'),
                loadTabContent('strategic')
            ]).catch(error => {
                console.error('Error reloading tabs:', error);
                populateMessage('Error', 'is-danger', 'Failed to reload tabs. Please try again.');
                return;
            });
            
            try {
                const jsonData = JSON.parse(e.target.result);

                // Helper function to setup a fund
                async function setupFund(fundItem, fundData) {
                    if (!fundItem || !fundData) {
                        console.warn('Missing fund item or data');
                        return;
                    }

                    try {
                        fundItem.querySelector('.fundname').value = fundData.name || '';
                        fundItem.querySelector('.funddesc').value = fundData.desc || '';
                        fundItem.querySelector('.fundamount').value = fundData.amount || '';
                        fundItem.querySelector('.fundwithdrawage').value = fundData.wt_age || '';

                        const returnTypeSelect = fundItem.querySelector('.funds-return-type');
                        if (returnTypeSelect) {
                            returnTypeSelect.value = fundData.return_type;
                            returnTypeSelect.dispatchEvent(new Event('change'));
                            await new Promise(resolve => setTimeout(resolve, 100));

                            if (fundData.return_type === 'Flat') {
                                fundItem.querySelector('.funds-return-rate').value = fundData.return_rate || '';
                            } else {
                                fundItem.querySelector('.funds-index-ref').value = fundData.return_rate || '';
                                fundItem.querySelector('.funds-default-return').value = fundData.default_rate || '';
                                fundItem.querySelector('.funds-mimic-year').value = fundData.mimic_calendar_year || '';
                            }

                            // Verify all inputs are set correctly
                            await new Promise(resolve => setTimeout(resolve, 50));
                            const verifyInputs = fundItem.querySelectorAll('input[required]');
                            verifyInputs.forEach(input => {
                                if (!input.value) {
                                    console.warn(`Required field ${input.className} is empty`);
                                }
                            });
                        }
                    } catch (err) {
                        console.error('Error setting up fund:', err);
                        throw new Error('Failed to setup fund properly');
                    }
                }

                // Helper function to load tab with progress
                async function loadTabWithProgress(tabName, message) {
                    populateMessage('Info', 'is-info', message);
                    await loadTabContent(tabName);
                    $(`#${tabName}-content`).hide();
                    await new Promise(resolve => setTimeout(resolve, 200));
                }

                // Start loading process
                populateMessage('Info', 'is-info', 'Loading plan configuration...');

                // Load funds tab first
                await loadTabContent('funds');
                $('#funds-content').show();

                // Set basic fields
                document.getElementById('curr-age').value = jsonData.current_age || '';
                document.getElementById('retire-age').value = jsonData.retire_age || '';

                // Process funds
                if (jsonData.funds && jsonData.funds.length > 0) {
                    populateMessage('Info', 'is-info', 'Loading fund data...');
                    
                    // Setup first fund
                    await setupFund(document.querySelector('.fund-item'), jsonData.funds[0]);

                    // Add remaining funds
                    const addFundButton = document.querySelector('.add-fund');
                    for (let i = 1; i < jsonData.funds.length; i++) {
                        populateMessage('Info', 'is-info', `Loading fund ${i + 1} of ${jsonData.funds.length}...`);
                        if (addFundButton) {
                            try {
                                addFundButton.click();
                                await new Promise(resolve => setTimeout(resolve, 200));
                                const newFund = document.querySelector('.fund-item:last-child');
                                if (!newFund) {
                                    throw new Error('Failed to create new fund item');
                                }
                                await setupFund(newFund, jsonData.funds[i]);
                                
                                // Trigger validation on required fields
                                newFund.querySelectorAll('input[required]').forEach(input => {
                                    input.dispatchEvent(new Event('change'));
                                });
                            } catch (err) {
                                console.error(`Error adding fund ${i + 1}:`, err);
                                populateMessage('Warning', 'is-warning', `Issue loading fund ${i + 1}. Please verify data.`);
                                await new Promise(resolve => setTimeout(resolve, 500));
                            }
                        }
                    }
                }

                // Helper function to setup an expense amount detail
                async function setupAmountDetail(amountItem, amountData) {
                    if (!amountItem || !amountData) {
                        console.warn('Missing amount item or data');
                        return;
                    }

                    try {
                        amountItem.querySelector('.exp-amt-amt').value = amountData.amount || '';
                        amountItem.querySelector('.exp-amt-starting-age').value = amountData.start_age || '';
                        amountItem.querySelector('.exp-amt-until-age').value = amountData.until_age || '';
                        amountItem.querySelector('.exp-amt-every-few-years').value = amountData.occur_yr || '1';

                        // Trigger validation on required fields
                        amountItem.querySelectorAll('input[required]').forEach(input => {
                            input.dispatchEvent(new Event('change'));
                        });
                    } catch (err) {
                        console.error('Error setting up amount detail:', err);
                        throw new Error('Failed to setup amount detail properly');
                    }
                }

                // Helper function to setup an expense
                async function setupExpense(expenseItem, expenseData) {
                    if (!expenseItem || !expenseData) {
                        console.warn('Missing expense item or data');
                        return;
                    }

                    try {
                        expenseItem.querySelector('.exp-name').value = expenseData.name || '';
                        expenseItem.querySelector('.exp-inflation').value = expenseData.inflation ?? '';
                        expenseItem.querySelector('.exp-minspend').value = expenseData.min_rate ?? '';

                        // Setup first amount detail
                        if (expenseData.amounts && expenseData.amounts.length > 0) {
                            await setupAmountDetail(expenseItem.querySelector('.amount-item'), expenseData.amounts[0]);

                            // Add remaining amount details
                            const addAmountButton = expenseItem.querySelector('.add-amount');
                            for (let i = 1; i < expenseData.amounts.length; i++) {
                                if (addAmountButton) {
                                    try {
                                        addAmountButton.click();
                                        await new Promise(resolve => setTimeout(resolve, 200));
                                        const newAmount = expenseItem.querySelector('.amount-item:last-child');
                                        if (!newAmount) {
                                            throw new Error('Failed to create new amount detail');
                                        }
                                        await setupAmountDetail(newAmount, expenseData.amounts[i]);
                                    } catch (err) {
                                        console.error(`Error adding amount detail ${i + 1}:`, err);
                                        populateMessage('Warning', 'is-warning', `Issue loading amount detail ${i + 1}. Please verify data.`);
                                        await new Promise(resolve => setTimeout(resolve, 500));
                                    }
                                }
                            }
                        }

                        // Trigger validation on required fields
                        expenseItem.querySelectorAll('input[required]').forEach(input => {
                            input.dispatchEvent(new Event('change'));
                        });
                    } catch (err) {
                        console.error('Error setting up expense:', err);
                        throw new Error('Failed to setup expense properly');
                    }
                }

                // Process expenses
                if (jsonData.expenses && jsonData.expenses.length > 0) {
                    populateMessage('Info', 'is-info', 'Loading expenses data...');
                    
                    // Load expenses tab first
                    await loadTabWithProgress('expenses', 'Loading expenses data...');
                    if (window.onExpTabLoad) {
                        await new Promise(resolve => {
                            window.onExpTabLoad();
                            setTimeout(resolve, 200);
                        });
                    }

                    // Setup first expense
                    await setupExpense(document.querySelector('.expense-item'), jsonData.expenses[0]);

                    // Add remaining expenses
                    const addExpenseButton = document.querySelector('.add-expense');
                    for (let i = 1; i < jsonData.expenses.length; i++) {
                        populateMessage('Info', 'is-info', `Loading expense ${i + 1} of ${jsonData.expenses.length}...`);
                        if (addExpenseButton) {
                            try {
                                addExpenseButton.click();
                                await new Promise(resolve => setTimeout(resolve, 200));
                                const newExpense = document.querySelector('.expense-item:last-child');
                                if (!newExpense) {
                                    throw new Error('Failed to create new expense item');
                                }
                                await setupExpense(newExpense, jsonData.expenses[i]);
                            } catch (err) {
                                console.error(`Error adding expense ${i + 1}:`, err);
                                populateMessage('Warning', 'is-warning', `Issue loading expense ${i + 1}. Please verify data.`);
                                await new Promise(resolve => setTimeout(resolve, 500));
                            }
                        }
                    }
                }

                // Helper function to setup a growth detail
                async function setupGrowthDetail(growthItem, growthData) {
                    if (!growthItem || !growthData) {
                        console.warn('Missing growth item or data');
                        return;
                    }

                    try {
                        growthItem.querySelector('.inc-growth-rate').value = growthData.growth_rate ?? '';
                        growthItem.querySelector('.inc-growth-starting-age').value = growthData.start_age || '';
                        growthItem.querySelector('.inc-growth-until-age').value = growthData.until_age || '';

                        // Trigger validation on required fields
                        growthItem.querySelectorAll('input[required]').forEach(input => {
                            input.dispatchEvent(new Event('change'));
                        });
                    } catch (err) {
                        console.error('Error setting up growth detail:', err);
                        throw new Error('Failed to setup growth detail properly');
                    }
                }

                // Helper function to setup an income
                async function setupIncome(incomeItem, incomeData) {
                    if (!incomeItem || !incomeData) {
                        console.warn('Missing income item or data');
                        return;
                    }

                    try {
                        incomeItem.querySelector('.inc-name').value = incomeData.name || '';
                        incomeItem.querySelector('.inc-amount').value = incomeData.amount || '';
                        incomeItem.querySelector('.fundSelect-inc-dep').value = incomeData.dep_to_fund || '';

                        // Setup first growth detail
                        if (incomeData.growths && incomeData.growths.length > 0) {
                            await setupGrowthDetail(incomeItem.querySelector('.growth-item'), incomeData.growths[0]);

                            // Add remaining growth details
                            const addGrowthButton = incomeItem.querySelector('.add-growth');
                            for (let i = 1; i < incomeData.growths.length; i++) {
                                if (addGrowthButton) {
                                    try {
                                        addGrowthButton.click();
                                        await new Promise(resolve => setTimeout(resolve, 200));
                                        const newGrowth = incomeItem.querySelector('.growth-item:last-child');
                                        if (!newGrowth) {
                                            throw new Error('Failed to create new growth detail');
                                        }
                                        await setupGrowthDetail(newGrowth, incomeData.growths[i]);
                                    } catch (err) {
                                        console.error(`Error adding growth detail ${i + 1}:`, err);
                                        populateMessage('Warning', 'is-warning', `Issue loading growth detail ${i + 1}. Please verify data.`);
                                        await new Promise(resolve => setTimeout(resolve, 500));
                                    }
                                }
                            }
                        }

                        // Trigger validation on required fields
                        incomeItem.querySelectorAll('input[required]').forEach(input => {
                            input.dispatchEvent(new Event('change'));
                        });
                    } catch (err) {
                        console.error('Error setting up income:', err);
                        throw new Error('Failed to setup income properly');
                    }
                }

                // Process incomes
                if (jsonData.incomes && jsonData.incomes.length > 0) {
                    populateMessage('Info', 'is-info', 'Loading income data...');
                    
                    // Load income tab first
                    await loadTabWithProgress('income', 'Loading income data...');
                    if (window.onIncomeTabLoad) {
                        await new Promise(resolve => {
                            window.onIncomeTabLoad();
                            setTimeout(resolve, 200);
                        });
                    }

                    // Setup first income
                    const addIncomeButton = document.querySelector('.add-income');
                    if (addIncomeButton) {
                        try {
                            addIncomeButton.click();
                            await new Promise(resolve => setTimeout(resolve, 200));
                            const firstIncome = document.querySelector('.income-item');
                            if (!firstIncome) {
                                throw new Error('Failed to create first income item');
                            }
                            await setupIncome(firstIncome, jsonData.incomes[0]);

                            // Add remaining incomes
                            for (let i = 1; i < jsonData.incomes.length; i++) {
                                populateMessage('Info', 'is-info', `Loading income ${i + 1} of ${jsonData.incomes.length}...`);
                                try {
                                    addIncomeButton.click();
                                    await new Promise(resolve => setTimeout(resolve, 200));
                                    const newIncome = document.querySelector('.income-item:last-child');
                                    if (!newIncome) {
                                        throw new Error('Failed to create new income item');
                                    }
                                    await setupIncome(newIncome, jsonData.incomes[i]);
                                } catch (err) {
                                    console.error(`Error adding income ${i + 1}:`, err);
                                    populateMessage('Warning', 'is-warning', `Issue loading income ${i + 1}. Please verify data.`);
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                }
                            }
                        } catch (err) {
                            console.error('Error setting up incomes:', err);
                            populateMessage('Warning', 'is-warning', 'Issue loading incomes. Please verify data.');
                        }
                    }
                }

                // Helper function to setup a rebalancing detail
                async function setupRebalDetail(rebalItem, rebalData) {
                    if (!rebalItem || !rebalData) {
                        console.warn('Missing rebal item or data');
                        return;
                    }

                    try {
                        const riskRatioInput = rebalItem.querySelector('.risk-ratio');
                        riskRatioInput.value = rebalData.risk_fund_ratio || '';
                        // Directly call validateFirstRatio to calculate second ratio
                        window.validateFirstRatio(riskRatioInput);

                        // Set starting age first and trigger change to update previous until_age
                        const startAgeInput = rebalItem.querySelector('.stg-starting-age');
                        startAgeInput.value = rebalData.start_age || '';
                        startAgeInput.dispatchEvent(new Event('change'));

                        // Then set until age and trigger change to update next starting_age
                        const untilAgeInput = rebalItem.querySelector('.stg-until-age');
                        untilAgeInput.value = rebalData.until_age || '';
                        untilAgeInput.dispatchEvent(new Event('change'));
                        rebalItem.querySelector('.stg-every-few-years').value = rebalData.occur_yr || '1';

                        // Trigger validation on required fields
                        rebalItem.querySelectorAll('input[required]').forEach(input => {
                            input.dispatchEvent(new Event('change'));
                        });
                    } catch (err) {
                        console.error('Error setting up rebal detail:', err);
                        throw new Error('Failed to setup rebal detail properly');
                    }
                }

                // Helper function to setup strategic section
                async function setupStrategic(strategicData) {
                    if (!strategicData) {
                        console.warn('Missing strategic data');
                        return;
                    }

                    try {
                        // Set checkbox states first to trigger UI updates
                        const applyMinCheckbox = document.getElementById('stg-min_spend');
                        const applyBucketCheckbox = document.getElementById('stg-apply-bucket');
                        
                        applyMinCheckbox.checked = strategicData.apply_min;
                        applyMinCheckbox.dispatchEvent(new Event('change'));
                        applyBucketCheckbox.checked = strategicData.apply_bucket;
                        applyBucketCheckbox.dispatchEvent(new Event('change'));
                        
                        await new Promise(resolve => setTimeout(resolve, 200));

                        // Set fund selections and other fields
                        if (strategicData.apply_bucket) {
                            document.getElementById('stg-risky-fund-sel').value = strategicData.risk_fund || '';
                            document.getElementById('stg-safer-fund-sel').value = strategicData.safer_fund || '';
                            document.getElementById('fundSelect-stg-pause-opt').value = strategicData.rebal_pause_option || 'psr';
                        }
                        
                        if (strategicData.apply_min || strategicData.apply_bucket) {
                            document.getElementById('stg-min_rate').value = strategicData.expected_return_rate || '';
                        }

                        // Setup rebalancing details
                        if (strategicData.apply_bucket && strategicData.rebals && strategicData.rebals.length > 0) {
                            // Setup first rebal detail
                            const firstRebal = document.querySelector('.rebal-item');
                            if (firstRebal) {
                                await setupRebalDetail(firstRebal, strategicData.rebals[0]);

                                // Add remaining rebal details
                                const addRebalButton = document.querySelector('.add-rebal');
                                for (let i = 1; i < strategicData.rebals.length; i++) {
                                    if (addRebalButton) {
                                        try {
                                            addRebalButton.click();
                                            await new Promise(resolve => setTimeout(resolve, 200));
                                            const newRebal = document.querySelector('.rebal-item:last-child');
                                            if (!newRebal) {
                                                throw new Error('Failed to create new rebal detail');
                                            }
                                            await setupRebalDetail(newRebal, strategicData.rebals[i]);
                                        } catch (err) {
                                            console.error(`Error adding rebal detail ${i + 1}:`, err);
                                            populateMessage('Warning', 'is-warning', `Issue loading rebalancing detail ${i + 1}. Please verify data.`);
                                            await new Promise(resolve => setTimeout(resolve, 500));
                                        }
                                    }
                                }
                            }
                        }

                        // Trigger validation on required fields
                        document.querySelectorAll('#strategic-content input[required]').forEach(input => {
                            input.dispatchEvent(new Event('change'));
                        });
                    } catch (err) {
                        console.error('Error setting up strategic:', err);
                        throw new Error('Failed to setup strategic section properly');
                    }
                }

                // Process strategic section
                if (jsonData.strategic) {
                    populateMessage('Info', 'is-info', 'Loading strategy data...');
                    
                    // Load strategic tab first
                    await loadTabWithProgress('strategic', 'Loading strategy data...');
                    if (window.onStgTabLoad) {
                        await new Promise(resolve => {
                            window.onStgTabLoad();
                            setTimeout(resolve, 200);
                        });
                    }

                    // Setup strategic section
                    await setupStrategic(jsonData.strategic);
                }

                // Load and validate other tabs
                try {

                    // Final validation and cleanup
                    const validate = () => {
                        const requiredFields = document.querySelectorAll('#funds-content input[required]');
                        const invalidFields = Array.from(requiredFields).filter(field => !field.value);
                        
                        invalidFields.forEach(field => {
                            field.classList.add('is-danger');
                            field.addEventListener('input', function() {
                                this.classList.remove('is-danger');
                            }, { once: true });
                        });
                        
                        return invalidFields.length === 0;
                    };

                    const isValid = validate();
                    if (!isValid) {
                        populateMessage('Warning', 'is-warning', 'Some required fields are incomplete. Please verify and fix highlighted fields.');
                    } else {
                        populateMessage('Success', 'is-success', 'Plan data loaded successfully.');
                    }

                    // Finalize loading
                    await new Promise(resolve => setTimeout(resolve, 300));
                    $('#funds-content').show();
                    $('.steps-segment').removeClass('is-active');
                    $('#funds').addClass('is-active');
                } catch (err) {
                    console.error('Error loading tabs:', err);
                    populateMessage('Warning', 'is-warning', 'Some content may not have loaded properly. Please verify data.');
                }
                updateStepButtons();
                populateMessage('Success', 'is-success', 'Plan data loaded successfully');
                isLoadingContent = false;  // Clear loading state on success

            } catch (error) {
                isLoadingContent = false;  // Clear loading state on error
                console.error('Error processing plan data:', error);
                populateMessage('Error', 'is-danger', 'Failed to process plan data. Please try again.');
            }
        };
        reader.readAsText(file);
    });
    var content = {}; // Object to store the content for each tab
    let isLoadingContent = false; // Track loading state
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

        if (isLoadingContent) {
            populateMessage('Info', 'is-info', 'Please wait while content is loading...');
            return;
        }
        
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
            isLoadingContent = true;
            showLoadingIndicator(target);
            loadTabContent(target).then(() => {
                $('#' + target + '-content').show();
                updateStepButtons();
                triggerTabLoadEvents(target);
                isLoadingContent = false;
            }).catch(() => {
                $('#' + target + '-content').html('<div class="notification is-danger">Error loading content. Please try again.</div>');
                isLoadingContent = false;
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
      
      if (isLoadingContent) {
          populateMessage('Info', 'is-info', 'Please wait while content is loading...');
          return;
      }
      
      var activeStep = $('#steps-plan .steps-segment.is-active');
      var prevStep = activeStep.prev('.steps-segment');
      if (prevStep.length) {
        prevStep.find('a')[0].click(); 
      }
    });
  
    $('#next-btn').click(function(e) {
      e.preventDefault();
      
      if (isLoadingContent) {
          populateMessage('Info', 'is-info', 'Please wait while content is loading...');
          return;
      }
      
      var activeStep = $('#steps-plan .steps-segment.is-active');
      var nextStep = activeStep.next('.steps-segment');
      if (nextStep.length) {
        nextStep.find('a')[0].click(); 
      }
    });

/** CONTROL PREV and NEXT button end */
    
    // Get current plan data from all form fields
    function getCurrentPlanData() {
        const plan_data = new Plan_Data(
            window.convertToInt(document.getElementById('curr-age').value),
            window.convertToInt(document.getElementById('retire-age').value)
        );
        to_load_submit_data_funds(plan_data);
        return plan_data;
    }

    // --- New Save Plan Logic (using File System Access API) ---
    $('#save-btn').click(async function(e) {
        e.preventDefault();
        
        
        if (isLoadingContent) {
            populateMessage('Info', 'is-info', 'Please wait while content is loading...');
            return;
        }

        try {
            const plan_data = getCurrentPlanData();
            const prettyJSON = JSON.stringify(plan_data, null, 2);
            const fileName = 'retirement_plan.dynaretire.json';

            if (window.showSaveFilePicker) {
                // Modern browser - use File System Access API
                const saveFilePickerOptions = {
                    suggestedName: fileName,
                    startIn: 'documents',
                    types: [{
                        description: 'DynaRetire Plan Files',
                        accept: {
                            'application/json': ['.dynaretire.json'],
                        },
                    }],
                };

                try {
                    const handle = await window.showSaveFilePicker(saveFilePickerOptions);
                    const writable = await handle.createWritable();
                    await writable.write(prettyJSON);
                    await writable.close();
                    populateMessage('Success', 'is-success', `Plan saved successfully as ${handle.name}.`);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        throw err; // Re-throw if it's not a user cancellation
                    }
                }
            } else {
                // Fallback for Firefox and other browsers
                const blob = new Blob([prettyJSON], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.style.display = 'none';
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
                populateMessage('Success', 'is-success', `Plan saved as ${fileName}.`);
            }
        } catch (err) {
            console.error('Error saving file:', err);
            populateMessage('Error', 'is-danger', `Failed to save plan data: ${err.message}.`);
        }
    });
    // --- End New Save Plan Logic ---

    $('#submit-btn').click(function(e) {
            e.preventDefault(); // Prevent form submission
            
            if (isLoadingContent) {
                populateMessage('Info', 'is-info', 'Please wait while content is loading...');
                return;
            }

            var activeStep = $('.steps .steps-segment.is-active');
            var activeStepContent = $('.content-tab').eq(activeStep.index());
            
            if (!isTabValid(activeStepContent)) {
                return;
            }
            
            updateSuccessStepIcon(activeStep.attr('id'));
            removeErrorMessageIfAllTabsCorrect();
            let msgs = [];
            let msg = null;
            let currId = null;
            let tabname = null;
            for (let i = 0; i <= 3; i++) {
                if(i == activeStep.index())
                    continue;
                var content = $('.content-tab').eq(i);

                switch(i){                        
                    case 0:tabname='Nest Egg';currId='funds';break; 
                    case 1:tabname='Spend Well Allocation';currId='expenses';break; 
                    case 2:tabname='Pleasure Income';currId='income';break; 
                    case 3:tabname='Resilient Saving Playgound';currId='strategic';break; 
                }
                if(! isTabValid(content)){
                    msg='An error occurred in the '+tabname+' step. Please revisit the step for necessary corrections.';
                    msgs.push(msg);
                    populateMessage('Error', 'is-danger', msg);
                    updateErrorStepIcon(currId);
                    return;
                }else{
                    if(! isStepInfo(currId))
                        updateSuccessStepIcon(currId);
                }
            }

            elmSubmitBtn = document.getElementById('submit-btn');
            elmSubmitBtn.classList.add('is-loading');
            populateMessage('Info', 'is-info', 'Submitting data... Please wait');

            const plan_data = getCurrentPlanData();
            const prettyJSON = JSON.stringify(plan_data, null, 2);

            fetch('/planSubmit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ jsonData: prettyJSON })
            })
            .then(response => {
                const message = response.headers.get('Message');
            
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
                let fname = currentFundItem.querySelector('.fundname').value.trim()
                let fdesc = currentFundItem.querySelector('.funddesc').value.trim()
                let famount = currentFundItem.querySelector('.fundamount').value.trim()
                let fwithdrawage = currentFundItem.querySelector('.fundwithdrawage').value.trim()
        
                // Skip empty fund items
                if (!fname || !famount) {
                    return;
                }

                freturnType = currentFundItem.querySelector('.funds-return-type').value
                freturnRate = null
                if(freturnType === 'Flat') {
                    freturnRate = currentFundItem.querySelector('.funds-return-rate').value.trim()
                } else {
                    freturnRate = currentFundItem.querySelector('.funds-index-ref').value.trim()
                }

                freturnDefaultRate = currentFundItem.querySelector('.funds-default-return').value.trim()
                fmimicYear = currentFundItem.querySelector('.funds-mimic-year').value.trim()

                // Convert values only if they're not empty
                famount = window.convertToFloat(famount)
                fwithdrawage = window.convertToInt(fwithdrawage || '0')
                freturnDefaultRate = window.convertToFloat(freturnDefaultRate || '0')
                fmimicYear = window.convertToInt(fmimicYear || '0')

                plan_data.add_fund(new Fund(
                    fname,
                    fdesc,
                    famount,
                    freturnType,
                    freturnRate,
                    freturnDefaultRate,
                    fmimicYear,
                    fwithdrawage
                ));
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
