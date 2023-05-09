import {loginFailure, loginStart, loginSuccess} from "./walletRedux";
import {publicRequest} from "../requestMethods";
import {knownAddressesFailure, knownAddressesStart, knownAddressesSuccess} from "./knownAddressesRedux";

export const wallet = async (dispatch) => {
    dispatch(loginStart())
    try {
        const res = await publicRequest.get("/wallet/info")
        dispatch(loginSuccess(res.data))
    }catch (e) {
        dispatch(loginFailure())
        console.log(e)
    }
}

export const getKnownAddresses = async (dispatch) => {
    dispatch(knownAddressesStart())
    try {
        const res = await publicRequest.get("/known-addresses")
        dispatch(knownAddressesSuccess(res.data))
    }catch (e) {
        dispatch(knownAddressesFailure())
        console.log(e)
    }
}