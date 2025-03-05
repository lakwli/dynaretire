import json


class Fund:
    def __init__(self,name,desc, amount,return_type,return_rate,default_rate, mimic_calendar_year, wt_age):
        self.name=name
        self.amount=amount
        self.desc=desc
        self.return_type = return_type #Flat, Index
        self.return_rate=return_rate
        self.default_rate = default_rate
        self.mimic_calendar_year = mimic_calendar_year
        self.wt_age=wt_age
    
    def to_dict(self):
        return {'name': self.name,'desc': self.desc, 'amount': self.amount, 'return_type': self.return_type, 
                'return_rate': self.return_rate,'default_rate': self.default_rate,'mimic_calendar_year': self.mimic_calendar_year, 
                'wt_age': self.wt_yr}    
    
    @classmethod
    def from_dict(cls, fund_dict):
        return cls(fund_dict['name'], fund_dict['desc'], fund_dict['amount'], fund_dict['return_type'], fund_dict['return_rate'],
                    fund_dict['default_rate'] , fund_dict['mimic_calendar_year'], fund_dict['wt_age'])
        
class Expense:
    
    def __init__(self,name,min_rate,inflation):
        self.name=name
        self.min_rate=min_rate
        self.inflation=inflation
        self.amounts=[]
    
    def add_amounts(self, detail):
        self.amounts.append(detail)

    def to_dict(self):
        return {'name': self.name, 'min_rate': self.min_rate, 'inflation': self.inflation, 
                           'amounts': [detail.to_dict() for detail in self.amounts]}

    @classmethod
    def from_dict(cls, expense_dict):
        expense = cls(expense_dict['name'], expense_dict['min_rate'],expense_dict['inflation'])
        for amounts_dict in expense_dict['amounts']:
            expense.add_amounts(Expense_detail.from_dict(amounts_dict))
        return expense
    
class Expense_detail:
    def __init__(self,amount,start_age,until_age,occur_yr, tied_to_age):
        self.amount=amount
        self.start_age=start_age
        self.until_age=until_age
        self.occur_yr=occur_yr
        self.tied_to_age=tied_to_age
    def to_dict(self):
        return {
            'amount': self.amount,
            'start_age': self.start_age,
            'until_age': self.until_age,
            'occur_yr': self.occur_yr,
            'tied_to_age': self.tied_to_age
        }

    @classmethod
    def from_dict(cls, fund_dict):
        return cls(fund_dict['amount'], fund_dict['start_age'], fund_dict['until_age'],fund_dict['occur_yr'],fund_dict['tied_to_age'])

    
class Income:

    def __init__(self,name,amount,dep_to_fund):
        self.name=name
        self.amount=amount
        self.dep_to_fund=dep_to_fund
        self.details:list[Income_detail]=[]

    def add_detail(self, detail):
        self.details.append(detail)
    
    @classmethod
    def from_dict(cls, income_dict):
        income = cls(income_dict['name'], income_dict['amount'],income_dict['dep_to_fund'])
        for detail_dict in income_dict['growths']:
            income.add_detail(Income_detail.from_dict(detail_dict))
        return income

    def to_dict(self):
        return {'name': self.name, 'amount': self.amount, 'dep_to_fund': self.dep_to_fund, 
                           'growths': [detail.to_dict() for detail in self.details]}
            
class Income_detail:
    def __init__(self,growth_rate,start_age,until_age):
        self.growth_rate=growth_rate
        self.start_age=start_age
        self.until_age=until_age
    
    def to_dict(self):
        return {
            'growth_rate': self.growth_rate,
            'start_age': self.start_age,
            'until_age': self.until_age
        }

    @classmethod
    def from_dict(cls, fund_dict):
        return cls(fund_dict['growth_rate'], fund_dict['start_age'], fund_dict['until_age'])
    

