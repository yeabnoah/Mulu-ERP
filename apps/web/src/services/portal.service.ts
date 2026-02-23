import api from "./api";

export type MyMinistry = {
  id: string;
  name: string;
  description: string | null;
  role: string;
  isAdmin: boolean;
  _count: { members: number; requests?: number };
};

export type MyMinistryDetail = MyMinistry & {
  myRole: string;
};

export const portalService = {
  getMe: async (): Promise<{ userId: string; isAppAdmin: boolean; isAdmin: boolean; isPastor: boolean }> => {
    const { data } = await api.get("/portal/me");
    return data;
  },

  getUsers: async () => {
    const { data } = await api.get("/portal/users");
    return data;
  },

  getMyMinistries: async (): Promise<MyMinistry[]> => {
    const { data } = await api.get("/portal/my-ministries");
    return data;
  },

  getMyMinistry: async (ministryId: string): Promise<MyMinistryDetail> => {
    const { data } = await api.get(`/portal/my-ministries/${ministryId}`);
    return data;
  },

  getMyMinistryMembers: async (ministryId: string) => {
    const { data } = await api.get(`/portal/my-ministries/${ministryId}/members`);
    return data;
  },

  getMyMinistryStats: async (ministryId: string) => {
    const { data } = await api.get(`/portal/my-ministries/${ministryId}/stats`);
    return data;
  },

  requestJoin: async (ministryId: string, userId: string) => {
    const { data } = await api.post(`/portal/my-ministries/${ministryId}/request`, { userId });
    return data;
  },

  updateMemberRole: async (ministryId: string, userId: string, role: string) => {
    const { data } = await api.patch(`/portal/my-ministries/${ministryId}/members/${userId}`, { role });
    return data;
  },

  removeMember: async (ministryId: string, userId: string) => {
    const { data } = await api.delete(`/portal/my-ministries/${ministryId}/members/${userId}`);
    return data;
  },
};
