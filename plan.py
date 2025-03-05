import account as la
import output as op
import strategic as st
import expenses as mf

class Plan():

    #def plan (age, start_year, years, initial_fund,expenses,incomes,sp500_allocation,bond_allocation,sp500_returns, bond_return, rebalance_year):
    def  __init__(self, isPaymentAtBegin, current_age, current_calendar_year, expenses:mf.Expense,liq_accts:la.LiquidityAccounts,nonliq_accts:la.NonLiquidityAccounts,out:op.Output):
        self.current_age=current_age
        self.current_calendar_year = current_calendar_year
        self.isPaymentAtBegin=isPaymentAtBegin
        self.expenses = expenses
        self.liq_accts = liq_accts
        self.nonliq_accts = nonliq_accts
        self.out=out
        self.strategic=None
        self.out.write_titles()

    def set_strategic(self, strategic:st.Strategic):
        self.strategic=strategic
        #print(f"SET STRA {self.strategic}")     
       
    def execute_plan(self):        
        #year 0        
        self.process_deposit_for_incomes(0)
        if not  self.isPaymentAtBegin:
            to_withdraw = self.expenses.get_yearly_total_amount(1)#to get next year
            self.liq_accts.withdraw(0, to_withdraw)
        self.out.record_yearly_result(self.expenses,self.liq_accts, self.nonliq_accts,0,self.current_calendar_year,self.current_age)
        fund_lack=0
        #year 1 onwards
        for year_num in range(1,100-self.current_age+1):        
            calendar_year = self.current_calendar_year+year_num
                
            self.liq_accts.reset_new_year(year_num)
            
            #expenses
            if self.isPaymentAtBegin:
                fund_lack=self.process_withdraw_for_expenses(year_num, self.isPaymentAtBegin)  
                if(fund_lack>0):
                    return year_num,0

             #eoy bal, with profit and loss return 
            self.liq_accts.compute_eoy_amount(calendar_year)      

            #income   
            self.process_deposit_for_incomes(year_num)
            
            #expenses
            if not  self.isPaymentAtBegin:
                fund_lack=self.process_withdraw_for_expenses(year_num,self.isPaymentAtBegin)  
                if(fund_lack>0):
                    return year_num,0
            
            #strategic. including rebalance, switch to min expenses
            if self.strategic != None:
                self.strategic.execute_rebalance(self.current_calendar_year,year_num, self.liq_accts,self.expenses)
            
            net_bal=self.liq_accts.cal_total_eoy_net_balance()

            self.out.record_yearly_result(self.expenses,self.liq_accts,self.nonliq_accts,year_num,self.current_calendar_year,self.current_age)
           
            if(fund_lack>0):
                return year_num, -fund_lack
            if(net_bal<=0):
                return year_num, net_bal

        return year_num,0


    def process_withdraw_for_expenses(self, year_num,isPaymentAtBegin):
        self.expenses.reset_new_year(year_num)
        self.expenses.compute_eoy_amount(year_num)
        if self.strategic != None:
            self.strategic.execute_expenses(self.current_calendar_year,year_num, self.liq_accts,self.expenses,isPaymentAtBegin)     
        total_expenses = self.expenses.get_yearly_total_amount(year_num+1) #this year to withdraw next year expenses  

        #withdraw fund
        fund_lack=0
        if self.strategic != None:
            fund_lack=self.strategic.execute_withdraw(self.current_calendar_year,year_num, total_expenses, self.liq_accts)
        else:
            fund_lack=self.liq_accts.withdraw(year_num, total_expenses)     
        return fund_lack          
    
    def process_deposit_for_incomes(self, year_num):        
        total_incomes=0
        if self.nonliq_accts != None:       
            self.nonliq_accts.reset_new_year(year_num)
            self.nonliq_accts.compute_eoy_amount(year_num)
            total_incomes=self.nonliq_accts.cal_total_income()
            total_incomes-=self.nonliq_accts.process_transfer_to_deposit_account(year_num) #transfer to selected account, if specified  
        if(total_incomes==0):          
            return
        self.liq_accts.deposit(year_num-1, total_incomes) #non-specified to distribute to liquide accounts   
            