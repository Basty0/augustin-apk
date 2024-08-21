import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Button,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { Card } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  ArrowLeft,
  BadgePlus,
  Brackets,
  CopyPlus,
  Minimize2,
} from "lucide-react-native";

const CoursListPage = () => {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCours, setNewCours] = useState({
    chapitre: "",
    titre_d: "",
    titre_f: "",
    heure_d: "",
    heure_f: "",
    date: "",
  });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const route = useRoute();
  const { enseignementId } = route.params;
  const navigation = useNavigation();
  const [enseId, setEnseId] = useState(0);

  useEffect(() => {
    fetchCours();
  }, [enseignementId]);

  const fetchCours = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get(
        `https://lycee-augustin.mg/api/enseignement/${enseignementId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setCours(response.data || []); // Ensure cours is always an array
    } catch (error) {
      console.error("Error fetching cours:", error);
      setCours([]); // Set to empty array if there's an error
    } finally {
      setLoading(false);
    }
  };

  const handleAddCours = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.post(
        `https://lycee-augustin.mg/api/enseignements/${enseId}/cours`,
        { ...newCours, enseignement_id: enseId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Résultat obtenu:", response.data);
      if (response.status === 201) {
        setLoading(true);
        fetchCours();
        setModalVisible(false);
        setNewCours({
          chapitre: "",
          titre_d: "",
          titre_f: "",
          heure_d: "",
          heure_f: "",
          date: "",
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        console.error("Validation error:", error.response.data);
        Alert.alert(
          "Erreur de validation",
          "Veuillez vérifier les données saisies."
        );
      } else {
        console.error("Error adding cours:", error);
        Alert.alert(
          "Erreur",
          "Impossible d'ajouter le cours. Veuillez réessayer."
        );
      }
    }
  };

  const handleConfirmDate = (selectedDate) => {
    setDatePickerVisibility(false);
    setNewCours({
      ...newCours,
      date: selectedDate.toISOString().split("T")[0],
    });
  };

  const handleConfirmTime = (selectedTime) => {
    setTimePickerVisibility(false);
    const hours = selectedTime.getHours().toString().padStart(2, "0");
    const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
    setNewCours({ ...newCours, heure_d: `${hours}:${minutes}` });
  };

  const ListeCours = () => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-1 left-1 z-10 bg-green-300 p-2 rounded-full"
        >
          <ArrowLeft color="black" size={24} />
        </TouchableOpacity>
        <ScrollView>
          <View className="py-4 mt-6 ">
            <View className="bg-white p-6 rounded-lg mb-4 shadow-lg">
              <Image
                source={require("../../assets/eleve1.jpg")}
                className="w-full h-40 rounded-t-lg mb-4"
                resizeMode="cover"
              />
              <Text className="text-2xl font-bold text-green-900">
                Les cours
              </Text>
              <Text className="text-gray-600 mt-2">
                Découvrez tous les cours disponibles pour votre classe
              </Text>
            </View>

            {cours.map((enseignement) => (
              <View key={enseignement.id}>
                <Text className="text-xl font-bold mb-1">
                  {enseignement.matiere && enseignement.matiere.nom}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4 h-50"
                >
                  <View className="flex-row flex-wrap justify-between gap-2 my-2">
                    <TouchableOpacity
                      className="w-20 aspect-square mb-2.5  items-center text-center content-center  py-12 bg-green-900 rounded-lg shadow-md"
                      onPress={() => {
                        setEnseId(enseignement.id);
                        console.log(enseId);
                        setModalVisible(true);
                      }}
                    >
                      <BadgePlus color="white" size={30} />
                      <Text className="text-white">Nouvelle</Text>
                    </TouchableOpacity>

                    {enseignement.cours &&
                      enseignement.cours.map((item) => (
                        <View
                          key={item.id}
                          className="w-40 aspect-square mb-2.5"
                        >
                          <Card
                            className="flex-1 bg-white rounded-lg shadow-md"
                            onPress={() =>
                              navigation.navigate("CoursInfo", {
                                courId: item.id,
                              })
                            }
                          >
                            <Card.Content>
                              <Text className="font-bold text-lg">
                                {item.titre_d}
                              </Text>
                              <Text className="text-gray-600">
                                {item.chapitre}
                              </Text>
                              <Text className="text-gray-500">
                                {item.heure_d} - {item.heure_f}
                              </Text>
                              <Text className="text-gray-500">
                                {new Date(item.created_at).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}{" "}
                                {new Date(item.created_at).toLocaleTimeString(
                                  "fr-FR",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </Text>
                            </Card.Content>
                          </Card>
                        </View>
                      ))}
                  </View>
                </ScrollView>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <Card className="mb-2 bg-green-300 rounded-lg shadow-md px-4">
      <Card.Content>
        <Text className="text-lg font-bold">{item.titre_d}</Text>
        <Text>{item.chapitre}</Text>
        <Text>
          {item.heure_d} - {item.heure_f}
        </Text>
        <Text>{item.date}</Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 p-4 mt-14">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ListeCours></ListeCours>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className=" h-full w-full bg-white rounded-3xl p-4  shadow-lg">
          <View className="flex-row justify-around gap-20 ">
            <Text className="mb-4 text-center text-lg font-bold">
              Ajouter un cours
            </Text>
            <TouchableOpacity
              className="rounded-full p-3  bg-green-200 "
              onPress={() => setModalVisible(false)}
            >
              <View className="  font-bold text-center">
                <Minimize2 size={24} color={"green"} />
              </View>
            </TouchableOpacity>
          </View>

          <Text>Chapitre</Text>
          <TextInput
            className="w-full p-2 my-2 border border-gray-300 rounded-full"
            value={newCours.chapitre}
            onChangeText={(text) =>
              setNewCours({ ...newCours, chapitre: text })
            }
          />
          <Text>Titre (début)</Text>
          <TextInput
            className="w-full p-2 my-2 border border-gray-300 rounded-full"
            value={newCours.titre_d}
            onChangeText={(text) => setNewCours({ ...newCours, titre_d: text })}
          />
          <Text>Titre (fin)</Text>
          <TextInput
            className="w-full p-2 my-2 border border-gray-300 rounded-full"
            value={newCours.titre_f}
            onChangeText={(text) => setNewCours({ ...newCours, titre_f: text })}
          />
          <Text>Heure de début</Text>
          <TextInput
            className="w-full p-2 my-2 border border-gray-300 rounded-full"
            value={newCours.heure_d}
            onChangeText={(text) => setNewCours({ ...newCours, heure_d: text })}
          />
          <Text>Heure de fin</Text>
          <TextInput
            className="w-full p-2 my-2 border border-gray-300 rounded-full"
            value={newCours.heure_f}
            onChangeText={(text) => setNewCours({ ...newCours, heure_f: text })}
          />

          <View className="flex-row  gap-4 mt-3">
            <TouchableOpacity
              className="bg-green-900 rounded-full w-full py-3 px-4 mt-4"
              onPress={handleAddCours}
            >
              <Text className="text-white font-bold text-center">Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CoursListPage;
