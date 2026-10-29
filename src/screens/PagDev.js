import { useMemo } from 'react';
import { Animated, FlatList, SafeAreaView, StyleSheet } from "react-native";
import DevCard from '../components/ui/DevCard';
import HeaderSection from '../components/ui/HeaderSection';
import { useAppTheme } from '../context/ThemeProvider';

const team = [
  { name: "Luan Peixoto Marins Rocha", rm: "562258", photo: require('../../assets/images/react-logo.png') },
  { name: "Mathaus Victor Souza Marcelino", rm: "564146", photo: require('../../assets/images/react-logo.png') },
  { name: "Eduardo Novaes Mollo", rm: "561515", photo: require('../../assets/images/react-logo.png') },
  { name: "Carlos Alberto Guedes Neto", rm: "566022", photo: require('../../assets/images/react-logo.png') },
  { name: "Vinícius Luis Exposito Morassi Garcia", rm: "563340", photo: require('../../assets/images/react-logo.png') },
];

export default function PagDev() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const anim = new Animated.Value(0);
  Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.container}
        data={team}
        keyExtractor={(item) => item.rm}
        ListHeaderComponent={() => <HeaderSection title="Integrantes do Projeto ClyvoCare Pet" />}
        renderItem={({ item, index }) => (
          <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <DevCard photo={item.photo} name={item.name} rm={item.rm} />
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16 },
});
