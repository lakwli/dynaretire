def get_rate_fix(from_year, to_year, rate):
    rates = []
    for index in range(0,to_year-from_year): 
        rates.append(rate)
    return rates


def getsnp_500_fix(from_year, to_year):
    snp_500_return = [

        [1981, -9.73],
        [1982, 14.76],
        [1983, 17.27],
        [1984, 1.40],
        [1985, 26.33],
        [1986, 14.62],
        [1987, 2.03],
        [1988, 12.40],
        [1989, 27.25],
        [1990, -6.56],

        [1991, 26.31],
        [1992, 4.46],
        [1993, 7.06],
        [1994, -1.54],
        [1995, 34.11],
        [1996, 20.26],
        [1997, 31.01],
        [1998, 26.67],
        [1999, 19.53],
        [2000, -10.14],

        [2001, -13.04],
        [2002, -23.37],
        [2003, 26.38],
        [2004, 8.99],
        [2005, 3.00],
        [2006, 13.62],
        [2007, 3.53],
        [2008, -38.49],
        [2009, 23.45],
        [2010, 12.78],
        [2011, 0],
        [2012, 13.41],
        [2013, 29.60],
        [2014, 11.39],
        [2015, -0.73],
        [2016, 9.54],
        [2017, 19.42],
        [2018, -6.24],
        [2019, 28.88],
        [2020, 16.26],
        [2021, 26.89],
        [2022, -19.44],
        [2023, 24.23],
        [2024, 7.5],
    ]
    to_return = []
    for theyear in snp_500_return:
        if(theyear[0] >= from_year and theyear[0] <= to_year):
            to_return.append(theyear[1]/100)
    return to_return

class InvestReturnDataProvider:
    def get_return (year):
        pass

class BasicReturn(InvestReturnDataProvider):    
    def __init__(self, default_return):
        self.default_return = default_return

    def get_return (self, year):
        return self.default_return
    
    
    def set_default_return (self, default_return):
        self.default_return = default_return

class OwnReturn(BasicReturn):    
    def __init__(self, own_returns:dict[int:float],default_return):
        super().__init__(default_return)
        self.own_returns = own_returns

    def get_return (self, year):
        if year not in self.own_returns:
            return self.default_return
        return self.own_returns[year]
    
    def get_data(self):
        return self.own_returns
            
class StockReturn(OwnReturn):
    snp5001 = {
        1981:-9.73, 
        1982:14.76,
        1983:17.27,
        1984:1.40,
        1985:26.33,
        1986:14.62,
        1987:2.03,
        1988:12.40,
        1989:27.25,
        1990:-6.56,

        1991:26.31,
        1992:4.46,
        1993:7.06,
        1994:-1.54,
        1995:34.11,
        1996:20.26,
        1997:31.01,
        1998:26.67,
        1999:19.53,
        2000:-10.14,

        2001:-13.04,
        2002:-23.37,
        2003:26.38,
        2004:8.99,
        2005:3.00,
        2006:13.62,
        2007:3.53,
        2008:-38.49,
        2009:23.45,
        2010:12.78,
        2011:0,
        2012:13.41,
        2013:29.60,
        2014:11.39,
        2015:-0.73,
        2016:9.54,
        2017:19.42,
        2018:-6.24,
        2019:28.88,
        2020:16.26,
        2021:26.89,
        2022:-19.44,
        2023:24.23,
        2024:7.5,
    }  
    def __init__(self):
        super().__init__(self.snp5001, 9)
    def __init__(self, default_rate):
        super().__init__(self.snp5001, default_rate)

#stockReturn = StockReturn()
#print(stockReturn.get_return(1981))