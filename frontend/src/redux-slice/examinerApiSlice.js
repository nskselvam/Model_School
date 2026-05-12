
import { apiSlice } from "./apiSlice";
export const valuationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getExaminerResetPassword: builder.query({
            query: (data) => ({
                url: `/api/admin/all_user_data`,
                method: "GET",
                params: data,
            }),
        }),
        resetExaminerPassword: builder.mutation({
            query: (data) => ({
                url: `/api/admin/reset_user_password`,
                method: "POST",
                body: data,
            }),
        }),
        getExaminerPasswordDetails: builder.query({
            query: (data) => ({
                url: `/api/admin/all_user_data`,
                method: "GET",
                params: data,
            }),
        }),

        sendExaminerPassword: builder.mutation({
            query: (data) => ({
                url: `/api/admin/reset_user_password`,
                method: "POST",
                body: data,
            }),
        }),
        getExaminerUserDetails: builder.query({
            query: (data) => ({
                url: `/api/admin/all_user_data`,
                method: "GET",
                params: data,
            }),

        }),
        getExaminerLoginStatus: builder.query({
            query: (data) => ({
                url: `/api/admin/logged_in_users`,
                method: "GET",
                params: data,
            }),
        }),
        resetAllLoginStatus: builder.mutation({
            query: () => ({
                url: `/api/admin/reset_all_login_status`,
                method: "POST",
            }),
        }),
    }),
});
export const { useGetExaminerResetPasswordQuery, useResetExaminerPasswordMutation, useGetExaminerPasswordDetailsQuery, useSendExaminerPasswordMutation, useGetExaminerUserDetailsQuery, useGetExaminerLoginStatusQuery, useResetAllLoginStatusMutation } = valuationApiSlice;