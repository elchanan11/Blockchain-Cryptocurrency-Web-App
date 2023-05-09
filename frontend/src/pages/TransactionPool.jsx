import {useEffect, useState} from "react";
import {BASE_URL, publicRequest} from "../requestMethods";
import {Link, useNavigate} from "react-router-dom";
import Transaction from "../components/Transaction";
import {Button} from "react-bootstrap";
import io from 'socket.io-client';
import {socket} from "../socket";

const TransactionPool = () => {


  const POLL_INTERVAL = 10000
  const navigate = useNavigate();
  const [transactionPoolMap, setTransactionPoolMap] = useState({})

  useEffect(() => {
    const getTransactionPoolMap = async () => {
      try {
        const res = await publicRequest.get('/transaction-pool-map')
        setTransactionPoolMap(res.data)
      } catch (e) {
        console.log(e.message)
      }
    }

    // Call getTransactionPoolMap initially
    getTransactionPoolMap()

    // Set a timer to call getTransactionPoolMap again after 10 seconds
    const intervalId = setInterval(() => {
      getTransactionPoolMap()
    }, 10000)

    // Clear the interval on component unmount to prevent memory leaks
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const fetchMineTransaction = async () => {
    try {
      const res = await publicRequest.get('/mine-transactions')
      if (res.status === 200) {
        socket.emit('transaction-mined');
        alert('success')
        navigate('/blocks')
      }
    }catch (e) {
      console.log(e)
      alert('The mine Transaction block request did not complete')
    }
  }

  return(
      <div className={'TransactionPool'}>
        <div><Link to={'/'}>Home</Link></div>
        <h3>Transaction Pool</h3>
        {
          Object.values(transactionPoolMap).map(transaction => {
            return(
                <div key={transaction.id}>
                  <hr/>
                  <Transaction transaction={transaction}/>
                </div>
            )
          })
        }
        <hr/>
        <Button size={'sm'}
                variant="danger"
                onClick={fetchMineTransaction}
        >
          Mine the transaction
        </Button>

      </div>
  )
}

export default TransactionPool