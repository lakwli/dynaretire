from core import data as dt

def cal_annual_return(returns:list[float], end_num):
    total_return=1
    count =0
    for r in returns:
        if count == end_num:
            break
        total_return*=(1+r/100)
        count+=1
    annual_return = (total_return**(1/end_num)-1)*100
    return annual_return


def cal_annual_return_year(returns:dict[int,float], year_start, year_end):
    total_return=1
    for year in returns:
        if year in range(year_start,year_end+1):            
            #print(f"{year}-{returns[year]},",end="")
            total_return*=(1+returns[year]/100)
    annual_return = (total_return**(1/(year_end-year_start+1))-1)*100      
    #print(f"\n total {(year_end-year_start+1)}")
    return annual_return

def test():
    sr = dt.StockReturn()
    returns=sr.get_data()
    answer = cal_annual_return_year(returns, 2000,2010)
    print(answer)


    print(cal_annual_return([-10.14,-13.04,-23.37,26.38,8.99,3.0,13.62,3.53,-38.49,23.45,12.78],11))
