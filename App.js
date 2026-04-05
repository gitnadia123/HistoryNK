import React, { useState } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';

const historyData = [
  { id: '1', title: 'Київська Русь', description: 'Основа середньовічної держави на теренах України.', image: 'https://via.placeholder.com/100' },
  { id: '2', title: 'Богдан Хмельницький', description: 'Очільник визвольної боротьби українського народу.', image: 'https://via.placeholder.com/100' },
  { id: '3', title: 'Козацька Січ', description: 'Центр військової та політичної організації козаків.', image: 'https://via.placeholder.com/100' },
  { id: '4', title: 'Підписання Акту Злуки', description: 'Об’єднання Західноукраїнської та Української народних республік.', image: 'https://via.placeholder.com/100' },
  { id: '5', title: 'День Незалежності', description: 'Відзначення проголошення незалежності України в 1991 році.', image: 'https://via.placeholder.com/100' },
];

const HistoryListScreen = ({ theme }) => (
  <FlatList
    data={historyData}
    keyExtractor={(item) => item.id}
    contentContainerStyle={{ paddingBottom: 20 }}
    renderItem={({ item }) => (
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.cardDescription, { color: theme.subText }]}>{item.description}</Text>
        </View>
      </View>
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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('list');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.nav, { backgroundColor: theme.nav }]}>
        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'list' && { backgroundColor: theme.activeButton }]}
          onPress={() => setCurrentScreen('list')}
        >
          <Text style={styles.navButtonText}>Події</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'settings' && { backgroundColor: theme.activeButton }]}
          onPress={() => setCurrentScreen('settings')}
        >
          <Text style={styles.navButtonText}>Налаштування</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {currentScreen === 'list' ? (
          <HistoryListScreen theme={theme} />
        ) : (
          <SettingsScreen isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} theme={theme} />
        )}
      </View>
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
});