import api from "./api";

export const ministryAdminService = {
  // Get all ministries with admin info
  getAll: async () => {
    const { data } = await api.get("/ministries-admin");
    return data;
  },

  // Set ministry admin
  setAdmin: async (ministryId: string, userId: string, role?: string) => {
    const { data } = await api.post(`/ministries-admin/${ministryId}/admins`, {
      userId,
      role,
    });
    return data;
  },

  // Remove ministry admin
  removeAdmin: async (ministryId: string, userId: string) => {
    const { data } = await api.delete(`/ministries-admin/${ministryId}/admins/${userId}`);
    return data;
  },

  // Get pending requests
  getPendingRequests: async () => {
    const { data } = await api.get("/ministries-admin/requests");
    return data;
  },

  // Approve request
  approveRequest: async (requestId: string) => {
    const { data } = await api.post(`/ministries-admin/requests/${requestId}/approve`);
    return data;
  },

  // Reject request
  rejectRequest: async (requestId: string, notes?: string) => {
    const { data } = await api.post(`/ministries-admin/requests/${requestId}/reject`, { notes });
    return data;
  },

  // Request to join ministry
  requestJoin: async (ministryId: string, userId: string) => {
    const { data } = await api.post(`/ministries-admin/${ministryId}/request`, { userId });
    return data;
  },

  // Get ministry members
  getMembers: async (ministryId: string) => {
    const { data } = await api.get(`/ministries-admin/${ministryId}/members`);
    return data;
  },

  // Update member role
  updateMemberRole: async (ministryId: string, userId: string, role: string) => {
    const { data } = await api.patch(`/ministries-admin/${ministryId}/members/${userId}`, { role });
    return data;
  },

  // Remove member
  removeMember: async (ministryId: string, userId: string) => {
    const { data } = await api.delete(`/ministries-admin/${ministryId}/members/${userId}`);
    return data;
  },
};
