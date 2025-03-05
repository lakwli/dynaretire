import pojo
import data
import pojo as pj

#NOTES: had taken out priority. The array is already according to priority. Can handle from the input side to arrange.
#one account could have multiple type of income. e.g. House: rental, selling
class Account:
    def _init_(self,name:str):
        self.name=name
        self.yearly_income_growths:pj.GrowthAmount=[]
        self.underlying_incomes_name=[] #extract from yearly_income_growths
        self.income=0
   
    def reset_new_year(self):
        self.income=0

    #can be used for contribution to EPF, or total dividend. or rental Exclude add-on due to rebalancing. 
    #amount is based on the starting year of the year range (not today amount)
    def set_yearly_income_growths(self, yearly_income_growths:list[pj.GrowthAmount]): 
        self.yearly_income_growths=yearly_income_growths
        self.set_underlying_names()

    def set_underlying_names(self):
        for growth in self.yearly_income_growths:
            self.underlying_incomes_name.append(growth.name)
        
    
    def compute_eoy_amount(self,calendar_year): 
        #print(f"{self.name}, yr={calendar_year}----------------------------income={self.income}->----------", end="")               
        for inc in self.yearly_income_growths:
                self.income+=inc.growth(calendar_year)      
        #print(f"{self.income}")                

class LiquidityAccount(Account):      

    def __init__(self, name:str, amount:float,withdraw_eligible_year:int,isPaymentAtBegin:bool,invest_return_provider:data.InvestReturnDataProvider):
        super()._init_(name)
        self.withdraw_eligible_year=withdraw_eligible_year
        self.amount=amount
        self.invest_return_provider=invest_return_provider
        self.isPaymentAtBegin=isPaymentAtBegin
        self.rebal_pause_option=None
        self.reset_new_year(0)

    def reset_new_year(self,year_num):
        super().reset_new_year()
        self.boy_balance=self.amount #starting balance
        self.boy_afpay_balance=self.amount #after dedecut begining payment balance
        #if(year_num<=2):
            #print(f"{year_num} {self.name}-boy={self.boy_balance}============================================reset_new_year==================boyAfPay={self.boy_afpay_balance:.2f}")
        self.growth_rate=0
        self.pl=0
        self.eoy_balance=self.boy_balance
        self.withdrawed=0
        self.rebal_amount=0
        self.eoy_net_inout =0#=income-withdraw+rebalance for current year
        self.eoy_net_balance=self.boy_balance 
        self.rebal_pause_option=None
        

    def get_withdrawable_amount (self, year):        
        #print(f"{self.name}++++++++++++{self.amount}+++++++++++++{(year>=self.withdraw_eligible_year)}...............{year}-{self.withdraw_eligible_year}")
        if(self.is_eligible_withdraw(year)):
            return self.amount
        return 0
    
    def get_boy_afpay_balance(self, year):
        #print(f"===============================get==============================={self.name}-{self.boy_afpay_balance:.2f}")
        return self.boy_afpay_balance
    
    def is_eligible_withdraw(self,year):
        if(year>=self.withdraw_eligible_year):
            return True
        return False

    #to withdraw pay for expenses. Exclude deduct due to rebalancing
    def withdraw (self, year, amount):     
        #print(f"======================with========================================{self.name}-{self.boy_afpay_balance:.2f}")
        temp = self.boy_afpay_balance
        if(amount==0):
            return 0
        amt = self.get_withdrawable_amount(year)   
        if(amt==0):
            #print(f"==================with2=====amt 0======================================={self.name}-{self.boy_afpay_balance:.2f}")
            return 0
        elif(amt<amount):
            self.withdrawed=amt
            self.amount=0
            self.boy_afpay_balance=0            
            #print(f"==================with2=====become 0======================================={self.name}-{self.boy_afpay_balance:.2f}")
            return self.withdrawed
        self.withdrawed=amount
        self.amount-=self.withdrawed
        if(self.isPaymentAtBegin):
            #print(f"==================set======================================{self.name}-{self.boy_afpay_balance:.2f}")
            self.boy_afpay_balance-=self.withdrawed
        else:
            self.eoy_net_balance-=self.withdrawed  
        #print(f"        {self.name} withdrawn: {self.withdrawed:.2f} before: {temp:.2f} afpaybal: {self.boy_afpay_balance:.2f} ")   
        return amount
    
    def deposit(self, year, amount):
        #if(year==1):
            #print(f"{self.eoy_net_balance}", end=" ")
        self.income+=amount
        #if(year==1):
            #print(f"orignal amount={amount} income {self.income}", end=" ")
        self.amount+=amount
        #if(year==1):
            #print(f"amount { self.amount}", end=" ")
        self.eoy_net_balance+=amount 
        #if(year==1):
            #print(f"{self.name}=>{amount}->{self.eoy_net_balance}")

    
    def net_income_expense_eoy(self):#for display end of the year that income-expenses to get the next. only if expenses happen eoy
        if(self.isPaymentAtBegin):
            return self.income        
        return self.income-self.withdrawed      
    
    #eoy balance + income - expenses +/- rebalance
    def net_move_in_out_amount_eoy(self): #for eoy
        if(self.isPaymentAtBegin):
            return self.income-self.rebal_amount
        return self.income-self.withdrawed+self.rebal_amount

    #eof year. to compound the amount.
    def compute_eoy_amount(self,calendar_year): #with the income, rebalance, withdraw (beg/end), p/l to get the final eoy
        sc_return = self.invest_return_provider.get_return(calendar_year)  
        self.growth_rate=sc_return
        self.pl= self.amount*(sc_return/100)
        self.amount+=self.pl
        self.eoy_balance=self.amount
        self.eoy_net_balance=self.amount
        
        #if(calendar_year<=1997):
            #print(f"******{calendar_year} {self.name}: boy={self.boy_balance} ============================================compute_eoy_amount==================-boyAfPay={self.boy_afpay_balance:.2f}")

    def rebalance_to(self,new_amount):
        self.rebal_amount=new_amount-self.amount
        self.amount=new_amount
        self.eoy_net_balance=self.amount

