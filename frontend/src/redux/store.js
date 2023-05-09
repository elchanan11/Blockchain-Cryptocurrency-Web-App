import { configureStore } from '@reduxjs/toolkit'
import walletReducer from './walletRedux'
import knownAddresses from './knownAddressesRedux'

export default configureStore({
    reducer: {
        wallet: walletReducer,
        knownAddresses: knownAddresses
    },
})