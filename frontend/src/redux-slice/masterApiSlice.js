import { apiSlice } from "./apiSlice";

export const masterApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMasterData: builder.query({
      query: () => ({
        url: `/api/master/get_district_master_data`,
        method: "GET",
      }),
      providesTags: ["MasterData"],
    }),
  }),
});

export const { useGetMasterDataQuery } = masterApiSlice;
