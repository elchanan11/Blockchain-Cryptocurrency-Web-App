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
        socket.on('connect', onConnect);

        return () => {
            socket.off('connect', onConnect);
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