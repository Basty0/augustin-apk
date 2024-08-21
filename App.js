import React from "react";
import { View } from "react-native";
import Route from "./src/route";
import { AuthProvider } from "./src/context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <View className="flex-1">
        <Route />
      </View>
    </AuthProvider>
  );
}