class Strategic:
    
    #def __init__(self,apply_min,apply_bucket,risk_fund,safer_fund,rebal_pause_option,retire_calendar_year,default_return_rate,expected_return_rate):
    def __init__(self,apply_min,apply_bucket,risk_fund,safer_fund,rebal_pause_option,expected_return_rate):
        
        self.apply_min=apply_min
        self.apply_bucket=apply_bucket
        self.risk_fund=risk_fund
        self.safer_fund=safer_fund
        #self.retire_calendar_year=retire_calendar_year
        self.rebal_pause_option=rebal_pause_option
        #self.default_return_rate=default_return_rate
        self.expected_return_rate=expected_return_rate
        self.details:list[Strategic_detail]=[]

    def add_detail(self, detail):
        self.details.append(detail)

    @classmethod
    def from_dict(cls, strategic_dict):
        strategic = cls(strategic_dict['apply_min'], strategic_dict['apply_bucket'],strategic_dict['risk_fund'],
                       strategic_dict['safer_fund'],strategic_dict['rebal_pause_option']
                       #,strategic_dict['retire_year'],strategic_dict['default_return_rate']
                       ,strategic_dict['expected_return_rate'])
        for detail_dict in strategic_dict['rebals']:
            strategic.add_detail(Strategic_detail.from_dict(detail_dict))
        return strategic
    
    def to_dict(self):
        return {'min_rate': self.min_rate, 'apply_min': self.apply_min, 'risk_fund': self.risk_fund, 
                            'safer_fund':self.safer_fund,'rebal_pause_option':self.rebal_pause_option,
                            'retire_year':self.retire_calendar_year,'default_return_rate':self.default_return_rate,'expected_return_rate':self.expected_return_rate,
                           'rebals': [detail.to_dict() for detail in self.details]}
class Strategic_detail:
    def __init__(self,risk_fund_ratio,safer_fund_ratio,start_age,until_age,occur_yr):
        self.risk_fund_ratio=risk_fund_ratio
        self.safer_fund_ratio=safer_fund_ratio
        self.start_age=start_age
        self.until_age=until_age
        self.occur_yr=occur_yr
    def to_dict(self):
        return {
            'risk_fund_ratio': self.risk_fund_ratio,
            'safer_fund_ratio': self.safer_fund_ratio,
            'start_age': self.start_age,
            'until_age': self.until_age,
            'occur_yr': self.occur_yr,
        }
    @classmethod
    def from_dict(cls, detail_dict):
        return cls(detail_dict['risk_fund_ratio'], detail_dict['safer_fund_ratio'],
                   detail_dict['start_age'], detail_dict['until_age'], detail_dict['occur_yr'])

class Plan_Data:    
    def __init__(self,current_age,retire_age):
        self.current_age=int(current_age)
        self.retire_age=int(retire_age)
        self.incomes=[]
        self.funds=[]
        self.expenses=[]
        self.strategic=None
    
    def add_expense(self, expense):
        self.expenses.append(expense)
    def add_fund(self, fund):
        self.funds.append(fund)
    def add_income(self, income):
        self.incomes.append(income)
    def set_strategic(self,strategic):
        self.strategic=strategic

    def to_json(self):
        return json.dumps({ 'current_age':self.current_age, 'retire_age':self.retire_age, 
                            'expenses': [expense.to_dict() for expense in self.expenses],
                            'incomes': [income.to_dict() for income in self.incomes],
                            'funds': [fund.to_dict() for fund in self.funds],
                            'strategic':self.strategic.to_dict()
                            }, indent=4)
    @classmethod
    def from_json(cls, json_string):
        plan_data_dict = json.loads(json_string)
        plan_data = cls( plan_data_dict['current_age'], plan_data_dict['retire_age'])
        for expenses_dict in plan_data_dict['expenses']:
            plan_data.add_expense(Expense.from_dict(expenses_dict))
        if 'incomes' in plan_data_dict:
            for incomes_dict in plan_data_dict['incomes']:
                plan_data.add_income(Income.from_dict(incomes_dict))
        for fund_dict in plan_data_dict['funds']:
            plan_data.add_fund(Fund.from_dict(fund_dict))
        plan_data.strategic=Strategic.from_dict(plan_data_dict['strategic'])    
        return plan_data

