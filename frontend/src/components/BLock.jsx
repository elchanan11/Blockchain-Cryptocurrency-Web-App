import {useState} from "react";
import {Button} from "react-bootstrap";
import Transaction from "./Transaction";

const BLock = (props) => {

    const [displayTransaction, setDisplayTransaction] = useState(false)

    const { timeStamp, hash } = props.block

    const hashDisplay = `${hash.substring(0,15)}...`


    const toggleTransaction = () => {
        setDisplayTransaction(!displayTransaction)
    }

    const showTransaction = () => {

        const {  data } = props.block

        const stringifiedData = JSON.stringify(data)

        const dataDisplay = stringifiedData.length > 15 ?
            `${stringifiedData.substring(0,15)}...` :
            stringifiedData

        if (displayTransaction) {
            return (
                <div>
                    {
                        data.map((transaction) => {
                            return (
                                <div>
                                    <hr style={{borderColor:'white'}}/>
                                    <Transaction className={'Transaction'} key={transaction.id} transaction={transaction}/>
                                </div>
                            )
                        })
                    }
                    <br/>
                    <Button size={'sm'}
                            variant="danger"
                            style={{cursor: "pointer"}}
                            onClick={toggleTransaction}
                    >
                        Show Less
                    </Button>
                </div>
            )
        }

        return (
            <>
                <div> Data: { dataDisplay }</div>
                <br/>
                <Button size={'sm'}
                        variant="danger"
                        onClick={toggleTransaction}
                >
                    Show More
                </Button>
            </>
        )
    }


    return (
        <div className={'Block'}>
            <div> Hash: { hashDisplay }</div>
            <div> Timestamp: { new Date(timeStamp).toLocaleDateString() }</div>
            {showTransaction()}
        </div>
    )
}

export default BLock