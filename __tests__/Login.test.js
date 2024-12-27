import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react-native";
import Login from "../screens/Login";
import SecureStore from "expo-secure-store";
import axios from "axios";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";

jest.useFakeTimers();

jest.mock("axios");
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockedNavigate = jest.fn();
const mockedHandleAuthenticate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockedNavigate,
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      id: "123",
    },
  }),
}));

jest.mock("react-native-paper", () => ({
  ...jest.requireActual("react-native-paper"),
  useTheme: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn().mockImplementation(({ children }) => children),
    SafeAreaConsumer: jest
      .fn()
      .mockImplementation(({ children }) => children(inset)),
    useSafeAreaInsets: jest.fn().mockImplementation(() => inset),
  };
});

describe("Login", () => {
  beforeEach(() => {
    useTheme.mockReturnValue({ colors: { primary: "blue" } });
    jest.clearAllMocks();
  });

  it("should render the login screen", () => {
    render(<Login handleAuthenticate={mockedHandleAuthenticate} />, {
      wrapper: SafeAreaProvider,
    });

    expect(screen.getByLabelText("email")).toBeTruthy();
    expect(screen.getByLabelText("password")).toBeTruthy();
    expect(screen.getByText("Log In")).toBeTruthy();
    expect(screen.getByText("Don't have an account? Register")).toBeTruthy();

    cleanup();
  });

  it("should show an error message if the user tries to login without filling the email and password", async () => {
    render(<Login handleAuthenticate={mockedHandleAuthenticate} />, {
      wrapper: SafeAreaProvider,
    });

    fireEvent.press(screen.getByText("Log In"));

    await waitFor(() => {
      expect(screen.getByText("Email and password are required")).toBeTruthy();
    });

    cleanup();
  });

  it("should authenticate the user and store the token with SecureStore", async () => {
    const mockToken = "1234567890";
    axios.post.mockResolvedValue({ data: { token: mockToken } });

    render(<Login handleAuthenticate={mockedHandleAuthenticate} />, {
      wrapper: SafeAreaProvider,
    });

    fireEvent.changeText(screen.getByLabelText("email"), "test@example.com");
    fireEvent.changeText(screen.getByLabelText("password"), "password");
    fireEvent.press(screen.getByText("Log In"));

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("token", mockToken);
      expect(mockedHandleAuthenticate).toHaveBeenCalledWith(mockToken);
      expect(mockedNavigate).toHaveBeenCalledWith("BottomTabs");
    });

    cleanup();
  });

  it("should show an error message if the user tries to login with invalid credentials", async () => {
    const mockCredentials = {
      email: "test@example.com",
      password: "password",
    };

    axios.post.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });

    render(<Login handleAuthenticate={mockedHandleAuthenticate} />, {
      wrapper: SafeAreaProvider,
    });

    fireEvent.changeText(screen.getByLabelText("email"), mockCredentials.email);
    fireEvent.changeText(
      screen.getByLabelText("password"),
      mockCredentials.password
    );
    fireEvent.press(screen.getByText("Log In"));

    await waitFor(() => {
      expect(screen.getByText("Email or password is incorrect")).toBeTruthy();
    });

    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();

    cleanup();
  });
});
