import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { BarCodeScanner } from "expo-barcode-scanner";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Audio } from "expo-av";
import { Animated } from "react-native";
import { ScanLine } from "lucide-react-native";

export default function Presences() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const [presences, setPresences] = useState([]);
  const [coursPresences, setCoursPresences] = useState([]);
  const [classePresences, setClassePresences] = useState([]);
  const [appelleCounters, setAppelleCounters] = useState(0);
  const { coursId } = route.params;
  const [loading, setLoading] = useState(true);
  const [successSound, setSuccessSound] = useState(null);
  const [errorSound, setErrorSound] = useState(null);

  const [notif, setNotif] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const requestPermissionsAndFetchData = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === "granted");

        await fetchAllPresences();
      };

      requestPermissionsAndFetchData();
    }, [coursId])
  );

  useEffect(() => {
    loadSounds();
  }, []);

  const loadSounds = async () => {
    const { sound: success } = await Audio.Sound.createAsync(
      require("../../assets/sounds/ok.wav")
    );
    const { sound: error } = await Audio.Sound.createAsync(
      require("../../assets/sounds/ok2.wav")
    );
    setSuccessSound(success);
    setErrorSound(error);
  };

  const playSuccessSound = async () => {
    if (successSound) {
      await successSound.replayAsync(); // Utilisez replayAsync pour rejouer le son
      console.log("Success sound played successfully");
    }
  };

  const playErrorSound = async () => {
    if (errorSound) {
      await errorSound.replayAsync(); // Utilisez replayAsync pour rejouer le son
      console.log("Error sound played successfully");
    }
  };

  const fetchAllPresences = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found");
        return;
      } else {
        console.log("Token found:", token);
      }

      const courResponse = await axios.get(
        `https://lycee-augustin.mg/api/cour/courspresence/${coursId}/eleves`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Cours eleve=>", courResponse.data);
      setCoursPresences(courResponse.data);

      const classeResponse = await axios.get(
        `https://lycee-augustin.mg/api/cour/presence/${coursId}/eleves`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Classe Eleve =>", classeResponse.data.length);
      setClassePresences(classeResponse.data);

      if (courResponse.data.length > 0) {
        setPresences(courResponse.data);
        console.log("cour value");
      } else {
        setPresences(classeResponse.data);
        console.log(
          "Classes value",
          presences,
          classeResponse.data,
          courResponse.data
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateEleveStatus = (eleve_id) => {
    const eleveExists = presences.some(
      (student) => student.eleve_id === parseInt(eleve_id)
    );

    if (eleveExists) {
      const updatedData = presences.map((student) => {
        if (student.eleve_id === parseInt(eleve_id)) {
          return {
            ...student,
            status: "present",
          };
        }
        return student;
      });
      console.log(updatedData);
      setPresences(updatedData);
      playSuccessSound();
      setNotif(1);
    } else {
      playErrorSound();
      setNotif(2);
    }
  };

  const enregistrerPresences = async () => {
    try {
      const response = await axios.put(
        `https://lycee-augustin.mg/api/cour/presence/${coursId}`,
        {
          presences: presences.map((p) => ({
            eleve_id: p.eleve_id,
            status: p.status,
          })),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Présences enregistrées avec succès:", response.data);
      navigation.goBack();
      playSuccessSound();
    } catch (error) {
      if (error.response) {
        console.error(
          "Erreur serveur:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        console.error("Pas de réponse du serveur:", error.request);
      } else {
        console.error("Erreur:", error.message);
      }
      playErrorSound();
    }
  };

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    Alert.alert(
      "Scan terminé",
      "Voulez-vous scanner encore ?",
      [
        { text: "Oui", onPress: () => setScanned(false) },
        { text: "Non", style: "cancel" },
      ],
      { cancelable: false }
    );
    updateEleveStatus(data);
  };

  const Notification = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, [notif]);

    if (notif === 1) {
      return (
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="flex-1 items-center justify-center w-full rounded-xl bg-green-300"
        >
          <Text className="text-base text-center">
            Présence enregistrée avec succès ✅
          </Text>
        </Animated.View>
      );
    } else if (notif === 2) {
      return (
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="flex-1 items-center justify-center w-full rounded-xl bg-red-300"
        >
          <Text className="text-base text-center">
            L'élève n'est pas dans cette classe ❌.
          </Text>
        </Animated.View>
      );
    } else {
      return null;
    }
  };

  const renderCamera = () => {
    return (
      <View>
        <BarCodeScanner
          style={{ width: "100%", aspectRatio: 1 }}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          className="flex-1"
        />
      </View>
    );
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center ">
        <Text className="text-base text-center">
          Permission de la caméra non accordée
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 items-center mt-16 ">
      {renderCamera()}

      <View className="absolute top-6 left-0 right-0 bottom-0">
        <View className="h-14 w-full px-2">
          <Notification />
        </View>
      </View>

      <View className=" absolute bottom-0 left-0 right-0 bg-white p-5 items-center">
        <Text className="text-base mb-10">
          Scannez un code-barres pour commencer votre travail.
        </Text>

        <TouchableOpacity
          className={` bg-green-900 border border-green-900 px-5 py-3 rounded-xl w-60 justify-center flexe-row items-center ${
            !scanned ? "opacity-50" : ""
          }`}
          onPress={() => setScanned(false)}
          disabled={!scanned}
        >
          <View>
            <ScanLine color={"white"} size={24} />
          </View>
          <View>
            <Text className="text-green-50 text-base font-bold  items-center">
              Scanner le QR
            </Text>
          </View>
        </TouchableOpacity>
        <View className="flex-row justify-center space-x-5">
          <TouchableOpacity
            className="bg-green-700 p-3 rounded-lg items-center justify-center my-4"
            onPress={enregistrerPresences}
          >
            <Text className="text-white text-sm font-bold">Terminer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-700 p-3 rounded-lg items-center justify-center my-4"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white text-sm font-bold">Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
