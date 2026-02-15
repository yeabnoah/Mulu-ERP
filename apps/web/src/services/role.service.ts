import api from "./api"

export interface Role {
    id: string
    name: string
}

export const roleService = {
    getAll: async (): Promise<Role[]> => {
        const response = await api.get("/roles")
        return response.data
    },
    create: async (name: string) => {
        const { data } = await api.post("/roles", { name })
        return data
    },
    delete: async (id: string) => {
        const { data } = await api.delete(`/roles/${id}`)
        return data
    },
}
