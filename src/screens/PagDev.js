import { useMemo } from 'react';
import { Animated, FlatList, SafeAreaView, StyleSheet } from "react-native";
import DevCard from '../components/ui/DevCard';
import HeaderSection from '../components/ui/HeaderSection';
import { TEAM_MEMBERS } from '../constants/team';
import { useAppTheme } from '../context/ThemeProvider';

export default function PagDev() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const anim = new Animated.Value(0);
  Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.container}
        data={TEAM_MEMBERS}
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
