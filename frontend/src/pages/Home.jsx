
import {useEffect, useState} from "react";
import {publicRequest} from "../requestMethods";
import logo from '../assets/img.png'
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {wallet} from "../redux/apiCalls";

const Home = () => {

    const dispatch = useDispatch()

    const { currentWallet } = useSelector((state) => state.wallet)

    useEffect(() => {
        if (!currentWallet) {
            wallet(dispatch);
        }
    }, [currentWallet, dispatch]);

    return(
        <div className={'App'}>
            <img className={'logo'} src={logo} alt={'logo'}/>
            <br/>
            <div>
                Hello blockchain!
            </div>
            <br/>
            <div><Link to={'/blocks'}>Blocks</Link></div>
            <div><Link to={'/conduct-transaction'}>Conduct Transaction</Link></div>
            <div><Link to={'/transaction-pool'}>Transaction Pool</Link></div>
            <br/>
            <div className={'WalletInfo'}>
                <div>
                    Address: { currentWallet?.address }
                </div>
                <div>
                    Balance: { currentWallet?.balance }
                </div>
            </div>
        </div>
    )
};

export default Home;