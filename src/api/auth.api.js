import axios from "axios";

export const createAccount = async (data) => {
    const res = await axios.post(
        `/api/auth/register`,
        data,
    );
    return res.data;
}

export const loginAccount = async (data) => {
    const res = await axios.post(
        `/api/auth/login`,
        data,
        { timeout: 15000 }
    );
    return res.data;
}