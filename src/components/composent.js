import { View, Text } from "react-native";
import { Button } from "react-native";
import CoursPage from "../pages/cours";

const Composent = () => {
  return (
    <View> 
      <Button
        title="Go to page 2"
        onPress={() => navigation.navigate("CoursPage")}
      />
      <View className="flex flex-col space-y-4 mt-4">
        <View className="bg-white rounded-lg p-4 shadow-md">
          <Text className="text-gray-800 font-bold">Plat 1</Text>
          <Text className="text-gray-600">Description du plat 1</Text>
        </View>
        <View className="bg-white rounded-lg p-4 shadow-md">
          <Text className="text-gray-800 font-bold">Plat 2</Text>
          <Text className="text-gray-600">Description du plat 2</Text>
        </View>
        <View className="bg-white rounded-lg p-4 shadow-md">
          <Text className="text-gray-800 font-bold">Plat 3</Text>
          <Text className="text-gray-600">Description du plat 3</Text>
        </View>
      </View>
      <CoursPage />
    </View>
  );
};
export default Composent;
