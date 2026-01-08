import axios from "axios";

export const getLatestAircraft = async () => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/aircrafts/lists/latest`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
