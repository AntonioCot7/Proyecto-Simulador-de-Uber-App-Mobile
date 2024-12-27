import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from "@testing-library/react-native";
import Profile from "../screens/Profile";
import axios from "axios";
import SecureStore from "expo-secure-store";

jest.useFakeTimers();

jest.mock("axios");
jest.mock("react-native-paper", () => ({
  ...jest.requireActual("react-native-paper"),
  useTheme: jest.fn(),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
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

const mockedNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockedNavigate,
    dispatch: jest.fn(),
  }),
}));

describe("Profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch user info and render profile correctly", async () => {
    const mockedUserData = {
      firstName: "John",
      lastName: "Doe",
      trips: 101112,
      avgRating: 4.5,
    };

    axios.get.mockResolvedValue({ data: mockedUserData });
    
    render(<Profile />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText("101112")).toBeTruthy();
    expect(screen.getByText("4.5")).toBeTruthy();
  });

  it("should log out when pressing the log out button", async () => {
    const mockedUserData = {
      firstName: "John",
      lastName: "Doe",
      trips: 101112,
      avgRating: 4.5,
    };

    axios.get.mockResolvedValue({ data: mockedUserData });
    
    render(<Profile />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    fireEvent.press(screen.getByText("Cerrar sesión"));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("Login");
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("token");
    });
  });
});
