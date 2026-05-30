import api from "./api";

export const getUsers = async () => {
  const response = await api.get("/auth/users");

  return response.data;
};
