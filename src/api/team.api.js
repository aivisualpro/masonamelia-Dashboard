import axios from "axios";

/* ------------------- GET ---------------------- */
export const getTeamLists = async () => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/teams/lists`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const getTeamById = async (id) => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/teams/lists/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

/* ------------------- POST ---------------------- */
export const createTeam = async (formData) => {
    try {
        const response = await axios.post(`
        ${process.env.NEXT_PUBLIC_API_URL || ""}/api/teams`,
            formData,
            { headers: { "Content-type": "multipart/formdata" } }
        );
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

/* ------------------- PUT ---------------------- */
export const updateTeam = async (id, formData) => {
    try {
        const response = await axios.put(`
        ${process.env.NEXT_PUBLIC_API_URL || ""}/api/teams/update/${id}`,
            formData,
            { headers: { "Content-type": "multipart/formdata" } }
        );
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

/* ------------------- DELETE ---------------------- */
export const deleteTeam = async (id) => {
    try {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/teams/delete/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const deleteTeamsByBulk = async (ids) => {
    try {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/teams/bulkDelete`, { ids });
        return response.data;
    } catch (error) {
        console.log(error);
    }
}