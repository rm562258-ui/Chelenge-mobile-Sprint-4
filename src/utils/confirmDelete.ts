import { Alert } from 'react-native';

type ConfirmDeleteOptions = {
    title?: string;
    message: string;
    errorMessage: string;
    onConfirm: () => Promise<void>;
};

export function confirmDelete({ title = 'Confirmar', message, errorMessage, onConfirm }: ConfirmDeleteOptions): void {
    Alert.alert(title, message, [
        { text: 'Cancelar', style: 'cancel' },
        {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
                try {
                    await onConfirm();
                } catch {
                    Alert.alert('Erro', errorMessage);
                }
            },
        },
    ]);
}