class LiquidityAccounts():
    def __init__(self,  liquidity_accounts:list[LiquidityAccount]): #withdraw based on array seq, as how it pass in
        self.rebal_allocs:dict[range, dict] = {}
        self.starting_year=0
        self.liquidity_accounts=liquidity_accounts
 
    def reset_new_year(self,year_num):
        for account in self.liquidity_accounts:
            account.reset_new_year(year_num)

    def withdraw_follow_sequence(self,year,amount, specified_liquidity_accounts):
        left_amount = amount
        for acc in specified_liquidity_accounts:    
            left_amount-=acc.withdraw(year,left_amount)
            if(left_amount<=0):
                return left_amount #may not enough
        return left_amount
    
    def withdraw(self,year_num,amount):        
        left_amount = amount
        for acc in self.liquidity_accounts:    
            #if(year_num<=2):
                #print(f"{year_num} {acc.name}-boy={acc.boy_balance}============================================withdraw")
            left_amount-=acc.withdraw(year_num,left_amount)            
            if(left_amount<=0):
                return left_amount #may not enough
        return left_amount
    
    def deposit(self, year, amount):
        self.liquidity_accounts[0].deposit(year,amount)

    def compute_eoy_amount(self,calendar_year):
        for acc in self.liquidity_accounts:
            acc.compute_eoy_amount(calendar_year)


    def cal_total_withdrawed(self):
        total = 0
        for account in self.liquidity_accounts:
            total+=account.withdrawed
        return total
    
    def cal_total_withdrawable_amount(self,year):
        total = 0
        for account in self.liquidity_accounts:
            total+=account.get_withdrawable_amount(year)
        return total
    
    def cal_total_boy_balance(self):
        total = 0
        for account in self.liquidity_accounts:
            total+=account.boy_balance
        return total
    
    def get_boy_afpay_balance(self, year_num):
        total = 0
        for account in self.liquidity_accounts:
            total+=account.get_boy_afpay_balance(year_num)
        return total

    def cal_total_pl(self):
        total = 0
        for account in self.liquidity_accounts:
            total+=account.pl
        return total
    
    def cal_total_eoy_balance(self):
        total = 0
        for account in self.liquidity_accounts:
            total+=account.eoy_balance
        return total
    
    def cal_net_income_expense(self):
        total = 0
        for account in self.liquidity_accounts:
            total+=account.net_income_expense_eoy()
        return total
    
    def cal_total_eoy_net_balance(self):
        total = 0
        for account in self.liquidity_accounts:
            total+=account.eoy_net_balance
        return total
    
    def find_stock(self,name):
        for acc in self.liquidity_accounts:
            if acc.name==name:
                return acc
        return None

    
    def display_current(self):        
        for acc in self.liquidity_accounts:
            print(f"{acc.name}={acc.amount:,.2f}...............{acc.withdraw_eligible_year}  provider: {acc.invest_return_provider}")
            print(f"                BOY={acc.boy_balance:,.2f}, G={acc.growth_rate:,.2f} PL={acc.pl} EOY={acc.eoy_balance:,.2f} ")
            print(f"                WIT={acc.withdrawed:,.2f} REBAL={acc.rebal_amount:,.2f} EOY NET={acc.eoy_net_balance:,.2f}")
    


