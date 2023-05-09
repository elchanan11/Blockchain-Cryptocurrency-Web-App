import {loginFailure, loginStart, loginSuccess} from "./walletRedux";
import {publicRequest} from "../requestMethods";

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