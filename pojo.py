class YearPercentage: 
    def __init__(self,percent,year):
        self.year=year
        self.percent=percent

class YearAmount: 
    def __init__(self,amount,year):
        self.year=year
        self.amount=amount



class GrowthAmount: 
    def __init__(self,name,amount, yearly_growth_set:dict[range:float]):
        self.name=name
        self.amount=amount
        self.yearly_growth_set=yearly_growth_set
        self.latest_amount=0

        self.start_year=100
        self.until_year=0        
        self.cal_year_start_end()

    def cal_year_start_end(self):
        for years_range in self.yearly_growth_set:   
            start_year=min(years_range)
            if (start_year<self.start_year):
                self.start_year=start_year
            max_year = max (years_range)
            if (max_year>self.until_year):
                self.until_year=max_year

            
    def growth(self, year):
        #print(f" compare {year} vs start {self.start_year} vs until {self.until_year}", end=" ") 
        if year==self.start_year:
            self.latest_amount=self.amount
            return self.latest_amount
        if year>self.until_year:
            self.latest_amount=0
            return 0
        #print(f" Get Growth ", end=" ") 
        for years_range in self.yearly_growth_set:     
            if year in years_range:
                #print(f" YR range={years_range} ", end=" ") 
                self.latest_amount*=(1+self.yearly_growth_set[years_range]/100)
                return self.latest_amount
        return self.latest_amount


def test():
    #from year 1 until 15th, increase 5% each year  
     #from year 16th until 19th,increase 3% each year 
     #from year 20th until 22th,stagnant
     #from year 23th onwards, no more income
    gas1 = GrowthAmount("Rental Income", 3000,{ range(1,16):5.0,range(16,20):3.0, range(20,23):0.0})
    gas2 = GrowthAmount("Selling", 100000,{ range(23,24):0.0})
    gass = [gas1,gas2]

    for gas in gass:
        for yr in range(1,30):
            income=gas.growth(yr)
            if(income>0):
                print(f"{gas.name}:{yr}={gas.latest_amount}")

#test()