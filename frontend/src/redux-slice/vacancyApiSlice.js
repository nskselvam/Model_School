import { apiSlice } from "./apiSlice";

export const vacancyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDistrictMasterData: builder.query({
      query: () => ({
        url: `/api/vacancy/get_district_master_data`,
        method: "GET",
      }),
      providesTags: ["DistrictMasterData"],
    }),

    getVacancyData: builder.query({
      query: (dcode = 'ALL') => ({
        url: `/api/vacancy/get_vacancy_data/${dcode}`,
        method: "GET",
      }),
      providesTags: ["VacancyData"],
    }),
  }),
});


export const { useGetVacancyDataQuery,useGetDistrictMasterDataQuery } = vacancyApiSlice;