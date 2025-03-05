import account as ac
import expenses as mf
import invest as iv
import data as dt
#to execute accounts handling strategic
class Strategic:

    def  __init__(self,is_apply_min,is_apply_bucket,retire_calendar_year,expected_return_rate,
                  safer_fund:ac.LiquidityAccount, risk_fund:ac.LiquidityAccount,rebal_pause_option, 
                  fund_accounts:ac.LiquidityAccounts):
        self.rebal_allocs: dict[ac.LiquidityAccount, float]={}
        self.retire_calendar_year=int(retire_calendar_year)
        self.is_apply_min=is_apply_min
        self.is_apply_bucket=is_apply_bucket
        self.rebal_pause_option=rebal_pause_option
        self.expected_return_rate=expected_return_rate
        self.safer_fund=safer_fund
        self.risk_fund=risk_fund
        accounts:list[ac.LiquidityAccount] = fund_accounts.liquidity_accounts
        if safer_fund in accounts:
            accounts.remove(safer_fund)
            accounts.insert(0, safer_fund)
        if risk_fund in accounts:
            accounts.remove(risk_fund)
            accounts.insert(1, risk_fund)
        self.fund_accounts=fund_accounts

        #Diff:  Own->withdraw from Risk always, swich to safe
        #       Bucket->always from safe, 
        #self.bad_market_withdraw_sequence:list[ac.LiquidityAccount]=[] 
    

    #def set_retire_calendar_year(self, retire_calendar_year):
    #    self.retire_calendar_year=retire_calendar_year

    #sample: range(3,10,2),{s:0.6,b:0.4,c:0}) #rebalance every 2 years, from year 3 to year 10    
    #def setRebalanceApproach(self,years:range,allocation: dict[ac.LiquidityAccount, float]):
    #    self.rebal_allocs[years]=allocation

    def setRebalanceApproach(self,years:range,risk_fund_ratio:float, safer_fund_ratio:float):               
        self.rebal_allocs[years]={            
                self.safer_fund:safer_fund_ratio,
                self.risk_fund:risk_fund_ratio
        }
    #rebalance happen after calculate the eoy-withdraw+income
    #apply rebal_pause_option
    def _rebalance(self, year, calendary_year):
        for ra in self.rebal_allocs: #to get range (as key)   
            #print(f"REBAL ra={ra}", end=" ")         
            if year in ra:
                #print(f"Started", end=" ")      
                #only calculate the total from the accounts that involved in the allocation
                total=0
                for acc in self.rebal_allocs[ra]: #get the account (as key) from allocation                    
                    total+=acc.eoy_net_balance #based on net balance after income and expenses                   
                #print(f"Total = {total}", end=" ")

                #to decide if to rebalance. none=always R, psr: x R-> S, pbr: x <-->
                re=True                                               
                if self._is_market_bad(calendary_year,self.fund_accounts,False):
                    if(self.rebal_pause_option=='none'):#continue
                        re= True
                    elif(self.rebal_pause_option=='pbr'):#stop both direction
                        re= False
                        acc.rebal_pause_option=self.rebal_pause_option
                    elif(self.rebal_pause_option=='psr'):      
                        for acc in self.rebal_allocs[ra]:
                            new_amount=total*self.rebal_allocs[ra][acc]
                            if (acc == self.risk_fund):              
                                if (new_amount < self.risk_fund.amount):
                                    acc.rebal_pause_option=self.rebal_pause_option
                                    re=False     
                if(re):
                    for acc in self.rebal_allocs[ra]: 
                        if not acc.is_eligible_withdraw(year):             
                            return False 
                    for acc in self.rebal_allocs[ra]: #get the account (as key) from allocation
                        #TODO: what if the account have less than the rebalance from amount?
                        new_amount=total*self.rebal_allocs[ra][acc]
                        acc.rebalance_to(new_amount)             
                    return True    
        return False
    
    #TODO: if this happen the beginning of the year, based on last year, if end of the year base on this year
    def _is_market_bad(self, current_calendar_year,liq_accts:ac.LiquidityAccount, isBOY:bool):
        if current_calendar_year < self.retire_calendar_year:
            return False        
        acc=self.risk_fund
        returns = acc.invest_return_provider.get_data()
        if (isBOY and current_calendar_year <= self.retire_calendar_year): #first year BOY should depends on last year for performance
            return False
        until_year = current_calendar_year-1 if isBOY else current_calendar_year
        annual_return = iv.cal_annual_return_year(returns,self.retire_calendar_year,until_year)
        if annual_return < self.expected_return_rate:            
            return True
        return False
    
    #to set expenses to min should market is bad
    def execute_expenses(self,year_start,year_num,liq_accts:ac.LiquidityAccount, expenses:mf.Expense, isBOY:bool):
        #print(f"self.is_apply_min {self.is_apply_min}->Strategic.py")
        if self.is_apply_min == False:
            return
        if self._is_market_bad(year_start+year_num,liq_accts,isBOY) == True:
            #print(f"{year_num}: MARKET CRASH............SWITCH TO MIN ->Strategic.py")
            expenses.switch_to_min()

    def execute_withdraw(self,year_start,year_num,amount,liq_accts:ac.LiquidityAccounts):
        return liq_accts.withdraw(year_num,amount)  


#    def execute_bad_market_withdraw_sequence(self,year_start,year_num,amount,liq_accts:ac.LiquidityAccounts):
#        if self._is_market_bad(year_start+year_num-1,liq_accts) == True:
#            if len(self.bad_market_withdraw_sequence)>0:
#                liq_accts.withdraw_follow_sequence(year_num,amount,self.bad_market_withdraw_sequence)  
#                return 
#        liq_accts.withdraw(year_num,amount)      

    #if market is bad, it will make withdraw from selective fund, and stop rebalancing.
    def execute_rebalance(self,year_start,year_num,liq_accts:ac.LiquidityAccount, expenses:mf.Expense):
        if self.is_apply_bucket == False:
            return
#        if self._is_market_bad(year_start+year_num-1,liq_accts) == True:
#            if len(self.bad_market_withdraw_sequence)>0:
#                return
        self._rebalance(year_num, year_start+year_num)
    
#    def set_bad_market_withdraw_sequence(self,bad_market_withdraw_sequence:list[ac.LiquidityAccount] ):
#        self.bad_market_withdraw_sequence=bad_market_withdraw_sequence

    def display(self):        
#        is_withdraw_sequence=False
#       if len(self.bad_market_withdraw_sequence)>0:
#            is_withdraw_sequence=True
        print(f" REBAL:Bucket {self.is_apply_bucket} BadMarketReturn={self.expected_return_rate} Min={self.is_apply_min} ")      
        if self.is_apply_bucket:
            print(f"\nRebalance: ", end=" ")  
#            for ra in self.rebal_allocs: #to get range (as key)  
#                print(f"\n    years={ra}: ", end=" ")  
#                for acc in self.rebal_allocs[ra]: #get the account (as key) from allocation
#                    print(f"    {acc.name}={self.rebal_allocs[ra][acc]}", end=" ")   
#        if is_withdraw_sequence is True:
#            print(f"\nBad Market WIthdraw Sequence: ", end=" ")  
#            for fund in self.bad_market_withdraw_sequence:
#                print(f"    {fund.name},", end=" ")  

        for ra in self.rebal_allocs: #to get range (as key)   
            print(f"\n      REBAL ra={ra}", end=" ")     
            for acc in self.rebal_allocs[ra]: 
                if(acc==None):
                    print(f'-----------acc is None--')
                else:
                    print(f"  {acc.name}  {self.rebal_allocs[ra][acc]},", end=" ")  