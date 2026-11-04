import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeProvider';
import { EmptyState, ErrorState } from './ListState';
import LoadingSkeleton from './LoadingSkeleton';

type DetailFallbackProps = {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  errorTitle: string;
  emptyTitle: string;
  emptyDescription: string;
};

/** O que a tela de detalhes mostra enquanto o registro não está disponível. */
export default function DetailFallback({ isLoading, isError, onRetry, errorTitle, emptyTitle, emptyDescription }: DetailFallbackProps) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      {isLoading ? <LoadingSkeleton rows={1} /> : isError
        ? <ErrorState title={errorTitle} onRetry={onRetry} />
        : <EmptyState title={emptyTitle} description={emptyDescription} />}
    </SafeAreaView>
  );
}
