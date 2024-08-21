import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../pages/LoginScreen";
import BottomTabs from "../components/tabs";
import { AuthContext, AuthProvider } from "../context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import CoursListPage from "../pages/CoursListPage";
import CoursInfo from "../pages/CoursInfo";
import Presences from "../pages/Presences";

const Stack = createNativeStackNavigator();

const Route = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="CoursPage" component={BottomTabs} />

            <Stack.Screen name="CoursList" component={CoursListPage} />
            <Stack.Screen name="CoursInfo" component={CoursInfo} />
            <Stack.Screen name="Presences" component={Presences} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default Route;
