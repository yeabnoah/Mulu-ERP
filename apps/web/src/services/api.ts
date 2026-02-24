import { env } from "@muluerp/env/web";
import axios from "axios";

const api = axios.create({
    baseURL: `${env.NEXT_PUBLIC_SERVER_URL}/api`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
