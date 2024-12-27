import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import axios from "axios";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ActivityScreen from "../screens/ActivityScreen";
import SecureStore from "expo-secure-store";
import expect from "expect";

jest.useFakeTimers();

jest.mock("axios");
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
    useRoute: () => ({
      params: {
        id: "123",
      },
    }),

  };
});

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

const mockData = {
  content: [
    {
      id: 1,
      originName: "Jirón de la Unión 1030, Cercado de Lima 15001, Peru",
      destinationName: "Ca. Las Begonias 415, San Isidro 15073, Peru",
      arrivalDate: "2023-06-01T10:00:00",
      price: 25.5,
      departureDate: "2023-06-01T09:30:00",
      category: "BLACK",
    },
    {
      id: 2,
      originName: "Av. Javier Prado Este 4200, Santiago de Surco 15023, Peru",
      destinationName: "La Molina 15026, Peru",
      arrivalDate: "2023-06-01T11:00:00",
      price: 30.0,
      departureDate: "2023-06-01T10:15:00",
      category: "X",
    },
    {
      id: 3,
      originName: "Av. Arequipa 1234, Lima 15046, Peru",
      destinationName: "Jirón de la Separación 1050, Cercado de Lima 15001, Peru",
      arrivalDate: "2023-06-01T12:00:00",
      price: 20.75,
      departureDate: "2023-06-01T11:40:00",
      category: "XL",
    },
  ],
  last: false,
};

describe("ActivityScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch and display user rides", async () => {
    console.log("Start test: should fetch and display user rides");

    SecureStore.getItemAsync.mockResolvedValue("dummy-token");
    axios.get.mockResolvedValue({ data: mockData });

    const { getByText } = render(<ActivityScreen />, {
      wrapper: SafeAreaProvider,
    });

    console.log("Component rendered");

    await waitFor(() => {
      console.log("Waiting for mocks to be called...");
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith("token");
      expect(axios.get).toHaveBeenCalledTimes(1);
    }, { timeout: 2000 });

    console.log("Mocks called successfully");

    expect(
        getByText("Jirón de la Unión 1030, Cercado de Lima 15001, Peru")
    ).toBeTruthy();
    expect(
        getByText("Ca. Las Begonias 415, San Isidro 15073, Peru")
    ).toBeTruthy();
    expect(getByText("25.5")).toBeTruthy();

    expect(
        getByText("Av. Javier Prado Este 4200, Santiago de Surco 15023, Peru")
    ).toBeTruthy();
    expect(getByText("La Molina 15026, Peru")).toBeTruthy();
    expect(getByText("30")).toBeTruthy();

    expect(
        getByText("Av. Arequipa 1234, Lima 15046, Peru")
    ).toBeTruthy();
    expect(
        getByText("Jirón de la Separación 1050, Cercado de Lima 15001, Peru")
    ).toBeTruthy();
    expect(getByText("20.75")).toBeTruthy();

    console.log("Test completed successfully");
  }, 10000);
});


