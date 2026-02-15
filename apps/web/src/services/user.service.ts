import api from "./api";

export const userService = {
    getAll: async () => {
        const { data } = await api.get("/users");
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/users/${id}`);
        return data;
    },
    create: async (payload: any) => {
        const { data } = await api.post("/users", payload);
        return data;
    },
    updateRoles: async (id: string, roleIds: string[]) => {
        const { data } = await api.post(`/users/${id}/roles`, { roleIds });
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/users/${id}`);
        return data;
    },
};
