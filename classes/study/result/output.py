"""Output handler for study results"""

from core import output as op
from typing import Dict, List
from classes.logging_config import initialize_logger

logger = initialize_logger()

class StudyOutput(op.Output):
    """Extension of Output class to capture study results in JSON format"""
    
    def __init__(self, isPaymentAtBegin: bool, expenses, liq_accts, nonliq_accts):
        super().__init__(isPaymentAtBegin, expenses, liq_accts, nonliq_accts)
        self.yearly_results = []
        logger.info("Initialized StudyOutput")

    def write_titles(self):
        """Write titles - required by base class"""
        logger.debug("Writing titles")
        self.write_summary(True, None, None, None, 0, 0, 0)
        self.write_liquidity(True, None, None, None, 0, 0, 0)
        self.write_expenses(True, None, None, None, 0, 0, 0)
        if self.nonliq_accts:
            self.write_incomes(True, None, None, None, 0, 0, 0)

    def write_summary(self, is_title: bool, expenses, liq_accts, nonliq_accts, year_num, year, age):
        """Capture summary data in JSON format instead of writing to Excel"""
        if not is_title:  # We only care about actual data rows
            logger.debug(f"Writing summary for year {year_num}")
            result = {
                "year_num": year_num,
                "calendar_year": year_num + year,
                "age": year_num + age,
                "boy_balance": liq_accts.cal_total_boy_balance()
            }

            if self.isPaymentAtBegin:
                result.update({
                    "boy_expenses": -expenses.get_yearly_total_amount(year_num + 1),
                    "boy_balance_after_expenses": liq_accts.get_boy_afpay_balance(year_num + 1)
                })
            
            result["profit_loss"] = liq_accts.cal_total_pl()

            if not self.isPaymentAtBegin:
                result["eoy_expenses"] = -expenses.get_yearly_total_amount(year_num + 1)

            if self.nonliq_accts:
                result["income"] = self.nonliq_accts.cal_total_income()
                if not self.isPaymentAtBegin:
                    result["net_deposit_withdraw"] = liq_accts.cal_net_income_expense()

            result["eoy_balance"] = liq_accts.cal_total_eoy_net_balance()
            
            self.yearly_results.append(result)
            logger.debug(f"Added year {year_num} to results")

    def get_results(self) -> List[Dict]:
        """Return captured yearly results"""
        return self.yearly_results
        
    def write_liquidity(self, is_title: bool, expenses, liq_accts, nonliq_accts, year_num, year, age):
        """Not needed for JSON output"""
        pass
        
    def write_expenses(self, is_title: bool, expenses, liq_accts, nonliq_accts, year_num, year, age):
        """Not needed for JSON output"""
        pass
        
    def write_incomes(self, is_title: bool, expenses, liq_accts, nonliq_accts, year_num, year, age):
        """Not needed for JSON output"""
        pass
        
    def close(self):
        """No cleanup needed for JSON output"""
        logger.info(f"Closing StudyOutput with {len(self.yearly_results)} years of data")
        pass
