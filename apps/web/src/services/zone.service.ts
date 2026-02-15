import api from "./api";

export const zoneService = {
    getAll: async () => {
        const { data } = await api.get("/zones");
        return data;
    },
    create: async (payload: { name: string; description?: string; pastorId: string }) => {
        const { data } = await api.post("/zones", payload);
        return data;
    },
    update: async (id: string, payload: { name: string; description?: string; pastorId: string }) => {
        const { data } = await api.put(`/zones/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/zones/${id}`);
        return data;
    },
    getMembers: async (id: string) => {
        const { data } = await api.get(`/zones/${id}/members`);
        return data;
    },
    addMember: async (id: string, userId: string) => {
        const { data } = await api.post(`/zones/${id}/members`, { userId });
        return data;
    },
};
