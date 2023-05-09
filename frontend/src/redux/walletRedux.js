import { createSlice } from '@reduxjs/toolkit'

export const walletSlice = createSlice({
    name: 'wallet',
    initialState: {
        currentWallet: null,
        isFetching: false,
        error: false
    },
    reducers: {
        loginStart: (state)=>{
            state.isFetching = true
        },
        loginSuccess: (state, action)=>{
            state.isFetching = false;
            state.currentWallet = action.payload
        },
        loginFailure: (state)=>{
            state.isFetching = false;
            state.error = true
        },
        logOut: (state)=>{
            state.currentWallet = null
            state.isFetching = false;
            state.error = false

        },
    },
})

// Action creators are generated for each case reducer function
export const { loginStart, loginSuccess, loginFailure,logOut } = walletSlice.actions

export default walletSlice.reducer