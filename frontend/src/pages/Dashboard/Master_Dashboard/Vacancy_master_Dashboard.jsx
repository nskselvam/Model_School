import React from 'react'
import { useGetDistrictMasterDataQuery,useGetVacancyDataQuery } from '../../../redux-slice/vacancyApiSlice'

const Vacancy_master_Dashboard = () => {
 
    const { data: districtMasterData, isLoading: isDistrictMasterDataLoading, error: districtMasterDataError } = useGetDistrictMasterDataQuery();
    const { data: vacancyData, isLoading: isVacancyDataLoading, error: vacancyDataError } = useGetVacancyDataQuery();

    console.log("District Master Data:", vacancyDataError);
    console.log("Vacancy Data:", vacancyData);

  return (
    <div>
      hello world
    </div>
  )
}

export default Vacancy_master_Dashboard
