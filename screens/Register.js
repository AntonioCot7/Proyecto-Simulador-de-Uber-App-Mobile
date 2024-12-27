import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Snackbar } from "react-native-paper";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const Register = () => {
    const navigation = useNavigation();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [errorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password || !phone) {
            setErrorMessage("All fields are required");
            setErrorVisible(true);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || password.length < 6) {
            setErrorMessage("Enter a valid email and password");
            setErrorVisible(true);
            return;
        }

        try {
            await axios.post("your-api-endpoint", { firstName, lastName, email, password, phone });

            navigation.navigate("Login");
        } catch (error) {
            setErrorMessage("Something went wrong");
            setErrorVisible(true);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.form}>
                <TextInput
                    label="First Name"
                    value={firstName}
                    onChangeText={text => setFirstName(text)}
                    accessibilityLabel="first-name"
                    style={styles.input}
                />
                <TextInput
                    label="Last Name"
                    value={lastName}
                    onChangeText={text => setLastName(text)}
                    accessibilityLabel="last-name"
                    style={styles.input}
                />
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={text => setEmail(text)}
                    accessibilityLabel="email"
                    style={styles.input}
                />
                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={text => setPassword(text)}
                    accessibilityLabel="password"
                    secureTextEntry
                    style={styles.input}
                />
                <TextInput
                    label="Phone"
                    value={phone}
                    onChangeText={text => setPhone(text)}
                    accessibilityLabel="phone"
                    style={styles.input}
                />
                <Button mode="contained" onPress={handleRegister} accessibilityLabel="Register">
                    Register
                </Button>
            </View>
            <Snackbar visible={errorVisible} onDismiss={() => setErrorVisible(false)} duration={4000}>
                {errorMessage}
            </Snackbar>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    form: {
        width: "100%",
        maxWidth: 400,
    },
    input: {
        marginBottom: 12,
    },
});

export default Register;
