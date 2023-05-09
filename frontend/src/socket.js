import {io} from 'socket.io-client';
import {BASE_URL} from "./requestMethods";

// "undefined" means the URL will be computed from the `window.location` object
export const socket = io('http://localhost:8080');