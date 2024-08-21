import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios, { Axios } from "axios";
import {
  ArrowLeft,
  BookMarked,
  Calendar,
  Clock1,
  FilePenLine,
  LibraryBig,
} from "lucide-react-native";
import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { Card } from "react-native-paper";

const CoursInfo = () => {
  const route = useRoute();
  const [cours, setCours] = useState([]);
  const [presences, setPresences] = useState([]);
  const [presents, setPresents] = useState([]);
  const [absents, setAbsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { courId } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedCours, setUpdatedCours] = useState({
    user_id: "",
    chapitre: "",
    titre_d: "",
    titre_f: "",
    heure_d: "",
    heure_f: "",
  });

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get(
        `https://lycee-augustin.mg/api/cour/presence/cours/${courId}/eleves`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      setCours(data.cour || {});
      setPresences(data.presences || []);
      setPresents(data.present || []);
      setAbsents(data.absent || []);
      setUpdatedCours({
        user_id: data.cour.user_id,
        chapitre: data.cour.chapitre,
        titre_d: data.cour.titre_d,
        titre_f: data.cour.titre_f,
        heure_d: data.cour.heure_d,
        heure_f: data.cour.heure_f,
      });
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const updateCours = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.put(
        `https://lycee-augustin.mg/api/cour/update/${courId}`,
        updatedCours,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        console.log("Cours updated successfully");
        setLoading(true);
        fetchData();
        setModalVisible(false);
      }
    } catch (error) {
      console.error(
        "Error updating cours:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const ListePresences = ({ presences }) => {
    return (
      <View className="p-4">
        <Text className="text-xl font-bold mb-4">Présences</Text>
        {presences.map((presence) => (
          <View
            key={presence.id}
            className="bg-white p-2 mb-4 rounded-md shadow"
          >
            <Text className="font-semibold">
              {presence.eleve.nom} {presence.eleve.prenom}
            </Text>
            <Text>{presence.status}</Text>
          </View>
        ))}
      </View>
    );
  };

  const ListePresents = ({ presents }) => {
    return (
      <View className="p-4">
        <Text className="text-xl font-bold mb-2">Présents</Text>
        {presents.map((present) => (
          <View
            key={present.id}
            className="bg-green-100 p-2 mb-2 rounded-md shadow"
          >
            <Text className="font-semibold">
              {present.eleve.nom} {present.eleve.prenom}
            </Text>
            <Text>{present.status}</Text>
          </View>
        ))}
      </View>
    );
  };

  const ListeAbsents = ({ absents }) => {
    return (
      <View className="p-4">
        <Text className="text-xl font-bold mb-2">Absents</Text>
        {absents.map((absent) => (
          <View
            key={absent.id}
            className="bg-red-100 p-2 mb-2 rounded-md shadow"
          >
            <Text className="font-semibold">
              {absent.eleve.nom} {absent.eleve.prenom}
            </Text>
            <Text>{absent.status}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 mt-10">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="absolute top-1 left-1 z-10 bg-green-300 p-2 rounded-full"
      >
        <ArrowLeft color="black" size={24} />
      </TouchableOpacity>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4 mt-3">
          <Card>
            <Card.Title
              title="Cours"
              titleStyle={{ fontSize: 24, fontWeight: "bold" }}
            />
            <Card.Content>
              <View className="flex-row items-center mb-2">
                <LibraryBig color={"green"} size={36} />
                <Text className="text-lg ml-2">{cours.titre_d}</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <BookMarked color={"black"} size={18} />
                <Text className="text-lg ml-2">{cours.chapitre}</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Clock1 color={"black"} size={18} />
                <Text className="text-lg ml-2">
                  {cours.heure_d} - {cours.heure_f}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Calendar color={"black"} size={18} />
                <Text className="text-lg ml-2">
                  {new Date(cours.created_at).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </Card.Content>
          </Card>
          <View className="flex-row justify-end gap-3 mt-4">
            <TouchableOpacity
              className="border border-green-900 border-solid py-3 px-4  rounded-full"
              onPress={() => {
                navigation.navigate("Presences", { coursId: cours.id });
              }}
            >
              <Text className="text-green-900 font-semibold text-center">
                Présences
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-green-900 rounded-full py-3 px-3 "
              onPress={() => setModalVisible(true)}
            >
              <Text className="text-white  font-semibold">
                <FilePenLine size={25} color={"white"} />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <ListeAbsents absents={absents} />
        <ListePresents presents={presents} />
        <ListePresences presences={presences} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-slate-200 bg-opacity-50">
          <View className="bg-white p-5 rounded-xl w-[90%] m-2">
            <Text className="text-xl font-bold mb-4">Modifier le cours</Text>
            <TextInput
              className=" bg-gray-200 p-3 mb-4 rounded-full"
              placeholder="Chapitre"
              value={updatedCours.chapitre}
              onChangeText={(text) =>
                setUpdatedCours({ ...updatedCours, chapitre: text })
              }
            />
            <TextInput
              className="bg-gray-200 p-3 mb-4 rounded-full"
              placeholder="Titre début"
              value={updatedCours.titre_d}
              onChangeText={(text) =>
                setUpdatedCours({ ...updatedCours, titre_d: text })
              }
            />
            <TextInput
              className="bg-gray-200 p-3 mb-4 rounded-full"
              placeholder="Titre fin"
              value={updatedCours.titre_f}
              onChangeText={(text) =>
                setUpdatedCours({ ...updatedCours, titre_f: text })
              }
            />
            <TextInput
              className="bg-gray-200 p-3 mb-4 rounded-full"
              placeholder="Heure début"
              value={updatedCours.heure_d}
              onChangeText={(text) =>
                setUpdatedCours({ ...updatedCours, heure_d: text })
              }
            />
            <TextInput
              className="bg-gray-200 p-3 mb-4 rounded-full"
              placeholder="Heure fin"
              value={updatedCours.heure_f}
              onChangeText={(text) =>
                setUpdatedCours({ ...updatedCours, heure_f: text })
              }
            />
            <View className="flex-row justify-end gap-2">
              <TouchableOpacity
                className=" rounded-full p-3 border border-green-900"
                onPress={() => setModalVisible(false)}
              >
                <Text>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-900 p-3 rounded-full"
                onPress={updateCours}
              >
                <Text className="text-white">Mettre à jour</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CoursInfo;
