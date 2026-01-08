import axios from "axios";

/* ------------------- GET ---------------------- */
export const getReviewsLists = async () => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/reviews/lists`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const getReviewById = async (id) => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/reviews/lists/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

/* ------------------- POST ---------------------- */
export const createReview = async (data) => {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/reviews`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

/* ------------------- PUT ---------------------- */
export const updateReview = async (id, data) => {
    try {
        const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/reviews/update/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

/* ------------------- DELETE ---------------------- */
export const deleteReview = async (id) => {
    try {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/reviews/delete/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const deleteReviewsByBulk = async (ids) => {
    try {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/reviews/bulkDelete`, { ids });
        return response.data;
    } catch (error) {
        console.log(error);
    }
}


