import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderSection from '../components/ui/HeaderSection';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ProfileCard from '../components/ui/ProfileCard';
import { useAppTheme } from '../context/ThemeProvider';
import { useFaq } from '../hooks/useFaq';

export default function IaVeterinariaScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data, isLoading, isError, refetch } = useFaq();
  const [openQuestion, setOpenQuestion] = useState(null);
  const items = Array.isArray(data) ? data : [];

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeaderSection title="Perguntas frequentes" subtitle="Encontre respostas rápidas sobre os cuidados do seu pet" />

        <ProfileCard title="Dúvidas frequentes" icon="❔">
          {isLoading ? <LoadingSkeleton rows={3} /> : null}
          {isError && !data ? <ErrorState title="Não foi possível carregar as perguntas." onRetry={refetch} /> : null}
          {data && items.length === 0 ? <EmptyState title="Nenhuma pergunta cadastrada." description="As dúvidas frequentes aparecerão aqui." /> : null}
          {items.map((item) => {
            const isOpen = openQuestion === item.id;

            return (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity style={styles.questionButton} onPress={() => setOpenQuestion(isOpen ? null : item.id)} activeOpacity={0.75}>
                  <Text style={styles.question}>{item.question}</Text>
                  <Text style={styles.toggle}>{isOpen ? '−' : '+'}</Text>
                </TouchableOpacity>
                {isOpen ? <Text style={styles.answer}>{item.answer}</Text> : null}
              </View>
            );
          })}
        </ProfileCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingBottom: 32 },
  faqItem: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 4 },
  questionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  question: { flex: 1, color: colors.text, fontWeight: '700', paddingRight: 12 },
  toggle: { color: colors.primary, fontSize: 24, fontWeight: '400' },
  answer: { color: colors.textMuted, lineHeight: 21, paddingBottom: 14, paddingRight: 12 },
});
