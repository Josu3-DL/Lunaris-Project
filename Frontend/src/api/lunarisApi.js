import axios from "axios";

export const lunarisaApi = axios.create({
    baseURL: 'http://localhost:8000', 
});

lunarisaApi.interceptors.request.use( config => {

    const accessToken = localStorage.getItem('access');

    if (accessToken) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${ accessToken }`
        }
    }

    return config;
}); 

