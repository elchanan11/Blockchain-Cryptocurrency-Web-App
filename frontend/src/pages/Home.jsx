
import {useEffect, useState} from "react";
import {publicRequest} from "../requestMethods";
import logo from '../assets/img.png'
import {Link} from "react-router-dom";
import ConductTransaction from "./ConductTransaction";

const Home = () => {

    const [walletInfo ,setWalletInfo] = useState({ address: '', balance: 0 })

    useEffect(() => {
        const walletData = async () => {
            try {
                const res = await publicRequest.get("/wallet/info")

                setWalletInfo({ address: res.data.address, balance: res.data.balance })
            }catch (e) {
                console.log(e)
            }
        }

        walletData()
    },[])


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
                    Address: { walletInfo.address }
                </div>
                <div>
                    Balance: { walletInfo.balance }
                </div>
            </div>
        </div>
    )
};

export default Home;