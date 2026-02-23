import api from "./api";

export const userService = {
    getAll: async (zoneId?: string) => {
        const url = zoneId ? `/users?zoneId=${zoneId}` : "/users";
        const { data } = await api.get(url);
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
    update: async (id: string, payload: any) => {
        const { data } = await api.patch(`/users/${id}`, payload);
        return data;
    },
    updateRoles: async (id: string, roleIds: string[]) => {
        const { data } = await api.post(`/users/${id}/roles`, { roleIds });
        return data;
    },
    promoteToPastor: async (id: string, zoneId: string, roleIds: string[]) => {
        const { data } = await api.post(`/users/${id}/promote-to-pastor`, { zoneId, roleIds });
        return data;
    },
    updateZone: async (id: string, zoneId: string | null) => {
        const { data } = await api.patch(`/users/${id}/zone`, { zoneId });
        return data;
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/users/${id}`);
        return data;
    },
    setPassword: async (userId: string, newPassword: string) => {
        const { data } = await api.post("/users/set-password", { userId, newPassword });
        return data;
    },
    // Bulk operations
    bulkDelete: async (ids: string[]) => {
        const { data } = await api.post("/users/bulk-delete", { ids });
        return data;
    },
    bulkPromoteToPastor: async (ids: string[], zoneId: string) => {
        const { data } = await api.post("/users/bulk-promote-to-pastor", { ids, zoneId });
        return data;
    },
    bulkUpdateRoles: async (ids: string[], roleIds: string[]) => {
        const { data } = await api.post("/users/bulk-update-roles", { ids, roleIds });
        return data;
    },
};
