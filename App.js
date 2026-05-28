import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Button,
  Switch,
  Alert
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const users = [
  { username: 'nadia', password: '1234' },
  { username: 'olena', password: 'abcd' }
];

const initialData = [
  { id: '1', title: 'Київська Русь', description: 'Держава в середньовіччі' },
  { id: '2', title: 'Богдан Хмельницький', description: 'Гетьман України' },
  { id: '3', title: 'Козацька Січ', description: 'Військовий центр козаків' }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(initialData);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const theme = isDarkMode ? darkStyles : lightStyles;

  function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
      const found = users.find(
        u => u.username === username && u.password === password
      );

      if (found) {
        setUser(found);
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Помилка', 'Неправильний логін або пароль');
      }
    };

    return (
      <SafeAreaView style={[styles.container, theme.container]}>
        <Text style={[styles.mainTitle, theme.text]}>Вхід</Text>

        <TextInput
          placeholder="Логін"
          placeholderTextColor="#888"
          style={[styles.input, theme.input]}
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          placeholder="Пароль"
          placeholderTextColor="#888"
          secureTextEntry
          style={[styles.input, theme.input]}
          value={password}
          onChangeText={setPassword}
        />

        <Button title="Увійти" onPress={handleLogin} />
      </SafeAreaView>
    );
  }

  function EventsScreen() {
    return (
      <SafeAreaView style={[styles.screen, theme.container]}>
        <Text style={[styles.mainTitle, theme.text]}>Історичні події</Text>

        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, theme.card]}
              onPress={() => {
                setSelectedItem(item);
                setModalVisible(true);
              }}
            >
              <Text style={[styles.title, theme.text]}>{item.title}</Text>
              <Text style={[styles.description, theme.text]}>
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  function AddScreen() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const addEvent = () => {
      if (!title.trim() || !description.trim()) {
        Alert.alert('Помилка', 'Заповніть усі поля');
        return;
      }

      const newEvent = {
        id: Date.now().toString(),
        title,
        description
      };

      setData([...data, newEvent]);
      setTitle('');
      setDescription('');

      Alert.alert('Успішно', 'Подію додано');
    };

    return (
      <SafeAreaView style={[styles.screen, theme.container]}>
        <Text style={[styles.mainTitle, theme.text]}>Додати подію</Text>

        <TextInput
          placeholder="Назва події"
          placeholderTextColor="#888"
          style={[styles.input, theme.input]}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          placeholder="Опис події"
          placeholderTextColor="#888"
          style={[styles.input, theme.input]}
          value={description}
          onChangeText={setDescription}
        />

        <Button title="Додати" onPress={addEvent} />
      </SafeAreaView>
    );
  }

  function SettingsScreen({ navigation }) {
    const logout = () => {
      setUser(null);
      navigation.getParent()?.replace('Login');
    };

    return (
      <SafeAreaView style={[styles.screen, theme.container]}>
        <Text style={[styles.mainTitle, theme.text]}>Налаштування</Text>

        <Text style={[styles.userText, theme.text]}>
          Користувач: {user?.username}
        </Text>

        <View style={styles.row}>
          <Text style={[styles.userText, theme.text]}>Темна тема</Text>
          <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
        </View>

        <Button title="Вийти" onPress={logout} />
      </SafeAreaView>
    );
  }

  function MainTabs() {
    return (
      <>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#6b3f25',
            tabBarInactiveTintColor: '#777',
            tabBarLabelStyle: {
              fontSize: 13
            }
          }}
        >
          <Tab.Screen name="Події" component={EventsScreen} />
          <Tab.Screen name="Додати" component={AddScreen} />
          <Tab.Screen name="Налаштування" component={SettingsScreen} />
        </Tab.Navigator>

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modal}>
            <View style={[styles.modalBox, theme.card]}>
              <Text style={[styles.title, theme.text]}>
                {selectedItem?.title}
              </Text>

              <Text style={[styles.description, theme.text]}>
                {selectedItem?.description}
              </Text>

              <Button title="Закрити" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  screen: {
    flex: 1,
    padding: 20
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  description: {
    fontSize: 15,
    marginTop: 5
  },
  userText: {
    fontSize: 16,
    marginBottom: 15
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalBox: {
    margin: 20,
    padding: 20,
    borderRadius: 15
  }
});

const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: '#f7efe7'
  },
  card: {
    backgroundColor: '#fffaf5',
    borderColor: '#c8a98c'
  },
  text: {
    color: '#2b1a12'
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#b88b68',
    color: '#000'
  }
});

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#1f140f'
  },
  card: {
    backgroundColor: '#2d1d16',
    borderColor: '#8b6a55'
  },
  text: {
    color: '#fff'
  },
  input: {
    backgroundColor: '#3a261d',
    borderColor: '#8b6a55',
    color: '#fff'
  }
});