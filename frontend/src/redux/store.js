import { configureStore } from '@reduxjs/toolkit'
import walletReducer from './walletRedux'

export default configureStore({
    reducer: {
        wallet: walletReducer,
    },
})