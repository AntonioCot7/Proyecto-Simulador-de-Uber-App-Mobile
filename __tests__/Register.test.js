import React from "react";
import {
  render,
  fireEvent,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react-native";
import Register from "../screens/Register";
import axios from "axios";
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

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockedNavigate,
    dispatch: jest.fn(),
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

describe("Register", () => {
  beforeEach(() => {
    useTheme.mockReturnValue({ colors: { primary: "blue" } });
    jest.clearAllMocks();
  });

  it("should render the register screen", () => {
    render(<Register />, {
      wrapper: SafeAreaProvider,
    });

    expect(screen.getByLabelText("first-name")).toBeTruthy();
    expect(screen.getByLabelText("last-name")).toBeTruthy();
    expect(screen.getByLabelText("email")).toBeTruthy();
    expect(screen.getByLabelText("password")).toBeTruthy();
    expect(screen.getByLabelText("phone")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Register" })).toBeTruthy();

    cleanup();
  });

  it("should show an error message if any field is empty", async () => {
    render(<Register />, {
      wrapper: SafeAreaProvider,
    });

    fireEvent.press(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(screen.getByText("All fields are required")).toBeTruthy();
    });
  });

  it("should show an error message if email or password is invalid", async () => {
    render(<Register />, {
      wrapper: SafeAreaProvider,
    });

    fireEvent.changeText(screen.getByLabelText("first-name"), "John");
    fireEvent.changeText(screen.getByLabelText("last-name"), "Doe");
    fireEvent.changeText(screen.getByLabelText("email"), "invalid-email");
    fireEvent.changeText(screen.getByLabelText("password"), "short");
    fireEvent.changeText(screen.getByLabelText("phone"), "1234567890");
    fireEvent.press(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(screen.getByText("Enter a valid email and password")).toBeTruthy();
    });
  });

  it("should register the user and navigate to login screen on successful registration", async () => {
    axios.post.mockResolvedValue({ data: {} });

    render(<Register />, {
      wrapper: SafeAreaProvider,
    });

    fireEvent.changeText(screen.getByLabelText("first-name"), "John");
    fireEvent.changeText(screen.getByLabelText("last-name"), "Doe");
    fireEvent.changeText(
      screen.getByLabelText("email"),
      "john_doe@example.com"
    );
    fireEvent.changeText(screen.getByLabelText("password"), "password123");
    fireEvent.changeText(screen.getByLabelText("phone"), "1234567890");
    fireEvent.press(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("Login");
    });
  });

  it("should show an error message if registration fails", async () => {
    axios.post.mockRejectedValue(new Error("Something went wrong"));

    render(<Register />, {
      wrapper: SafeAreaProvider,
    });

    fireEvent.changeText(screen.getByLabelText("first-name"), "John");
    fireEvent.changeText(screen.getByLabelText("last-name"), "Doe");
    fireEvent.changeText(
      screen.getByLabelText("email"),
      "john.doe@example.com"
    );
    fireEvent.changeText(screen.getByLabelText("password"), "password123");
    fireEvent.changeText(screen.getByLabelText("phone"), "1234567890");
    fireEvent.press(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeTruthy();
    });
  });
});
