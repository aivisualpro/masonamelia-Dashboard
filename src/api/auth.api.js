import axios from "axios";

export const createAccount = async (data) => {
    const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/register`,
        data,
    );
    return res.data;
}

export const loginAccount = async (data) => {
    const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/login`,
        data,
        { timeout: 15000 }
    );
    return res.data;
}