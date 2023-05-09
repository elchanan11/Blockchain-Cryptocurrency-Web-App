import { createSlice } from '@reduxjs/toolkit'

export const knownAddressesSlice = createSlice({
    name: 'knownAddresses',
    initialState: {
        knownAddresses: null,
        isFetching: false,
        error: false
    },
    reducers: {
        knownAddressesStart: (state)=>{
            state.isFetching = true
        },
        knownAddressesSuccess: (state, action)=>{
            state.isFetching = false;
            state.knownAddresses = action.payload
        },
        knownAddressesFailure: (state)=>{
            state.isFetching = false;
            state.error = true
        },
        resetAddresses: (state)=>{
            state.isFetching = false;
            state.knownAddresses = null
        },
    },
})

// Action creators are generated for each case reducer function
export const { knownAddressesStart, knownAddressesSuccess, knownAddressesFailure, resetAddresses } = knownAddressesSlice.actions

export default knownAddressesSlice.reducer