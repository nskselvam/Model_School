import {apiSlice} from "./apiSlice";

export const GeneralGetSqlOperationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRegulationData: builder.query({
      query: () => ({
        url: "/api/general/regulation-data",
        method: "GET",
      }),
    }),
      getCenterData: builder.query({
        query: () => ({
          url: "/api/general/center-data",
          method: "GET",
        }),
      }),
  }),
});

export const {useGetRegulationDataQuery, useGetCenterDataQuery} = GeneralGetSqlOperationApiSlice;