class NonLiquidityAccount(Account):  #house,trust
    def __init__(self, name:str,yearly_income_growths:list[pj.GrowthAmount]):
        super()._init_(name)
        super().set_yearly_income_growths(yearly_income_growths)
        self.deposit_account_name=None
        self.deposit_account=None #can only deposit to particular account
    
    def set_deposit_account_name(self,deposit_account_name):
        self.deposit_account_name=deposit_account_name #specific to text reading. it is due to fund is read later on. So to put name first. later on find the account with the name and put as object

    def set_deposit_account(self,deposit_account:LiquidityAccount):
        self.deposit_account=deposit_account #can only deposit to particular account


class NonLiquidityAccounts():
    def __init__(self,  accounts:list[NonLiquidityAccount]):      
        self.starting_year=0
        self.accounts=accounts
 
    def reset_new_year(self,year):
        for account in self.accounts:
            account.reset_new_year()
    
    def compute_eoy_amount(self,calendar_year):   
        for account in self.accounts:
            account.compute_eoy_amount(calendar_year)  

    def cal_total_income(self):
        total = 0
        for account in self.accounts:
            total+=account.income
        return total
    
    def process_transfer_to_deposit_account(self,year_num):
        total_transferred = 0
        for acc in self.accounts:
            dep_acc:LiquidityAccount = acc.deposit_account
            if dep_acc != None:           
                temp = dep_acc.amount     
                dep_acc.deposit(year_num,acc.income)
                #if(year_num<=2):
                    #print(f'{year_num} - {dep_acc.name} {temp}+{acc.income}={dep_acc.amount} ==================================transfer=====================boy={dep_acc.boy_balance}')
                total_transferred+=acc.income
        return total_transferred


    def display_current(self):        
        for acc in self.accounts:
            print(f"{acc.name}={acc.income:,.2f}")     
            for gr in acc.yearly_income_growths:
                print(f"        name={gr.name}, amount={gr.amount:,.2f}")  
                for r in gr.yearly_growth_set:
                    print(f"                range={r}, growth={gr.yearly_growth_set[r]:,.2f}")  


def test():
    s = LiquidityAccount("Stock",3000.0,1,data.StockReturn())
    b = LiquidityAccount("Bond",1000.0,1,data.FlatReturn(3.5))
    c = LiquidityAccount("SPECIAL",500.0,2,data.FlatReturn(5.5))

    l = LiquidityAccounts([s,b,c])
    l.setRebalanceApproach(range(3,10,3),{s:0.7,b:0.3,c:0}) #rebalance every 3 years, from year 3 to year 10
    l.setRebalanceApproach(range(10,21,3),{s:0.6,b:0.4,c:0}) #rebalance every 2 years, from year 11 to year 20
    l.starting_year=1981

    amt=300
    for y in range(1,4):
        l.reset_new_year(y)
        #print(f"{y}-----------BF-----------------------")
        #l.display_current()
        l.compute_eoy_amount(y)
        #print(f"{y}-----------AF COMP-----------------------")
        #l.display_current()
        amount=l.withdraw(y,amt)
        if(amount>0):
            print(f"{y}:UNABLE to Withdraw all. Lack of :{amount}")
        print(f"{y}-----------AF WITHDRA-----------------------{amt}")
        l.display_current()
        l.rebalance(y)
        print(f"{y}-----------AF REBAL-----------------------")
        l.display_current()
        amt=0

def testIncomes():
    h = NonLiquidityAccount("Side Incomes",[
                #pj.GrowthAmount("Services", 3000,{ range(1,16):5.0,range(16,20):3.0, range(20,23):0.0}),
                pj.GrowthAmount("5-Yr-Bonus", 5000,{ range(1,16):1})
            ])
    h2 = NonLiquidityAccount("Commercial",[ #rental increase 5% every 3 years
                pj.GrowthAmount("Rental Income", 12000,{ range(1,80,3):5}),
            ])
    
    nl=NonLiquidityAccounts([h])

    for y in range(1,20):
        nl.reset_new_year(y)
        nl.compute_eoy_amount(y)
        #nl.display_current()
        print(f"{y}-------------------------------------{nl.cal_total_income():,.2f}")
    
    
#test()
#testIncomes()