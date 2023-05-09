import './index.css'
import Blocks from "./pages/Blocks";
import Home from "./pages/Home";
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import ConductTransaction from "./pages/ConductTransaction";
import TransactionPool from "./pages/TransactionPool";
import {socket} from "./socket";
import axios from "axios";
import {useEffect, useState} from "react";

const App = () => {

    const [isConnected, setIsConnected] = useState(socket.connected);
    const [fooEvents, setFooEvents] = useState([]);

    useEffect(() => {


        function onConnect() {
            console.log('connected')
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        function onFooEvent(value) {
            console.log('event')
            setFooEvents(previous => [...previous, value]);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('transaction-mined', onFooEvent);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('foo', onFooEvent);
        };
    }, []);

    return(
        <div>
            <Router  >
                <Routes>
                    <Route exact path="/" element={
                        <Home />
                    }/>
                    <Route exact path="/blocks" element={
                        <Blocks />
                    }/>
                    <Route exact path="/conduct-transaction" element={
                        <ConductTransaction />
                    }/>
                    <Route exact path="/transaction-pool" element={
                        <TransactionPool />
                    }/>
                </Routes>
            </Router>
        </div>
    )
};

export default App;