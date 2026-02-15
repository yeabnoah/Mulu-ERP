import api from "./api";

export const familyService = {
    getAll: async () => {
        const { data } = await api.get("/families");
        return data;
    },
    create: async (payload: { name: string; description?: string; zoneId: string }) => {
        const { data } = await api.post("/families", payload);
        return data;
    },
    update: async (id: string, payload: { name: string; description?: string; zoneId: string }) => {
        const { data } = await api.put(`/families/${id}`, payload);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/families/${id}`);
        return data;
    },
    getMembers: async (id: string) => {
        const { data } = await api.get(`/families/${id}/members`);
        return data;
    },
    addMember: async (id: string, userId: string, familyRole: string) => {
        const { data } = await api.post(`/families/${id}/members`, { userId, familyRole });
        return data;
    },
};
