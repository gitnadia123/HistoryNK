import React, { useState, createContext, useEffect, useContext } from 'react';
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
  Alert,
  ScrollView,
  Image
} from 'react-native';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import * as ImagePicker from 'expo-image-picker';

const AppContext = createContext();
const queryClient = new QueryClient();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const users = [
  { username: 'nadia', password: '1234' },
  { username: 'olena', password: 'abcd' }
];

const initialData = [
  { id: '1', title: 'Київська Русь', description: 'Середньовічна держава України' },
  { id: '2', title: 'Богдан Хмельницький', description: 'Гетьман України' },
  { id: '3', title: 'Українська революція', description: '1917–1921 роки' },
  { id: '4', title: 'Незалежність України', description: '1991 рік' }
];

const fetchPosts = async () => {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');

  if (!res.ok) {
    throw new Error('Помилка API');
  }

  const data = await res.json();

  return data.map(item => ({
    ...item,
    title: item.title + ' (переклад)',
    body: item.body
  }));
};

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(initialData);
  const [dark, setDark] = useState(false);
  const [sessionOnly, setSessionOnly] = useState(false);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('DATA');
        const savedTheme = await AsyncStorage.getItem('THEME');
        const savedImage = await AsyncStorage.getItem('IMAGE');

        if (savedData) setData(JSON.parse(savedData));
        if (savedTheme) setDark(JSON.parse(savedTheme));
        if (savedImage) setImage(savedImage);
      } catch (error) {
        console.log(error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!sessionOnly) {
      AsyncStorage.setItem('DATA', JSON.stringify(data));
    }
  }, [data, sessionOnly]);

  useEffect(() => {
    if (!sessionOnly) {
      AsyncStorage.setItem('THEME', JSON.stringify(dark));
    }
  }, [dark, sessionOnly]);

  useEffect(() => {
    if (!sessionOnly) {
      if (image) {
        AsyncStorage.setItem('IMAGE', image);
      } else {
        AsyncStorage.removeItem('IMAGE');
      }
    }
  }, [image, sessionOnly]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        data,
        setData,
        dark,
        setDark,
        sessionOnly,
        setSessionOnly,
        image,
        setImage
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

function useTheme() {
  const { dark } = useContext(AppContext);
  return dark ? darkStyles : lightStyles;
}

function LoginScreen({ navigation }) {
  const { setUser } = useContext(AppContext);
  const theme = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const found = users.find(
      item => item.username === username && item.password === password
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
        value={username}
        onChangeText={setUsername}
        style={[styles.input, theme.input]}
      />

      <TextInput
        placeholder="Пароль"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={[styles.input, theme.input]}
      />

      <Button title="Увійти" onPress={handleLogin} />
    </SafeAreaView>
  );
}

function EventsScreen() {
  const { data, setData } = useContext(AppContext);
  const theme = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const deleteItem = (id) => {
    setData(data.filter(item => item.id !== id));
  };

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

            <View style={styles.buttonBox}>
              <Button
                title="Видалити"
                color="#8B0000"
                onPress={() => deleteItem(item.id)}
              />
            </View>
          </TouchableOpacity>
        )}
      />

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
    </SafeAreaView>
  );
}

function AddScreen() {
  const { data, setData } = useContext(AppContext);
  const theme = useTheme();

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

    setData([newEvent, ...data]);
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
        value={title}
        onChangeText={setTitle}
        style={[styles.input, theme.input]}
      />

      <TextInput
        placeholder="Опис події"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, theme.input]}
      />

      <Button title="Додати" onPress={addEvent} />
    </SafeAreaView>
  );
}

function ApiScreen({ navigation }) {
  const theme = useTheme();

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.screen, theme.container]}>
        <Text style={[styles.mainTitle, theme.text]}>Завантаження...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.screen, theme.container]}>
        <Text style={[styles.mainTitle, theme.text]}>Помилка API</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, theme.container]}>
      <Text style={[styles.mainTitle, theme.text]}>API ресурси</Text>

      <FlatList
        data={data.slice(0, 10)}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, theme.card]}>
            <Text style={[styles.title, theme.text]}>{item.title}</Text>

            <Button
              title="Детальніше"
              onPress={() => navigation.navigate('Details', { item })}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function ImageScreen() {
  const { image, setImage } = useContext(AppContext);
  const theme = useTheme();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Помилка', 'Потрібен дозвіл до галереї');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImage(null);
    Alert.alert('Готово', 'Зображення відкріплено');
  };

  return (
    <SafeAreaView style={[styles.screen, theme.container]}>
      <Text style={[styles.mainTitle, theme.text]}>Фото</Text>

      <View style={[styles.card, theme.card]}>
        <Text style={[styles.title, theme.text]}>Нативна можливість</Text>

        <Text style={[styles.description, theme.text]}>
          Тут можна прикріпити зображення з галереї пристрою.
        </Text>

        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.emptyImage}>
            <Text style={theme.text}>Зображення не прикріплено</Text>
          </View>
        )}

        <Button title="Прикріпити зображення" onPress={pickImage} />

        <View style={styles.buttonBox}>
          <Button
            title="Відкріпити зображення"
            color="#8B0000"
            onPress={removeImage}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function SettingsScreen({ navigation }) {
  const {
    user,
    setUser,
    dark,
    setDark,
    sessionOnly,
    setSessionOnly
  } = useContext(AppContext);

  const theme = useTheme();

  const logout = () => {
    setUser(null);
    navigation.getParent()?.replace('Login');
  };

  return (
    <SafeAreaView style={[styles.screen, theme.container]}>
      <Text style={[styles.mainTitle, theme.text]}>Налаштування</Text>

      <View style={[styles.card, theme.card]}>
        <Text style={[styles.userText, theme.text]}>
          Користувач: {user?.username}
        </Text>

        <View style={styles.row}>
          <Text style={[styles.userText, theme.text]}>Темна тема</Text>
          <Switch value={dark} onValueChange={setDark} />
        </View>

        <View style={styles.row}>
          <Text style={[styles.userText, theme.text]}>Тільки для сесії</Text>
          <Switch value={sessionOnly} onValueChange={setSessionOnly} />
        </View>

        <Button title="Вийти" onPress={logout} />
      </View>
    </SafeAreaView>
  );
}

function DetailsScreen({ route, navigation }) {
  const theme = useTheme();
  const { item } = route.params;

  return (
    <ScrollView style={[styles.screen, theme.container]}>
      <Text style={[styles.mainTitle, theme.text]}>
        {item.title}
      </Text>

      <View style={[styles.card, theme.card]}>
        <Text style={[styles.description, theme.text]}>
          {item.body || item.description}
        </Text>

        <Button title="Назад" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6b3f25',
        tabBarInactiveTintColor: '#777',
        tabBarStyle: {
          backgroundColor: '#f7efe7',
          height: 65,
          paddingBottom: 8,
          paddingTop: 5
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold'
        }
      }}
    >
      <Tab.Screen name="Події" component={EventsScreen} />
      <Tab.Screen name="Додати" component={AddScreen} />
      <Tab.Screen name="API" component={ApiScreen} />
      <Tab.Screen name="Фото" component={ImageScreen} />
      <Tab.Screen name="Налаштування" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user } = useContext(AppContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Details" component={DetailsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </QueryClientProvider>
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
    marginTop: 5,
    marginBottom: 8
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
  buttonBox: {
    marginTop: 10
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
  },
  image: {
    width: '100%',
    height: 230,
    borderRadius: 12,
    marginVertical: 15
  },
  emptyImage: {
    width: '100%',
    height: 180,
    borderWidth: 1,
    borderColor: '#c8a98c',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15
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