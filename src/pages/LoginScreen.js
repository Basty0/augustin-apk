import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setIsAuthenticated } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false); // État pour le chargement

  const handleLogin = async () => {
    setIsLoading(true); // Démarrer le chargement
    try {
      const response = await axios.post("https://lycee-augustin.mg/api/login", {
        email: email,
        password: password,
      });
      if (response.status === 200) {
        await AsyncStorage.setItem("userToken", response.data.token);
        Alert.alert("Connexion réussie", "Vous êtes maintenant connecté!");
        setIsAuthenticated(true); // Mettre à jour l'état de connexion
      }
    } catch (error) {
      Alert.alert(
        "Erreur de connexion",
        "Veuillez vérifier vos identifiants et réessayer."
      );
    } finally {
      setIsLoading(false); // Arrêter le chargement
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-5">
      <Image
        source={require("../../assets/logo.png")}
        className="w-40 h-40 mb-5"
      />
      <View className="w-full">
        <Text className="text-2xl mb-5">Connexion</Text>
        <TextInput
          className="w-full h-14 bg-gray-200 rounded-2xl px-3 mb-3"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          className="w-full h-14 bg-gray-200 rounded-2xl px-3 mb-3"
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          className="bg-green-900 rounded-2xl w-full py-4 px-4 mt-4"
          onPress={handleLogin}
          disabled={isLoading} // Désactiver le bouton si isLoading est true
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" /> // Afficher l'indicateur de chargement
          ) : (
            <Text className="text-white font-bold text-center">
              Se connecter
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
