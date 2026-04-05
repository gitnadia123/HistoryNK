import React, { useState } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Switch, TextInput, Modal, Button, ScrollView } from 'react-native';

const initialData = [
  { id: '1', title: 'Київська Русь', description: 'Основа середньовічної держави на теренах України.', image: 'https://via.placeholder.com/100' },
  { id: '2', title: 'Богдан Хмельницький', description: 'Очільник визвольної боротьби українського народу.', image: 'https://via.placeholder.com/100' },
  { id: '3', title: 'Козацька Січ', description: 'Центр військової та політичної організації козаків.', image: 'https://via.placeholder.com/100' },
];

const HistoryListScreen = ({ data, openModal, deleteItem, theme }) => (
  <FlatList
    data={data}
    keyExtractor={(item) => item.id}
    contentContainerStyle={{ paddingBottom: 20 }}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
        onPress={() => openModal(item)}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.cardDescription, { color: theme.subText }]}>{item.description}</Text>
          <Button title="Видалити" color="#e74c3c" onPress={() => deleteItem(item.id)} />
        </View>
      </TouchableOpacity>
    )}
  />
);

const SettingsScreen = ({ isDarkMode, setIsDarkMode, theme }) => (
  <View style={styles.settingsContainer}>
    <Text style={[styles.settingsTitle, { color: theme.text }]}>Налаштування</Text>
    <View style={styles.settingItem}>
      <Text style={{ color: theme.text }}>Темна тема</Text>
      <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
    </View>
  </View>
);

const AddEventScreen = ({ addItem, theme }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (!title.trim()) return;
    addItem(title, description);
    setTitle('');
    setDescription('');
  };

  return (
    <ScrollView contentContainerStyle={styles.addContainer}>
      <Text style={[styles.addTitle, { color: theme.text }]}>Додати подію</Text>
      <TextInput
        placeholder="Назва події"
        placeholderTextColor={theme.subText}
        value={title}
        onChangeText={setTitle}
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
      />
      <TextInput
        placeholder="Опис події"
        placeholderTextColor={theme.subText}
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, height: 100 }]}
        multiline
      />
      <Button title="Додати" onPress={handleAdd} />
    </ScrollView>
  );
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('list');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [data, setData] = useState(initialData);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const openModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const addItem = (title, description) => {
    const newItem = { id: Date.now().toString(), title, description, image: 'https://via.placeholder.com/100' };
    setData([newItem, ...data]);
    setCurrentScreen('list');
  };

  const deleteItem = (id) => {
    setData(data.filter(item => item.id !== id));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Навігація */}
      <View style={[styles.nav, { backgroundColor: theme.nav }]}>
        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'list' && { backgroundColor: theme.activeButton }]}
          onPress={() => setCurrentScreen('list')}
        >
          <Text style={styles.navButtonText}>Події</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'add' && { backgroundColor: theme.activeButton }]}
          onPress={() => setCurrentScreen('add')}
        >
          <Text style={styles.navButtonText}>Додати</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'settings' && { backgroundColor: theme.activeButton }]}
          onPress={() => setCurrentScreen('settings')}
        >
          <Text style={styles.navButtonText}>Налаштування</Text>
        </TouchableOpacity>
      </View>

      {/* Контент */}
      <View style={styles.content}>
        {currentScreen === 'list' && (
          <HistoryListScreen data={data} openModal={openModal} deleteItem={deleteItem} theme={theme} />
        )}
        {currentScreen === 'add' && <AddEventScreen addItem={addItem} theme={theme} />}
        {currentScreen === 'settings' && <SettingsScreen isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} theme={theme} />}
      </View>

      {/* Модальне вікно */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedItem?.title}</Text>
            <Text style={[styles.modalDescription, { color: theme.subText }]}>{selectedItem?.description}</Text>
            <Button title="Закрити" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const lightTheme = {
  background: '#f0f2f5',
  nav: '#4b7bec',
  activeButton: '#0984e3',
  card: '#fff',
  text: '#222',
  subText: '#555',
  shadow: '#000'
};

const darkTheme = {
  background: '#1c1c1c',
  nav: '#0984e3',
  activeButton: '#74b9ff',
  card: '#2c2c2c',
  text: '#fff',
  subText: '#ccc',
  shadow: '#000'
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  navButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  navButtonText: { color: '#fff', fontWeight: 'bold' },
  content: { flex: 1, padding: 10 },
  card: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: { width: 100, height: 100 },
  cardText: { flex: 1, padding: 10, justifyContent: 'center' },
  cardTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  cardDescription: { fontSize: 13 },
  settingsContainer: { padding: 20 },
  settingsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addContainer: { padding: 20 },
  addTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: { padding: 10, borderRadius: 8, marginBottom: 15 },
  modalBackground: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { margin: 20, padding: 20, borderRadius: 12, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalDescription: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
});