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
      query: (data) => ({
        url: `/api/vacancy/get_vacancy_data`,
        method: "GET",
        body: data,
      }),
      invalidatesTags: ["VacancyData"],
    }),
  }),
});


export const { useGetVacancyDataQuery,useGetDistrictMasterDataQuery } = vacancyApiSlice;