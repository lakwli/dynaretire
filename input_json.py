import expenses as mf
import account as ac
import pojo as pj
import data as dt
import strategic as st
import datetime
from classes.web.json import json_data as j

class InputJson:

    def __init__(self, plan_data:j.Plan_Data) -> None:
        self.expenses=None
        self.incomes=None
        self.funds=None
        self.strategic=None

        self.plan_data=plan_data

        self.isPaymentAtBegin=True
        self.current_age= self.plan_data.current_age
        self.current_calendar_year=datetime.datetime.now().year
        self.retire_calendar_year=  self.current_calendar_year+ (self.plan_data.retire_age-self.current_age) +1
        
        #print(f"{self.retire_calendar_year}")
    
    def process(self):
        self.process_funds()
        self.process_expenses()
        self.process_incomes()
        self.process_strategics()

        #either based on index found matched year, or based on strategic retire calendar year should user chose which risk fund
        if(self.strategic != None and self.strategic.retire_calendar_year !=0):
            self.retire_calendar_year= self.strategic.retire_calendar_year        
            self.current_calendar_year=self.strategic.retire_calendar_year-(self.plan_data.retire_age-self.current_age)-1
        else:
            yr = self.get_risky_fund_mimic_year(None)
            if(yr != None): #risky fund found
                self.retire_calendar_year=yr
                #self.retire_calendar_year= self.strategic.retire_calendar_year        
                self.current_calendar_year=self.retire_calendar_year-(self.plan_data.retire_age-self.current_age)-1


    def process_strategics(self):   
        json_strategic = self.plan_data.strategic
        
        if (json_strategic.apply_min == False and json_strategic.apply_bucket == False):
            return False
        retire_calendar_year= self.get_risky_fund_mimic_year(json_strategic.risk_fund)
        if (retire_calendar_year==None):
            retire_calendar_year=self.retire_calendar_year
        self.strategic = st.Strategic(json_strategic.apply_min,
                                      json_strategic.apply_bucket,
                                      #json_strategic.retire_calendar_year,
                                      retire_calendar_year,
                                      #json_strategic.default_return_rate,
                                      json_strategic.expected_return_rate,
                                      self.funds.find_stock(json_strategic.safer_fund),
                                self.funds.find_stock(json_strategic.risk_fund),
                                json_strategic.rebal_pause_option,self.funds)
#        self.strategic.bad_market_return=float(json_strategic.min_rate)
#        self.strategic.is_apply_min=json_strategic.apply_min
#        self.strategic.set_retire_calendar_year(int(json_strategic.retire_calendar_year))
#        self.strategic.set_bad_market_withdraw_sequence([
#            self.funds.find_stock(json_strategic.wit_to_fund_first),
#            self.funds.find_stock(json_strategic.wit_to_fund_second)
#        ])

       
        for rebal in json_strategic.details:
            #allocation: dict[ac.LiquidityAccount, float]={}
            #allocation.update({self.funds.find_stock(rebal.fund_first):float(rebal.fund_first_ratio)})      
            #allocation.update({self.funds.find_stock(rebal.fund_second):float(rebal.fund_second_ratio)})    
            r = range(self.convertToYearNumFromAge(int(rebal.start_age-1)),self.convertToYearNumFromAge(int(rebal.until_age)),int(rebal.occur_yr))    
            self.strategic.setRebalanceApproach(r,rebal.risk_fund_ratio/100, rebal.safer_fund_ratio/100)

    def get_risky_fund_mimic_year(self, risk_fund_name):     
        json_funds = self.plan_data.funds
        for f in json_funds:  
            if (f.name == risk_fund_name):
               return f.mimic_calendar_year #user have chose which index fund as risk fund
            elif(f.return_type == 'Index'):
               return f.mimic_calendar_year #first withdraw index fund, user didn't apply bucket
        
    def process_funds(self):      
        json_funds = self.plan_data.funds
        accs=[] 
        for f in json_funds:
            return_type = f.return_type
            wt_yr=self.convertToYearNumFromAge(f.wt_age)-1
            if (return_type == 'Index'):
                accs.append(ac.LiquidityAccount(f.name,float(f.amount),int(wt_yr),self.isPaymentAtBegin, dt.StockReturn(float(f.default_rate))))
            else:
                accs.append(ac.LiquidityAccount(f.name,float(f.amount),int(wt_yr),self.isPaymentAtBegin, dt.BasicReturn(float(f.return_rate))))
        
        self.funds = ac.LiquidityAccounts(accs)    

    def process_incomes(self):   
        json_incomes = self.plan_data.incomes
        
        if (len(json_incomes)==0):
            return
        incomes=[]
        for i in json_incomes:  
            yearly_growth_set:dict[range:float]={}
            for g in i.details:
                r = range(self.convertToYearNumFromAge(int(g.start_age-1)),int(self.convertToYearNumFromAge(g.until_age)),1) #the interval is used for 3 years growth 5% for rental, but too complicated, confuse with expenses interval (occurance)
                yearly_growth_set.update({r:float(g.growth_rate)})
            #from multiple become only 1, combine yearly_income_growths with income
            yearly_income_growths:list[pj.GrowthAmount]=[ pj.GrowthAmount(i.name,float(i.amount),yearly_growth_set)] 
            income=ac.NonLiquidityAccount(i.name,yearly_income_growths) 
            income.set_deposit_account(self.funds.find_stock(i.dep_to_fund))
            
            incomes.append(income)
        self.incomes = ac.NonLiquidityAccounts(incomes)    

    def process_expenses(self):
        json_expenses = self.plan_data.expenses
        expenses_list=[]

        for e in json_expenses:
            expense=mf.Expense(e.name,float(e.inflation),float(e.min_rate)/100,None) 
            expenses_list.append(expense)
            for a in e.amounts:
                expense.add_amount_range(range(self.convertToYearNumFromAge(int(a.start_age)),self.convertToYearNumFromAge(int(a.until_age+1)),int(a.occur_yr)),float(a.amount))
        self.expenses = mf.Expenses(expenses_list)


    def display(self):

        
        print(f"age={self.current_age}")
        print(f"Current calendar year={self.current_calendar_year}")
        print(f"Retire Calendar Year={self.retire_calendar_year}") 
    
       
        print("==========================EXPENSES=====================================") 
        if self.expenses != None:
            self.expenses.display(1)
        print("==========================INCOMES=====================================")   
        if self.incomes != None:
            self.incomes.display_current()
        print("==========================FUNDS=====================================")  
        if self.funds != None:
            self.funds.display_current()    
        print("==========================Strategics=====================================") 
        if self.strategic != None:
            self.strategic.display()

    def convertToYearNumFromAge(self, age):
        return int(age)-self.current_age+1
    
    def convertToCalendarYearFromAge(self, age):
        return self.current_calendar_year+(age-self.current_age)+1