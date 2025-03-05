import pojo

class MoneyFlow:
    
    #amounts:range(1,50) every year until 50th. range(3,30,10)  #from 3 to 30, increment by 10. output: 3,13,23
    #{range(3,30,10):7000} from 3 to 30, increment by 10. (use for car, change car every 10 year, cheaper later, or stop)
    #{range(1,10):5000, range(11,30):6000} the 1st 10 years expenes is 5k, then rest 6k (used for medical, food when old)
    def __init__(self, name, grow_rate,amounts:dict[range, float]): #constructor
        self.name = name 
        self.grow_rate = grow_rate
        self.amounts:dict[range, float]={}
        if amounts != None:
            self.amounts=amounts
        self.amount=0 #running amount year by year
    

    def add_amount_range(self,r:range,amount:float):
        self.amounts[r]=amount


    def reset_new_year (self):
        pass
        
    def get_name(self):
        return self.name    

    def compute_eoy_amount(self,year):
        for r in self.amounts:
            self.amounts[r] *= (1 + self.grow_rate/100)
            a=self.amounts[r]
            #print(f"{year}->become {a:.2f} exp")

    #subject to occurance
    def get_yearly_amount(self, which_year):   
        #print(f"        {self.name} get yearly amount")
        for r in self.amounts:        
            if (which_year in r):    
                #print(f"        {self.name}-----------------------{r}->{self.amounts[r]}")
                return self.amounts[r]
        return 0

class Expense (MoneyFlow):   

    #reduction_rate will apply to expenses should market turn bad, try to sustain the crashed and reduce the impact
    def __init__(self, name, inflation_rate,reduction_rate:float,amounts:dict[range, float]): #constructor        
        super().__init__(name,inflation_rate, amounts)
        self.reduction_rate=reduction_rate
        self.is_min_applied=False

    def reset_new_year (self,year):
        self.is_min_applied=False

    def switch_to_min(self):
        if self.reduction_rate>0:
            self.is_min_applied=True

    def get_orig_yearly_amount(self, which_year):
        return super().get_yearly_amount(which_year)
    
    def get_yearly_amount(self, which_year):  
        to_return_amt=super().get_yearly_amount(which_year)
        if self.is_min_applied == True:
            to_return_amt*=self.reduction_rate
        return to_return_amt

    def display(self):
        print(f"name={self.name}, inflation={self.grow_rate}, disc={self.reduction_rate}")
        for r in self.amounts:
            print(f"        range={r}, amount={self.amounts[r]}")


class Expenses:
    
    def __init__(self, expenses:list[Expense]):
        self.expenses=expenses
    
    def display(self,years):
        for expense in self.expenses:    
            expense.display()        
            #print(f"                {years}:{expense.name}={expense.get_yearly_amount(years)}   >moneyflow.py")


    def get_yearly_total_amount(self,years):
        #print(f"        {years} get_yearly_total_amount") 
        annual_withdrawal=0
        #self.display(years)
        for expense in self.expenses:  
            annual_withdrawal += expense.get_yearly_amount(years)   
            #print(f"                {annual_withdrawal}+{expense.get_yearly_amount(years)} fr exp1")    
        
        #print(f"                TOTAL{annual_withdrawal}  fr exp2")            
        return annual_withdrawal
    
    def reset_new_year(self,years):
        for expense in self.expenses:
            expense.reset_new_year(years)  
    
    def compute_eoy_amount(self,years):
        for expense in self.expenses:
            expense.compute_eoy_amount(years) 

    def switch_to_min(self):
        for expense in self.expenses:
            expense.switch_to_min() 

def test():
    exp = Expense("Car",3.5,{ 
        range(3,24,10):90000,
        range(33,45,10):50000
    })

    for yr in range (50):
        exp.compute_eoy_amount(yr)
        exp_amount = exp.get_yearly_amount(yr)
        print(f"{yr}={exp_amount}")

def test2():
    age=40
    exp = Expenses([
    Expense("General", 3, 0,{range(1,50):49800}),
    Expense("Food",7,0.8,{
            range(1,55-age):16200,
            range(55-age,70-age):30.0*30.0*12,
            range(70-age,100-age):20.0*30.0*12
        }), 
    Expense("Medical",10,0,{
            range(1,55-age):7000,
            range(55-age,70-age):10000
        }), 
    Expense("Travel",3,0,{
            range(1,6):20000,
            range(7,60-age):6000,
            range(60-age,75-age):500
        }), 
    Expense("Car",3.5,0,{ 
            range(3,24,10):90000,
            range(33,45,10):50000
        }),
    Expense("Renovation", 3,0, {range(2,3):100000}),
    ])
    
    for yr in range (1,5):
        exp_amount = exp.get_yearly_total_amount(yr)
        print(f"{yr}={exp_amount}")
        exp.compute_eoy_amount(yr)

#test()
#test2()