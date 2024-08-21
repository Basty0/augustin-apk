import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChevronLeft,
  Moon,
  Bell,
  Lock,
  User,
  HelpCircle,
  Info,
} from "lucide-react-native";

const SettingItem = ({ icon, title, description, toggle }) => (
  <View className="flex-row items-center justify-between py-4 border-b border-gray-200">
    <View className="flex-row items-center">
      {icon}
      <View className="ml-3">
        <Text className="text-base font-semibold">{title}</Text>
        {description && (
          <Text className="text-sm text-gray-500">{description}</Text>
        )}
      </View>
    </View>
    {toggle}
  </View>
);

const ProfilPage = () => {
  const { logout, userToken } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          console.error("No token found");
          return;
        }
        const response = await axios.get(
          "https://lycee-augustin.mg/api/user/auth",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userToken]);

  if (!userData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white mt-5">
      <View className="bg-gray-100 p-4">
        <TouchableOpacity className="mb-4">
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <View className="items-center">
          <Image
            source={{
              uri: userData.photo
                ? `https://lycee-augustin.mg/user/images/${userData.photo}`
                : "https://lycee-augustin.mg/user/images/profilob.jpg",
            }}
            className="w-24 h-24 rounded-full"
          />
          <Text className="mt-2 text-xl font-bold">{`${userData.name} ${userData.prenom}`}</Text>
          <Text className="text-gray-500">{userData.email}</Text>
        </View>
      </View>

      <View className="p-4 rounded-t-2xl">
        <Text className="text-lg font-bold mb-4">Paramètres</Text>

        <SettingItem
          icon={<Bell size={24} color="#000" />}
          title="Notifications"
          description="Activé"
        />
        <SettingItem
          icon={<Lock size={24} color="#000" />}
          title="Confidentialité"
        />
        <SettingItem icon={<User size={24} color="#000" />} title="Compte" />
        <SettingItem
          icon={<HelpCircle size={24} color="#000" />}
          title="Aide"
        />
        <SettingItem icon={<Info size={24} color="#000" />} title="À propos" />
      </View>

      <TouchableOpacity
        className="m-4 bg-red-500 py-3 rounded-lg items-center"
        onPress={logout}
      >
        <Text className="text-white font-semibold">Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfilPage;
