import axios from "axios";

export const lunarisaApi = axios.create({
    baseURL: 'http://localhost:8000', 
});
