import api from "./api";

export const ministryService = {
    getAll: async () => {
        const { data } = await api.get("/ministries");
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/ministries/${id}`);
        return data;
    },
    create: async (payload: { name: string; description?: string }) => {
        const { data } = await api.post("/ministries", payload);
        return data;
    },
    update: async (id: string, payload: { name: string; description?: string }) => {
        const { data } = await api.put(`/ministries/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/ministries/${id}`);
        return data;
    },
    getMembers: async (id: string) => {
        const { data } = await api.get(`/ministries/${id}/members`);
        return data;
    },
    addMember: async (id: string, userId: string) => {
        const { data } = await api.post(`/ministries/${id}/members`, { userId });
        return data;
    },
    removeMember: async (id: string, userId: string) => {
        const { data } = await api.delete(`/ministries/${id}/members/${userId}`);
        return data;
    },
};
