import React, { useState, createContext, useEffect, useContext } from 'react';
import {
  SafeAreaView, View, Text, FlatList, StyleSheet,
  TouchableOpacity, Switch, TextInput,
  Modal, Button, ScrollView
} from 'react-native';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();
const queryClient = new QueryClient();

// API
const fetchPosts = async () => {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  const data = await res.json();

  return data.map(item => ({
    ...item,
    title: item.title + ' (переклад)'
  }));
};

// Users
const users = [
  { username: 'nadia', password: '1234' },
  { username: 'olena', password: 'abcd' },
];

// Initial data
const initialData = [
  { id: '1', title: 'Київська Русь', description: 'Середньовічна держава України' },
  { id: '2', title: 'Богдан Хмельницький', description: 'Гетьман України' },
  { id: '3', title: 'Українська революція', description: '1917–1921 роки' },
  { id: '4', title: 'Незалежність України', description: '1991 рік' },
];

// Provider
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(initialData);
  const [dark, setDark] = useState(false);
  const [sessionOnly, setSessionOnly] = useState(false);

  // load
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('DATA');
        const savedTheme = await AsyncStorage.getItem('THEME');

        if (savedData) setData(JSON.parse(savedData));
        if (savedTheme) setDark(JSON.parse(savedTheme));
      } catch (e) {
        console.log(e);
      }
    };
    loadData();
  }, []);

  // save data
  useEffect(() => {
    if (!sessionOnly) {
      AsyncStorage.setItem('DATA', JSON.stringify(data));
    }
  }, [data]);

  // save theme
  useEffect(() => {
    if (!sessionOnly) {
      AsyncStorage.setItem('THEME', JSON.stringify(dark));
    }
  }, [dark]);

  return (
    <AppContext.Provider value={{
      user, setUser,
      data, setData,
      dark, setDark,
      sessionOnly, setSessionOnly
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Login
const LoginScreen = ({ theme }) => {
  const { setUser } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const u = users.find(x => x.username === username && x.password === password);
    if (u) setUser(u);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.loginBox}>
        <Text style={[styles.title, { color: theme.text }]}>Вхід</Text>

        <TextInput placeholder="Логін" value={username} onChangeText={setUsername} style={styles.input} />
        <TextInput placeholder="Пароль" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />

        <Button title="Увійти" onPress={handleLogin} />
      </View>
    </SafeAreaView>
  );
};

// List
const ListScreen = ({ openModal, deleteItem, theme }) => {
  const { data } = useContext(AppContext);

  return (
    <FlatList
      data={data}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => openModal(item)}>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.text, fontWeight: 'bold' }}>{item.title}</Text>
            <Text style={{ color: theme.subText }}>{item.description}</Text>
            <Button title="Видалити" onPress={() => deleteItem(item.id)} />
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

// Add
const AddScreen = ({ addItem }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <View style={{ padding: 20 }}>
      <Text>Додати подію</Text>
      <TextInput placeholder="Назва" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Опис" value={desc} onChangeText={setDesc} style={styles.input} />
      <Button title="Додати" onPress={() => addItem(title, desc)} />
    </View>
  );
};

// Settings
const SettingsScreen = ({ theme }) => {
  const { dark, setDark, sessionOnly, setSessionOnly, user } = useContext(AppContext);

  return (
    <View style={{ padding: 20 }}>
      <Text>Користувач: {user?.username}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text>Темна тема</Text>
        <Switch value={dark} onValueChange={setDark} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <Text>Тільки для сесії</Text>
        <Switch value={sessionOnly} onValueChange={setSessionOnly} />
      </View>
    </View>
  );
};

// API
const ApiScreen = ({ openDetails }) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  });

  if (isLoading) return <Text>Завантаження...</Text>;

  return (
    <FlatList
      data={data.slice(0, 10)}
      keyExtractor={(i) => i.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text>{item.title}</Text>
          <Button title="Детальніше" onPress={() => openDetails(item)} />
        </View>
      )}
    />
  );
};

// Details
const DetailsScreen = ({ item, goBack }) => (
  <ScrollView style={{ padding: 20 }}>
    <Text style={{ fontSize: 20 }}>{item.title}</Text>
    <Text>{item.body || item.description}</Text>
    <Button title="Назад" onPress={goBack} />
  </ScrollView>
);

// Main
function MainApp() {
  const { user, data, setData, dark } = useContext(AppContext);

  const [screen, setScreen] = useState('list');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const theme = dark ? darkTheme : lightTheme;

  const addItem = (title, desc) => {
    if (!title) return;
    setData([{ id: Date.now().toString(), title, description: desc }, ...data]);
    setScreen('list');
  };

  const deleteItem = (id) => {
    setData(data.filter(i => i.id !== id));
  };

  const openModal = (item) => {
    setSelected(item);
    setModal(true);
  };

  if (!user) return <LoginScreen theme={theme} />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

      <View style={[styles.nav, { backgroundColor: theme.nav }]}>
        <TouchableOpacity onPress={() => setScreen('list')}><Text style={styles.navText}>Події</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen('add')}><Text style={styles.navText}>Додати</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen('api')}><Text style={styles.navText}>API</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setScreen('settings')}><Text style={styles.navText}>Налаштування</Text></TouchableOpacity>
      </View>

      {screen === 'list' && <ListScreen openModal={openModal} deleteItem={deleteItem} theme={theme} />}
      {screen === 'add' && <AddScreen addItem={addItem} />}
      {screen === 'settings' && <SettingsScreen theme={theme} />}
      {screen === 'api' && <ApiScreen openDetails={(item) => { setSelected(item); setScreen('details'); }} />}
      {screen === 'details' && <DetailsScreen item={selected} goBack={() => setScreen('api')} />}

      <Modal visible={modal} transparent>
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <Text>{selected?.title}</Text>
            <Text>{selected?.description}</Text>
            <Button title="Детальніше" onPress={() => { setModal(false); setScreen('details'); }} />
            <Button title="Закрити" onPress={() => setModal(false)} />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// Root
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </QueryClientProvider>
  );
}

// Styles
const lightTheme = {
  background: '#F3ECE7',
  nav: '#6D4C41',
  card: '#fff',
  text: '#3E2F23',
  subText: '#7A6657',
};

const darkTheme = {
  background: '#2B211B',
  nav: '#4E342E',
  card: '#3A2B25',
  text: '#fff',
  subText: '#ccc',
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: { flexDirection: 'row', justifyContent: 'space-around', padding: 10 },
  navText: { color: '#fff' },
  card: { padding: 15, margin: 10, borderRadius: 10 },
  input: { borderWidth: 1, padding: 10, margin: 5, borderRadius: 8 },
  loginBox: { padding: 20, marginTop: 100 },
  title: { fontSize: 20, textAlign: 'center' },
  modal: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 10 }
});