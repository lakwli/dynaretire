import xlsxwriter
from core import expenses as mf
from core import account as la
from classes import util as ut


class Output():

    def __init__(self, isPaymentAtBegin: bool, expenses: mf.Expense, liq_accts: la.LiquidityAccounts, nonliq_accts: la.LiquidityAccounts):
        self.title = []
        self.isPaymentAtBegin = isPaymentAtBegin
        self.expenses = expenses
        self.liq_accts = liq_accts
        self.nonliq_accts = nonliq_accts
        self.is_eoy_cal = True  # is it eoy to withdraw next year
        self.is_formular_based = False

    def incrementing_generator(start=0, step=1):
        n = start
        while True:
            yield n
            n += step


class Excel (Output):
    separate_sheets = True
    SEC_SUM = "Summary"
    SEC_LIQ = "Retirement Funds"
    SEC_EXP = "Expenses"
    SEC_INC = "Cash-in Incomes"

    sections = [SEC_SUM, SEC_LIQ, SEC_EXP, SEC_INC]

    START_ROW_YEAR = 1  # which row to display the 1st year. 3 means row 5. as year start at 1, 1+3=4, row start from 0 so it become 5 pos
    # which col start the display investment detail (depends on new sheet or same sheet)
    START_COL_LIQ = 0
    # which col start the display withdraw detail (depends on new sheet or same sheet)
    START_COL_EXP = START_COL_LIQ
    # which col start the display income detail (depends on new sheet or same sheet)
    START_COL_INC = START_COL_LIQ

    def __add_formats(self):
        self.fmt_currency = self.workbook.add_format({'num_format': '#,##0'})
        self.fmt_rate_pos = self.workbook.add_format(
            {'num_format': '#,##0.00', 'font_color': 'blue'})
        self.fmt_rate_neg = self.workbook.add_format(
            {'num_format': '#,##0.00', 'font_color': 'red'})
        self.fmt_percent = self.workbook.add_format({'num_format': '0.00%'})
        self.fmt_percent_bold = self.workbook.add_format({'num_format': '0.00%', 'bold': True})
        self.fmt_percent_pos = self.workbook.add_format({'num_format': '0.00%', 'font_color': 'blue'})
        self.fmt_percent_neg = self.workbook.add_format({'num_format': '0.00%', 'font_color': 'red'})
        self.fmt_percent_pos_bold = self.workbook.add_format({'num_format': '0.00%', 'font_color': 'blue', 'bold': True})
        self.fmt_percent_neg_bold = self.workbook.add_format({'num_format': '0.00%', 'font_color': 'red', 'bold': True})

        self.fmt_currency_total = self.workbook.add_format(
            {'num_format': '#,##0', 'bg_color': 'C4D79B', 'bold': True, 'italic': True})

        self.fmt_currency_exp_min = self.workbook.add_format(
            {'num_format': '#,##0'})
        self.fmt_currency_exp_min.set_font_color('red')

        self.fmt_currency_liq_bal = self.workbook.add_format(
            {'num_format': '#,##0', 'bg_color': 'FEFEEC'})
        self.fmt_currency_liq_bal_net = self.workbook.add_format(
            {'num_format': '#,##0', 'bg_color': 'FEFEEC', 'bold': True})

        self.fmt_currency_liq_flow = self.workbook.add_format(
            {'num_format': '#,##0', 'bg_color': 'D6FCFE'})
        self.fmt_currency_liq_flow_disable = self.workbook.add_format(
            {'bg_color': 'D6FCFE', 'align': 'right'})
        self.fmt_currency_liq_flow_net = self.workbook.add_format(
            {'num_format': '#,##0', 'bg_color': 'D6FCFE', 'bold': True})

        self.fmt_currency_liq_eoy_net = self.workbook.add_format(
            {'num_format': '#,##0', 'bg_color': 'C4D79B', 'bold': True, 'italic': True})

        self.fmt_title_number = self.workbook.add_format(
            {'align': 'right', 'valign': 'vcenter', 'text_wrap': True, 'bg_color': 'BFBFBF', 'font_size': 11, 'bold': True})

        self.merge_format = self.workbook.add_format(
            {
                "bold": 1,
                "border": 1,
                'text_wrap': True,
                "align": "left",
                "valign": "vcenter",
                "fg_color": "yellow",
            }
        )

    def __init__(self, name, isPaymentAtBegin: bool, expenses: mf.Expense, liq_accts: la.LiquidityAccounts, nonliq_accts: la.NonLiquidityAccounts):
        super().__init__(isPaymentAtBegin, expenses, liq_accts, nonliq_accts)
        self.workbook = xlsxwriter.Workbook(name+'.xlsx')
        self.yearly_returns = []  # Store yearly returns for annualized calculation
        self.final_annualized = None  # Store final annualized return value
        
        self.workbook.set_properties(
            {
                "title": "This is an excel generated from Retirement Fund Sustainability Calculator Program",
                "subject": "Retirement Fund Sustainability Calculator",
                "author": "Lau Kwai Ling",
                "manager": "-",
                "company": "-",
                "category": "Calculator",
                "keywords": "Retirement",
                "comments": "For Personal Own Used Only",
                "status": "Testing",
            }
        )

        self.__add_formats()

        self.ws_sum = self.workbook.add_worksheet(self.SEC_SUM)
        if (self.separate_sheets == True):
            self.ws_exp = self.workbook.add_worksheet(self.SEC_EXP)
            if self.nonliq_accts != None:
                self.ws_inc = self.workbook.add_worksheet(self.SEC_INC)
            self.ws_liq = self.workbook.add_worksheet(self.SEC_LIQ)
        else:
            self.ws_liq = self.ws_sum
            self.START_COL_LIQ = len(self.summary_keys_titles)+1
            self.ws_exp = self.ws_sum
            self.START_COL_EXP = len(
                self.liq_accts.liquidity_accounts)+self.START_COL_INV+1
            self.ws_inc = self.ws_sum

        self.current_rs = None

    def write_summary(self, is_title: bool,
                      expenses: mf.Expense, liq_accts: la.LiquidityAccounts, nonliq_accts: la.NonLiquidityAccounts,
                      year_num, year, age):
        col = 0
        row = 0
        if is_title:
            if (self.isPaymentAtBegin):
                summary_titles = ["#", "Year", "Age", "BOY BAL",
                                  "BOY Expenses", "BOY BAL AFTER EXPENSES", "Net Return %", "P/L"]  # ,"EOY BAL"
            else:
                summary_titles = ["#", "Year", "Age", "BOY BAL",
                                  "P/L", "EOY Expenses"]  # ,"EOY BAL"
            if self.nonliq_accts != None:
                summary_titles.append("Income")
                if (not self.isPaymentAtBegin):
                    summary_titles.append("Net Deposit/Withdraw")
            summary_titles.append("EOY BAL")
            # print(summary_titles)
            for title in summary_titles:
                self.ws_sum.write(row, col, title, self.fmt_title_number)
                col += 1

            self.ws_sum.write_comment(
                row, 3, "Beginning year of balance. Same as EOY BAL of previous year")
            self.ws_sum.write_comment(row, 7 if self.isPaymentAtBegin else 4,
                                      "Profit and Loss based on investment return. Refer to Retirement Funds sheet for detail")
            if (self.isPaymentAtBegin):
                self.ws_sum.write_comment(
                    row, 5, "BOY BAL AFTER BOY EXPENSES = BOY BAL deduct Expenses")
                self.ws_sum.write_comment(
                    row, 6, "Net Return % = P/L / BOY BAL AFTER EXPENSES\nBottom row shows annualized return calculated as ((1 + r₁)(1 + r₂)...(1 + rₙ))^(1/n) - 1\nwhere r₁...rₙ are the yearly returns and n is the number of years")
            if self.nonliq_accts != None:
                self.ws_sum.write_comment(
                    row, 10 if self.isPaymentAtBegin else 8, "Net Deposit Withdraw = Expenses - Income")
                col = 10 if self.isPaymentAtBegin else 8
            else:
                col = 8 if self.isPaymentAtBegin else 6
            # self.ws_sum.write_comment(row, col, "Net of End Of Year Balance = EOY BAL- Net Deposit Withdraw")
        else:
            row = year_num+self.START_ROW_YEAR
            # add extra 1 col above, -1 is due to cal next year
            self.ws_sum.write(row, 0, year_num)
            self.ws_sum.write(row, 1, year_num+year)  # year 2000
            self.ws_sum.write(row, 2, year_num+age)  # age
            self.ws_sum.write(
                row, 3,  liq_accts.cal_total_boy_balance(), self.fmt_currency_liq_bal)  # boy
            if (year_num != 0):
                if (self.isPaymentAtBegin):
                    self.ws_sum.write(
                        # boy
                        row, 4,  -expenses.get_yearly_total_amount(year_num+1), self.fmt_currency_liq_flow)
                    self.ws_sum.write(row, 5,  liq_accts.get_boy_afpay_balance(
                        year_num+1), self.fmt_currency_liq_bal)  # boy
                self.ws_sum.write(row, 7 if self.isPaymentAtBegin else 4,  liq_accts.cal_total_pl(
                ), self.fmt_currency_liq_flow)  # boy
            # self.ws_sum.write(row, 5,  liq_accts.cal_total_eoy_balance(),self.fmt_currency_liq_bal_net) #boy
            if not self.isPaymentAtBegin:
                self.ws_sum.write(
                    # boy
                    row, 5,  -expenses.get_yearly_total_amount(year_num+1), self.fmt_currency_liq_flow)
            if (self.isPaymentAtBegin):
                # Calculate Net Return %
                if (year_num != 0):
                    net_return = liq_accts.cal_total_pl() / liq_accts.get_boy_afpay_balance(year_num+1)
                    self.yearly_returns.append(net_return)
                    fmt = self.fmt_percent_pos if net_return >= 0 else self.fmt_percent_neg
                    self.ws_sum.write(row, 6, net_return, fmt)

                # Add blank row and annualized return after last data row
                if year_num == len(self.yearly_returns):
                    blank_row = row + 1
                    annualized_row = row + 2
                    self.ws_sum.write(blank_row, 6, "", self.fmt_percent)  # Blank row
                    
                    # Store final annualized return
                    if len(self.yearly_returns) > 0:
                        compound_return = 1.0
                        for r in self.yearly_returns:
                            compound_return *= (1 + r)
                        self.final_annualized = pow(compound_return, 1/len(self.yearly_returns)) - 1

            if nonliq_accts != None:
                self.ws_sum.write(row, 8 if self.isPaymentAtBegin else 6,  nonliq_accts.cal_total_income(
                ), self.fmt_currency_liq_flow)  # boy
                if (not self.isPaymentAtBegin):
                    self.ws_sum.write(row, 7,  liq_accts.cal_net_income_expense(
                    ), self.fmt_currency_liq_flow_net)  # boy
                col = 9 if self.isPaymentAtBegin else 7
            else:
                col = 8 if self.isPaymentAtBegin else 6

            self.ws_sum.write(
                row, col,  liq_accts.cal_total_eoy_net_balance(), self.fmt_currency_liq_eoy_net)

    def write_separate_sheet(self, sheet, first_row, is_title: bool, year_num, year, age):
        if is_title:
            if (self.separate_sheets == True):
                # add extra 1 col above
                sheet.write(0, 0, "#", self.fmt_title_number)
                # add extra 1 col above
                sheet.write(0, 1, "Year", self.fmt_title_number)
                # add extra 1 col above
                sheet.write(0, 2, "Age", self.fmt_title_number)
        else:
            sheet.write(year_num+1, 0, year_num)  # add year
            sheet.write(year_num+1, 1, year_num+year)  # age
            sheet.write(year_num+1, 2, year_num+age)  # age
        return 3

    def write_liquidity(self, is_title: bool,
                        expenses: mf.Expense, liq_accts: la.LiquidityAccounts, nonliq_accts: la.NonLiquidityAccounts,
                        year_num, year, age):

        # col=self.START_COL_LIQ

        # expected to return 0 when call next(col) if first
        col = ut.BidirectionalCounter(start=self.START_COL_LIQ)
        if (self.separate_sheets == True):
            colnum = self.write_separate_sheet(
                self.ws_liq, 0, is_title, year_num, year, age)
            col = ut.BidirectionalCounter(start=colnum-1)
        row = 0
        if is_title:
            if (self.isPaymentAtBegin):
                # +" [Expenses]","BOY BAL AFTER EXPENSES", -"  [EOY Bal]", [Net In/Out]
                liq_titles = [" [BOY Bal]", " [BOY Expenses]", "[BOY BAL AFTER EXPENSES[]",
                              " [EOY Return]", " [EOY P/L]", "  [EOY Deposit]", " [EOY Rebal]", "  [EOY Net Bal]"]
            else:
                liq_titles = [" [BOY Bal]", " [EOY Return]", " [EOY P/L]", "  [EOY Bal]",
                              "  [EOY Deposit]", " [EOY Expenses]", " [EOY Rebal]", " [Net In/Out]", "  [EOY Net Bal]"]
            for acct in self.liq_accts.liquidity_accounts:
                for title in liq_titles:
                    self.ws_liq.write(
                        row, col.next(), acct.name+title, self.fmt_title_number)
                    # col+=1
                # col+=1 #one col split to diff account
                col.next()
        else:
            start_row = year_num+self.START_ROW_YEAR
            # col-=1
            col.prev
            for acct in liq_accts.liquidity_accounts:
                self.ws_liq.write(start_row, col.next(),
                                  acct.boy_balance, self.fmt_currency_liq_bal)
                if (self.isPaymentAtBegin):
                    if acct.is_eligible_withdraw(year_num) == True:
                        self.ws_liq.write(start_row, col.next(
                        ), -acct.withdrawed, self.fmt_currency_liq_flow)
                    else:
                        self.ws_liq.write(start_row, col.next(
                        ), "-", self.fmt_currency_liq_flow_disable)
                        self.ws_liq.write_comment(
                            start_row, col.value, "Not eligible for withdraw")
                    self.ws_liq.write(start_row, col.next(
                    ), acct.boy_afpay_balance, self.fmt_currency_liq_bal)

                if acct.growth_rate >= 0:
                    self.ws_liq.write(start_row, col.next(),
                                      acct.growth_rate, self.fmt_rate_pos)
                else:
                    self.ws_liq.write(start_row, col.next(),
                                      acct.growth_rate, self.fmt_rate_neg)
                self.ws_liq.write(start_row, col.next(),
                                  acct.pl, self.fmt_currency_liq_flow)

                if (not self.isPaymentAtBegin):
                    self.ws_liq.write(start_row, col.next(
                    ), acct.eoy_balance, self.fmt_currency_liq_bal_net)
                self.ws_liq.write(start_row, col.next(),
                                  acct.income, self.fmt_currency_liq_flow)

                if (not self.isPaymentAtBegin):
                    if acct.is_eligible_withdraw(year_num) == True:
                        self.ws_liq.write(start_row, col.next(
                        ), -acct.withdrawed, self.fmt_currency_liq_flow)
                    else:
                        self.ws_liq.write(start_row, col.next(
                        ), "-", self.fmt_currency_liq_flow_disable)
                        self.ws_liq.write_comment(
                            start_row, col.value, "Not eligible for withdraw",
                             {'width': 50, 'height': 15, 'x_scale': 2, 'y_scale': 1})
                self.ws_liq.write(start_row, col.next(),
                                  acct.rebal_amount, self.fmt_currency_liq_flow)
                if (acct.rebal_pause_option != None):
                    comment_text = "Rebalance paused because the personal annualized return since retirement year has fallen below the set threshold.  This pause was activated based on user-selected settings"
                    self.ws_liq.write_comment(
                        start_row, col.value, comment_text, 
                        {'width': 150, 'height': 30, 'x_scale': 2, 'y_scale': 2})
                if (not self.isPaymentAtBegin):
                    self.ws_liq.write(start_row, col.next(
                    ), acct.net_move_in_out_amount_eoy(), self.fmt_currency_liq_flow_net)
                self.ws_liq.write(start_row, col.next(
                ), acct.eoy_net_balance, self.fmt_currency_liq_eoy_net)
                col.next()
                # col.next() #give 1 col space for another account

    def write_expenses(self, is_title: bool,
                       expenses: mf.Expense, liq_accts: la.LiquidityAccounts, nonliq_accts: la.NonLiquidityAccounts,
                       year_num, year, age):
        row = 0
        col = self.START_COL_EXP
        if (self.separate_sheets == True):
            col = self.write_separate_sheet(
                self.ws_exp, 0, is_title, year_num, year, age)
        if is_title:
            for expense in self.expenses.expenses:
                self.ws_exp.write(row, col, expense.name,
                                  self.fmt_title_number)
                col += 1
                self.ws_exp.write(row, col, "           Total",
                                  self.fmt_title_number)
        else:
            start_row = year_num+self.START_ROW_YEAR
            col -= 1
            if (self.separate_sheets == True):
                # add extra 1 col above, -1 is due to cal next year
                self.ws_exp.write(start_row, 0, year_num)
                col += 1
            str_fom_sum = "=SUM("+chr(ord('@')+(col+1)) + \
                str(start_row+1)  # to construct sum =SUM(B2:G2)
            for expense in self.expenses.expenses:
                cell = (chr(ord('@')+(col+1))) + str(start_row+1)
                if expense.is_min_applied:
                    self.ws_exp.write(start_row, col, expense.get_yearly_amount(
                        year_num+1), self.fmt_currency_exp_min)  # +1  for next year
                    comment_text = "Expense reduced to " + "{:,.0f}".format(expense.get_yearly_amount(year_num+1)) + " (which is " + str(expense.reduction_rate*100) + "% of the original amount: " + "{:,.0f}".format(expense.get_orig_yearly_amount(year_num+1)) + "). This reduction was triggered because personal investment annualized returns since retirement year have fallen below the minimum threshold setting."
                    self.ws_exp.write_comment(cell, comment_text, 
                        {'width': 160, 'height': 40, 'x_scale': 2, 'y_scale': 1.5})
                else:
                    self.ws_exp.write(start_row, col, expense.get_yearly_amount(
                        year_num+1), self.fmt_currency)  # +1  for next year
                col += 1
            str_fom_sum += ":" + (chr(ord('@')+(col))) + str(start_row+1)+")"
            self.ws_exp.write(start_row, col, str_fom_sum,
                              self.fmt_currency_total)

    def write_incomes(self, is_title: bool,
                      expenses: mf.Expense, liq_accts: la.LiquidityAccounts, nonliq_accts: la.NonLiquidityAccounts,
                      year_num, year, age):
        row = 0
        col = self.START_COL_INC
        if (self.separate_sheets == True):
            col = self.write_separate_sheet(
                self.ws_inc, 0, is_title, year_num, year, age)
        if is_title:
            for acc in self.nonliq_accts.accounts:
                underlying_incomes = acc.underlying_incomes_name
                for name in underlying_incomes:
                    self.ws_inc.write(row, col, acc.name +
                                      "["+name+"]", self.fmt_title_number)
                    if acc.deposit_account != None:
                        self.ws_inc.write_comment(
                            row, col, "Deposit to "+acc.deposit_account.name+" Fund ONLY. Refer to EPF in Retirement Funds Sheet")
                    col += 1
                self.ws_inc.write(row, col, "           Total",
                                  self.fmt_title_number)
        else:
            start_row = year_num+self.START_ROW_YEAR
            col -= 1
            if (self.separate_sheets == True):
                # add extra 1 col above, -1 is due to cal next year
                self.ws_inc.write(start_row, 0, year_num)
                col += 1
            str_fom_sum = "=SUM("+chr(ord('@')+(col+1)) + \
                str(start_row+1)  # to construct sum =SUM(B2:G2)
            for acc in self.nonliq_accts.accounts:
                for growth in acc.yearly_income_growths:
                    self.ws_inc.write(
                        start_row, col, growth.latest_amount, self.fmt_currency)
                    col += 1
            str_fom_sum += ":" + (chr(ord('@')+(col))) + str(start_row+1)+")"
            self.ws_inc.write(start_row, col, str_fom_sum,
                              self.fmt_currency_total)

    def write_titles(self):
        self.write_summary(True, None, None, None, 0, 0, 0)
        self.write_liquidity(True, None, None, None, 0, 0, 0)
        self.write_expenses(True, None, None, None, 0, 0, 0)
        if self.nonliq_accts != None:
            self.write_incomes(True, None, None, None, 0, 0, 0)

    def record_yearly_result(self, expenses: mf.Expense, liq_accts: la.LiquidityAccounts, nonliq_accts: la.NonLiquidityAccounts, year_num, calendar_year, age):

        self.write_summary(False, expenses, liq_accts,
                           nonliq_accts, year_num, calendar_year, age)
        self.write_expenses(False, expenses, liq_accts,
                            nonliq_accts, year_num, calendar_year, age)
        if self.nonliq_accts != None:
            self.write_incomes(False, expenses, liq_accts,
                               nonliq_accts, year_num, calendar_year, age)
        self.write_liquidity(False, expenses, liq_accts,
                             nonliq_accts, year_num, calendar_year, age)

    def _touch_up_sheet(self):
        # Calculate column position
        last_col = 8 if self.isPaymentAtBegin else 6
        if self.nonliq_accts is not None:
            last_col = 10 if self.isPaymentAtBegin else 8
            
        extra_col = last_col + 1  # One column after last data
        
        # Set width for three columns
        self.ws_sum.set_column(extra_col, extra_col + 2, 20)
        
        # Format for annualized return header
        label_fmt = self.workbook.add_format({
            'align': 'center',
            'valign': 'vcenter', 
            'text_wrap': True,
            'bold': True,
            'font_color': 'blue'
        })
        
        # Row 2: "Annualized Return" header  
        self.ws_sum.merge_range(2, extra_col, 2, extra_col + 2, "Annualized Return", label_fmt)
        
        # Row 3: The actual annualized return value
        if hasattr(self, 'final_annualized') and self.final_annualized is not None:
            fmt = self.fmt_percent_pos_bold if self.final_annualized >= 0 else self.fmt_percent_neg_bold
            self.ws_sum.write(3, extra_col, self.final_annualized, fmt)
            
        # Row 4: Blank gap
        
        # Row 5: "Note:" heading
        self.ws_sum.merge_range(5, extra_col, 5, extra_col + 2, "Note:", self.merge_format)
        
        # Rows 6-7: Age explanation
        content1 = "1. #0 refer to current age."
        self.ws_sum.merge_range(6, extra_col, 7, extra_col + 2, content1, self.merge_format)
        
        # Row 8: Return explanation
        content2 = "2. means earning the same steady percentage each year. Example: 33% in 3 years = about 10% annualized return per year."
        self.ws_sum.merge_range(8, extra_col, 8, extra_col + 2, content2, self.merge_format)

        # Expenses Note
        total_exp = len(self.expenses.expenses)
        '''
        content="Note1: \n1. What is shown is to be withdrawed amount for coming year expenses \n2. This is to match the 'Next Year Expenses' in Summary Sheet"
        merge_col=(chr(ord('@')+(total_exp+6)))+"2"+":"+(chr(ord('@')+(total_exp+6)))+"5"  
        self.ws_exp.merge_range(merge_col, content, self.merge_format)
        '''

        content = "Note2: \n1. Should market turn bad, system switch to spend minimum (discount set by user). \n2. Amount appear in red font color. Refer comment for detail \n3. Bad market is based on history annualized return negative (or set by user) since retire year until last year (as Expenses Happen beginning of the year)."
        merge_col = (chr(ord('@')+(total_exp+6)))+"7" + \
            ":"+(chr(ord('@')+(total_exp+6)))+"10"
        self.ws_exp.merge_range(merge_col, content, self.merge_format)

        # not supported by pythonanywhere
        '''
        self.ws_sum.autofit() 
        self.ws_exp.autofit() 
        if self.nonliq_accts != None:
            self.ws_inc.autofit()  
        self.ws_liq.autofit()
        '''

        self.ws_sum.freeze_panes(1, 3)
        self.ws_exp.freeze_panes(1, 3)
        if self.nonliq_accts != None:
            self.ws_inc.freeze_panes(1, 3)
        self.ws_liq.freeze_panes(1, 3)
        # due to cannot set autofit, so just open it
        '''
        self.ws_sum.protect('p1s2s3w4o5r6d7')
        self.ws_exp.protect('p1s2s3w4o5r6d7')
        if self.nonliq_accts != None:
            self.ws_inc.protect('p1s2s3w4o5r6d7')  
        self.ws_liq.protect('p1s2s3w4o5r6d7')
        '''

    def close(self):
        self._touch_up_sheet()
        self.workbook.close()


def test():
    testC = Excel(name="hello8")
    testC.close()
