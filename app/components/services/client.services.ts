// import axios from 'axios';

// const axiosInstanceClient = axios.create({
//     baseURL: 'http://localhost:8080/api',
//     // baseURL: 'https://vedicbackend-4.onrender.com/api',
//     withCredentials: true
// });


// export default axiosInstanceClient;

import axios from 'axios';

const axiosInstanceClient = axios.create({
    // baseURL: 'http://localhost:8080/api',
    baseURL: 'https://vedicbackend-4.onrender.com/api',
    withCredentials: true
});

axiosInstanceClient.interceptors.request.use((config) => {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("astrologerToken")
            : null;

    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default axiosInstanceClient;