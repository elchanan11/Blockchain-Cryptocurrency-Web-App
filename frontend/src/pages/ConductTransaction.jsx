import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import {Button, FormControl, FormGroup} from "react-bootstrap";
import {publicRequest} from "../requestMethods";
import {socket} from "../socket";
import {useDispatch, useSelector} from "react-redux";
import {getKnownAddresses} from "../redux/apiCalls";

const ConductTransaction = () => {

    const dispatch = useDispatch()
    const { knownAddresses } = useSelector((state) => state.knownAddresses)

    console.log(knownAddresses)
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState({recipient:'', amount:''})
    const [filteredAddresses, setFilteredAddresses] = useState([]);

    useEffect(() => {
        if (!knownAddresses) {
            getKnownAddresses(dispatch);
        } else {
            setFilteredAddresses(knownAddresses)
        }
    }, [knownAddresses,dispatch])

    useEffect(() => {
        if (transaction.recipient && knownAddresses) {
            setFilteredAddresses(
                knownAddresses.filter(address => address.includes(transaction.recipient) )
            )
        }
    }, [transaction.recipient])

    const updateFormAmount = (e) => {
        setTransaction({
            recipient: transaction.recipient,
            amount: Number(e.target.value)
        })
    }

    const updateFormRecipient = (e) => {
        setTransaction({
            recipient: e.target.value,
            amount: transaction.amount
        })
    }

    const conductTransaction = async () => {
        const { recipient, amount } = transaction

        try {
            const res = await publicRequest.post('/transact',{ recipient: recipient, amount: amount })
            socket.emit('transaction-pool');
            alert(res.data.type )
        }catch (e) {
            alert(e.message )
        }
        setTransaction({
            recipient: '',
            amount: ''
        })
        navigate('/transaction-pool')
    }
  
    return(
        <div className={'ConductTransaction'}>
            <Link to={'/'}>Home</Link>
            <h3>Conduct a Transaction</h3>
            <br/>
            <FormGroup>
                <FormControl
                    input={'text'}
                    placeholder={'recipient'}
                    value={transaction.recipient}
                    onChange={updateFormRecipient}
                />
            </FormGroup>
            <FormGroup>
                <FormControl
                    type='number'
                    pattern='[0-9]+'
                    placeholder={'amount'}
                    value={transaction.amount}
                    onChange={updateFormAmount}
                />
            </FormGroup>
            <div>
                <Button size={'sm'}
                        variant="danger"
                        onClick={conductTransaction}
                >
                    Submit
                </Button>
            </div>
            <hr/>
            <h4>Known Addresses</h4>
            {
                filteredAddresses &&
                filteredAddresses.map(address => {
                    return(
                        <div key={address}>
                            <div>{address}</div>
                            <br/>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default ConductTransaction