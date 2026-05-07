import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
 id: string;
 username: string;
 email: string;
 password: string;
}

const USERS_KEY = "@borrowtrack_users";
const CURRENT_USER_KEY = "@borrowtrack_current_user";

export const userService = {
 register: async (
  username: string,
  email: string,
  password: string,
 ): Promise<User> => {
  const users = await userService.getAllUsers();

  const usernameExists = users.find((u) => u.username === username);
  if (usernameExists) {
   throw new Error("Username already exists");
  }

  const emailExists = users.find((u) => u.email === email);
  if (emailExists) {
   throw new Error("Email already exists");
  }

  const newUser: User = {
   id: Date.now().toString(),
   username,
   email,
   password,
  };

  users.push(newUser);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

  await userService.setCurrentUser(newUser);

  return newUser;
 },

 login: async (usernameOrEmail: string, password: string): Promise<User> => {
  const users = await userService.getAllUsers();

  const user = users.find(
   (u) =>
    (u.username === usernameOrEmail || u.email === usernameOrEmail) &&
    u.password === password,
  );

  if (!user) {
   throw new Error("Invalid credentials");
  }

  await userService.setCurrentUser(user);

  return user;
 },

 getAllUsers: async (): Promise<User[]> => {
  const usersJson = await AsyncStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
 },

 getCurrentUser: async (): Promise<User | null> => {
  const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
 },

 setCurrentUser: async (user: User): Promise<void> => {
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
 },

 logout: async (): Promise<void> => {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
 },

 isLoggedIn: async (): Promise<boolean> => {
  const user = await userService.getCurrentUser();
  return user !== null;
 },
};
