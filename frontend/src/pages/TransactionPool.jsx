import {useEffect, useState} from "react";
import {BASE_URL, publicRequest} from "../requestMethods";
import {Link, useLocation, useNavigate} from "react-router-dom";
import Transaction from "../components/Transaction";
import {Button} from "react-bootstrap";
import io from 'socket.io-client';
import {socket} from "../socket";

const TransactionPool = () => {

  const location = useLocation()

  const navigate = useNavigate();
  const [transactionPoolMap, setTransactionPoolMap] = useState({})

  const getTransactionPoolMap = async () => {
    try {
      const res = await publicRequest.get('/transaction-pool-map')
      setTransactionPoolMap(res.data)
    } catch (e) {
      console.log(e.message)
    }
  }

  useEffect(() => {
      getTransactionPoolMap()
  },
      [])

  useEffect(() => {
      socket.emit('join-room', location.pathname)
      socket.on('transaction-mined',getTransactionPoolMap);

      return () => {
        socket.off('transaction-mined',getTransactionPoolMap);
        socket.emit('leave-room', location.pathname);
      }
  },
      [location.pathname])


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