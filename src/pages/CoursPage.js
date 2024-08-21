import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Card } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Presentation } from "lucide-react-native";
import BottomTabs from "../components/tabs";

const CoursPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchClasses = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found");
        return;
      } else {
        console.log("Token found:", token);
      }
      const response = await axios.get(
        "https://lycee-augustin.mg/api/classes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClasses();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 p-4 mt-6">
      <View className="flex-row bg-white p-3 rounded-lg shadow-md">
        <View className="flex-row justify-between ">
          <Image
            className="rounded-lg me-2"
            source={require("../../assets/eleve4.jpg")}
            style={{ width: 150, height: 120, marginRight: 8 }}
          />
          <View>
            <Text className="text-2xl text-green-900 font-bold">Classes</Text>
            <Text className="text-gray-700">Voici la liste de vos classes</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row flex-wrap justify-between mt-3">
          {classes.map((item, index) => {
            return (
              <Card
                key={index}
                className="bg-green-100  rounded-lg shadow-xl py-4 mb-4  w-[48%]"
                onPress={() =>
                  navigation.navigate("CoursList", { enseignementId: item.id })
                }
              >
                <Card.Content>
                  <View className="flex-row items-center gap-2">
                    <View className=" bg-green-900 p-3 rounded-lg ">
                      <Presentation color="white" size={24} />
                    </View>

                    <Text className="text-xl font-bold mb-2 ">{item.nom}</Text>
                  </View>

                  <Text>Matière: {item.nom}</Text>
                </Card.Content>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default CoursPage;
