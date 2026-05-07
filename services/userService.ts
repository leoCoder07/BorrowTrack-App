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
 // Register a new user
 register: async (
  username: string,
  email: string,
  password: string,
 ): Promise<User> => {
  const users = await userService.getAllUsers();

  // Check if username already exists
  const usernameExists = users.find((u) => u.username === username);
  if (usernameExists) {
   throw new Error("Username already exists");
  }

  // Check if email already exists
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

  // Auto login after registration
  await userService.setCurrentUser(newUser);

  return newUser;
 },

 // Login with username or email
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

  // Save current user
  await userService.setCurrentUser(user);

  return user;
 },

 // Get all users
 getAllUsers: async (): Promise<User[]> => {
  const usersJson = await AsyncStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
 },

 // Get current logged in user
 getCurrentUser: async (): Promise<User | null> => {
  const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
 },

 // Set current user
 setCurrentUser: async (user: User): Promise<void> => {
  await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
 },

 // Logout
 logout: async (): Promise<void> => {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
 },

 // Check if user is logged in
 isLoggedIn: async (): Promise<boolean> => {
  const user = await userService.getCurrentUser();
  return user !== null;
 },
};
