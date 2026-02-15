import api from "./api";

export const statsService = {
  get: async () => {
    const { data } = await api.get("/stats");
    return data;
  },
  getDetailed: async () => {
    const { data } = await api.get("/stats/detailed");
    return data;
  },
  getPastorStats: async (zoneId: string) => {
    const { data } = await api.get(`/stats/pastor/${zoneId}`);
    return data;
  },
};
