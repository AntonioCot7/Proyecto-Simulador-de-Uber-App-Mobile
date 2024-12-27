import React, { useEffect, useState, useCallback } from "react";
import { Text, StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const ActivityScreen = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRides = useCallback(async () => {
        try {
            const token = await SecureStore.getItemAsync("token");
            if (token) {
                const response = await axios.get("/ride/user", {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 1000,
                });
                if (response.data && response.data.content) {
                    setRides(response.data.content);
                }
            }
        } catch (error) {
            console.error("Error fetching user rides: ", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadRides = async () => {
            await fetchRides();
        };
        loadRides().then(() => {
            // Any additional logic you want to perform after fetching rides can be placed here
            console.log("Rides fetched and component updated");
        });
    }, [fetchRides]);

    const renderItem = ({ item }) => (
        <View style={styles.rideContainer}>
            <Text>{item.originName}</Text>
            <Text>{item.destinationName}</Text>
            <Text>{item.price}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={rides}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    rideContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
});

export default ActivityScreen;
