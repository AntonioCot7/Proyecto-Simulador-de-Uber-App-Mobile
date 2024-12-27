import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, Button } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store"; 

const Profile = () => {
    const navigation = useNavigation();
    const [userData, setUserData] = useState({});

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get("https://your-api.com/user");
                setUserData(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync("token"); 
            navigation.navigate("Login");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <SafeAreaView>
            <View>
                {userData && (
                    <>
                        <Text>{`${userData.firstName} ${userData.lastName}`}</Text>
                        <Text>Trips:</Text>
                        <Text>{userData.trips}</Text>
                        <Text>Avg Rating:</Text>
                        <Text>{userData.avgRating}</Text>
                        <Button title="Cerrar sesión" onPress={handleLogout} />
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

export default Profile;