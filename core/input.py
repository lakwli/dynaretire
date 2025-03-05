import expenses as mf
import account as ac
import pojo as pj
import data as dt
import strategic as st
import datetime

class Input:
    comment="#"
    section="$"
    end="$END"
    section_EXP="$Expenses"
    section_INC="$Incomes"
    section_FUN="$Funds"
    section_STR="$Strategics"

    def __init__(self, filename) -> None:
        self.filename=filename

        self.expenses=None
        self.incomes=None
        self.funds=None
        self.strategic=None

        self.current_age=55
        self.current_year=datetime.datetime.now().year
        self.retire_year=  self.current_year+1

        self.read_pos=1 #to decide if to +1 so that position is start from 1, not 0

    def _is_comment(self, line:str):
        if line.startswith(self.comment):
            return True
    
    def process_file(self):
        with open(self.filename, 'r') as file:
            self.lines = file.readlines()
        
        total_lines=len(self.lines)
        line_count=0
        stop_loop=1
        while line_count<total_lines:
            line=self.lines[line_count].strip()
            if self._is_comment(line):
                line_count+=1
                continue

            if line.startswith("current_age"):
                self.current_age = int(line.split(":")[1].strip())+self.read_pos 
                line_count+=1
                continue
            if line.startswith("current_year"):
                self.current_year = int(line.split(":")[1].strip())
                line_count+=1
                continue
            if line.startswith("retire_year"):
                self.retire_year = int(line.split(":")[1].strip())
                line_count+=1
                continue

            elif line.startswith(self.section_EXP):
                #print("==========================EXPENSES=====================================") 
                line_count+=1
                line_count=self.process_expenses(line_count)
            elif line.startswith(self.section_INC):
                #print("==========================INCOMES=====================================")     
                line_count+=1
                line_count=self.process_incomes(line_count)
            elif line.startswith(self.section_FUN):
                #print("==========================FUNDS=====================================")     
                line_count+=1
                line_count=self.process_funds(line_count)
                self._process_incomes_post() #to set deposit_fund_to after having the object
            elif line.startswith(self.section_STR):
                #print("==========================Strategics=====================================")     
                line_count+=1
                line_count=self.process_strategics(line_count)
            stop_loop+=1
            if stop_loop == 10:
                break

    def process_strategics(self, pos:int):   
        line_count=pos      
        #print(f"================================{line_count}")
        range_interval=1
        self.strategic = st.Strategic()
        self.strategic.set_retire_calendar_year(self.retire_year)
       
        #bad_market_hist_annual_return = 

        while True:#for each strategic
            line_content= self.lines[line_count].strip()
            #print(f"================================{line_content}")
            if line_content.startswith(self.section) == True:
                break
            if line_content.startswith(tuple(["apply","bad_market_apply_min_spending","bad_market_def_return","bad_market_apply_withdraw_sequence"])) == False:
                break

            #print(f"======================READ strategic")
            """
            if line_content.startswith("bad_market_hist_annual_return"): 
                bad_market_hist_annual_return = float(self.lines[line_count].split(":")[1].strip())
                self.strategic.bad_market_return=bad_market_hist_annual_return
                line_count+=1
                continue
            """
            if line_content.startswith("bad_market_def_return"): 
                self.strategic.bad_market_return = float(self.lines[line_count].split(":")[1].strip())
                line_count+=1
                continue
            if line_content.startswith("bad_market_apply_min_spending"): 
                #bad_market_apply = self.lines[line_count].split(":")[1].strip()
                #if bad_market_apply == "Min_Spending":
                self.strategic.is_apply_min=True
                line_count+=1
                continue
            if line_content.startswith("bad_market_apply_withdraw_sequence"): 
                funds_content = self.lines[line_count].split(":")[1].strip()
                funds=funds_content.split(",")
                bad_market_withdraw_sequence:list[ac.LiquidityAccount]=[]
                for fund in funds:
                    bad_market_withdraw_sequence.append(self.funds.find_stock(fund.strip()))
                self.strategic.set_bad_market_withdraw_sequence(bad_market_withdraw_sequence)
                line_count+=1
                continue

            if line_content.startswith("apply"): 
                apply = self.lines[line_count].split(":")[1].strip()

            if apply == "Min":
                self.strategic.is_apply_min=True
                line_count+=1
                continue
            if apply == "Rebalance":
                self.strategic.is_apply_bucket=True
            line_count+=1
            while True:#for each allocation 
                line_content= self.lines[line_count].strip()                
                if line_content=="":
                    line_count+=1
                    continue
                if line_content.startswith("from") == False:
                    break 

                allocation: dict[ac.LiquidityAccount, float]={}
                range_interval=1
                tabs = line_content.split(" ")
                for tab in tabs:   
                    tab_content=tab.strip() 
                    if tab_content=="":
                        continue
                    if tab_content==self.end:
                        break
                    key_value=tab_content.split(":")
                   
                    if key_value[0] == "from":
                        range_fr=int(key_value[1])
                    elif key_value[0] == "to":
                        range_to=int(key_value[1])  + 1
                    elif key_value[0] == "interval":
                        range_interval=int(key_value[1])     
                    elif key_value[0] == "alloc": 
                        stocks_allocs= key_value[1].strip().split(",") #Stock=0.7,EPF=0.3   
                        for stocks_alloc in stocks_allocs:
                            stocks_alloc_portion = stocks_alloc.split("=")#Stock=0.7
                            acc=self.funds.find_stock(stocks_alloc_portion[0].strip())
                            portion=float(stocks_alloc_portion[1].strip())
                            allocation.update({acc:portion}) 
                #print(f"-{line_count}----------------------------------------{range_fr},{range_to},{range_interval}, alloc={allocation}")
                line_count+=1
               
                r = range(range_fr,range_to,range_interval)
                self.strategic.setRebalanceApproach(r,allocation)
            #line_count+=1
        return line_count

    def process_funds(self, pos:int):   
        line_count=pos      
        accs=[] 

        while True:#for each account
            line_content= self.lines[line_count].strip()
            if line_content.startswith(self.section) == True:
                break
            if line_content.startswith("name") == False:
                break
            name = self.lines[line_count].split(":")[1].strip()
            line_count+=1
            amount = float(self.lines[line_count].split(":")[1].strip())
            line_count+=1
            eligible_withdraw_year = int(self.lines[line_count].split(":")[1].strip())
            line_count+=1
            #process return detail
            return_provider = None
            return_content=str(self.lines[line_count].strip())
            if return_content.find("{snp500}")>0:
                return_content = return_content[1].strip()
                return_provider = dt.StockReturn()
            elif return_content.find("{selfdefine}")>0:
                return_detail=return_content[return_content.find("{selfdefine}")+len("{selfdefine}"):len(return_content)].strip()
                return_detail=return_detail[return_detail.find("-")+1:len(return_detail)]
                while True:
                    if return_detail.find("}")>0:
                        #get the "rest"
                        pos_rest=return_detail.find("rest")
                        if pos_rest>0:
                            default_return_str=return_detail[pos_rest+len("rest"):return_detail.find("}")]
                            default_return_str=default_return_str[default_return_str.find(":")+1:len(default_return_str)]
                            default_return=float(default_return_str.strip())
                            return_detail=return_detail[return_detail.find("{")+1:pos_rest]+"}"
                            #construct dictionary
                            return_detail_arry=return_detail.split(",")
                            own_returns:dict[int:float]={}
                            for return_detail_part in return_detail_arry:
                                if return_detail_part.find(":") < 0:
                                    continue
                                return_detail_part_split = return_detail_part.split(":")
                                return_detail_year = int(return_detail_part_split[0].strip())
                                return_detail_return = float(return_detail_part_split[1].strip())
                                own_returns[return_detail_year]=return_detail_return
                            return_provider = dt.OwnReturn( own_returns, default_return)
                        else:
                            #construct dictionary
                            return_detail_arry=return_detail.split(",")
                            own_returns:dict[int:float]={}
                            for return_detail_part in return_detail_arry:
                                if return_detail_part.find(":"):
                                    continue
                                return_detail_part_split = return_detail_part.split(":")
                                return_detail_year = int(return_detail_part_split[0].strip())
                                return_detail_return = float(return_detail_part_split[1].strip())
                                own_returns[return_detail_year]=return_detail_return
                            return_provider = dt.OwnReturn( own_returns, 9.0)
                        break
                    line_count+=1
                    return_detail+=self.lines[line_count].strip()                   
                    continue
            else:
                return_provider = dt.BasicReturn( float(return_content.split(":")[1].strip()))
            accs.append(ac.LiquidityAccount(name,amount,eligible_withdraw_year,return_provider))
            line_count+=1            
        
        self.funds = ac.LiquidityAccounts(accs)      
        return line_count+1
    
    def process_incomes(self, pos:int):   
        line_count=pos        
        range_interval=1
        incomes=[]
        while True:#for each income
            line_content= self.lines[line_count].strip()
            #print(f"--------------------------------->Add income:{line_content}")
            if line_content.startswith(self.section) == True:
                break
            if line_content.startswith("name") == False:
                break
            name = line_content.split(":")[1].strip()
            line_count+=1
            deposit_to_fund=None
            if self.lines[line_count].find("deposit_to_fund")>0:
                deposit_to_fund = self.lines[line_count].split(":")[1].strip()
                line_count+=1
            
            #print(f"--------------------------------->Add income:{name}")
            yearly_income_growths:list[pj.GrowthAmount]=[]
            income=ac.NonLiquidityAccount(name,yearly_income_growths) 
            if deposit_to_fund != None:
                income.set_deposit_account_name(deposit_to_fund)
            incomes.append(income)
            
            #temp1=0
            while True: #for each detail
                line_content= self.lines[line_count].strip()    
                #temp1+=1
                #if temp1==5:
                    #break 
                if self._is_comment(line_content):
                    line_count+=1
                    continue         
                if line_content=="":
                    line_count+=1
                    continue
                if line_content.startswith("detail") == False:
                    break 
          
                #print(f"{line_count}==DETAIL=============================================START {line_content}")  
                detail = line_content.split(":")[1].strip()
                line_count+=1
                amount = float(self.lines[line_count].split(":")[1].strip())
                line_count+=1

                yearly_growth_set:dict[range:float]={}
                yearly_income_growth = pj.GrowthAmount(detail,amount,yearly_growth_set)
                yearly_income_growths.append(yearly_income_growth)
                
                line_content = self.lines[line_count].strip() 
                #temp=0
                while True: #for each growth
                    #print(f"{line_count}==GROWTH=============================================START {temp}")
                    #temp+=1
                    #if temp==5:
                    #    break
                    line_content= self.lines[line_count].strip()     
                    #print(f"line_content key:{line_content}")
                    if line_content=="":
                        line_count+=1
                        continue
                    if line_content.startswith("from") == False:
                        break 
                    tabs = line_content.split(" ")
                    for tab in tabs:   
                        tab_content=tab.strip() 
                        if tab_content=="":
                            continue
                        key_value=tab_content.split(":")
                        if key_value[0] == "from":
                            range_fr=int(key_value[1])
                        elif key_value[0] == "to":
                            range_to=int(key_value[1])+1 
                        elif key_value[0] == "interval":
                            range_interval=int(key_value[1]) 
                        elif key_value[0] == "growthrate":
                            growth_rate=float(key_value[1])
                    
                    if range_interval==None:
                        range_interval=1
                    r = range(range_fr,range_to,range_interval)
                    yearly_growth_set.update({r:growth_rate})
                    line_count+=1
                yearly_income_growth.cal_year_start_end()

        for i in incomes:
            i.set_underlying_names()
        self.incomes = ac.NonLiquidityAccounts(incomes)    
        return line_count

    
    def _process_incomes_post(self): 
        if self.incomes==None:
            return
        for i in self.incomes.accounts:      
            #print(f"============================={i.deposit_account_name}")
            if i.deposit_account_name !=None:      
                acc=self.funds.find_stock(i.deposit_account_name)
                if acc != None:
                    i.set_deposit_account(acc)

    def process_expenses(self, pos:int):
        line_count=pos        
        range_interval=1
        expenses_list=[]
        while True:
            line_content= self.lines[line_count].strip()
            if line_content.startswith("name") == False:
                break
            name = line_content.split(":")[1].strip()
            line_count+=1
            inflation=float(self.lines[line_count].split(":")[1])
            line_count+=1
            disc=float(self.lines[line_count].split(":")[1])

            expense=mf.Expense(name,inflation,disc, None) 
            expenses_list.append(expense)
            line_count+=1
            while True:
                line_content= self.lines[line_count].strip()                
                if line_content=="":
                    line_count+=1
                    continue
                if line_content.startswith("from") == False:
                    break 
                tabs = line_content.split(" ")
                for tab in tabs:   
                    tab_content=tab.strip() 
                    if tab_content=="":
                        continue
                    key_value=tab_content.split(":")
                    if key_value[0] == "from":
                        range_fr=int(key_value[1])  
                    elif key_value[0] == "to":
                        range_to=int(key_value[1])   + 1 
                    elif key_value[0] == "interval":
                        range_interval=int(key_value[1]) 
                    elif key_value[0] == "amount":
                        range_amount=int(key_value[1])
                if range_interval==None:
                    range_interval=1
                expense.add_amount_range(range(range_fr,range_to,range_interval),range_amount)
                line_count+=1
        self.expenses = mf.Expenses(expenses_list)
        return line_count
    
    def display(self):
       
        print("==========================EXPENSES=====================================") 
        self.expenses.display(1)
        print("==========================INCOMES=====================================")   
        if self.incomes != None:
            self.incomes.display_current()
        print("==========================FUNDS=====================================")  
        self.funds.display_current()    
        print("==========================Strategics=====================================") 
        self.strategic.display()



def test():
     i = Input()
     i.process_file()

#test()