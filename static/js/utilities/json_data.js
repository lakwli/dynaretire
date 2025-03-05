class Fund {
  constructor(name, desc, amount, return_type, return_rate, default_rate, mimic_calendar_year, wt_age) {
      this.name = name;
      this.amount = toFloat(amount);
      this.desc = desc;
      this.return_type = return_type;
      this.return_rate = return_rate;
      this.default_rate = default_rate;
      this.mimic_calendar_year = mimic_calendar_year;
      this.wt_age = wt_age;
  }
}

class Expense {
  constructor(name, min_rate, inflation) {
      this.name = name;
      this.min_rate = toFloat(min_rate);
      this.inflation = toFloat(inflation);
      this.amounts = [];
  }

  addAmounts(amount) {
      this.amounts.push(toFloat(amount));
  }
  addAmountsFirstPos(amount){
    this.amounts.unshift(toFloat(amount));
  }
}

class ExpenseDetail {
  constructor(amount, start_age, until_age, occur_yr, tied_to_age) {
    this.amount = toFloat(amount);
    this.start_age = toInt(start_age);
    this.until_age = toInt(until_age);
    this.occur_yr = toInt(occur_yr);
    this.tied_to_age = tied_to_age
  }
}

class Income {
  constructor(name, amount, dep_to_fund) {
      this.name = name;
      this.amount = toFloat(amount);
      this.dep_to_fund = dep_to_fund;
      this.growths = [];
  }

  addGrowths(growth) {
      this.growths.push(toFloat(growth));
  }
  addGrowthsFirstPos(growth){
      this.growths.unshift(toFloat(growth));
  }
}

class IncomeDetail {
  constructor(growth_rate, start_age, until_age) {
      this.growth_rate = toFloat(growth_rate);
      this.start_age = toInt(start_age);
      this.until_age = toInt(until_age);
  }
}

class Strategic {
  //constructor(apply_min, apply_bucket, risk_fund, safer_fund,rebal_pause_option, retire_year,default_return_rate,expected_return_rate)
  constructor(apply_min, apply_bucket, risk_fund, safer_fund,rebal_pause_option, expected_return_rate) {
      this.apply_min = apply_min;
      this.apply_bucket = apply_bucket;
      this.risk_fund = risk_fund;
      this.safer_fund = safer_fund;
      this.rebal_pause_option = rebal_pause_option;
      //this.retire_year = toInt(retire_year);
      //this.default_return_rate = toFloat(default_return_rate);
      this.expected_return_rate = toFloat(expected_return_rate);
      this.rebals = [];
  }

  addRebals(detail) {
      this.rebals.push(detail);
  }

  addRebalsFirstPos(detail){
    this.rebals.unshift(detail);
  }
}


class StrategicDetail{
    constructor(risk_fund_ratio, safer_fund_ratio,start_age,until_age,occur_yr){
      this.risk_fund_ratio=toFloat(risk_fund_ratio)
      this.safer_fund_ratio=toFloat(safer_fund_ratio)
      this.start_age=toInt(start_age)
      this.until_age=toInt(until_age)
      this.occur_yr=toInt(occur_yr)
    }
}

class Plan_Data{
    constructor(current_age,retire_age){
          this.current_age=current_age
          this.retire_age=retire_age
          this.incomes=[]
          this.funds=[]
          this.expenses=[]
          this.strategic=null
    }
      
    add_expense(expense){
          this.expenses.push(expense)
    }
    add_fund(fund){
      this.funds.push(fund)
    }
    add_income(income){
      this.incomes.push(income)
    }
    set_strategic(strategic){
      this.strategic=strategic
    }
    addExpenseFirstPos(expense){
      this.expenses.unshift(expense);
    }
    addFundFirstPos(fund){
      this.funds.unshift(fund);
    }
    addIncomeFirstPos(income){
      this.incomes.unshift(income);
    }
}
function toInt(inputValue) {
  if (typeof inputValue === 'string'){
    if(! (inputValue !== null && inputValue !== undefined && inputValue !== ''))
        return 0
    str = inputValue.replace(/\s+/g, ''); // remove spaces
    let num = parseInt(str); // convert to integer
    return num
  }
  return inputValue
}
function toFloat(inputValue) {
  if (typeof inputValue === 'string'){
    if(! (inputValue !== null && inputValue !== undefined && inputValue !== ''))
        return 0
    str = inputValue.replace(/\s+/g, ''); // remove spaces
    let num = parseFloat(str); // convert to integer
    return num
  }
  return inputValue
}

/** 
e1=new Expense("E1",0.8,5);
e1.addAmounts(new ExpenseDetail(10,1,10,1));
e1.addAmounts(new ExpenseDetail(100,11,20,1));
e1.addAmounts(new ExpenseDetail(500,21,30,1));

e2=new Expense("E2",0.8,5);
e2.addAmounts(new ExpenseDetail(10,1,10,1));
e2.addAmounts(new ExpenseDetail(100,11,20,1));
e2.addAmounts(new ExpenseDetail(500,21,30,1));


i1= new Income("I1",1000,"EPF");
i1.addGrowths(new IncomeDetail(3.0, 5,9));
i1.addGrowths(new IncomeDetail(5.0, 10,19));
i1.addGrowths(new IncomeDetail(6.0, 20,29));
i2= new Income("I1",1000,"Stocks");
i2.addGrowths(new IncomeDetail(3.0, 5,9));
i2.addGrowths(new IncomeDetail(5.0, 10,19));
i2.addGrowths(new IncomeDetail(6.0, 20,29));


s1=new Strategic(true,true,"E","F","A", 1998);
s1.addRebals(new StrategicDetail(30,40,1,100,2))
s1.addRebals(new StrategicDetail(30,40,1,100,2))


const fund1= new Fund('EPF', 't', 1000,5.0,55);
const fund2= new Fund('EPF','t2', 1000,5.0,55);

p = new Plan_Data(23,2008)
p.set_strategic(s1)
p.add_expense(e1)
p.add_expense(e2)
p.add_income(i1)
p.add_income(i2)
p.add_fund(fund1)
p.add_fund(fund2)

const prettyJSON = JSON.stringify(p, null, 2);
console.log(prettyJSON);
*/
 /** 
console.log("=================READING=====================");

// Assuming your JSON file is named "data.json"
const fs = require('fs');
const path = require('path');

const jsonFilePath = path.join(__dirname, 'json_data_py.json');
const rawJsonString = fs.readFileSync(jsonFilePath, 'utf8');
// Use the raw JSON string here
//console.log(rawJsonString);
p2 = JSON.parse(rawJsonString)
console.log("after parse");

p2.expenses.forEach(expense => {
  console.log(`Expense: ${expense.name}`);
  expense.amounts.forEach(amount => {
      console.log(`  Amount: ${amount.amount}, Year From: ${amount.start_yr}, Year To: ${amount.until_yr}`);
    });
  });
  */