import { lunarisaApi } from "./lunarisApi"

const saveToken = (tokens) => {
    localStorage.setItem('access', tokens.accessToken)
    localStorage.setItem('refresh',tokens. refreshToken)
}

export const startRegistration = async(username, password) => {
    try {
       const {data} = lunarisaApi.post('/api/users/', { username, email, password });
       saveToken(data);

    } catch (error) {
        console.log(error);
    }
}