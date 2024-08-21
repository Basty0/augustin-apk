import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, BookOpen, User } from "lucide-react-native";
import Enseignement from "../../pages/Enseignement";
import CoursPage from "../../pages/CoursPage";
import ProfilPage from "../../pages/Profil";

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const Icon = options.tabBarIcon;

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={[
              styles.tabButton,
              isFocused ? styles.tabButtonFocused : null,
            ]}
          >
            <Icon color={isFocused ? "#3b82f6" : "#6b7280"} size={24} />
            <Text
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelFocused : styles.tabLabelDefault,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const BottomTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={CoursPage}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Enseignement"
        component={Enseignement}
        options={{
          tabBarLabel: "Cours",
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilPage}
        options={{
          tabBarLabel: "Profil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
  },
  tabButtonFocused: {
    backgroundColor: "#bfdbfe",
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  tabLabelFocused: {
    color: "#2563eb",
    fontWeight: "600",
  },
  tabLabelDefault: {
    color: "#6b7280",
  },
});
export default BottomTabs;
