import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rally</Text>
      <Text style={styles.subtitle}>Customer Engagement Platform</Text>
      <Text style={styles.version}>v0.1.0 - Phase 1 Scaffold</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1e3a8a' },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 8 },
  version: { fontSize: 12, color: '#9ca3af', marginTop: 24 },
});
