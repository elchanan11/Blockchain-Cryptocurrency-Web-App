import {useEffect, useState} from "react";
import {Link, useHistory} from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import {Button, FormControl, FormGroup} from "react-bootstrap";
import {publicRequest} from "../requestMethods";

const ConductTransaction = () => {
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState({recipient:'', amount:'', knownAddresses: []})

    useEffect(() => {
        const getAddresses = async () => {
            try {
                const res = await publicRequest.get('/known-addresses')
                setTransaction({
                    knownAddresses: res.data,
                    recipient: transaction.recipient,
                    amount: transaction.amount
                })
            }catch (e) {
                console.log(e)
            }
        }

        getAddresses()
    }, [])

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
            <h4>Known Addresses</h4>
            {
                transaction.knownAddresses &&
                transaction.knownAddresses.map(address => {
                    return(
                        <div key={address}>
                            <div>{address}</div>
                            <br/>
                        </div>
                    )
                })
            }
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
        </div>
    )
}

export default ConductTransaction