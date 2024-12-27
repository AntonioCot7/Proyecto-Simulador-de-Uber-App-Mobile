import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity } from "react-native";
import { TextInput, Button } from "react-native-paper";
import SecureStore from "expo-secure-store";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const Login = ({ handleAuthenticate }) => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (username === "" || password === "") {
      setErrorMessage("Email and password are required");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post("https://your-auth-api.com/login", { username, password });
      const token = response.data.token;
      await SecureStore.setItemAsync("token", token);
      handleAuthenticate(token);
      navigation.navigate("BottomTabs"); 
    } catch (error) {
      console.log(error);
      setLoading(false);
      setErrorMessage("Email or password is incorrect");
    }
  };

  return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text style={styles.title}>Login in UBER</Text>
          {errorMessage? <Text style={styles.error}>{errorMessage}</Text> : null}
          <TextInput
              label="Email"
              value={username}
              onChangeText={text => setUsername(text)}
              accessibilityLabel="email"
              style={styles.input}
          />
          <TextInput
              label="Password"
              value={password}
              onChangeText={text => setPassword(text)}
              secureTextEntry
              accessibilityLabel="password"
              style={styles.input}
          />
          <Button mode="contained" onPress={handleLogin} loading={loading} style={styles.button}>
            Log In
          </Button>
          <Button mode="outlined" onPress={() => console.log('Signing in with Google')} style={styles.button}>
            Sign in with Google
          </Button>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  registerText: {
    color: 'blue',
    marginTop: 16,
    textAlign: 'center',
  },
  error: {
    color: 'ed',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default Login;